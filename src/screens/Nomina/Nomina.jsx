import React, { useState, useEffect } from 'react';
import {
    Paper, Typography, Button, Table, TableHead, TableRow,
    TableCell, TableBody, Stack, Chip, Box, TableContainer, CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
    PAGE_SHELL_SX, PAGE_OVERLINE_SX, PAGE_TITLE_SX, HEADER_ROW_SX, HEADER_CELL_SX, TABLE_CONTAINER_SX,
    CELL_STRONG_SX, CELL_MUTED_SX, DARK_BTN_SX, GHOST_BTN_SX, CHIP_NEUTRO_SX, CHIP_OK_SX, CHIP_INFO_SX,
} from '../../styles/estilosTabla';

const apiHost = import.meta.env.VITE_API_HOST;

const NUMERO_SX = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };

const BOTON_FILA_SX = { ...GHOST_BTN_SX, px: 1.5, py: 0.4, fontSize: '0.78rem' };

const AUTORIZAR_BTN_SX = {
    textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 1.5, py: 0.4, fontSize: '0.78rem', boxShadow: 'none',
    bgcolor: '#f59e0b', color: '#fff', '&:hover': { bgcolor: '#d97706', boxShadow: 'none' },
};

const pesos = (v) => `$${Number(v || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dolares = (v) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function PagosAdministrativos() {
    const [weeks, setWeeks] = useState([]);
    const [cargando, setCargando] = useState(true);
    const navigate = useNavigate();

    const fetchWeeks = async () => {
        try {
            const fd = new FormData(); fd.append('op', 'get_weeks');
            const res = await fetch(`${apiHost}/pagos_admin.php`, { method: 'POST', body: fd });
            const json = await res.json();
            if (json.status === 'success') setWeeks(json.data);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { fetchWeeks(); }, []);

    const handleAuthorize = async (week) => {
        const confirm = await Swal.fire({
            title: `¿Autorizar Semana ${week.semana}?`,
            text: 'Se cerrará el corte y no se podrán agregar más pagos a esta semana.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, Autorizar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#0f172a',
        });

        if (confirm.isConfirmed) {
            const fd = new FormData();
            fd.append('op', 'authorize');
            fd.append('period_id', week.period_id);
            fd.append('anio', week.anio);
            fd.append('semana', week.semana);
            fd.append('fecha_corte', week.fecha_corte);

            try {
                await fetch(`${apiHost}/pagos_admin.php`, { method: 'POST', body: fd });
                Swal.fire('Autorizado', 'Semana cerrada correctamente', 'success');
                fetchWeeks();
            } catch {
                Swal.fire('Error', 'Hubo un problema al autorizar la semana', 'error');
            }
        }
    };

    return (
        <Box sx={PAGE_SHELL_SX}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4} flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="overline" sx={PAGE_OVERLINE_SX}>Finanzas · Nómina</Typography>
                    <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em" sx={PAGE_TITLE_SX}>
                        Nómina Administrativa
                    </Typography>
                    <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                        Control de nómina semanal y autorización de pagos.
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<ManageAccountsIcon />} onClick={() => navigate('/personal')} sx={DARK_BTN_SX}>
                    Administrar Personal
                </Button>
            </Stack>

            <TableContainer component={Paper} elevation={0} sx={TABLE_CONTAINER_SX}>
                <Table size="small" sx={{ minWidth: 900 }}>
                    <TableHead>
                        <TableRow sx={HEADER_ROW_SX}>
                            <TableCell sx={HEADER_CELL_SX}>Semana</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Personal MX</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Nómina MXN</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Personal US</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Nómina USD</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Estado</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Detalle</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {weeks.map(w => {
                            const pendiente = w.estado === 'Pendiente';
                            return (
                                <TableRow key={w.period_id} hover>
                                    <TableCell sx={{ borderLeft: `3px solid ${pendiente ? '#f59e0b' : '#cbd5e1'}`, pl: 2 }}>
                                        <Typography variant="body2" sx={CELL_STRONG_SX}>Semana {w.semana} · {w.anio}</Typography>
                                        <Typography variant="caption" sx={{ ...CELL_MUTED_SX, ...NUMERO_SX }}>
                                            Corte {String(w.fecha_corte || '').split(' ')[0]}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip size="small" label={`${w.emps_mx} personas`} sx={CHIP_OK_SX} />
                                    </TableCell>
                                    <TableCell align="right" sx={{ ...NUMERO_SX, fontWeight: 700, color: '#0f172a' }}>
                                        {pesos(w.total_mx)} <Typography component="span" variant="caption" color="#94a3b8">MXN</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip size="small" label={`${w.emps_us} personas`} sx={CHIP_INFO_SX} />
                                    </TableCell>
                                    <TableCell align="right" sx={{ ...NUMERO_SX, fontWeight: 700, color: '#0f172a' }}>
                                        {dolares(w.total_us)} <Typography component="span" variant="caption" color="#94a3b8">USD</Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        {pendiente ? (
                                            <Button size="small" variant="contained" startIcon={<LockOpenIcon sx={{ fontSize: 16 }} />} onClick={() => handleAuthorize(w)} sx={AUTORIZAR_BTN_SX}>
                                                Autorizar pago
                                            </Button>
                                        ) : (
                                            <Chip size="small" icon={<LockOutlinedIcon sx={{ fontSize: 14 }} />} label="Cerrado" sx={CHIP_NEUTRO_SX} />
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
                                            onClick={() => navigate(`/detalle-pago/${w.period_id}`, { state: w })}
                                            sx={BOTON_FILA_SX}
                                        >
                                            Resumen
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {weeks.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                                    {cargando
                                        ? <CircularProgress size={24} />
                                        : <Typography variant="body2" color="#94a3b8">No hay semanas registradas.</Typography>}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
