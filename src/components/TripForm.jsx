import React, { useState, useEffect } from 'react';
import ModalArchivo from './ModalArchivo'; 
import './css/TripForm.css'; 
import useFetchActiveDrivers from '../hooks/useFetchActiveDrivers'; 
import useFetchActiveTrucks from '../hooks/useFetchActiveTrucks'; 
import useFetchActiveTrailers from '../hooks/useFetchActiveTrailers'; 
import useFetchCompanies from '../hooks/useFetchCompanies'; 
import useFetchWarehouses from '../hooks/useFetchWarehouses'; 
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

const initialBorderCrossingDocs = {
    ima_invoice: null, carta_porte: null, ci: null, entry: null,
    manifiesto: null, cita_entrega: null, bl: null, orden_retiro: null, bl_firmado: null,
};

const initialNormalTripDocs = {
    ima_invoice: null, ci: null,
    manifiesto: null, cita_entrega: null, bl: null, orden_retiro: null, bl_firmado: null,

};

// Estilos para los componentes Select
const selectStyles = {
    control: (provided) => ({
        ...provided,
        padding: '4px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        fontSize: '16px',
        minHeight: '40px',
    }),
};


const TripForm = ({ tripNumber }) => {
    const apiHost = import.meta.env.VITE_API_HOST;
    
    const { activeDrivers, loading: loadingDrivers, error: errorDrivers } = useFetchActiveDrivers();
    const { activeTrucks, loading: loadingTrucks, error: errorTrucks } = useFetchActiveTrucks();
    const { activeTrailers, loading: loadingCajas, error: errorCajas } = useFetchActiveTrailers();
    const { activeCompanies, loading: loadingCompanies, error: errorCompanies } = useFetchCompanies();
    const { activeWarehouses, loading: loadingWarehouses, error: errorWarehouses } = useFetchWarehouses();

  
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalTarget, setModalTarget] = useState({ stageIndex: null, docType: null });
    const [mostrarFechaVencimientoModal, setMostrarFechaVencimientoModal] = useState(true);

    
    const [formData, setFormData] = useState({
        trip_number: tripNumber || '',
        driver_id: '',
        truck_id: '',
        caja_id: '',
    });

 
    const [etapas, setEtapas] = useState([{
        stage_number: 1,
        stageType: 'normalTrip', 
        origin: '',
        destination: '',
        zip_code_origin: '',
        zip_code_destination: '',
        loading_date: null,
        delivery_date: null,
        company_id: '',
        travel_direction: '',
        warehouse_origin_id: '',
        warehouse_destination_id: '',
        ci_number: '',
        rate_tarifa: '',
        millas_pc_miller: '',
        documentos: { ...initialNormalTripDocs } 
    }]);

  
    useEffect(() => {
        setFormData(prevFormData => ({
            ...prevFormData,
            trip_number: tripNumber || '',
        }));
    }, [tripNumber]);

    
    const setForm = (name, value) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    
    const handleEtapaChange = (index, field, value) => {
        setEtapas(prevEtapas => {
            const updatedEtapas = [...prevEtapas];
            const updatedEtapa = { ...updatedEtapas[index] };
            updatedEtapa[field] = value;
            updatedEtapas[index] = updatedEtapa;
            return updatedEtapas;
        });
    };

   
    const handleGuardarDocumentoEtapa = (data) => {
        const { stageIndex, docType } = modalTarget;
        if (stageIndex === null || !docType) return;
        setEtapas(prevEtapas => {
            const updatedEtapas = [...prevEtapas];
            const updatedEtapa = {
                ...updatedEtapas[stageIndex],
                documentos: {
                    ...updatedEtapas[stageIndex].documentos,
                    [docType]: data 
                }
            };
            updatedEtapas[stageIndex] = updatedEtapa;
            return updatedEtapas;
        });
        setModalAbierto(false);
        setModalTarget({ stageIndex: null, docType: null });
    };

 

    const abrirModal = (docType, stageIndex = null) => {
        setModalTarget({ stageIndex, docType });
        setModalAbierto(true);
        
        if (['bl', 'entry', 'manifiesto'].includes(docType)) {
            setMostrarFechaVencimientoModal(false);
        } else {
            setMostrarFechaVencimientoModal(true);
        }
    };


    const getCurrentDocValueForModal = () => {
        const { stageIndex, docType } = modalTarget;
        if (docType === null) return null;
        if (stageIndex !== null && etapas[stageIndex]) {
            return etapas[stageIndex].documentos[docType] || null;
        }
  
        return null;
    };

   
    const agregarNuevaEtapa = (tipoEtapa) => {
        let initialDocs;
      
        if (tipoEtapa === 'normalTrip') {
            initialDocs = { ...initialNormalTripDocs };
        } else if (tipoEtapa === 'borderCrossing') {
            initialDocs = { ...initialBorderCrossingDocs };
        } else {
            console.warn("Tipo de etapa desconocido:", tipoEtapa, ". Usando documentos vacíos.");
            initialDocs = {};
        }

        setEtapas(prevEtapas => [
            ...prevEtapas,
            {
               
                stage_number: prevEtapas.length + 1,
                stageType: tipoEtapa,
                origin: '', destination: '', zip_code_origin: '', zip_code_destination: '',
                loading_date: null, delivery_date: null, company_id: null, travel_direction: '',
                warehouse_origin_id: null, warehouse_destination_id: null, ci_number: '',
                rate_tarifa: '', millas_pc_miller: '', estatus: 'Pending',
                documentos: initialDocs 
            }
        ]);
    };


    const eliminarEtapa = (index) => {
        if (etapas.length <= 1) { Swal.fire('Info', 'Debe haber al menos una etapa.', 'info'); return; }
        Swal.fire({
            title: `¿Eliminar Etapa ${etapas[index].stage_number}?`, icon: 'warning',
            showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Sí, eliminar'
        }).then((result) => {
            if (result.isConfirmed) {
                
                setEtapas(prev => prev.filter((_, i) => i !== index).map((e, i) => ({ ...e, stage_number: i + 1 })));
            }
        });
    };

  
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validaciones básicas
        if (!formData.driver_id || !formData.truck_id) {
            Swal.fire('Campos incompletos', 'Por favor, seleccione Driver y Truck.', 'warning');
            return;
        }
        for (let i = 0; i < etapas.length; i++) {
            const etapa = etapas[i];
            if (!etapa.company_id || !etapa.travel_direction || !etapa.warehouse_origin_id || !etapa.warehouse_destination_id || !etapa.origin || !etapa.destination) {
                Swal.fire('Campos incompletos', `Por favor, complete los campos obligatorios (Company, Direction, Warehouses, Origin, Destination) de la Etapa ${etapa.stage_number}.`, 'warning');
                return;
            }
        }

        const dataToSend = new FormData();
        dataToSend.append('op', 'Alta'); 

        
        dataToSend.append('trip_number', formData.trip_number);
        dataToSend.append('driver_id', formData.driver_id);
        dataToSend.append('truck_id', formData.truck_id);
        dataToSend.append('caja_id', formData.caja_id || ''); 

     
        const etapasParaJson = etapas.map(etapa => ({
            stage_number: etapa.stage_number,
            stageType: etapa.stageType,
            origin: etapa.origin,
            destination: etapa.destination,
            zip_code_origin: etapa.zip_code_origin,
            zip_code_destination: etapa.zip_code_destination,
            
            loading_date: etapa.loading_date ? format(etapa.loading_date, 'yyyy-MM-dd') : null,
            delivery_date: etapa.delivery_date ? format(etapa.delivery_date, 'yyyy-MM-dd') : null,
            company_id: etapa.company_id,
            travel_direction: etapa.travel_direction,
            warehouse_origin_id: etapa.warehouse_origin_id,
            warehouse_destination_id: etapa.warehouse_destination_id,
            ci_number: etapa.ci_number,
            rate_tarifa: etapa.rate_tarifa,
            millas_pc_miller: etapa.millas_pc_miller,
            estatus: etapa.estatus,
            // Enviar solo metadatos de documentos en el JSON
            documentos: Object.entries(etapa.documentos).reduce((acc, [key, value]) => {
                if (value) { // Si hay datos para este tipo de documento
                    acc[key] = {
                        fileName: value.fileName || '',
                        vencimiento: value.vencimiento || null
                    };
                } else {
                    acc[key] = null;
                }
                return acc;
            }, {})
        }));
        dataToSend.append('etapas', JSON.stringify(etapasParaJson));

        // Añadir los archivos de CADA etapa al FormData
        etapas.forEach((etapa, index) => {
            Object.entries(etapa.documentos).forEach(([docType, docData]) => {
                // Si hay un objeto File, añadirlo al FormData
                if (docData && docData.file instanceof File) {
                    const fieldName = `etapa_${index}_${docType}_file`;
                    dataToSend.append(fieldName, docData.file, docData.fileName);
                }
            });
        });

        // Log para depuración
        console.log("--- FormData a enviar (Alta) ---");
        for (let [key, value] of dataToSend.entries()) {
            console.log(`${key}:`, value instanceof File ? value.name : value);
        }
        console.log("--- Fin FormData ---");

        // Enviar a la API
        try {
            const apiUrl = 'http://imaexpressllc.com/API/new_trips.php'; // URL de tu API
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: dataToSend,
      
            });

            const result = await response.json();
            console.log("Respuesta del servidor (Alta):", result);

            if (response.ok && result.status === "success") {
                Swal.fire({
                    icon: 'success', title: '¡Éxito!',
                    text: result.message || 'Viaje y etapas guardados correctamente.',
                    timer: 2500, showConfirmButton: false
                });
                // Resetear el formulario después de éxito
                setFormData({ trip_number: '', driver_id: '', truck_id: '', caja_id: '' });
                setEtapas([{
                    stage_number: 1, stageType: 'normalTrip', origin: '', destination: '',
                    zip_code_origin: '', zip_code_destination: '', loading_date: null, delivery_date: null,
                    company_id: '', travel_direction: '', warehouse_origin_id: '', warehouse_destination_id: '',
                    ci_number: '', rate_tarifa: '', millas_pc_miller: '',
                    documentos: { ...initialNormalTripDocs }
                }]);
             
                // navigate('/admin-trips');
            } else {
                
                Swal.fire({
                    icon: 'error', title: 'Error al Guardar',
                    text: result.error || result.message || 'No se pudo guardar la información. Verifica los datos e intenta de nuevo.',
                });
            }
        } catch (error) {
            console.error('Error en fetch o procesando respuesta (Alta):', error);
            Swal.fire({
                icon: 'error', title: 'Error de Conexión',
                text: `No se pudo comunicar con el servidor. ${error.message}`,
            });
        }
    };


    return (
        <form onSubmit={handleSubmit} className="card-container">
          
            <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => console.log('Cancelar presionado')}>Cancelar</button>
                <button type="submit" className="accept-button">Guardar Viaje</button>
            </div>

          
            <div className="form-section">
                <legend className="card-label">Información General del Viaje</legend>
                <div className="input-columns">
             
                    <div className="column">
                        <label htmlFor="driver_id">Driver:</label>
                        <Select
                            id="driver_id" name="driver_id"
                            value={activeDrivers.find(d => d.driver_id === formData.driver_id) ? { value: formData.driver_id, label: activeDrivers.find(d => d.driver_id === formData.driver_id).nombre } : null}
                            onChange={(selected) => setForm('driver_id', selected ? selected.value : '')}
                            options={activeDrivers.map(driver => ({ value: driver.driver_id, label: driver.nombre }))}
                            placeholder="Seleccionar Driver"
                            isLoading={loadingDrivers}
                            isDisabled={loadingDrivers || !!errorDrivers}
                            styles={selectStyles} isClearable
                        />
                        {errorDrivers && <p className="error-text">Error cargando drivers</p>}
                    </div>
                   
                    <div className="column">
                        <label htmlFor="truck_id">Truck:</label>
                        <Select
                            id="truck_id" name="truck_id"
                            value={activeTrucks.find(t => t.truck_id === formData.truck_id) ? { value: formData.truck_id, label: activeTrucks.find(t => t.truck_id === formData.truck_id).unidad } : null}
                            onChange={(selected) => setForm('truck_id', selected ? selected.value : '')}
                            options={activeTrucks.map(truck => ({ value: truck.truck_id, label: truck.unidad }))}
                            placeholder="Seleccionar Truck"
                            isLoading={loadingTrucks}
                            isDisabled={loadingTrucks || !!errorTrucks}
                            styles={selectStyles} isClearable
                        />
                        {errorTrucks && <p className="error-text">Error cargando trucks</p>}
                    </div>
                   
                    <div className="column">
                        <label htmlFor="caja_id">Trailer (Caja):</label>
                        <Select
                            id="caja_id" name="caja_id"
                            value={activeTrailers.find(c => c.caja_id === formData.caja_id) ? { value: formData.caja_id, label: activeTrailers.find(c => c.caja_id === formData.caja_id).no_caja } : null}
                            onChange={(selected) => setForm('caja_id', selected ? selected.value : '')}
                            options={activeTrailers.map(caja => ({ value: caja.caja_id, label: caja.no_caja }))}
                            placeholder="Seleccionar Trailer"
                            isLoading={loadingCajas}
                            isDisabled={loadingCajas || !!errorCajas}
                            styles={selectStyles} isClearable
                        />
                        {errorCajas && <p className="error-text">Error cargando trailers</p>}
                    </div>
                </div>
            </div>

            <br />

            {etapas.map((etapa, index) => (
                <div key={index} className="etapa-container form-section">
                    {/* Encabezado de la etapa con botón de eliminar */}
                    <div className="card-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '10px', marginBottom: '10px' }}>
                        <span>{`Etapa ${etapa.stage_number} (${etapa.stageType === 'borderCrossing' ? 'Cruce Fronterizo' : 'Viaje Normal'})`}</span>
                        {etapas.length > 1 && ( // Mostrar botón solo si hay más de una etapa
                            <button type="button" className="delete-button" onClick={() => eliminarEtapa(index)} title="Eliminar Etapa">&#x2716;</button>
                        )}
                    </div>

                    
                    <legend className="card-label">Origen / Destino / Detalles</legend>
                    <div className="input-columns">
                        {/* Company, Travel Direction, CI Number */}
                        <div className="column">
                            <label htmlFor={`company_id-${index}`}>Company:</label>
                            <Select
                                id={`company_id-${index}`} name={`company_id-${index}`}
                                value={activeCompanies.find(c => c.company_id === etapa.company_id) ? { value: etapa.company_id, label: activeCompanies.find(c => c.company_id === etapa.company_id).nombre_compania } : null}
                                onChange={(selected) => handleEtapaChange(index, 'company_id', selected ? selected.value : '')}
                                options={activeCompanies.map(c => ({ value: c.company_id, label: c.nombre_compania }))}
                                placeholder="Seleccionar Company"
                                isLoading={loadingCompanies} isDisabled={loadingCompanies || !!errorCompanies}
                                styles={selectStyles} isClearable
                            />
                            {errorCompanies && <p className="error-text">Error cargando companies</p>}
                        </div>
                        <div className="column">
                            <label htmlFor={`travel_direction-${index}`}>Travel Direction:</label>
                            <Select
                                id={`travel_direction-${index}`} name={`travel_direction-${index}`}
                                value={etapa.travel_direction ? { value: etapa.travel_direction, label: etapa.travel_direction } : null}
                                onChange={(selected) => handleEtapaChange(index, 'travel_direction', selected ? selected.value : '')}
                                options={[{ value: 'Going Up', label: 'Going Up' }, { value: 'Going Down', label: 'Going Down' }]}
                                placeholder="Seleccionar Dirección"
                                styles={selectStyles} isClearable
                            />
                        </div>
                        <div className="column">
                            <label htmlFor={`ci_number-${index}`}>CI Number:</label>
                            <input
                                type="text" id={`ci_number-${index}`} name={`ci_number-${index}`}
                                value={etapa.ci_number}
                                onChange={(e) => handleEtapaChange(index, 'ci_number', e.target.value)}
                                placeholder="Número CI"
                                className="form-input"
                            />
                        </div>
                    </div>
                    <div className="input-columns">
                        
                         <div className="column">
                            <label htmlFor={`warehouse_origin_id-${index}`} style={{ marginTop: '10px' }}>Origin Warehouse:</label>
                            <Select
                                id={`warehouse_origin_id-${index}`} name={`warehouse_origin_id-${index}`}
                                value={activeWarehouses.find(w => w.warehouse_id === etapa.warehouse_origin_id) ? { value: etapa.warehouse_origin_id, label: activeWarehouses.find(w => w.warehouse_id === etapa.warehouse_origin_id).nombre_almacen } : null}
                                onChange={(selected) => handleEtapaChange(index, 'warehouse_origin_id', selected ? selected.value : '')}
                                options={activeWarehouses.map(w => ({ value: w.warehouse_id, label: w.nombre_almacen }))}
                                placeholder="Seleccionar Bodega Origen"
                                isLoading={loadingWarehouses} isDisabled={loadingWarehouses || !!errorWarehouses}
                                styles={selectStyles} isClearable
                            />
                            {errorWarehouses && <p className="error-text">Error cargando warehouses</p>}
                        </div>
                        <div className="column">
                            <label htmlFor={`warehouse_destination_id-${index}`} style={{ marginTop: '10px' }}>Destination Warehouse:</label>
                            <Select
                                id={`warehouse_destination_id-${index}`} name={`warehouse_destination_id-${index}`}
                                value={activeWarehouses.find(w => w.warehouse_id === etapa.warehouse_destination_id) ? { value: etapa.warehouse_destination_id, label: activeWarehouses.find(w => w.warehouse_id === etapa.warehouse_destination_id).nombre_almacen } : null}
                                onChange={(selected) => handleEtapaChange(index, 'warehouse_destination_id', selected ? selected.value : '')}
                                options={activeWarehouses.map(w => ({ value: w.warehouse_id, label: w.nombre_almacen }))}
                                placeholder="Seleccionar Bodega Destino"
                                isLoading={loadingWarehouses} isDisabled={loadingWarehouses || !!errorWarehouses}
                                styles={selectStyles} isClearable
                            />
                        </div>
                    </div>
                    <div className="input-columns">
                       
                         <div className="column">
                            <label htmlFor={`origin-${index}`} style={{ marginTop: '10px' }}>Origin City/State:</label>
                            <input
                                type="text" id={`origin-${index}`} name={`origin-${index}`}
                                value={etapa.origin}
                                onChange={(e) => handleEtapaChange(index, 'origin', e.target.value)}
                                placeholder="Ciudad/Estado Origen"
                                className="form-input"
                            />
                        </div>
                        <div className="column">
                            <label htmlFor={`destination-${index}`} style={{ marginTop: '10px' }}>Destination City/State:</label>
                            <input
                                type="text" id={`destination-${index}`} name={`destination-${index}`}
                                value={etapa.destination}
                                onChange={(e) => handleEtapaChange(index, 'destination', e.target.value)}
                                placeholder="Ciudad/Estado Destino"
                                className="form-input"
                            />
                        </div>
                    </div>
                    <div className="input-columns">
                       
                         <div className="column">
                            <label htmlFor={`zip_code_origin-${index}`}>Zip Code Origin:</label>
                            <input
                                type="text" id={`zip_code_origin-${index}`} name={`zip_code_origin-${index}`}
                                value={etapa.zip_code_origin}
                                onChange={(e) => handleEtapaChange(index, 'zip_code_origin', e.target.value)}
                                placeholder="Zip Origen" className="form-input"
                            />
                        </div>
                        <div className="column">
                            <label htmlFor={`zip_code_destination-${index}`} >Zip Code Destination:</label>
                            <input
                                type="text" id={`zip_code_destination-${index}`} name={`zip_code_destination-${index}`}
                                value={etapa.zip_code_destination}
                                onChange={(e) => handleEtapaChange(index, 'zip_code_destination', e.target.value)}
                                placeholder="Zip Destino" className="form-input"
                            />
                        </div>
                    </div>
                    <div className="input-columns">
                       
                         <div className="column">
                            <label htmlFor={`loading_date-${index}`} style={{ marginTop: '10px' }}>Loading Date:</label>
                            <DatePicker
                                selected={etapa.loading_date}
                                onChange={(date) => handleEtapaChange(index, 'loading_date', date)}
                                dateFormat="dd/MM/yyyy" // Formato visual
                                placeholderText="Fecha Carga"
                                className="form-input date-picker-full-width" // Clase para ancho completo
                                isClearable
                            />
                        </div>
                        <div className="column">
                            <label htmlFor={`delivery_date-${index}`} style={{ marginTop: '10px' }}>Delivery Date:</label>
                            <DatePicker
                                selected={etapa.delivery_date}
                                onChange={(date) => handleEtapaChange(index, 'delivery_date', date)}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Fecha Entrega"
                                className="form-input date-picker-full-width"
                                isClearable
                            />
                        </div>
                    </div>
                     <div className="input-columns">
                        {/* Rate/Miles */}
                         <div className="column">
                            <label htmlFor={`rate_tarifa-${index}`} >Rate Tarifa:</label>
                            <input
                                type="number" id={`rate_tarifa-${index}`} name={`rate_tarifa-${index}`}
                                value={etapa.rate_tarifa}
                                onChange={(e) => handleEtapaChange(index, 'rate_tarifa', e.target.value)}
                                placeholder="Ej: 1500.50"
                                className="form-input"
                            />
                        </div>
                        <div className="column">
                            <label htmlFor={`millas_pc_miller-${index}`} >Millas PC Miller:</label>
                            <input
                                type="number" id={`millas_pc_miller-${index}`} name={`millas_pc_miller-${index}`}
                                value={etapa.millas_pc_miller} // Corregido: usar etapa.millas_pc_miller
                                onChange={(e) => handleEtapaChange(index, 'millas_pc_miller', e.target.value)}
                                placeholder="Ej: 850"
                                className="form-input"
                            />
                        </div>
                    </div>

                
                    {etapa.stageType === 'normalTrip' && (
                        <div className="subsection">
                            <legend className="card-label">Documentos (Viaje Normal)</legend>
                            <div className="input-columns">
                             
                                <div className="column">
                                    <div className="column">
                                        <label>IMA Invoice:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('ima_invoice', index)}>Subir</button>
                                        {etapa.documentos?.ima_invoice && (<p className="doc-info"><i>{etapa.documentos.ima_invoice.fileName}{etapa.documentos.ima_invoice.vencimiento ? ` - V: ${etapa.documentos.ima_invoice.vencimiento}` : ''}</i></p>)}
                                    </div>
                                    {/* <div className="column">
                                        <label>Carta Porte:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('carta_porte', index)}>Subir</button>
                                        {etapa.documentos?.carta_porte && (<p className="doc-info"><i>{etapa.documentos.carta_porte.fileName}{etapa.documentos.carta_porte.vencimiento ? ` - V: ${etapa.documentos.carta_porte.vencimiento}` : ''}</i></p>)}
                                    </div> */}
                                    <div className="column">
                                        <label>CI:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('ci', index)}>Subir</button>
                                        {etapa.documentos?.ci && (<p className="doc-info"><i>{etapa.documentos.ci.fileName}{etapa.documentos.ci.vencimiento ? ` - V: ${etapa.documentos.ci.vencimiento}` : ''}</i></p>)}
                                    </div>
                                </div>
                               
                                <div className="column">
                                     <div className="column">
                                        <label>Entry:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('entry', index)}>Subir</button>
                                        {etapa.documentos?.entry && (<p className="doc-info"><i>{etapa.documentos.entry.fileName}</i></p>)}
                                    </div>
                                    {/* <div className="column">
                                        <label>Manifiesto:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('manifiesto', index)}>Subir</button>
                                        {etapa.documentos?.manifiesto && (<p className="doc-info"><i>{etapa.documentos.manifiesto.fileName}</i></p>)}
                                    </div> */}
                                    <div className="column">
                                        <label>Cita Entrega:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('cita_entrega', index)}>Subir</button>
                                        {etapa.documentos?.cita_entrega && (<p className="doc-info"><i>{etapa.documentos.cita_entrega.fileName}{etapa.documentos.cita_entrega.vencimiento ? ` - V: ${etapa.documentos.cita_entrega.vencimiento}` : ''}</i></p>)}
                                    </div>
                                </div>
                                
                                <div className="column">
                                     <div className="column">
                                        <label>BL:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('bl', index)}>Subir</button>
                                        {etapa.documentos?.bl && (<p className="doc-info"><i>{etapa.documentos.bl.fileName}</i></p>)}
                                    </div>
                                    <div className="column">
                                        <label>Orden Retiro:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('orden_retiro', index)}>Subir</button>
                                        {etapa.documentos?.orden_retiro && (<p className="doc-info"><i>{etapa.documentos.orden_retiro.fileName}{etapa.documentos.orden_retiro.vencimiento ? ` - V: ${etapa.documentos.orden_retiro.vencimiento}` : ''}</i></p>)}
                                    </div>
                                    <div className="column">
                                        <label>BL Firmado:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('bl_firmado', index)}>Subir</button>
                                        {etapa.documentos?.bl_firmado && (<p className="doc-info"><i>{etapa.documentos.bl_firmado.fileName}{etapa.documentos.bl_firmado.vencimiento ? ` - V: ${etapa.documentos.bl_firmado.vencimiento}` : ''}</i></p>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {etapa.stageType === 'borderCrossing' && (
                         <div className="subsection">
                           
                            <legend className="card-label">Documentos (Cruce Fronterizo)</legend>
                             <div className="input-columns">
                              
                                <div className="column">
                                    <div className="column">
                                        <label>IMA Invoice:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('ima_invoice', index)}>Subir</button>
                                        {etapa.documentos?.ima_invoice && (<p className="doc-info"><i>{etapa.documentos.ima_invoice.fileName}{etapa.documentos.ima_invoice.vencimiento ? ` - V: ${etapa.documentos.ima_invoice.vencimiento}` : ''}</i></p>)}
                                    </div>
                                    <div className="column">
                                        <label>Carta Porte:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('carta_porte', index)}>Subir</button>
                                        {etapa.documentos?.carta_porte && (<p className="doc-info"><i>{etapa.documentos.carta_porte.fileName}{etapa.documentos.carta_porte.vencimiento ? ` - V: ${etapa.documentos.carta_porte.vencimiento}` : ''}</i></p>)}
                                    </div>
                                     <div className="column">
                                        <label>CI:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('ci', index)}>Subir</button>
                                        {etapa.documentos?.ci && (<p className="doc-info"><i>{etapa.documentos.ci.fileName}{etapa.documentos.ci.vencimiento ? ` - V: ${etapa.documentos.ci.vencimiento}` : ''}</i></p>)}
                                    </div>
                                </div>
                             
                                <div className="column">
                                    <div className="column">
                                        <label>Manifiesto:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('manifiesto', index)}>Subir</button>
                                        {etapa.documentos?.manifiesto && (<p className="doc-info"><i>{etapa.documentos.manifiesto.fileName}</i></p>)}
                                    </div>
                                    <div className="column">
                                        <label>Manifiesto:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('manifiesto', index)}>Subir</button>
                                        {etapa.documentos?.manifiesto && (<p className="doc-info"><i>{etapa.documentos.manifiesto.fileName}</i></p>)}
                                    </div>
                                    <div className="column">
                                        <label>Cita Entrega:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('cita_entrega', index)}>Subir</button>
                                        {etapa.documentos?.cita_entrega && (<p className="doc-info"><i>{etapa.documentos.cita_entrega.fileName}{etapa.documentos.cita_entrega.vencimiento ? ` - V: ${etapa.documentos.cita_entrega.vencimiento}` : ''}</i></p>)}
                                    </div>
                                </div>
                              
                                <div className="column">
                                     <div className="column">
                                        <label>BL:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('bl', index)}>Subir</button>
                                        {etapa.documentos?.bl && (<p className="doc-info"><i>{etapa.documentos.bl.fileName}</i></p>)}
                                    </div>
                                    <div className="column">
                                        <label>Orden Retiro:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('orden_retiro', index)}>Subir</button>
                                        {etapa.documentos?.orden_retiro && (<p className="doc-info"><i>{etapa.documentos.orden_retiro.fileName}{etapa.documentos.orden_retiro.vencimiento ? ` - V: ${etapa.documentos.orden_retiro.vencimiento}` : ''}</i></p>)}
                                    </div>
                                    <div className="column">
                                        <label>BL Firmado:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('bl_firmado', index)}>Subir</button>
                                        {etapa.documentos?.bl_firmado && (<p className="doc-info"><i>{etapa.documentos.bl_firmado.fileName}{etapa.documentos.bl_firmado.vencimiento ? ` - V: ${etapa.documentos.bl_firmado.vencimiento}` : ''}</i></p>)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))}

            <br />

         
            <div className="add-stage-buttons-container">
                <button type="button" onClick={() => agregarNuevaEtapa('borderCrossing')} className="add-stage-button">
                    + Añadir Etapa Cruce
                </button>
                <button type="button" onClick={() => agregarNuevaEtapa('normalTrip')} className="add-stage-button">
                    + Añadir Etapa Normal
                </button>
            </div>

          
            {modalAbierto && (
                <ModalArchivo
                    isOpen={modalAbierto}
                    onClose={() => { setModalAbierto(false); setModalTarget({ stageIndex: null, docType: null }); }}
                    onSave={handleGuardarDocumentoEtapa}
                    nombreCampo={modalTarget.docType}
                    valorActual={getCurrentDocValueForModal()}
                    mostrarFechaVencimiento={mostrarFechaVencimientoModal}
                />
            )}
        </form>
    );
};

// *** Exportar el componente renombrado ***
export default TripForm;