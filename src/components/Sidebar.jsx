import React, { useCallback, useContext, useEffect, useState } from 'react';
import './css/Sidebar.css';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveMenu, setExpandedMenu, setSelectedSubMenu } from '../redux/menuSlice';
import { AuthContext } from '../auth/AuthContext';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom'; 

import logo from '../assets/images/logo_white.png';
import iconDashboard from '../assets/images/icons/dashboard.png';
import iconIMA from '../assets/images/icons/administrar.png';
import iconDriver from '../assets/images/icons/Driver.png';
import iconTrailer from '../assets/images/icons/trailer.png';
import iconBox from '../assets/images/icons/caja.png';
import iconReport from '../assets/images/icons/report.png';
import iconExit from '../assets/images/icons/exit.png';

const menuItems = [
  { name: 'Inicio', icon: iconDashboard, route: '/home', rolesPermitidos: ['admin'] },
  {
    name: 'IMA',
    icon: iconIMA,
    rolesPermitidos: ['admin'],
    subItems: [
      { name: 'Alta de documentos', route: '/ImaScreen' },
      { name: 'Administrador de documentos', route: '/ImaAdmin' }
    ]
  },
  {
    name: 'Conductores',
    icon: iconDriver,
    rolesPermitidos: ['admin', 'documentador'],
    subItems: [
      { name: 'Alta de conductores', route: '/drivers' },
      { name: 'Administrador de conductores', route: '/admin-drivers' }
    ]
  },
  {
    name: 'Camiones',
    icon: iconTrailer,
    rolesPermitidos: ['admin'],
    subItems: [
      { name: 'Alta de camiones', route: '/trucks' },
      { name: 'Administrador de camiones', route: '/admin-trucks' },
      { name: 'Alta de Cajas', route: '/trailers' },
      { name: 'Administrador de cajas', route: '/admin-trailers' }
    ]
  },
  {
    name: 'Viajes',
    icon: iconBox,
    rolesPermitidos: ['admin', 'Vendedor'],
    subItems: [
      { name: 'Nuevo Viaje', route: '/trips' },
      { name: 'Administrador de viajes', route: '/admin-trips' }
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
  const tipoUsuario = user?.tipo_usuario || '';


const menuFiltrado = menuItems.filter(item =>
  !item.rolesPermitidos || item.rolesPermitidos.includes(tipoUsuario)
);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const activeMenu = useSelector((state) => state.menu.activeMenu);
  const expandedMenu = useSelector((state) => state.menu.expandedMenu);
  const selectedSubMenu = useSelector((state) => state.menu.selectedSubMenu);

  const handleNavigate = useCallback((route) => {
    dispatch(setActiveMenu(route));
    dispatch(setExpandedMenu(null));
    dispatch(setSelectedSubMenu(null));
    navigate(route);
  }, [dispatch, navigate]);

  const toggleSubMenu = useCallback((menuName) => {
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

    if (data.status === 'success' ) {

  
      setNotificaciones((prev) => ({
        ...prev,
        IMA: data.Users[0].documentos_faltantes_ima|| 0,
        Conductores: data.Users[0].documentos_faltantes_driver|| 0,
        Camiones: data.Users[0].documentos_faltantes_trailer + data.Users[0].documentos_faltantes_truck|| 0,
        Trailers: data.Users[0].documentos_faltantes_truck || 0,
      }));

      
      setsubnotificaciones((prev) => ({
        ...prev,
        'Administrador de camiones': data.Users[0].documentos_faltantes_truck || 0,
        'Administrador de cajas': data.Users[0].documentos_faltantes_trailer  || 0,
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
    <div className="sidebar">
      <div className="logoContainer">
        <img className="logo" src={logo} alt="Logo" />
      </div>

      <div className="menuList">
        {menuFiltrado.map((item) => (
          <div key={item.name}>
            <button
              className={`menuItem ${activeMenu === item.route && !item.subItems ? 'activeMenuItem' : ''} ${item.subItems ? 'hasSubMenu' : ''}`}
              onClick={() => item.subItems ? toggleSubMenu(item.name) : handleNavigate(item.route)}
            >
              <img src={item.icon} alt="icon" className="icon" />
              <span className="menuText">
                {item.name}
                 {notificaciones[item.name] > 0 && (
                  <span className="documentCounter">{notificaciones[item.name]}</span>
                )}
              </span>
              {item.subItems && (
                expandedMenu === item.name
                  ? <FaChevronUp className="arrowIcon" />
                  : <FaChevronDown className="arrowIcon" />
              )}
            </button>

            {item.subItems && expandedMenu === item.name && (
              <div className="subMenuContainer">
                {item.subItems.map((subItem) => (
                  <button
                    key={subItem.name}
                    className={`subMenuItem ${selectedSubMenu === subItem.route ? 'activeSubMenuItem' : ''}`}
                    onClick={() => handleSubMenuSelect(subItem.route)}
                  >
                    {subItem.name}
                     {subnotificaciones[subItem.name] > 0 && (
                  <span className="documentCounter">{subnotificaciones[subItem.name]}</span>
                )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <button className="logoutButton" onClick={handleLogout}>
        <img src={iconExit} className="icon" alt="logout" />
        <span className="menuText">Logout</span>
      </button>
    </div>
  );
};

export default Sidebar;
