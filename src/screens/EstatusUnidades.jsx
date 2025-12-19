import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Paper, Typography, Grid, Chip, CircularProgress, Stack, Slider,
  IconButton, Button, Dialog, DialogTitle, DialogContent, DialogActions, 
  TextField, InputAdornment, MenuItem 
} from "@mui/material";
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import FilterListIcon from '@mui/icons-material/FilterList';
import Swal from 'sweetalert2';

const apiHost = import.meta.env.VITE_API_HOST;

const FuelGauge = ({ percent, value, capacity }) => {
    let color = '#2e7d32'; 
    if (percent < 50) color = '#fbc02d'; 
    if (percent < 20) color = '#d32f2f';

    const radius = 80;
    const stroke = 12;
    
    const arcLength = Math.PI * radius; 
    const strokeDasharray = `${arcLength} ${arcLength}`;
    const strokeDashoffset = arcLength - (percent / 100) * arcLength;

    return (
        <Box sx={{ position: 'relative', width: 200, height: 120, margin: '0 auto' }}>
            <svg width="100%" height="100%" viewBox="0 0 200 110">
                <path
                    d={`M 20,100 A 80,80 0 0 1 180,100`} 
                    fill="none"
                    stroke="#e0e0e0"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                />
                <path
                    d={`M 20,100 A 80,80 0 0 1 180,100`}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
                />
                <text x="10" y="105" fontSize="12" fontWeight="bold" fill="#999">E</text>
                <text x="182" y="105" fontSize="12" fontWeight="bold" fill="#999">F</text>
            </svg>
            <Box sx={{ position: 'absolute', bottom: 10, left: 0, width: '100%', textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ lineHeight: 1 }}>
                    {Math.round(percent)}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {Math.round(value)} / {capacity} gal
                </Typography>
            </Box>
        </Box>
    );
};

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

export default function EstatusUnidades() {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All'); 

    // Modal Config
    const [openModal, setOpenModal] = useState(false);
    const [selectedTruck, setSelectedTruck] = useState(null);
    const [newCapacity, setNewCapacity] = useState('');

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('op', 'get_dashboard');
            const res = await fetch(`${apiHost}/estatus_unidades.php`, { method: 'POST', body: fd });
            const json = await res.json();
            if (json.status === 'success') {
                setUnits(json.data);
            } else {
                console.error("Error data:", json);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    const handleUpdateTruck = async (truckId, currentFuel, capacity) => {
        try {
            const fd = new FormData();
            fd.append('op', 'update_config');
            fd.append('truck_id', truckId);
            fd.append('current_fuel', currentFuel);
            fd.append('tank_capacity', capacity);

            const res = await fetch(`${apiHost}/estatus_unidades.php`, { method: 'POST', body: fd });
            const json = await res.json();

            if (json.status === 'success') {
                setUnits(prev => prev.map(u => 
                    u.truck_id === truckId ? { ...u, current_fuel: Number(currentFuel), tank_capacity: Number(capacity) } : u
                ));
                const Toast = Swal.mixin({
                    toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, timerProgressBar: true
                });
                Toast.fire({ icon: 'success', title: 'Actualizado' });
                return true;
            }
        } catch (e) {
            Swal.fire('Error', 'No se pudo actualizar', 'error');
        }
        return false;
    };

    const openConfig = (truck) => {
        setSelectedTruck(truck);
        setNewCapacity(truck.tank_capacity);
        setOpenModal(true);
    };

    const saveConfig = async () => {
        if(selectedTruck) {
            const success = await handleUpdateTruck(selectedTruck.truck_id, selectedTruck.current_fuel, newCapacity);
            if(success) setOpenModal(false);
        }
    };

    const filteredUnits = units.filter(unit => {
        if (statusFilter === 'All') return true;
        const currentStatus = (unit.trip_status || '').toLowerCase();
        const filterTarget = statusFilter.toLowerCase();
        
        if (statusFilter === 'Sin Viaje') return !unit.trip_number;

        return currentStatus === filterTarget;
    });

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" justifyContent="space-between" mb={3} spacing={2}>
                <Box>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="h4" fontWeight={700}>
                            Tablero de Combustible
                        </Typography>
                        <Chip label="Tiempo Real" color="success" size="small" variant="outlined" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Monitoreo de niveles, autonomía y estatus de viajes activos.
                    </Typography>
                </Box>

                <Box sx={{ minWidth: 200 }}>
                    <TextField
                        select
                        label="Filtrar por Estatus"
                        size="small"
                        fullWidth
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FilterListIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                    >
                        <MenuItem value="All">Todos</MenuItem>
                        <MenuItem value="In Transit">In Transit</MenuItem>
                        <MenuItem value="In Coming">In Coming</MenuItem>
                        <MenuItem value="Almost Over">Almost Over</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                        <MenuItem value="Sin Viaje">Sin Viaje Asignado</MenuItem> 
                    </TextField>
                </Box>
            </Stack>

            {loading ? (
                <Box display="flex" justifyContent="center" mt={5}>
                    <CircularProgress />
                    <Typography sx={{ml:2}}>Cargando unidades...</Typography>
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {filteredUnits.length > 0 ? (
                        filteredUnits.map(truck => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={truck.truck_id}>
                                <UnitCard 
                                    truck={truck} 
                                    onUpdate={handleUpdateTruck} 
                                    onConfig={openConfig} 
                                />
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
                                <Typography color="text.secondary">
                                    No hay unidades con el estatus "{statusFilter}"
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            )}

            {/* MODAL CONFIGURACIÓN CAPACIDAD */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Capacidad del Tanque</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" gutterBottom>
                            Define la capacidad máxima de la <b>Unidad {selectedTruck?.unidad}</b> para calcular el porcentaje correctamente.
                        </Typography>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Capacidad Total"
                            type="number"
                            fullWidth
                            variant="outlined"
                            value={newCapacity}
                            onChange={(e) => setNewCapacity(e.target.value)}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">Gal</InputAdornment>,
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Cancelar</Button>
                    <Button onClick={saveConfig} variant="contained" color="primary">
                        Guardar Configuración
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}