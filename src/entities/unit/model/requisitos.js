import { z } from "zod"
import { numeroPhp, nullable } from "../../../shared/api/zodPhp"

/**
 * Estado en que puede estar un documento del expediente.
 *
 * @readonly
 * @enum {string}
 */
export const ESTADO_DOCUMENTO = {
  FALTANTE: "faltante",
  VENCIDO: "vencido",
  POR_VENCER: "por_vencer",
  VIGENTE: "vigente",
  TEXTO: "texto",
}

/**
 * Con cuántos días de antelación se avisa de un vencimiento.
 *
 * @type {number}
 */
export const DIAS_AVISO_VENCIMIENTO = 30

/**
 * Categorías en que se agrupan los requisitos, con su color.
 *
 * Lo que no cae en ninguna se pinta con el color de "Otros"; las categorías las
 * escribe quien crea el requisito, así que puede aparecer cualquier texto.
 *
 * @readonly
 * @enum {string}
 */
export const COLOR_CATEGORIA = {
  USA: "#1976d2",
  MEX: "#388e3c",
}

/**
 * El color con el que se subraya una categoría de requisitos.
 *
 * @param {string} categoria La categoría del requisito.
 * @returns {string} Su color, o el ámbar de "Otros".
 */
export const colorCategoria = (categoria) => COLOR_CATEGORIA[categoria] ?? "#f59e0b"

/**
 * Un requisito del expediente: qué documento se le pide a una unidad.
 *
 * `oculto_en_tabla` solo existe en camiones y conductores. En cajas la columna
 * no está en la base, así que llega como ausente y se trata como visible.
 */
export const esquemaRequisito = z.object({
  id_requisito: z.coerce.string().catch(""),
  key_name: z.string(),
  label: z.string().catch(""),
  categoria: z.string().catch("Otros"),
  tipo: z.enum(["file", "text"]).catch("file"),
  tiene_vencimiento: numeroPhp().catch(0),
  activo: numeroPhp().catch(1),
  oculto_en_tabla: numeroPhp().catch(0),
})

/**
 * Un documento subido contra un requisito.
 */
export const esquemaDocumento = z.object({
  url_pdf: nullable(z.string()),
  valor_texto: nullable(z.string()),
  fecha_vencimiento: nullable(z.string()),
})

/**
 * Indica si una fecha es la "fecha cero" de MySQL.
 *
 * `0000-00-00` significa **sin fecha**, no una fecha antigua. Hay 158
 * documentos de conductores guardados así, y `new Date("0000-00-00")` no es una
 * fecha válida: la resta daba `NaN`, ninguna comparación se cumplía y los 158
 * se pintaban en verde con la leyenda "Vigente hasta 0000-00-00".
 *
 * @param {*} fecha La fecha a revisar.
 * @returns {boolean} `true` si es la fecha cero.
 */
export const esFechaCero = (fecha) => String(fecha ?? "").startsWith("0000")

/**
 * La fecha de vencimiento de un documento, o `null` si no tiene una de verdad.
 *
 * @param {object} [documento] El documento a revisar.
 * @returns {(string|null)} La fecha, o `null`.
 */
export function fechaVencimiento(documento) {
  const fecha = documento?.fecha_vencimiento
  return !fecha || esFechaCero(fecha) ? null : fecha
}

/**
 * Cuántos días faltan para una fecha.
 *
 * @param {string} fecha La fecha de vencimiento.
 * @param {Date} [hoy] Con qué día comparar; por omisión, hoy.
 * @returns {(number|null)} Los días que faltan, negativo si ya pasó, o `null` si no hay fecha.
 */
export function diasPara(fecha, hoy = new Date()) {
  if (!fecha || esFechaCero(fecha)) return null
  const objetivo = new Date(fecha)
  if (Number.isNaN(objetivo.getTime())) return null
  return Math.floor((objetivo - hoy) / (1000 * 60 * 60 * 24))
}

/**
 * En qué estado está un documento respecto a su requisito.
 *
 * Un requisito de texto no vence: o tiene valor o falta. Uno de archivo con
 * vencimiento pasa por vencido, por vencer y vigente según la fecha.
 *
 * @param {object} requisito El requisito del expediente.
 * @param {object} [documento] Lo que hay subido, si hay algo.
 * @param {Date} [hoy] Con qué día comparar; por omisión, hoy.
 * @returns {{estado: string, dias: (number|null), fecha: (string|null)}} El estado y su porqué.
 */
