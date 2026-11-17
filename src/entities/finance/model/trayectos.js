import { z } from "zod"
import { booleanoPhp, idPhp, numeroPhp } from "../../../shared/api/zodPhp"

/**
 * De qué país es un viaje. Los mexicanos se pagan por trayecto y los americanos por milla.
 *
 * @readonly
 * @enum {string}
 */
export const PAIS = { US: "US", MX: "MX" }

/**
 * El permiso que deja ver los pagos de cada país.
 *
 * @readonly
 * @enum {string}
 */
export const PERMISO_PAGOS = { [PAIS.US]: "finanzas_pagos_us", [PAIS.MX]: "finanzas_pagos_mx" }

/**
 * Qué países puede ver una persona en Pago a Operadores.
 *
 * El administrador ve los dos. Los demás, el que tengan encendido en el Gestor
 * de accesos. Mientras esos dos permisos no existan en el servidor —`features.php`
 * no los devuelve— se enseñan los dos, que es lo que la pantalla hacía antes:
 * así subir el front no le quita la pantalla a nadie.
 *
 * @param {object} [permisos] Los ajustes por usuario, `{ feature_key: boolean }`.
 * @param {boolean} [esTotal=false] Si la persona ve todo sin comprobar.
 * @returns {Array.<string>} Valores de `PAIS`, en el orden en que se muestran.
 *
 * @example
 * paisesPermitidos({ finanzas_pagos_us: true, finanzas_pagos_mx: false }) // ["US"]
 */
export function paisesPermitidos(permisos, esTotal = false) {
  const paises = [PAIS.US, PAIS.MX]
  const existen = paises.some((pais) => permisos?.[PERMISO_PAGOS[pais]] !== undefined)
  if (esTotal || !existen) return paises
  return paises.filter((pais) => permisos[PERMISO_PAGOS[pais]] === true)
}

const textoPhp = () => z.preprocess((valor) => valor ?? "", z.coerce.string()).catch("")

/**
 * Un trayecto mexicano del catálogo, con lo que se le paga al operador por viaje.
 */
export const esquemaTrayecto = z.object({
  id: idPhp(),
  nombre: textoPhp(),
  monto: numeroPhp(0),
  activo: booleanoPhp(),
})

/**
 * Lo que la lista de pagos necesita saber de cada viaje: su nombre completo, su país
 * y por dónde pasó.
 */
export const esquemaViajePago = z.object({
  trip_id: idPhp(),
  country_code: textoPhp(),
  nomenclatura: textoPhp(),
  recorrido: textoPhp(),
})

/**
 * El trayecto con el que se autorizó el pago de un viaje mexicano.
 */
export const esquemaAsignacionTrayecto = z.object({
  trip_id: idPhp(),
  driver_id: idPhp(),
  trayecto_id: idPhp(),
  trayecto: textoPhp(),
  monto: numeroPhp(0),
})

/**
 * Formatea un monto en pesos mexicanos.
 *
 * @param {number|string} valor El monto.
 * @returns {string} El monto como `$1,234.00`.
 */
export const pesos = (valor) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 2 }).format(
    Number(valor || 0),
  )

/**
 * La llave con la que se cruza un pago con su trayecto: un viaje puede tener dos choferes.
 *
 * @param {string|number} tripId El viaje.
 * @param {string|number} driverId El chofer.
 * @returns {string} La llave.
 */
export const clavePago = (tripId, driverId) => `${tripId}-${driverId}`

/**
 * Separa el recorrido que manda el servidor en sus destinos, en orden de etapa.
 *
 * @param {string} recorrido Los destinos separados por `|`.
 * @returns {Array.<string>} Los destinos sin vacíos.
 */
export const destinosDe = (recorrido) =>
  String(recorrido ?? "")
    .split("|")
    .map((texto) => texto.trim())
    .filter(Boolean)

const normalizar = (texto) =>
  String(texto ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

/**
 * Propone el trayecto de un viaje a partir de sus destinos.
 *
 * Las ciudades se capturan a mano («Apodaca, NL.», «Gomez Palacios, DGO.»), así que se
 * comparan sin acentos ni puntuación. Gana el primer destino del recorrido que contenga
 * el nombre de un trayecto activo.
 *
 * @param {Array.<string>} recorrido Los destinos del viaje, en orden.
 * @param {Array.<object>} trayectos El catálogo.
 * @returns {object|null} El trayecto sugerido, o `null` si ninguno coincide.
 */
export function sugerirTrayecto(recorrido = [], trayectos = []) {
  const activos = trayectos.filter((trayecto) => trayecto.activo && normalizar(trayecto.nombre))

  for (const destino of recorrido) {
    const lugar = normalizar(destino)
    const encontrado = activos.find((trayecto) => lugar.includes(normalizar(trayecto.nombre)))
    if (encontrado) return encontrado
  }

  return null
}
