import React, { useState, useEffect } from 'react';
import './css/DriverAdmin.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import redIcon from '../assets/images/Icons_alerts/shield-red.png'; 
import greenIcon from '../assets/images/Icons_alerts/shield-green.png'; 
import yellowIcon from '../assets/images/Icons_alerts/shield-yellow.png'; 
import greyIcon from '../assets/images/Icons_alerts/shield-grey.png'; 
import questionIcon from '../assets/images/Icons_alerts/question.png'; 
import ModalArchivo from '../components/ModalArchivoEditor.jsx'; 
import { Tooltip } from 'react-tooltip';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const DriverAdmin = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [valorActual, setValorActual] = useState(null); 

  const apiHost = import.meta.env.VITE_API_HOST;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 4;
  const [selectedValue, setSelectedValue] = useState('');
  const [drivers, setDrivers] = useState([]);

  const from = page * rowsPerPage;
  const to = Math.min((page + 1) * rowsPerPage, drivers.length);


    const fetchDrivers = async () => {
      try {
        const response = await fetch(`${apiHost}/drivers.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'op=getAll',
        });

        const data = await response.json();
        console.log(data);
        if (data.status === 'success' && data.Users) {
          const formatted = data.Users.map(user => ({
            id: user.driver_id.toString(),
            name: user.nombre || 'Sin nombre',
            fecha: user.fecha_ingreso || 'Sin fecha',
            APTO_tipo: user.APTO_tipo || '',
            APTO_fecha: user.APTO_fecha || '',
            APTO_URL: user.APTO_URL || '',
            I94_tipo: user.I94_tipo || '',
            I94_fecha: user.I94_fecha || '',
            I94_URL: user.I94_URL || '',
            VISA_tipo: user.VISA_tipo || '',
            VISA_fecha: user.VISA_fecha || '',
            VISA_URL: user.VISA_URL || '',
            Licencia_tipo: user.Licencia_tipo || '',
            Licencia_fecha: user.Licencia_fecha || '',
            Licencia_URL: user.Licencia_URL || '',
          }));
          setDrivers(formatted);
        }
      } catch (error) {
        console.error('Error al obtener los conductores:', error);
      }
    };


  useEffect(() => {
    fetchDrivers();
  }, []);

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(search.toLowerCase())
  );

  const renderIconButton = (fecha, id, url, tipo) => {
    const icon = getIconByFecha(fecha, id, url, tipo);
  
    return (
      <button className="icon-btn" disabled={!fecha}>
        {icon}
      </button>
    );
  };

  const getIconByFecha = (fechaStr, id, url, tipo) => {
  if (!fechaStr) {
    return (
      <>
        <img
          src={questionIcon}
          alt="Sin documento"
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
        alt= {`${tipo}`}
        className="icon-img"
        onClick={() => abrirModalConDocumento(url, fechaStr, id, tipo)}
        data-tooltip-id={`${id}`}
        data-tooltip-content={mensaje}
        style={{ cursor: 'pointer' }}
      />
      <Tooltip id={`tooltip-${id}`} place="top" />
    </>
  );
};


  const abrirModalConDocumento = (url, fecha, id, tipo) => {
  setValorActual({
    url: `${apiHost}/${url}`, //"http://imaexpressllc.com/API/Uploads/Drivers/Acta_Nacimiento_1_v1_1.pdf"
    vencimiento: fecha,
    id: id,
    tipo: tipo

  });
  setIsModalOpen(true);
}


 const eliminar = async (id) =>  {

  const { isConfirmed } = await Swal.fire({
    title: '¿Desea eliminar a este driver?',
    icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Aceptar'
      });
  
  if (!isConfirmed)return;
       
   try {
      const formDataToSend = new FormData();
        formDataToSend.append('op', 'Baja'); // operación que espera el backend
        formDataToSend.append('id', id);

        const response = await fetch(`${apiHost}/drivers.php`, {
          method: 'POST',
          body: formDataToSend,
        });

        const data = await response.json();
        if (data.status === 'success' ) {
         Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Driver dado de baja!',
        });
        
        }
      } catch (error) {
        console.error('Error al obtener los conductores:', error);
      }
      fetchDrivers();
       window.location.reload();
    
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
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.slice(from, to).map(driver => (
              <tr key={driver.id}>
                <td>{driver.id}</td>
                <td>{driver.name}</td>
                <td>{driver.fecha}</td>
                <td>{renderIconButton(driver.APTO_fecha, `${driver.id}`, driver.APTO_URL, driver.APTO_tipo)}</td>
                <td>{renderIconButton(driver.I94_fecha, `${driver.id}`, driver.I94_URL, driver.I94_tipo)}</td>
                <td>{renderIconButton(driver.VISA_fecha, `${driver.id}`, driver.VISA_URL, driver.VISA_tipo)}</td>
                <td>{renderIconButton(driver.Licencia_fecha, `${driver.id}`, driver.Licencia_URL, driver.Licencia_tipo)}</td>
                <td>
                  <button
                    className="ver-btn"
                    onClick={() => navigate(`/editor-drivers/${driver.id}`)}
                    >
                    Ver
                  </button>
                </td>
                 <td>
                  <button
                    className="ver-btn"
                    onClick={() => eliminar(driver.id)}
                    >
                    Eliminar
                  </button>
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
        <ModalArchivo
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={(data) => {
            console.log("Guardado:", data);
          }}
          nombreCampo="Documento"
          valorActual={valorActual}
          endpoint="drivers_docs.php" 
          tipo="driver_id"
        />
    </div>
  );

};



export default DriverAdmin;
