import React from 'react';
import { Paper, Typography, Grid, TextField, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DocButton from './DocButton';

const StopsSection = ({ stops, stageIndex, updateStop, removeStop, openDocModal }) => {
    if (!stops || stops.length === 0) return null;

    return (
        <Grid item xs={12}>
            <Paper sx={{ p: 2, bgcolor: '#fff8e1', border: '1px dashed #ffb74d' }}>
                <Typography variant="subtitle2" color="warning.dark">Paradas</Typography>
                {stops.map((stop, si) => (
                    <Grid container spacing={1} key={si} alignItems="center" sx={{ mt: 1 }}>
                        <Grid item xs={5}>
                            <TextField label="Ubicación" size="small" fullWidth value={stop.location} onChange={e => updateStop(stageIndex, si, 'location', e.target.value)} />
                        </Grid>
                        <Grid item xs={3}>
                            <TextField label="Hora" type="time" size="small" fullWidth InputLabelProps={{ shrink: true }} value={stop.time_of_delivery} onChange={e => updateStop(stageIndex, si, 'time_of_delivery', e.target.value)} />
                        </Grid>
                        <Grid item xs={3}>
                            <DocButton label="BL Parada" doc={stop.bl_firmado_doc} onClick={() => openDocModal(stageIndex, 'bl_firmado_doc', si)} />
                        </Grid>
                        <Grid item xs={1}>
                            <IconButton size="small" color="error" onClick={() => removeStop(stageIndex, si)}>
                                <DeleteIcon />
                            </IconButton>
                        </Grid>
                    </Grid>
                ))}
            </Paper>
        </Grid>
    );
};

export default StopsSection;