import React, { useState, useEffect } from 'react';
import ModalArchivo from './ModalArchivo';
import './css/TripForm.css';
import useFetchActiveDrivers from '../hooks/useFetchActiveDrivers';
import useFetchActiveTrucks from '../hooks/useFetchActiveTrucks';
import useFetchActiveTrailers from '../hooks/useFetchActiveTrailers';
import useFetchActiveExternalTrailers from '../hooks/useFetchActiveExternalTrailers';
import useFetchCompanies from '../hooks/useFetchCompanies';
import useFetchWarehouses from '../hooks/useFetchWarehouses';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

const initialBorderCrossingDocs = {
    ima_invoice: null, carta_porte: null, ci: null, entry: null,
    manifiesto: null, cita_entrega: null, bl: null, orden_retiro: null, bl_firmado: null,
};

const initialNormalTripDocs = {
    ima_invoice: null, ci: null,
    cita_entrega: null, bl: null, bl_firmado: null,

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


const TripForm = ({ tripNumber, onSuccess }) => {
    const apiHost = import.meta.env.VITE_API_HOST;

    const { activeDrivers, loading: loadingDrivers, error: errorDrivers } = useFetchActiveDrivers();
    const { activeTrucks, loading: loadingTrucks, error: errorTrucks } = useFetchActiveTrucks();
    const { activeTrailers, loading: loadingCajas, error: errorCajas } = useFetchActiveTrailers();
    const { activeExternalTrailers, loading: loadingCajasExternas, error: errorCajasExternas, refetch: refetchExternalTrailers } = useFetchActiveExternalTrailers();
    const { activeCompanies, loading: loadingCompanies, error: errorCompanies } = useFetchCompanies();
    const { activeWarehouses, loading: loadingWarehouses, error: errorWarehouses } = useFetchWarehouses();

    const [trailerType, setTrailerType] = useState('interna'); // 'interna' o 'externa' 
    const [tripMode, setTripMode] = useState('individual'); // Estado para el modo de viaje
    const [isCreatingCompany, setIsCreatingCompany] = useState(false);
    const [isCreatingWarehouse, setIsCreatingWarehouse] = useState(false)

    const [companyOptions, setCompanyOptions] = useState([]);
    const [warehouseOptions, setWarehouseOptions] = useState([]);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [IsModalCajaExternaOpen, setIsModalCajaExternaOpen] = useState(false);
    const [modalTarget, setModalTarget] = useState({ stageIndex: null, docType: null });
    const [mostrarFechaVencimientoModal, setMostrarFechaVencimientoModal] = useState(true);


    const [formData, setFormData] = useState({
        trip_number: tripNumber || '',
        driver_id: '',
        driver_id_second: '',
        truck_id: '',
        caja_id: '',
        caja_externa_id: ''
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
        millas_pcmiller: '',
        millas_pcmiller_practicas: '',
        documentos: { ...initialNormalTripDocs }
    }]);

    const handleTrailerTypeChange = (type) => {
        setTrailerType(type);
        // Limpia el ID del tipo de caja que no se está usando
        // para evitar enviar datos incorrectos al guardar.
        if (type === 'interna') {
            setFormData(prev => ({ ...prev, caja_externa_id: '' }));
        } else {
            setFormData(prev => ({ ...prev, caja_id: '' }));
        }
    };

    const handleTripModeChange = (mode) => {
        setTripMode(mode);
        if (mode === 'individual') {
            setFormData(prev => ({ ...prev, driver_id_second: '' }));
        }
    };

    useEffect(() => {
        if (activeCompanies) {
            setCompanyOptions(activeCompanies.map(c => ({ value: c.company_id, label: c.nombre_compania })));
        }
    }, [activeCompanies]);

    useEffect(() => {
        if (activeWarehouses) {
            setWarehouseOptions(activeWarehouses.map(w => ({ value: w.warehouse_id, label: w.nombre_almacen })));
        }
    }, [activeWarehouses]);

    const handleCreateCompany = async (inputValue, stageIndex) => {

        setIsCreatingCompany(true);


        const newCompanyFormData = new FormData();
        newCompanyFormData.append('op', 'CreateCompany');
        newCompanyFormData.append('nombre_compania', inputValue);


        try {
            const response = await fetch(`${apiHost}/companies.php`, {
                method: 'POST',
                body: newCompanyFormData,
            });



            const result = await response.json();
            console.log("Respuesta del backend (result):", result);

            if (result.status === "success" && result.company && result.company.company_id) {
                const newOption = { value: result.company.company_id, label: result.company.nombre_compania };

                setCompanyOptions(prevOptions => [...prevOptions, newOption]);


                handleEtapaChange(stageIndex, 'company_id', newOption.value);

                Swal.fire('¡Éxito!', `Compañía "${inputValue}" creada y seleccionada.`, 'success');
            } else {
                Swal.fire('Error', `No se pudo crear la compañía: ${result.message || 'Error desconocido del servidor.'}`, 'error');
            }
        } catch (error) {
            console.error("Error creando compañía:", error);
            Swal.fire('Error', 'Error de conexión al crear la compañía.', 'error');
        } finally {
            setIsCreatingCompany(false);
        }
    };

    const handleCreateWarehouse = async (inputValue, stageIndex, warehouseFieldKey) => {

        setIsCreatingWarehouse(true);


        const newWarehouseFormData = new FormData();
        newWarehouseFormData.append('op', 'CreateWarehouse');
        newWarehouseFormData.append('nombre_almacen', inputValue);


        try {
            const response = await fetch(`${apiHost}/warehouses.php`, {
                method: 'POST',
                body: newWarehouseFormData,
            });
            const result = await response.json();

            if (result.status === "success" && result.warehouse && result.warehouse.warehouse_id) {
                const newOption = { value: result.warehouse.warehouse_id, label: result.warehouse.nombre_almacen };

                setWarehouseOptions(prevOptions => [...prevOptions, newOption]);
                handleEtapaChange(stageIndex, warehouseFieldKey, newOption.value);

                Swal.fire('¡Éxito!', `Bodega "${inputValue}" creada y seleccionada.`, 'success');
            } else {
                Swal.fire('Error', `No se pudo crear la bodega: ${result.message || 'Error desconocido del servidor.'}`, 'error');
            }
        } catch (error) {
            console.error("Error creando bodega:", error);
            Swal.fire('Error', 'Error de conexión al crear la bodega.', 'error');
        } finally {
            setIsCreatingWarehouse(false);
        }
    };

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

        if (['ima_invoice', 'carta_porte', 'ci', 'entry', 'manifiesto', 'cita_entrega', 'bl', 'orden_retiro', 'bl_firmado'].includes(docType)) {
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
        } else {

            return formData[docType] || null;
        }
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
                rate_tarifa: '', millas_pcmiller: '', millas_pcmiller_practicas: '', estatus: 'In Transit',
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
        dataToSend.append('driver_id_second', formData.driver_id_second || '');
        dataToSend.append('truck_id', formData.truck_id);
        dataToSend.append('caja_id', formData.caja_id || '');
        dataToSend.append('caja_externa_id', formData.caja_externa_id || '');


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
            millas_pcmiller: etapa.millas_pcmiller,
            millas_pcmiller_practicas: etapa.millas_pcmiller_practicas,
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
            const apiUrl = `${apiHost}/new_trips.php`; // URL de tu API
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

                // Simplemente notifica al padre que el guardado fue exitoso.
                if (onSuccess) {
                    onSuccess();
                }
                // Resetear el formulario después de éxito
                setFormData({ trip_number: '', driver_id: '', truck_id: '', caja_id: '' });
                setEtapas([{
                    stage_number: 1, stageType: 'normalTrip', origin: '', destination: '',
                    zip_code_origin: '', zip_code_destination: '', loading_date: null, delivery_date: null,
                    company_id: '', travel_direction: '', warehouse_origin_id: '', warehouse_destination_id: '',
                    ci_number: '', rate_tarifa: '', millas_pcmiller: '', millas_pcmiller_practicas: '',
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

    const handleSaveExternalCaja = async (cajaData) => {


        const dataToSend = new FormData();
        dataToSend.append('op', 'Alta');

        Object.entries(cajaData).forEach(([key, value]) => {
            dataToSend.append(key, value);
        });

        try {
            const endpoint = `${apiHost}/caja_externa.php`;
            const response = await fetch(endpoint, {
                method: 'POST',
                body: dataToSend,
            });

            const result = await response.json();

            if (result.status === 'success' && result.caja) {
                Swal.fire('¡Éxito!', 'Caja externa registrada y asignada al viaje.', 'success');

                setForm('caja_externa_id', result.caja.caja_externa_id);
                setForm('caja_id', '');

                // ¡AQUÍ ESTÁ EL CAMBIO!
                // Llamamos a la función para recargar la lista de cajas desde la base de datos.
                refetchExternalTrailers();

                setIsModalCajaExternaOpen(false);

            } else {
                Swal.fire('Error', `No se pudo registrar la caja: ${result.message || 'Error desconocido del servidor.'}`, 'error');
            }

        } catch (error) {
            console.error('Error en la llamada fetch:', error);
            Swal.fire('Error de Conexión', `No se pudo comunicar con el servidor: ${error.message}`, 'error');
        }
    };

    const resetform = () => {
        // Simplemente notifica al padre que el guardado fue exitoso.
        if (onSuccess) {
            onSuccess();
        }
        // Resetear el formulario después de éxito
        setFormData({ trip_number: '', driver_id: '', driver_id_second: '',truck_id: '', caja_id: '' });
        setTripMode('individual');
        setEtapas([{
            stage_number: 1, stageType: 'normalTrip', origin: '', destination: '',
            zip_code_origin: '', zip_code_destination: '', loading_date: null, delivery_date: null,
            company_id: '', travel_direction: '', warehouse_origin_id: '', warehouse_destination_id: '',
            ci_number: '', rate_tarifa: '', millas_pcmiller: '', millas_pcmiller_practicas: '',
            documentos: { ...initialNormalTripDocs }
        }]);
    }

    return (
        <form onSubmit={handleSubmit} className="card-container">

            <div className="form-actions">
                <button type="button" className="cancel-button" onClick={resetform}>Cancelar</button>
                <button type="submit" className="accept-button">Guardar Viaje</button>
            </div>


            <div className="form-section">
                <legend className="card-label">Información General del Viaje</legend>


                <div className="input-columns">
                    <div className="column">
                        <label>Tipo de Viaje:</label>
                        <div className="trip-mode-selector">
                            <button type="button" className={tripMode === 'individual' ? 'active' : ''} onClick={() => handleTripModeChange('individual')}>Viaje Individual</button>
                            <button type="button" className={tripMode === 'team' ? 'active' : ''} onClick={() => handleTripModeChange('team')}>Viaje en Equipo</button>
                        </div>
                    </div>
                </div>


                <div className="input-columns" style={{ marginTop: '1rem' }}>
                    <div className="column">
                        <label htmlFor="driver_id">Driver Principal:</label>
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
                    {tripMode === 'team' && (
                        <div className="column">
                            <label htmlFor="driver_id_second">Segundo Driver:</label>
                            <Select
                                id="driver_id_second" name="driver_id_second"
                                value={activeDrivers.find(d => d.driver_id === formData.driver_id_second) ? { value: formData.driver_id_second, label: activeDrivers.find(d => d.driver_id === formData.driver_id_second).nombre } : null}
                                onChange={(selected) => setForm('driver_id_second', selected ? selected.value : '')}
                                options={activeDrivers.filter(d => d.driver_id !== formData.driver_id).map(driver => ({ value: driver.driver_id, label: driver.nombre }))}
                                placeholder="Seleccionar 2do Driver"
                                isLoading={loadingDrivers} isDisabled={loadingDrivers || !!errorDrivers}
                                styles={selectStyles} isClearable
                            />
                        </div>
                    )}
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
                </div>

                <div className="input-columns" style={{ marginTop: '1rem' }}>
                    <div className="column">
                        <label>Tipo de Trailer:</label>
                        <div className="trailer-type-selector">
                            <button type="button" className={trailerType === 'interna' ? 'active' : ''} onClick={() => handleTrailerTypeChange('interna')}>Caja Interna</button>
                            <button type="button" className={trailerType === 'externa' ? 'active' : ''} onClick={() => handleTrailerTypeChange('externa')}>Caja Externa</button>
                        </div>
                    </div>

                    <div className="column">
                        {trailerType === 'interna' && (
                            <>
                                <label>Trailer (Caja Interna):</label>
                                <Select
                                    id="caja_id" name="caja_id"
                                    value={activeTrailers.find(c => c.caja_id === formData.caja_id) ? { value: formData.caja_id, label: activeTrailers.find(c => c.caja_id === formData.caja_id).no_caja } : null}
                                    onChange={(selected) => setForm('caja_id', selected ? selected.value : '')}
                                    options={activeTrailers.map(caja => ({ value: caja.caja_id, label: caja.no_caja }))}
                                    placeholder="Seleccionar Trailer"
                                    isLoading={loadingCajas} isDisabled={loadingCajas || !!errorCajas}
                                    styles={selectStyles} isClearable
                                />
                            </>
                        )}
                        {trailerType === 'externa' && (
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px' }}>
                                <div style={{ flexGrow: 1 }}>
                                    <label>Trailer (Caja Externa):</label>
                                    <Select
                                        id='caja_externa_id' name='caja_externa_id'
                                        value={activeExternalTrailers.find(c => c.caja_externa_id === formData.caja_externa_id) ? { value: formData.caja_externa_id, label: activeExternalTrailers.find(c => c.caja_externa_id === formData.caja_externa_id).no_caja } : null}
                                        onChange={(selected) => setForm('caja_externa_id', selected ? selected.value : '')}
                                        options={activeExternalTrailers.map(caja => ({ value: caja.caja_externa_id, label: caja.no_caja }))}
                                        placeholder="Seleccionar Trailer"
                                        isLoading={loadingCajasExternas} isDisabled={loadingCajasExternas || !!errorCajasExternas}
                                        styles={selectStyles} isClearable
                                    />
                                </div>
                                <button type='button' onClick={() => setIsModalCajaExternaOpen(true)} className="accept-button" style={{ height: '48px', flexShrink: 0, padding: '0 15px' }} title="Registrar Nueva Caja Externa">+</button>
                            </div>
                        )}
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
                            <CreatableSelect
                                id={`company_id-${index}`}
                                name={`company_id-${index}`}
                                isClearable
                                value={companyOptions.find(c => c.value === etapa.company_id) || null}
                                onChange={(selected) => handleEtapaChange(index, 'company_id', selected ? selected.value : '')}
                                onCreateOption={(inputValue) => handleCreateCompany(inputValue, index)}
                                options={companyOptions}
                                placeholder="Seleccionar o Crear Compañía"
                                isLoading={loadingCompanies || isCreatingCompany}

                                styles={selectStyles}
                                formatCreateLabel={(inputValue) => `Crear nueva compañía: "${inputValue}"`}
                            />
                            {/* {errorCompanies && <p className="error-text">Error cargando companies</p>} */}
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
                            <CreatableSelect
                                id={`warehouse_origin_id-${index}`}
                                name={`warehouse_origin_id-${index}`}
                                isClearable
                                value={warehouseOptions.find(w => w.value === etapa.warehouse_origin_id) || null}
                                onChange={(selected) => handleEtapaChange(index, 'warehouse_origin_id', selected ? selected.value : '')}
                                onCreateOption={(inputValue) => handleCreateWarehouse(inputValue, index, 'warehouse_origin_id')}
                                options={warehouseOptions}
                                placeholder="Seleccionar o Crear Bodega Origen"
                                isLoading={loadingWarehouses || isCreatingWarehouse}

                                styles={selectStyles}
                                formatCreateLabel={(inputValue) => `Crear nueva bodega: "${inputValue}"`}
                            />
                            {/* {errorWarehouses && <p className="error-text">Error cargando warehouses</p>} */}
                        </div>
                        <div className="column">
                            <label htmlFor={`warehouse_destination_id-${index}`} style={{ marginTop: '10px' }}>Destination Warehouse:</label>
                            <CreatableSelect
                                id={`warehouse_destination_id-${index}`}
                                name={`warehouse_destination_id-${index}`}
                                isClearable
                                value={warehouseOptions.find(w => w.value === etapa.warehouse_destination_id) || null}
                                onChange={(selected) => handleEtapaChange(index, 'warehouse_destination_id', selected ? selected.value : '')}
                                onCreateOption={(inputValue) => handleCreateWarehouse(inputValue, index, 'warehouse_destination_id')}
                                options={warehouseOptions}
                                placeholder="Seleccionar o Crear Bodega Destino"
                                isLoading={loadingWarehouses || isCreatingWarehouse}

                                styles={selectStyles}
                                formatCreateLabel={(inputValue) => `Crear nueva bodega: "${inputValue}"`}
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
                            <label htmlFor={`millas_pcmiller-${index}`} >Millas PC Miller Cortas:</label>
                            <input
                                type="number" id={`millas_pcmiller-${index}`} name={`millas_pcmiller-${index}`}
                                value={etapa.millas_pcmiller} // Corregido: usar etapa.millas_pcmiller
                                onChange={(e) => handleEtapaChange(index, 'millas_pcmiller', e.target.value)}
                                placeholder="Ej: 850"
                                className="form-input"
                            />
                        </div>
                    </div>
                    <div className="input-columns">
                        <div className="column"></div>
                        <div className="column">
                            <label htmlFor={`millas_pcmiller_practicas-${index}`} >Millas PC Miller Practicas:</label>
                            <input
                                type="number" id={`millas_pcmiller_practicas-${index}`} name={`millas_pcmiller_practicas-${index}`}
                                value={etapa.millas_pcmiller_practicas}
                                onChange={(e) => handleEtapaChange(index, 'millas_pcmiller_practicas', e.target.value)}
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
                                    {/* <div className="column">
                                        <label>Orden Retiro:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('orden_retiro', index)}>Subir</button>
                                        {etapa.documentos?.orden_retiro && (<p className="doc-info"><i>{etapa.documentos.orden_retiro.fileName}{etapa.documentos.orden_retiro.vencimiento ? ` - V: ${etapa.documentos.orden_retiro.vencimiento}` : ''}</i></p>)}
                                    </div> */}
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
                                        <label>Entry:</label>
                                        <button type="button" className="upload-button" onClick={() => abrirModal('entry', index)}>Subir</button>
                                        {etapa.documentos?.entry && (<p className="doc-info"><i>{etapa.documentos.entry.fileName}</i></p>)}
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

            {IsModalCajaExternaOpen && (
                <ModalCajaExterna
                    isOpen={IsModalCajaExternaOpen}
                    onClose={() => setIsModalCajaExternaOpen(false)}
                    onSave={handleSaveExternalCaja}
                />

            )}
        </form>
    );
};

// *** Exportar el componente renombrado ***
export default TripForm;