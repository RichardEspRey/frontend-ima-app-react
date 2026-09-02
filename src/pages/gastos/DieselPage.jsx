import { TIPO_REGISTRO, descriptorDe } from "../../entities/expense"
import { ResumenPorViaje } from "../../features/expenses"

/**
 * Resumen de diesel: cuánto lleva cargado cada viaje y qué falta conciliar.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function DieselPage() {
  return <ResumenPorViaje descriptor={descriptorDe(TIPO_REGISTRO.DIESEL)} />
}
