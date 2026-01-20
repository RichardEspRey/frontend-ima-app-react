import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import './css/Sidebar.css';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveMenu, setExpandedMenu, setSelectedSubMenu } from '../redux/menuSlice';
import { AuthContext } from '../auth/AuthContext';
import { menuItemsConfig } from '../config/menuConfig';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Collapse, Box, Stack, Tooltip } from '@mui/material'; // Agregamos componentes MUI
import iconUpdate from '../assets/images/icons/update.png'
import { UpdateContext } from '../App';
import { 
    MdDashboard, MdCarRental, MdLocalShipping, MdDirectionsBus, MdLocalGasStation, 
    MdAttachMoney, MdExitToApp, MdList, MdAssignment, MdTrendingUp, MdBarChart 
} from 'react-icons/md'; 
import { GrMapLocation } from "react-icons/gr";

// Nuevos íconos para notificaciones
import ErrorIcon from '@mui/icons-material/Error'; // Rojo (Vencido)
import WarningIcon from '@mui/icons-material/Warning'; // Amarillo (Por vencer)

import logo from '../assets/images/logo_white.png';

const iconMap = {
    'Inicio': MdDashboard,
    'IMA': MdAssignment,
    'Conductores': MdCarRental,
    'Camiones': MdDirectionsBus,
    'Gastos': MdLocalGasStation,
    'Mantenimientos': MdList,
    'Viajes': MdLocalShipping,
    'Finanzas': MdAttachMoney,
    'Reports': MdBarChart,
    'Mapa': GrMapLocation,
    'Gestor de Acceso': MdList,
    'Estatus de Unidades': MdTrendingUp,
};

const ADMIN_EMAILS_ACCESS = ['1', 'israel_21027', 'angelica_21020'];
const MANAGEMENT_ITEM = { 
    name: 'Gestor de Acceso', 
    route: '/access-manager', 
    rolesPermitidos: ['admin'] 
};

const menuItems = [
  ...menuItemsConfig.slice(0),
  MANAGEMENT_ITEM, 
];

const Sidebar = () => {
  const [progress, setProgress] = useState(0);
  const { updateDisponible } = useContext(UpdateContext);
  
  // Estado actualizado para soportar objetos { red: 0, yellow: 0 }
  const [notificaciones, setNotificaciones] = useState({
    IMA: { red: 0, yellow: 0 },
    Conductores: { red: 0, yellow: 0 },
    Camiones: { red: 0, yellow: 0 },
    Trailers: { red: 0, yellow: 0 },
  });

  const [subnotificaciones, setsubnotificaciones] = useState({
    'Administrador de camiones': { red: 0, yellow: 0 },
    'Administrador de cajas': { red: 0, yellow: 0 },
  });

  const apiHost = import.meta.env.VITE_API_HOST;
  const { user, logout, userPermissions } = useContext(AuthContext);
  const [tipoUsuario, setTipoUsuario] = useState('');

  useEffect(() => {
    const storedType = localStorage.getItem('type') || '';
    setTipoUsuario((user?.tipo_usuario || storedType || '').trim());
  }, [user]);

  const userEmail = user?.email?.trim().toLowerCase() || localStorage.getItem('userEmail')?.trim().toLowerCase() || '';

  useEffect(() => {
    window.electron?.onUpdateProgress((percent) => {
      setProgress(percent);
    });
  }, []);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeMenu = useSelector((state) => state.menu.activeMenu);
  const expandedMenu = useSelector((state) => state.menu.expandedMenu);
  const selectedSubMenu = useSelector((state) => state.menu.selectedSubMenu);

  const roleAllowed = useCallback(
    (roles) => {
      if (!roles || roles.length === 0) return true;
      const u = String(tipoUsuario || '').toLowerCase();
      return roles.some(r => String(r).toLowerCase() === u);
    },
    [tipoUsuario]
  );

  const isSectionAllowed = useCallback((item, visibleSubs = true) => {
      if (item.name === MANAGEMENT_ITEM.name) {
          return roleAllowed(item.rolesPermitidos) && ADMIN_EMAILS_ACCESS.includes(userEmail); 
      }
      const dynamicPermission = userPermissions[item.name];
      if (dynamicPermission !== undefined) return dynamicPermission;
      if (item.subItems && item.subItems.length > 0) return visibleSubs;
      return roleAllowed(item.rolesPermitidos);
  }, [roleAllowed, userEmail, userPermissions]);

  const filterMenuByAccess = useCallback((items) => {
      return items.reduce((acc, item) => {
          if (Array.isArray(item.subItems) && item.subItems.length > 0) {
              const visibleSubs = item.subItems.filter((subItem) => {
                  const dynamicSubPermission = userPermissions[subItem.name]; 
                  if (dynamicSubPermission !== undefined) return dynamicSubPermission;
                  return false
              });
              if (visibleSubs.length > 0) {
                acc.push({ ...item, subItems: visibleSubs });
              }
            return acc;
          }
          const canSeeSection = isSectionAllowed(item);
          if (canSeeSection) acc.push(item);
          return acc;
      }, []);
  }, [isSectionAllowed, roleAllowed, userPermissions]);

  const menuFiltrado = useMemo(() => filterMenuByAccess(menuItems), [filterMenuByAccess]);

  const handleNavigate = useCallback((route) => {
    dispatch(setActiveMenu(route));
    dispatch(setExpandedMenu(null));
    dispatch(setSelectedSubMenu(null));
    navigate(route);
  }, [dispatch, navigate]);

  const toggleSubMenu = useCallback((menuName, hasVisibleSubs) => {
    if (!hasVisibleSubs) return;
    dispatch(setExpandedMenu(expandedMenu === menuName ? null : menuName));
    if (expandedMenu === menuName) dispatch(setSelectedSubMenu(null));
  }, [dispatch, expandedMenu]);

  const handleSubMenuSelect = useCallback((route) => {
    dispatch(setSelectedSubMenu(route));
    dispatch(setActiveMenu(route));
    navigate(route);
  }, [dispatch, navigate]);

  const handleLogout = () => logout();

  const fetchdocs = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append('op', 'getStatus');

    try {
      const response = await fetch(`${apiHost}/IMA_Docs.php`, {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (data.status === 'success') {
        const u = data.Users[0];

        // LOGICA DE NOTIFICACIONES (SEMAFORIZACIÓN)
        
        // 1. IMA: Tenemos datos reales de Vencidos y Por Vencer del SP
        // Faltantes (missing) los sumamos a rojos (vencidos)
        const imaFaltantes = parseInt(u.documentos_faltantes_ima || 0);
        const imaVencidos = parseInt(u.ima_vencidos || 0);
        const imaPorVencer = parseInt(u.ima_por_vencer || 0);

        // 2. Conductores y Camiones: Por ahora solo tenemos "Faltantes".
        // Los asignamos a ROJO. Amarillo será 0 hasta que actualices esos módulos.
        const driverRed = parseInt(u.documentos_faltantes_driver || 0);
        const truckRed = parseInt(u.documentos_faltantes_truck || 0);
        const trailerRed = parseInt(u.documentos_faltantes_trailer || 0);

        setNotificaciones((prev) => ({
          ...prev,
          IMA: { 
              red: imaFaltantes + imaVencidos, 
              yellow: imaPorVencer 
          },
          Conductores: { 
              red: driverRed, 
              yellow: 0 
          }, 
          Camiones: { 
              red: truckRed + trailerRed, 
              yellow: 0 
          },
        }));

        setsubnotificaciones((prev) => ({
          ...prev,
          'Administrador de camiones': { red: truckRed, yellow: 0 },
          'Administrador de cajas': { red: trailerRed, yellow: 0 },
        }));
      }
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
    }
  };

  useEffect(() => {
    fetchdocs();
    // Opcional: Polling cada 5 minutos para refrescar estatus
    const interval = setInterval(fetchdocs, 300000); 
    return () => clearInterval(interval);
  }, []);

  // Componente para renderizar los badges rojos y amarillos
  const NotificationBadges = ({ counts }) => {
      // Si counts es un número simple (legado), lo convertimos
      const { red, yellow } = (typeof counts === 'number') ? { red: counts, yellow: 0 } : counts;

      if (!red && !yellow) return null;

      return (
          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ marginLeft: 'auto', paddingLeft: '8px' }}>
              {red > 0 && (
                  <Tooltip title={`${red} Vencidos / Faltantes`}>
                      <Box sx={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: '#d32f2f', color: '#fff', borderRadius: '12px', 
                          px: 0.8, py: 0.2, minWidth: '20px', height: '20px', fontSize: '0.75rem', fontWeight: 'bold'
                      }}>
                          <ErrorIcon sx={{ fontSize: '14px', mr: 0.5 }} /> {red}
                      </Box>
                  </Tooltip>
              )}
              {yellow > 0 && (
                  <Tooltip title={`${yellow} Por Vencer (30 días)`}>
                      <Box sx={{ 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          bgcolor: '#ed6c02', color: '#fff', borderRadius: '12px', 
                          px: 0.8, py: 0.2, minWidth: '20px', height: '20px', fontSize: '0.75rem', fontWeight: 'bold'
                      }}>
                          <WarningIcon sx={{ fontSize: '14px', mr: 0.5 }} /> {yellow}
                      </Box>
                  </Tooltip>
              )}
          </Stack>
      );
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-logo-wrapper">
        <img className="sidebar-logo" src={logo} alt="Logo de la aplicación" />
      </div>

      <div className="menu-list-wrapper">
        {menuFiltrado.map((item) => {
          const hasSubs = !!(item.subItems && item.subItems.length > 0);
          const isOpen = expandedMenu === item.name; 
          const IconComponent = iconMap[item.name];

          // Obtenemos los contadores para este item
          const notifData = notificaciones[item.name];

          return (
            <div key={item.name} className="menu-section">
              <button
                className={`menu-item ${activeMenu === item.route && !hasSubs ? 'active-item' : ''} ${hasSubs ? 'has-submenu' : ''}`}
                onClick={() => hasSubs ? toggleSubMenu(item.name, hasSubs) : (item.route && handleNavigate(item.route))}
                disabled={!hasSubs && !item.route}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
                    {IconComponent && <IconComponent className="menu-icon" />}
                    <span className="menu-text-content">{item.name}</span>
                </div>

                {/* Renderizado de Badges (Semaforo) */}
                {notifData && <NotificationBadges counts={notifData} />}

                {hasSubs && (
                  <span className="arrow-icon-wrapper" style={{ marginLeft: '8px' }}>
                    {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                )}
              </button>

              {hasSubs && (
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <div className="submenu-container">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.name}
                        className={`submenu-item ${selectedSubMenu === subItem.route ? 'active-submenu' : ''}`}
                        onClick={() => handleSubMenuSelect(subItem.route)}
                        style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '15px' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span className="submenu-dot" /> 
                            {subItem.name}
                        </div>
                        {/* Badges para Submenús (Camiones / Cajas) */}
                        {subnotificaciones[subItem.name] && (
                            <NotificationBadges counts={subnotificaciones[subItem.name]} />
                        )}
                      </button>
                    ))}
                  </div>
                </Collapse>
              )}
            </div>
          );
        })}
      </div>

      <button
        className="logout-button"
        onClick={() => window.electron.descargarUpdate()}
        disabled={!updateDisponible || (progress > 0 && progress < 100)}
        style={{ opacity: updateDisponible ? 1 : 0.5, cursor: updateDisponible ? 'pointer' : 'not-allowed' }}
      >
        <img src={iconUpdate} className="menu-icon" alt="update" />
        <span className="menu-text-content">Actualizar</span>
      </button>

      {updateDisponible && progress > 0 && progress < 100 && (
        <div style={{ padding: '0 16px' }}>
          <div style={{ marginTop: 4 }}>
            <div style={{ fontSize: 12, color: '#fff' }}>
              Descargando actualización… {Math.floor(progress)}%
            </div>
            <div style={{ background: '#ccc', borderRadius: 4, overflow: 'hidden', height: 6, marginTop: 4 }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: '#4caf50',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        </div>
      )}

      <button className="logout-button" onClick={handleLogout}>
        <MdExitToApp className="menu-icon" />
        <span className="menu-text-content">Cerrar Sesión</span>
      </button>
    </div>
  );
};

export default Sidebar;