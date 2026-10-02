import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import FilterAltOffOutlinedIcon from '@mui/icons-material/FilterAltOffOutlined';

import { CARD_SX, SECTION_LABEL_SX } from '../../styles/estilosTabla';

/**
 * El marco de los filtros, igual en las dos pestañas.
 *
 * Cada panel pone sus propios campos; lo que se comparte es el encabezado, el
 * acomodo y el botón de limpiar, para que las dos listas se busquen igual.
 */
const BarraFiltros = ({ children, hayFiltros, onLimpiar, resumen }) => (
    <Paper elevation={0} sx={{ ...CARD_SX, mb: 2.5, bgcolor: 'white' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1.5 }}>
            <Typography variant="overline" sx={SECTION_LABEL_SX}>Filtros de búsqueda</Typography>
            {resumen && (
                <Typography variant="caption" color="#64748b">{resumen}</Typography>
            )}
        </Stack>

        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap alignItems="center">
            {children}

            <Box sx={{ flexGrow: 1 }} />

            <Button
                size="small"
                color="inherit"
                startIcon={<FilterAltOffOutlinedIcon />}
                disabled={!hayFiltros}
                onClick={onLimpiar}
                sx={{ textTransform: 'none', fontWeight: 700, color: '#475569' }}
            >
                Limpiar
            </Button>
        </Stack>
    </Paper>
);

export default BarraFiltros;
