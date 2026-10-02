import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, FRESCURA_CATALOGO_MS, post, postLista } from "../../../shared/api"
import {
  clavePunto,
  esquemaInspeccionMtto,
  esquemaPendiente,
  esquemaPunto,
  normalizarCon,
} from "../model/punto"

/**
 * Llave raíz de todo lo que toca el flujo de mantenimiento.
 *
 * Cuelgan de ella las inspecciones, los puntos de cada viaje y las reparaciones
 * pendientes. Resolver un punto mueve las tres cosas a la vez —sale de la
 * inspección y entra a pendientes, o al revés—, así que se invalidan juntas.
 *
 * @type {Array.<string>}
 */
export const LLAVE_MANTENIMIENTO = ["mantenimiento"]

/**
 * Llave de las inspecciones de un lado.
 *
 * @param {string} lado `camion` o `caja`.
 * @returns {Array} La llave de caché.
 */
export const llaveInspecciones = (lado) => [...LLAVE_MANTENIMIENTO, "inspecciones", lado]

/**
 * Llave de los puntos de una inspección.
 *
 * @param {string} viajeId El viaje.
 * @param {string} lado `camion` o `caja`.
 * @returns {Array} La llave de caché.
 */
export const llavePuntos = (viajeId, lado) => [...LLAVE_MANTENIMIENTO, "puntos", String(viajeId), lado]

/**
 * Llave de las reparaciones pendientes de un lado.
 *
 * @param {string} unidadTipo `camion` o `caja`.
 * @returns {Array} La llave de caché.
 */
export const llavePendientes = (unidadTipo) => [...LLAVE_MANTENIMIENTO, "pendientes", unidadTipo]

/**
 * Trae las inspecciones de un lado, con lo que de verdad falta por atender.
 *
 * El conteo viene del servidor ya descontando lo resuelto: `All_CL_Final` cuenta
 * renglones del checklist, incluidos los "ok", y por eso una inspección con tres
 * cosas que hacer aparecía con cinco.
 *
 * @endpoint POST mtto.php · op=getInspecciones
 * @param {string} lado `camion` o `caja`.
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Las inspecciones normalizadas.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerInspeccionesMtto(lado, opciones = {}) {
  const cuerpo = await post(ENDPOINTS.mantenimiento, "getInspecciones", { lado }, opciones)
  const { validas, descartados } = normalizarCon(esquemaInspeccionMtto, cuerpo?.inspecciones ?? [])

  if (descartados > 0) {
    console.warn(`mtto.php#getInspecciones descartó ${descartados} inspección(es).`)
  }

  return validas
}

/**
 * Trae los puntos de un lado de una inspección, con el estado de cada uno.
 *
 * @endpoint POST mtto.php · op=getPuntos
 * @param {string} viajeId El viaje.
 * @param {string} lado `camion` o `caja`.
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Los puntos, con su clave estable.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerPuntos(viajeId, lado, opciones = {}) {
  const cuerpo = await post(ENDPOINTS.mantenimiento, "getPuntos", { viaje_id: viajeId, lado }, opciones)
  const { validas } = normalizarCon(esquemaPunto, cuerpo?.puntos ?? [])

  return validas.map((punto) => ({ ...punto, clave: clavePunto(punto) }))
}

/**
 * Trae las reparaciones pendientes de camiones o de cajas.
 *
 * @endpoint POST mtto.php · op=getPendientes
 * @param {string} unidadTipo `camion` o `caja`.
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Las reparaciones normalizadas.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerPendientes(unidadTipo, opciones = {}) {
  const cuerpo = await post(ENDPOINTS.mantenimiento, "getPendientes", { unidad_tipo: unidadTipo }, opciones)
  const { validas } = normalizarCon(esquemaPendiente, cuerpo?.pendientes ?? [])

  return validas
}

/**
 * Trae la nomenclatura de cada viaje con inspección final.
 *
 * La arma un procedimiento del servidor y no sale de las columnas de `trips`, así
 * que no se puede reconstruir aquí. Se lee del resumen viejo, que es su única
 * fuente, para que el viaje se nombre igual en toda la aplicación.
 *
 * @endpoint POST formularios.php · op=All_CL_Final
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Map.<string, string>>} Viaje contra su nomenclatura.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerNomenclaturas(opciones = {}) {
  const filas = await postLista(ENDPOINTS.formularios, "All_CL_Final", {
    campo: "row",
    signal: opciones.signal,
  })

  return new Map(filas.map((fila) => [String(fila.viaje_id), fila.nomenclatura || ""]))
}

/**
 * Las nomenclaturas, cacheadas largo: cambian cuando nace un viaje.
 *
 * @returns {object} El resultado de `useQuery`.
 */
export function useNomenclaturas() {
  return useQuery({
    queryKey: [...LLAVE_MANTENIMIENTO, "nomenclaturas"],
    queryFn: ({ signal }) => obtenerNomenclaturas({ signal }),
    staleTime: FRESCURA_CATALOGO_MS,
  })
}

