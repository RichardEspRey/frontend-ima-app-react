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
    Numero: '',
    Tag:''
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
      if (formData.Tag !== originalFormData.Tag) formDataToSend.append('Tag', formData.Tag);

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
    if (formData.Tag !== originalFormData.Tag) cambios.push('Laredo Tag');

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
          Numero: truck.Numero_VIN || '',
          Tag: truck.Tag || ''
        };
        setFormData(formValues);
        setOriginalFormData(formValues);
        const camposDoc = [
          'registracion',
          'CAB',
          'COI',
          'mecanica',
          'TX_DMV',
          'PERMISO_NY',
          'PERMISO_NM',
          'dtops',
          'Tarjeta_circulacion',
          'Inspecccion_fisio_Mecanica',
          'Inspecion_humos',
          'fideicomiso',
          'seguro'
        ];

        const nuevosDocumentos = {};

        camposDoc.forEach((campo) => {
          const url = truck[`${campo}_URL`];
          const fecha = truck[`${campo}_Fecha`] || truck[`${campo}_fecha`] || truck[`AS${campo}_Fecha`] || '';

          if (url) {
            nuevosDocumentos[campo] = {
              file: null,
              fileName: url.split('/').pop(),
              vencimiento: fecha,
              url: `${apiHost}/${url}`
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
            <h2>Registros generales</h2>
            <label>Unidad</label>
            <input
              type="text"
              placeholder="Unidad"
              value={formData.unidad}
              onChange={(e) => handleInputChange('Unidad', e.target.value)}
            />

            <label>Placa MEX</label>
            <input
              type="text"
              placeholder="Placa MEX"
              value={formData.PlacaMX}
              onChange={(e) => handleInputChange('PlacaMX', e.target.value)}
            />

            <label>Placa USA</label>
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
               <h2>Registros USA</h2>

             <label>Registracion</label>
            <button type="button" onClick={() => abrirModal('registracion')}>Subir documento</button>
            {documentos.registracion && (
              <p>{documentos.registracion.fileName} - {documentos.registracion.vencimiento}</p>
            )}

            <label>Cab Card (PDF)</label>
            <button type="button" onClick={() => abrirModal('CAB')}>Subir documento</button>
            {documentos.CAB && (
              <p>{documentos.CAB.fileName} - {documentos.CAB.vencimiento}</p>
            )}

              <label>COI (PDF)</label>
            <button type="button" onClick={() => abrirModal('COI')}>Subir documento</button>
            {documentos.COI && (
              <p>{documentos.COI.fileName} - {documentos.COI.vencimiento}</p>
            )}


           <label>Inspecccion mecanica (PDF)</label>
            <button type="button" onClick={() => abrirModal('mecanica')}>Subir documento</button>
            {documentos.mecanica && (
              <p>{documentos.mecanica.fileName} - {documentos.mecanica.vencimiento}</p>
            )}
            

             <label>TX DMV (PDF)</label>
            <button type="button" onClick={() => abrirModal('TX_DMV')}>Subir documento</button>
            {documentos.TX_DMV && (
              <p>{documentos.TX_DMV.fileName} - {documentos.TX_DMV.vencimiento}</p>
            )}

            <label>PERMISO NY (PDF)</label>
            <button type="button" onClick={() => abrirModal('PERMISO_NY')}>Subir documento</button>
            {documentos.PERMISO_NY && (
              <p>{documentos.PERMISO_NY.fileName} - {documentos.PERMISO_NY.vencimiento}</p>
            )}

            <label>PERMISO NM (PDF)</label>
            <button type="button" onClick={() => abrirModal('PERMISO_NM')}>Subir documento</button>
            {documentos.PERMISO_NM && (
              <p>{documentos.PERMISO_NM.fileName} - {documentos.PERMISO_NM.vencimiento}</p>
            )}

         
             
            <label>DTOPS (PDF)</label>
            <button type="button" onClick={() => abrirModal('dtops')}>Subir documento</button>
            {documentos.dtops && (
              <p>{documentos.dtops.fileName} - {documentos.dtops.vencimiento}</p>
            )}

            <label>Laredo TAG</label>
            <input
              type="text"
              placeholder="Numero"
              value={formData.Tag}
              onChange={(e) => handleInputChange('Tag', e.target.value)}
            />

          </div>
          {/* Columna 3 */}
          <div className="column">
            <h2>Registros MEX</h2>
           
            
            <label>Tarjeta de circulacion (PDF)</label>
            <button type="button" onClick={() => abrirModal('Tarjeta_circulacion')}>Subir documento</button>
            {documentos.Tarjeta_circulacion && (
              <p>{documentos.Tarjeta_circulacion.fileName} - {documentos.Tarjeta_circulacion.vencimiento}</p>
            )}
            <label>Inspecccion fisio-mecanica(PDF)</label>
            <button type="button" onClick={() => abrirModal('Inspecccion_fisio_Mecanica')}>Subir documento</button>
            {documentos.Inspecccion_fisio_Mecanica && (
              <p>{documentos.Inspecccion_fisio_Mecanica.fileName} - {documentos.Inspecccion_fisio_Mecanica.vencimiento}</p>
            )}

            <label>Inspecion humos  (PDF)</label>
            <button type="button" onClick={() => abrirModal('Inspecion_humos')}>Subir documento</button>
            {documentos.Inspecion_humos && (
              <p>{documentos.Inspecion_humos.fileName} - {documentos.Inspecion_humos.vencimiento}</p>
            )}
        
            <label>Puente fideicomiso  (PDF)</label>
            <button type="button" onClick={() => abrirModal('fideicomiso')}>Subir documento</button>
            {documentos.fideicomiso && (
              <p>{documentos.fideicomiso.fileName} - {documentos.fideicomiso.vencimiento}</p>
            )}
        
            <label>Seguro (PDF)</label>
            <button type="button" onClick={() => abrirModal('seguro')}>Subir documento</button>
            {documentos.seguro && (
              <p>{documentos.seguro.fileName} - {documentos.seguro.vencimiento}</p>
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

