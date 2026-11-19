import { NIVEL_RENDIMIENTO } from "../../../entities/autonomy"
import { CHIP_DANGER_SX, CHIP_OK_SX, CHIP_SX, CHIP_WARN_SX } from "../../../shared/ui/estilos"
import { COLOR } from "../../../shared/ui/tokens"

/**
 * El chip con que se pinta cada nivel de rendimiento, con los estilos compartidos.
 *
 * @type {Object.<string, object>}
 */
export const CHIP_NIVEL = {
  [NIVEL_RENDIMIENTO.BUENO]: CHIP_OK_SX,
  [NIVEL_RENDIMIENTO.REGULAR]: CHIP_WARN_SX,
  [NIVEL_RENDIMIENTO.BAJO]: CHIP_DANGER_SX,
  [NIVEL_RENDIMIENTO.SIN_DATO]: { ...CHIP_SX, bgcolor: COLOR.LIENZO, color: COLOR.TEXTO_SUAVE, border: `1px solid ${COLOR.BORDE}` },
}

/**
 * El color de texto para un nivel de rendimiento: el mismo del chip.
 *
 * @param {string} nivel Uno de `NIVEL_RENDIMIENTO`.
 * @returns {string} El color.
 */
export const colorTexto = (nivel) =>
  nivel === NIVEL_RENDIMIENTO.SIN_DATO ? COLOR.TENUE : CHIP_NIVEL[nivel].color
