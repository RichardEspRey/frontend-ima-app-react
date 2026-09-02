import React from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Stack, Typography, 
    TextField, Grid, MenuItem, Box, FormControlLabel, Switch, Button 
} from '@mui/material';
import { COLOR } from '../../../shared/ui/tokens';

/**
 * Alta de un requisito del expediente de documentos de IMA.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.open Si el modal se muestra.
 * @param {Function} props.onClose Cierra el modal.
 * @param {object} props.newField El requisito que se está creando.
 * @param {Function} props.setNewField Recibe el requisito con el cambio aplicado.
 * @param {Function} props.onSave Da de alta el requisito.
 * @returns {object} El modal renderizado.
 */
const ConfigRequirementModal = ({ open, onClose, newField, setNewField, onSave }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle sx={{ fontWeight: 800, color: COLOR.TINTA, pb: 1 }}>Agregar Requisito</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color={COLOR.APAGADO} mb={3}>Define un nuevo documento o campo de texto. Aparecerá inmediatamente en el panel para ser gestionado.</Typography>
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
                        <Box sx={{ p: 2, bgcolor: COLOR.LIENZO, border: `1px solid ${COLOR.BORDE}`, borderRadius: 2 }}>
                            <FormControlLabel control={<Switch checked={newField.tiene_vencimiento} onChange={(e) => setNewField({...newField, tiene_vencimiento: e.target.checked})} color="primary" />} label={<Typography fontWeight={500} color={COLOR.TEXTO}>Requiere control de vencimiento</Typography>} />
                        </Box>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} sx={{ color: COLOR.APAGADO, fontWeight: 600 }}>Cancelar</Button>
                <Button variant="contained" disableElevation onClick={onSave} sx={{ bgcolor: COLOR.TINTA, borderRadius: 2, px: 3 }}>Crear Requisito</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfigRequirementModal;