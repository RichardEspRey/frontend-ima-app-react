import React, { useState, useEffect, useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, TablePagination, TextField, Box, Typography, CircularProgress,
    IconButton, Collapse, Chip
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import EditDetailModal from '../components/EditDetailModa';
const apiHost = import.meta.env.VITE_API_HOST;


const OrderRow = ({ order, onEdit, onChangeStatus, onEditDetail }) => {
    const [open, setOpen] = useState(false);


    const getStatusChipColor = (status) => {
        if (status === 'Completado') return 'success';
        if (status === 'Pendiente') return 'warning';
        if (status === 'Cancelado') return 'error';
        return 'default';
    };

    return (
        <React.Fragment>
           
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} hover>
                <TableCell>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">#{order.id_orden}</TableCell>
                <TableCell>{order.fecha_orden}</TableCell>
                <TableCell>{order.nombre_camion || 'N/A'}</TableCell>
                <TableCell>{order.tipo_mantenimiento}</TableCell>
                <TableCell>
                    <Chip label={order.estatus} color={getStatusChipColor(order.estatus)} size="small" />
                </TableCell>
                <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" variant="outlined" onClick={() => onEdit(order.id_orden)}>
                            {order.estatus === 'Completado' ? 'Ver' : 'Editar'}
                        </Button>

                    </Box>
                </TableCell>
            </TableRow>

            
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1, padding: 2, border: '1px solid #eee', borderRadius: '4px' }}>
                            <Typography variant="h6" gutterBottom component="div" sx={{ fontSize: '1rem' }}>
                                Detalles de la Orden
                            </Typography>
                            {order.detalles && order.detalles.length > 0 ? (
                                <Table size="small" aria-label="detalles">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Tipo</TableCell>
                                            <TableCell>Descripción</TableCell>
                                            <TableCell align="right">Cantidad</TableCell>
                                            <TableCell>Estatus</TableCell>
                                            <TableCell>Acción</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {order.detalles.map((detail) => (
                                            <TableRow key={detail.id_detalle}>
                                                <TableCell>{detail.tipo_detalle}</TableCell>
                                                <TableCell>{detail.descripcion}</TableCell>
                                                <TableCell align="right">{detail.cantidad}</TableCell>
                                                <TableCell>
                                                    <Chip label={detail.estatus} color={detail.estatus === 'Completado' ? 'success' : 'default'} size="small" />
                                                </TableCell>
                                                <TableCell>
                                                    <Button size="small" onClick={() => onEditDetail(detail)}>Editar</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            ) : (
                                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                    Esta orden no tiene detalles registrados.
                                </Typography>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
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
                console.error("Respuesta no exitosa del backend:", result.message);
            }
        } catch (error) {
            console.error("Error al cargar las órdenes de servicio:", error);

            setOrders([]); 
        } finally {
            setLoading(false);
        }
    };

   
    useEffect(() => {
        fetchOrders();
    }, []);

    const handleSaveDetail = async (updatedDetail) => {
        const formData = new FormData();
        formData.append('op', 'updateDetailStatus');
        formData.append('id_detalle', updatedDetail.id_detalle);
        formData.append('estatus', updatedDetail.estatus);

        try {
            const response = await fetch(`${apiHost}/service_order.php`, { method: 'POST', body: formData });
            const result = await response.json();
            if (result.status === 'success') {
                Swal.fire('¡Éxito!', 'Detalle actualizado.', 'success');
                setEditingDetail(null); // Cierra el modal
                fetchOrders(); // Recarga la lista para ver los cambios
            } else { throw new Error(result.message); }
        } catch (error) {
            Swal.fire('Error', error.message, 'error');
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order =>

            order.id_orden.toString().includes(searchTerm) ||
            order.tipo_mantenimiento?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [orders, searchTerm]);

    const handleEditOrder = (orderId) => {
        if (!orderId) {
            console.error("ID de orden inválido");
            return;
        }
       
        navigate(`/editar-orden/${orderId}`);
    };

    const handleChangeStatus = async (orderId, currentStatus) => {
     
        Swal.fire({
            title: `Cambiar estatus de la Orden #${orderId}`,
            text: `Estatus actual: ${currentStatus}. Selecciona el nuevo estatus.`,
            input: 'select',
            inputOptions: {
                'Pendiente': 'Pendiente',
                'Completado': 'Completado',
                'Cancelado': 'Cancelado'
            },
            showCancelButton: true
        }).then((result) => {
            if (result.isConfirmed) {
                
                console.log(`Actualizar orden ${orderId} a estatus ${result.value}`);
                Swal.fire('¡Actualizado!', 'El estatus ha sido cambiado.', 'success');
                fetchOrders(); // Refrescar la lista
            }
        });
    };


 
    return (
        <Paper sx={{ margin: '20px', padding: '20px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h4" component="h1">Administrador de Órdenes</Typography>
                <Button variant="contained" onClick={() => navigate('/new-service-order')}>
                    + Crear Nueva Orden
                </Button>
            </Box>
            <TextField
                label="Buscar por ID, Camión o Mantenimiento"
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
                            <TableCell /> {/* Celda para el botón de expandir */}
                            <TableCell>ID</TableCell>
                            <TableCell>Fecha</TableCell>
                            <TableCell>Camión</TableCell>
                            <TableCell>Mantenimiento</TableCell>
                            <TableCell>Estatus</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredOrders
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((order) => (
                                <OrderRow
                                    key={order.id_orden}
                                    order={order}
                                    onEdit={handleEditOrder}
                                    onChangeStatus={handleChangeStatus}
                                    onEditDetail={(detail) => setEditingDetail(detail)}
                                />
                            ))}
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