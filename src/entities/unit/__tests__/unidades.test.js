import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { TIPO_UNIDAD, CATALOGO_UNIDAD, descriptorDe, unidadEnBlanco } from "../model/tipos"
import {
  ESTADO_DOCUMENTO,
  colorCategoria,
  esFechaCero,
  fechaVencimiento,
  diasPara,
  estadoDocumento,
  requisitosVisibles,
  categoriasDe,
  requisitosDeCategoria,
  resumenExpediente,
  normalizarRequisitos,
} from "../model/requisitos"
import {
  ESTADO_CONDUCTOR,
  estadoConductor,
  filtrarUnidades,
  camposParaGuardar,
  expedienteParaGuardar,
  validarUnidad,
} from "../model/unidades"

const leer = (nombre) =>
  JSON.parse(readFileSync(`src/entities/unit/__tests__/fixtures/${nombre}`, "utf8"))

const CAMIONES = leer("trucks_v2_getInitData.json")
const CAJAS = leer("cajas_v2_getInitData.json")
const CONDUCTORES = leer("drivers_v2_getInitData.json")

const HOY = new Date("2026-09-01T12:00:00")

describe("descriptores de tipo", () => {
  it("tiene los tres tipos y ninguno comparte endpoint", () => {
    const endpoints = Object.values(CATALOGO_UNIDAD).map((d) => d.endpoint)
    expect(endpoints).toHaveLength(3)
    expect(new Set(endpoints).size).toBe(3)
  })

  it("cada descriptor sabe su lista y su id, que es lo que difiere en la respuesta", () => {
    expect(descriptorDe(TIPO_UNIDAD.CAMION).campoLista).toBe("trucks")
    expect(descriptorDe(TIPO_UNIDAD.CAJA).campoLista).toBe("cajas")
    expect(descriptorDe(TIPO_UNIDAD.CONDUCTOR).campoId).toBe("driver_id")
  })

  it("los campos declarados existen en los datos reales", () => {
    const casos = [
      [TIPO_UNIDAD.CAMION, CAMIONES.trucks[0]],
      [TIPO_UNIDAD.CAJA, CAJAS.cajas[0]],
      [TIPO_UNIDAD.CONDUCTOR, CONDUCTORES.drivers[0]],
    ]

    for (const [tipo, real] of casos) {
      const { campos, campoId, columnas } = descriptorDe(tipo)
      expect(real).toHaveProperty(campoId)
      for (const campo of campos) expect(real).toHaveProperty(campo.clave)
      for (const columna of columnas) expect(real).toHaveProperty(columna.clave)
    }
  })

  it("solo los conductores admiten baja", () => {
    expect(descriptorDe(TIPO_UNIDAD.CONDUCTOR).ops.baja).toBeTruthy()
    expect(descriptorDe(TIPO_UNIDAD.CAMION).ops.baja).toBeUndefined()
  })

  it("las cajas no guardan la visibilidad de columnas, porque la base no la tiene", () => {
    expect(descriptorDe(TIPO_UNIDAD.CAJA).columnasPersistidas).toBe(false)
    expect(CAJAS.requisitos[0]).not.toHaveProperty("oculto_en_tabla")
    expect(CAMIONES.requisitos[0]).toHaveProperty("oculto_en_tabla")
  })

  it("un tipo inventado falla de inmediato en vez de dar una pantalla vacía", () => {
    expect(() => descriptorDe("moto")).toThrow(/desconocido/)
  })

  it("el alta arranca con todos los campos vacíos y expediente en blanco", () => {
    const nueva = unidadEnBlanco(TIPO_UNIDAD.CAMION)
    expect(nueva.unidad).toBe("")
    expect(nueva.docs).toEqual({})
    expect(Object.values(nueva).filter((v) => v === undefined)).toHaveLength(0)
  })
})

