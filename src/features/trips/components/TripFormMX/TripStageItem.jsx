import React from 'react';
import { Box, Typography, Paper, Stack, IconButton, Chip, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

import EmptyStage from './EmptyStage';
import NormalStage from './NormalStage';

const TripStageItem = (props) => {
    const { etapa, index, removeStage, addStop } = props;
    const isEmpty = etapa.stageType === 'emptyMileage';

    return (
        <Paper elevation={2} sx={{ overflow: 'hidden', borderLeft: `6px solid ${isEmpty ? '#757575' : '#1976d2'}` }}>
            
            <Box sx={{ bgcolor: isEmpty ? '#eeeeee' : '#e3f2fd', px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Chip label={`#${index + 1}`} size="small" sx={{ bgcolor: isEmpty ? '#757575' : '#1976d2', color: 'white', fontWeight: 'bold' }} />
                    <Typography variant="subtitle1" fontWeight={700}>{isEmpty ? 'Etapa Vacía' : 'Viaje Normal'}</Typography>
                </Stack>
                <Box>
                    {!isEmpty && <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => addStop(index)} sx={{ mr: 1 }}>Parada</Button>}
                    <IconButton size="small" color="error" onClick={() => removeStage(index)}>
                        <DeleteIcon />
                    </IconButton>
                </Box>
            </Box>

            <Box sx={{ p: 3 }}>
                {isEmpty ? (
                    <EmptyStage {...props} />
                ) : (
                    <NormalStage {...props} />
                )}
            </Box>
        </Paper>
    );
};

export default TripStageItem;