import React, { useState, useEffect } from 'react';
import './css/ConductoresScreen.css';
import 'react-datepicker/dist/react-datepicker.css';
import ModalArchivo from '../components/ModalArchivo.jsx'; 
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

const DriverEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
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
  const [mostrarFechaVencimientoModal, setMostrarFechaVencimientoModal] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [campoActual, setCampoActual] = useState(null);
  const [originalFormData, setOriginalFormData] = useState(null);
   const [originalDocumentos, setOriginalDocumentos] = useState({});

  



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
    formDataToSend.append('op', 'editDriver'); // o 'Editar' como lo uses tú
    formDataToSend.append('driver_id', id); // importante incluirlo

    // Compara campo por campo
    if (formData.nombre !== originalFormData.nombre) {
      formDataToSend.append('nombre', formData.nombre);
    }

    if (formData.fechaNacimiento !== originalFormData.fechaNacimiento) {
      formDataToSend.append('fecha', formData.fechaNacimiento);
    }

    if (formData.curp !== originalFormData.curp) {
      formDataToSend.append('curp', formData.curp);
    }

    if (formData.rfc !== originalFormData.rfc) {
      formDataToSend.append('rfc', formData.rfc);
    }

    if (formData.phone_mex !== originalFormData.phone_mex) {
      formDataToSend.append('phone_mex', formData.phone_mex);
    }

    if (formData.phone_usa !== originalFormData.phone_usa) {
      formDataToSend.append('phone_usa', formData.phone_usa);
    }

    if (formData.fechaEntrada !== originalFormData.fechaEntrada) {
      formDataToSend.append('fecha_ingreso', formData.fechaEntrada);
    }

    if (formData.visa !== originalFormData.visa) {
      formDataToSend.append('visa', formData.visa);
    }

    if (formData.licencia !== originalFormData.licencia) {
      formDataToSend.append('licencia', formData.licencia);
    }


    // Si no hay cambios, evita enviar la solicitud
    if (formDataToSend.entries().next().done) {
      Swal.fire({
        icon: 'info',
        title: 'Sin cambios',
        text: 'No se detectaron cambios en los campos',
      });
      return null;
    }

    const response = await fetch(`${apiHost}/drivers.php`, {
      method: 'POST',
      body: formDataToSend,
    });

    const result = await response.json();


    if (result.status === "success") {
      return id; // usamos el id actual
    } else {
      throw new Error("Error al guardar datos básicos");
    }
  } catch (error) {
    console.error('Error al enviar los datos:', error);
    alert('Error al conectar con el servidor');
  }
};

const enviarDocumentos = async (idConductor) => {
  const entries = Object.entries(documentos);

  for (const [tipo_documento, { file, vencimiento }] of entries) {
    const original = originalDocumentos[tipo_documento];

    const hayNuevoArchivo = !!file;
    const vencimientoCambio = original?.vencimiento !== vencimiento;

    if (!hayNuevoArchivo && !vencimientoCambio) continue; 

    const formDataFile = new FormData();
    formDataFile.append('op', 'Alta'); // o 'Actualizar'
    formDataFile.append('driver_id', idConductor);
    formDataFile.append('tipo_documento', tipo_documento);
    formDataFile.append('fecha_vencimiento', vencimiento);
    if (hayNuevoArchivo) formDataFile.append('documento', file);

    try {
      const response = await fetch(`${apiHost}/drivers_docs.php`, {
        method: 'POST',
        body: formDataFile,
      });

      const result = await response.json();


       const { isConfirmed } = await Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: `Documento ${tipo_documento} actualizado`,
      showCancelButton: false,
      confirmButtonText: 'Aceptar'
    });

      if (!isConfirmed){
          window.location.reload();
      }return;

    } catch (error) {
      console.error(`Error al enviar ${tipo_documento}:`, error);
    }
  }
};

