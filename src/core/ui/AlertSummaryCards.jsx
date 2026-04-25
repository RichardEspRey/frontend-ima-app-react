import { Paper, Stack, Box, Typography, Divider } from '@mui/material';
import { STATUS_OPTIONS } from '../constants/finances';

const money = (v) =>
  new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    minimumFractionDigits: 2, 
    currencyDisplay: 'symbol' 
  }).format(Number(v || 0));


const SummaryCard = ({ title, data, color, label }) => (
    <Paper
        elevation={0}
        variant="outlined"
        sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            flex: 1, 
            minWidth: 200,
            borderLeft: `6px solid ${color}`,
            bgcolor: 'background.paper',
            transition: 'transform 0.2s',
        }}
    >
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="h4" fontWeight={700} sx={{ color: color, mb: 0.5 }}>
                {data.count || 0}
            </Typography>
            <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
                {money(data.totalAmount)}
            </Typography>
        </Stack>
        
        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
            {label}
        </Typography>
    </Paper>
);

export const AlertSummaryCards = ({ globalCounts }) => {
    const redMeta = STATUS_OPTIONS.find(o => o.value === 0);
    const orangeMeta = STATUS_OPTIONS.find(o => o.value === 1);
    const yellowMeta = STATUS_OPTIONS.find(o => o.value === 2);

    return (
        <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            spacing={2} 
            sx={{ mb: 3, mt: 1 }}
        >
            <SummaryCard 
                title="Pendientes de Cobrar" 
                data={globalCounts[0]} 
                color={redMeta.color} 
                label="Monto total pendiente (Alta Prioridad)"
            />
            <SummaryCard 
                title="Pendientes de Pago" 
                data={globalCounts[1]} 
                color={orangeMeta.color} 
                label="En proceso de pago/transferencia"
            />
            <SummaryCard 
                title="Pendientes RTS" 
                data={globalCounts[2]} 
                color={yellowMeta.color} 
                label="Documentación o proceso pendiente"
            />
        </Stack>
    );
};