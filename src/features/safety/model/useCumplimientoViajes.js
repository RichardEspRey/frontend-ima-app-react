import { useCallback, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import {
  LLAVE_SAFETY,
  contarFaltantes,
  filtrarPorNumero,
  separarPorCumplimiento,
  useViajesSafety,
} from "../../../entities/safety"

/**
 * Las dos listas de la pantalla de cumplimiento.
 *
 * @readonly
 * @enum {string}
 */
export const VISTA_CUMPLIMIENTO = {
  PENDIENTES: "pendientes",
  COMPLETOS: "completos",
}

/**
 * El estado de la revisión de documentos de los viajes: la consulta, la
 * búsqueda, qué lista se ve y qué documento está abierto.
 *
 * @param {string} vista Uno de `VISTA_CUMPLIMIENTO`.
 * @returns {object} `{viajes, faltantes, busqueda, buscar, cargando, mensajeError, recargar,
 *   recargando, documento, subirDocumento, verDocumento, cerrarDocumento, refrescar}`.
 */
export function useCumplimientoViajes(vista) {
  const cliente = useQueryClient()
  const consulta = useViajesSafety()
  const [busqueda, setBusqueda] = useState("")
  const [documento, setDocumento] = useState(null)

  const todos = useMemo(() => consulta.data ?? [], [consulta.data])
  const { pendientes, completos } = useMemo(
    () => separarPorCumplimiento(filtrarPorNumero(todos, busqueda)),
    [todos, busqueda],
  )
  const faltantes = useMemo(() => contarFaltantes(pendientes), [pendientes])

  const refrescar = useCallback(
    () => cliente.invalidateQueries({ queryKey: LLAVE_SAFETY }),
    [cliente],
  )

  const subirDocumento = useCallback(
    (viaje, tipo, archivo) => setDocumento({ tripId: viaje.trip_id, tipo, archivo, nombre: null }),
    [],
  )

  const verDocumento = useCallback(
    (viaje, tipo) => setDocumento({ tripId: viaje.trip_id, tipo, archivo: null, nombre: viaje[tipo] }),
    [],
  )

  return {
    viajes: vista === VISTA_CUMPLIMIENTO.COMPLETOS ? completos : pendientes,
    faltantes,
    busqueda,
    buscar: setBusqueda,
    cargando: consulta.isLoading,
    mensajeError: consulta.error?.message ?? null,
    recargar: consulta.refetch,
    recargando: consulta.isFetching,
    documento,
    subirDocumento,
    verDocumento,
    cerrarDocumento: () => setDocumento(null),
    refrescar,
  }
}
