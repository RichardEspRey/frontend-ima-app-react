import React, { useState, useEffect } from 'react';
import './css/DriverAdmin.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import redIcon from '../assets/images/Icons_alerts/shield-red.png'; 
import greenIcon from '../assets/images/Icons_alerts/shield-green.png'; 
import yellowIcon from '../assets/images/Icons_alerts/shield-yellow.png'; 
import greyIcon from '../assets/images/Icons_alerts/shield-grey.png'; 
import questionIcon from '../assets/images/Icons_alerts/question.png'; 

import { Tooltip } from 'react-tooltip';

const DriverAdmin = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 4;
  const [selectedValue, setSelectedValue] = useState('');
  const [drivers, setDrivers] = useState([]);

  const from = page * rowsPerPage;
  const to = Math.min((page + 1) * rowsPerPage, drivers.length);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch(`${apiHost}/drivers.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'op=getAll',
        });

        const data = await response.json();
        if (data.status === 'success' && data.Users) {
          const formatted = data.Users.map(user => ({
            id: user.driver_id.toString(),
            name: user.nombre || 'Sin nombre',
            fecha: user.fecha_ingreso || 'Sin fecha',
            APTO_fecha: user.APTO_fecha || '',
            I94_fecha: user.I94_fecha || '',
            VISA_fecha: user.VISA_fecha || '',
            Licencia_fecha: user.Licencia_fecha || '',
          }));
          setDrivers(formatted);
        }
      } catch (error) {
        console.error('Error al obtener los conductores:', error);
      }
    };

    fetchDrivers();
  }, []);

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(search.toLowerCase())
  );
  const renderIconButton = (fecha, id) => {
    const icon = getIconByFecha(fecha, id);
  
    return (
      <button className="icon-btn" disabled={!fecha}>
        {icon}
      </button>
    );
  };
  const getIconByFecha = (fechaStr, id) => {
    if (!fechaStr) {
      return (
        <>
          <img
            src={questionIcon}
            alt="Documento"
            className="icon-img"
            data-tooltip-id={`tooltip-${id}`}
            data-tooltip-content="No se cuenta con el documento"
          />
          <Tooltip id={`tooltip-${id}`} place="top" />
        </>
      );
    }
  
    const fecha = new Date(fechaStr);
    const hoy = new Date();
    const diffInDays = Math.floor((fecha - hoy) / (1000 * 60 * 60 * 24));
  
    let icon = greyIcon;
    let mensaje = `Vencimiento: ${fecha.toLocaleDateString('es-MX')}`;
  
    if (diffInDays >= 365) icon = greenIcon;
    else if (diffInDays >= 180) icon = yellowIcon;
    else if (diffInDays >= 60) icon = redIcon;
  
    return (
      <>
        <img
          src={icon}
          alt="Documento"
          className="icon-img"
          data-tooltip-id={`tooltip-${id}`}
          data-tooltip-content={mensaje}
        />
        <Tooltip id={`tooltip-${id}`} place="top" />
      </>
    );
  };
  
  return (
    <div className="driver-admin">
      <h1 className="title">Administrador de conductores</h1>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />

        <select
          value={selectedValue}
          onChange={(e) => setSelectedValue(e.target.value)}
        >
          <option value="">Status</option>
          <option value="opcion1">Opción 1</option>
          <option value="opcion2">Opción 2</option>
        </select>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>No de empleado</th>
              <th>Nombre</th>
              <th>Fecha de entrada</th>
              <th>APTO</th>
              <th>I-94</th>
              <th>VISA</th>
              <th>Licencia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.slice(from, to).map(driver => (
              <tr key={driver.id}>
                <td>{driver.id}</td>
                <td>{driver.name}</td>
                <td>{driver.fecha}</td>
                <td>{renderIconButton(driver.APTO_fecha, `apto-${driver.id}`)}</td>
                <td>{renderIconButton(driver.I94_fecha, `i94-${driver.id}`)}</td>
                <td>{renderIconButton(driver.VISA_fecha, `visa-${driver.id}`)}</td>
                <td>{renderIconButton(driver.Licencia_fecha, `lic-${driver.id}`)}</td>
                <td>
                  <button className="ver-btn">Ver</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            Anterior
          </button>
          <span>{`${from + 1}-${to} de ${filteredDrivers.length}`}</span>
          <button
            disabled={to >= filteredDrivers.length}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverAdmin;
