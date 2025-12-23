import { useState, useEffect } from "react";
import {
  Box, Paper, Typography, Grid, Chip, Stack, Slider, IconButton, Button
} from "@mui/material";
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import FuelGauge from "./FuelGauge";

const UnitCard = ({ truck, onUpdate, onConfig }) => {
    const [fuel, setFuel] = useState(truck.current_fuel);
    const [dirty, setDirty] = useState(false);

    useEffect(() => {
        setFuel(truck.current_fuel);
    }, [truck.current_fuel]);

    const getStatusColor = (status) => {
        const s = (status || '').toLowerCase();
        if (s === 'completed') return 'default'; 
        if (s === 'almost over') return 'info'; 
        if (s === 'in transit') return 'success';
        if (s === 'in coming') return 'warning';
        
        if (s.includes('transit') || s.includes('route')) return 'success';
        if (s.includes('load') || s.includes('charg')) return 'warning';
        return 'primary';
    };

    const handleSliderChange = (e, newValue) => {
        setFuel(newValue);
        setDirty(true);
    };

    const handleSaveAdjustment = () => {
        onUpdate(truck.truck_id, fuel, truck.tank_capacity);
        setDirty(false);
    };

    const percent = truck.tank_capacity > 0 
        ? Math.min(100, Math.max(0, (fuel / truck.tank_capacity) * 100))
        : 0;

    return (
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '100%', minWidth: 250 }}>
            <Box sx={{ p: 2, pb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                        Unidad {truck.unidad}
                    </Typography>
                    <Chip label={truck.Placa_MEX} size="small" variant="outlined" sx={{ mt: 0.5, height: 20, fontSize: '0.65rem', fontWeight: 600 }} />
                </Box>
                <IconButton size="small" onClick={() => onConfig(truck)}>
                    <SettingsIcon fontSize="small" />
                </IconButton>
            </Box>

            <Box sx={{ px: 2, mt: 1 }}>
                <Box sx={{ 
                    bgcolor: truck.trip_number ? '#e3f2fd' : '#f5f5f5', 
                    color: truck.trip_number ? '#1565c0' : '#757575',
                    p: 0.8, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                    <Typography variant="caption" fontWeight={700}>
                        {truck.trip_number ? `Viaje #${truck.trip_number}` : 'Sin Viaje Activo'}
                    </Typography>
                    {truck.trip_number && (
                        <Chip label={truck.trip_status || 'Activo'} size="small" color={getStatusColor(truck.trip_status)} sx={{ height: 18, fontSize: '0.6rem' }} />
                    )}
                </Box>
            </Box>

            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                <FuelGauge percent={percent} value={fuel} capacity={truck.tank_capacity} />
            </Box>

            <Box sx={{ bgcolor: '#fafafa', p: 2, flexGrow: 1, borderTop: '1px solid #eee' }}>
                <Box sx={{ mb: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">Ajuste Manual</Typography>
                        {dirty && (
                            <Button size="small" variant="contained" color="primary" onClick={handleSaveAdjustment} sx={{ minWidth: 50, py: 0, fontSize: '0.6rem', height: 20 }}>
                                Guardar
                            </Button>
                        )}
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <LocalGasStationIcon color={percent < 20 ? "error" : "action"} fontSize="small" />
                        <Slider 
                            value={typeof fuel === 'number' ? fuel : 0} 
                            min={0} 
                            max={Number(truck.tank_capacity) || 200} 
                            onChange={handleSliderChange} 
                            size="small"
                            sx={{ color: percent < 20 ? '#d32f2f' : '#1976d2', '& .MuiSlider-thumb': { width: 12, height: 12 } }}
                        />
                    </Stack>
                </Box>

                <Grid container spacing={1} sx={{ pt: 1, borderTop: '1px dashed #e0e0e0' }}>
                    <Grid item xs={6} sx={{ textAlign: 'center', borderRight: '1px solid #eee' }}>
                        <Typography variant="caption" color="text.secondary" display="block">Autonomía</Typography>
                        <Typography variant="body1" fontWeight={800} color="primary.main">
                            {truck.promedio_mpg > 0 ? truck.promedio_mpg.toFixed(2) : '--'} 
                            <span style={{ fontSize: '0.7em', marginLeft: 2, fontWeight: 400 }}>MPG</span>
                        </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" display="block">Rango Est.</Typography>
                        <Typography variant="body1" fontWeight={800} color="secondary.main">
                            {truck.promedio_mpg > 0 ? (fuel * truck.promedio_mpg).toFixed(0) : '--'} 
                            <span style={{ fontSize: '0.7em', marginLeft: 2, fontWeight: 400 }}>mi</span>
                        </Typography>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
};

export default UnitCard;