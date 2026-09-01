import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post, postLista, FRESCURA_CATALOGO_MS } from "../../../shared/api"

/**
 * Compañías dadas de alta.
 *
 * @endpoint POST companies.php · op=getCompanies
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array>} La lista, o `[]` si la API no la devolvió.
 * @throws {ApiError} Si la petición falla.
 */
export function obtenerCompanias(opciones = {}) {
  return postLista(ENDPOINTS.companies, "getCompanies", { campo: "companies", signal: opciones.signal })
}

/**
 * Compañías dadas de alta.
 *
 * Es un catálogo: se cachea {@link FRESCURA_CATALOGO_MS} y se comparte entre
 * todas las pantallas que lo pidan, así que varias a la vez hacen una sola
 * petición en lugar de una cada una.
 *
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error}`.
 */
export function useCompanias() {
  return useQuery({
    queryKey: ["companias"],
    queryFn: ({ signal }) => obtenerCompanias({ signal }),
    staleTime: FRESCURA_CATALOGO_MS,
  })
}

/**
 * Da de alta una compañía desde el propio selector.
 *
 * Quien está capturando un viaje descubre que la compañía no está dada de alta
 * justo cuando la necesita; poder crearla ahí evita abandonar el formulario a
 * medias.
 *
 * @endpoint POST companies.php · op=CreateCompany
 * @param {string} nombre Nombre de la compañía.
 * @returns {Promise.<object>} La compañía creada, con su id.
 * @throws {ApiError} Si la API rechaza el alta.
 */
export async function crearCompania(nombre) {
  const cuerpo = await post(ENDPOINTS.companies, "CreateCompany", { nombre_compania: nombre })
  return cuerpo?.company
}

/**
 * Da de alta una compañía y refresca el catálogo.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useCrearCompania() {
  const cliente = useQueryClient()
  return useMutation({
    mutationFn: crearCompania,
    onSuccess: () => cliente.invalidateQueries({ queryKey: ["companias"] }),
  })
}
