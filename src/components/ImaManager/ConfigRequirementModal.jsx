import React from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Stack, Typography, 
    TextField, Grid, MenuItem, Box, FormControlLabel, Switch, Button 
} from '@mui/material';

const ConfigRequirementModal = ({ open, onClose, newField, setNewField, onSave }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', pb: 1 }}>Agregar Requisito</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="#64748b" mb={3}>Define un nuevo documento o campo de texto. Aparecerá inmediatamente en el panel para ser gestionado.</Typography>
                <Stack spacing={3}>
                    <TextField label="Nombre del Requisito" fullWidth value={newField.label} onChange={(e) => setNewField({...newField, label: e.target.value})} placeholder="Ej. Número de Fianza" variant="outlined" />
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField select label="Región" fullWidth value={newField.region} onChange={(e) => setNewField({...newField, region: e.target.value})}>
                                <MenuItem value="USA">USA</MenuItem>
                                <MenuItem value="MEX">MEX</MenuItem>
                            </TextField>
                        </Grid>
                        <Grid item xs={6}>
                            <TextField select label="Tipo de Dato" fullWidth value={newField.tipo} onChange={(e) => setNewField({...newField, tipo: e.target.value})}>
                                <MenuItem value="file">Archivo (PDF/IMG)</MenuItem>
                                <MenuItem value="text">Texto</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                    {newField.tipo === 'file' && (
                        <Box sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                            <FormControlLabel control={<Switch checked={newField.tiene_vencimiento} onChange={(e) => setNewField({...newField, tiene_vencimiento: e.target.checked})} color="primary" />} label={<Typography fontWeight={500} color="#334155">Requiere control de vencimiento</Typography>} />
                        </Box>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} sx={{ color: '#64748b', fontWeight: 600 }}>Cancelar</Button>
                <Button variant="contained" disableElevation onClick={onSave} sx={{ bgcolor: '#0f172a', borderRadius: 2, px: 3 }}>Crear Requisito</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfigRequirementModal;