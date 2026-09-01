import { useQueries, useQuery } from "@tanstack/react-query"
import { ENDPOINTS, postLista } from "../../../shared/api"

/**
 * Las gráficas del tablero, con el `op` que las alimenta.
 *
 * Todas salen de `charts.php` cambiando solo el `op`, así que en vez de seis
 * funciones idénticas hay una tabla de datos. Agregar una gráfica es agregar una
 * línea aquí, no otra copia del mismo `fetch`.
 *
 * Las claves de cada respuesta están verificadas contra la API real el
 * 2026-08-31, no supuestas.
 *
 * @readonly
 * @enum {string}
 */
export const GRAFICAS = {
  DIESEL: "chart_diesel",
  DIESEL_TABLA: "chart_diesel_table",
  DIESEL_COSTO: "chart_diesel_cost",
  FINANZAS: "chart_finances",
  FINANZAS_RTS: "chart_finances_rts",
  MANTENIMIENTO: "chart_maintenance_costs",
}

/**
 * Llave de caché de una gráfica.
 *
 * Los parámetros entran en la llave para que cambiar el periodo traiga su propio
 * resultado en vez de pisar el anterior.
 *
 * @param {string} op Operación de la gráfica.
 * @param {object} [parametros] Parámetros que modifican el resultado.
 * @returns {Array} La llave para `useQuery`.
 */
export const llaveGrafica = (op, parametros) =>
  parametros ? ["graficas", op, parametros] : ["graficas", op]

/**
 * Trae los datos de una gráfica.
 *
 * @endpoint POST charts.php · op=chart_*
 * @param {object} argumentos Datos de la consulta.
 * @param {string} argumentos.op Operación, un valor de `GRAFICAS`.
 * @param {object} [argumentos.parametros] Parámetros como `period`.
 * @param {AbortSignal} [argumentos.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Las filas de la gráfica, o `[]`.
 * @throws {ApiError} Si la API falla.
 */
export function obtenerGrafica({ op, parametros, signal }) {
  return postLista(ENDPOINTS.charts, op, { payload: parametros, signal })
}

/**
 * Datos de una gráfica, cacheados.
 *
 * @param {string} op Operación, un valor de `GRAFICAS`.
 * @param {object} [parametros] Parámetros como `period`.
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function useGrafica(op, parametros) {
  return useQuery({
    queryKey: llaveGrafica(op, parametros),
    queryFn: ({ signal }) => obtenerGrafica({ op, parametros, signal }),
  })
}

/**
 * Varias gráficas a la vez.
 *
 * Se piden en paralelo y cada una llega cuando puede, así que una lenta no
 * retrasa a las demás. Antes eran seis `useEffect` y doce `useState`.
 *
 * @param {Array.<object>} peticiones Lista de `{op, parametros}`.
 * @returns {Array.<object>} Un resultado de `useQuery` por petición, en el mismo orden.
 */
export function useGraficas(peticiones) {
  return useQueries({
    queries: peticiones.map(({ op, parametros }) => ({
      queryKey: llaveGrafica(op, parametros),
      queryFn: ({ signal }) => obtenerGrafica({ op, parametros, signal }),
    })),
  })
}
