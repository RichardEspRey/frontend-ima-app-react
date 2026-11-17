import { z } from "zod"
import { numeroPhp, nullable } from "../../../shared/api/zodPhp"

/**
 * Países entre los que se reparten los registros.
 *
 * @readonly
 * @enum {string}
 */
export const PAIS_REGISTRO = {
  TODOS: "All",
  USA: "US",
  MEXICO: "MX",
}

/**
 * Periodos fiscales por los que se filtra el resumen de diesel.
 *
 * `SIN_PERIODO` pide los viajes con alguna carga a la que nadie le asignó
 * trimestre, que son las que faltan por clasificar. En pantalla esas cargas se
 * leen como `V`, de vacío.
 *
 * @readonly
 * @enum {string}
 */
export const PERIODO_FISCAL = {
  TODOS: "All",
  Q1: "Q1",
  Q2: "Q2",
  Q3: "Q3",
  Q4: "Q4",
  SIN_PERIODO: "V",
}

/**
 * Los periodos fiscales de las cargas de un viaje.
 *
 * El resumen los entrega juntos y separados por coma —`Q3,Q2`, o `Q2,` cuando
 * además hay cargas sin periodo— porque un viaje puede cargar en dos trimestres.
 * Compararlos como un solo texto dejaría fuera a esos viajes de cualquier filtro.
 *
 * Una carga sin periodo se devuelve como `V`, que es como la oficina la nombra.
 * Salen sin repetir y en orden —los trimestres primero y la `V` al final—, sin
 * importar cómo los haya juntado el servidor.
 *
 * @param {object} fila Un renglón del resumen de diesel.
 * @returns {Array.<string>} Los periodos; `V` es una carga sin periodo.
 *
 * @example
 * periodosDe({ periodo: "Q3,Q2," }) // ["Q2", "Q3", "V"]
 */
export function periodosDe(fila) {
  const vacio = PERIODO_FISCAL.SIN_PERIODO
  const periodos = String(fila?.periodo ?? "")
    .split(",")
    .map((periodo) => periodo.trim().toUpperCase() || vacio)

  return [...new Set(periodos)].sort((a, b) => (a === vacio) - (b === vacio) || a.localeCompare(b))
}

/**
 * Los periodos de un viaje como se leen en la tabla.
 *
 * @param {object} fila Un renglón del resumen de diesel.
 * @returns {string} Por ejemplo `Q2, V`.
 */
export const textoDePeriodos = (fila) => periodosDe(fila).join(", ")

/**
 * Un renglón del resumen: lo que un viaje lleva gastado o cargado.
 */
export const esquemaResumenViaje = z.object({
  trip_id: z.coerce.string(),
  trip_number: nullable(z.coerce.string()),
  nomenclatura: nullable(z.coerce.string()),
  country_code: nullable(z.coerce.string()),
  fecha: nullable(z.coerce.string()),
  nombre: nullable(z.coerce.string()),
  monto: numeroPhp(),
})

/**
 * Cómo se identifica un viaje en pantalla.
 *
 * La nomenclatura completa —`200-US-26`— es lo que la gente reconoce; el número
 * a secas es el respaldo para los viajes viejos que no la tienen.
 *
 * @param {object} fila Un renglón del resumen o del detalle.
 * @returns {string} El identificador visible.
 */
export const identificadorViaje = (fila) =>
  String(fila?.nomenclatura || fila?.trip_number || "")

/**
 * Filtra el resumen por país, por periodo fiscal y por lo escrito en el buscador.
 *
 * El buscador mira el viaje y el conductor, que es como se busca de verdad:
 * "el gasto de aquel viaje" o "lo que cargó fulano".
 *
 * @param {Array} [filas] Los renglones del resumen.
 * @param {object} filtros Lo que hay puesto.
 * @param {string} [filtros.pais] Un valor de `PAIS_REGISTRO`.
 * @param {string} [filtros.busqueda] Lo escrito en el buscador.
 * @param {string} [filtros.periodo] Un valor de `PERIODO_FISCAL`.
 * @returns {Array} Los renglones que quedan.
 */
export function filtrarResumen(
  filas = [],
  { pais = PAIS_REGISTRO.TODOS, busqueda = "", periodo = PERIODO_FISCAL.TODOS } = {},
) {
  const texto = String(busqueda ?? "").toLowerCase().trim()

  return filas.filter((fila) => {
    if (pais !== PAIS_REGISTRO.TODOS && fila?.country_code !== pais) return false
    if (periodo !== PERIODO_FISCAL.TODOS && !periodosDe(fila).includes(periodo)) return false
    if (!texto) return true

    return (
      identificadorViaje(fila).toLowerCase().includes(texto) ||
      String(fila?.nombre ?? "").toLowerCase().includes(texto)
    )
  })
}

/**
 * Lo que suman los renglones visibles.
 *
 * @param {Array} [filas] Los renglones.
 * @returns {number} El total.
 */
export const totalDe = (filas = []) =>
  filas.reduce((suma, fila) => suma + Number(fila?.monto ?? 0), 0)

/**
 * Cuántos registros pendientes de conciliar tiene un viaje.
 *
 * Solo el diesel los tiene: son las cargas que aún no cuadran con el estado de
 * cuenta ni con FleetOne.
 *
 * @param {object} fila Un renglón del resumen de diesel.
 * @returns {{estado: number, fleetone: number, total: number}} Los pendientes.
 */
export function pendientesDe(fila) {
  const estado = Number(fila?.state_pending_count ?? 0)
  const fleetone = Number(fila?.fleetone_pending_count ?? 0)
  return { estado, fleetone, total: estado + fleetone }
}

/**
 * Indica si una carga de diesel se capturó a mano.
 *
 * Las que llegan solas vienen del proveedor; las manuales las escribió alguien,
 * y por eso se marcan.
 *
 * @param {object} registro El registro de diesel.
 * @returns {boolean} `true` si es manual.
 */
export const esManual = (registro) =>
  Number(registro?.is_manual ?? registro?.manual_count ?? 0) > 0

/**
 * Indica si Margen toma el Fleet One de una carga de diesel o su Total.
 *
 * Cada carga lo decide por separado con su switch. Las que nunca se han movido
 * no traen el dato y cuentan como Fleet One, que es lo de siempre.
 *
 * @param {object} registro El registro de diesel.
 * @returns {boolean} `true` si Margen toma el Fleet One.
 */
export const usaFleetone = (registro) => Number(registro?.usar_fleetone ?? 1) === 1

/**
 * Valida una lista descartando lo que no cumple.
 *
 * @param {Array} filas Lo que vino en la respuesta.
 * @param {object} esquema El esquema con el que validar.
 * @returns {{validos: Array, descartados: number}} Los que pasaron y cuántos no.
 */
export function normalizarLista(filas = [], esquema) {
  const validos = []
  let descartados = 0

  for (const fila of Array.isArray(filas) ? filas : []) {
    const resultado = esquema.safeParse(fila)
    if (resultado.success) validos.push(resultado.data)
    else descartados += 1
  }

  return { validos, descartados }
}
