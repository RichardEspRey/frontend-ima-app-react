import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import {
  COLORES_UNIDAD,
  colorEstado,
  emparejarUnidad,
  direccionDeUnidad,
  combinarFlota,
  porcentajeTanque,
  lecturaTanqueSospechosa,
  filtrarFlota,
  normalizarUnidadesGps,
} from "../model/flota"

const leer = (nombre) =>
  JSON.parse(readFileSync(`src/entities/tracking/__tests__/fixtures/${nombre}`, "utf8"))

const GPS = leer("tracking_units.json").units
const TABLERO = leer("get_dashboard.json").data

describe("emparejarUnidad", () => {
  it("empareja las 8 unidades reales que están en la base", () => {
    const emparejadas = GPS.map((u) => [u.nm, emparejarUnidad(u.nm, TABLERO)?.unidad ?? null])
    expect(emparejadas).toEqual([
      ["IMA 01", "1"],
      ["IMA 02", null],
      ["IMA 04", "4"],
      ["IMA 05", "5"],
      ["IMA 06", null],
      ["IMA 07", "7"],
      ["IMA 08", "8"],
      ["IMA 09", "9"],
      ["IMA 10", "10"],
      ["IMA 11", "11"],
      ["IMA 12", null],
    ])
  })

  it("no confunde la unidad 1 con la 10 ni con la 11", () => {
    expect(emparejarUnidad("IMA 01", TABLERO).unidad).toBe("1")
    expect(emparejarUnidad("IMA 10", TABLERO).unidad).toBe("10")
    expect(emparejarUnidad("IMA 11", TABLERO).unidad).toBe("11")
  })

  it("prefiere el nombre exacto sobre el número", () => {
    const tablero = [{ unidad: "5" }, { unidad: "ima 01" }]
    expect(emparejarUnidad("IMA 01", tablero).unidad).toBe("ima 01")
  })

  it("reconoce el nombre de la base como palabra suelta cuando no trae número", () => {
    expect(emparejarUnidad("IMA - MULA VERDE", [{ unidad: "MULA" }]).unidad).toBe("MULA")
  })

  it("empareja aunque el nombre del GPS traiga texto alrededor del número", () => {
    expect(emparejarUnidad("TRACTO 7 - IMA", [{ unidad: "7" }]).unidad).toBe("7")
  })

  it("un segundo número en el nombre no roba la unidad de otro camión", () => {
    expect(emparejarUnidad("IMA 12 - Caja 5", TABLERO)).toBeNull()
  })

  it("no empareja nada cuando no hay nombre", () => {
    expect(emparejarUnidad("", TABLERO)).toBeNull()
    expect(emparejarUnidad(null, TABLERO)).toBeNull()
    expect(emparejarUnidad("IMA 01", [])).toBeNull()
  })

  it("ignora filas del tablero sin número de unidad", () => {
    expect(emparejarUnidad("IMA 01", [{ unidad: null }, { unidad: "1" }]).unidad).toBe("1")
  })

  it("un nombre con puntos no rompe la búsqueda", () => {
    expect(() => emparejarUnidad("IMA 1.5", [{ unidad: "1.5" }])).not.toThrow()
    expect(emparejarUnidad("IMA 1.5", [{ unidad: "1.5" }]).unidad).toBe("1.5")
  })
})

describe("direccionDeUnidad", () => {
  it("usa la calle cuando el GPS la resolvió", () => {
    expect(direccionDeUnidad(GPS[0])).toContain("Nuevo Laredo")
  })

  it("cae a las coordenadas cuando no hay calle", () => {
    expect(direccionDeUnidad({ pos: { y: 27.39, x: -99.55 } })).toBe("Coordenadas: 27.39, -99.55")
  })

  it("sin posición avisa en vez de dejar el hueco", () => {
    expect(direccionDeUnidad({})).toBe("Dirección satelital resolviendo...")
  })

  it('"Unknown address" no es una dirección: enseña las coordenadas', () => {
    expect(direccionDeUnidad({ address: "Unknown address", pos: { y: 27.39, x: -99.55 } }))
      .toBe("Coordenadas: 27.39, -99.55")
  })

  it("cuando el GPS no resuelve ninguna calle, ninguna unidad queda sin dato útil", () => {
    const flota = combinarFlota(
      GPS.map((u) => ({ ...u, address: "Unknown address" })),
      TABLERO,
    )
    for (const unidad of flota) {
      expect(unidad.address).toMatch(/^Coordenadas: /)
    }
  })
})

