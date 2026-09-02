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
import InspectionModal from '../../../features/inspections/ui/InspeccionModal';
import {
    HEADER_ROW_SX, HEADER_CELL_SX,
    TABLE_CONTAINER_SX, DARK_BTN_SX, CHIP_SX, CHIP_DANGER_SX, ICON_BTN_SX,
    CELL_STRONG_SX, CELL_MUTED_SX,
} from '../../../shared/ui/estilos';
import { COLOR } from '../../../shared/ui/tokens';
import { FilasEsqueleto, usePaginacion, Paginacion } from '../../../shared/ui';
import { useIdioma } from '../../../shared/i18n';

const apiHost = import.meta.env.VITE_API_HOST;

const formatMoney = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0);

/**
 * Tabla de inspecciones operativas, con su alta y edición.
 *
 * No lleva encabezado ni contenedor de página a propósito: la pone quien la usa.
 * `InspeccionesPage` le pone el título cuando es una pantalla; Safety la monta
 * dentro de una pestaña que ya tiene el suyo.
 *
 * @returns {object} La tabla renderizada.
 */
const TablaInspecciones = () => {
    const { t } = useIdioma()
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

    const { visibles, props: propsPaginacion } = usePaginacion(inspections)

    return (
        <>

            <TableContainer component={Paper} elevation={0} sx={TABLE_CONTAINER_SX}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={HEADER_ROW_SX}>
                            <TableCell sx={HEADER_CELL_SX}>Folio</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Fecha</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>{t("tabla.camion")}</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Viaje Asociado</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Tipo de Violación</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Descripción</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Multa IMA</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Multa Driver</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Total</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>{t("tabla.documentos")}</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>{t("tabla.acciones")}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <FilasEsqueleto columnas={11} />
                        ) : inspections.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body2" color={COLOR.APAGADO} fontWeight={600}>
                                        No hay inspecciones registradas.
                                    </Typography>
                                    <Typography variant="caption" color={COLOR.TENUE}>
                                        Agrega la primera con el botón de arriba.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            visibles.map((row) => (
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
                                            <Typography variant="caption" color={COLOR.TENUE}>N/A</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={row.tipo_violacion}
                                            size="small"
                                            sx={row.tipo_violacion === 'Out of services'
                                                ? CHIP_DANGER_SX
                                                : { ...CHIP_SX, bgcolor: COLOR.AVISO_FONDO, color: COLOR.AVISO, border: `1px solid ${COLOR.AVISO_BORDE}` }}
                                        />
                                    </TableCell>
                                    <TableCell sx={CELL_MUTED_SX}>{row.descripcion}</TableCell>
                                    <TableCell align="right" sx={CELL_MUTED_SX}>{formatMoney(row.multa_ima)}</TableCell>
                                    <TableCell align="right" sx={CELL_MUTED_SX}>{formatMoney(row.multa_driver)}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800, color: COLOR.TINTA }}>
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

            <Paginacion {...propsPaginacion} />

            <InspectionModal
                open={modalOpen}
                onClose={handleCloseModal}
                onSuccess={handleSuccess}
                editData={selectedInspection}
                onDocumentsChanged={fetchInspections}
            />
        </>
    );
};

export default TablaInspecciones;