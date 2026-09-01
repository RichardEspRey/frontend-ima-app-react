import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid,
    MenuItem, CircularProgress, Autocomplete, Typography, Box, Stack, Paper, Chip, InputAdornment, IconButton, Tooltip
} from '@mui/material';

// Íconos para la UI
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';

import Swal from 'sweetalert2';
import FieldLabel from '../../../components/Gastos/FieldLabel';
import {
    DIALOG_PAPER_SX, DIALOG_TITLE_SX, DIALOG_CONTENT_SX, DIALOG_ACTIONS_SX,
    CARD_SX, SECTION_LABEL_SX, PAGE_OVERLINE_SX, INPUT_SX,
    GHOST_BTN_SX, DARK_BTN_SX, CHIP_SX,
} from '../../../shared/ui/estilos';

const apiHost = import.meta.env.VITE_API_HOST;

const initialForm = {
    id_inspeccion: '',
    truck_id: '',
    trip_id: '',
    trip_number_search: '',
    operador: '',
    ciudad: '',
    estado: '',
    fecha_inspeccion: '',
    multa_ima: '',
    multa_driver: ''
};

/**
 * Alta y edición de una inspección.
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
const InspeccionModal = ({ open, onClose, onSuccess, editData, initialTrip, onDocumentsChanged }) => {
    const [formData, setFormData] = useState(initialForm);
    const [files, setFiles] = useState([]);
    // id_doc del documento guardado que se está eliminando (para el spinner del chip)
    const [deletingDocId, setDeletingDocId] = useState(null);
    const [trucks, setTrucks] = useState([]);
    const [descriptions, setDescriptions] = useState([]);
    const [tripsOptions, setTripsOptions] = useState([]);
    
    // Estados para la lista de reportes múltiples
    const [reportesList, setReportesList] = useState([]);
    const [currentReport, setCurrentReport] = useState({
        tipo_violacion: '',
        descripcion: '',
        comentarios: ''
    });

    const [loading, setLoading] = useState(false);
    const [loadingTrips, setLoadingTrips] = useState(false);
    const [saving, setSaving] = useState(false);
    // Si ya hay un viaje asociado, lo mostramos como texto junto al título en vez
    // del input de búsqueda; este flag permite volver a mostrar el input para
    // cambiarlo (solo cuando no viene fijado por contexto, ver initialTrip).
    const [editingTrip, setEditingTrip] = useState(false);

    useEffect(() => {
        if (open) {
            fetchInitialData();
            setEditingTrip(false);
            if (editData) {
                setFormData({
                    ...initialForm,
                    ...editData,
                    trip_number_search: editData.formatted_trip || '',
                    fecha_inspeccion: editData.fecha_inspeccion || ''
                });

                // Soporte por si ya se envían múltiples reportes desde el backend o es el formato viejo
                if (editData.reportes && Array.isArray(editData.reportes)) {
                    setReportesList(editData.reportes);
                } else if (editData.tipo_violacion) {
                    setReportesList([{
                        tipo_violacion: editData.tipo_violacion,
                        descripcion: editData.descripcion,
                        comentarios: editData.comentarios || ''
                    }]);
                }
            } else {
                setFormData({
                    ...initialForm,
                    trip_id: initialTrip?.trip_id || '',
                    trip_number_search: initialTrip?.formatted_trip || '',
                    truck_id: initialTrip?.truck_id || '',
                    operador: initialTrip?.operador || ''
                });
                setReportesList([]);
                setCurrentReport({ tipo_violacion: '', descripcion: '', comentarios: '' });
            }
            setFiles([]);
            setDeletingDocId(null);
            setTripsOptions(initialTrip ? [initialTrip] : []);
        }
    }, [open, editData, initialTrip]);

    const fetchInitialData = async () => {
        setLoading(true);
        try {
            const fdTrucks = new FormData();
            fdTrucks.append('op', 'get_trucks');
            const resTrucks = await fetch(`${apiHost}/inspecciones.php`, { method: 'POST', body: fdTrucks });
            const dataTrucks = await resTrucks.json();
            if (dataTrucks.status === 'success') setTrucks(dataTrucks.data);

            const fdDesc = new FormData();
            fdDesc.append('op', 'get_descriptions');
            const resDesc = await fetch(`${apiHost}/inspecciones.php`, { method: 'POST', body: fdDesc });
            const dataDesc = await resDesc.json();
            if (dataDesc.status === 'success') {
                const descArray = dataDesc.data.map(d => d.descripcion);
                setDescriptions(descArray);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchTrip = async (value) => {
        setFormData(prev => ({ ...prev, trip_number_search: value, trip_id: '' }));
        if (!value || isNaN(value)) {
            setTripsOptions([]);
            return;
        }

        setLoadingTrips(true);
        try {
            const fd = new FormData();
            fd.append('op', 'get_trips');
            fd.append('search', value);
            const res = await fetch(`${apiHost}/inspecciones.php`, { method: 'POST', body: fd });
            const data = await res.json();
            if (data.status === 'success') {
                setTripsOptions(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingTrips(false);
        }
    };

    const handleSelectTrip = (event, newValue) => {
        if (newValue) {
            setFormData(prev => ({
                ...prev,
                trip_id: newValue.trip_id,
                trip_number_search: newValue.formatted_trip
            }));
        } else {
            setFormData(prev => ({ ...prev, trip_id: '', trip_number_search: '' }));
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Manejadores para el registro temporal de reporte
    const handleReportChange = (e) => {
        const { name, value } = e.target;
        if (name === 'comentarios' && value.length > 500) return;
        setCurrentReport(prev => ({ ...prev, [name]: value }));
    };

    const handleReportDescriptionChange = (event, newValue) => {
        if (newValue && newValue.length > 200) return;
        setCurrentReport(prev => ({ ...prev, descripcion: newValue || '' }));
    };

    const handleAddReport = () => {
        if (!currentReport.tipo_violacion || !currentReport.descripcion) {
            Swal.fire('Atención', 'Selecciona el tipo de violación y la descripción para agregar a la lista.', 'warning');
            return;
        }
        setReportesList(prev => [...prev, currentReport]);
        setCurrentReport({ tipo_violacion: '', descripcion: '', comentarios: '' });
    };

    const handleRemoveReport = (index) => {
        setReportesList(prev => prev.filter((_, i) => i !== index));
    };

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        if (files.length + newFiles.length > 3) {
            Swal.fire('Atención', 'Solo puedes subir un máximo de 3 documentos.', 'warning');
            return;
        }
        setFiles(prev => [...prev, ...newFiles].slice(0, 3));
    };

    const removeFile = (indexToRemove) => {
        setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    // Elimina un documento YA guardado en el servidor (uno por uno).
    // El backend solo borra el renglón de inspection_docs + el archivo físico;
    // la inspección y sus reportes nunca se tocan.
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
            fd.append('id_inspeccion', formData.id_inspeccion);

            const res = await fetch(`${apiHost}/inspecciones.php`, { method: 'POST', body: fd });
            const data = await res.json();

            if (data.status !== 'success') throw new Error(data.message || 'No se pudo eliminar el documento.');

            setFormData(prev => ({
                ...prev,
                documentos: (prev.documentos || []).filter(d => String(d.id_doc) !== String(doc.id_doc))
            }));
            onDocumentsChanged?.();
            Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Documento eliminado', showConfirmButton: false, timer: 2000 });
        } catch (error) {
            Swal.fire('Error', error.message || 'Problema de conexión.', 'error');
        } finally {
            setDeletingDocId(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación general
        if (!formData.truck_id || !formData.operador || !formData.fecha_inspeccion || !formData.ciudad || !formData.estado) {
            Swal.fire('Error', 'Por favor llena los campos obligatorios de la unidad (*).', 'error');
            return;
        }

        // Si hay un reporte capturado en el formulario pero no se agregó a la lista
        // (el usuario olvidó dar clic en "Agregar a la lista"), lo incluimos automáticamente
        // en vez de perderlo silenciosamente.
        let finalReportesList = reportesList;
        if (currentReport.tipo_violacion && currentReport.descripcion) {
            finalReportesList = [...reportesList, currentReport];
            setReportesList(finalReportesList);
            setCurrentReport({ tipo_violacion: '', descripcion: '', comentarios: '' });
        }

        // Validar que exista al menos un reporte en la lista
        if (finalReportesList.length === 0) {
            Swal.fire('Error', 'Debes agregar al menos un reporte de inspección a la lista.', 'error');
            return;
        }

        setSaving(true);

        const dataToSend = new FormData();
        dataToSend.append('op', 'save');
        Object.entries(formData).forEach(([key, value]) => {
            if (key !== 'trip_number_search') {
                dataToSend.append(key, value === null || value === undefined ? '' : value);
            }
        });

        // Enviar la lista de reportes como JSON para procesar en PHP
        dataToSend.append('reportes', JSON.stringify(finalReportesList));

        files.forEach((file) => {
            dataToSend.append('invoices[]', file);
        });

        try {
            const res = await fetch(`${apiHost}/inspecciones.php`, { method: 'POST', body: dataToSend });
            const result = await res.json();

            if (result.status === 'success') {
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Operación exitosa', showConfirmButton: false, timer: 2000 });
                onSuccess();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const inputProps = { size: "small", InputProps: { sx: INPUT_SX } };

    return (
        <Dialog open={open} onClose={!saving ? onClose : undefined} maxWidth="lg" fullWidth scroll="paper" PaperProps={{ sx: DIALOG_PAPER_SX }}>
            <DialogTitle sx={DIALOG_TITLE_SX}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                    <Box>
                        <Typography variant="overline" sx={PAGE_OVERLINE_SX}>
                            Safety · Inspecciones
                        </Typography>
                        <Typography variant="h5" fontWeight={800} color="#0f172a" letterSpacing="-0.02em" sx={{ mt: 0.25 }}>
                            {editData ? 'Editar Inspección' : 'Nueva Inspección'}
                        </Typography>
                        <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                            Captura la unidad, las violaciones detectadas y las multas.
                        </Typography>
                    </Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        {formData.trip_id && !editingTrip && (
                            <Chip
                                label={`Viaje: ${formData.trip_number_search || formData.trip_id}`}
                                size="small"
                                sx={{ ...CHIP_SX, bgcolor: '#eef2ff', color: '#4338ca', border: '1px solid #e0e7ff' }}
                                onDelete={initialTrip ? undefined : () => setEditingTrip(true)}
                                deleteIcon={initialTrip ? undefined : <EditIcon sx={{ fontSize: 15 }} />}
                            />
                        )}
                        <IconButton onClick={onClose} sx={{ color: '#64748b' }} disabled={saving}>
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
                        options={tripsOptions}
                        getOptionLabel={(option) => typeof option === 'string' ? option : option.formatted_trip || ''}
                        isOptionEqualToValue={(option, value) => option.trip_id === value.trip_id}
                        value={formData.trip_id ? { trip_id: formData.trip_id, formatted_trip: formData.trip_number_search } : null}
                        onChange={(event, newValue) => { handleSelectTrip(event, newValue); if (newValue) setEditingTrip(false); }}
                        onInputChange={(event, newInputValue, reason) => {
                            if (reason === 'input') handleSearchTrip(newInputValue);
                        }}
                        loading={loadingTrips}
                        noOptionsText="Ingresa el número exacto del viaje..."
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                fullWidth
                                placeholder="Ej. 102"
                                {...inputProps}
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
                {loading ? (
                    <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>
                ) : (
                    <Box component="form" id="inspectionForm" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <Stack spacing={3}>
                            
                            {/* SECCIÓN 1: DATOS DE LA UNIDAD */}
                            <Paper elevation={0} sx={CARD_SX}>
                                <Typography variant="overline" sx={SECTION_LABEL_SX}>Datos de la Unidad</Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FieldLabel>Unidad (Camión) *</FieldLabel>
                                        <TextField
                                            select fullWidth name="truck_id"
                                            value={formData.truck_id} onChange={handleChange} required
                                            {...inputProps}
                                            SelectProps={{ sx: { minWidth: '180px' } }}
                                        >
                                            <MenuItem value="" disabled>Selecciona unidad</MenuItem>
                                            {trucks.map(t => <MenuItem key={t.truck_id} value={t.truck_id}>{t.unidad}</MenuItem>)}
                                        </TextField>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FieldLabel>Operador *</FieldLabel>
                                        <TextField fullWidth name="operador" placeholder="Nombre completo" value={formData.operador} onChange={handleChange} required {...inputProps} />
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* SECCIÓN 2: REPORTE DE INSPECCIÓN (Múltiples Registros) */}
                            <Paper elevation={0} sx={CARD_SX}>
                                <Typography variant="overline" sx={SECTION_LABEL_SX}>Reporte de Inspección</Typography>

                                <Grid container spacing={2} alignItems="flex-start" sx={{ mb: 1 }}>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <FieldLabel>Ciudad *</FieldLabel>
                                        <TextField fullWidth name="ciudad" placeholder="Ciudad actual" value={formData.ciudad} onChange={handleChange} required {...inputProps} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <FieldLabel>Estado *</FieldLabel>
                                        <TextField fullWidth name="estado" placeholder="Estado/Provincia" value={formData.estado} onChange={handleChange} required {...inputProps} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <FieldLabel>Fecha de Inspección *</FieldLabel>
                                        <TextField
                                            fullWidth
                                            type="date"
                                            name="fecha_inspeccion"
                                            value={formData.fecha_inspeccion}
                                            onChange={handleChange}
                                            required
                                            {...inputProps}
                                        />
                                    </Grid>
                                </Grid>

                                <Grid container spacing={2} alignItems="flex-start">
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <FieldLabel>Tipo de Violación</FieldLabel>
                                        <TextField 
                                            select fullWidth name="tipo_violacion" 
                                            value={currentReport.tipo_violacion} onChange={handleReportChange}
                                            {...inputProps}
                                            SelectProps={{ sx: { minWidth: '150px' } }}
                                        >
                                            <MenuItem value="Warning">Warning</MenuItem>
                                            <MenuItem value="Out of services">Out of services</MenuItem>
                                        </TextField>
                                    </Grid>
                                    
                                    <Grid size={{ xs: 12, sm: 8 }}>
                                        <FieldLabel>Descripción</FieldLabel>
                                        <Autocomplete
                                            freeSolo
                                            options={descriptions}
                                            value={currentReport.descripcion}
                                            onChange={(event, newValue) => handleReportDescriptionChange(event, newValue)}
                                            onInputChange={(event, newInputValue) => handleReportDescriptionChange(event, newInputValue)}
                                            renderInput={(params) => (
                                                <TextField 
                                                    {...params} 
                                                    placeholder="Ej. Llantas lisas, Fugas..." 
                                                    fullWidth 
                                                    {...inputProps} 
                                                    inputProps={{
                                                        ...params.inputProps,
                                                        maxLength: 200
                                                    }}
                                                    helperText={`${(currentReport.descripcion || '').length}/200 caracteres`}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid size={{ xs: 12 }}>
                                        <FieldLabel>Comentarios</FieldLabel>
                                        <TextField fullWidth multiline rows={2} placeholder="Notas adicionales..." name="comentarios" value={currentReport.comentarios} onChange={handleReportChange} helperText={`${currentReport.comentarios.length}/500`} {...inputProps} />
                                    </Grid>
                                    
                                    <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end">
                                        <Button 
                                            type="button" 
                                            variant="outlined" 
                                            startIcon={<AddCircleOutlineIcon />} 
                                            onClick={handleAddReport}
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            Agregar a la lista
                                        </Button>
                                    </Grid>
                                </Grid>

                                {/* Renderizado de la lista de reportes agregados */}
                                {reportesList.length > 0 && (
                                    <Box sx={{ mt: 3 }}>
                                        <Typography variant="subtitle2" color="text.secondary" mb={1.5} fontWeight={600}>
                                            Violaciones registradas ({reportesList.length}):
                                        </Typography>
                                        <Stack spacing={1.5}>
                                            {reportesList.map((reporte, index) => (
                                                <Paper key={index} variant="outlined" sx={{ p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fafafa', borderColor: '#e0e0e0' }}>
                                                    <Box sx={{ width: '100%' }}>
                                                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                                                            <Chip 
                                                                label={reporte.tipo_violacion} 
                                                                size="small" 
                                                                color={reporte.tipo_violacion === 'Warning' ? 'warning' : 'error'} 
                                                                sx={{ height: 22, fontSize: '0.7rem', fontWeight: 'bold' }} 
                                                            />
                                                            <Typography variant="body2" fontWeight={600}>
                                                                {reporte.descripcion}
                                                            </Typography>
                                                        </Box>
                                                        {reporte.comentarios && (
                                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                                <strong>Nota:</strong> {reporte.comentarios}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    <IconButton color="error" onClick={() => handleRemoveReport(index)} size="small">
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Paper>
                                            ))}
                                        </Stack>
                                    </Box>
                                )}
                            </Paper>

                            {/* SECCIÓN 3: ADMINISTRACIÓN Y COMPROBANTES */}
                            <Paper elevation={0} sx={CARD_SX}>
                                <Typography variant="overline" sx={SECTION_LABEL_SX}>Administración y Comprobantes</Typography>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FieldLabel>Multa IMA</FieldLabel>
                                        <TextField fullWidth name="multa_ima" type="number" inputProps={{ step: "0.01", min: "0" }} value={formData.multa_ima} onChange={handleChange} {...inputProps} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FieldLabel>Multa Driver</FieldLabel>
                                        <TextField fullWidth name="multa_driver" type="number" inputProps={{ step: "0.01", min: "0" }} value={formData.multa_driver} onChange={handleChange} {...inputProps} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
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
                                                                icon={<InsertDriveFileIcon />}
                                                                label={doc.file_name || 'Documento'}
                                                                component="a"
                                                                href={doc.url}
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

                                    <Grid size={{ xs: 12 }}>
                                        <Box sx={{
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            width: '100%', boxSizing: 'border-box', border: '2px dashed #90caf9',
                                            bgcolor: '#e3f2fd', py: 4, px: 2, textAlign: 'center', borderRadius: 2,
                                            cursor: 'pointer', transition: '0.2s', '&:hover': { bgcolor: '#e1f5fe', borderColor: '#42a5f5' }
                                        }} component="label">
                                            <CloudUploadIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                                            <Typography variant="button" fontWeight={700} color="primary" sx={{ display: 'block', width: '100%' }}>
                                                Seleccionar Archivos (PDF/IMG)
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                                Máximo 3 archivos permitidos
                                            </Typography>
                                            <input type="file" hidden multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
                                        </Box>

                                        {files.length > 0 && (
                                            <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                                                {files.map((file, index) => (
                                                    <Chip 
                                                        key={index} 
                                                        icon={<InsertDriveFileIcon />} 
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
                    </Box>
                )}
            </DialogContent>
            
            <DialogActions sx={DIALOG_ACTIONS_SX}>
                <Button variant="outlined" onClick={onClose} disabled={saving} sx={GHOST_BTN_SX}>
                    Cancelar
                </Button>
                <Button type="submit" form="inspectionForm" variant="contained" disabled={saving || loading} sx={DARK_BTN_SX}>
                    {saving ? 'Guardando...' : 'Guardar Inspección'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InspeccionModal;