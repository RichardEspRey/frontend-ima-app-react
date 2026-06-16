import React from 'react';
import { Grid, Paper, Stack, Typography, Box, Chip } from '@mui/material';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import RouteOutlinedIcon from '@mui/icons-material/RouteOutlined';

export const StageEmptyCard = ({ etapa }) => {
  const isStageOne = etapa.stage_number === 1 || etapa.stage_number === '1';

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Paper 
        elevation={0} 
        sx={{ 
          height: '100%', 
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#ffffff'
        }}
      >
        <Box sx={{ bgcolor: '#f8fafc', p: 2, borderBottom: '1px solid #e2e8f0' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                      Etapa {etapa.stage_number}
                    </Typography>
                </Stack>
                <Chip 
                  label="Vacío Inicial" 
                  size="small" 
                  icon={<LocalShippingOutlinedIcon fontSize="small" />}
                  sx={{ 
                      bgcolor: '#e2e8f0', 
                      color: '#475569', 
                      fontWeight: 700, 
                      borderRadius: '6px'
                  }} 
                />
            </Stack>

            {isStageOne && (
                <Box sx={{ mt: 2, p: 1.5, bgcolor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Stack direction="row" alignItems="center" spacing={2} justifyContent="space-between">
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" fontWeight={700} color="#94a3b8" textTransform="uppercase" display="block">
                              Origen
                            </Typography>
                            <Typography variant="body2" fontWeight={700} color="#334155" noWrap>
                                {etapa.origen || etapa.origin || 'No especificado'}
                            </Typography>
                        </Box>
                        
                        <RouteOutlinedIcon sx={{ color: '#cbd5e1', fontSize: 18 }} />
                        
                        <Box sx={{ flex: 1, textAlign: 'right' }}>
                            <Typography variant="caption" fontWeight={700} color="#94a3b8" textTransform="uppercase" display="block">
                              Destino
                            </Typography>
                            <Typography variant="body2" fontWeight={700} color="#334155" noWrap>
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
                    <Box sx={{ p: 1.5, bgcolor: '#eff6ff', borderRadius: 2, border: '1px dashed #bfdbfe' }}>
                        <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                            <RouteOutlinedIcon sx={{ fontSize: 14, color: '#3b82f6' }} />
                            <Typography variant="caption" fontWeight={700} color="#3b82f6" textTransform="uppercase" sx={{ fontSize: '0.65rem' }}>
                              PC*Miler
                            </Typography>
                        </Stack>
                        <Typography variant="h6" fontWeight={800} color="#1d4ed8" lineHeight={1}>
                          {etapa.millas_pcmiller || '0'} <Typography component="span" variant="caption" fontWeight={600} color="#60a5fa">mi</Typography>
                        </Typography>
                    </Box>
                </Grid>

                <Grid item xs={6}>
                    <Box sx={{ p: 1.5, bgcolor: '#f0fdf4', borderRadius: 2, border: '1px dashed #bbf7d0' }}>
                        <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                            <RouteOutlinedIcon sx={{ fontSize: 14, color: '#10b981' }} />
                            <Typography variant="caption" fontWeight={700} color="#10b981" textTransform="uppercase" sx={{ fontSize: '0.65rem' }}>
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
                    bgcolor: '#fffbeb',
                    borderLeft: '4px solid #f59e0b',
                    borderRadius: '0 4px 4px 0' 
                  }}
                >
                    <Typography variant="caption" fontWeight={800} color="#b45309" display="block" mb={0.5}>
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