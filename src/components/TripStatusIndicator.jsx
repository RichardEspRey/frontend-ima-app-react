import { Box, Typography } from '@mui/material';
import { COLOR } from '../shared/ui/tokens';

const STATUS_STYLES = {
    'Completed': COLOR.EXITO,
    'In Transit': COLOR.AVISO,
    'Almost Over': COLOR.INFO,
    'Cancelled': COLOR.PELIGRO,
    'In Coming': '#0891b2',
};

export const getStatusColor = (status) => STATUS_STYLES[status || 'In Transit'] || COLOR.APAGADO;

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
