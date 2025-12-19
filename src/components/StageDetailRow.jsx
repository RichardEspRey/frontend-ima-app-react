import React, { useContext } from 'react';
import { TableCell, TableRow, TextField, Select, MenuItem, InputAdornment, Box, Typography } from '@mui/material';
import { PAYMENT_METHODS, STATUS_OPTIONS } from '../constants/finances';
import { AuthContext } from '../auth/AuthContext';

// Helpers 
const money = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, currencyDisplay: 'symbol' })
    .format(Number(v || 0));

const renderStatusValue = (val) => {
    const opt = STATUS_OPTIONS.find(o => o.value === Number(val));
    if (!opt) return <Typography variant="body2" color="text.secondary">Seleccionar status…</Typography>;
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: opt.color }} />
            <Typography variant="body2" fontWeight={500}>{opt.label}</Typography>
        </Box>
    );
};

export const StageDetailRow = ({ trip_id, stage, handleStageFieldChange }) => {
    const { user } = useContext(AuthContext);

    // Lógica de Permisos
    const ROLES_PERMITIDOS = ['admin', 'dev'];
    const userRole = (user?.tipo_usuario || '').toLowerCase();
    const canViewDeficit = ROLES_PERMITIDOS.includes(userRole);

    const isPagada = Number(stage.status) === 3; 
    
    let deficitContent = '-';
    let deficitColor = 'text.secondary';

    if (canViewDeficit && isPagada) {
        const rate = Number(stage.rate_tarifa || 0);
        const paidStr = String(stage.paid_rate || '').replace(/[^\d.-]/g, '');
        const paid = Number(paidStr || 0);

        if (rate > 0) {
            const difference = rate - paid;
            const percent = (difference / rate) * 100;
            
            deficitContent = `${percent.toFixed(2)}%`;
            
            if (percent > 0) deficitColor = 'error.main';
            else if (percent < 0) deficitColor = 'success.main';
            else deficitColor = 'text.primary';
        }
    }

    return (
        <TableRow hover selected={!!stage._dirty} sx={{ bgcolor: stage._dirty ? '#fff3e0' : 'transparent' }}> 
            <TableCell sx={{ fontWeight: 500 }}>{stage.trip_stage_id}</TableCell>
            {/* <TableCell>{stage.stage_number}</TableCell> */}
            <TableCell>{stage.origin || <em>-</em>}</TableCell>
            <TableCell>{stage.destination || <em>-</em>}</TableCell>
            
            <TableCell sx={{ fontWeight: 600, color: '#3C48E1' }}>
                {stage.rate_tarifa != null ? money(stage.rate_tarifa) : <em>-</em>}
            </TableCell>

            <TableCell sx={{ minWidth: 180 }}>
                <Select
                    size="small"
                    value={stage.payment_method}
                    onChange={(e) => handleStageFieldChange(trip_id, stage.trip_stage_id, 'payment_method', e.target.value)}
                    displayEmpty
                    fullWidth
                    sx={{ bgcolor: stage._dirty ? '#ffe0b2' : 'transparent' }} 
                >
                    <MenuItem value=""><em>Seleccionar…</em></MenuItem>
                    {PAYMENT_METHODS.map(opt => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                    ))}
                </Select>
            </TableCell>

            <TableCell sx={{ minWidth: 160 }}>
                <TextField
                    size="small"
                    value={stage.paid_rate}
                    onChange={(e) => {
                        const clean = e.target.value === '' ? '' : e.target.value.replace(/[^\d.]/g, '');
                        handleStageFieldChange(trip_id, stage.trip_stage_id, 'paid_rate', clean);
                    }}
                    placeholder="0.00"
                    inputProps={{ inputMode: 'decimal' }}
                    fullWidth
                    sx={{ bgcolor: stage._dirty ? '#ffe0b2' : 'transparent' }}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                />
            </TableCell>

            {canViewDeficit && (
                <TableCell sx={{ fontWeight: 700 }}>
                    <Typography variant="body2" color={deficitColor} fontWeight="bold">
                        {isPagada ? deficitContent : '-'}
                    </Typography>
                </TableCell>
            )}

            <TableCell sx={{ minWidth: 220 }}>
                <Select
                    size="small"
                    value={stage.status}
                    onChange={(e) => handleStageFieldChange(trip_id, stage.trip_stage_id, 'status', Number(e.target.value))}
                    displayEmpty
                    fullWidth
                    sx={{ bgcolor: stage._dirty ? '#ffe0b2' : 'transparent' }}
                    renderValue={renderStatusValue}
                >
                    <MenuItem value=""><em>Seleccionar status…</em></MenuItem>
                    {STATUS_OPTIONS.map(opt => (
                        <MenuItem key={opt.value} value={opt.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: opt.color }} />
                                {opt.label}
                            </Box>
                        </MenuItem>
                    ))}
                </Select>
            </TableCell>
        </TableRow>
    );
};