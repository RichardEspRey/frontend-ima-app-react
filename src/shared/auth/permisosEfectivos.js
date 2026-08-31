import { PERMISOS_POR_ROL, ROLES_TOTALES } from "./roles"

/**
 * Calcula los permisos que realmente tiene una persona.
 *
 * La fórmula es `paquete del rol ∪/∖ ajustes del usuario`:
 *
 * 1. El **rol** da el paquete de arranque.
 * 2. Los **ajustes por usuario** de `features.php` mandan encima, y pueden tanto
 *    conceder algo que el rol no trae como quitar algo que sí traía. Un flag en
 *    `false` es una negación explícita, no una ausencia.
 * 3. Un rol total (hoy solo Administrador) ve todo y no pasa por lo anterior.
 *
 * Ese orden importa para migrar sin sustos: mientras los ajustes por usuario
 * sigan existiendo, cambiar el paquete de un rol no le quita nada a nadie que ya
 * lo tuviera concedido a mano.
 *
 * @param {string} rol Rol canónico, ya normalizado.
 * @param {object} [ajustesUsuario] Mapa `clave -> boolean` de `features.php`.
 * @returns {Set.<string>} Los permisos efectivos.
 */
export function calcularPermisosEfectivos(rol, ajustesUsuario = {}) {
  if (ROLES_TOTALES.has(rol)) return new Set(PERMISOS_POR_ROL[rol] ?? [])

  const efectivos = new Set(PERMISOS_POR_ROL[rol] ?? [])

  for (const [clave, concedido] of Object.entries(ajustesUsuario)) {
    if (concedido === true) efectivos.add(clave)
    else efectivos.delete(clave)
  }

  return efectivos
}

/**
 * Construye la función `can` que usan los componentes.
 *
 * Devolver una función en vez de exponer el `Set` mantiene a los componentes
 * ignorantes de cómo se calculan los permisos: el día que la fase 2 los emita en
 * un token firmado, `can` sigue igual.
 *
 * @param {Set.<string>} permisosEfectivos Resultado de {@link calcularPermisosEfectivos}.
 * @param {boolean} [esTotal=false] Si el rol ve todo sin comprobar.
 * @returns {Function} `(permiso) => boolean`.
 */
export function crearComprobador(permisosEfectivos, esTotal = false) {
  return function can(permiso) {
    if (esTotal) return true
    if (!permiso) return false
    return permisosEfectivos.has(permiso)
  }
}
