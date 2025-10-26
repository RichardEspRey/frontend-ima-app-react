import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import './css/Sidebar.css';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveMenu, setExpandedMenu, setSelectedSubMenu } from '../redux/menuSlice';
import { AuthContext } from '../auth/AuthContext';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Collapse } from '@mui/material'; // Importado de MUI

import logo from '../assets/images/logo_white.png';
import iconDashboard from '../assets/images/icons/dashboard.png';
import iconIMA from '../assets/images/icons/administrar.png';
import iconDriver from '../assets/images/icons/Driver.png';
import iconTrailer from '../assets/images/icons/trailer.png';
import iconBox from '../assets/images/icons/caja.png';
import iconReport from '../assets/images/icons/report.png';
import iconExit from '../assets/images/icons/exit.png';
import iconList from '../assets/images/icons/list.png';
import iconGasto from '../assets/images/icons/gasto.png';

// Convención final:
// - rolesPermitidos: array de roles permitidos (padre y subitems).
// - Sin permisos granulares.

const menuItems = [
  { name: 'Inicio', icon: iconDashboard, route: '/home', rolesPermitidos: ['admin'] },

  {
    name: 'IMA',
    icon: iconIMA,
    rolesPermitidos: ['admin'],
    subItems: [
      { name: 'Alta de documentos', route: '/ImaScreen', rolesPermitidos: ['admin'] },
      { name: 'Administrador de documentos', route: '/ImaAdmin', rolesPermitidos: ['admin'] }
    ]
  },

  {
    name: 'Conductores',
    icon: iconDriver,
    rolesPermitidos: ['admin', 'Angeles'],
    subItems: [
      { name: 'Alta de conductores', route: '/drivers', rolesPermitidos: ['admin', 'Angeles'] },
      { name: 'Administrador de conductores', route: '/admin-drivers', rolesPermitidos: ['admin', 'Angeles'] }
    ]
  },

  {
    name: 'Camiones',
    icon: iconTrailer,
    rolesPermitidos: ['admin','Angeles'],
    subItems: [
      { name: 'Alta de camiones', route: '/trucks', rolesPermitidos: ['admin','Angeles'] },
      { name: 'Administrador de camiones', route: '/admin-trucks', rolesPermitidos: ['admin','Angeles'] },
      { name: 'Alta de Cajas', route: '/trailers', rolesPermitidos: ['admin','Angeles'] },
      { name: 'Administrador de cajas', route: '/admin-trailers', rolesPermitidos: ['admin','Angeles'] }
    ]
  },

  {
    name: 'Gastos',
    icon: iconGasto,
    rolesPermitidos: ['admin', 'Angeles','Blanca','Candy','Mia'],
    subItems: [
      { name: 'Nuevo Gasto', route: '/new-expense', rolesPermitidos: ['admin', 'Angeles','Mia'] },
      { name: 'Administrador gastos', route: '/admin-gastos-generales', rolesPermitidos: ['admin','Angeles'] },
      { name: 'Gastos diesel', route: '/admin-diesel', rolesPermitidos: ['admin','Blanca','Candy','Mia'] },
      { name: 'Gastos viajes', route: '/admin-gastos', rolesPermitidos: ['admin','Blanca','Mia'] }
    ]
  },

  {
    name: 'Mantenimientos',
    icon: iconList,
    rolesPermitidos: ['admin', 'Angeles','Candy'],
    subItems: [
      { name: 'Inventario', route: '/view-inventory', rolesPermitidos: ['admin','Angeles','Candy'] },
      { name: 'Inspeccion final', route: '/Inspeccion-final', rolesPermitidos: ['admin','Angeles','Candy'] },
      { name: 'Administrador Ordenes de Servicio', route: '/admin-service-order', rolesPermitidos: ['admin','Angeles','Candy'] }
    ]
  },

  {
    name: 'Viajes',
    icon: iconBox,
    rolesPermitidos: ['admin','Candy','Blanca'],
    subItems: [
      { name: 'Nuevo Viaje', route: '/trips', rolesPermitidos: ['admin','Blanca'] },
      { name: 'Administrador de viajes', route: '/admin-trips', rolesPermitidos: ['admin','Blanca','Candy','Mia'] },
    ]
  },

  {
    name: 'Finanzas',
    icon: iconBox,
    rolesPermitidos: ['admin'],
    subItems: [
      { name: 'Ventas', route: '/finanzas', rolesPermitidos: ['admin'] },
      { name: 'Residuo de viaje', route: '/ResiduoTrip', rolesPermitidos: ['admin'] }
    ]
  },

  { name: 'Reportes', icon: iconReport, route: '/reportes', rolesPermitidos: ['admin'] }
];

