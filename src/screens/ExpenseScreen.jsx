import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Paper, Typography, Grid, Stack, TextField, Button, InputLabel } from '@mui/material'; 
// ELIMINAMOS la importación del CSS nativo
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';

// IMPORTAMOS COMPONENTES ESTANDARIZADOS Y HOOKS
import ExpenseSelect from '../components/ExpenseSelect';
import DetailRow from '../components/DetailRow';
import ModalArchivo from '../components/ModalArchivo';

import useFetchInventoryItems from '../hooks/expense_hooks/useFetchInventoryItems';
import useFetchSubcategories from '../hooks/expense_hooks/useFetchSubcategories';
import useFetchCategories from '../hooks/expense_hooks/useFetchCategories';
import useFetchExpenseTypes from '../hooks/expense_hooks/useFetchExpenseTypes';
import useFetchExchangeRate from '../hooks/useFetchExchangeRate';


const ID_MANTENIMIENTO = "3";

const ExpenseScreen = () => {
    // --- ESTADOS GENERALES DEL GASTO ---
    const apiHost = import.meta.env.VITE_API_HOST;
    const [country, setCountry] = useState(null);
    const [expenseDate, setExpenseDate] = useState(new Date());
    const [totalAmount, setTotalAmount] = useState('0.00');
    const [originalAmount, setOriginalAmount] = useState('');
    const { exchangeRate, setExchangeRate, fetchExchangeRate } = useFetchExchangeRate();

    const [expenseDetails, setExpenseDetails] = useState([]);

    const { expenseTypes, loading: typesLoading } = useFetchExpenseTypes();
    const { maintenanceCategories, loading: categoriesLoading } = useFetchCategories();
    const { subcategories, loading: subcategoriesLoading } = useFetchSubcategories();
    const { inventoryItems, loading: itemsLoading, setInventoryItems } = useFetchInventoryItems();


    const [modalState, setModalState] = useState({
        isOpen: false,
        fileType: null,
    });
    const [files, setFiles] = useState({
        facturaPdf: null,
        ticketJpg: null,
    });


    // ** Handlers de Lógica (Convertidos a useCallback para optimización) **
    
    const resetForm = useCallback(() => {
        setCountry(null);
        setExpenseDate(new Date());
        setTotalAmount('0.00');
        setOriginalAmount('');
        setExchangeRate('');
        setExpenseDetails([]);
        setFiles({ facturaPdf: null, ticketJpg: null });
    }, [setExchangeRate]); // Añadir setExchangeRate como dependencia


    const handleArticleChange = useCallback(async (selection, detail) => {
        // ... (Tu lógica de creación de artículo y actualización se mantiene)
        if (!selection) {
            handleDetailChange(detail.id, { itemId: null, itemDescription: '' });
            return;
        }

        if (selection.__isNew__) {
            // Lógica de creación de nuevo artículo
            try {
                const formData = new FormData();
                formData.append('op', 'createInventoryItem');
                formData.append('itemName', selection.label);
                formData.append('subcategoryId', detail.subcategory);
                const response = await fetch(`${apiHost}/save_expense.php`, { method: 'POST', body: formData });
                const result = await response.json();

                if (result.status === 'success') {
                    const newItem = { value: result.itemId, label: selection.label, id_subcategoria: detail.subcategory };
                    setInventoryItems(prevItems => [...prevItems, newItem]);
                    handleDetailChange(detail.id, { itemId: result.itemId, itemDescription: selection.label });
                    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Artículo creado', showConfirmButton: false, timer: 2000 });
                } else { throw new Error(result.message); }
            } catch (error) {
                Swal.fire('Error', `Failed to create item: ${error.message}`, 'error');
            }
        }
        else {
            handleDetailChange(detail.id, {
                itemId: selection.value,
                itemDescription: selection.label
            });
        }
    }, [apiHost, setInventoryItems]);

    const handleSaveFromModal = useCallback((fileData) => {
        if (modalState.fileType) {
            setFiles(prev => ({ ...prev, [modalState.fileType]: fileData.file }));
        }
    }, [modalState.fileType]);

    const handleDetailChange = useCallback((id, updates) => {
        setExpenseDetails(prevDetails => prevDetails.map(detail => {
            if (detail.id === id) {
                const updatedDetail = { ...detail, ...updates };

                // Lógica de reseteo al cambiar categorías/subcategorías
                if (updates.hasOwnProperty('category') && updates.category !== detail.category) {
                    updatedDetail.subcategory = null;
                    updatedDetail.itemId = null;
                    updatedDetail.itemDescription = '';
                }
                if (updates.hasOwnProperty('subcategory') && updates.subcategory !== detail.subcategory) {
                    updatedDetail.itemId = null;
                    updatedDetail.itemDescription = '';
                }

                return updatedDetail;
            }
            return detail;
        }));
    }, []);

    const handleAddDetail = useCallback(() => {
        setExpenseDetails(prevDetails => [...prevDetails,
        {
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
        setExpenseDetails(prevDetails => prevDetails.filter(detail => detail.id !== id));
    }, []);


    const handleRemoveFile = useCallback((fileType) => {
        setFiles(prev => ({ ...prev, [fileType]: null }));
    }, []);

    const getSubtotal = useCallback((price, quantity) => {
        if (price && quantity) {
            return (parseFloat(price) * parseInt(quantity)).toFixed(2);
        }
        return '0.00';
    }, []);

    // ** LÓGICA DE CÁLCULO Y DIVISAS (useMemo y useEffect) **
    
    // Este useEffect ahora es asíncrono y se mantiene para la lógica de divisas
    useEffect(() => {
        const isMX = country && country.value === 'MX';
        const currentExchangeRate = parseFloat(exchangeRate) || 0;
        
        let newTotal = 0;
        
        // 1. CARGA CONDICIONAL DE LA TASA
        if (isMX && !currentExchangeRate) {
            fetchExchangeRate();
        } else if (!isMX && exchangeRate) {
            setExchangeRate('');
        }

        // 2. CÁLCULO DEL TOTAL (USD)
        if (originalAmount) {
            const original = parseFloat(originalAmount);
            
            if (!isMX) { // País = US
                newTotal = original;
            } else if (isMX && currentExchangeRate) { // País = MX
                // Fórmula: Monto Original (MXN) / Tasa (MXN/USD) = Monto Final (USD)
                newTotal = original / currentExchangeRate; 
            } else {
                newTotal = 0; 
            }
        }
        else {
            // Gasto basado en la suma de detalles
            newTotal = expenseDetails.reduce((sum, item) => {
                const price = parseFloat(item.price) || 0;
                const quantity = parseInt(item.quantity) || 0;
                return sum + (price * quantity);
            }, 0);
        }

        setTotalAmount(newTotal.toFixed(2));
        
    }, [country, originalAmount, exchangeRate, expenseDetails, fetchExchangeRate, setExchangeRate]);


    const handleSaveExpense = async (event) => {
        event.preventDefault();

        const isMX = country && country.value === 'MX';

        if (!country || !expenseDate || expenseDetails.length === 0) {
            Swal.fire('Incomplete fields', 'Make sure to select a country, date, and add at least one expense detail.', 'warning');
            return;
        }
        // Validación de tasa para MX
        if (isMX && parseFloat(originalAmount) > 0 && parseFloat(exchangeRate) === 0) {
             Swal.fire('Incomplete fields', 'Please wait for the Exchange Rate to load or enter it manually for MX.', 'warning');
            return;
        }

        const apiFormData = new FormData();
        // ... (Lógica de files se mantiene)
        if (files.facturaPdf) apiFormData.append('factura_pdf_file', files.facturaPdf);
        if (files.ticketJpg) apiFormData.append('ticket_jpg_file', files.ticketJpg);


        const generalData = {
            fecha_gasto: expenseDate.toISOString().split('T')[0],
            pais: country.value,
            moneda: isMX ? 'MXN' : 'USD', // Moneda Original
            monto_total: totalAmount, // Monto Final (USD)
            cantidad_original: originalAmount,
            tipo_cambio: isMX ? exchangeRate : '',
        };
        apiFormData.append('generalData', JSON.stringify(generalData));


        const detailsData = expenseDetails.map(detail => {
            const description = detail.itemDescription || '';
            return {
                id_tipo_gasto: detail.expenseType,
                id_articulo: detail.itemId,
                descripcion_articulo: description,
                cantidad_articulo: detail.quantity,
                precio_unitario: detail.price,
                id_categoria_mantenimiento: detail.expenseType === ID_MANTENIMIENTO ? detail.category : null,
                id_subcategoria_mantenimiento: detail.expenseType === ID_MANTENIMIENTO ? detail.subcategory : null,
            };
        });

        apiFormData.append('detailsData', JSON.stringify(detailsData));

        apiFormData.append('op', 'Alta');

        try {
            const response = await fetch(`${apiHost}/save_expense.php`, {
                method: 'POST',
                body: apiFormData,
            });
            const result = await response.json();
            if (result.status === 'success') {
                Swal.fire('Success!', 'Expense saved successfully.', 'success');
                resetForm();
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            Swal.fire('Error', `Failed to save expense: ${error.message}`, 'error');
        }
    };

    const isMX = country && country.value === 'MX';
    const countries = [{ value: 'MX', label: 'México' }, { value: 'US', label: 'Estados Unidos' }];


    return (
        <Box sx={{ p: 3 }}>
             {/* Título Principal */}
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                New Expense Registration
            </Typography>
            
            <Grid container spacing={4} className="main-content-flex">
                
                {/* Columna Izquierda (Formulario de Datos) */}
                <Grid item xs={12} md={7}>
                    <Paper elevation={1} sx={{ p: 3, border: '1px solid #ccc' }}>
                        <form onSubmit={handleSaveExpense}>
                            {/* Botones de acción (Save / Cancel) */}
                            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mb: 3 }}>
                                <Button variant="outlined" color="error" onClick={resetForm}>Cancel</Button>
                                <Button variant="contained" color="primary" type="submit">Save Expense</Button>
                            </Stack>

                            {/* SECCIÓN 1: GENERAL DATA */}
                            <Typography variant="h6" fontWeight={600} sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 3 }}>
                                General Expense Data
                            </Typography>
                            
                            <Grid container spacing={2}>
                                {/* Country and Date */}
                                <Grid item xs={6}>
                                    <ExpenseSelect
                                        label="Expense Country:"
                                        options={countries}
                                        value={country}
                                        onChange={setCountry}
                                        isClearable
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <InputLabel sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem' }}>Ticket Date:</InputLabel>
                                    <DatePicker
                                        selected={expenseDate}
                                        onChange={setExpenseDate}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Fecha del Gasto"
                                        className="form-input date-picker-full-width" // Asegura el ancho 100%
                                    />
                                </Grid>
                            </Grid>
                            
                            {/* Montos */}
                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth size="small" type="number" label={`Original Amount (${isMX ? 'MXN' : 'USD'}):`}
                                        placeholder="Ticket amount"
                                        value={originalAmount}
                                        onChange={(e) => setOriginalAmount(e.target.value)}
                                    />
                                </Grid>
                                
                                {isMX && (
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth size="small" type="number" label="Exchange Rate (MXN/USD):"
                                            placeholder="Auto-filled or manual"
                                            value={exchangeRate}
                                            onChange={(e) => setExchangeRate(e.target.value)}
                                        />
                                    </Grid>
                                )}

                                <Grid item xs={12} md={4}>
                                    <TextField
                                        fullWidth size="small" label="Total Amount (Final USD):"
                                        value={`$${totalAmount}`}
                                        InputProps={{ readOnly: true }}
                                    />
                                </Grid>
                            </Grid>

                            {/* SECCIÓN 2: EXPENSE DETAILS */}
                            <Typography variant="h6" fontWeight={600} sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 3, mt: 4 }}>
                                Expense Details
                            </Typography>
                            
                            {/* Mapeo de Filas de Detalle */}
                            {expenseDetails.map((detail, index) => (
                                <DetailRow 
                                    key={detail.id}
                                    detail={detail}
                                    index={index}
                                    ID_MANTENIMIENTO={ID_MANTENIMIENTO}
                                    handleDetailChange={handleDetailChange}
                                    handleArticleChange={handleArticleChange}
                                    handleRemoveDetail={handleRemoveDetail}
                                    getSubtotal={getSubtotal}
                                    expenseTypes={expenseTypes}
                                    maintenanceCategories={maintenanceCategories}
                                    subcategories={subcategories}
                                    inventoryItems={inventoryItems}
                                    typesLoading={typesLoading}
                                    categoriesLoading={categoriesLoading}
                                    subcategoriesLoading={subcategoriesLoading}
                                    itemsLoading={itemsLoading}
                                />
                            ))}

                            <Button type="button" variant="outlined" onClick={handleAddDetail} size="small" sx={{ mt: 1 }}>
                                + Add Item
                            </Button>

                            {/* SECCIÓN 3: DOCUMENTS */}
                            <Typography variant="h6" fontWeight={600} sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 3, mt: 4 }}>
                                Documents (Invoices/Tickets)
                            </Typography>
                            
                            <Grid container spacing={2}>
                                {/* Botón para PDF */}
                                <Grid item xs={12} sm={6}>
                                    <InputLabel sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem' }}>Invoice (PDF)</InputLabel>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Button variant="outlined" onClick={() => setModalState({ isOpen: true, fileType: 'facturaPdf' })} size="small">Attach PDF</Button>
                                        {files.facturaPdf ? (
                                            <Paper variant="outlined" sx={{ p: 1, flexGrow: 1, display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2">{files.facturaPdf.name}</Typography>
                                                <Button color="error" size="small" onClick={() => handleRemoveFile('facturaPdf')} sx={{ minWidth: 'unset', p: 0.5 }}>X</Button>
                                            </Paper>
                                        ) : (<Typography variant="body2" color="text.secondary">No file</Typography>)}
                                    </Stack>
                                </Grid>

                                {/* Input para Ticket (Imagen) */}
                                <Grid item xs={12} sm={6}>
                                    <InputLabel sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem' }}>Ticket (JPG/PNG)</InputLabel>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Button variant="outlined" onClick={() => setModalState({ isOpen: true, fileType: 'ticketJpg' })} size="small">Attach Image</Button>
                                        {files.ticketJpg ? (
                                            <Paper variant="outlined" sx={{ p: 1, flexGrow: 1, display: 'flex', justifyContent: 'space-between' }}>
                                                <Typography variant="body2">{files.ticketJpg.name}</Typography>
                                                <Button color="error" size="small" onClick={() => handleRemoveFile('ticketJpg')} sx={{ minWidth: 'unset', p: 0.5 }}>X</Button>
                                            </Paper>
                                        ) : (<Typography variant="body2" color="text.secondary">No file</Typography>)}
                                    </Stack>
                                </Grid>

                            </Grid>
                        </form>
                    </Paper>
                </Grid>

                {/* Columna Derecha (Preview/Summary) */}
                <Grid item xs={12} md={5}>
                    <Paper elevation={1} sx={{ p: 3, border: '1px solid #ccc' }}>
                        <Typography variant="h6" fontWeight={600} sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 2 }}>
                            Expense Summary (Preview)
                        </Typography>
                        
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="body1"><strong>Country:</strong> {country?.label || 'N/A'}</Typography>
                            <Typography variant="body1"><strong>Date:</strong> {expenseDate ? expenseDate.toLocaleDateString() : 'N/A'}</Typography>
                            <Typography variant="body1"><strong>Total Amount (USD):</strong> ${totalAmount}</Typography>
                            {isMX && originalAmount && (
                                <>
                                    <Typography variant="body1"><strong>Original Amount (MXN):</strong> {originalAmount}</Typography>
                                    <Typography variant="body1"><strong>Exchange Rate:</strong> {exchangeRate}</Typography>
                                </>
                            )}
                        </Box>
                        
                        <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 3 }}>Details:</Typography>
                        <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
                            {expenseDetails.map((detail) => {
                                const typeLabel = expenseTypes.find(t => t.value === detail.expenseType)?.label || 'N/A';
                                const isMaintenance = typeLabel === 'Mantenimiento';
                                
                                return (
                                    <li key={detail.id} style={{ marginBottom: '8px' }}>
                                        <Typography variant="body2"><strong>Type:</strong> {typeLabel}</Typography>
                                        {isMaintenance && (
                                            <Typography variant="caption" sx={{ ml: 1, display: 'block' }}>
                                                Cat: {maintenanceCategories.find(c => c.value === detail.category)?.label || 'N/A'} / Sub: {subcategories.find(s => s.value === detail.subcategory)?.label || 'N/A'}
                                            </Typography>
                                        )}
                                        <Typography variant="caption" sx={{ ml: 1, display: 'block' }}>
                                            Qty: {detail.quantity || 0} x Price: ${parseFloat(detail.price || 0).toFixed(2)} = Subtotal: ${getSubtotal(detail.price, detail.quantity)}
                                        </Typography>
                                    </li>
                                );
                            })}
                        </ul>

                        <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 3 }}>Documents:</Typography>
                        <ul style={{ paddingLeft: '20px', margin: '10px 0' }}>
                            {files.facturaPdf && <li>Invoice (PDF): {files.facturaPdf.name}</li>}
                            {files.ticketJpg && <li>Ticket (JPG/PNG): {files.ticketJpg.name}</li>}
                            {!files.facturaPdf && !files.ticketJpg && <li>No documents attached.</li>}
                        </ul>
                    </Paper>
                </Grid>
            </Grid>

            <ModalArchivo
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, fileType: null })}
                onSave={handleSaveFromModal}
                title={modalState.fileType === 'facturaPdf' ? 'Adjuntar Factura PDF' : 'Adjuntar Ticket de Gasto'}
                saveButtonText="Seleccionar Archivo"
                accept={modalState.fileType === 'facturaPdf' ? 'application/pdf' : 'image/jpeg,image/png'}
                mostrarFechaVencimiento={false}
            />
        </Box>
    );
};

export default ExpenseScreen;