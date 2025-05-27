import React, { useState, useEffect } from 'react';
import './css/ConductoresScreen.css';
import 'react-datepicker/dist/react-datepicker.css';
import ModalArchivo from '../components/ModalArchivo.jsx';
import Swal from 'sweetalert2';
import { useParams, useNavigate } from 'react-router-dom'; 
const TrailerEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate(); 
    const apiHost = import.meta.env.VITE_API_HOST;

    const [formData, setFormData] = useState({
        numero_caja: '',
        numero_placa: '',
        estado_placa: '',
        numero_vin: '',
    });

    const [documentos, setDocumentos] = useState({});
    const [modalAbierto, setModalAbierto] = useState(false);
    const [campoActual, setCampoActual] = useState(null); 

    
    useEffect(() => {
        const fetchTrailerData = async () => {
            if (!id) return; 

            const formDataToSend = new FormData();
            formDataToSend.append('op', 'getCajaEdit'); 
            formDataToSend.append('caja_id', id);

            try {
                const response = await fetch(`${apiHost}/cajas.php`, { 
                    method: 'POST',
                    body: formDataToSend,
                });
                const data = await response.json();

     
                if (data.status === 'success' && data.Caja && data.Caja.length > 0) {
                    const cajaData = data.Caja[0];

                    setFormData({
                        numero_caja: cajaData.numero_caja || '',
                        numero_placa: cajaData.numero_placa || '',
                        estado_placa: cajaData.estado_placa || '',
                        numero_vin: cajaData.numero_vin || '',
                    });

                  
                    const nuevosDocumentos = {};
                    const camposDocumentosTrailer = ['seguro', 'Fianza'];

                    camposDocumentosTrailer.forEach((campo) => {
                       
                        const urlKey = `${campo}_URL`;
                        const fechaKey = `${campo}_fecha_vencimiento`; 

                        if (cajaData[urlKey]) {
                            nuevosDocumentos[campo] = {
                                file: null, 
                                fileName: cajaData[urlKey].split('/').pop(),
                                vencimiento: cajaData[fechaKey] || '',
                                url: `${apiHost}/${cajaData[urlKey]}` 
                            };
                        }
                    });
                    setDocumentos(nuevosDocumentos);
                } else {
                    Swal.fire('Error', 'No se pudieron cargar los datos de la caja.', 'error');
                    console.error("Error o datos no encontrados:", data);
                }
            } catch (error) {
                console.error('Error al cargar los datos de la caja:', error);
                Swal.fire('Error', 'Hubo un problema al conectar con el servidor para cargar los datos.', 'error');
            }
        };

        fetchTrailerData();
    }, [id, apiHost]); 

    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleGuardarDocumento = (campo, data) => {
        setDocumentos(prev => ({
            ...prev,
            [campo]: { ...prev[campo], ...data } 
        }));
    };

    const abrirModal = (campo) => {
        setCampoActual(campo);
        setModalAbierto(true);
    };

 
    const envioDatosPrincipalActualizados = async () => {
        const formDataToSend = new FormData();
        formDataToSend.append('op', 'Update'); 
        formDataToSend.append('caja_id', id); 
        formDataToSend.append('numero_caja', formData.numero_caja);
        formDataToSend.append('numero_placa', formData.numero_placa);
        formDataToSend.append('estado_placa', formData.estado_placa);
        formDataToSend.append('numero_vin', formData.numero_vin);

        try {
            const response = await fetch(`${apiHost}/cajas.php`, {
                method: 'POST',
                body: formDataToSend,
            });
            const result = await response.json();
            console.log('Respuesta del servidor (Update Principal):', result);

            if (result.status === "success") {
                return true; // Indica que la actualización de datos principales fue exitosa
            } else {
                Swal.fire('Error', result.message || 'Error al actualizar los datos de la caja.', 'error');
                throw new Error(result.message || "Error al actualizar datos básicos de la caja");
            }
        } catch (error) {
            console.error('Error al enviar los datos actualizados:', error);
            Swal.fire('Error', 'Hubo un problema al conectar con el servidor para actualizar.', 'error');
            return false;
        }
    };

  
    const enviarDocumentosActualizados = async () => {
       

        const entries = Object.entries(documentos);
        let todosExitosos = true;

        for (const [tipo_documento, docData] of entries) {
            
            if (docData && docData.file) {
                const formDataFile = new FormData();
               
                formDataFile.append('op', 'Alta'); 
                formDataFile.append('caja_id', id); 
                formDataFile.append('tipo_documento', tipo_documento);
                formDataFile.append('fecha_vencimiento', docData.vencimiento);
                formDataFile.append('documento', docData.file);

                try {
                    const response = await fetch(`${apiHost}/cajas_docs.php`, {
                        method: 'POST',
                        body: formDataFile,
                    });
                    const result = await response.json();
                    console.log(`Documento ${tipo_documento} (actualizado/enviado):`, result);
                    if (result.status !== 'success') {
                        todosExitosos = false;
                        Swal.fire('Advertencia', `El documento ${tipo_documento} no se pudo guardar: ${result.message}`, 'warning');
                    }
                } catch (error) {
                    todosExitosos = false;
                    console.error(`Error al enviar/actualizar ${tipo_documento}:`, error);
                    Swal.fire('Error', `Error de conexión al guardar ${tipo_documento}.`, 'error');
                }
            }
        }
        return todosExitosos;
    };

    const handleSubmit = async () => {
        const datosPrincipalesActualizados = await envioDatosPrincipalActualizados();

        if (datosPrincipalesActualizados) {
            const documentosActualizados = await enviarDocumentosActualizados();
            if (documentosActualizados) {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'La caja y sus documentos han sido actualizados correctamente.',
                });
               
            } else {
                 Swal.fire('Información', 'Los datos principales de la caja se guardaron, pero algunos documentos tuvieron problemas.', 'info');
            }
        }
    };

   
    return (
        <div>
            <h1 className="titulo">Editor de Caja (ID: {id})</h1>
            <div className="conductores-container">
                <div className="btnConteiner">
                    <button type="button" className="btn cancelar" onClick={() => navigate(-1)}>Cancelar</button> 
                    <button type="button" className="btn guardar" onClick={handleSubmit}>Guardar Cambios</button>
                </div>

                <div className="form-columns">
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
                    </div>
                    
                    {/* Columna para documentos de la caja */}
                    <div className="column">
                        <label>Seguro (PDF)</label>
                        <button type="button" onClick={() => abrirModal('seguro')}>
                            {documentos.seguro?.fileName ? 'Cambiar Documento' : 'Subir Documento'}
                        </button>
                        {documentos.seguro && (
                            <p>
                                {documentos.seguro.fileName}
                                {documentos.seguro.vencimiento && ` - Vence: ${documentos.seguro.vencimiento}`}
                                {documentos.seguro.url && (
                                    <button onClick={() => window.open(documentos.seguro.url, '_blank')} style={{ marginLeft: '10px' }}>Ver Actual</button>
                                )}
                            </p>
                        )}

                        <label>Fianza (PDF)</label>
                        <button type="button" onClick={() => abrirModal('Fianza')}>
                             {documentos.Fianza?.fileName ? 'Cambiar Documento' : 'Subir Documento'}
                        </button>
                        {documentos.Fianza && (
                            <p>
                                {documentos.Fianza.fileName}
                                {documentos.Fianza.vencimiento && ` - Vence: ${documentos.Fianza.vencimiento}`}
                                {documentos.Fianza.url && (
                                    <button onClick={() => window.open(documentos.Fianza.url, '_blank')} style={{ marginLeft: '10px' }}>Ver Actual</button>
                                )}
                            </p>
                        )}
                
                    </div>
                </div>

                <ModalArchivo
                    isOpen={modalAbierto}
                    onClose={() => setModalAbierto(false)}
                    onSave={(data) => {
                        handleGuardarDocumento(campoActual, data); 
                        setModalAbierto(false);
                    }}
                    nombreCampo={campoActual}
                    
                    valorActual={documentos[campoActual] || { file: null, vencimiento: '', fileName: '' }}
                />
            </div>
        </div>
    );
};

export default TrailerEditor;