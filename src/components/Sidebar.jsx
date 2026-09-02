import React, { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Box, Stack, Tooltip, List, ListItem, ListItemButton, 
    ListItemIcon, ListItemText, Collapse, Typography, LinearProgress, Avatar,
    Button, IconButton, Divider
} from '@mui/material'; 
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CarRentalIcon from '@mui/icons-material/CarRental';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import SecurityIcon from '@mui/icons-material/Security';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import MapIcon from '@mui/icons-material/Map';

import logo from '../assets/images/logo_white.png';
import iconUpdate from '../assets/images/icons/update.png';

import { UpdateContext } from '../App';
import { menuItemsConfig } from '../config/menuConfig';
import { useAuthStore } from '../store/useAuthStore';
import {
    useSidebarStore,
    SIDEBAR_WIDTH_EXPANDED,
    SIDEBAR_WIDTH_COLLAPSED,
} from '../store/useSidebarStore';
import { useSesion } from '../shared/auth';
import { COLOR } from '../shared/ui/tokens';

const iconMap = {
    'Inicio': DashboardIcon,
    'IMA Manager': AssignmentIcon,
    'IMA': AssignmentIcon,
    'Conductores': CarRentalIcon,
    'Camiones': DirectionsBusIcon,
    'Cajas': DirectionsBusIcon,
    'Gastos': LocalGasStationIcon,
    'Mantenimientos': FormatListBulletedIcon,
    'Viajes': LocalShippingIcon,
    'Finanzas': AttachMoneyIcon,
    'Reports': BarChartIcon,
    'Safety': SecurityIcon,
    'Mapa': MapIcon,
    'Gestor de Acceso': FormatListBulletedIcon,
    'Estatus de Unidades': TrendingUpIcon,
};

const MANAGEMENT_ITEM = { name: 'Gestor de Acceso', route: '/access-manager' };
const menuItems = [ ...menuItemsConfig, MANAGEMENT_ITEM ];

const labelSx = (visible) => ({
    opacity: visible ? 1 : 0,
    maxWidth: visible ? 220 : 0,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    transition: 'opacity 0.2s ease, max-width 0.25s ease',
    m: 0,
});

