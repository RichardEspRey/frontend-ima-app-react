import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Grid, Typography, Paper, Stack, TextField, Button, IconButton, Tooltip } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import CloseIcon from '@mui/icons-material/Close';

const apiHost = import.meta.env.VITE_API_HOST;

const TrailerMasterFormModal = ({ open, onClose, trailerData, setTrailerData, trailerDocs, setTrailerDocs, configFields, categories, handleSaveTrailer, loading }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3, height: '90vh' } }}>
            <DialogTitle sx={{ bgcolor: '#0f172a', color: 'white', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {trailerData.caja_id ? `Editando Caja: ${trailerData.no_caja}` : 'Alta de Nueva Caja'}
                <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
                <Box sx={{ p: 3 }}>
                    <Grid container spacing={4}>
                        {/* COLUMNA 1: INFO BASE */}
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>1. Datos del Remolque</Typography>
                            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                                <Stack spacing={2.5}>
                                    <TextField label="Número de Caja" fullWidth size="small" value={trailerData.no_caja || ''} onChange={e => setTrailerData({...trailerData, no_caja: e.target.value})} />
                                    <TextField label="No. Placa" fullWidth size="small" value={trailerData.no_placa || ''} onChange={e => setTrailerData({...trailerData, no_placa: e.target.value})} />
                                    <TextField label="Estado Placa" fullWidth size="small" value={trailerData.estado_placa || ''} onChange={e => setTrailerData({...trailerData, estado_placa: e.target.value})} />
                                    <TextField label="Número VIN" fullWidth size="small" value={trailerData.no_vin || ''} onChange={e => setTrailerData({...trailerData, no_vin: e.target.value})} />
                                </Stack>
                            </Paper>
                        </Grid>

                        {/* COLUMNA 2 Y 3: REQUISITOS DINÁMICOS POR CATEGORÍA */}
                        <Grid item xs={12} md={8}>
                            <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>2. Expediente Documental</Typography>
                            <Grid container spacing={2}>
                                {categories.map(cat => (
                                    <Grid item xs={12} sm={6} key={cat}>
                                        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, height: '100%' }}>
                                            <Typography variant="subtitle2" fontWeight={800} color="#475569" gutterBottom sx={{ borderBottom: `2px solid ${cat==='USA'?'#1976d2':(cat==='MEX'?'#388e3c':'#f59e0b')}`, pb: 1 }}>{cat.toUpperCase()}</Typography>
                                            <Stack spacing={2} mt={2}>
                                                {configFields.filter(f => f.categoria === cat).map(req => {
                                                    const k = req.key_name;
                                                    const currentDoc = trailerData.docs?.[k] || {};

                                                    return (
                                                        <Box key={k} sx={{ p: 1.5, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                                                            <Typography variant="caption" fontWeight={700} color="primary.dark">{req.label}</Typography>
                                                            {req.tipo === 'text' ? (
                                                                <TextField size="small" fullWidth placeholder="Ingresar valor" value={currentDoc.valor_texto || ''} 
                                                                    onChange={e => setTrailerData({ ...trailerData, docs: { ...trailerData.docs, [k]: { ...currentDoc, valor_texto: e.target.value } } })} 
                                                                    sx={{ mt: 1, bgcolor: 'white' }} 
                                                                />
                                                            ) : (
                                                                <Stack spacing={1} mt={1}>
                                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                                        <Button variant="outlined" component="label" size="small" startIcon={<CloudUploadOutlinedIcon />} sx={{ bgcolor: 'white' }}>
                                                                            Subir {trailerDocs[k] ? '(1)' : ''}
                                                                            <input type="file" hidden onChange={e => setTrailerDocs({...trailerDocs, [k]: e.target.files[0]})} />
                                                                        </Button>
                                                                        {currentDoc.url_pdf && (
                                                                            <Tooltip title="Ver Archivo">
                                                                                <IconButton size="small" color="info" component="a" href={`${apiHost}/${currentDoc.url_pdf}`} target="_blank"><FilePresentIcon /></IconButton>
                                                                            </Tooltip>
                                                                        )}
                                                                    </Stack>
                                                                    {req.tiene_vencimiento == 1 && (
                                                                        <TextField type="date" size="small" fullWidth label="Vence" InputLabelProps={{ shrink: true }}
                                                                            value={currentDoc.fecha_vencimiento || ''} 
                                                                            onChange={e => setTrailerData({ ...trailerData, docs: { ...trailerData.docs, [k]: { ...currentDoc, fecha_vencimiento: e.target.value } } })} 
                                                                            sx={{ bgcolor: 'white' }} 
                                                                        />
                                                                    )}
                                                                </Stack>
                                                            )}
                                                        </Box>
                                                    )
                                                })}
                                            </Stack>
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                <Button onClick={onClose} sx={{ fontWeight: 600, color: '#64748b' }}>Cancelar</Button>
                <Button variant="contained" disableElevation onClick={handleSaveTrailer} disabled={loading} sx={{ px: 4, py: 1, borderRadius: 2, bgcolor: '#0f172a' }}>Guardar Caja</Button>
            </DialogActions>
        </Dialog>
    );
};

export default TrailerMasterFormModal;