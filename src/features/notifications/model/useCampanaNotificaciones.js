import { useCallback, useMemo, useState } from "react"

import { agruparPorDia, sinAnunciar, useNotificaciones } from "../../../entities/notification"
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
    localStorage.setItem(llave, JSON.stringify([...vistas]))
  } catch {
    return
  }
}

/**
 * Lleva el estado de la campana de notificaciones.
 *
 * Se apoya en la misma consulta que el aviso emergente, así que las dos cosas
 * comparten una sola petición cada quince segundos en lugar de una cada una.
 * Lo único propio de la campana es qué se ha leído, que vive en el navegador
 * porque el backend no lo guarda.
 *
 * @returns {object} Lo que el componente necesita para pintarse.
 */
export function useCampanaNotificaciones() {
  const { usuario, esTotal } = useSesion()
  const llave = llaveVistas(usuario?.id)

  const { data: notificaciones = [] } = useNotificaciones(usuario?.id)
  const [vistas, setVistas] = useState(() => leerVistas(llave))
  const [filtro, setFiltro] = useState(FILTRO_CAMPANA.TODAS)

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

  const estaLeida = useCallback((notificacion) => vistas.has(notificacion.id), [vistas])

  return {
    grupos,
    sinLeer,
    filtro,
    setFiltro,
    estaLeida,
    marcarTodasLeidas,
    puedeAdministrar: esTotal,
  }
}
