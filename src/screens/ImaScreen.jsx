import React, { useState,useEffect } from 'react';
import './css/ConductoresScreen.css';
import 'react-datepicker/dist/react-datepicker.css';
import ModalArchivo from '../components/ModalArchivo.jsx'; // ajusta la ruta si es necesario
import Swal from 'sweetalert2';


const ImaScreen = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [formData, setFormData] = useState({
    numero_caja: '',
    numero_placa: '',
    estado_placa: '',
    numero_vin: '',

  });

const [originalDocumentos, setOriginalDocumentos] = useState({});

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  {/*utiles*/ }
  const [documentos, setDocumentos] = useState({});
  const [modalAbierto, setModalAbierto] = useState(false);
  const [campoActual, setCampoActual] = useState(null);

  const handleGuardarDocumento = (campo, data) => {
    setDocumentos(prev => ({
      ...prev,
      [campo]: data
    }));
  };

  const abrirModal = (campo) => {
    setCampoActual(campo);
    setModalAbierto(true);
  };




  const enviarDocumentos = async () => {
  for (const [tipo_documento, { file, vencimiento }] of Object.entries(documentos)) {
    const original = originalDocumentos[tipo_documento];
    const hayNuevoArchivo = !!file;
    const vencimientoCambio = original?.vencimiento !== vencimiento;

    if (!hayNuevoArchivo && !vencimientoCambio) continue;

    const formDataFile = new FormData();
    formDataFile.append('op', 'Alta');
    formDataFile.append('tipo_documento', tipo_documento);
    formDataFile.append('fecha_vencimiento', vencimiento);
    if (hayNuevoArchivo) formDataFile.append('documento', file);

    try {
      const response = await fetch(`${apiHost}/IMA_Docs.php`, {
        method: 'POST',
        body: formDataFile,
      });

      const result = await response.json();
      console.log(`Documento ${tipo_documento} actualizado:`, result);

      const { isConfirmed } = await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Document ${tipo_documento} updated`,
        confirmButtonText: 'Accept'
      });
      
      if (isConfirmed){
          window.location.reload();
      }return;

    } catch (error) {
      console.error(`Error al enviar ${tipo_documento}:`, error);
    }
  }
};
const handleSubmit = async () => {
  let cambios = [];

  for (const [tipo, doc] of Object.entries(documentos)) {
    const original = originalDocumentos[tipo];
    const nuevoArchivo = !!doc?.file;
    const cambioVencimiento = original?.vencimiento !== doc?.vencimiento;
    if (nuevoArchivo || cambioVencimiento) {
      cambios.push(`Documento: ${tipo}`);
    }
  }

  if (cambios.length === 0) {
    Swal.fire({
      icon: 'info',
      title: 'No changes detected',
      text: 'No changes were detected in the documents.'
    });
    return;
  }

  const { isConfirmed } = await Swal.fire({
    title: '¿Confirm changes?',
    html: `<b>Updates detected:</b><br>${cambios.join('<br>')}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Yes, save',
    cancelButtonText: 'Cancel'
  });

  if (!isConfirmed) return;

  await enviarDocumentos();
};


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
      const documentos = data.Users[0];

      // Documentos esperados en la respuesta
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
        const url = documentos[claves.url];
        const fecha = documentos[claves.fecha];

        if (url) {
          nuevosDocumentos[campo] = {
            file: null,
            fileName: url.split('/').pop(),
            vencimiento: fecha || '',
            url: `${apiHost}/${url}`
          };
        }
      });

    setDocumentos(nuevosDocumentos);
    setOriginalDocumentos(nuevosDocumentos);

    }
  } catch (error) {
    console.error('Error al obtener los documentos:', error);
  }
};


  useEffect(() => {
    fetchDocs();
  }, []);

  return (

    <div >

      <h1 className="titulo">Document Upload IMA EXPRESS LCC</h1>
      <div className="conductores-container">
        <div className="btnConteiner">
          <button className="btn cancelar">Cancel</button>
          <button className="btn guardar" onClick={handleSubmit}>Save</button>
        </div>

        <div className="form-columns">
          {/* Puedes continuar con las otras dos columnas como en tu versión original */}
          <div className="column">
            <h2>USA Documents</h2>
            <label>MC(PDF)</label>
            <button type="button" onClick={() => abrirModal('MC')}>Upload Document</button>
            {documentos.MC && (
              <p>{documentos.MC.fileName} - {documentos.MC.vencimiento}</p>
            )}
            

            <label>W9(PDF)</label>
            <button type="button" onClick={() => abrirModal('W9')}>Upload Document</button>
            {documentos.W9 && (
              <p>{documentos.W9.fileName} - {documentos.W9.vencimiento}</p>
            )}

            <label>IFTA(PDF)</label>
            <button type="button" onClick={() => abrirModal('IFTA')}>Upload Document</button>
            {documentos.IFTA && (
              <p>{documentos.IFTA.fileName} - {documentos.IFTA.vencimiento}</p>
            )}

            <label>2290(PDF)</label>
            <button type="button" onClick={() => abrirModal('2290')}>Subir documento</button>
            {documentos['2290'] && (
              <p>{documentos['2290'].fileName} - {documentos['2290'].vencimiento}</p>
            )}

            <label>Permiso KYU(PDF)</label>
            <button type="button" onClick={() => abrirModal('Permiso_KYU')}>Upload Document</button>
            {documentos.Permiso_KYU && (
              <p>{documentos.Permiso_KYU.fileName} - {documentos.Permiso_KYU.vencimiento}</p>
            )}

            <label>UCR(PDF)</label>
            <button type="button" onClick={() => abrirModal('UCR')}>Upload Document</button>
            {documentos.UCR && (
              <p>{documentos.UCR.fileName} - {documentos.UCR.vencimiento}</p>
            )}

            <label>SCAC(PDF)</label>
            <button type="button" onClick={() => abrirModal('SCAC')}>Upload Document</button>
            {documentos.SCAC && (
              <p>{documentos.SCAC.fileName} - {documentos.SCAC.vencimiento}</p>
            )}
          </div>
          <div className="column">
            <h2>MEX Documents</h2>
            <label>CAAT(PDF)</label>
            <button type="button" onClick={() => abrirModal('CAAT')}>Upload Document</button>
            {documentos.CAAT && (
              <p>{documentos.CAAT.fileName} - {documentos.CAAT.vencimiento}</p>
            )}
           </div>
        </div>
        <ModalArchivo
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          onSave={(data) => handleGuardarDocumento(campoActual, data)}
          nombreCampo={campoActual}
          valorActual={documentos[campoActual]}
        />
      </div>
    </div>
  );

};

export default ImaScreen;
