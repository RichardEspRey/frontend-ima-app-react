import { Paper, Stack, Box, Typography, Divider } from '@mui/material';
import { STATUS_OPTIONS } from '../constants/finances';

const SummaryCard = ({ title, count, color, label }) => (
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
            // '&:hover': { transform: 'translateY(-2px)', boxShadow: 1 }
        }}
    >
        <Typography variant="h4" fontWeight={700} sx={{ color: color, mb: 0.5 }}>
            {count}
        </Typography>
        <Typography variant="subtitle2" fontWeight={700} color="text.primary">
            {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
            {label}
        </Typography>
    </Paper>
);

export const AlertSummaryCards = ({ globalCounts }) => {
    // Obtenemos los colores de las constantes
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
                count={globalCounts[0] || 0} 
                color={redMeta.color} 
                label="Requiere Atención Inmediata"
            />
            <SummaryCard 
                title="Pendientes de Pago" 
                count={globalCounts[1] || 0} 
                color={orangeMeta.color} 
                label="En proceso de cobro"
            />
            <SummaryCard 
                title="Pendientes RTS" 
                count={globalCounts[2] || 0} 
                color={yellowMeta.color} 
                label="Documentación pendiente"
            />
        </Stack>
    );
};