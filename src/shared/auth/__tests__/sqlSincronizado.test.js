import { describe, it, expect } from "vitest"
import { readFileSync } from "node:fs"
import { PERMISOS_POR_ROL, ROLES, ROLES_TOTALES } from "../roles"
import { TODOS_LOS_PERMISOS } from "../permisos"

const SQL = readFileSync("docs/sql/001-roles-y-permisos.sql", "utf8")

const paresDelSql = () => {
  const pares = new Set()
  const re = /SELECT '([a-z_]+)' AS rol_clave, '([a-z_]+)' AS permiso_clave/g
  for (const m of SQL.matchAll(re)) pares.add(`${m[1]}|${m[2]}`)
  return pares
}

const clavesDeclaradas = (bloque) =>
  new Set([...SQL.matchAll(new RegExp(`\\('(${bloque})[a-z_]*'`, "g"))].map((m) => m[0]))

describe("el SQL y el catálogo de JS no pueden discrepar", () => {
  it("cada par rol-permiso del SQL existe en PERMISOS_POR_ROL", () => {
    const enJs = new Set()
    for (const [rol, permisos] of Object.entries(PERMISOS_POR_ROL)) {
      if (ROLES_TOTALES.has(rol)) continue
      for (const p of permisos) enJs.add(`${rol}|${p}`)
    }
    for (const par of paresDelSql()) {
      expect(enJs.has(par), `el SQL declara ${par} y el catálogo de JS no`).toBe(true)
    }
  })

  it("cada par de PERMISOS_POR_ROL está en el SQL", () => {
    const enSql = paresDelSql()
    for (const [rol, permisos] of Object.entries(PERMISOS_POR_ROL)) {
      if (ROLES_TOTALES.has(rol)) continue
      for (const p of new Set(permisos)) {
        expect(enSql.has(`${rol}|${p}`), `falta ${rol}|${p} en el SQL`).toBe(true)
      }
    }
  })

  it("el SQL declara los 38 permisos del catálogo", () => {
    for (const permiso of TODOS_LOS_PERMISOS) {
      expect(SQL.includes(`('${permiso}',`), `falta el permiso ${permiso} en el SQL`).toBe(true)
    }
  })

  it("el SQL declara los 8 roles del catálogo", () => {
    for (const rol of Object.values(ROLES)) {
      expect(SQL.includes(`('${rol}',`), `falta el rol ${rol} en el SQL`).toBe(true)
    }
  })

  it("solo el administrador tiene ve_todo = 1", () => {
    const conVeTodo = [...SQL.matchAll(/\('([a-z_]+)',\s*'[^']+',\s*'[^']*',\s*1\)/g)].map((m) => m[1])
    expect(conVeTodo).toEqual([ROLES.ADMINISTRADOR])
  })

  it("no usa sintaxis que necesite MySQL 8, porque el hosting puede ser 5.7", () => {
    // VALUES(col) dentro de ON DUPLICATE KEY UPDATE sí existe en 5.7: es la
    // función, no el constructor de tabla. Lo que no vale es FROM (VALUES ...)
    // ni los CTE, ambos de MySQL 8.
    expect(SQL).not.toMatch(/FROM\s*\(\s*VALUES/i)
    expect(SQL).not.toMatch(/AS\s+\w+\s*\([a-z_]+\s*,/i)
    expect(SQL).not.toMatch(/^\s*WITH\s+\w+\s+AS\s*\(/im)
  })

  it("no toca Users_credentials con ALTER, DROP ni UPDATE", () => {
    expect(SQL).not.toMatch(/ALTER\s+TABLE\s+Users_credentials/i)
    expect(SQL).not.toMatch(/DROP\s+TABLE\s+.*Users_credentials/i)
    expect(SQL).not.toMatch(/UPDATE\s+Users_credentials/i)
  })
})
