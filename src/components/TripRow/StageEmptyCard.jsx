import React from 'react';
import { Grid, Paper, Stack, Typography, Box, Chip } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';
import { COLOR } from '../../shared/ui/tokens';

export const StageEmptyCard = ({ etapa }) => {
  const isStageOne = etapa.stage_number === 1 || etapa.stage_number === '1';

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Paper 
        elevation={0} 
        sx={{
          height: '100%',
          borderRadius: 2,
          border: `1px solid ${COLOR.BORDE}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: COLOR.BLANCO
        }}
      >
        <Box sx={{ bgcolor: COLOR.LIENZO, p: 2, borderBottom: `1px solid ${COLOR.BORDE}` }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Typography variant="subtitle1" fontWeight={800} color={COLOR.TINTA}>
                      Etapa {etapa.stage_number}
                    </Typography>
                </Stack>
                <Chip
                  label="Vacío Inicial"
                  size="small"
                  icon={<LocalShippingOutlinedIcon fontSize="small" />}
                  sx={{
                      bgcolor: COLOR.RELLENO,
                      color: COLOR.TEXTO_SUAVE,
                      fontWeight: 700,
                      borderRadius: 1.5,
                      '& .MuiChip-icon': { color: COLOR.TEXTO_SUAVE },
                  }}
                />
            </Stack>

            {isStageOne && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: COLOR.BLANCO, borderRadius: 2, border: `1px solid ${COLOR.BORDE}` }}>
                    <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" fontWeight={700} color={COLOR.TENUE} textTransform="uppercase" display="block">
                              Origen
                            </Typography>
                            <Typography variant="body2" fontWeight={700} color={COLOR.TEXTO} noWrap>
                                {etapa.origen || etapa.origin || 'No especificado'}
                            </Typography>
                        </Box>
                        
                        <RouteOutlinedIcon sx={{ color: COLOR.BORDE_FUERTE, fontSize: 18 }} />
                        
                        <Box sx={{ flex: 1, textAlign: 'right' }}>
                            <Typography variant="caption" fontWeight={700} color={COLOR.TENUE} textTransform="uppercase" display="block">
                              Destino
                            </Typography>
                            <Typography variant="body2" fontWeight={700} color={COLOR.TEXTO} noWrap>
                                {etapa.destino || etapa.destination || 'No especificado'}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
            )}
        </Box>

        <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                    <Box sx={{ p: 1.5, bgcolor: COLOR.INFO_FONDO, borderRadius: 2, border: `1px dashed ${COLOR.INFO_BORDE}` }}>
                        <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                            <RouteOutlinedIcon sx={{ fontSize: 14, color: COLOR.INFO }} />
                            <Typography variant="caption" fontWeight={700} color={COLOR.INFO} textTransform="uppercase" sx={{ fontSize: '0.65rem' }}>
                              PC*Miler
                            </Typography>
                        </Stack>
                        <Typography variant="h6" fontWeight={800} color={COLOR.INFO} lineHeight={1}>
                          {etapa.millas_pcmiller || '0'} <Typography component="span" variant="caption" fontWeight={600} color="#60a5fa">mi</Typography>
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={6}>
                    <Box sx={{ p: 1.5, bgcolor: COLOR.EXITO_FONDO, borderRadius: 2, border: `1px dashed ${COLOR.EXITO_BORDE}` }}>
                        <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                            <RouteOutlinedIcon sx={{ fontSize: 14, color: COLOR.EXITO }} />
                            <Typography variant="caption" fontWeight={700} color={COLOR.EXITO} textTransform="uppercase" sx={{ fontSize: '0.65rem' }}>
                              Prácticas
                            </Typography>
                        </Stack>
                        <Typography variant="h6" fontWeight={800} color="#047857" lineHeight={1}>
                          {etapa.millas_pcmiller_practicas || '0'} <Typography component="span" variant="caption" fontWeight={600} color="#34d399">mi</Typography>
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            {etapa.comments && (
                <Box 
                  sx={{ 
                    mt: 'auto', 
                    p: 1.5, 
                    bgcolor: COLOR.AVISO_FONDO,
                    borderLeft: `4px solid ${COLOR.AVISO}`,
                    borderRadius: '0 4px 4px 0' 
                  }}
                >
                    <Typography variant="caption" fontWeight={800} color={COLOR.AVISO} display="block" mb={0.5}>
                      OBSERVACIONES
                    </Typography>
                    <Typography variant="body2" color="#78350f" sx={{ fontStyle: 'italic', lineHeight: 1.4 }}>
                      "{etapa.comments}"
                    </Typography>
                </Box>
            )}
        </Box>
      </Paper>
    </Grid>
  );
};