import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Alert, Box, Button, Chip, CircularProgress, IconButton, MenuItem, Paper, Select, Stack,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Swal from 'sweetalert2';

import ModalArchivo from '../../components/ModalArchivo';
import { useAuthStore } from '../../store/useAuthStore';
import {
    OBSERVACIONES_CAJA, UBICACIONES_CAJA, guardarEstatusCaja, obtenerEstatusCajas, subirFianzaCaja
} from '../../services/estatusCajas';
import { HEADER_ROW_SX, HEADER_CELL_SX } from '../../styles/estilosTabla';

const apiHost = import.meta.env.VITE_API_HOST;

const COLUMNAS = ['Cajas', 'Operador', 'Ubicación', 'Observación', 'Fianza', 'Broker'];

const celdaVacia = <Typography variant="body2" color="#94a3b8">—</Typography>;

const ChipFianza = ({ fianza }) => {
    if (!fianza?.fecha_vencimiento) return <Chip size="small" label="Sin fianza" sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontWeight: 700 }} />;

    const vencida = fianza.estado === 'Vencida';
    return (
        <Tooltip title={`Vence el ${fianza.fecha_vencimiento}`}>
            <Chip
                size="small"
                label={vencida ? 'Vencida' : 'Activa'}
                sx={{
                    fontWeight: 700,
                    bgcolor: vencida ? '#fef2f2' : '#f0fdf4',
                    color: vencida ? '#b91c1c' : '#15803d',
                }}
            />
        </Tooltip>
    );
};

const EstatusCajas = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const [cajas, setCajas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [guardando, setGuardando] = useState(null);
    const [fianzaEnModal, setFianzaEnModal] = useState(null);

    const cargar = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setCajas(await obtenerEstatusCajas());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const guardarCampo = async (caja, campo, valor) => {
        const previo = cajas;
        setCajas(prev => prev.map(una => (una.caja_id === caja.caja_id ? { ...una, [campo]: valor, manual: true } : una)));
        setGuardando(caja.caja_id);

        try {
            await guardarEstatusCaja({
                cajaId: caja.caja_id,
                ubicacion: campo === 'ubicacion' ? valor : caja.ubicacion,
                observacion: campo === 'observacion' ? valor : caja.observacion,
                usuarioId: user?.id,
            });
        } catch (err) {
            setCajas(previo);
            Swal.fire('Error', err.message, 'error');
        } finally {
            setGuardando(null);
        }
    };

    const guardarFianza = async (datos) => {
        const caja = fianzaEnModal;
        setFianzaEnModal(null);

        try {
            await subirFianzaCaja({ cajaId: caja.caja_id, archivo: datos.file, vencimiento: datos.vencimiento });
            Swal.fire({
                toast: true, position: 'top-end', icon: 'success',
                title: `Fianza actualizada para la caja ${caja.no_caja}`,
                showConfirmButton: false, timer: 2500
            });
            cargar();
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    const resumen = useMemo(() => {
        const cargadas = cajas.filter(una => una.observacion === 'CARGADA').length;
        return { cargadas, vacias: cajas.length - cargadas };
    }, [cajas]);

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} sx={{ mb: 4 }}>
                <Box>
                    <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em' }}>
                        Viajes · Unidades
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#0f172a">Estatus de cajas</Typography>
                    <Typography variant="body1" color="text.secondary">
                        Dónde está cada caja y con qué viaje. {resumen.cargadas} cargadas · {resumen.vacias} vacías.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1.5}>
                    <Button
                        variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin-trips')}
                        sx={{ color: 'text.secondary', borderColor: 'divider', fontWeight: 600, textTransform: 'none', bgcolor: 'white', px: 3 }}
                    >
                        Volver a Viajes
                    </Button>
                    <Button
                        variant="contained" startIcon={<RefreshIcon />} onClick={cargar} disabled={loading}
                        sx={{ bgcolor: '#0f172a', fontWeight: 700, borderRadius: 2, px: 3, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#1e293b' } }}
                    >
                        Actualizar
                    </Button>
                </Stack>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 3 }} action={<Button onClick={cargar}>Reintentar</Button>}>{error}</Alert>}

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={HEADER_ROW_SX}>
                            {COLUMNAS.map(columna => (
                                <TableCell key={columna} sx={HEADER_CELL_SX}>{columna}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={COLUMNAS.length} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={28} />
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && cajas.length === 0 && !error && (
                            <TableRow>
                                <TableCell colSpan={COLUMNAS.length} align="center" sx={{ py: 6, color: '#64748b' }}>
                                    No hay cajas activas que mostrar.
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && cajas.map(caja => (
                            <TableRow key={caja.caja_id} hover>
                                <TableCell>
                                    <Typography fontWeight={800} color="#0f172a">{caja.no_caja}</Typography>
                                    {caja.trip_number && (
                                        <Typography variant="caption" color="#64748b">Viaje {caja.trip_number}</Typography>
                                    )}
                                </TableCell>

                                <TableCell>
                                    {caja.operador
                                        ? <Typography variant="body2" color="#334155">{caja.operador}</Typography>
                                        : celdaVacia}
                                </TableCell>

                                <TableCell>
                                    <Select
                                        size="small"
                                        value={caja.ubicacion || ''}
                                        onChange={(e) => guardarCampo(caja, 'ubicacion', e.target.value)}
                                        disabled={guardando === caja.caja_id}
                                        displayEmpty
                                        sx={{ minWidth: 175, bgcolor: 'white' }}
                                    >
                                        <MenuItem value="" disabled>Sin ubicación</MenuItem>
                                        {UBICACIONES_CAJA.map(opcion => (
                                            <MenuItem key={opcion} value={opcion}>{opcion}</MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>

                                <TableCell>
                                    <Select
                                        size="small"
                                        value={caja.observacion || ''}
                                        onChange={(e) => guardarCampo(caja, 'observacion', e.target.value)}
                                        disabled={guardando === caja.caja_id}
                                        displayEmpty
                                        sx={{ minWidth: 145, bgcolor: 'white' }}
                                    >
                                        <MenuItem value="" disabled>Sin observación</MenuItem>
                                        {OBSERVACIONES_CAJA.map(opcion => (
                                            <MenuItem key={opcion} value={opcion}>{opcion}</MenuItem>
                                        ))}
                                    </Select>
                                </TableCell>

                                <TableCell>
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <ChipFianza fianza={caja.fianza} />
                                        {caja.fianza?.url_pdf && (
                                            <Tooltip title="Ver fianza">
                                                <IconButton size="small" component="a" href={`${apiHost}/${caja.fianza.url_pdf}`} target="_blank" rel="noreferrer">
                                                    <OpenInNewIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Tooltip title="Subir fianza">
                                            <IconButton size="small" onClick={() => setFianzaEnModal(caja)}>
                                                <UploadFileIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>

                                <TableCell>
                                    {caja.broker
                                        ? <Typography variant="body2" color="#334155">{caja.broker}</Typography>
                                        : celdaVacia}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {fianzaEnModal && (
                <ModalArchivo
                    isOpen
                    onClose={() => setFianzaEnModal(null)}
                    onSave={guardarFianza}
                    title={`Fianza de la caja ${fianzaEnModal.no_caja}`}
                    saveButtonText="Subir fianza"
                />
            )}
        </Box>
    );
};

export default EstatusCajas;
