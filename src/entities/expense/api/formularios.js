import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { post } from "../../../shared/api"
import { CAMPO_RESPUESTA, descriptorDe } from "../model/tipos"

/**
 * Llave de caché del resumen por viaje de un tipo.
 *
 * @param {string} tipo Un valor de `TIPO_REGISTRO`.
 * @returns {Array} La llave para `useQuery`.
 */
export const llaveResumen = (tipo) => ["formularios", tipo, "resumen"]

/**
 * Llave de caché de los registros de un viaje.
 *
 * @param {string} tipo Un valor de `TIPO_REGISTRO`.
 * @param {string} tripId Viaje a consultar.
 * @returns {Array} La llave para `useQuery`.
 */
export const llaveRegistros = (tipo, tripId) => ["formularios", tipo, "registros", tripId]

/**
 * Llave de caché de un registro suelto.
 *
 * @param {string} tipo Un valor de `TIPO_REGISTRO`.
 * @param {string} id Registro a consultar.
 * @returns {Array} La llave para `useQuery`.
 */
export const llaveRegistro = (tipo, id) => ["formularios", tipo, "registro", id]

/**
 * Saca la lista de una respuesta de `formularios.php`.
 *
 * @param {object} cuerpo La respuesta.
 * @param {string} campo Un valor de `CAMPO_RESPUESTA`.
 * @returns {Array} La lista, o `[]` si no vino.
 */
const listaDe = (cuerpo, campo) => (Array.isArray(cuerpo?.[campo]) ? cuerpo[campo] : [])

/**
 * El resumen por viaje: cuánto lleva cada uno y de cuándo es lo último.
 *
 * @endpoint POST formularios.php · op=getAll_gastos | getAll_diesel
 * @param {object} parametros Datos de la consulta.
 * @param {string} parametros.tipo Un valor de `TIPO_REGISTRO`.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Un renglón por viaje.
 * @throws {ApiError} Si la petición falla.
 */
export async function obtenerResumen({ tipo, signal }) {
  const { endpoint, ops } = descriptorDe(tipo)
  const cuerpo = await post(endpoint, ops.resumen, {}, { signal })
  return listaDe(cuerpo, CAMPO_RESPUESTA.LISTA)
}

/**
 * Los registros de un viaje.
 *
 * @endpoint POST formularios.php · op=get_registers_gasto | get_registers_diesel
 * @param {object} parametros Datos de la consulta.
 * @param {string} parametros.tipo Un valor de `TIPO_REGISTRO`.
 * @param {string} parametros.tripId Viaje a consultar.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Los registros del viaje.
 * @throws {ApiError} Si la petición falla.
 */
export async function obtenerRegistros({ tipo, tripId, signal }) {
  const { endpoint, ops } = descriptorDe(tipo)
  const cuerpo = await post(endpoint, ops.registros, { trip_id: tripId }, { signal })
  return listaDe(cuerpo, CAMPO_RESPUESTA.LISTA)
}

/**
 * Un registro suelto, el que se va a editar.
 *
 * La API lo devuelve dentro de un arreglo de un solo elemento, en un campo
 * llamado `row`.
 *
 * @endpoint POST formularios.php · op=get_gasto | get_diesel
 * @param {object} parametros Datos de la consulta.
 * @param {string} parametros.tipo Un valor de `TIPO_REGISTRO`.
 * @param {string} parametros.id Registro a consultar.
 * @param {string} parametros.tripId Viaje al que pertenece.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<object>} El registro.
 * @throws {Error} Si el registro no existe.
 * @throws {ApiError} Si la petición falla.
 */
export async function obtenerRegistro({ tipo, id, tripId, signal }) {
  const { endpoint, ops } = descriptorDe(tipo)
  const cuerpo = await post(endpoint, ops.uno, { id, trip_id: tripId }, { signal })
  const [registro] = listaDe(cuerpo, CAMPO_RESPUESTA.REGISTRO)

  if (!registro) throw new Error("El registro no existe o ya se eliminó.")
  return registro
}

/**
 * Los tickets escaneados de un registro.
 *
 * Es la única operación del endpoint que devuelve la lista en `data`.
 *
 * @endpoint POST formularios.php · op=getTickets
 * @param {object} parametros Datos de la consulta.
 * @param {string} parametros.tipo Un valor de `TIPO_REGISTRO`.
 * @param {string} parametros.id Registro del que son los tickets.
 * @param {string} parametros.tripId Viaje al que pertenece.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<Array>} Los tickets, o `[]` si no hay.
 * @throws {ApiError} Si la petición falla.
 */
export async function obtenerTickets({ tipo, id, tripId, signal }) {
  const { endpoint } = descriptorDe(tipo)
  const cuerpo = await post(endpoint, "getTickets", { id, trip_id: tripId, tipo }, { signal })
  return listaDe(cuerpo, CAMPO_RESPUESTA.TICKETS)
}

/**
 * Guarda los cambios de un registro.
 *
 * @endpoint POST formularios.php · op=edit_gasto | edit_diesel
 * @param {object} parametros Datos del guardado.
 * @param {string} parametros.tipo Un valor de `TIPO_REGISTRO`.
 * @param {object} parametros.registro Los campos del formulario.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza el guardado.
 */
