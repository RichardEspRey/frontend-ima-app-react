import React, { useState } from 'react';
import './css/ConductoresScreen.css';
import 'react-datepicker/dist/react-datepicker.css';
import ModalArchivo from '../components/ModalArchivo.jsx'; // ajusta la ruta si es necesario
import Swal from 'sweetalert2';


const DriverScreen = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [formData, setFormData] = useState({
    nombre: '',
    fechaEntrada: '',
    rfc: '',
    phone_usa: '',
    phone_mex: '',
    visa: ''
  });

  const [selectedFieldName, setSelectedFieldName] = useState(null);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  {/*utiles*/ }
  const [documentos, setDocumentos] = useState({});
  const [mostrarFechaVencimientoModal, setMostrarFechaVencimientoModal] = useState(true);
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
    if (['INE', 'Acta_Nacimiento', 'CURP', 'Comprobante_domicilio', 'Constancia', 'Solicitud_empleo', 'Atidoping'].includes(campo)) {
      setMostrarFechaVencimientoModal(false);
    } else {
      setMostrarFechaVencimientoModal(true);

    }
  };


  const envioDatosPrincipal = async () => {
    try {
      const formDataToSend = new FormData();

      // Aquí añadimos solo campos de texto (no archivos)
      formDataToSend.append('op', 'Alta'); // operación que espera el backend
      formDataToSend.append('name', formData.nombre);
      formDataToSend.append('fecha_ingreso', formData.fechaEntrada);
      formDataToSend.append('rfc', formData.rfc);
      formDataToSend.append('visa', formData.visa);
      formDataToSend.append('phone_mex', formData.phone_mex);
      formDataToSend.append('phone_usa', formData.phone_usa);

      // Enviar al backend
      const response = await fetch(`${apiHost}/drivers.php`, {
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

  const enviarDocumentos = async (idConductor) => {
    const entries = Object.entries(documentos); // clave: nombre campo, valor: { file, vencimiento }

    for (const [tipo_documento, { file, vencimiento }] of entries) {
      const formDataFile = new FormData();
      formDataFile.append('op', 'Alta');
      formDataFile.append('driver_id', idConductor);
      formDataFile.append('tipo_documento', tipo_documento);
      formDataFile.append('fecha_vencimiento', vencimiento);
      formDataFile.append('documento', file);

      try {
        const response = await fetch(`${apiHost}/drivers_docs.php`, {
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
    let timerInterval;
    const start = Date.now();

    Swal.fire({
      title: 'Procesando…',
      html: 'Tiempo transcurrido: <b>0</b> ms',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
        const b = Swal.getPopup().querySelector('b');
        timerInterval = setInterval(() => {
          b.textContent = `${Date.now() - start}`;
        }, 100);
      },
      willClose: () => clearInterval(timerInterval),
    });

    try {
      const idConductor = await envioDatosPrincipal();
      if (!idConductor) throw new Error('No se obtuvo el ID del conductor');

      await enviarDocumentos(idConductor);

      Swal.close();

      await Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Driver added successfully!',
      });

      setFormData({
        nombre: '',
        fechaEntrada: '',
        rfc: '',
        phone_usa: '',
        phone_mex: '',
        visa: '',
      });
      setDocumentos({});
    } catch (err) {

      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err?.message || 'An error occurred while saving.',
      });
    }
  };




  const cancelar = () => {
    setFormData({
      nombre: '',
      fechaEntrada: '',
      rfc: '',
      phone_usa: '',
      phone_mex: '',
      visa: ''
    });

    setDocumentos({});

  }

  return (

    <div >

      <h1 className="titulo">Driver Registration</h1>
      <div className="conductores-container">
        <div className="btnConteiner">
          <button className="btn cancelar" onClick={cancelar}> Cancel</button>
          <button className="btn guardar" onClick={handleSubmit}>Save</button>
        </div>

        <div className="form-columns">
          {/* Puedes continuar con las otras dos columnas como en tu versión original */}
          <div className="column">
            <label>Name of Driver</label>
            <input
              type="text"
              placeholder="Full name"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
            />

            <label>Entry Date</label>
            <input
              type="date"
              value={formData.fechaEntrada}
              onChange={(e) => handleInputChange('fechaEntrada', e.target.value)}
            />
            <label>INE</label>
            <button type="button" onClick={() => abrirModal('INE')}>Upload Document</button>
            {documentos.INE && (
              <p>{documentos.INE.fileName} - {documentos.INE.vencimiento}</p>
            )}
            <label>Birth Certificate (PDF)</label>
            <button type="button" onClick={() => abrirModal('Acta_Nacimiento')}>Upload Document</button>
            {documentos.Acta_Nacimiento && (
              <p>{documentos.Acta_Nacimiento.fileName} - {documentos.Acta_Nacimiento.vencimiento}</p>
            )}


            <label>CURP (PDF)</label>
            <button type="button" onClick={() => abrirModal('CURP')}>Upload Document</button>
            {documentos.CURP && (
              <p>{documentos.CURP.fileName} - {documentos.CURP.vencimiento}</p>
            )}

            <label>Proof of Address (PDF)</label>
            <button type="button" onClick={() => abrirModal('Comprobante_domicilio')}>Upload Document</button>
            {documentos.Comprobante_domicilio && (
              <p>{documentos.Comprobante_domicilio.fileName} - {documentos.Comprobante_domicilio.vencimiento}</p>
            )}

            <label>Tax Status (PDF)</label>
            <button type="button" onClick={() => abrirModal('Constancia')}>Upload Document</button>
            {documentos.Constancia && (
              <p>{documentos.Constancia.fileName} - {documentos.Constancia.vencimiento}</p>
            )}

            <label>RFC </label>
            <input
              type="text"
              placeholder="RFC"
              value={formData.rfc}
              onChange={(e) => handleInputChange('rfc', e.target.value)}
            />


          </div>

          {/* Puedes continuar con las otras dos columnas como en tu versión original */}
          <div className="column">

            <label>Visa</label>
            <button type="button" onClick={() => abrirModal('Visa')}>Upload Document</button>
            {documentos.Visa && (
              <p>{documentos.Visa.fileName} - {documentos.Visa.vencimiento}</p>
            )}

            <label>Visa Number</label>
            <input
              type="text"
              placeholder="Enter visa number"
              value={formData.visa}
              onChange={(e) => handleInputChange('visa', e.target.value)}
            />


            <label>I-94 (PDF)</label>
            <button type="button" onClick={() => abrirModal('I')}>Upload Document</button>
            {documentos.I && (
              <p>{documentos.I.fileName} - {documentos.I.vencimiento}</p>
            )}


          </div>


          {/* Puedes continuar con las otras dos columnas como en tu versión original */}
          <div className="column">
            <label>Job Application (PDF)</label>
            <button type="button" onClick={() => abrirModal('Solicitud_empleo')}>Upload Document</button>
            {documentos.Solicitud_empleo && (
              <p>{documentos.Solicitud_empleo.fileName} - {documentos.Solicitud_empleo.vencimiento}</p>
            )}

            <label>Licenses (PDF)</label>
            <button type="button" onClick={() => abrirModal('Licencia')}>Upload Document</button>
            {documentos.Licencia && (
              <p>{documentos.Licencia.fileName} - {documentos.Licencia.vencimiento}</p>
            )}

            <label>APTO Medico(PDF)</label>
            <button type="button" onClick={() => abrirModal('APTO')}>Upload Document</button>
            {documentos.APTO && (
              <p>{documentos.APTO.fileName} - {documentos.APTO.vencimiento}</p>
            )}

            <label>Antidoping</label>
            <button type="button" onClick={() => abrirModal('Atidoping')}>Upload Document</button>
            {documentos.Atidoping && (
              <p>{documentos.Atidoping.fileName} - {documentos.Atidoping.vencimiento}</p>
            )}

            <label>Numero celular USA</label>
            <input
              type="Text"
              placeholder="Ingresar numero Americano"
              value={formData.phone_usa}
              onChange={(e) => handleInputChange('phone_usa', e.target.value)}
            />

            <label>Phone Number MEX </label>
            <input
              type="Text"
              placeholder="Enter Mexican phone number"
              value={formData.phone_mex}
              onChange={(e) => handleInputChange('phone_mex', e.target.value)}
            />

          </div>


        </div>
        <ModalArchivo
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          onSave={(data) => handleGuardarDocumento(campoActual, data)}
          nombreCampo={campoActual}
          valorActual={documentos[campoActual]}
          mostrarFechaVencimiento={mostrarFechaVencimientoModal}
        />
      </div>
    </div>
  );

};

export default DriverScreen;
