import { TIPO_UNIDAD } from "../../entities/unit"
import { AdminUnidades } from "../../features/units"

/**
 * Administrador de camiones: unidades, placas y expediente documental.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function CamionesPage() {
  return <AdminUnidades tipo={TIPO_UNIDAD.CAMION} />
}
