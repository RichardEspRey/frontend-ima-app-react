import React, { useState, useEffect } from 'react';
import { 
    Dialog, DialogTitle, DialogContent, DialogActions, 
    TextField, Button, Grid, Typography, Divider, Box, Chip
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SaveIcon from '@mui/icons-material/Save';
import Swal from 'sweetalert2';

const InvoiceModal = ({ isOpen, onClose, stageData, tripData, onSaveInvoice }) => {
    const [invoiceForm, setInvoiceForm] = useState({
        pdf_number: '',
        save_date: '',
        client_name: '',
        client_address: '',
        driver_name: '',
        ci_number: '',
        pickup_date: '',
        delivery_date: '',
        description: '',
        rate: ''
    });

    // Precargar datos cuando se abre el modal
    useEffect(() => {
        if (isOpen && stageData && tripData) {
          const formatDateForInput = (dateValue) => {
                if (!dateValue) return '';
                const d = new Date(dateValue);
                if (isNaN(d.getTime())) return ''; // Por si la fecha es inválida
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };
            setInvoiceForm({
                pdf_number: stageData.invoice_pdf_number || `INV-${tripData.trip_number}-S${stageData.stage_number}`,
                save_date: stageData.invoice_save_date || '',
                client_name: stageData.company_name || 'Nombre del Cliente', // Mapear según tu BD
                client_address: stageData.company_address || 'Dirección del Cliente', // Mapear según tu BD
                driver_name: tripData.driver_nombre || '',
                ci_number: stageData.ci_number || '',
                pickup_date: formatDateForInput(stageData.loading_date),
                delivery_date: formatDateForInput(stageData.delivery_date),
                description: `${stageData.origin || 'Origen'} -> ${stageData.destination || 'Destino'}`,
                rate: stageData.rate_tarifa || ''
            });
        }
    }, [isOpen, stageData, tripData]);

    const handleChange = (e) => {
        setInvoiceForm({ ...invoiceForm, [e.target.name]: e.target.value });
    };

    const handlePreview = () => {
        Swal.fire({
            title: 'Preview en Desarrollo',
            icon: 'info'
        });
    };

    const handleSave = () => {
        // Simulamos la generación de la fecha de guardado
        const today = new Date().toLocaleDateString('es-MX');
        const updatedData = { ...invoiceForm, save_date: today };
        setInvoiceForm(updatedData);
        
        // Enviamos la data al padre (EditTripForm) para que lo maneje
        onSaveInvoice(updatedData, stageData.stage_number);
        
        Swal.fire({
            toast: true, position: 'top-end', icon: 'success', 
            title: 'Invoice guardado exitosamente', showConfirmButton: false, timer: 2000
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight="bold">Generar Invoice PDF (Etapa {stageData?.stage_number})</Typography>
                {invoiceForm.save_date && (
                    <Chip label={`Guardado el: ${invoiceForm.save_date}`} color="success" size="small" />
                )}
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="Número de PDF" name="pdf_number" value={invoiceForm.pdf_number} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="CI Number" name="ci_number" value={invoiceForm.ci_number} onChange={handleChange} />
                    </Grid>
                    
                    <Grid item xs={12}>
                        <Divider sx={{ my: 1 }}>Datos del Cliente</Divider>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="Nombre del Cliente" name="client_name" value={invoiceForm.client_name} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField fullWidth size="small" label="Dirección del Cliente" name="client_address" value={invoiceForm.client_address} onChange={handleChange} />
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 1 }}>Detalles del Viaje</Divider>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth size="small" label="Conductor" name="driver_name" value={invoiceForm.driver_name} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth size="small" label="Pick Up Date" type="date" InputLabelProps={{ shrink: true }} name="pickup_date" value={invoiceForm.pickup_date} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth size="small" label="Delivery Date" type="date" InputLabelProps={{ shrink: true }} name="delivery_date" value={invoiceForm.delivery_date} onChange={handleChange} />
                    </Grid>

                    <Grid item xs={12} sm={8}>
                        <TextField fullWidth size="small" label="Descripción (Ruta)" name="description" value={invoiceForm.description} onChange={handleChange} />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <TextField fullWidth size="small" label="Tarifa (Rate)" name="rate" value={invoiceForm.rate} onChange={handleChange} />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                <Button onClick={onClose} color="inherit">Cancelar</Button>
                <Box>
                    <Button variant="outlined" color="primary" startIcon={<PictureAsPdfIcon />} onClick={handlePreview} sx={{ mr: 2 }}>
                        Preview PDF
                    </Button>
                    <Button variant="contained" color="success" startIcon={<SaveIcon />} onClick={handleSave}>
                        Guardar Invoice
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};

export default InvoiceModal;