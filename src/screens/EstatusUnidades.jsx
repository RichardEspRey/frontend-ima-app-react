import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Paper, Typography, Grid, Chip, CircularProgress, Stack, TextField, InputAdornment, MenuItem 
} from "@mui/material";
import FilterListIcon from '@mui/icons-material/FilterList';
import Swal from 'sweetalert2';

import UnitCard from "../components/UnitCard";
import TankConfigModal from "../components/TankConfigModal";

const apiHost = import.meta.env.VITE_API_HOST;

export default function EstatusUnidades() {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('All'); 

    const [openModal, setOpenModal] = useState(false);
    const [selectedTruck, setSelectedTruck] = useState(null);

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
                return true; // Éxito
            }
        } catch (e) {
            Swal.fire('Error', 'No se pudo actualizar', 'error');
        }
        return false;
    };

    const openConfig = (truck) => {
        setSelectedTruck(truck);
        setOpenModal(true);
    };

    const handleSaveConfig = async (truckId, currentFuel, newCapacity) => {
        await handleUpdateTruck(truckId, currentFuel, newCapacity);
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

            {/* Modal de Configuración */}
            <TankConfigModal 
                open={openModal} 
                onClose={() => setOpenModal(false)}
                onSave={handleSaveConfig}
                truck={selectedTruck}
            />
        </Box>
    );
}