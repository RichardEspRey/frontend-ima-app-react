import { useMemo } from "react"

import { useAutonomia } from "../../../entities/autonomy"

/**
 * El estado de la pantalla de autonomía: los camiones y cómo va la consulta.
 *
 * @returns {object} `{camiones, cargando, mensajeError, recargar, recargando}`.
 */
export function useAutonomiaFlota() {
  const consulta = useAutonomia()
  const camiones = useMemo(() => consulta.data ?? [], [consulta.data])

  return {
    camiones,
    cargando: consulta.isLoading,
    mensajeError: consulta.error?.message ?? null,
    recargar: consulta.refetch,
    recargando: consulta.isFetching,
  }
}
