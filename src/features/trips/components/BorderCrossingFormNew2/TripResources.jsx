import React from 'react';
import { Box, Typography, Grid, Stack, Button, Paper, Divider, InputLabel } from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SelectWrapper from '../SelectWrapper';

const TripResources = ({ 
    formData, setForm, 
    tripMode, handleTripModeChange, 
    trailerType, handleTrailerTypeChange, setIsModalCajaExternaOpen,
    options, loaders, errors
}) => {
    const { activeDrivers, activeTrucks, activeTrailers, activeExternalTrailers } = options;

    return (
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2, borderTop: '4px solid #1976d2' }}>
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalShippingIcon color="primary" /> Recursos del Viaje
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Conductor Principal</Typography>
                    <SelectWrapper
                        label="Driver Principal:" isCreatable={false}
                        value={formData.driver_id ? (activeDrivers.find(d => d.driver_id === formData.driver_id) ? { value: formData.driver_id, label: activeDrivers.find(d => d.driver_id === formData.driver_id).nombre } : { value: formData.driver_id, label: formData.driver_nombre || formData.driver_id }) : null}
                        onChange={(selected) => setForm('driver_id', selected ? selected.value : '')}
                        options={activeDrivers.map(driver => ({ value: driver.driver_id, label: driver.nombre }))}
                        placeholder="Seleccionar Driver"
                        isLoading={loaders.drivers} isDisabled={loaders.drivers || !!errors.drivers}
                    />
                    {tripMode === 'team' && (
                        <SelectWrapper
                            label="Segundo Driver:" isCreatable={false}
                            value={formData.driver_id_second ? (activeDrivers.find(d => d.driver_id === formData.driver_id_second) ? { value: formData.driver_id_second, label: activeDrivers.find(d => d.driver_id === formData.driver_id_second).nombre } : { value: formData.driver_id_second, label: formData.driver_second_nombre || formData.driver_id_second }) : null}
                            onChange={(selected) => setForm('driver_id_second', selected ? selected.value : '')}
                            options={activeDrivers.filter(d => d.driver_id !== formData.driver_id).map(driver => ({ value: driver.driver_id, label: driver.nombre }))}
                            placeholder="Seleccionar 2do Driver"
                            isLoading={loaders.drivers} isDisabled={loaders.drivers || !!errors.drivers}
                        />
                    )}
                </Grid>

                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Tipo de viaje</Typography>
                    <InputLabel sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>Tipo de Viaje:</InputLabel>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Button variant={tripMode === 'individual' ? 'contained' : 'outlined'} size="small" onClick={() => handleTripModeChange('individual')}>Viaje Individual</Button>
                        <Button variant={tripMode === 'team' ? 'contained' : 'outlined'} size="small" onClick={() => handleTripModeChange('team')}>Viaje en Equipo</Button>
                    </Stack>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2">Camión</Typography>
                    <SelectWrapper
                        label="Truck:" isCreatable={false}
                        value={formData.truck_id ? (activeTrucks.find(t => t.truck_id === formData.truck_id) ? { value: formData.truck_id, label: activeTrucks.find(t => t.truck_id === formData.truck_id).unidad } : { value: formData.truck_id, label: formData.truck_unidad || formData.truck_id }) : null}
                        onChange={(selected) => setForm('truck_id', selected ? selected.value : '')}
                        options={activeTrucks.map(truck => ({ value: truck.truck_id, label: truck.unidad }))}
                        placeholder="Seleccionar Truck"
                        isLoading={loaders.trucks} isDisabled={loaders.trucks || !!errors.trucks}
                    />
                </Grid>

                <Grid item xs={12} md={8}>
                    <Grid item xs={12} md={4}>
                        <InputLabel sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>Tipo de Trailer:</InputLabel>
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Button variant={trailerType === 'interna' ? 'contained' : 'outlined'} size="small" onClick={() => handleTrailerTypeChange('interna')}>Caja Interna</Button>
                            <Button variant={trailerType === 'externa' ? 'contained' : 'outlined'} size="small" onClick={() => handleTrailerTypeChange('externa')}>Caja Externa</Button>
                        </Stack>

                        {trailerType === 'interna' && (
                            <SelectWrapper
                                label="Trailer (Caja Interna):" isCreatable={false}
                                value={formData.caja_id ? (activeTrailers.find(c => c.caja_id === formData.caja_id) ? { value: formData.caja_id, label: activeTrailers.find(c => c.caja_id === formData.caja_id).no_caja } : { value: formData.caja_id, label: formData.caja_no_caja || formData.caja_id }) : null}
                                onChange={(selected) => setForm('caja_id', selected ? selected.value : '')}
                                options={activeTrailers.map(caja => ({ value: caja.caja_id, label: caja.no_caja }))}
                                placeholder="Seleccionar Trailer"
                                isLoading={loaders.trailers} isDisabled={loaders.trailers || !!errors.trailers}
                            />
                        )}
                        {trailerType === 'externa' && (
                            <Stack direction="row" spacing={1} alignItems="flex-end">
                                <Box sx={{ flexGrow: 1 }}>
                                    <SelectWrapper
                                        label="Trailer (Caja Externa):" isCreatable={false}
                                        value={formData.caja_externa_id ? (activeExternalTrailers.find(c => c.caja_externa_id === formData.caja_externa_id) ? { value: formData.caja_externa_id, label: activeExternalTrailers.find(c => c.caja_externa_id === formData.caja_externa_id).no_caja } : { value: formData.caja_externa_id, label: formData.caja_externa_no_caja || formData.caja_externa_id }) : null}
                                        onChange={(selected) => setForm('caja_externa_id', selected ? selected.value : '')}
                                        options={activeExternalTrailers.map(caja => ({ value: caja.caja_externa_id, label: caja.no_caja }))}
                                        placeholder="Seleccionar Trailer"
                                        isLoading={loaders.externalTrailers} isDisabled={loaders.externalTrailers || !!errors.externalTrailers}
                                    />
                                </Box>
                                <Button variant="contained" color="primary" size="small" sx={{ height: '40px', minWidth: '40px', p: 0 }} onClick={() => setIsModalCajaExternaOpen(true)} title="Registrar Nueva Caja Externa">+</Button>
                            </Stack>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </Paper>
    );
};

export default TripResources;