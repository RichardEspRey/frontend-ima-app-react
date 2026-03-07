import React from 'react';
import { Grid, Typography, Paper, Stack, TextField, Divider, Box } from '@mui/material';
import FlagIcon from '@mui/icons-material/Flag';
import PlaceIcon from '@mui/icons-material/Place';
import { format } from 'date-fns';
import SelectWrapper from '../SelectWrapper'; 
import StopsSection from './StopsSection';
import DocButton from './DocButton';

const NormalStage = ({ 
    etapa, index, updateStage, handleEtapaChange, 
    companyOptions, warehouseOptions, 
    handleCreateCompany, handleCreateWarehouse, 
    loadingStates, 
    addStop, removeStop, updateStop, openDocModal 
}) => {
    return (
        <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
                <Typography variant="caption" fontWeight={700}>Compañía</Typography>
                <SelectWrapper
                    label="Company:" isCreatable
                    value={companyOptions.find(c => c.value === etapa.company_id) || null}
                    onChange={(selected) => handleEtapaChange(index, 'company_id', selected ? selected.value : '')}
                    onCreateOption={(inputValue) => handleCreateCompany(inputValue, index)}
                    options={companyOptions} placeholder="Seleccionar o Crear Compañía"
                    isLoading={loadingStates.companies || loadingStates.creatingCompany}
                    formatCreateLabel={(inputValue) => `Crear compañía: "${inputValue}"`}
                />
            </Grid>

            <Grid item xs={12} md={3}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%', bgcolor: '#f5f5f5' }}>
                    <Typography variant="subtitle2" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PlaceIcon fontSize="small" /> ORIGEN
                    </Typography>
                    <TextField 
                        label="Hora de Salida" 
                        type="time" 
                        InputLabelProps={{ shrink: true }} 
                        size="small" 
                        fullWidth 
                        value={etapa.time_of_departure || ''} 
                        onChange={e => updateStage(index, 'time_of_departure', e.target.value)} 
                    />
                </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <FlagIcon fontSize="small" /> DESTINO
                    </Typography>
                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="caption">Bodega</Typography>
                            <SelectWrapper
                                label="Destination Warehouse:" isCreatable
                                value={warehouseOptions.find(w => w.value === etapa.warehouse_destination_id) || null}
                                onChange={(selected) => handleEtapaChange(index, 'warehouse_destination_id', selected ? selected.value : '')}
                                onCreateOption={(inputValue) => handleCreateWarehouse(inputValue, index, 'warehouse_destination_id')}
                                options={warehouseOptions} placeholder="Seleccionar o Crear Bodega Destino"
                                isLoading={loadingStates.warehouses || loadingStates.creatingWarehouse}
                                formatCreateLabel={(inputValue) => `Crear bodega: "${inputValue}"`}
                            />
                        </Box>
                        <Stack direction="row" spacing={1}>
                            <TextField label="Ciudad" fullWidth size="small" value={etapa.destination} onChange={e => updateStage(index, 'destination', e.target.value)} />
                            <TextField label="Zip" size="small" sx={{ width: 100 }} value={etapa.zip_code_destination} onChange={e => updateStage(index, 'zip_code_destination', e.target.value)} />
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <TextField label="Fecha Entrega" type="date" InputLabelProps={{ shrink: true }} size="small" fullWidth value={etapa.delivery_date ? format(etapa.delivery_date, 'yyyy-MM-dd') : ''} onChange={e => updateStage(index, 'delivery_date', e.target.value ? new Date(e.target.value + 'T12:00:00') : null)} />
                            <TextField label="Hora Entrega" type="time" InputLabelProps={{ shrink: true }} size="small" fullWidth value={etapa.time_of_delivery || ''} onChange={e => updateStage(index, 'time_of_delivery', e.target.value)} />
                        </Stack>
                    </Stack>
                </Paper>
            </Grid>

            <StopsSection stops={etapa.stops_in_transit} stageIndex={index} updateStop={updateStop} removeStop={removeStop} openDocModal={openDocModal} />

            <Grid item xs={12}><Divider /></Grid>
            
            <Grid item xs={12}>
                <Typography variant="subtitle2" fontWeight={700}>Documentación</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    {['carta_porte', 'fianza'].map(docKey => (
                        <Grid item xs={6} sm={3} key={docKey}>
                            <DocButton label={docKey.toUpperCase().replace('_', ' ')} doc={etapa.documentos[docKey]} onClick={() => openDocModal(index, docKey)} />
                        </Grid>
                    ))}
                </Grid>
            </Grid>
        </Grid>
    );
};

export default NormalStage;