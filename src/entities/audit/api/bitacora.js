import { useQuery } from "@tanstack/react-query"
import { ENDPOINTS, post } from "../../../shared/api"

/**
 * Llave raíz de las consultas de la bitácora.
 *
 * @type {Array.<string>}
 */
export const LLAVE_BITACORA = ["bitacora"]

/**
 * Una página de la bitácora, con filtros.
 *
 * No trae los datos de cada acción, que pueden pesar; esos los da {@link obtenerDetalleBitacora}.
 *
 * @endpoint POST bitacora.php · op=listar
 * @param {object} consulta Qué pedir.
 * @param {number} consulta.pagina Página, empezando en cero.
 * @param {number} consulta.porPagina Renglones por página (el servidor topa en 100).
 * @param {string} [consulta.desde_utc] Desde cuándo, en UTC.
 * @param {string} [consulta.hasta_utc] Hasta cuándo, exclusivo, en UTC.
 * @param {string} [consulta.usuario] Id de usuario, `sin` para las filas sin usuario, o vacío.
 * @param {string} [consulta.archivo] Un archivo de la API, o vacío.
 * @param {string} [consulta.resultado] `exito`, `error` o vacío.
 * @param {string} [consulta.texto] Texto a buscar en la operación y en los datos.
 * @param {AbortSignal} [consulta.signal] Señal de cancelación.
 * @returns {Promise.<{total: number, filas: Array.<object>}>} La página y cuántas hay en total.
 * @throws {ApiError} Si la API falla o la persona no tiene permiso.
 */
export async function obtenerBitacora({ pagina, porPagina, desde_utc, hasta_utc, usuario, archivo, resultado, texto, signal }) {
  const cuerpo = await post(
    ENDPOINTS.bitacora,
    "listar",
    {
      pagina,
      por_pagina: porPagina,
      desde_utc: desde_utc || undefined,
      hasta_utc: hasta_utc || undefined,
      usuario_id: usuario || undefined,
      archivo: archivo || undefined,
      resultado: resultado || undefined,
      texto: texto || undefined,
    },
    { signal },
  )
  return { total: Number(cuerpo?.total ?? 0), filas: Array.isArray(cuerpo?.filas) ? cuerpo.filas : [] }
}

/**
 * Una acción completa: los datos que se enviaron y los cambios registrados.
 *
 * @endpoint POST bitacora.php · op=detalle
 * @param {object} parametros Qué pedir.
 * @param {(string|number)} parametros.id El renglón de la bitácora.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<{fila: object, cambios: Array.<object>}>} La acción y sus cambios.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerDetalleBitacora({ id, signal }) {
  const cuerpo = await post(ENDPOINTS.bitacora, "detalle", { id }, { signal })
  return { fila: cuerpo?.fila ?? null, cambios: Array.isArray(cuerpo?.cambios) ? cuerpo.cambios : [] }
}

/**
 * Los usuarios y archivos que aparecen en la bitácora, para los selectores.
 *
 * @endpoint POST bitacora.php · op=getFiltros
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<{usuarios: Array.<object>, archivos: Array.<string>}>} Las opciones.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerFiltrosBitacora(opciones = {}) {
  const cuerpo = await post(ENDPOINTS.bitacora, "getFiltros", {}, { signal: opciones.signal })
  return {
    usuarios: Array.isArray(cuerpo?.usuarios) ? cuerpo.usuarios : [],
    archivos: Array.isArray(cuerpo?.archivos) ? cuerpo.archivos : [],
  }
}

/**
 * Una página de la bitácora; mientras llega la siguiente se queda la anterior a la vista.
 *
 * @param {object} consulta Lo que espera {@link obtenerBitacora}.
 * @param {object} [opciones] Ajustes.
 * @param {boolean} [opciones.habilitada=true] Si debe consultarse.
 * @returns {object} El resultado de `useQuery`.
 */
export function useBitacora(consulta, { habilitada = true } = {}) {
  return useQuery({
    queryKey: [...LLAVE_BITACORA, "lista", consulta],
    queryFn: ({ signal }) => obtenerBitacora({ ...consulta, signal }),
    enabled: habilitada,
    placeholderData: (anterior) => anterior,
    staleTime: 0,
  })
}

/**
 * El detalle de una acción. No consulta hasta que hay un id.
 *
 * @param {(string|number|null)} id El renglón abierto.
 * @returns {object} El resultado de `useQuery`.
 */
export function useDetalleBitacora(id) {
  return useQuery({
    queryKey: [...LLAVE_BITACORA, "detalle", String(id)],
    queryFn: ({ signal }) => obtenerDetalleBitacora({ id, signal }),
    enabled: Boolean(id),
  })
}

/**
 * Las opciones de los selectores de la bitácora.
 *
 * @param {boolean} [habilitada=true] Si debe consultarse.
 * @returns {object} El resultado de `useQuery`.
 */
export function useFiltrosBitacora(habilitada = true) {
  return useQuery({
    queryKey: [...LLAVE_BITACORA, "filtros"],
    queryFn: ({ signal }) => obtenerFiltrosBitacora({ signal }),
    enabled: habilitada,
  })
}
