import { useState, useEffect, useMemo } from 'react';
import { Box, Tabs, Tab, Typography, Stack, Button, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '../../store/useAuthStore';
import {
    PAGE_SHELL_SX, PAGE_OVERLINE_SX, PAGE_TITLE_SX,
    TABS_WRAPPER_SX, TAB_SX, DARK_BTN_SX,
} from '../../shared/ui/estilos';
import TablaOrdenes from '../../features/service-order/ui/TablaOrdenes.jsx';
import TablaInventario from '../../features/service-order/ui/TablaInventario.jsx';
import { useSesion } from '../../shared/auth';
import { COLOR } from '../../shared/ui/tokens';


const TABS_CONFIG = [
    { id: 'ordenes', label: 'Órdenes de Servicio', permission: 'mant_ordenes_servicio', Component: TablaOrdenes },
    { id: 'inventario', label: 'Inventario', permission: 'mant_inventario', Component: TablaInventario },
];

/**
 * Órdenes de servicio e inventario, en pestañas.
 *
 * Cada pestaña declara el permiso que la habilita, así que un usuario solo ve las
 * que le tocan y la primera visible se selecciona sola. Se montan de forma
 * perezosa: la de inventario no pide sus 745 artículos hasta que se abre.
 *
 * @returns {object} La pantalla.
 */
const OrdenesServicioPage = () => {
    const navigate = useNavigate();
    const { userPermissions } = useAuthStore();
    const { esTotal: isAdmin } = useSesion();

    const allowedTabs = useMemo(
        () => TABS_CONFIG.filter(tab => isAdmin || userPermissions?.[tab.permission] === true),
        [isAdmin, userPermissions]
    );

    const [tabValue, setTabValue] = useState(TABS_CONFIG[0].id);
    const [mountedTabs, setMountedTabs] = useState({});

    const activeTab = allowedTabs.some(tab => tab.id === tabValue)
        ? tabValue
        : allowedTabs[0]?.id;

    useEffect(() => {
        if (activeTab && activeTab !== tabValue) setTabValue(activeTab);
    }, [activeTab, tabValue]);

    useEffect(() => {
        if (activeTab) setMountedTabs(prev => (prev[activeTab] ? prev : { ...prev, [activeTab]: true }));
    }, [activeTab]);

    return (
        <Box sx={PAGE_SHELL_SX}>
            <Stack
                direction="row" justifyContent="space-between" alignItems="flex-end"
                mb={4} flexWrap="wrap" gap={2}
            >
                <Box>
                    <Typography variant="overline" sx={PAGE_OVERLINE_SX}>
                        Mantenimientos · Administración
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color={COLOR.TINTA} letterSpacing="-0.02em" sx={PAGE_TITLE_SX}>
                        Administrador de Órdenes de Servicio
                    </Typography>
                    <Typography variant="body2" color={COLOR.APAGADO} sx={{ mt: 0.5 }}>
                        Órdenes de servicio del taller e inventario de refacciones y consumibles.
                    </Typography>
                </Box>

                {activeTab === 'ordenes' && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/new-service-order')}
                        sx={DARK_BTN_SX}
                    >
                        Crear Nueva Orden
                    </Button>
                )}
            </Stack>

            {allowedTabs.length === 0 ? (
                <Alert severity="warning">No tienes privilegios de lectura en este módulo.</Alert>
            ) : (
                <>
                    {allowedTabs.length > 1 && (
                        <Box sx={TABS_WRAPPER_SX}>
                            <Tabs
                                value={activeTab}
                                onChange={(event, value) => setTabValue(value)}
                                variant="scrollable"
                                scrollButtons="auto"
                                allowScrollButtonsMobile
                                TabIndicatorProps={{ sx: { display: 'none' } }}
                                sx={{ minHeight: 0, '& .MuiTabs-flexContainer': { gap: 0.5 } }}
                            >
                                {allowedTabs.map(tab => (
                                    <Tab key={tab.id} label={tab.label} value={tab.id} disableRipple sx={TAB_SX} />
                                ))}
                            </Tabs>
                        </Box>
                    )}

                    {allowedTabs.map(tab => (
                        mountedTabs[tab.id] ? (
                            <Box key={tab.id} sx={{ display: activeTab === tab.id ? 'block' : 'none' }}>
                                <tab.Component />
                            </Box>
                        ) : null
                    ))}
                </>
            )}
        </Box>
    );
};

export default OrdenesServicioPage;
