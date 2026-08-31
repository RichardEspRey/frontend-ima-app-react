import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista } from "../../../shared/api"
import { normalizarEmpleados } from "../model/personal"

/**
 * Llave de caché de la lista de personal. Las mutaciones la invalidan para que
 * la tabla se actualice sola, sin que la pantalla tenga que volver a pedirla.
 *
 * @type {Array.<string>}
 */
export const LLAVE_PERSONAL = ["personal"]

/**
 * Trae todo el personal de nómina, validado.
 *
 * @endpoint POST personal_admin.php · op=getAll
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array.<Empleado>>} Empleados normalizados.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerPersonal(opciones = {}) {
  const filas = await postLista(ENDPOINTS.personalAdmin, "getAll", {
    signal: opciones.signal,
  })
  const { empleados, descartados } = normalizarEmpleados(filas)
  if (descartados > 0) {
    console.warn(
      `personal_admin.php#getAll devolvió ${descartados} registro(s) con forma inválida; se omitieron.`,
    )
  }
  return empleados
}

/**
 * Da de alta o actualiza un empleado, según traiga `id` o no.
 *
 * @endpoint POST personal_admin.php · op=add | op=update
 * @param {object} empleado Datos ya validados del formulario.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function guardarEmpleado(empleado) {
  const { id, ...campos } = empleado
  return id
    ? post(ENDPOINTS.personalAdmin, "update", { id, ...campos })
    : post(ENDPOINTS.personalAdmin, "add", campos)
}

/**
 * Elimina un empleado. El historial de pagos previos se conserva.
 *
 * @endpoint POST personal_admin.php · op=delete
 * @param {string} id Identificador del empleado.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function eliminarEmpleado(id) {
  return post(ENDPOINTS.personalAdmin, "delete", { id })
}

/**
 * Lista de personal, cacheada y compartida entre componentes.
 *
 * Dos pantallas que la pidan a la vez hacen **una** sola petición, y al volver
 * de otra vista la tabla se pinta al instante con lo cacheado mientras se
 * revalida en segundo plano.
 *
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error, refetch}`.
 */
export function usePersonal() {
  return useQuery({
    queryKey: LLAVE_PERSONAL,
    queryFn: ({ signal }) => obtenerPersonal({ signal }),
  })
}

/**
 * Guarda un empleado y refresca la lista al terminar.
 *
 * @returns {object} El resultado de `useMutation`: `{mutateAsync, isPending, error}`.
 */
export function useGuardarEmpleado() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: guardarEmpleado,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_PERSONAL }),
  })
}

/**
 * Elimina un empleado y refresca la lista al terminar.
 *
 * @returns {object} El resultado de `useMutation`: `{mutateAsync, isPending, error}`.
 */
export function useEliminarEmpleado() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: eliminarEmpleado,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_PERSONAL }),
  })
}
