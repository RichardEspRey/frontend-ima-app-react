import { z } from "zod"
import { numeroPhp } from "../../../shared/api/zodPhp"

/**
 * Millas recorridas y galones cargados en un estado, dentro de un periodo.
 *
 * `periodo` es el trimestre (`Q1`–`Q4`) y llega vacío en los registros de diesel
 * a los que nadie les asignó uno.
 */
export const esquemaPeriodoIfta = z.object({
  estado: z.string().catch(""),
  periodo: z.string().catch(""),
  total_millas: numeroPhp(),
  galones: numeroPhp(),
  trip_year: z.string().catch(""),
})

/**
 * Millas totales por estado, con cuántos viajes las produjeron.
 */
export const esquemaTotalEstado = z.object({
  state: z.string().catch(""),
  total: numeroPhp(),
  trips: numeroPhp(),
})

/**
 * Rendimiento de un estado: millas recorridas por galón cargado.
 *
 * Es el número que importa para IFTA, porque el impuesto se paga por la
 * diferencia entre dónde se recorrió y dónde se compró el combustible.
 *
 * @param {object} registro El registro del estado.
 * @returns {number} Millas por galón, o 0 si no se cargó combustible ahí.
 */
export function rendimientoEstado(registro) {
  const galones = Number(registro?.galones ?? 0)
  if (galones <= 0) return 0
  return Number(registro?.total_millas ?? 0) / galones
}

/**
 * Suma millas y galones de una lista de estados.
 *
 * @param {Array} registros Los registros a sumar.
 * @returns {{millas: number, galones: number, estados: number}} Los totales.
 */
export function totalesIfta(registros = []) {
  return {
    millas: registros.reduce((suma, r) => suma + Number(r.total_millas ?? 0), 0),
    galones: registros.reduce((suma, r) => suma + Number(r.galones ?? 0), 0),
    estados: registros.length,
  }
}

/**
 * Agrupa los registros por año fiscal, del más reciente al más antiguo.
 *
 * @param {Array} registros Los registros a agrupar.
 * @returns {Array.<{anio: string, registros: Array}>} Los grupos.
 */
export function agruparPorAnio(registros = []) {
  const grupos = new Map()

  for (const registro of registros) {
    const clave = registro.trip_year || "—"
    if (!grupos.has(clave)) grupos.set(clave, [])
    grupos.get(clave).push(registro)
  }

  return [...grupos.entries()]
    .map(([anio, lista]) => ({ anio, registros: lista }))
    .sort((a, b) => b.anio.localeCompare(a.anio))
}

/**
 * Valida una lista con el esquema dado, descartando lo que no cumple.
 *
 * @param {Array} filas Lo que vino en la respuesta.
 * @param {object} esquema Esquema zod con el que validar cada fila.
 * @returns {{validos: Array, descartados: number}} Los que pasaron y cuántos no.
 */
export function normalizarLista(filas = [], esquema) {
  const validos = []
  let descartados = 0

  for (const fila of filas) {
    const resultado = esquema.safeParse(fila)
    if (resultado.success) validos.push(resultado.data)
    else descartados += 1
  }

  return { validos, descartados }
}

/**
 * Valor del filtro de periodo que pide los registros sin periodo. No puede ser
 * `""`, porque ese valor ya significa «todos».
 *
 * @type {string}
 */
export const PERIODO_VACIO = "__vacio__"

/**
 * Cómo se muestra un periodo; el vacío se nombra para que se pueda leer y filtrar.
 *
 * @param {string} [periodo] El periodo, por ejemplo `Q1`.
 * @returns {string} El periodo o `Vacío`.
 */
export const etiquetaPeriodo = (periodo) => periodo || "Vacío"

/**
 * El año en dos dígitos, como lo guarda la base y lo espera `IFTA.php`.
 *
 * @param {string} [anio] El año capturado, de dos o cuatro dígitos.
 * @returns {string} Los dos últimos dígitos, o `""` si no hay año.
 */
export const anioCorto = (anio) => String(anio ?? "").trim().slice(-2)

/**
 * Indica si el año capturado ya se puede consultar: vacío, que es «todos», o
 * escrito completo. A medio teclear —`2`, `202`— todavía no es un año.
 *
 * @param {string} [anio] El año capturado.
 * @returns {boolean} `true` si se puede pedir con él.
 */
export function anioConsultable(anio) {
  const texto = String(anio ?? "").trim()
  return texto.length === 0 || texto.length === 2 || texto.length === 4
}

/**
 * Los filtros de los totales por estado, en palabras, para el encabezado del PDF.
 *
 * @param {object} filtros Lo capturado en pantalla, igual que en `filtrosTotalesIfta`.
 * @param {boolean} filtros.porViajes Si se filtra por viajes en vez de por fechas.
 * @param {string} [filtros.desde] Fecha inicial, `YYYY-MM-DD`.
 * @param {string} [filtros.hasta] Fecha final, `YYYY-MM-DD`.
 * @param {string} [filtros.viajeDesde] Primer número de viaje.
 * @param {string} [filtros.viajeHasta] Último número de viaje.
 * @param {string} [filtros.anio] Año del rango de viajes.
 * @returns {string} Una línea como `Viajes: del viaje 200, al viaje 210, año 2026`.
 */
