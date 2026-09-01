import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista } from "../../../shared/api"
import { normalizarViajesTransnacionales } from "../model/programacion"

/**
 * Llave de caché del siguiente número de viaje disponible.
 *
 * @param {string} pais País del viaje.
 * @param {string} anio Año a dos dígitos.
 * @returns {Array} La llave para `useQuery`.
 */
export const llaveSiguienteNumero = (pais, anio) => ["dispatch", "siguiente-numero", pais, anio]

/**
 * Llave de caché de los viajes transnacionales de un país.
 *
 * @param {string} pais País a consultar.
 * @param {string} anio Año a dos dígitos.
 * @returns {Array} La llave para `useQuery`.
 */
export const llaveTransnacionales = (pais, anio) => ["dispatch", "transnacionales", pais, anio]

/**
 * Pide el siguiente número de viaje libre para un país y año.
 *
 * Los parámetros se llaman `country_code` y `trip_year`, no `pais` ni `anio`: la
 * API rechaza la petición si se mandan con otro nombre.
 *
 * @endpoint POST new_tripsv2.php · op=get_next_trip_number
 * @param {object} parametros Datos de la consulta.
 * @param {string} parametros.pais Un valor de `PAIS`.
 * @param {string} parametros.anio Año a dos dígitos.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<(number|null)>} El siguiente número, o `null` si no vino.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerSiguienteNumero({ pais, anio, signal }) {
  const cuerpo = await post(
    ENDPOINTS.nuevosViajesV2,
    "get_next_trip_number",
    { country_code: pais, trip_year: anio },
    { signal },
  )
  return cuerpo?.next_trip_number ?? null
}

/**
 * Trae los viajes transnacionales de un país, para enlazar un cruce.
 *
 * @endpoint POST new_tripsv2.php · op=get_transnational_trips
 * @param {object} parametros Datos de la consulta.
 * @param {string} parametros.pais Un valor de `PAIS`.
 * @param {string} parametros.anio Año a dos dígitos.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Los viajes normalizados.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerViajesTransnacionales({ pais, anio, signal }) {
  const filas = await postLista(ENDPOINTS.nuevosViajesV2, "get_transnational_trips", {
    payload: { country_code: pais, trip_year: anio },
    signal,
  })
  const { viajes, descartados } = normalizarViajesTransnacionales(filas)

  if (descartados > 0) {
    console.warn(`new_tripsv2.php#get_transnational_trips descartó ${descartados} viaje(s).`)
  }

  return viajes
}

/**
 * Elimina una programación aprobada tras convertirla en viaje.
 *
 * @endpoint POST Programacion_viajes.php · op=delete
 * @param {string} programacionId Programación a borrar.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function eliminarProgramacion(programacionId) {
  return post(ENDPOINTS.programacionViajes, "delete", { id: programacionId })
}

/**
 * Siguiente número de viaje. No consulta hasta tener país y año.
 *
 * @param {string} pais Un valor de `PAIS`.
 * @param {string} anio Año a dos dígitos.
 * @returns {object} El resultado de `useQuery`.
 */
export function useSiguienteNumero(pais, anio) {
  return useQuery({
    queryKey: llaveSiguienteNumero(pais, anio),
    enabled: Boolean(pais && anio),
    queryFn: ({ signal }) => obtenerSiguienteNumero({ pais, anio, signal }),
  })
}

/**
 * Viajes transnacionales de un país. No consulta hasta tener país y año.
 *
 * @param {string} pais Un valor de `PAIS`.
 * @param {string} anio Año a dos dígitos.
 * @returns {object} El resultado de `useQuery`.
 */
export function useViajesTransnacionales(pais, anio) {
  return useQuery({
    queryKey: llaveTransnacionales(pais, anio),
    enabled: Boolean(pais && anio),
    queryFn: ({ signal }) => obtenerViajesTransnacionales({ pais, anio, signal }),
  })
}

/**
 * Elimina una programación e invalida lo que dependa de ella.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useEliminarProgramacion() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: eliminarProgramacion,
    onSuccess: () => cliente.invalidateQueries({ queryKey: ["dispatch"] }),
  })
}
