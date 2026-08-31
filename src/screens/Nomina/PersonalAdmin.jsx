import React, { useState } from 'react';
import { 
    Container, Paper, Typography, Button, Table, TableHead, TableRow, TableCell, 
    TableBody, Stack, IconButton, Dialog, DialogTitle, DialogContent, TextField, 
    MenuItem, DialogActions, Box, TableContainer, Chip, Grid 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import {
    usePersonal,
    useGuardarEmpleado,
    useEliminarEmpleado,
    validarFormularioEmpleado,
} from '../../entities/personal';

const FORMULARIO_VACIO = { id: null, nombre: '', puesto: '', sueldo: '', frecuencia_pago: 'Semanal', tipo_nomina: 'MX' };

/**
 * Catálogo de personal de nómina: alta, edición y baja de empleados.
 *
 * @returns {JSX.Element} La pantalla.
 */
export default function PersonalAdmin() {
    const navigate = useNavigate();
    const { data: personal = [], isLoading, isError, error } = usePersonal();
    const guardar = useGuardarEmpleado();
    const eliminar = useEliminarEmpleado();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(FORMULARIO_VACIO);

    const handleSubmit = async () => {
        const validacion = validarFormularioEmpleado(form);
        if (!validacion.valido) return Swal.fire('Atención', validacion.mensaje, 'warning');

        try {
            await guardar.mutateAsync(validacion.datos);
            setOpen(false);
            Swal.fire('Éxito', 'Guardado correctamente', 'success');
        } catch (e) {
            Swal.fire('No se pudo guardar', e.message, 'error');
        }
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({ 
            title: '¿Eliminar empleado?', text: 'El historial de pagos previos se mantendrá intacto.', icon: 'warning', 
            showCancelButton: true, confirmButtonText: 'Sí, eliminar', confirmButtonColor: '#d32f2f' 
        });
        if (!confirm.isConfirmed) return;
        try {
            await eliminar.mutateAsync(id);
        } catch (e) {
            Swal.fire('No se pudo eliminar', e.message, 'error');
        }
    };

    const openModal = (data = null) => {
        setForm(data ?? FORMULARIO_VACIO);
        setOpen(true);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4, pb: 10 }}>
            {/* ENCABEZADO */}
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        Catálogo de Personal
                    </Typography>
                    <Typography variant="body1" color="text.secondary">Gestiona los empleados, sus sueldos y la divisa de su nómina.</Typography>
                </Box>
                
                <Stack direction="row" spacing={2}>
                    <Button 
                        variant="outlined" 
                        color="inherit" 
                        startIcon={<ArrowBackIcon />} 
                        onClick={() => navigate(-1)}
                        sx={{ fontWeight: 600, textTransform: 'none', bgcolor: 'white' }}
                    >
                        Volver a Pagos
                    </Button>
                    <Button 
                        variant="contained" 
                        color="primary"
                        startIcon={<AddIcon />} 
                        onClick={() => openModal()}
                        sx={{ fontWeight: 600, textTransform: 'none' }}
                    >
                        Agregar Empleado
                    </Button>
                </Stack>
            </Box>

            {/* TABLA DE PERSONAL */}
            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 2, borderTop: '4px solid #9c27b0' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ bgcolor: '#f0f4f8' }}>
                            <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Puesto</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Sueldo</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Frecuencia</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="center">Divisa / Nómina</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {personal.map(p => (
                            <TableRow key={p.id} hover>
                                <TableCell sx={{ fontWeight: 600 }}>{p.nombre}</TableCell>
                                <TableCell color="text.secondary">{p.puesto}</TableCell>
                                <TableCell sx={{ fontWeight: 800, color: p.tipo_nomina === 'MX' ? 'success.main' : 'primary.main' }}>
                                    ${Number(p.sueldo).toLocaleString('en-US', {minimumFractionDigits: 2})}
                                </TableCell>
                                <TableCell>
                                    <Chip label={p.frecuencia_pago} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell align="center">
                                    <Chip 
                                        label={p.tipo_nomina === 'MX' ? 'Pesos (MXN)' : 'Dólares (USD)'} 
                                        size="small" 
                                        color={p.tipo_nomina === 'MX' ? 'success' : 'primary'} 
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton onClick={() => openModal(p)} color="primary" title="Editar">
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(p.id)} color="error" title="Eliminar">
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {isLoading && (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}><Typography fontStyle="italic" color="text.secondary">Cargando personal…</Typography></TableCell></TableRow>
                        )}
                        {isError && (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}><Typography fontStyle="italic" color="error.main">{error.message}</Typography></TableCell></TableRow>
                        )}
                        {!isLoading && !isError && personal.length === 0 && (
                            <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3 }}><Typography fontStyle="italic" color="text.secondary">No hay personal registrado activo.</Typography></TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* MODAL (DIALOG) */}
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 800, color: 'primary.main', borderBottom: '1px solid #e0e0e0', pb: 2 }}>
                    {form.id ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
                </DialogTitle>
                <DialogContent sx={{ pt: 4 }}>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={12}>
                            <TextField label="Nombre completo" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Puesto (Ej. Mecánico, Velador, Limpieza)" value={form.puesto} onChange={e => setForm({...form, puesto: e.target.value})} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="Sueldo a pagar" type="number" value={form.sueldo} onChange={e => setForm({...form, sueldo: e.target.value})} fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField select label="Nómina (Divisa)" value={form.tipo_nomina} onChange={e => setForm({...form, tipo_nomina: e.target.value})} fullWidth>
                                <MenuItem value="MX">Pesos (MXN)</MenuItem>
                                <MenuItem value="US">Dólares (USD)</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField select label="Frecuencia de Pago" value={form.frecuencia_pago} onChange={e => setForm({...form, frecuencia_pago: e.target.value})} fullWidth>
                                <MenuItem value="Semanal">Semanal</MenuItem>
                                <MenuItem value="Quincenal">Quincenal</MenuItem>
                                <MenuItem value="Mensual">Mensual</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
                    <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={guardar.isPending} sx={{ textTransform: 'none', fontWeight: 600, px: 4 }}>
                        {guardar.isPending ? 'Guardando…' : 'Guardar Empleado'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}