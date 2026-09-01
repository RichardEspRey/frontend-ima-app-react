import { useQuery } from "@tanstack/react-query"
import { ENDPOINTS, postLista } from "../../../shared/api"
import { normalizarAutonomias } from "../model/autonomia"

/**
 * Llave de caché de la autonomía de la flota.
 *
 * @type {Array.<string>}
 */
export const LLAVE_AUTONOMIA = ["autonomia"]

/**
 * Trae el rendimiento de cada camión con sus registros anidados.
 *
 * @endpoint POST autonomia.php · op=get_truck_autonomy
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Las autonomías normalizadas.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerAutonomia(opciones = {}) {
  const filas = await postLista(ENDPOINTS.autonomia, "get_truck_autonomy", {
    signal: opciones.signal,
  })
  const { autonomias, descartados } = normalizarAutonomias(filas)

  if (descartados > 0) {
    console.warn(`autonomia.php#get_truck_autonomy descartó ${descartados} camión(es).`)
  }

  return autonomias
}

/**
 * Autonomía de la flota, cacheada.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function useAutonomia() {
  return useQuery({
    queryKey: LLAVE_AUTONOMIA,
    queryFn: ({ signal }) => obtenerAutonomia({ signal }),
  })
}
