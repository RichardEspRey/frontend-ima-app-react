import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, Paper, Typography, Grid, Stack, TextField, Button, 
    CircularProgress, IconButton, Divider, Dialog, DialogTitle, 
    DialogContent, DialogActions 
} from '@mui/material'; 
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import Select from 'react-select';

import ModalArchivo from '../../components/ModalArchivo';

import useFetchInventoryItems from '../../hooks/expense_hooks/useFetchInventoryItems';
import useFetchSubcategories from '../../hooks/expense_hooks/useFetchSubcategories';
import useFetchCategories from '../../hooks/expense_hooks/useFetchCategories';
import useFetchExpenseTypes from '../../hooks/expense_hooks/useFetchExpenseTypes';
import useFetchExchangeRate from '../../hooks/useFetchExchangeRate';

const apiHost = import.meta.env.VITE_API_HOST;

const customSelectStyles = {
  control: (provided) => ({
    ...provided, height: 40, minHeight: 40, borderRadius: 4, borderColor: 'rgba(0, 0, 0, 0.23)'
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999 })
};

const ExpenseModal = ({ open, onClose, onSuccess }) => {
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
                updated.subcategory = null;
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
            fecha_gasto: expenseDate.toISOString().split('T')[0],
            fecha_ticket: ticketDate.toISOString().split('T')[0],
            pais: country?.value,
            moneda: isMX ? 'MXN' : 'USD',
            monto_total: totalAmount,
            cantidad_original: originalAmount,
            tipo_cambio: isMX ? exchangeRate : '',
        };
        apiFormData.append('generalData', JSON.stringify(generalData));

        const detailsData = expenseDetails.map(detail => ({
            id_tipo_gasto: detail.expenseType,
            id_articulo: detail.itemId,
            descripcion_articulo: detail.itemDescription,
            cantidad_articulo: detail.quantity,
            precio_unitario: detail.price,
            id_categoria_mantenimiento: detail.category || null,
            id_subcategoria_mantenimiento: String(detail.category) === '2' ? 39 : ['4','5','6','7'].includes(String(detail.category)) ? 40 : (detail.subcategory || null),
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
        <Dialog open={open} onClose={!saving ? onClose : undefined} maxWidth="lg" fullWidth scroll="paper">
            <DialogTitle sx={{ bgcolor: '#0f172a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={800}>Nuevo Registro de Gasto</Typography>
                <IconButton onClick={onClose} sx={{ color: 'white' }} disabled={saving}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ bgcolor: '#f8fafc', p: { xs: 2, md: 4 } }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        
                        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e2e8f0' }} elevation={0}>
                            <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>Datos Generales</Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="caption" fontWeight={600}>País</Typography>
                                    <Select 
                                        options={countries} value={country} onChange={setCountry} 
                                        styles={customSelectStyles} placeholder="Seleccionar..." menuPosition="fixed"
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="caption" fontWeight={600}>Fecha de Ticket</Typography>
                                    <div style={{display:'block'}}>
                                        <DatePicker selected={ticketDate} onChange={setTicketDate} className="form-input" placeholderText="Seleccionar fecha" />
                                    </div>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Typography variant="caption" fontWeight={600}>Fecha Contable</Typography>
                                    <div style={{display:'block'}}>
                                        <DatePicker selected={expenseDate} onChange={setExpenseDate} className="form-input" />
                                    </div>
                                </Grid>

                                <Grid item xs={12} md={4}>
                                    <TextField fullWidth label={`Monto Original (${country?.value === 'MX' ? 'MXN' : 'USD'})`} type="number" size="small" value={originalAmount} onChange={e => setOriginalAmount(e.target.value)} />
                                </Grid>
                                {country?.value === 'MX' && (
                                    <Grid item xs={12} md={4}>
                                        <TextField fullWidth label="Tipo de Cambio" type="number" size="small" value={exchangeRate} onChange={e => setExchangeRate(e.target.value)} />
                                    </Grid>
                                )}
                                <Grid item xs={12} md={4}>
                                    <TextField fullWidth label="Total Calculado (USD)" value={`$${totalAmount}`} size="small" InputProps={{ readOnly: true }} sx={{ bgcolor: '#f1f5f9' }} />
                                </Grid>
                            </Grid>
                        </Paper>

                        <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0' }} elevation={0}>
                            <Box display="flex" justifyContent="space-between" mb={2}>
                                <Typography variant="h6" fontWeight={700} color="primary">Detalles del Gasto</Typography>
                                <Button variant="outlined" size="small" onClick={handleAddDetail} sx={{ fontWeight: 700 }}>+ Añadir Concepto</Button>
                            </Box>
                            
                            <Stack spacing={2}>
                                {expenseDetails.map((detail) => {
                                    const relevantCategories = maintenanceCategories.filter(c => String(c.id_tipo_gasto) === String(detail.expenseType));
                                    const hasCategories = relevantCategories.length > 0;
                                    const relevantSubs = subcategories.filter(s => s.id_categoria === detail.category);
                                    const hasSubcategories = relevantSubs.length > 0;

                                    let mdSelectSize = 12;
                                    if (hasCategories && hasSubcategories) mdSelectSize = 4;
                                    else if (hasCategories) mdSelectSize = 6;

                                    return (
                                        <Paper key={detail.id} variant="outlined" sx={{ p: 2, bgcolor: '#ffffff', borderRadius: 2 }}>
                                            <Grid container spacing={2} alignItems="center">
                                                
                                                <Grid item xs={12} md={mdSelectSize}>
                                                    <Typography variant="caption" fontWeight={600}>Tipo</Typography>
                                                    <Select 
                                                        options={expenseTypes} value={expenseTypes.find(t => String(t.value) === String(detail.expenseType)) || null}
                                                        onChange={opt => handleDetailChange(detail.id, 'expenseType', opt?.value)}
                                                        styles={customSelectStyles} isLoading={typesLoading} placeholder="Tipo..." menuPosition="fixed"
                                                    />
                                                </Grid>
                                                
                                                {hasCategories && (
                                                    <Grid item xs={12} md={mdSelectSize}>
                                                        <Typography variant="caption" fontWeight={600}>Categoría</Typography>
                                                        <Select 
                                                            options={relevantCategories} value={relevantCategories.find(c => c.value === detail.category) || null}
                                                            onChange={opt => handleDetailChange(detail.id, 'category', opt?.value)}
                                                            styles={customSelectStyles} isLoading={catLoading} placeholder="Categoría..." menuPosition="fixed"
                                                        />
                                                    </Grid>
                                                )}
                                                
                                                {hasSubcategories && (
                                                    <Grid item xs={12} md={mdSelectSize}>
                                                        <Typography variant="caption" fontWeight={600}>Subcategoría</Typography>
                                                        <Select 
                                                            options={relevantSubs} value={relevantSubs.find(s => s.value === detail.subcategory) || null}
                                                            onChange={opt => handleDetailChange(detail.id, 'subcategory', opt?.value)}
                                                            styles={customSelectStyles} isDisabled={!detail.category} isLoading={subLoading} placeholder="Subcategoría..." menuPosition="fixed"
                                                        />
                                                    </Grid>
                                                )}

                                                <Grid item xs={12} md={6}>
                                                    <TextField fullWidth label="Descripción" size="small" value={detail.itemDescription} onChange={e => handleDetailChange(detail.id, 'itemDescription', e.target.value)} />
                                                </Grid>
                                                <Grid item xs={6} md={2}>
                                                    <TextField fullWidth label="Precio Unit." type="number" size="small" value={detail.price} onChange={e => handleDetailChange(detail.id, 'price', e.target.value)} />
                                                </Grid>
                                                <Grid item xs={6} md={2}>
                                                    <TextField fullWidth label="Cant." type="number" size="small" value={detail.quantity} onChange={e => handleDetailChange(detail.id, 'quantity', e.target.value)} />
                                                </Grid>
                                                <Grid item xs={12} md={2} display="flex" justifyContent="flex-end">
                                                    <IconButton color="error" onClick={() => handleRemoveDetail(detail.id)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                        </Paper>
                                    );
                                })}
                                {expenseDetails.length === 0 && (
                                    <Typography color="text.secondary" align="center" sx={{ py: 3, fontStyle: 'italic' }}>
                                        Aún no hay conceptos añadidos. Haz clic en "+ Añadir Concepto" para comenzar.
                                    </Typography>
                                )}
                            </Stack>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e2e8f0' }} elevation={0}>
                            <Typography variant="h6" fontWeight={700} gutterBottom color="primary">Resumen</Typography>
                            <Box mb={2}>
                                <Typography variant="body2"><strong>País:</strong> {country?.label || '-'}</Typography>
                                <Typography variant="body2"><strong>Fecha:</strong> {ticketDate.toLocaleDateString()}</Typography>
                                <Typography variant="h4" color="success.main" fontWeight={800} mt={1}>${totalAmount}</Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle2" fontWeight={700}>Conceptos ({expenseDetails.length})</Typography>
                            <ul style={{ paddingLeft: 20, margin: '10px 0', fontSize: '0.85rem', color: '#475569' }}>
                                {expenseDetails.map((d, i) => (
                                    <li key={d.id || i}>{d.itemDescription || 'Concepto'} - Cant: {d.quantity}</li>
                                ))}
                            </ul>
                        </Paper>

                        <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0' }} elevation={0}>
                            <Typography variant="h6" fontWeight={700} gutterBottom color="primary">Documentos</Typography>
                            <Stack spacing={2}>
                                {files.facturaPdf ? (
                                    <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f1f5f9' }}>
                                        <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: 180 }}>{files.facturaPdf.name}</Typography>
                                        <IconButton size="small" color="error" onClick={() => handleRemoveFile('facturaPdf')}><DeleteIcon fontSize="small"/></IconButton>
                                    </Paper>
                                ) : (
                                    <Button variant="outlined" fullWidth startIcon={<AttachFileIcon/>} onClick={() => setModalState({ isOpen: true, fileType: 'facturaPdf' })} sx={{ fontWeight: 600 }}>
                                        Adjuntar Factura (PDF)
                                    </Button>
                                )}

                                {files.ticketJpg ? (
                                    <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f1f5f9' }}>
                                        <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: 180 }}>{files.ticketJpg.name}</Typography>
                                        <IconButton size="small" color="error" onClick={() => handleRemoveFile('ticketJpg')}><DeleteIcon fontSize="small"/></IconButton>
                                    </Paper>
                                ) : (
                                    <Button variant="outlined" fullWidth startIcon={<AttachFileIcon/>} onClick={() => setModalState({ isOpen: true, fileType: 'ticketJpg' })} sx={{ fontWeight: 600 }}>
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

            <DialogActions sx={{ p: 3, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <Button onClick={onClose} disabled={saving} sx={{ color: 'text.secondary', fontWeight: 600, px: 3 }}>
                    Cancelar
                </Button>
                <Button variant="contained" onClick={handleSaveExpense} disabled={saving} startIcon={saving ? <CircularProgress size={20} color='inherit'/> : <SaveIcon/>} sx={{ px: 4, fontWeight: 700, bgcolor: '#0f172a' }} disableElevation>
                    {saving ? "Guardando..." : "Guardar Gasto"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExpenseModal;