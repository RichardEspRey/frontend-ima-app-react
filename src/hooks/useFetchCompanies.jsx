import { useMemo } from "react"
import { useCompanias } from "../entities/company"

const VACIO = []

/**
 * @deprecated Puente temporal. Usa `useCompanias` de `entities/company` directamente.
 *
 * Mantiene intacta la forma `{ activeCompanies, loading, error, refetchCompanies }` que esperan las pantallas
 * sin migrar, pero por debajo ya usa TanStack Query: la petición se cachea y se
 * comparte con cualquier otra pantalla que pida el mismo catálogo, en vez de
 * repetirse una vez por componente que monte.
 *
 * La lista va memoizada y el vacío es una constante de módulo. No es cosmético:
 * hay 14 consumidores con `useEffect(..., [activeCompanies])` que llaman a un
 * `setState` dentro. Devolver un arreglo nuevo en cada render dispara ese efecto
 * en bucle infinito. El hook original no tenía el problema porque guardaba la
 * lista en `useState`, donde la identidad es estable.
 *
 * @returns {object} `{ activeCompanies, loading, error, refetchCompanies }`.
 */
export default function useFetchCompanies() {
  const { data, isLoading, error, refetch } = useCompanias()
  const activeCompanies = useMemo(() => data ?? VACIO, [data])
  const mensaje = error ? error.message : null
  return { activeCompanies, loading: isLoading, error: mensaje, refetchCompanies: refetch }
}
