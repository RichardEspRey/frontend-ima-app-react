import { useCallback, useMemo, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

import { agruparPorDia, llaveNotificaciones, useNotificaciones } from "../../../entities/notification"
import { useAvisosDeInspecciones, useRecibeAvisoInspeccion } from "../../../entities/maintenance-point"
import { useNomenclaturasDeViajes } from "../../../entities/trip"
import { useSesion } from "../../../shared/auth"
import { useAvisosDerivados } from "./useAvisosDerivados"

/**
 * Las tres vistas de la campana.
 *
 * @readonly
 * @enum {string}
 */
export const FILTRO_CAMPANA = {
  TODAS: "todas",
  NO_LEIDAS: "noLeidas",
  LEIDAS: "leidas",
}

/**
 * Dónde guarda el navegador lo que esta persona ya leyó.
 *
 * Va por persona: en las máquinas de oficina se turnan varias, y sin el
 * identificador una heredaría los avisos leídos de la anterior.
 *
 * @param {(string|number)} [idUsuario] Identificador de la persona.
 * @returns {string} La llave de `localStorage`.
 */
export const llaveVistas = (idUsuario) => `notificaciones-vistas-${idUsuario}`

/**
 * Dónde guarda el navegador las notificaciones que la persona quitó con la ✕.
 *
 * Abrir una notificación solo la da por leída; quitarla la saca de la campana.
 * Va por persona por la misma razón que {@link llaveVistas}.
 *
 * @param {(string|number)} [idUsuario] Identificador de la persona.
 * @returns {string} La llave de `localStorage`.
 */
export const llaveOcultas = (idUsuario) => `notificaciones-ocultas-${idUsuario}`

/**
 * Cuántos identificadores se guardan como máximo en cada lista del navegador.
 *
 * @type {number}
 */
export const MAX_GUARDADAS = 500

/**
 * Quita de la lista las notificaciones que la persona quitó con la ✕.
 *
 * @param {Array.<object>} notificaciones Las notificaciones.
 * @param {Set.<string>} ocultas Los identificadores quitados.
 * @returns {Array.<object>} Las que siguen en la campana.
 *
 * @example
 * sinOcultas([{ id: "1" }, { id: "2" }], new Set(["1"])) // [{ id: "2" }]
 */
export function sinOcultas(notificaciones, ocultas) {
  return notificaciones.filter((una) => !ocultas.has(String(una.id)))
}

/**
 * Lee del navegador los identificadores ya leídos.
 *
 * Nunca lanza: en una ventana privada o con el almacenamiento bloqueado, leer
 * `localStorage` falla, y eso no es motivo para dejar a la persona sin campana.
 * Lo peor que pasa es que todo se vea como no leído.
 *
 * @param {string} llave Dónde se guardaron.
 * @returns {Set.<string>} Los identificadores leídos.
 */
function leerVistas(llave) {
  try {
    const guardado = JSON.parse(localStorage.getItem(llave) || "[]")
    return new Set(Array.isArray(guardado) ? guardado.map(String) : [])
  } catch {
    return new Set()
  }
}

/**
 * Guarda en el navegador los identificadores ya leídos.
 *
 * @param {string} llave Dónde guardarlos.
 * @param {Set.<string>} vistas Los identificadores leídos.
 * @returns {void}
 */
function guardarVistas(llave, vistas) {
  try {
    localStorage.setItem(llave, JSON.stringify([...vistas].slice(-MAX_GUARDADAS)))
  } catch {
    return
  }
}

/**
 * Cada cuánto se vuelven a pedir las inspecciones para avisar de las nuevas.
 *
 * @type {number}
 */
export const INTERVALO_INSPECCIONES_MS = 60000

/**
 * Cada cuánto se piden las inspecciones con la ventana oculta. No se detiene,
 * porque el aviso suena y quien minimizó la app cuenta con oírlo.
 *
 * @type {number}
 */
export const INTERVALO_INSPECCIONES_OCULTA_MS = 120000

/**
 * Cada cuánto se vuelve a pedir quién recibe el aviso de inspección.
 *
 * @type {number}
 */
export const INTERVALO_SUSCRIPCION_MS = 300000

/**
 * Lleva el estado de la campana de notificaciones.
 *
 * No sondea por su cuenta: lee la misma caché que el aviso emergente, que es
 * quien pregunta al servidor y quien refresca la lista cuando llega algo. Al
 * abrir la campana se vuelve a pedir, para que lo que se ve esté al día.
 * Lo único propio de la campana es qué se ha leído y qué se quitó, que viven
 * en el navegador porque el backend no lo guarda. Solo cuenta como leída la que
 * se abre con un clic; abrir o cerrar la campana no marca nada. La ✕ de cada
 * renglón la quita para que no se acumule.
 *
 * A los BL firmados se suman las inspecciones que llegan a Reparaciones, solo
 * para quien está en la lista de Inspecciones de Notificaciones manager, y los
 * avisos calculados en el front: diesel, sin fallas, sin inspección,
 * programación y despacho.
 *
 * @returns {object} Lo que el componente necesita para pintarse.
 */
export function useCampanaNotificaciones() {
  const { usuario, esTotal } = useSesion()
  const queryClient = useQueryClient()
  const recibeInspecciones = useRecibeAvisoInspeccion(usuario?.id)
  const llave = llaveVistas(usuario?.id)

  const llaveDeOcultas = llaveOcultas(usuario?.id)
  const [ocultas, setOcultas] = useState(() => leerVistas(llaveDeOcultas))
  const { data: delServidor = [] } = useNotificaciones(usuario?.id)
  const { avisos: inspecciones } = useAvisosDeInspecciones({ enabled: recibeInspecciones })
  const { avisos: derivados } = useAvisosDerivados()
  const notificaciones = useMemo(
    () =>
      sinOcultas([...delServidor, ...inspecciones, ...derivados], ocultas).sort((a, b) =>
        String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")),
      ),
    [delServidor, inspecciones, derivados, ocultas],
  )
  const [vistas, setVistas] = useState(() => leerVistas(llave))
  const [filtro, setFiltro] = useState(FILTRO_CAMPANA.TODAS)
  const nomenclaturas = useNomenclaturasDeViajes(delServidor.map((una) => una.trip_id))

  const sinLeer = useMemo(
    () => notificaciones.filter((una) => !vistas.has(String(una.id))).length,
    [notificaciones, vistas],
  )

  const grupos = useMemo(() => {
    const visibles = notificaciones.filter((una) => {
      if (filtro === FILTRO_CAMPANA.NO_LEIDAS) return !vistas.has(String(una.id))
      if (filtro === FILTRO_CAMPANA.LEIDAS) return vistas.has(String(una.id))
      return true
    })
    return agruparPorDia(visibles)
  }, [notificaciones, vistas, filtro])

  const marcarLeida = useCallback(
    (notificacion) => {
      setVistas((previas) => {
        const actualizadas = new Set(previas)
        actualizadas.add(String(notificacion.id))
        guardarVistas(llave, actualizadas)
        return actualizadas
      })
    },
    [llave],
  )

  const ocultar = useCallback(
    (notificacion) => {
      setOcultas((previas) => {
        const actualizadas = new Set(previas)
        actualizadas.add(String(notificacion.id))
        guardarVistas(llaveDeOcultas, actualizadas)
        return actualizadas
      })
    },
    [llaveDeOcultas],
  )

  const refrescar = useCallback(
    () => queryClient.invalidateQueries({ queryKey: llaveNotificaciones(usuario?.id) }),
    [queryClient, usuario?.id],
  )

  const estaLeida = useCallback((notificacion) => vistas.has(String(notificacion.id)), [vistas])

  const viajeDe = useCallback(
    (notificacion) => {
      if (!notificacion.trip_id) return notificacion.mensaje
      return nomenclaturas.get(String(notificacion.trip_id)) || "Viaje"
    },
    [nomenclaturas],
  )

  return {
    grupos,
    sinLeer,
    filtro,
    setFiltro,
    estaLeida,
    viajeDe,
    marcarLeida,
    ocultar,
    refrescar,
    puedeAdministrar: esTotal,
  }
}
