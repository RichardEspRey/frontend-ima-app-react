import { z } from "zod"

/**
 * Regiones a las que pertenece un requisito documental.
 *
 * @readonly
 * @enum {string}
 */
export const REGION = {
  MEXICO: "MEX",
  USA: "USA",
}

/**
 * Cómo se captura un requisito: subiendo un archivo o escribiendo un valor.
 *
 * @readonly
 * @enum {string}
 */
export const TIPO_REQUISITO = {
  ARCHIVO: "file",
  TEXTO: "text",
}

/**
 * Días de antelación con los que un vencimiento se considera próximo.
 *
 * @type {number}
 */
export const DIAS_POR_VENCER = 30

const booleanoDePhp = z.coerce.number().catch(0).transform((n) => n === 1)

/**
 * Un requisito documental: qué documento hace falta y cómo se captura.
 */
export const esquemaRequisito = z.object({
  id_requisito: z.coerce.string(),
  key_name: z.string().min(1),
  label: z.string().catch(""),
  region: z.string().catch(REGION.MEXICO),
  tipo: z.string().catch(TIPO_REQUISITO.ARCHIVO),
  tiene_vencimiento: booleanoDePhp,
  activo: booleanoDePhp,
})

/**
 * Un requisito documental ya validado.
 *
 * @typedef {object} Requisito
 * @property {string} id_requisito Identificador.
 * @property {string} key_name Clave con la que se indexa su valor.
 * @property {string} label Nombre visible.
 * @property {string} region `MEX` o `USA`.
 * @property {string} tipo `file` o `text`.
 * @property {boolean} tiene_vencimiento Si se le controla fecha de caducidad.
 * @property {boolean} activo Si sigue vigente.
 */

/**
 * El valor capturado de un requisito.
 *
 * Los tres campos son opcionales: un requisito de texto no trae `url_pdf`, y uno
 * sin vencimiento no trae fecha.
 */
export const esquemaValor = z.object({
  tipo_documento: z.string().catch(""),
  fecha_vencimiento: z.union([z.string(), z.null()]).catch(null),
  url_pdf: z.union([z.string(), z.null()]).catch(null),
  valor_texto: z.union([z.string(), z.null()]).catch(null),
})

/**
 * Estado de un documento respecto a su vencimiento.
 *
 * @readonly
 * @enum {string}
 */
export const ESTADO_DOCUMENTO = {
  SIN_CAPTURAR: "sin_capturar",
  VIGENTE: "vigente",
  POR_VENCER: "por_vencer",
  VENCIDO: "vencido",
}

/**
 * Días que faltan para una fecha, contando desde hoy.
 *
 * Compara a medianoche para que un documento que vence hoy dé 0 y no un número
 * negativo por unas horas.
 *
 * @param {(string|null)} fecha Fecha en formato `YYYY-MM-DD`.
 * @param {Date} [hoy] Fecha de referencia; existe para poder probarlo.
 * @returns {(number|null)} Los días restantes, o `null` si no hay fecha válida.
 */
export function diasRestantes(fecha, hoy = new Date()) {
  if (!fecha) return null
  const objetivo = new Date(`${String(fecha).slice(0, 10)}T00:00:00`)
  if (Number.isNaN(objetivo.getTime())) return null

  const referencia = new Date(hoy)
  referencia.setHours(0, 0, 0, 0)

  return Math.round((objetivo - referencia) / 86400000)
}

/**
 * Clasifica un documento según su captura y su vencimiento.
 *
 * Un requisito sin control de vencimiento nunca sale como vencido: solo importa
 * si está capturado o no.
 *
 * @param {Requisito} requisito El requisito a evaluar.
 * @param {object} [valor] Lo capturado para ese requisito.
 * @param {Date} [hoy] Fecha de referencia; existe para poder probarlo.
 * @returns {string} Un valor de `ESTADO_DOCUMENTO`.
 */
export function estadoDocumento(requisito, valor, hoy = new Date()) {
  const capturado = Boolean(valor?.url_pdf || valor?.valor_texto)
  if (!capturado) return ESTADO_DOCUMENTO.SIN_CAPTURAR
  if (!requisito?.tiene_vencimiento) return ESTADO_DOCUMENTO.VIGENTE

  const dias = diasRestantes(valor?.fecha_vencimiento, hoy)
  if (dias === null) return ESTADO_DOCUMENTO.VIGENTE
  if (dias < 0) return ESTADO_DOCUMENTO.VENCIDO
  if (dias <= DIAS_POR_VENCER) return ESTADO_DOCUMENTO.POR_VENCER
  return ESTADO_DOCUMENTO.VIGENTE
}

/**
 * Valida los requisitos y deja los valores listos para consultarlos por clave.
 *
 * `valores` llega como **objeto indexado por `key_name`**, no como arreglo: es lo
 * que devuelve `IMA_Docsv2.php` y tratarlo como lista da siempre vacío.
 *
 * @param {object} respuesta Lo que devolvió la API.
 * @param {Array} [respuesta.requisitos] Los requisitos.
 * @param {object} [respuesta.valores] Los valores, indexados por `key_name`.
 * @returns {{requisitos: Array.<Requisito>, valores: object, descartados: number}} Lo normalizado.
 */
export function normalizarDocumentos({ requisitos = [], valores = {} } = {}) {
  const validos = []
  let descartados = 0

  for (const fila of requisitos) {
    const resultado = esquemaRequisito.safeParse(fila)
    if (resultado.success) validos.push(resultado.data)
    else descartados += 1
  }

  const valoresValidados = {}
  for (const [clave, valor] of Object.entries(valores ?? {})) {
    const resultado = esquemaValor.safeParse(valor)
    if (resultado.success) valoresValidados[clave] = resultado.data
  }

  return { requisitos: validos, valores: valoresValidados, descartados }
}

/**
 * Separa los requisitos activos por región, que es como se pintan.
 *
 * @param {Array.<Requisito>} requisitos Los requisitos ya validados.
 * @returns {{mexico: Array.<Requisito>, usa: Array.<Requisito>}} Los activos de cada región.
 */
export function porRegion(requisitos = []) {
  const activos = requisitos.filter((r) => r.activo)
  return {
    mexico: activos.filter((r) => r.region === REGION.MEXICO),
    usa: activos.filter((r) => r.region === REGION.USA),
  }
}
