import React, { useState, useEffect } from 'react';
import {
    Paper, Typography, Button, Table, TableHead, TableRow, TableCell,
    TableBody, Stack, IconButton, Dialog, DialogTitle, DialogContent, TextField,
    MenuItem, DialogActions, Box, TableContainer, Chip, Grid, Tooltip, CircularProgress,
} from '@mui/material';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
    PAGE_SHELL_SX, PAGE_OVERLINE_SX, PAGE_TITLE_SX, HEADER_ROW_SX, HEADER_CELL_SX, TABLE_CONTAINER_SX,
    CELL_STRONG_SX, CELL_MUTED_SX, DARK_BTN_SX, GHOST_BTN_SX, ICON_BTN_SX,
    CHIP_NEUTRO_SX, CHIP_OK_SX, CHIP_INFO_SX,
    DIALOG_PAPER_SX, DIALOG_TITLE_SX, DIALOG_CONTENT_SX, DIALOG_ACTIONS_SX, SECTION_TITLE_SX,
} from '../../styles/estilosTabla';

const apiHost = import.meta.env.VITE_API_HOST;

const NUMERO_SX = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };

const BORRAR_BTN_SX = {
    ...ICON_BTN_SX, borderRadius: 2, color: '#b91c1c', borderColor: '#fecaca',
    '&:hover': { bgcolor: '#fef2f2', borderColor: '#fca5a5' },
};

const EDITAR_BTN_SX = { ...ICON_BTN_SX, borderRadius: 2 };

const FORM_VACIO = { id: null, nombre: '', puesto: '', sueldo: '', frecuencia_pago: 'Semanal', tipo_nomina: 'MX' };

const monto = (valor, mx) =>
    `$${Number(valor || 0).toLocaleString(mx ? 'es-MX' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function PersonalAdmin() {
    const navigate = useNavigate();
    const [personal, setPersonal] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(FORM_VACIO);

    const fetchPersonal = async () => {
        try {
            const fd = new FormData(); fd.append('op', 'getAll');
            const res = await fetch(`${apiHost}/personal_admin.php`, { method: 'POST', body: fd });
            const json = await res.json();
            if (json.status === 'success') setPersonal(json.data);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => { fetchPersonal(); }, []);

    const handleSubmit = async () => {
        if (!form.nombre || !form.sueldo) return Swal.fire('Atención', 'Nombre y sueldo son obligatorios', 'warning');

        const fd = new FormData();
        fd.append('op', form.id ? 'update' : 'add');
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));

        await fetch(`${apiHost}/personal_admin.php`, { method: 'POST', body: fd });
        Swal.fire('Éxito', 'Guardado correctamente', 'success');
        setOpen(false); fetchPersonal();
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: '¿Eliminar empleado?', text: 'El historial de pagos previos se mantendrá intacto.', icon: 'warning',
            showCancelButton: true, confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar', confirmButtonColor: '#b91c1c',
        });
        if (confirm.isConfirmed) {
            const fd = new FormData(); fd.append('op', 'delete'); fd.append('id', id);
            await fetch(`${apiHost}/personal_admin.php`, { method: 'POST', body: fd });
            fetchPersonal();
        }
    };

    const openModal = (data = null) => {
        setForm(data || FORM_VACIO);
        setOpen(true);
    };

    return (
        <Box sx={PAGE_SHELL_SX}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4} flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="overline" sx={PAGE_OVERLINE_SX}>Finanzas · Nómina</Typography>
                    <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em" sx={PAGE_TITLE_SX}>
                        Catálogo de Personal
                    </Typography>
                    <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                        Gestiona los empleados, sus sueldos y la divisa de su nómina.
                    </Typography>
                </Box>
                <Stack direction="row" spacing={1.5}>
                    <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={GHOST_BTN_SX}>
                        Volver a Nómina
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => openModal()} sx={DARK_BTN_SX}>
                        Agregar Empleado
                    </Button>
                </Stack>
            </Stack>

            <TableContainer component={Paper} elevation={0} sx={TABLE_CONTAINER_SX}>
                <Table size="small" sx={{ minWidth: 760 }}>
                    <TableHead>
                        <TableRow sx={HEADER_ROW_SX}>
                            <TableCell sx={HEADER_CELL_SX}>Nombre</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Puesto</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Sueldo</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Frecuencia</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Divisa</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {personal.map(p => {
                            const mx = p.tipo_nomina === 'MX';
                            return (
                                <TableRow key={p.id} hover>
                                    <TableCell sx={CELL_STRONG_SX}>{p.nombre}</TableCell>
                                    <TableCell sx={CELL_MUTED_SX}>{p.puesto || '—'}</TableCell>
                                    <TableCell align="right" sx={{ ...NUMERO_SX, fontWeight: 700, color: '#0f172a' }}>
                                        {monto(p.sueldo, mx)}
                                    </TableCell>
                                    <TableCell><Chip size="small" label={p.frecuencia_pago} sx={CHIP_NEUTRO_SX} /></TableCell>
                                    <TableCell align="center">
                                        <Chip size="small" label={mx ? 'Pesos (MXN)' : 'Dólares (USD)'} sx={mx ? CHIP_OK_SX : CHIP_INFO_SX} />
                                    </TableCell>
                                    <TableCell align="center">
                                        <Stack direction="row" spacing={1} justifyContent="center">
                                            <Tooltip title="Editar">
                                                <IconButton size="small" onClick={() => openModal(p)} sx={EDITAR_BTN_SX}>
                                                    <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton size="small" onClick={() => handleDelete(p.id)} sx={BORRAR_BTN_SX}>
                                                    <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {personal.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                    {cargando
                                        ? <CircularProgress size={24} />
                                        : <Typography variant="body2" color="#94a3b8">No hay personal registrado activo.</Typography>}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: DIALOG_PAPER_SX }}>
                <DialogTitle sx={DIALOG_TITLE_SX}>
                    <Typography variant="h6" sx={SECTION_TITLE_SX}>
                        {form.id ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={DIALOG_CONTENT_SX}>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={12}>
                            <TextField label="Nombre completo" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} fullWidth sx={{ bgcolor: '#fff' }} />
                        </Grid>
                        <Grid size={12}>
                            <TextField label="Puesto (Ej. Mecánico, Velador, Limpieza)" value={form.puesto} onChange={e => setForm({ ...form, puesto: e.target.value })} fullWidth sx={{ bgcolor: '#fff' }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField label="Sueldo a pagar" type="number" value={form.sueldo} onChange={e => setForm({ ...form, sueldo: e.target.value })} fullWidth sx={{ bgcolor: '#fff' }} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField select label="Nómina (Divisa)" value={form.tipo_nomina} onChange={e => setForm({ ...form, tipo_nomina: e.target.value })} fullWidth sx={{ bgcolor: '#fff' }}>
                                <MenuItem value="MX">Pesos (MXN)</MenuItem>
                                <MenuItem value="US">Dólares (USD)</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={12}>
                            <TextField select label="Frecuencia de Pago" value={form.frecuencia_pago} onChange={e => setForm({ ...form, frecuencia_pago: e.target.value })} fullWidth sx={{ bgcolor: '#fff' }}>
                                <MenuItem value="Semanal">Semanal</MenuItem>
                                <MenuItem value="Quincenal">Quincenal</MenuItem>
                                <MenuItem value="Mensual">Mensual</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={DIALOG_ACTIONS_SX}>
                    <Button variant="outlined" onClick={() => setOpen(false)} sx={GHOST_BTN_SX}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSubmit} sx={DARK_BTN_SX}>Guardar Empleado</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
