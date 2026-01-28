import { TableCell, TableRow, Stack, Tooltip, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Helpers 
const money = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, currencyDisplay: 'symbol' })
    .format(Number(v || 0));

export const MargenRow = ({ trip }) => {
    
    const currentMargin = trip.totalMargin;
    const isMarginPositive = currentMargin >= 0;
    
    const isPaid = trip.isFullyPaid; 
    const isDieselOk = trip.isDieselOk; 
    const isDriverPaid = trip.isDriverPaid; 

    const isCompleted = trip.isCompleted;

    return (
        <TableRow hover>
            
            <TableCell sx={{ fontWeight: 500 }}>{trip.trip_number}</TableCell>
            
            <TableCell align="right">
                <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
                    <Tooltip title={isPaid ? "Viaje Cobrado (Pagado)" : "Pendiente de Cobro"}>
                        {isPaid ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                        ) : (
                            <CancelIcon color="error" fontSize="small" />
                        )}
                    </Tooltip>
                    <span>{money(trip.tarifa_pagada)}</span>
                </Stack>
            </TableCell>
            
            <TableCell align="right">
                <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
                    <Tooltip title={isDieselOk ? "Información Completa" : "Falta Estado o Fleet One"}>
                        {isDieselOk ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                        ) : (
                            <CancelIcon color="error" fontSize="small" />
                        )}
                    </Tooltip>
                    <span>{money(trip.diesel)}</span>
                </Stack>
            </TableCell>

            <TableCell align="right">
                <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
                    <Tooltip title={isDriverPaid ? "Chofer Pagado" : "Pago Pendiente / Autorizado"}>
                        {isDriverPaid ? (
                            <CheckCircleIcon color="success" fontSize="small" />
                        ) : (
                            <CancelIcon color="error" fontSize="small" />
                        )}
                    </Tooltip>
                    <span>{money(trip.driver_pay)}</span>
                </Stack>
            </TableCell>

            <TableCell align="center">
                <Chip 
                    label={isCompleted ? "Completado" : "Pendiente"} 
                    color={isCompleted ? "success" : "warning"} 
                    size="small" 
                    variant={isCompleted ? "filled" : "outlined"}
                    sx={{ fontWeight: 700, minWidth: 90 }}
                />
            </TableCell>

            <TableCell 
                align="right" 
                sx={{ fontWeight: 700, color: isMarginPositive ? '#2e7d32' : '#d32f2f', bgcolor: '#f5f5f5' }}
            >
                {money(currentMargin)}
            </TableCell>
        </TableRow>
    );
};