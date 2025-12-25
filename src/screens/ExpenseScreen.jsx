import { useState, useEffect, useCallback } from 'react';
import { 
    Box, Paper, Typography, Grid, Stack, TextField, Button, 
    Container, CircularProgress, IconButton, Divider 
} from '@mui/material'; 
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import Select from 'react-select';

import ModalArchivo from '../components/ModalArchivo';

import useFetchInventoryItems from '../hooks/expense_hooks/useFetchInventoryItems';
import useFetchSubcategories from '../hooks/expense_hooks/useFetchSubcategories';
import useFetchCategories from '../hooks/expense_hooks/useFetchCategories';
import useFetchExpenseTypes from '../hooks/expense_hooks/useFetchExpenseTypes';
import useFetchExchangeRate from '../hooks/useFetchExchangeRate';

const ID_MANTENIMIENTO = "3";
const apiHost = import.meta.env.VITE_API_HOST;

const customSelectStyles = {
  control: (provided) => ({
    ...provided, height: 56, borderRadius: 4, borderColor: 'rgba(0, 0, 0, 0.23)'
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999 })
};

const ExpenseScreen = () => {
    // --- ESTADOS GENERALES ---
    const [country, setCountry] = useState(null);
    const [expenseDate, setExpenseDate] = useState(new Date());
    const [ticketDate, setTicketDate] = useState(new Date()); // Agregado para consistencia
    const [totalAmount, setTotalAmount] = useState('0.00');
    const [originalAmount, setOriginalAmount] = useState('');
    
    // Hooks de Lógica de Negocio
    const { exchangeRate, setExchangeRate, fetchExchangeRate } = useFetchExchangeRate();
    
    // Detalles del Gasto
    const [expenseDetails, setExpenseDetails] = useState([]);
    
    // Catalogos
    const { expenseTypes, loading: typesLoading } = useFetchExpenseTypes();
    const { maintenanceCategories, loading: catLoading } = useFetchCategories();
    const { subcategories, loading: subLoading } = useFetchSubcategories();
    const { inventoryItems, loading: itemsLoading } = useFetchInventoryItems();

    // Archivos y UI
    const [modalState, setModalState] = useState({ isOpen: false, fileType: null });
    const [files, setFiles] = useState({ facturaPdf: null, ticketJpg: null });
    const [saving, setSaving] = useState(false);

    // --- HANDLERS ---

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
            
            if (field === 'expenseType' && String(value) !== ID_MANTENIMIENTO) {
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

    // --- EFECTOS  ---

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

    // --- GUARDAR ---
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
            id_categoria_mantenimiento: String(detail.expenseType) === ID_MANTENIMIENTO ? detail.category : null,
            id_subcategoria_mantenimiento: String(detail.expenseType) === ID_MANTENIMIENTO ? detail.subcategory : null,
        }));
        apiFormData.append('detailsData', JSON.stringify(detailsData));
        apiFormData.append('op', 'Alta');

        try {
            const res = await fetch(`${apiHost}/save_expense.php`, { method: 'POST', body: apiFormData });
            const result = await res.json();
            
            if (result.status === 'success') {
                Swal.fire('¡Éxito!', 'Gasto guardado correctamente.', 'success');
                resetForm();
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
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight={700}>New Expense Registration</Typography>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" color="error" onClick={resetForm}>Clear Form</Button>
                    <Button variant="contained" onClick={handleSaveExpense} disabled={saving} startIcon={saving ? <CircularProgress size={20} color='inherit'/> : <SaveIcon/>}>
                        {saving ? "Saving..." : "Save Expense"}
                    </Button>
                </Stack>
            </Box>
            
            <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                    
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>General Expense Data</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="caption" fontWeight={600}>Country</Typography>
                                <Select 
                                    options={countries} 
                                    value={country} 
                                    onChange={setCountry} 
                                    styles={customSelectStyles} 
                                    placeholder="Select Country..." 
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="caption" fontWeight={600}>Ticket Date</Typography>
                                <div style={{display:'block'}}>
                                    <DatePicker 
                                        selected={ticketDate} 
                                        onChange={setTicketDate} 
                                        className="form-input" 
                                        placeholderText="Select date" 
                                    />
                                </div>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="caption" fontWeight={600}>Accounting Date</Typography>
                                <div style={{display:'block'}}>
                                    <DatePicker 
                                        selected={expenseDate} 
                                        onChange={setExpenseDate} 
                                        className="form-input" 
                                    />
                                </div>
                            </Grid>

                            {/* Fila de Montos */}
                            <Grid item xs={12} md={4}>
                                <TextField 
                                    fullWidth label={`Original Amount (${country?.value === 'MX' ? 'MXN' : 'USD'})`} 
                                    type="number" size="small" 
                                    value={originalAmount} 
                                    onChange={e => setOriginalAmount(e.target.value)} 
                                />
                            </Grid>
                            {country?.value === 'MX' && (
                                <Grid item xs={12} md={4}>
                                    <TextField 
                                        fullWidth label="Exchange Rate" type="number" size="small" 
                                        value={exchangeRate} 
                                        onChange={e => setExchangeRate(e.target.value)} 
                                    />
                                </Grid>
                            )}
                            <Grid item xs={12} md={4}>
                                <TextField 
                                    fullWidth label="Total (USD)" 
                                    value={`$${totalAmount}`} 
                                    size="small" 
                                    InputProps={{ readOnly: true }} 
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Box display="flex" justifyContent="space-between" mb={2}>
                            <Typography variant="h6" fontWeight={600}>Expense Details</Typography>
                            <Button variant="outlined" size="small" onClick={handleAddDetail}>+ Add Item</Button>
                        </Box>
                        
                        <Stack spacing={3}>
                            {expenseDetails.map((detail) => {
                                const isMaint = String(detail.expenseType) === ID_MANTENIMIENTO;
                                const relevantSubs = subcategories.filter(s => s.id_categoria === detail.category);

                                return (
                                    <Paper key={detail.id} variant="outlined" sx={{ p: 2, bgcolor: '#fafafa' }}>
                                        <Grid container spacing={2} alignItems="center">
                                            {/* Fila 1: Tipos */}
                                            <Grid item xs={12} md={isMaint ? 4 : 12}>
                                                <Typography variant="caption">Type</Typography>
                                                <Select 
                                                    options={expenseTypes} 
                                                    value={expenseTypes.find(t => String(t.value) === String(detail.expenseType)) || null}
                                                    onChange={opt => handleDetailChange(detail.id, 'expenseType', opt?.value)}
                                                    styles={customSelectStyles}
                                                    isLoading={typesLoading}
                                                    placeholder="Select Type..."
                                                />
                                            </Grid>
                                            
                                            {isMaint && (
                                                <>
                                                    <Grid item xs={12} md={4}>
                                                        <Typography variant="caption">Category</Typography>
                                                        <Select 
                                                            options={maintenanceCategories}
                                                            value={maintenanceCategories.find(c => c.value === detail.category) || null}
                                                            onChange={opt => handleDetailChange(detail.id, 'category', opt?.value)}
                                                            styles={customSelectStyles}
                                                            isLoading={catLoading}
                                                            placeholder="Select Category..."
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} md={4}>
                                                        <Typography variant="caption">Subcategory</Typography>
                                                        <Select 
                                                            options={relevantSubs}
                                                            value={relevantSubs.find(s => s.value === detail.subcategory) || null}
                                                            onChange={opt => handleDetailChange(detail.id, 'subcategory', opt?.value)}
                                                            styles={customSelectStyles}
                                                            isDisabled={!detail.category}
                                                            isLoading={subLoading}
                                                            placeholder="Select Subcategory..."
                                                        />
                                                    </Grid>
                                                </>
                                            )}

                                            <Grid item xs={12} md={6}>
                                                <TextField 
                                                    fullWidth label="Description" size="small" 
                                                    value={detail.itemDescription} 
                                                    onChange={e => handleDetailChange(detail.id, 'itemDescription', e.target.value)} 
                                                />
                                            </Grid>
                                            <Grid item xs={6} md={2}>
                                                <TextField 
                                                    fullWidth label="Price" type="number" size="small" 
                                                    value={detail.price} 
                                                    onChange={e => handleDetailChange(detail.id, 'price', e.target.value)} 
                                                />
                                            </Grid>
                                            <Grid item xs={6} md={2}>
                                                <TextField 
                                                    fullWidth label="Qty" type="number" size="small" 
                                                    value={detail.quantity} 
                                                    onChange={e => handleDetailChange(detail.id, 'quantity', e.target.value)} 
                                                />
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
                                <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                                    No details added yet. Click "+ Add Item" to start.
                                </Typography>
                            )}
                        </Stack>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>Summary Preview</Typography>
                        <Box mb={2}>
                            <Typography variant="body2"><strong>Country:</strong> {country?.label || '-'}</Typography>
                            <Typography variant="body2"><strong>Date:</strong> {ticketDate.toLocaleDateString()}</Typography>
                            <Typography variant="h5" color="primary" fontWeight={700} mt={1}>${totalAmount}</Typography>
                        </Box>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle2" fontWeight={600}>Details ({expenseDetails.length})</Typography>
                        <ul style={{ paddingLeft: 20, margin: '10px 0', fontSize: '0.85rem' }}>
                            {expenseDetails.map((d, i) => (
                                <li key={d.id || i}>
                                    {d.itemDescription || 'Item'} - Qty: {d.quantity}
                                </li>
                            ))}
                        </ul>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>Documents</Typography>
                        <Stack spacing={2}>
                            {files.facturaPdf ? (
                                <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" noWrap sx={{ maxWidth: 180 }}>{files.facturaPdf.name}</Typography>
                                    <IconButton size="small" color="error" onClick={() => handleRemoveFile('facturaPdf')}><DeleteIcon fontSize="small"/></IconButton>
                                </Paper>
                            ) : (
                                <Button variant="outlined" fullWidth startIcon={<AttachFileIcon/>} onClick={() => setModalState({ isOpen: true, fileType: 'facturaPdf' })}>
                                    Attach Invoice (PDF)
                                </Button>
                            )}

                            {files.ticketJpg ? (
                                <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="caption" noWrap sx={{ maxWidth: 180 }}>{files.ticketJpg.name}</Typography>
                                    <IconButton size="small" color="error" onClick={() => handleRemoveFile('ticketJpg')}><DeleteIcon fontSize="small"/></IconButton>
                                </Paper>
                            ) : (
                                <Button variant="outlined" fullWidth startIcon={<AttachFileIcon/>} onClick={() => setModalState({ isOpen: true, fileType: 'ticketJpg' })}>
                                    Attach Ticket (IMG)
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
        </Container>
    );
};

export default ExpenseScreen;