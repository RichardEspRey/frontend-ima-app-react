import React, { useState, useEffect } from 'react';
import './css/ConductoresScreen.css';
import 'react-datepicker/dist/react-datepicker.css';
import ModalArchivo from '../components/ModalArchivo.jsx';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const TrailerEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const apiHost = import.meta.env.VITE_API_HOST;

 const [formData, setFormData] = useState({
  numero_caja: '',
  no_placa: '',       
  estado_placa: '',
  numero_vin: ''
});


  const [originalFormData, setOriginalFormData] = useState(null);
  const [documentos, setDocumentos] = useState({});
  const [originalDocumentos, setOriginalDocumentos] = useState({});
  const [modalAbierto, setModalAbierto] = useState(false);
  const [campoActual, setCampoActual] = useState(null);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardarDocumento = (campo, data) => {
    setDocumentos(prev => ({ ...prev, [campo]: data }));
  };

  const abrirModal = (campo) => {
    setCampoActual(campo);
    setModalAbierto(true);
  };

  const envioDatosPrincipal = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('op', 'editTrailer');
      formDataToSend.append('trailer_id', id);

      if (formData.numero_caja !== originalFormData.numero_caja) formDataToSend.append('no_caja', formData.numero_caja);
      
      if (formData.no_placa !== originalFormData.no_placa) formDataToSend.append('no_placa', formData.no_placa);
      if (formData.estado_placa !== originalFormData.estado_placa) formDataToSend.append('estado_placa', formData.estado_placa);
      if (formData.numero_vin !== originalFormData.numero_vin) formDataToSend.append('no_vin', formData.numero_vin);

      if (formDataToSend.entries().next().done) {
        Swal.fire({ icon: 'info', title: 'Sin cambios', text: 'No se detectaron cambios' });
        return null;
      }

      const response = await fetch(`${apiHost}/cajas.php`, { method: 'POST', body: formDataToSend });
      const result = await response.json();

      if (result.status === 'success') return id;
      throw new Error('Error al guardar datos');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al conectar con el servidor');
    }
  };

  const enviarDocumentos = async (trailer_id) => {
    for (const [tipo_documento, { file, vencimiento }] of Object.entries(documentos)) {
      const original = originalDocumentos[tipo_documento];
      const hayNuevoArchivo = !!file;
      const vencimientoCambio = original?.vencimiento !== vencimiento;

      if (!hayNuevoArchivo && !vencimientoCambio) continue;

      const formDataFile = new FormData();
      formDataFile.append('op', 'Alta');
      formDataFile.append('caja_id', trailer_id);
      formDataFile.append('tipo_documento', tipo_documento);
      formDataFile.append('fecha_vencimiento', vencimiento);
      if (hayNuevoArchivo) formDataFile.append('documento', file);

      try {
        const response = await fetch(`${apiHost}/cajas_docs.php`, { method: 'POST', body: formDataFile });
        const result = await response.json();
        Swal.fire({ icon: 'success', title: 'Éxito', text: `Documento ${tipo_documento} actualizado` });
      } catch (error) {
        console.error(`Error al enviar ${tipo_documento}:`, error);
      }
    }
  };

  const handleSubmit = async () => {
    const cambios = [];
    if (formData.numero_caja !== originalFormData.numero_caja) cambios.push('Número de caja');
    if (formData.no_placa !== originalFormData.no_placa) cambios.push('Número de placa');
    if (formData.estado_placa !== originalFormData.estado_placa) cambios.push('Estado de placa');
    if (formData.numero_vin !== originalFormData.numero_vin) cambios.push('Número VIN');

    let hayCambiosEnDocumentos = false;
    for (const [tipo, doc] of Object.entries(documentos)) {
      const original = originalDocumentos[tipo];
      const nuevoArchivo = !!doc?.file;
      const cambioVencimiento = original?.vencimiento !== doc?.vencimiento;
      if (nuevoArchivo || cambioVencimiento) {
        hayCambiosEnDocumentos = true;
        cambios.push(`Documento: ${tipo}`);
      }
    }

    if (cambios.length === 0) {
      Swal.fire({ icon: 'info', title: 'Sin cambios', text: 'No se detectaron cambios' });
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: '¿Confirmar cambios?',
      html: `<b>Modificaciones detectadas:</b><br>${cambios.join('<br>')}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, guardar',
      cancelButtonText: 'Cancelar'
    });

    if (!isConfirmed) return;

    let trailerId = id;
    if (cambios.some(c => !c.startsWith('Documento'))) {
      const resultado = await envioDatosPrincipal();
      if (!resultado) return;
      trailerId = resultado;
    }

    if (hayCambiosEnDocumentos) {
      await enviarDocumentos(trailerId);
    }

    Swal.fire({ icon: 'success', title: 'Actualización exitosa', confirmButtonText: 'Aceptar' })
      .then(() => window.location.reload());
  };

  const fetchTrailer = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append('op', 'getTrailerEdit');
    formDataToSend.append('trailer_id', id);

    try {
      const response = await fetch(`${apiHost}/cajas.php`, { method: 'POST', body: formDataToSend });
      const data = await response.json();

      if (data.status === 'success' && data.Users.length > 0) {
        const caja = data.Users[0];
        const formValues = {
          numero_caja: caja.no_caja || '',
          no_placa: caja.no_placa || '',            // <- Aquí lo agregas
          estado_placa: caja.estado_placa || '',
          numero_vin: caja.no_vin || ''
        };

        setFormData(formValues);
        setOriginalFormData(formValues);

        const camposDoc = ['Registracion', 'Seguro', 'Fianza'];
        const nuevosDocumentos = {};

        camposDoc.forEach((campo) => {
          const urlCampo = `${campo}_url_pdf`;
          const fechaCampo = `${campo}_Fecha`;
          if (caja[urlCampo]) {
            nuevosDocumentos[campo] = {
              file: null,
              fileName: caja[urlCampo].split('/').pop(),
              vencimiento: caja[fechaCampo] || '',
              url: `${apiHost}/${caja[urlCampo]}`,
            };
          }
        });

        setDocumentos(nuevosDocumentos);
        setOriginalDocumentos(nuevosDocumentos);
      }
    } catch (error) {
      console.error('Error al obtener la caja:', error);
    }
  };

  useEffect(() => {
    fetchTrailer();
  }, []);

 const cancelar = () => {
    setFormData({
        numero_caja: '',
        numero_placa: '',
        estado_placa: '',
        numero_vin: '',
      });

      setDocumentos({});
      navigate(`/admin-trailers`)
  }
  return (

    <div >

      <h1 className="titulo">Editor de Caja</h1>
      <div className="conductores-container">
        <div className="btnConteiner">
          <button className="btn cancelar"onClick={cancelar}>Cancelar</button>
          <button className="btn guardar" onClick={handleSubmit}>Guardar</button>
        </div>

        <div className="form-columns">
          {/* Puedes continuar con las otras dos columnas como en tu versión original */}
          <div className="column">
             <label>Número de caja</label>
            <input
              type="text"
              placeholder="Número de caja"
              value={formData.numero_caja}
              onChange={(e) => handleInputChange('numero_caja', e.target.value)}
            />

            <label>Número de Placa</label>
            <input
              type="text"
              placeholder="Número de placa"
              value={formData.numero_placa}
              onChange={(e) => handleInputChange('numero_placa', e.target.value)}
            />

            <label>Estado de Placa</label>
            <input
              type="text"
              placeholder="Estado de placa"
              value={formData.estado_placa}
              onChange={(e) => handleInputChange('estado_placa', e.target.value)}
            />

            <label>Número de VIN</label>
            <input
              type="text"
              placeholder="Número de VIN"
              value={formData.numero_vin}
              onChange={(e) => handleInputChange('numero_vin', e.target.value)}
            />

            <label>Registracion (PDF)</label>
            <button type="button" onClick={() => abrirModal('Registracion')}>Subir documento</button>
            {documentos.Registracion && (
              <p>{documentos.Registracion.fileName} - {documentos.Registracion.vencimiento}</p>
            )}

            <label>Seguro (PDF)</label>
            <button type="button" onClick={() => abrirModal('seguro')}>Subir documento</button>
            {documentos.seguro && (
              <p>{documentos.seguro.fileName} - {documentos.seguro.vencimiento}</p>
            )}

            <label>Cab Card(PDF)</label>
            <button type="button" onClick={() => abrirModal('CAB_CARD')}>Subir documento</button>
            {documentos.CAB_CARD && (
              <p>{documentos.CAB_CARD.fileName} - {documentos.CAB_CARD.vencimiento}</p>
            )}

            <label>Fianza(PDF)</label>
            <button type="button" onClick={() => abrirModal('Fianza')}>Subir documento</button>
            {documentos.Fianza && (
              <p>{documentos.Fianza.fileName} - {documentos.Fianza.vencimiento}</p>
            )}

            <label>Certificado de fumigacion(PDF)</label>
            <button type="button" onClick={() => abrirModal('CERTIFICADO')}>Subir documento</button>
            {documentos.CERTIFICADO && (
              <p>{documentos.CERTIFICADO.fileName} - {documentos.CERTIFICADO.vencimiento}</p>
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

export default TrailerEdit;