describe("fechas de vencimiento", () => {
  it("reconoce la fecha cero de MySQL", () => {
    expect(esFechaCero("0000-00-00")).toBe(true)
    expect(esFechaCero("2026-01-01")).toBe(false)
    expect(esFechaCero(null)).toBe(false)
  })

  it("la fecha cero no es una fecha de vencimiento", () => {
    expect(fechaVencimiento({ fecha_vencimiento: "0000-00-00" })).toBeNull()
    expect(fechaVencimiento({ fecha_vencimiento: "2026-12-01" })).toBe("2026-12-01")
    expect(fechaVencimiento({})).toBeNull()
  })

  it("cuenta los días que faltan", () => {
    expect(diasPara("2026-09-11", HOY)).toBe(9)
    expect(diasPara("2026-08-01", HOY)).toBeLessThan(0)
  })

  it("una fecha imposible no produce NaN", () => {
    expect(diasPara("0000-00-00", HOY)).toBeNull()
    expect(diasPara("no es fecha", HOY)).toBeNull()
    expect(diasPara(null, HOY)).toBeNull()
  })
})

describe("estadoDocumento", () => {
  const conVencimiento = { tipo: "file", tiene_vencimiento: 1, key_name: "INE" }

  it("sin documento, falta", () => {
    expect(estadoDocumento(conVencimiento, null, HOY).estado).toBe(ESTADO_DOCUMENTO.FALTANTE)
    expect(estadoDocumento(conVencimiento, {}, HOY).estado).toBe(ESTADO_DOCUMENTO.FALTANTE)
  })

  it("una fecha pasada es vencido", () => {
    const r = estadoDocumento(conVencimiento, { url_pdf: "x.pdf", fecha_vencimiento: "2026-08-01" }, HOY)
    expect(r.estado).toBe(ESTADO_DOCUMENTO.VENCIDO)
    expect(r.dias).toBeLessThan(0)
  })

  it("dentro de los 30 días avisa", () => {
    expect(
      estadoDocumento(conVencimiento, { url_pdf: "x.pdf", fecha_vencimiento: "2026-09-20" }, HOY).estado,
    ).toBe(ESTADO_DOCUMENTO.POR_VENCER)
  })

  it("más allá de 30 días está vigente", () => {
    expect(
      estadoDocumento(conVencimiento, { url_pdf: "x.pdf", fecha_vencimiento: "2027-01-01" }, HOY).estado,
    ).toBe(ESTADO_DOCUMENTO.VIGENTE)
  })

  it("un documento con fecha cero está vigente pero sin fecha que enseñar", () => {
    const r = estadoDocumento(conVencimiento, { url_pdf: "x.pdf", fecha_vencimiento: "0000-00-00" }, HOY)
    expect(r.estado).toBe(ESTADO_DOCUMENTO.VIGENTE)
    expect(r.fecha).toBeNull()
  })

  it("un requisito de texto no vence: o tiene valor o falta", () => {
    const texto = { tipo: "text", key_name: "licencia" }
    expect(estadoDocumento(texto, { valor_texto: "A-123" }, HOY).estado).toBe(ESTADO_DOCUMENTO.TEXTO)
    expect(estadoDocumento(texto, { valor_texto: "" }, HOY).estado).toBe(ESTADO_DOCUMENTO.FALTANTE)
  })

  it("un requisito de archivo sin vencimiento está vigente con solo estar", () => {
    const sinFecha = { tipo: "file", tiene_vencimiento: 0 }
    expect(estadoDocumento(sinFecha, { url_pdf: "x.pdf" }, HOY).estado).toBe(ESTADO_DOCUMENTO.VIGENTE)
  })
})

