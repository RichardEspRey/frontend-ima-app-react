import { z } from "zod"
import { normalizarRol, NOMBRE_ROL } from "../../../shared/auth/roles"

/**
 * Valores de `type` que la API acepta al crear o editar un usuario.
 *
 * Son los que existen hoy en `Users_credentials`, no los del catálogo canónico:
 * el backend guarda este campo tal cual, así que mandarle un valor normalizado
 * lo cambiaría en la base. La normalización es **de lectura**, para decidir en el
 * frontend; lo que viaja al servidor es el valor crudo.
 *
 * @readonly
 * @enum {string}
 */
export const TIPO_USUARIO_API = {
  ADMIN: "Admin",
  ADMINISTRATIVO: "Administrativo",
  DRIVER: "Driver",
}

const idDePhp = z.coerce.string()

/**
 * Usuario del sistema, tal como lo devuelve `features.php` · `get_users`.
 *
 * **No incluye `pass` a propósito.** El endpoint devuelve la contraseña en claro
 * de cada usuario; dejarla fuera del esquema evita que llegue al estado de la
 * aplicación, se pinte por accidente o acabe en un log. No arregla el endpoint
 * —eso es de backend— pero corta la propagación en el frontend.
 */
export const esquemaUsuario = z.object({
  id: idDePhp,
  name: z.string().min(1),
  user: z.string().catch(""),
  type: z.string().catch(""),
  active: z.coerce.number().catch(1),
  driver_id: z
    .union([z.null(), z.undefined(), idDePhp])
    .transform((v) => (v === undefined ? null : v))
    .catch(null),
})

/**
 * Usuario ya validado y normalizado.
 *
 * @typedef {object} Usuario
 * @property {string} id Identificador.
 * @property {string} name Nombre completo.
 * @property {string} user Nombre de acceso.
 * @property {string} type Valor crudo de `Users_credentials.type`.
 * @property {number} active 1 si la cuenta está activa.
 * @property {(string|null)} driver_id Conductor asociado, si el usuario es de tipo Driver.
 * @property {string} rol Rol canónico derivado de `type`.
 * @property {string} nombreRol Nombre del rol para mostrar.
 */

/**
 * Valida la lista de usuarios y les agrega su rol canónico.
 *
 * @param {Array} filas Lo que vino en la respuesta.
 * @returns {{usuarios: Array.<Usuario>, descartados: number}} Los válidos y cuántos se cayeron.
 */
export function normalizarUsuarios(filas) {
  const usuarios = []
  let descartados = 0

  for (const fila of filas) {
    const resultado = esquemaUsuario.safeParse(fila)
    if (!resultado.success) {
      descartados += 1
      continue
    }
    const rol = normalizarRol(resultado.data.type)
    usuarios.push({ ...resultado.data, rol, nombreRol: NOMBRE_ROL[rol] })
  }

  return { usuarios, descartados }
}

/**
 * Indica si un usuario está activo.
 *
 * @param {Usuario} usuario El usuario a evaluar.
 * @returns {boolean} `true` si la cuenta está habilitada.
 */
export const estaActivo = (usuario) => Number(usuario?.active) === 1

/**
 * Valida el formulario de alta o edición de un usuario.
 *
 * `pass` es opcional al editar: vacío significa "no cambiar la contraseña", y el
 * campo solo viaja si trae algo. Al **crear**, en cambio, es obligatorio.
 *
 * @param {object} formulario Datos capturados.
 * @param {object} [opciones] Ajustes de la validación.
 * @param {boolean} [opciones.esAlta=false] Si es un alta y no una edición.
 * @returns {{valido: boolean, mensaje: (string|undefined)}} Resultado de la validación.
 */
export function validarFormularioUsuario(formulario, { esAlta = false } = {}) {
  const requerido = (valor) => String(valor ?? "").trim().length > 0

  if (!requerido(formulario.name)) return { valido: false, mensaje: "El nombre es obligatorio." }
  if (!requerido(formulario.user)) return { valido: false, mensaje: "El usuario es obligatorio." }
  if (!requerido(formulario.type)) return { valido: false, mensaje: "Selecciona el tipo de usuario." }
  if (esAlta && !requerido(formulario.pass)) {
    return { valido: false, mensaje: "La contraseña es obligatoria al crear un usuario." }
  }
  if (formulario.type === TIPO_USUARIO_API.DRIVER && !requerido(formulario.driver_id)) {
    return { valido: false, mensaje: "Selecciona el conductor al que pertenece este acceso." }
  }

  return { valido: true }
}
