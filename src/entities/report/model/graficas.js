/**
 * Recorta una fecha ISO al día.
 *
 * @param {string} iso Fecha como la devuelve la API.
 * @returns {string} `YYYY-MM-DD`, o cadena vacía si no vino.
 */
export const aDia = (iso) => (iso || "").slice(0, 10)

/**
 * Recorta una fecha ISO al mes, que es como se agrupan las gráficas.
 *
 * @param {string} iso Fecha como la devuelve la API.
 * @returns {string} `YYYY-MM`, o cadena vacía si no vino.
 */
export const aMes = (iso) => (iso || "").slice(0, 7)

/**
 * Convierte `2026-08` en `ago 2026`, para los ejes.
 *
 * @param {string} clave Mes en formato `YYYY-MM`.
 * @returns {string} El mes legible, o un guion si la clave no sirve.
 */
export const etiquetaMes = (clave) => {
  const [anio, mes] = (clave || "").split("-").map(Number)
  if (!anio || !mes) return clave || "—"
  return new Date(anio, mes - 1, 1).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
  })
}

const numero = (valor) => Number(valor ?? 0)

/**
 * Normaliza las series de rate contra pagado, que comparten forma.
 *
 * La usan `chart_finances` y `chart_finances_rts`: mismas claves, distinto origen.
 *
 * @param {Array} filas Filas con `periodo`, `total_rate` y `total_paid`.
 * @returns {Array} Filas con `periodo`, `label`, `rate` y `paid`.
 */
export const normalizarFinanzas = (filas = []) =>
  filas.map((fila) => ({
    periodo: fila.periodo,
    label: etiquetaMes(fila.periodo),
    rate: numero(fila.total_rate),
    paid: numero(fila.total_paid),
  }))

/**
 * Normaliza el costo de mantenimiento por mes.
 *
 * @param {Array} filas Filas con `periodo` y `total`.
 * @returns {Array} Filas con `periodo`, `label` y `total`.
 */
export const normalizarMantenimiento = (filas = []) =>
  filas.map((fila) => ({
    periodo: fila.periodo,
    label: etiquetaMes(fila.periodo),
    total: numero(fila.total),
  }))

/**
 * Agrupa las cargas de diesel por mes, sumando monto y fleetone.
 *
 * La API devuelve una fila por carga; la gráfica es mensual, así que la suma
 * ocurre aquí y no en el JSX. Es lógica de negocio, no de presentación.
 *
 * @param {Array} filas Cargas con `fecha`, `monto`, `galones` y `fleetone`.
 * @returns {Array} Una fila por mes, ordenada cronológicamente.
 */
export const agruparDieselPorMes = (filas = []) => {
  const porMes = {}

  for (const fila of filas) {
    const clave = aMes(fila.fecha) || "—"
    if (!porMes[clave]) porMes[clave] = { month: clave, label: clave, monto: 0, fleetone: 0 }
    porMes[clave].monto += numero(fila.monto)
    porMes[clave].fleetone += numero(fila.fleetone)
  }

  return Object.values(porMes).sort((a, b) => a.label.localeCompare(b.label))
}

/**
 * Se queda con los últimos N meses de una serie ya ordenada.
 *
 * @param {Array} serie Filas ordenadas cronológicamente.
 * @param {number} meses Cuántos meses conservar.
 * @returns {Array} Los últimos `meses` elementos.
 */
export const ultimosMeses = (serie = [], meses) =>
  meses > 0 ? serie.slice(-meses) : serie