export function describirFiltrosTotales({ porViajes, desde, hasta, viajeDesde, viajeHasta, anio }) {
  if (porViajes) {
    const partes = [
      [String(viajeDesde ?? "").trim(), "del viaje"],
      [String(viajeHasta ?? "").trim(), "al viaje"],
      [String(anio ?? "").trim(), "año"],
    ]
      .filter(([valor]) => valor)
      .map(([valor, etiqueta]) => `${etiqueta} ${valor}`)
    return partes.length ? `Viajes: ${partes.join(", ")}` : "Viajes: todos"
  }

  if (!desde && !hasta) return "Fechas: todas"
  return `Fechas: ${desde || "inicio"} a ${hasta || "hoy"}`
}

/**
 * Los filtros de los registros por periodo, en palabras, para el encabezado del PDF.
 *
 * @param {object} filtros Los mismos que recibe `filtrarPeriodos`.
 * @param {string} [filtros.periodo] El periodo, o `PERIODO_VACIO`.
 * @param {string} [filtros.estado] Texto buscado en el estado.
 * @param {string} [filtros.anio] El año capturado.
 * @returns {string} Una línea como `Periodo: Q2   ·   Estado: TX   ·   Año: 2026`.
 */
export function describirFiltrosPeriodos({ periodo, estado, anio } = {}) {
  const estadoBuscado = String(estado ?? "").trim().toUpperCase()
  const anioBuscado = String(anio ?? "").trim()
  return [
    `Periodo: ${!periodo ? "todos" : periodo === PERIODO_VACIO ? "Vacío" : periodo}`,
    `Estado: ${estadoBuscado || "todos"}`,
    `Año: ${anioBuscado || "todos"}`,
  ].join("   ·   ")
}

/**
 * Los filtros de los totales por estado, listos para mandarse.
 *
 * Se filtra por rango de fechas o por rango de viajes, nunca por ambos. El
 * número de viaje se reinicia cada año, así que el rango de viajes lleva el año,
 * en dos dígitos como lo guarda la base. Los vacíos se omiten: mandarlos
 * cambiaría el resultado en vez de dejarlo sin filtrar.
 *
 * @param {object} filtros Lo capturado en pantalla.
 * @param {boolean} filtros.porViajes Si se filtra por viajes en vez de por fechas.
 * @param {string} [filtros.desde] Fecha inicial, `YYYY-MM-DD`.
 * @param {string} [filtros.hasta] Fecha final, `YYYY-MM-DD`.
 * @param {string} [filtros.viajeDesde] Primer número de viaje.
 * @param {string} [filtros.viajeHasta] Último número de viaje.
 * @param {string} [filtros.anio] Año del rango de viajes, de dos o cuatro dígitos.
 * @returns {object} Los campos con valor, con los nombres que espera `IFTA.php`.
 */
export function filtrosTotalesIfta({ porViajes, desde, hasta, viajeDesde, viajeHasta, anio }) {
  const campos = porViajes
    ? {
        trip_from: String(viajeDesde ?? "").trim(),
        trip_to: String(viajeHasta ?? "").trim(),
        trip_year: anioCorto(anio),
      }
    : { date_from: desde ?? "", date_to: hasta ?? "" }

  return Object.fromEntries(Object.entries(campos).filter(([, valor]) => valor))
}

/**
 * Las millas de un estado después del ajuste manual. El ajuste suma si es
 * positivo y resta si es negativo; lo que no es número no cambia nada.
 *
 * @param {{state: string, total: number}} fila El total del estado.
 * @param {Object.<string, string>} [ajustes] Ajuste capturado por estado.
 * @returns {number} Las millas finales.
 */
export function totalConAjuste(fila, ajustes = {}) {
  return Number(fila.total ?? 0) + (parseFloat(ajustes[fila.state]) || 0)
}

/**
 * Los periodos que aparecen en los registros, ordenados y sin el vacío, que se
 * ofrece aparte con `PERIODO_VACIO`.
 *
 * @param {Array} registros Los registros de periodos.
 * @returns {Array.<string>} Los periodos distintos.
 */
export function periodosDisponibles(registros = []) {
  return [...new Set(registros.map((r) => r.periodo).filter(Boolean))].sort()
}

/**
 * Filtra los registros de periodos por periodo, estado y año.
 *
 * @param {Array} registros Los registros de periodos.
 * @param {object} filtros Los filtros; uno vacío no filtra.
 * @param {string} [filtros.periodo] El periodo, o `PERIODO_VACIO` para los que no tienen.
 * @param {string} [filtros.estado] Texto que debe contener el estado.
 * @param {string} [filtros.anio] Año, de dos o cuatro dígitos; `trip_year` viene en dos.
 * @returns {Array} Los registros que pasan.
 */
export function filtrarPeriodos(registros = [], { periodo, estado, anio } = {}) {
  const estadoBuscado = String(estado ?? "").trim().toLowerCase()
  const anioBuscado = anioCorto(anio)
  return registros.filter((r) => {
    const pasaPeriodo = !periodo || (periodo === PERIODO_VACIO ? !r.periodo : r.periodo === periodo)
    const pasaEstado = !estadoBuscado || r.estado.toLowerCase().includes(estadoBuscado)
    const pasaAnio = !anioBuscado || anioCorto(r.trip_year) === anioBuscado
    return pasaPeriodo && pasaEstado && pasaAnio
  })
}

/**
 * Identifica un registro de periodos para guardar los viajes que lo componen.
 *
 * @param {{estado: string, periodo: string, trip_year: string}} registro El registro.
 * @returns {string} `estado|periodo|año`.
 */
export const llavePeriodo = (registro) => `${registro.estado}|${registro.periodo}|${registro.trip_year}`