describe("combinarFlota, contra los datos reales", () => {
  const flota = combinarFlota(GPS, TABLERO)

  it("muestra las 11 unidades del GPS, estén o no en la base", () => {
    expect(flota).toHaveLength(11)
  })

  it("las 8 que están en la base traen su telemetría", () => {
    expect(flota.filter((u) => u.truck_id).length).toBe(8)
  })

  it("las que no están en la base quedan sin camión pero con nombre y posición", () => {
    const suelta = flota.find((u) => u.name === "IMA 12")
    expect(suelta.truck_id).toBeNull()
    expect(suelta.unidad).toBe("12")
    expect(typeof suelta.lat).toBe("number")
  })

  it("ninguna unidad se queda sin color ni sin dirección", () => {
    for (const unidad of flota) {
      expect(COLORES_UNIDAD).toContain(unidad.color)
      expect(unidad.address).toBeTruthy()
    }
  })

  it("los números llegan como números, no como cadenas", () => {
    for (const unidad of flota) {
      expect(typeof unidad.current_fuel).toBe("number")
      expect(typeof unidad.tank_capacity).toBe("number")
      expect(Number.isNaN(unidad.avg_mpg)).toBe(false)
    }
  })

  it("una unidad sin tanque configurado asume la capacidad por omisión", () => {
    const [unidad] = combinarFlota([{ id: 1, nm: "IMA 99", pos: { y: 1, x: 2 } }], [])
    expect(unidad.tank_capacity).toBe(200)
    expect(unidad.status).toBe("Sin Estado")
  })

  it("sin datos no revienta", () => {
    expect(combinarFlota()).toEqual([])
    expect(combinarFlota(null, null)).toEqual([])
  })
})

describe("porcentajeTanque", () => {
  it("calcula el porcentaje normal", () => {
    expect(porcentajeTanque(100, 200)).toBe(50)
  })

  it("acota la lectura imposible de producción a 100", () => {
    const unidad5 = TABLERO.find((u) => u.unidad === "5")
    expect(Number(unidad5.current_fuel)).toBeGreaterThan(Number(unidad5.tank_capacity))
    expect(porcentajeTanque(unidad5.current_fuel, unidad5.tank_capacity)).toBe(100)
  })

  it("un tanque sin capacidad da 0 y no infinito", () => {
    expect(porcentajeTanque(50, 0)).toBe(0)
    expect(porcentajeTanque(50, null)).toBe(0)
  })

  it("nunca devuelve un porcentaje negativo", () => {
    expect(porcentajeTanque(-10, 200)).toBe(0)
  })
})

describe("lecturaTanqueSospechosa", () => {
  it("detecta la unidad real con más galones que capacidad", () => {
    const flota = combinarFlota(GPS, TABLERO)
    const sospechosas = flota.filter(lecturaTanqueSospechosa).map((u) => u.unidad)
    expect(sospechosas).toEqual(["5"])
  })

  it("una lectura normal no es sospechosa", () => {
    expect(lecturaTanqueSospechosa({ current_fuel: 100, tank_capacity: 200 })).toBe(false)
  })
})

describe("filtrarFlota", () => {
  const flota = combinarFlota(GPS, TABLERO)

  it("busca sin distinguir mayúsculas", () => {
    expect(filtrarFlota(flota, "ima 1")).toHaveLength(3)
    expect(filtrarFlota(flota, "IMA 0")).toHaveLength(8)
  })

  it("sin búsqueda devuelve todo", () => {
    expect(filtrarFlota(flota, "")).toHaveLength(11)
    expect(filtrarFlota(flota)).toHaveLength(11)
  })

  it("una unidad sin nombre no rompe la búsqueda", () => {
    expect(() => filtrarFlota([{ name: null }], "ima")).not.toThrow()
  })
})

describe("colorEstado", () => {
  it("da su color a cada estado conocido", () => {
    expect(colorEstado("In Transit")).toBe("#10b981")
    expect(colorEstado("in transit")).toBe("#10b981")
    expect(colorEstado("Up Coming")).toBe("#f59e0b")
  })

  it("un estado desconocido usa el color de la marca", () => {
    expect(colorEstado("Sin Estado")).toBe("#0f172a")
    expect(colorEstado(null)).toBe("#0f172a")
  })
})

describe("normalizarUnidadesGps", () => {
  it("acepta las 11 unidades reales", () => {
    const { unidades, descartadas } = normalizarUnidadesGps(GPS)
    expect(unidades).toHaveLength(11)
    expect(descartadas).toBe(0)
  })

  it("descarta una unidad sin posición porque no se puede dibujar", () => {
    const { unidades, descartadas } = normalizarUnidadesGps([{ id: 1, nm: "IMA 99" }])
    expect(unidades).toHaveLength(0)
    expect(descartadas).toBe(1)
  })
})
