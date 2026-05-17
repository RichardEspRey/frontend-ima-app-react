import React, { useCallback, useEffect, useMemo, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
    Box, Stack, Tooltip, List, ListItem, ListItemButton, 
    ListItemIcon, ListItemText, Collapse, Typography, LinearProgress, Avatar
} from '@mui/material'; 

import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { 
    MdDashboard, MdCarRental, MdLocalShipping, MdDirectionsBus, MdLocalGasStation, 
    MdAttachMoney, MdExitToApp, MdList, MdAssignment, MdTrendingUp, MdBarChart, 
    MdSecurity
} from 'react-icons/md'; 
import { GrMapLocation } from "react-icons/gr";

import logo from '../assets/images/logo_white.png';
import iconUpdate from '../assets/images/icons/update.png';

import { UpdateContext } from '../App';
import { menuItemsConfig } from '../config/menuConfig';
import { useAuthStore } from '../store/useAuthStore';

const iconMap = {
    'Inicio': MdDashboard,
    'IMA Manager': MdAssignment,
    'IMA': MdAssignment,
    'Conductores': MdCarRental,
    'Camiones': MdDirectionsBus,
    'Cajas': MdDirectionsBus,
    'Gastos': MdLocalGasStation,
    'Mantenimientos': MdList,
    'Viajes': MdLocalShipping,
    'Finanzas': MdAttachMoney,
    'Reports': MdBarChart,
    'Safety': MdSecurity,
    'Mapa': GrMapLocation,
    'Gestor de Acceso': MdList,
    'Estatus de Unidades': MdTrendingUp,
};

const ADMIN_EMAILS_ACCESS = ['1', 'israel_21027', 'angelica_21020'];
const MANAGEMENT_ITEM = { name: 'Gestor de Acceso', route: '/access-manager', rolesPermitidos: ['admin'] };
const menuItems = [ ...menuItemsConfig, MANAGEMENT_ITEM ];

