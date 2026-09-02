import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Grid, Typography, Box, Paper, Chip, Stack, InputAdornment, Autocomplete, CircularProgress, IconButton, Tooltip
} from '@mui/material';
import { urlSegura, archivosDelEvento, GRUPOS_ARCHIVO } from '../../../shared/security';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import FieldLabel from '../../../components/Gastos/FieldLabel';
import {
    DIALOG_PAPER_SX, DIALOG_TITLE_SX, DIALOG_CONTENT_SX, DIALOG_ACTIONS_SX,
    CARD_SX, SECTION_LABEL_SX, PAGE_OVERLINE_SX, INPUT_SX,
    GHOST_BTN_SX, DARK_BTN_SX, CHIP_SX,
} from '../../../shared/ui/estilos';

const apiHost = import.meta.env.VITE_API_HOST;

/**
 * Alta y edición de una reparación en ruta.
 *
 * Sirve al módulo de mantenimientos y también a Viajes, que lo abre desde una
 * fila de viaje con `initialTrip` para dejar el viaje ya seleccionado.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.open Si el modal está visible.
 * @param {Function} props.onClose Se llama al cerrar.
 * @param {Function} props.onSuccess Se llama tras guardar con éxito.
 * @param {object} [props.editData] Registro a editar; ausente para un alta.
 * @param {object} [props.initialTrip] Viaje preseleccionado.
 * @param {Function} [props.onDocumentsChanged] Se llama al agregar o borrar un adjunto.
 * @returns {object} El modal renderizado.
 */
