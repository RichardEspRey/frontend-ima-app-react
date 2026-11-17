const LLAVE = "nomenclaturas-de-viajes"
const VIGENCIA_MS = 30 * 24 * 60 * 60 * 1000
const MAXIMO = 300

const leerTodo = () => {
  try {
    const guardado = JSON.parse(localStorage.getItem(LLAVE) || "{}")
    return guardado && typeof guardado === "object" ? guardado : {}
  } catch {
    return {}
  }
}

/**
 * Las nomenclaturas de viaje que este navegador ya conoce.
 *
 * La nomenclatura de un viaje casi nunca cambia, así que se recuerda entre
 * sesiones para no pedir el viaje completo cada vez que se abre la app. Caduca a
 * los 30 días por si el viaje se editó. Nunca lanza: con el almacenamiento
 * bloqueado devuelve vacío y la app las vuelve a pedir.
 *
 * @param {number} [ahora] Momento contra el que se mide la caducidad.
 * @returns {object} `{ tripId: nomenclatura }` con las vigentes.
 */
export function leerNomenclaturas(ahora = Date.now()) {
  return Object.fromEntries(
    Object.entries(leerTodo())
      .filter(([, valor]) => Array.isArray(valor) && valor[0] && ahora - valor[1] < VIGENCIA_MS)
      .map(([id, valor]) => [id, valor[0]]),
  )
}

/**
 * Agrega nomenclaturas a lo que el navegador recuerda.
 *
 * Conserva las 300 más recientes y tira las caducadas. No guarda vacíos.
 *
 * @param {object} nuevas `{ tripId: nomenclatura }` recién obtenidas.
 * @param {number} [ahora] Momento en que se obtuvieron.
 * @returns {void}
 */
export function guardarNomenclaturas(nuevas, ahora = Date.now()) {
  const vigentes = Object.entries(leerTodo()).filter(
    ([id, valor]) => Array.isArray(valor) && ahora - valor[1] < VIGENCIA_MS && !(id in nuevas),
  )
  const todas = [
    ...vigentes,
    ...Object.entries(nuevas)
      .filter(([, texto]) => texto)
      .map(([id, texto]) => [id, [texto, ahora]]),
  ]
    .sort((a, b) => a[1][1] - b[1][1])
    .slice(-MAXIMO)

  try {
    localStorage.setItem(LLAVE, JSON.stringify(Object.fromEntries(todas)))
  } catch {
    return
  }
}
