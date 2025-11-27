import React, { useState, useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, Paper,
    Button, TextField, Box, Typography, Collapse, IconButton, InputAdornment, Grid, Tooltip
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// Helpers 
const money = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, currencyDisplay: 'symbol' })
    .format(Number(v || 0));

export const MargenRow = ({ trip, onSaveDriverPay }) => {
    const [open, setOpen] = useState(false);
    const [driverPayManual, setDriverPayManual] = useState(trip.driver_pay || '');
    
    // Recalculo en tiempo real del margen si el input cambia
    const currentMargin = useMemo(() => {
        const pay = Number(String(driverPayManual).replace(/[^\d.]/g, '') || 0);
        // Margen = Tarifa - Diesel - Gastos - Pago Manual Actualizado
        return trip.rate_tarifa - trip.diesel - trip.gastos - pay; 
    }, [driverPayManual, trip.diesel, trip.gastos, trip.rate_tarifa]);

    const isMarginPositive = currentMargin >= 0;
    
    const handleSave = () => {
        onSaveDriverPay(trip.trip_id, driverPayManual);
    };

    return (
        <>
            {/* Fila Principal */}
            <TableRow hover>
                <TableCell width={48}>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{trip.trip_number}</TableCell>
                <TableCell align="right">{money(trip.rate_tarifa)}</TableCell>
                <TableCell align="right">{money(trip.diesel)}</TableCell>
                <TableCell align="right">{money(trip.gastos)}</TableCell>
                <TableCell align="right">{money(trip.driver_pay)}</TableCell>
                
                {/* Margen Total */}
                <TableCell 
                    align="right" 
                    sx={{ fontWeight: 700, color: isMarginPositive ? '#2e7d32' : '#d32f2f', bgcolor: '#f5f5f5' }}
                >
                    {money(currentMargin)}
                </TableCell>
            </TableRow>

            {/* Collapse (Detalle de Edición) */}
            <TableRow>
                <TableCell colSpan={7} sx={{ p: 0 }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 3 }}>
                            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                                Ajuste Manual de Pago del Driver
                            </Typography>
                            
                            <Table size="small" sx={{ maxWidth: 600 }}>
                                <TableBody>
                                    {/* Campo de edición del Driver Pay */}
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700, color: '#bf360c', width: '50%' }}>Pago Driver Actualizado:</TableCell>
                                        <TableCell>
                                            <TextField
                                                size="small"
                                                value={driverPayManual}
                                                onChange={(e) => setDriverPayManual(e.target.value.replace(/[^\d.]/g, ''))}
                                                onBlur={(e) => {
                                                    const n = Number(String(e.target.value).replace(/[^\d.]/g, '') || 0);
                                                    setDriverPayManual(Number.isFinite(n) ? n.toFixed(2) : '0.00');
                                                }}
                                                inputProps={{ inputMode: 'decimal' }}
                                                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                    
                                    {/* Fila de Recalculo de Margen */}
                                    <TableRow sx={{ bgcolor: '#e0e0e0' }}>
                                        <TableCell sx={{ fontWeight: 900 }}>MARGEN NETO ACTUAL</TableCell>
                                        <TableCell sx={{ fontWeight: 900 }}>{money(currentMargin)}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>

                            <Button 
                                variant="contained" 
                                color="primary" 
                                size="small" 
                                onClick={handleSave} 
                                sx={{ mt: 2 }}
                            >
                                Guardar Pago Manual
                            </Button>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};