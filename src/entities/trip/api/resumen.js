import { useQuery } from "@tanstack/react-query"
import { ENDPOINTS, post } from "../../../shared/api"

/**
 * Llave de caché del resumen de un viaje.
 *
 * @param {string} tripId Viaje a consultar.
 * @returns {Array} La llave para `useQuery`.
 */
export const llaveResumenViaje = (tripId) => ["viaje", "resumen", tripId]

/**
 * El resumen de un viaje: etapas, diesel, gastos y totales.
 *
 * Cuando el viaje no existe la API responde `status: "not found"`, que no es ni
 * éxito ni el `"error"` que el cliente convierte en excepción: llegaría un
 * cuerpo sin datos y la pantalla se quedaría cargando para siempre. Por eso se
 * comprueba aquí.
 *
 * @endpoint POST trips.php · op=trip_summary
 * @param {object} parametros Datos de la consulta.
 * @param {string} parametros.tripId Viaje a consultar.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<object>} El resumen completo.
 * @throws {Error} Si el viaje no existe.
 * @throws {ApiError} Si la petición falla.
 */
export async function obtenerResumenViaje({ tripId, signal }) {
  const cuerpo = await post(ENDPOINTS.trips, "trip_summary", { trip_id: String(tripId) }, { signal })

  if (!cuerpo?.data) {
    throw new Error(cuerpo?.message || "No se encontró el resumen de este viaje.")
  }

  return cuerpo.data
}

/**
 * Resumen de un viaje. No consulta hasta tener un id.
 *
 * @param {string} tripId Viaje a consultar.
 * @returns {object} El resultado de `useQuery`.
 */
export function useResumenViaje(tripId) {
  return useQuery({
    queryKey: llaveResumenViaje(tripId),
    enabled: Boolean(tripId),
    queryFn: ({ signal }) => obtenerResumenViaje({ tripId, signal }),
  })
}
