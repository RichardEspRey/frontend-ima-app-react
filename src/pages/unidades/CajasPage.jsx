import { TIPO_UNIDAD } from "../../entities/unit"
import { AdminUnidades } from "../../features/units"

/**
 * Administrador de cajas: remolques, placas y expediente documental.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function CajasPage() {
  return <AdminUnidades tipo={TIPO_UNIDAD.CAJA} />
}
