import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Chip, IconButton } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';

const ColumnConfigModal = ({ open, onClose, configFields, hiddenColumns, toggleColumnVisibility }) => {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Mostrar Columnas
                <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Toca las etiquetas para encender o apagar las columnas en tu tabla de camiones.
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                    {configFields.map(req => {
                        const isVisible = !hiddenColumns.includes(req.key_name);
                        return (
                            <Chip 
                                key={req.key_name} label={req.label} onClick={() => toggleColumnVisibility(req.key_name)}
                                color={isVisible ? "primary" : "default"} variant={isVisible ? "filled" : "outlined"}
                                icon={isVisible ? <CheckCircleIcon /> : undefined}
                                sx={{ fontWeight: 600, fontSize: '0.85rem', py: 1, transition: 'all 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
                            />
                        );
                    })}
                </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <Button onClick={onClose} variant="contained" disableElevation sx={{ bgcolor: '#0f172a' }}>Aplicar</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ColumnConfigModal;