import React, { useState, useEffect, useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, TablePagination, TextField, Box, Typography, CircularProgress, Alert,
    Link as MuiLink, Tooltip, IconButton, Collapse, Grid, Chip
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import updateLocale from 'dayjs/plugin/updateLocale';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(updateLocale);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(localizedFormat);

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


import './css/TripAdmin.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

// Componente TripRow
const TripRow = ({ trip, onEdit, onFinalize, onAlmostOver, getDocumentUrl }) => { // MODIFICACIÓN CLAVE: Agregado onAlmostOver
    const [open, setOpen] = useState(false);

    let loadingDateToShow = '-';
    let loadingDateTitle = 'Fecha de carga no disponible';

    if (Array.isArray(trip.etapas) && trip.etapas.length > 0 && trip.etapas[0].loading_date) {
        loadingDateToShow = dayjs(trip.etapas[0].loading_date).format("DD/MM/YY");
        loadingDateTitle = `Fecha de Carga (1ª Etapa): ${loadingDateToShow}`;
    } else if (trip.etapas && trip.etapas.length > 0) {
        loadingDateTitle = 'Fecha de carga (1ª Etapa) no especificada';
    }

    const creationDateForDisplay = trip.creation_date
        ? dayjs(trip.creation_date).format("DD/MM/YY")
        : '-';
    const creationDateTimeTitle = trip.creation_date
        ? `Fecha de Creación: ${dayjs(trip.creation_date).format("DD/MM/YY HH:mm")}`
        : 'Fecha de creación no disponible';
    
    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} hover>
                <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">{trip.trip_number}</TableCell>
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
                                {/* <Chip label="S" size="small" sx={{ height: '18px', fontSize: '0.7rem' }} title="Secundario" color="secondary" /> */}
                            </Box>
                        </Box>
                    ) : (
                        trip.driver_nombre || trip.driver_id || '-'
                    )}
                </TableCell>
                {/* Truck Cell */}
                <TableCell>{trip.truck_unidad || trip.truck_id || '-'}</TableCell>
                {/* Trailer Cell */}
                <TableCell>{trip.caja_no_caja || trip.caja_id || trip.caja_externa_no_caja || trip.caja_externa_id || 'N/A'}</TableCell>
                
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
                        else if (currentStatus === 'Almost Over') { chipColor = 'primary'; } // NUEVA LÍNEA: Color para "Almost Over"
                        else if (currentStatus === 'Cancelled') { chipColor = 'error'; }
                        else if (currentStatus === 'In Coming') { chipColor = 'info'; }
                        return (<Chip label={currentStatus} color={chipColor} size="small" />);
                    })()}
                </TableCell>

                {/* Creation Date Cell */}
                <TableCell sx={{ whiteSpace: 'nowrap' }} title={creationDateTimeTitle}>
                    {creationDateForDisplay}
                </TableCell>

                {/* Actions Cell */}
                <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}> {/* MODIFICACIÓN: Cambiado a column para los botones */}
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
                            variant="outlined" // Puedes usar 'outlined' o 'contained'
                            color="primary" // Puedes elegir otro color como 'secondary' o 'info'
                            onClick={() => onAlmostOver(trip.trip_id, trip.trip_number)}
                            disabled={trip.status === 'Completed' || trip.status === 'Cancelled' || trip.status === 'Almost Over'} // Deshabilitar si ya está finalizado, cancelado o casi finalizado
                            sx={{ fontSize: '0.75rem', mt: 0.5 }} // mt para margen superior si se muestra en columna
                        >Almost Over</Button>
                        {/* FIN NUEVO BOTÓN */}
                        <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => onFinalize(trip.trip_id, trip.trip_number)}
                            disabled={trip.status === 'Completed' || trip.status === 'Cancelled'}
                            sx={{ fontSize: '0.75rem', mt: 0.5 }} // mt para margen superior
                        >Finalizar</Button>
                    </Box>
                </TableCell>
            </TableRow>
            <TableRow>
                {/* Colspan adjusted for the additional column. 1 (expand) + 8 (data columns) = 9 */}
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, padding: 1, border: '1px solid rgba(224, 224, 224, 1)', borderRadius: '4px' }}>
                            <Typography variant="h6" gutterBottom component="div" sx={{ fontSize: '1rem' }}>
                                Detalles de Etapas y Documentos
                            </Typography>

                            {Array.isArray(trip.etapas) && trip.etapas.length > 0 ? (
                                <Grid container spacing={2} sx={{ fontSize: '0.85rem' }}>
                                    {trip.etapas.map((etapa) => {
                                        let tooltipTitle = `Compañía: ${etapa.nombre_compania || '-'}\nBodega Origen: ${etapa.warehouse_origin_name || '-'}\nBodega Destino: ${etapa.warehouse_destination_name || '-'}\nMillas: ${etapa.millas_pcmiller || '-'}`;

                                        if (Array.isArray(etapa.stops_in_transit) && etapa.stops_in_transit.length > 0) {
                                            tooltipTitle += '\n\nParadas en Ruta:';
                                            etapa.stops_in_transit.forEach((stop, i) => {
                                                tooltipTitle += `\n- ${stop.location || 'Ubicación desconocida'}`;
                                                if (stop.bl_firmado_doc) {
                                                    tooltipTitle += ` (Cita Entrega: ${stop.bl_firmado_doc.nombre_archivo})`;
                                                }
                                            });
                                        }

                                        return (
                                            <Grid item key={etapa.trip_stage_id} xs={12} sm={6} md={4}>
                                                <Box sx={{ border: '1px solid #eee', padding: '8px', borderRadius: '4px', height: '100%' }}>
                                                    <Tooltip title={tooltipTitle} arrow>
                                                        <span>
                                                            <strong>E{etapa.stage_number} ({etapa.stageType?.replace('borderCrossing', 'Cruce').replace('normalTrip', 'Normal').replace('emptyMileage', 'Millaje Vacío') || 'N/A'}):</strong> {etapa.origin} &rarr; {etapa.destination} ({etapa.travel_direction})
                                                        </span>
                                                    </Tooltip>
                                                    {/* Display etapa.estatus here */}
                                             
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
                                                                        {stop.time_of_delivery && (
                                                                            <span style={{ marginLeft: '5px' }}>
                                                                                ({dayjs(`2000-01-01 ${stop.time_of_delivery}`).format('h:mm A')})
                                                                            </span>
                                                                        )}
                                                                        {stop.bl_firmado_doc && (
                                                                            <MuiLink
                                                                                href={getDocumentUrl(stop.bl_firmado_doc.path_servidor_real || stop.bl_firmado_doc.nombre_archivo)}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                sx={{ ml: 0.5 }}
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
                                                            <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9em', mb: 0.5 }}>Documentos Generales de la Etapa:</Typography>
                                                            <ul style={{ margin: '0', paddingLeft: '20px', listStyleType: 'disc', fontSize: 'inherit' }}>
                                                                {etapa.documentos_adjuntos.map(doc => (
                                                                    <li key={doc.document_id} style={{ marginBottom: '2px' }}>
                                                                        <MuiLink
                                                                            href={getDocumentUrl(doc.path_servidor_real || doc.nombre_archivo)}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            title={`Ver ${doc.tipo_documento.replace(/_/g, ' ')} (${doc.nombre_archivo})`}
                                                                            underline="hover"
                                                                            sx={{ fontSize: 'inherit' }}
                                                                        >
                                                                            {doc.tipo_documento.replace(/_/g, ' ')}
                                                                        </MuiLink>
                                                                        {doc.fecha_vencimiento ? ` (V: ${dayjs(doc.fecha_vencimiento).format("DD/MM/YY")})` : ''}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            ) : (
                                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>Sin etapas registradas</Typography>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};


const TripAdmin = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const navigate = useNavigate();

    const apiHost = import.meta.env.VITE_API_HOST;

    const fetchTrips = async () => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = `${apiHost}/new_trips.php`;
            const formData = new FormData();
            formData.append('op', 'getAll');
            const response = await fetch(apiUrl, { method: 'POST', body: formData });
            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
                console.log(result)
            }
            catch (e) {
                console.error("Error parseando JSON:", e, "Respuesta recibida:", responseText);
                throw new Error(`Respuesta inválida del servidor. Verifica la consola y el log PHP.`);
            }

            if (response.ok && result.status === "success") {
                if (Array.isArray(result.trips)) {
                    result.trips.forEach(trip => {
                        if (!Array.isArray(trip.etapas)) {
                            trip.etapas = [];
                        }
                        trip.etapas.forEach(etapa => {
                            if (!Array.isArray(etapa.documentos_adjuntos)) {
                                etapa.documentos_adjuntos = [];
                            }
                        });
                    });
                    setTrips(result.trips);
                } else {
                    setTrips([]);
                }
            } else {
                throw new Error(result.message || result.error || 'Error al obtener los viajes.');
            }
        } catch (err) {
            console.error("Error fetching trips:", err);
            setError(err.message);
            Swal.fire('Error', `No se pudieron cargar los viajes: ${err.message}`, 'error');
            setTrips([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchTrips(); }, []);

    const getDocumentUrl = (serverPath) => {
        if (!serverPath || typeof serverPath !== 'string') {
            return '#';
        }
        const webRootPath = `${apiHost}/Uploads/Trips/`;
        const fileName = serverPath.split(/[\\/]/).pop();
        if (!fileName) {
            return '#';
        }
        return `${webRootPath}${encodeURIComponent(fileName)}`;
    };

    const filteredAndSortedTrips = useMemo(() => {
        const filtered = trips.filter(trip => {
            let tripCreationDate = null;
            if (trip.creation_date) { try { tripCreationDate = dayjs(trip.creation_date); if (!tripCreationDate.isValid()) { tripCreationDate = null; } } catch (e) { } }
            const start = startDate ? dayjs(startDate).startOf('day') : null;
            const end = endDate ? dayjs(endDate).endOf('day') : null;

            const withinDateRange = ((!start || (tripCreationDate && tripCreationDate.isSameOrAfter(start))) && (!end || (tripCreationDate && tripCreationDate.isSameOrBefore(end))));
            const searchLower = search.toLowerCase();
            const matchesSearch = search === "" || (
                (trip.trip_id?.toString() || '').toLowerCase().includes(searchLower) ||
                (trip.trip_number || '').toLowerCase().includes(searchLower) ||
                (trip.driver_nombre || '').toLowerCase().includes(searchLower) ||
                (trip.driver_second_nombre || '').toLowerCase().includes(searchLower) ||
                (trip.truck_unidad || '').toLowerCase().includes(searchLower) ||
                (trip.caja_no_caja || '').toLowerCase().includes(searchLower) ||
                (trip.status || '').toLowerCase().includes(searchLower) ||
                (trip.etapas && trip.etapas.some(etapa =>
                    (etapa.ci_number || '').toLowerCase().includes(searchLower) ||
                    (etapa.origin || '').toLowerCase().includes(searchLower) ||
                    (etapa.destination || '').toLowerCase().includes(searchLower) ||
                    (etapa.nombre_compania || '').toLowerCase().includes(searchLower) ||
                    (etapa.stageType === 'stopStage' && (etapa.origin || '').toLowerCase().includes(searchLower)) ||
                    (etapa.stageType === 'stopStage' && (etapa.reason || '').toLowerCase().includes(searchLower)) ||
                    (etapa.estatus || '').toLowerCase().includes(searchLower)
                ))
            );
            return matchesSearch && withinDateRange;
        });

        // Sort the filtered trips
        return filtered.sort((a, b) => {
            // Priority: 'In Coming' (1) > 'In Transit' (2) > 'Almost Over' (3) > 'Completed' (4) > 'Cancelled' (5) > Others (6)
            const statusOrder = (status) => { // MODIFICACIÓN: Añadido "Almost Over" en el orden de prioridad
                if (status === 'In Coming') return 1;
                if (status === 'In Transit') return 2;
                if (status === 'Almost Over') return 3; // Nuevo estado, antes de Completed
                if (status === 'Completed') return 4;
                if (status === 'Cancelled') return 5;
                return 6; // Para cualquier otro estado
            };

            const orderA = statusOrder(a.status);
            const orderB = statusOrder(b.status);

            // Primary sort by status priority
            if (orderA !== orderB) {
                return orderA - orderB;
            }

            // Secondary sort: If status priority is the same, sort by creation_date (newest to oldest)
            const dateA = a.creation_date ? dayjs(a.creation_date) : dayjs('1900-01-01');
            const dateB = b.creation_date ? dayjs(b.creation_date) : dayjs('1900-01-01');

            if (dateA.isValid() && dateB.isValid()) {
                return dateB.diff(dateA); // Descending order (newer first)
            }
            if (!dateA.isValid() && dateB.isValid()) return 1;
            if (dateA.isValid() && !dateB.isValid()) return -1;

            // Tertiary sort: If status and creation_date are the same, sort by trip_number (ascending)
            return (a.trip_number || '').localeCompare(b.trip_number || '');
        });
    }, [trips, search, startDate, endDate]);

    const handleEditTrip = (tripId) => {
        if (!tripId) { console.error("ID inválido"); return; }
        navigate(`/edit-trip/${tripId}`);
    };

    // NUEVO HANDLER: handleAlmostOverTrip
    const handleAlmostOverTrip = async (tripId, tripNumber) => {
        if (!tripId) return;
        const confirmation = await Swal.fire({
            title: '¿Marcar como "Casi Finalizado"?',
            text: `Viaje #${tripNumber} será marcado como "Casi Finalizado" y sus recursos serán liberados.`,
            icon: 'info', // O 'warning'
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        });
        if (confirmation.isConfirmed) {
            try {
                const apiUrl = `${apiHost}/new_trips.php`;
                const formData = new FormData();
                formData.append('op', 'AlmostOverTrip'); // NUEVA OPERACIÓN EN EL BACKEND
                formData.append('trip_id', tripId);
                const response = await fetch(apiUrl, { method: 'POST', body: formData });
                const result = await response.json();
                if (response.ok && result.status === 'success') {
                    Swal.fire('¡Éxito!', result.message || 'Viaje marcado como "Casi Finalizado" y recursos liberados.', 'success');
                    fetchTrips(); // Refrescar la tabla
                } else {
                    throw new Error(result.error || result.message || 'No se pudo marcar como "Casi Finalizado".');
                }
            } catch (err) {
                console.error("Error al marcar como casi finalizado:", err);
                Swal.fire('Error', `Error al marcar como "Casi Finalizado": ${err.message}`, 'error');
            }
        }
    };
    // FIN NUEVO HANDLER

    const handleFinalizeTrip = async (tripId, tripNumber) => {
        if (!tripId) return;
        const confirmation = await Swal.fire({
            title: '¿Finalizar Viaje?', text: `Viaje #${tripNumber} será completado.`,
            icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, finalizar'
        });
        if (confirmation.isConfirmed) {
            try {
                const apiUrl = `${apiHost}/new_trips.php`;
                const finalizeFormData = new FormData();
                finalizeFormData.append('op', 'FinalizeTrip');
                finalizeFormData.append('trip_id', tripId);
                const response = await fetch(apiUrl, { method: 'POST', body: finalizeFormData });
                const result = await response.json();
                if (response.ok && result.status === 'success') {
                    Swal.fire('¡Finalizado!', result.message || 'Viaje completado.', 'success');
                    fetchTrips();
                } else { throw new Error(result.error || result.message || 'No se pudo finalizar.'); }
            } catch (err) { Swal.fire('Error', `Error al finalizar: ${err.message}`, 'error'); }
        }
    };

    if (loading) { return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}> <CircularProgress /> <Typography ml={2}>Cargando...</Typography> </Box>); }

    return (
        <div className="trip-admin">
            <h1 className="title">Administrador de Viajes</h1>
            <div className="filters">
                <input type="text" placeholder="Buscar por Trip#, Driver, Truck, etc..." value={search} onChange={(e) => setSearch(e.target.value)} className="small-input" />
                <div className="date-pickers">
                    <DatePicker
                        selected={startDate}
                        onChange={setStartDate}
                        selectsStart startDate={startDate}
                        endDate={endDate} placeholderText="Fecha inicio"
                        dateFormat="dd/MM/yyyy"
                        popperClassName="my-custom-datepicker-popper"
                        isClearable />
                    <DatePicker
                        selected={endDate}
                        onChange={setEndDate}
                        selectsEnd startDate={startDate}
                        endDate={endDate}
                        minDate={startDate}
                        placeholderText="Fecha fin"
                        dateFormat="dd/MM/yyyy"
                        popperClassName="my-custom-datepicker-popper"
                        isClearable />
                    <Button variant="contained" onClick={() => { setStartDate(null); setEndDate(null); }} style={{ marginLeft: '10px' }} size="small"> Limpiar Filtro </Button>
                    <Button variant="contained" onClick={fetchTrips} disabled={loading} style={{ marginLeft: '10px' }} size="small"> Refrescar </Button>
                </div>
            </div>
            {error && <Alert severity="error" sx={{ my: 2 }}>Error al cargar: {error}</Alert>}

            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell /> {/* For expand/collapse icon */}
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Trip #</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Driver(s)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Truck</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Trailer</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Initial Date</TableCell> {/* This will display loadingDateToShow */}
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Creation Date</TableCell> {/* NUEVA LÍNEA: Encabezado para la columna Creation Date */}
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAndSortedTrips.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center">No se encontraron viajes con los filtros aplicados.</TableCell>
                            </TableRow>
                        ) : (
                            filteredAndSortedTrips
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((trip) => (
                                    <TripRow
                                        key={trip.trip_id}
                                        trip={trip}
                                        onEdit={handleEditTrip}
                                        onFinalize={handleFinalizeTrip}
                                        onAlmostOver={handleAlmostOverTrip} // MODIFICACIÓN CLAVE: Pasar el nuevo handler a TripRow
                                        getDocumentUrl={getDocumentUrl}
                                    />
                                ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[25, 50, 100]}
                component="div"
                count={filteredAndSortedTrips.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                onRowsPerPageChange={(event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); }}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
            />
        </div>
    );
};

export default TripAdmin;