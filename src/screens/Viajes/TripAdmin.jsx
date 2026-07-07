import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, TablePagination, TextField, Box, Typography, CircularProgress, Alert,
    Grid, Stack, FormControl, InputLabel, Select, MenuItem, Collapse, Tabs, Tab,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip,
    ListSubheader
} from '@mui/material';

import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
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
    { id: 4, label: "Programación de Viajes", permission: "viajes_tab_programacion" },
    { id: 0, label: "Up Coming", permission: "viajes_tab_upcoming" },
    { id: 1, label: "Despacho", permission: "viajes_tab_despacho" },
    { id: 2, label: "En Ruta", permission: "viajes_tab_en_ruta" },
    { id: 3, label: "Finalizados", permission: "viajes_tab_completados" }
];

const EMPTY_SCHEDULE_FORM = { operador_id: '', camion_id: '', caja_id: '', destino: '', salida: '' };

const parseJsonSafe = async (response) => {
    const text = await response.text();
    if (!text.trim()) return {};
    try {
        return JSON.parse(text);
    } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) { try { return JSON.parse(match[0]); } catch {} }
        return {};
    }
};

const TripAdmin = () => {
    const { userPermissions, user } = useAuthStore();
    const isAdmin = user?.tipo_usuario?.toLowerCase() === 'admin' || user?.name === 'Blanca';
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
    const [filterCI, setFilterCI] = useState('');

    // Programación de viajes
    const [scheduledTrips, setScheduledTrips] = useState([]);
    const [openScheduleModal, setOpenScheduleModal] = useState(false);
    const [scheduleForm, setScheduleForm] = useState(EMPTY_SCHEDULE_FORM);
    const [editingScheduleId, setEditingScheduleId] = useState(null);
    const [programacionData, setProgramacionData] = useState({ trucks: [], drivers: [], cajas: [], cajasExternas: [] });
    const [loadingProgramacion, setLoadingProgramacion] = useState(false);
    const [loadingScheduled, setLoadingScheduled] = useState(false);

    useEffect(() => {
        if (allowedTabs.length > 0 && !allowedTabs.some(t => t.id === tabValue)) {
            setTabValue(allowedTabs[0].id);
        }
    }, [allowedTabs, tabValue]);

    const fetchTrips = useCallback(async () => {
        setLoading(true);
        setError(null);

            console.log('userPermissions:', user); // Debugging line

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
            formData.append('filterCI', filterCI);

            if (user?.id) formData.append('user_id', user.id);
            if (user?.tipo_usuario) formData.append('user_type', user.tipo_usuario);

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
    }, [apiHost, page, rowsPerPage, tabValue, filterTrip, filterDriver, filterTruck, filterTrailer, filterCompany, filterOrigin, filterDestination, filterDirection, filterCI]);

    useEffect(() => { if (tabValue !== 4) fetchTrips(); }, [fetchTrips, tabValue]);

    const fetchProgramacionData = useCallback(async () => {
        setLoadingProgramacion(true);
        try {
            const formData = new FormData();
            formData.append('op', 'dashboard');
            const response = await fetch(`${apiHost}/Programacion_viajes.php`, { method: 'POST', body: formData });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                setProgramacionData({
                    trucks: result.trucks || [],
                    drivers: result.drivers || [],
                    cajas: result.cajas || [],
                    cajasExternas: result.cajas_externas || []
                });
            } else {
                throw new Error(result.message || 'Error al cargar datos.');
            }
        } catch (err) {
            Swal.fire('Error', `No se pudieron cargar los datos de programación: ${err.message}`, 'error');
        } finally {
            setLoadingProgramacion(false);
        }
    }, [apiHost]);

    const fetchScheduledTrips = useCallback(async () => {
        setLoadingScheduled(true);
        try {
            const formData = new FormData();
            formData.append('op', 'getAll');
            const response = await fetch(`${apiHost}/Programacion_viajes.php`, { method: 'POST', body: formData });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                setScheduledTrips(result.data || []);
            } else {
                throw new Error(result.message || 'Error al cargar programaciones.');
            }
        } catch (err) {
            Swal.fire('Error', `No se pudieron cargar las programaciones: ${err.message}`, 'error');
        } finally {
            setLoadingScheduled(false);
        }
    }, [apiHost]);

    useEffect(() => {
        if (tabValue === 4) {
            fetchProgramacionData();
            fetchScheduledTrips();
        }
    }, [tabValue, fetchProgramacionData, fetchScheduledTrips]);

    const handleTabChange = (event, newValue) => { setTabValue(newValue); setPage(0); };
    const handleFilterChange = (setter, value) => { setter(value); setPage(0); };

    const handleEditTrip = (tripId) => navigate(tabValue === 0 ? `/edit-trip-upcoming/${tripId}` : `/edit-trip/${tripId}`);
    const handleSummary = (tripId) => navigate(`/ResumenTrip/${tripId}`);

    const handleAlmostOverTrip = async (tripId, tripNumber) => {
        if (!tripId) return;
        const confirmation = await Swal.fire({ title: '¿Marcar como "Casi Finalizado"?', text: `Viaje #${tripNumber} será marcado como "Casi Finalizado".`, icon: 'info', showCancelButton: true, confirmButtonText: 'Sí, continuar', cancelButtonText: 'Cancelar' });
        if (confirmation.isConfirmed) {
            try {
                const formData = new FormData(); formData.append('op', 'AlmostOverTrip'); formData.append('trip_id', tripId);
                const response = await fetch(`${apiHost}/new_trips.php`, { method: 'POST', body: formData });
                const result = await response.json();
                if (response.ok && result.status === 'success') { Swal.fire('¡Éxito!', result.message, 'success'); fetchTrips(); }
                else throw new Error(result.error || result.message);
            } catch (err) { Swal.fire('Error', err.message, 'error'); }
        }
    };

    const handleFinalizeTrip = async (tripId, tripNumber) => {
        if (!tripId) return;
        const confirmation = await Swal.fire({ title: '¿Finalizar Viaje?', text: `Viaje #${tripNumber} será completado.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, finalizar' });
        if (confirmation.isConfirmed) {
            try {
                const formData = new FormData(); formData.append('op', 'FinalizeTrip'); formData.append('trip_id', tripId);
                const response = await fetch(`${apiHost}/new_trips.php`, { method: 'POST', body: formData });
                const result = await response.json();
                if (response.ok && result.status === 'success') { Swal.fire('¡Finalizado!', result.message, 'success'); fetchTrips(); }
                else throw new Error(result.error || result.message);
            } catch (err) { Swal.fire('Error', err.message, 'error'); }
        }
    };

    const handleReactivateTrip = async (tripId, tripNumber, isEnRuta = false) => {
        if (!tripId) return;
        let reactivationType = '';
        if (isEnRuta) {
            const result = await Swal.fire({ title: 'Reactivar Viaje', text: `El viaje #${tripNumber} será reactivado para Operadores.`, icon: 'question', showCancelButton: true, confirmButtonText: 'Operadores', cancelButtonText: 'Cancelar', confirmButtonColor: '#d33' });
            if (!result.isConfirmed) return;
            reactivationType = 'operadores';
        } else {
            const result = await Swal.fire({ title: 'Reactivar Viaje', text: `Selecciona el tipo de reactivación`, icon: 'question', showDenyButton: true, showCancelButton: true, confirmButtonText: 'Administrativos', denyButtonText: 'Operadores', cancelButtonText: 'Cancelar', confirmButtonColor: '#3085d6', denyButtonColor: '#d33' });
            if (result.isDismissed) return;
            if (result.isConfirmed) reactivationType = 'admin';
            else if (result.isDenied) reactivationType = 'operadores';
        }
        if (!reactivationType) return;
        try {
            const formData = new FormData(); formData.append('op', 'activate_trip'); formData.append('trip_id', tripId); formData.append('type', reactivationType);
            const response = await fetch(`${apiHost}/new_trips.php`, { method: 'POST', body: formData });
            const responseResult = await response.json();
            if (response.ok && responseResult.status === 'success') { Swal.fire('¡Éxito!', `Viaje reactivado.`, 'success'); fetchTrips(); }
            else throw new Error(responseResult.error || responseResult.message);
        } catch (err) { Swal.fire('Error', err.message, 'error'); }
    };

    const handleSalida = async (tripId, tripNumber) => {
        if (!tripId) return;
        const confirm = await Swal.fire({ title: '¿Confirmar salida?', text: `El viaje #${tripNumber} cambiará a "In Transit".`, icon: 'question', showCancelButton: true, confirmButtonText: 'Sí, dar salida' });
        if (!confirm.isConfirmed) return;
        try {
            const formData = new FormData(); formData.append('op', 'salida_trip'); formData.append('trip_id', tripId);
            const response = await fetch(`${apiHost}/new_tripsv2.php`, { method: 'POST', body: formData });
            const result = await response.json();
            if (response.ok && result.status === 'success') { Swal.fire('Salida registrada', result.message, 'success'); fetchTrips(); }
            else throw new Error(result.message || result.error);
        } catch (err) { Swal.fire('Error', err.message, 'error'); }
    };

    const handleDeleteTrip = async (tripId, tripNumber) => {
        if (!tripId) return;
        const confirm = await Swal.fire({ title: '¿Eliminar viaje?', text: `El viaje #${tripNumber} será eliminado permanentemente.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar', confirmButtonColor: '#d33' });
        if (!confirm.isConfirmed) return;
        try {
            const formData = new FormData(); formData.append('op', 'delete_trip'); formData.append('trip_id', tripId);
            const response = await fetch(`${apiHost}/new_trips.php`, { method: 'POST', body: formData });
            const result = await response.json();
            if (response.ok && result.status === 'success') { Swal.fire('Eliminado', result.message, 'success'); fetchTrips(); }
            else throw new Error(result.message || result.error);
        } catch (err) { Swal.fire('Error', err.message, 'error'); }
    };

    const handleOpenScheduleModal = (trip = null) => {
        if (trip) {
            setScheduleForm({
                operador_id: trip.driver_id ? String(trip.driver_id) : '',
                camion_id:   trip.truck_id  ? String(trip.truck_id)  : '',
                caja_id:     trip.caja_id   ? `i_${trip.caja_id}`    : '',
                destino:     trip.destino   || '',
                salida:      trip.salida    ? trip.salida.slice(0, 16) : ''
            });
            setEditingScheduleId(trip.id);
        } else {
            setScheduleForm(EMPTY_SCHEDULE_FORM);
            setEditingScheduleId(null);
        }
        setOpenScheduleModal(true);
    };

    const handleCloseScheduleModal = () => {
        setOpenScheduleModal(false);
        setScheduleForm(EMPTY_SCHEDULE_FORM);
        setEditingScheduleId(null);
    };

    const handleScheduleFormChange = (field, value) => {
        setScheduleForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveSchedule = async () => {
        const { operador_id, camion_id, caja_id, destino, salida } = scheduleForm;
        if (!operador_id || !camion_id || !caja_id || !destino || !salida) {
            Swal.fire('Campos requeridos', 'Por favor completa todos los campos.', 'warning');
            return;
        }
        const numericCajaId = String(caja_id).replace(/^[ie]_/, '');
        try {
            const formData = new FormData();
            formData.append('op', editingScheduleId !== null ? 'update' : 'insert');
            if (editingScheduleId !== null) formData.append('id', editingScheduleId);
            formData.append('driver_id', operador_id);
            formData.append('truck_id',  camion_id);
            formData.append('caja_id',   numericCajaId);
            formData.append('destino',   destino);
            formData.append('salida',    salida);
            const response = await fetch(`${apiHost}/Programacion_viajes.php`, { method: 'POST', body: formData });
            const result = await parseJsonSafe(response);
            if (response.ok && result.status === 'success') {
                await Swal.fire('¡Éxito!', result.message || 'Operación exitosa.', 'success');
                fetchScheduledTrips();
                handleCloseScheduleModal();
            } else {
                throw new Error(result.message || 'Error al guardar.');
            }
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    const handleDeleteSchedule = async (id) => {
        const confirm = await Swal.fire({ title: '¿Eliminar?', text: 'Se eliminará este viaje programado.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar', confirmButtonColor: '#d33' });
        if (!confirm.isConfirmed) return;
        try {
            const formData = new FormData();
            formData.append('op', 'delete');
            formData.append('id', id);
            const response = await fetch(`${apiHost}/Programacion_viajes.php`, { method: 'POST', body: formData });
            const result = await parseJsonSafe(response);
            if (response.ok && result.status === 'success') {
                fetchScheduledTrips();
            } else {
                throw new Error(result.message || 'Error al eliminar.');
            }
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    const getDriverName = (id) => programacionData.drivers.find(d => String(d.driver_id) === String(id))?.nombre || '-';
    const getTruckUnidad = (id) => programacionData.trucks.find(t => String(t.truck_id) === String(id))?.unidad || '-';
    const getCajaLabel = (key) => {
        if (!key) return '-';
        const k = String(key);
        if (k.startsWith('i_')) return programacionData.cajas.find(c => String(c.caja_id) === k.slice(2))?.no_caja || k;
        if (k.startsWith('e_')) return programacionData.cajasExternas.find(c => String(c.caja_externa_id) === k.slice(2))?.no_caja || k;
        return k;
    };

    const getTripMissingDocs = (trip) => {
        if (!Array.isArray(trip.etapas) || trip.etapas.length === 0) return { total: 0, list: [] };

        let totalFaltantes = 0;
        let listaFaltantes = [];

        trip.etapas.forEach(etapa => {
            if (etapa.documentos_faltantes > 0) {
                totalFaltantes += etapa.documentos_faltantes;
                if (Array.isArray(etapa.documentos_faltantes_lista)) {
                    const faltantesEtapa = etapa.documentos_faltantes_lista.map(doc => `E${etapa.stage_number}: ${doc}`);
                    listaFaltantes = [...listaFaltantes, ...faltantesEtapa];
                }
            }
        });

        return { total: totalFaltantes, list: listaFaltantes };
    };

    const getDocumentUrl = (serverPath) => {
        if (!serverPath || typeof serverPath !== 'string') return '#';
        return `${apiHost}/Uploads/Trips/${encodeURIComponent(serverPath.split(/[\\/]/).pop())}`;
    };

    const isUpcomingTab = tabValue === 0;
    const isDespachoTab = tabValue === 1;
    const isEnRutaTab = tabValue === 2;
    const isProgramacionTab = tabValue === 4;
    const showDocsColumn = isUpcomingTab || isDespachoTab;

    const currentTableColSpan = useMemo(() => {
        let cols = 8;
        if (showDocsColumn) cols = 8;
        else if (tabValue === 3) cols = isAdmin ? 11 : 10;
        else cols = isAdmin ? 10 : 9;

        if (isEnRutaTab) cols += 1;
        return cols;
    }, [showDocsColumn, tabValue, isAdmin, isEnRutaTab]);

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

                {(isAdmin || userPermissions?.viajes_crear) && (
                    <Button
                        variant="contained"
                        onClick={() => navigate('/CrearViaje')}
                        sx={{ bgcolor: '#0f172a', fontWeight: 700, borderRadius: 2, px: 3 }}
                    >
                        Crear Nuevo Viaje
                    </Button>
                )}
            </Stack>

            <Paper elevation={0} sx={{ mb: 3, bgcolor: 'transparent', borderBottom: '2px solid #e2e8f0' }}>
                <Tabs value={tabValue} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                    {allowedTabs.map(tab => <Tab key={tab.id} label={tab.label} value={tab.id} sx={{ fontWeight: 700 }} />)}
                </Tabs>
            </Paper>

            {isProgramacionTab ? (
                <Box>
                    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenScheduleModal()}
                            sx={{ bgcolor: '#0f172a', fontWeight: 700, borderRadius: 2, px: 3 }}
                        >
                            Programar Viaje
                        </Button>
                    </Box>

                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                        <Table size="small">
                            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Operador</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Camión</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Caja</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Destino</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Salida</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loadingScheduled ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <CircularProgress size={24} sx={{ mr: 2, verticalAlign: 'middle' }} />
                                            <Typography component="span" color="text.secondary">Cargando programaciones...</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : scheduledTrips.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                No hay viajes programados. Usa "Programar Viaje" para agregar uno.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    scheduledTrips.map(trip => (
                                        <TableRow key={trip.id} hover>
                                            <TableCell>{trip.driver_nombre || '-'}</TableCell>
                                            <TableCell>{trip.truck_unidad  || '-'}</TableCell>
                                            <TableCell>{trip.caja_numero   || '-'}</TableCell>
                                            <TableCell>{trip.destino}</TableCell>
                                            <TableCell>{trip.salida ? dayjs(trip.salida).format('DD/MM/YYYY HH:mm') : '-'}</TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Editar">
                                                    <IconButton size="small" onClick={() => handleOpenScheduleModal(trip)}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar">
                                                    <IconButton size="small" color="error" onClick={() => handleDeleteSchedule(trip.id)}>
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            ) : (
                <>
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
                        
                        <Grid item xs={12} sm={3}><TextField label="Company" size="small" fullWidth value={filterCompany} onChange={(e) => handleFilterChange(setFilterCompany, e.target.value)} /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Origin" size="small" fullWidth value={filterOrigin} onChange={(e) => handleFilterChange(setFilterOrigin, e.target.value)} /></Grid>
                        <Grid item xs={12} sm={3}><TextField label="Destination" size="small" fullWidth value={filterDestination} onChange={(e) => handleFilterChange(setFilterDestination, e.target.value)} /></Grid>
                        <Grid item xs={12} sm={3}>
                            <TextField select label="Direction" size="small" fullWidth value={filterDirection} onChange={(e) => handleFilterChange(setFilterDirection, e.target.value)}>
                                {DIRECTION_OPTIONS.map((option) => (<MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={3}><TextField label="CI" size="small" fullWidth value={filterCI} onChange={(e) => handleFilterChange(setFilterCI, e.target.value)} /></Grid>

                        <Grid item xs={12}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                <Button variant="text" onClick={() => { 
                                    setFilterTrip(''); setFilterDriver(''); setFilterTruck(''); setFilterTrailer(''); 
                                    setFilterCompany(''); setFilterOrigin(''); setFilterDestination(''); setFilterDirection('All'); setFilterCI('');
                                    setPage(0);
                                }}>Limpiar Filtros</Button>
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

                                    {isEnRutaTab && <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Copiar Info</TableCell>}

                                    <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Actions</TableCell>
                                    {tabValue === 3 && <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Resumen</TableCell>}
                                    {isAdmin && (tabValue === 3 || tabValue === 2) && <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Admin</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={currentTableColSpan} align="center" sx={{ py: 4 }}><CircularProgress size={24} sx={{ mr: 2, verticalAlign: 'middle' }} /><Typography component="span" color="text.secondary">Actualizando datos...</Typography></TableCell></TableRow>
                                ) : trips.length === 0 ? (
                                    <TableRow><TableCell colSpan={currentTableColSpan} align="center" sx={{ py: 4 }}><Typography variant="body2" color="text.secondary">No se localizaron registros en esta categoría.</Typography></TableCell></TableRow>
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
                                                isEnRutaTab={isEnRutaTab}
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
                                                onReactivate={(tripId, tripNumber) => handleReactivateTrip(tripId, tripNumber, isEnRutaTab)}
                                                onSalida={handleSalida}
                                            />
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', borderTop: 'none', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
                        <TablePagination rowsPerPageOptions={[25, 50, 100]} component="div" count={totalRows} rowsPerPage={rowsPerPage} page={page} onPageChange={(e, newPage) => setPage(newPage)} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} />
                    </Box>
                </>
            )}

            <Dialog open={openScheduleModal} onClose={handleCloseScheduleModal} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {editingScheduleId !== null ? 'Editar Viaje Programado' : 'Programar Viaje'}
                </DialogTitle>
                <DialogContent>
                    {loadingProgramacion ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={32} />
                        </Box>
                    ) : (
                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel id="sel-operador-label" shrink>Operador</InputLabel>
                                    <Select
                                        labelId="sel-operador-label"
                                        displayEmpty
                                        notched
                                        value={scheduleForm.operador_id}
                                        label="Operador"
                                        onChange={(e) => handleScheduleFormChange('operador_id', e.target.value)}
                                        renderValue={(val) => {
                                            if (!val) return <Typography color="text.disabled" variant="body1">Selecciona un operador</Typography>;
                                            const d = programacionData.drivers.find(x => String(x.driver_id) === val);
                                            return d ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: d.disponible ? '#22c55e' : '#ef4444', flexShrink: 0 }} />
                                                    {d.nombre}
                                                </Box>
                                            ) : val;
                                        }}
                                    >
                                        {programacionData.drivers.map(d => (
                                            <MenuItem key={d.driver_id} value={String(d.driver_id)}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: d.disponible ? '#22c55e' : '#ef4444', flexShrink: 0 }} />
                                                    {d.nombre}
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="sel-camion-label" shrink>Camión</InputLabel>
                                    <Select
                                        labelId="sel-camion-label"
                                        displayEmpty
                                        notched
                                        value={scheduleForm.camion_id}
                                        label="Camión"
                                        onChange={(e) => handleScheduleFormChange('camion_id', e.target.value)}
                                        renderValue={(val) => {
                                            if (!val) return <Typography color="text.disabled" variant="body1">Selecciona un camión</Typography>;
                                            const t = programacionData.trucks.find(x => String(x.truck_id) === val);
                                            return t ? (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: t.disponible ? '#22c55e' : '#ef4444', flexShrink: 0 }} />
                                                    <Box>
                                                        <Typography variant="body2" lineHeight={1.2}>{t.unidad}</Typography>
                                                        <Typography variant="caption" color="text.secondary">Dist. Nv Laredo: {t.dist_nv_l ?? 'N/A'}</Typography>
                                                    </Box>
                                                </Box>
                                            ) : val;
                                        }}
                                    >
                                        {programacionData.trucks.map(t => (
                                            <MenuItem key={t.truck_id} value={String(t.truck_id)}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: t.disponible ? '#22c55e' : '#ef4444', flexShrink: 0 }} />
                                                    <Box>
                                                        <Typography variant="body2" lineHeight={1.2}>{t.unidad}</Typography>
                                                        <Typography variant="caption" color="text.secondary">Dist. Nv Laredo: {t.dist_nv_l ?? 'N/A'}</Typography>
                                                    </Box>
                                                </Box>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel id="sel-caja-label" shrink>Caja</InputLabel>
                                    <Select
                                        labelId="sel-caja-label"
                                        displayEmpty
                                        notched
                                        value={scheduleForm.caja_id}
                                        label="Caja"
                                        onChange={(e) => handleScheduleFormChange('caja_id', e.target.value)}
                                        renderValue={(val) => {
                                            if (!val) return <Typography color="text.disabled" variant="body1">Selecciona una caja</Typography>;
                                            return getCajaLabel(val);
                                        }}
                                    >
                                        <ListSubheader>Cajas Propias</ListSubheader>
                                        {programacionData.cajas.map(c => (
                                            <MenuItem key={`i_${c.caja_id}`} value={`i_${c.caja_id}`}>
                                                {c.no_caja}{c.no_placa ? ` — ${c.no_placa}` : ''}
                                            </MenuItem>
                                        ))}
                                        <ListSubheader>Cajas Externas</ListSubheader>
                                        {programacionData.cajasExternas.map(c => (
                                            <MenuItem key={`e_${c.caja_externa_id}`} value={`e_${c.caja_externa_id}`}>
                                                {c.no_caja}{c.placas ? ` — ${c.placas}` : ''}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Destino"
                                    fullWidth
                                    value={scheduleForm.destino}
                                    onChange={(e) => handleScheduleFormChange('destino', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Salida"
                                    type="datetime-local"
                                    fullWidth
                                    value={scheduleForm.salida}
                                    onChange={(e) => handleScheduleFormChange('salida', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleCloseScheduleModal} color="inherit">Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveSchedule} sx={{ bgcolor: '#0f172a', fontWeight: 700 }}>
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TripAdmin;
