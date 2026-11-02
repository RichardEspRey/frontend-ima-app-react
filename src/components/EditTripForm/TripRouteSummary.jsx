import { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, Stack, Button, CircularProgress, Alert, Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Chip } from '@mui/material';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { format, parseISO } from 'date-fns';

const dotIcon = (color, size) => L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 1px 5px rgba(0,0,0,.45)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
});
const labelIcon = (texto, color, radius, size) => L.divIcon({
    className: '',
    html: `<div style="width:${size}px;height:${size}px;border-radius:${radius};background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.45);color:white;font:700 ${texto.length > 1 ? 7 : 12}px/1 sans-serif;display:flex;align-items:center;justify-content:center">${texto}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
});
const ICON_INICIO = dotIcon('#2e7d32', 20);
const ICON_FIN = dotIcon('#c62828', 20);
const ICON_PARADA = labelIcon('STOP', '#e53935', '50%', 22);
const ICON_ESTACIONAMIENTO = labelIcon('P', '#1e40af', '3px', 20);

const fmtFecha = (valor) => (valor ? format(parseISO(valor.replace(' ', 'T')), 'dd/MM/yyyy HH:mm') : '—');
const fmtDuracion = (min) => {
    const d = Math.floor(min / 1440), h = Math.floor((min % 1440) / 60), m = min % 60;
    if (d) return `${d} d ${h} h`;
    if (h) return `${h} h ${m} min`;
    return `${m} min`;
};

// Ajusta el mapa para que se vea todo el trazo
const FitBounds = ({ puntos }) => {
    const map = useMap();
    useEffect(() => {
        if (puntos.length > 1) map.fitBounds(puntos, { padding: [30, 30] });
        else if (puntos.length === 1) map.setView(puntos[0], 10);
    }, [map, puntos]);
    return null;
};

// Resumen de la ruta que tomó un viaje finalizado según Wialon, entre la fecha de inicio
// y la fecha final capturadas al finalizarlo: trazo GPS, paradas y estacionamientos.
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

    const track = useMemo(() => data?.ruta?.track || [], [data]);
    const paradas = useMemo(() => data?.ruta?.paradas || [], [data]);
    const resumen = data?.ruta?.resumen;

    const renderContenido = () => {
        if (loading) {
            return (
                <Stack direction="row" spacing={2} alignItems="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} />
                    <Typography color="text.secondary">Consultando la ruta en Wialon. La primera vez puede tardar hasta un minuto…</Typography>
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
        if (track.length === 0) return <Alert severity="info">Wialon no registró movimiento de la unidad entre esas fechas.</Alert>;

        const inicio = track[0];
        const fin = track[track.length - 1];
        const estacionamientos = paradas.filter((p) => p.tipo === 'estacionamiento').length;

        return (
            <>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 2 }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Salida</Typography>
                        <Typography fontWeight={600}>{resumen?.ubicacion_inicial || '—'}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Llegada</Typography>
                        <Typography fontWeight={600}>{resumen?.ubicacion_final || '—'}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Distancia recorrida</Typography>
                        <Typography fontWeight={600}>{resumen ? `${resumen.millas_total} mi (${resumen.km_total} km)` : '—'}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">Paradas / estacionamientos</Typography>
                        <Typography fontWeight={600}>{paradas.length - estacionamientos} / {estacionamientos}</Typography>
                    </Box>
                </Stack>

                {/* position/zIndex: evita que el mapa quede encima del encabezado sticky */}
                <Box sx={{ height: 480, mb: 2, borderRadius: 1, overflow: 'hidden', position: 'relative', zIndex: 0 }}>
                    <MapContainer center={inicio} zoom={6} style={{ height: '100%', width: '100%' }}>
                        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <Polyline positions={track} pathOptions={{ color: '#4f6bed', weight: 5, opacity: 0.85 }} />
                        {paradas.map((p, i) => (
                            <Marker key={i} position={[p.lat, p.lng]} icon={p.tipo === 'estacionamiento' ? ICON_ESTACIONAMIENTO : ICON_PARADA}>
                                <Popup>
                                    <b>{p.tipo === 'estacionamiento' ? 'Estacionamiento' : 'Parada'}</b> · {fmtDuracion(p.minutos)}<br />
                                    {fmtFecha(p.llegada)} → {fmtFecha(p.salida)}
                                </Popup>
                            </Marker>
                        ))}
                        <Marker position={inicio} icon={ICON_INICIO}>
                            <Popup><b>Salida</b><br />{resumen?.ubicacion_inicial}<br />{fmtFecha(resumen?.inicio)}</Popup>
                        </Marker>
                        <Marker position={fin} icon={ICON_FIN}>
                            <Popup><b>Llegada</b><br />{resumen?.ubicacion_final}<br />{fmtFecha(resumen?.fin)}</Popup>
                        </Marker>
                        <FitBounds puntos={track} />
                    </MapContainer>
                </Box>

                {paradas.length > 0 && (
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
                                {paradas.map((p, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{i + 1}</TableCell>
                                        <TableCell>
                                            <Chip size="small" label={p.tipo === 'estacionamiento' ? 'Estacionamiento' : 'Parada'}
                                                sx={{ bgcolor: p.tipo === 'estacionamiento' ? '#1e40af' : '#e53935', color: 'white' }} />
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fmtFecha(p.llegada)}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fmtFecha(p.salida)}</TableCell>
                                        <TableCell sx={{ whiteSpace: 'nowrap' }}>{fmtDuracion(p.minutos)}</TableCell>
                                        <TableCell>
                                            <a href={`https://www.google.com/maps?q=${p.lat},${p.lng}`} target="_blank" rel="noreferrer">{p.lat}, {p.lng}</a>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
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
