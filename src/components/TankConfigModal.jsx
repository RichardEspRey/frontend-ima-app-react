import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, TextField, Box, Typography, InputAdornment
} from "@mui/material";

const TankConfigModal = ({ open, onClose, onSave, truck }) => {
    const [capacity, setCapacity] = useState('');

    useEffect(() => {
        if (truck) {
            setCapacity(truck.tank_capacity);
        }
    }, [truck, open]);

    const handleSave = () => {
        if (truck) {
            onSave(truck.truck_id, truck.current_fuel, capacity);
            onClose();
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Capacidad del Tanque</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" gutterBottom>
                        Define la capacidad máxima de la <b>Unidad {truck?.unidad}</b> para calcular el porcentaje correctamente.
                    </Typography>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Capacidad Total"
                        type="number"
                        fullWidth
                        variant="outlined"
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">Gal</InputAdornment>,
                        }}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSave} variant="contained" color="primary">
                    Guardar Configuración
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TankConfigModal;