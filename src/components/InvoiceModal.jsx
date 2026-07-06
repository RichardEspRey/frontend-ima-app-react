import React, { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, Button, Grid, Typography, Divider, Box, Chip, Paper
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Swal from 'sweetalert2';
import InvoicePreview from './InvoicePreview';

const apiHost = import.meta.env.VITE_API_HOST;

const InvoiceModal = ({ isOpen, onClose, stageData, tripData, onSaveInvoice }) => {
    const [viewMode, setViewMode] = useState('form');
    const [saving, setSaving] = useState(false);

    const [invoiceForm, setInvoiceForm] = useState({
        stage_id: '', pdf_number: '', save_date: '', client_name: '', client_address: '',
        driver_name: '', ci_number: '', trip_number: '', pickup_date: '',
        delivery_date: '', description: '', rate: ''
    });

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
                description: `${stageData.origin || 'Origen'} -> ${stageData.destination || 'Destino'}`,
                rate: stageData.rate_tarifa || ''
            });
        }
    }, [isOpen, stageData, tripData]);

    const isFormValid = Object.values(invoiceForm).every(val => String(val).trim() !== '');

    const handleChange = (e) => {
        setInvoiceForm({ ...invoiceForm, [e.target.name]: e.target.value });
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
            <DialogTitle sx={{ bgcolor: '#0f172a', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">
                    {viewMode === 'form' ? `Datos del Invoice - Etapa ${stageData?.stage_number}` : 'Vista Previa del Documento'}
                </Typography>
                <Chip label={tripData?.trip_number ? `Viaje: #${tripData.trip_number}` : ''} sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
            </DialogTitle>
            
            <DialogContent dividers sx={{ bgcolor: '#f1f5f9', p: viewMode === 'form' ? 3 : 0 }}>
                
                {/* === VISTA 1: FORMULARIO === */}
                {viewMode === 'form' && (
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0' }}>
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
                            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0' }}>
                                <Typography variant="caption" fontWeight={700} color="textSecondary" mb={1} display="block">DATOS DEL CLIENTE</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth size="small" label="Nombre del Cliente" name="client_name" value={invoiceForm.client_name} onChange={handleChange} />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField fullWidth size="small" label="Dirección" name="client_address" value={invoiceForm.client_address} onChange={handleChange} />
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Grid>

                        <Grid item xs={12}>
                            <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0' }}>
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
                                        <TextField fullWidth size="small" label="Descripción (Ruta)" name="description" value={invoiceForm.description} onChange={handleChange} />
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
                    <Box sx={{ p: 4, bgcolor: '#94a3b8', display: 'flex', justifyContent: 'center', minHeight: '600px' }}>
                        <InvoicePreview data={invoiceForm} />
                    </Box>
                )}

            </DialogContent>
            
            <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
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