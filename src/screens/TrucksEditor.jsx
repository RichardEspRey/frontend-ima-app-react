import React, { useState, useEffect } from 'react';
import './css/ConductoresScreen.css';
import 'react-datepicker/dist/react-datepicker.css';
import ModalArchivo from '../components/ModalArchivo.jsx';
import Swal from 'sweetalert2';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const TruckScreen = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const apiHost = import.meta.env.VITE_API_HOST;

  const [formData, setFormData] = useState({
    unidad: '',
    PlacaMX: '',
    PlacaEUA: '',
    Modelo: '',
    Marca: '',
    Numero: ''
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
      formDataToSend.append('op', 'editTruck');
      formDataToSend.append('truck_id', id);

      if (formData.unidad !== originalFormData.unidad) formDataToSend.append('unidad', formData.unidad);
      if (formData.PlacaMX !== originalFormData.PlacaMX) formDataToSend.append('Placa_MEX', formData.PlacaMX);
      if (formData.PlacaEUA !== originalFormData.PlacaEUA) formDataToSend.append('Placa_EUA', formData.PlacaEUA);
      if (formData.Modelo !== originalFormData.Modelo) formDataToSend.append('Modelo', formData.Modelo);
      if (formData.Marca !== originalFormData.Marca) formDataToSend.append('Marca_camion', formData.Marca);
      if (formData.Numero !== originalFormData.Numero) formDataToSend.append('Numero_VIN', formData.Numero);

      if (formDataToSend.entries().next().done) {
        Swal.fire({ icon: 'info', title: 'Sin cambios', text: 'No se detectaron cambios' });
        return null;
      }

      const response = await fetch(`${apiHost}/trucks.php`, { method: 'POST', body: formDataToSend });
      const result = await response.json();
      if (result.status === 'success') return id;
      throw new Error('Error al guardar datos');
    } catch (error) {
      console.error('Error:', error);
      alert('Error al conectar con el servidor');
    }
  };

  const enviarDocumentos = async (truck_id) => {
    for (const [tipo_documento, { file, vencimiento }] of Object.entries(documentos)) {
      const original = originalDocumentos[tipo_documento];
      const hayNuevoArchivo = !!file;
      const vencimientoCambio = original?.vencimiento !== vencimiento;

      if (!hayNuevoArchivo && !vencimientoCambio) continue;

      const formDataFile = new FormData();
      formDataFile.append('op', 'Alta');
      formDataFile.append('truck_id', truck_id);
      formDataFile.append('tipo_documento', tipo_documento);
      formDataFile.append('fecha_vencimiento', vencimiento);
      if (hayNuevoArchivo) formDataFile.append('documento', file);

      try {
        const response = await fetch(`${apiHost}/trucks_docs.php`, { method: 'POST', body: formDataFile });
        const result = await response.json();
        const { isConfirmed } = await Swal.fire({
          icon: 'success',
          title: 'Éxito',
          text: `Documento ${tipo_documento} actualizado`,
          confirmButtonText: 'Aceptar'
        });
        if (!isConfirmed) window.location.reload();
        return;
      } catch (error) {
        console.error(`Error al enviar ${tipo_documento}:`, error);
      }
    }
  };

  const handleSubmit = async () => {
    const cambios = [];
    if (formData.unidad !== originalFormData.unidad) cambios.push('unidad');
    if (formData.PlacaMX !== originalFormData.PlacaMX) cambios.push('Placa MEX');
    if (formData.PlacaEUA !== originalFormData.PlacaEUA) cambios.push('Placa EUA');
    if (formData.Modelo !== originalFormData.Modelo) cambios.push('Modelo');
    if (formData.Marca !== originalFormData.Marca) cambios.push('Marca');
    if (formData.Numero !== originalFormData.Numero) cambios.push('Número VIN');

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

    let truckId = id;
    if (cambios.some(c => !c.startsWith('Documento'))) {
      const resultado = await envioDatosPrincipal();
      if (!resultado) return;
      truckId = resultado;
      const { isConfirmed: confirmedReload } = await Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: `Datos actualizados`,
        confirmButtonText: 'Aceptar'
      });
      if (!confirmedReload) window.location.reload();
      return;
    }

    if (hayCambiosEnDocumentos) {
      await enviarDocumentos(truckId);
    }
  };

  const fetchtrucks = async () => {
    const formDataToSend = new FormData();
    formDataToSend.append('op', 'getTruckEdit');
    formDataToSend.append('truck_id', id);

    try {
      const response = await fetch(`${apiHost}/trucks.php`, { method: 'POST', body: formDataToSend });
      const data = await response.json();

      if (data.status === 'success' && data.Users.length > 0) {
        const truck = data.Users[0];
        const formValues = {
          unidad: truck.unidad || '',
          PlacaMX: truck.Placa_MEX || '',
          PlacaEUA: truck.Placa_EUA || '',
          Modelo: truck.Modelo || '',
          Marca: truck.Marca_camion || '',
          Numero: truck.Numero_VIN || ''
        };
        setFormData(formValues);
        setOriginalFormData(formValues);
        const camposDoc = ['Placamx', 'Placausa', 'Vin', 'Registracion', 'Carta', 'CAB', 'DTOP', 'PERMISO_NY', 'PERMISO_NM', 'Mecanica', 'Circulacion', 'VERIFICACIONES', 'UCR', 'kentucky'];
        const nuevosDocumentos = {};

        camposDoc.forEach((campo) => {
          if (truck[`${campo}_URL`]) {
            nuevosDocumentos[campo] = {
              file: null,
              fileName: truck[`${campo}_URL`].split('/').pop(),
              vencimiento: truck[`${campo}_fecha`] || '',
              url: `${apiHost}/${truck[`${campo}_URL`]}`,
            };
          }
        });

        setDocumentos(nuevosDocumentos);
        setOriginalDocumentos(nuevosDocumentos);
      }
    } catch (error) {
      console.error('Error al obtener el camión:', error);
    }
  };

  useEffect(() => {
    fetchtrucks();
  }, []);

  const cancelar = () =>{
   
    navigate(`/admin-trucks`)
  }

  return (

    <div >

      <h1 className="titulo">Editor de Camion</h1>
      <div className="conductores-container">
        <div className="btnConteiner">
          <button className="btn cancelar" onClick={cancelar}>Cancelar</button>
          <button className="btn guardar" onClick={handleSubmit}>Guardar</button>
        </div>

        <div className="form-columns">
             {/* Columna 1 */}
          <div className="column">
            <label>Unidad</label>
            <input
              type="text"
              placeholder="Unidad"
              value={formData.unidad}
              onChange={(e) => handleInputChange('unidad', e.target.value)}
            />

            <label>Placa MEX</label>
            <input
              type="text"
              placeholder="Placa MEX"
              value={formData.PlacaMX}
              onChange={(e) => handleInputChange('PlacaMX', e.target.value)}
            />

            <label>Placa EUA</label>
            <input
              type="text"
              placeholder="Placa EUA"
              value={formData.PlacaEUA}
              onChange={(e) => handleInputChange('PlacaEUA', e.target.value)}
            />

            <label>Modelo (Año)</label>
            <input
              type="text"
              placeholder="Modelo"
              value={formData.Modelo}
              onChange={(e) => handleInputChange('Modelo', e.target.value)}
            />

            <label>Marca de camion</label>
            <input
              type="text"
              placeholder="Marca de camion"
              value={formData.Marca}
              onChange={(e) => handleInputChange('Marca', e.target.value)}
            />

            <label>Numero de VIN</label>
            <input
              type="text"
              placeholder="Numero"
              value={formData.Numero}
              onChange={(e) => handleInputChange('Numero', e.target.value)}
            />
          </div>

          {/* Columna 2 */}
          <div className="column">
            <label>Placa MEX</label>
            <button type="button" onClick={() => abrirModal('Placamx')}>Subir documento</button>
            {documentos.Placamx && (
              <p>{documentos.Placamx.fileName} - {documentos.Placamx.vencimiento}</p>
            )}

            <label>Placa USA</label>
            <button type="button" onClick={() => abrirModal('Placausa')}>Subir documento</button>
            {documentos.Placausa && (
              <p>{documentos.Placausa.fileName} - {documentos.Placausa.vencimiento}</p>
            )}

            <label>Numero de vin</label>
            <button type="button" onClick={() => abrirModal('Vin')}>Subir documento</button>
            {documentos.Vin && (
              <p>{documentos.Vin.fileName} - {documentos.Vin.vencimiento}</p>
            )}

            <label>Registracion</label>
            <button type="button" onClick={() => abrirModal('Registracion')}>Subir documento</button>
            {documentos.Registracion && (
              <p>{documentos.Registracion.fileName} - {documentos.Registracion.vencimiento}</p>
            )}

            <label>Carta seguro (PDF)</label>
            <button type="button" onClick={() => abrirModal('seguro')}>Subir documento</button>
            {documentos.seguro && (
              <p>{documentos.seguro.fileName} - {documentos.seguro.vencimiento}</p>
            )}

            <label>Cab Card (PDF)</label>
            <button type="button" onClick={() => abrirModal('CAB')}>Subir documento</button>
            {documentos.CAB && (
              <p>{documentos.CAB.fileName} - {documentos.CAB.vencimiento}</p>
            )}

            <label>DTOP (PDF)</label>
            <button type="button" onClick={() => abrirModal('DTOP')}>Subir documento</button>
            {documentos.DTOP && (
              <p>{documentos.DTOP.fileName} - {documentos.DTOP.vencimiento}</p>
            )}

            <label>PERMISO NY (PDF)</label>
            <button type="button" onClick={() => abrirModal('PERMISO_NY ')}>Subir documento</button>
            {documentos.PERMISO_NY && (
              <p>{documentos.PERMISO_NY.fileName} - {documentos.PERMISO_NY.vencimiento}</p>
            )}

            <label>PERMISO NM (PDF)</label>
            <button type="button" onClick={() => abrirModal('PERMISO_NM')}>Subir documento</button>
            {documentos.PERMISO_NM && (
              <p>{documentos.PERMISO_NM.fileName} - {documentos.PERMISO_NM.vencimiento}</p>
            )}
          </div>

          {/* Columna 3  */}
          <div className="column">
            <label>Inspecccion mecanica (PDF)</label>
            <button type="button" onClick={() => abrirModal('Mecanica')}>Subir documento</button>
            {documentos.Mecanica && (
              <p>{documentos.Mecanica.fileName} - {documentos.Mecanica.vencimiento}</p>
            )}

            <label>Tarjeta de circulacion (PDF)</label>
            <button type="button" onClick={() => abrirModal('Circulacion')}>Subir documento</button>
            {documentos.Circulacion && (
              <p>{documentos.Circulacion.fileName} - {documentos.Circulacion.vencimiento}</p>
            )}

            <label>VERIFICACIONES MX (PDF)</label>
            <button type="button" onClick={() => abrirModal('VERIFICACIONES')}>Subir documento</button>
            {documentos.VERIFICACIONES && (
              <p>{documentos.VERIFICACIONES.fileName} - {documentos.VERIFICACIONES.vencimiento}</p>
            )}

             <label>UCR (PDF)</label>
            <button type="button" onClick={() => abrirModal('UCR')}>Subir documento</button>
            {documentos.UCR && (
              <p>{documentos.UCR.fileName} - {documentos.UCR.vencimiento}</p>
            )}

             <label>Permiso kentucky (PDF)</label>
            <button type="button" onClick={() => abrirModal('kentucky')}>Subir documento</button>
            {documentos.kentucky && (
              <p>{documentos.kentucky.fileName} - {documentos.kentucky.vencimiento}</p>
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

export default TruckScreen;

