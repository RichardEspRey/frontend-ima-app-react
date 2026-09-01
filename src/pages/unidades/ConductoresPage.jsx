import { TIPO_UNIDAD } from "../../entities/unit"
import { AdminUnidades } from "../../features/units"

/**
 * Administrador de conductores: plantilla, vigencias, altas y bajas.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function ConductoresPage() {
  return <AdminUnidades tipo={TIPO_UNIDAD.CONDUCTOR} />
}