describe("contra los expedientes reales", () => {
  it("los 158 documentos de conductores con fecha cero no se muestran como vigentes hasta 0000-00-00", () => {
    const conCero = CONDUCTORES.drivers.flatMap((d) =>
      Object.values(d.docs ?? {}).filter((doc) => esFechaCero(doc.fecha_vencimiento)),
    )
    expect(conCero.length).toBe(158)

    for (const doc of conCero) {
      const { fecha } = estadoDocumento({ tipo: "file", tiene_vencimiento: 1 }, doc, HOY)
      expect(fecha).toBeNull()
    }
  })

  it("ningún documento real produce un estado desconocido", () => {
    const casos = [
      [CAMIONES.requisitos, CAMIONES.trucks],
      [CAJAS.requisitos, CAJAS.cajas],
      [CONDUCTORES.requisitos, CONDUCTORES.drivers],
    ]
    const validos = Object.values(ESTADO_DOCUMENTO)

    for (const [requisitos, unidades] of casos) {
      for (const unidad of unidades) {
        for (const requisito of requisitos) {
          const { estado } = estadoDocumento(requisito, unidad.docs?.[requisito.key_name], HOY)
          expect(validos).toContain(estado)
        }
      }
    }
  })

  it("el resumen de un expediente suma tantos como requisitos hay", () => {
    for (const conductor of CONDUCTORES.drivers) {
      const conteo = resumenExpediente(CONDUCTORES.requisitos, conductor.docs, HOY)
      const total = Object.values(conteo).reduce((a, b) => a + b, 0)
      expect(total).toBe(CONDUCTORES.requisitos.length)
    }
  })

  it("valida los requisitos reales sin descartar ninguno", () => {
    for (const respuesta of [CAMIONES, CAJAS, CONDUCTORES]) {
      const { requisitos, descartados } = normalizarRequisitos(respuesta.requisitos)
      expect(descartados).toBe(0)
      expect(requisitos).toHaveLength(respuesta.requisitos.length)
    }
  })

  it("los requisitos de cajas, sin la columna, se cuentan todos como visibles", () => {
    const { requisitos } = normalizarRequisitos(CAJAS.requisitos)
    expect(requisitosVisibles(requisitos)).toHaveLength(CAJAS.requisitos.length)
  })

  it("los 7 requisitos ocultos de conductores no salen en la tabla", () => {
    const { requisitos } = normalizarRequisitos(CONDUCTORES.requisitos)
    expect(requisitos).toHaveLength(13)
    expect(requisitosVisibles(requisitos)).toHaveLength(6)
  })

  it("una columna oculta solo en la pantalla también desaparece", () => {
    const { requisitos } = normalizarRequisitos(CAJAS.requisitos)
    const primera = requisitos[0].key_name
    expect(requisitosVisibles(requisitos, [primera])).toHaveLength(requisitos.length - 1)
  })

  it("agrupa por las categorías que de verdad existen", () => {
    const { requisitos } = normalizarRequisitos(CONDUCTORES.requisitos)
    const categorias = categoriasDe(requisitos)
    expect(categorias.sort()).toEqual(["Otros", "Personales", "Viaje"])

    const suma = categorias.reduce((n, c) => n + requisitosDeCategoria(requisitos, c).length, 0)
    expect(suma).toBe(requisitos.length)
  })
})

describe("colorCategoria", () => {
  it("da su color a USA y MEX, y ámbar a lo demás", () => {
    expect(colorCategoria("USA")).toBe("#1976d2")
    expect(colorCategoria("MEX")).toBe("#388e3c")
    expect(colorCategoria("Personales")).toBe("#f59e0b")
  })
})

describe("estadoConductor", () => {
  it("quien no tiene columna de estado está activo", () => {
    expect(estadoConductor({})).toBe(ESTADO_CONDUCTOR.ACTIVO)
    expect(estadoConductor({ estado: "Baja" })).toBe(ESTADO_CONDUCTOR.BAJA)
  })

  it("los 32 conductores reales tienen un estado reconocible", () => {
    for (const conductor of CONDUCTORES.drivers) {
      expect(Object.values(ESTADO_CONDUCTOR)).toContain(estadoConductor(conductor))
    }
  })
})

