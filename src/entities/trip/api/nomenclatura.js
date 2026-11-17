import { useState } from "react"
import { useQueries } from "@tanstack/react-query"
import { guardarNomenclaturas, leerNomenclaturas } from "../model/nomenclaturasGuardadas"
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
 * Las nomenclaturas de varios viajes, pedidas una vez por viaje y recordadas.
 *
 * Cada una cuesta pedir el viaje completo, así que lo que ya se conoce sale del
 * navegador (`leerNomenclaturas`) y no se vuelve a pedir en la sesión; solo se
 * consulta la de los viajes que esta máquina no ha visto, y se guarda al llegar.
 *
 * @endpoint POST new_trips.php · op=getById
 * @param {Array.<(string|number)>} tripIds Los viajes a nombrar; se ignoran repetidos y vacíos.
 * @returns {Map.<string, string>} Viaje contra su nomenclatura; faltan los que siguen cargando o fallaron.
 */
export function useNomenclaturasDeViajes(tripIds) {
  const unicos = [...new Set(tripIds.filter(Boolean).map(String))]
  const [guardadas] = useState(() => leerNomenclaturas())

  return useQueries({
    queries: unicos.map((tripId) => ({
      queryKey: llaveNomenclaturaViaje(tripId),
      queryFn: async ({ signal }) => {
        const nomenclatura = nomenclaturaViaje((await obtenerViajePorId({ tripId, signal })).trip)
        guardarNomenclaturas({ [tripId]: nomenclatura })
        return nomenclatura
      },
      initialData: guardadas[tripId],
      staleTime: Infinity,
    })),
    combine: (resultados) =>
      new Map(
        resultados.flatMap((resultado, i) => (resultado.data ? [[unicos[i], resultado.data]] : [])),
      ),
  })
}