const Sidebar = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const { user, logout, userPermissions, fetchPermissions } = useAuthStore();
  const { mode, setMode } = useSidebarStore();
  const { updateDisponible } = useContext(UpdateContext);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const [openMenus, setOpenMenus] = useState({});
  const [notificaciones, setNotificaciones] = useState({});
  const [subnotificaciones, setSubnotificaciones] = useState({});

  const isPinnedExpanded = mode === 'expanded';
  const isVisuallyExpanded = isPinnedExpanded || isHovered;
  const railWidth = isPinnedExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED;

  useEffect(() => {
    if (user?.id) {
        fetchPermissions(user.id);

        const handleFocus = () => {
            fetchPermissions(user.id);
        };
        
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }
  }, [user?.id, fetchPermissions]);

  useEffect(() => {
    if (window?.electron?.onUpdateProgress) window.electron.onUpdateProgress(setProgress);
  }, []);

  useEffect(() => {
      menuItems.forEach(item => {
          if (item.subItems?.some(sub => sub.route === currentPath)) {
              setOpenMenus(prev => ({ ...prev, [item.name]: true }));
          }
      });
  }, [currentPath]);

  const { esTotal: isAdmin } = useSesion();

  const isSectionAllowed = useCallback((item, visibleSubs = true) => {
      if (item.name === MANAGEMENT_ITEM.name) return isAdmin;
      if (isAdmin) return true;
      const dynamicPermission = userPermissions[item.featureKey ?? item.name];
      if (dynamicPermission !== undefined) return dynamicPermission;
      if (item.subItems && item.subItems.length > 0) return visibleSubs;
      return false;
  }, [isAdmin, userPermissions]);

  const menuFiltrado = useMemo(() => {
      return menuItems.reduce((acc, item) => {
          if (item.hideInSidebar) return acc;
          if (Array.isArray(item.subItems) && item.subItems.length > 0) {
              const visibleSubs = item.subItems.filter((subItem) => {
                  if (subItem.hideInSidebar) return false;
                  if (isAdmin) return true;
                  return userPermissions[subItem.featureKey ?? subItem.name] === true;
              });
              if (visibleSubs.length > 0 && isSectionAllowed(item, true)) acc.push({ ...item, subItems: visibleSubs });
              return acc;
          }
          if (isSectionAllowed(item)) acc.push(item);
          return acc;
      }, []);
  }, [isAdmin, isSectionAllowed, userPermissions]);

  const fetchdocs = useCallback(async () => {
    try {
      const fd = new FormData(); fd.append('op', 'getStatus');
      const res = await fetch(`${apiHost}/IMA_Docs.php`, { method: 'POST', body: fd });
      const data = await res.json();
      const u = data.Users?.[0];
      if (data.status === 'success' && u) {
        setNotificaciones(prev => ({ 
            ...prev, 
            'IMA Manager': { red: parseInt(u.ima_vencidos||0) + parseInt(u.driver_vencidos||0) + parseInt(u.documentos_faltantes_truck||0) + parseInt(u.documentos_faltantes_trailer||0), yellow: parseInt(u.ima_por_vencer||0) + parseInt(u.driver_por_vencer||0) }
        }));
        setSubnotificaciones(prev => ({
          ...prev,
          'Documentos': { red: parseInt(u.ima_vencidos||0), yellow: parseInt(u.ima_por_vencer||0) },
          'Conductores': { red: parseInt(u.driver_vencidos||0), yellow: parseInt(u.driver_por_vencer||0) },
          'Camiones': { red: parseInt(u.documentos_faltantes_truck||0), yellow: 0 },
          'Cajas': { red: parseInt(u.documentos_faltantes_trailer||0), yellow: 0 },
        }));
      }
    } catch (error) { console.error(error); }
  }, [apiHost]);

  const fetchInspecciones = useCallback(async () => {
    try {
      const fd = new URLSearchParams();
      fd.append('op', 'All_CL_Final');
      
      const res = await fetch(`${apiHost}/formularios.php`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: fd 
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        const list = data.rows || data.row || data.data || [];
        const pendientes = list.filter(r => Number(r.status) !== 1).length;
        
        setNotificaciones(prev => ({
            ...prev,
            'Mantenimientos': { red: pendientes, yellow: 0 }
        }));
        setSubnotificaciones(prev => ({
            ...prev,
            'Inspeccion final': { red: pendientes, yellow: 0 }
        }));
      }
    } catch (error) { console.error("Error cargando inspecciones:", error); }
  }, [apiHost]);

  useEffect(() => {
    fetchdocs(); 
    fetchInspecciones();
    
    const interval = setInterval(() => {
        fetchdocs();
        fetchInspecciones();
    }, 300000); 
    
    return () => clearInterval(interval);
  }, [fetchdocs, fetchInspecciones]);

  const toggleMenu = (name) => setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));

  const handleMenuClick = (item, hasSubs) => {
    if (hasSubs) {
      if (!isVisuallyExpanded) setIsHovered(true);
      toggleMenu(item.name);
      return;
    }
    if (item.route) navigate(item.route);
  };

  const NotificationBadges = ({ counts, compact }) => {
      const { red = 0, yellow = 0 } = counts || {};
      if (!red && !yellow) return null;

      if (compact) {
        const total = red + yellow;
        return (
          <Box
            sx={{
              position: 'absolute',
              top: 4,
              right: 4,
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: red > 0 ? COLOR.PELIGRO : COLOR.AVISO,
              border: `2px solid ${COLOR.TINTA}`,
            }}
            title={`${total} alerta(s)`}
          />
        );
      }

      return (
          <Stack direction="row" spacing={0.5} alignItems="center" pl={1} sx={labelSx(isVisuallyExpanded)}>
              {red > 0 && <Tooltip title="Vencidos" placement="right"><Avatar sx={{ width: 22, height: 22, bgcolor: COLOR.PELIGRO, fontSize: '0.75rem', fontWeight: 800 }}>{red}</Avatar></Tooltip>}
              {yellow > 0 && <Tooltip title="Por Vencer" placement="right"><Avatar sx={{ width: 22, height: 22, bgcolor: COLOR.AVISO, fontSize: '0.75rem', fontWeight: 800 }}>{yellow}</Avatar></Tooltip>}
          </Stack>
      );
  };

  const menuItemButtonSx = (isActive) => ({
    borderRadius: 2,
    justifyContent: isVisuallyExpanded ? 'flex-start' : 'center',
    px: isVisuallyExpanded ? 2 : 1,
    bgcolor: isActive ? COLOR.INFO : 'transparent',
    color: isActive ? COLOR.BLANCO : COLOR.TENUE,
    transition: 'all 0.2s',
    '&:hover': { bgcolor: isActive ? COLOR.INFO : 'rgba(255,255,255,0.05)', color: COLOR.BLANCO },
  });

  return (
    <Box
      sx={{
        width: railWidth,
        flexShrink: 0,
        height: '100vh',
        position: 'relative',
        transition: 'width 0.25s ease',
      }}
    >
      <Box
        onMouseEnter={() => !isPinnedExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          width: isVisuallyExpanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COLLAPSED,
          height: '100vh',
          bgcolor: COLOR.TINTA,
          color: COLOR.BORDE_FUERTE,
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid ${COLOR.TINTA_CLARA}`,
          position: !isPinnedExpanded && isHovered ? 'absolute' : 'relative',
          left: 0,
          top: 0,
          zIndex: !isPinnedExpanded && isHovered ? 1200 : 20,
          boxShadow: !isPinnedExpanded && isHovered ? '6px 0 28px rgba(0,0,0,0.4)' : 'none',
          transition: 'width 0.25s ease, box-shadow 0.25s ease',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            py: isVisuallyExpanded ? 2.5 : 1.5,
            px: isVisuallyExpanded ? 3 : 1,
            pb: isVisuallyExpanded ? 2 : 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: isVisuallyExpanded ? 88 : 56,
            transition: 'padding 0.25s ease, min-height 0.25s ease',
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Logo IMA"
            sx={{
              width: isVisuallyExpanded ? '75%' : 40,
              maxWidth: isVisuallyExpanded ? 200 : 40,
              height: 'auto',
              objectFit: 'contain',
              opacity: 0.95,
              transition: 'width 0.25s ease, max-width 0.25s ease',
            }}
          />
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            p: isVisuallyExpanded ? 1.5 : 0.75,
            '&::-webkit-scrollbar': { width: '4px' },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '4px' },
          }}
        >
          <List disablePadding>
            {menuFiltrado.map((item) => {
              const hasSubs = !!(item.subItems && item.subItems.length > 0);
              const isOpen = openMenus[item.name]; 
              const IconComponent = iconMap[item.name] || FormatListBulletedIcon;
              const isActive = currentPath === item.route;

              const menuButton = (
                <ListItemButton
                  onClick={() => handleMenuClick(item, hasSubs)}
                  sx={menuItemButtonSx(isActive)}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: isVisuallyExpanded ? 40 : 0,
                      mr: isVisuallyExpanded ? 0 : 0,
                      justifyContent: 'center',
                      color: isActive ? COLOR.BLANCO : 'inherit',
                      position: 'relative',
                    }}
                  >
                    <IconComponent sx={{ fontSize: 22 }} />
                    {!isVisuallyExpanded && (
                      <NotificationBadges counts={notificaciones[item.name]} compact />
                    )}
                  </ListItemIcon>

                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' }}
                    sx={labelSx(isVisuallyExpanded)}
                  />
                  {isVisuallyExpanded && <NotificationBadges counts={notificaciones[item.name]} />}

                  {hasSubs && isVisuallyExpanded && (
                    <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', opacity: 0.7, ...labelSx(true) }}>
                      {isOpen ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
                    </Box>
                  )}
                </ListItemButton>
              );

              return (
                <React.Fragment key={item.name}>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    {isVisuallyExpanded ? (
                      menuButton
                    ) : (
                      <Tooltip title={item.name} placement="right" arrow>
                        {menuButton}
                      </Tooltip>
                    )}
                  </ListItem>

                  {hasSubs && isVisuallyExpanded && (
                    <Collapse in={isOpen} timeout="auto" unmountOnExit>
                      <List component="div" disablePadding sx={{ pl: 2.5, mb: 1, position: 'relative' }}>
                        <Box sx={{ position: 'absolute', left: 20, top: 0, bottom: 10, width: '1px', bgcolor: 'rgba(255,255,255,0.1)' }} />
                        
                        {item.subItems.map((subItem) => {
                            const isSubActive = currentPath === subItem.route;
                            return (
                                <ListItemButton 
                                    key={subItem.name} 
                                    onClick={() => subItem.route && navigate(subItem.route)}
                                    sx={{ 
                                        borderRadius: 2, py: 0.8, my: 0.2,
                                        color: isSubActive ? COLOR.BLANCO : COLOR.TENUE,
                                        bgcolor: isSubActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: COLOR.BLANCO }
                                    }}
                                >
                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isSubActive ? COLOR.INFO : 'transparent', border: isSubActive ? 'none' : `1px solid ${COLOR.APAGADO}`, mr: 2, zIndex: 2 }} />
                                    <ListItemText primary={subItem.name} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isSubActive ? 600 : 400 }} />
                                    <NotificationBadges counts={subnotificaciones[subItem.name]} />
                                </ListItemButton>
                            );
                        })}
                      </List>
                    </Collapse>
                  )}
                </React.Fragment>
              );
            })}
          </List>
        </Box>

        <Box sx={{ p: isVisuallyExpanded ? 2 : 1, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          
          <Stack
            direction={isVisuallyExpanded ? 'row' : 'column'}
            spacing={0.5}
            alignItems="center"
            justifyContent="center"
            sx={{ mb: 1.5 }}
          >
            <Tooltip title="Barra expandida fija" placement="right" arrow>
              <IconButton
                size="small"
                onClick={() => setMode('expanded')}
                aria-label="Barra expandida fija"
                sx={{
                  color: isPinnedExpanded ? COLOR.INFO : COLOR.APAGADO,
                  bgcolor: isPinnedExpanded ? 'rgba(59,130,246,0.15)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: COLOR.BLANCO },
                }}
              >
                <ViewSidebarIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Solo iconos (expandir al pasar el mouse)" placement="right" arrow>
              <IconButton
                size="small"
                onClick={() => setMode('collapsed')}
                aria-label="Modo compacto"
                sx={{
                  color: !isPinnedExpanded ? COLOR.INFO : COLOR.APAGADO,
                  bgcolor: !isPinnedExpanded ? 'rgba(59,130,246,0.15)' : 'transparent',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.08)', color: COLOR.BLANCO },
                }}
              >
                <ViewCompactIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            {isVisuallyExpanded && (
              <Tooltip title={isPinnedExpanded ? 'Cambiar a modo compacto' : 'Fijar expandido'} placement="top">
                <IconButton
                  size="small"
                  onClick={() => setMode(isPinnedExpanded ? 'collapsed' : 'expanded')}
                  sx={{ color: COLOR.TENUE, ml: isPinnedExpanded ? 'auto' : 0, '&:hover': { color: COLOR.BLANCO } }}
                >
                  <ChevronLeftIcon
                    sx={{ fontSize: 20 }}
                    style={{
                      transform: isPinnedExpanded ? 'rotate(0deg)' : 'rotate(180deg)',
                      transition: 'transform 0.2s',
                    }}
                  />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          {isVisuallyExpanded && (
            <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', color: COLOR.APAGADO, mb: 1.5, px: 0.5 }}>
              {isPinnedExpanded ? 'Barra fija expandida' : 'Pasa el mouse para expandir'}
            </Typography>
          )}

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 1.5 }} />

          {updateDisponible && isVisuallyExpanded && (
              <Box sx={{ mb: 2 }}>
                  <Button fullWidth variant="contained" color="success" startIcon={<img src={iconUpdate} width={16} alt="update" style={{ filter: 'invert(1)' }}/>} onClick={() => window.electron?.descargarUpdate()} disabled={progress > 0 && progress < 100} sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}>
                      Actualizar
                  </Button>
                  {progress > 0 && progress < 100 && (
                      <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">Descargando... {Math.floor(progress)}%</Typography>
                          <LinearProgress variant="determinate" value={progress} color="success" sx={{ height: 6, borderRadius: 3, mt: 0.5 }} />
                      </Box>
                  )}
              </Box>
          )}

          {updateDisponible && !isVisuallyExpanded && (
            <Tooltip title="Actualizar aplicación" placement="right">
              <IconButton
                color="success"
                onClick={() => window.electron?.descargarUpdate()}
                disabled={progress > 0 && progress < 100}
                sx={{ mb: 1, width: '100%' }}
              >
                <img src={iconUpdate} width={20} alt="update" style={{ filter: 'invert(1)' }} />
              </IconButton>
            </Tooltip>
          )}

          {isVisuallyExpanded ? (
            <ListItemButton onClick={logout} sx={{ borderRadius: 2, color: COLOR.PELIGRO_BORDE, transition: '0.2s', '&:hover': { bgcolor: COLOR.PELIGRO, color: COLOR.BLANCO } }}>
              <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}><ExitToAppIcon sx={{ fontSize: 22 }} /></ListItemIcon>
              <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }} />
            </ListItemButton>
          ) : (
            <Tooltip title="Cerrar Sesión" placement="right" arrow>
              <ListItemButton
                onClick={logout}
                sx={{
                  borderRadius: 2,
                  color: COLOR.PELIGRO_BORDE,
                  justifyContent: 'center',
                  minWidth: 0,
                  '&:hover': { bgcolor: COLOR.PELIGRO, color: COLOR.BLANCO },
                }}
              >
                <ListItemIcon sx={{ minWidth: 0, justifyContent: 'center', color: 'inherit' }}>
                  <ExitToAppIcon sx={{ fontSize: 22 }} />
                </ListItemIcon>
              </ListItemButton>
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
