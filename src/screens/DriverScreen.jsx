import React, { useState } from 'react';
import './css/ConductoresScreen.css';
import 'react-datepicker/dist/react-datepicker.css';
import ModalArchivo from '../components/ModalArchivo.jsx'; // ajusta la ruta si es necesario
import Swal from 'sweetalert2';


const DriverScreen = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [formData, setFormData] = useState({
    nombre: '',
    fechaNacimiento: '',
    fechaEntrada: '',
    curp: '',
    rfc: '',
    phone_usa: '',
    phone_mex: '',
    visa: '',
    licencia: ''
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
    console.log(formData);
    try {
      const formDataToSend = new FormData();

      // Aquí añadimos solo campos de texto (no archivos)
      formDataToSend.append('op', 'Alta'); // operación que espera el backend
      formDataToSend.append('name', formData.nombre);
      formDataToSend.append('fecha', formData.fechaNacimiento);
      formDataToSend.append('fechaEntrada', formData.fechaEntrada); 
      formDataToSend.append('curp', formData.curp);
      formDataToSend.append('rfc', formData.rfc);
      formDataToSend.append('phone_mex', formData.phone_mex);
      formDataToSend.append('phone_usa', formData.phone_usa);
      formDataToSend.append('visa', formData.visa);
      formDataToSend.append('licencia', formData.licencia);

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
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Todos los documentos fueron enviados correctamente',
        });
      } catch (error) {
        console.error(`Error al enviar ${tipo_documento}:`, error);
      }
      
    }
  };
  const handleSubmit = async () => {
    const idConductor = await envioDatosPrincipal();

    if (idConductor) {
      await enviarDocumentos(idConductor);

     setFormData({
      nombre: '',
      fechaNacimiento: '',
      fechaEntrada: '',
      curp: '',
      rfc: '',
      phone_usa: '',
      phone_mex: '',
      visa: '',
      licencia: ''
    });


      setDocumentos({});

    }
  };


  return (

    <div >

      <h1 className="titulo">Alta de Conductor</h1>
      <div className="conductores-container">
        <div className="btnConteiner">
          <button className="btn cancelar">Cancelar</button>
          <button className="btn guardar" onClick={handleSubmit}>Guardar</button>
        </div>

        <div className="form-columns">
          {/* Puedes continuar con las otras dos columnas como en tu versión original */}
          <div className="column">
            <label>Nombre de conductor</label>
            <input
              type="text"
              placeholder="Nombre y apellidos"
              value={formData.nombre}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
            />

            <label>Fecha de nacimiento</label>
            <input
              type="date"
              value={formData.fechaNacimiento}
              onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
            />

            <label>Fecha de entrada</label>
            <input
              type="date"
              value={formData.fechaEntrada}
              onChange={(e) => handleInputChange('fechaEntrada', e.target.value)}
            />

            <label>Acta de nacimiento (PDF)</label>
            <button type="button" onClick={() => abrirModal('Acta_Nacimiento')}>Subir documento</button>
            {documentos.Acta_Nacimiento && (
              <p>{documentos.Acta_Nacimiento.fileName} - {documentos.Acta_Nacimiento.vencimiento}</p>
            )}

            <label>Curp </label>
            <input
              type="text"
              placeholder="Ingrese el curp"
              value={formData.curp}
              onChange={(e) => handleInputChange('curp', e.target.value)}
            />
             <label>CURP (PDF)</label>
            <button type="button" onClick={() => abrirModal('CURP')}>Subir documento</button>
            {documentos.CURP && (
              <p>{documentos.CURP.fileName} - {documentos.CURP.vencimiento}</p>
            )}

            <label>Comprobante de domicilio (PDF)</label>
            <button type="button" onClick={() => abrirModal('Comprobante_domicilio')}>Subir documento</button>
            {documentos.Comprobante_domicilio && (
              <p>{documentos.Comprobante_domicilio.fileName} - {documentos.Comprobante_domicilio.vencimiento}</p>
            )}

            <label>Solicitud de empleo (PDF)</label>
            <button type="button" onClick={() => abrirModal('Solicitud_empleo')}>Subir documento</button>
            {documentos.Solicitud_empleo && (
              <p>{documentos.Solicitud_empleo.fileName} - {documentos.Solicitud_empleo.vencimiento}</p>
            )}
          </div>

          {/* Puedes continuar con las otras dos columnas como en tu versión original */}
          <div className="column">
            <label>INE</label>
            <button type="button" onClick={() => abrirModal('INE')}>Subir documento</button>
            {documentos.INE && (
              <p>{documentos.INE.fileName} - {documentos.INE.vencimiento}</p>
            )}

            <label>No. de VISA</label>
            <input
              type="text"
              placeholder="Ingrese el numero de visa"
              value={formData.visa}
              onChange={(e) => handleInputChange('visa', e.target.value)}
            />

            <label>No de visa</label>
            <button type="button" onClick={() => abrirModal('Visa')}>Subir documento</button>
            {documentos.Visa && (
              <p>{documentos.Visa.fileName} - {documentos.Visa.vencimiento}</p>
            )}

            <label>RFC </label>
            <input
              type="text"
              placeholder="RFC"
              value={formData.rfc}
              onChange={(e) => handleInputChange('rfc', e.target.value)}
            />

            <label>No. de licencia</label>
            <input
              type="text"
              placeholder="No de licencia"
              value={formData.licencia}
              onChange={(e) => handleInputChange('licencia', e.target.value)}
            />
            
            <label>Licencia (PDF)</label>
            <button type="button" onClick={() => abrirModal('Licencia')}>Subir documento</button>
            {documentos.Licencia && (
              <p>{documentos.Licencia.fileName} - {documentos.Licencia.vencimiento}</p>
            )}

            <label>Vencimiento de I-94 (PDF)</label>
            <button type="button" onClick={() => abrirModal('I')}>Subir documento</button>
            {documentos.I && (
              <p>{documentos.I.fileName} - {documentos.I.vencimiento}</p>
            )}

            <label>APTO (PDF)</label>
            <button type="button" onClick={() => abrirModal('APTO')}>Subir documento</button>
            {documentos.APTO && (
              <p>{documentos.APTO.fileName} - {documentos.APTO.vencimiento}</p>
            )}
          </div>


          {/* Puedes continuar con las otras dos columnas como en tu versión original */}
          <div className="column">
            <label>Atidoping</label>
            <button type="button" onClick={() => abrirModal('Atidoping')}>Subir documento</button>
            {documentos.Atidoping && (
              <p>{documentos.Atidoping.fileName} - {documentos.Atidoping.vencimiento}</p>
            )}

            <label>Numero celular USA</label>
            <input
              type="number"
              placeholder="Ingresar numero Americano"
              value={formData.phone_usa}
              onChange={(e) => handleInputChange('phone_usa', e.target.value)}
            />

            <label>Numero celular MEX </label>
            <input
              type="number"
              placeholder="Ingresar numero Mexicano"
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
        />
      </div>
    </div>
  );

};

export default DriverScreen;
