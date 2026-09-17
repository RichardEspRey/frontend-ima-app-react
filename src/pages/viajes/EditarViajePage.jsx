import { EditorViaje, MODO_EDICION } from "../../features/trip-edit"
import { ModalGastoDtops, useGastoDtopsPendiente } from "../../features/gasto-dtops"

/**
 * Edición de un viaje en curso, con las restricciones normales.
 *
 * Subir el DTOPS de una etapa ofrece registrar su gasto en Expense Manager.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function EditarViajePage() {
  const gastoDtops = useGastoDtopsPendiente()

  return (
    <>
      <EditorViaje modo={MODO_EDICION.NORMAL} onDocumentoSubido={gastoDtops.alSubirDocumento} />

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
