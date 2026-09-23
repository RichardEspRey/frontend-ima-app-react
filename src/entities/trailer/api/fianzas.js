import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post } from "../../../shared/api"
import { TIPO_DOCUMENTO_FIANZA } from "../model/estatusCaja"
import { LLAVE_ESTATUS_CAJAS } from "./estatusCajas"

/**
 * Sube una fianza nueva al expediente de una caja.
 *
 * Es el mismo endpoint del expediente que usa el Administrador de Cajas, con
 * el tipo de documento fijo. La anterior no se borra: el procedimiento de la
 * base la apaga y conserva el archivo, así que el histórico queda completo.
 *
 * @endpoint POST cajas_docs.php · op=Alta
 * @param {object} datos Lo que se sube.
 * @param {number} datos.cajaId Caja a la que pertenece la fianza.
 * @param {File} datos.archivo El PDF.
 * @param {string} datos.vencimiento Fecha de vencimiento en `AAAA-MM-DD`.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza la subida.
 */
export function subirFianza({ cajaId, archivo, vencimiento }) {
  return post(ENDPOINTS.cajasDocs, "Alta", {
    caja_id: cajaId,
    tipo_documento: TIPO_DOCUMENTO_FIANZA,
    fecha_vencimiento: vencimiento,
    documento: archivo,
  })
}

/**
 * Sube una fianza y refresca el tablero de estatus.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useSubirFianza() {
  const cliente = useQueryClient()

  return useMutation({
    mutationFn: subirFianza,
    onSuccess: () => cliente.invalidateQueries({ queryKey: LLAVE_ESTATUS_CAJAS }),
  })
}
