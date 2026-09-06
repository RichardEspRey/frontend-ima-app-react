import { z } from "zod"
import { idPhp, nullable } from "../../../shared/api/zodPhp"

/**
 * Una notificación tal como la manda `Notifications.php`.
 *
 * Los campos son los que devuelve el endpoint de verdad, comprobados contra
 * producción: `id`, `mensaje` y `created_at`.
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
  .object({
    id: idPhp(),
    mensaje: z.string().min(1),
    created_at: nullable(z.string()).optional(),
  })
  .passthrough()

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
