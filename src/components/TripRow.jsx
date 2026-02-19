import React, { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableRow,
  Button, Typography, Tooltip, IconButton, Collapse, Box, Grid, Chip, Link as MuiLink, Stack,
  Paper, Divider
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import updateLocale from 'dayjs/plugin/updateLocale';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import RoomIcon from '@mui/icons-material/Room';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

import WarningIcon from '@mui/icons-material/Warning';

dayjs.extend(updateLocale);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(localizedFormat);
dayjs.locale('es');

export const TripRow = ({
  trip,
  isCompletedTab,
  onEdit,
  onFinalize,
  onAlmostOver,
  onReactivate,
  isAdmin,
  getDocumentUrl,
  onSummary,


  // ✅ NUEVO: props para tu lógica de tabs
  showDocsColumn = false,             // true en Up Coming y Despacho
  isDespachoTab = false,              // true solo en tab despacho
  documentosFaltantes = 0,            // viene del endpoint (lo ideal: etapa 1 o suma)
  documentosFaltantesLista = [],      // viene del endpoint (hover)
  onSalida,                           // handler opcional
  colSpanOverride,                    // para que el collapse no se rompa si cambian columnas
  isUpcomingTab = false,
  onDelete,

}) => {

  const [open, setOpen] = useState(false);

  let loadingDateToShow = '-';
  let loadingDateTitle = 'Fecha de carga no disponible';

  if (Array.isArray(trip.etapas) && trip.etapas.length > 0 && trip.etapas[0].loading_date) {
    loadingDateToShow = dayjs(trip.etapas[0].loading_date).format("DD/MM/YY");
    loadingDateTitle = `Fecha de Carga (1ª Etapa): ${loadingDateToShow}`;
  } else if (trip.etapas && trip.etapas.length > 0) {
    loadingDateTitle = 'Fecha de carga (1ª Etapa) no especificada';
  }

  const returnDateForDisplay = trip.return_date ? dayjs(trip.return_date).format('dddd D, YYYY') : '- ';
  const returnDateTitle = trip.return_date ? `Fecha de Regreso: ${dayjs(trip.return_date).format('dddd D [de] MMMM [de] YYYY')}` : 'Fecha de regreso no asignada';

  const trailerTooltipContent = (
    <>
      <Typography color="inherit" sx={{ fontWeight: 'bold', mb: 0.5 }}>Detalles del Tráiler</Typography>
      {trip.caja_id && (
        <Typography variant="body2" component="div">
          <b>Tipo:</b> Interno<br /><b>Número:</b> {trip.caja_no_caja || 'N/A'}<br /><b>ID:</b> {trip.caja_id}
        </Typography>
      )}
      {trip.caja_externa_id && (
        <Typography variant="body2" component="div">
          <b>Tipo:</b> Externo<br /><b>Número de caja:</b> {trip.caja_externa_no_caja || 'N/A'}<br />
          <b>Placas:</b> {trip.caja_externa_placas || 'N/A'}<br />
        </Typography>
      )}
      {!trip.caja_id && !trip.caja_externa_id && <Typography variant="body2">No hay detalles adicionales.</Typography>}
    </>
  );

  // ✅ NUEVO: tooltip para documentos faltantes
  const docsTooltipTitle = Array.isArray(documentosFaltantesLista) && documentosFaltantesLista.length > 0
    ? (
      <Box>
        <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Faltan:</Typography>
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {documentosFaltantesLista.map((d, idx) => (
            <li key={`${d}-${idx}`}>{d}</li>
          ))}
        </ul>
      </Box>
    )
    : 'Sin documentos faltantes';

  // ✅ NUEVO: si showDocsColumn viene activo, ocultamos Initial Date y Return Date
  // ✅ NUEVO: en despacho NO mostrar Editar
  const canShowEditButton = !!onEdit && !isCompletedTab && !isDespachoTab; // editar solo en Up Coming (y demás), no en despacho
  const showViewButtonCompleted = !!onEdit && isCompletedTab;             // en completados sí es "Ver"

  // ✅ NUEVO: SALIDA solo en despacho y solo si faltantes = 0
  const canSalida = isDespachoTab && documentosFaltantes === 0;

  // ✅ NUEVO: colSpan para el collapse (si no lo pasas, se queda el 11 de tu código original)
  const collapseColSpan = typeof colSpanOverride === 'number' ? colSpanOverride : 11;

  const formatTime = (timeStr) => {
      if (!timeStr) return '';
      return timeStr.substring(0, 5); 
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} hover>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        <TableCell component="th" scope="row">
          <Box sx={{ whiteSpace: 'nowrap' }}>{trip.trip_number}</Box>
        </TableCell>

        <TableCell>
          {trip.driver_second_nombre ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" component="span" noWrap>{trip.driver_nombre || 'N/A'}</Typography>
              <Typography variant="body2" component="span" noWrap>{trip.driver_second_nombre}</Typography>
            </Box>
          ) : (trip.driver_nombre || trip.driver_id || '-')}
        </TableCell>

        <TableCell>{trip.truck_unidad || trip.truck_id || '-'}</TableCell>

        <TableCell>
          <Tooltip title={trailerTooltipContent} arrow>
            <Typography component="span" sx={{ cursor: 'pointer', borderBottom: '1px dotted #ccc' }}>
              {trip.caja_no_caja || trip.caja_id || trip.caja_externa_no_caja || trip.caja_externa_id || 'N/A'}
            </Typography>
          </Tooltip>
        </TableCell>

        {/* ✅ NUEVO: esconder Initial Date cuando showDocsColumn */}
        {!showDocsColumn && (
          <TableCell sx={{ whiteSpace: 'nowrap' }} title={loadingDateTitle}>{loadingDateToShow}</TableCell>
        )}

        <TableCell>
          {(() => {
            const currentStatus = trip.status || 'In Transit';
            let chipColor = 'default';
            if (currentStatus === 'Completed') chipColor = 'success';
            else if (currentStatus === 'In Transit') chipColor = 'warning';
            else if (currentStatus === 'Almost Over') chipColor = 'primary';
            else if (currentStatus === 'Cancelled') chipColor = 'error';
            else if (currentStatus === 'In Coming') chipColor = 'info';
            return (<Chip label={currentStatus} color={chipColor} size="small" />);
          })()}
        </TableCell>

        {/* ✅ NUEVO: esconder Return Date cuando showDocsColumn */}
        {!showDocsColumn && (
          <TableCell sx={{ whiteSpace: 'nowrap' }} title={returnDateTitle}>{returnDateForDisplay}</TableCell>
        )}

        {/* ✅ NUEVO: columna Documentos Faltantes SOLO en Up Coming / Despacho */}
        {showDocsColumn && (
          <TableCell align="center">
            {documentosFaltantes > 0 ? (
              <Tooltip title={documentosFaltantesLista.join(', ')} arrow>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                  <WarningIcon color="error" fontSize="small" />
                  <Typography color="error" fontWeight={600}>
                    {documentosFaltantes}
                  </Typography>
                </Box>
              </Tooltip>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                <CheckCircleOutlineIcon color="success" fontSize="small" />
                <Typography color="success.main" fontWeight={600}>
                  0
                </Typography>
              </Box>
            )}
          </TableCell>

        )}

        <TableCell>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.8 }}>

            {/* ✅ Mantengo tu botón, pero con reglas: 
                - En completados: Ver
                - En despacho: NO editar (lo ocultamos)
                - En Up Coming: Editar */}
            {showViewButtonCompleted && (
              <Button size="small" variant="outlined" onClick={() => onEdit(trip.trip_id)}>
                Ver
              </Button>
            )}

            {canShowEditButton && (
              <Button size="small" variant="outlined" onClick={() => onEdit(trip.trip_id)}>
                Editar
              </Button>
            )}
            {isUpcomingTab && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => onDelete(trip.trip_id, trip.trip_number)}
              >
                Eliminar
              </Button>
            )}


            {/* ✅ NUEVO: botón SALIDA solo en despacho y solo si faltantes = 0 */}
            {isDespachoTab && (
              <Tooltip
                title={canSalida ? 'Listo para salida' : `No puedes dar salida: faltan ${documentosFaltantes} documento(s)`}
                arrow
              >
                <span>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    disabled={!canSalida}
                    onClick={() => onSalida && onSalida(trip.trip_id, trip.trip_number)}
                    sx={{ textTransform: 'none', fontWeight: 800 }}
                  >
                    SALIDA
                  </Button>
                </span>
              </Tooltip>
            )}
          </Box>
        </TableCell>

        {isCompletedTab && (
          <TableCell>
            <Button size="small" variant="contained" color="secondary" onClick={() => onSummary(trip.trip_id)}>
              Resumen
            </Button>
          </TableCell>
        )}

        {isAdmin && isCompletedTab && (
          <TableCell>
            <Button size="small" variant="outlined" color="warning" onClick={() => onReactivate(trip.trip_id, trip.trip_number)}>
              Reactivar
            </Button>
          </TableCell>
        )}
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={collapseColSpan}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1, padding: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fafafa' }}>

              {!isUpcomingTab && !isDespachoTab && (
                <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#fff', border: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#424242' }}>
                    Acciones Rápidas:
                  </Typography>
                  <Stack direction="row" spacing={2}>

                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      startIcon={<HourglassBottomIcon />}
                      onClick={() => onAlmostOver(trip.trip_id, trip.trip_number)}
                      disabled={trip.status === 'Almost Over'}
                    >
                      Marcar Almost Over
                    </Button>

                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircleOutlineIcon />}
                      onClick={() => onFinalize(trip.trip_id, trip.trip_number)}
                    >
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
                    if (etapa.stageType === 'emptyMileage') {
                      return (
                        <Grid item key={etapa.trip_stage_id} xs={12} sm={6} md={4}>
                          <Paper elevation={0} sx={{ border: '1px dashed #90caf9', bgcolor: '#e3f2fd', p: 2, height: '100%', borderRadius: 2 }}>
                            <Stack spacing={1}>
                              <Typography sx={{ fontWeight: 'bold', color: '#1565c0' }}>E{etapa.stage_number}: Etapa Vacía (Empty)</Typography>
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
                    } else {
                      return (
                        <Grid item key={etapa.trip_stage_id} xs={12} sm={6} md={4}>
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
                                    <Chip 
                                        label={`CI: ${etapa.ci_number}`} 
                                        size="small" 
                                        sx={{ height: 20, fontSize:'0.7rem', fontWeight: 'bold' }} 
                                    />
                                  )}
                                </Stack>
                              </Box>

                              <Divider />

                              <Box>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <RoomIcon fontSize="small" color="primary" />
                                  <Typography variant="body2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {etapa.origin} 
                                    <span style={{color:'#999'}}>➝</span> 
                                    {etapa.destination}
                                  </Typography>
                                </Stack>
                              </Box>

                              <Grid container spacing={1}>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary" display="block">Fecha Carga</Typography>
                                  <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <CalendarTodayIcon sx={{ fontSize: 14, color: '#757575' }} />
                                    <Typography variant="body2">
                                      {etapa.loading_date ? dayjs(etapa.loading_date).format("DD/MM/YY") : '--'}
                                    </Typography>
                                  </Stack>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Fecha Entrega
                                  </Typography>
                                  
                                  <Stack direction="row" alignItems="center" spacing={1.5}>
                                    
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                      <CalendarTodayIcon sx={{ fontSize: 14, color: '#757575' }} />
                                      <Typography variant="body2" fontWeight={500}>
                                        {etapa.delivery_date ? dayjs(etapa.delivery_date).format("DD/MM/YY") : '--'}
                                      </Typography>
                                    </Stack>

                                    {etapa.time_of_delivery && (
                                      <Stack 
                                        direction="row" 
                                        alignItems="center" 
                                        spacing={0.5} 
                                        sx={{ 
                                            bgcolor: '#f1f8ff',      
                                            color: '#0288d1',        
                                            border: '1px solid #b3e5fc', 
                                            borderRadius: 1,
                                            px: 0.8,                 
                                            py: 0.2                  
                                        }}
                                      >
                                        <AccessTimeIcon sx={{ fontSize: 12 }} />
                                        <Typography variant="caption" fontWeight={700} sx={{ lineHeight: 1 }}>
                                          {formatTime(etapa.time_of_delivery)}
                                        </Typography>
                                      </Stack>
                                    )}
                                  </Stack>
                                </Grid>
                              </Grid>

                              {/* {etapa.ci_number && (
                                <Box sx={{ bgcolor: '#f5f5f5', p: 0.5, borderRadius: 1, textAlign: 'center' }}>
                                  <Typography variant="caption" fontWeight={600} color="text.primary">
                                    CI: {etapa.ci_number}
                                  </Typography>
                                </Box>
                              )} */}

                              {etapa.comments && (
                                <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#666', borderLeft: '2px solid #ccc', pl: 1 }}>
                                  "{etapa.comments}"
                                </Typography>
                              )}

                              {Array.isArray(etapa.stops_in_transit) && etapa.stops_in_transit.length > 0 && (
                                <Box sx={{ mt: 1, borderTop: '1px dashed #ccc', pt: 1 }}>
                                  <Typography variant="caption" fontWeight={700} color="text.primary">Paradas Adicionales:</Typography>
                                  <ul style={{ margin: '4px 0 0 0', paddingLeft: '20px', fontSize: '0.8rem' }}>
                                    {etapa.stops_in_transit.map((stop, i) => (
                                      <li key={i} style={{ marginBottom: 4 }}>
                                        <span style={{ marginRight: 6 }}>{stop.location}</span>

                                        {stop.time_of_delivery && (
                                            <Chip
                                                icon={<AccessTimeIcon sx={{ fontSize: '12px !important' }} />}
                                                label={formatTime(stop.time_of_delivery)}
                                                size="small"
                                                sx={{ 
                                                    height: 20, 
                                                    fontSize: '0.7rem', 
                                                    bgcolor: '#f5f5f5', 
                                                    border: '1px solid #e0e0e0',
                                                    mr: 0.5
                                                }}
                                            />
                                        )}

                                        {stop.bl_firmado_doc && (
                                            <Chip
                                                label="BL"
                                                size="small"
                                                component="a"
                                                href={getDocumentUrl(stop.bl_firmado_doc.path_servidor_real || stop.bl_firmado_doc.nombre_archivo)}
                                                target="_blank"
                                                clickable
                                                color="primary"
                                                variant="outlined"
                                                sx={{ height: 20, fontSize: '0.7rem', cursor: 'pointer' }}
                                            />
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </Box>
                              )}

                              {Array.isArray(etapa.documentos_adjuntos) && etapa.documentos_adjuntos.length > 0 && (
                                <Box sx={{ mt: 'auto', pt: 1 }}>
                                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {etapa.documentos_adjuntos.map(doc => (
                                      <Chip
                                        key={doc.document_id}
                                        label={doc.tipo_documento}
                                        size="small"
                                        component="a"
                                        href={getDocumentUrl(doc.path_servidor_real || doc.nombre_archivo)}
                                        target="_blank"
                                        clickable
                                        color="default"
                                        variant="outlined"
                                        sx={{ fontSize: '0.75rem' }}
                                      />
                                    ))}
                                  </Stack>
                                </Box>
                              )}
                            </Stack>
                          </Paper>
                        </Grid>
                      );
                    }
                  })}
                </Grid>
              ) : (
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', textAlign: 'center', py: 2 }}>
                  No hay información detallada de etapas para este viaje.
                </Typography>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};