const Sidebar = () => {
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
  const { user, logout } = useContext(AuthContext);

  // Rol desde contexto o localStorage
  const [tipoUsuario, setTipoUsuario] = useState('');

  useEffect(() => {
    const storedType = localStorage.getItem('type') || '';
    setTipoUsuario((user?.tipo_usuario || storedType || '').trim());
  }, [user]);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeMenu = useSelector((state) => state.menu.activeMenu);
  const expandedMenu = useSelector((state) => state.menu.expandedMenu);
  const selectedSubMenu = useSelector((state) => state.menu.selectedSubMenu);

  // Comparador por rol (case-insensitive)
  const roleAllowed = useCallback(
    (roles) => {
      if (!roles || roles.length === 0) return true; // si no está definido, se muestra a todos
      const u = String(tipoUsuario || '').toLowerCase();
      return roles.some(r => String(r).toLowerCase() === u);
    },
    [tipoUsuario]
  );

  // Filtrado SOLO por roles:
  const filterMenuByAccess = useCallback((items) => {
    return items.reduce((acc, item) => {
      const canSeeSection = roleAllowed(item.rolesPermitidos);

      // Si no puede ver la sección, no se muestra (aunque tenga subitems)
      if (!canSeeSection) return acc;

      // Si tiene subitems, filtrarlos por roles (si no define, hereda del padre)
      if (Array.isArray(item.subItems) && item.subItems.length > 0) {
        const visibleSubs = item.subItems.filter((si) => {
          const subRoles = si.rolesPermitidos ?? item.rolesPermitidos;
          return roleAllowed(subRoles);
        });

        // Si el padre tiene route, lo mostramos aunque no haya subitems visibles;
        // si no tiene route, mostrar solo si hay subitems visibles.
        if (item.route) {
          acc.push({ ...item, subItems: visibleSubs });
        } else if (visibleSubs.length > 0) {
          acc.push({ ...item, subItems: visibleSubs });
        }
        return acc;
      }

      // Ítem sin subitems
      acc.push(item);
      return acc;
    }, []);
  }, [roleAllowed]);

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
          const isOpen = expandedMenu === item.name; // <--- Definición de isOpen para Collapse

          return (
            <div key={item.name} className="menu-section">
              <button
                className={`menu-item ${activeMenu === item.route && !hasSubs ? 'active-item' : ''} ${hasSubs ? 'has-submenu' : ''}`}
                onClick={() => hasSubs ? toggleSubMenu(item.name, hasSubs) : (item.route && handleNavigate(item.route))}
                disabled={!hasSubs && !item.route}
              >
                <img src={item.icon} alt={`${item.name} icon`} className="menu-icon" />
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

              {/* Uso de MUI Collapse para la transición suave */}
              {hasSubs && (
                <Collapse in={isOpen} timeout="auto" unmountOnExit>
                  <div className="submenu-container">
                    {item.subItems.map((subItem) => (
                      <button
                        key={subItem.name}
                        className={`submenu-item ${selectedSubMenu === subItem.route ? 'active-submenu' : ''}`}
                        onClick={() => handleSubMenuSelect(subItem.route)}
                      >
                        <span className="submenu-dot" /> {/* Punto visual para subitem */}
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

      <button className="logout-button" onClick={handleLogout}>
        <img src={iconExit} className="menu-icon" alt="logout" />
        <span className="menu-text-content">Log Out</span>
      </button>
    </div>
  );
};

export default Sidebar;