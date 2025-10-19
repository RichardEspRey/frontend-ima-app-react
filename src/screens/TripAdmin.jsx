import React, { useState, useEffect, useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, TablePagination, TextField, Box, Typography, CircularProgress, Alert,
    Grid, Stack, FormControl, InputLabel, Select, MenuItem // Importados para el nuevo Select
} from '@mui/material';

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

import {TripRow} from '../components/TripRow'; 

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
    // ** NUEVO ESTADO **
    const [filterDirection, setFilterDirection] = useState('All'); 
    
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const navigate = useNavigate();

    const apiHost = import.meta.env.VITE_API_HOST;

    const fetchTrips = async () => {
        // ... (fetchTrips se mantiene igual) ...
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
        // ... (getDocumentUrl se mantiene igual) ...
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

    // Función auxiliar para manejar el cambio de filtro y resetear la paginación
    const handleFilterChange = (setter, value) => {
        setter(value);
        setPage(0);
    };

    // ** LÓGICA DE FILTRADO Y ORDENAMIENTO (useMemo) **
    const filteredAndSortedTrips = useMemo(() => {
        
        // Convertir filtros a minúsculas y limpiar espacios
        const tripFilterValue = filterTrip.trim().toLowerCase();
        const driverLower = filterDriver.trim().toLowerCase();
        const truckLower = filterTruck.trim().toLowerCase();
        const trailerLower = filterTrailer.trim().toLowerCase();
        const companyLower = filterCompany.trim().toLowerCase();
        const originLower = filterOrigin.trim().toLowerCase();
        const destinationLower = filterDestination.trim().toLowerCase();
        const directionValue = filterDirection === 'All' ? null : filterDirection; // 'Going Up' o 'Going Down'

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

            // b) Driver (Parcial: busca en nombre1 o nombre2)
            const driverNombre = (trip.driver_nombre || '').trim().toLowerCase();
            const driverSecondNombre = (trip.driver_second_nombre || '').trim().toLowerCase();
            const matchDriver = !driverLower || (
                driverNombre.includes(driverLower) ||
                driverSecondNombre.includes(driverLower)
            );

            // c) Truck (Parcial)
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
                    // Si el usuario filtró por Origen y/o Destino, la etapa DEBE coincidir con la dirección Y con la ubicación filtrada.
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
                    // Si hay dirección seleccionada pero NO hay filtros de origen/destino, NO aplicamos la dirección (o se podría deshabilitar el Select)
                    // Como el requerimiento es que SÓLO se use con Origin/Destination, si no hay location, NO COINCIDE.
                    // Opcionalmente, podemos dejar matchDirection en true si el Select está deshabilitado.
                    // Lo más simple es que si el filtro de dirección está activo, DEBE haber coincidencia de ubicación.
                    matchDirection = false; // Forzamos a que no coincida si no hay filtro de ubicación.
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
                && matchDirection; // <-- NUEVO FILTRO
        });

        // Lógica de ordenamiento por estado (se mantiene igual)
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
    const handleEditTrip = (tripId) => { /* ... */ };
    const handleAlmostOverTrip = async (tripId, tripNumber) => { /* ... */ };
    const handleFinalizeTrip = async (tripId, tripNumber) => { /* ... */ };

    if (loading) { return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}> <CircularProgress /> <Typography ml={2}>Cargando...</Typography> </Box>); }

    // Bandera para deshabilitar el filtro de Dirección si no hay Origen/Destino
    const isDirectionFilterDisabled = !(filterOrigin.trim() || filterDestination.trim());


    return (
        <div className="trip-admin">
            <h1 className="title">Administrador de Viajes</h1>
            
            {/* --- CONTENEDOR DE FILTROS --- */}
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

                    {/* Filtros de Etapas (Fila 2) */}
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
            {/* --- FIN CONTENEDOR DE FILTROS --- */}

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
                            {/* <TableCell sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>Resumen</TableCell> */}
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
                                        onAlmostOver={handleAlmostOverTrip}
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