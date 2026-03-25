import { Box, Typography, Stack, Button, Paper, Grid } from '@mui/material';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import { StageEmptyCard } from './StageEmptyCard';
import { StageNormalCard } from './StageNormalCard';
import { StageUpcomingCard } from './StageUpcomingCard'; 

export const TripExpandedDetails = ({ 
    trip, isUpcomingTab, isDespachoTab, onAlmostOver, onFinalize, getDocumentUrl 
}) => {
  return (
    <Box sx={{ margin: 1, padding: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fafafa' }}>
      
      {!isUpcomingTab && !isDespachoTab && (
        <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#fff', border: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#424242' }}>
            Acciones Rápidas:
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button size="small" variant="outlined" color="primary" startIcon={<HourglassBottomIcon />} onClick={() => onAlmostOver(trip.trip_id, trip.trip_number)} disabled={trip.status === 'Almost Over'}>
              Marcar Almost Over
            </Button>
            <Button size="small" variant="contained" color="success" startIcon={<CheckCircleOutlineIcon />} onClick={() => onFinalize(trip.trip_id, trip.trip_number)}>
              Finalizar Viaje
            </Button>
          </Stack>
        </Paper>
      )}

      <Typography variant="h6" gutterBottom component="div" sx={{ fontSize: '1rem', fontWeight: 700, color: '#1976d2', mb: 2 }}>
        Detalles de Etapas y Logística
      </Typography>

      {Array.isArray(trip.etapas) && trip.etapas.length > 0 ? (
        <Grid container spacing={2}>
          {trip.etapas.map((etapa) => {

            if (isUpcomingTab || isDespachoTab) {
                return (
                    <Grid item xs={12} key={etapa.trip_stage_id}>
                        <StageUpcomingCard etapa={etapa} getDocumentUrl={getDocumentUrl} />
                    </Grid>
                );
            }

            if (etapa.stageType === 'emptyMileage') {
              return <StageEmptyCard key={etapa.trip_stage_id} etapa={etapa} />;
            } else {
              return <StageNormalCard key={etapa.trip_stage_id} etapa={etapa} getDocumentUrl={getDocumentUrl} />;
            }
            
          })}
        </Grid>
      ) : (
        <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', textAlign: 'center', py: 2 }}>
          No hay información detallada de etapas para este viaje.
        </Typography>
      )}
    </Box>
  );
};