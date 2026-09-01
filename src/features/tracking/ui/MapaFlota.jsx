import { useEffect } from "react"
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"

import { TILES_BASE } from "../../../shared/config/mapa"
import { COLOR_PUNTO_1, COLOR_PUNTO_2, iconoPunto, iconoUnidad } from "./iconos"

const CENTRO_MONTERREY = [25.6866, -100.3161]
const ZOOM_INICIAL = 5
const ZOOM_SEGUIMIENTO = 15

/**
 * Lleva el mapa hasta la unidad seleccionada.
 *
 * Es un componente y no una función porque el mapa solo se puede mover desde
 * dentro del `MapContainer`, que es quien lo tiene en contexto.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} [props.unidad] La unidad a la que volar.
 * @returns {null} No dibuja nada.
 */
function VolarAUnidad({ unidad }) {
  const mapa = useMap()

  useEffect(() => {
    if (unidad?.lat && unidad?.lon) {
      mapa.flyTo([unidad.lat, unidad.lon], ZOOM_SEGUIMIENTO, { duration: 1.5 })
    }
  }, [unidad, mapa])

  return null
}

/**
 * Escucha los clics en el mapa mientras se está colocando un punto.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.activo Si se está esperando un clic.
 * @param {Function} props.onClic Recibe el punto donde se hizo clic.
 * @returns {null} No dibuja nada.
 */
function EscuchaClics({ activo, onClic }) {
  useMapEvents({
    click(evento) {
      if (activo) onClic(evento.latlng)
    },
  })

  return null
}

/**
 * El mapa con la flota, los puntos de la ruta y el trazo entre ellos.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array} props.flota Las unidades a dibujar.
 * @param {object} [props.seleccionada] La unidad seguida por el mapa.
 * @param {object} [props.punto1] Primer extremo de la ruta.
 * @param {object} [props.punto2] Segundo extremo de la ruta.
 * @param {Array} [props.trazo] Coordenadas de la ruta trazada.
 * @param {boolean} props.esperandoClic Si se está colocando un punto con el ratón.
 * @param {Function} props.onClicMapa Recibe el punto donde se hizo clic.
 * @param {Function} props.onSeleccionar Recibe la unidad que se tocó.
 * @returns {object} El mapa renderizado.
 */
export function MapaFlota({
  flota = [],
  seleccionada,
  punto1,
  punto2,
  trazo = [],
  esperandoClic,
  onClicMapa,
  onSeleccionar,
}) {
  const primera = flota[0]
  const centro = primera?.lat ? [primera.lat, primera.lon] : CENTRO_MONTERREY

  return (
    <MapContainer
      center={centro}
      zoom={ZOOM_INICIAL}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer {...TILES_BASE} />

      <EscuchaClics activo={esperandoClic} onClic={onClicMapa} />

      {flota.map((unidad) => (
        <Marker
          key={unidad.id}
          position={[unidad.lat, unidad.lon]}
          icon={iconoUnidad(unidad.heading, unidad.color)}
          eventHandlers={{ click: () => onSeleccionar(unidad) }}
        >
          <Popup>
            <strong>{unidad.name}</strong>
            <br />
            Velocidad: {unidad.speed} km/h
            <br />
            Dirección: {unidad.address}
          </Popup>
        </Marker>
      ))}

      {punto2 && !punto2.id && (
        <Marker position={[punto2.lat, punto2.lon]} icon={iconoPunto("2", COLOR_PUNTO_2)}>
          <Popup>Ping 2: {punto2.name}</Popup>
        </Marker>
      )}

      {punto1 && (
        <Marker
          position={[punto1.lat, punto1.lon]}
          icon={iconoPunto("1", COLOR_PUNTO_1)}
          zIndexOffset={500}
        />
      )}

      {trazo.length > 0 && <Polyline positions={trazo} color={COLOR_PUNTO_1} weight={5} opacity={0.8} />}

      {seleccionada && <VolarAUnidad unidad={seleccionada} />}
    </MapContainer>
  )
}
