import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, Paper, Typography, Grid, Stack, TextField, Button, 
    CircularProgress, IconButton, Divider, Dialog, DialogTitle, 
    DialogContent, DialogActions, Chip, Tooltip
} from '@mui/material'; 
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import SaveIcon from '@mui/icons-material/Save';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import Swal from 'sweetalert2';

import ModalArchivo from '../../../components/ModalArchivo';

import useFetchSubcategories from '../../../hooks/expense_hooks/useFetchSubcategories';
import useFetchCategories from '../../../hooks/expense_hooks/useFetchCategories';
import useFetchExpenseTypes from '../../../hooks/expense_hooks/useFetchExpenseTypes';
import useFetchExchangeRate from '../../../hooks/useFetchExchangeRate';
import { useAuthStore } from '../../../store/useAuthStore';
import FieldLabel from '../../../components/Gastos/FieldLabel';
import {
    SECTION_LABEL_SX, CARD_SX, DARK_BTN_SX, GHOST_BTN_SX, INPUT_SX,
    DATEPICKER_CSS, money,
} from '../estilos';
import { COLOR } from '../../../shared/ui/tokens';
import { SelectorBusqueda, CampoFecha, aTextoFecha } from '../../../shared/ui';

const apiHost = import.meta.env.VITE_API_HOST;

/**
 * Alta de un gasto general, con sus renglones y sus archivos.
 *
 * Un gasto es una factura o un ticket: una fecha, un país, una moneda y uno o
 * varios renglones, cada uno con su tipo, categoría y subcategoría. Los
 * capturados en México se guardan en pesos y en su equivalente en dólares al
 * tipo de cambio del día.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.open Si el modal se muestra.
 * @param {Function} props.onClose Cierra el modal.
 * @param {Function} props.onSuccess Se llama al guardar, para refrescar la tabla.
 * @returns {object} El modal renderizado.
 */
