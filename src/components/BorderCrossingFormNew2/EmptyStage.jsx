import React from 'react';
import { Grid, TextField, Paper, Typography, Stack, Autocomplete } from '@mui/material';
import PlaceIcon from '@mui/icons-material/Place';
import FlagIcon from '@mui/icons-material/Flag';
import { format } from 'date-fns';

const EmptyStage = ({ etapa, index, updateStage, origenes }) => {
    return (
        <Grid container spacing={3}>
            {/* ORIGEN (MOVIMIENTO VACÍO) */}
            <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%', bgcolor: '#f8fafc' }}>
                    <Typography variant="subtitle2" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <PlaceIcon fontSize="small" /> ORIGEN (MOVIMIENTO VACÍO)
                    </Typography>
                    
                    <Stack spacing={2}>
                        <Autocomplete
                            freeSolo
                            options={origenes || []}
                            getOptionLabel={(option) => typeof option === 'string' ? option : option.nombre}
                            value={etapa.origin || ''}
                            onChange={(event, newValue) => {
                                if (newValue && typeof newValue === 'object') {
                                    updateStage(index, 'origin', newValue.nombre);
                                    updateStage(index, 'zip_code_origin', newValue.zip_code);
                                } else {
                                    updateStage(index, 'origin', newValue || '');
                                }
                            }}
                            renderInput={(params) => (
                                <TextField {...params} label="Ciudad Origen" size="small" fullWidth onChange={(e) => updateStage(index, 'origin', e.target.value)} />
                            )}
                        />

                        <Stack direction="row" spacing={1}>
                            <TextField label="Zip Code" size="small" sx={{ width: 110 }} value={etapa.zip_code_origin || ''} onChange={e => updateStage(index, 'zip_code_origin', e.target.value)} />
                            <TextField 
                                label="Fecha de Salida" type="date" InputLabelProps={{ shrink: true }} size="small" fullWidth 
                                value={etapa.date_of_departure ? format(new Date(etapa.date_of_departure), 'yyyy-MM-dd') : ''} 
                                onChange={e => updateStage(index, 'date_of_departure', e.target.value ? new Date(e.target.value + 'T12:00:00') : null)} 
                            />
                        </Stack>
                    </Stack>
                </Paper>
            </Grid>

            {/* DESTINO (MOVIMIENTO VACÍO) */}
            <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ p: 2, height: '100%', bgcolor: '#f8fafc' }}>
                    <Typography variant="subtitle2" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <FlagIcon fontSize="small" /> DESTINO (MOVIMIENTO VACÍO)
                    </Typography>
                    <Stack spacing={2}>
                        <TextField label="Ciudad Destino" fullWidth size="small" value={etapa.destination || ''} onChange={e => updateStage(index, 'destination', e.target.value)} />
                        <Stack direction="row" spacing={1}>
                            <TextField label="Zip Destino" size="small" sx={{ width: 110 }} value={etapa.zip_code_destination || ''} onChange={e => updateStage(index, 'zip_code_destination', e.target.value)} />
                            <TextField 
                                label="Fecha de Llegada" type="date" InputLabelProps={{ shrink: true }} size="small" fullWidth 
                                value={etapa.delivery_date ? format(new Date(etapa.delivery_date), 'yyyy-MM-dd') : ''} 
                                onChange={e => updateStage(index, 'delivery_date', e.target.value ? new Date(e.target.value + 'T12:00:00') : null)} 
                            />
                        </Stack>
                    </Stack>
                </Paper>
            </Grid>

            {/* METRICS */}
            <Grid item xs={12}>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth size="small" label="Millas PC*Miler" type="number" value={etapa.millas_pcmiller || ''} onChange={e => updateStage(index, 'millas_pcmiller', e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth size="small" label="Millas Prácticas" type="number" value={etapa.millas_pcmiller_practicas || ''} onChange={e => updateStage(index, 'millas_pcmiller_practicas', e.target.value)} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth size="small" label="Comentarios" value={etapa.comments || ''} onChange={e => updateStage(index, 'comments', e.target.value)} />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    );
};

export default EmptyStage;