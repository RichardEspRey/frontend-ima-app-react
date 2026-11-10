import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post } from "../../../shared/api"
import { normalizarLista } from "../model/finanzas"
import {
  PAIS,
  clavePago,
  destinosDe,
  esquemaAsignacionTrayecto,
  esquemaTrayecto,
  esquemaViajePago,
} from "../model/trayectos"

/**
 * Llave raíz del pago por trayecto: el catálogo y los datos de los viajes.
 *
 * @type {Array.<string>}
 */
export const LLAVE_TRAYECTOS = ["pagos-trayectos"]

/**
 * Trae el catálogo de trayectos mexicanos.
 *
 * @endpoint POST pagos_mx.php · op=getTrayectos
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Los trayectos normalizados.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerTrayectos(opciones = {}) {
  const cuerpo = await post(ENDPOINTS.pagosMx, "getTrayectos", {}, opciones)
  return normalizarLista(cuerpo?.trayectos ?? [], esquemaTrayecto).validos
}

/**
 * Trae la nomenclatura, el país y el recorrido de cada viaje, y el trayecto con el que
 * se autorizó cada pago mexicano.
 *
 * @endpoint POST pagos_mx.php · op=getDatosPagos
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<{viajes: Map, asignaciones: Map}>} Los viajes por `trip_id` y las asignaciones por viaje y chofer.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerDatosPagos(opciones = {}) {
  const cuerpo = await post(ENDPOINTS.pagosMx, "getDatosPagos", {}, opciones)
  const viajes = normalizarLista(cuerpo?.viajes ?? [], esquemaViajePago).validos
  const asignaciones = normalizarLista(cuerpo?.asignaciones ?? [], esquemaAsignacionTrayecto).validos

  return {
    viajes: new Map(
      viajes.map((viaje) => [
        viaje.trip_id,
        {
          nomenclatura: viaje.nomenclatura,
          pais: viaje.country_code === PAIS.MX ? PAIS.MX : PAIS.US,
          recorrido: destinosDe(viaje.recorrido),
        },
      ]),
    ),
    asignaciones: new Map(
      asignaciones.map((fila) => [
        clavePago(fila.trip_id, fila.driver_id),
        { trayectoId: fila.trayecto_id, trayecto: fila.trayecto, monto: fila.monto },
      ]),
    ),
  }
}

/**
 * Da de alta o edita un trayecto del catálogo.
 *
 * @endpoint POST pagos_mx.php · op=guardarTrayecto
 * @param {object} trayecto El trayecto.
 * @param {string} [trayecto.id] Su id, si ya existe.
 * @param {string} trayecto.nombre El nombre del destino.
 * @param {number|string} trayecto.monto Lo que se paga por viaje, en pesos.
 * @param {boolean} trayecto.activo Si se puede elegir en los pagos.
 * @returns {Promise.<object>} La respuesta de la API, con el `id`.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function guardarTrayecto({ id, nombre, monto, activo }) {
  return post(ENDPOINTS.pagosMx, "guardarTrayecto", { id: id || undefined, nombre, monto, activo })
}

/**
 * Autoriza el pago de un viaje mexicano con el monto de su trayecto.
 *
 * Primero guarda el trayecto, que valida que el viaje sea mexicano y no esté pagado;
 * después autoriza el pago con el mismo flujo del ticket, para que «Pagar» funcione igual.
 *
 * @endpoint POST pagos_mx.php · op=asignarTrayecto
 * @endpoint POST formularios.php · op=send_ticket_pago
 * @param {object} datos Lo que se autoriza.
 * @param {string|number} datos.tripId El viaje.
 * @param {string|number} datos.driverId El chofer.
 * @param {object} datos.trayecto El trayecto elegido.
 * @param {string} [datos.usuarioId] Quién lo autoriza.
 * @returns {Promise.<number>} El monto autorizado.
 * @throws {ApiError} Si alguna de las dos operaciones falla.
 */
export async function autorizarPagoPorTrayecto({ tripId, driverId, trayecto, usuarioId }) {
  const asignado = await post(ENDPOINTS.pagosMx, "asignarTrayecto", {
    trip_id: tripId,
    driver_id: driverId,
    trayecto_id: trayecto.id,
    id_usuario: usuarioId,
  })

  await post(ENDPOINTS.formularios, "send_ticket_pago", {
    trip_id: tripId,
    driver_id: driverId,
    amount: asignado.monto,
    rate_per_mile: 0,
    anticipo_1: 0,
    anticipo_2: 0,
    anticipo_3: 0,
    gastos: 0,
    ajustes: "{}",
    comentarios: `Pago por trayecto: ${trayecto.nombre}`,
    comentarios_operador: "",
  })

  return Number(asignado.monto)
}

/**
 * El catálogo de trayectos, cacheado.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function useTrayectos() {
  return useQuery({
    queryKey: [...LLAVE_TRAYECTOS, "catalogo"],
    queryFn: ({ signal }) => obtenerTrayectos({ signal }),
  })
}

/**
 * La nomenclatura, el país y el trayecto de cada pago, cacheados.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function useDatosPagos() {
  return useQuery({
    queryKey: [...LLAVE_TRAYECTOS, "datos"],
    queryFn: ({ signal }) => obtenerDatosPagos({ signal }),
  })
}

/**
 * Guarda un trayecto y refresca el catálogo.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useGuardarTrayecto() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: guardarTrayecto,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_TRAYECTOS }),
  })
}

/**
 * Autoriza un pago por trayecto y refresca los trayectos asignados.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useAutorizarPagoPorTrayecto() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: autorizarPagoPorTrayecto,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_TRAYECTOS }),
  })
}
