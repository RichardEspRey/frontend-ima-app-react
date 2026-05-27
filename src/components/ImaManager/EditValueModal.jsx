import React from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Stack, Typography, 
    TextField, Button, Paper, Box, Chip, Tooltip, IconButton 
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const apiHost = import.meta.env.VITE_API_HOST;

const EditValueModal = ({ open, onClose, editItem, editData, setEditData, onSave, onDelete }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={800} color="#0f172a">Gestionar: {editItem?.label}</Typography>
                <Tooltip title="Ocultar requisito del panel">
                    <IconButton size="small" color="error" onClick={onDelete}><DeleteOutlineIcon /></IconButton>
                </Tooltip>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    
                    {editItem?.tipo === 'file' && editData.currentUrl && (
                        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0fdf4', border: '1px dashed #4ade80', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color="#166534" fontWeight={600}>✓ Ya existe un documento cargado</Typography>
                            <Button size="small" endIcon={<OpenInNewIcon />} href={`${apiHost}/${editData.currentUrl}`} target="_blank" color="success">Ver</Button>
                        </Paper>
                    )}

                    {editItem?.tipo === 'text' && (
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} color="#475569" mb={1}>Valor del Campo</Typography>
                            <TextField fullWidth placeholder="Ingresar valor..." value={editData.valor_texto} onChange={e => setEditData({...editData, valor_texto: e.target.value})} variant="outlined" />
                        </Box>
                    )}
                    
                    {editItem?.tipo === 'file' && (
                        <Box sx={{ border: '2px dashed #cbd5e1', bgcolor: '#f8fafc', p: 4, textAlign: 'center', borderRadius: 3, cursor: 'pointer', transition: '0.2s', '&:hover': { borderColor: '#3b82f6', bgcolor: '#eff6ff' } }} component="label">
                            <CloudUploadOutlinedIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                            <Typography variant="subtitle1" fontWeight={700} color="#1e293b">Seleccionar archivo</Typography>
                            <Typography variant="body2" color="#64748b" mb={2}>PDF, JPG o PNG permitidos.</Typography>
                            
                            {editData.file && <Chip icon={<CheckCircleIcon />} label={editData.file.name} color="primary" variant="outlined" />}
                            <input type="file" hidden onChange={e => setEditData({...editData, file: e.target.files[0]})} />
                        </Box>
                    )}

                    {editItem?.tiene_vencimiento == 1 && (
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} color="#475569" mb={1}>Fecha de Expiración</Typography>
                            <DatePicker selected={editData.fecha_vencimiento} onChange={(d) => setEditData({...editData, fecha_vencimiento: d})} className="form-input" placeholderText="dd/mm/aaaa" />
                        </Box>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} sx={{ color: '#64748b', fontWeight: 600 }}>Cancelar</Button>
                <Button variant="contained" disableElevation onClick={onSave} sx={{ bgcolor: '#3b82f6', borderRadius: 2, px: 4 }}>Guardar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditValueModal;