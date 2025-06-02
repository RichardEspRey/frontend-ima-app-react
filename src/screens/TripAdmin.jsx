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
import './css/TripAdmin.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const TripRow = ({ trip, onEdit, onFinalize, getDocumentUrl }) => {
    const [open, setOpen] = useState(false); // Estado para controlar si la fila está expandida
    // Determinar la fecha de carga de la primera etapa
    let loadingDateToShow = '-';
    let loadingDateTitle = 'Fecha de carga no disponible'; // Tooltip por defecto

    if (Array.isArray(trip.etapas) && trip.etapas.length > 0 && trip.etapas[0].loading_date) {
        // Usamos el formato "DD/MM/YY" como lo tienes en los detalles de la etapa
        loadingDateToShow = dayjs(trip.etapas[0].loading_date).format("DD/MM/YY");
        loadingDateTitle = `Fecha de Carga (1ª Etapa): ${loadingDateToShow}`;
    } else if (trip.etapas && trip.etapas.length > 0) {
        loadingDateTitle = 'Fecha de carga (1ª Etapa) no especificada';
    }
    return (
        <React.Fragment>
            {/* Fila principal con datos básicos */}
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} hover>
                {/* Celda para el botón de expandir/colapsar */}
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                {/* Celdas con datos principales */}
                <TableCell component="th" scope="row">{trip.trip_number}</TableCell>
                <TableCell>{trip.driver_nombre || trip.driver_id || '-'}</TableCell>
                <TableCell>{trip.truck_unidad || trip.truck_id || '-'}</TableCell>
                <TableCell>{trip.caja_no_caja || trip.caja_id || 'N/A'}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }} title={loadingDateTitle}>
                {loadingDateToShow}
            </TableCell>
               <TableCell>
                    {(() => {
                        const currentStatus = trip.status || 'In Transit';
                        let chipColor = 'default'; // Color por defecto
                        
                        if (currentStatus === 'Completed') {
                            chipColor = 'success'; // Verde para "Completed"
                        } else if (currentStatus === 'In Transit') {
                            chipColor = 'warning'; // Anaranjado para "In Transit"
                        } else if (currentStatus === 'Cancelled') { // Ejemplo para otro estado
                            chipColor = 'error';   // Rojo para "Cancelled"
                        }
                        // Puedes añadir más 'else if' para otros estados si los tienes

                        return (
                            <Chip 
                                label={currentStatus} 
                                color={chipColor} 
                                size="small" // Para que tenga un tamaño similar a los botones
                            />
                        );
                    })()}
                </TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}> {/* Usar flex y gap reducido */}
                        <Button size="small" variant="outlined" onClick={() => onEdit(trip.trip_id)}>
                            Editar
                        </Button>
                        <Button
                            size="small"
                            variant="contained"
                            color="success"
                            onClick={() => onFinalize(trip.trip_id, trip.trip_number)}
                            disabled={trip.status === 'Completed' || trip.status === 'Cancelled'}
                            sx={{ fontSize: '0.75rem' }}
                        >
                            Finalizar
                        </Button>
                    </Box>
                </TableCell>
            </TableRow>
            {/* Fila secundaria que contiene el contenido colapsable */}
            <TableRow>
                {/* Celda que abarca todas las columnas y contiene el Collapse */}
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, padding: 1, border: '1px solid rgba(224, 224, 224, 1)', borderRadius: '4px' }}>
                            <Typography variant="h6" gutterBottom component="div" sx={{ fontSize: '1rem' }}>
                                Detalles de Etapas y Documentos
                            </Typography>

                            {Array.isArray(trip.etapas) && trip.etapas.length > 0 ? (
                                // Usamos Grid container en lugar del ul principal
                                <Grid container spacing={2} sx={{ fontSize: '0.85rem' }}>
                                    {trip.etapas.map((etapa) => (
                                        // Cada etapa es un Grid item. md={4} significa que en pantallas medianas y mayores, ocupará 4 de 12 columnas (12/4 = 3 columnas)
                                        // xs={12} hace que ocupe todo el ancho en pantallas pequeñas (una columna)
                                        // sm={6} hace que ocupe la mitad del ancho en pantallas pequeñas/tablets (dos columnas) - puedes ajustar esto
                                        <Grid item key={etapa.trip_stage_id} xs={12} sm={6} md={4}>
                                            {/* Opcional: Envuelve el contenido de cada etapa en un Box o Paper para mejor estructura visual y bordes si es necesario */}
                                            <Box sx={{ border: '1px solid #eee', padding: '8px', borderRadius: '4px', height: '100%' /* Para que todas las cards en una fila tengan la misma altura */ }}>
                                                <Tooltip
                                                    title={`Compañía: ${etapa.nombre_compania || '-'}\nBodega Origen: ${etapa.warehouse_origin_name || '-'}\nBodega Destino: ${etapa.warehouse_destination_name || '-'}\nTarifa: ${etapa.rate_tarifa || '-'}\nMillas: ${etapa.millas_pcmiller || '-'}`}
                                                    arrow
                                                >
                                                    <span>
                                                        <strong>E{etapa.stage_number} ({etapa.stageType?.replace('borderCrossing', 'Cruce').replace('normalTrip', 'Normal') || 'N/A'}):</strong> {etapa.origin} &rarr; {etapa.destination} ({etapa.travel_direction})
                                                    </span>
                                                </Tooltip>
                                                {etapa.ci_number && <><br /><span style={{ fontSize: '0.9em', color: '#555' }}>CI: {etapa.ci_number}</span></>}
                                                <br />
                                                <span style={{ fontSize: '0.9em', color: '#555' }}>
                                                    Carga: {etapa.loading_date ? dayjs(etapa.loading_date).format("DD/MM/YY") : '-'} |
                                                    Entrega: {etapa.delivery_date ? dayjs(etapa.delivery_date).format("DD/MM/YY") : '-'}
                                                </span>

                                                {Array.isArray(etapa.documentos_adjuntos) && etapa.documentos_adjuntos.length > 0 && (
                                                    <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px', listStyleType: 'disc', fontSize: 'inherit' }}> {/* Ajusta el padding/margin según sea necesario */}
                                                        {etapa.documentos_adjuntos.map(doc => (
                                                            <li key={doc.document_id} style={{ marginBottom: '2px' }}>
                                                                <MuiLink
                                                                    href={getDocumentUrl(doc.path_servidor_real || doc.nombre_archivo)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    title={`Ver ${doc.tipo_documento} (${doc.nombre_archivo})`}
                                                                    underline="hover"
                                                                    sx={{ fontSize: 'inherit' }}
                                                                >
                                                                    {doc.tipo_documento.replace(/_/g, ' ')}
                                                                </MuiLink>
                                                                {doc.fecha_vencimiento ? ` (V: ${dayjs(doc.fecha_vencimiento).format("DD/MM/YY")})` : ''}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </Box>
                                        </Grid>
                                    ))}
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


// Componente Principal TripAdmin
const TripAdmin = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const navigate = useNavigate();

    const apiHost = import.meta.env.VITE_API_HOST; // Eliminado para usar URL directa


    const fetchTrips = async () => {
        setLoading(true);
        setError(null);
        try {
            const apiUrl = `${apiHost}/new_trips.php`;
            const formData = new FormData();
            formData.append('op', 'getAll');
            const response = await fetch(apiUrl, { method: 'POST', body: formData });
            const responseText = await response.text();
            console.log("Respuesta cruda de getAll:", responseText);
            let result;
            try {
                result = JSON.parse(responseText);
            }
            catch (e) {
                console.error("Error parseando JSON:", e, "Respuesta recibida:", responseText);
                throw new Error(`Respuesta inválida del servidor. Verifica la consola y el log PHP.`);
            }

            if (response.ok && result.status === "success") {
                // Asumimos que el backend ya devuelve 'etapas' y 'documentos_adjuntos' como arrays
                // si la lógica del PHP fue actualizada correctamente.
                if (Array.isArray(result.trips)) {
                    result.trips.forEach(trip => {
                        if (!Array.isArray(trip.etapas)) {
                            console.warn(`Trip ID ${trip.trip_id} no tiene un array de etapas. Recibido:`, trip.etapas);
                            trip.etapas = [];
                        }
                        trip.etapas.forEach(etapa => {
                            if (!Array.isArray(etapa.documentos_adjuntos)) {
                                console.warn(`Etapa ID ${etapa.trip_stage_id} no tiene un array de documentos_adjuntos. Recibido:`, etapa.documentos_adjuntos);
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

    // Función para obtener la URL del documento
    const getDocumentUrl = (serverPath) => {
        console.log("getDocumentUrl - serverPath recibido:", serverPath);
        if (!serverPath || typeof serverPath !== 'string') {
            console.warn("getDocumentUrl - Ruta inválida o vacía recibida.");
            return '#';
        }

        const webRootPath = `${apiHost}/Uploads/Trips/`;
        const fileName = serverPath.split(/[\\/]/).pop();

        if (!fileName) {
            console.warn("getDocumentUrl - No se pudo extraer el nombre del archivo de:", serverPath);
            return '#';
        }

        const finalUrl = `${webRootPath}${encodeURIComponent(fileName)}`;
        console.log("getDocumentUrl - URL generada:", finalUrl);
        return finalUrl;
    };

    // Filtrado de viajes
    const filteredTrips = useMemo(() => trips.filter(trip => {
        let tripCreationDate = null;
        if (trip.creation_date) { try { tripCreationDate = new Date(trip.creation_date); if (isNaN(tripCreationDate.getTime())) { tripCreationDate = null; } } catch (e) { } }
        const start = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
        const end = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;
        const withinDateRange = ((!start || (tripCreationDate && tripCreationDate >= start)) && (!end || (tripCreationDate && tripCreationDate <= end)));
        const searchLower = search.toLowerCase();
        const matchesSearch = search === "" || (
            (trip.trip_id?.toString() || '').toLowerCase().includes(searchLower) ||
            (trip.trip_number || '').toLowerCase().includes(searchLower) ||
            (trip.driver_nombre || '').toLowerCase().includes(searchLower) ||
            (trip.truck_unidad || '').toLowerCase().includes(searchLower) ||
            (trip.caja_no_caja || '').toLowerCase().includes(searchLower) ||
            (trip.status || '').toLowerCase().includes(searchLower) ||
            (trip.etapas && trip.etapas.some(etapa =>
                (etapa.ci_number || '').toLowerCase().includes(searchLower) ||
                (etapa.origin || '').toLowerCase().includes(searchLower) ||
                (etapa.destination || '').toLowerCase().includes(searchLower) ||
                (etapa.nombre_compania || '').toLowerCase().includes(searchLower)
            ))
        );
        return matchesSearch && withinDateRange;
    }), [trips, search, startDate, endDate]);

    const handleEditTrip = (tripId) => {
        if (!tripId) { console.error("ID inválido"); return; }
        navigate(`/edit-trip/${tripId}`);
    };

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

    // Eliminada la función handleDownloadExcel

    if (loading) { return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}> <CircularProgress /> <Typography ml={2}>Cargando...</Typography> </Box>); }

    return (
        <div className="trip-admin">
            <h1 className="title">Administrador de Viajes</h1>
            <div className="filters">
                <input type="text" placeholder="Buscar" value={search} onChange={(e) => setSearch(e.target.value)} className="small-input" />
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
                    {/* Botón de Descargar Excel Eliminado */}
                </div>
            </div>
            {error && <Alert severity="error" sx={{ my: 2 }}>Error al cargar: {error}</Alert>}

            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            {['Trip #', 'Driver', 'Truck', 'Trailer', 'Initial Date', 'Status', 'Actions'].map((title) => (
                                <TableCell key={title} sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>{title}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredTrips.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center">No se encontraron viajes con los filtros aplicados.</TableCell>
                            </TableRow>
                        ) : (
                            filteredTrips
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((trip) => (
                                    <TripRow
                                        key={trip.trip_id}
                                        trip={trip}
                                        onEdit={handleEditTrip}
                                        onFinalize={handleFinalizeTrip}
                                        getDocumentUrl={getDocumentUrl}
                                    />
                                ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={filteredTrips.length}
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
