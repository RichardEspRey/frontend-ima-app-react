import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Grid, Typography, Divider, Box, Chip, Paper, Autocomplete
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Swal from 'sweetalert2';
import InvoicePreview from './InvoicePreview';
import { COLOR } from '../shared/ui/tokens';

const apiHost = import.meta.env.VITE_API_HOST;

// Arma la ruta como una pierna por línea cuando hay paradas adicionales:
// Origen -> Parada 1 / Parada 1 -> Parada 2 / Parada 2 -> Destino.
// Sin paradas, se queda igual que antes: Origen -> Destino.
const buildRouteDescription = (stageData) => {
    const origin = stageData?.origin || 'Origen';
    const destination = stageData?.destination || 'Destino';
    const stops = Array.isArray(stageData?.stops_in_transit)
        ? stageData.stops_in_transit.filter(s => s?.location)
        : [];

    if (stops.length === 0) {
        return `${origin} -> ${destination}`;
    }

    const points = [origin, ...stops.map(s => s.location), destination];
    const legs = [];
    for (let i = 0; i < points.length - 1; i++) {
        legs.push(`${points[i]} -> ${points[i + 1]}`);
    }
    return legs.join('\n');
};

const InvoiceModal = ({ isOpen, onClose, stageData, tripData, onSaveInvoice }) => {
    const [viewMode, setViewMode] = useState('form');
    const [saving, setSaving] = useState(false);

    // Empresas con su nombre/dirección de facturación ya conocidos (tabla
    // company_invoice_info, unida por company_id). Sirve tanto para
    // autocompletar al abrir el modal como para el selector manual.
    const [companyOptions, setCompanyOptions] = useState([]);
    const [loadingCompanies, setLoadingCompanies] = useState(false);

    const [invoiceForm, setInvoiceForm] = useState({
        stage_id: '', pdf_number: '', save_date: '', client_name: '', client_address: '',
        driver_name: '', ci_number: '', trip_number: '', pickup_date: '',
        delivery_date: '', description: '', rate: ''
    });

    useEffect(() => {
        if (!isOpen) return;
        setLoadingCompanies(true);
        const fd = new FormData();
        fd.append('op', 'getCompanies');
        fetch(`${apiHost}/companies.php`, { method: 'POST', body: fd })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success' && Array.isArray(data.companies)) setCompanyOptions(data.companies);
            })
            .catch(err => console.error('No se pudieron cargar las empresas:', err))
            .finally(() => setLoadingCompanies(false));
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && stageData && tripData) {
            setViewMode('form');
            const formatDateForInput = (dateValue) => {
                if (!dateValue) return '';
                const d = new Date(dateValue);
                if (isNaN(d.getTime())) return '';
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            setInvoiceForm({
                stage_id: stageData.trip_stage_id || '',
                pdf_number: stageData.invoice_number || '',
                save_date: stageData.invoice_save_date || new Date().toLocaleDateString('en-US'),

                client_name: '',
                client_address: '',

                driver_name: tripData.driver_nombre || '',
                ci_number: stageData.ci_number || '',
                trip_number: tripData.trip_number || '',
                pickup_date: formatDateForInput(stageData.loading_date),
                delivery_date: formatDateForInput(stageData.delivery_date),
                description: buildRouteDescription(stageData),
                rate: stageData.rate_tarifa || ''
            });
        }
    }, [isOpen, stageData, tripData]);

    // Autocompleta nombre/dirección de facturación en cuanto llega la lista de
    // empresas, comparando por company_id de la etapa (no por texto).
    useEffect(() => {
        if (!isOpen || !stageData?.company_id || companyOptions.length === 0) return;
        const match = companyOptions.find(c => String(c.company_id) === String(stageData.company_id));
        if (match?.nombre_factura) {
            setInvoiceForm(prev => ({
                ...prev,
                client_name: prev.client_name || match.nombre_factura,
                client_address: prev.client_address || match.direccion || '',
            }));
        }
    }, [isOpen, stageData, companyOptions]);

    const isFormValid = Object.values(invoiceForm).every(val => String(val).trim() !== '');

    const handleChange = (e) => {
        setInvoiceForm({ ...invoiceForm, [e.target.name]: e.target.value });
    };

    const handleSelectCompany = (event, newValue) => {
        if (newValue && typeof newValue === 'object') {
            setInvoiceForm(prev => ({
                ...prev,
                client_name: newValue.nombre_factura || '',
                client_address: newValue.direccion || prev.client_address,
            }));
        }
    };

    const handleClientNameInput = (event, newValue, reason) => {
        if (reason === 'input' || reason === 'clear') {
            setInvoiceForm(prev => ({ ...prev, client_name: newValue }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('op', 'save_stage_invoice');
            Object.entries(invoiceForm).forEach(([key, value]) => fd.append(key, value));

            const res = await fetch(`${apiHost}/new_tripsv2.php`, { method: 'POST', body: fd });
            const result = await res.json();

            if (result.status !== 'success') {
                throw new Error(result.message || 'No se pudo generar el invoice.');
            }

            // Guarda/actualiza el nombre y dirección de facturación de esta empresa
            // para que la próxima vez se rellene solo. No debe tumbar el guardado
            // del invoice si esto falla, por eso va en su propio try/catch.
            if (stageData?.company_id && invoiceForm.client_name.trim()) {
                try {
                    const fdCompany = new FormData();
                    fdCompany.append('op', 'save_company_invoice_info');
                    fdCompany.append('company_id', stageData.company_id);
                    fdCompany.append('nombre_factura', invoiceForm.client_name);
                    fdCompany.append('direccion', invoiceForm.client_address);
                    await fetch(`${apiHost}/companies.php`, { method: 'POST', body: fdCompany });
                } catch (companyErr) {
                    console.error('No se pudo guardar la información de facturación de la empresa:', companyErr);
                }
            }

            onSaveInvoice?.({
                stageId: invoiceForm.stage_id,
                invoice_number: invoiceForm.pdf_number,
                invoice_file_path: result.pdf_url
            });

            onClose();
            await Swal.fire('Éxito', 'Invoice generado y guardado correctamente.', 'success');
        } catch (e) {
            Swal.fire('Error', e.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ bgcolor: COLOR.TINTA, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                    {viewMode === 'form' ? `Datos del Invoice - Etapa ${stageData?.stage_number}` : 'Vista Previa del Documento'}
                </Typography>
                <Chip label={tripData?.trip_number ? `Viaje: #${tripData.trip_number}` : ''} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
            </DialogTitle>
            
            <DialogContent dividers sx={{ bgcolor: COLOR.RELLENO, p: viewMode === 'form' ? 3 : 0 }}>
                
                {/* === VISTA 1: FORMULARIO === */}
                {viewMode === 'form' && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{ p: 2, border: `1px solid ${COLOR.BORDE}` }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth size="small" label="Número de Invoice" name="pdf_number" value={invoiceForm.pdf_number} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth size="small" label="Fecha" name="save_date" value={invoiceForm.save_date} onChange={handleChange} />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{ p: 2, border: `1px solid ${COLOR.BORDE}` }}>
                                <Typography variant="caption" fontWeight={700} color="textSecondary" mb={1} display="block">DATOS DEL CLIENTE</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <Autocomplete
                                            freeSolo
                                            fullWidth
                                            options={companyOptions.filter(c => c.nombre_factura)}
                                            getOptionLabel={(opt) => (typeof opt === 'string' ? opt : (opt.nombre_factura || ''))}
                                            loading={loadingCompanies}
                                            inputValue={invoiceForm.client_name}
                                            onInputChange={handleClientNameInput}
                                            onChange={handleSelectCompany}
                                            renderOption={(props, option) => (
                                                <li {...props} key={option.company_id}>
                                                    {option.nombre_factura}
                                                    {option.nombre_compania ? ` (${option.nombre_compania})` : ''}
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    size="small"
                                                    label="Nombre del Cliente"
                                                    placeholder="Escribe o elige una empresa ya conocida..."
                                                    helperText="Si la empresa no está en la lista, escríbela y guárdala junto con la dirección; la próxima vez se autocompleta."
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Dirección"
                                            name="client_address"
                                            value={invoiceForm.client_address}
                                            onChange={handleChange}
                                            multiline
                                            minRows={2}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{ p: 2, border: `1px solid ${COLOR.BORDE}` }}>
                                <Typography variant="caption" fontWeight={700} color="textSecondary" mb={1} display="block">DATOS DEL FLETE</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth size="small" label="Conductor" name="driver_name" value={invoiceForm.driver_name} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth size="small" label="CI Number" name="ci_number" value={invoiceForm.ci_number} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth size="small" label="Pick Up Date" type="date" InputLabelProps={{ shrink: true }} name="pickup_date" value={invoiceForm.pickup_date} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth size="small" label="Delivery Date" type="date" InputLabelProps={{ shrink: true }} name="delivery_date" value={invoiceForm.delivery_date} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12} sm={8}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Descripción (Ruta)"
                                            name="description"
                                            value={invoiceForm.description}
                                            onChange={handleChange}
                                            multiline
                                            minRows={2}
                                            helperText="Una parada por línea (Origen -> Parada 1 -> ... -> Destino). Se genera automático si la etapa tiene paradas adicionales."
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <TextField fullWidth size="small" label="Tarifa (Rate)" name="rate" type="number" value={invoiceForm.rate} onChange={handleChange} />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {/* === VISTA 2: PREVIEW === */}
                {viewMode === 'preview' && (
                    <Box sx={{ p: 4, bgcolor: COLOR.TENUE, display: 'flex', justifyContent: 'center', minHeight: '600px' }}>
                        <InvoicePreview data={invoiceForm} />
                    </Box>
                )}

            </DialogContent>
            
            <DialogActions sx={{ p: 2, bgcolor: COLOR.LIENZO, borderTop: `1px solid ${COLOR.BORDE}`, justifyContent: 'space-between' }}>
                {viewMode === 'form' ? (
                    <>
                        <Button onClick={onClose} color="inherit" sx={{ fontWeight: 600 }}>Cancelar</Button>
                        <Button variant="contained" color="primary" startIcon={<PictureAsPdfIcon />} onClick={() => setViewMode('preview')} sx={{ fontWeight: 700, px: 3 }}>
                            Ver Preview del Invoice
                        </Button>
                    </>
                ) : (
                    <>
                        <Button onClick={() => setViewMode('form')} color="inherit" startIcon={<ArrowBackIcon />} sx={{ fontWeight: 600 }}>
                            Regresar a Editar
                        </Button>
                        <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave} sx={{ fontWeight: 700, px: 3 }} disabled={!isFormValid || saving}>
                            {saving ? 'Guardando...' : 'Generar y Guardar Invoice'}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default InvoiceModal;