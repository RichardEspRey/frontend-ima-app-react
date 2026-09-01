import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { post } from "../../../shared/api"
import { normalizarRequisitos } from "../model/requisitos"
import { camposParaGuardar, expedienteParaGuardar } from "../model/unidades"
import { descriptorDe } from "../model/tipos"

/**
 * Llave de caché del expediente de un tipo de unidad.
 *
 * @param {string} tipo Un valor de `TIPO_UNIDAD`.
 * @returns {Array} La llave para `useQuery`.
 */
export const llaveUnidades = (tipo) => ["unidades", tipo]

/**
 * Trae de una sola vez los requisitos y las unidades de un tipo.
 *
 * Los tres endpoints resuelven todo en una operación: la lista de requisitos
 * configurados y las unidades con su expediente ya adjunto.
 *
 * @endpoint POST trucks_v2.php · cajas_v2.php · drivers_v2.php · op=getInitData
 * @param {object} parametros Datos de la consulta.
 * @param {string} parametros.tipo Un valor de `TIPO_UNIDAD`.
 * @param {AbortSignal} [parametros.signal] Señal de cancelación.
 * @returns {Promise.<{requisitos: Array, unidades: Array}>} El expediente completo.
 * @throws {ApiError} Si la petición falla.
 */
export async function obtenerUnidades({ tipo, signal }) {
  const { endpoint, campoLista } = descriptorDe(tipo)
  const cuerpo = await post(endpoint, "getInitData", {}, { signal })
  const { requisitos, descartados } = normalizarRequisitos(cuerpo?.requisitos)

  if (descartados > 0) {
    console.warn(`${endpoint}#getInitData descartó ${descartados} requisito(s).`)
  }

  return { requisitos, unidades: Array.isArray(cuerpo?.[campoLista]) ? cuerpo[campoLista] : [] }
}

/**
 * Guarda una unidad con su expediente.
 *
 * @endpoint POST · op=saveTruck | saveTrailer | saveDriver
 * @param {object} parametros Datos del guardado.
 * @param {string} parametros.tipo Un valor de `TIPO_UNIDAD`.
 * @param {object} parametros.unidad Los datos del formulario.
 * @param {Array} parametros.requisitos Los requisitos del expediente.
 * @param {object} [parametros.archivos] Los archivos recién escogidos.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza el guardado.
 */
export function guardarUnidad({ tipo, unidad, requisitos, archivos = {} }) {
  const { endpoint, ops } = descriptorDe(tipo)

  return post(endpoint, ops.guardar, {
    ...camposParaGuardar(tipo, unidad),
    ...expedienteParaGuardar(requisitos, unidad?.docs, archivos),
  })
}

/**
 * Elimina una unidad.
 *
 * @endpoint POST · op=deleteTruck | deleteTrailer | deleteDriver
 * @param {object} parametros Datos del borrado.
 * @param {string} parametros.tipo Un valor de `TIPO_UNIDAD`.
 * @param {string} parametros.id Identificador de la unidad.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza el borrado.
 */
export function eliminarUnidad({ tipo, id }) {
  const { endpoint, ops, campoId } = descriptorDe(tipo)
  return post(endpoint, ops.eliminar, { [campoId]: id })
}

/**
 * Da de baja a un conductor, con su motivo y su fecha.
 *
 * Una baja no borra: el expediente sigue existiendo y el conductor pasa a la
 * pestaña de bajas. Solo el tipo conductor la admite.
 *
 * @endpoint POST drivers_v2.php · op=darDeBajaDriver
 * @param {object} parametros Datos de la baja.
 * @param {string} parametros.tipo Un valor de `TIPO_UNIDAD`.
 * @param {string} parametros.id Conductor a dar de baja.
 * @param {string} parametros.motivo Por qué se va.
 * @param {string} parametros.fecha Cuándo se va.
 * @param {string} [parametros.observaciones] Detalle libre.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la baja o el tipo no admite bajas.
 */
export function darDeBaja({ tipo, id, motivo, fecha, observaciones }) {
  const { endpoint, ops, campoId } = descriptorDe(tipo)
  if (!ops.baja) throw new Error(`El tipo ${tipo} no admite bajas.`)

  return post(endpoint, ops.baja, {
    [campoId]: id,
    motivo,
    fecha_baja: fecha,
    observaciones,
  })
}

/**
 * Crea un requisito nuevo en el expediente de un tipo.
 *
 * @endpoint POST · op=addConfig
 * @param {object} parametros Datos del requisito.
 * @param {string} parametros.tipo Un valor de `TIPO_UNIDAD`.
 * @param {object} parametros.requisito Etiqueta, categoría, tipo y vencimiento.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la creación.
 */
