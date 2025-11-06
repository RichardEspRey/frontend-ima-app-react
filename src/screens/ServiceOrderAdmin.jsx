// src/pages/ServiceOrderAdmin.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, TablePagination, TextField, Box, Typography, CircularProgress,
    Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import EditDetailModal from '../components/EditDetailModa';
import { OrderRow } from '../components/OrderRow'; // Importado

const apiHost = import.meta.env.VITE_API_HOST;

// ... (Las funciones money, getStatusChipColor, OrderRow, etc. se asumen definidas/importadas)

const ServiceOrderAdmin = () => {
    const [editingDetail, setEditingDetail] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const navigate = useNavigate();

    // ... (fetchOrders, useEffect, handleSaveDetail, filteredOrders, handleEditOrder se mantienen) ...

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
                console.error('Respuesta no exitosa del backend:', result.message);
            }
        } catch (error) {
            console.error('Error al cargar las órdenes de servicio:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [apiHost]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);
    
    const handleSaveDetail = async (updated) => { 
        const formData = new FormData();
        formData.append('op', 'updateDetailStatus');
        formData.append('id_servicio', updated.id_servicio); 
        formData.append('estatus', updated.estatus);

        try {
            const response = await fetch(`${apiHost}/service_order.php`, {
                method: 'POST',
                body: formData,
            });
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


    const filteredOrders = useMemo(() => {
        const term = (searchTerm || '').toLowerCase().trim();
        if (!term) return orders;
        return orders.filter((o) => {
            const idMatch = String(o.id_orden).includes(term);
            const camionMatch = (o.nombre_camion || '').toLowerCase().includes(term);
            const servicios = o.servicios || [];
            const svcMatch = servicios.some(s =>
                (s.tipo_mantenimiento || '').toLowerCase().includes(term) ||
                (s.tipo_reparacion || '').toLowerCase().includes(term)
            );
            return idMatch || camionMatch || svcMatch;
        });
    }, [orders, searchTerm]);

    const handleEditOrder = (orderId) => {
        if (!orderId) return;
        navigate(`/editar-orden/${orderId}`);
    };

    return (
        <Paper sx={{ m: 2, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" fontWeight={700}>Administrador de Órdenes</Typography>
                <Button variant="contained" onClick={() => navigate('/new-service-order')}>
                    + Crear Nueva Orden
                </Button>
            </Box>

            <TextField
                label="Buscar por ID, Camión o Tipo de servicio"
                variant="outlined"
                fullWidth
                size="small"
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(0);
                }}
                sx={{ mb: 2 }}
            />

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
                                    <Typography color="text.secondary" sx={{ py: 3 }}>No hay órdenes que coincidan.</Typography>
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