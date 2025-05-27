import React, { useState, useEffect } from 'react';
import './css/DriverAdmin.css';
import redIcon from '../assets/images/Icons_alerts/shield-red.png'; 
import greenIcon from '../assets/images/Icons_alerts/shield-green.png'; 
import yellowIcon from '../assets/images/Icons_alerts/shield-yellow.png'; 
import greyIcon from '../assets/images/Icons_alerts/shield-grey.png'; 
import questionIcon from '../assets/images/Icons_alerts/question.png'; 
import ModalArchivo from '../components/ModalArchivoEditor.jsx'; 
import { Tooltip } from 'react-tooltip';

const TruckAdmin = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [valorActual, setValorActual] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 4;
  const [trailers, setTrailers] = useState([]);

  const from = page * rowsPerPage;
  const to = Math.min((page + 1) * rowsPerPage, trailers.length);

  useEffect(() => {
    const fetchTrailers = async () => {
      try {
        const response = await fetch(`${apiHost}/trucks.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'op=getAll'
        });
        const data = await response.json();

        if (data.status === 'success' && data.Users) {
          const formatted = data.Users.map(t => ({
            id: t.unidad,
            placa_mex: t.Placa_MEX,
            placa_eua: t.Placa_EUA,
            Registracion_fecha: t.Registracion_Fecha,
            Registracion_url: t.Registracion_URL,
            Carta_fecha: t.Carta_Fecha,
            Carta_url: t.Carta_URL,
            CAB_fecha: t.CAB_Fecha,
            CAB_url: t.CAB_URL,
            DTOP_fecha: t.DTOP_Fecha,
            DTOP_url: t.DTOP_URL,
            NY_fecha: t.PERMISO_NY_Fecha,
            NY_url: t.PERMISO_NY_URL,
            NM_fecha: t.PERMISO_NM_Fecha,
            NM_url: t.PERMISO_NM_URL,
          }));
          setTrailers(formatted);
        }
      } catch (error) {
        console.error('Error al obtener los trailers:', error);
      }
    };

    fetchTrailers();
  }, []);

  const filteredTrailers = trailers.filter(t =>
    t.id.toString().includes(search)
  );

  const getIconByFecha = (fechaStr, id, url, tipo) => {
    if (!fechaStr) {
      return (
        <>
          <img
            src={questionIcon}
            alt="Sin documento"
            className="icon-img"
            data-tooltip-id={`tooltip-${id}-${tipo}`}
            data-tooltip-content="No se cuenta con el documento"
          />
          <Tooltip id={`tooltip-${id}-${tipo}`} place="top" />
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
          alt={tipo}
          className="icon-img"
          onClick={() => abrirModalConDocumento(url, fechaStr, id, tipo)}
          data-tooltip-id={`${id}`}
          data-tooltip-content={mensaje}
          style={{ cursor: 'pointer' }}
        />
        <Tooltip id={`tooltip-${id}-${tipo}`} place="top" />
      </>
    );
  };

  const abrirModalConDocumento = (url, fecha, id, tipo) => {
    setValorActual({
      url: `${apiHost}/${url}`,
      vencimiento: fecha,
      id,
      tipo
    });
    setIsModalOpen(true);
  };

  return (
    <div className="driver-admin">
      <h1 className="title">Administrador de trailers</h1>
      <div className="toolbar">
        <input
          type="text"
          placeholder="Buscar por unidad"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Unidad</th>
              <th>Placa MEX</th>
              <th>Placa EUA</th>
              <th>Registración</th>
              <th>Carta</th>
              <th>CAB</th>
              <th>DTOP</th>
              <th>Permiso NY</th>
              <th>Permiso NM</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrailers.slice(from, to).map(t => (
              <tr key={t.id}>
                <td>{t.id}</td>
                <td>{t.placa_mex}</td>
                <td>{t.placa_eua}</td>
                <td>{getIconByFecha(t.Registracion_fecha, t.id, t.Registracion_url, 'Registracion')}</td>
                <td>{getIconByFecha(t.Carta_fecha, t.id, t.Carta_url, 'Carta')}</td>
                <td>{getIconByFecha(t.CAB_fecha, t.id, t.CAB_url, 'CAB')}</td>
                <td>{getIconByFecha(t.DTOP_fecha, t.id, t.DTOP_url, 'DTOP')}</td>
                <td>{getIconByFecha(t.NY_fecha, t.id, t.NY_url, 'PERMISO_NY')}</td>
                <td>{getIconByFecha(t.NM_fecha, t.id, t.NM_url, 'PERMISO_NM')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</button>
          <span>{`${from + 1}-${to} de ${filteredTrailers.length}`}</span>
          <button disabled={to >= filteredTrailers.length} onClick={() => setPage(page + 1)}>Siguiente</button>
        </div>
      </div>

      <ModalArchivo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => console.log('Guardado:', data)}
        nombreCampo="Documento"
        valorActual={valorActual}
        endpoint="trucks_docs.php" 
        tipo="truck_id"
      />
    </div>
  );
};

export default TruckAdmin;