const Sidebar = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  const { user, logout, userPermissions } = useAuthStore();
  const { updateDisponible } = useContext(UpdateContext);
  const [progress, setProgress] = useState(0);
  
  const [openMenus, setOpenMenus] = useState({});
  const [notificaciones, setNotificaciones] = useState({});
  const [subnotificaciones, setSubnotificaciones] = useState({});

  const tipoUsuario = String(user?.tipo_usuario || user?.type || '').trim().toLowerCase();
  const userEmail = String(user?.email || '').trim().toLowerCase();

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

  const roleAllowed = useCallback((roles) => {
      if (!roles || roles.length === 0) return true;
      return roles.some(r => String(r).toLowerCase() === tipoUsuario);
  }, [tipoUsuario]);

  const isSectionAllowed = useCallback((item, visibleSubs = true) => {
      if (item.name === MANAGEMENT_ITEM.name) return roleAllowed(item.rolesPermitidos) && ADMIN_EMAILS_ACCESS.includes(userEmail); 
      const dynamicPermission = userPermissions[item.name];
      if (dynamicPermission !== undefined) return dynamicPermission;
      if (item.subItems && item.subItems.length > 0) return visibleSubs;
      return roleAllowed(item.rolesPermitidos);
  }, [roleAllowed, userEmail, userPermissions]);

  const menuFiltrado = useMemo(() => {
      return menuItems.reduce((acc, item) => {
          if (item.hideInSidebar) return acc;
          if (Array.isArray(item.subItems) && item.subItems.length > 0) {
              const visibleSubs = item.subItems.filter((subItem) => {
                  if (subItem.hideInSidebar) return false;
                  const dynamicSubPermission = userPermissions[subItem.name]; 
                  if (dynamicSubPermission !== undefined) return dynamicSubPermission;
                  return roleAllowed(subItem.rolesPermitidos);
              });
              if (visibleSubs.length > 0 && isSectionAllowed(item, true)) acc.push({ ...item, subItems: visibleSubs });
            return acc;
          }
          if (isSectionAllowed(item)) acc.push(item);
          return acc;
      }, []);
  }, [isSectionAllowed, roleAllowed, userPermissions]);

  const fetchdocs = useCallback(async () => {
    try {
      const fd = new FormData(); fd.append('op', 'getStatus');
      const res = await fetch(`${apiHost}/IMA_Docs.php`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.status === 'success') {
        const u = data.Users[0];
        setNotificaciones({ 'IMA Manager': { red: parseInt(u.ima_vencidos||0) + parseInt(u.driver_vencidos||0) + parseInt(u.documentos_faltantes_truck||0) + parseInt(u.documentos_faltantes_trailer||0), yellow: parseInt(u.ima_por_vencer||0) + parseInt(u.driver_por_vencer||0) }});
        setSubnotificaciones({
          'Documentos': { red: parseInt(u.ima_vencidos||0), yellow: parseInt(u.ima_por_vencer||0) },
          'Conductores': { red: parseInt(u.driver_vencidos||0), yellow: parseInt(u.driver_por_vencer||0) },
          'Camiones': { red: parseInt(u.documentos_faltantes_truck||0), yellow: 0 },
          'Cajas': { red: parseInt(u.documentos_faltantes_trailer||0), yellow: 0 },
        });
      }
    } catch (error) { console.error(error); }
  }, [apiHost]);

  useEffect(() => {
    fetchdocs(); const interval = setInterval(fetchdocs, 300000); return () => clearInterval(interval);
  }, [fetchdocs]);

  const toggleMenu = (name) => setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));

  const NotificationBadges = ({ counts }) => {
      const { red = 0, yellow = 0 } = counts || {};
      if (!red && !yellow) return null;
      return (
          <Stack direction="row" spacing={0.5} alignItems="center" pl={1}>
              {red > 0 && <Tooltip title="Vencidos" placement="right"><Avatar sx={{ width: 22, height: 22, bgcolor: '#ef4444', fontSize: '0.75rem', fontWeight: 800 }}>{red}</Avatar></Tooltip>}
              {yellow > 0 && <Tooltip title="Por Vencer" placement="right"><Avatar sx={{ width: 22, height: 22, bgcolor: '#f59e0b', fontSize: '0.75rem', fontWeight: 800 }}>{yellow}</Avatar></Tooltip>}
          </Stack>
      );
  };

  return (
    <Box sx={{ 
        width: 280, 
        height: '100vh',
        bgcolor: '#0f172a', 
        color: '#cbd5e1', 
        display: 'flex', 
        flexDirection: 'column', 
        borderRight: '1px solid #1e293b',
        zIndex: 20
    }}>
      
      {/* LOGO */}
      <Box sx={{ p: 3, pb: 2, display: 'flex', justifyContent: 'center' }}>
        <img src={logo} alt="Logo" style={{ maxWidth: '75%', height: 'auto', opacity: 0.95 }} />
      </Box>

      {/* LISTA DE MENÚS */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5, '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.1)', borderRadius: '4px' } }}>
        <List disablePadding>
          {menuFiltrado.map((item) => {
            const hasSubs = !!(item.subItems && item.subItems.length > 0);
            const isOpen = openMenus[item.name]; 
            const IconComponent = iconMap[item.name] || MdList;
            const isActive = currentPath === item.route;

            return (
              <React.Fragment key={item.name}>
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton 
                    onClick={() => hasSubs ? toggleMenu(item.name) : (item.route && navigate(item.route))}
                    sx={{ 
                        borderRadius: 2,
                        bgcolor: isActive ? '#3b82f6' : 'transparent',
                        color: isActive ? '#ffffff' : '#94a3b8',
                        transition: 'all 0.2s',
                        '&:hover': { bgcolor: isActive ? '#2563eb' : 'rgba(255,255,255,0.05)', color: '#fff' }
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 40, color: isActive ? '#ffffff' : 'inherit' }}>
                        <IconComponent size={20} />
                    </ListItemIcon>
                    
                    <ListItemText primary={item.name} primaryTypographyProps={{ fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' }} />
                    <NotificationBadges counts={notificaciones[item.name]} />

                    {hasSubs && (
                        <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', opacity: 0.7 }}>
                            {isOpen ? <FaChevronUp size={10} /> : <FaChevronDown size={10} />}
                        </Box>
                    )}
                  </ListItemButton>
                </ListItem>

                {hasSubs && (
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
                                      color: isSubActive ? '#fff' : '#94a3b8',
                                      bgcolor: isSubActive ? 'rgba(255,255,255,0.05)' : 'transparent',
                                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' }
                                  }}
                              >
                                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: isSubActive ? '#3b82f6' : 'transparent', border: isSubActive ? 'none' : '1px solid #64748b', mr: 2, zIndex: 2 }} />
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

      {/* SECCIÓN INFERIOR */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        
        {updateDisponible && (
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

        <ListItemButton onClick={logout} sx={{ borderRadius: 2, color: '#fca5a5', transition: '0.2s', '&:hover': { bgcolor: '#ef4444', color: '#fff' } }}>
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}><MdExitToApp size={22} /></ListItemIcon>
            <ListItemText primary="Cerrar Sesión" primaryTypographyProps={{ fontWeight: 700, fontSize: '0.9rem' }} />
        </ListItemButton>
      </Box>

    </Box>
  );
};

export default Sidebar;