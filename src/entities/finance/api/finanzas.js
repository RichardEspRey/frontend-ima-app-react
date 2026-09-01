import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista } from "../../../shared/api"
import {
  esquemaPagoConductor,
  esquemaTarifaConductor,
  esquemaViajeFinanzas,
  normalizarLista,
} from "../model/finanzas"

/**
 * Llave de caché de los viajes vistos desde finanzas.
 *
 * @type {Array.<string>}
 */
export const LLAVE_FINANZAS = ["finanzas", "viajes"]

/**
 * Llave de caché de los pagos a conductores.
 *
 * @type {Array.<string>}
 */
export const LLAVE_PAGOS = ["finanzas", "pagos-conductores"]

/**
 * Llave de caché de las tarifas por milla.
 *
 * @type {Array.<string>}
 */
export const LLAVE_TARIFAS = ["finanzas", "tarifas-conductor"]

/**
 * Trae los viajes con su cobro y sus etapas anidadas.
 *
 * @endpoint POST formularios.php · op=All_finanzas
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Los viajes normalizados.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerViajesFinanzas(opciones = {}) {
  const filas = await postLista(ENDPOINTS.formularios, "All_finanzas", { signal: opciones.signal })
  const { validos, descartados } = normalizarLista(filas, esquemaViajeFinanzas)

  if (descartados > 0) {
    console.warn(`formularios.php#All_finanzas descartó ${descartados} viaje(s).`)
  }

  return validos
}

/**
 * Trae los pagos pendientes a conductores.
 *
 * @endpoint POST formularios.php · op=All_paymentDrivers
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Los pagos normalizados.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerPagosConductores(opciones = {}) {
  const filas = await postLista(ENDPOINTS.formularios, "All_paymentDrivers", {
    signal: opciones.signal,
  })
  const { validos, descartados } = normalizarLista(filas, esquemaPagoConductor)

  if (descartados > 0) {
    console.warn(`formularios.php#All_paymentDrivers descartó ${descartados} pago(s).`)
  }

  return validos
}

/**
 * Trae la tarifa por milla de cada conductor.
 *
 * @endpoint POST formularios.php · op=get_millasDriver
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Las tarifas normalizadas.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerTarifasConductor(opciones = {}) {
  const filas = await postLista(ENDPOINTS.formularios, "get_millasDriver", {
    signal: opciones.signal,
  })
  const { validos } = normalizarLista(filas, esquemaTarifaConductor)
  return validos
}

/**
 * Guarda varias tarifas por milla de una vez.
 *
 * @endpoint POST formularios.php · op=I_update_millasDriverBulk
 * @param {Array} tarifas Las tarifas a guardar.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function guardarTarifasConductor(tarifas) {
  return post(ENDPOINTS.formularios, "I_update_millasDriverBulk", { data: tarifas })
}

/**
 * Registra el cobro de varias etapas a la vez.
 *
 * @endpoint POST formularios.php · op=I_pago_stage_bulk
 * @param {Array} pagos Los cobros a registrar.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function registrarCobrosEtapas(pagos) {
  return post(ENDPOINTS.formularios, "I_pago_stage_bulk", { data: pagos })
}

/**
 * Viajes de finanzas, cacheados.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function useViajesFinanzas() {
  return useQuery({
    queryKey: LLAVE_FINANZAS,
    queryFn: ({ signal }) => obtenerViajesFinanzas({ signal }),
  })
}

/**
 * Pagos a conductores, cacheados.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function usePagosConductores() {
  return useQuery({
    queryKey: LLAVE_PAGOS,
    queryFn: ({ signal }) => obtenerPagosConductores({ signal }),
  })
}

/**
 * Tarifas por milla. Es un catálogo: se cachea más tiempo.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function useTarifasConductor() {
  return useQuery({
    queryKey: LLAVE_TARIFAS,
    queryFn: ({ signal }) => obtenerTarifasConductor({ signal }),
    staleTime: 30 * 60 * 1000,
  })
}

/**
 * Guarda las tarifas y refresca su lista.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useGuardarTarifasConductor() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: guardarTarifasConductor,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_TARIFAS }),
  })
}

/**
 * Registra cobros y refresca los viajes de finanzas.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useRegistrarCobrosEtapas() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: registrarCobrosEtapas,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_FINANZAS }),
  })
}
