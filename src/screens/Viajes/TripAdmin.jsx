import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, TablePagination, TextField, Box, Typography, CircularProgress, Alert,
    Grid, Stack, FormControl, InputLabel, Select, MenuItem, Collapse, Tabs, Tab,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip,
    InputAdornment, Divider, ToggleButtonGroup, ToggleButton
} from '@mui/material';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import TripOriginIcon from '@mui/icons-material/TripOrigin';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import '../css/TripAdmin.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import { TripRow } from '../../components/TripRow';
import { useAuthStore } from '../../store/useAuthStore';
import ModalCajaExterna from '../../components/ModalCajaExterna';
import RoadRepairModal from '../../components/RoadRepairModal';
import InspectionModal from '../../components/InspectionModal';

// ── Map helpers (ruta camión → Nuevo Laredo) ────────────────────────────────

const NUEVO_LAREDO = { lat: 27.4849, lon: -99.5164 };

function makeDotIcon(color, size = 14) {
    return L.divIcon({
        className: '',
        html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 1px 5px rgba(0,0,0,.45)"></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

function FitBounds({ coords }) {
    const map = useMap();
    const prevRef = useRef(null);
    useEffect(() => {
        if (!coords || coords.length === 0) return;
        const key = coords[0]?.toString() + coords[coords.length - 1]?.toString();
        if (key === prevRef.current) return;
        prevRef.current = key;
        map.fitBounds(L.latLngBounds(coords), { padding: [40, 40] });
    }, [coords, map]);
    return null;
}

async function getRoute(points) {
    const coords = points.map((p) => `${p.lon},${p.lat}`).join(';');
    const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
    );
    const data = await res.json();
    if (data.code !== 'Ok') throw new Error('No se pudo calcular la ruta');
    return {
        miles: data.routes[0].distance / 1609.344,
        coords: data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]),
    };
}

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

// Estilo compartido del encabezado de tabla: micro-label discreta en vez de
// texto grueso sobre una caja de color sólido.
const HEADER_ROW_SX = { bgcolor: '#fafbfc', borderBottom: '1px solid #e2e8f0' };
const HEADER_CELL_SX = {
    fontWeight: 700, color: '#94a3b8', fontSize: '0.7rem',
    textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: 'none',
};


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

const SPECIAL_EDIT_USERS = new Set(['Blanca', 'Angelica', 'Israel', 'Richard']);

