import React, { useState } from 'react';
import './css/ConductoresScreen.css';
import 'react-datepicker/dist/react-datepicker.css';
import ModalArchivo from '../components/ModalArchivo.jsx'; // ajusta la ruta si es necesario
import Swal from 'sweetalert2';


const TruckScreen = () => {
   const apiHost = import.meta.env.VITE_API_HOST;
  const [formData, setFormData] = useState({
    Unidad: '',
    PlacaMX: '',
    PlacaEUA: '',
    Modelo: '',
    Marca: '',
    Numero: '',
    Tag: ''
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
      formDataToSend.append('Unidad', formData.Unidad);
      formDataToSend.append('PlacaMX', formData.PlacaMX);
      formDataToSend.append('PlacaEUA', formData.PlacaEUA);
      formDataToSend.append('Modelo', formData.Modelo);
      formDataToSend.append('Marca', formData.Marca);
      formDataToSend.append('Numero', formData.Numero);
      formDataToSend.append('Tag', formData.Numero);

      // Enviar al backend

      const response = await fetch(`${apiHost}/trucks.php`, {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();
      console.log('Respuesta del servidor:', result);

      const truck_id = result.id;
      console.log("ID recibido del backend:", truck_id);

      if (result.status === "success") {

        const truck_id = result.id;
        console.log("ID recibido del backend:", truck_id);
        return truck_id;
      } else {
        throw new Error("Error al guardar datos básicos");
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      alert('Error al conectar con el servidor');
    }
  };

  const enviarDocumentos = async (truck_id) => {
    const entries = Object.entries(documentos); // clave: nombre campo, valor: { file, vencimiento }

    for (const [tipo_documento, { file, vencimiento }] of entries) {
      const formDataFile = new FormData();
      formDataFile.append('op', 'Alta');
      formDataFile.append('truck_id', truck_id);
      formDataFile.append('tipo_documento', tipo_documento);
      formDataFile.append('fecha_vencimiento', vencimiento);
      formDataFile.append('documento', file);

      try {
          const response = await fetch(`${apiHost}/trucks_docs.php`, {
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
        Unidad: '',
        PlacaMX: '',
        PlacaEUA: '',
        Modelo: '',
        Marca: '',
        Numero: '',
        Tag: '',
      });

      setDocumentos({});

    }
  };


  return (

    <div >
 
      <h1 className="titulo">Alta de Camion</h1>
      <div className="conductores-container">
        <div className="btnConteiner">
          <button className="btn cancelar">Cancelar</button>
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
              value={formData.nombre}
              onChange={(e) => handleInputChange('Unidad', e.target.value)}
            />

            <label>Placa MEX</label>
            <input
              type="text"
              placeholder="Placa MEX"
              value={formData.nombre}
              onChange={(e) => handleInputChange('PlacaMX', e.target.value)}
            />

            <label>Placa USA</label>
            <input
              type="text"
              placeholder="Placa EUA"
              value={formData.nombre}
              onChange={(e) => handleInputChange('PlacaEUA', e.target.value)}
            />

            <label>Modelo (Año)</label>
            <input
              type="text"
              placeholder="Modelo"
              value={formData.nombre}
              onChange={(e) => handleInputChange('Modelo', e.target.value)}
            />

            <label>Marca de camion</label>
            <input
              type="text"
              placeholder="Marca de camion"
              value={formData.nombre}
              onChange={(e) => handleInputChange('Marca', e.target.value)}
            />

            <label>Numero de VIN</label>
            <input
              type="text"
              placeholder="Numero"
              value={formData.nombre}
              onChange={(e) => handleInputChange('Numero', e.target.value)}
            />
          </div>
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
              value={formData.nombre}
              onChange={(e) => handleInputChange('Tag', e.target.value)}
            />

          </div>
          {/* Columna 2 */}
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

          {/* Columna 3  */}
          

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