const ReparacionModal = ({ open, onClose, onSuccess, editData, initialTrip, onDocumentsChanged }) => {
    const [trucks, setTrucks] = useState([]);
    
    // 🚨 Agregamos trip_id y formatted_trip al estado
    const [formData, setFormData] = useState({
        id_reparacion: '', truck_id: '', trip_id: '', formatted_trip: '', operador: '', ciudad: '', estado: '',
        fallo: '', tipo_reparacion: '', comentarios: '', costo_reparacion: '', costo_refacciones: '', fecha_suceso: ''
    });
    
    const [files, setFiles] = useState([]);
    // id_doc del documento guardado que se está eliminando (para el spinner del chip)
    const [deletingDocId, setDeletingDocId] = useState(null);

    // 🚨 Estados para el Autocomplete de Viajes
    const [tripOptions, setTripOptions] = useState([]);
    const [loadingTrips, setLoadingTrips] = useState(false);
    // Si ya hay un viaje asociado, lo mostramos como texto junto al título en vez
    // del input de búsqueda; este flag permite volver a mostrar el input para
    // cambiarlo (solo cuando no viene fijado por contexto, ver initialTrip).
    const [editingTrip, setEditingTrip] = useState(false);

    useEffect(() => {
        if (open) {
            fetchTrucks();
            setEditingTrip(false);
            if (editData) {
                setFormData({
                    ...editData,
                    trip_id: editData.trip_id || '',
                    formatted_trip: editData.formatted_trip || '',
                    fecha_suceso: editData.fecha_suceso || ''
                });
                if (editData.trip_id) {
                    setTripOptions([{ trip_id: editData.trip_id, formatted_trip: editData.formatted_trip }]);
                }
            } else {
                setFormData({
                    id_reparacion: '', truck_id: initialTrip?.truck_id || '', trip_id: initialTrip?.trip_id || '', formatted_trip: initialTrip?.formatted_trip || '',
                    operador: initialTrip?.operador || '', ciudad: '', estado: '',
                    fallo: '', tipo_reparacion: '', comentarios: '', costo_reparacion: '', costo_refacciones: '', fecha_suceso: ''
                });
                setTripOptions(initialTrip ? [{ trip_id: initialTrip.trip_id, formatted_trip: initialTrip.formatted_trip }] : []);
            }
            setFiles([]);
            setDeletingDocId(null);
        }
    }, [open, editData, initialTrip]);

    const fetchTrucks = async () => {
        const fd = new FormData();
        fd.append('op', 'get_trucks');
        const res = await fetch(`${apiHost}/roadside_repairs.php`, { method: 'POST', body: fd });
        const data = await res.json();
        if (data.status === 'success') setTrucks(data.data);
    };

    // 🚨 Función que busca los viajes mientras escribes
    const fetchTrips = async (searchStr) => {
        if (!searchStr || isNaN(searchStr)) {
            setTripOptions([]);
            return;
        }
        setLoadingTrips(true);
        try {
            const fd = new FormData();
            fd.append('op', 'get_trips');
            fd.append('search', searchStr);
            const res = await fetch(`${apiHost}/roadside_repairs.php`, { method: 'POST', body: fd });
            const data = await res.json();
            if (data.status === 'success') {
                setTripOptions(data.data || []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingTrips(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'comentarios' && value.length > 300) return; 
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = async (e) => {
        const selectedFiles = await archivosDelEvento(e, { grupo: GRUPOS_ARCHIVO.SOLO_PDF });
        if (selectedFiles.length > 3) {
            Swal.fire('Atención', 'Solo puedes subir un máximo de 3 documentos PDF.', 'warning');
            return;
        }
        setFiles(selectedFiles.slice(0, 3));
    };

    const removeFile = (index) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
    };

    // Elimina un documento YA guardado en el servidor (uno por uno).
    // El backend solo borra el renglón de la tabla de documentos + el archivo
    // físico; la reparación en sí nunca se toca.
    const handleDeleteDoc = async (doc) => {
        const confirm = await Swal.fire({
            title: '¿Eliminar documento?',
            html: `Se eliminará <b>${doc.file_name || 'este documento'}</b> de forma permanente.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#d32f2f'
        });
        if (!confirm.isConfirmed) return;

        setDeletingDocId(doc.id_doc);
        try {
            const fd = new FormData();
            fd.append('op', 'delete_doc');
            fd.append('id_doc', doc.id_doc);
            fd.append('id_reparacion', formData.id_reparacion);

            const res = await fetch(`${apiHost}/roadside_repairs.php`, { method: 'POST', body: fd });
            const data = await res.json();

            if (data.status !== 'success') throw new Error(data.message || 'No se pudo eliminar el documento.');

            setFormData(prev => ({
                ...prev,
                documentos: (prev.documentos || []).filter(d => String(d.id_doc) !== String(doc.id_doc))
            }));
            onDocumentsChanged?.();
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Documento eliminado', showConfirmButton: false, timer: 2000 });
        } catch (err) {
            Swal.fire('Error', err.message || 'Problema de conexión.', 'error');
        } finally {
            setDeletingDocId(null);
        }
    };

    const handleSubmit = async () => {
        if (!formData.truck_id || !formData.operador || !formData.fallo || !formData.tipo_reparacion) {
            Swal.fire('Error', 'Por favor llena los campos obligatorios.', 'error');
            return;
        }

        const fd = new FormData();
        fd.append('op', 'save');
        Object.keys(formData).forEach(key => fd.append(key, formData[key]));
        files.forEach(file => fd.append('invoices[]', file));

        try {
            const res = await fetch(`${apiHost}/roadside_repairs.php`, { method: 'POST', body: fd });
            const data = await res.json();
            if (data.status === 'success') {
                Swal.fire('¡Guardado!', 'La reparación ha sido registrada.', 'success');
                onSuccess();
            } else {
                Swal.fire('Error', data.message, 'error');
            }
        } catch {
            Swal.fire('Error', 'Problema de conexión.', 'error');
        }
    };

    const inputProps = { size: "small", InputProps: { sx: INPUT_SX } };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth scroll="paper" PaperProps={{ sx: DIALOG_PAPER_SX }}>
            <DialogTitle sx={DIALOG_TITLE_SX}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Box>
                        <Typography variant="overline" sx={PAGE_OVERLINE_SX}>
                            Safety · Reparaciones
                        </Typography>
                        <Typography variant="h5" fontWeight={800} color="#0f172a" letterSpacing="-0.02em" sx={{ mt: 0.25 }}>
                            {editData ? 'Editar Reparación' : 'Nueva Reparación en Carretera'}
                        </Typography>
                        <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                            Registra la unidad, la falla y los comprobantes del gasto.
                        </Typography>
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        {formData.trip_id && !editingTrip && (
                            <Chip
                                label={`Viaje: ${formData.formatted_trip || formData.trip_id}`}
                                size="small"
                                sx={{ ...CHIP_SX, bgcolor: '#eef2ff', color: '#4338ca', border: '1px solid #e0e7ff' }}
                                onDelete={initialTrip ? undefined : () => setEditingTrip(true)}
                                deleteIcon={initialTrip ? undefined : <EditIcon sx={{ fontSize: 15 }} />}
                            />
                        )}
                        <IconButton onClick={onClose} sx={{ color: '#64748b' }}>
                            <CloseIcon />
                        </IconButton>
                    </Stack>
                </Stack>
                {(!formData.trip_id || editingTrip) && (
                  <Box sx={{ maxWidth: 320, mt: 1 }}>
                    <FieldLabel>Viaje Asociado</FieldLabel>
                    <Autocomplete
                        fullWidth
                        disabled={!!initialTrip}
                        options={tripOptions}
                        getOptionLabel={(option) => option.formatted_trip || ''}
                        isOptionEqualToValue={(option, value) => option.trip_id === value.trip_id}
                        value={formData.trip_id ? { trip_id: formData.trip_id, formatted_trip: formData.formatted_trip } : null}
                        onChange={(event, newValue) => {
                            setFormData({
                                ...formData,
                                trip_id: newValue ? newValue.trip_id : '',
                                formatted_trip: newValue ? newValue.formatted_trip : ''
                            });
                            if (newValue) setEditingTrip(false);
                        }}
                        onInputChange={(event, newInputValue, reason) => {
                            if (reason === 'input') {
                                fetchTrips(newInputValue);
                            }
                        }}
                        loading={loadingTrips}
                        noOptionsText="Ingresa el número exacto del viaje..."
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                placeholder="Ej. 8"
                                InputLabelProps={{ shrink: true }}
                                size="small"
                                sx={{ bgcolor: 'white' }}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <React.Fragment>
                                            {loadingTrips ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </React.Fragment>
                                    ),
                                }}
                            />
                        )}
                    />
                  </Box>
                )}
            </DialogTitle>

            <DialogContent sx={DIALOG_CONTENT_SX}>
                <Stack spacing={3} sx={{ mt: 1 }}>

                    {/* SECCIÓN 1: UNIDAD */}
                    <Paper elevation={0} sx={CARD_SX}>
                        <Typography variant="overline" sx={SECTION_LABEL_SX}>Datos de la Unidad</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FieldLabel>Unidad (Camión) *</FieldLabel>
                                <TextField
                                    select
                                    fullWidth
                                    name="truck_id"
                                    value={formData.truck_id}
                                    onChange={handleChange}
                                    {...inputProps}
                                    SelectProps={{ sx: { minWidth: '180px' } }}
                                >
                                    <MenuItem value="" disabled>Selecciona unidad</MenuItem>
                                    {trucks.map(t => <MenuItem key={t.truck_id} value={t.truck_id}>{t.unidad}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FieldLabel>Operador *</FieldLabel>
                                <TextField fullWidth name="operador" placeholder="Nombre completo" value={formData.operador} onChange={handleChange} {...inputProps} />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* SECCIÓN 2: INCIDENTE */}
                    <Paper elevation={0} sx={CARD_SX}>
                        <Typography variant="overline" sx={SECTION_LABEL_SX}>Reporte de Falla</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <FieldLabel>Ciudad</FieldLabel>
                                <TextField fullWidth name="ciudad" placeholder="Ciudad actual" value={formData.ciudad} onChange={handleChange} {...inputProps} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <FieldLabel>Estado</FieldLabel>
                                <TextField fullWidth name="estado" placeholder="Estado/Provincia" value={formData.estado} onChange={handleChange} {...inputProps} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 4 }}>
                                <FieldLabel>Fecha del Suceso</FieldLabel>
                                <TextField
                                    fullWidth
                                    type="date"
                                    name="fecha_suceso"
                                    value={formData.fecha_suceso || ''}
                                    onChange={handleChange}
                                    {...inputProps}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 7 }}>
                                <FieldLabel>Fallo Reportado *</FieldLabel>
                                <TextField fullWidth name="fallo" placeholder="Ej. Falla en sistema de frenos" value={formData.fallo} onChange={handleChange} {...inputProps} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 5 }}>
                                <FieldLabel>Reparación realizada por *</FieldLabel>
                                <TextField 
                                    select 
                                    fullWidth 
                                    name="tipo_reparacion" 
                                    value={formData.tipo_reparacion} 
                                    onChange={handleChange} 
                                    {...inputProps}
                                    SelectProps={{ sx: { minWidth: '200px' } }}
                                >
                                    <MenuItem value="Operador">Operador</MenuItem>
                                    <MenuItem value="Interno">Taller Interno</MenuItem>
                                    <MenuItem value="Road Services">Road Services</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <FieldLabel>Comentarios</FieldLabel>
                                <TextField fullWidth multiline rows={2} placeholder="Notas adicionales..." name="comentarios" value={formData.comentarios} onChange={handleChange} {...inputProps} helperText={`${formData.comentarios.length}/300`} />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* SECCIÓN 3: COSTOS Y ARCHIVOS */}
                    <Paper elevation={0} sx={CARD_SX}>
                        <Typography variant="overline" sx={SECTION_LABEL_SX}>Administración y Comprobantes</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FieldLabel>Mano de Obra</FieldLabel>
                                <TextField fullWidth name="costo_reparacion" type="number" value={formData.costo_reparacion} onChange={handleChange} {...inputProps} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <FieldLabel>Refacciones</FieldLabel>
                                <TextField fullWidth name="costo_refacciones" type="number" value={formData.costo_refacciones} onChange={handleChange} {...inputProps} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                            </Grid>
                            
                            {/* Documentos ya guardados (solo al editar un registro existente) */}
                            {Array.isArray(formData.documentos) && formData.documentos.length > 0 && (
                                <Grid size={{ xs: 12 }}>
                                    <Typography variant="caption" fontWeight={700} color="textSecondary" display="block" sx={{ mb: 0.5 }}>
                                        DOCUMENTOS YA GUARDADOS
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                                        Da clic en el documento para abrirlo, o en el bote de basura para eliminarlo permanentemente.
                                    </Typography>
                                    {/* El botón de borrar va FUERA del chip: dentro, el chip es un <a>
                                        y el clic abría el documento antes de mostrar la confirmación. */}
                                    <Stack spacing={1}>
                                        {formData.documentos.map((doc) => {
                                            const isDeleting = String(deletingDocId) === String(doc.id_doc);
                                            return (
                                                <Stack
                                                    key={doc.id_doc || doc.file_path}
                                                    direction="row"
                                                    alignItems="center"
                                                    spacing={1}
                                                >
                                                    <Chip
                                                        icon={<PictureAsPdfIcon />}
                                                        label={doc.file_name || 'Documento'}
                                                        component="a"
                                                        href={urlSegura(doc.url)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        clickable
                                                        color="success"
                                                        variant="outlined"
                                                        size="small"
                                                        disabled={isDeleting}
                                                        sx={{ maxWidth: '100%' }}
                                                    />
                                                    {doc.id_doc && (
                                                        <Tooltip title="Eliminar documento">
                                                            <span>
                                                                <IconButton
                                                                    size="small"
                                                                    color="error"
                                                                    disabled={isDeleting}
                                                                    onClick={() => handleDeleteDoc(doc)}
                                                                >
                                                                    {isDeleting
                                                                        ? <CircularProgress size={16} color="inherit" />
                                                                        : <DeleteIcon fontSize="small" />}
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    )}
                                                </Stack>
                                            );
                                        })}
                                    </Stack>
                                </Grid>
                            )}

                            {/* Subida de Invoices */}
                            <Grid size={{ xs: 12 }}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    border: '2px dashed #90caf9', 
                                    bgcolor: '#e3f2fd', 
                                    py: 4, px: 2, textAlign: 'center', borderRadius: 2,
                                    cursor: 'pointer', transition: '0.2s',
                                    '&:hover': { bgcolor: '#e1f5fe', borderColor: '#42a5f5' }
                                }} component="label">
                                    <CloudUploadIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                                    <Typography variant="button" fontWeight={700} color="primary" sx={{ display: 'block', width: '100%' }}>
                                        Seleccionar Invoices (PDF)
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                        Máximo 3 archivos permitidos
                                    </Typography>
                                    <input type="file" hidden multiple accept="application/pdf" onChange={handleFileChange} />
                                </Box>

                                {files.length > 0 && (
                                    <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                                        {files.map((file, index) => (
                                            <Chip 
                                                key={index} 
                                                icon={<PictureAsPdfIcon />} 
                                                label={file.name} 
                                                onDelete={() => removeFile(index)} 
                                                color="error" 
                                                variant="outlined" 
                                                size="small" 
                                            />
                                        ))}
                                    </Stack>
                                )}
                            </Grid>
                        </Grid>
                    </Paper>
                </Stack>
            </DialogContent>
            
            <DialogActions sx={DIALOG_ACTIONS_SX}>
                <Button variant="outlined" onClick={onClose} sx={GHOST_BTN_SX}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" sx={DARK_BTN_SX}>
                    Guardar Registro
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReparacionModal;