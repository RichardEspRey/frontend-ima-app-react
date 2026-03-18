import { useState, useEffect, useMemo, useContext } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, TablePagination, TextField, Box, Typography, CircularProgress, Alert,
    Grid, Stack, FormControl, InputLabel, Select, MenuItem, Collapse, Tabs, Tab
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
import { AuthContext } from '../auth/AuthContext';

const DIRECTION_OPTIONS = [
    { value: 'All', label: 'Todas las Direcciones' },
    { value: 'Going Up', label: 'Going Up' },
    { value: 'Going Down', label: 'Going Down' }
];

const TABS_CONFIG = [
    { id: 0, label: "Up Coming", permission: "Ver Pestaña Upcoming" },
    { id: 1, label: "Despacho", permission: "Ver Pestaña Despacho" },
    { id: 2, label: "En Ruta", permission: "Ver Pestaña En Ruta" },
    { id: 3, label: "Finalizados", permission: "Ver Pestaña Completados" }
];

const TripAdmin = () => {
    const { userPermissions } = useContext(AuthContext);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const allowedTabs = useMemo(() => {
        if (!userPermissions) return [];

        return TABS_CONFIG.filter(tab => userPermissions[tab.permission] === true);
    }, [userPermissions]);

    // const [tabValue, setTabValue] = useState(1); 

    const [tabValue, setTabValue] = useState(() => {
        return 1;
    });

    useEffect(() => {
        if (allowedTabs.length > 0) {
            const isAllowed = allowedTabs.some(t => t.id === tabValue);

            if (!isAllowed) {
                const hasEnRuta = allowedTabs.find(t => t.id === 2);
                setTabValue(hasEnRuta ? 2 : allowedTabs[0].id);
            }
        }
    }, [allowedTabs, tabValue]);

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
            const apiUrl = `${apiHost}/new_tripsv2.php`;
            const formData = new FormData();
            formData.append('op', 'getAll');
            const response = await fetch(apiUrl, { method: 'POST', body: formData });
            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
            }
            catch (e) {
                console.error("Error parseando JSON:", e, "Respuesta recibida:", responseText);
                throw new Error(`Respuesta inválida del servidor.`);
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
        if (!serverPath || typeof serverPath !== 'string') return '#';
        const webRootPath = `${apiHost}/Uploads/Trips/`;
        const fileName = serverPath.split(/[\\/]/).pop();
        if (!fileName) return '#';
        return `${webRootPath}${encodeURIComponent(fileName)}`;
    };

    const handleFilterChange = (setter, value) => {
        setter(value);
        setPage(0);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
        setPage(0);
    };

    // ** LÓGICA DE FILTRADO Y ORDENAMIENTO **
    const filteredAndSortedTrips = useMemo(() => {

        const tripFilterValue = filterTrip.trim().toLowerCase();
        const driverLower = filterDriver.trim().toLowerCase();
        const truckLower = filterTruck.trim().toLowerCase();
        const trailerLower = filterTrailer.trim().toLowerCase();
        const companyLower = filterCompany.trim().toLowerCase();
        const originLower = filterOrigin.trim().toLowerCase();
        const destinationLower = filterDestination.trim().toLowerCase();
        const directionValue = filterDirection === 'All' ? null : filterDirection;

        const filtered = trips.filter(trip => {

            const status = trip.status;

            if (tabValue === 0) {
                if (status !== 'Up Coming') return false;
            } else if (tabValue === 1) {
                if (status !== 'Up Coming') return false;
            } else if (tabValue === 2) {
                if (status !== 'In Transit' && status !== 'Almost Over') return false;
            } else if (tabValue === 3) {
                if (status !== 'Completed' && status !== 'Cancelled') return false;
            }

            let tripCreationDate = null;
            if (trip.creation_date) { try { tripCreationDate = dayjs(trip.creation_date); if (!tripCreationDate.isValid()) { tripCreationDate = null; } } catch (e) { } }
            const start = startDate ? dayjs(startDate).startOf('day') : null;
            const end = endDate ? dayjs(endDate).endOf('day') : null;

            const withinDateRange = ((!start || (tripCreationDate && tripCreationDate.isSameOrAfter(start))) && (!end || (tripCreationDate && tripCreationDate.isSameOrBefore(end))));

            const matchTrip = !tripFilterValue || (String(trip.trip_number || '').trim().toLowerCase().includes(tripFilterValue));
            const driverNombre = (trip.driver_nombre || '').trim().toLowerCase();
            const driverSecondNombre = (trip.driver_second_nombre || '').trim().toLowerCase();
            const matchDriver = !driverLower || (driverNombre.includes(driverLower) || driverSecondNombre.includes(driverLower));
            const matchTruck = !truckLower || ((trip.truck_unidad || '').trim().toLowerCase().includes(truckLower));
            const matchTrailer = !trailerLower || ((trip.caja_no_caja || '').trim().toLowerCase().includes(trailerLower) || (trip.caja_externa_no_caja || '').trim().toLowerCase().includes(trailerLower));

            // --- FILTROS DE ETAPAS ---
            const etapas = trip.etapas || [];
            const matchCompany = !companyLower || etapas.some(e => (e.nombre_compania || '').trim().toLowerCase().includes(companyLower));
            const matchOrigin = !originLower || etapas.some(e => (e.origin || '').trim().toLowerCase().includes(originLower));
            const matchDestination = !destinationLower || etapas.some(e => (e.destination || '').trim().toLowerCase().includes(destinationLower));

            let matchDirection = true;
            if (directionValue) {
                const isLocationFiltered = originLower || destinationLower;
                if (isLocationFiltered) {
                    matchDirection = etapas.some(e => {
                        const etapaDirection = e.travel_direction;
                        const etapaOrigin = (e.origin || '').trim().toLowerCase();
                        const etapaDestination = (e.destination || '').trim().toLowerCase();
                        const directionMatch = etapaDirection === directionValue;
                        const locationMatch = ((!originLower || etapaOrigin.includes(originLower)) && (!destinationLower || etapaDestination.includes(destinationLower)));
                        return directionMatch && locationMatch;
                    });
                } else {
                    matchDirection = false;
                }
            }

            return withinDateRange && matchTrip && matchDriver && matchTruck && matchTrailer && matchCompany && matchOrigin && matchDestination && matchDirection;
        });

        return filtered.sort((a, b) => {
            const statusOrder = (status) => {
                if (status === 'Up Coming') return 1;
                if (status === 'In Transit') return 2;
                if (status === 'Almost Over') return 3;
                if (status === 'Completed') return 4;
                if (status === 'Cancelled') return 5;
                return 6;
            };

            const orderA = statusOrder(a.status);
            const orderB = statusOrder(b.status);

            if (orderA !== orderB) return orderA - orderB;

            const dateA = a.creation_date ? dayjs(a.creation_date) : dayjs('1900-01-01');
            const dateB = b.creation_date ? dayjs(b.creation_date) : dayjs('1900-01-01');

            // Orden descendente por fecha
            if (dateA.isValid() && dateB.isValid()) return dateB.diff(dateA);

            return (a.trip_number || '').localeCompare(b.trip_number || '');
        });
    }, [
        trips, tabValue,
        filterTrip, filterDriver, filterTruck, filterTrailer,
        filterCompany, filterOrigin, filterDestination, filterDirection,
        startDate, endDate
    ]);

    const handleEditTrip = (tripId) => {
        if (!tripId) return;

        if (tabValue === 0) {
            // Up Coming → nuevo componente
            navigate(`/edit-trip-upcoming/${tripId}`);
        } else {
            // Despacho, En Ruta y Finalizados → editor actual
            navigate(`/edit-trip/${tripId}`);
        }
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
                    Swal.fire('¡Éxito!', result.message, 'success');
                    fetchTrips();
                } else { throw new Error(result.error || result.message); }
            } catch (err) { Swal.fire('Error', err.message, 'error'); }
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
                const formData = new FormData();
                formData.append('op', 'FinalizeTrip');
                formData.append('trip_id', tripId);
                const response = await fetch(apiUrl, { method: 'POST', body: formData });
                const result = await response.json();
                if (response.ok && result.status === 'success') {
                    Swal.fire('¡Finalizado!', result.message, 'success');
                    fetchTrips();
                } else { throw new Error(result.error || result.message); }
            } catch (err) { Swal.fire('Error', err.message, 'error'); }
        }
    };

    const handleSummary = (tripId) => {
        if (!tripId) return;
        navigate(`/ResumenTrip/${tripId}`);
    };

    const handleReactivateTrip = async (tripId, tripNumber, isEnRuta = false) => {
        if (!tripId) return;

        let reactivationType = '';

        if (isEnRuta) {
            // Desde En Ruta: solo opción Operadores
            const result = await Swal.fire({
                title: 'Reactivar Viaje',
                text: `El viaje #${tripNumber} será reactivado para Operadores.`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Operadores',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#d33',
            });
            if (!result.isConfirmed) return;
            reactivationType = 'operadores';
        } else {
            // Desde Finalizados: ambas opciones
            const result = await Swal.fire({
                title: 'Reactivar Viaje',
                text: `Selecciona el tipo de reactivación para el viaje #${tripNumber}`,
                icon: 'question',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: 'Administrativos',
                denyButtonText: 'Operadores',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#3085d6',
                denyButtonColor: '#d33',
            });
            if (result.isDismissed) return;
            if (result.isConfirmed) reactivationType = 'admin';
            else if (result.isDenied) reactivationType = 'operadores';
        }

        if (!reactivationType) return;

        try {
            const apiUrl = `${apiHost}/new_trips.php`;
            const formData = new FormData();
            formData.append('op', 'activate_trip');
            formData.append('trip_id', tripId);
            formData.append('type', reactivationType);

            const response = await fetch(apiUrl, { method: 'POST', body: formData });
            const responseResult = await response.json();

            if (response.ok && responseResult.status === 'success') {
                Swal.fire(
                    '¡Éxito!',
                    `Viaje reactivado correctamente como ${reactivationType === 'admin' ? 'Administrativos' : 'Operadores'}.`,
                    'success'
                );
                fetchTrips(); // Al recargar, el viaje tendrá status activo y cambiará de tab automáticamente
            } else {
                throw new Error(responseResult.error || responseResult.message);
            }
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    const handleSalida = async (tripId, tripNumber) => {
        if (!tripId) return;

        const confirm = await Swal.fire({
            title: '¿Confirmar salida?',
            text: `El viaje #${tripNumber} cambiará a "In Transit".`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Sí, dar salida'
        });

        if (!confirm.isConfirmed) return;

        try {
            const apiUrl = `${apiHost}/new_tripsv2.php`;
            const formData = new FormData();
            formData.append('op', 'salida_trip');
            formData.append('trip_id', tripId);

            const response = await fetch(apiUrl, { method: 'POST', body: formData });
            const result = await response.json();

            if (response.ok && result.status === 'success') {
                Swal.fire('Salida registrada', result.message, 'success');
                fetchTrips();
            } else {
                throw new Error(result.message || result.error);
            }
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    const handleDeleteTrip = async (tripId, tripNumber) => {
        if (!tripId) return;

        const confirm = await Swal.fire({
            title: '¿Eliminar viaje?',
            text: `El viaje #${tripNumber} será eliminado permanentemente.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            confirmButtonColor: '#d33'
        });

        if (!confirm.isConfirmed) return;

        try {
            const apiUrl = `${apiHost}/new_trips.php`;
            const formData = new FormData();
            formData.append('op', 'DeleteTrip');
            formData.append('trip_id', tripId);

            const response = await fetch(apiUrl, { method: 'POST', body: formData });
            const result = await response.json();

            if (response.ok && result.status === 'success') {
                Swal.fire('Eliminado', result.message, 'success');
                fetchTrips();
            } else {
                throw new Error(result.message || result.error);
            }
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };


    if (loading) { return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}> <CircularProgress /> <Typography ml={2}>Cargando...</Typography> </Box>); }

    const isDirectionFilterDisabled = !(filterOrigin.trim() || filterDestination.trim());
    const userType = localStorage.getItem('type');
    const isAdmin = userType === 'admin';

    const getEmptyMessage = () => {
        if (tabValue === 0) return 'Por Iniciar';
        if (tabValue === 1) return 'Activos';
        return 'Finalizados';
    };

    if (allowedTabs.length === 0) {
        return (
            <div className="trip-admin">
                <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                    Administrador de Viajes
                </Typography>
                <Alert severity="warning">
                    No tienes permisos para visualizar ninguna categoría de viajes. Contacta a tu administrador.
                </Alert>
            </div>
        );
    }

    const isUpcomingTab = tabValue === 0;
    const isDespachoTab = tabValue === 1;
    const showDocsColumn = isUpcomingTab || isDespachoTab;

    //Obtener documentos faltantes desde la PRIMERA ETAPA
    const getTripMissingDocs = (trip) => {
        if (!Array.isArray(trip.etapas) || trip.etapas.length === 0) {
            return { total: 0, list: [] };
        }

        const firstStage = trip.etapas[0];

        return {
            total: firstStage.documentos_faltantes ?? 0,
            list: firstStage.documentos_faltantes_lista ?? []
        };
    };



    return (
        <div className="trip-admin">
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Administrador de Viajes
            </Typography>

            <Paper
                elevation={0}
                sx={{
                    mb: 3,
                    bgcolor: 'transparent',
                    borderBottom: '1px solid #e0e0e0'
                }}
            >
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                        minHeight: '40px',
                        '& .MuiTab-root': {
                            minHeight: '40px',
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.95rem',
                            px: 3
                        }
                    }}
                >
                    {allowedTabs.map(tab => (
                        <Tab key={tab.id} label={tab.label} value={tab.id} />
                    ))}
                </Tabs>
            </Paper>

            <Box sx={{ mb: 2 }}>
                <Button
                    variant="outlined"
                    startIcon={<FilterListIcon />}
                    onClick={() => setShowFilters(p => !p)}
                    size="small"
                    sx={{ textTransform: 'none' }}
                >
                    {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                </Button>
            </Box>

            <Collapse in={showFilters} timeout="auto" unmountOnExit>
                <Paper sx={{ p: 2, mb: 3, bgcolor: '#f9f9f9' }} variant="outlined">
                    <Typography variant="subtitle2" gutterBottom color="text.secondary" fontWeight={600}>Filtros Avanzados</Typography>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={3}>
                            <TextField label="Trip Number" size="small" fullWidth value={filterTrip} onChange={(e) => handleFilterChange(setFilterTrip, e.target.value)} placeholder="Ej: 101" />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField label="Driver" size="small" fullWidth value={filterDriver} onChange={(e) => handleFilterChange(setFilterDriver, e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField label="Truck" size="small" fullWidth value={filterTruck} onChange={(e) => handleFilterChange(setFilterTruck, e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField label="Trailer/Caja" size="small" fullWidth value={filterTrailer} onChange={(e) => handleFilterChange(setFilterTrailer, e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField label="Compañía (Etapa)" size="small" fullWidth value={filterCompany} onChange={(e) => handleFilterChange(setFilterCompany, e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField label="Origen (Etapa)" size="small" fullWidth value={filterOrigin} onChange={(e) => handleFilterChange(setFilterOrigin, e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField label="Destino (Etapa)" size="small" fullWidth value={filterDestination} onChange={(e) => handleFilterChange(setFilterDestination, e.target.value)} />
                        </Grid>
                        <Grid item xs={12} sm={3}>
                            <FormControl size="small" fullWidth disabled={isDirectionFilterDisabled}>
                                <InputLabel>Dirección</InputLabel>
                                <Select value={filterDirection} label="Dirección" onChange={(e) => handleFilterChange(setFilterDirection, e.target.value)}>
                                    {DIRECTION_OPTIONS.map((o) => (<MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                                <DatePicker selected={startDate} onChange={(date) => handleFilterChange(setStartDate, date)} selectsStart startDate={startDate} endDate={endDate} placeholderText="Fecha inicio" dateFormat="dd/MM/yyyy" className="form-input-datepicker" isClearable />
                                <DatePicker selected={endDate} onChange={(date) => handleFilterChange(setEndDate, date)} selectsEnd startDate={startDate} endDate={endDate} minDate={startDate} placeholderText="Fecha fin" dateFormat="dd/MM/yyyy" className="form-input-datepicker" isClearable />
                                <Button variant="text" onClick={() => {
                                    setFilterTrip(''); setFilterDriver(''); setFilterTruck(''); setFilterTrailer('');
                                    setFilterCompany(''); setFilterOrigin(''); setFilterDestination(''); setFilterDirection('All');
                                    setStartDate(null); setEndDate(null); setPage(0);
                                }} size="small">Limpiar</Button>
                                <Button variant="contained" onClick={fetchTrips} disabled={loading} size="small">Refrescar Tabla</Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Paper>
            </Collapse>

            {error && <Alert severity="error" sx={{ my: 2 }}>Error al cargar: {error}</Alert>}

            <TableContainer component={Paper} sx={{ marginTop: 2 }} variant="outlined">
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell sx={{ fontWeight: 'bold' }}>Trip</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Driver(s)</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Truck</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Trailer</TableCell>

                            {!showDocsColumn && (
                                <TableCell sx={{ fontWeight: 'bold' }}>Initial Date</TableCell>
                            )}

                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>

                            {!showDocsColumn && (
                                <TableCell sx={{ fontWeight: 'bold' }}>Return Date</TableCell>
                            )}

                            {showDocsColumn && (
                                <TableCell sx={{ fontWeight: 'bold' }}>Documentos Faltantes</TableCell>
                            )}

                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>

                            {tabValue === 3 && (
                                <TableCell sx={{ fontWeight: 'bold' }}>Resumen</TableCell>
                            )}

                            {isAdmin && (tabValue === 3 || tabValue === 2) && (
                                <TableCell sx={{ fontWeight: 'bold' }}>Admin</TableCell>
                            )}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {filteredAndSortedTrips.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} align="center">
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                                        No hay viajes en la sección <b>{getEmptyMessage()}</b>.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredAndSortedTrips
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((trip) => {
                                    const { total, list } = getTripMissingDocs(trip);

                                    return (
                                        <TripRow
                                            key={trip.trip_id}
                                            trip={trip}
                                            isCompletedTab={tabValue === 3}
                                            onEdit={handleEditTrip}
                                            onFinalize={handleFinalizeTrip}
                                            onAlmostOver={handleAlmostOverTrip}
                                            onReactivate={(tripId, tripNumber) => handleReactivateTrip(tripId, tripNumber, tabValue === 2)}
                                            isAdmin={isAdmin}
                                            getDocumentUrl={getDocumentUrl}
                                            onSummary={handleSummary}
                                            showDocsColumn={showDocsColumn}
                                            documentosFaltantes={total}
                                            documentosFaltantesLista={list}
                                            isDespachoTab={isDespachoTab}
                                            onSalida={handleSalida}
                                            colSpanOverride={
                                                showDocsColumn
                                                    ? 9
                                                    : (tabValue === 3 && isAdmin ? 11 : (tabValue === 2 && isAdmin ? 10 : 9))
                                            }
                                            onDelete={handleDeleteTrip}
                                            isUpcomingTab={isUpcomingTab}
                                            isEnRutaTab={tabValue === 2}

                                        />
                                    );
                                })

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
                labelRowsPerPage="Filas:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`}
            />
        </div>
    );
};

export default TripAdmin;