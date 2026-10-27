import { useQueries } from "@tanstack/react-query"
import { FRESCURA_CATALOGO_MS } from "../../../shared/api"
import { nomenclaturaViaje } from "../model/viaje"
import { obtenerViajePorId } from "./edicion"

/**
 * Llave de caché de la nomenclatura de un viaje.
 *
 * @param {string} tripId Viaje a consultar.
 * @returns {Array} La llave para `useQueries`.
 */
export const llaveNomenclaturaViaje = (tripId) => ["viajes", "nomenclatura", String(tripId)]

/**
 * Las nomenclaturas de varios viajes, pedidas una vez por viaje y cacheadas largo.
 *
 * @endpoint POST new_trips.php · op=getById
 * @param {Array.<(string|number)>} tripIds Los viajes a nombrar; se ignoran repetidos y vacíos.
 * @returns {Map.<string, string>} Viaje contra su nomenclatura; faltan los que siguen cargando o fallaron.
 */
export function useNomenclaturasDeViajes(tripIds) {
  const unicos = [...new Set(tripIds.filter(Boolean).map(String))]

  return useQueries({
    queries: unicos.map((tripId) => ({
      queryKey: llaveNomenclaturaViaje(tripId),
      queryFn: async ({ signal }) => nomenclaturaViaje((await obtenerViajePorId({ tripId, signal })).trip),
      staleTime: FRESCURA_CATALOGO_MS,
    })),
    combine: (resultados) =>
      new Map(
        resultados.flatMap((resultado, i) => (resultado.data ? [[unicos[i], resultado.data]] : [])),
      ),
  })
}
