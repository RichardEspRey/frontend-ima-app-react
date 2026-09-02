import { z } from "zod"
import { numeroPhp, nullable } from "../../../shared/api/zodPhp"

/**
 * Países entre los que se reparten los registros.
 *
 * @readonly
 * @enum {string}
 */
export const PAIS_REGISTRO = {
  TODOS: "All",
  USA: "US",
  MEXICO: "MX",
}

/**
 * Un renglón del resumen: lo que un viaje lleva gastado o cargado.
 */
export const esquemaResumenViaje = z.object({
  trip_id: z.coerce.string(),
  trip_number: nullable(z.coerce.string()),
  nomenclatura: nullable(z.coerce.string()),
  country_code: nullable(z.coerce.string()),
  fecha: nullable(z.coerce.string()),
  nombre: nullable(z.coerce.string()),
  monto: numeroPhp(),
})

/**
 * Cómo se identifica un viaje en pantalla.
 *
 * La nomenclatura completa —`200-US-26`— es lo que la gente reconoce; el número
 * a secas es el respaldo para los viajes viejos que no la tienen.
 *
 * @param {object} fila Un renglón del resumen o del detalle.
 * @returns {string} El identificador visible.
 */
export const identificadorViaje = (fila) =>
  String(fila?.nomenclatura || fila?.trip_number || "")

/**
 * Filtra el resumen por país y por lo escrito en el buscador.
 *
 * El buscador mira el viaje y el conductor, que es como se busca de verdad:
 * "el gasto de aquel viaje" o "lo que cargó fulano".
 *
 * @param {Array} [filas] Los renglones del resumen.
 * @param {object} filtros Lo que hay puesto.
 * @param {string} [filtros.pais] Un valor de `PAIS_REGISTRO`.
 * @param {string} [filtros.busqueda] Lo escrito en el buscador.
 * @returns {Array} Los renglones que quedan.
 */
export function filtrarResumen(filas = [], { pais = PAIS_REGISTRO.TODOS, busqueda = "" } = {}) {
  const texto = String(busqueda ?? "").toLowerCase().trim()

  return filas.filter((fila) => {
    if (pais !== PAIS_REGISTRO.TODOS && fila?.country_code !== pais) return false
    if (!texto) return true

    return (
      identificadorViaje(fila).toLowerCase().includes(texto) ||
      String(fila?.nombre ?? "").toLowerCase().includes(texto)
    )
  })
}

/**
 * Lo que suman los renglones visibles.
 *
 * @param {Array} [filas] Los renglones.
 * @returns {number} El total.
 */
export const totalDe = (filas = []) =>
  filas.reduce((suma, fila) => suma + Number(fila?.monto ?? 0), 0)

/**
 * Cuántos registros pendientes de conciliar tiene un viaje.
 *
 * Solo el diesel los tiene: son las cargas que aún no cuadran con el estado de
 * cuenta ni con FleetOne.
 *
 * @param {object} fila Un renglón del resumen de diesel.
 * @returns {{estado: number, fleetone: number, total: number}} Los pendientes.
 */
export function pendientesDe(fila) {
  const estado = Number(fila?.state_pending_count ?? 0)
  const fleetone = Number(fila?.fleetone_pending_count ?? 0)
  return { estado, fleetone, total: estado + fleetone }
}

/**
 * Indica si una carga de diesel se capturó a mano.
 *
 * Las que llegan solas vienen del proveedor; las manuales las escribió alguien,
 * y por eso se marcan.
 *
 * @param {object} registro El registro de diesel.
 * @returns {boolean} `true` si es manual.
 */
export const esManual = (registro) =>
  Number(registro?.is_manual ?? registro?.manual_count ?? 0) > 0

/**
 * Valida una lista descartando lo que no cumple.
 *
 * @param {Array} filas Lo que vino en la respuesta.
 * @param {object} esquema El esquema con el que validar.
 * @returns {{validos: Array, descartados: number}} Los que pasaron y cuántos no.
 */
export function normalizarLista(filas = [], esquema) {
  const validos = []
  let descartados = 0

  for (const fila of Array.isArray(filas) ? filas : []) {
    const resultado = esquema.safeParse(fila)
    if (resultado.success) validos.push(resultado.data)
    else descartados += 1
  }

  return { validos, descartados }
}
