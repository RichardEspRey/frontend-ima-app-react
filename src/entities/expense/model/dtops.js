/**
 * Los importes de los botones del alta de un DTOPS.
 *
 * @type {Array.<number>}
 */
export const MONTOS_DTOPS = [20, 13]

/**
 * La subcategoría con la que un DTOPS entra a Expense Manager.
 *
 * @type {string}
 */
export const SUBCATEGORIA_DTOPS = "Dtops"

/**
 * El país de un gasto de DTOPS.
 *
 * @type {string}
 */
export const PAIS_DTOPS = "US"

/**
 * La moneda de un gasto de DTOPS.
 *
 * @type {string}
 */
export const MONEDA_DTOPS = "USD"

const mismaEtiqueta = (fila, etiqueta) =>
  String(fila?.label ?? "").trim().toLowerCase() === etiqueta.toLowerCase()

/**
 * Busca en los catálogos el trío tipo/categoría/subcategoría de un DTOPS.
 *
 * Localiza la subcategoría «Dtops» por nombre, sube a la categoría que la
 * contiene y de ahí al tipo de gasto de esa categoría.
 *
 * @param {Array} [tipos] Catálogo `getExpenseTypes`.
 * @param {Array} [categorias] Catálogo `getCategories`.
 * @param {Array} [subcategorias] Catálogo `getAllSubcategories`.
 * @returns {(object|null)} Los tres ids del renglón, o `null` si falta alguno.
 */
export function resolverClasificacionDtops(tipos = [], categorias = [], subcategorias = []) {
  const subcategoria = subcategorias.find((fila) => mismaEtiqueta(fila, SUBCATEGORIA_DTOPS))
  if (!subcategoria) return null

  const categoria = categorias.find(
    (fila) => String(fila.value) === String(subcategoria.id_categoria),
  )
  if (!categoria) return null

  const tipo = tipos.find((fila) => String(fila.value) === String(categoria.id_tipo_gasto))
  if (!tipo) return null

  return {
    id_tipo_gasto: tipo.value,
    id_categoria_mantenimiento: categoria.value,
    id_subcategoria_mantenimiento: subcategoria.value,
  }
}

/**
 * Comprueba si un importe capturado sirve como monto de un DTOPS.
 *
 * @param {*} monto Lo que se escribió en el campo.
 * @returns {boolean} `true` si es un número mayor que cero.
 */
export function montoDtopsValido(monto) {
  const numero = Number(monto)
  return Number.isFinite(numero) && numero > 0
}

/**
 * Arma el alta de Expense Manager que corresponde a un DTOPS.
 *
 * El gasto queda en Estados Unidos y en dólares, con un solo renglón de
 * cantidad 1 y precio unitario igual al monto, descrito con el número de
 * viaje y con el DTOPS como ticket.
 *
 * @param {object} datos Lo capturado más el contexto del viaje.
 * @param {(number|string)} datos.monto Importe en dólares.
 * @param {string} datos.fecha Fecha de pago, en `AAAA-MM-DD`.
 * @param {string} datos.viaje Número de viaje, que va como descripción.
 * @param {File} [datos.archivo] El DTOPS, que se guarda como ticket.
 * @param {(string|number)} datos.usuarioId Quien sube el documento.
 * @param {object} datos.clasificacion Lo que devuelve `resolverClasificacionDtops`.
 * @returns {object} El cuerpo para `crearGasto`.
 */
export function construirGastoDtops({ monto, fecha, viaje, archivo, usuarioId, clasificacion }) {
  const importe = Number(monto).toFixed(2)

  return {
    generalData: {
      fecha_gasto: fecha,
      fecha_ticket: fecha,
      pais: PAIS_DTOPS,
      moneda: MONEDA_DTOPS,
      monto_total: importe,
      cantidad_original: importe,
      tipo_cambio: "",
      id_usuario: usuarioId,
    },
    detailsData: [
      {
        id_tipo_gasto: clasificacion.id_tipo_gasto,
        id_articulo: null,
        descripcion_articulo: viaje,
        cantidad_articulo: 1,
        precio_unitario: importe,
        id_categoria_mantenimiento: clasificacion.id_categoria_mantenimiento,
        id_subcategoria_mantenimiento: clasificacion.id_subcategoria_mantenimiento,
      },
    ],
    ticket_jpg_file: archivo,
  }
}
