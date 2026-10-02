import { useState } from 'react';
import { Box, Stack, Tab, Tabs, Typography } from '@mui/material';
import PanelInspecciones from '../../components/Mantenimientos/PanelInspecciones';
import PanelPendientes from '../../components/Mantenimientos/PanelPendientes';
import ServiceOrderAdmin from '../ServiceOrderAdmin.jsx';
import {
    PAGE_SHELL_SX, PAGE_OVERLINE_SX, PAGE_TITLE_SX, TABS_WRAPPER_SX, TAB_SX,
} from '../../styles/estilosTabla';

const PESTANAS = [
    { id: 'inspecciones', etiqueta: 'Inspecciones' },
    { id: 'pendientes', etiqueta: 'Reparaciones pendientes' },
    { id: 'ordenes', etiqueta: 'Órdenes de servicio' },
];

/**
 * El taller en una sola pantalla: lo que reportó el operador, lo que quedó pendiente
 * y las órdenes de servicio, sin saltar entre pantallas ni pasar por un Excel.
 */
const Mantenimiento = () => {
    const [pestana, setPestana] = useState('inspecciones');

    return (
        <Box sx={PAGE_SHELL_SX}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4} flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="overline" sx={PAGE_OVERLINE_SX}>Mantenimientos</Typography>
                    <Typography variant="h4" fontWeight={800} color="#0f172a" sx={PAGE_TITLE_SX}>
                        Reparaciones
                    </Typography>
                    <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                        De lo que reportó el operador a la orden de servicio, sin salir de aquí.
                    </Typography>
                </Box>
            </Stack>

            <Box sx={{ ...TABS_WRAPPER_SX, mb: 3 }}>
                <Tabs value={pestana} onChange={(_evento, valor) => setPestana(valor)} TabIndicatorProps={{ style: { display: 'none' } }}>
                    {PESTANAS.map(p => <Tab key={p.id} value={p.id} label={p.etiqueta} sx={TAB_SX} />)}
                </Tabs>
            </Box>

            {pestana === 'inspecciones' && (
                <PanelInspecciones />
            )}

            {pestana === 'pendientes' && <PanelPendientes />}

            {pestana === 'ordenes' && <ServiceOrderAdmin />}
        </Box>
    );
};

export default Mantenimiento;
