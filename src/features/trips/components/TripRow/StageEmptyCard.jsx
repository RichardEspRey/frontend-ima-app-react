import { Grid, Paper, Stack, Typography, Divider, Box } from '@mui/material';

export const StageEmptyCard = ({ etapa }) => {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Paper elevation={0} sx={{ border: '1px dashed #90caf9', bgcolor: '#e3f2fd', p: 2, height: '100%', borderRadius: 2 }}>
        <Stack spacing={1}>
          <Typography sx={{ fontWeight: 'bold', color: '#1565c0' }}>
            E{etapa.stage_number}: Etapa Vacía (Empty)
          </Typography>
          <Divider sx={{ borderColor: '#bbdefb' }} />
          <Box>
            <Typography variant="body2" color="text.secondary">Millas PC*Miler:</Typography>
            <Typography variant="body1" fontWeight={500}>{etapa.millas_pcmiller || '0'}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">Millas Prácticas:</Typography>
            <Typography variant="body1" fontWeight={500}>{etapa.millas_pcmiller_practicas || '0'}</Typography>
          </Box>
          {etapa.comments && (
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#555', mt: 1, bgcolor: 'rgba(255,255,255,0.5)', p: 0.5, borderRadius: 1 }}>
              "{etapa.comments}"
            </Typography>
          )}
        </Stack>
      </Paper>
    </Grid>
  );
};