const TripAdmin = () => {
    const { userPermissions, user } = useAuthStore();
    const isAdmin = user?.tipo_usuario?.toLowerCase() === 'admin' || user?.name === 'Blanca';
    const canSpecialEdit = SPECIAL_EDIT_USERS.has(user?.name);
    const canManageInvoice = isAdmin || userPermissions?.viajes_invoice_fields === true;
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

    const activeFilterCount = useMemo(() => {
        return [filterTrip, filterDriver, filterTruck, filterTrailer, filterCompany, filterOrigin, filterDestination, filterCI]
            .filter(Boolean).length + (filterDirection && filterDirection !== 'All' ? 1 : 0);
    }, [filterTrip, filterDriver, filterTruck, filterTrailer, filterCompany, filterOrigin, filterDestination, filterDirection, filterCI]);

    // Programación de viajes
    const [scheduledTrips, setScheduledTrips] = useState([]);
    const [openScheduleModal, setOpenScheduleModal] = useState(false);
    const [scheduleForm, setScheduleForm] = useState(EMPTY_SCHEDULE_FORM);
    const [editingScheduleId, setEditingScheduleId] = useState(null);
    const [programacionData, setProgramacionData] = useState({ trucks: [], drivers: [], cajas: [], cajasExternas: [] });
    const [loadingProgramacion, setLoadingProgramacion] = useState(false);
    const [loadingScheduled, setLoadingScheduled] = useState(false);
    const [scheduleTrailerType, setScheduleTrailerType] = useState('interna');
    const [isModalCajaExternaOpen, setIsModalCajaExternaOpen] = useState(false);
    const [repairModalTrip, setRepairModalTrip] = useState(null);
    const [inspectionModalTrip, setInspectionModalTrip] = useState(null);

    // Memorizados para no recrear el objeto en cada render (ej. el refresco de
    // permisos cada 15s en DashboardLayout): si la referencia cambiara sin que
    // el viaje realmente cambie, el useEffect de los modales se reinicia y
    // parece que "recargan" solos mientras están abiertos.
    const repairInitialTrip = useMemo(() => (repairModalTrip ? {
        trip_id: repairModalTrip.trip_id,
        formatted_trip: repairModalTrip.trip_number,
        operador: repairModalTrip.driver_nombre || '',
        truck_id: repairModalTrip.truck_id ? String(repairModalTrip.truck_id) : '',
    } : null), [repairModalTrip]);

    const inspectionInitialTrip = useMemo(() => (inspectionModalTrip ? {
        trip_id: inspectionModalTrip.trip_id,
        formatted_trip: inspectionModalTrip.trip_number,
        operador: inspectionModalTrip.driver_nombre || '',
        truck_id: inspectionModalTrip.truck_id ? String(inspectionModalTrip.truck_id) : '',
    } : null), [inspectionModalTrip]);

    // Mapa: ruta del camión seleccionado hacia Nuevo Laredo
    const [selectedMapTripId, setSelectedMapTripId] = useState(null);
    const [mapRouteCoords, setMapRouteCoords] = useState(null);
    const [mapMarkers, setMapMarkers] = useState(null);
    const [mapLoading, setMapLoading] = useState(false);
    const [mapError, setMapError] = useState('');

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
        } else {
            setSelectedMapTripId(null);
            setMapRouteCoords(null);
            setMapMarkers(null);
            setMapError('');
        }
    }, [tabValue, fetchProgramacionData, fetchScheduledTrips]);

    const handleSelectTripRow = async (trip) => {
        if (selectedMapTripId === trip.id) {
            setSelectedMapTripId(null);
            setMapRouteCoords(null);
            setMapMarkers(null);
            setMapError('');
            return;
        }

        const lat = parseFloat(trip.last_latitude);
        const lon = parseFloat(trip.last_longitude);
        if (isNaN(lat) || isNaN(lon)) {
            Swal.fire('Sin ubicación', 'Este camión no tiene una ubicación registrada.', 'warning');
            return;
        }

        setSelectedMapTripId(trip.id);
        setMapRouteCoords(null);
        setMapMarkers(null);
        setMapError('');
        setMapLoading(true);

        try {
            const truckGeo = { lat, lon };
            const route = await getRoute([truckGeo, NUEVO_LAREDO]);
            setMapRouteCoords(route.coords);
            setMapMarkers({ truck: truckGeo, destination: NUEVO_LAREDO });
        } catch (err) {
            setMapError(err.message || 'Error al calcular la ruta.');
        } finally {
            setMapLoading(false);
        }
    };

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

    const handleSpecialEdit = (tripId) => navigate(`/edit-trip-complete/${tripId}`);

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
            const cajaValue = trip.caja_externa_id ? `e_${trip.caja_externa_id}` : (trip.caja_id ? `i_${trip.caja_id}` : '');
            setScheduleForm({
                operador_id: trip.driver_id ? String(trip.driver_id) : '',
                camion_id:   trip.truck_id  ? String(trip.truck_id)  : '',
                caja_id:     cajaValue,
                destino:     trip.destino   || '',
                salida:      trip.salida    ? trip.salida.slice(0, 16) : ''
            });
            setScheduleTrailerType(cajaValue.startsWith('e_') ? 'externa' : 'interna');
            setEditingScheduleId(trip.id);
        } else {
            setScheduleForm(EMPTY_SCHEDULE_FORM);
            setScheduleTrailerType('interna');
            setEditingScheduleId(null);
        }
        setOpenScheduleModal(true);
    };

    const handleCloseScheduleModal = () => {
        setOpenScheduleModal(false);
        setScheduleForm(EMPTY_SCHEDULE_FORM);
        setScheduleTrailerType('interna');
        setEditingScheduleId(null);
    };

    const handleScheduleFormChange = (field, value) => {
        setScheduleForm(prev => ({ ...prev, [field]: value }));
    };

    const handleScheduleTrailerTypeChange = (type) => {
        if (!type) return;
        setScheduleTrailerType(type);
        setScheduleForm(prev => ({ ...prev, caja_id: '' }));
    };

    const handleSaveExternalCaja = async (cajaData) => {
        const fd = new FormData();
        fd.append('op', 'Alta');
        Object.entries(cajaData).forEach(([k, v]) => fd.append(k, v));
        try {
            const res = await fetch(`${apiHost}/caja_externa.php`, { method: 'POST', body: fd });
            const result = await res.json();
            if (result.status === 'success' && result.caja) {
                Swal.fire('¡Éxito!', 'Caja externa registrada.', 'success');
                setProgramacionData(prev => ({ ...prev, cajasExternas: [...prev.cajasExternas, result.caja] }));
                setScheduleTrailerType('externa');
                setScheduleForm(prev => ({ ...prev, caja_id: `e_${result.caja.caja_externa_id}` }));
                setIsModalCajaExternaOpen(false);
            } else {
                throw new Error(result.message || 'Error al registrar la caja externa.');
            }
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    const handleSaveSchedule = async () => {
        const { operador_id, camion_id, caja_id, destino, salida } = scheduleForm;
        if (!destino || !salida) {
            Swal.fire('Campos requeridos', 'Por favor completa el destino y la fecha de salida.', 'warning');
            return;
        }
        const isCajaExterna = String(caja_id).startsWith('e_');
        const numericCajaId = caja_id ? String(caja_id).replace(/^[ie]_/, '') : '';
        try {
            const formData = new FormData();
            formData.append('op', editingScheduleId !== null ? 'update' : 'insert');
            if (editingScheduleId !== null) formData.append('id', editingScheduleId);
            formData.append('driver_id', operador_id);
            formData.append('truck_id',  camion_id);
            formData.append('caja_id',         isCajaExterna ? '' : numericCajaId);
            formData.append('caja_externa_id', isCajaExterna ? numericCajaId : '');
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
                if (selectedMapTripId === id) {
                    setSelectedMapTripId(null);
                    setMapRouteCoords(null);
                    setMapMarkers(null);
                    setMapError('');
                }
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
        else if (tabValue === 3) cols = isAdmin ? 10 : 9;
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

            <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4} flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.12em', fontSize: '0.7rem', lineHeight: 1 }}>
                        Viajes · Tiempo Real
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em" sx={{ mt: 0.25 }}>
                        Administrador de Viajes
                    </Typography>
                    <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                        Gestión y control de despachos, estatus y rutas en tiempo real.
                    </Typography>
                </Box>

                {(isAdmin || userPermissions?.viajes_crear) && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/CrearViaje')}
                        sx={{
                            bgcolor: '#0f172a', fontWeight: 700, borderRadius: 2, px: 3, py: 1.1,
                            textTransform: 'none', boxShadow: 'none', transition: 'all 0.15s',
                            '&:hover': { bgcolor: '#1e293b', boxShadow: '0 6px 16px rgba(15,23,42,0.22)' },
                        }}
                    >
                        Crear Nuevo Viaje
                    </Button>
                )}
            </Stack>

            <Box sx={{ mb: 3, display: 'inline-flex', bgcolor: '#f1f5f9', borderRadius: 2.5, p: 0.5 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile
                    TabIndicatorProps={{ sx: { display: 'none' } }}
                    sx={{ minHeight: 0, '& .MuiTabs-flexContainer': { gap: 0.5 } }}
                >
                    {allowedTabs.map(tab => (
                        <Tab
                            key={tab.id}
                            label={tab.label}
                            value={tab.id}
                            disableRipple
                            sx={{
                                minHeight: 36, minWidth: 0, px: 2.5, py: 1, borderRadius: 2,
                                fontWeight: 600, fontSize: '0.85rem', textTransform: 'none',
                                color: '#64748b', transition: 'background-color 0.15s, color 0.15s',
                                '&.Mui-selected': { bgcolor: '#0f172a', color: '#fff' },
                            }}
                        />
                    ))}
                </Tabs>
            </Box>

            {isProgramacionTab ? (
                <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography variant="body2" color="#64748b">
                            {loadingScheduled ? 'Cargando programaciones…' : `${scheduledTrips.length} viaje${scheduledTrips.length === 1 ? '' : 's'} programado${scheduledTrips.length === 1 ? '' : 's'}`}
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleOpenScheduleModal()}
                            sx={{
                                bgcolor: '#0f172a', fontWeight: 700, borderRadius: 2, px: 3, textTransform: 'none', boxShadow: 'none',
                                '&:hover': { bgcolor: '#1e293b', boxShadow: '0 6px 16px rgba(15,23,42,0.22)' },
                            }}
                        >
                            Programar Viaje
                        </Button>
                    </Stack>

                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={HEADER_ROW_SX}>
                                    <TableCell sx={HEADER_CELL_SX}>Operador</TableCell>
                                    <TableCell sx={HEADER_CELL_SX}>Camión</TableCell>
                                    <TableCell sx={HEADER_CELL_SX}>Distancia Nv Laredo</TableCell>
                                    <TableCell sx={HEADER_CELL_SX}>Caja</TableCell>
                                    <TableCell sx={HEADER_CELL_SX}>Caja Externa</TableCell>
                                    <TableCell sx={HEADER_CELL_SX}>Destino</TableCell>
                                    <TableCell sx={HEADER_CELL_SX}>Salida</TableCell>
                                    <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loadingScheduled ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                            <CircularProgress size={22} sx={{ mr: 1.5, verticalAlign: 'middle', color: '#94a3b8' }} />
                                            <Typography component="span" color="#64748b" fontWeight={500}>Cargando programaciones...</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : scheduledTrips.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                                            <InboxOutlinedIcon sx={{ fontSize: 34, color: '#cbd5e1', mb: 1 }} />
                                            <Typography variant="body2" color="#94a3b8" fontWeight={500}>
                                                No hay viajes programados. Usa "Programar Viaje" para agregar uno.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    scheduledTrips.map(trip => (
                                        <TableRow
                                            key={trip.id}
                                            hover
                                            selected={selectedMapTripId === trip.id}
                                            onClick={() => handleSelectTripRow(trip)}
                                            sx={{ cursor: 'pointer' }}
                                        >
                                            <TableCell sx={{ fontWeight: 600 }}>{trip.driver_nombre || '-'}</TableCell>
                                            <TableCell>{trip.truck_unidad  || '-'}</TableCell>
                                            <TableCell sx={{ color: '#64748b' }}>
                                                {trip.dist_nv_l != null ? `${trip.dist_nv_l} Km` : 'No obtenido'}
                                            </TableCell>
                                            <TableCell>{trip.caja_numero   || '-'}</TableCell>
                                            <TableCell>{trip.caja_externa_numero || '-'}</TableCell>
                                            <TableCell>{trip.destino}</TableCell>
                                            <TableCell sx={{ fontVariantNumeric: 'tabular-nums', color: '#64748b' }}>{trip.salida ? dayjs(trip.salida).format('DD/MM/YYYY HH:mm') : '-'}</TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="Editar">
                                                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleOpenScheduleModal(trip); }} sx={{ '&:hover': { bgcolor: '#f1f5f9' } }}>
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Eliminar">
                                                    <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(trip.id); }} sx={{ '&:hover': { bgcolor: '#fef2f2' } }}>
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

                    {selectedMapTripId && (
                        <Paper elevation={0} sx={{ mt: 2, border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                            <Box sx={{ px: 2.5, py: 1.5, borderBottom: '1px solid #e2e8f0' }}>
                                <Typography variant="subtitle2" fontWeight={700} color="#475569"
                                    sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Ruta a Nuevo Laredo — Camión {scheduledTrips.find(t => t.id === selectedMapTripId)?.truck_unidad || ''}
                                </Typography>
                            </Box>

                            <Stack direction="row" spacing={2.5}
                                sx={{ px: 2.5, py: 1, borderBottom: '1px solid #f1f5f9', flexWrap: 'wrap' }}>
                                <Stack direction="row" alignItems="center" spacing={0.8}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#9c27b0',
                                        border: '2px solid white', boxShadow: '0 0 3px rgba(0,0,0,.3)' }} />
                                    <Typography variant="caption" color="text.secondary">Camión</Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={0.8}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f44336',
                                        border: '2px solid white', boxShadow: '0 0 3px rgba(0,0,0,.3)' }} />
                                    <Typography variant="caption" color="text.secondary">Nuevo Laredo</Typography>
                                </Stack>
                                <Stack direction="row" alignItems="center" spacing={0.8}>
                                    <Box sx={{ width: 20, height: 3, bgcolor: '#1976d2', borderRadius: 1 }} />
                                    <Typography variant="caption" color="text.secondary">Ruta</Typography>
                                </Stack>
                            </Stack>

                            <Box sx={{ position: 'relative', height: 420 }}>
                                {mapLoading && (
                                    <Stack alignItems="center" justifyContent="center"
                                        sx={{ position: 'absolute', inset: 0, zIndex: 1000, bgcolor: 'rgba(255,255,255,0.7)' }}>
                                        <CircularProgress size={32} />
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                                            Calculando ruta…
                                        </Typography>
                                    </Stack>
                                )}

                                {mapError && !mapLoading && (
                                    <Alert severity="error" sx={{ position: 'absolute', top: 8, left: 8, right: 8, zIndex: 1000 }}>
                                        {mapError}
                                    </Alert>
                                )}

                                <MapContainer
                                    key={selectedMapTripId}
                                    center={[NUEVO_LAREDO.lat, NUEVO_LAREDO.lon]}
                                    zoom={6}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />

                                    {mapRouteCoords && <FitBounds coords={mapRouteCoords} />}

                                    {mapRouteCoords && (
                                        <Polyline
                                            positions={mapRouteCoords}
                                            pathOptions={{ color: '#1976d2', weight: 4, opacity: 0.9 }}
                                        />
                                    )}

                                    {mapMarkers?.truck && (
                                        <Marker position={[mapMarkers.truck.lat, mapMarkers.truck.lon]} icon={makeDotIcon('#9c27b0', 16)}>
                                            <Popup>Camión {scheduledTrips.find(t => t.id === selectedMapTripId)?.truck_unidad || ''}</Popup>
                                        </Marker>
                                    )}
                                    {mapMarkers?.destination && (
                                        <Marker position={[mapMarkers.destination.lat, mapMarkers.destination.lon]} icon={makeDotIcon('#f44336', 16)}>
                                            <Popup>Nuevo Laredo, Tamps.</Popup>
                                        </Marker>
                                    )}
                                </MapContainer>
                            </Box>
                        </Paper>
                    )}
                </Box>
            ) : (
                <>
                    <Box sx={{ mb: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<FilterListIcon />}
                            onClick={() => setShowFilters(p => !p)}
                            sx={{
                                bgcolor: 'white', borderColor: activeFilterCount > 0 ? '#0f172a' : '#cbd5e1',
                                color: '#334155', fontWeight: 600, textTransform: 'none', borderRadius: 2,
                            }}
                        >
                            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
                            {activeFilterCount > 0 && (
                                <Box component="span" sx={{
                                    ml: 1, minWidth: 20, height: 20, px: 0.6, borderRadius: '10px',
                                    bgcolor: '#0f172a', color: '#fff', fontSize: '0.72rem', fontWeight: 700,
                                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {activeFilterCount}
                                </Box>
                            )}
                        </Button>
                    </Box>

            <Collapse in={showFilters}>
                <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e2e8f0' }} elevation={0}>
                    <Stack spacing={2.5}>
                        <Box>
                            <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.68rem' }}>
                                Identificación
                            </Typography>
                            <Grid container spacing={2} sx={{ mt: 0.25 }}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField label="Trip Number" size="small" fullWidth value={filterTrip} onChange={(e) => handleFilterChange(setFilterTrip, e.target.value)}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><ConfirmationNumberOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment> }} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField label="Driver" size="small" fullWidth value={filterDriver} onChange={(e) => handleFilterChange(setFilterDriver, e.target.value)}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutlineIcon sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment> }} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField label="Truck" size="small" fullWidth value={filterTruck} onChange={(e) => handleFilterChange(setFilterTruck, e.target.value)}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><LocalShippingOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment> }} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <TextField label="Trailer" size="small" fullWidth value={filterTrailer} onChange={(e) => handleFilterChange(setFilterTrailer, e.target.value)}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><Inventory2OutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment> }} />
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider sx={{ borderColor: '#f1f5f9' }} />

                        <Box>
                            <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.68rem' }}>
                                Ruta
                            </Typography>
                            <Grid container spacing={2} sx={{ mt: 0.25 }}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField label="Origin" size="small" fullWidth value={filterOrigin} onChange={(e) => handleFilterChange(setFilterOrigin, e.target.value)}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><TripOriginIcon sx={{ fontSize: 16, color: '#94a3b8' }} /></InputAdornment> }} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField label="Destination" size="small" fullWidth value={filterDestination} onChange={(e) => handleFilterChange(setFilterDestination, e.target.value)}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><PlaceOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment> }} />
                                </Grid>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField select label="Direction" size="small" fullWidth value={filterDirection} onChange={(e) => handleFilterChange(setFilterDirection, e.target.value)}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><SwapHorizIcon sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment> }}>
                                        {DIRECTION_OPTIONS.map((option) => (<MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>))}
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider sx={{ borderColor: '#f1f5f9' }} />

                        <Box>
                            <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.68rem' }}>
                                Otros
                            </Typography>
                            <Grid container spacing={2} sx={{ mt: 0.25 }}>
                                <Grid item xs={12} sm={6} md={4}>
                                    <TextField label="Company" size="small" fullWidth value={filterCompany} onChange={(e) => handleFilterChange(setFilterCompany, e.target.value)}
                                        InputProps={{ startAdornment: <InputAdornment position="start"><ApartmentOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment> }} />
                                </Grid>
                                {canManageInvoice && (
                                    <Grid item xs={12} sm={6} md={4}>
                                        <TextField label="CI" size="small" fullWidth value={filterCI} onChange={(e) => handleFilterChange(setFilterCI, e.target.value)}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><BadgeOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment> }} />
                                    </Grid>
                                )}
                            </Grid>
                        </Box>

                        <Stack direction="row" justifyContent="flex-end">
                            <Button
                                variant="text"
                                disabled={activeFilterCount === 0}
                                sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}
                                onClick={() => {
                                    setFilterTrip(''); setFilterDriver(''); setFilterTruck(''); setFilterTrailer('');
                                    setFilterCompany(''); setFilterOrigin(''); setFilterDestination(''); setFilterDirection('All'); setFilterCI('');
                                    setPage(0);
                                }}
                            >
                                Limpiar Filtros
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            </Collapse>

                    {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflow: 'hidden' }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={HEADER_ROW_SX}>
                                    <TableCell sx={HEADER_CELL_SX} />
                                    <TableCell sx={HEADER_CELL_SX}>Trip</TableCell>
                                    <TableCell sx={HEADER_CELL_SX}>Driver(s)</TableCell>
                                    <TableCell sx={HEADER_CELL_SX}>Truck</TableCell>
                                    <TableCell sx={HEADER_CELL_SX}>Trailer</TableCell>

                                    {!showDocsColumn && <TableCell sx={HEADER_CELL_SX}>Initial Date</TableCell>}
                                    <TableCell sx={HEADER_CELL_SX}>Status</TableCell>
                                    {!showDocsColumn && <TableCell sx={HEADER_CELL_SX}>Return Date</TableCell>}
                                    {showDocsColumn && <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Documentos Faltantes</TableCell>}

                                    {isEnRutaTab && <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Copiar Info</TableCell>}

                                    <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Actions</TableCell>
                                    {isAdmin && (tabValue === 3 || tabValue === 2) && <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Admin</TableCell>}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={currentTableColSpan} align="center" sx={{ py: 5 }}><CircularProgress size={22} sx={{ mr: 1.5, verticalAlign: 'middle', color: '#94a3b8' }} /><Typography component="span" color="#64748b" fontWeight={500}>Actualizando datos...</Typography></TableCell></TableRow>
                                ) : trips.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={currentTableColSpan} align="center" sx={{ py: 6 }}>
                                            <InboxOutlinedIcon sx={{ fontSize: 34, color: '#cbd5e1', mb: 1 }} />
                                            <Typography variant="body2" color="#94a3b8" fontWeight={500}>No se localizaron registros en esta categoría.</Typography>
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
                                                canSpecialEdit={canSpecialEdit}
                                                canManageInvoice={canManageInvoice}
                                                isCompletedTab={tabValue === 3}
                                                isDespachoTab={isDespachoTab}
                                                isUpcomingTab={isUpcomingTab}
                                                isEnRutaTab={isEnRutaTab}
                                                onEdit={handleEditTrip}
                                                showDocsColumn={showDocsColumn}
                                                documentosFaltantes={total}
                                                documentosFaltantesLista={list}
                                                getDocumentUrl={getDocumentUrl}
                                                colSpanOverride={currentTableColSpan}
                                                onDelete={handleDeleteTrip}
                                                onAlmostOver={handleAlmostOverTrip}
                                                onFinalize={handleFinalizeTrip}
                                                onReactivate={(tripId, tripNumber) => handleReactivateTrip(tripId, tripNumber, isEnRutaTab)}
                                                onSpecialEdit={handleSpecialEdit}
                                                onSalida={handleSalida}
                                                onSummary={handleSummary}
                                                onOpenRoadRepair={setRepairModalTrip}
                                                onOpenInspection={setInspectionModalTrip}
                                            />
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Box sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', borderTop: 'none', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                        <TablePagination
                            rowsPerPageOptions={[25, 50, 100]} component="div" count={totalRows} rowsPerPage={rowsPerPage} page={page}
                            onPageChange={(e, newPage) => setPage(newPage)}
                            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                            sx={{ color: '#475569', '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '0.8rem' } }}
                        />
                    </Box>
                </>
            )}

            <Dialog open={openScheduleModal} onClose={handleCloseScheduleModal} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', pb: 1 }}>
                    <Box>
                        <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.68rem' }}>
                            Programación de Viajes
                        </Typography>
                        <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ mt: -0.25 }}>
                            {editingScheduleId !== null ? 'Editar Viaje Programado' : 'Programar Viaje'}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={handleCloseScheduleModal} sx={{ mt: 0.5 }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {loadingProgramacion ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={32} sx={{ color: '#94a3b8' }} />
                        </Box>
                    ) : (
                        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
                            {(scheduleForm.operador_id || scheduleForm.camion_id || scheduleForm.caja_id) && (
                                <Stack
                                    direction="row" alignItems="center" spacing={1} flexWrap="wrap"
                                    sx={{ p: 1.5, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}
                                >
                                    <Typography variant="body2" fontWeight={600} color={scheduleForm.operador_id ? '#0f172a' : '#cbd5e1'}>
                                        {scheduleForm.operador_id ? getDriverName(scheduleForm.operador_id) : 'Operador'}
                                    </Typography>
                                    <ArrowForwardIcon sx={{ fontSize: 14, color: '#cbd5e1' }} />
                                    <Typography variant="body2" fontWeight={600} color={scheduleForm.camion_id ? '#0f172a' : '#cbd5e1'}>
                                        {scheduleForm.camion_id ? getTruckUnidad(scheduleForm.camion_id) : 'Camión'}
                                    </Typography>
                                    <ArrowForwardIcon sx={{ fontSize: 14, color: '#cbd5e1' }} />
                                    <Typography variant="body2" fontWeight={600} color={scheduleForm.caja_id ? '#0f172a' : '#cbd5e1'}>
                                        {scheduleForm.caja_id ? getCajaLabel(scheduleForm.caja_id) : 'Caja'}
                                    </Typography>
                                </Stack>
                            )}

                            <Box>
                                <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.68rem' }}>
                                    Recursos
                                </Typography>
                                <Grid container spacing={2} sx={{ mt: 0.25 }}>
                                    <Grid item xs={12}>
                                        <FormControl fullWidth>
                                            <InputLabel id="sel-operador-label" shrink>Operador</InputLabel>
                                            <Select
                                                labelId="sel-operador-label"
                                                displayEmpty
                                                notched
                                                value={scheduleForm.operador_id}
                                                label="Operador"
                                                startAdornment={<InputAdornment position="start"><PersonOutlineIcon sx={{ fontSize: 20, color: '#94a3b8', ml: 0.5 }} /></InputAdornment>}
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
                                                startAdornment={<InputAdornment position="start"><LocalShippingOutlinedIcon sx={{ fontSize: 20, color: '#94a3b8', ml: 0.5 }} /></InputAdornment>}
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
                                    <Grid item xs={12}>
                                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.25 }}>
                                            <Inventory2OutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                                            <Typography variant="body2" fontWeight={600} color="#334155">Caja</Typography>
                                            <ToggleButtonGroup
                                                value={scheduleTrailerType}
                                                exclusive
                                                size="small"
                                                onChange={(e, val) => handleScheduleTrailerTypeChange(val)}
                                                sx={{
                                                    ml: 'auto',
                                                    '& .MuiToggleButton-root': {
                                                        textTransform: 'none', fontWeight: 600, fontSize: '0.78rem',
                                                        px: 1.5, py: 0.3, color: '#64748b', borderColor: '#e2e8f0',
                                                        '&.Mui-selected': { bgcolor: '#0f172a', color: '#fff', '&:hover': { bgcolor: '#1e293b' } },
                                                    },
                                                }}
                                            >
                                                <ToggleButton value="interna">Interna</ToggleButton>
                                                <ToggleButton value="externa">Externa</ToggleButton>
                                            </ToggleButtonGroup>
                                        </Stack>

                                        {scheduleTrailerType === 'interna' ? (
                                            <FormControl fullWidth>
                                                <InputLabel id="sel-caja-label" shrink>Caja Interna</InputLabel>
                                                <Select
                                                    labelId="sel-caja-label"
                                                    displayEmpty
                                                    notched
                                                    value={scheduleForm.caja_id}
                                                    label="Caja Interna"
                                                    onChange={(e) => handleScheduleFormChange('caja_id', e.target.value)}
                                                    renderValue={(val) => {
                                                        if (!val) return <Typography color="text.disabled" variant="body1">Selecciona una caja interna</Typography>;
                                                        return getCajaLabel(val);
                                                    }}
                                                >
                                                    {programacionData.cajas.length === 0 && (
                                                        <MenuItem disabled value="">No hay cajas internas disponibles</MenuItem>
                                                    )}
                                                    {programacionData.cajas.map(c => (
                                                        <MenuItem key={`i_${c.caja_id}`} value={`i_${c.caja_id}`}>
                                                            {c.no_caja}{c.no_placa ? ` — ${c.no_placa}` : ''}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        ) : (
                                            <Stack direction="row" spacing={1}>
                                                <FormControl fullWidth>
                                                    <InputLabel id="sel-caja-externa-label" shrink>Caja Externa</InputLabel>
                                                    <Select
                                                        labelId="sel-caja-externa-label"
                                                        displayEmpty
                                                        notched
                                                        value={scheduleForm.caja_id}
                                                        label="Caja Externa"
                                                        onChange={(e) => handleScheduleFormChange('caja_id', e.target.value)}
                                                        renderValue={(val) => {
                                                            if (!val) return <Typography color="text.disabled" variant="body1">Selecciona una caja externa</Typography>;
                                                            return getCajaLabel(val);
                                                        }}
                                                    >
                                                        {programacionData.cajasExternas.length === 0 && (
                                                            <MenuItem disabled value="">No hay cajas externas registradas</MenuItem>
                                                        )}
                                                        {programacionData.cajasExternas.map(c => (
                                                            <MenuItem key={`e_${c.caja_externa_id}`} value={`e_${c.caja_externa_id}`}>
                                                                {c.no_caja}{c.placas ? ` — ${c.placas}` : ''}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                                <Tooltip title="Registrar nueva caja externa">
                                                    <Button
                                                        variant="outlined"
                                                        onClick={() => setIsModalCajaExternaOpen(true)}
                                                        sx={{ minWidth: 44, px: 0, borderColor: '#cbd5e1', color: '#0f172a', borderRadius: 2 }}
                                                    >
                                                        <AddIcon fontSize="small" />
                                                    </Button>
                                                </Tooltip>
                                            </Stack>
                                        )}
                                    </Grid>
                                </Grid>
                            </Box>

                            <Divider sx={{ borderColor: '#f1f5f9' }} />

                            <Box>
                                <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.68rem' }}>
                                    Detalles del Viaje
                                </Typography>
                                <Grid container spacing={2} sx={{ mt: 0.25 }}>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Destino"
                                            fullWidth
                                            value={scheduleForm.destino}
                                            onChange={(e) => handleScheduleFormChange('destino', e.target.value)}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><PlaceOutlinedIcon sx={{ fontSize: 20, color: '#94a3b8' }} /></InputAdornment> }}
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
                                            InputProps={{ startAdornment: <InputAdornment position="start"><ScheduleOutlinedIcon sx={{ fontSize: 20, color: '#94a3b8' }} /></InputAdornment> }}
                                        />
                                    </Grid>
                                </Grid>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
                    <Button onClick={handleCloseScheduleModal} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>Cancelar</Button>
                    <Button
                        variant="contained" onClick={handleSaveSchedule}
                        sx={{
                            bgcolor: '#0f172a', fontWeight: 700, borderRadius: 2, px: 3, textTransform: 'none', boxShadow: 'none',
                            '&:hover': { bgcolor: '#1e293b', boxShadow: '0 6px 16px rgba(15,23,42,0.22)' },
                        }}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            <ModalCajaExterna
                isOpen={isModalCajaExternaOpen}
                onClose={() => setIsModalCajaExternaOpen(false)}
                onSave={handleSaveExternalCaja}
            />

            <RoadRepairModal
                open={!!repairModalTrip}
                onClose={() => setRepairModalTrip(null)}
                onSuccess={() => setRepairModalTrip(null)}
                initialTrip={repairInitialTrip}
            />

            <InspectionModal
                open={!!inspectionModalTrip}
                onClose={() => setInspectionModalTrip(null)}
                onSuccess={() => setInspectionModalTrip(null)}
                initialTrip={inspectionInitialTrip}
            />
        </Box>
    );
};

export default TripAdmin;
