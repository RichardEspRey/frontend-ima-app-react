import React, { useState, useEffect, useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, TablePagination, TextField, Box, Typography, CircularProgress,
    IconButton, Collapse, Chip, Card, CardContent, CardActions, CardHeader, Divider, Stack
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import EditDetailModal from '../components/EditDetailModa';

const apiHost = import.meta.env.VITE_API_HOST;

/* === helpers === */
const money = (v) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })
        .format(Number(v || 0));

const getStatusChipColor = (status) => {
    if (!status) return 'default';
    const s = String(status).toLowerCase();
    if (s === 'completado' || s === 'cerrada' || s === 'cerrado') return 'success';
    if (s === 'pendiente' || s === 'abierta' || s === 'abierto') return 'warning';
    if (s === 'cancelado' || s === 'cancelada') return 'error';
    return 'default';
};

/* === Row con collapse === */
const OrderRow = ({ order, onEdit, onEditDetail }) => {
    const [open, setOpen] = useState(false);
    const servicios = order?.servicios ?? [];
    const tipoCambio = Number(order?.tipo_cambio ?? 0) || 0;

 
    // Resumen “N servicios”
    const serviciosResumen = useMemo(() => {
        const n = servicios.length;
        return n ? `${n} servicio${n > 1 ? 's' : ''}` : '—';
    }, [servicios]);

    // Totales de la ORDEN (sumando todos los servicios/detalles)
    const totalsOrder = useMemo(() => {
        let mo = 0;
        let items = 0;
        for (const s of servicios) {
            for (const d of (s.detalles ?? [])) {
                const isMO = String(d.tipo_detalle || '').toLowerCase() === 'mano de obra';
                const costo = parseFloat(d.costo ?? 0) || 0;
                const cant = parseFloat(d.cantidad ?? 0) || 0;
                if (isMO) mo += costo; else items += (costo * cant);
            }
        }
        return { mo, items, total: mo + items };
    }, [servicios]);
    
       const totalMostrado = useMemo(() => {
        // si hay tipo_cambio > 0, multiplicamos el total
        return tipoCambio > 0 ? (totalsOrder.total * tipoCambio) : totalsOrder.total;
    }, [totalsOrder.total, tipoCambio]);

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} hover>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">#{order.id_orden}</TableCell>
                <TableCell>{order.fecha_orden}</TableCell>
                <TableCell>{order.nombre_camion || 'N/A'}</TableCell>
                <TableCell>{serviciosResumen}</TableCell>

                {/* NUEVAS columnas calculadas por orden */}
                <TableCell>{money(totalsOrder.mo)}</TableCell>
                <TableCell>{money(totalsOrder.items)}</TableCell>

                <TableCell>
                    {tipoCambio > 0 ? tipoCambio.toFixed(2) : '—'}
                </TableCell>

                <TableCell><strong>{money(totalMostrado)}</strong></TableCell>

                <TableCell>
                    <Chip label={order.estatus || '—'} color={getStatusChipColor(order.estatus)} size="small" />
                </TableCell>
                <TableCell>
                    <Button size="small" variant="outlined" onClick={() => onEdit(order.id_orden)}>
                        {String(order.estatus).toLowerCase() === 'completado' ? 'Ver' : 'Editar'}
                    </Button>
                </TableCell>
            </TableRow>

            {/* Collapse con cards de servicios */}
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ m: 1, p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
                            <Typography variant="h6" gutterBottom component="div" sx={{ fontSize: '1rem', mb: 2 }}>
                                Servicios de la Orden #{order.id_orden}
                            </Typography>

                            {servicios.length === 0 ? (
                                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                    Esta orden no tiene servicios registrados.
                                </Typography>
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 2,
                                        overflowX: 'auto',
                                        pb: 1,
                                        '&::-webkit-scrollbar': { height: 8 },
                                        '&::-webkit-scrollbar-thumb': { backgroundColor: '#c7c7c7', borderRadius: 8 }
                                    }}
                                >
                                    {servicios.map((svc, idx) => {
                                        const detalles = svc?.detalles ?? [];

                                        const totales = detalles.reduce((acc, d) => {
                                            const costo = parseFloat(d.costo ?? 0) || 0;
                                            const cant = parseFloat(d.cantidad ?? 0) || 0;
                                            const sub = (d.tipo_detalle?.toLowerCase() === 'mano de obra')
                                                ? costo // MO registrada como cantidad 1 y costo total
                                                : costo * cant;
                                            return {
                                                mo: acc.mo + (d.tipo_detalle?.toLowerCase() === 'mano de obra' ? costo : 0),
                                                items: acc.items + (d.tipo_detalle?.toLowerCase() !== 'mano de obra' ? sub : 0),
                                            };
                                        }, { mo: 0, items: 0 });
                                        const totalServicio = totales.mo + totales.items;

                                        return (
                                            <Card key={svc.id_servicio} sx={{ minWidth: 360, maxWidth: 420, flex: '0 0 auto' }} elevation={2}>
                                                <CardHeader
                                                    title={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                                Servicio {idx + 1}
                                                            </Typography>
                                                            <Chip
                                                                label={svc.estatus || 'Abierta'}
                                                                size="small"
                                                                color={getStatusChipColor(svc.estatus)}
                                                            />
                                                        </Box>
                                                    }
                                                    subheader={
                                                        <Box>
                                                            <Typography variant="body2">
                                                                <strong>Mantenimiento:</strong> {svc.tipo_mantenimiento || '—'}
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                <strong>Reparación:</strong> {svc.tipo_reparacion || '—'}
                                                            </Typography>
                                                            {svc.fecha_termino && (
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Fecha: {svc.fecha_termino}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    }
                                                />
                                                <Divider />
                                                <CardContent>
                                                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                                        Detalles
                                                    </Typography>

                                                    {detalles.length === 0 ? (
                                                        <Typography variant="body2" color="text.secondary">
                                                            Sin detalles.
                                                        </Typography>
                                                    ) : (
                                                        <Stack spacing={1.25}>
                                                            {detalles.map((det) => {
                                                                const isMO = String(det.tipo_detalle || '').toLowerCase() === 'mano de obra';
                                                                const costo = parseFloat(det.costo ?? 0) || 0;
                                                                const cantidad = parseFloat(det.cantidad ?? 0) || 0;
                                                                const subtotal = isMO ? costo : (costo * cantidad);

                                                                return (
                                                                    <Paper key={det.id_detalle} variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 1 }}>
                                                                            <Box sx={{ minWidth: 0 }}>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                                                    <Chip
                                                                                        label={det.tipo_detalle || '—'}
                                                                                        size="small"
                                                                                        variant="outlined"
                                                                                    />
                                                                                    {det.id_articulo ? (
                                                                                        <Chip
                                                                                            label={`ID Art: ${det.id_articulo}`}
                                                                                            size="small"
                                                                                            color="default"
                                                                                            variant="outlined"
                                                                                        />
                                                                                    ) : null}
                                                                                </Box>
                                                                                <Typography variant="body2" sx={{ mt: 0.5 }} noWrap title={det.descripcion}>
                                                                                    {det.descripcion || '—'}
                                                                                </Typography>
                                                                                {!isMO && (
                                                                                    <Typography variant="caption" color="text.secondary">
                                                                                        Cant.: {cantidad} · Costo u.: {money(costo)}
                                                                                    </Typography>
                                                                                )}
                                                                            </Box>
                                                                            <Box sx={{ textAlign: 'right' }}>
                                                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                                                    {money(subtotal)}
                                                                                </Typography>

                                                                            </Box>
                                                                        </Box>
                                                                    </Paper>
                                                                );
                                                            })}
                                                        </Stack>
                                                    )}

                                                    <Divider sx={{ my: 1.5 }} />
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            MO: <strong>{money(totales.mo)}</strong>
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Items: <strong>{money(totales.items)}</strong>
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                            Total: {money(totalServicio)}
                                                        </Typography>
                                                    </Box>
                                                </CardContent>
                                                <CardActions sx={{ justifyContent: 'center', pt: 0, pb: 2 }}>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() =>
                                                            onEditDetail({
                                                                id_servicio: svc.id_servicio,         // <- lo que necesita tu API
                                                                estatus: svc.estatus || 'Pendiente',  // para precargar el select
                                                                titulo: `Servicio ${idx + 1}`,
                                                                tipo_mantenimiento: svc.tipo_mantenimiento,
                                                                tipo_reparacion: svc.tipo_reparacion,
                                                            })
                                                        }
                                                    >
                                                        EDITAR
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        );
                                    })}
                                </Box>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>

        </>
    );
};

const ServiceOrderAdmin = () => {
    const [editingDetail, setEditingDetail] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const navigate = useNavigate();

    const fetchOrders = async () => {
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
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleSaveDetail = async (updated) => {
        const formData = new FormData();
        formData.append('op', 'updateDetailStatus');
        formData.append('id_servicio', updated.id_servicio); // <- clave correcta
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


    // Filtro: por ID orden, nombre de camión, o tipos de mantenimiento/reparación en cualquier servicio
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
        <Paper sx={{ m: 2, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">Administrador de Órdenes</Typography>
                <Button variant="contained" onClick={() => navigate('/new-service-order')}>
                    + Crear Nueva Orden
                </Button>
            </Box>

            <TextField
                label="Buscar por ID, Camión o Tipo de servicio"
                variant="outlined"
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
            />

            <TableContainer>
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>ID</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Camión</TableCell>
                            <TableCell>Servicios</TableCell>
                            <TableCell>Mano de obra</TableCell>
                            <TableCell>Refacciones</TableCell>
                            <TableCell>Tipo de cambio</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Estatus</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
                                    <Box sx={{ py: 4, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
                                        <CircularProgress size={24} />
                                        <Typography>Cargando órdenes…</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : filteredOrders.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
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
