import { TIPO_REGISTRO, descriptorDe } from "../../entities/expense"
import { RegistrosDeViaje } from "../../features/expenses"

/**
 * Los gastos capturados en un viaje.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function GastosDeViajePage() {
  return <RegistrosDeViaje descriptor={descriptorDe(TIPO_REGISTRO.GASTO)} />
}
