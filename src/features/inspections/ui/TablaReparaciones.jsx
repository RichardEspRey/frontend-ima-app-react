import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, Chip, Stack
} from '@mui/material';
import { urlSegura } from '../../../shared/security';
import AddIcon from '@mui/icons-material/Add';
import { fechaCorta } from '../../../utils/fechas';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import RoadRepairModal from '../../../features/inspections/ui/ReparacionModal';
import {
    HEADER_ROW_SX, HEADER_CELL_SX,
    TABLE_CONTAINER_SX, DARK_BTN_SX, CHIP_SX, CHIP_DANGER_SX, ICON_BTN_SX,
    CELL_STRONG_SX, CELL_MUTED_SX,
} from '../../../shared/ui/estilos';
import { COLOR } from '../../../shared/ui/tokens';
import { FilasEsqueleto } from '../../../shared/ui';

const apiHost = import.meta.env.VITE_API_HOST;

const money = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

/**
 * Tabla de reparaciones en ruta, con su alta y edición.
 *
 * No lleva encabezado ni contenedor de página a propósito: la pone quien la usa.
 * `ReparacionesRutaPage` le pone el título cuando es una pantalla; Safety la monta
 * dentro de una pestaña que ya tiene el suyo.
 *
 * @returns {object} La tabla renderizada.
 */
const TablaReparaciones = () => {
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
        fetchRepairs(); 
    };

    return (
        <>

            <TableContainer component={Paper} elevation={0} sx={TABLE_CONTAINER_SX}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={HEADER_ROW_SX}>
                            <TableCell sx={HEADER_CELL_SX}>ID</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Fecha</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Camión</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Viaje Asociado</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Costo Rep.</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Costo Ref.</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Total</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Documentos</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <FilasEsqueleto columnas={9} />
                        ) : repairs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body2" color={COLOR.APAGADO} fontWeight={600}>
                                        No hay reparaciones registradas.
                                    </Typography>
                                    <Typography variant="caption" color={COLOR.TENUE}>
                                        Agrega la primera con el botón de arriba.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            repairs.map((row) => (
                                <TableRow key={row.id_reparacion} hover>
                                    <TableCell sx={CELL_MUTED_SX}>{row.id_reparacion}</TableCell>
                                    <TableCell sx={CELL_MUTED_SX}>{fechaCorta(row.fecha_suceso)}</TableCell>
                                    <TableCell sx={CELL_STRONG_SX}>{row.nombre_camion}</TableCell>
                                    <TableCell>
                                        {row.formatted_trip ? (
                                            <Chip
                                                label={row.formatted_trip}
                                                size="small"
                                                sx={{ ...CHIP_SX, bgcolor: '#eef2ff', color: '#4338ca', border: '1px solid #e0e7ff' }}
                                            />
                                        ) : (
                                            <Typography variant="caption" color={COLOR.TENUE}>No asociado</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right" sx={CELL_MUTED_SX}>{money(row.costo_reparacion)}</TableCell>
                                    <TableCell align="right" sx={CELL_MUTED_SX}>{money(row.costo_refacciones)}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800, color: COLOR.TINTA }}>
                                        {money(row.total)}
                                    </TableCell>
                                    <TableCell>
                                        {Array.isArray(row.documentos) && row.documentos.length > 0 ? (
                                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                {row.documentos.map((doc) => (
                                                    <Chip
                                                        key={doc.id_doc || doc.file_path}
                                                        icon={<PictureAsPdfIcon />}
                                                        label={doc.file_name || 'Documento'}
                                                        component="a"
                                                        href={urlSegura(doc.url)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        clickable
                                                        size="small"
                                                        sx={{ ...CHIP_DANGER_SX, maxWidth: 160, '& .MuiChip-icon': { color: COLOR.PELIGRO } }}
                                                    />
                                                ))}
                                            </Stack>
                                        ) : (
                                            <Typography variant="caption" color={COLOR.TENUE}>Sin documentos</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" onClick={() => handleOpenModal(row)} sx={ICON_BTN_SX}>
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
                onDocumentsChanged={fetchRepairs}
            />
        </>
    );
};

export default TablaReparaciones;