export function estadoDocumento(requisito, documento, hoy = new Date()) {
  if (requisito?.tipo === "text") {
    return {
      estado: documento?.valor_texto ? ESTADO_DOCUMENTO.TEXTO : ESTADO_DOCUMENTO.FALTANTE,
      dias: null,
      fecha: null,
    }
  }

  if (!documento || (!documento.url_pdf && !documento.valor_texto)) {
    return { estado: ESTADO_DOCUMENTO.FALTANTE, dias: null, fecha: null }
  }

  const fecha = fechaVencimiento(documento)
  const vence = Number(requisito?.tiene_vencimiento) === 1 && fecha
  if (!vence) return { estado: ESTADO_DOCUMENTO.VIGENTE, dias: null, fecha }

  const dias = diasPara(fecha, hoy)
  if (dias === null) return { estado: ESTADO_DOCUMENTO.VIGENTE, dias: null, fecha }
  if (dias < 0) return { estado: ESTADO_DOCUMENTO.VENCIDO, dias, fecha }
  if (dias <= DIAS_AVISO_VENCIMIENTO) return { estado: ESTADO_DOCUMENTO.POR_VENCER, dias, fecha }
  return { estado: ESTADO_DOCUMENTO.VIGENTE, dias, fecha }
}

/**
 * Los requisitos que se muestran como columna de la tabla.
 *
 * En cajas la visibilidad no se puede guardar —el backend no tiene la columna—
 * así que ahí se pasa la lista de ocultas que vive solo en la pantalla.
 *
 * @param {Array} [requisitos] Todos los requisitos.
 * @param {Array} [ocultasLocales] Claves ocultas solo en esta sesión.
 * @returns {Array} Los requisitos visibles.
 */
export function requisitosVisibles(requisitos = [], ocultasLocales = []) {
  return requisitos.filter(
    (req) => !Number(req?.oculto_en_tabla) && !ocultasLocales.includes(req?.key_name),
  )
}

/**
 * Las categorías presentes en un expediente, sin repetir y en orden de aparición.
 *
 * @param {Array} [requisitos] Los requisitos del expediente.
 * @returns {Array.<string>} Las categorías.
 */
export const categoriasDe = (requisitos = []) => [
  ...new Set(requisitos.map((req) => req?.categoria).filter(Boolean)),
]

/**
 * Los requisitos de una categoría.
 *
 * @param {Array} [requisitos] Los requisitos del expediente.
 * @param {string} categoria La categoría a filtrar.
 * @returns {Array} Los requisitos de esa categoría.
 */
export const requisitosDeCategoria = (requisitos = [], categoria) =>
  requisitos.filter((req) => req?.categoria === categoria)

/**
 * Cuenta el estado del expediente de una unidad.
 *
 * Sirve para saber de un vistazo si a una unidad le falta papeleo, sin abrir su
 * ficha.
 *
 * @param {Array} [requisitos] Los requisitos exigidos.
 * @param {object} [documentos] Lo que la unidad tiene subido.
 * @param {Date} [hoy] Con qué día comparar.
 * @returns {object} Cuántos hay en cada estado de `ESTADO_DOCUMENTO`.
 */
export function resumenExpediente(requisitos = [], documentos = {}, hoy = new Date()) {
  const conteo = Object.fromEntries(Object.values(ESTADO_DOCUMENTO).map((e) => [e, 0]))

  for (const requisito of requisitos) {
    const { estado } = estadoDocumento(requisito, documentos?.[requisito?.key_name], hoy)
    conteo[estado] += 1
  }

  return conteo
}

/**
 * Valida los requisitos descartando los que no cumplen.
 *
 * @param {Array} filas Lo que vino en la respuesta.
 * @returns {{requisitos: Array, descartados: number}} Los válidos y cuántos se cayeron.
 */
export function normalizarRequisitos(filas = []) {
  const requisitos = []
  let descartados = 0

  for (const fila of Array.isArray(filas) ? filas : []) {
    const resultado = esquemaRequisito.safeParse(fila)
    if (resultado.success) requisitos.push(resultado.data)
    else descartados += 1
  }

  return { requisitos, descartados }
}
