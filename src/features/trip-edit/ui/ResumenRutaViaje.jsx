import {
  Alert,
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import dayjs from "dayjs"

import { TIPO_PARADA, contarParadas, duracionLegible, useRutaViaje } from "../../../entities/trip"
import { TILES_BASE } from "../../../shared/config/mapa"
import { COLOR, EncuadrarRuta, EstadoError, iconoEtiqueta, iconoPunto } from "../../../shared/ui"

const ICONO_SALIDA = iconoPunto(COLOR.EXITO, 20)
const ICONO_LLEGADA = iconoPunto(COLOR.PELIGRO, 20)

const ALTO = {
  [TIPO_PARADA.PARADA]: { nombre: "Parada", color: COLOR.PELIGRO, icono: iconoEtiqueta("STOP", COLOR.PELIGRO, { tamano: 22 }) },
  [TIPO_PARADA.ESTACIONAMIENTO]: {
    nombre: "Estacionamiento",
    color: COLOR.INFO,
    icono: iconoEtiqueta("P", COLOR.INFO, { cuadrado: true }),
  },
}

const fecha = (valor) => (valor ? dayjs(valor).format("DD/MM/YYYY HH:mm") : "—")

/**
 * Un dato del encabezado del resumen.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.etiqueta Qué es.
 * @param {string} props.valor Lo que vale.
 * @returns {object} El dato renderizado.
 */
function Dato({ etiqueta, valor }) {
  return (
    <Box>
      <Typography variant="caption" color={COLOR.APAGADO}>
        {etiqueta}
      </Typography>
      <Typography fontWeight={600}>{valor || "—"}</Typography>
    </Box>
  )
}

/**
 * La tabla de los altos de la unidad, con liga a cada punto en Google Maps.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array} props.paradas Los altos de la ruta.
 * @returns {object} La tabla renderizada.
 */
function TablaParadas({ paradas }) {
  return (
    <TableContainer sx={{ maxHeight: 360 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Llegada</TableCell>
            <TableCell>Salida</TableCell>
            <TableCell>Duración</TableCell>
            <TableCell>Coordenadas</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paradas.map((alto, i) => (
            <TableRow key={i}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>
                <Chip size="small" label={ALTO[alto.tipo].nombre} sx={{ bgcolor: ALTO[alto.tipo].color, color: "white" }} />
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>{fecha(alto.llegada)}</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>{fecha(alto.salida)}</TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>{duracionLegible(alto.minutos)}</TableCell>
              <TableCell>
                <a href={`https://www.google.com/maps?q=${alto.lat},${alto.lng}`} target="_blank" rel="noreferrer">
                  {alto.lat}, {alto.lng}
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

/**
 * El mapa con el trazo GPS, la salida, la llegada y cada alto, y la tabla de
 * los altos.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.ruta La ruta validada, con al menos un punto en `track`.
 * @returns {object} El detalle renderizado.
 */
function DetalleRuta({ ruta }) {
  const { resumen, track, paradas } = ruta
  const inicio = track[0]
  const fin = track[track.length - 1]
  const conteo = contarParadas(paradas)

  return (
    <>
      <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mb: 2 }}>
        <Dato etiqueta="Salida" valor={resumen?.ubicacion_inicial} />
        <Dato etiqueta="Llegada" valor={resumen?.ubicacion_final} />
        <Dato
          etiqueta="Distancia recorrida"
          valor={resumen ? `${resumen.millas_total} mi (${resumen.km_total} km)` : ""}
        />
        <Dato etiqueta="Paradas / estacionamientos" valor={`${conteo.paradas} / ${conteo.estacionamientos}`} />
      </Stack>

      <Box sx={{ height: 480, mb: 2, borderRadius: 1, overflow: "hidden", position: "relative", zIndex: 0 }}>
        <MapContainer center={inicio} zoom={6} style={{ height: "100%", width: "100%" }}>
          <TileLayer {...TILES_BASE} />
          <Polyline positions={track} pathOptions={{ color: COLOR.INFO, weight: 5, opacity: 0.85 }} />
          {paradas.map((alto, i) => (
            <Marker key={i} position={[alto.lat, alto.lng]} icon={ALTO[alto.tipo].icono}>
              <Popup>
                <b>{ALTO[alto.tipo].nombre}</b> · {duracionLegible(alto.minutos)}
                <br />
                {fecha(alto.llegada)} → {fecha(alto.salida)}
              </Popup>
            </Marker>
          ))}
          <Marker position={inicio} icon={ICONO_SALIDA}>
            <Popup>
              <b>Salida</b>
              <br />
              {resumen?.ubicacion_inicial}
              <br />
              {fecha(resumen?.inicio)}
            </Popup>
          </Marker>
          <Marker position={fin} icon={ICONO_LLEGADA}>
            <Popup>
              <b>Llegada</b>
              <br />
              {resumen?.ubicacion_final}
              <br />
              {fecha(resumen?.fin)}
            </Popup>
          </Marker>
          <EncuadrarRuta coordenadas={track} />
        </MapContainer>
      </Box>

      {paradas.length > 0 ? <TablaParadas paradas={paradas} /> : null}
    </>
  )
}

/**
 * El resumen de la ruta que tomó un viaje finalizado, según Wialon: el trazo GPS,
 * las paradas y los estacionamientos.
 *
 * Cubre de la fecha de inicio a la fecha final que se capturaron al finalizar el
 * viaje. La primera consulta a Wialon puede tardar hasta un minuto.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.tripId El viaje.
 * @returns {object} La sección renderizada.
 */
export function ResumenRutaViaje({ tripId }) {
  const { data, isLoading, isError, error, refetch } = useRutaViaje(tripId)

  const contenido = () => {
    if (isLoading) {
      return (
        <Alert severity="info" icon={false}>
          Consultando la ruta en Wialon. La primera vez puede tardar hasta un minuto…
        </Alert>
      )
    }
    if (isError) return <EstadoError error={error} onReintentar={refetch} />
    if (!data.ruta) {
      return <Alert severity="info">{data.message || "No hay ruta disponible para este viaje."}</Alert>
    }
    if (data.ruta.track.length === 0) {
      return <Alert severity="info">Wialon no registró movimiento de la unidad entre esas fechas.</Alert>
    }
    return <DetalleRuta ruta={data.ruta} />
  }

  return (
    <Paper sx={{ p: 2, mt: 3 }}>
      <Typography variant="h6" fontWeight={700}>
        Resumen del viaje
      </Typography>
      <Typography variant="body2" color={COLOR.APAGADO} sx={{ mb: 2 }}>
        {data
          ? `Del ${fecha(data.fecha_inicio)} al ${fecha(data.fecha_fin)}${data.unidad ? ` · Unidad ${data.unidad}` : ""}`
          : "Ruta según Wialon"}
      </Typography>
      {contenido()}
    </Paper>
  )
}