export function guardarRegistro({ tipo, registro }) {
  const { endpoint, ops } = descriptorDe(tipo)
  return post(endpoint, ops.editar, registro)
}

/**
 * Elimina un registro.
 *
 * @endpoint POST formularios.php · op=delete_gasto | delete_diesel
 * @param {object} parametros Datos del borrado.
 * @param {string} parametros.tipo Un valor de `TIPO_REGISTRO`.
 * @param {string} parametros.id Registro a borrar.
 * @param {string} [parametros.tripId] Viaje al que pertenece.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza el borrado.
 */
export function eliminarRegistro({ tipo, id, tripId }) {
  const { endpoint, ops } = descriptorDe(tipo)
  return post(endpoint, ops.eliminar, { id, trip_id: tripId })
}

/**
 * Da de alta una carga de diesel capturada a mano.
 *
 * Solo el diesel lo admite: los gastos se capturan desde la aplicación móvil.
 *
 * @endpoint POST formularios.php · op=add_manual_diesel
 * @param {object} parametros Datos del alta.
 * @param {string} parametros.tipo Un valor de `TIPO_REGISTRO`.
 * @param {object} parametros.registro Los campos de la carga.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {Error} Si el tipo no admite altas manuales.
 * @throws {ApiError} Si la API rechaza el alta.
 */
export function crearRegistroManual({ tipo, registro }) {
  const { endpoint, ops } = descriptorDe(tipo)
  if (!ops.alta) throw new Error(`El tipo ${tipo} no admite alta manual.`)
  return post(endpoint, ops.alta, registro)
}

/**
 * El resumen por viaje de un tipo.
 *
 * @param {string} tipo Un valor de `TIPO_REGISTRO`.
 * @returns {object} El resultado de `useQuery`.
 */
export function useResumen(tipo) {
  return useQuery({
    queryKey: llaveResumen(tipo),
    queryFn: ({ signal }) => obtenerResumen({ tipo, signal }),
  })
}

/**
 * Los registros de un viaje. No consulta hasta tener el viaje.
 *
 * @param {string} tipo Un valor de `TIPO_REGISTRO`.
 * @param {string} tripId Viaje a consultar.
 * @returns {object} El resultado de `useQuery`.
 */
export function useRegistros(tipo, tripId) {
  return useQuery({
    queryKey: llaveRegistros(tipo, tripId),
    enabled: Boolean(tripId),
    queryFn: ({ signal }) => obtenerRegistros({ tipo, tripId, signal }),
  })
}

/**
 * Un registro suelto. No consulta hasta tener el id.
 *
 * @param {string} tipo Un valor de `TIPO_REGISTRO`.
 * @param {string} id Registro a consultar.
 * @param {string} tripId Viaje al que pertenece.
 * @returns {object} El resultado de `useQuery`.
 */
export function useRegistro(tipo, id, tripId) {
  return useQuery({
    queryKey: llaveRegistro(tipo, id),
    enabled: Boolean(id),
    queryFn: ({ signal }) => obtenerRegistro({ tipo, id, tripId, signal }),
  })
}

/**
 * Los tickets de un registro. No consulta hasta tener el id.
 *
 * @param {string} tipo Un valor de `TIPO_REGISTRO`.
 * @param {string} id Registro del que son.
 * @param {string} tripId Viaje al que pertenece.
 * @returns {object} El resultado de `useQuery`.
 */
export function useTickets(tipo, id, tripId) {
  return useQuery({
    queryKey: [...llaveRegistro(tipo, id), "tickets"],
    enabled: Boolean(id),
    queryFn: ({ signal }) => obtenerTickets({ tipo, id, tripId, signal }),
  })
}

/**
 * Crea la mutación de un tipo, refrescando todo lo suyo al terminar.
 *
 * @param {string} tipo Un valor de `TIPO_REGISTRO`.
 * @param {Function} accion La función que hace la llamada.
 * @returns {object} El resultado de `useMutation`.
 */
function useMutacionRegistro(tipo, accion) {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: (datos) => accion({ tipo, ...datos }),
    onSuccess: () => cliente.invalidateQueries({ queryKey: ["formularios", tipo] }),
  })
}

/**
 * Guarda un registro.
 *
 * @param {string} tipo Un valor de `TIPO_REGISTRO`.
 * @returns {object} El resultado de `useMutation`.
 */
export const useGuardarRegistro = (tipo) => useMutacionRegistro(tipo, guardarRegistro)

/**
 * Elimina un registro.
 *
 * @param {string} tipo Un valor de `TIPO_REGISTRO`.
 * @returns {object} El resultado de `useMutation`.
 */
export const useEliminarRegistro = (tipo) => useMutacionRegistro(tipo, eliminarRegistro)

/**
 * Da de alta una carga manual.
 *
 * @param {string} tipo Un valor de `TIPO_REGISTRO`.
 * @returns {object} El resultado de `useMutation`.
 */
export const useCrearRegistroManual = (tipo) => useMutacionRegistro(tipo, crearRegistroManual)
