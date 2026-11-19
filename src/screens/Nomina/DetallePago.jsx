import React, { useState, useEffect } from 'react';
import {
    Paper, Typography, Table, TableHead, TableRow, TableCell,
    TableBody, Stack, Button, Chip, Box, TableContainer, CircularProgress,
} from '@mui/material';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ResumenRegistro } from '../../components/EditorRegistro';
import {
    PAGE_SHELL_SX, PAGE_OVERLINE_SX, PAGE_TITLE_SX, HEADER_ROW_SX, HEADER_CELL_SX, TABLE_CONTAINER_SX,
    CELL_STRONG_SX, CELL_MUTED_SX, GHOST_BTN_SX, SECTION_LABEL_SX,
    CHIP_NEUTRO_SX, CHIP_OK_SX, CHIP_INFO_SX, CHIP_WARN_SX,
} from '../../styles/estilosTabla';

const apiHost = import.meta.env.VITE_API_HOST;

const NUMERO_SX = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };

const pesos = (v) => `$${Number(v || 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dolares = (v) => `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function DetallePago() {
    const { period_id } = useParams();
    const { state: weekData } = useLocation();
    const navigate = useNavigate();
    const [detalles, setDetalles] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        if (!weekData) return;
        const fetchDetails = async () => {
            try {
                const fd = new FormData();
                fd.append('op', 'get_details');
                fd.append('period_id', period_id);
                fd.append('fecha_corte', weekData.fecha_corte);
                fd.append('estado', weekData.estado);

                const res = await fetch(`${apiHost}/pagos_admin.php`, { method: 'POST', body: fd });
                const json = await res.json();
                if (json.status === 'success') setDetalles(json.data);
            } finally {
                setCargando(false);
            }
        };
        fetchDetails();
    }, [period_id, weekData]);

    const volver = (
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={GHOST_BTN_SX}>
            Volver a Nómina
        </Button>
    );

    if (!weekData) {
        return (
            <Box sx={PAGE_SHELL_SX}>
                <Paper elevation={0} sx={{ p: 4, border: '1px dashed #e2e8f0', borderRadius: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="#b91c1c" fontWeight={600} sx={{ mb: 2 }}>
                        Falta la información de la semana. Vuelve a la pantalla anterior y ábrela otra vez.
                    </Typography>
                    {volver}
                </Paper>
            </Box>
        );
    }

    const autorizado = weekData.estado === 'Autorizado';

    return (
        <Box sx={PAGE_SHELL_SX}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4} flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="overline" sx={PAGE_OVERLINE_SX}>Finanzas · Nómina</Typography>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={PAGE_TITLE_SX}>
                        <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em">
                            Semana {weekData.semana} · {weekData.anio}
                        </Typography>
                        <Chip size="small" label={weekData.estado} sx={autorizado ? CHIP_NEUTRO_SX : CHIP_WARN_SX} />
                    </Stack>
                    <Typography variant="body2" color="#64748b" sx={{ mt: 0.5, ...NUMERO_SX }}>
                        Desglose por empleado · corte al {weekData.fecha_corte}
                    </Typography>
                </Box>
                {volver}
            </Stack>

            <ResumenRegistro
                datos={[
                    { etiqueta: 'Nómina MXN', valor: pesos(weekData.total_mx), destacado: true },
                    { etiqueta: 'Personal MX', valor: `${weekData.emps_mx} empleado(s)` },
                    { etiqueta: 'Nómina USD', valor: dolares(weekData.total_us), destacado: true },
                    { etiqueta: 'Personal US', valor: `${weekData.emps_us} empleado(s)` },
                    { etiqueta: 'Plantilla total', valor: `${Number(weekData.emps_mx) + Number(weekData.emps_us)} empleados` },
                ]}
            />

            <Typography variant="overline" sx={{ ...SECTION_LABEL_SX, display: 'block', mb: 1 }}>
                Desglose por empleado
            </Typography>
            <TableContainer component={Paper} elevation={0} sx={TABLE_CONTAINER_SX}>
                <Table size="small" sx={{ minWidth: 700 }}>
                    <TableHead>
                        <TableRow sx={HEADER_ROW_SX}>
                            <TableCell sx={HEADER_CELL_SX}>Empleado</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Puesto</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Frecuencia</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Divisa</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Monto a pagar</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {detalles.map((d, i) => {
                            const mx = d.tipo_nomina === 'MX';
                            return (
                                <TableRow key={i} hover>
                                    <TableCell sx={CELL_STRONG_SX}>{d.nombre}</TableCell>
                                    <TableCell sx={CELL_MUTED_SX}>{d.puesto || '—'}</TableCell>
                                    <TableCell><Chip size="small" label={d.frecuencia_pago} sx={CHIP_NEUTRO_SX} /></TableCell>
                                    <TableCell><Chip size="small" label={mx ? 'MXN' : 'USD'} sx={mx ? CHIP_OK_SX : CHIP_INFO_SX} /></TableCell>
                                    <TableCell align="right" sx={{ ...NUMERO_SX, fontWeight: 800, color: '#0f172a' }}>
                                        {mx ? pesos(d.sueldo) : dolares(d.sueldo)}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {detalles.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                                    {cargando
                                        ? <CircularProgress size={24} />
                                        : <Typography variant="body2" color="#94a3b8">No hubo empleados activos antes de la fecha de corte.</Typography>}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
