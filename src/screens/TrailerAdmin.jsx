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
import Swal from 'sweetalert2';

const TrailerAdmin = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [valorActual, setValorActual] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 4;
  const [cajas, setCajas] = useState([]);
  const navigate = useNavigate();

  const from = page * rowsPerPage;
  const to = Math.min((page + 1) * rowsPerPage, cajas.length);


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
            id: caja.caja_id, 
            no_caja: caja.no_caja,

            seguro_Fecha: caja.seguro_Fecha,
            seguro_url_pdf: caja.seguro_url_pdf,

            CAB_CARD_Fecha: caja.CAB_CARD_Fecha,
            CAB_CARD_url_pdf: caja.CAB_CARD_url_pdf,

            FIANZA_fecha: caja.Fianza_Fecha,
            Fianza_url_pdf: caja.Fianza_url_pdf,

            CERTIFICADO_Fecha: caja.CERTIFICADO_Fecha,
            CERTIFICADO_url_pdf: caja.CERTIFICADO_url_pdf
          }));

          setCajas(formatted);
        }
      } catch (error) {
        console.error('Error al obtener las cajas:', error);
      }
    };

  useEffect(() => {
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

    let icon = redIcon;
    let mensaje = `Vencimiento: ${fecha.toLocaleDateString('es-MX')}`;

    if (diffInDays >= 90) icon = greenIcon;
    else if (diffInDays >= 60) icon = yellowIcon;
    else if (diffInDays >= 30) icon = redIcon;

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


 
  const eliminar = async (id) =>  {
 
   const { isConfirmed } = await Swal.fire({
     title: '¿Deseas eliminar esta caja?',
     icon: 'question',
         showCancelButton: true,
         confirmButtonText: 'Aceptar'
       });
   
   if (!isConfirmed)return;
        
    try {
       const formDataToSend = new FormData();
         formDataToSend.append('op', 'Baja'); // operación que espera el backend
         formDataToSend.append('id', id);
 
         const response = await fetch(`${apiHost}/cajas.php`, {
           method: 'POST',
           body: formDataToSend,
         });
 
         const data = await response.json();
         if (data.status === 'success' ) {
          Swal.fire({
           icon: 'success',
           title: 'Éxito',
           text: 'Caja dada de baja!',
         });
         
         }
       } catch (error) {
         console.error('Error al obtener los Caja:', error);
       }
       fetchCajas();
      window.location.reload();
       
     
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
              <th>Seguro</th>
              <th>CAB CARD</th>
              <th>Fianza</th>
              <th>Certificado</th>
              <th>Acciones</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredCajas.slice(from, to).map(caja => (
              <tr key={caja.id}>
                <td>{caja.no_caja}</td> 
                <td>{getIconByFecha(caja.seguro_Fecha, caja.id, caja.seguro_url_pdf, 'seguro')}</td>
                <td>{getIconByFecha(caja.CAB_CARD_Fecha, caja.id, caja.CAB_CARD_url_pdf, 'CAB CARD')}</td>
                <td>{getIconByFecha(caja.FIANZA_fecha, caja.id, caja.Fianza_url_pdf, 'FIANZA')}</td>
                <td>{getIconByFecha(caja.CERTIFICADO_Fecha, caja.id, caja.CERTIFICADO_url_pdf, 'CERTIFICADO')}</td>
                <td>
                  <button
                    className="ver-btn"
                    onClick={() => navigate(`/editor-trailers/${caja.id}`)}
                  >
                    Ver
                  </button>
                </td>
                 <td>
                  <button
                    className="ver-btn"
                    onClick={() => eliminar(caja.id)}
                    >
                    Eliminar
                  </button>
                </td>
                
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
        endpoint="cajas_docs.php" 
        tipo="caja_id"
      />
    </div>
  );
};

export default TrailerAdmin;
