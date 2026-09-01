import { z } from "zod"

const idDePhp = z.coerce.string()

/**
 * Un artículo del inventario con su categoría y subcategoría.
 *
 * La API los devuelve ya cruzados con los catálogos, así que no hay que unir
 * nada del lado del cliente.
 */
export const esquemaArticulo = z.object({
  id_articulo: idDePhp,
  // NO se exige nombre. Hay artículos sin nombre en producción —uno con stock 1— y
  // la pantalla ya los pinta como "Sin nombre". Descartarlos escondería existencias
  // reales del inventario, que es peor que mostrar una fila fea. Lo que sí se hace
  // es marcarlos para que se puedan encontrar y corregir.
  nombre_articulo: z.string().catch(""),
  cantidad_stock: z.coerce.number().catch(0),
  nombre_subcategoria: z.string().catch(""),
  nombre_categoria: z.string().catch(""),
})

/**
 * Un artículo de inventario ya validado.
 *
 * @typedef {object} Articulo
 * @property {string} id_articulo Identificador.
 * @property {string} nombre_articulo Nombre del artículo.
 * @property {number} cantidad_stock Existencias.
 * @property {string} nombre_subcategoria Subcategoría a la que pertenece.
 * @property {string} nombre_categoria Categoría a la que pertenece.
 */

/**
 * Valida la lista de artículos descartando los que no cumplen lo mínimo.
 *
 * @param {Array} filas Lo que vino en la respuesta.
 * @returns {{articulos: Array.<Articulo>, descartados: number}} Los válidos y cuántos se cayeron.
 */
export function normalizarArticulos(filas = []) {
  const articulos = []
  let descartados = 0

  for (const fila of filas) {
    const resultado = esquemaArticulo.safeParse(fila)
    if (resultado.success) articulos.push(resultado.data)
    else descartados += 1
  }

  return { articulos, descartados }
}

/**
 * Indica si a un artículo le falta el nombre.
 *
 * Existen en la base y la pantalla los muestra como "Sin nombre". Marcarlos
 * permite filtrarlos para limpiarlos, sin esconder sus existencias.
 *
 * @param {Articulo} articulo El artículo a evaluar.
 * @returns {boolean} `true` si no tiene nombre.
 */
export const sinNombre = (articulo) => !String(articulo?.nombre_articulo ?? "").trim()

/**
 * Indica si un artículo está agotado.
 *
 * @param {Articulo} articulo El artículo a evaluar.
 * @returns {boolean} `true` si no quedan existencias.
 */
export const estaAgotado = (articulo) => Number(articulo?.cantidad_stock ?? 0) <= 0

/**
 * Agrupa los artículos por categoría, conservando el orden alfabético.
 *
 * @param {Array.<Articulo>} articulos Los artículos ya validados.
 * @returns {Array.<{categoria: string, articulos: Array.<Articulo>}>} Los grupos.
 */
export function agruparPorCategoria(articulos = []) {
  const grupos = new Map()

  for (const articulo of articulos) {
    const clave = articulo.nombre_categoria || "Sin categoría"
    if (!grupos.has(clave)) grupos.set(clave, [])
    grupos.get(clave).push(articulo)
  }

  return [...grupos.entries()]
    .map(([categoria, lista]) => ({ categoria, articulos: lista }))
    .sort((a, b) => a.categoria.localeCompare(b.categoria, "es"))
}
