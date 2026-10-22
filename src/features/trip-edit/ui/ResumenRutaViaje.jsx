import { useMemo } from "react"
import {
  Alert,
  Box,
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

import { puntosDeRuta, useRutaViaje } from "../../../entities/trip"
import { TILES_BASE } from "../../../shared/config/mapa"
import { COLOR, EncuadrarRuta, EstadoError, iconoPunto } from "../../../shared/ui"

const ICONO_SALIDA = iconoPunto(COLOR.EXITO, 18)
const ICONO_LLEGADA = iconoPunto(COLOR.PELIGRO, 18)
const ICONO_TRAMO = iconoPunto(COLOR.INFO, 12)

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
 * El mapa y la tabla de los tramos que hizo la unidad.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.ruta La ruta validada.
 * @returns {object} El detalle renderizado.
 */
function DetalleRuta({ ruta }) {
  const tramos = ruta.segmentos
  const puntos = useMemo(() => puntosDeRuta(tramos), [tramos])
  const primero = tramos[0]
  const ultimo = tramos[tramos.length - 1]

  return (
    <>
      <Stack direction={{ xs: "column", md: "row" }} spacing={3} sx={{ mb: 2 }}>
        <Dato etiqueta="Salida" valor={primero.ubicacion_inicial} />
        <Dato etiqueta="Llegada" valor={ultimo.ubicacion_final} />
        <Dato
          etiqueta="Distancia recorrida"
          valor={`${ruta.millas_total} mi (${ruta.km_total} km)`}
        />
        <Dato etiqueta="Tramos" valor={String(tramos.length)} />
      </Stack>

      {puntos.length > 0 ? (
        <Box
          sx={{ height: 420, mb: 2, borderRadius: 1, overflow: "hidden", position: "relative", zIndex: 0 }}
        >
          <MapContainer center={puntos[0]} zoom={6} style={{ height: "100%", width: "100%" }}>
            <TileLayer {...TILES_BASE} />
            <Polyline positions={puntos} pathOptions={{ color: COLOR.INFO, weight: 4 }} />
            {tramos.map((tramo, i) =>
              tramo.coords_inicial ? (
                <Marker
                  key={i}
                  position={[tramo.coords_inicial.lat, tramo.coords_inicial.lng]}
                  icon={i === 0 ? ICONO_SALIDA : ICONO_TRAMO}
                >
                  <Popup>
                    <b>{i === 0 ? "Salida" : `Tramo ${i + 1}`}</b>
                    <br />
                    {tramo.ubicacion_inicial}
                    <br />
                    {fecha(tramo.inicio)}
                  </Popup>
                </Marker>
              ) : null,
            )}
            {ultimo.coords_final ? (
              <Marker position={[ultimo.coords_final.lat, ultimo.coords_final.lng]} icon={ICONO_LLEGADA}>
                <Popup>
                  <b>Llegada</b>
                  <br />
                  {ultimo.ubicacion_final}
                  <br />
                  {fecha(ultimo.fin)}
                </Popup>
              </Marker>
            ) : null}
            <EncuadrarRuta coordenadas={puntos} />
          </MapContainer>
        </Box>
      ) : null}

      <TableContainer sx={{ maxHeight: 360 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Inicio</TableCell>
              <TableCell>Ubicación inicial</TableCell>
              <TableCell>Fin</TableCell>
              <TableCell>Ubicación final</TableCell>
              <TableCell align="right">Km</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tramos.map((tramo, i) => (
              <TableRow key={i}>
                <TableCell>{i + 1}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{fecha(tramo.inicio)}</TableCell>
                <TableCell>{tramo.ubicacion_inicial || "—"}</TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>{fecha(tramo.fin)}</TableCell>
                <TableCell>{tramo.ubicacion_final || "—"}</TableCell>
                <TableCell align="right">{tramo.km}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

/**
 * El resumen de la ruta que tomó un viaje finalizado, según Wialon.
 *
 * Cubre de la fecha de inicio a la fecha final que se capturaron al finalizar el
 * viaje. La consulta a Wialon puede tardar unos segundos.
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
          Consultando la ruta en Wialon, puede tardar unos segundos…
        </Alert>
      )
    }
    if (isError) return <EstadoError error={error} onReintentar={refetch} />
    if (!data.ruta) {
      return <Alert severity="info">{data.message || "No hay ruta disponible para este viaje."}</Alert>
    }
    if (data.ruta.segmentos.length === 0) {
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
