import { 
  TableRow, TableCell, IconButton, Chip, Stack, Typography, 
  Collapse, Box, Divider, Table, TableHead, TableBody, Tooltip, Badge 
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { STATUS_OPTIONS } from '../constants/finances';
import { StageDetailRow } from './StageDetailRow'; 
import { money, countCriticalStages } from '../utils/financeHelpers';

const StatusChip = ({ value }) => {
  const meta = STATUS_OPTIONS.find(o => o.value === Number(value));
  if (!meta) return <Chip size="small" label="Desconocido" />;
  return (
    <Chip
      label={meta.label}
      size="small"
      sx={{ bgcolor: meta.color, color: ['#fdd835'].includes(meta.color) ? '#000' : '#fff', fontWeight: 600 }}
    />
  );
};

const AlertBadge = ({ count, statusValue, tooltip }) => {
    if (count <= 0) return null;
    const meta = STATUS_OPTIONS.find(o => o.value === statusValue);
    return (
        <Tooltip title={tooltip}>
            <Badge
                badgeContent={count}
                sx={{ '& .MuiBadge-badge': { bgcolor: meta.color, color: statusValue === 2 ? 'black' : 'white' } }}
            >
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: meta.color }} />
            </Badge>
        </Tooltip>
    );
};

export const TripFinanceRow = ({ trip, isOpen, onToggle, onStageChange }) => {
  const criticalCounts = countCriticalStages(trip.stages);

  return (
    <>
      <TableRow hover>
        <TableCell width={48}>
          <IconButton size="small" onClick={() => onToggle(trip.trip_id)}>
            {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontWeight: 500 }}>{trip.trip_number}</TableCell>
        <TableCell>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip size="small" label={`${trip.stages_count}`} sx={{ fontWeight: 600 }} />
            <Typography variant="body2" color="text.secondary">etapas</Typography>
          </Stack>
        </TableCell>
        <TableCell align="right">{money(trip.total_tarifa)}</TableCell>
        <TableCell align="right">{money(trip.total_pagada ?? 0)}</TableCell>
        <TableCell><StatusChip value={trip.status_trip} /></TableCell>
        <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
          <Stack direction="row" spacing={1} justifyContent="center">
             <AlertBadge count={criticalCounts[0]} statusValue={0} tooltip={`${criticalCounts[0]} pendiente(s) de cobrar`} />
             <AlertBadge count={criticalCounts[1]} statusValue={1} tooltip={`${criticalCounts[1]} pendiente(s) de pago`} />
             <AlertBadge count={criticalCounts[2]} statusValue={2} tooltip={`${criticalCounts[2]} RTS`} />
          </Stack>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell colSpan={7} sx={{ p: 0, borderBottom: isOpen ? '1px solid rgba(224,224,224,1)' : 0 }}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>Stages</Typography>
              <Divider sx={{ mb: 1 }} />
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>ID Stage</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Origen</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Destino</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tarifa (rate)</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Método de pago</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Tarifa pagada</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {trip.stages.map(s => (
                    <StageDetailRow 
                      key={s.trip_stage_id}
                      trip_id={trip.trip_id}
                      stage={s} 
                      handleStageFieldChange={onStageChange}
                    />
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};