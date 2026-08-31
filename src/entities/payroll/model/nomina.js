import { z } from "zod"
import { TIPO_NOMINA } from "../../personal/model/personal"

/**
 * Estados de un periodo de nómina.
 *
 * `Pendiente` admite cambios; `Autorizado` cierra el corte y ya no se le pueden
 * agregar pagos. Es una operación irreversible desde la app.
 *
 * @readonly
 * @enum {string}
 */
export const ESTADO_PERIODO = {
  PENDIENTE: "Pendiente",
  AUTORIZADO: "Autorizado",
}

const numeroDePhp = z.coerce.number().catch(0)
const idDePhp = z.coerce.string()

/**
 * Normaliza el tipo de nómina igual que en `entities/personal`: `MX`, o `US`
 * para todo lo demás. Está aquí también porque `pagos_admin.php` es otro
 * endpoint y podría devolver el campo con otra forma.
 */
const tipoNomina = z
  .string()
  .catch(TIPO_NOMINA.MX)
  .transform((valor) => (valor === TIPO_NOMINA.MX ? TIPO_NOMINA.MX : TIPO_NOMINA.US))

/**
 * Semana de nómina, tal como la devuelve `pagos_admin.php` · `get_weeks`.
 *
 * `fecha_corte` llega como `"2026-08-31 00:00:00"` y se recorta al día: la
 * pantalla solo muestra la fecha, y el código anterior hacía
 * `fecha_corte.split(' ')[0]` sin comprobar que existiera — con un corte nulo,
 * la tabla entera reventaba.
 */
export const esquemaPeriodo = z.object({
  period_id: idDePhp,
  semana: numeroDePhp,
  anio: numeroDePhp,
  fecha_corte: z.string().catch("").transform((valor) => valor.split(" ")[0] ?? ""),
  emps_mx: numeroDePhp,
  total_mx: numeroDePhp,
  emps_us: numeroDePhp,
  total_us: numeroDePhp,
  estado: z.string().catch(ESTADO_PERIODO.PENDIENTE),
})

/**
 * Un periodo de nómina ya validado.
 *
 * @typedef {object} Periodo
 * @property {string} period_id Identificador del periodo.
 * @property {number} semana Número de semana del año.
 * @property {number} anio Año al que pertenece la semana.
 * @property {string} fecha_corte Fecha de corte, solo el día (`YYYY-MM-DD`).
 * @property {number} emps_mx Empleados en nómina mexicana.
 * @property {number} total_mx Total a pagar en pesos.
 * @property {number} emps_us Empleados en nómina estadounidense.
 * @property {number} total_us Total a pagar en dólares.
 * @property {string} estado `Pendiente` o `Autorizado`.
 */

/**
 * Renglón del desglose de una semana, de `pagos_admin.php` · `get_details`.
 */
export const esquemaDetallePago = z.object({
  nombre: z.string().min(1),
  puesto: z.string().catch(""),
  frecuencia_pago: z.string().catch(""),
  tipo_nomina: tipoNomina,
  sueldo: numeroDePhp,
})

/**
 * Un renglón del desglose por empleado.
 *
 * @typedef {object} DetallePago
 * @property {string} nombre Nombre del empleado.
 * @property {string} puesto Puesto; cadena vacía si no se capturó.
 * @property {string} frecuencia_pago Semanal, Quincenal o Mensual.
 * @property {string} tipo_nomina `MX` o `US`.
 * @property {number} sueldo Monto a pagar en la divisa de su nómina.
 */

/**
 * Valida una lista descartando lo que no cumple lo mínimo.
 *
 * Un registro roto se omite y se cuenta, en vez de dejar pasar `undefined` hacia
 * el render y tumbar la pantalla entera por una fila mala.
 *
 * @param {Array} filas Lo que vino en la respuesta.
 * @param {object} esquema Esquema zod con el que validar cada fila.
 * @returns {{validos: Array, descartados: number}} Los que pasaron y cuántos no.
 */
export function normalizarLista(filas, esquema) {
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
 * Indica si una semana todavía admite cambios.
 *
 * @param {Periodo} periodo El periodo a evaluar.
 * @returns {boolean} `true` si sigue pendiente de autorizar.
 */
export const estaPendiente = (periodo) => periodo?.estado === ESTADO_PERIODO.PENDIENTE

/**
 * Suma la plantilla de una semana, sin importar la divisa.
 *
 * @param {Periodo} periodo El periodo a evaluar.
 * @returns {number} Empleados en total.
 */
export const plantillaTotal = (periodo) =>
  Number(periodo?.emps_mx ?? 0) + Number(periodo?.emps_us ?? 0)

/**
 * Etiqueta legible de una semana, para encabezados y confirmaciones.
 *
 * @param {Periodo} periodo El periodo a nombrar.
 * @returns {string} Por ejemplo `Semana 35 (2026)`.
 */
export const etiquetaPeriodo = (periodo) =>
  `Semana ${periodo?.semana ?? "—"} (${periodo?.anio ?? "—"})`
