import { z } from "zod"
import { idPhp, nullable } from "../../../shared/api/zodPhp"

/**
 * Una notificación tal como la manda `Notifications.php`.
 *
 * Los campos son los que devuelve el endpoint de verdad, comprobados contra
 * producción: `id`, `mensaje` y `created_at`.
 *
 * El mensaje llega con dos nombres según qué parte del backend responda:
 * `mensaje` y `Mensaje`, que es como se llama la columna. Se acepta cualquiera
 * de los dos y a partir de aquí, en toda la aplicación, es `mensaje`.
 *
 * Solo se exigen las dos cosas sin las que la notificación no sirve de nada: el
 * identificador, que es lo que distingue una nueva de una ya anunciada, y el
 * mensaje, que es lo que la persona lee. Todo lo demás se acepta como venga,
 * porque el backend puede agregar campos sin avisar y eso no es motivo para
 * tirar la notificación.
 *
 * @type {object}
 */
export const esquemaNotificacion = z
  .preprocess(
    (cruda) =>
      cruda && typeof cruda === "object" && cruda.mensaje === undefined && cruda.Mensaje !== undefined
        ? { ...cruda, mensaje: cruda.Mensaje }
        : cruda,
    z.object({
      id: idPhp(),
      mensaje: z.string().min(1),
      created_at: nullable(z.string()).optional(),
      trip_id: nullable(idPhp()).optional(),
    })
      .passthrough(),
  )

/**
 * Valida la lista que vino del servidor y descarta lo que no se puede usar.
 *
 * Descarta en vez de fallar a propósito. Es un sondeo de fondo: si una
 * notificación llega sin mensaje, lo correcto es no enseñarla y seguir con las
 * demás, no dejar a la persona sin ninguna. Las descartadas se cuentan para que
 * quede rastro en la consola.
 *
 * @param {*} crudas Lo que devolvió el endpoint en `notifications`.
 * @returns {{notificaciones: Array.<object>, descartadas: number}} Las válidas y cuántas se cayeron.
 *
 * @example
 * const { notificaciones, descartadas } = normalizarNotificaciones(cuerpo?.notifications)
 */
export function normalizarNotificaciones(crudas) {
  if (!Array.isArray(crudas)) return { notificaciones: [], descartadas: 0 }

  const notificaciones = []
  let descartadas = 0

  for (const cruda of crudas) {
    const resultado = esquemaNotificacion.safeParse(cruda)
    if (resultado.success) notificaciones.push(resultado.data)
    else descartadas += 1
  }

  return { notificaciones, descartadas }
}

/**
 * Separa las notificaciones que todavía no se le han anunciado a la persona.
 *
 * Vive aquí, y no dentro del componente, porque es la única regla de negocio de
 * esta entidad y es la que hay que poder probar sin montar React ni esperar
 * quince segundos.
 *
 * @param {Array.<object>} notificaciones Las que trae el servidor ahora mismo.
 * @param {Set.<string>} yaAnunciadas Los identificadores ya mostrados.
 * @returns {Array.<object>} Las que faltan por anunciar, en el orden que llegaron.
 *
 * @example
 * const nuevas = sinAnunciar(notificaciones, anunciadas.current)
 */
export function sinAnunciar(notificaciones, yaAnunciadas) {
  return notificaciones.filter((una) => !yaAnunciadas.has(una.id))
}

const MILISEGUNDOS_POR_DIA = 86400000

/**
 * Convierte la fecha de PHP en una `Date`.
 *
 * PHP la manda como `2026-09-17 08:30:00`, con espacio en vez de `T`. Safari no
 * acepta ese formato y devuelve una fecha inválida, así que se normaliza aquí y
 * no en cada pantalla que quiera enseñarla.
 *
 * @param {string} [texto] La fecha tal como viene del servidor.
 * @returns {(Date|null)} La fecha, o `null` si no se puede leer.
 */
export function fechaDeNotificacion(texto) {
  if (!texto) return null
  const fecha = new Date(String(texto).replace(" ", "T"))
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

const aMedianoche = (fecha) => new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())

/**
 * Cuántos días naturales separan una fecha de otra.
 *
 * Cuenta días de calendario, no de 24 horas: las once de la noche y la una de
 * la madrugada siguiente son un día de diferencia, aunque pasen dos horas.
 *
 * @param {Date} fecha La fecha a medir.
 * @param {Date} ahora Contra qué momento se mide.
 * @returns {number} Los días completos entre las dos.
 */
export function diasDeDiferencia(fecha, ahora) {
  return Math.round((aMedianoche(ahora) - aMedianoche(fecha)) / MILISEGUNDOS_POR_DIA)
}

/**
 * El encabezado del grupo al que pertenece una notificación.
 *
 * @param {string} [creadaEn] La fecha del servidor.
 * @param {Date} [ahora] Momento contra el que se compara.
 * @returns {string} `Hoy`, `Ayer` o la fecha corta.
 */
export function etiquetaDeDia(creadaEn, ahora = new Date()) {
  const fecha = fechaDeNotificacion(creadaEn)
  if (!fecha) return "Sin fecha"

  const dias = diasDeDiferencia(fecha, ahora)
  if (dias === 0) return "Hoy"
  if (dias === 1) return "Ayer"

  return fecha.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "2-digit" })
}

/**
 * Hace cuánto llegó una notificación, en palabras.
 *
 * @param {string} [creadaEn] La fecha del servidor.
 * @param {Date} [ahora] Momento contra el que se compara.
 * @returns {string} `Justo ahora`, `Hace 5 min`, `Hace 3 h` o la fecha corta.
 */
export function tiempoRelativo(creadaEn, ahora = new Date()) {
  const fecha = fechaDeNotificacion(creadaEn)
  if (!fecha) return "Sin fecha"

  const minutos = Math.round((ahora.getTime() - fecha.getTime()) / 60000)
  if (minutos < 1) return "Justo ahora"
  if (minutos < 60) return `Hace ${minutos} min`

  const horas = Math.round(minutos / 60)
  if (horas < 24) return `Hace ${horas} h`

  return etiquetaDeDia(creadaEn, ahora)
}

/**
 * Agrupa las notificaciones por día, conservando el orden en que llegaron.
 *
 * @param {Array.<object>} notificaciones Las notificaciones a agrupar.
 * @param {Date} [ahora] Momento contra el que se calculan las etiquetas.
 * @returns {Array.<{etiqueta: string, notificaciones: Array.<object>}>} Los grupos, en orden.
 */
export function agruparPorDia(notificaciones, ahora = new Date()) {
  const grupos = new Map()

  for (const notificacion of notificaciones) {
    const etiqueta = etiquetaDeDia(notificacion.created_at, ahora)
    if (!grupos.has(etiqueta)) grupos.set(etiqueta, [])
    grupos.get(etiqueta).push(notificacion)
  }

  return [...grupos].map(([etiqueta, lista]) => ({ etiqueta, notificaciones: lista }))
}
