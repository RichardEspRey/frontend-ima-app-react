import React, { useState, useEffect } from 'react';
import './css/DriverAdmin.css';
import redIcon from '../assets/images/Icons_alerts/shield-red.png'; 
import greenIcon from '../assets/images/Icons_alerts/shield-green.png'; 
import yellowIcon from '../assets/images/Icons_alerts/shield-yellow.png'; 
import greyIcon from '../assets/images/Icons_alerts/shield-grey.png'; 
import questionIcon from '../assets/images/Icons_alerts/question.png'; 
import ModalArchivo from '../components/ModalArchivoEditor.jsx'; 
import { Tooltip } from 'react-tooltip';
import { useNavigate } from 'react-router-dom'; // Asegúrate de tener react-router-dom instalado

const TruckAdmin = () => {
  const navigate = useNavigate();
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
            truck_id: t.truck_id,
            unidad: t.unidad,
            placa_mex: t.Placa_MEX,
            placa_eua: t.Placa_EUA,

            CAB_Fecha: t.CAB_Fecha,
            CAB_URL: t.CAB_URL,
            COI_Fecha: t.COI_Fecha,
            COI_URL: t.COI_URL,
            mecanica_Fecha: t.mecanica_Fecha,
            mecanica_URL: t.mecanica_URL, 
            TX_DMV_Fecha: t.TX_DMV_Fecha,
            TX_DMV_URL: t.TX_DMV_URL, 
            PERMISO_NY_Fecha: t.PERMISO_NY_Fecha,
            PERMISO_NY_URL: t.PERMISO_NY_URL, 
            PERMISO_NM_Fecha: t.PERMISO_NM_Fecha, 
            PERMISO_NM_URL: t.PERMISO_NM_URL, 
            dtops_Fecha: t.dtops_Fecha, 
            dtops_URL: t.dtops_URL, 
            fisio_Mecanica_Fecha: t.fisio_Mecanica_Fecha,
            fisio_Mecanica_URL: t.fisio_Mecanica_URL,
            Inspecion_humos_Fecha: t.Inspecion_humos_Fecha,
            Inspecion_humos_URL: t.Inspecion_humos_URL,
            seguro_Fecha: t.seguro_Fecha,
            seguro_URL: t.seguro_URL
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
  t.unidad.toString().includes(search)
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
              <th>CAB CARD</th>
              <th>COI</th>
              <th>Inspeccion mecanica</th>
              <th>TX DMV</th>            
              <th>DTOPS</th>
              <th>Permiso NY</th>
              <th>Permiso NM</th>
              <th>Inspeccion fisio mecanica</th>
              <th>Inspeccion humos</th>
              <th>Seguro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrailers.slice(from, to).map(t => (
              <tr key={t.truck_id}>

                <td>{t.unidad}</td>
                <td>{t.placa_mex}</td>
                <td>{t.placa_eua}</td>

                <td>{getIconByFecha(t.CAB_Fecha, t.truck_id, t.CAB_URL, 'CAB')}</td>
                <td>{getIconByFecha(t.COI_Fecha, t.truck_id, t.COI_URL, 'COI')}</td>
                <td>{getIconByFecha(t.mecanica_Fecha, t.truck_id, t.mecanica_URL, 'Mecanica')}</td>
                <td>{getIconByFecha(t.TX_DMV_Fecha, t.truck_id, t.TX_DMV_URL, 'TX')}</td>
                <td>{getIconByFecha(t.dtops_Fecha, t.truck_id, t.dtops_URL, 'DTOPS')}</td>
                <td>{getIconByFecha(t.PERMISO_NY_Fecha, t.truck_id, t.PERMISO_NY_URL, 'PERMISO_NY')}</td>
                <td>{getIconByFecha(t.PERMISO_NM_Fecha, t.truck_id, t.PERMISO_NM_URL, 'PERMISO_NM')}</td>
                <td>{getIconByFecha(t.fisio_Mecanica_Fecha, t.truck_id, t.fisio_Mecanica_URL, 'Inspeccion fisio mecanica')}</td>
                <td>{getIconByFecha(t.Inspecion_humos_Fecha, t.truck_id, t.Inspecion_humos_URL, 'DTOPS')}</td>
                <td>{getIconByFecha(t.seguro_Fecha, t.truck_id, t.seguro_URL, 'Seguro')}</td>
                <td>

                  <button
                    className="ver-btn"
                    onClick={() => navigate(`/editor-trucks/${t.truck_id}`)}
                  >
                    Ver
                  </button>
                </td>
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