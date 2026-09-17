import { CATALOGO_GASTOS, useCatalogoGastos } from "../../entities/expense"

const VACIO = []

/**
 * Puente: los tipos de gasto con la forma que esperan las pantallas sin migrar.
 *
 * Por debajo ya es TanStack Query, así que el catálogo se cachea, se comparte
 * entre las pantallas que lo pidan y **se reintenta solo** cuando el host falla,
 * que era lo que este hook resolvía a mano en la rama de trabajo.
 *
 * @returns {object} `{ expenseTypes, loading, error }`.
 */
const useFetchExpenseTypes = () => {
  const { data, isLoading, error } = useCatalogoGastos(CATALOGO_GASTOS.TIPOS)
  return { expenseTypes: data ?? VACIO, loading: isLoading, error: error ? error.message : null }
}

export default useFetchExpenseTypes
