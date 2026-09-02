import { TIPO_REGISTRO, descriptorDe } from "../../entities/expense"
import { EditorRegistro } from "../../features/expenses"

/**
 * Edición de un gasto de viaje, con sus tickets.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function EditarGastoPage() {
  return <EditorRegistro descriptor={descriptorDe(TIPO_REGISTRO.GASTO)} />
}
