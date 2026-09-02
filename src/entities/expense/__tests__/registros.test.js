import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { TIPO_REGISTRO, CAMPO_RESPUESTA, descriptorDe } from "../model/tipos"
import {
  PAIS_REGISTRO,
  esquemaResumenViaje,
  identificadorViaje,
  filtrarResumen,
  totalDe,
  pendientesDe,
  esManual,
  normalizarLista,
} from "../model/registros"

const leer = (nombre) =>
  JSON.parse(readFileSync(`src/entities/expense/__tests__/fixtures/${nombre}`, "utf8"))

const RESUMEN_GASTOS = leer("getAll_gastos.json")
const RESUMEN_DIESEL = leer("getAll_diesel.json")
const REGISTROS_GASTO = leer("get_registers_gasto.json")
const REGISTROS_DIESEL = leer("get_registers_diesel.json")
const UN_GASTO = leer("get_gasto.json")
const TICKETS = leer("getTickets.json")

describe("las tres claves de respuesta de formularios.php", () => {
  it("las listas vienen en un campo llamado 'id', no en 'data'", () => {
    expect(Array.isArray(RESUMEN_GASTOS[CAMPO_RESPUESTA.LISTA])).toBe(true)
    expect(Array.isArray(RESUMEN_DIESEL[CAMPO_RESPUESTA.LISTA])).toBe(true)
    expect(RESUMEN_GASTOS).not.toHaveProperty("data")
  })

  it("un registro suelto viene en 'row', y dentro de un arreglo", () => {
    expect(Array.isArray(UN_GASTO[CAMPO_RESPUESTA.REGISTRO])).toBe(true)
    expect(UN_GASTO[CAMPO_RESPUESTA.REGISTRO]).toHaveLength(1)
  })

  it("solo los tickets vienen en 'data'", () => {
    expect(Array.isArray(TICKETS[CAMPO_RESPUESTA.TICKETS])).toBe(true)
  })
})

describe("descriptores", () => {
  it("los dos tipos comparten endpoint y solo cambian las operaciones", () => {
    const gasto = descriptorDe(TIPO_REGISTRO.GASTO)
    const diesel = descriptorDe(TIPO_REGISTRO.DIESEL)
    expect(gasto.endpoint).toBe(diesel.endpoint)
    expect(gasto.ops.resumen).not.toBe(diesel.ops.resumen)
  })

  it("solo el diesel admite alta manual y tiene pendientes", () => {
    expect(descriptorDe(TIPO_REGISTRO.DIESEL).ops.alta).toBe("add_manual_diesel")
    expect(descriptorDe(TIPO_REGISTRO.GASTO).ops.alta).toBeUndefined()
    expect(descriptorDe(TIPO_REGISTRO.DIESEL).conPendientes).toBe(true)
  })

  it("un tipo inventado falla de inmediato", () => {
    expect(() => descriptorDe("peajes")).toThrow(/desconocido/)
  })

  it("las columnas declaradas existen en los registros reales", () => {
    const casos = [
      [TIPO_REGISTRO.GASTO, REGISTROS_GASTO.id[0]],
      [TIPO_REGISTRO.DIESEL, REGISTROS_DIESEL.id[0]],
    ]
    for (const [tipo, real] of casos) {
      for (const columna of descriptorDe(tipo).columnasDetalle) {
        expect(real).toHaveProperty(columna.clave)
      }
    }
  })
})

describe("identificadorViaje", () => {
  it("prefiere la nomenclatura, que es lo que la gente reconoce", () => {
    expect(identificadorViaje({ nomenclatura: "200-US-26", trip_number: "200" })).toBe("200-US-26")
  })

  it("cae al número cuando no hay nomenclatura", () => {
    expect(identificadorViaje({ nomenclatura: null, trip_number: "200" })).toBe("200")
    expect(identificadorViaje({})).toBe("")
  })

  it("los 99 renglones reales de gastos tienen identificador", () => {
    for (const fila of RESUMEN_GASTOS.id) expect(identificadorViaje(fila)).not.toBe("")
  })
})

