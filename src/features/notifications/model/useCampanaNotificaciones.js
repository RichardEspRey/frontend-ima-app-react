import { useCallback, useMemo, useState } from "react"

import { agruparPorDia, sinAnunciar, useNotificaciones } from "../../../entities/notification"
import { useAvisosDeInspecciones, useRecibeAvisoInspeccion } from "../../../entities/maintenance-point"
import { useNomenclaturasDeViajes } from "../../../entities/trip"
import { useSesion } from "../../../shared/auth"

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
 * Dónde guarda el navegador las notificaciones que la persona ya abrió.
 *
 * Una notificación abierta se quita de la campana; va por persona por la misma
 * razón que {@link llaveVistas}.
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
 * Quita de la lista las notificaciones que la persona ya abrió.
 *
 * @param {Array.<object>} notificaciones Las notificaciones.
 * @param {Set.<string>} ocultas Los identificadores abiertos.
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
 * Cada cuánto se vuelve a pedir quién recibe el aviso de inspección.
 *
 * @type {number}
 */
export const INTERVALO_SUSCRIPCION_MS = 300000

/**
 * Lleva el estado de la campana de notificaciones.
 *
 * Se apoya en la misma consulta que el aviso emergente, así que las dos cosas
 * comparten una sola petición cada quince segundos en lugar de una cada una.
 * Lo único propio de la campana es qué se ha leído y qué se abrió, que viven
 * en el navegador porque el backend no lo guarda. Lo que se abre se quita de la
 * campana para que no se acumule.
 *
 * A los BL firmados se suman las inspecciones que llegan a Reparaciones, solo
 * para quien está en la lista de Inspecciones de Notificaciones manager.
 *
 * @returns {object} Lo que el componente necesita para pintarse.
 */
export function useCampanaNotificaciones() {
  const { usuario, esTotal } = useSesion()
  const recibeInspecciones = useRecibeAvisoInspeccion(usuario?.id, {
    refetchInterval: INTERVALO_SUSCRIPCION_MS,
  })
  const llave = llaveVistas(usuario?.id)

  const llaveDeOcultas = llaveOcultas(usuario?.id)
  const [ocultas, setOcultas] = useState(() => leerVistas(llaveDeOcultas))
  const { data: delServidor = [] } = useNotificaciones(usuario?.id)
  const { avisos: inspecciones } = useAvisosDeInspecciones({
    enabled: recibeInspecciones,
    refetchInterval: INTERVALO_INSPECCIONES_MS,
  })
  const notificaciones = useMemo(
    () =>
      sinOcultas([...delServidor, ...inspecciones], ocultas).sort((a, b) =>
        String(b.created_at ?? "").localeCompare(String(a.created_at ?? "")),
      ),
    [delServidor, inspecciones, ocultas],
  )
  const [vistas, setVistas] = useState(() => leerVistas(llave))
  const [filtro, setFiltro] = useState(FILTRO_CAMPANA.TODAS)
  const nomenclaturas = useNomenclaturasDeViajes(delServidor.map((una) => una.trip_id))

  const sinLeer = useMemo(() => sinAnunciar(notificaciones, vistas).length, [notificaciones, vistas])

  const grupos = useMemo(() => {
    const visibles = notificaciones.filter((una) => {
      if (filtro === FILTRO_CAMPANA.NO_LEIDAS) return !vistas.has(una.id)
      if (filtro === FILTRO_CAMPANA.LEIDAS) return vistas.has(una.id)
      return true
    })
    return agruparPorDia(visibles)
  }, [notificaciones, vistas, filtro])

  const marcarTodasLeidas = useCallback(() => {
    setVistas((previas) => {
      const actualizadas = new Set(previas)
      notificaciones.forEach((una) => actualizadas.add(una.id))
      guardarVistas(llave, actualizadas)
      return actualizadas
    })
  }, [notificaciones, llave])

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

  const estaLeida = useCallback((notificacion) => vistas.has(notificacion.id), [vistas])

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
    marcarTodasLeidas,
    ocultar,
    puedeAdministrar: esTotal,
  }
}
