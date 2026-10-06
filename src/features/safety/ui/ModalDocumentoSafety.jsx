import { DocPreviewModal } from "../../../components/DocPreviewModal.jsx"
import { PCMillerModal } from "../../../components/PCMillerModal.jsx"
import { DOCUMENTOS_REQUERIDOS, NOMBRE_DOCUMENTO } from "../../../entities/safety"

/**
 * El modal del documento abierto: el de PC Miller, que además lee el reporte, o
 * la vista previa para los otros dos.
 *
 * @param {object} props Propiedades del componente.
 * @param {(object|null)} props.documento `{tripId, tipo, archivo, nombre}`, o `null` si no hay ninguno abierto.
 * @param {Function} props.onCerrar Cierra el modal.
 * @param {Function} props.onCambio Se llama cuando se subió o se borró un documento.
 * @returns {(object|null)} El modal, o nada.
 */
export function ModalDocumentoSafety({ documento, onCerrar, onCambio }) {
  if (!documento) return null

  if (documento.tipo === DOCUMENTOS_REQUERIDOS.PCMILLER) {
    return (
      <PCMillerModal
        open
        onClose={onCerrar}
        tripId={documento.tripId}
        file={documento.archivo}
        filename={documento.nombre}
        onSave={onCambio}
        onDeleteSuccess={onCambio}
      />
    )
  }

  return (
    <DocPreviewModal
      open
      onClose={onCerrar}
      file={documento.archivo}
      filename={documento.nombre}
      tripId={documento.tripId}
      docType={documento.tipo}
      docName={NOMBRE_DOCUMENTO[documento.tipo]}
      onUploadSuccess={onCambio}
      onDeleteSuccess={onCambio}
    />
  )
}