describe("filtrarResumen, contra los datos reales", () => {
  it("sin filtros devuelve los 99 gastos y los 203 de diesel", () => {
    expect(filtrarResumen(RESUMEN_GASTOS.id)).toHaveLength(99)
    expect(filtrarResumen(RESUMEN_DIESEL.id)).toHaveLength(203)
  })

  it("filtrar por país reparte todos los renglones sin perder ninguno", () => {
    const usa = filtrarResumen(RESUMEN_DIESEL.id, { pais: PAIS_REGISTRO.USA })
    const mex = filtrarResumen(RESUMEN_DIESEL.id, { pais: PAIS_REGISTRO.MEXICO })
    const sinPais = RESUMEN_DIESEL.id.filter((f) => !f.country_code)
    expect(usa.length + mex.length + sinPais.length).toBe(203)
  })

  it("busca por viaje y por conductor", () => {
    const uno = RESUMEN_GASTOS.id[0]
    expect(filtrarResumen(RESUMEN_GASTOS.id, { busqueda: uno.nomenclatura })).toContain(uno)
    expect(filtrarResumen(RESUMEN_GASTOS.id, { busqueda: uno.nombre })).toContain(uno)
  })

  it("la búsqueda no distingue mayúsculas", () => {
    const uno = RESUMEN_GASTOS.id[0]
    const enMayusculas = filtrarResumen(RESUMEN_GASTOS.id, {
      busqueda: String(uno.nombre).toUpperCase(),
    })
    expect(enMayusculas).toContain(uno)
  })

  it("los dos filtros se aplican a la vez", () => {
    const resultado = filtrarResumen(RESUMEN_GASTOS.id, {
      pais: PAIS_REGISTRO.USA,
      busqueda: "no existe este conductor",
    })
    expect(resultado).toHaveLength(0)
  })

  it("un renglón sin conductor no rompe la búsqueda", () => {
    expect(() => filtrarResumen([{ nombre: null, nomenclatura: null }], { busqueda: "x" })).not.toThrow()
  })
})

describe("totalDe", () => {
  it("suma los montos reales sin dar NaN", () => {
    const total = totalDe(RESUMEN_GASTOS.id)
    expect(Number.isFinite(total)).toBe(true)
    expect(total).toBeGreaterThan(0)
  })

  it("los montos llegan como texto y se suman como números", () => {
    expect(totalDe([{ monto: "100.50" }, { monto: "99.50" }])).toBe(200)
  })

  it("sin renglones el total es cero", () => {
    expect(totalDe()).toBe(0)
    expect(totalDe([{ monto: null }])).toBe(0)
  })
})

describe("pendientesDe", () => {
  it("suma los pendientes de estado y de FleetOne", () => {
    expect(pendientesDe({ state_pending_count: "2", fleetone_pending_count: "1" })).toEqual({
      estado: 2,
      fleetone: 1,
      total: 3,
    })
  })

  it("un viaje sin pendientes da ceros", () => {
    expect(pendientesDe({}).total).toBe(0)
  })

  it("hay viajes reales de diesel con pendientes por conciliar", () => {
    const conPendientes = RESUMEN_DIESEL.id.filter((f) => pendientesDe(f).total > 0)
    expect(conPendientes.length).toBeGreaterThan(0)
  })
})

describe("esManual", () => {
  it("distingue la carga capturada a mano de la que llegó sola", () => {
    expect(esManual({ is_manual: "1" })).toBe(true)
    expect(esManual({ is_manual: "0" })).toBe(false)
    expect(esManual({ manual_count: 2 })).toBe(true)
    expect(esManual({})).toBe(false)
  })
})

describe("normalizarLista", () => {
  it("acepta los 99 renglones reales de gastos", () => {
    const { validos, descartados } = normalizarLista(RESUMEN_GASTOS.id, esquemaResumenViaje)
    expect(validos).toHaveLength(99)
    expect(descartados).toBe(0)
  })

  it("los montos salen como número aunque lleguen como texto", () => {
    const { validos } = normalizarLista(RESUMEN_GASTOS.id, esquemaResumenViaje)
    for (const fila of validos) expect(typeof fila.monto).toBe("number")
  })

  it("descarta un renglón sin viaje, que no se podría abrir", () => {
    const { descartados } = normalizarLista([{ monto: "10" }], esquemaResumenViaje)
    expect(descartados).toBe(1)
  })
})
