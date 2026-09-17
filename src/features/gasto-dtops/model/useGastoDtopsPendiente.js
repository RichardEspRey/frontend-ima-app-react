import { useCallback, useState } from "react"

import { requiereGastoDtops } from "../../../entities/expense"

/**
 * Espera la subida de un DTOPS para ofrecer el alta de su gasto.
 *
 * Quien sube documentos solo avisa de cada subida con `alSubirDocumento`; este
 * hook decide si es un DTOPS que genera gasto y guarda lo que el modal
 * necesita. Así el editor de viajes no sabe nada de gastos, y la regla vive en
 * un solo lugar para todas las pantallas que suben documentos.
 *
 * @returns {object} El gasto pendiente, el aviso de subida y cómo descartarlo.
 */
export function useGastoDtopsPendiente() {
  const [pendiente, setPendiente] = useState(null)

  const alSubirDocumento = useCallback((subida) => {
    if (!requiereGastoDtops(subida)) return
    setPendiente({
      archivo: subida.archivo,
      viaje: subida.viaje,
      yaExistia: Boolean(subida.anterior?.document_id),
    })
  }, [])

  const cerrar = useCallback(() => setPendiente(null), [])

  return { pendiente, alSubirDocumento, cerrar }
}
