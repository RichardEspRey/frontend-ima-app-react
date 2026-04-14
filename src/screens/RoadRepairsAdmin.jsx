import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import RoadRepairModal from '../components/RoadRepairModal';

const apiHost = import.meta.env.VITE_API_HOST;

const money = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

const RoadRepairsAdmin = () => {
    const [repairs, setRepairs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRepair, setSelectedRepair] = useState(null);

    const fetchRepairs = async () => {
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('op', 'getAll');
            const res = await fetch(`${apiHost}/roadside_repairs.php`, { method: 'POST', body: fd });
            const data = await res.json();
            if (data.status === 'success') {
                setRepairs(data.data);
            }
        } catch (error) {
            console.error("Error fetching repairs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRepairs();
    }, []);

    const handleOpenModal = (repair = null) => {
        setSelectedRepair(repair);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedRepair(null);
    };

    const handleSuccess = () => {
        handleCloseModal();
        fetchRepairs(); // Refrescar la tabla
    };

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight={700}>Reparaciones en Carretera</Typography>
                <Button variant="contained" color="primary" onClick={() => handleOpenModal()}>
                    + Agregar Reparación
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Camión</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Costo Rep.</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Costo Ref.</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>Total</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    <CircularProgress size={24} /> <Typography>Cargando...</Typography>
                                </TableCell>
                            </TableRow>
                        ) : repairs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    No hay reparaciones registradas.
                                </TableCell>
                            </TableRow>
                        ) : (
                            repairs.map((row) => (
                                <TableRow key={row.id_reparacion} hover>
                                    <TableCell>{row.id_reparacion}</TableCell>
                                    <TableCell>{new Date(row.fecha_registro).toLocaleDateString()}</TableCell>
                                    <TableCell>{row.nombre_camion}</TableCell>
                                    <TableCell align="right">{money(row.costo_reparacion)}</TableCell>
                                    <TableCell align="right">{money(row.costo_refacciones)}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                        {money(row.total)}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton color="primary" onClick={() => handleOpenModal(row)}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <RoadRepairModal 
                open={modalOpen} 
                onClose={handleCloseModal} 
                onSuccess={handleSuccess} 
                editData={selectedRepair} 
            />
        </Box>
    );
};

export default RoadRepairsAdmin;