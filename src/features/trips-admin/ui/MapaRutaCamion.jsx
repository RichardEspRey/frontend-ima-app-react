import { Alert, Box, CircularProgress, Paper, Stack, Typography } from "@mui/material"
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet"
import "leaflet/dist/leaflet.css"

import { NUEVO_LAREDO } from "../../../entities/schedule"
import { TILES_BASE } from "../../../shared/config/mapa"
import { EncuadrarRuta, iconoPunto } from "../../../shared/ui"

const COLOR_CAMION = "#9c27b0"
const COLOR_DESTINO = "#f44336"
const COLOR_RUTA = "#1976d2"

/**
 * Una entrada de la leyenda del mapa.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.color Color de la muestra.
 * @param {string} props.texto Qué representa.
 * @param {boolean} [props.linea] Si la muestra es una línea en vez de un punto.
 * @returns {object} La entrada renderizada.
 */
function Leyenda({ color, texto, linea }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.8}>
      <Box
        sx={
          linea
            ? { width: 20, height: 3, bgcolor: color, borderRadius: 1 }
            : {
                width: 10,
                height: 10,
                borderRadius: "50%",
                bgcolor: color,
                border: "2px solid white",
                boxShadow: "0 0 3px rgba(0,0,0,.3)",
              }
        }
      />
      <Typography variant="caption" color="text.secondary">
        {texto}
      </Typography>
    </Stack>
  )
}

/**
 * El mapa con la ruta de un camión programado hasta Nuevo Laredo.
 *
 * Sirve para decidir a quién programar: qué tan lejos está cada unidad del
 * patio desde donde salen los viajes.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.unidad Número de la unidad, para el encabezado.
 * @param {object} [props.posicionCamion] Dónde está el camión.
 * @param {Array} [props.trazo] La ruta calculada.
 * @param {boolean} props.cargando Si la ruta se está calculando.
 * @param {string} [props.error] Qué falló al calcularla.
 * @returns {object} El mapa renderizado.
 */
export function MapaRutaCamion({ unidad, posicionCamion, trazo, cargando, error }) {
  return (
    <Paper
      elevation={0}
      sx={{ mt: 2, border: "1px solid #e2e8f0", borderRadius: 3, overflow: "hidden" }}
    >
      <Box sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid #e2e8f0" }}>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          color="#475569"
          sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
        >
          Ruta a Nuevo Laredo — Camión {unidad || ""}
        </Typography>
      </Box>

      <Stack
        direction="row"
        spacing={2.5}
        sx={{ px: 2.5, py: 1, borderBottom: "1px solid #f1f5f9", flexWrap: "wrap" }}
      >
        <Leyenda color={COLOR_CAMION} texto="Camión" />
        <Leyenda color={COLOR_DESTINO} texto="Nuevo Laredo" />
        <Leyenda color={COLOR_RUTA} texto="Ruta" linea />
      </Stack>

      <Box sx={{ position: "relative", height: 420 }}>
        {cargando && (
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{ position: "absolute", inset: 0, zIndex: 1000, bgcolor: "rgba(255,255,255,0.7)" }}
          >
            <CircularProgress size={32} />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Calculando ruta…
            </Typography>
          </Stack>
        )}

        {error && !cargando && (
          <Alert severity="error" sx={{ position: "absolute", top: 8, left: 8, right: 8, zIndex: 1000 }}>
            {error}
          </Alert>
        )}

        <MapContainer
          center={[NUEVO_LAREDO.lat, NUEVO_LAREDO.lon]}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer {...TILES_BASE} />

          {trazo?.length > 0 && <EncuadrarRuta coordenadas={trazo} />}
          {trazo?.length > 0 && (
            <Polyline positions={trazo} pathOptions={{ color: COLOR_RUTA, weight: 4, opacity: 0.9 }} />
          )}

          {posicionCamion && (
            <Marker
              position={[posicionCamion.lat, posicionCamion.lon]}
              icon={iconoPunto(COLOR_CAMION, 16)}
            >
              <Popup>Camión {unidad || ""}</Popup>
            </Marker>
          )}

          <Marker
            position={[NUEVO_LAREDO.lat, NUEVO_LAREDO.lon]}
            icon={iconoPunto(COLOR_DESTINO, 16)}
          >
            <Popup>Nuevo Laredo, Tamps.</Popup>
          </Marker>
        </MapContainer>
      </Box>
    </Paper>
  )
}
