import React, { useState, useEffect } from 'react';
import { Button, Select, MenuItem, FormControl, InputLabel, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';

const EditDetailModal = ({ detail, isOpen, onClose, onSave }) => {
    const [currentStatus, setCurrentStatus] = useState('');

    useEffect(() => {
        // Cada vez que se abre el modal, cargamos el estatus del detalle actual
        if (detail) {
            setCurrentStatus(detail.estatus);
        }
    }, [detail]);

    if (!isOpen || !detail) return null;

    const handleSave = () => {
        // Llamamos a la función onSave del componente padre con los nuevos datos
        onSave({
            id_detalle: detail.id_detalle,
            estatus: currentStatus
        });
    };

    return (
        <Dialog open={isOpen} onClose={onClose}>
            <DialogTitle>Editar Detalle: {detail.descripcion}</DialogTitle>
            <DialogContent>
                <FormControl fullWidth sx={{ marginTop: 2 }}>
                    <InputLabel>Estatus</InputLabel>
                    <Select
                        value={currentStatus}
                        label="Estatus"
                        onChange={(e) => setCurrentStatus(e.target.value)}
                    >
                        <MenuItem value="Pendiente">Pendiente</MenuItem>
                        <MenuItem value="Completado">Completado</MenuItem>
                    </Select>
                </FormControl>
                {/* Aquí podrías añadir más campos para editar en el futuro, como la cantidad */}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained">Guardar Cambios</Button>
            </DialogActions>
        </Dialog>
    );
};

export default EditDetailModal;