import { useCallback, useMemo, useState } from "react"

import {
  contarPorObservacion,
  useEstatusCajas,
  useGuardarEstatusCaja,
  useSubirFianza,
} from "../../../entities/trailer"
import { notify } from "../../../shared/ui"
import { useAuthStore } from "../../../store/useAuthStore"

/**
 * Todo el estado y los efectos del tablero de estatus de cajas.
 *
 * Existe para que la pantalla se quede solo con la composición: aquí viven la
 * consulta, las dos mutaciones, quién captura y qué diálogo está abierto, y
 * hacia afuera sale una superficie plana de datos y acciones.
 *
 * @returns {object} `{cajas, cargando, mensajeError, recargar, recargando, resumen,
 *   guardandoId, capturar, fianzaEnModal, pedirFianza, cerrarFianza, subiendoFianza,
 *   subirFianzaElegida}`.
 */
export function useTableroCajas() {
  const usuario = useAuthStore((estado) => estado.user)
  const consulta = useEstatusCajas()
  const guardado = useGuardarEstatusCaja()
  const subida = useSubirFianza()
  const [fianzaEnModal, setFianzaEnModal] = useState(null)

  const cajas = useMemo(() => consulta.data ?? [], [consulta.data])
  const resumen = useMemo(() => contarPorObservacion(cajas), [cajas])

  const capturar = useCallback(
    async ({ caja, campo, valor }) => {
      try {
        await guardado.mutateAsync({
          cajaId: caja.caja_id,
          ubicacion: campo === "ubicacion" ? valor : caja.ubicacion,
          observacion: campo === "observacion" ? valor : caja.observacion,
          usuarioId: usuario?.id,
        })
      } catch (fallo) {
        notify.error(fallo)
      }
    },
    [guardado, usuario],
  )

  const subirFianzaElegida = useCallback(
    async ({ archivo, vencimiento }) => {
      const caja = fianzaEnModal

      try {
        await subida.mutateAsync({ cajaId: caja.caja_id, archivo, vencimiento })
        setFianzaEnModal(null)
        notify.exito(`Fianza actualizada para la caja ${caja.no_caja}`)
      } catch (fallo) {
        notify.error(fallo)
      }
    },
    [fianzaEnModal, subida],
  )

  return {
    cajas,
    cargando: consulta.isLoading,
    mensajeError: consulta.error?.message ?? null,
    recargar: consulta.refetch,
    recargando: consulta.isFetching,
    resumen,
    guardandoId: guardado.isPending ? guardado.variables?.cajaId : null,
    capturar,
    fianzaEnModal,
    pedirFianza: setFianzaEnModal,
    cerrarFianza: () => setFianzaEnModal(null),
    subiendoFianza: subida.isPending,
    subirFianzaElegida,
  }
}
