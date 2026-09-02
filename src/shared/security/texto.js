/**
 * Caracteres de control que nunca deben viajar en un campo de texto.
 *
 * Se conservan a propósito el tabulador y el salto de línea: son legítimos en
 * una nota. El resto no se ve en pantalla, así que sirve para esconder
 * contenido dentro de un valor que parece normal.
 *
 * @readonly
 * @type {RegExp}
 */
// Los caracteres de control son justamente lo que esta expresion busca.
// eslint-disable-next-line no-control-regex
export const CARACTERES_DE_CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

/**
 * Caracteres invisibles: ancho cero, marcas de dirección y BOM.
 *
 * Ocupan lugar en la cadena pero no pintan nada. Dos textos que se ven idénticos
 * pueden ser distintos por culpa de uno de estos, y entonces una búsqueda falla
 * sin explicación posible.
 *
 * @readonly
 * @type {RegExp}
 */
export const CARACTERES_INVISIBLES = /[\u200B-\u200F\u2028\u2029\u202A-\u202E\u2060-\u2064\uFEFF]/g

/**
 * Límites de longitud por tipo de campo, en caracteres.
 *
 * Salen de lo que aguanta la columna en la base, no de una preferencia. Un texto
 * más largo hoy se manda igual y MySQL lo corta en silencio, así que el dato
 * queda a medias sin que nadie se entere.
 *
 * @readonly
 * @enum {number}
 */
export const LARGO_MAXIMO = {
  CORTO: 100,
  MEDIO: 255,
  LARGO: 1000,
  NOTA: 5000,
}

/**
 * Limpia un texto que va a viajar a la API.
 *
 * Lo que hace y lo que no:
 *
 * - **Quita caracteres de control y de ancho cero**, por lo dicho arriba.
 * - **Normaliza a NFC.** Sin esto, «José» escrito de dos formas distintas son
 *   dos cadenas distintas para la base.
 * - **Recorta espacios de los extremos** y colapsa los saltos de línea sobrantes.
 * - **No escapa comillas ni palabras de SQL.** Escapar aquí no protege nada \u2014la
 *   API no autentica, cualquiera puede saltarse el navegador con un `curl`\u2014 y sí
 *   rompe datos legítimos: apellidos como O'Brien, o una nota que mencione
 *   "select". La inyección se cierra con sentencias preparadas en el backend.
 *
 * @param {*} valor El texto tal como lo escribió la persona.
 * @param {number} [largoMaximo=LARGO_MAXIMO.MEDIO] Cuántos caracteres se conservan.
 * @returns {string} El texto limpio, o cadena vacía si no era texto.
 *
 * @example
 * limpiarTexto('  Nuevo Laredo  ') // 'Nuevo Laredo'
 */
export function limpiarTexto(valor, largoMaximo = LARGO_MAXIMO.MEDIO) {
  if (typeof valor !== "string") return ""

  return valor
    .normalize("NFC")
    .replace(CARACTERES_DE_CONTROL, "")
    .replace(CARACTERES_INVISIBLES, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, largoMaximo)
}

/**
 * Indica si un texto trae caracteres que no se ven.
 *
 * Sirve para avisarle a la persona que lo que pegó traía basura invisible, en
 * vez de limpiárselo callando y que después no entienda por qué cambió su texto.
 *
 * @param {*} valor El texto a revisar.
 * @returns {boolean} `true` si hay caracteres invisibles o de control.
 */
export function tieneInvisibles(valor) {
  if (typeof valor !== "string") return false
  CARACTERES_DE_CONTROL.lastIndex = 0
  CARACTERES_INVISIBLES.lastIndex = 0
  return CARACTERES_DE_CONTROL.test(valor) || CARACTERES_INVISIBLES.test(valor)
}

/**
 * Limpia todos los valores de texto de un objeto, sin tocar el resto.
 *
 * Se aplica en la capa de API, así que ninguna pantalla tiene que acordarse.
 * Respeta `File`, `Blob`, números, booleanos y `null`, que la capa de API ya
 * sabe serializar, y baja por objetos y arreglos anidados.
 *
 * @param {*} valor El objeto, arreglo o valor suelto a limpiar.
 * @param {number} [largoMaximo=LARGO_MAXIMO.NOTA] El límite para cada texto.
 * @returns {*} La misma forma, con los textos limpios.
 */
export function limpiarProfundo(valor, largoMaximo = LARGO_MAXIMO.NOTA) {
  if (typeof valor === "string") return limpiarTexto(valor, largoMaximo)
  if (valor instanceof File || valor instanceof Blob) return valor
  if (Array.isArray(valor)) return valor.map((v) => limpiarProfundo(v, largoMaximo))

  if (valor && typeof valor === "object") {
    return Object.fromEntries(
      Object.entries(valor).map(([clave, v]) => [clave, limpiarProfundo(v, largoMaximo)]),
    )
  }

  return valor
}
