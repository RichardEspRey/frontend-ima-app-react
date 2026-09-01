import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post } from "../../../shared/api"
import { archivosNuevos, etapaParaGuardar, etapasEliminadas } from "../model/edicion"

/**
 * Llave de caché del detalle de un viaje próximo.
 *
 * @param {string} tripId Viaje a consultar.
 * @returns {Array} La llave para `useQuery`.
 */
export const llaveViajeUpcoming = (tripId) => ["dispatch", "upcoming", tripId]

/**
 * Trae un viaje con sus etapas, documentos y paradas.
 *
 * @endpoint POST new_trips.php · op=getById
 * @param {object} parametros Datos de la consulta.
 * @param {string} parametros.tripId Viaje a consultar.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<object>} La respuesta completa, con `trip` y `etapas`.
 * @throws {ApiError} Si la API falla o el viaje no existe.
 */
export async function obtenerViajePorId({ tripId, signal }) {
  const cuerpo = await post(ENDPOINTS.nuevosViajes, "getById", { trip_id: tripId }, { signal })
  if (!cuerpo?.trip) throw new Error("El viaje no existe o ya no está disponible.")
  return cuerpo
}

/**
 * Guarda los cambios de un viaje próximo, con sus etapas y archivos nuevos.
 *
 * Los campos escalares del viaje van sueltos, las etapas como JSON, y cada
 * archivo nuevo en un campo propio nombrado por su posición.
 *
 * @endpoint POST new_trips.php · op=UpdateUpcoming
 * @param {object} parametros Datos del guardado.
 * @param {string} parametros.tripId Viaje a actualizar.
 * @param {object} parametros.datosViaje Campos del viaje.
 * @param {Array} parametros.etapas Las etapas en pantalla.
 * @param {Array} [parametros.etapasIniciales] Las etapas como llegaron, para detectar las borradas.
 * @param {Function} parametros.formatearFecha Convierte una fecha al formato de la API.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza el guardado.
 */
export function guardarViajeUpcoming({
  tripId,
  datosViaje,
  etapas,
  etapasIniciales = [],
  formatearFecha,
}) {
  const eliminadas = etapasEliminadas(etapasIniciales, etapas)

  return post(ENDPOINTS.nuevosViajes, "UpdateUpcoming", {
    trip_id: tripId,
    ...datosViaje,
    etapas: etapas.map((etapa) => etapaParaGuardar(etapa, formatearFecha)),
    ...(eliminadas.length ? { deleted_stage_ids: eliminadas } : {}),
    ...archivosNuevos(etapas),
  })
}

/**
 * Guarda los números de factura de las etapas de un viaje.
 *
 * Va aparte del guardado del viaje porque vive en otro endpoint. Que falle no
 * invalida lo ya guardado, así que quien la llama decide si avisar.
 *
 * @endpoint POST update_invoices.php · op=update_invoices
 * @param {object} parametros Datos del guardado.
 * @param {string} parametros.tripId Viaje al que pertenecen las etapas.
 * @param {Array} parametros.etapas Las etapas con su `invoice_number`.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza el guardado.
 */
export function guardarInvoices({ tripId, etapas }) {
  return post(ENDPOINTS.updateInvoices, "update_invoices", {
    trip_id: tripId,
    invoices: etapas.map((etapa) => ({
      stage_number: etapa.stage_number,
      invoice_number: etapa.invoice_number,
    })),
  })
}

/**
 * Detalle de un viaje próximo. No consulta hasta tener un id.
 *
 * @param {string} tripId Viaje a consultar.
 * @returns {object} El resultado de `useQuery`.
 */
export function useViajeUpcoming(tripId) {
  return useQuery({
    queryKey: llaveViajeUpcoming(tripId),
    enabled: Boolean(tripId),
    queryFn: ({ signal }) => obtenerViajePorId({ tripId, signal }),
  })
}

/**
 * Guarda un viaje próximo e invalida su detalle.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useGuardarViajeUpcoming() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: guardarViajeUpcoming,
    onSuccess: (_datos, variables) => {
      cliente.invalidateQueries({ queryKey: llaveViajeUpcoming(variables.tripId) })
    },
  })
}
