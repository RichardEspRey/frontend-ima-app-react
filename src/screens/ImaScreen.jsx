import React, { useState } from 'react';
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
      formDataToSend.append('numero_placa', formData.numero_placa);
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
        numero_placa: '',
        estado_placa: '',
        numero_vin: '',
      });

      setDocumentos({});

    }
  };


  return (

    <div >

      <h1 className="titulo">Alta de Documentos IMA EXPRESS LCC</h1>
      <div className="conductores-container">
        <div className="btnConteiner">
          <button className="btn cancelar">Cancelar</button>
          <button className="btn guardar" onClick={handleSubmit}>Guardar</button>
        </div>

        <div className="form-columns">
          {/* Puedes continuar con las otras dos columnas como en tu versión original */}
          <div className="column">
            <h2>Documentos USA</h2>
            <label>MC(PDF)</label>
            <button type="button" onClick={() => abrirModal('Fianza')}>Subir documento</button>
            {documentos.Fianza && (
              <p>{documentos.Fianza.fileName} - {documentos.Fianza.vencimiento}</p>
            )}
            

            <label>W9(PDF)</label>
            <button type="button" onClick={() => abrirModal('Fianza')}>Subir documento</button>
            {documentos.Fianza && (
              <p>{documentos.Fianza.fileName} - {documentos.Fianza.vencimiento}</p>
            )}

            <label>IFTA(PDF)</label>
            <button type="button" onClick={() => abrirModal('Fianza')}>Subir documento</button>
            {documentos.Fianza && (
              <p>{documentos.Fianza.fileName} - {documentos.Fianza.vencimiento}</p>
            )}

            <label>2290(PDF)</label>
            <button type="button" onClick={() => abrirModal('Fianza')}>Subir documento</button>
            {documentos.Fianza && (
              <p>{documentos.Fianza.fileName} - {documentos.Fianza.vencimiento}</p>
            )}

            <label>Permiso KYU(PDF)</label>
            <button type="button" onClick={() => abrirModal('Fianza')}>Subir documento</button>
            {documentos.Fianza && (
              <p>{documentos.Fianza.fileName} - {documentos.Fianza.vencimiento}</p>
            )}

            <label>UCR(PDF)</label>
            <button type="button" onClick={() => abrirModal('Fianza')}>Subir documento</button>
            {documentos.Fianza && (
              <p>{documentos.Fianza.fileName} - {documentos.Fianza.vencimiento}</p>
            )}

            <label>SCAC(PDF)</label>
            <button type="button" onClick={() => abrirModal('Fianza')}>Subir documento</button>
            {documentos.Fianza && (
              <p>{documentos.Fianza.fileName} - {documentos.Fianza.vencimiento}</p>
            )}
          </div>
          <div className="column">
            <h2>Documentos MEX</h2>
            <label>CAAT(PDF)</label>
            <button type="button" onClick={() => abrirModal('Fianza')}>Subir documento</button>
            {documentos.Fianza && (
              <p>{documentos.Fianza.fileName} - {documentos.Fianza.vencimiento}</p>
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
