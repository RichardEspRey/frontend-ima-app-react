import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Grid, Typography, Box, Paper, Chip, Stack, InputAdornment
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BuildIcon from '@mui/icons-material/Build';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Swal from 'sweetalert2';

const apiHost = import.meta.env.VITE_API_HOST;

const RoadRepairModal = ({ open, onClose, onSuccess, editData }) => {
    const [trucks, setTrucks] = useState([]);
    
    const [formData, setFormData] = useState({
        id_reparacion: '', truck_id: '', operador: '', ciudad: '', estado: '',
        fallo: '', tipo_reparacion: '', comentarios: '', costo_reparacion: '', costo_refacciones: ''
    });
    const [files, setFiles] = useState([]);

    useEffect(() => {
        if (open) {
            fetchTrucks();
            if (editData) {
                setFormData(editData);
            } else {
                setFormData({
                    id_reparacion: '', truck_id: '', operador: '', ciudad: '', estado: '',
                    fallo: '', tipo_reparacion: '', comentarios: '', costo_reparacion: '', costo_refacciones: ''
                });
            }
            setFiles([]);
        }
    }, [open, editData]);

    const fetchTrucks = async () => {
        const fd = new FormData();
        fd.append('op', 'get_trucks');
        const res = await fetch(`${apiHost}/roadside_repairs.php`, { method: 'POST', body: fd });
        const data = await res.json();
        if (data.status === 'success') setTrucks(data.data);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'comentarios' && value.length > 300) return; 
        setFormData({ ...formData, [name]: value });
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 3) {
            Swal.fire('Atención', 'Solo puedes subir un máximo de 3 documentos PDF.', 'warning');
            return;
        }
        const validFiles = selectedFiles.filter(f => f.type === 'application/pdf');
        setFiles(validFiles.slice(0, 3));
    };

    const removeFile = (index) => {
        const newFiles = [...files];
        newFiles.splice(index, 1);
        setFiles(newFiles);
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
        } catch (err) {
            Swal.fire('Error', 'Problema de conexión.', 'error');
        }
    };

    const inputProps = { 
        InputLabelProps: { shrink: true },
        size: "small"
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
            <DialogTitle sx={{ bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', py: 2 }}>
                <Typography variant="h5" fontWeight={800} color="primary.main">
                    {editData ? 'Editar Reparación' : 'Nueva Reparación en Carretera'}
                </Typography>
            </DialogTitle>
            
            <DialogContent sx={{ bgcolor: '#f4f6f8', p: 3 }}>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    
                    {/* SECCIÓN 1: UNIDAD */}
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
                            <LocalShippingIcon color="primary" fontSize="small" />
                            <Typography variant="subtitle1" fontWeight={700}>1. Datos de la Unidad</Typography>
                        </Stack>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField 
                                    select 
                                    fullWidth 
                                    label="Unidad (Camión) *" 
                                    name="truck_id" 
                                    value={formData.truck_id} 
                                    onChange={handleChange} 
                                    {...inputProps}
                                    SelectProps={{ sx: { minWidth: '180px' } }} // 🚨 Evita que colapse
                                >
                                    <MenuItem value="" disabled>Selecciona unidad</MenuItem>
                                    {trucks.map(t => <MenuItem key={t.truck_id} value={t.truck_id}>{t.unidad}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Operador *" name="operador" placeholder="Nombre completo" value={formData.operador} onChange={handleChange} {...inputProps} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth label="Ciudad" name="ciudad" placeholder="Ciudad actual" value={formData.ciudad} onChange={handleChange} {...inputProps} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth label="Estado" name="estado" placeholder="Estado/Provincia" value={formData.estado} onChange={handleChange} {...inputProps} />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* SECCIÓN 2: INCIDENTE */}
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
                            <BuildIcon color="primary" fontSize="small" />
                            <Typography variant="subtitle1" fontWeight={700}>2. Reporte de Falla</Typography>
                        </Stack>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={7}>
                                <TextField fullWidth label="Fallo Reportado *" name="fallo" placeholder="Ej. Falla en sistema de frenos" value={formData.fallo} onChange={handleChange} {...inputProps} />
                            </Grid>
                            <Grid item xs={12} sm={5}>
                                <TextField 
                                    select 
                                    fullWidth 
                                    label="Reparación realizada por *" 
                                    name="tipo_reparacion" 
                                    value={formData.tipo_reparacion} 
                                    onChange={handleChange} 
                                    {...inputProps}
                                    SelectProps={{ sx: { minWidth: '200px' } }} // 🚨 Asegura que el texto quepa
                                >
                                    <MenuItem value="Operador">Operador</MenuItem>
                                    <MenuItem value="Interno">Taller Interno</MenuItem>
                                    <MenuItem value="Road Services">Road Services</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField fullWidth multiline rows={2} label="Comentarios" placeholder="Notas adicionales..." name="comentarios" value={formData.comentarios} onChange={handleChange} {...inputProps} helperText={`${formData.comentarios.length}/300`} />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* SECCIÓN 3: COSTOS Y ARCHIVOS */}
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
                            <AttachMoneyIcon color="primary" fontSize="small" />
                            <Typography variant="subtitle1" fontWeight={700}>3. Administración y Comprobantes</Typography>
                        </Stack>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Mano de Obra" name="costo_reparacion" type="number" value={formData.costo_reparacion} onChange={handleChange} {...inputProps} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField fullWidth label="Refacciones" name="costo_refacciones" type="number" value={formData.costo_refacciones} onChange={handleChange} {...inputProps} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                            </Grid>
                            
                            {/* Subida de Invoices */}
                            <Grid item xs={12}>
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
            
            <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
                <Button onClick={onClose} color="inherit" sx={{ fontWeight: 700 }}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained" elevation={0} sx={{ px: 4, fontWeight: 700, borderRadius: 2 }}>
                    Guardar Registro
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RoadRepairModal;