describe("filtrarUnidades", () => {
  const { busquedas } = descriptorDe(TIPO_UNIDAD.CAMION)

  it("un buscador de dos campos encuentra por cualquiera de ellos", () => {
    const primera = CAMIONES.trucks.find((t) => t.placa_eua)
    const porEua = filtrarUnidades(CAMIONES.trucks, busquedas, { placa: primera.placa_eua })
    expect(porEua.length).toBeGreaterThan(0)
    expect(porEua).toContain(primera)
  })

  it("sin texto no filtra nada", () => {
    expect(filtrarUnidades(CAMIONES.trucks, busquedas, {})).toHaveLength(CAMIONES.trucks.length)
  })

  it("los dos buscadores se aplican a la vez", () => {
    const camion = CAMIONES.trucks.find((t) => t.unidad && t.placa_mex)
    const resultado = filtrarUnidades(CAMIONES.trucks, busquedas, {
      unidad: camion.unidad,
      placa: "no existe esta placa",
    })
    expect(resultado).toHaveLength(0)
  })

  it("una unidad sin el campo buscado no revienta", () => {
    expect(() => filtrarUnidades([{ unidad: null }], busquedas, { unidad: "1" })).not.toThrow()
  })
})

describe("camposParaGuardar", () => {
  it("manda solo lo que tiene valor, para no borrar lo que ya estaba", () => {
    const campos = camposParaGuardar(TIPO_UNIDAD.CAMION, {
      truck_id: "1",
      unidad: "01",
      placa_mex: "",
      marca: "Freightliner",
    })
    expect(campos).toEqual({ truck_id: "1", unidad: "01", marca: "Freightliner" })
  })

  it("un alta va sin id", () => {
    expect(camposParaGuardar(TIPO_UNIDAD.CAJA, { no_caja: "105" })).toEqual({ no_caja: "105" })
  })

  it("ignora lo que no está declarado en el tipo", () => {
    const campos = camposParaGuardar(TIPO_UNIDAD.CAJA, { no_caja: "105", inventado: "x" })
    expect(campos).not.toHaveProperty("inventado")
  })
})

describe("expedienteParaGuardar", () => {
  const requisitos = [
    { key_name: "INE", tipo: "file", tiene_vencimiento: 1 },
    { key_name: "licencia", tipo: "text" },
  ]

  it("las fechas van como date_ y los archivos como file_", () => {
    const archivo = new File(["x"], "ine.pdf")
    const campos = expedienteParaGuardar(
      requisitos,
      { INE: { fecha_vencimiento: "2027-01-01" } },
      { INE: archivo },
    )
    expect(campos.date_INE).toBe("2027-01-01")
    expect(campos.file_INE).toBe(archivo)
  })

  it("recorta la hora de una fecha con formato completo", () => {
    const campos = expedienteParaGuardar(requisitos, { INE: { fecha_vencimiento: "2027-01-01T00:00:00" } })
    expect(campos.date_INE).toBe("2027-01-01")
  })

  it("el texto va como text_ y se manda aunque esté vacío, para poder borrarlo", () => {
    const campos = expedienteParaGuardar(requisitos, { licencia: { valor_texto: "" } })
    expect(campos.text_licencia).toBe("")
  })

  it("sin nada que subir no manda nada", () => {
    expect(expedienteParaGuardar(requisitos, {}, {})).toEqual({})
    expect(expedienteParaGuardar()).toEqual({})
  })
})

describe("validarUnidad", () => {
  it("avisa del campo obligatorio que falta, con su nombre en pantalla", () => {
    expect(validarUnidad(TIPO_UNIDAD.CAMION, {})).toBe("Número de Unidad es obligatorio.")
    expect(validarUnidad(TIPO_UNIDAD.CONDUCTOR, {})).toBe("Nombre Completo es obligatorio.")
  })

  it("con el obligatorio puesto no se queja", () => {
    expect(validarUnidad(TIPO_UNIDAD.CAMION, { unidad: "01" })).toBeNull()
  })
})
