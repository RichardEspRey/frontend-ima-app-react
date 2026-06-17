import React, { useState } from 'react';
import {
  TableCell, TableRow, Button, Typography, Tooltip, IconButton, Collapse, Box, Chip, Stack
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningIcon from '@mui/icons-material/Warning';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import dayjs from 'dayjs';
import 'dayjs/locale/es';
import updateLocale from 'dayjs/plugin/updateLocale';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import Swal from 'sweetalert2';

import { TripExpandedDetails } from './TripRow/TripExpandedDetails';

dayjs.extend(updateLocale);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(localizedFormat);
dayjs.locale('es');

export const TripRow = ({
  trip, isCompletedTab, onEdit, onFinalize, onAlmostOver, onReactivate, isAdmin, getDocumentUrl, onSummary,
  showDocsColumn = false, isDespachoTab = false, documentosFaltantes = 0, documentosFaltantesLista = [],
  onSalida, colSpanOverride, isUpcomingTab = false, isEnRutaTab = false, onDelete,
}) => {

  const [open, setOpen] = useState(false);

  let departureDateToShow = '-';
  let departureDateTitle = 'Fecha de salida no disponible';

  if (Array.isArray(trip.etapas) && trip.etapas.length > 0) {
      const primeraEtapa = trip.etapas[0];
      if (primeraEtapa.date_of_departure) {
          departureDateToShow = dayjs(primeraEtapa.date_of_departure).format("DD/MM/YY");
          departureDateTitle = `Fecha de Salida (1ª Etapa): ${departureDateToShow}`;
      } else if (primeraEtapa.loading_date) {
          departureDateToShow = dayjs(primeraEtapa.loading_date).format("DD/MM/YY");
          departureDateTitle = `Fecha de Salida (Histórico): ${departureDateToShow}`;
      } else if (primeraEtapa.creation_date) {
          departureDateToShow = dayjs(primeraEtapa.creation_date).format("DD/MM/YY");
          departureDateTitle = `Fecha de Creación: ${departureDateToShow}`;
      }
  }

  const returnDateForDisplay = trip.return_date ? dayjs(trip.return_date).format('dddd D, YYYY') : '- ';
  const returnDateTitle = trip.return_date ? `Fecha de Regreso: ${dayjs(trip.return_date).format('dddd D [de] MMMM [de] YYYY')}` : 'Fecha de regreso no asignada';

  const renderDriverHover = () => {
      if (!isEnRutaTab) return '';
      return (
          <>
            <Typography color="inherit" sx={{ fontWeight: 'bold', mb: 0.5 }}>Detalles del Conductor</Typography>
            <Typography variant="body2" component="div">
                <b>Nombre:</b> {trip.driver_nombre || 'N/A'}<br/>
                <b>Tel. MEX:</b> {trip.driver_phone_mex || 'N/A'}<br/>
                <b>Tel. USA:</b> {trip.driver_phone_usa || 'N/A'}
            </Typography>
            {trip.driver_second_nombre && (
                <Typography variant="body2" component="div" sx={{ mt: 1, pt: 1, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
                    <b>Segundo Conductor:</b> {trip.driver_second_nombre}<br/>
                    <b>Tel. MEX:</b> {trip.driver_second_phone_mex || 'N/A'}<br/>
                    <b>Tel. USA:</b> {trip.driver_second_phone_usa || 'N/A'}
                </Typography>
            )}
          </>
      );
  };

  const renderTruckHover = () => {
      if (!isEnRutaTab) return '';
      return (
          <>
            <Typography color="inherit" sx={{ fontWeight: 'bold', mb: 0.5 }}>Detalles del Camión</Typography>
            <Typography variant="body2" component="div">
                <b>Unidad:</b> {trip.truck_unidad || 'N/A'}<br/>
                <b>VIN:</b> {trip.truck_vin || 'N/A'}<br/>
                <b>Placas (MEX):</b> {trip.truck_placa_mex || 'N/A'}<br/>
                <b>Placas (USA):</b> {trip.truck_placa_eua || 'N/A'}
            </Typography>
          </>
      );
  };

  const trailerTooltipContent = (
    <>
      <Typography color="inherit" sx={{ fontWeight: 'bold', mb: 0.5 }}>Detalles del Tráiler</Typography>
      {trip.caja_id && (
        <Typography variant="body2" component="div">
            <b>Tipo:</b> Interno<br />
            <b>Número de caja:</b> {trip.caja_no_caja || 'N/A'}<br />
            <b>Placas:</b> {trip.caja_placa || 'N/A'}<br/> 
            <b>ID Interno:</b> {trip.caja_id}
        </Typography>
      )}
      {trip.caja_externa_id && (
        <Typography variant="body2" component="div">
            <b>Tipo:</b> Externo<br />
            <b>Número de caja:</b> {trip.caja_externa_no_caja || 'N/A'}<br />
            <b>Placas:</b> {trip.caja_externa_placas || 'N/A'}
        </Typography>
      )}
      {!trip.caja_id && !trip.caja_externa_id && <Typography variant="body2">No hay detalles adicionales.</Typography>}
    </>
  );

  // ==========================================
  // 🚨 FUNCIÓN PARA COPIAR AL PORTAPAPELES
  // ==========================================
  const handleCopyToClipboard = () => {
      const textToCopy = `
=== DETALLES DEL VIAJE ===
Trip Number: ${trip.trip_number || 'N/A'}
Status: ${trip.status || 'N/A'}

[ CONDUCTOR ]
Nombre: ${trip.driver_nombre || 'N/A'}
Teléfono MEX: ${trip.driver_phone_mex || 'N/A'}
Teléfono USA: ${trip.driver_phone_usa || 'N/A'}
${trip.driver_second_nombre ? `\n[ SEGUNDO CONDUCTOR ]\nNombre: ${trip.driver_second_nombre}\nTeléfono MEX: ${trip.driver_second_phone_mex || 'N/A'}\nTeléfono USA: ${trip.driver_second_phone_usa || 'N/A'}` : ''}

[ CAMIÓN ]
Unidad: ${trip.truck_unidad || 'N/A'}
Placas MEX: ${trip.truck_placa_mex || 'N/A'}
Placas USA: ${trip.truck_placa_eua || 'N/A'}
VIN: ${trip.truck_vin || 'N/A'}

[ REMOLQUE / TRAILER ]
${trip.caja_id ? `Tipo: Interno\nNúmero de Caja: ${trip.caja_no_caja || 'N/A'}\nPlacas: ${trip.caja_placa || 'N/A'}` : ''}
${trip.caja_externa_id ? `Tipo: Externo\nNúmero de Caja: ${trip.caja_externa_no_caja || 'N/A'}\nPlacas: ${trip.caja_externa_placas || 'N/A'}` : ''}
${(!trip.caja_id && !trip.caja_externa_id) ? 'Sin tráiler asignado' : ''}
      `.trim();

      navigator.clipboard.writeText(textToCopy).then(() => {
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Información copiada al portapapeles', showConfirmButton: false, timer: 2000 });
      }).catch(err => {
          console.error('Error copiando al portapapeles:', err);
      });
  };

  const canShowEditButton = !!onEdit && !isCompletedTab && !isDespachoTab; 
  const showViewButtonCompleted = !!onEdit && isCompletedTab;             
  const canSalida = isDespachoTab && documentosFaltantes === 0;
  const collapseColSpan = typeof colSpanOverride === 'number' ? colSpanOverride : 11;

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} hover>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>

        <TableCell component="th" scope="row">
          {/* <Box sx={{ whiteSpace: 'nowrap' }}>{trip.trip_number}</Box> */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" fontWeight={600} sx={{ whiteSpace: 'nowrap' }}>
                {trip.trip_number}
            </Typography>
            
            {trip.etapas?.[0]?.stageType === 'emptyMileage' && (
                <Chip 
                    label="In. V." 
                    size="small" 
                    sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: '#e0f2fe', color: '#0284c7' }} 
                />
            )}
        </Box>
        </TableCell>

        <TableCell>
          <Tooltip title={renderDriverHover()} arrow placement="top">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, cursor: isEnRutaTab ? 'pointer' : 'default', borderBottom: isEnRutaTab ? '1px dotted #ccc' : 'none', width: 'fit-content' }}>
                <Typography variant="body2" component="span" noWrap>{trip.driver_nombre || (trip.driver_id ? `ID: ${trip.driver_id}` : '-')}</Typography>
                {trip.driver_second_nombre && <Typography variant="body2" component="span" noWrap>{trip.driver_second_nombre}</Typography>}
              </Box>
          </Tooltip>
        </TableCell>

        <TableCell>
            <Tooltip title={renderTruckHover()} arrow placement="top">
                <Typography component="span" sx={{ cursor: isEnRutaTab ? 'pointer' : 'default', borderBottom: isEnRutaTab ? '1px dotted #ccc' : 'none' }}>
                    {trip.truck_unidad || trip.truck_id || '-'}
                </Typography>
            </Tooltip>
        </TableCell>

        <TableCell>
          <Tooltip title={trailerTooltipContent} arrow>
            <Typography component="span" sx={{ cursor: 'pointer', borderBottom: '1px dotted #ccc' }}>
              {trip.caja_no_caja || trip.caja_id || trip.caja_externa_no_caja || trip.caja_externa_id || 'N/A'}
            </Typography>
          </Tooltip>
        </TableCell>

        {!showDocsColumn && <TableCell sx={{ whiteSpace: 'nowrap' }} title={departureDateTitle}>{departureDateToShow}</TableCell>}

        <TableCell>
          {(() => {
            const currentStatus = trip.status || 'In Transit';
            let chipColor = 'default';
            if (currentStatus === 'Completed') chipColor = 'success';
            else if (currentStatus === 'In Transit') chipColor = 'warning';
            else if (currentStatus === 'Almost Over') chipColor = 'primary';
            else if (currentStatus === 'Cancelled') chipColor = 'error';
            else if (currentStatus === 'In Coming') chipColor = 'info';
            return (<Chip label={currentStatus} color={chipColor} size="small" sx={{ fontWeight: 600 }}/>);
          })()}
        </TableCell>

        {!showDocsColumn && <TableCell sx={{ whiteSpace: 'nowrap' }} title={returnDateTitle}>{returnDateForDisplay}</TableCell>}

        {showDocsColumn && (
          <TableCell align="center">
            {documentosFaltantes > 0 ? (
              <Tooltip title={documentosFaltantesLista.join(', ')} arrow>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                  <WarningIcon color="error" fontSize="small" />
                  <Typography color="error" fontWeight={600}>{documentosFaltantes}</Typography>
                </Box>
              </Tooltip>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5 }}>
                <CheckCircleOutlineIcon color="success" fontSize="small" />
                <Typography color="success.main" fontWeight={600}>0</Typography>
              </Box>
            )}
          </TableCell>
        )}

        {isEnRutaTab && (
            <TableCell align="center">
                <Tooltip title="Copiar Información de Ruta" arrow>
                    <IconButton color="primary" onClick={handleCopyToClipboard} size="small" sx={{ bgcolor: 'rgba(25, 118, 210, 0.08)', '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.2)' } }}>
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </TableCell>
        )}

        <TableCell>
          <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.8 }}>
            {showViewButtonCompleted && <Button size="small" variant="outlined" onClick={() => onEdit(trip.trip_id)}>Ver</Button>}
            {canShowEditButton && <Button size="small" variant="outlined" onClick={() => onEdit(trip.trip_id)}>Editar</Button>}
            {isUpcomingTab && <Button size="small" variant="outlined" color="error" onClick={() => onDelete(trip.trip_id, trip.trip_number)}>Eliminar</Button>}
            {isDespachoTab && (
              <Tooltip title={canSalida ? 'Listo para salida' : `No puedes dar salida: faltan ${documentosFaltantes} documento(s)`} arrow>
                <span>
                  <Button size="small" variant="contained" color="primary" disabled={!canSalida} onClick={() => onSalida && onSalida(trip.trip_id, trip.trip_number)} sx={{ textTransform: 'none', fontWeight: 800 }}>SALIDA</Button>
                </span>
              </Tooltip>
            )}
          </Box>
        </TableCell>

        {isCompletedTab && <TableCell><Button size="small" variant="contained" color="secondary" onClick={() => onSummary(trip.trip_id)}>Resumen</Button></TableCell>}
        {isAdmin && (isCompletedTab || isEnRutaTab) && <TableCell><Button size="small" variant="outlined" color="warning" onClick={() => onReactivate(trip.trip_id, trip.trip_number)}>Reactivar</Button></TableCell>}
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={collapseColSpan}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <TripExpandedDetails 
              trip={trip} 
              isUpcomingTab={isUpcomingTab} 
              isDespachoTab={isDespachoTab} 
              onAlmostOver={onAlmostOver} 
              onFinalize={onFinalize} 
              getDocumentUrl={getDocumentUrl} 
            />
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};