import { useMemo } from "react"

import { CATALOGO_GASTOS, useCatalogoGastos } from "../../entities/expense"

const VACIO = []

/**
 * Puente: las categorías de mantenimiento con la forma que esperan las
 * pantallas sin migrar.
 *
 * Conserva la proyección del original (`value`, `label`, `id_tipo_gasto`) para
 * que ningún consumidor reciba campos que antes no le llegaban, y hereda del
 * cliente de consultas la caché y los reintentos.
 *
 * @returns {object} `{ maintenanceCategories, loading, error, refetch }`.
 */
function useFetchCategories() {
  const { data, isLoading, error, refetch } = useCatalogoGastos(CATALOGO_GASTOS.CATEGORIAS)

  const maintenanceCategories = useMemo(
    () =>
      (data ?? VACIO).map(({ value, label, id_tipo_gasto }) => ({ value, label, id_tipo_gasto })),
    [data],
  )

  return {
    maintenanceCategories,
    loading: isLoading,
    error: error ? error.message : null,
    refetch,
  }
}

export default useFetchCategories
