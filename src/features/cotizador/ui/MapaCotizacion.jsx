import { Box, Paper, Stack, Typography } from "@mui/material"
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet"
import "leaflet/dist/leaflet.css"

import { TILES_BASE } from "../../../shared/config/mapa"
import { EncuadrarRuta, iconoPunto } from "../../../shared/ui"

const CENTRO_FRONTERA = [29.0, -100.0]

/**
 * Color de cada punto y trazo del mapa de cotización.
 *
 * @readonly
 * @enum {string}
 */
export const COLOR_COTIZACION = {
  ORIGEN: "#4caf50",
  PARADA: "#f59e0b",
  DESTINO: "#f44336",
  CAMION: "#9c27b0",
  RUTA: "#1976d2",
}

const LEYENDA = [
  { color: COLOR_COTIZACION.ORIGEN, texto: "Origen" },
  { color: COLOR_COTIZACION.PARADA, texto: "Paradas" },
  { color: COLOR_COTIZACION.DESTINO, texto: "Destino" },
  { color: COLOR_COTIZACION.CAMION, texto: "Origen Camión" },
]

/**
 * La leyenda de colores del mapa.
 *
 * @returns {object} La leyenda renderizada.
 */
function Leyenda() {
  return (
    <Stack
      direction="row"
      spacing={2.5}
      sx={{ px: 2.5, py: 1, borderBottom: "1px solid #f0f0f0", flexWrap: "wrap" }}
    >
      {LEYENDA.map(({ color, texto }) => (
        <Stack key={texto} direction="row" alignItems="center" spacing={0.8}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              bgcolor: color,
              border: "2px solid white",
              boxShadow: "0 0 3px rgba(0,0,0,.3)",
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {texto}
          </Typography>
        </Stack>
      ))}
      <Stack direction="row" alignItems="center" spacing={0.8}>
        <Box sx={{ width: 20, height: 3, bgcolor: COLOR_COTIZACION.RUTA, borderRadius: 1 }} />
        <Typography variant="caption" color="text.secondary">
          Ruta
        </Typography>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={0.8}>
        <Box sx={{ width: 20, height: 3, bgcolor: COLOR_COTIZACION.CAMION, borderRadius: 1 }} />
        <Typography variant="caption" color="text.secondary">
          Millas vacías
        </Typography>
      </Stack>
    </Stack>
  )
}

/**
 * El mapa de una cotización: la ruta cargada y las millas vacías.
 *
 * Se dibujan dos trazos distintos a propósito. El morado es lo que el camión
 * recorre vacío para llegar a la carga, y verlo aparte es lo que permite
 * discutir si el viaje conviene.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array} [props.trazoViaje] La ruta con carga.
 * @param {Array} [props.trazoVacio] La ruta hasta el origen.
 * @param {object} [props.puntos] Origen, paradas, destino y camión.
 * @param {object} [props.etiquetas] Los nombres de cada punto, para los globos.
 * @param {number} [props.alto=460] Alto del mapa en píxeles.
 * @param {(string|number)} [props.clave] Fuerza a remontar el mapa al cambiar.
 * @param {boolean} [props.conMarco=true] Si se dibuja con encabezado y leyenda.
 * @returns {object} El mapa renderizado.
 */
export function MapaCotizacion({
  trazoViaje,
  trazoVacio,
  puntos,
  etiquetas = {},
  alto = 460,
  clave,
  conMarco = true,
}) {
  const todos = [...(trazoViaje ?? []), ...(trazoVacio ?? [])]

  const mapa = (
    <Box
      sx={{
        position: "relative",
        height: alto,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        overflow: "hidden",
      }}
    >
      <MapContainer
        key={clave}
        center={CENTRO_FRONTERA}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer {...TILES_BASE} />

        {todos.length > 0 && <EncuadrarRuta coordenadas={todos} />}

        {trazoVacio && (
          <Polyline
            positions={trazoVacio}
            pathOptions={{ color: COLOR_COTIZACION.CAMION, weight: 4, opacity: 0.9 }}
          />
        )}
        {trazoViaje && (
          <Polyline
            positions={trazoViaje}
            pathOptions={{ color: COLOR_COTIZACION.RUTA, weight: 4, opacity: 0.9 }}
          />
        )}

        {puntos?.camion && (
          <Marker
            position={[puntos.camion.lat, puntos.camion.lon]}
            icon={iconoPunto(COLOR_COTIZACION.CAMION, 16)}
          >
            <Popup>Origen Camión: {etiquetas.camion}</Popup>
          </Marker>
        )}
        {puntos?.origen && (
          <Marker
            position={[puntos.origen.lat, puntos.origen.lon]}
            icon={iconoPunto(COLOR_COTIZACION.ORIGEN, 16)}
          >
            <Popup>Origen: {etiquetas.origen}</Popup>
          </Marker>
        )}
        {puntos?.paradas?.map((parada, indice) => (
          <Marker
            key={`${parada.lat},${parada.lon}`}
            position={[parada.lat, parada.lon]}
            icon={iconoPunto(COLOR_COTIZACION.PARADA, 14)}
          >
            <Popup>
              Parada {indice + 1}: {etiquetas.paradas?.[indice]}
            </Popup>
          </Marker>
        ))}
        {puntos?.destino && (
          <Marker
            position={[puntos.destino.lat, puntos.destino.lon]}
            icon={iconoPunto(COLOR_COTIZACION.DESTINO, 16)}
          >
            <Popup>Destino: {etiquetas.destino}</Popup>
          </Marker>
        )}
      </MapContainer>
    </Box>
  )

  if (!conMarco) return mapa

  return (
    <Paper elevation={0} sx={{ flex: "1 1 420px", borderRadius: 2, border: "1px solid #e0e0e0" }}>
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid #e0e0e0" }}>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          color="text.secondary"
          sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          Mapa de Ruta
        </Typography>
      </Box>
      <Leyenda />
      {mapa}
    </Paper>
  )
}
