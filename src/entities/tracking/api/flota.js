import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista } from "../../../shared/api"
import { combinarFlota, normalizarUnidadesGps } from "../model/flota"
import { estadoDeParadas } from "../model/paradas"

/**
 * Cada cuánto se vuelve a preguntar dónde está la flota.
 *
 * El GPS reporta cada minuto largo, así que pedir más seguido no da datos más
 * frescos: solo carga el servidor.
 *
 * @type {number}
 */
export const REFRESCO_FLOTA_MS = 50_000

/**
 * Llave de caché de la flota.
 *
 * @type {Array}
 */
export const LLAVE_FLOTA = ["tracking", "flota"]

/**
 * Llave de caché de las paradas de una etapa.
 *
 * Incluye la parada actual porque el estado de cada una se calcula a partir de
 * ella: sin eso, avanzar de parada seguiría mostrando el avance anterior.
 *
 * @param {string} viaje Número del viaje.
 * @param {string} etapa Número de la etapa.
 * @param {string} [paradaActual] Próxima parada pendiente.
 * @returns {Array} La llave para `useQuery`.
 */
export const llaveParadas = (viaje, etapa, paradaActual) => [
  "tracking",
  "paradas",
  viaje,
  etapa,
  paradaActual ?? null,
]

/**
 * Posición de cada unidad, según el GPS.
 *
 * El script ignora el campo `op`: contesta lo mismo con cualquier valor.
 *
 * @endpoint POST Tracking.php
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Las unidades con posición válida.
 * @throws {ApiError} Si la petición falla.
 */
export async function obtenerUnidadesGps(opciones = {}) {
  const cuerpo = await post(ENDPOINTS.tracking, "", {}, { signal: opciones.signal })
  const { unidades, descartadas } = normalizarUnidadesGps(cuerpo?.units)

  if (descartadas > 0) {
    console.warn(`Tracking.php devolvió ${descartadas} unidad(es) sin posición.`)
  }

  return unidades
}

/**
 * Telemetría de las unidades dadas de alta en IMA.
 *
 * @endpoint POST estatus_unidades.php · op=get_dashboard
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} La lista, o `[]` si la API no la devolvió.
 * @throws {ApiError} Si la petición falla.
 */
export function obtenerTablero(opciones = {}) {
  return postLista(ENDPOINTS.estatusUnidades, "get_dashboard", { signal: opciones.signal })
}

/**
 * La flota completa: dónde está cada unidad y qué sabe IMA de ella.
 *
 * Las dos peticiones van en paralelo porque no dependen una de otra, y se
 * combinan aquí para que la pantalla reciba una sola lista.
 *
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} La flota lista para pintar.
 * @throws {ApiError} Si falla la petición del GPS.
 */
export async function obtenerFlota(opciones = {}) {
  const [gps, tablero] = await Promise.all([
    obtenerUnidadesGps(opciones),
    obtenerTablero(opciones).catch((fallo) => {
      console.warn("No se pudo leer la telemetría; se muestran las posiciones solas.", fallo)
      return []
    }),
  ])

  return combinarFlota(gps, tablero)
}

/**
 * Las paradas de una etapa, ya marcadas como completadas, en curso o pendientes.
 *
 * Se piden a la lista de viajes en ruta filtrando por número de viaje, porque no
 * hay una operación que devuelva las paradas de una etapa sueltas.
 *
 * @endpoint POST new_tripsv2.php · op=getPaginated
 * @param {object} parametros Datos de la consulta.
 * @param {string} parametros.viaje Número del viaje.
 * @param {string} parametros.etapa Número de la etapa.
 * @param {string} [parametros.paradaActual] Próxima parada pendiente, según el tablero.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Las paradas con su estado.
 * @throws {ApiError} Si la petición falla.
 */
export async function obtenerParadasEtapa({ viaje, etapa, paradaActual, signal }) {
  const cuerpo = await post(
    ENDPOINTS.nuevosViajesV2,
    "getPaginated",
    { page: 0, limit: 1, tabValue: 2, filterTrip: viaje },
    { signal },
  )

  const encontrado = cuerpo?.trips?.[0]
  const etapaActiva = encontrado?.etapas?.find(
    (e) => String(e.stage_number) === String(etapa),
  )

  return estadoDeParadas(etapaActiva?.stops_in_transit, paradaActual)
}

/**
 * Guarda la configuración del tanque de una unidad.
 *
 * @endpoint POST estatus_unidades.php · op=update_config
 * @param {object} parametros Datos a guardar.
 * @param {string} parametros.truckId Camión a configurar.
 * @param {number} parametros.galones Lo que hay en el tanque.
 * @param {number} parametros.capacidad Lo que cabe.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza el guardado.
 */
export function guardarConfiguracionTanque({ truckId, galones, capacidad }) {
  return post(ENDPOINTS.estatusUnidades, "update_config", {
    truck_id: truckId,
    current_fuel: galones,
    tank_capacity: capacidad,
  })
}

/**
 * La flota, refrescándose sola cada {@link REFRESCO_FLOTA_MS}.
 *
 * Sigue refrescando con la pestaña en segundo plano: el mapa es una pantalla de
 * vigilancia y quien la deja abierta en otro monitor espera verla al día.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function useFlota() {
  return useQuery({
    queryKey: LLAVE_FLOTA,
    queryFn: ({ signal }) => obtenerFlota({ signal }),
    refetchInterval: REFRESCO_FLOTA_MS,
    refetchIntervalInBackground: true,
  })
}

/**
 * Las paradas de la etapa activa. No consulta hasta tener viaje y etapa.
 *
 * @param {object} [unidad] La unidad seleccionada.
 * @returns {object} El resultado de `useQuery`.
 */
export function useParadasEtapa(unidad) {
  const viaje = unidad?.trip_number
  const etapa = unidad?.current_stage_number

  return useQuery({
    queryKey: llaveParadas(viaje, etapa, unidad?.current_stop),
    enabled: Boolean(viaje && etapa),
    queryFn: ({ signal }) =>
      obtenerParadasEtapa({ viaje, etapa, paradaActual: unidad?.current_stop, signal }),
  })
}

/**
 * Guarda el tanque de una unidad y vuelve a pedir la flota.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useGuardarTanque() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: guardarConfiguracionTanque,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_FLOTA }),
  })
}
