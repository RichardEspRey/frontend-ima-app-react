import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, TablePagination, TextField, Box, Typography, CircularProgress, Alert,
    Grid, Stack, FormControl, InputLabel, Select, MenuItem, Collapse, Tabs, Tab
} from '@mui/material';

import FilterListIcon from '@mui/icons-material/FilterList';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import '../css/TripAdmin.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import { TripRow } from '../../components/TripRow';
import { useAuthStore } from '../../store/useAuthStore';

const DIRECTION_OPTIONS = [
    { value: 'All', label: 'Todas las Direcciones' },
    { value: 'Going Up', label: 'Going Up' },
    { value: 'Going Down', label: 'Going Down' }
];

const TABS_CONFIG = [
    { id: 0, label: "Up Coming", permission: "viajes_tab_upcoming" },
    { id: 1, label: "Despacho", permission: "viajes_tab_despacho" },
    { id: 2, label: "En Ruta", permission: "viajes_tab_en_ruta" },
    { id: 3, label: "Finalizados", permission: "viajes_tab_completados" }
];

const TripAdmin = () => {
    const { userPermissions, user } = useAuthStore();
    const isAdmin = user?.tipo_usuario?.toLowerCase() === 'admin';
    const navigate = useNavigate();
    const apiHost = import.meta.env.VITE_API_HOST;

    const [trips, setTrips] = useState([]);
    const [totalRows, setTotalRows] = useState(0); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const allowedTabs = useMemo(() => {
        if (!userPermissions) return [];
        return TABS_CONFIG.filter(tab => userPermissions[tab.permission] === true);
    }, [userPermissions]);

    const [tabValue, setTabValue] = useState(1);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [showFilters, setShowFilters] = useState(false);

    // Filtros de búsqueda
    const [filterTrip, setFilterTrip] = useState('');
    const [filterDriver, setFilterDriver] = useState('');
    const [filterTruck, setFilterTruck] = useState('');
    const [filterTrailer, setFilterTrailer] = useState('');
    const [filterCompany, setFilterCompany] = useState('');
    const [filterOrigin, setFilterOrigin] = useState('');
    const [filterDestination, setFilterDestination] = useState('');
    const [filterDirection, setFilterDirection] = useState('All');

    useEffect(() => {
        if (allowedTabs.length > 0 && !allowedTabs.some(t => t.id === tabValue)) {
            setTabValue(allowedTabs[0].id);
        }
    }, [allowedTabs, tabValue]);

    // FETCH OPTIMIZADO PAGINADO
    const fetchTrips = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('op', 'getPaginated'); 
            formData.append('page', page);
            formData.append('limit', rowsPerPage);
            formData.append('tabValue', tabValue);
            formData.append('filterTrip', filterTrip);
            formData.append('filterDriver', filterDriver);
            formData.append('filterTruck', filterTruck);
            formData.append('filterTrailer', filterTrailer);
            formData.append('filterCompany', filterCompany);
            formData.append('filterOrigin', filterOrigin);
            formData.append('filterDestination', filterDestination);
            formData.append('filterDirection', filterDirection);

            const response = await fetch(`${apiHost}/new_tripsv2.php`, { method: 'POST', body: formData });
            const result = await response.json();

            if (response.ok && result.status === "success") {
                setTrips(result.trips || []);
                setTotalRows(result.total || 0);
            } else {
                throw new Error(result.message || 'Error al obtener los viajes.');
            }
        } catch (err) {
            setError(err.message);
            Swal.fire('Error', `No se pudieron cargar los viajes: ${err.message}`, 'error');
            setTrips([]);
        } finally {
            setLoading(false);
        }
    }, [apiHost, page, rowsPerPage, tabValue, filterTrip, filterDriver, filterTruck, filterTrailer, filterCompany, filterOrigin, filterDestination, filterDirection]);

    useEffect(() => {
        fetchTrips();
    }, [fetchTrips]);

    // =====================================================================
    // HANDLERS
    // =====================================================================

    const handleTabChange = (event, newValue) => { setTabValue(newValue); setPage(0); };
    const handleFilterChange = (setter, value) => { setter(value); setPage(0); };

    const handleEditTrip = (tripId) => navigate(tabValue === 0 ? `/edit-trip-upcoming/${tripId}` : `/edit-trip/${tripId}`);
    const handleSummary = (tripId) => navigate(`/ResumenTrip/${tripId}`);
    
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

    const handleReactivateTrip = async (tripId, tripNumber, isEnRuta = false) => {
        if (!tripId) return;
        let reactivationType = '';

        if (isEnRuta) {
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
                Swal.fire('¡Éxito!', `Viaje reactivado correctamente como ${reactivationType === 'admin' ? 'Administrativos' : 'Operadores'}.`, 'success');
                fetchTrips(); 
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
            title: '¿Confirmar salida?', text: `El viaje #${tripNumber} cambiará a "In Transit".`,
            icon: 'question', showCancelButton: true, confirmButtonText: 'Sí, dar salida'
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
            title: '¿Eliminar viaje?', text: `El viaje #${tripNumber} será eliminado permanentemente.`,
            icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar', confirmButtonColor: '#d33'
        });
        if (!confirm.isConfirmed) return;

        try {
            const apiUrl = `${apiHost}/new_trips.php`;
            const formData = new FormData();
            formData.append('op', 'delete_trip');
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

    // =====================================================================

    const getTripMissingDocs = (trip) => {
        if (!Array.isArray(trip.etapas) || trip.etapas.length === 0) return { total: 0, list: [] };
        return { total: trip.etapas[0].documentos_faltantes ?? 0, list: trip.etapas[0].documentos_faltantes_lista ?? [] };
    };

    const getDocumentUrl = (serverPath) => {
        if (!serverPath || typeof serverPath !== 'string') return '#';
        return `${apiHost}/Uploads/Trips/${encodeURIComponent(serverPath.split(/[\\/]/).pop())}`;
    };

    const isUpcomingTab = tabValue === 0;
    const isDespachoTab = tabValue === 1;
    const showDocsColumn = isUpcomingTab || isDespachoTab;

    // Cálculo dinámico de columnas
    const currentTableColSpan = useMemo(() => {
        if (showDocsColumn) return 8; 
        if (tabValue === 3) return isAdmin ? 11 : 10; 
        return isAdmin ? 10 : 9; 
    }, [showDocsColumn, tabValue, isAdmin]);

    if (allowedTabs.length === 0) {
        return (
            <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
                <Typography variant="h4" fontWeight={800} color="#0f172a" gutterBottom>Administrador de Viajes</Typography>
                <Alert severity="warning">No tienes privilegios de lectura en este módulo.</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
            <style>{`.swal2-container { z-index: 2000 !important; }`}</style>
            
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em">Administrador de Viajes</Typography>
                    <Typography variant="subtitle1" color="#64748b">Gestión y control de despachos, estatus y rutas en tiempo real.</Typography>
                </Box>
            </Stack>

            <Paper elevation={0} sx={{ mb: 3, bgcolor: 'transparent', borderBottom: '2px solid #e2e8f0' }}>
                <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                    {allowedTabs.map(tab => <Tab key={tab.id} label={tab.label} value={tab.id} sx={{ fontWeight: 700 }} />)}
                </Tabs>
            </Paper>

            <Box sx={{ mb: 2 }}>
                <Button variant="outlined" startIcon={<FilterListIcon />} onClick={() => setShowFilters(p => !p)} sx={{ bgcolor: 'white', borderColor: '#cbd5e1', color: '#475569' }}>
                    {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                </Button>
            </Box>

            <Collapse in={showFilters}>
                <Paper sx={{ p: 3, mb: 3, borderRadius: 3, border: '1px solid #e2e8f0' }} elevation={0}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={3}><TextField label="Trip Number" size="small" fullWidth value={filterTrip} onChange={(e) => handleFilterChange(setFilterTrip, e.target.value)} /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Driver" size="small" fullWidth value={filterDriver} onChange={(e) => handleFilterChange(setFilterDriver, e.target.value)} /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Truck" size="small" fullWidth value={filterTruck} onChange={(e) => handleFilterChange(setFilterTruck, e.target.value)} /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Trailer" size="small" fullWidth value={filterTrailer} onChange={(e) => handleFilterChange(setFilterTrailer, e.target.value)} /></Grid>
                        <Grid item xs={12}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button variant="text" onClick={() => { setFilterTrip(''); setFilterDriver(''); setFilterTruck(''); setFilterTrailer(''); setPage(0); }}>Limpiar Filtros</Button>
                            </Stack>
                        </Grid>
                    </Grid>
                </Paper>
            </Collapse>

            {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                        <TableRow>
                            <TableCell />
                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Trip</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Driver(s)</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Truck</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Trailer</TableCell>

                            {!showDocsColumn && <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Initial Date</TableCell>}
                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Status</TableCell>
                            {!showDocsColumn && <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Return Date</TableCell>}
                            {showDocsColumn && <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Documentos Faltantes</TableCell>}

                            <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Actions</TableCell>
                            {tabValue === 3 && <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Resumen</TableCell>}
                            {isAdmin && (tabValue === 3 || tabValue === 2) && <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Admin</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={currentTableColSpan} align="center" sx={{ py: 4 }}>
                                    <CircularProgress size={24} sx={{ mr: 2, verticalAlign: 'middle' }} />
                                    <Typography component="span" color="text.secondary">Actualizando datos...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : trips.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={currentTableColSpan} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">No se localizaron registros en esta categoría.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            trips.map((trip) => {
                                const { total, list } = getTripMissingDocs(trip);
                                return (
                                    <TripRow
                                        key={trip.trip_id} 
                                        trip={trip} 
                                        isAdmin={isAdmin} 
                                        isCompletedTab={tabValue === 3}
                                        isDespachoTab={isDespachoTab} 
                                        isUpcomingTab={isUpcomingTab} 
                                        isEnRutaTab={tabValue === 2}
                                        onEdit={handleEditTrip} 
                                        onSummary={handleSummary} 
                                        showDocsColumn={showDocsColumn}
                                        documentosFaltantes={total} 
                                        documentosFaltantesLista={list} 
                                        getDocumentUrl={getDocumentUrl}
                                        colSpanOverride={currentTableColSpan} 
                                        onDelete={handleDeleteTrip}
                                        onAlmostOver={handleAlmostOverTrip}
                                        onFinalize={handleFinalizeTrip}
                                        onReactivate={(tripId, tripNumber) => handleReactivateTrip(tripId, tripNumber, tabValue === 2)}
                                        onSalida={handleSalida}
                                    />
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', borderTop: 'none', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
                <TablePagination
                    rowsPerPageOptions={[25, 50, 100]}
                    component="div"
                    count={totalRows} 
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                />
            </Box>
        </Box>
    );
};

export default TripAdmin;