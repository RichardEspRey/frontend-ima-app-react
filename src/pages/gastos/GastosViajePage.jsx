import { TIPO_REGISTRO, descriptorDe } from "../../entities/expense"
import { ResumenPorViaje } from "../../features/expenses"

/**
 * Resumen de gastos de viaje: cuánto lleva gastado cada viaje.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function GastosViajePage() {
  return <ResumenPorViaje descriptor={descriptorDe(TIPO_REGISTRO.GASTO)} />
}
