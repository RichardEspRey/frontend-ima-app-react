/**
 * Los idiomas que la aplicación sabe hablar.
 *
 * @readonly
 * @enum {string}
 */
export const IDIOMA = {
  ES: "es",
  EN: "en",
}

/**
 * Cómo se llama cada idioma en su propio idioma.
 *
 * En su propio idioma a propósito: quien busca el inglés reconoce "English"
 * aunque no entienda el resto de la pantalla, que es justo la situación en la
 * que alguien va a usar este botón.
 *
 * @readonly
 * @enum {string}
 */
export const NOMBRE_IDIOMA = {
  [IDIOMA.ES]: "Español",
  [IDIOMA.EN]: "English",
}

/**
 * El idioma con el que arranca la app si nadie ha elegido.
 *
 * Español, porque es el idioma en que trabaja el equipo. El inglés está para
 * quien lo necesite, no al revés.
 *
 * @readonly
 * @type {string}
 */
export const IDIOMA_POR_OMISION = IDIOMA.ES

/**
 * Dónde se recuerda la preferencia entre sesiones.
 *
 * @readonly
 * @type {string}
 */
export const CLAVE_ALMACEN = "ima.idioma"

/**
 * Indica si un valor es un idioma que la app conoce.
 *
 * Sirve para no confiar en lo que venga del almacenamiento del navegador, que
 * cualquiera puede editar y que puede traer el valor de una versión anterior.
 *
 * @param {*} valor El candidato.
 * @returns {boolean} `true` si es un idioma soportado.
 */
export const esIdiomaValido = (valor) => Object.values(IDIOMA).includes(valor)
