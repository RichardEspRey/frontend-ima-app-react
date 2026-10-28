import {
  useDesuscribirInspeccion,
  useDisponiblesInspeccion,
  useSuscribirInspeccion,
  useSuscriptoresInspeccion,
} from "../../../entities/maintenance-point"
import {
  useDesuscribir,
  useSuscribir,
  useSuscriptores,
  useUsuariosDisponibles,
} from "../../../entities/notification"

/**
 * Los avisos que llegan a la campana y cómo se administra quién los recibe.
 *
 * Cada categoría trae sus propias consultas porque viven en endpoints distintos:
 * los BL en `Notifications.php` y las inspecciones en `mtto.php`. `variables`
 * traduce a la persona al formato que espera la mutación de cada uno. El ícono
 * y los colores viven en la UI, con la misma `id`.
 *
 * @readonly
 * @type {Array.<object>}
 */
export const CATEGORIAS_DE_AVISO = [
  {
    id: "bl",
    nombre: "BL Firmado",
    descripcion: "Cuando se sube el BL firmado de un viaje.",
    ejemplo: { titulo: "BL Firmado", subtitulo: "243-US-88T2-26" },
    useSuscriptores,
    useDisponibles: useUsuariosDisponibles,
    useSuscribir,
    useDesuscribir,
    variables: (persona) => persona.id,
  },
  {
    id: "inspecciones",
    nombre: "Inspecciones",
    descripcion:
      "Cuando un operador manda una inspección con algo que reparar. Camión y caja avisan por separado.",
    ejemplo: { titulo: "Nueva inspección 238-US-26", subtitulo: "Camión 11 · Alberto Cruz Galindo" },
    useSuscriptores: useSuscriptoresInspeccion,
    useDisponibles: useDisponiblesInspeccion,
    useSuscribir: useSuscribirInspeccion,
    useDesuscribir: useDesuscribirInspeccion,
    variables: (persona, usuarioId) => ({ userId: persona.id, usuarioId }),
  },
]

/**
 * El nombre con el que se conoce a una persona en las listas de avisos.
 *
 * @param {object} persona La persona devuelta por el servidor.
 * @returns {string} Su nombre, su usuario o «Sin nombre».
 */
export const nombreDe = (persona) => persona?.name || persona?.user || "Sin nombre"

/**
 * Filtra a las personas por nombre o usuario.
 *
 * @param {Array.<object>} personas Las candidatas.
 * @param {string} texto Lo que se escribió en el buscador.
 * @returns {Array.<object>} Las que coinciden; todas si el texto está vacío.
 *
 * @example
 * buscarPersonas([{ name: "Max", user: "Max_21028" }], "21028") // [{ name: "Max", ... }]
 */
export function buscarPersonas(personas = [], texto = "") {
  const buscado = texto.trim().toLowerCase()
  if (!buscado) return personas
  return personas.filter(
    (persona) =>
      nombreDe(persona).toLowerCase().includes(buscado) ||
      String(persona.user ?? "").toLowerCase().includes(buscado),
  )
}
