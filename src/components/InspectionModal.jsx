import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid,
    MenuItem, CircularProgress, Autocomplete, Typography, Box, Stack, Paper, Chip, InputAdornment
} from '@mui/material';

// Íconos para la UI
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

import Swal from 'sweetalert2';

const apiHost = import.meta.env.VITE_API_HOST;

const initialForm = {
    id_inspeccion: '',
    truck_id: '',
    trip_id: '',
    trip_number_search: '',
    operador: '',
    ciudad: '',
    estado: '',
    fecha_inspeccion: '', // 🚨 Nuevo campo agregado
    tipo_violacion: '',
    descripcion: '',
    comentarios: '',
    multa_ima: '',
    multa_driver: ''
};

const InspectionModal = ({ open, onClose, onSuccess, editData }) => {
    const [formData, setFormData] = useState(initialForm);
    const [files, setFiles] = useState([]);
    const [trucks, setTrucks] = useState([]);
    const [descriptions, setDescriptions] = useState([]);
    const [tripsOptions, setTripsOptions] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [loadingTrips, setLoadingTrips] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            fetchInitialData();
            if (editData) {
                setFormData({
                    ...initialForm,
                    ...editData,
                    trip_number_search: editData.formatted_trip || '',
                    fecha_inspeccion: editData.fecha_inspeccion || '' // 🚨 Cargar fecha al editar
                });
            } else {
                setFormData(initialForm);
            }
            setFiles([]);
            setTripsOptions([]);
        }
    }, [open, editData]);

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
        if (name === 'comentarios' && value.length > 500) return;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDescriptionChange = (event, newValue) => {
        if (newValue && newValue.length > 200) return;
        setFormData(prev => ({ ...prev, descripcion: newValue || '' }));
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validación de campos requeridos (incluyendo fecha)
        if (!formData.truck_id || !formData.operador || !formData.tipo_violacion || !formData.descripcion || !formData.fecha_inspeccion) {
            Swal.fire('Error', 'Por favor llena los campos obligatorios (*).', 'error');
            return;
        }

        setSaving(true);

        const dataToSend = new FormData();
        dataToSend.append('op', 'save');
        Object.entries(formData).forEach(([key, value]) => {
            if (key !== 'trip_number_search') {
                dataToSend.append(key, value);
            }
        });

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

    const inputProps = { 
        InputLabelProps: { shrink: true },
        size: "small"
    };

    return (
        <Dialog open={open} onClose={!saving ? onClose : undefined} maxWidth="md" fullWidth scroll="paper">
            <DialogTitle sx={{ bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', py: 2 }}>
                <Typography variant="h5" fontWeight={800} color="primary.main">
                    {editData ? 'Editar Inspección' : 'Nueva Inspección'}
                </Typography>
            </DialogTitle>
            
            <DialogContent sx={{ bgcolor: '#f4f6f8', p: 3 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" py={5}><CircularProgress /></Box>
                ) : (
                    <Box component="form" id="inspectionForm" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <Stack spacing={3}>
                            
                            {/* SECCIÓN 1: DATOS DE LA UNIDAD */}
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
                                    <LocalShippingIcon color="primary" fontSize="small" />
                                    <Typography variant="subtitle1" fontWeight={700}>1. Datos de la Unidad</Typography>
                                </Stack>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField 
                                            select fullWidth label="Unidad (Camión) *" name="truck_id" 
                                            value={formData.truck_id} onChange={handleChange} required
                                            {...inputProps}
                                            SelectProps={{ sx: { minWidth: '180px' } }}
                                        >
                                            <MenuItem value="" disabled>Selecciona unidad</MenuItem>
                                            {trucks.map(t => <MenuItem key={t.truck_id} value={t.truck_id}>{t.unidad}</MenuItem>)}
                                        </TextField>
                                    </Grid>
                                    
                                    <Grid item xs={12} sm={6}>
                                        <Autocomplete
                                            fullWidth
                                            options={tripsOptions}
                                            getOptionLabel={(option) => typeof option === 'string' ? option : option.formatted_trip || ''}
                                            isOptionEqualToValue={(option, value) => option.trip_id === value.trip_id}
                                            value={formData.trip_id ? { trip_id: formData.trip_id, formatted_trip: formData.trip_number_search } : null}
                                            onChange={handleSelectTrip}
                                            onInputChange={(event, newInputValue, reason) => {
                                                if (reason === 'input') handleSearchTrip(newInputValue);
                                            }}
                                            loading={loadingTrips}
                                            noOptionsText="Ingresa el número exacto del viaje..."
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    fullWidth
                                                    label="Viaje Asociado"
                                                    placeholder="Ej. 102"
                                                    {...inputProps}
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
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField fullWidth label="Operador *" name="operador" placeholder="Nombre completo" value={formData.operador} onChange={handleChange} required {...inputProps} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Ciudad *" name="ciudad" placeholder="Ciudad actual" value={formData.ciudad} onChange={handleChange} required {...inputProps} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Estado *" name="estado" placeholder="Estado/Provincia" value={formData.estado} onChange={handleChange} required {...inputProps} />
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* SECCIÓN 2: REPORTE DE INSPECCIÓN */}
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
                                    <AssignmentLateIcon color="primary" fontSize="small" />
                                    <Typography variant="subtitle1" fontWeight={700}>2. Reporte de Inspección</Typography>
                                </Stack>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField 
                                            fullWidth 
                                            type="date" 
                                            label="Fecha de Inspección *" 
                                            name="fecha_inspeccion" 
                                            value={formData.fecha_inspeccion} 
                                            onChange={handleChange} 
                                            required 
                                            {...inputProps} 
                                        />
                                    </Grid>

                                    <Grid item xs={12} sm={6}>
                                        <TextField 
                                            select fullWidth label="Tipo de Violación *" name="tipo_violacion" 
                                            value={formData.tipo_violacion} onChange={handleChange} required
                                            {...inputProps}
                                            SelectProps={{ sx: { minWidth: '150px' } }}
                                        >
                                            <MenuItem value="Warning">Warning</MenuItem>
                                            <MenuItem value="Out of services">Out of services</MenuItem>
                                        </TextField>
                                    </Grid>
                                    
                                    <Grid item xs={12}>
                                        <Autocomplete
                                            freeSolo
                                            options={descriptions}
                                            value={formData.descripcion}
                                            onChange={handleDescriptionChange}
                                            onInputChange={(event, newInputValue) => handleDescriptionChange(event, newInputValue)}
                                            renderInput={(params) => (
                                                <TextField 
                                                    {...params} 
                                                    label="Descripción *" 
                                                    placeholder="Ej. Llantas lisas, Fugas..." 
                                                    fullWidth 
                                                    required 
                                                    {...inputProps} 
                                                    inputProps={{
                                                        ...params.inputProps,
                                                        maxLength: 200
                                                    }}
                                                    helperText={`${(formData.descripcion || '').length}/200 caracteres`}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField fullWidth multiline rows={2} label="Comentarios" placeholder="Notas adicionales..." name="comentarios" value={formData.comentarios} onChange={handleChange} helperText={`${formData.comentarios.length}/500`} {...inputProps} />
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* SECCIÓN 3: ADMINISTRACIÓN Y COMPROBANTES */}
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
                                    <AttachMoneyIcon color="primary" fontSize="small" />
                                    <Typography variant="subtitle1" fontWeight={700}>3. Administración y Comprobantes</Typography>
                                </Stack>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Multa IMA" name="multa_ima" type="number" inputProps={{ step: "0.01", min: "0" }} value={formData.multa_ima} onChange={handleChange} {...inputProps} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth label="Multa Driver" name="multa_driver" type="number" inputProps={{ step: "0.01", min: "0" }} value={formData.multa_driver} onChange={handleChange} {...inputProps} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                                    </Grid>
                                    
                                    {/* Subida de Archivos Estilo Drag & Drop */}
                                    <Grid item xs={12}>
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
            
            <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
                <Button onClick={onClose} disabled={saving} color="inherit" sx={{ fontWeight: 700 }}>
                    Cancelar
                </Button>
                <Button type="submit" form="inspectionForm" variant="contained" disabled={saving || loading} elevation={0} sx={{ px: 4, fontWeight: 700, borderRadius: 2 }}>
                    {saving ? 'Guardando...' : 'Guardar Inspección'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default InspectionModal;