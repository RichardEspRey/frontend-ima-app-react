import { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, TablePagination, TextField, Box, Typography, CircularProgress,
    Stack, Grid, FormControl, InputLabel, Select, MenuItem, IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

import useFetchRepairTypes from '../hooks/service_order/useFetchRepairTypes.jsx';
import EditDetailModal from '../components/EditDetailModa';
import { OrderRow } from '../components/OrderRow';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const apiHost = import.meta.env.VITE_API_HOST;

const ServiceOrderAdmin = () => {
    const navigate = useNavigate();
    
    // --- ESTADOS DE DATOS ---
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingDetail, setEditingDetail] = useState(null);

    // --- ESTADOS DE FILTROS ---
    const [filterId, setFilterId] = useState(''); // <--- NUEVO
    const [filterTruck, setFilterTruck] = useState('');
    const [filterMaintenance, setFilterMaintenance] = useState('All');
    const [filterRepair, setFilterRepair] = useState('All');
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    // Paginación
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Hook para Tipos de Reparación
    const { repairTypes, loadingRepairTypes, refetchRepairTypes } = useFetchRepairTypes();

    // --- FETCH ---
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('op', 'getAllOrdersWithDetails');
        try {
            const response = await fetch(`${apiHost}/service_order.php`, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.status === 'success' && Array.isArray(result.data)) {
                setOrders(result.data);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error('Error al cargar las órdenes de servicio:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    
    const handleSaveDetail = async (updated) => { 
        const formData = new FormData();
        formData.append('op', 'updateDetailStatus');
        formData.append('id_servicio', updated.id_servicio); 
        formData.append('estatus', updated.estatus);

        try {
            const response = await fetch(`${apiHost}/service_order.php`, { method: 'POST', body: formData });
            const result = await response.json();

            if (result.status === 'success') {
                Swal.fire('¡Éxito!', 'Servicio actualizado.', 'success');
                setEditingDetail(null);
                fetchOrders();
            } else {
                throw new Error(result.message || 'No se pudo actualizar.');
            }
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    };

    // --- LÓGICA DE FILTRADO ---
    const filteredOrders = useMemo(() => {
        return orders.filter((o) => {
            
            if (filterId.trim()) {
                if (!String(o.id_orden).includes(filterId.trim())) return false;
            }

            if (filterTruck.trim()) {
                const truckName = String(o.nombre_camion || '').trim().toLowerCase();
                const filterVal = filterTruck.trim().toLowerCase();
                if (truckName !== filterVal) {
                    return false;
                }
            }

            if (filterMaintenance !== 'All') {
                const servicios = o.servicios || [];
                const hasType = servicios.some(s => 
                    (s.tipo_mantenimiento || '').toLowerCase() === filterMaintenance.toLowerCase()
                );
                if (!hasType) return false;
            }

            if (filterRepair !== 'All') {
                const servicios = o.servicios || [];
                const hasRepair = servicios.some(s => 
                    (s.tipo_reparacion || '').toLowerCase() === filterRepair.toLowerCase()
                );
                if (!hasRepair) return false;
            }

            if (startDate || endDate) {
                const orderDate = dayjs(o.fecha_orden); 
                if (!orderDate.isValid()) return false;

                if (startDate && orderDate.isBefore(dayjs(startDate).startOf('day'))) return false;
                if (endDate && orderDate.isAfter(dayjs(endDate).endOf('day'))) return false;
            }

            return true;
        });
    }, [orders, filterId, filterTruck, filterMaintenance, filterRepair, startDate, endDate]);

    const handleEditOrder = (orderId) => {
        if (!orderId) return;
        navigate(`/editar-orden/${orderId}`);
    };

    const clearFilters = () => {
        setFilterId('');
        setFilterTruck('');
        setFilterMaintenance('All');
        setFilterRepair('All');
        setStartDate(null);
        setEndDate(null);
        setPage(0);
    };

    return (
        <Paper sx={{ m: 2, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" fontWeight={700}>Administrador de Órdenes</Typography>
                <Button variant="contained" onClick={() => navigate('/new-service-order')}>
                    + Crear Nueva Orden
                </Button>
            </Box>

            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                <Typography variant="subtitle2" gutterBottom color="text.secondary" fontWeight={600}>
                    Filtros de Búsqueda
                </Typography>
                
                <Grid container spacing={2} alignItems="center">
                    
                    <Grid item xs={6} sm={4} md={1.5}>
                        <TextField
                            label="ID Orden"
                            placeholder="#"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={filterId}
                            onChange={(e) => { setFilterId(e.target.value); setPage(0); }}
                        />
                    </Grid>

                    <Grid item xs={6} sm={4} md={1.5}>
                        <TextField
                            label="Camión (Exacto)"
                            placeholder="Ej: 101"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={filterTruck}
                            onChange={(e) => { setFilterTruck(e.target.value); setPage(0); }}
                        />
                    </Grid>

                    <Grid item xs={12} sm={4} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Mantenimiento</InputLabel>
                            <Select
                                value={filterMaintenance}
                                label="Mantenimiento"
                                onChange={(e) => { setFilterMaintenance(e.target.value); setPage(0); }}
                            >
                                <MenuItem value="All">Todos</MenuItem>
                                <MenuItem value="Preventivo">Preventivo</MenuItem>
                                <MenuItem value="Correctivo">Correctivo</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Tipo Reparación</InputLabel>
                            <Select
                                value={filterRepair}
                                label="Tipo Reparación"
                                onChange={(e) => { setFilterRepair(e.target.value); setPage(0); }}
                                disabled={loadingRepairTypes}
                            >
                                <MenuItem value="All">Todas</MenuItem>
                                {repairTypes.map((type) => (
                                    <MenuItem key={type.value} value={type.label}>
                                        {type.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => { setStartDate(date); setPage(0); }}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                placeholderText="Desde"
                                dateFormat="dd/MM/yyyy"
                                className="form-input-datepicker" 
                                isClearable
                                customInput={<TextField size="small" fullWidth label="Desde" />}
                            />
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => { setEndDate(date); setPage(0); }}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                placeholderText="Hasta"
                                dateFormat="dd/MM/yyyy"
                                className="form-input-datepicker"
                                isClearable
                                customInput={<TextField size="small" fullWidth label="Hasta" />}
                            />
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={2} display="flex" justifyContent="flex-end" gap={1}>
                        <IconButton 
                            color="error" 
                            onClick={clearFilters}
                            title="Limpiar Filtros"
                            sx={{ border: '1px solid #ffcdd2', borderRadius: 1 }}
                        >
                            <DeleteSweepIcon />
                        </IconButton>
                        <Button 
                            variant="outlined" 
                            color="primary"
                            size="small"
                            onClick={() => { fetchOrders(); refetchRepairTypes(); }}
                            startIcon={<RefreshIcon />}
                            sx={{ minWidth: '100px' }}
                        >
                            Refrescar
                        </Button>
                    </Grid>

                </Grid>
            </Paper>

            <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell sx={{ fontWeight: 600 }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Camión</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Servicios</TableCell>
                            <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Mano de obra</TableCell>
                            <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Refacciones</TableCell>
                            <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>T. cambio</TableCell>
                            <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Total</TableCell>
                            <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Estatus</TableCell>
                            <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={11} align="center">
                                    <Box sx={{ py: 4, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
                                        <CircularProgress size={24} />
                                        <Typography>Cargando órdenes…</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} align="center">
                                    <Typography color="text.secondary" sx={{ py: 3 }}>
                                        No hay órdenes que coincidan con los filtros seleccionados.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredOrders
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((order) => (
                                    <OrderRow
                                        key={order.id_orden}
                                        order={order}
                                        onEdit={handleEditOrder}
                                        onEditDetail={(detail) => setEditingDetail(detail)}
                                    />
                                ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[10, 25, 50]}
                component="div"
                count={filteredOrders.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                labelRowsPerPage="Filas por página:"
            />

            <EditDetailModal
                isOpen={!!editingDetail}
                detail={editingDetail}
                onClose={() => setEditingDetail(null)}
                onSave={handleSaveDetail}
            />
        </Paper>
    );
};

export default ServiceOrderAdmin;