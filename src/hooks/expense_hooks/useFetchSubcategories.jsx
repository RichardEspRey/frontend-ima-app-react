import { CATALOGO_GASTOS, useCatalogoGastos } from "../../entities/expense"

const VACIO = []

/**
 * Puente: las subcategorías de mantenimiento con la forma que esperan las
 * pantallas sin migrar.
 *
 * Por debajo ya es TanStack Query: caché compartida y reintento automático
 * cuando el host falla.
 *
 * @returns {object} `{ subcategories, loading, error, refetch }`.
 */
function useFetchSubcategories() {
  const { data, isLoading, error, refetch } = useCatalogoGastos(CATALOGO_GASTOS.SUBCATEGORIAS)
  return {
    subcategories: data ?? VACIO,
    loading: isLoading,
    error: error ? error.message : null,
    refetch,
  }
}

export default useFetchSubcategories
