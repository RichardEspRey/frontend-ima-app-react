import { Box, Typography, Stack, Button, Paper, Grid } from '@mui/material';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottomOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';

import { StageEmptyCard } from './StageEmptyCard';
import { StageNormalCard } from './StageNormalCard';
import { StageUpcomingCard } from './StageUpcomingCard';

const actionBtnSx = { textTransform: 'none', fontWeight: 600, borderRadius: 1.5, boxShadow: 'none' };

export const TripExpandedDetails = ({
    trip, isUpcomingTab, isDespachoTab, onAlmostOver, onFinalize, getDocumentUrl
}) => {

  const isCompleted = trip.status === 'Completed';

  return (
    <Box sx={{ margin: 1, padding: 2.5, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#fafbfc' }}>

      {!isUpcomingTab && !isDespachoTab && (
        <Paper elevation={0} sx={{ p: 1.75, mb: 2.5, bgcolor: '#fff', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2, flexWrap: 'wrap', gap: 1.5 }}>
          <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.68rem' }}>
            Acciones Rápidas
          </Typography>
          <Stack direction="row" spacing={1.5}>
            <Button size="small" variant="outlined" startIcon={<HourglassBottomIcon />} onClick={() => onAlmostOver(trip.trip_id, trip.trip_number)} disabled={trip.status === 'Almost Over'}
              sx={{ ...actionBtnSx, borderColor: '#cbd5e1', color: '#334155' }}>
              Marcar Almost Over
            </Button>
            <Button size="small" variant="contained" startIcon={<CheckCircleOutlineIcon />} onClick={() => onFinalize(trip.trip_id, trip.trip_number)}
              sx={{ ...actionBtnSx, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}>
              Finalizar Viaje
            </Button>
          </Stack>
        </Paper>
      )}

      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <LayersOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
        <Typography variant="subtitle2" sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Detalles de Etapas y Logística
        </Typography>
      </Stack>

      {Array.isArray(trip.etapas) && trip.etapas.length > 0 ? (
        <Grid container spacing={2}>
          {trip.etapas.map((etapa) => {

            if (etapa.stageType === 'emptyMileage') {
              return <StageEmptyCard key={etapa.trip_stage_id || etapa.id || Math.random()} etapa={etapa} />;
            }

            if (isUpcomingTab || isDespachoTab) {
                return (
                    <Grid item xs={12} key={etapa.trip_stage_id || etapa.id || Math.random()}>
                        <StageUpcomingCard etapa={etapa} getDocumentUrl={getDocumentUrl} />
                    </Grid>
                );
            }

            return <StageNormalCard key={etapa.trip_stage_id || etapa.id || Math.random()} etapa={etapa} getDocumentUrl={getDocumentUrl} isCompleted={isCompleted} />;

          })}
        </Grid>
      ) : (
        <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#94a3b8', textAlign: 'center', py: 2 }}>
          No hay información detallada de etapas para este viaje.
        </Typography>
      )}
    </Box>
  );
};
