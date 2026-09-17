import { EditorViaje, MODO_EDICION } from "../../features/trip-edit"
import { ModalGastoDtops, useGastoDtopsPendiente } from "../../features/gasto-dtops"

/**
 * Edición de un viaje sin restricciones, incluido el enlace transnacional.
 *
 * Subir el DTOPS de una etapa ofrece registrar su gasto en Expense Manager.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function EditarViajeCompletoPage() {
  const gastoDtops = useGastoDtopsPendiente()

  return (
    <>
      <EditorViaje modo={MODO_EDICION.COMPLETO} onDocumentoSubido={gastoDtops.alSubirDocumento} />

      {gastoDtops.pendiente && (
        <ModalGastoDtops
          abierto
          onCerrar={gastoDtops.cerrar}
          archivo={gastoDtops.pendiente.archivo}
          viaje={gastoDtops.pendiente.viaje}
          yaExistia={gastoDtops.pendiente.yaExistia}
        />
      )}
    </>
  )
}
