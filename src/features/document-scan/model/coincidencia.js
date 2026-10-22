const PALABRAS_VACIAS = new Set(["inc", "llc", "co", "corp", "corporation", "company", "the", "de", "sa", "cv", "ltd"])
const PARECIDO_MINIMO = 0.5

const palabrasDe = (texto) =>
  (texto || "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !PALABRAS_VACIAS.has(w))

/**
 * Hacia qué lado de la etapa se aplica lo leído.
 *
 * @readonly
 * @enum {string}
 */
export const LADO_ESCANEO = { ORIGEN: "origin", DESTINO: "destination" }

/**
 * Los campos de la etapa que llena el lector, por lado.
 *
 * @readonly
 * @type {Object.<string, {warehouse: string, city: string, zip: string, date: string}>}
 */
export const CAMPOS_DE_ETAPA = {
  [LADO_ESCANEO.ORIGEN]: {
    warehouse: "warehouse_origin_id",
    city: "origin",
    zip: "zip_code_origin",
    date: "loading_date",
  },
  [LADO_ESCANEO.DESTINO]: {
    warehouse: "warehouse_destination_id",
    city: "destination",
    zip: "zip_code_destination",
    date: "delivery_date",
  },
}

/**
 * La bodega del catálogo que más se parece al nombre leído.
 *
 * Compara palabras, sin «Inc», «LLC» ni «S.A.»: se queda con la que comparta al
 * menos la mitad.
 *
 * @param {string} nombre El nombre leído del documento.
 * @param {Array.<{value: string, label: string}>} [opciones] El catálogo de bodegas.
 * @returns {(object|null)} La opción, o `null` si ninguna se parece lo suficiente.
 */
export function bodegaParecida(nombre, opciones = []) {
  const buscadas = new Set(palabrasDe(nombre))
  if (!buscadas.size) return null

  let mejor = null
  let mejorParecido = 0
  for (const opcion of opciones) {
    const propias = new Set(palabrasDe(opcion.label))
    if (!propias.size) continue
    const parecido = [...buscadas].filter((w) => propias.has(w)).length / Math.max(buscadas.size, propias.size)
    if (parecido > mejorParecido) {
      mejor = opcion
      mejorParecido = parecido
    }
  }
  return mejorParecido >= PARECIDO_MINIMO ? mejor : null
}

/**
 * La parada que corresponde al lado que se está llenando.
 *
 * El origen prefiere la recolección y el destino la entrega; si el documento
 * solo trae una, se usa esa.
 *
 * @param {{pickup: (object|null), delivery: (object|null)}} resultado Lo leído.
 * @param {string} lado Un valor de `LADO_ESCANEO`.
 * @returns {(object|null)} La parada.
 */
export const paradaDelLado = (resultado, lado) =>
  lado === LADO_ESCANEO.DESTINO
    ? resultado.delivery || resultado.pickup
    : resultado.pickup || resultado.delivery

/**
 * Los campos que el diálogo propone, cada uno con su casilla.
 *
 * La bodega se marca sola solo si ya existe en el catálogo: crear una nueva hay
 * que pedirlo a mano.
 *
 * @param {(object|null)} parada La parada leída.
 * @param {Array.<object>} [opciones] El catálogo de bodegas.
 * @returns {Object.<string, {value: *, checked: boolean}>} Bodega, ciudad, zip y fecha.
 */
export function camposPropuestos(parada, opciones) {
  const campo = (valor) => ({ value: valor || null, checked: Boolean(valor) })
  const existente = bodegaParecida(parada?.name, opciones)
  const bodega =
    existente || (parada?.name ? { create: true, name: parada.name, label: `Crear bodega "${parada.name}"` } : null)

  return {
    warehouse: { value: bodega, checked: Boolean(existente) },
    city: campo(parada?.city ? (parada.state ? `${parada.city}, ${parada.state}` : parada.city) : ""),
    zip: campo(parada?.zip),
    date: campo(parada?.date),
  }
}

/**
 * Lo que se aplica a la etapa: solo los campos marcados y con valor.
 *
 * @param {Object.<string, {value: *, checked: boolean}>} campos Los campos del diálogo.
 * @returns {object} `{warehouse, city, zip, date}` con lo que haya.
 */
export const valoresMarcados = (campos) =>
  Object.fromEntries(
    Object.entries(campos)
      .filter(([, { value, checked }]) => checked && value)
      .map(([clave, { value }]) => [clave, value]),
  )

/**
 * Traduce lo leído a cambios de la etapa.
 *
 * La fecha se fija al mediodía para que ningún huso horario la mueva de día.
 *
 * @param {object} valores Lo que devolvió {@link valoresMarcados}.
 * @param {string} lado Un valor de `LADO_ESCANEO`.
 * @returns {{bodegaNueva: (string|null), campoBodega: string, cambios: Array.<Array>}} La bodega a crear, si hay, y los pares `[campo, valor]`.
 */
export function cambiosDeEtapa(valores, lado) {
  const campos = CAMPOS_DE_ETAPA[lado]
  const cambios = []
  let bodegaNueva = null

  if (valores.warehouse?.create) bodegaNueva = valores.warehouse.name
  else if (valores.warehouse) cambios.push([campos.warehouse, valores.warehouse.value])
  if (valores.city) cambios.push([campos.city, valores.city])
  if (valores.zip) cambios.push([campos.zip, valores.zip])
  if (valores.date) cambios.push([campos.date, new Date(`${valores.date}T12:00:00`)])

  return { bodegaNueva, campoBodega: campos.warehouse, cambios }
}
