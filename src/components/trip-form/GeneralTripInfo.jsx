import React from 'react';
import { Box, Paper, Typography, Grid, ToggleButton, ToggleButtonGroup, TextField, Button } from '@mui/material';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { selectStyles } from '../../utils/tripFormConstants'; 

const GeneralTripInfo = ({
    formData,
    handleFormChange,
    tripMode,
    handleTripModeChange,
    trailerType,
    handleTrailerTypeChange,
    isFormDisabled,
    options,
    loadingStates,
    setIsModalCajaExternaOpen
}) => {
    return (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" color="primary" gutterBottom fontWeight={600}>
                Información General
            </Typography>

            <Grid container spacing={2} alignItems="flex-end"> 
                <Grid item xs={12}>
                    <ToggleButtonGroup
                        color="primary"
                        value={tripMode}
                        exclusive
                        onChange={(e, newMode) => newMode && handleTripModeChange(newMode)}
                        disabled={isFormDisabled}
                        size="small"
                    >
                        <ToggleButton value="individual">Viaje Individual</ToggleButton>
                        <ToggleButton value="team">Viaje en Equipo</ToggleButton>
                    </ToggleButtonGroup>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Typography variant="caption" display="block" color="textSecondary" mb={0.5}>
                        Trip Number
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder="Ingrese número..."
                        value={formData.trip_number}
                        onChange={(e) => handleFormChange('trip_number', e.target.value)}
                        disabled={isFormDisabled}
                        variant="outlined"
                        size="small"
                        sx={{ 
                            '& .MuiInputBase-root': { backgroundColor: '#fff' } 
                        }}
                    />
                </Grid>

                <Grid item xs={12} md={4}>
                    <Typography variant="caption" display="block" color="textSecondary" mb={0.5}>
                        Fecha de Regreso
                    </Typography>
                    <div className="custom-datepicker-wrapper">
                        <DatePicker
                            selected={formData.return_date}
                            onChange={(date) => handleFormChange('return_date', date)}
                            dateFormat="dd/MM/yyyy"
                            placeholderText="Seleccionar fecha"
                            className="form-input"
                            disabled={isFormDisabled}
                            wrapperClassName="w-100"
                        />
                    </div>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Typography variant="caption" display="block" color="textSecondary" mb={0.5}>
                        Driver Principal
                    </Typography>
                    <Select
                        value={formData.driver_id ? { value: formData.driver_id, label: formData.driver_nombre || `ID: ${formData.driver_id}` } : null}
                        onChange={(sel) => {
                            handleFormChange('driver_id', sel?.value || '');
                            const detail = options.drivers.find(d => d.driver_id === sel?.value);
                            handleFormChange('driver_nombre', detail?.nombre || '');
                        }}
                        options={options.drivers}
                        isLoading={loadingStates.drivers}
                        styles={selectStyles}
                        isDisabled={isFormDisabled}
                        placeholder="Seleccionar..."
                        isClearable
                    />
                </Grid>

                {tripMode === 'team' && (
                    <Grid item xs={12} md={4}>
                        <Typography variant="caption" display="block" color="textSecondary" mb={0.5}>
                            Segundo Driver
                        </Typography>
                        <Select
                            value={formData.driver_id_second ? { value: formData.driver_id_second, label: formData.driver_second_nombre || `ID: ${formData.driver_id_second}` } : null}
                            onChange={(sel) => {
                                handleFormChange('driver_id_second', sel?.value || '');
                                handleFormChange('driver_second_nombre', sel?.label || '');
                            }}
                            options={options.drivers.filter(d => d.value !== formData.driver_id)}
                            isLoading={loadingStates.drivers}
                            styles={selectStyles}
                            isDisabled={isFormDisabled}
                            placeholder="Seleccionar..."
                            isClearable
                        />
                    </Grid>
                )}

                <Grid item xs={12} md={4}>
                    <Typography variant="caption" display="block" color="textSecondary" mb={0.5}>
                        Camión (Truck)
                    </Typography>
                    <Select
                        value={formData.truck_id ? { value: formData.truck_id, label: formData.truck_unidad || `ID: ${formData.truck_id}` } : null}
                        onChange={(sel) => {
                            handleFormChange('truck_id', sel?.value || '');
                            const detail = options.trucks.find(t => t.truck_id === sel?.value);
                            handleFormChange('truck_unidad', detail?.unidad || '');
                        }}
                        options={options.trucks}
                        isLoading={loadingStates.trucks}
                        styles={selectStyles}
                        isDisabled={isFormDisabled}
                        placeholder="Seleccionar..."
                        isClearable
                    />
                </Grid>
            </Grid>

            <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed #e0e0e0' }}>
                <Typography variant="subtitle2" gutterBottom>Configuración de Caja (Trailer)</Typography>
                <Grid container spacing={2} alignItems="center">
                    <Grid item>
                        <ToggleButtonGroup
                            value={trailerType}
                            exclusive
                            onChange={(e, val) => val && handleTrailerTypeChange(val)}
                            disabled={isFormDisabled}
                            size="small"
                        >
                            <ToggleButton value="interna">Interna</ToggleButton>
                            <ToggleButton value="externa">Externa</ToggleButton>
                        </ToggleButtonGroup>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        {trailerType === 'interna' ? (
                            <Select
                                value={formData.caja_id ? { value: formData.caja_id, label: formData.caja_no_caja || `ID: ${formData.caja_id}` } : null}
                                onChange={(sel) => {
                                    handleFormChange('caja_id', sel?.value || '');
                                    handleFormChange('caja_no_caja', sel?.label || '');
                                }}
                                options={options.trailers}
                                isLoading={loadingStates.trailers}
                                styles={selectStyles}
                                isDisabled={isFormDisabled}
                                placeholder="Seleccionar Caja Interna"
                                isClearable
                            />
                        ) : (
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Select
                                        value={formData.caja_externa_id ? { value: formData.caja_externa_id, label: formData.caja_externa_no_caja || `ID: ${formData.caja_externa_id}` } : null}
                                        onChange={(sel) => {
                                            handleFormChange('caja_externa_id', sel?.value || '');
                                            handleFormChange('caja_externa_no_caja', sel?.label || '');
                                        }}
                                        options={options.externalTrailers}
                                        isLoading={loadingStates.externalTrailers}
                                        styles={selectStyles}
                                        isDisabled={isFormDisabled}
                                        placeholder="Seleccionar Caja Externa"
                                        isClearable
                                    />
                                </Box>
                                <Button 
                                    variant="outlined" 
                                    sx={{ minWidth: '40px', px: 0 }} 
                                    onClick={() => setIsModalCajaExternaOpen(true)}
                                    disabled={isFormDisabled}
                                >
                                    +
                                </Button>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
};

export default GeneralTripInfo;