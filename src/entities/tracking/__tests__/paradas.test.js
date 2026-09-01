import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import {
  ESTADO_PARADA,
  ordenarParadas,
  estadoDeParadas,
  avanceParadas,
  tramoActivo,
} from "../model/paradas"

const REAL = JSON.parse(
  readFileSync("src/entities/tracking/__tests__/fixtures/paradas_etapa.json", "utf8"),
)

const DOS_PARADAS = REAL.find((e) => e.stops_in_transit.length === 2).stops_in_transit

describe("ordenarParadas", () => {
  it("ordena por el orden de la ruta, no por cómo llegaron", () => {
    const ordenadas = ordenarParadas([
      { stop_order: "3", location: "C" },
      { stop_order: "1", location: "A" },
      { stop_order: "2", location: "B" },
    ])
    expect(ordenadas.map((p) => p.location)).toEqual(["A", "B", "C"])
  })

  it("ordena por número aunque el orden venga como cadena", () => {
    const ordenadas = ordenarParadas([{ stop_order: "10" }, { stop_order: "2" }])
    expect(ordenadas.map((p) => p.stop_order)).toEqual(["2", "10"])
  })

  it("no toca el arreglo original", () => {
    const original = [{ stop_order: "2" }, { stop_order: "1" }]
    ordenarParadas(original)
    expect(original[0].stop_order).toBe("2")
  })

  it("sin paradas devuelve lista vacía", () => {
    expect(ordenarParadas()).toEqual([])
    expect(ordenarParadas(null)).toEqual([])
  })
})

describe("estadoDeParadas", () => {
  const paradas = [
    { stop_order: "1", location: "Laredo, TX" },
    { stop_order: "2", location: "San Antonio, TX" },
    { stop_order: "3", location: "Dallas, TX" },
  ]

  it("marca lo anterior como hecho, la actual en curso y lo siguiente pendiente", () => {
    const estado = estadoDeParadas(paradas, "San Antonio, TX")
    expect(estado.map((p) => p.stopStatus)).toEqual([
      ESTADO_PARADA.COMPLETADA,
      ESTADO_PARADA.EN_CURSO,
      ESTADO_PARADA.PENDIENTE,
    ])
  })

  it("sin parada pendiente da todas por completadas", () => {
    const estado = estadoDeParadas(paradas, null)
    expect(estado.every((p) => p.stopStatus === ESTADO_PARADA.COMPLETADA)).toBe(true)
  })

  it("compara el nombre sin distinguir mayúsculas ni espacios sobrantes", () => {
    const estado = estadoDeParadas(paradas, "  san antonio, tx ")
    expect(estado[1].stopStatus).toBe(ESTADO_PARADA.EN_CURSO)
  })

  it("un nombre que no existe deja todas como completadas, que es el punto ciego", () => {
    const estado = estadoDeParadas(paradas, "Ciudad que no está en la etapa")
    expect(estado.every((p) => p.stopStatus === ESTADO_PARADA.COMPLETADA)).toBe(true)
  })

  it("conserva los datos de cada parada", () => {
    const [primera] = estadoDeParadas(paradas, "Laredo, TX")
    expect(primera.location).toBe("Laredo, TX")
    expect(primera.stop_order).toBe("1")
  })

  it("sin paradas no inventa ninguna", () => {
    expect(estadoDeParadas([], "Laredo")).toEqual([])
    expect(estadoDeParadas(null, "Laredo")).toEqual([])
  })

  it("funciona con las paradas reales de un viaje de producción", () => {
    const estado = estadoDeParadas(DOS_PARADAS, DOS_PARADAS[0].location)
    expect(estado).toHaveLength(2)
    expect(estado[0].stopStatus).toBe(ESTADO_PARADA.EN_CURSO)
    expect(estado[1].stopStatus).toBe(ESTADO_PARADA.PENDIENTE)
    expect(estado[0].bl_firmado_doc).toBeTruthy()
  })

  it("las paradas reales conservan su orden", () => {
    for (const etapa of REAL) {
      const estado = estadoDeParadas(etapa.stops_in_transit, null)
      const ordenes = estado.map((p) => Number(p.stop_order))
      expect(ordenes).toEqual([...ordenes].sort((a, b) => a - b))
    }
  })
})

describe("avanceParadas", () => {
  it("cuenta cuántas se cubrieron", () => {
    const estado = estadoDeParadas(
      [
        { stop_order: "1", location: "A" },
        { stop_order: "2", location: "B" },
        { stop_order: "3", location: "C" },
      ],
      "C",
    )
    expect(avanceParadas(estado)).toEqual({ completadas: 2, total: 3 })
  })

  it("sin paradas el avance es cero de cero", () => {
    expect(avanceParadas()).toEqual({ completadas: 0, total: 0 })
  })
})

describe("tramoActivo", () => {
  it("mientras queda parada, el tramo termina en ella", () => {
    const tramo = tramoActivo({
      current_origin: "Enid, OK.",
      current_stop: "Laredo, TX",
      current_destination: "Eagle Pass, TX.",
    })
    expect(tramo).toEqual({
      origen: "Enid, OK.",
      destino: "Laredo, TX",
      destinoFinal: "Eagle Pass, TX.",
    })
  })

  it("sin paradas pendientes el tramo termina en el destino final", () => {
    const tramo = tramoActivo({
      current_origin: "Enid, OK.",
      current_stop: null,
      current_destination: "Eagle Pass, TX.",
    })
    expect(tramo.destino).toBe("Eagle Pass, TX.")
    expect(tramo.destinoFinal).toBeNull()
  })

  it("sin unidad no revienta", () => {
    expect(tramoActivo()).toEqual({ origen: "", destino: "", destinoFinal: null })
  })
})
