import { Grid, Paper, Stack, Typography, Divider, Box, Chip } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import RoomIcon from '@mui/icons-material/Room';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import dayjs from 'dayjs';

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  return timeStr.substring(0, 5); 
};

export const StageNormalCard = ({ etapa, getDocumentUrl }) => {

  // 1. Separamos SOLO el BL Firmado
  const mainBLDocs = Array.isArray(etapa.documentos_adjuntos)
    ? etapa.documentos_adjuntos.filter(d => d.tipo_documento.toLowerCase() === 'bl_firmado')
    : [];

  const otrosDocumentos = Array.isArray(etapa.documentos_adjuntos)
    ? etapa.documentos_adjuntos.filter(d => d.tipo_documento.toLowerCase() !== 'bl_firmado')
    : [];

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Paper elevation={0} sx={{ border: '1px solid #e0e0e0', p: 2, height: '100%', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 4,
          bgcolor: etapa.travel_direction === 'Going Up' ? '#4caf50' : '#ff9800'
        }} />

        <Stack spacing={1.5} sx={{ pl: 1 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
              Etapa {etapa.stage_number} • {etapa.travel_direction}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5, flexWrap:'wrap' }}>
              <BusinessIcon fontSize="small" color="action" />
              <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                {etapa.nombre_compania || 'Compañía sin nombre'}
              </Typography>
              
              {etapa.ci_number && (
                <Chip label={`CI: ${etapa.ci_number}`} size="small" sx={{ height: 20, fontSize:'0.7rem', fontWeight: 'bold' }} />
              )}

              {/* 🚨 AQUÍ RESALTAMOS SOLO EL BL FIRMADO 🚨 */}
              {mainBLDocs.map(doc => (
                  <Chip 
                      key={doc.document_id}
                      icon={<InsertDriveFileIcon sx={{ fontSize: '12px !important' }} />}
                      label="BL Firmado" 
                      size="small" 
                      component="a" 
                      href={getDocumentUrl(doc.path_servidor_real || doc.nombre_archivo)} 
                      target="_blank" 
                      clickable 
                      color="info" 
                      sx={{ height: 20, fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold' }} 
                  />
              ))}
            </Stack>
          </Box>

          <Divider />

          <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mt: 1 }}>
            <RoomIcon fontSize="small" color="primary" sx={{ mt: 0.2 }} />
            
            <Grid container spacing={1} alignItems="flex-start">
              {/* ORIGEN */}
              <Grid item xs={5} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>{etapa.origin}</Typography>
                <Box sx={{ mt: 0.8 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                      Fecha Salida
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <CalendarTodayIcon sx={{ fontSize: 12, color: '#0288d1' }} />
                      <Typography variant="caption" fontWeight={600} color="primary.main">
                        {etapa.date_of_departure 
                          ? dayjs(etapa.date_of_departure).format("DD/MM/YY") 
                          : (etapa.creation_date ? dayjs(etapa.creation_date).format("DD/MM/YY") : '--')}
                      </Typography>
                    </Stack>
                </Box>

                <Box sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                      Fecha Carga
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <CalendarTodayIcon sx={{ fontSize: 12, color: '#757575' }} />
                      <Typography variant="caption" fontWeight={500}>
                        {etapa.loading_date ? dayjs(etapa.loading_date).format("DD/MM/YY") : '--'}
                      </Typography>
                    </Stack>
                </Box>
              </Grid>

              <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
                <span style={{ color: '#999', fontSize: '1.2rem', lineHeight: 1 }}>➝</span>
              </Grid>

              {/* DESTINO */}
              <Grid item xs={5} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>{etapa.destination}</Typography>
                <Box sx={{ mt: 0.8 }}>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Fecha Entrega</Typography>
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.2 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <CalendarTodayIcon sx={{ fontSize: 12, color: '#757575' }} />
                        <Typography variant="caption" fontWeight={500}>{etapa.delivery_date ? dayjs(etapa.delivery_date).format("DD/MM/YY") : '--'}</Typography>
                      </Stack>
                      
                      {etapa.time_of_delivery && (
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ bgcolor: '#f1f8ff', color: '#0288d1', border: '1px solid #b3e5fc', borderRadius: 1, px: 0.6, py: 0.1 }}>
                          <AccessTimeIcon sx={{ fontSize: 11 }} />
                          <Typography variant="caption" fontWeight={700} sx={{ lineHeight: 1, fontSize: '0.7rem' }}>{formatTime(etapa.time_of_delivery)}</Typography>
                        </Stack>
                      )}
                    </Stack>
                </Box>
              </Grid>
            </Grid>
          </Stack>

          {etapa.comments && (
            <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#666', borderLeft: '2px solid #ccc', pl: 1, display: 'block', maxWidth: '45ch', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
              "{etapa.comments}"
            </Typography>
          )}

          {/* PARADAS */}
          {Array.isArray(etapa.stops_in_transit) && etapa.stops_in_transit.length > 0 && (
            <Box sx={{ mt: 1, borderTop: '1px dashed #ccc', pt: 1 }}>
              <Typography variant="caption" fontWeight={700} color="text.primary">Paradas Adicionales:</Typography>
              <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '0.8rem' }}>
                {etapa.stops_in_transit.map((stop, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>
                    <span style={{ marginRight: 6 }}>{stop.location}</span>
                    {stop.time_of_delivery && (
                        <Chip icon={<AccessTimeIcon sx={{ fontSize: '12px !important' }} />} label={formatTime(stop.time_of_delivery)} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#f5f5f5', border: '1px solid #e0e0e0', mr: 0.5 }} />
                    )}
                    {stop.bl_firmado_doc && (
                      <Chip 
                          icon={<InsertDriveFileIcon sx={{ fontSize: '12px !important' }} />}
                          label="BL Firmado" 
                          size="small" 
                          component="a" 
                          href={getDocumentUrl(stop.bl_firmado_doc.path_servidor_real || stop.bl_firmado_doc.nombre_archivo)} 
                          target="_blank" 
                          clickable 
                          color="info" 
                          sx={{ height: 20, fontSize: '0.7rem', cursor: 'pointer', fontWeight: 'bold' }} 
                      />
                  )}
                  </li>
                ))}
              </ul>
            </Box>
          )}

          {/* DOCUMENTOS ADJUNTOS (Incluye el BL normal) */}
          {otrosDocumentos.length > 0 && (
            <Box sx={{ mt: 'auto', pt: 1 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {otrosDocumentos.map(doc => (
                  <Chip 
                      key={doc.document_id} 
                      label={doc.tipo_documento.toUpperCase().replace(/_/g, ' ')} 
                      size="small" 
                      component="a" 
                      href={getDocumentUrl(doc.path_servidor_real || doc.nombre_archivo)} 
                      target="_blank" 
                      clickable 
                      color="default" 
                      variant="outlined" 
                      sx={{ fontSize: '0.75rem', fontWeight: 'bold' }} 
                  />
              ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </Paper>
    </Grid>
  );
};