import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, IconButton, CircularProgress, Chip, Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { fechaCorta } from '../../utils/fechas';
import EditIcon from '@mui/icons-material/Edit';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import InspectionModal from '../../features/inspections/ui/InspeccionModal';
import {
    PAGE_SHELL_SX, PAGE_OVERLINE_SX, PAGE_TITLE_SX, HEADER_ROW_SX, HEADER_CELL_SX,
    TABLE_CONTAINER_SX, DARK_BTN_SX, CHIP_SX, CHIP_DANGER_SX, ICON_BTN_SX,
    CELL_STRONG_SX, CELL_MUTED_SX,
} from '../../shared/ui/estilos';

const apiHost = import.meta.env.VITE_API_HOST;

const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

/**
 * Inspecciones operativas hechas a los camiones en ruta.
 *
 * Igual que las reparaciones, sirve a dos módulos: como pantalla en
 * `/inspecciones` y embebida como pestaña dentro de Safety.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} [props.embedded=false] Si se pinta dentro de otra pantalla.
 * @returns {object} La pantalla.
 */
const InspeccionesPage = ({ embedded = false }) => {
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
        <Box sx={embedded ? undefined : PAGE_SHELL_SX}>
            <style>{`.swal2-container { z-index: 2000 !important; }`}</style>
            <Stack
                direction="row" justifyContent="space-between" alignItems="flex-end"
                mb={4} flexWrap="wrap" gap={2}
            >
                <Box>
                    <Typography variant="overline" sx={PAGE_OVERLINE_SX}>
                        Safety · Inspecciones
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em" sx={PAGE_TITLE_SX}>
                        Inspecciones
                    </Typography>
                    <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                        Registro y control de inspecciones operativas.
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenModal()} sx={DARK_BTN_SX}>
                    Agregar Inspección
                </Button>
            </Stack>

            <TableContainer component={Paper} elevation={0} sx={TABLE_CONTAINER_SX}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={HEADER_ROW_SX}>
                            <TableCell sx={HEADER_CELL_SX}>Folio</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Fecha</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Camión</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Viaje Asociado</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Tipo de Violación</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Descripción</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Multa IMA</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Multa Driver</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Total</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Documentos</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : inspections.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body2" color="#64748b" fontWeight={600}>
                                        No hay inspecciones registradas.
                                    </Typography>
                                    <Typography variant="caption" color="#94a3b8">
                                        Agrega la primera con el botón de arriba.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            inspections.map((row) => (
                                <TableRow key={row.id_inspeccion} hover>
                                    <TableCell sx={CELL_STRONG_SX}>{row.id_inspeccion}</TableCell>
                                    <TableCell sx={CELL_MUTED_SX}>{fechaCorta(row.fecha_inspeccion)}</TableCell>
                                    <TableCell sx={CELL_STRONG_SX}>{row.nombre_camion}</TableCell>
                                    <TableCell>
                                        {row.formatted_trip ? (
                                            <Chip
                                                label={row.formatted_trip}
                                                size="small"
                                                sx={{ ...CHIP_SX, bgcolor: '#eef2ff', color: '#4338ca', border: '1px solid #e0e7ff' }}
                                            />
                                        ) : (
                                            <Typography variant="caption" color="#94a3b8">N/A</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.tipo_violacion}
                                            size="small"
                                            sx={row.tipo_violacion === 'Out of services'
                                                ? CHIP_DANGER_SX
                                                : { ...CHIP_SX, bgcolor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' }}
                                        />
                                    </TableCell>
                                    <TableCell sx={CELL_MUTED_SX}>{row.descripcion}</TableCell>
                                    <TableCell align="right" sx={CELL_MUTED_SX}>{formatMoney(row.multa_ima)}</TableCell>
                                    <TableCell align="right" sx={CELL_MUTED_SX}>{formatMoney(row.multa_driver)}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#0f172a' }}>
                                        {formatMoney(row.total)}
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
                                                        href={doc.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        clickable
                                                        size="small"
                                                        sx={{ ...CHIP_DANGER_SX, maxWidth: 160, '& .MuiChip-icon': { color: '#b91c1c' } }}
                                                    />
                                                ))}
                                            </Stack>
                                        ) : (
                                            <Typography variant="caption" color="#94a3b8">Sin documentos</Typography>
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

            <InspectionModal
                open={modalOpen}
                onClose={handleCloseModal}
                onSuccess={handleSuccess}
                editData={selectedInspection}
                onDocumentsChanged={fetchInspections}
            />
        </Box>
    );
};

export default InspeccionesPage;