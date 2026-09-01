import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { ROLES, NOMBRE_ROL, PERMISOS_POR_ROL, ROLES_TOTALES } from "../roles"
import { TODOS_LOS_PERMISOS } from "../permisos"

const DOC = readFileSync("docs/ROLES-Y-PERMISOS.md", "utf8")

const COLUMNAS = [
  ROLES.ADMINISTRADOR,
  ROLES.OPERACIONES,
  ROLES.FINANZAS,
  ROLES.MANTENIMIENTO,
  ROLES.SAFETY,
  ROLES.ADMINISTRATIVO,
  ROLES.CONSULTA,
  ROLES.OPERADOR,
]

const tieneEnCodigo = (rol, permiso) =>
  ROLES_TOTALES.has(rol) || (PERMISOS_POR_ROL[rol] ?? []).includes(permiso)

/**
 * Lee la matriz del documento como `{permiso: {rol: boolean}}`.
 *
 * @returns {object} La matriz que declara el documento.
 */
const matrizDelDoc = () => {
  const matriz = {}
  for (const linea of DOC.split("\n")) {
    const m = linea.match(/^\| `([a-z_]+)` \| (.+) \|$/)
    if (!m) continue
    const celdas = m[2].split("|").map((c) => c.trim())
    if (celdas.length !== COLUMNAS.length) continue
    matriz[m[1]] = Object.fromEntries(COLUMNAS.map((rol, i) => [rol, celdas[i] === "●"]))
  }
  return matriz
}

describe("la matriz del documento no puede quedarse desfasada", () => {
  it("el documento lista los 38 permisos", () => {
    const matriz = matrizDelDoc()
    expect(Object.keys(matriz).sort()).toEqual([...TODOS_LOS_PERMISOS].sort())
  })

  it("cada celda coincide con lo que dice el código", () => {
    const matriz = matrizDelDoc()
    const discrepancias = []

    for (const [permiso, porRol] of Object.entries(matriz)) {
      for (const rol of COLUMNAS) {
        const enCodigo = tieneEnCodigo(rol, permiso)
        if (porRol[rol] !== enCodigo) {
          discrepancias.push(
            `${permiso} · ${rol}: el doc dice ${porRol[rol]}, el código dice ${enCodigo}`,
          )
        }
      }
    }

    expect(discrepancias, `Corre el generador de la matriz:\n${discrepancias.join("\n")}`)
      .toEqual([])
  })

  it("la tabla de conteos cuadra con los paquetes de cada rol", () => {
    for (const rol of COLUMNAS) {
      const esperado = ROLES_TOTALES.has(rol)
        ? TODOS_LOS_PERMISOS.length
        : new Set(PERMISOS_POR_ROL[rol] ?? []).size
      const fila = new RegExp(`\\| ${NOMBRE_ROL[rol]} \\| \`${rol}\` \\| (\\d+) de (\\d+) \\|`)
      const m = DOC.match(fila)
      expect(m, `falta la fila de ${rol} en la tabla de conteos`).not.toBeNull()
      expect(Number(m[1]), `el conteo de ${rol} está desfasado`).toBe(esperado)
      expect(Number(m[2])).toBe(TODOS_LOS_PERMISOS.length)
    }
  })

  it("el documento no promete que los permisos del front sean seguridad", () => {
    expect(DOC).toMatch(/no son seguridad/i)
  })
})
