/**
 * Los status de caja que admite cada país al marcar un viaje como casi
 * finalizado.
 *
 * En Estados Unidos no existe la exportación, así que ofrecer «Expo» ahí sería
 * ofrecer un dato que el viaje no puede tener.
 *
 * @readonly
 * @type {object}
 */
export const STATUS_CAJA_POR_PAIS = {
  US: ["Impo", "Vacio"],
  MX: ["Impo", "Expo", "Vacio"],
}

/**
 * Los status de caja que se le pueden ofrecer a un viaje.
 *
 * Un país desconocido cae en los de México, que es el juego completo: más vale
 * ofrecer una opción de más que dejar la pantalla sin ninguna.
 *
 * @param {string} [pais] Código de país del viaje.
 * @returns {Array.<string>} Los status admitidos, en orden.
 */
export function statusCajaDe(pais) {
  return STATUS_CAJA_POR_PAIS[pais] ?? STATUS_CAJA_POR_PAIS.MX
}

/**
 * Comprueba que un status elegido valga para el país del viaje.
 *
 * @param {string} status Lo que se eligió.
 * @param {string} [pais] Código de país del viaje.
 * @returns {boolean} `true` si el status existe para ese país.
 */
export function statusCajaValido(status, pais) {
  return statusCajaDe(pais).includes(status)
}
