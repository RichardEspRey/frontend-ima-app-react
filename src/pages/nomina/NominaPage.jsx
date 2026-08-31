import React, { useState, useEffect } from 'react';
import { 
    Container, Paper, Typography, Button, Table, TableHead, TableRow, 
    TableCell, TableBody, Stack, Chip, Box, TableContainer, Divider 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PaymentsIcon from '@mui/icons-material/Payments';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';

const apiHost = import.meta.env.VITE_API_HOST;

export default function PagosAdministrativos() {
    const [weeks, setWeeks] = useState([]);
    const navigate = useNavigate();

    const fetchWeeks = async () => {
        const fd = new FormData(); fd.append('op', 'get_weeks');
        const res = await fetch(`${apiHost}/pagos_admin.php`, { method: 'POST', body: fd });
        const json = await res.json();
        if (json.status === 'success') setWeeks(json.data);
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
            confirmButtonColor: '#2e7d32' 
        });

        if(confirm.isConfirmed) {
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
            } catch(e) {
                Swal.fire('Error', 'Hubo un problema al autorizar la semana', 'error');
            }
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4, pb: 10 }}>
            {/* ENCABEZADO */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Nómina Administrativa
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Control de nómina semanal y autorización de pagos.
                    </Typography>
                </Box>
                <Button 
                    variant="contained" 
                    color="secondary" 
                    startIcon={<ManageAccountsIcon />} 
                    onClick={() => navigate('/personal')}
                    sx={{ fontWeight: 600, textTransform: 'none', px: 3, py: 1 }}
                >
                    Administrar Personal
                </Button>
            </Box>

            {/* TABLA PRINCIPAL */}
            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, borderTop: '4px solid #1976d2' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f0f4f8' }}>
                            <TableCell sx={{ fontWeight: 700, color: '#333' }}>Semana</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: '#333' }}>Personal MX</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#333' }}>Nómina MXN</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: '#333' }}>Personal US</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: '#333' }}>Nómina USD</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: '#333' }}>Estado</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 700, color: '#333' }}>Detalle</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {weeks.map(w => (
                            <TableRow key={w.period_id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                                <TableCell>
                                    <Typography fontWeight="800" color="primary.main">Semana {w.semana} ({w.anio})</Typography>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Corte: {w.fecha_corte.split(' ')[0]}
                                    </Typography>
                                </TableCell>
                                
                                <TableCell align="center">
                                    <Chip icon={<PeopleAltIcon />} label={w.emps_mx} size="small" sx={{ fontWeight: 600, bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                                </TableCell>
                                <TableCell align="right">
                                    <Typography color="success.main" fontWeight="800">${Number(w.total_mx).toLocaleString('es-MX', {minimumFractionDigits: 2})} MXN</Typography>
                                </TableCell>
                                
                                <TableCell align="center">
                                    <Chip icon={<PeopleAltIcon />} label={w.emps_us} size="small" sx={{ fontWeight: 600, bgcolor: '#e3f2fd', color: '#0288d1' }} />
                                </TableCell>
                                <TableCell align="right">
                                    <Typography color="primary.main" fontWeight="800">${Number(w.total_us).toLocaleString('en-US', {minimumFractionDigits: 2})} USD</Typography>
                                </TableCell>
                                
                                <TableCell align="center">
                                    {w.estado === 'Pendiente' ? (
                                        <Button 
                                            variant="contained" 
                                            color="warning" 
                                            size="small" 
                                            startIcon={<LockOpenIcon />}
                                            onClick={() => handleAuthorize(w)}
                                            sx={{ textTransform: 'none', fontWeight: 700, boxShadow: 0 }}
                                        >
                                            Autorizar Pago
                                        </Button>
                                    ) : (
                                        <Chip label="Cerrado" icon={<LockIcon />} color="default" size="small" sx={{ fontWeight: 600 }} />
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    <Button 
                                        variant="outlined" 
                                        color="info" 
                                        size="small"
                                        startIcon={<VisibilityIcon />}
                                        onClick={() => navigate(`/detalle-pago/${w.period_id}`, { state: w })}
                                        sx={{ textTransform: 'none', fontWeight: 600 }}
                                    >
                                        Resumen
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {weeks.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                                    <Typography color="text.secondary" fontStyle="italic">Cargando semanas o no hay datos disponibles...</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}