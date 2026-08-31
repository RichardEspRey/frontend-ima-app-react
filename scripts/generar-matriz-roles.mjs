// Regenera la matriz de roles y permisos de docs/ROLES-Y-PERMISOS.md.
//
// Uso:  npx vite-node scripts/generar-matriz-roles.mjs
//
// La salida se pega en la seccion "Matriz de permisos" del documento. Hay un test
// (src/shared/auth/__tests__/docSincronizado.test.js) que falla si el documento y
// el codigo dejan de coincidir, asi que no se puede olvidar.

import { ROLES, NOMBRE_ROL, PERMISOS_POR_ROL, ROLES_TOTALES } from "../src/shared/auth/roles.js"
import { MODULOS, TODOS_LOS_PERMISOS } from "../src/shared/auth/permisos.js"

const orden = [ROLES.ADMINISTRADOR, ROLES.OPERACIONES, ROLES.FINANZAS, ROLES.MANTENIMIENTO,
               ROLES.SAFETY, ROLES.ADMINISTRATIVO, ROLES.CONSULTA, ROLES.OPERADOR]
const corto = { administrador:"Admin", operaciones:"Oper", finanzas:"Fin", mantenimiento:"Mant",
                safety:"Safety", administrativo:"Advo", consulta:"Cons", operador:"Opdor" }

const tiene = (rol, permiso) =>
  ROLES_TOTALES.has(rol) || (PERMISOS_POR_ROL[rol] ?? []).includes(permiso)

console.log(`| Permiso | ${orden.map(r => corto[r]).join(" | ")} |`)
console.log(`|---|${orden.map(() => ":--:").join("|")}|`)
for (const [modulo, permisos] of Object.entries(MODULOS)) {
  console.log(`| **${modulo}** |${orden.map(() => " ").join("|")}|`)
  for (const p of permisos) {
    console.log(`| \`${p}\` | ${orden.map(r => tiene(r, p) ? "●" : "·").join(" | ")} |`)
  }
}
console.log()
console.log(`| Rol | Clave | Permisos de fábrica |`)
console.log(`|---|---|---:|`)
for (const r of orden) {
  const n = ROLES_TOTALES.has(r) ? TODOS_LOS_PERMISOS.length : new Set(PERMISOS_POR_ROL[r] ?? []).size
  console.log(`| ${NOMBRE_ROL[r]} | \`${r}\` | ${n} de ${TODOS_LOS_PERMISOS.length} |`)
}
