import { Box, Typography } from '@mui/material';

const STATUS_STYLES = {
    'Completed': '#16a34a',
    'In Transit': '#d97706',
    'Almost Over': '#2563eb',
    'Cancelled': '#dc2626',
    'In Coming': '#0891b2',
};

export const getStatusColor = (status) => STATUS_STYLES[status || 'In Transit'] || '#64748b';

// Barra de acento + punto en vez de un Chip sólido: mismo significado de color
// que antes, tratamiento más editorial y menos "template".
export const StatusIndicator = ({ status }) => {
    const value = status || 'In Transit';
    const color = getStatusColor(value);
    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
            <Typography variant="body2" fontWeight={600} sx={{ color }}>{value}</Typography>
        </Box>
    );
};
