import { NIVEL_RENDIMIENTO } from "../../../entities/autonomy"

/**
 * El color de la paleta del tema con que se pinta cada nivel de rendimiento.
 *
 * @type {Object.<string, string>}
 */
export const COLOR_NIVEL = {
  [NIVEL_RENDIMIENTO.BUENO]: "success",
  [NIVEL_RENDIMIENTO.REGULAR]: "warning",
  [NIVEL_RENDIMIENTO.BAJO]: "error",
  [NIVEL_RENDIMIENTO.SIN_DATO]: "default",
}

/**
 * El color de texto para un nivel de rendimiento.
 *
 * @param {string} nivel Uno de `NIVEL_RENDIMIENTO`.
 * @returns {string} La ruta del color en la paleta del tema.
 */
export const colorTexto = (nivel) =>
  nivel === NIVEL_RENDIMIENTO.SIN_DATO ? "text.secondary" : `${COLOR_NIVEL[nivel]}.main`
