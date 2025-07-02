import React, { useState } from 'react';
import './css/ConductoresScreen.css';
import 'react-datepicker/dist/react-datepicker.css';
import ModalArchivo from '../components/ModalArchivo.jsx'; // ajusta la ruta si es necesario
import Swal from 'sweetalert2';


const TrailerScreen = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [formData, setFormData] = useState({
    numero_caja: '',
    no_placa: '',
    estado_placa: '',
    numero_vin: '',

  });

  const [selectedFieldName, setSelectedFieldName] = useState(null);

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


  const envioDatosPrincipal = async () => {

    try {
      const formDataToSend = new FormData();

      // Aquí añadimos solo campos de texto (no archivos)
      formDataToSend.append('op', 'Alta'); // operación que espera el backend
      formDataToSend.append('numero_caja', formData.numero_caja);
      formDataToSend.append('no_placa', formData.no_placa);
      formDataToSend.append('estado_placa', formData.estado_placa);
      formDataToSend.append('numero_vin', formData.numero_vin);


      // Enviar al backend
      const response = await fetch(`${apiHost}/cajas.php`, {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      console.log('Respuesta del servidor:', result);

      const idConductor = result.id;
      console.log("ID recibido del backend:", idConductor);

      if (result.status === "success") {

        const idConductor = result.id;
        console.log("ID recibido del backend:", idConductor);
        return idConductor;
      } else {
        throw new Error("Error al guardar datos básicos");
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      alert('Error al conectar con el servidor');
    }
  };

  const enviarDocumentos = async (caja_id) => {
    const entries = Object.entries(documentos); // clave: nombre campo, valor: { file, vencimiento }

    for (const [tipo_documento, { file, vencimiento }] of entries) {
      const formDataFile = new FormData();
      formDataFile.append('op', 'Alta');
      formDataFile.append('caja_id', caja_id);
      formDataFile.append('tipo_documento', tipo_documento);
      formDataFile.append('fecha_vencimiento', vencimiento);
      formDataFile.append('documento', file);

      try {
        const response = await fetch(`${apiHost}/cajas_docs.php`, {
          method: 'POST',
          body: formDataFile,
        });

        const result = await response.json();
        console.log(`Documento ${tipo_documento} enviado:`, result);
        
      } catch (error) {
        console.error(`Error al enviar ${tipo_documento}:`, error);
      }
    }
  };
  const handleSubmit = async () => {
    const idConductor = await envioDatosPrincipal();

    if (idConductor) {
      await enviarDocumentos(idConductor);
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Todos los documentos fueron enviados correctamente',
        });
      setFormData({
        numero_caja: '',
        no_placa: '',
        estado_placa: '',
        numero_vin: '',
      });

      setDocumentos({});

    }
  };
  const cancelar = () => {
    setFormData({
        numero_caja: '',
        no_placa: '',
        estado_placa: '',
        numero_vin: '',
      });

      setDocumentos({});
  }

  return (

    <div >

      <h1 className="titulo">Alta de Caja</h1>
      <div className="conductores-container">
        <div className="btnConteiner">
          <button className="btn cancelar" onClick={cancelar}>Cancelar</button>
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

            <label>Placa</label>
            <input
              type="text"
              placeholder="Placa"
              value={formData.no_placa}
              onChange={(e) => handleInputChange('no_placa', e.target.value)}
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

export default TrailerScreen;
