import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista } from "../../../shared/api"
import { esquemaAfinacion, esquemaHistorial, normalizarLista } from "../model/afinacion"

/**
 * Llave de caché del estado de afinaciones.
 *
 * @type {Array.<string>}
 */
export const LLAVE_AFINACIONES = ["afinaciones"]

/**
 * Llave de caché del historial de afinaciones.
 *
 * @type {Array.<string>}
 */
export const LLAVE_HISTORIAL = ["afinaciones", "historial"]

/**
 * Trae el estado de afinación de cada camión.
 *
 * @endpoint POST afinaciones.php · op=get_maintenance_status
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Las afinaciones normalizadas.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerAfinaciones(opciones = {}) {
  const filas = await postLista(ENDPOINTS.afinaciones, "get_maintenance_status", {
    signal: opciones.signal,
  })
  const { validos, descartados } = normalizarLista(filas, esquemaAfinacion)

  if (descartados > 0) {
    console.warn(`afinaciones.php#get_maintenance_status descartó ${descartados} registro(s).`)
  }

  return validos
}

/**
 * Trae el historial de afinaciones hechas.
 *
 * @endpoint POST afinaciones.php · op=get_history
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} El historial normalizado.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerHistorial(opciones = {}) {
  const filas = await postLista(ENDPOINTS.afinaciones, "get_history", { signal: opciones.signal })
  const { validos } = normalizarLista(filas, esquemaHistorial)
  return validos
}

/**
 * Registra una afinación y reinicia el contador de millas del camión.
 *
 * @endpoint POST afinaciones.php · op=reset_counter
 * @param {object} datos Datos de la afinación.
 * @param {string} datos.truckId Camión afinado.
 * @param {number} datos.millasAcumuladas Millas que llevaba al afinarse.
 * @param {number} datos.porcentajeAceite Porcentaje de aceite registrado.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function registrarAfinacion({ truckId, millasAcumuladas, porcentajeAceite }) {
  return post(ENDPOINTS.afinaciones, "reset_counter", {
    truck_id: truckId,
    millas_acumuladas: millasAcumuladas,
    porcentaje_aceite: porcentajeAceite,
  })
}

/**
 * Cambia cada cuántas millas se afina un camión.
 *
 * @endpoint POST afinaciones.php · op=update_limit
 * @param {object} datos Datos del cambio.
 * @param {string} datos.truckId Camión afectado.
 * @param {number} datos.limite Millas entre afinaciones.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function actualizarLimite({ truckId, limite }) {
  return post(ENDPOINTS.afinaciones, "update_limit", {
    truck_id: truckId,
    nuevo_limite: limite,
  })
}

/**
 * Corrige una lectura de odómetro mal capturada.
 *
 * Existe porque pasa: en los datos reales hay lecturas con un dígito de menos
 * entre valores de un millón y medio.
 *
 * @endpoint POST afinaciones.php · op=correct_odometer
 * @param {object} datos Datos de la corrección.
 * @param {string} datos.dieselId Registro de diesel a corregir.
 * @param {number} datos.odometro Lectura correcta.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function corregirOdometro({ dieselId, odometro }) {
  return post(ENDPOINTS.afinaciones, "correct_odometer", {
    diesel_id: dieselId,
    nuevo_odometro: odometro,
  })
}

/**
 * Estado de afinación de la flota, cacheado.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function useAfinaciones() {
  return useQuery({
    queryKey: LLAVE_AFINACIONES,
    queryFn: ({ signal }) => obtenerAfinaciones({ signal }),
  })
}

/**
 * Historial de afinaciones, cacheado.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function useHistorialAfinaciones() {
  return useQuery({
    queryKey: LLAVE_HISTORIAL,
    queryFn: ({ signal }) => obtenerHistorial({ signal }),
  })
}

/**
 * Crea una mutación que refresca las afinaciones al terminar.
 *
 * Las tres invalidan lo mismo, así que comparten fábrica.
 *
 * @param {Function} mutationFn La operación a ejecutar.
 * @returns {Function} Un hook de mutación.
 */
const crearMutacion = (mutationFn) =>
  function useMutacionAfinaciones() {
    const cliente = useQueryClient()
    return useMutation({
      mutationFn,
      onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_AFINACIONES }),
    })
  }

/**
 * Registra una afinación y refresca la flota.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export const useRegistrarAfinacion = crearMutacion(registrarAfinacion)

/**
 * Cambia el límite de un camión y refresca la flota.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export const useActualizarLimite = crearMutacion(actualizarLimite)

/**
 * Corrige un odómetro y refresca la flota.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export const useCorregirOdometro = crearMutacion(corregirOdometro)
