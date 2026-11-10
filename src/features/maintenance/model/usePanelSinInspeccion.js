import { useMemo, useState } from "react"
import { contarPorOperador, useViajesSinInspeccion } from "../../../entities/maintenance-point"
import { usePaginacion } from "../../../shared/ui"
import { SIN_FILTROS_SIN_INSPECCION, filtrarSinInspeccion, hayFiltros as tieneFiltros } from "./filtros"

/**
 * El estado de la lista de viajes terminados sin inspección.
 *
 * Es solo de consulta. El resumen por operador se calcula sobre lo filtrado, para
 * que responda al rango de fechas que se esté viendo.
 *
 * @returns {object} Lo que la pantalla necesita pintar y disparar.
 */
export function usePanelSinInspeccion() {
  const [filtros, setFiltros] = useState(SIN_FILTROS_SIN_INSPECCION)

  const consulta = useViajesSinInspeccion()

  const filtradas = useMemo(() => filtrarSinInspeccion(consulta.data ?? [], filtros), [consulta.data, filtros])
  const porOperador = useMemo(() => contarPorOperador(filtradas), [filtradas])

  const paginacion = usePaginacion(filtradas)

  const cambiarFiltro = (campo, valor) => {
    setFiltros((previos) => ({ ...previos, [campo]: valor }))
    paginacion.irAPagina(0)
  }

  return {
    filtros,
    cambiarFiltro,
    alternarOperador: (operador) => cambiarFiltro("operador", filtros.operador === operador ? "" : operador),
    limpiarFiltros: () => {
      setFiltros(SIN_FILTROS_SIN_INSPECCION)
      paginacion.irAPagina(0)
    },
    hayFiltros: tieneFiltros(filtros),
    consulta,
    filtradas,
    porOperador,
    paginacion,
  }
}
