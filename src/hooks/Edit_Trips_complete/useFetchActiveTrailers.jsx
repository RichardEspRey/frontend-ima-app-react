import { useMemo } from "react"
import { useCajasActivasCompletas } from "../../entities/trailer"

const VACIO = []

/**
 * @deprecated Puente temporal. Usa `useCajasActivasCompletas` de `entities/trailer` directamente.
 *
 * Mantiene intacta la forma `{ activeTrailers, loading, error }` que esperan las pantallas
 * sin migrar, pero por debajo ya usa TanStack Query: la petición se cachea y se
 * comparte con cualquier otra pantalla que pida el mismo catálogo, en vez de
 * repetirse una vez por componente que monte.
 * Conserva la proyección del original (`caja_id`, `no_caja`) para que ningún
 * consumidor reciba campos que antes no le llegaban.
 *
 *
 * La lista va memoizada y el vacío es una constante de módulo. No es cosmético:
 * hay 14 consumidores con `useEffect(..., [activeTrailers])` que llaman a un
 * `setState` dentro. Devolver un arreglo nuevo en cada render dispara ese efecto
 * en bucle infinito. El hook original no tenía el problema porque guardaba la
 * lista en `useState`, donde la identidad es estable.
 *
 * @returns {object} `{ activeTrailers, loading, error }`.
 */
export default function useFetchActiveTrailers() {
  const { data, isLoading, error } = useCajasActivasCompletas()
  const activeTrailers = useMemo(() => (data ?? VACIO).map(({ caja_id, no_caja }) => ({ caja_id, no_caja })), [data])
  const mensaje = error ? error.message : null
  return { activeTrailers, loading: isLoading, error: mensaje }
}
