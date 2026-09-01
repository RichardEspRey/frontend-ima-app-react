import { EditorViaje, MODO_EDICION } from "../../features/trip-edit"

/**
 * Edición de un viaje sin restricciones, incluido el enlace transnacional.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function EditarViajeCompletoPage() {
  return <EditorViaje modo={MODO_EDICION.COMPLETO} />
}
