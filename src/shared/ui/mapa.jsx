import { useEffect, useRef } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"

/**
 * Un punto de color, para marcar una posición en el mapa.
 *
 * Es el marcador que usan las pantallas que dibujan rutas: un círculo liso, sin
 * la chincheta de Leaflet, que se lee mejor cuando hay varios juntos.
 *
 * @param {string} color Color del punto.
 * @param {number} [tamano=14] Diámetro en píxeles.
 * @returns {object} El icono de Leaflet.
 */
export function iconoPunto(color, tamano = 14) {
  return L.divIcon({
    className: "",
    html: `<div style="width:${tamano}px;height:${tamano}px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 1px 5px rgba(0,0,0,.45)"></div>`,
    iconSize: [tamano, tamano],
    iconAnchor: [tamano / 2, tamano / 2],
  })
}

/**
 * Encuadra el mapa sobre una ruta.
 *
 * Solo reencuadra cuando la ruta cambia de verdad: sin esa comprobación, cada
 * repintado devolvía el mapa a su sitio y no se podía mover ni acercar.
 *
 * Va dentro de un `MapContainer`, que es quien tiene el mapa en contexto.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array} [props.coordenadas] El trazo sobre el que encuadrar.
 * @param {number} [props.margen=40] Margen en píxeles alrededor del trazo.
 * @returns {null} No dibuja nada.
 */
export function EncuadrarRuta({ coordenadas, margen = 40 }) {
  const mapa = useMap()
  const anterior = useRef(null)

  useEffect(() => {
    if (!coordenadas || coordenadas.length === 0) return

    const firma = `${coordenadas[0]}|${coordenadas[coordenadas.length - 1]}`
    if (firma === anterior.current) return

    anterior.current = firma
    mapa.fitBounds(L.latLngBounds(coordenadas), { padding: [margen, margen] })
  }, [coordenadas, mapa, margen])

  return null
}
