/**
 * Con cuántas cifras se compara el número de un viaje al buscarlo.
 *
 * @type {number}
 */
export const DIGITOS_DE_VIAJE = 3

const rellenar = (numero) => String(Number(numero)).padStart(DIGITOS_DE_VIAJE, "0")

/**
 * El número con que empieza una nomenclatura, relleno con ceros.
 *
 * @param {string} [nomenclatura] La nomenclatura, como `9-US-26` o `109-MX-99T1-26`.
 * @returns {string} El número a tres cifras, o vacío si no empieza con uno.
 *
 * @example
 * numeroDeViaje("9-US-26") // "009"
 */
export function numeroDeViaje(nomenclatura) {
  const inicio = String(nomenclatura ?? "").trim().match(/^\d+/)
  return inicio ? rellenar(inicio[0]) : ""
}

/**
 * Indica si un viaje coincide con lo que se escribió en un buscador.
 *
 * La nomenclatura es larga y nadie la teclea entera. Con solo dígitos se compara
 * el número del viaje relleno con ceros: `1` encuentra el 001 —de US y de MX—,
 * no el 10 ni el 100, y tampoco el `-1T1` que venga después. Con letras o
 * guiones se busca el texto en toda la nomenclatura.
 *
 * @param {string} [nomenclatura] La nomenclatura del viaje.
 * @param {string} [busqueda] Lo escrito en el buscador.
 * @returns {boolean} `true` si coincide, o si no se escribió nada.
 *
 * @example
 * coincideViaje("1-MX-1T1-26", "001") // true
 * coincideViaje("10-US-26", "1")      // false
 */
export function coincideViaje(nomenclatura, busqueda) {
  const buscado = String(busqueda ?? "").trim().toLowerCase()
  if (!buscado) return true
  if (/^\d+$/.test(buscado)) return numeroDeViaje(nomenclatura) === rellenar(buscado)
  return String(nomenclatura ?? "").toLowerCase().includes(buscado)
}
