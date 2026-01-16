import { TableCell, TableRow } from '@mui/material';

// Helpers 
const money = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, currencyDisplay: 'symbol' })
    .format(Number(v || 0));

export const MargenRow = ({ trip }) => {
    
    const currentMargin = trip.totalMargin;
    const isMarginPositive = currentMargin >= 0;

    return (
        <TableRow hover>
            
            <TableCell sx={{ fontWeight: 500 }}>{trip.trip_number}</TableCell>
            
            <TableCell align="right">{money(trip.tarifa_pagada)}</TableCell>
            
            <TableCell align="right">{money(trip.diesel)}</TableCell>

            <TableCell align="right">{money(trip.driver_pay)}</TableCell>
            
            <TableCell 
                align="right" 
                sx={{ fontWeight: 700, color: isMarginPositive ? '#2e7d32' : '#d32f2f', bgcolor: '#f5f5f5' }}
            >
                {money(currentMargin)}
            </TableCell>
        </TableRow>
    );
};