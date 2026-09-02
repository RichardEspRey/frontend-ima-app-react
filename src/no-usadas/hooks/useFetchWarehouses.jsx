import { useMemo } from "react"
import { useBodegas } from "../../entities/warehouse"

const VACIO = []

/**
 * @deprecated Solo lo usan las pantallas en cuarentena de src/no-usadas.
 * En el resto de la aplicación, usa `useBodegas` de `entities/warehouse` directamente.
 *
 * Mantiene intacta la forma `{ activeWarehouses, loading, error, refetchWarehouses }` que esperan las pantallas
 * sin migrar, pero por debajo ya usa TanStack Query: la petición se cachea y se
 * comparte con cualquier otra pantalla que pida el mismo catálogo, en vez de
 * repetirse una vez por componente que monte.
 *
 * La lista va memoizada y el vacío es una constante de módulo. No es cosmético:
 * hay 14 consumidores con `useEffect(..., [activeWarehouses])` que llaman a un
 * `setState` dentro. Devolver un arreglo nuevo en cada render dispara ese efecto
 * en bucle infinito. El hook original no tenía el problema porque guardaba la
 * lista en `useState`, donde la identidad es estable.
 *
 * @returns {object} `{ activeWarehouses, loading, error, refetchWarehouses }`.
 */
export default function useFetchWarehouses() {
  const { data, isLoading, error, refetch } = useBodegas()
  const activeWarehouses = useMemo(() => data ?? VACIO, [data])
  const mensaje = error ? error.message : null
  return { activeWarehouses, loading: isLoading, error: mensaje, refetchWarehouses: refetch }
}
