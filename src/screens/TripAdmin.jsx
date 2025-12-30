import React, { useState, useEffect, useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, TablePagination, TextField, Box, Typography, CircularProgress, Alert,
    Grid, Stack, FormControl, InputLabel, Select, MenuItem, Collapse
} from '@mui/material';

import FilterListIcon from '@mui/icons-material/FilterList';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.locale('es');

import './css/TripAdmin.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import { TripRow } from '../components/TripRow';

// Opciones para el nuevo filtro de dirección
const DIRECTION_OPTIONS = [
    { value: 'All', label: 'Todas las Direcciones' },
    { value: 'Going Up', label: 'Going Up' },
    { value: 'Going Down', label: 'Going Down' }
];

const TripAdmin = () => {
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // ** ESTADOS PARA LOS FILTROS PRINCIPALES **
    const [filterTrip, setFilterTrip] = useState('');
    const [filterDriver, setFilterDriver] = useState('');
    const [filterTruck, setFilterTruck] = useState('');
    const [filterTrailer, setFilterTrailer] = useState('');

    // ** ESTADOS PARA FILTROS DE ETAPAS **
    const [filterCompany, setFilterCompany] = useState('');
    const [filterOrigin, setFilterOrigin] = useState('');
    const [filterDestination, setFilterDestination] = useState('');
    const [filterDirection, setFilterDirection] = useState('All');

    // ** Visibilidad de filtros **
    const [showFilters, setShowFilters] = useState(false);

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

    const handleFilterChange = (setter, value) => {
        setter(value);
        setPage(0);
    };

    // ** LÓGICA DE FILTRADO Y ORDENAMIENTO **
    const filteredAndSortedTrips = useMemo(() => {

        // Convertir filtros a minúsculas y limpiar espacios
        const tripFilterValue = filterTrip.trim().toLowerCase();
        const driverLower = filterDriver.trim().toLowerCase();
        const truckLower = filterTruck.trim().toLowerCase();
        const trailerLower = filterTrailer.trim().toLowerCase();
        const companyLower = filterCompany.trim().toLowerCase();
        const originLower = filterOrigin.trim().toLowerCase();
        const destinationLower = filterDestination.trim().toLowerCase();
        const directionValue = filterDirection === 'All' ? null : filterDirection;

        const filtered = trips.filter(trip => {

            // Filtro de Rango de Fechas (Basado en creation_date) ---
            let tripCreationDate = null;
            if (trip.creation_date) { try { tripCreationDate = dayjs(trip.creation_date); if (!tripCreationDate.isValid()) { tripCreationDate = null; } } catch (e) { } }
            const start = startDate ? dayjs(startDate).startOf('day') : null;
            const end = endDate ? dayjs(endDate).endOf('day') : null;

            const withinDateRange = ((!start || (tripCreationDate && tripCreationDate.isSameOrAfter(start))) && (!end || (tripCreationDate && tripCreationDate.isSameOrBefore(end))));


            // --- 2. Filtros de Campos Principales (Búsqueda Parcial - includes()) ---

            // a) Trip Number (Parcial)
            const matchTrip = !tripFilterValue || (
                String(trip.trip_number || '').trim().toLowerCase().includes(tripFilterValue)
            );

            const driverNombre = (trip.driver_nombre || '').trim().toLowerCase();
            const driverSecondNombre = (trip.driver_second_nombre || '').trim().toLowerCase();
            const matchDriver = !driverLower || (
                driverNombre.includes(driverLower) ||
                driverSecondNombre.includes(driverLower)
            );

            const matchTruck = !truckLower || (
                (trip.truck_unidad || '').trim().toLowerCase().includes(truckLower)
            );

            // d) Trailer/Caja (Parcial)
            const matchTrailer = !trailerLower || (
                (trip.caja_no_caja || '').trim().toLowerCase().includes(trailerLower) ||
                (trip.caja_externa_no_caja || '').trim().toLowerCase().includes(trailerLower)
            );


            // --- 3. Filtros de Etapas (Búsqueda Parcial en AL MENOS UNA ETAPA) ---
            const etapas = trip.etapas || [];

            // e) Company (Parcial)
            const matchCompany = !companyLower || etapas.some(e =>
                (e.nombre_compania || '').trim().toLowerCase().includes(companyLower)
            );

            // f) Origin (Parcial)
            const matchOrigin = !originLower || etapas.some(e =>
                (e.origin || '').trim().toLowerCase().includes(originLower)
            );

            // g) Destination (Parcial)
            const matchDestination = !destinationLower || etapas.some(e =>
                (e.destination || '').trim().toLowerCase().includes(destinationLower)
            );


            // h) Travel Direction (NUEVO FILTRO INTERDEPENDIENTE)
            let matchDirection = true;

            // Solo aplicamos el filtro de dirección si hay un valor seleccionado
            if (directionValue) {
                // Debe haber coincidencia en origen Y/O destino, y coincidencia en dirección
                const isLocationFiltered = originLower || destinationLower;

                if (isLocationFiltered) {
                    matchDirection = etapas.some(e => {
                        const etapaDirection = e.travel_direction;
                        const etapaOrigin = (e.origin || '').trim().toLowerCase();
                        const etapaDestination = (e.destination || '').trim().toLowerCase();

                        // 1. Debe coincidir con la dirección
                        const directionMatch = etapaDirection === directionValue;

                        // 2. Debe coincidir con el origen Y/O destino filtrado
                        const locationMatch = (
                            (!originLower || etapaOrigin.includes(originLower)) &&
                            (!destinationLower || etapaDestination.includes(destinationLower))
                        );

                        return directionMatch && locationMatch;
                    });
                } else {
                    matchDirection = false;
                }

            }


            // Criterios combinados (TODOS deben ser TRUE)
            return withinDateRange
                && matchTrip
                && matchDriver
                && matchTruck
                && matchTrailer
                && matchCompany
                && matchOrigin
                && matchDestination
                && matchDirection; 
        });

        return filtered.sort((a, b) => {
            const statusOrder = (status) => {
                if (status === 'In Coming') return 1;
                if (status === 'In Transit') return 2;
                if (status === 'Almost Over') return 3;
                if (status === 'Completed') return 4;
                if (status === 'Cancelled') return 5;
                return 6;
            };

            const orderA = statusOrder(a.status);
            const orderB = statusOrder(b.status);

            if (orderA !== orderB) {
                return orderA - orderB;
            }

            const dateA = a.creation_date ? dayjs(a.creation_date) : dayjs('1900-01-01');
            const dateB = b.creation_date ? dayjs(b.creation_date) : dayjs('1900-01-01');

            if (dateA.isValid() && dateB.isValid()) {
                return dateB.diff(dateA);
            }
            if (!dateA.isValid() && dateB.isValid()) return 1;
            if (dateA.isValid() && !dateB.isValid()) return -1;

            return (a.trip_number || '').localeCompare(b.trip_number || '');
        });
    }, [
        trips,
        filterTrip, filterDriver, filterTruck, filterTrailer,
        filterCompany, filterOrigin, filterDestination, filterDirection, // Nueva dependencia
        startDate, endDate
    ]);

    // ... (Handlers y lógica de fetch se mantienen igual) ...
    const handleEditTrip = (tripId) => {
        if (!tripId) { console.error("ID inválido"); return; }
        navigate(`/edit-trip/${tripId}`);
    };

    const handleAlmostOverTrip = async (tripId, tripNumber) => {
        if (!tripId) return;
        const confirmation = await Swal.fire({
            title: '¿Marcar como "Casi Finalizado"?',
            text: `Viaje #${tripNumber} será marcado como "Casi Finalizado" y sus recursos serán liberados.`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Sí, continuar',
            cancelButtonText: 'Cancelar'
        });
        if (confirmation.isConfirmed) {
            try {
                const apiUrl = `${apiHost}/new_trips.php`;
                const formData = new FormData();
                formData.append('op', 'AlmostOverTrip');
                formData.append('trip_id', tripId);
                const response = await fetch(apiUrl, { method: 'POST', body: formData });
                const result = await response.json();
                if (response.ok && result.status === 'success') {
                    Swal.fire('¡Éxito!', result.message || 'Viaje marcado como "Casi Finalizado" y recursos liberados.', 'success');
                    fetchTrips();
                } else {
                    throw new Error(result.error || result.message || 'No se pudo marcar como "Casi Finalizado".');
                }
            } catch (err) {
                console.error("Error al marcar como casi finalizado:", err);
                Swal.fire('Error', `Error al marcar como "Casi Finalizado": ${err.message}`, 'error');
            }
        }
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

    const handleSummary = (tripId) => {
        if (!tripId) {
            console.error("ID de viaje inválido para resumen");
            return;
        }
        navigate(`/ResumenTrip/${tripId}`);
    };

    if (loading) { return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}> <CircularProgress /> <Typography ml={2}>Cargando...</Typography> </Box>); }

    const isDirectionFilterDisabled = !(filterOrigin.trim() || filterDestination.trim());

    const userType = localStorage.getItem('type');
    const isAdmin = userType === 'admin';
    const handleReactivateTrip = async (tripId, tripNumber) => {
        if (!tripId) return;

        const confirmation = await Swal.fire({
            title: '¿Reactivar viaje?',
            text: `El viaje #${tripNumber} será reactivado.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, reactivar',
            cancelButtonText: 'Cancelar'
        });

        if (!confirmation.isConfirmed) return;

        try {
            const apiUrl = `${apiHost}/new_trips.php`;
            const formData = new FormData();
            formData.append('op', 'activate_trip');
            formData.append('trip_id', tripId);

            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (response.ok && result.status === 'success') {
                Swal.fire('¡Éxito!', result.message || 'Viaje reactivado correctamente.', 'success');
                fetchTrips();
            } else {
                throw new Error(result.error || result.message || 'No se pudo reactivar el viaje.');
            }
        } catch (err) {
            console.error('Error al reactivar viaje:', err);
            Swal.fire('Error', err.message, 'error');
        }
    };

    return (
        <div className="trip-admin">
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Administrador de Viajes
            </Typography>

            <Box sx={{ mb: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={() => setShowFilters(p => !p)}
                    sx={{ mb: 1 }}
                >
                    {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                </Button>
            </Box>

            {/* --- CONTENEDOR DE FILTROS --- */}
            <Collapse in={showFilters} timeout="auto" unmountOnExit>
                <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Filtros de Búsqueda (Búsqueda Parcial)</Typography>
                    <Grid container spacing={2} alignItems="center">

                        {/* Filtros de Identificación (Fila 1) */}
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Trip Number"
                                size="small"
                                fullWidth
                                value={filterTrip}
                                onChange={(e) => handleFilterChange(setFilterTrip, e.target.value)}
                                placeholder="Ej: 101"
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Driver"
                                size="small"
                                fullWidth
                                value={filterDriver}
                                onChange={(e) => handleFilterChange(setFilterDriver, e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Truck"
                                size="small"
                                fullWidth
                                value={filterTruck}
                                onChange={(e) => handleFilterChange(setFilterTruck, e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Trailer/Caja"
                                size="small"
                                fullWidth
                                value={filterTrailer}
                                onChange={(e) => handleFilterChange(setFilterTrailer, e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Compañía (Etapa)"
                                size="small"
                                fullWidth
                                value={filterCompany}
                                onChange={(e) => handleFilterChange(setFilterCompany, e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Origen (Etapa)"
                                size="small"
                                fullWidth
                                value={filterOrigin}
                                onChange={(e) => handleFilterChange(setFilterOrigin, e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField
                                label="Destino (Etapa)"
                                size="small"
                                fullWidth
                                value={filterDestination}
                                onChange={(e) => handleFilterChange(setFilterDestination, e.target.value)}
                            />
                        </Grid>

                        {/* NUEVO FILTRO: Dirección (Fila 2, Columna 4) */}
                        <Grid item xs={12} sm={3}>
                            <FormControl size="small" fullWidth disabled={isDirectionFilterDisabled}>
                                <InputLabel id="direction-label">Dirección (Requiere Origen/Destino)</InputLabel>
                                <Select
                                    labelId="direction-label"
                                    value={filterDirection}
                                    label="Dirección (Requiere Origen/Destino)"
                                    onChange={(e) => handleFilterChange(setFilterDirection, e.target.value)}
                                >
                                    {DIRECTION_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {isDirectionFilterDisabled && filterDirection !== 'All' && (
                                <Typography variant="caption" color="error">
                                    El filtro de dirección está deshabilitado.
                                </Typography>
                            )}
                        </Grid>
                        

                        {/* Filtros de Fecha y Acciones (Fila 3) */}
                        <Grid item xs={12}>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => handleFilterChange(setStartDate, date)}
                                    selectsStart startDate={startDate}
                                    endDate={endDate} placeholderText="Fecha inicio"
                                    dateFormat="dd/MM/yyyy"
                                    className="form-input-datepicker"
                                    isClearable
                                />
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => handleFilterChange(setEndDate, date)}
                                    selectsEnd startDate={startDate}
                                    endDate={endDate}
                                    minDate={startDate}
                                    placeholderText="Fecha fin"
                                    dateFormat="dd/MM/yyyy"
                                    className="form-input-datepicker"
                                    isClearable
                                />
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        // Limpiar todos los filtros
                                        setFilterTrip('');
                                        setFilterDriver('');
                                        setFilterTruck('');
                                        setFilterTrailer('');
                                        setFilterCompany('');
                                        setFilterOrigin('');
                                        setFilterDestination('');
                                        setFilterDirection('All'); // Limpiar la dirección
                                        setStartDate(null);
                                        setEndDate(null);
                                        setPage(0);
                                    }}
                                    size="small"
                                >
                                    Limpiar Todo
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={fetchTrips}
                                    disabled={loading}
                                    size="small"
                                >
                                    Refrescar
                                </Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Paper>
            </Collapse>

            {error && <Alert severity="error" sx={{ my: 2 }}>Error al cargar: {error}</Alert>}

            <TableContainer component={Paper} sx={{ marginTop: 2 }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Trip</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Driver(s)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Truck</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Trailer</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Initial Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Return Date</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Actions</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Resumen</TableCell>
                            {isAdmin && (
                                <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                    Acciones especiales
                                </TableCell>
                            )}

                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredAndSortedTrips.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center">No se encontraron viajes con los filtros aplicados.</TableCell>
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
                                        onAlmostOver={handleAlmostOverTrip}
                                        onReactivate={handleReactivateTrip}
                                        isAdmin={isAdmin}
                                        getDocumentUrl={getDocumentUrl}
                                        onSummary={handleSummary}
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