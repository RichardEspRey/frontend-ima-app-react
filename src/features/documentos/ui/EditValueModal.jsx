import React from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, Stack, Typography, 
    TextField, Button, Paper, Box, Chip, Tooltip, IconButton 
} from '@mui/material';
import { urlSegura } from '../../../shared/security';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DatePicker from 'react-datepicker';
import { archivoDelEvento } from '../../../shared/security';
import { COLOR } from '../../../shared/ui/tokens';
import 'react-datepicker/dist/react-datepicker.css';

const apiHost = import.meta.env.VITE_API_HOST;

/**
 * Edición del valor de un documento del expediente.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.open Si el modal se muestra.
 * @param {Function} props.onClose Cierra el modal.
 * @param {object} [props.editItem] El requisito que se está editando.
 * @param {object} props.editData Los valores en el formulario.
 * @param {Function} props.setEditData Recibe los valores con el cambio aplicado.
 * @param {Function} props.onSave Guarda el valor.
 * @param {Function} props.onDelete Borra el documento.
 * @returns {object} El modal renderizado.
 */
const EditValueModal = ({ open, onClose, editItem, editData, setEditData, onSave, onDelete }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={800} color={COLOR.TINTA}>Gestionar: {editItem?.label}</Typography>
                <Tooltip title="Ocultar requisito del panel">
                    <IconButton size="small" color="error" onClick={onDelete}><DeleteOutlineIcon /></IconButton>
                </Tooltip>
            </DialogTitle>
            <DialogContent>
                <Stack spacing={3} sx={{ mt: 1 }}>
                    
                    {editItem?.tipo === 'file' && editData.currentUrl && (
                        <Paper elevation={0} sx={{ p: 2, bgcolor: COLOR.EXITO_FONDO, border: `1px dashed ${COLOR.EXITO_BORDE}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2" color={COLOR.EXITO} fontWeight={600}>✓ Ya existe un documento cargado</Typography>
                            <Button size="small" endIcon={<OpenInNewIcon />} href={urlSegura(`${apiHost}/${editData.currentUrl}`)} target="_blank" rel="noopener noreferrer" color="success">Ver</Button>
                        </Paper>
                    )}

                    {editItem?.tipo === 'text' && (
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} color={COLOR.TEXTO_SUAVE} mb={1}>Valor del Campo</Typography>
                            <TextField fullWidth placeholder="Ingresar valor..." value={editData.valor_texto} onChange={e => setEditData({...editData, valor_texto: e.target.value})} variant="outlined" />
                        </Box>
                    )}
                    
                    {editItem?.tipo === 'file' && (
                        <Box sx={{ border: `2px dashed ${COLOR.BORDE_FUERTE}`, bgcolor: COLOR.LIENZO, p: 4, textAlign: 'center', borderRadius: 3, cursor: 'pointer', transition: '0.2s', '&:hover': { borderColor: COLOR.INFO, bgcolor: COLOR.INFO_FONDO } }} component="label">
                            <CloudUploadOutlinedIcon sx={{ fontSize: 48, color: COLOR.TENUE, mb: 1 }} />
                            <Typography variant="subtitle1" fontWeight={700} color={COLOR.TINTA_CLARA}>Seleccionar archivo</Typography>
                            <Typography variant="body2" color={COLOR.APAGADO} mb={2}>PDF, JPG o PNG permitidos.</Typography>
                            
                            {editData.file && <Chip icon={<CheckCircleIcon />} label={editData.file.name} color="primary" variant="outlined" />}
                            <input type="file" hidden onChange={async e => { const f = await archivoDelEvento(e); if (f) setEditData({...editData, file: f}) }} />
                        </Box>
                    )}

                    {editItem?.tiene_vencimiento == 1 && (
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} color={COLOR.TEXTO_SUAVE} mb={1}>Fecha de Expiración</Typography>
                            <DatePicker selected={editData.fecha_vencimiento} onChange={(d) => setEditData({...editData, fecha_vencimiento: d})} className="form-input" placeholderText="dd/mm/aaaa" />
                        </Box>
                    )}
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} sx={{ color: COLOR.APAGADO, fontWeight: 600 }}>Cancelar</Button>
                <Button variant="contained" disableElevation onClick={onSave} sx={{ bgcolor: COLOR.INFO, borderRadius: 2, px: 4 }}>Guardar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditValueModal;