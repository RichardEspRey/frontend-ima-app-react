import dayjs from "dayjs"

const FORMATO_CAMPO = "YYYY-MM-DDTHH:mm"
const FORMATO_API = "YYYY-MM-DD HH:mm:ss"

/**
 * El instante actual como lo espera un `<input type="datetime-local">`.
 *
 * Es el tope de los dos campos y el valor inicial de la fecha final.
 *
 * @param {Date} [ahora=new Date()] El instante a convertir.
 * @returns {string} La fecha y hora local, `AAAA-MM-DDTHH:mm`.
 */
export const ahoraParaCampo = (ahora = new Date()) => dayjs(ahora).format(FORMATO_CAMPO)

/**
 * Revisa las fechas con las que se finaliza un viaje.
 *
 * Con ellas el servidor pide a Wialon la ruta que hizo la unidad, así que un
 * rango invertido o en el futuro daría un resumen vacío.
 *
 * @param {{inicio: string, fin: string}} fechas Lo capturado en los campos.
 * @param {Date} [ahora=new Date()] Contra qué se compara el futuro.
 * @returns {(string|null)} Qué está mal, o `null` si se puede finalizar.
 */
export function validarFechasFinalizacion({ inicio, fin }, ahora = new Date()) {
  if (!inicio || !fin) return "Selecciona la fecha de inicio y la fecha final."
  if (dayjs(fin).isAfter(dayjs(ahora))) return "La fecha final no puede ser futura."
  if (!dayjs(inicio).isBefore(dayjs(fin))) return "La fecha de inicio debe ser anterior a la fecha final."
  return null
}

/**
 * Los campos que `FinalizeTrip` recibe además del viaje.
 *
 * @param {{inicio: string, fin: string}} fechas Fechas ya validadas.
 * @returns {{fecha_inicio: string, fecha_finalizacion: string}} En el formato de MySQL.
 */
export const cuerpoFinalizacion = ({ inicio, fin }) => ({
  fecha_inicio: dayjs(inicio).format(FORMATO_API),
  fecha_finalizacion: dayjs(fin).format(FORMATO_API),
})