const handleSubmit = async () => {
  const cambios = [];

  if (formData.nombre !== originalFormData.nombre) cambios.push('Nombre');
  if (formData.fechaNacimiento !== originalFormData.fechaNacimiento) cambios.push('Fecha de nacimiento');
  if (formData.curp !== originalFormData.curp) cambios.push('CURP');
  if (formData.rfc !== originalFormData.rfc) cambios.push('RFC');
  if (formData.phone_usa !== originalFormData.phone_usa) cambios.push('Teléfono USA');
  if (formData.phone_mex !== originalFormData.phone_mex) cambios.push('Teléfono MEX');
  if (formData.fechaEntrada !== originalFormData.fechaEntrada) cambios.push('Fecha de entrada');
  if (formData.visa !== originalFormData.visa) cambios.push('Visa');
  if (formData.licencia !== originalFormData.licencia) cambios.push('Licencia');


  // Detectar cambios en los documentos
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

  if (cambios.length === 0 && !hayCambiosEnDocumentos) {
    Swal.fire({
      icon: 'info',
      title: 'Sin cambios',
      text: 'No se detectaron cambios en campos ni documentos',
    });
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

  let idConductor = id;

  // Solo hacemos el envío de datos si hay cambios en los campos
  if (cambios.some(c => !c.startsWith('Documento'))) {
    const resultado = await envioDatosPrincipal();

 
    const { isConfirmed } = await Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: `Datos actualizados`,
      showCancelButton: false,
      confirmButtonText: 'Aceptar'
    });

      if (!isConfirmed){
          window.location.reload();
      }return;
  
  }

  // Enviar documentos aunque no haya cambios de texto
  if (hayCambiosEnDocumentos) {
    await enviarDocumentos(idConductor);
  }

};



  const fetchDrivers = async () => {
  const formDataToSend = new FormData();
  formDataToSend.append('op', 'getDriverEdit');
  formDataToSend.append('driver_id', id);

  try {
    const response = await fetch(`${apiHost}/drivers.php`, {
      method: 'POST',
      body: formDataToSend,
    });

    const data = await response.json();
    
    if (data.status === 'success' && data.Users && data.Users.length > 0) {
      const user = data.Users[0];
      const formValues = {
        nombre: user.nombre || '',
        fechaNacimiento: user.fecha_nacimiento || '',
        fechaEntrada: user.fecha_ingreso || '',
        curp: user.curp || '',
        rfc: user.rfc || '',
        phone_usa: user.phone_usa || '',
        phone_mex: user.phone_mex || '',
        visa: user.visa || '',
        licencia: user.licencia || ''
      };

      setOriginalFormData(formValues);
      setFormData(formValues);

      const nuevosDocumentos = {};
      const campos = [
        'Acta_Nacimiento', 'CURP', 'RFC', 'Comprobante_domicilio', 'Solicitud_empleo', 'INE', 'Visa', 'Licencia',
        'I', 'APTO', 'Atidoping', 'Constancia'
      ];

      campos.forEach((campo) => {
        if (user[`${campo}_URL`]) {
          nuevosDocumentos[campo] = {
            file: null,
            fileName: user[`${campo}_URL`].split('/').pop(),
            vencimiento: user[`${campo}_fecha`] || '',
            url: `${apiHost}/${user[`${campo}_URL`]}`,
          };
        }
      });

      setDocumentos(nuevosDocumentos);
      setOriginalDocumentos(nuevosDocumentos);
    }

  } catch (error) {
    console.error('Error al obtener los conductores:', error);
  }
};

useEffect(() => {
  fetchDrivers();
}, []);

  const cancelar = () =>{
    setFormData({
      nombre: '',
      fechaEntrada: '',
      rfc: '',
      phone_usa: '',
      phone_mex: '',
      visa: ''
    });

    setDocumentos({});
    navigate(`/admin-drivers`)
  }

  return (

   <div >

      <h1 className="titulo">Editor de Conductor</h1>
      <div className="conductores-container">
        <div className="btnConteiner">
          <button className="btn cancelar"onClick={cancelar}> Cancelar</button>
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

            <label>Fecha de entrada</label>
            <input
              type="date"
              value={formData.fechaEntrada}
              onChange={(e) => handleInputChange('fechaEntrada', e.target.value)}
            />
            <label>INE</label>
            <button type="button" onClick={() => abrirModal('INE')}>Subir documento</button>
            {documentos.INE && (
              <p>{documentos.INE.fileName} - {documentos.INE.vencimiento}</p>
            )}
            <label>Acta de nacimiento (PDF)</label>
            <button type="button" onClick={() => abrirModal('Acta_Nacimiento')}>Subir documento</button>
            {documentos.Acta_Nacimiento && (
              <p>{documentos.Acta_Nacimiento.fileName} - {documentos.Acta_Nacimiento.vencimiento}</p>
            )}

           
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

                <label>Constancia de situacio fiscal (PDF)</label>
            <button type="button" onClick={() => abrirModal('Constancia')}>Subir documento</button>
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
            <button type="button" onClick={() => abrirModal('Visa')}>Subir documento</button>
            {documentos.Visa && (
              <p>{documentos.Visa.fileName} - {documentos.Visa.vencimiento}</p>
            )}

            <label>No. Visa</label>
            <input
              type="text"
              placeholder="Ingrese el numero de visa"
              value={formData.visa}
              onChange={(e) => handleInputChange('visa', e.target.value)}
            />

            
            <label>I-94 (PDF)</label>
            <button type="button" onClick={() => abrirModal('I')}>Subir documento</button>
            {documentos.I && (
              <p>{documentos.I.fileName} - {documentos.I.vencimiento}</p>
            )}

          
          </div>


          {/* Puedes continuar con las otras dos columnas como en tu versión original */}
          <div className="column">
            <label>Solicitud de empleo (PDF)</label>
            <button type="button" onClick={() => abrirModal('Solicitud_empleo')}>Subir documento</button>
            {documentos.Solicitud_empleo && (
              <p>{documentos.Solicitud_empleo.fileName} - {documentos.Solicitud_empleo.vencimiento}</p>
            )}

              <label>Licencia (PDF)</label>
            <button type="button" onClick={() => abrirModal('Licencia')}>Subir documento</button>
            {documentos.Licencia && (
              <p>{documentos.Licencia.fileName} - {documentos.Licencia.vencimiento}</p>
            )}
            
              <label>APTO Medico(PDF)</label>
            <button type="button" onClick={() => abrirModal('APTO')}>Subir documento</button>
            {documentos.APTO && (
              <p>{documentos.APTO.fileName} - {documentos.APTO.vencimiento}</p>
            )}
            
            <label>Atidoping</label>
            <button type="button" onClick={() => abrirModal('Atidoping')}>Subir documento</button>
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

            <label>Numero celular MEX </label>
            <input
              type="Text"
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
          mostrarFechaVencimiento={mostrarFechaVencimientoModal}
        />
      </div>
    </div>
  );

};

export default DriverEdit;
