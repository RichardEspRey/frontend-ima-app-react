// src/components/Sidebar.jsx
import React, { useCallback, useContext } from 'react';
import './css/Sidebar.css';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveMenu, setExpandedMenu, setSelectedSubMenu } from '../redux/menuSlice';
import { AuthContext } from '../auth/AuthContext';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

import logo from '../assets/images/logo_white.png';
import iconDashboard from '../assets/images/icons/dashboard.png';
import iconDriver from '../assets/images/icons/Driver.png';
import iconTrailer from '../assets/images/icons/trailer.png';
import iconBox from '../assets/images/icons/caja.png';
import iconReport from '../assets/images/icons/report.png';
import iconExit from '../assets/images/icons/exit.png';

const menuItems = [
  { name: 'Home', icon: iconDashboard },
  {
    name: 'Conductores',
    icon: iconDriver,
    subItems: [
      { name: 'Alta de conductores', route: 'Conductores' },
      { name: 'Administrador de conductores', route: 'AdminConductores' }
    ]
  },
  {
    name: 'Camiones',
    icon: iconTrailer,
    subItems: [
      { name: 'Alta de camiones', route: 'Camiones' },
      { name: 'Administrador de camiones', route: 'AdmiCamiones' },
      { name: 'Alta de Cajas', route: 'Cajas' },
      { name: 'Administrador de cajas', route: 'AdmiCajas' }
    ]
  },
  {
    name: 'Viajes',
    icon: iconBox,
    subItems: [
      { name: 'Activos', route: 'ViajesActivos' },
      { name: 'Historial', route: 'ViajesHistorial' }
    ]
  },
  { name: 'Reportes', icon: iconReport }
];

const Sidebar = ({ navigate }) => {
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
      dispatch(setActiveMenu(null));
    }
  }, [dispatch, expandedMenu]);

  const handleSubMenuSelect = useCallback((route) => {
    dispatch(setSelectedSubMenu(route));
    dispatch(setActiveMenu(null));
    navigate(route);
  }, [dispatch, navigate]);

  const { logout } = useContext(AuthContext);
  const handleLogout = () => logout();

  return (
    <div className="sidebar">
      <div className="logoContainer">
        <img className="logo" src={logo} alt="Logo" />
      </div>

      <div className="menuList">
        {menuItems.map((item) => (
          <div key={item.name}>
            <button
              className={`menuItem ${activeMenu === item.name && !item.subItems ? 'activeMenuItem' : ''}`}
              onClick={() => item.subItems ? toggleSubMenu(item.name) : handleNavigate(item.name)}
            >
              <img src={item.icon} alt="icon" className="icon" />
              <span className="menuText">{item.name}</span>
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
