import React, { useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, 
    Button, Typography, Tooltip, IconButton, Collapse, Box, Grid, Chip, Link as MuiLink, Stack,
    Paper
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import updateLocale from 'dayjs/plugin/updateLocale';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import localizedFormat from 'dayjs/plugin/localizedFormat';

// Iconos para acciones dentro del dropdown
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HourglassBottomIcon from '@mui/icons-material/HourglassBottom';

dayjs.extend(updateLocale);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(localizedFormat);
dayjs.locale('es');
// ... (Configuración de locale dayjs se mantiene igual) ...

export const TripRow = ({
    trip,
    isCompletedTab, // Nueva prop para saber el contexto
    onEdit,
    onFinalize,
    onAlmostOver,
    onReactivate,
    isAdmin,
    getDocumentUrl,
    onSummary
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

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} hover>
                <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row"><Box sx={{ whiteSpace: 'nowrap' }}>{trip.trip_number}</Box></TableCell>
                
                {/* Driver */}
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

                <TableCell sx={{ whiteSpace: 'nowrap' }} title={loadingDateTitle}>{loadingDateToShow}</TableCell>

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

                <TableCell sx={{ whiteSpace: 'nowrap' }} title={returnDateTitle}>{returnDateForDisplay}</TableCell>

                {/* ACCIONES PRINCIPALES */}
                <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.5 }}>
                        <Button size="small" variant="outlined" onClick={() => onEdit(trip.trip_id)}>
                            {isCompletedTab ? 'Ver' : 'Editar'}
                        </Button>
                        {/* NOTA: Los botones Almost Over y Finalizar se movieron al collapse si es activo */}
                    </Box>
                </TableCell>

                <TableCell>
                    <Button size="small" variant="contained" color="secondary" onClick={() => onSummary(trip.trip_id)}>
                        Resumen
                    </Button>
                </TableCell>

                {/* Reactivar solo en tab completados y si es admin */}
                {isAdmin && isCompletedTab && (
                    <TableCell>
                        <Button size="small" variant="outlined" color="warning" onClick={() => onReactivate(trip.trip_id, trip.trip_number)}>
                            Reactivar
                        </Button>
                    </TableCell>
                )}
            </TableRow>

            {/* FILA EXPANDIDA */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, padding: 1, border: '1px solid rgba(224, 224, 224, 1)', borderRadius: '4px' }}>
                            
                            {/* --- BARRA DE ACCIONES PARA VIAJES ACTIVOS --- */}
                            {!isCompletedTab && (
                                <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: '#f1f8e9', border: '1px solid #c5e1a5', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#33691e' }}>
                                        Acciones de Gestión de Viaje:
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

                            <Typography variant="h6" gutterBottom component="div" sx={{ fontSize: '1rem' }}>
                                Detalles de Etapas y Documentos
                            </Typography>

                            {/* Renderizado de Etapas (Igual que antes) */}
                            {Array.isArray(trip.etapas) && trip.etapas.length > 0 ? (
                                <Grid container spacing={2} sx={{ fontSize: '0.85rem' }}>
                                    {trip.etapas.map((etapa) => {
                                        if (etapa.stageType === 'emptyMileage') {
                                            return (
                                                <Grid item key={etapa.trip_stage_id} xs={12} sm={6} md={4}>
                                                    <Box sx={{ border: '1px solid #90caf9', backgroundColor: '#e3f2fd', padding: '12px', borderRadius: '4px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                        <Typography sx={{ fontWeight: 'bold', fontSize: '1em', color: '#1565c0' }}>E{etapa.stage_number}: Etapa Vacía</Typography>
                                                        <Box sx={{ mt: 1.5 }}>
                                                            <Typography variant="body2"><strong>Millas PC*Miler:</strong> {etapa.millas_pcmiller || 'N/A'}</Typography>
                                                            <Typography variant="body2"><strong>Millas Prácticas:</strong> {etapa.millas_pcmiller_practicas || 'N/A'}</Typography>
                                                            {etapa.comments && <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>{etapa.comments}</Typography>}
                                                        </Box>
                                                    </Box>
                                                </Grid>
                                            );
                                        } else {
                                            return (
                                                <Grid item key={etapa.trip_stage_id} xs={12} sm={6} md={4}>
                                                    <Box sx={{ border: '1px solid #eee', padding: '8px', borderRadius: '4px', height: '100%' }}>
                                                        <Typography>
                                                            <strong>E{etapa.stage_number}:</strong> {etapa.origin} &rarr; {etapa.destination} ({etapa.travel_direction})
                                                        </Typography>
                                                        {etapa.ci_number && <Typography sx={{ fontSize: '0.9em', color: '#555' }}>CI: {etapa.ci_number}</Typography>}
                                                        
                                                        {/* Paradas */}
                                                        {Array.isArray(etapa.stops_in_transit) && etapa.stops_in_transit.length > 0 && (
                                                            <Box sx={{ mt: 1, borderTop: '1px dashed #ccc', pt: 1 }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Paradas:</Typography>
                                                                <ul style={{ margin: '0', paddingLeft: '15px' }}>
                                                                    {etapa.stops_in_transit.map((stop, i) => (
                                                                        <li key={i}>{stop.location}</li>
                                                                    ))}
                                                                </ul>
                                                            </Box>
                                                        )}

                                                        {/* Documentos */}
                                                        {Array.isArray(etapa.documentos_adjuntos) && etapa.documentos_adjuntos.length > 0 && (
                                                            <Box sx={{ mt: 1, borderTop: '1px dashed #ccc', pt: 1 }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Docs:</Typography>
                                                                <ul style={{ margin: '0', padding: '0', listStyle: 'none' }}>
                                                                    {etapa.documentos_adjuntos.map(doc => (
                                                                        <li key={doc.document_id}>
                                                                            <MuiLink href={getDocumentUrl(doc.path_servidor_real || doc.nombre_archivo)} target="_blank">
                                                                                {doc.tipo_documento}
                                                                            </MuiLink>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Grid>
                                            );
                                        }
                                    })}
                                </Grid>
                            ) : (
                                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>Sin etapas registradas</Typography>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};