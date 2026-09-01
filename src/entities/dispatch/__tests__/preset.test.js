import { describe, it, expect } from "vitest"
import {
  resolverIdDeCatalogo,
  companiaDePrograma,
  almacenDePrograma,
  datosInicialesDesdePrograma,
  etapaInicialDesdePrograma,
} from "../model/preset"

const COMPANIAS = [
  { company_id: "4", nombre_compania: "Kansas City Southern" },
  { company_id: "7", nombre_compania: "Grupo México" },
]

const ALMACENES = [
  { warehouse_id: "11", nombre_almacen: "Laredo" },
  { warehouse_id: "12", nombre_almacen: "Monterrey" },
]

describe("resolverIdDeCatalogo", () => {
  const campos = { campoId: "company_id", campoNombre: "nombre_compania" }

  it("encuentra por id aunque venga como número", () => {
    expect(resolverIdDeCatalogo(COMPANIAS, { ...campos, id: 4 })).toBe("4")
  })

  it("cae al nombre cuando no hay id", () => {
    expect(resolverIdDeCatalogo(COMPANIAS, { ...campos, nombre: "Grupo México" })).toBe("7")
  })

  it("prefiere el id sobre el nombre", () => {
    expect(resolverIdDeCatalogo(COMPANIAS, { ...campos, id: "4", nombre: "Grupo México" })).toBe("4")
  })

  it("devuelve null cuando no está en el catálogo", () => {
    expect(resolverIdDeCatalogo(COMPANIAS, { ...campos, nombre: "Otra" })).toBeNull()
    expect(resolverIdDeCatalogo([], { ...campos, id: "4" })).toBeNull()
    expect(resolverIdDeCatalogo(undefined, { ...campos, id: "4" })).toBeNull()
  })

  it("un id nulo no coincide con el catálogo", () => {
    const conNulo = [{ company_id: null, nombre_compania: "Rara" }]
    expect(resolverIdDeCatalogo(conNulo, { ...campos, id: null })).toBeNull()
  })
})

describe("resolución desde la programación", () => {
  it("resuelve compañía y almacén por nombre", () => {
    const programacion = { nombre_compania: "Kansas City Southern", nombre_almacen: "Laredo" }
    expect(companiaDePrograma(programacion, COMPANIAS)).toBe("4")
    expect(almacenDePrograma(programacion, ALMACENES)).toBe("11")
  })

  it("sin programación no resuelve nada", () => {
    expect(companiaDePrograma(null, COMPANIAS)).toBeNull()
    expect(almacenDePrograma(null, ALMACENES)).toBeNull()
  })
})

describe("datosInicialesDesdePrograma", () => {
  it("sin programación no precarga nada", () => {
    expect(datosInicialesDesdePrograma(null)).toBeUndefined()
  })

  it("precarga conductor, tractor y caja propia", () => {
    const datos = datosInicialesDesdePrograma({
      driver_id: 21, driver_nombre: "Juan", truck_id: 8, truck_unidad: "T-08",
      caja_id: 3, caja_numero: "C-03",
    })
    expect(datos.driver_id).toBe("21")
    expect(datos.caja_no_caja).toBe("C-03")
    expect(datos.caja_externa_id).toBe("")
  })

  it("una caja externa deja vacía la propia", () => {
    const datos = datosInicialesDesdePrograma({
      caja_id: 3, caja_numero: "C-03", caja_externa_id: 9, caja_externa_numero: "EXT-9",
    })
    expect(datos.caja_id).toBe("")
    expect(datos.caja_no_caja).toBe("")
    expect(datos.caja_externa_id).toBe("9")
    expect(datos.caja_externa_no_caja).toBe("EXT-9")
  })

  it("nunca deja el literal undefined en un campo", () => {
    const datos = datosInicialesDesdePrograma({})
    for (const valor of Object.values(datos)) expect(valor).toBe("")
  })
})

describe("etapaInicialDesdePrograma", () => {
  it("precarga destino, compañía y almacén", () => {
    const etapa = etapaInicialDesdePrograma(
      { nombre_compania: "Grupo México", destino: "Laredo", nombre_almacen: "Laredo", salida: "2026-09-15" },
      { companias: COMPANIAS, almacenes: ALMACENES },
    )
    expect(etapa.company_id).toBe("7")
    expect(etapa.destination).toBe("Laredo")
    expect(etapa.warehouse_destination_id).toBe("11")
    expect(etapa.loading_date).toBeInstanceOf(Date)
  })

  it("sin fecha de salida usa la de hoy", () => {
    const etapa = etapaInicialDesdePrograma({}, { companias: [], almacenes: [] })
    expect(etapa.loading_date).toBeInstanceOf(Date)
    expect(Number.isNaN(etapa.loading_date.getTime())).toBe(false)
  })

  it("sin catálogos cargados todavía no revienta", () => {
    const etapa = etapaInicialDesdePrograma({ nombre_compania: "Grupo México" })
    expect(etapa.company_id).toBeNull()
  })

  it("sin programación no precarga nada", () => {
    expect(etapaInicialDesdePrograma(null, { companias: COMPANIAS })).toBeUndefined()
  })
})
