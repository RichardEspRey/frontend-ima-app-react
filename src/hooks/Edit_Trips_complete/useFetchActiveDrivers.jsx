import { useMemo } from "react"
import { useConductoresActivosCompletos } from "../../entities/driver"

const VACIO = []

/**
 * @deprecated Puente temporal. Usa `useConductoresActivosCompletos` de `entities/driver` directamente.
 *
 * Mantiene intacta la forma `{ activeDrivers, loading, error }` que esperan las pantallas
 * sin migrar, pero por debajo ya usa TanStack Query: la petición se cachea y se
 * comparte con cualquier otra pantalla que pida el mismo catálogo, en vez de
 * repetirse una vez por componente que monte.
 * Conserva la proyección del original (`driver_id`, `nombre`) para que ningún
 * consumidor reciba campos que antes no le llegaban.
 *
 *
 * La lista va memoizada y el vacío es una constante de módulo. No es cosmético:
 * hay 14 consumidores con `useEffect(..., [activeDrivers])` que llaman a un
 * `setState` dentro. Devolver un arreglo nuevo en cada render dispara ese efecto
 * en bucle infinito. El hook original no tenía el problema porque guardaba la
 * lista en `useState`, donde la identidad es estable.
 *
 * @returns {object} `{ activeDrivers, loading, error }`.
 */
export default function useFetchActiveDrivers() {
  const { data, isLoading, error } = useConductoresActivosCompletos()
  const activeDrivers = useMemo(() => (data ?? VACIO).map(({ driver_id, nombre }) => ({ driver_id, nombre })), [data])
  const mensaje = error ? error.message : null
  return { activeDrivers, loading: isLoading, error: mensaje }
}
