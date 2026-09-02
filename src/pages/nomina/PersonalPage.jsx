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
import { CHIP_SX, DARK_BTN_SX, GHOST_BTN_SX, CELL_STRONG_SX, ICON_BTN_SX } from '../../shared/ui/estilos';
import {
    usePersonal,
    useGuardarEmpleado,
    useEliminarEmpleado,
    validarFormularioEmpleado,
} from '../../entities/personal';
import { COLOR } from '../../shared/ui/tokens';

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
        { id: 'nombre', label: 'Nombre', ordenable: true, sx: CELL_STRONG_SX },
        { id: 'puesto', label: 'Puesto', ordenable: true },
        {
            id: 'sueldo', label: 'Sueldo', ordenable: true, align: 'right',
            render: (e) => `$${e.sueldo.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
            sx: { fontWeight: 800 },
        },
        {
            id: 'frecuencia_pago', label: 'Frecuencia', ordenable: true,
            render: (e) => <Chip label={e.frecuencia_pago} size="small" variant="outlined" sx={CHIP_SX} />,
        },
        {
            id: 'tipo_nomina', label: 'Divisa / Nómina', ordenable: true, align: 'center',
            render: (e) => (
                <Chip
                    label={e.tipo_nomina === 'MX' ? 'Pesos (MXN)' : 'Dólares (USD)'}
                    size="small"
                    sx={e.tipo_nomina === 'MX' ? { ...CHIP_SX, bgcolor: COLOR.EXITO_FONDO, color: COLOR.EXITO, border: `1px solid ${COLOR.EXITO_BORDE}` } : { ...CHIP_SX, bgcolor: COLOR.INFO_FONDO, color: COLOR.INFO, border: `1px solid ${COLOR.INFO_BORDE}` }}
                />
            ),
        },
        {
            id: 'acciones', label: '', align: 'right',
            render: (e) => (
                <>
                    <IconButton onClick={() => openModal(e)} size="small" sx={{ ...ICON_BTN_SX, mr: 1 }} title="Editar">
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(e.id)} size="small" sx={{ ...ICON_BTN_SX, color: COLOR.PELIGRO }} title="Eliminar">
                        <DeleteIcon />
                    </IconButton>
                </>
            ),
        },
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 4, pb: 10 }}>
            <PageHeader
                seccion="Nómina"
                titulo="Catálogo de Personal"
                descripcion="Gestiona los empleados, sus sueldos y la divisa de su nómina."
                acciones={
                    <>
                        <Button
                            variant="outlined" startIcon={<ArrowBackIcon />}
                            onClick={() => navigate(-1)}
                            sx={GHOST_BTN_SX}
                        >
                            Volver a Pagos
                        </Button>
                        <Button
                            variant="contained" startIcon={<AddIcon />}
                            onClick={() => openModal()}
                            sx={DARK_BTN_SX}
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
            />

            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 800, color: 'primary.main', borderBottom: `1px solid ${COLOR.BORDE}`, pb: 2 }}>
                    {form.id ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
                </DialogTitle>
                <DialogContent sx={{ pt: 4 }}>
                    <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid size={{ xs: 12 }}>
                            <TextField label="Nombre completo" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField label="Puesto (Ej. Mecánico, Velador, Limpieza)" value={form.puesto} onChange={e => setForm({...form, puesto: e.target.value})} fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField label="Sueldo a pagar" type="number" value={form.sueldo} onChange={e => setForm({...form, sueldo: e.target.value})} fullWidth />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField select label="Nómina (Divisa)" value={form.tipo_nomina} onChange={e => setForm({...form, tipo_nomina: e.target.value})} fullWidth>
                                <MenuItem value="MX">Pesos (MXN)</MenuItem>
                                <MenuItem value="US">Dólares (USD)</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField select label="Frecuencia de Pago" value={form.frecuencia_pago} onChange={e => setForm({...form, frecuencia_pago: e.target.value})} fullWidth>
                                <MenuItem value="Semanal">Semanal</MenuItem>
                                <MenuItem value="Quincenal">Quincenal</MenuItem>
                                <MenuItem value="Mensual">Mensual</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 3, borderTop: `1px solid ${COLOR.BORDE}` }}>
                    <Button onClick={() => setOpen(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSubmit} disabled={guardar.isPending} sx={{ textTransform: 'none', fontWeight: 600, px: 4 }}>
                        {guardar.isPending ? 'Guardando…' : 'Guardar Empleado'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}