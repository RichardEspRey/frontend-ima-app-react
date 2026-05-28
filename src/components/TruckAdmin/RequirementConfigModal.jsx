import React from 'react';
import { Dialog, DialogTitle, DialogContent, Stack, Box, Typography, Chip, Divider, TextField, Grid, MenuItem, FormControlLabel, Switch, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const RequirementConfigModal = ({ open, onClose, configFields, newField, setNewField, handleCreateField, handleDeleteField }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Configurar Requisitos de Camión
                <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                        <Typography variant="subtitle2" fontWeight={700} mb={1}>Requisitos Activos:</Typography>
                        <Stack direction="row" flexWrap="wrap" gap={1}>
                            {configFields.map(f => (
                                <Chip key={f.key_name} label={f.label} onDelete={() => handleDeleteField(f.key_name, f.label)} size="small" color="primary" variant="outlined" />
                            ))}
                        </Stack>
                    </Box>
                    <Divider />
                    <Typography variant="subtitle2" fontWeight={700}>Crear Nuevo Requisito</Typography>
                    <TextField label="Nombre del Requisito" fullWidth size="small" value={newField.label} onChange={(e) => setNewField({...newField, label: e.target.value})} placeholder="Ej. Tarjeta de Circulación" />
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField select label="Categoría (Región)" size="small" fullWidth value={newField.categoria} onChange={(e) => setNewField({...newField, categoria: e.target.value})}>
                                <MenuItem value="USA">USA</MenuItem>
                                <MenuItem value="MEX">MEX</MenuItem>
                                <MenuItem value="Otros">Otros</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField select label="Tipo de Dato" size="small" fullWidth value={newField.tipo} onChange={(e) => setNewField({...newField, tipo: e.target.value})}>
                                <MenuItem value="file">Subir Archivo</MenuItem>
                                <MenuItem value="text">Texto Libre</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                    {newField.tipo === 'file' && (
                        <FormControlLabel control={<Switch checked={newField.tiene_vencimiento} onChange={(e) => setNewField({...newField, tiene_vencimiento: e.target.checked})} />} label="Requiere Vencimiento" />
                    )}
                    <Button variant="contained" onClick={handleCreateField} disableElevation>Agregar al Expediente</Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
};

export default RequirementConfigModal;