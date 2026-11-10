import { useMemo, useState } from "react"
import { useInspeccionesSinFallas, useNomenclaturas } from "../../../entities/maintenance-point"
import { usePaginacion } from "../../../shared/ui"
import { SIN_FILTROS_SIN_FALLAS, filtrarSinFallas, hayFiltros as tieneFiltros } from "./filtros"

/**
 * El estado de la lista de inspecciones sin fallas.
 *
 * Es solo de consulta: no hay puntos que resolver ni lado que cerrar.
 *
 * @returns {object} Lo que la pantalla necesita pintar y disparar.
 */
export function usePanelSinFallas() {
  const [abierta, setAbierta] = useState(null)
  const [filtros, setFiltros] = useState(SIN_FILTROS_SIN_FALLAS)

  const consulta = useInspeccionesSinFallas()
  const { data: nomenclaturas } = useNomenclaturas()

  const conNomenclatura = useMemo(
    () =>
      (consulta.data ?? []).map((fila) => ({
        ...fila,
        nomenclatura: nomenclaturas?.get(String(fila.viaje_id)) ?? "",
      })),
    [consulta.data, nomenclaturas],
  )

  const filtradas = useMemo(() => filtrarSinFallas(conNomenclatura, filtros), [conNomenclatura, filtros])

  const paginacion = usePaginacion(filtradas)

  const reiniciar = () => {
    setAbierta(null)
    paginacion.irAPagina(0)
  }

  return {
    filtros,
    cambiarFiltro: (campo, valor) => {
      setFiltros((previos) => ({ ...previos, [campo]: valor }))
      reiniciar()
    },
    limpiarFiltros: () => {
      setFiltros(SIN_FILTROS_SIN_FALLAS)
      reiniciar()
    },
    hayFiltros: tieneFiltros(filtros),
    consulta,
    filtradas,
    paginacion,
    abierta,
    abrir: (fila) => setAbierta((actual) => (actual === fila.cl_final_id ? null : fila.cl_final_id)),
  }
}
