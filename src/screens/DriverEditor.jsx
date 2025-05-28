import React, { useState, useEffect } from 'react';
import './css/ConductoresScreen.css';
import 'react-datepicker/dist/react-datepicker.css';
import ModalArchivo from '../components/ModalArchivo.jsx'; 
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
const TrailerEdit = () => {
  const { id } = useParams();
  
  const apiHost = import.meta.env.VITE_API_HOST;

  const [formData, setFormData] = useState({
    nombre: '',
    fechaNacimiento: '',
    curp: '',
    rfc: '',
    phone_usa: '',
    phone_mex: ''
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
      formDataToSend.append('curp', formData.curp);
      formDataToSend.append('rfc', formData.rfc);
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
        Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: 'Driver editado con exito!',
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
        curp: '',
        rfc: '',
        phone_usa: '',
        phone_mex: ''
      });

      setDocumentos({});

    }
  };

  useEffect(() => {
      const fetchDrivers = async () => {

          const formDataToSend = new FormData();

       
          formDataToSend.append('op', 'getDriverEdit'); // operación que espera el backend
          formDataToSend.append('driver_id', id);
   
        try {
          const response = await fetch(`${apiHost}/drivers.php`, {
            method: 'POST',
            body: formDataToSend,
          });
  
          const data = await response.json();
          
          if (data.status === 'success' && data.Users && data.Users.length > 0) {
              const user = data.Users[0];

              // Llenar los inputs
              setFormData({
                nombre: user.nombre || '',
                fechaNacimiento: user.fecha_ingreso || '',
                curp: user.curp || '',
                rfc: user.rfc || '',
                phone_usa: user.phone_usa || '',
                phone_mex: user.phone_mex || ''
              });
              console.log(data.Users);

              // Llenar los documentos (PDFs)
              const nuevosDocumentos = {};
              const campos = [
                'Acta_Nacimiento',
                'Comprobante_domicilio',
                'Solicitud_empleo',
                'INE',
                'VISA',
                'Licencia',
                'I94',
                'APTO',
                'Atidoping',
                'Constancia_fiscal'
              ];

              campos.forEach((campo) => {
                if (user[`${campo}_URL`]) {
                  nuevosDocumentos[campo] = {
                    file: null, // No tienes el archivo como File, pero puedes dejarlo nulo
                    fileName: user[`${campo}_URL`].split('/').pop(),
                    vencimiento: user[`${campo}_fecha`] || '',
                    url: `${apiHost}/${user[`${campo}_URL`]}`
                  };
                }
              });

              setDocumentos(nuevosDocumentos);
            }

        } catch (error) {
          console.error('Error al obtener los conductores:', error);
        }
      };
  
      fetchDrivers();
    }, []);


  return (

    <div >

      <h1 className="titulo">Editor de Conductor</h1>
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

            <label>Acta de nacimiento (PDF)</label>
            <button type="button" onClick={() => abrirModal('Acta_Nacimiento')}>Subir documento</button>
           {documentos.Acta_Nacimiento && (
              <p>
                {documentos.Acta_Nacimiento.fileName} - {documentos.Acta_Nacimiento.vencimiento}
                <button onClick={() => window.open(documentos.Acta_Nacimiento.url, '_blank')}>Ver</button>
              </p>
            )}

            <label>Curp </label>
            <input
              type="text"
              placeholder="Ingrese el curp"
              value={formData.curp}
              onChange={(e) => handleInputChange('curp', e.target.value)}
            />

            <label>Comprobante de domicilio (PDF)</label>
            <button type="button" onClick={() => abrirModal('Comprobante_domicilio')}>Subir documento</button>
            {documentos.Comprobante_domicilio && (
                <p>
                  {documentos.Comprobante_domicilio.fileName} - {documentos.Comprobante_domicilio.vencimiento}
                  <button onClick={() => window.open(documentos.Comprobante_domicilio.url, '_blank')}>Ver</button>
                </p>
              )}

            <label>Solicitud de empleo (PDF)</label>
            <button type="button" onClick={() => abrirModal('Solicitud_empleo')}>Subir documento</button>
            {documentos.Solicitud_empleo && (
                <p>
                  {documentos.Solicitud_empleo.fileName} - {documentos.Solicitud_empleo.vencimiento}
                  <button onClick={() => window.open(documentos.Solicitud_empleo.url, '_blank')}>Ver</button>
                </p>
              )}
          </div>

          {/* Puedes continuar con las otras dos columnas como en tu versión original */}
          <div className="column">
            <label>INE</label>
            <button type="button" onClick={() => abrirModal('INE')}>Subir documento</button>
            {documentos.INE && (
              <p>
                {documentos.INE.fileName} - {documentos.INE.vencimiento}
                <button onClick={() => window.open(documentos.INE.url, '_blank')}>Ver</button>
              </p>
            )}

            <label>No de visa</label>
            <button type="button" onClick={() => abrirModal('Visa')}>Subir documento</button>
            {documentos.VISA && (
              <p>
                {documentos.VISA.fileName} - {documentos.VISA.vencimiento}
                <button onClick={() => window.open(documentos.VISA.url, '_blank')}>Ver</button>
              </p>
            )}

            <label>RFC </label>
            <input
              type="text"
              placeholder="RFC"
              value={formData.rfc}
              onChange={(e) => handleInputChange('rfc', e.target.value)}
            />
            <label>No. Licencia (PDF)</label>
            <button type="button" onClick={() => abrirModal('Licencia')}>Subir documento</button>
            {documentos.Licencia && (
                <p>
                  {documentos.Licencia.fileName} - {documentos.Licencia.vencimiento}
                  <button onClick={() => window.open(documentos.Licencia.url, '_blank')}>Ver</button>
                </p>
              )}

            <label>Vencimiento de I-94 (PDF)</label>
            <button type="button" onClick={() => abrirModal('I')}>Subir documento</button>
            {documentos.I && (
              <p>
                {documentos.I.fileName} - {documentos.I.vencimiento}
                <button onClick={() => window.open(documentos.I.url, '_blank')}>Ver</button>
              </p>
            )}

            <label>APTO (PDF)</label>
            <button type="button" onClick={() => abrirModal('APTO')}>Subir documento</button>
            {documentos.APTO && (
              <p>
                {documentos.APTO.fileName} - {documentos.APTO.vencimiento}
                <button onClick={() => window.open(documentos.APTO.url, '_blank')}>Ver</button>
              </p>
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

            <label>Numero celular MEX (PDF)</label>
            <input
              type="number"
              placeholder="Ingresar numero Mexicano"
              value={formData.phone_mex}
              onChange={(e) => handleInputChange('phone_mex', e.target.value)}
            />

            <label>Constancia de situacion fiscal (PDF)</label>
            <button type="button" onClick={() => abrirModal('Constancia_fiscal')}>Subir documento</button>
            {documentos.Constancia_fiscal && (
              <p>{documentos.Constancia_fiscal.fileName} - {documentos.Constancia_fiscal.vencimiento}</p>
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
