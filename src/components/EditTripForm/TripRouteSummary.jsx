import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, Stack, Button, CircularProgress, Alert, Table, TableHead, TableBody, TableRow, TableCell, TableContainer } from '@mui/material';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format, parseISO } from 'date-fns';

const dotIcon = (color, size = 14) => L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 1px 5px rgba(0,0,0,.45)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
});
const ICON_INICIO = dotIcon('#2e7d32', 18);
const ICON_FIN = dotIcon('#c62828', 18);
const ICON_PARADA = dotIcon('#1565c0', 12);

const fmtFecha = (valor) => (valor ? format(parseISO(valor.replace(' ', 'T')), 'dd/MM/yyyy HH:mm') : '—');

// Ajusta el mapa para que se vean todos los puntos de la ruta
const FitBounds = ({ puntos }) => {
    const map = useMap();
    useEffect(() => {
        if (puntos.length > 1) map.fitBounds(puntos, { padding: [30, 30] });
        else if (puntos.length === 1) map.setView(puntos[0], 10);
    }, [map, puntos]);
    return null;
};

// Resumen de la ruta que tomó un viaje finalizado, según el reporte de Wialon
// entre la fecha de inicio y la fecha final capturadas al finalizarlo.
const TripRouteSummary = ({ tripId, apiHost }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        let cancelado = false;
        const fetchRuta = async () => {
            setLoading(true); setError(null);
            try {
                const fd = new FormData();
                fd.append('op', 'getTripRoute');
                fd.append('trip_id', tripId);
                const res = await fetch(`${apiHost}/new_trips.php`, { method: 'POST', body: fd });
                const result = await res.json();
                if (!res.ok || result.status !== 'success') throw new Error(result.message || 'Error al obtener la ruta');
                if (!cancelado) setData(result);
            } catch (err) {
                if (!cancelado) setError(err.message);
            } finally {
                if (!cancelado) setLoading(false);
            }
        };
        fetchRuta();
        return () => { cancelado = true; };
    }, [tripId, apiHost, intento]);

    const segmentos = useMemo(() => data?.ruta?.segmentos || [], [data]);

    // Puntos en orden: inicio de cada tramo y el final del último
    const puntos = useMemo(() => {
        const lista = [];
        segmentos.forEach((s) => {
            if (s.coords_inicial) lista.push([s.coords_inicial.lat, s.coords_inicial.lng]);
            if (s.coords_final) lista.push([s.coords_final.lat, s.coords_final.lng]);
        });
        return lista;
    }, [segmentos]);

    const renderContenido = () => {
        if (loading) {
            return (
                <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                    <Typography color="text.secondary">Consultando la ruta en Wialon, puede tardar unos segundos…</Typography>
                </Stack>
            );
        }
        if (error) {
            return (
                <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => setIntento((n) => n + 1)}>Reintentar</Button>}>
                    {error}
                </Alert>
            );
        }
        if (!data?.ruta) return <Alert severity="info">{data?.message || 'No hay ruta disponible para este viaje.'}</Alert>;
        if (segmentos.length === 0) return <Alert severity="info">Wialon no registró movimiento de la unidad entre esas fechas.</Alert>;

        const primero = segmentos[0];
        const ultimo = segmentos[segmentos.length - 1];

        return (
            <>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 2 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Salida</Typography>
                        <Typography fontWeight={600}>{primero.ubicacion_inicial || '—'}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Llegada</Typography>
                        <Typography fontWeight={600}>{ultimo.ubicacion_final || '—'}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Distancia recorrida</Typography>
                        <Typography fontWeight={600}>{data.ruta.millas_total} mi ({data.ruta.km_total} km)</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Tramos</Typography>
                        <Typography fontWeight={600}>{segmentos.length}</Typography>
                    </Box>
                </Stack>

                {puntos.length > 0 && (
                    // position/zIndex: evita que el mapa quede encima del encabezado sticky
                    <Box sx={{ height: 420, mb: 2, borderRadius: 1, overflow: 'hidden', position: 'relative', zIndex: 0 }}>
                        <MapContainer center={puntos[0]} zoom={6} style={{ height: '100%', width: '100%' }}>
                            <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Polyline positions={puntos} pathOptions={{ color: '#1565c0', weight: 4 }} />
                            {segmentos.map((s, i) => s.coords_inicial && (
                                <Marker key={i} position={[s.coords_inicial.lat, s.coords_inicial.lng]} icon={i === 0 ? ICON_INICIO : ICON_PARADA}>
                                    <Popup><b>{i === 0 ? 'Salida' : `Tramo ${i + 1}`}</b><br />{s.ubicacion_inicial}<br />{fmtFecha(s.inicio)}</Popup>
                                </Marker>
                            ))}
                            {ultimo.coords_final && (
                                <Marker position={[ultimo.coords_final.lat, ultimo.coords_final.lng]} icon={ICON_FIN}>
                                    <Popup><b>Llegada</b><br />{ultimo.ubicacion_final}<br />{fmtFecha(ultimo.fin)}</Popup>
                                </Marker>
                            )}
                            <FitBounds puntos={puntos} />
                        </MapContainer>
                    </Box>
                )}

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
                            {segmentos.map((s, i) => (
                                <TableRow key={i}>
                                    <TableCell>{i + 1}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{fmtFecha(s.inicio)}</TableCell>
                                    <TableCell>{s.ubicacion_inicial || '—'}</TableCell>
                                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{fmtFecha(s.fin)}</TableCell>
                                    <TableCell>{s.ubicacion_final || '—'}</TableCell>
                                    <TableCell align="right">{s.km}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        );
    };

    return (
        <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" fontWeight={700}>Resumen del viaje</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {data ? `Del ${fmtFecha(data.fecha_inicio)} al ${fmtFecha(data.fecha_fin)}${data.unidad ? ` · Unidad ${data.unidad}` : ''}` : 'Ruta según Wialon'}
            </Typography>
            {renderContenido()}
        </Paper>
    );
};

export default TripRouteSummary;
