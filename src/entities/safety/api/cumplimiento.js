import { useQuery } from "@tanstack/react-query"
import { ENDPOINTS, postLista } from "../../../shared/api"
import { normalizarViajesSafety } from "../model/cumplimiento"

/**
 * Llave de caché de los viajes de cumplimiento.
 *
 * @type {Array.<string>}
 */
export const LLAVE_SAFETY = ["safety", "viajes"]

/**
 * Trae los viajes con el estado de su documentación.
 *
 * @endpoint POST safety.php · op=get_safety_trips
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Los viajes normalizados.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerViajesSafety(opciones = {}) {
  const filas = await postLista(ENDPOINTS.safety, "get_safety_trips", { signal: opciones.signal })
  const { viajes, descartados } = normalizarViajesSafety(filas)

  if (descartados > 0) {
    console.warn(`safety.php#get_safety_trips descartó ${descartados} viaje(s).`)
  }

  return viajes
}

/**
 * Viajes de cumplimiento, cacheados.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function useViajesSafety() {
  return useQuery({
    queryKey: LLAVE_SAFETY,
    queryFn: ({ signal }) => obtenerViajesSafety({ signal }),
  })
}
