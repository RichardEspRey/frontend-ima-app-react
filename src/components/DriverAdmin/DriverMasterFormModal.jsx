import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Grid, Typography, Paper, Stack, TextField, Button, IconButton, Tooltip } from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import FilePresentIcon from '@mui/icons-material/FilePresent';

const apiHost = import.meta.env.VITE_API_HOST;

const DriverMasterFormModal = ({ open, onClose, driverData, setDriverData, driverDocs, setDriverDocs, configFields, categories, handleSaveDriver, loading }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3, height: '90vh' } }}>
            <DialogTitle sx={{ bgcolor: '#0f172a', color: 'white', fontWeight: 800 }}>
                {driverData.driver_id ? `Editando: ${driverData.nombre}` : 'Alta de Nuevo Conductor'}
            </DialogTitle>
            <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
                <Box sx={{ p: 3 }}>
                    <Grid container spacing={4}>
                        {/* INFO BASE */}
                        <Grid item xs={12} md={4}>
                            <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>1. Datos Base</Typography>
                            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                                <Stack spacing={2}>
                                    <TextField label="Nombre Completo" fullWidth size="small" value={driverData.nombre || ''} onChange={e => setDriverData({...driverData, nombre: e.target.value})} />
                                    <TextField label="CURP" fullWidth size="small" value={driverData.curp || ''} onChange={e => setDriverData({...driverData, curp: e.target.value})} />
                                    <TextField label="RFC" fullWidth size="small" value={driverData.rfc || ''} onChange={e => setDriverData({...driverData, rfc: e.target.value})} />
                                    <TextField label="Teléfono USA" fullWidth size="small" value={driverData.phone_usa || ''} onChange={e => setDriverData({...driverData, phone_usa: e.target.value})} />
                                    <TextField label="Teléfono MEX" fullWidth size="small" value={driverData.phone_mex || ''} onChange={e => setDriverData({...driverData, phone_mex: e.target.value})} />
                                    <Box>
                                        <Typography variant="caption" fontWeight={600}>Fecha Nacimiento</Typography>
                                        <TextField type="date" fullWidth size="small" value={driverData.fecha_nacimiento || ''} onChange={e => setDriverData({...driverData, fecha_nacimiento: e.target.value})} />
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" fontWeight={600}>Fecha Ingreso</Typography>
                                        <TextField type="date" fullWidth size="small" value={driverData.fecha_ingreso || ''} onChange={e => setDriverData({...driverData, fecha_ingreso: e.target.value})} />
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>

                        {/* REQUISITOS DINÁMICOS POR CATEGORÍA */}
                        <Grid item xs={12} md={8}>
                            <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>2. Requisitos Dinámicos</Typography>
                            <Grid container spacing={2}>
                                {categories.map(cat => (
                                    <Grid item xs={12} sm={6} key={cat}>
                                        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, height: '100%' }}>
                                            <Typography variant="subtitle2" fontWeight={800} color="#475569" gutterBottom sx={{ borderBottom: '1px dashed #cbd5e1', pb: 1 }}>{cat.toUpperCase()}</Typography>
                                            <Stack spacing={2} mt={2}>
                                                {configFields.filter(f => f.categoria === cat).map(req => {
                                                    const k = req.key_name;
                                                    const currentDoc = driverData.docs?.[k] || {};

                                                    return (
                                                        <Box key={k} sx={{ p: 1.5, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                                                            <Typography variant="caption" fontWeight={700} color="primary.dark">{req.label}</Typography>
                                                            
                                                            {req.tipo === 'text' ? (
                                                                <TextField size="small" fullWidth placeholder="Ingresar valor" value={currentDoc.valor_texto || ''} 
                                                                    onChange={e => setDriverData({ ...driverData, docs: { ...driverData.docs, [k]: { ...currentDoc, valor_texto: e.target.value } } })} 
                                                                    sx={{ mt: 1, bgcolor: 'white' }} 
                                                                />
                                                            ) : (
                                                                <Stack spacing={1} mt={1}>
                                                                    <Stack direction="row" alignItems="center" spacing={1}>
                                                                        <Button variant="outlined" component="label" size="small" startIcon={<CloudUploadOutlinedIcon />} sx={{ bgcolor: 'white' }}>
                                                                            Subir {driverDocs[k] ? '(1)' : ''}
                                                                            <input type="file" hidden onChange={e => setDriverDocs({...driverDocs, [k]: e.target.files[0]})} />
                                                                        </Button>
                                                                        {currentDoc.url_pdf && (
                                                                            <Tooltip title="Ver Documento">
                                                                                <IconButton size="small" color="info" component="a" href={`${apiHost}/${currentDoc.url_pdf}`} target="_blank"><FilePresentIcon /></IconButton>
                                                                            </Tooltip>
                                                                        )}
                                                                    </Stack>
                                                                    {req.tiene_vencimiento == 1 && (
                                                                        <TextField type="date" size="small" fullWidth label="Vence" InputLabelProps={{ shrink: true }}
                                                                            value={currentDoc.fecha_vencimiento || ''} 
                                                                            onChange={e => setDriverData({ ...driverData, docs: { ...driverData.docs, [k]: { ...currentDoc, fecha_vencimiento: e.target.value } } })} 
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
                <Button variant="contained" disableElevation onClick={handleSaveDriver} disabled={loading} sx={{ px: 4, py: 1, borderRadius: 2 }}>Guardar Conductor</Button>
            </DialogActions>
        </Dialog>
    );
};

export default DriverMasterFormModal;