import React, { useState, useEffect } from 'react';
import {
  Button, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions, Typography
} from '@mui/material';

const EditDetailModal = ({ detail, isOpen, onClose, onSave }) => {
  const [currentStatus, setCurrentStatus] = useState('Pendiente');

  useEffect(() => {
    if (detail) {
      setCurrentStatus(detail.estatus || 'Pendiente');
    }
  }, [detail]);

  if (!isOpen || !detail) return null;

  const handleSave = () => {
    onSave({
      id_servicio: detail.id_servicio ?? detail.id_detalle, // preferimos id_servicio
      estatus: currentStatus,
    });
  };

  const titulo =
    detail.titulo
      ?? detail.descripcion
      ?? `Servicio ${detail.id_servicio ?? ''}`;

  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>{titulo}</DialogTitle>
      <DialogContent>
        {detail.tipo_mantenimiento || detail.tipo_reparacion ? (
          <Typography variant="body2" sx={{ mb: 1 }}>
            {detail.tipo_mantenimiento} / {detail.tipo_reparacion}
          </Typography>
        ) : null}

        <FormControl fullWidth sx={{ mt: 2 }}>
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
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} variant="contained">Guardar Cambios</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditDetailModal;
