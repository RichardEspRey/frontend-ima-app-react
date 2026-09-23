import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post } from "../../../shared/api"
import { normalizarEstatusCajas } from "../model/estatusCaja"

/**
 * Llave de caché del tablero de estatus de cajas.
 *
 * @type {Array.<string>}
 */
export const LLAVE_ESTATUS_CAJAS = ["estatus-cajas"]

/**
 * Trae una fila por caja activa, con lo automático ya resuelto.
 *
 * Lo automático —viaje en turno, operador, dirección y broker— no se guarda en
 * ninguna parte: el endpoint lo calcula al consultar, así que nunca queda
 * viejo. Lo capturado a mano viene ya aplicado encima cuando sigue vigente.
 *
 * @endpoint POST cajas_estatus.php · op=getEstatusCajas
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @returns {Promise.<Array.<object>>} Las cajas normalizadas.
 * @throws {ApiError} Si la petición falla.
 */
export async function obtenerEstatusCajas(opciones = {}) {
  const cuerpo = await post(ENDPOINTS.cajasEstatus, "getEstatusCajas", {}, { signal: opciones.signal })
  const { cajas, descartados } = normalizarEstatusCajas(cuerpo?.cajas)

  if (descartados > 0) {
    console.warn(
      `cajas_estatus.php#getEstatusCajas devolvió ${descartados} caja(s) con forma inválida; se omitieron.`,
    )
  }

  return cajas
}

/**
 * El tablero de estatus de cajas.
 *
 * No se cachea como catálogo: refleja dónde está cada caja ahora mismo, así
 * que se vuelve a pedir cada vez que la pantalla se monta.
 *
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isError, error, refetch}`.
 */
export function useEstatusCajas() {
  return useQuery({
    queryKey: LLAVE_ESTATUS_CAJAS,
    queryFn: ({ signal }) => obtenerEstatusCajas({ signal }),
  })
}

/**
 * Guarda la ubicación y la observación capturadas a mano para una caja.
 *
 * Lo capturado queda amarrado al viaje en turno: el endpoint anota con qué
 * viaje se fijó, y en cuanto la caja pasa a otro deja de aplicar y vuelve a
 * mandar lo automático, sin que nadie tenga que acordarse de quitarlo.
 *
 * @endpoint POST cajas_estatus.php · op=saveEstatusCaja
 * @param {object} datos Lo capturado.
 * @param {number} datos.cajaId Caja que se está tocando.
 * @param {string} [datos.ubicacion] Una de `UBICACIONES_CAJA`.
 * @param {string} [datos.observacion] Una de `OBSERVACIONES_CAJA`.
 * @param {(number|string)} [datos.usuarioId] Quién capturó, para la bitácora.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza el guardado.
 */
export function guardarEstatusCaja({ cajaId, ubicacion, observacion, usuarioId }) {
  return post(ENDPOINTS.cajasEstatus, "saveEstatusCaja", {
    caja_id: cajaId,
    ubicacion,
    observacion,
    id_usuario: usuarioId,
  })
}

/**
 * Guarda lo capturado y deja la tabla al día.
 *
 * Pinta el cambio antes de que la API conteste y lo revierte si falla: la
 * captura es un combo por fila y esperar al servidor en cada cambio hacía que
 * el valor elegido parpadeara de vuelta al anterior.
 *
 * @returns {object} El resultado de `useMutation`.
 */
export function useGuardarEstatusCaja() {
  const cliente = useQueryClient()

  return useMutation({
    mutationFn: guardarEstatusCaja,
    onMutate: async ({ cajaId, ubicacion, observacion }) => {
      await cliente.cancelQueries({ queryKey: LLAVE_ESTATUS_CAJAS })
      const anterior = cliente.getQueryData(LLAVE_ESTATUS_CAJAS)

      cliente.setQueryData(LLAVE_ESTATUS_CAJAS, (cajas = []) =>
        cajas.map((caja) =>
          caja.caja_id === cajaId ? { ...caja, ubicacion, observacion, manual: true } : caja,
        ),
      )

      return { anterior }
    },
    onError: (_error, _variables, contexto) => {
      if (contexto?.anterior) cliente.setQueryData(LLAVE_ESTATUS_CAJAS, contexto.anterior)
    },
    onSettled: () => cliente.invalidateQueries({ queryKey: LLAVE_ESTATUS_CAJAS }),
  })
}
