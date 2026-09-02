import { normalizarTexto } from "../../../utils/texto"
import { totalUSD } from "./valores"

/**
 * El valor de los filtros que significa "no filtrar por esto".
 *
 * @type {string}
 */
export const TODOS = "All"

/**
 * Los renglones de un gasto, siempre como lista.
 *
 * @param {object} gasto El gasto.
 * @returns {Array} Sus renglones.
 */
export const renglonesDe = (gasto) => (Array.isArray(gasto?.detalles) ? gasto.detalles : [])

/**
 * Indica si alguno de los renglones de un gasto cumple algo.
 *
 * Un gasto con varios renglones entra en el filtro si **cualquiera** de ellos
 * coincide: se factura junto pero puede mezclar categorías.
 *
 * @param {object} gasto El gasto a revisar.
 * @param {Function} cumple Qué se le pide a un renglón.
 * @returns {boolean} `true` si algún renglón cumple.
 */
const algunRenglon = (gasto, cumple) => renglonesDe(gasto).some(cumple)

/**
 * Filtra los gastos con todo lo que hay puesto en la barra.
 *
 * El buscador mira el folio, el país y la moneda; la descripción se busca
 * aparte y **sin acentos**, porque se captura a mano y la mitad de las veces
 * llega sin ellos.
 *
 * @param {Array} [gastos] Los gastos a filtrar.
 * @param {object} [filtros] Lo que hay puesto en la barra.
 * @returns {Array} Los gastos que quedan.
 */
export function filtrarGastos(gastos = [], filtros = {}) {
  const {
    search = "",
    filterCountry = TODOS,
    filterType = TODOS,
    filterCategory = TODOS,
    filterSubcategory = TODOS,
    filterDescription = "",
    startDate = "",
    endDate = "",
  } = filtros

  const busqueda = String(search).trim().toLowerCase()
  const descripcion = normalizarTexto(filterDescription)

  return gastos.filter((gasto) => {
    if (busqueda) {
      const coincide =
        String(gasto?.id_gasto ?? "").includes(busqueda) ||
        String(gasto?.pais ?? "").toLowerCase().includes(busqueda) ||
        String(gasto?.moneda ?? "").toLowerCase().includes(busqueda)
      if (!coincide) return false
    }

    if (filterCountry !== TODOS && gasto?.pais !== filterCountry) return false

    if (filterType !== TODOS && !algunRenglon(gasto, (d) => d.tipo_gasto === filterType)) {
      return false
    }

    if (
      filterCategory !== TODOS &&
      !algunRenglon(gasto, (d) => d.nombre_categoria === filterCategory)
    ) {
      return false
    }

    if (
      filterSubcategory !== TODOS &&
      !algunRenglon(gasto, (d) => d.nombre_subcategoria === filterSubcategory)
    ) {
      return false
    }

    if (
      descripcion &&
      !algunRenglon(gasto, (d) => normalizarTexto(d.descripcion_articulo).includes(descripcion))
    ) {
      return false
    }

    const fecha = gasto?.fecha_gasto
    if (startDate && !(fecha >= startDate)) return false
    if (endDate && !(fecha <= endDate)) return false

    return true
  })
}

/**
 * Los países que aparecen en los gastos, para el selector.
 *
 * Salen de los datos y no de una lista fija: si mañana se captura un gasto de
 * otro país, aparece solo.
 *
 * @param {Array} [gastos] Los gastos.
 * @returns {Array.<string>} `All` y los países, ordenados.
 */
export const paisesDe = (gastos = []) => [
  TODOS,
  ...[...new Set(gastos.map((g) => g?.pais).filter(Boolean))].sort(),
]

/**
 * Las etiquetas de un catálogo, ordenadas en español.
 *
 * @param {Array} [catalogo] El catálogo con `{value, label}`.
 * @returns {Array.<string>} `All` y las etiquetas.
 */
export const etiquetasDe = (catalogo = []) => [
  TODOS,
  ...catalogo.map((fila) => fila.label).sort((a, b) => a.localeCompare(b, "es")),
]

/**
 * Las categorías que cuelgan de un tipo de gasto.
 *
 * Sin tipo elegido se ofrecen todas; con uno, solo las suyas. Es lo que evita
 * que alguien filtre por una combinación que no existe.
 *
 * @param {Array} [categorias] Todas las categorías.
 * @param {object} [tipo] El tipo elegido, con su `value`.
 * @returns {Array.<string>} `All` y las categorías que aplican.
 */
export function categoriasDeTipo(categorias = [], tipo) {
  const aplican = tipo
    ? categorias.filter((c) => String(c.id_tipo_gasto) === String(tipo.value))
    : categorias
  return etiquetasDe(aplican)
}

/**
 * Las subcategorías que cuelgan de una categoría.
 *
 * Sin categoría elegida no se ofrece ninguna: el selector se esconde en vez de
 * enseñar las 41 sueltas.
 *
 * @param {Array} [subcategorias] Todas las subcategorías.
 * @param {object} [categoria] La categoría elegida, con su `value`.
 * @returns {Array.<string>} Las subcategorías que aplican, sin `All`.
 */
export function subcategoriasDeCategoria(subcategorias = [], categoria) {
  if (!categoria) return []
  return subcategorias
    .filter((sub) => String(sub.id_categoria) === String(categoria.value))
    .map((sub) => sub.label)
    .sort((a, b) => a.localeCompare(b, "es"))
}

/**
 * Busca en un catálogo la fila que corresponde a una etiqueta.
 *
 * Los filtros guardan la etiqueta, no el id, porque es lo que se ve; para
 * encadenar tipo → categoría → subcategoría hace falta volver al id.
 *
 * @param {Array} [catalogo] El catálogo.
 * @param {string} etiqueta La etiqueta elegida.
 * @returns {(object|null)} La fila, o `null`.
 */
export const filaPorEtiqueta = (catalogo = [], etiqueta) =>
  catalogo.find((fila) => fila.label === etiqueta) ?? null

/**
 * Lo que suman los gastos visibles, en dólares y en pesos.
 *
 * `sinConversion` cuenta los que no se pudieron pasar a pesos porque no había
 * tipo de cambio: sin ese dato, el total en pesos estaría incompleto y hay que
 * decirlo en vez de enseñar una cifra que engaña.
 *
 * @param {Array} [gastos] Los gastos visibles.
 * @param {Function} aPesos Recibe un gasto y devuelve `{valor, esConvertido}`.
 * @returns {{usd: number, mxn: number, sinConversion: number}} Los totales.
 */
export function totalesDe(gastos = [], aPesos) {
  let usd = 0
  let mxn = 0
  let sinConversion = 0

  for (const gasto of gastos) {
    usd += totalUSD(gasto)
    const { valor } = aPesos(gasto)
    if (valor === null) sinConversion += 1
    else mxn += valor
  }

  return { usd, mxn, sinConversion }
}
