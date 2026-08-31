/**
 * Indica si un valor debe tratarse como vacío al ordenar.
 *
 * @param {*} valor Valor a evaluar.
 * @returns {boolean} `true` si es `null`, `undefined` o cadena vacía.
 */
export const esVacio = (valor) => valor === null || valor === undefined || valor === ""

/**
 * Compara dos valores del mismo campo.
 *
 * Los números se comparan como números; el resto como texto en español con
 * `numeric: true`, para que "Caja 10" quede después de "Caja 9" y no antes.
 *
 * @param {*} a Primer valor.
 * @param {*} b Segundo valor.
 * @returns {number} Negativo, cero o positivo, como espera `Array.sort`.
 */
export const compararValores = (a, b) => {
  if (typeof a === "number" && typeof b === "number") return a - b
  return String(a).localeCompare(String(b), "es", { numeric: true, sensitivity: "base" })
}

/**
 * Calcula el siguiente estado al hacer clic en una cabecera de columna.
 *
 * El ciclo tiene tres pasos: ascendente, descendente y sin orden. El tercero
 * importa: permite volver al orden natural que trae la API sin recargar.
 *
 * @param {{campo: (string|null), dir: (string|null)}} actual Orden vigente.
 * @param {string} campo Columna sobre la que se hizo clic.
 * @returns {{campo: (string|null), dir: (string|null)}} El orden siguiente.
 */
export const siguienteOrden = (actual, campo) => {
  if (actual?.campo !== campo) return { campo, dir: "asc" }
  if (actual.dir === "asc") return { campo, dir: "desc" }
  return { campo: null, dir: null }
}

/**
 * Ordena una lista según un orden y un mapa de accesores.
 *
 * Los valores vacíos van **siempre al final**, suban o bajen los demás: una fila
 * sin fecha estorba igual arriba que abajo, y verlas agrupadas es más útil que
 * verlas saltar de extremo con cada clic.
 *
 * No muta la lista original.
 *
 * @param {Array} filas Lista a ordenar.
 * @param {{campo: (string|null), dir: (string|null)}} orden Campo y dirección.
 * @param {object} accesores Mapa `campo -> (fila, contexto) => valor`.
 * @param {*} [contexto] Segundo argumento que reciben los accesores, por ejemplo
 *   el tipo de cambio cuando la columna es un total convertido.
 * @returns {Array} Una lista nueva, ordenada; la original si el campo no existe.
 */
export const ordenarPor = (filas, orden, accesores, contexto) => {
  const accesor = accesores?.[orden?.campo]
  if (!accesor) return filas

  const factor = orden.dir === "asc" ? 1 : -1
  return [...filas].sort((a, b) => {
    const va = accesor(a, contexto)
    const vb = accesor(b, contexto)
    const aVacio = esVacio(va)
    const bVacio = esVacio(vb)
    if (aVacio || bVacio) return aVacio && bVacio ? 0 : aVacio ? 1 : -1
    return factor * compararValores(va, vb)
  })
}
