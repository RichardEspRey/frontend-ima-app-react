import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post } from "../../../shared/api"
import { normalizarDocumentos } from "../model/documento"

/**
 * Llave de caché de los documentos corporativos.
 *
 * @type {Array.<string>}
 */
export const LLAVE_DOCUMENTOS = ["documentos", "ima"]

/**
 * Trae los requisitos documentales y lo capturado para cada uno.
 *
 * La respuesta trae dos cosas distintas: `requisitos` es una lista y `valores` un
 * **objeto indexado por `key_name`**. Por eso usa `post` y no `postLista`.
 *
 * @endpoint POST IMA_Docsv2.php · op=getAll
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<object>} `{requisitos, valores}` ya validados.
 * @throws {ApiError} Si la API falla.
 */
export async function obtenerDocumentos(opciones = {}) {
  const cuerpo = await post(ENDPOINTS.documentosV2, "getAll", {}, { signal: opciones.signal })
  const { requisitos, valores, descartados } = normalizarDocumentos(cuerpo)

  if (descartados > 0) {
    console.warn(
      `IMA_Docsv2.php#getAll devolvió ${descartados} requisito(s) inválidos; se omitieron.`,
    )
  }

  return { requisitos, valores }
}

/**
 * Guarda el valor de un requisito: sube el archivo, el texto y la vigencia.
 *
 * @endpoint POST IMA_Docsv2.php · op=Alta
 * @param {object} datos Lo capturado.
 * @param {string} datos.keyName Clave del requisito.
 * @param {string} [datos.valorTexto] Valor, si el requisito es de tipo texto.
 * @param {string} [datos.fechaVencimiento] Vigencia en formato `YYYY-MM-DD`.
 * @param {File} [datos.archivo] Documento a subir.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function guardarDocumento({ keyName, valorTexto, fechaVencimiento, archivo }) {
  return post(ENDPOINTS.documentosV2, "Alta", {
    tipo_documento: keyName,
    valor_texto: valorTexto,
    fecha_vencimiento: fechaVencimiento,
    documento: archivo,
  })
}

/**
 * Crea un requisito documental nuevo.
 *
 * @endpoint POST IMA_Docsv2.php · op=addConfig
 * @param {object} datos Definición del requisito.
 * @param {string} datos.label Nombre visible.
 * @param {string} datos.region `MEX` o `USA`.
 * @param {string} datos.tipo `file` o `text`.
 * @param {boolean} datos.tieneVencimiento Si se le controla vigencia.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function crearRequisito({ label, region, tipo, tieneVencimiento }) {
  return post(ENDPOINTS.documentosV2, "addConfig", {
    label,
    region,
    tipo,
    tiene_vencimiento: tieneVencimiento,
  })
}

/**
 * Retira un requisito del panel.
 *
 * No borra lo capturado: el documento se conserva y solo deja de pedirse.
 *
 * @endpoint POST IMA_Docsv2.php · op=deleteConfig
 * @param {string} keyName Clave del requisito.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la operación.
 */
export function eliminarRequisito(keyName) {
  return post(ENDPOINTS.documentosV2, "deleteConfig", { key_name: keyName })
}

/**
 * Requisitos y valores, cacheados.
 *
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function useDocumentos() {
  return useQuery({
    queryKey: LLAVE_DOCUMENTOS,
    queryFn: ({ signal }) => obtenerDocumentos({ signal }),
  })
}

/**
 * Crea una mutación que refresca los documentos al terminar.
 *
 * Las tres operaciones invalidan lo mismo, así que comparten fábrica en vez de
 * repetir el `onSuccess` tres veces.
 *
 * @param {Function} mutationFn La operación a ejecutar.
 * @returns {Function} Un hook de mutación listo para usar.
 */
const crearMutacion = (mutationFn) =>
  function useMutacionDocumentos() {
    const cliente = useQueryClient()
    return useMutation({
      mutationFn,
      onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_DOCUMENTOS }),
    })
  }

/**
 * Guarda el valor de un requisito y refresca el panel.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export const useGuardarDocumento = crearMutacion(guardarDocumento)

/**
 * Crea un requisito y refresca el panel.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export const useCrearRequisito = crearMutacion(crearRequisito)

/**
 * Retira un requisito y refresca el panel.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export const useEliminarRequisito = crearMutacion(eliminarRequisito)