const ExpenseModal = ({ open, onClose, onSuccess }) => {
    const { user } = useAuthStore();
    const id = user?.id;
    const [country, setCountry] = useState(null);
    const [expenseDate, setExpenseDate] = useState(new Date());
    const [ticketDate, setTicketDate] = useState(new Date()); 
    const [totalAmount, setTotalAmount] = useState('0.00');
    const [originalAmount, setOriginalAmount] = useState('');
    
    const { exchangeRate, setExchangeRate, fetchExchangeRate } = useFetchExchangeRate();
    const [expenseDetails, setExpenseDetails] = useState([]);
    
    const { expenseTypes, loading: typesLoading } = useFetchExpenseTypes();
    const { maintenanceCategories, loading: catLoading } = useFetchCategories();
    const { subcategories, loading: subLoading } = useFetchSubcategories();

    const [modalState, setModalState] = useState({ isOpen: false, fileType: null });
    const [files, setFiles] = useState({ facturaPdf: null, ticketJpg: null });
    const [saving, setSaving] = useState(false);

    const resetForm = useCallback(() => {
        setCountry(null); 
        setExpenseDate(new Date()); 
        setTicketDate(new Date());
        setTotalAmount('0.00');
        setOriginalAmount(''); 
        setExchangeRate(''); 
        setExpenseDetails([]);
        setFiles({ facturaPdf: null, ticketJpg: null });
    }, [setExchangeRate]); 

    useEffect(() => {
        if (open) {
            resetForm();
        }
    }, [open, resetForm]);

    const handleAddDetail = useCallback(() => {
        setExpenseDetails(prev => [...prev, {
            id: Date.now(), 
            expenseType: null, 
            category: null, 
            subcategory: null,
            itemId: null, 
            price: '', 
            quantity: '1', 
            itemDescription: ''
        }]);
    }, []);

    const handleRemoveDetail = useCallback((id) => {
        setExpenseDetails(p => p.filter(d => d.id !== id));
    }, []);

    const handleDetailChange = (id, field, value) => {
        setExpenseDetails(prev => prev.map(d => {
            if (d.id !== id) return d;
            
            const updated = { ...d, [field]: value };
            
            if (field === 'expenseType') {
                updated.category = null;
                updated.subcategory = null;
            }
            if (field === 'category') {
                const propias = subcategories.filter(sub => String(sub.id_categoria) === String(value));
                updated.subcategory = propias.length === 1 ? propias[0].value : null;
            }
            
            return updated;
        }));
    };

    const handleSaveFromModal = (data) => {
        if (modalState.fileType) {
            setFiles(prev => ({ ...prev, [modalState.fileType]: data.file }));
        }
        setModalState({ isOpen: false, fileType: null });
    };

    const handleRemoveFile = (type) => {
        setFiles(prev => ({ ...prev, [type]: null }));
    };

    useEffect(() => {
        const isMX = country && country.value === 'MX';
        const rate = parseFloat(exchangeRate) || 0;
        
        if (isMX && !rate) fetchExchangeRate();
        
        let newTotal = 0;
        
        if (originalAmount) {
            const original = parseFloat(originalAmount);
            if (!isMX) {
                newTotal = original;
            } else {
                newTotal = rate ? original / rate : 0;
            }
        } else {
            newTotal = expenseDetails.reduce((sum, item) => {
                const p = parseFloat(item.price) || 0;
                const q = parseInt(item.quantity) || 0;
                return sum + (p * q);
            }, 0);
        }
        
        setTotalAmount(newTotal.toFixed(2));
    }, [country, originalAmount, exchangeRate, expenseDetails, fetchExchangeRate]);

    const handleSaveExpense = async (e) => {
        e.preventDefault();
        
        if (!country || expenseDetails.length === 0) {
            return Swal.fire('Faltan datos', 'Selecciona país y agrega al menos un detalle', 'warning');
        }

        setSaving(true);
        
        const isMX = country && country.value === 'MX';
        const apiFormData = new FormData();
        
        if (files.facturaPdf) apiFormData.append('factura_pdf_file', files.facturaPdf);
        if (files.ticketJpg) apiFormData.append('ticket_jpg_file', files.ticketJpg);

        const generalData = {
            fecha_gasto: aTextoFecha(expenseDate),
            fecha_ticket: aTextoFecha(ticketDate),
            pais: country?.value,
            moneda: isMX ? 'MXN' : 'USD',
            monto_total: totalAmount,
            cantidad_original: originalAmount,
            tipo_cambio: isMX ? exchangeRate : '',
            id_usuario: id
        };
        apiFormData.append('generalData', JSON.stringify(generalData));

        const detailsData = expenseDetails.map(detail => ({
            id_tipo_gasto: detail.expenseType,
            id_articulo: detail.itemId,
            descripcion_articulo: detail.itemDescription,
            cantidad_articulo: detail.quantity,
            precio_unitario: detail.price,
            id_categoria_mantenimiento: detail.category || null,
            id_subcategoria_mantenimiento: detail.subcategory || null,
        }));
        apiFormData.append('detailsData', JSON.stringify(detailsData));
        apiFormData.append('op', 'Alta');

        try {
            const res = await fetch(`${apiHost}/save_expense.php`, { method: 'POST', body: apiFormData });
            const result = await res.json();
            
            if (result.status === 'success') {
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Gasto guardado', showConfirmButton: false, timer: 2000 });
                onSuccess(); // 🚨 Cierra el modal y refresca la tabla
            } else {
                throw new Error(result.message);
            }
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const countries = [{ value: 'MX', label: 'México' }, { value: 'US', label: 'Estados Unidos' }];

    return (
        <Dialog
            open={open}
            onClose={!saving ? onClose : undefined}
            maxWidth="lg"
            fullWidth
            scroll="paper"
            PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
        >
            <style>{DATEPICKER_CSS}</style>

            <DialogTitle sx={{ bgcolor: COLOR.BLANCO, borderBottom: `1px solid ${COLOR.BORDE}`, px: { xs: 2, md: 4 }, py: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                        <Typography variant="overline" sx={{ ...SECTION_LABEL_SX, letterSpacing: '0.12em', fontSize: '0.7rem', lineHeight: 1 }}>
                            Gastos · Nuevo
                        </Typography>
                        <Typography variant="h5" fontWeight={800} color={COLOR.TINTA} letterSpacing="-0.02em" sx={{ mt: 0.25 }}>
                            Nuevo Gasto
                        </Typography>
                        <Typography variant="body2" color={COLOR.APAGADO} sx={{ mt: 0.5 }}>
                            Captura los datos generales, los conceptos y adjunta los documentos.
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} sx={{ color: COLOR.APAGADO }} disabled={saving}>
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ bgcolor: COLOR.LIENZO, p: { xs: 2, md: 4 } }}>
                <Grid container spacing={3}>
                    <Grid
                        size={{
                            xs: 12,
                            md: 8
                        }}>
                        
                        <Paper sx={{ ...CARD_SX, mb: 3 }} elevation={0}>
                            <Typography variant="overline" sx={SECTION_LABEL_SX}>Datos Generales</Typography>
                            <Grid container spacing={2} sx={{ mt: 0.25 }}>
                                <Grid
                                    size={{
                                        xs: 12,
                                        md: 4
                                    }}>
                                    <FieldLabel>País</FieldLabel>
                                    <SelectorBusqueda
                                        options={countries} value={country} onChange={setCountry}
                                        placeholder="Seleccionar…"
                                    />
                                </Grid>
                                <Grid
                                    size={{
                                        xs: 12,
                                        md: 4
                                    }}>
                                    <FieldLabel>Fecha de Ticket</FieldLabel>
                                    <CampoFecha
                                        value={ticketDate} onChange={setTicketDate}
                                    />
                                </Grid>
                                <Grid
                                    size={{
                                        xs: 12,
                                        md: 4
                                    }}>
                                    <FieldLabel>Fecha Contable</FieldLabel>
                                    <CampoFecha
                                        value={expenseDate} onChange={setExpenseDate}
                                    />
                                </Grid>

                                <Grid
                                    size={{
                                        xs: 12,
                                        md: 4
                                    }}>
                                    <FieldLabel>Monto Original ({country?.value === 'MX' ? 'MXN' : 'USD'})</FieldLabel>
                                    <TextField fullWidth type="number" size="small" value={originalAmount} onChange={e => setOriginalAmount(e.target.value)} InputProps={{ sx: INPUT_SX }} />
                                </Grid>
                                {country?.value === 'MX' && (
                                    <Grid
                                        size={{
                                            xs: 12,
                                            md: 4
                                        }}>
                                        <FieldLabel>Tipo de Cambio</FieldLabel>
                                        <TextField fullWidth type="number" size="small" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} InputProps={{ sx: INPUT_SX }} />
                                    </Grid>
                                )}
                                <Grid
                                    size={{
                                        xs: 12,
                                        md: 4
                                    }}>
                                    <FieldLabel>Total Calculado (USD)</FieldLabel>
                                    <TextField fullWidth value={money(totalAmount)} size="small" InputProps={{ readOnly: true, sx: { ...INPUT_SX, bgcolor: COLOR.LIENZO } }} />
                                </Grid>
                            </Grid>
                        </Paper>

                        <Paper sx={CARD_SX} elevation={0}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Box>
                                    <Typography variant="overline" sx={SECTION_LABEL_SX}>Conceptos</Typography>
                                    <Typography variant="body2" color={COLOR.APAGADO}>
                                        {expenseDetails.length} concepto{expenseDetails.length === 1 ? '' : 's'} en este gasto
                                    </Typography>
                                </Box>
                                <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={handleAddDetail} sx={{ ...GHOST_BTN_SX, py: 0.75 }}>
                                    Agregar
                                </Button>
                            </Stack>
                            
                            <Stack spacing={2}>
                                {expenseDetails.map((detail) => {
                                    const relevantCategories = maintenanceCategories.filter(c => String(c.id_tipo_gasto) === String(detail.expenseType));
                                    const hasCategories = relevantCategories.length > 0;
                                    const relevantSubs = subcategories.filter(s => String(s.id_categoria) === String(detail.category));
                                    const hasSubcategories = relevantSubs.length > 0;

                                    let mdSelectSize = 12;
                                    if (hasCategories && hasSubcategories) mdSelectSize = 4;
                                    else if (hasCategories) mdSelectSize = 6;

                                    return (
                                        <Paper key={detail.id} elevation={0} sx={{ p: 2, bgcolor: COLOR.CABECERA, borderRadius: 2, border: `1px solid ${COLOR.BORDE}` }}>
                                            <Grid container spacing={2} alignItems="center">
                                                
                                                <Grid
                                                    size={{
                                                        xs: 12,
                                                        md: mdSelectSize
                                                    }}>
                                                    <FieldLabel>Tipo</FieldLabel>
                                                    <SelectorBusqueda
                                                        options={expenseTypes} value={expenseTypes.find(t => String(t.value) === String(detail.expenseType)) || null}
                                                        onChange={opt => handleDetailChange(detail.id, 'expenseType', opt?.value)}
                                                        isLoading={typesLoading} placeholder="Tipo…"
                                                    />
                                                </Grid>
                                                
                                                {hasCategories && (
                                                    <Grid
                                                        size={{
                                                            xs: 12,
                                                            md: mdSelectSize
                                                        }}>
                                                        <FieldLabel>Categoría</FieldLabel>
                                                        <SelectorBusqueda
                                                            options={relevantCategories} value={relevantCategories.find(c => c.value === detail.category) || null}
                                                            onChange={opt => handleDetailChange(detail.id, 'category', opt?.value)}
                                                            isLoading={catLoading} placeholder="Categoría…"
                                                        />
                                                    </Grid>
                                                )}
                                                
                                                {hasSubcategories && (
                                                    <Grid
                                                        size={{
                                                            xs: 12,
                                                            md: mdSelectSize
                                                        }}>
                                                        <FieldLabel>Subcategoría</FieldLabel>
                                                        <SelectorBusqueda
                                                            options={relevantSubs} value={relevantSubs.find(s => s.value === detail.subcategory) || null}
                                                            onChange={opt => handleDetailChange(detail.id, 'subcategory', opt?.value)}
                                                            isDisabled={!detail.category} isLoading={subLoading} placeholder="Subcategoría…"
                                                        />
                                                    </Grid>
                                                )}

                                                <Grid
                                                    size={{
                                                        xs: 12,
                                                        md: 6
                                                    }}>
                                                    <FieldLabel>Descripción</FieldLabel>
                                                    <TextField fullWidth size="small" value={detail.itemDescription} onChange={e => handleDetailChange(detail.id, 'itemDescription', e.target.value)} InputProps={{ sx: INPUT_SX }} />
                                                </Grid>
                                                <Grid
                                                    size={{
                                                        xs: 6,
                                                        md: 2
                                                    }}>
                                                    <FieldLabel>Precio Unit.</FieldLabel>
                                                    <TextField fullWidth type="number" size="small" value={detail.price} onChange={e => handleDetailChange(detail.id, 'price', e.target.value)} InputProps={{ sx: INPUT_SX }} />
                                                </Grid>
                                                <Grid
                                                    size={{
                                                        xs: 6,
                                                        md: 2
                                                    }}>
                                                    <FieldLabel>Cant.</FieldLabel>
                                                    <TextField fullWidth type="number" size="small" value={detail.quantity} onChange={e => handleDetailChange(detail.id, 'quantity', e.target.value)} InputProps={{ sx: INPUT_SX }} />
                                                </Grid>
                                                <Grid
                                                    display="flex"
                                                    justifyContent="flex-end"
                                                    alignItems="center"
                                                    size={{
                                                        xs: 12,
                                                        md: 2
                                                    }}>
                                                    <Tooltip title="Quitar concepto">
                                                        <IconButton
                                                            onClick={() => handleRemoveDetail(detail.id)}
                                                            sx={{
                                                                color: COLOR.PELIGRO, border: `1px solid ${COLOR.PELIGRO_BORDE}`, borderRadius: 1.5,
                                                                '&:hover': { bgcolor: COLOR.PELIGRO, color: COLOR.BLANCO, borderColor: COLOR.PELIGRO },
                                                            }}
                                                        >
                                                            <DeleteOutlineIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    );
                                })}
                                {expenseDetails.length === 0 && (
                                    <Box sx={{ py: 6, textAlign: 'center', borderRadius: 2, border: `1px dashed ${COLOR.BORDE_FUERTE}`, bgcolor: COLOR.CABECERA }}>
                                        <ReceiptLongOutlinedIcon sx={{ fontSize: 28, color: COLOR.BORDE_FUERTE }} />
                                        <Typography variant="body2" color={COLOR.APAGADO} fontWeight={600} sx={{ mt: 1 }}>
                                            Este gasto no tiene conceptos.
                                        </Typography>
                                        <Typography variant="caption" color={COLOR.TENUE}>Agrega al menos uno antes de guardar.</Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    </Grid>

                    <Grid
                        size={{
                            xs: 12,
                            md: 4
                        }}>
                        <Paper sx={{ ...CARD_SX, mb: 3 }} elevation={0}>
                            <Typography variant="overline" sx={SECTION_LABEL_SX}>Resumen</Typography>

                            <Stack spacing={1} sx={{ mt: 1 }}>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color={COLOR.APAGADO}>País</Typography>
                                    <Typography variant="body2" color={COLOR.TEXTO} fontWeight={600}>{country?.label || '—'}</Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                    <Typography variant="body2" color={COLOR.APAGADO}>Fecha de ticket</Typography>
                                    <Typography variant="body2" color={COLOR.TEXTO} fontWeight={600}>{ticketDate.toLocaleDateString()}</Typography>
                                </Stack>
                            </Stack>

                            <Divider sx={{ my: 2, borderColor: COLOR.RELLENO }} />

                            <Typography variant="caption" sx={{ color: COLOR.TENUE, fontWeight: 700, letterSpacing: '0.06em' }}>
                                TOTAL (USD)
                            </Typography>
                            <Typography variant="h4" fontWeight={800} color={COLOR.TINTA} letterSpacing="-0.02em">
                                {money(totalAmount)}
                            </Typography>

                            <Divider sx={{ my: 2, borderColor: COLOR.RELLENO }} />

                            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                                <Typography variant="overline" sx={SECTION_LABEL_SX}>Conceptos</Typography>
                                <Chip
                                    size="small"
                                    label={expenseDetails.length}
                                    sx={{ height: 18, fontSize: '0.68rem', fontWeight: 700, bgcolor: COLOR.BORDE, color: COLOR.TEXTO_SUAVE }}
                                />
                            </Stack>

                            {expenseDetails.length === 0 ? (
                                <Typography variant="body2" color={COLOR.TENUE}>Sin conceptos todavía.</Typography>
                            ) : (
                                <Stack spacing={0.75}>
                                    {expenseDetails.map((d, i) => (
                                        <Stack key={d.id || i} direction="row" justifyContent="space-between" spacing={1}>
                                            <Typography variant="body2" color={COLOR.TEXTO} noWrap sx={{ maxWidth: 170 }}>
                                                {d.itemDescription || 'Concepto'}
                                            </Typography>
                                            <Typography variant="body2" color={COLOR.APAGADO}>×{d.quantity || 0}</Typography>
                                        </Stack>
                                    ))}
                                </Stack>
                            )}
                        </Paper>

                        <Paper sx={CARD_SX} elevation={0}>
                            <Typography variant="overline" sx={{ ...SECTION_LABEL_SX, display: 'block', mb: 1.5 }}>Documentos</Typography>
                            <Stack spacing={2}>
                                {files.facturaPdf ? (
                                    <Paper elevation={0} sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: COLOR.CABECERA, border: `1px solid ${COLOR.BORDE}`, borderRadius: 2 }}>
                                        <Typography variant="caption" fontWeight={600} color={COLOR.TEXTO} noWrap sx={{ maxWidth: 180 }}>{files.facturaPdf.name}</Typography>
                                        <IconButton size="small" onClick={() => handleRemoveFile('facturaPdf')} sx={{ color: COLOR.PELIGRO }}><DeleteOutlineIcon fontSize="small"/></IconButton>
                                    </Paper>
                                ) : (
                                    <Button variant="outlined" fullWidth startIcon={<AttachFileIcon/>} onClick={() => setModalState({ isOpen: true, fileType: 'facturaPdf' })} sx={GHOST_BTN_SX}>
                                        Adjuntar Factura (PDF)
                                    </Button>
                                )}

                                {files.ticketJpg ? (
                                    <Paper elevation={0} sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: COLOR.CABECERA, border: `1px solid ${COLOR.BORDE}`, borderRadius: 2 }}>
                                        <Typography variant="caption" fontWeight={600} color={COLOR.TEXTO} noWrap sx={{ maxWidth: 180 }}>{files.ticketJpg.name}</Typography>
                                        <IconButton size="small" onClick={() => handleRemoveFile('ticketJpg')} sx={{ color: COLOR.PELIGRO }}><DeleteOutlineIcon fontSize="small"/></IconButton>
                                    </Paper>
                                ) : (
                                    <Button variant="outlined" fullWidth startIcon={<AttachFileIcon/>} onClick={() => setModalState({ isOpen: true, fileType: 'ticketJpg' })} sx={GHOST_BTN_SX}>
                                        Adjuntar Ticket (IMG)
                                    </Button>
                                )}
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>

                <ModalArchivo
                    isOpen={modalState.isOpen}
                    onClose={() => setModalState({ isOpen: false, fileType: null })}
                    onSave={handleSaveFromModal}
                    title={modalState.fileType === 'facturaPdf' ? 'Adjuntar Factura PDF' : 'Adjuntar Ticket de Gasto'}
                    saveButtonText="Seleccionar Archivo"
                    accept={modalState.fileType === 'facturaPdf' ? 'application/pdf' : 'image/*'}
                    mostrarFechaVencimiento={false}
                />
            </DialogContent>

            <DialogActions sx={{ px: { xs: 2, md: 4 }, py: 2.5, bgcolor: COLOR.BLANCO, borderTop: `1px solid ${COLOR.BORDE}`, gap: 1 }}>
                <Button variant="outlined" onClick={onClose} disabled={saving} sx={GHOST_BTN_SX}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSaveExpense}
                    disabled={saving}
                    startIcon={saving ? <CircularProgress size={18} sx={{ color: COLOR.BLANCO }}/> : <SaveIcon/>}
                    sx={DARK_BTN_SX}
                >
                    {saving ? 'Guardando…' : 'Guardar Gasto'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExpenseModal;