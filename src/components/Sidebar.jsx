import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import './css/Sidebar.css';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveMenu, setExpandedMenu, setSelectedSubMenu } from '../redux/menuSlice';
import { AuthContext } from '../auth/AuthContext';
import { menuItemsConfig } from '../config/menuConfig';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Collapse } from '@mui/material';
import iconUpdate from '../assets/images/icons/update.png'
import { UpdateContext } from '../App';
import { 
    MdDashboard, MdCarRental, MdLocalShipping, MdDirectionsBus, MdLocalGasStation, 
    MdAttachMoney, MdExitToApp, MdList, MdAssignment, MdTrendingUp, MdBarChart
} from 'react-icons/md'; 

import logo from '../assets/images/logo_white.png';


const iconMap = {
    'Inicio': MdDashboard,       //Inicio
    'IMA': MdAssignment,         // Documentación
    'Conductores': MdCarRental,   // Conductor
    'Camiones': MdDirectionsBus,  // Camión/Trailer
    'Gastos': MdLocalGasStation,  // Gasto/Diesel
    'Mantenimientos': MdList,     // Lista/Mantenimiento
    'Viajes': MdLocalShipping,    // Camión de carga
    'Finanzas': MdAttachMoney,    // Dinero
    'Reports': MdBarChart,       // Gráficos/Reporte
    'Gestor de Acceso': MdList,   // Lista/Gestor de Acceso
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
  const [notificaciones, setNotificaciones] = useState({
    IMA: 0,
    Conductores: 0,
    Camiones: 0,
    Trailers: 0,
  });

  const [subnotificaciones, setsubnotificaciones] = useState({
    'Administrador de camiones': 0,
    'Administrador de cajas': 0,
  });

  const apiHost = import.meta.env.VITE_API_HOST;
  const { user, logout, userPermissions } = useContext(AuthContext);

  // const [userPermissions, setUserPermissions] = useState({});

  const [tipoUsuario, setTipoUsuario] = useState('');

  //obtener credenciales del usuario
  useEffect(() => {
    const storedType = localStorage.getItem('type') || '';
    setTipoUsuario((user?.tipo_usuario || storedType || '').trim());
  }, [user]);

  const userEmail = user?.email?.trim().toLowerCase() || localStorage.getItem('userEmail')?.trim().toLowerCase() || '';

  //obtener barra de progreso descarga
  useEffect(() => {
    window.electron?.onUpdateProgress((percent) => {
      console.log('Progreso de descarga:', percent);
      setProgress(percent);
    });
  }, []);


  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeMenu = useSelector((state) => state.menu.activeMenu);
  const expandedMenu = useSelector((state) => state.menu.expandedMenu);
  const selectedSubMenu = useSelector((state) => state.menu.selectedSubMenu);

  // Comparador por rol (case-insensitive)
  const roleAllowed = useCallback(
    (roles) => {
      if (!roles || roles.length === 0) return true;
      const u = String(tipoUsuario || '').toLowerCase();
      return roles.some(r => String(r).toLowerCase() === u);
    },
    [tipoUsuario]
  );

  // FUNCIÓN PARA FILTRAR POR PERMISOS DINÁMICOS
  const isSectionAllowed = useCallback((item, visibleSubs = true) => {
      if (item.name === MANAGEMENT_ITEM.name) {
          return roleAllowed(item.rolesPermitidos) && ADMIN_EMAILS_ACCESS.includes(userEmail); 
      }

      const dynamicPermission = userPermissions[item.name];
      
      if (dynamicPermission !== undefined) {
          return dynamicPermission;
      }
      
      if (item.subItems && item.subItems.length > 0) {
          return visibleSubs;
      }

      return roleAllowed(item.rolesPermitidos);

  }, [roleAllowed, userEmail, userPermissions]);

  // Filtrado SOLO por roles:
  const filterMenuByAccess = useCallback((items) => {
      return items.reduce((acc, item) => {
          
          if (Array.isArray(item.subItems) && item.subItems.length > 0) {
              const visibleSubs = item.subItems.filter((subItem) => {
                  const dynamicSubPermission = userPermissions[subItem.name]; 

                  if (dynamicSubPermission !== undefined) {
                      return dynamicSubPermission;
                  }
                  
                  // const subRoles = subItem.rolesPermitidos ?? item.rolesPermitidos;
                  // return roleAllowed(subRoles);
                  return false
              });

              //const canSeeSection = isSectionAllowed(item, visibleSubs.length > 0);

              if (visibleSubs.length > 0) {
                acc.push({ ...item, subItems: visibleSubs });
              }
            
            return acc;
          }

          const canSeeSection = isSectionAllowed(item);

          if (canSeeSection) {
              acc.push(item);
          }
          return acc;
      }, []);
  }, [isSectionAllowed, roleAllowed, userPermissions]);

    // NUEVA FUNCIÓN PARA OBTENER PERMISOS
  //   const fetchUserPermissions = useCallback(async () => {
  //       const userId = user?.id || localStorage.getItem('userID');
  //       if (!userId) return;

  //       const formData = new FormData();
  //       formData.append('op', 'getUserPermissions');
  //       formData.append('user_id', userId);

  //       try {
  //           const response = await fetch(`${apiHost}/AccessManager.php`, {
  //               method: 'POST',
  //               body: formData,
  //           });

  //           const data = await response.json();

  //           if (data.status === 'success') {
  //               setUserPermissions(data.permissions);
  //           } else {
  //               console.error("Error al obtener permisos:", data.message);
  //               setUserPermissions({});
  //           }
  //       } catch (error) {
  //           console.error('Error de conexión al obtener permisos:', error);
  //           setUserPermissions({});
  //       }
  //   }, [apiHost, user?.id]);

  // useEffect(() => {
  //   fetchUserPermissions();
  // }, [fetchUserPermissions]);

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
    if (expandedMenu === menuName) {
      dispatch(setSelectedSubMenu(null));
    }
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
        setNotificaciones((prev) => ({
          ...prev,
          IMA: data.Users[0].documentos_faltantes_ima || 0,
          Conductores: data.Users[0].documentos_faltantes_driver || 0,
          Camiones: (parseInt(data.Users[0].documentos_faltantes_trailer) || 0) + (parseInt(data.Users[0].documentos_faltantes_truck) || 0),
        }));

        setsubnotificaciones((prev) => ({
          ...prev,
          'Administrador de camiones': data.Users[0].documentos_faltantes_truck || 0,
          'Administrador de cajas': data.Users[0].documentos_faltantes_trailer || 0,
        }));
      }
    } catch (error) {
      console.error('Error al obtener los documentos:', error);
    }
  };

  useEffect(() => {
    fetchdocs();
  }, []);

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

          return (
            <div key={item.name} className="menu-section">
              <button
                className={`menu-item ${activeMenu === item.route && !hasSubs ? 'active-item' : ''} ${hasSubs ? 'has-submenu' : ''}`}
                onClick={() => hasSubs ? toggleSubMenu(item.name, hasSubs) : (item.route && handleNavigate(item.route))}
                disabled={!hasSubs && !item.route}
              >
                {IconComponent && <IconComponent className="menu-icon" />}
                
                <span className="menu-text-content">
                  {item.name}
                  {notificaciones[item.name] > 0 && (
                    <span className="notification-badge">{notificaciones[item.name]}</span>
                  )}
                </span>
                {hasSubs && (
                  <span className="arrow-icon-wrapper">
                    {isOpen
                      ? <FaChevronUp />
                      : <FaChevronDown />}
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
                      >
                        <span className="submenu-dot" /> 
                        {subItem.name}
                        {subnotificaciones[subItem.name] > 0 && (
                          <span className="notification-badge">{subnotificaciones[subItem.name]}</span>
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