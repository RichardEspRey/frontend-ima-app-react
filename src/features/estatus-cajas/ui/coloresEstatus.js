import { OBSERVACION_CAJA, UBICACION_CAJA } from "../../../entities/trailer"

const AZUL = { fondo: "#dbeafe", texto: "#1e40af", punto: "#3b82f6" }
const ROJO = { fondo: "#fee2e2", texto: "#991b1b", punto: "#ef4444" }
const VERDE = { fondo: "#dcfce7", texto: "#166534", punto: "#22c55e" }
const CELESTE = { fondo: "#cffafe", texto: "#155e75", punto: "#06b6d4" }
const CAFE = { fondo: "#efe4d8", texto: "#7c4a2d", punto: "#8b5a3c" }
const AMARILLO = { fondo: "#fef9c3", texto: "#854d0e", punto: "#eab308" }
const MORADO = { fondo: "#f3e8ff", texto: "#6b21a8", punto: "#a855f7" }

/**
 * El color de cada ubicación y cada observación, como los pidió operaciones.
 *
 * @type {Object.<string, {fondo: string, texto: string, punto: string}>}
 */
export const COLORES_ESTATUS_CAJA = {
  [UBICACION_CAJA.PENSION]: AZUL,
  [UBICACION_CAJA.PENSION_USA]: ROJO,
  [UBICACION_CAJA.RUTA_SUBIENDO]: VERDE,
  [UBICACION_CAJA.RUTA_BAJANDO]: CELESTE,
  [UBICACION_CAJA.TALLER]: CAFE,
  [UBICACION_CAJA.MANTENIMIENTO]: AMARILLO,
  [UBICACION_CAJA.AGENCIA_ADUANAL]: MORADO,
  [OBSERVACION_CAJA.CARGADA]: VERDE,
  [OBSERVACION_CAJA.VACIA]: AMARILLO,
  [OBSERVACION_CAJA.CARGANDO]: AZUL,
  [OBSERVACION_CAJA.DESCARGANDO]: CELESTE,
}
