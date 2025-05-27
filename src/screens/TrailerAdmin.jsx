import React, { useState, useEffect } from 'react';
import './css/DriverAdmin.css';
import redIcon from '../assets/images/Icons_alerts/shield-red.png'; 
import greenIcon from '../assets/images/Icons_alerts/shield-green.png'; 
import yellowIcon from '../assets/images/Icons_alerts/shield-yellow.png'; 
import greyIcon from '../assets/images/Icons_alerts/shield-grey.png'; 
import questionIcon from '../assets/images/Icons_alerts/question.png'; 
import ModalArchivo from '../components/ModalArchivoEditor.jsx'; 
import { Tooltip } from 'react-tooltip';

const TrailerAdmin = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [valorActual, setValorActual] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 4;
  const [cajas, setCajas] = useState([]);

  const from = page * rowsPerPage;
  const to = Math.min((page + 1) * rowsPerPage, cajas.length);

  useEffect(() => {
    const fetchCajas = async () => {
      try {
        const response = await fetch(`${apiHost}/cajas.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'op=getAll'
        });
        const data = await response.json();

        if (data.status === 'success' && data.Users) {
          const formatted = data.Users.map(caja => ({
            id: caja.no_caja,
            Registracion: caja.Registracion,
            Registracion_fecha: caja.Registracion_Fecha,
            Registracion_url: caja.Registracion_url_pdf,
            Seguro: caja.Seguro,
            Seguro_fecha: caja.Seguro_Fecha,
            Seguro_url: caja.Seguro_url_pdf,
            Fianza: caja.Fianza,
            Fianza_fecha: caja.Fianza_Fecha,
            Fianza_url: caja.Fianza_url_pdf,
          }));
          setCajas(formatted);
        }
      } catch (error) {
        console.error('Error al obtener las cajas:', error);
      }
    };

    fetchCajas();
  }, []);

  const filteredCajas = cajas.filter(caja =>
    caja.id.toString().includes(search)
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
          data-tooltip-id={`tooltip-${id}-${tipo}`}
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
      <h1 className="title">Administrador de cajas</h1>
      <div className="toolbar">
        <input
          type="text"
          placeholder="Buscar por número de caja"
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
              <th>No. Caja</th>
              <th>Registración</th>
              <th>Seguro</th>
              <th>Fianza</th>
            </tr>
          </thead>
          <tbody>
            {filteredCajas.slice(from, to).map(caja => (
              <tr key={caja.id}>
                <td>{caja.id}</td>
                <td>{getIconByFecha(caja.Registracion_fecha, caja.id, caja.Registracion_url, 'Registracion')}</td>
                <td>{getIconByFecha(caja.Seguro_fecha, caja.id, caja.Seguro_url, 'Seguro')}</td>
                <td>{getIconByFecha(caja.Fianza_fecha, caja.id, caja.Fianza_url, 'Fianza')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</button>
          <span>{`${from + 1}-${to} de ${filteredCajas.length}`}</span>
          <button disabled={to >= filteredCajas.length} onClick={() => setPage(page + 1)}>Siguiente</button>
        </div>
      </div>

      <ModalArchivo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => console.log('Guardado:', data)}
        nombreCampo="Documento"
        valorActual={valorActual}
      />
    </div>
  );
};

export default TrailerAdmin;
