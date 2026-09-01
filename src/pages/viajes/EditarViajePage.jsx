import { EditorViaje, MODO_EDICION } from "../../features/trip-edit"

/**
 * Edición de un viaje en curso, con las restricciones normales.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function EditarViajePage() {
  return <EditorViaje modo={MODO_EDICION.NORMAL} />
}
