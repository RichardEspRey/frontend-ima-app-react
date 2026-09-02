import { TIPO_REGISTRO, descriptorDe } from "../../entities/expense"
import { EditorRegistro } from "../../features/expenses"

/**
 * Edición de una carga de diesel, con sus tickets.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function EditarDieselPage() {
  return <EditorRegistro descriptor={descriptorDe(TIPO_REGISTRO.DIESEL)} />
}
