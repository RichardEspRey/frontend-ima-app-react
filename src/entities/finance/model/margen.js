/**
 * Los meses abreviados, como se rotulan en las gráficas.
 *
 * @type {Array.<string>}
 */
export const MESES_CORTOS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]

/**
 * Los 12 meses que terminan en el mes de `hoy`, del más viejo al más reciente.
 *
 * @param {Date} [hoy] La fecha de referencia.
 * @returns {Array.<{anio: number, mes: number}>} Los meses, con `mes` de 1 a 12.
 */
export function mesesMoviles(hoy = new Date()) {
  return Array.from({ length: 12 }, (_, i) => {
    const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - (11 - i), 1)
    return { anio: fecha.getFullYear(), mes: fecha.getMonth() + 1 }
  })
}

/**
 * Qué porcentaje es `parte` de `total`, o `null` si no hay total.
 *
 * @param {number} parte La parte.
 * @param {number} total El total.
 * @returns {?number} El porcentaje.
 */
const porcentaje = (parte, total) => (total > 0 ? (parte / total) * 100 : null)

/**
 * Suma los viajes de cada mes por su fecha de creación.
 *
 * Los porcentajes salen de los totales del mes, no del promedio de cada viaje:
 * un viaje chico no pesa lo mismo que uno grande.
 *
 * @param {Array.<object>} viajes Los viajes ya calculados de Margen.
 * @param {Array.<{anio: number, mes: number}>} meses Los meses a mostrar.
 * @returns {Array.<object>} Un renglón por mes, con `etiqueta`, `viajes`, `tarifa`,
 *   `diesel`, `pagoDriver`, `margen`, `pctDiesel` y `pctDriver`.
 */
export function margenPorMes(viajes = [], meses = []) {
  const indice = new Map(meses.map(({ anio, mes }, i) => [`${anio}-${mes}`, i]))

  const renglones = meses.map(({ anio, mes }) => ({
    etiqueta: `${MESES_CORTOS[mes - 1]} ${String(anio).slice(2)}`,
    viajes: 0,
    tarifa: 0,
    diesel: 0,
    pagoDriver: 0,
    margen: 0,
  }))

  for (const viaje of viajes) {
    const [anio, mes] = String(viaje?.creation_date ?? "").split("-").map(Number)
    const i = indice.get(`${anio}-${mes}`)
    if (i === undefined) continue

    const renglon = renglones[i]
    renglon.viajes += 1
    renglon.tarifa += Number(viaje.total_rate ?? 0)
    renglon.diesel += Number(viaje.diesel ?? 0)
    renglon.pagoDriver += Number(viaje.driver_pay ?? 0)
    renglon.margen += Number(viaje.totalMargin ?? 0)
  }

  return renglones.map((renglon) => ({
    ...renglon,
    pctDiesel: porcentaje(renglon.diesel, renglon.tarifa),
    pctDriver: porcentaje(renglon.pagoDriver, renglon.tarifa),
  }))
}
