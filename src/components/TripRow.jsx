import React, { useState, useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, Paper,
    Button, Typography, Tooltip, IconButton, Collapse, Box, Grid, Chip, Link as MuiLink
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import updateLocale from 'dayjs/plugin/updateLocale';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import localizedFormat from 'dayjs/plugin/localizedFormat';

// Re-extender dayjs y configurar locale (Necesario ya que este componente lo usa intensamente)
dayjs.extend(updateLocale);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(localizedFormat);
dayjs.locale('es');
dayjs.updateLocale('es', {
    months: [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
        "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ],
    weekdays: [
        "Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"
    ],
    weekdaysShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    weekdaysMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
    longDateFormat: {
        LT: 'h:mm A',
        LTS: 'h:mm:ss A',
        L: 'DD/MM/YYYY',
        LL: 'D [de] MMMM [de] YYYY',
        LLL: 'D [de] MMMM [de] YYYY h:mm A',
        LLLL: 'dddd, D [de] MMMM [de] YYYY h:mm A'
    },
    meridiem: (hour) => {
        if (hour < 12) {
            return 'AM';
        } else {
            return 'PM';
        }
    }
});


export const TripRow = ({
    trip,
    onEdit,
    onFinalize,
    onAlmostOver,
    onReactivate,
    isAdmin,
    getDocumentUrl,
    onSummary
}) => {

    const [open, setOpen] = useState(false);

    console.log(trip)

    let loadingDateToShow = '-';
    let loadingDateTitle = 'Fecha de carga no disponible';

    if (Array.isArray(trip.etapas) && trip.etapas.length > 0 && trip.etapas[0].loading_date) {
        loadingDateToShow = dayjs(trip.etapas[0].loading_date).format("DD/MM/YY");
        loadingDateTitle = `Fecha de Carga (1ª Etapa): ${loadingDateToShow}`;
    } else if (trip.etapas && trip.etapas.length > 0) {
        loadingDateTitle = 'Fecha de carga (1ª Etapa) no especificada';
    }

    const returnDateForDisplay = trip.return_date
        ? dayjs(trip.return_date).format('dddd D, YYYY')
        : '- ';

    const returnDateTitle = trip.return_date
        ? `Fecha de Regreso: ${dayjs(trip.return_date).format('dddd D [de] MMMM [de] YYYY')}` // Tooltip completo
        : 'Fecha de regreso no asignada';

    const trailerTooltipContent = (
        <>
            <Typography color="inherit" sx={{ fontWeight: 'bold', mb: 0.5 }}>Detalles del Tráiler</Typography>
            {/* Lógica para mostrar info de caja interna o externa */}
            {trip.caja_id && (
                <Typography variant="body2" component="div">
                    <b>Tipo:</b> Interno<br />
                    <b>Número:</b> {trip.caja_no_caja || 'N/A'}<br />
                    <b>ID:</b> {trip.caja_id}
                </Typography>
            )}
            {trip.caja_externa_id && (
                <Typography variant="body2" component="div">
                    <b>Tipo:</b> Externo<br />
                    <b>Número de caja:</b> {trip.caja_externa_no_caja || 'N/A'}<br />
                    <b>Número de vin:</b> {trip.caja_externa_no_vin || 'N/A'}<br />
                    <b>Modelo:</b> {trip.caja_externa_modelo || 'N/A'}<br />
                    <b>Año:</b> {trip.caja_externa_anio || 'N/A'}<br />
                    <b>Placas:</b> {trip.caja_externa_placas || 'N/A'}<br />
                    <b>Estado:</b> {trip.caja_externa_estado || 'N/A'}<br />
                </Typography>
            )}
            {/* Mensaje por si no hay datos */}
            {!trip.caja_id && !trip.caja_externa_id && (
                <Typography variant="body2">No hay detalles adicionales.</Typography>
            )}


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
                <TableCell component="th" scope="row">
                    <Box sx={{ whiteSpace: 'nowrap' }}>
                        {trip.trip_number}
                    </Box>
                </TableCell>
                {/* Driver(s) Cell */}
                <TableCell>
                    {trip.driver_second_nombre ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="body2" component="span" noWrap title={trip.driver_nombre || 'Principal'}>
                                    {trip.driver_nombre || 'N/A'}
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <Typography variant="body2" component="span" noWrap title={trip.driver_second_nombre}>
                                    {trip.driver_second_nombre}
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        trip.driver_nombre || trip.driver_id || '-'
                    )}
                </TableCell>
                {/* Truck Cell */}
                <TableCell>{trip.truck_unidad || trip.truck_id || '-'}</TableCell>
                {/* Trailer Cell */}
                <TableCell>
                    <Tooltip title={trailerTooltipContent} arrow>
                        <Typography component="span" >
                            {trip.caja_no_caja || trip.caja_id || trip.caja_externa_no_caja || trip.caja_externa_id || trip.caja_externa_modelo || 'N/A'}
                        </Typography>
                    </Tooltip>
                </TableCell>

                {/* Initial Date Cell (Loading Date of First Stage) */}
                <TableCell sx={{ whiteSpace: 'nowrap' }} title={loadingDateTitle}>
                    {loadingDateToShow}
                </TableCell>

                {/* Status Cell */}
                <TableCell>
                    {(() => {
                        const currentStatus = trip.status || 'In Transit';
                        let chipColor = 'default';
                        if (currentStatus === 'Completed') { chipColor = 'success'; }
                        else if (currentStatus === 'In Transit') { chipColor = 'warning'; }
                        else if (currentStatus === 'Almost Over') { chipColor = 'primary'; }
                        else if (currentStatus === 'Cancelled') { chipColor = 'error'; }
                        else if (currentStatus === 'In Coming') { chipColor = 'info'; }
                        return (<Chip label={currentStatus} color={chipColor} size="small" />);
                    })()}
                </TableCell>

                {/* Return Date Cell */}
                <TableCell sx={{ whiteSpace: 'nowrap' }} title={returnDateTitle}>
                    {returnDateForDisplay}
                </TableCell>

                {/* Actions Cell */}
                <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.5, whiteSpace: 'nowrap' }}>
                        {(() => {
                            const currentStatus = trip.status || 'In Transit';
                            let label = 'Editar';
                            if (currentStatus === 'Completed') { label = 'Ver'; }
                            else { label = "Editar" }
                            return (<Button size="small" variant="outlined" onClick={() => onEdit(trip.trip_id)}>{label}</Button>);
                        })()}
                        {/* NUEVO BOTÓN: Casi Finalizar */}
                        <Button
                            size="small"
                            variant="outlined"
                            color="primary"
                            onClick={() => onAlmostOver(trip.trip_id, trip.trip_number)}
                            disabled={trip.status === 'Completed' || trip.status === 'Cancelled' || trip.status === 'Almost Over'}
                        >Almost Over</Button>
                        {/* FIN NUEVO BOTÓN */}
                        <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => onFinalize(trip.trip_id, trip.trip_number)}
                            disabled={trip.status === 'Completed' || trip.status === 'Cancelled'}
                        >Finalizar</Button>
                    </Box>
                </TableCell>

                {/* Resumen Cell */}
                <TableCell>
                    <Button
                        size="small"
                        variant="contained"
                        color="secondary"
                        onClick={() => onSummary(trip.trip_id)}
                    >
                        Resumen
                    </Button>
                </TableCell>

                {isAdmin && (
                    <TableCell>
                        <Button
                            size="small"
                            variant="outlined"
                            color="warning"
                            onClick={() => onReactivate(trip.trip_id, trip.trip_number)}
                            disabled={trip.status !== 'Cancelled' && trip.status !== 'Completed'}
                        >
                            Reactivar viaje
                        </Button>
                    </TableCell>
                )}
            </TableRow>
            <TableRow>
                <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={isAdmin ? 11 : 10}
                >

                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, padding: 1, border: '1px solid rgba(224, 224, 224, 1)', borderRadius: '4px' }}>
                            <Typography variant="h6" gutterBottom component="div" sx={{ fontSize: '1rem' }}>
                                Detalles de Etapas y Documentos
                            </Typography>

                            {Array.isArray(trip.etapas) && trip.etapas.length > 0 ? (
                                <Grid container spacing={2} sx={{ fontSize: '0.85rem' }}>
                                    {trip.etapas.map((etapa) => {


                                        if (etapa.stageType === 'emptyMileage') {

                                            return (
                                                <Grid item key={etapa.trip_stage_id} xs={12} sm={6} md={4}>
                                                    <Box sx={{
                                                        border: '1px solid #90caf9',
                                                        backgroundColor: '#e3f2fd',
                                                        padding: '12px',
                                                        borderRadius: '4px',
                                                        height: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column'
                                                    }}>
                                                        <Typography sx={{ fontWeight: 'bold', fontSize: '1em', color: '#1565c0' }}>
                                                            E{etapa.stage_number}: Etapa de Millaje Vacío
                                                        </Typography>

                                                        <Box sx={{ mt: 1.5, flexGrow: 1 }}>
                                                            <Typography variant="body2" sx={{ mb: 0.5 }}>
                                                                <strong>Millas PC*Miler:</strong> {etapa.millas_pcmiller || 'N/A'}
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                <strong>Millas Prácticas:</strong> {etapa.millas_pcmiller_practicas || 'N/A'}
                                                            </Typography>

                                                            {typeof etapa.comments === 'string' && etapa.comments.trim() !== '' && (
                                                                <Box sx={{ mt: 1.5, borderTop: '1px dashed #90caf9', pt: 1.5 }}>
                                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>Comentarios:</Typography>
                                                                    <Typography variant="body2" sx={{ fontStyle: 'italic', maxWidth: '300px' }}>
                                                                        {etapa.comments}
                                                                    </Typography>
                                                                </Box>
                                                            )}
                                                        </Box>


                                                    </Box>
                                                </Grid>
                                            );
                                        } else {
                                            // LÓGICA EXISTENTE: Para etapas normales, de cruce, etc.
                                            let tooltipTitle = `Compañía: ${etapa.nombre_compania || '-'}\nBodega Origen: ${etapa.warehouse_origin_name || '-'}\nBodega Destino: ${etapa.warehouse_destination_name || '-'}\nMillas: ${etapa.millas_pcmiller || '-'}`;

                                            if (Array.isArray(etapa.stops_in_transit) && etapa.stops_in_transit.length > 0) {
                                                tooltipTitle += '\n\nParadas en Ruta:';
                                                etapa.stops_in_transit.forEach((stop) => {
                                                    tooltipTitle += `\n- ${stop.location || 'Ubicación desconocida'}`;
                                                });
                                            }

                                            return (
                                                <Grid item key={etapa.trip_stage_id} xs={12} sm={6} md={4}>
                                                    <Box sx={{ border: '1px solid #eee', padding: '8px', borderRadius: '4px', height: '100%' }}>
                                                        <Tooltip title={tooltipTitle} arrow>
                                                            <span>
                                                                <strong>E{etapa.stage_number} ({etapa.stageType?.replace('borderCrossing', 'Cruce').replace('normalTrip', 'Normal') || 'N/A'}):</strong> {etapa.origin} &rarr; {etapa.destination} ({etapa.travel_direction})
                                                            </span>
                                                        </Tooltip>

                                                        {etapa.ci_number && <><br /><span style={{ fontSize: '0.9em', color: '#555' }}>CI: {etapa.ci_number}</span></>}
                                                        <br />
                                                        <span style={{ fontSize: '0.9em', color: '#555' }}>
                                                            Carga: {etapa.loading_date ? dayjs(etapa.loading_date).format("DD/MM/YY") : '-'} |
                                                            Entrega: {etapa.delivery_date
                                                                ? dayjs(etapa.delivery_date).format("DD/MM/YY") +
                                                                (etapa.time_of_delivery
                                                                    ? ' - ' + dayjs(`2000-01-01 ${etapa.time_of_delivery}`).format('h:mm A')
                                                                    : '')
                                                                : '-'
                                                            }
                                                        </span>

                                                        {Array.isArray(etapa.stops_in_transit) && etapa.stops_in_transit.length > 0 && (
                                                            <Box sx={{ mt: 1, borderTop: '1px dashed #ccc', pt: 1, fontSize: '0.9em' }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9em', mb: 0.5 }}>Paradas en Ruta:</Typography>
                                                                <ul style={{ margin: '0', paddingLeft: '15px', listStyleType: 'disc', fontSize: 'inherit' }}>
                                                                    {etapa.stops_in_transit.map((stop, stopIndex) => (
                                                                        <li key={stop.stop_id || `stop-${stopIndex}`} style={{ marginBottom: '2px' }}>
                                                                            {stop.location || 'Ubicación desconocida'}
                                                                            {stop.bl_firmado_doc && (
                                                                                <MuiLink
                                                                                    href={getDocumentUrl(stop.bl_firmado_doc.path_servidor_real || stop.bl_firmado_doc.nombre_archivo)}
                                                                                    target="_blank" rel="noopener noreferrer" sx={{ ml: 0.5 }}
                                                                                    title={`Ver Cita Entrega (${stop.bl_firmado_doc.nombre_archivo})`}
                                                                                >
                                                                                    (BL Firmado)
                                                                                </MuiLink>
                                                                            )}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </Box>
                                                        )}

                                                        {Array.isArray(etapa.documentos_adjuntos) && etapa.documentos_adjuntos.length > 0 && (
                                                            <Box sx={{ mt: 1, borderTop: '1px dashed #ccc', pt: 1 }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9em', mb: 0.5 }}>Documentos:</Typography>
                                                                <ul style={{ margin: '0', padding: '0', listStyleType: 'none', fontSize: 'inherit', display: 'flex', flexWrap: 'wrap' }}>
                                                                    {etapa.documentos_adjuntos.map(doc => (
                                                                        <li key={doc.document_id} style={{ flex: '0 0 calc(50% - 8px)' }}>
                                                                            <MuiLink
                                                                                href={getDocumentUrl(doc.path_servidor_real || doc.nombre_archivo)}
                                                                                target="_blank" rel="noopener noreferrer"
                                                                                title={`Ver ${doc.tipo_documento.replace(/_/g, ' ')} (${doc.nombre_archivo})`}
                                                                                underline="hover" sx={{ fontSize: 'inherit' }}
                                                                            >
                                                                                {doc.tipo_documento.replace(/_/g, ' ')}
                                                                            </MuiLink>
                                                                            {doc.fecha_vencimiento ? ` (V: ${dayjs(doc.fecha_vencimiento).format("DD/MM/YY")})` : ''}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </Box>
                                                        )}

                                                        {typeof etapa.comments === 'string' && etapa.comments.trim() !== '' && (
                                                            <Box sx={{ mt: 2, borderTop: '1px dashed #ccc', pt: 1 }}>
                                                                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9em', mb: 0.5 }}>Comentarios:</Typography>
                                                                <Typography variant="body2" sx={{ fontSize: 'inherit', maxWidth: '320px' }}>
                                                                    {etapa.comments}
                                                                </Typography>
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