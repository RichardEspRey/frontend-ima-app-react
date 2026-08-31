import React, { useState } from 'react';
import {
    Container, Button, IconButton, Dialog, DialogTitle, DialogContent, TextField,
    MenuItem, DialogActions, Chip, Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { useNavigate } from 'react-router-dom';
import { DataTable, PageHeader, notify } from '../../shared/ui';
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
        if (!validacion.valido) return notify.aviso(validacion.mensaje);

        try {
            await guardar.mutateAsync(validacion.datos);
            setOpen(false);
            notify.exito('Guardado correctamente');
        } catch (e) {
            notify.error(e, 'No se pudo guardar');
        }
    };

    const handleDelete = async (id) => {
        const acepto = await notify.confirmar({
            titulo: '¿Eliminar empleado?',
            mensaje: 'El historial de pagos previos se mantendrá intacto.',
            confirmar: 'Sí, eliminar',
        });
        if (!acepto) return;
        try {
            await eliminar.mutateAsync(id);
        } catch (e) {
            notify.error(e, 'No se pudo eliminar');
        }
    };

    const openModal = (data = null) => {
        setForm(data ?? FORMULARIO_VACIO);
        setOpen(true);
    };

    const columnas = [
        { id: 'nombre', label: 'Nombre', ordenable: true, sx: { fontWeight: 600 } },
        { id: 'puesto', label: 'Puesto', ordenable: true },
        {
            id: 'sueldo', label: 'Sueldo', ordenable: true, align: 'right',
            render: (e) => `$${e.sueldo.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            sx: { fontWeight: 800 },
        },
        {
            id: 'frecuencia_pago', label: 'Frecuencia', ordenable: true,
            render: (e) => <Chip label={e.frecuencia_pago} size="small" variant="outlined" />,
        },
        {
            id: 'tipo_nomina', label: 'Divisa / Nómina', ordenable: true, align: 'center',
            render: (e) => (
                <Chip
                    label={e.tipo_nomina === 'MX' ? 'Pesos (MXN)' : 'Dólares (USD)'}
                    size="small"
                    color={e.tipo_nomina === 'MX' ? 'success' : 'primary'}
                    sx={{ fontWeight: 'bold' }}
                />
            ),
        },
        {
            id: 'acciones', label: '', align: 'right',
            render: (e) => (
                <>
                    <IconButton onClick={() => openModal(e)} color="primary" title="Editar">
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(e.id)} color="error" title="Eliminar">
                        <DeleteIcon />
                    </IconButton>
                </>
            ),
        },
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4, pb: 10 }}>
            <PageHeader
                titulo="Catálogo de Personal"
                descripcion="Gestiona los empleados, sus sueldos y la divisa de su nómina."
                acciones={
                    <>
                        <Button
                            variant="outlined" color="inherit" startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(-1)}
                            sx={{ fontWeight: 600, textTransform: 'none', bgcolor: 'white' }}
                        >
                            Volver a Pagos
                        </Button>
                        <Button
                            variant="contained" color="primary" startIcon={<AddIcon />}
                            onClick={() => openModal()}
                            sx={{ fontWeight: 600, textTransform: 'none' }}
                        >
                            Agregar Empleado
                        </Button>
                    </>
                }
            />

            <DataTable
                filas={personal}
                columnas={columnas}
                cargando={isLoading}
                error={isError ? error.message : null}
                vacio="No hay personal registrado activo."
                colorBorde="#9c27b0"
            />

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