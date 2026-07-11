import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, CircularProgress, Chip, Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import InspectionModal from '../components/InspectionModal';

const apiHost = import.meta.env.VITE_API_HOST;

const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

const InspectionsAdmin = () => {
    const [inspections, setInspections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedInspection, setSelectedInspection] = useState(null);

    const fetchInspections = async () => {
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('op', 'getAll');
            const res = await fetch(`${apiHost}/inspecciones.php`, { method: 'POST', body: fd });
            const data = await res.json();
            if (data.status === 'success') {
                setInspections(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInspections();
    }, []);

    const handleOpenModal = (inspection = null) => {
        setSelectedInspection(inspection);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedInspection(null);
    };

    const handleSuccess = () => {
        handleCloseModal();
        fetchInspections(); 
    };

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
            <style>{`.swal2-container { z-index: 2000 !important; }`}</style>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="#0f172a">Inspecciones</Typography>
                    <Typography variant="subtitle1" color="#64748b">Registro y control de inspecciones operativas</Typography>
                </Box>
                <Button variant="contained" disableElevation onClick={() => handleOpenModal()} sx={{ bgcolor: '#0f172a' }}>
                    Agregar Inspección
                </Button>
            </Stack>

            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
                <Table size="small">
                    <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Folio</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Fecha</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Camión</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Viaje Asociado</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Tipo de Violación</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Descripción</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'right' }}>Multa IMA</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'right' }}>Multa Driver</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'right' }}>Total</TableCell>
                            <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                                    <CircularProgress size={24} sx={{ mr: 2 }} />
                                </TableCell>
                            </TableRow>
                        ) : inspections.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body2" color="text.secondary">No hay inspecciones registradas.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            inspections.map((row) => (
                                <TableRow key={row.id_inspeccion} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{row.id_inspeccion}</TableCell>
                                    <TableCell>{new Date(row.fecha_registro).toLocaleDateString()}</TableCell>
                                    <TableCell>{row.nombre_camion}</TableCell>
                                    <TableCell>
                                        {row.formatted_trip ? (
                                            <Chip label={row.formatted_trip} size="small" variant="outlined" />
                                        ) : (
                                            <Typography variant="caption" color="text.secondary">N/A</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={row.tipo_violacion} 
                                            size="small" 
                                            color={row.tipo_violacion === 'Out of services' ? 'error' : 'warning'} 
                                            sx={{ fontWeight: 700 }}
                                        />
                                    </TableCell>
                                    <TableCell>{row.descripcion}</TableCell>
                                    <TableCell align="right">{formatMoney(row.multa_ima)}</TableCell>
                                    <TableCell align="right">{formatMoney(row.multa_driver)}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                        {formatMoney(row.total)}
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

            <InspectionModal 
                open={modalOpen} 
                onClose={handleCloseModal} 
                onSuccess={handleSuccess} 
                editData={selectedInspection} 
            />
        </Box>
    );
};

export default InspectionsAdmin;