/**
 * Manda puntos a pendientes o los descarta.
 *
 * @endpoint POST mtto.php · op=resolverPuntos
 * @param {object} datos Lo que se resuelve.
 * @param {Array.<object>} datos.items Los puntos, con su origen y su unidad.
 * @param {string} datos.estatus El estado destino.
 * @param {string} [datos.usuarioId] Quién lo decidió.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function resolverPuntos({ items, estatus, usuarioId }) {
  return post(ENDPOINTS.mantenimiento, "resolverPuntos", {
    items,
    estatus,
    id_usuario: usuarioId,
  })
}

/**
 * Levanta una reparación pendiente que no vino de ninguna inspección.
 *
 * Es la otra mitad del reporte: lo que el taller ve con la unidad enfrente y no
 * pasó por el checklist del operador.
 *
 * @endpoint POST mtto.php · op=crearPendiente
 * @param {object} datos La reparación.
 * @param {string} datos.unidadTipo `camion` o `caja`.
 * @param {string} datos.unidadId La unidad.
 * @param {string} datos.descripcion Qué hay que atender.
 * @param {string} [datos.usuarioId] Quién la levantó.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function crearPendiente({ unidadTipo, unidadId, descripcion, usuarioId }) {
  return post(ENDPOINTS.mantenimiento, "crearPendiente", {
    unidad_tipo: unidadTipo,
    unidad_id: unidadId,
    descripcion,
    id_usuario: usuarioId,
  })
}

/**
 * Cierra el lado de camión o de caja de una inspección.
 *
 * El servidor vuelve a contar los puntos sin resolver y rechaza el cierre si
 * queda alguno: la validación de la pantalla es comodidad, no la garantía.
 *
 * @endpoint POST mtto.php · op=completarLado
 * @param {object} datos El lado a cerrar.
 * @param {string} datos.clFinalId La inspección.
 * @param {string} datos.viajeId El viaje.
 * @param {string} datos.lado `camion` o `caja`.
 * @param {string} [datos.usuarioId] Quién lo cerró.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si quedan puntos sin resolver.
 */
export function completarLado({ clFinalId, viajeId, lado, usuarioId }) {
  return post(ENDPOINTS.mantenimiento, "completarLado", {
    cl_final_id: clFinalId,
    viaje_id: viajeId,
    lado,
    id_usuario: usuarioId,
  })
}

/**
 * Levanta la orden de servicio con un servicio por reparación.
 *
 * @endpoint POST mtto.php · op=crearOrden
 * @param {object} datos La orden.
 * @param {string} datos.unidadTipo `camion` o `caja`.
 * @param {string} datos.unidadId La unidad.
 * @param {string} datos.fecha Fecha de la orden.
 * @param {string} [datos.tipoCambio] Tipo de cambio, si aplica.
 * @param {Array.<object>} datos.servicios Un servicio por punto, con sus gastos.
 * @param {string} [datos.usuarioId] Quién la levantó.
 * @returns {Promise.<object>} La orden creada, con su `id_orden`.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function crearOrden({ unidadTipo, unidadId, fecha, tipoCambio, servicios, usuarioId }) {
  return post(ENDPOINTS.mantenimiento, "crearOrden", {
    unidad_tipo: unidadTipo,
    unidad_id: unidadId,
    fecha,
    tipo_cambio: tipoCambio,
    servicios,
    id_usuario: usuarioId,
  })
}

/**
 * Las inspecciones de un lado, cacheadas.
 *
 * @param {string} lado `camion` o `caja`.
 * @returns {object} El resultado de `useQuery`.
 */
export function useInspeccionesMtto(lado) {
  return useQuery({
    queryKey: llaveInspecciones(lado),
    queryFn: ({ signal }) => obtenerInspeccionesMtto(lado, { signal }),
  })
}

/**
 * Los puntos de una inspección. Solo se piden cuando la fila está abierta.
 *
 * @param {string} viajeId El viaje, o `null` si no hay ninguna abierta.
 * @param {string} lado `camion` o `caja`.
 * @returns {object} El resultado de `useQuery`.
 */
export function usePuntos(viajeId, lado) {
  return useQuery({
    queryKey: llavePuntos(viajeId, lado),
    queryFn: ({ signal }) => obtenerPuntos(viajeId, lado, { signal }),
    enabled: Boolean(viajeId),
  })
}

/**
 * Las reparaciones pendientes de un lado, cacheadas.
 *
 * @param {string} unidadTipo `camion` o `caja`.
 * @returns {object} El resultado de `useQuery`.
 */
export function usePendientes(unidadTipo) {
  return useQuery({
    queryKey: llavePendientes(unidadTipo),
    queryFn: ({ signal }) => obtenerPendientes(unidadTipo, { signal }),
  })
}

/**
 * Invalida todo el flujo: inspecciones, puntos y pendientes.
 *
 * @returns {Function} La función que refresca.
 */
function useRefrescarMantenimiento() {
  const cliente = useQueryClient()
  return () => cliente.invalidateQueries({ queryKey: LLAVE_MANTENIMIENTO })
}

/**
 * Resuelve puntos y refresca el flujo.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useResolverPuntos() {
  const refrescar = useRefrescarMantenimiento()
  return useMutation({ mutationFn: resolverPuntos, onSuccess: refrescar })
}

/**
 * Levanta una reparación a mano y refresca el flujo.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useCrearPendiente() {
  const refrescar = useRefrescarMantenimiento()
  return useMutation({ mutationFn: crearPendiente, onSuccess: refrescar })
}

/**
 * Cierra un lado y refresca el flujo.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useCompletarLado() {
  const refrescar = useRefrescarMantenimiento()
  return useMutation({ mutationFn: completarLado, onSuccess: refrescar })
}

/**
 * Crea la orden y refresca el flujo.
 *
 * No invalida las órdenes de servicio: de eso se encarga quien las lista.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useCrearOrdenMtto() {
  const refrescar = useRefrescarMantenimiento()
  return useMutation({ mutationFn: crearOrden, onSuccess: refrescar })
}
