import React from 'react';
import { Box, Typography } from '@mui/material';

import templateBg from '../assets/images/invoice_template.png'; 

const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(num);
};

const getDynamicFontSize = (id, value) => {
    if (!value) return undefined;
    const strValue = String(value);

    if (id === 'driver_name' && strValue.length > 23) {
        return '0.65rem';
    }
    
    if ((id === 'rate' || id === 'total') && strValue.length > 9) {
        return '0.75rem';
    }

    return undefined;
};

const InvoicePreview = ({ data }) => {
    const backgroundUrl = `url(${templateBg})`;

    const formattedRate = formatCurrency(data.rate);

    // --- SISTEMA DE COORDENADAS ---
    const fields = [
        // ENCABEZADO
        { id: 'pdf_number', value: data.pdf_number, top: '16%', left: '57%', variant: 'subtitle2', bold: true },
        { id: 'save_date', value: data.save_date, top: '16%', left: '79%', variant: 'subtitle2' },

        // BILL TO
        { id: 'client_name', value: data.client_name, top: '25%', left: '7%', variant: 'subtitle1', bold: true, maxWidth: '45%', noWrap: true },
        { id: 'client_address', value: data.client_address, top: '28%', left: '7%', variant: 'body2', width: '30%' }, 

        // TABLA 1: DATOS DEL VIAJE 
        { id: 'driver_name', value: data.driver_name, top: '35.2%', left: '8%', variant: 'body2', maxWidth: '25%', noWrap: true },
        { id: 'ci_number', value: data.ci_number, top: '35.2%', left: '35%', variant: 'body2', maxWidth: '17%', noWrap: true },
        { id: 'pickup_date', value: data.pickup_date, top: '35.2%', left: '53.5%', variant: 'body2' },
        { id: 'delivery_date', value: data.delivery_date, top: '35.2%', left: '65%', variant: 'body2' },

        // TABLA 2: CONCEPTOS
        { id: 'qty', value: 'FREIGHT', top: '46%', left: '8.5%', variant: 'body2' },
        { id: 'description', value: data.description, top: '46%', left: '25%', variant: 'body2', width: '45%' },
        
        { id: 'rate', value: formattedRate, top: '46%', left: '77%', width: '15%', align: 'right', variant: 'body2', bold: false },

        // TOTAL
        { id: 'total', value: formattedRate, top: '73.5%', left: '75%', width: '15%', align: 'right', variant: 'body2', bold: true, color: '#111827' },
    ];

    return (
        <Box sx={{
            position: 'relative',
            width: '100%',
            maxWidth: '816px',
            aspectRatio: '816 / 1056', 
            backgroundImage: backgroundUrl,
            backgroundSize: '100% 100%',
            backgroundPosition: 'top left',
            backgroundRepeat: 'no-repeat',
            bgcolor: 'white',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            margin: '0 auto',
            overflow: 'hidden'
        }}>
            {fields.map((field) => (
                <Typography 
                    key={field.id}
                    variant={field.variant || 'body2'}
                    sx={{
                        position: 'absolute',
                        top: field.top,
                        left: field.left,
                        fontWeight: field.bold ? 800 : 400,
                        color: field.color || '#374151',
                        
                        width: field.width || 'auto',
                        maxWidth: field.maxWidth || 'none',
                        textAlign: field.align || 'left',
                        
                        fontSize: getDynamicFontSize(field.id, field.value),
                        
                        whiteSpace: field.noWrap ? 'nowrap' : (field.width ? 'pre-line' : 'nowrap'),
                        overflow: field.noWrap ? 'hidden' : 'visible',
                        textOverflow: field.noWrap ? 'ellipsis' : 'clip',
                    }}
                >
                    {field.value || ''}
                </Typography>
            ))}
        </Box>
    );
};

export default InvoicePreview;