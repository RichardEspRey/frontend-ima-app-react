import { useMemo } from "react"
import { useCajasExternasActivas } from "../../entities/trailer"

const VACIO = []

/**
 * @deprecated Puente temporal. Usa `useCajasExternasActivas` de `entities/trailer` directamente.
 *
 * Mantiene intacta la forma `{ activeExternalTrailers, loading, error, refetch }` que esperan las pantallas
 * sin migrar, pero por debajo ya usa TanStack Query: la petición se cachea y se
 * comparte con cualquier otra pantalla que pida el mismo catálogo, en vez de
 * repetirse una vez por componente que monte.
 * Conserva la proyección del original (`caja_externa_id`, `no_caja`) para que ningún
 * consumidor reciba campos que antes no le llegaban.
 *
 *
 * La lista va memoizada y el vacío es una constante de módulo. No es cosmético:
 * hay 14 consumidores con `useEffect(..., [activeExternalTrailers])` que llaman a un
 * `setState` dentro. Devolver un arreglo nuevo en cada render dispara ese efecto
 * en bucle infinito. El hook original no tenía el problema porque guardaba la
 * lista en `useState`, donde la identidad es estable.
 *
 * @returns {object} `{ activeExternalTrailers, loading, error, refetch }`.
 */
export default function useFetchActiveExternalTrailers() {
  const { data, isLoading, error, refetch } = useCajasExternasActivas()
  const activeExternalTrailers = useMemo(() => (data ?? VACIO).map(({ caja_externa_id, no_caja }) => ({ caja_externa_id, no_caja })), [data])
  const mensaje = error ? error.message : null
  return { activeExternalTrailers, loading: isLoading, error: mensaje, refetch: refetch }
}
