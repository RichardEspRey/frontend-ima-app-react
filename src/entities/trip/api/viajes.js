import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post } from "../../../shared/api"

/**
 * Llave de caché de una página de la lista de viajes.
 *
 * @param {object} consulta Pestaña, página, tamaño y filtros.
 * @returns {Array} La llave para `useQuery`.
 */
export const llaveViajes = (consulta) => ["viajes", "lista", consulta]

/**
 * Operaciones que cambian el estado de un viaje.
 *
 * Cada una vive en un endpoint distinto porque se fueron agregando en momentos
 * distintos: `salida_trip` está en la v2 y las demás en la v1.
 *
 * @readonly
 * @enum {object}
 */
export const ACCION_VIAJE = {
  CASI_FINALIZADO: { op: "AlmostOverTrip", endpoint: ENDPOINTS.nuevosViajes },
  FINALIZAR: { op: "FinalizeTrip", endpoint: ENDPOINTS.nuevosViajes },
  REACTIVAR: { op: "activate_trip", endpoint: ENDPOINTS.nuevosViajes },
  ELIMINAR: { op: "delete_trip", endpoint: ENDPOINTS.nuevosViajes },
  DAR_SALIDA: { op: "salida_trip", endpoint: ENDPOINTS.nuevosViajesV2 },
}

/**
 * Una página de la lista de viajes.
 *
 * La API pagina en el servidor y devuelve el total aparte, así que la pantalla
 * nunca tiene la lista completa en memoria.
 *
 * @endpoint POST new_tripsv2.php · op=getPaginated
 * @param {object} parametros Datos de la consulta.
 * @param {number} parametros.pestana Un `tabValue`.
 * @param {number} parametros.pagina Página, empezando en cero.
 * @param {number} parametros.porPagina Cuántos viajes por página.
 * @param {object} [parametros.filtros] Los filtros de la barra.
 * @param {object} [parametros.usuario] Quién consulta, para que la API filtre por equipo.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<{viajes: Array, total: number}>} La página y cuántos hay en total.
 * @throws {ApiError} Si la petición falla.
 */
export async function obtenerViajes({
  pestana,
  pagina,
  porPagina,
  filtros = {},
  usuario,
  signal,
}) {
  const cuerpo = await post(
    ENDPOINTS.nuevosViajesV2,
    "getPaginated",
    {
      page: pagina,
      limit: porPagina,
      tabValue: pestana,
      ...filtros,
      user_id: usuario?.id,
      user_type: usuario?.tipo_usuario,
    },
    { signal },
  )

  return {
    viajes: Array.isArray(cuerpo?.trips) ? cuerpo.trips : [],
    total: Number(cuerpo?.total ?? 0),
  }
}

/**
 * Cambia el estado de un viaje.
 *
 * @endpoint POST new_trips.php | new_tripsv2.php
 * @param {object} parametros Datos de la acción.
 * @param {object} parametros.accion Un valor de `ACCION_VIAJE`.
 * @param {string} parametros.tripId Viaje afectado.
 * @param {object} [parametros.extra] Campos propios de la acción, como el tipo de reactivación.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function ejecutarAccionViaje({ accion, tripId, extra = {} }) {
  return post(accion.endpoint, accion.op, { trip_id: tripId, ...extra })
}

/**
 * Una página de la lista de viajes, con sus filtros.
 *
 * @param {object} consulta Lo que espera {@link obtenerViajes}.
 * @param {object} [opciones] Ajustes de la consulta.
 * @param {boolean} [opciones.habilitada=true] Si debe consultarse.
 * @returns {object} El resultado de `useQuery`.
 */
export function useViajes(consulta, { habilitada = true } = {}) {
  return useQuery({
    queryKey: llaveViajes(consulta),
    enabled: habilitada,
    queryFn: ({ signal }) => obtenerViajes({ ...consulta, signal }),
    placeholderData: (anterior) => anterior,
  })
}

/**
 * Ejecuta una acción sobre un viaje y refresca la lista.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useAccionViaje() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: ejecutarAccionViaje,
    onSuccess: () => cliente.invalidateQueries({ queryKey: ["viajes"] }),
  })
}
