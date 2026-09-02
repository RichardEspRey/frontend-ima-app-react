import { useMemo } from "react"
import { useCamionesActivos } from "../../entities/truck"

const VACIO = []

/**
 * @deprecated Solo lo usan las pantallas en cuarentena de src/no-usadas.
 * En el resto de la aplicación, usa `useCamionesActivos` de `entities/truck` directamente.
 *
 * Mantiene intacta la forma `{ activeTrucks, loading, error }` que esperan las pantallas
 * sin migrar, pero por debajo ya usa TanStack Query: la petición se cachea y se
 * comparte con cualquier otra pantalla que pida el mismo catálogo, en vez de
 * repetirse una vez por componente que monte.
 * Conserva la proyección del original (`truck_id`, `unidad`) para que ningún
 * consumidor reciba campos que antes no le llegaban.
 *
 *
 * La lista va memoizada y el vacío es una constante de módulo. No es cosmético:
 * hay 14 consumidores con `useEffect(..., [activeTrucks])` que llaman a un
 * `setState` dentro. Devolver un arreglo nuevo en cada render dispara ese efecto
 * en bucle infinito. El hook original no tenía el problema porque guardaba la
 * lista en `useState`, donde la identidad es estable.
 *
 * @returns {object} `{ activeTrucks, loading, error }`.
 */
export default function useFetchActiveTrucks() {
  const { data, isLoading, error } = useCamionesActivos()
  const activeTrucks = useMemo(() => (data ?? VACIO).map(({ truck_id, unidad }) => ({ truck_id, unidad })), [data])
  const mensaje = error ? error.message : null
  return { activeTrucks, loading: isLoading, error: mensaje }
}
