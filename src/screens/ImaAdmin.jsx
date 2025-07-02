import React, { useState, useEffect } from 'react';
import './css/DriverAdmin.css';
import redIcon from '../assets/images/Icons_alerts/shield-red.png';
import greenIcon from '../assets/images/Icons_alerts/shield-green.png';
import yellowIcon from '../assets/images/Icons_alerts/shield-yellow.png';
import greyIcon from '../assets/images/Icons_alerts/shield-grey.png';
import questionIcon from '../assets/images/Icons_alerts/question.png';
import ModalArchivo from '../components/ModalArchivoEditor.jsx';
import { useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

const ImaAdmin = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [valorActual, setValorActual] = useState(null);
  const [documentos, setDocumentos] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 4;
  const [cajas, setCajas] = useState([]);
  const navigate = useNavigate();

  const from = page * rowsPerPage;
  const to = Math.min((page + 1) * rowsPerPage, cajas.length);
 


   const fetchDocs = async () => {
  const formDataToSend = new FormData();
  formDataToSend.append('op', 'getAll');

  try {
    const response = await fetch(`${apiHost}/IMA_Docs.php`, {
      method: 'POST',
      body: formDataToSend
    });

    const data = await response.json();

    if (data.status === 'success' && data.Users.length > 0) {
      const caja = data.Users[0];

      const camposDoc = {
        MC: { url: 'MC_URL', fecha: 'MC_fecha' },
        W9: { url: 'W9_URL', fecha: 'W9_fecha' },
        IFTA: { url: 'IFTA_URL', fecha: 'IFTA_fecha' },
        '2290': { url: '_2290_URL', fecha: '_2290_fecha' },
        Permiso_KYU: { url: 'Permiso_KYU_URL', fecha: 'Permiso_KYU_fecha' },
        UCR: { url: 'UCR_URL', fecha: 'UCR_fecha' },
        SCAC: { url: 'SCAC_URL', fecha: 'SCAC_fecha' },
        CAAT: { url: 'CAAT_URL', fecha: 'CAAT_fecha' }
      };

      const nuevosDocumentos = {};

      Object.entries(camposDoc).forEach(([campo, claves]) => {
        const url = caja[claves.url];
        const fecha = caja[claves.fecha];

        if (url || fecha) {
          nuevosDocumentos[campo] = {
            file: null,
            fileName: url?.split('/').pop() || '',
            vencimiento: fecha || '',
            url: url ? `${apiHost}/${url}` : ''
          };
        }
      });

      setDocumentos(nuevosDocumentos);

    }
  } catch (error) {
    console.error('Error al obtener los documentos:', error);
  }
};

 
 
   useEffect(() => {
     fetchDocs();
   }, []);


  const filteredCajas = cajas.filter(caja =>
    caja.id.toString().includes(search)
  );

  const getIconByFecha = (campo) => {
  const doc = documentos[campo];
  const fechaStr = doc?.vencimiento;
  const url = doc?.url;

  if (!fechaStr) {
    return (
      <>
        <img
          src={questionIcon}
          alt="Sin documento"
          className="icon-img"
          onClick={() => abrirModalConDocumento(campo)}
          data-tooltip-id={`tooltip-${campo}`}
          data-tooltip-content="No se cuenta con el documento"
        />
        <Tooltip id={`tooltip-${campo}`} place="top" />
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
        alt={campo}
        className="icon-img"
        onClick={() => abrirModalConDocumento(campo)}
        data-tooltip-id={`tooltip-${campo}`}
        data-tooltip-content={mensaje}
        style={{ cursor: 'pointer' }}
      />
      <Tooltip id={`tooltip-${campo}`} place="top" />
    </>
  );
};


const abrirModalConDocumento = (campo) => {
  const doc = documentos[campo];

  setValorActual({
    url: doc?.url || '',
    vencimiento: doc?.vencimiento || '',
    tipo: campo
  });
  setIsModalOpen(true);
};


  return (
    <div className="driver-admin">
      <h1 className="title">Administrador de documentos IMA EXPRESS LCC</h1>
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
              <th>IFTA</th>
              <th>2290</th>
              <th>UCR</th>
              <th>SCAC</th>
              <th>CAAT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{getIconByFecha('IFTA')}</td>
              <td>{getIconByFecha('2290')}</td>
              <td>{getIconByFecha('UCR')}</td>
              <td>{getIconByFecha('SCAC')}</td>
              <td>{getIconByFecha('CAAT')}</td>
            </tr>
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
        endpoint="IMA_Docs.php" 
        tipo="caja_id"
      />
    </div>
  );
};

export default ImaAdmin;
