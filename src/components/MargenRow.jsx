import { TableCell, TableRow, Stack, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

// Helpers 
const money = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, currencyDisplay: 'symbol' })
    .format(Number(v || 0));

export const MargenRow = ({ trip }) => {
    
    const currentMargin = trip.totalMargin;
    const isMarginPositive = currentMargin >= 0;
    
    // Semáforos
    const isPaid = trip.isFullyPaid; // Cobranza
    const isDieselOk = trip.isDieselOk; // Diesel
    const isDriverPaid = trip.isDriverPaid; // Pago Driver (Nuevo)

    return (
        <TableRow hover>
            
            <TableCell sx={{ fontWeight: 500 }}>{trip.trip_number}</TableCell>
            
            {/* Columna Total Tarifa (Cobranza) */}
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
            
            {/* Columna Costo Diesel */}
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

            {/* Columna Pago Driver (NUEVO SEMÁFORO) */}
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
            
            <TableCell 
                align="right" 
                sx={{ fontWeight: 700, color: isMarginPositive ? '#2e7d32' : '#d32f2f', bgcolor: '#f5f5f5' }}
            >
                {money(currentMargin)}
            </TableCell>
        </TableRow>
    );
};