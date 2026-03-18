import React, { useState, useEffect } from 'react';
import { 
    Container, Paper, Typography, Table, TableHead, TableRow, TableCell, 
    TableBody, Stack, Button, Chip, Box, Grid, TableContainer
} from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

const apiHost = import.meta.env.VITE_API_HOST;

export default function DetallePago() {
    const { period_id } = useParams();
    const { state: weekData } = useLocation();
    const navigate = useNavigate();
    const [detalles, setDetalles] = useState([]);

    useEffect(() => {
        if (!weekData) return;
        const fetchDetails = async () => {
            const fd = new FormData(); 
            fd.append('op', 'get_details');
            fd.append('period_id', period_id);
            fd.append('fecha_corte', weekData.fecha_corte);
            fd.append('estado', weekData.estado);

            const res = await fetch(`${apiHost}/pagos_admin.php`, { method: 'POST', body: fd });
            const json = await res.json();
            if (json.status === 'success') setDetalles(json.data);
        };
        fetchDetails();
    }, [period_id, weekData]);

    if (!weekData) return (
        <Container sx={{ mt: 5 }}><Typography color="error">Error: Falta contexto de la semana. Vuelve a la pantalla anterior.</Typography></Container>
    );

    return (
        <Container maxWidth="xl" sx={{ py: 4, pb: 10 }}>
            {/* HEADER */}
            <Paper elevation={2} sx={{ p: 2, mb: 4, position: 'sticky', top: 10, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight={800} color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ReceiptLongIcon /> Desglose: Semana {weekData.semana} ({weekData.anio})
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                        Corte al: {weekData.fecha_corte}  |  Estado: 
                        <Chip 
                            label={weekData.estado} 
                            size="small" 
                            color={weekData.estado === 'Autorizado' ? 'default' : 'warning'} 
                            sx={{ ml: 1, fontWeight: 'bold', height: 20 }} 
                        />
                    </Typography>
                </Box>
                <Button 
                    variant="outlined" 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate(-1)}
                    sx={{ color: 'text.secondary', borderColor: 'divider', fontWeight: 600, textTransform: 'none', bgcolor: 'white' }}
                >
                    Volver a Pagos
                </Button>
            </Paper>

            {/* KPI CARDS (RESUMEN FINANCIERO) */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, borderLeft: '5px solid #2e7d32', bgcolor: '#f1f8e9', borderRadius: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MonetizationOnIcon color="success" fontSize="small" /> NÓMINA TOTAL (MXN)
                        </Typography>
                        <Typography variant="h4" fontWeight={800} color="success.main" sx={{ mt: 1 }}>
                            ${Number(weekData.total_mx).toLocaleString('es-MX', {minimumFractionDigits: 2})}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Pagado a {weekData.emps_mx} empleado(s)
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, borderLeft: '5px solid #0288d1', bgcolor: '#e1f5fe', borderRadius: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <MonetizationOnIcon color="primary" fontSize="small" /> NÓMINA TOTAL (USD)
                        </Typography>
                        <Typography variant="h4" fontWeight={800} color="primary.main" sx={{ mt: 1 }}>
                            ${Number(weekData.total_us).toLocaleString('en-US', {minimumFractionDigits: 2})}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            Pagado a {weekData.emps_us} empleado(s)
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper elevation={0} sx={{ p: 3, borderLeft: '5px solid #9e9e9e', bgcolor: '#f5f5f5', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <Typography variant="subtitle2" color="text.secondary" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PeopleAltIcon color="action" fontSize="small" /> PLANTILLA TOTAL SEMANA
                        </Typography>
                        <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ mt: 1 }}>
                            {Number(weekData.emps_mx) + Number(weekData.emps_us)} Empleados
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* TABLA DE DETALLE */}
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Desglose por Empleado</Typography>
            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#fafafa' }}>
                            <TableCell sx={{ fontWeight: 700 }}>Nombre del Empleado</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Puesto</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Frecuencia</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Divisa / Nómina</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Monto a Pagar</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {detalles.map((d, i) => (
                            <TableRow key={i} hover>
                                <TableCell sx={{ fontWeight: 600 }}>{d.nombre}</TableCell>
                                <TableCell color="text.secondary">{d.puesto}</TableCell>
                                <TableCell><Chip label={d.frecuencia_pago} size="small" variant="outlined" sx={{ fontWeight: 500 }} /></TableCell>
                                <TableCell>
                                    <Chip label={d.tipo_nomina === 'MX' ? 'MXN' : 'USD'} size="small" color={d.tipo_nomina === 'MX' ? 'success' : 'primary'} sx={{ fontWeight: 'bold' }} />
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800, fontSize: '1.05rem', color: d.tipo_nomina === 'MX' ? 'success.main' : 'primary.main' }}>
                                    ${Number(d.sueldo).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                </TableCell>
                            </TableRow>
                        ))}
                        {detalles.length === 0 && (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><Typography fontStyle="italic" color="text.secondary">No hubo empleados registrados activos antes de la fecha de corte.</Typography></TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    );
}