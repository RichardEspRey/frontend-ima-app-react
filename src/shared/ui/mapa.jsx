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
 * Un marcador con texto adentro, para distinguir tipos de punto en el mismo mapa.
 *
 * @param {string} texto Lo que se lee en el marcador, por ejemplo `P`.
 * @param {string} color Color de fondo.
 * @param {object} [opciones] Forma y tamaño.
 * @param {boolean} [opciones.cuadrado=false] Esquinas casi rectas en vez de círculo.
 * @param {number} [opciones.tamano=20] Lado en píxeles.
 * @returns {object} El icono de Leaflet.
 */
export function iconoEtiqueta(texto, color, { cuadrado = false, tamano = 20 } = {}) {
  const radio = cuadrado ? "3px" : "50%"
  const letra = texto.length > 1 ? 7 : 12
  return L.divIcon({
    className: "",
    html: `<div style="width:${tamano}px;height:${tamano}px;border-radius:${radio};background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.45);color:white;font:700 ${letra}px/1 sans-serif;display:flex;align-items:center;justify-content:center">${texto}</div>`,
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