export function crearRequisito({ tipo, requisito }) {
  const { endpoint } = descriptorDe(tipo)
  return post(endpoint, "addConfig", {
    label: requisito?.label,
    categoria: requisito?.categoria,
    tipo: requisito?.tipo,
    tiene_vencimiento: Boolean(requisito?.tiene_vencimiento),
  })
}

/**
 * Elimina un requisito del expediente.
 *
 * Los documentos ya subidos contra ese requisito siguen en la base; lo que
 * desaparece es la exigencia.
 *
 * @endpoint POST · op=deleteConfig
 * @param {object} parametros Datos del borrado.
 * @param {string} parametros.tipo Un valor de `TIPO_UNIDAD`.
 * @param {string} parametros.keyName Clave del requisito.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza el borrado.
 */
export function eliminarRequisito({ tipo, keyName }) {
  const { endpoint } = descriptorDe(tipo)
  return post(endpoint, "deleteConfig", { key_name: keyName })
}

/**
 * Muestra u oculta una columna del expediente para todos los usuarios.
 *
 * Solo camiones y conductores la guardan: la tabla de cajas no tiene la columna
 * `oculto_en_tabla` en la base, así que ahí la preferencia vive en la pantalla
 * y se pierde al recargar. Está anotado en `docs/MODULOS/unidades.md`.
 *
 * @endpoint POST · op=updateColumnVisibility
 * @param {object} parametros Datos del cambio.
 * @param {string} parametros.tipo Un valor de `TIPO_UNIDAD`.
 * @param {string} parametros.keyName Clave del requisito.
 * @param {boolean} parametros.oculto Si debe quedar oculta.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza el cambio o el tipo no lo guarda.
 */
export function cambiarVisibilidadColumna({ tipo, keyName, oculto }) {
  const { endpoint, columnasPersistidas } = descriptorDe(tipo)
  if (!columnasPersistidas) {
    throw new Error(`El tipo ${tipo} no guarda la visibilidad de columnas en el servidor.`)
  }

  return post(endpoint, "updateColumnVisibility", {
    key_name: keyName,
    oculto_en_tabla: oculto ? 1 : 0,
  })
}

/**
 * Requisitos y unidades de un tipo.
 *
 * @param {string} tipo Un valor de `TIPO_UNIDAD`.
 * @returns {object} El resultado de `useQuery`.
 */
export function useUnidades(tipo) {
  return useQuery({
    queryKey: llaveUnidades(tipo),
    queryFn: ({ signal }) => obtenerUnidades({ tipo, signal }),
  })
}

/**
 * Crea la mutación de un tipo de unidad, refrescando su lista al terminar.
 *
 * @param {string} tipo Un valor de `TIPO_UNIDAD`.
 * @param {Function} accion La función que hace la llamada.
 * @returns {object} El resultado de `useMutation`.
 */
function useMutacionUnidad(tipo, accion) {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: (datos) => accion({ tipo, ...datos }),
    onSuccess: () => cliente.invalidateQueries({ queryKey: llaveUnidades(tipo) }),
  })
}

/**
 * Guarda una unidad.
 *
 * @param {string} tipo Un valor de `TIPO_UNIDAD`.
 * @returns {object} El resultado de `useMutation`.
 */
export const useGuardarUnidad = (tipo) => useMutacionUnidad(tipo, guardarUnidad)

/**
 * Elimina una unidad.
 *
 * @param {string} tipo Un valor de `TIPO_UNIDAD`.
 * @returns {object} El resultado de `useMutation`.
 */
export const useEliminarUnidad = (tipo) => useMutacionUnidad(tipo, eliminarUnidad)

/**
 * Da de baja a un conductor.
 *
 * @param {string} tipo Un valor de `TIPO_UNIDAD`.
 * @returns {object} El resultado de `useMutation`.
 */
export const useDarDeBaja = (tipo) => useMutacionUnidad(tipo, darDeBaja)

/**
 * Crea un requisito del expediente.
 *
 * @param {string} tipo Un valor de `TIPO_UNIDAD`.
 * @returns {object} El resultado de `useMutation`.
 */
export const useCrearRequisito = (tipo) => useMutacionUnidad(tipo, crearRequisito)

/**
 * Elimina un requisito del expediente.
 *
 * @param {string} tipo Un valor de `TIPO_UNIDAD`.
 * @returns {object} El resultado de `useMutation`.
 */
export const useEliminarRequisito = (tipo) => useMutacionUnidad(tipo, eliminarRequisito)

/**
 * Muestra u oculta una columna.
 *
 * @param {string} tipo Un valor de `TIPO_UNIDAD`.
 * @returns {object} El resultado de `useMutation`.
 */
export const useCambiarVisibilidadColumna = (tipo) =>
  useMutacionUnidad(tipo, cambiarVisibilidadColumna)
