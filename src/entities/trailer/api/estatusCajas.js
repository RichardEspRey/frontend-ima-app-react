import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ENDPOINTS, post } from "../../../shared/api"
import { normalizarEstatusCajas, recortarComentario } from "../model/estatusCaja"

/**
 * Llave de caché del tablero de estatus de cajas.
 *
 * @type {Array.<string>}
 */
export const LLAVE_ESTATUS_CAJAS = ["estatus-cajas"]

/**
 * Cada cuánto se vuelve a pedir el tablero mientras está abierto, en milisegundos.
 *
 * La operación lo deja abierto en pantalla todo el día y reportó que «no se
 * actualizan las cajas»: cargaba al entrar y nada más. Cinco minutos es lo que
 * pidió Emiliano, y con el refresco solo en primer plano son doce peticiones por
 * hora y por persona, que el hosting aguanta de sobra.
 *
 * @type {number}
 */
export const REFRESCO_TABLERO_MS = 5 * 60 * 1000

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
 * El tablero de estatus de cajas, al día mientras esté a la vista.
 *
 * No se cachea como catálogo: refleja dónde está cada caja ahora mismo, así
 * que se vuelve a pedir cada vez que la pantalla se monta, cada
 * {@link REFRESCO_TABLERO_MS} y al volver a la ventana. El refresco de fondo no
 * levanta `isLoading` —solo `isFetching`—, así que la tabla no parpadea encima
 * de quien está escribiendo un comentario.
 *
 * Con la pestaña en segundo plano el reloj se detiene: `refetchIntervalInBackground`
 * queda en su valor por omisión a propósito, para no golpear el hosting desde
 * pantallas que nadie está mirando.
 *
 * @returns {object} El resultado de `useQuery`: `{data, isLoading, isFetching, isError, error, refetch}`.
 */
export function useEstatusCajas() {
  return useQuery({
    queryKey: LLAVE_ESTATUS_CAJAS,
    queryFn: ({ signal }) => obtenerEstatusCajas({ signal }),
    refetchInterval: REFRESCO_TABLERO_MS,
  })
}

/**
 * Guarda lo que se captura a mano para una caja: ubicación, observación y
 * comentario.
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
 * @param {string} [datos.comentario] Nota libre; se recorta a `LARGO_COMENTARIO`.
 * @param {(number|string)} [datos.usuarioId] Quién capturó, para la bitácora.
 * @returns {Promise.<object>} La respuesta de la API.
 * @throws {ApiError} Si la API rechaza el guardado.
 */
export function guardarEstatusCaja({ cajaId, ubicacion, observacion, comentario, usuarioId }) {
  return post(ENDPOINTS.cajasEstatus, "saveEstatusCaja", {
    caja_id: cajaId,
    ubicacion,
    observacion,
    comentario: recortarComentario(comentario),
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
    onMutate: async ({ cajaId, ubicacion, observacion, comentario }) => {
      await cliente.cancelQueries({ queryKey: LLAVE_ESTATUS_CAJAS })
      const anterior = cliente.getQueryData(LLAVE_ESTATUS_CAJAS)

      cliente.setQueryData(LLAVE_ESTATUS_CAJAS, (cajas = []) =>
        cajas.map((caja) =>
          caja.caja_id === cajaId
            ? { ...caja, ubicacion, observacion, comentario: comentario ?? null, manual: true }
            : caja,
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
