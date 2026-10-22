import { useQuery } from "@tanstack/react-query"
import { ENDPOINTS, post } from "../../../shared/api"
import { esquemaRutaViaje } from "../model/ruta"

const ESPERA_WIALON_MS = 120_000

/**
 * Trae la ruta que hizo un viaje finalizado.
 *
 * El servidor la pide a Wialon entre la fecha de inicio y la final que se
 * capturaron al finalizar el viaje. Un viaje largo tarda más que el tiempo
 * máximo de las demás peticiones, así que esta espera hasta dos minutos.
 *
 * @endpoint POST new_trips.php · op=getTripRoute
 * @param {object} parametros Datos de la consulta.
 * @param {string} parametros.tripId El viaje.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<object>} La ruta validada; `ruta` es `null` si no la hay.
 * @throws {ApiError} Si la API o Wialon fallan.
 * @throws {ZodError} Si la respuesta no tiene la forma esperada.
 */
export async function obtenerRutaViaje({ tripId, signal }) {
  const cuerpo = await post(ENDPOINTS.nuevosViajes, "getTripRoute", { trip_id: tripId }, { signal, timeoutMs: ESPERA_WIALON_MS })
  return esquemaRutaViaje.parse(cuerpo)
}

/**
 * La ruta de un viaje finalizado. Una ruta cerrada no cambia, así que no se
 * vuelve a pedir sola.
 *
 * @param {string} tripId El viaje.
 * @param {object} [opciones] Ajustes de la consulta.
 * @param {boolean} [opciones.habilitada=true] Si debe consultarse.
 * @returns {object} El resultado de `useQuery`.
 */
export function useRutaViaje(tripId, { habilitada = true } = {}) {
  return useQuery({
    queryKey: ["viajes", "ruta", String(tripId)],
    queryFn: ({ signal }) => obtenerRutaViaje({ tripId, signal }),
    enabled: habilitada && Boolean(tripId),
    staleTime: Infinity,
    retry: false,
  })
}
