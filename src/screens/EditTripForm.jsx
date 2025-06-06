import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';

import ModalArchivo from '../components/ModalArchivo';
import useFetchActiveDrivers from '../hooks/useFetchActiveDrivers';
import useFetchActiveTrucks from '../hooks/useFetchActiveTrucks';
import useFetchActiveTrailers from '../hooks/useFetchActiveTrailers';
import useFetchCompanies from '../hooks/useFetchCompanies';
import useFetchWarehouses from '../hooks/useFetchWarehouses';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';
import { format, parseISO } from 'date-fns';
import './css/EditTripForm.css';

const initialBorderCrossingDocs = {
    ima_invoice: null, carta_porte: null, ci: null, entry: null,
    manifiesto: null, cita_entrega: null, bl: null, orden_retiro: null, bl_firmado: null,
};
const initialNormalTripDocs = {
    ima_invoice: null, ci: null,
    cita_entrega: null, bl: null, bl_firmado: null,
};

const selectStyles = {
    control: (provided) => ({
        ...provided, padding: '4px', borderRadius: '5px', border: '1px solid #ccc',
        fontSize: '16px', minHeight: '40px',
    }),
};

const EditTripForm = () => {
    const apiHost = import.meta.env.VITE_API_HOST;
    const { tripId } = useParams();
    const navigate = useNavigate();


    const [initialTripData, setInitialTripData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Estados para la creación dinámica de compañías/bodegas
    const [isCreatingCompany, setIsCreatingCompany] = useState(false);
    const [isCreatingWarehouse, setIsCreatingWarehouse] = useState(false);


    const [formData, setFormData] = useState({
        trip_number: '', driver_id: '', truck_id: '', caja_id: '',

    });
    const [etapas, setEtapas] = useState([]);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalTarget, setModalTarget] = useState({ stageIndex: null, docType: null });
    const [mostrarFechaVencimientoModal, setMostrarFechaVencimientoModal] = useState(true);


    const { activeDrivers, loading: loadingDrivers } = useFetchActiveDrivers();
    const { activeTrucks, loading: loadingTrucks } = useFetchActiveTrucks();
    const { activeTrailers, loading: loadingCajas } = useFetchActiveTrailers();
    const { activeCompanies, loading: loadingCompanies, refetchCompanies } = useFetchCompanies();
    const { activeWarehouses, loading: loadingWarehouses, refetchWarehouses } = useFetchWarehouses();

    // *** FUNCIÓN getDocumentUrl AÑADIDA AQUÍ ***
    const getDocumentUrl = (serverPath) => {
        if (!serverPath) return '#'; // Retorna un enlace no funcional si no hay ruta


        const uploadsWebPath = `${apiHost}/Uploads/Trips/`;// *** AJUSTA ESTO SI TU RUTA WEB ES DIFERENTE ***

        // Extraer solo el nombre del archivo de la ruta del servidor
        const fileName = serverPath.split(/[\\/]/).pop();
        if (!fileName) return '#';

        // Construir la URL web completa
        return `${uploadsWebPath}${encodeURIComponent(fileName)}`;
    };

    useEffect(() => {
        const fetchTripDetails = async () => {
            if (!tripId) { setError("ID de viaje inválido."); setLoading(false); return; }
            console.log(`Fetching details for Trip ID: ${tripId}`);
            setLoading(true); setError(null);
            try {
                const apiUrl = `${apiHost}/new_trips.php`; // URL API
                const apiFormData = new FormData();
                apiFormData.append('op', 'getById');
                apiFormData.append('trip_id', tripId);

                const response = await fetch(apiUrl, { method: 'POST', body: apiFormData });
                const responseText = await response.text();
                console.log(`Raw response getById (Trip ${tripId}):`, responseText);
                let result;
                try { result = JSON.parse(responseText); }
                catch (e) { throw new Error(`Respuesta inválida: ${responseText}`); }

                if (response.ok && result.status === "success" && result.trip) {
                    setInitialTripData(result);
                    console.log("Datos cargados para edición:", result);


                    const trip = result.trip;
                    setFormData({
                        trip_number: trip.trip_number || '',
                        driver_id: trip.driver_id || '',
                        truck_id: trip.truck_id || '',
                        caja_id: trip.caja_id || '',
                        status: trip.status || 'In Transit',
                        driver_nombre: trip.driver_nombre || '',
                        truck_unidad: trip.truck_unidad || '',
                        caja_no_caja: trip.caja_no_caja || '',
                    });


                    // *** INICIALIZAR ETAPAS CON stageType y DOCUMENTOS CORRECTOS ***
                    const processedEtapas = result.etapas.map(etapa => {
                        let loadingDateObj = null;
                        if (etapa.loading_date && typeof etapa.loading_date === 'string') { try { loadingDateObj = parseISO(etapa.loading_date); } catch (e) { } }
                        let deliveryDateObj = null;
                        if (etapa.delivery_date && typeof etapa.delivery_date === 'string') { try { deliveryDateObj = parseISO(etapa.delivery_date); } catch (e) { } }

                        // Determinar qué estructura de documentos usar para esta etapa
                        // Asume que el backend devuelve 'stageType'. Si no, usa un default.
                        console.log(etapa.stageType)
                        const tipoEtapaActual = etapa.stageType || 'borderCrossing';
                        console.log(tipoEtapaActual)// Default a borderCrossing si no viene
                        let documentosBase;
                        if (tipoEtapaActual === 'normalTrip') {
                            documentosBase = { ...initialNormalTripDocs };
                        } else { // Asumir borderCrossing por defecto o si es explícito
                            documentosBase = { ...initialBorderCrossingDocs };
                        }
                        // Puedes añadir más 'else if' para otros tipos como 'localTrip'
                        console.log(tipoEtapaActual)
                        // Poblar con los documentos existentes
                        if (Array.isArray(etapa.documentos_adjuntos)) {
                            etapa.documentos_adjuntos.forEach(doc => {
                                // Solo poblar si el tipo de documento existe en la estructura base para este tipo de etapa
                                if (documentosBase.hasOwnProperty(doc.tipo_documento)) {
                                    documentosBase[doc.tipo_documento] = {
                                        fileName: doc.nombre_archivo?.split(/[\\/]/).pop() || 'Archivo existente',
                                        vencimiento: doc.fecha_vencimiento || null, file: null,
                                        document_id: doc.document_id,
                                        serverPath: doc.path_servidor_real
                                    };
                                }
                            });
                        }
                        return {
                            ...etapa, // Copiar campos originales
                            stageType: tipoEtapaActual, // Asegurar que el tipo esté
                            loading_date: loadingDateObj, delivery_date: deliveryDateObj,
                            documentos: documentosBase,
                            // Usar la estructura correcta poblada
                        };
                    });
                    setEtapas(processedEtapas);
                    console.log(processedEtapas)

                } else {
                    throw new Error(result.message || result.error || `No se encontró info completa del viaje ${tripId}`);
                }
            } catch (err) {
                console.error("Error fetching trip details:", err);
                setError(err.message);
                Swal.fire('Error', `No se pudo cargar el viaje para editar: ${err.message}`, 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchTripDetails();
    }, [tripId]);


    const handleFormChange = (name, value) => {
        setFormData(prevData => ({ ...prevData, [name]: value }));
    };

    const handleStageChange = (index, field, value) => {
        setEtapas(prevEtapas => {
            const updatedEtapas = [...prevEtapas];
            const updatedEtapa = { ...updatedEtapas[index] };
            updatedEtapa[field] = value;
            updatedEtapas[index] = updatedEtapa;
            return updatedEtapas;
        });
    };

    const handleGuardarDocumentoEtapa = (data) => {
        console.log("Datos recibidos del ModalArchivo:", data); // <--- Añade esto
        // ... resto de la función ...
        const { stageIndex, docType } = modalTarget;
        if (stageIndex === null || !docType) return;
        setEtapas(prevEtapas => {
            const updatedEtapas = [...prevEtapas];
            const etapaActual = updatedEtapas[stageIndex];
            const updatedEtapa = {
                ...etapaActual,
                documentos: {
                    ...etapaActual.documentos,
                    [docType]: {
                        fileName: data.fileName,
                        vencimiento: data.vencimiento,
                        file: data.file,
                        document_id: etapaActual.documentos[docType]?.document_id || null
                    }
                }
            };
            updatedEtapas[stageIndex] = updatedEtapa;
            return updatedEtapas;
        });
        setModalAbierto(false);
        setModalTarget({ stageIndex: null, docType: null });
    };

    const abrirModal = (docType, stageIndex = null) => {
        if (stageIndex === null) { return; }
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
        if (docType === null || stageIndex === null || !etapas[stageIndex]) return null;
        return etapas[stageIndex].documentos[docType] || null;
    };



    const agregarNuevaEtapa = (tipoEtapa) => {
        let initialDocs;
        if (tipoEtapa === 'borderCrossing') { initialDocs = { ...initialBorderCrossingDocs }; }
        else if (tipoEtapa === 'normalTrip') { initialDocs = { ...initialNormalTripDocs }; }
        // else if (tipoEtapa === 'localTrip') { initialDocs = { ...initialLocalTripDocs }; } // Si añades más tipos
        else { initialDocs = {}; }

        setEtapas(prevEtapas => [
            ...prevEtapas,
            {
                trip_stage_id: null, stage_number: prevEtapas.length + 1,
                stageType: tipoEtapa, // Asignar tipo
                origin: '', destination: '', zip_code_origin: '', zip_code_destination: '',
                loading_date: null, delivery_date: null, company_id: null, travel_direction: '',
                warehouse_origin_id: null, warehouse_destination_id: null, ci_number: '',
                rate_tarifa: '', millas_pcmiller: '', estatus: 'In Transit',
                documentos: initialDocs // Usar docs correctos
            }
        ]);
    };

    const eliminarEtapa = (index) => {
        if (etapas.length <= 1) {
            Swal.fire('Acción no permitida', 'Debe haber al menos una etapa.', 'warning'); return;
        }
        const etapaAEliminar = etapas[index];
        Swal.fire({
            title: `¿Eliminar Etapa ${etapaAEliminar.stage_number}?`,
            text: "Deberás guardar los cambios para que la eliminación sea permanente.",
            icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6', confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                const updatedEtapas = etapas.filter((_, i) => i !== index);
                const renumeradas = updatedEtapas.map((etapa, i) => ({ ...etapa, stage_number: i + 1 }));
                setEtapas(renumeradas);

            }
        });
    };

    const handleSaveChanges = async () => {
        console.log("Guardando cambios para Trip ID:", tripId);
        // --- Validaciones ---
        if (!formData.driver_id || !formData.truck_id) {
            Swal.fire('Campos incompletos', 'Driver y Truck son obligatorios.', 'warning'); return;
        }

        const dataToSend = new FormData();
        dataToSend.append('op', 'Update');
        dataToSend.append('trip_id', tripId);


        Object.entries(formData).forEach(([key, value]) => {
            if (key !== 'status') {
                dataToSend.append(key, value || '');
            }
        });

        // Procesar etapas para JSON
        const etapasParaJson = etapas.map(etapa => ({
            trip_stage_id: etapa.trip_stage_id || null,
            stage_number: etapa.stage_number,
            // *** AÑADIR ESTA LÍNEA ***
            stageType: etapa.stageType, // <-- Asegúrate de incluir esto
            // *** FIN DE LÍNEA AÑADIDA ***
            origin: etapa.origin, destination: etapa.destination,
            zip_code_origin: etapa.zip_code_origin, zip_code_destination: etapa.zip_code_destination,
            loading_date: etapa.loading_date instanceof Date ? format(etapa.loading_date, 'yyyy-MM-dd') : null,
            delivery_date: etapa.delivery_date instanceof Date ? format(etapa.delivery_date, 'yyyy-MM-dd') : null,
            company_id: etapa.company_id, travel_direction: etapa.travel_direction,
            warehouse_origin_id: etapa.warehouse_origin_id, warehouse_destination_id: etapa.warehouse_destination_id,
            ci_number: etapa.ci_number,
            rate_tarifa: etapa.rate_tarifa,
            millas_pcmiller: etapa.millas_pcmiller,
            estatus: etapa.estatus,
            // El array 'documentos' aquí probablemente no es necesario para el backend en 'Update',
            // ya que solo procesa archivos nuevos de $_FILES. Puedes simplificarlo o quitarlo si quieres.
            documentos: Object.entries(etapa.documentos).map(([tipo, docData]) => ({
                tipo_documento: tipo,
                document_id: docData?.document_id || null,
                fileName: docData?.fileName || null,
                vencimiento: docData?.vencimiento || null,
                hasNewFile: !!(docData && docData.file instanceof File) // Indica si hay un archivo nuevo en el estado
            })).filter(doc => doc.fileName !== null) // Solo enviar info de docs que existen en el estado
        }));
        dataToSend.append('etapas', JSON.stringify(etapasParaJson));


        // Añadir SOLO los archivos NUEVOS
        etapas.forEach((etapa, index) => {
            Object.entries(etapa.documentos).forEach(([docType, docData]) => {
                if (docData && docData.file instanceof File) {
                    console.log(`Archivo NUEVO encontrado para Etapa ${index}, Tipo ${docType}:`, docData.file); // <--- Añade esto
                    const fieldName = `etapa_${index}_${docType}_file`;
                    dataToSend.append(fieldName, docData.file, docData.fileName);
                    // ... (código para replace_id si aplica) ...
                } else {
                    // Opcional: Loguear si no hay archivo nuevo
                    // console.log(`No hay archivo nuevo para Etapa ${index}, Tipo ${docType}`);
                }
                if (docData && docData.file instanceof File) {
                    const fieldName = `etapa_${index}_${docType}_file`;
                    dataToSend.append(fieldName, docData.file, docData.fileName);

                    if (docData.document_id) {
                        dataToSend.append(`etapa_${index}_${docType}_replace_id`, docData.document_id);
                    }
                }
            });
        });


        const initialStageIds = initialTripData?.etapas.map(e => e.trip_stage_id).filter(id => id) || [];
        const currentStageIds = etapas.map(e => e.trip_stage_id).filter(id => id);
        const deletedStageIds = initialStageIds.filter(id => !currentStageIds.includes(id));
        if (deletedStageIds.length > 0) {
            dataToSend.append('deleted_stage_ids', JSON.stringify(deletedStageIds));
            console.log("Enviando etapas a eliminar:", deletedStageIds);
        }

        console.log("--- FormData para Update ---");
        for (let [key, value] of dataToSend.entries()) { console.log(`${key}:`, value); }
        console.log("--- Fin FormData ---");


        Swal.fire('Pendiente', 'La lógica para guardar cambios (op=Update) en el backend aún no está implementada.', 'info');

        try {
            const apiUrl = `${apiHost}/new_trips.php`;
            const response = await fetch(apiUrl, { method: 'POST', body: dataToSend });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                Swal.fire('¡Guardado!', result.message || 'Cambios guardados.', 'success');
                navigate('/admin-trips');
            } else { throw new Error(result.error || result.message || 'Error al guardar.'); }
        } catch (err) { Swal.fire('Error', `No se guardaron los cambios: ${err.message}`, 'error'); }

        //##DUDA##

    };


    // Opciones memoizadas para React-Select
    const driverOptions = useMemo(() => {
        const options = activeDrivers.map(d => ({ value: d.driver_id, label: d.nombre }));
        // Si el driver actual del formData no está en la lista de activos, añadirlo
        if (formData.driver_id && !activeDrivers.some(d => d.driver_id === formData.driver_id)) {
            options.unshift({ value: formData.driver_id, label: formData.driver_nombre || `ID: ${formData.driver_id} (Inactivo/No encontrado)` });
        }
        return options;
    }, [activeDrivers, formData.driver_id, formData.driver_nombre]);

    const truckOptions = useMemo(() => {
        const options = activeTrucks.map(t => ({ value: t.truck_id, label: t.unidad }));
        if (formData.truck_id && !activeTrucks.some(t => t.truck_id === formData.truck_id)) {
            options.unshift({ value: formData.truck_id, label: formData.truck_unidad || `ID: ${formData.truck_id} (Inactivo/No encontrado)` });
        }
        return options;
    }, [activeTrucks, formData.truck_id, formData.truck_unidad]);

    const trailerOptions = useMemo(() => {
        const options = activeTrailers.map(c => ({ value: c.caja_id, label: c.no_caja }));
        if (formData.caja_id && !activeTrailers.some(c => c.caja_id === formData.caja_id)) {
            options.unshift({ value: formData.caja_id, label: formData.caja_no_caja || `ID: ${formData.caja_id} (Inactivo/No encontrado)` });
        }
        return options;
    }, [activeTrailers, formData.caja_id, formData.caja_no_caja]);

    const companyOptions = useMemo(() => {
        const options = activeCompanies.map(c => ({ value: c.company_id, label: c.nombre_compania }));
        // ###CORRECCIÓN: Manejo de compañía inactiva/no encontrada para el Select principal
        if (formData.company_id && !activeCompanies.some(c => c.company_id === formData.company_id)) {
            options.unshift({ value: formData.company_id, label: formData.nombre_compania || `ID: ${formData.company_id} (Inactiva/No encontrada)` });
        }
        return options;
    }, [activeCompanies, formData.company_id, formData.nombre_compania]);

    const warehouseOptions = useMemo(() => {
        const options = activeWarehouses.map(w => ({ value: w.warehouse_id, label: w.nombre_almacen }));
        return options;
    }, [activeWarehouses]);



    const handleCreateCompany = async (inputValue, stageIndex, companyFieldKey) => {
        setIsCreatingCompany(true);
        const newCompanyFormData = new FormData();
        newCompanyFormData.append('op', 'CreateCompany');
        newCompanyFormData.append('nombre_compania', inputValue);
        try {
            const response = await fetch(`${apiHost}/companies.php`, { method: 'POST', body: newCompanyFormData });
            const result = await response.json();
            if (result.status === "success" && result.company && result.company.company_id) {
                const newOption = { value: result.company.company_id, label: result.company.nombre_compania };
                refetchCompanies(); // Refrescar la lista de compañías

                // ### CORRECCIÓN: Actualizar el estado del formulario principal o de la etapa
                if (stageIndex === null && companyFieldKey) { // Es el select del formulario principal
                    handleFormChange(companyFieldKey, newOption.value);
                    // handleFormChange('nombre_compania', newOption.label); // Ya no es necesario si el select lo maneja
                } else if (stageIndex !== null && companyFieldKey) { // Es un select de una etapa
                    handleStageChange(stageIndex, companyFieldKey, newOption.value);
                }

                Swal.fire('¡Éxito!', `Compañía "${inputValue}" creada y seleccionada.`, 'success');
                return newOption; // Devolver la nueva opción para que CreatableSelect la seleccione
            } else {
                Swal.fire('Error', `No se pudo crear la compañía: ${result.message || 'Error desconocido.'}`, 'error');
                return null;
            }
        } catch (error) {
            console.error("Error creando compañía:", error);
            Swal.fire('Error', 'Error de conexión al crear la compañía.', 'error');
            return null;
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
            const response = await fetch(`${apiHost}/warehouses.php`, { method: 'POST', body: newWarehouseFormData });
            const result = await response.json();
            if (result.status === "success" && result.warehouse && result.warehouse.warehouse_id) {
                const newOption = { value: result.warehouse.warehouse_id, label: result.warehouse.nombre_almacen };
                refetchWarehouses(); // ###CORRECCIÓN: Refrescar la lista de bodegas
                // ###CORRECCIÓN: Actualizar el estado del formulario principal o de la etapa
                if (stageIndex === null && warehouseFieldKey) { // Es el select del formulario principal
                    // Asumiendo que hay campos en formData para el almacén principal
                    handleFormChange(warehouseFieldKey, newOption.value);
                    // handleFormChange('nombre_almacen_principal', newOption.label); // Si tienes un campo para el nombre
                } else if (stageIndex !== null && warehouseFieldKey) { // Es un select de una etapa
                    handleStageChange(stageIndex, warehouseFieldKey, newOption.value);
                }
                Swal.fire('¡Éxito!', `Bodega "${inputValue}" creada y seleccionada.`, 'success');
                return newOption;
            } else {
                Swal.fire('Error', `No se pudo crear la bodega: ${result.message || 'Error desconocido.'}`, 'error');
                return null;
            }
        } catch (error) {
            console.error("Error creando bodega:", error);
            Swal.fire('Error', 'Error de conexión al crear la bodega.', 'error');
            return null;
        } finally {
            setIsCreatingWarehouse(false);
        }
    };

    const isFormDisabled = formData.status === 'Completed' || formData.status === 'Cancelled';

    // --- Renderizado ---
    if (loading) { return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}> <CircularProgress /> <Typography ml={2}>Cargando datos...</Typography> </Box>); }
    if (error) { return (<Box sx={{ padding: 2 }}> <Alert severity="error">Error: {error}</Alert> <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2 }}>Volver</Button> </Box>); }
    if (!initialTripData) { return (<Box sx={{ padding: 2 }}> <Alert severity="warning">No se encontraron datos.</Alert> <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2 }}>Volver</Button> </Box>); }

    // Renderizar el formulario
    return (
        <div className="trip-screen-container">
            <div className="trip-screen-wrapper">
                <div className="trip-card-edit">
                    <div className="trip-container">
                        <legend className="card-label">Editando Viaje #{formData.trip_number || tripId} - Estado: {formData.status || 'Desconocido'}</legend>
                    </div>
                </div>



            </div>
            <div className="additional-card">
                <div className="card-container">
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveChanges(); }} className="card-container" >


                        <div className="form-actions">
                            <Button type="button" variant="outlined" onClick={() => navigate(-1)}>Cancelar / Volver</Button>
                            <Button type="submit" variant="contained" color="primary" sx={{ ml: 1 }}>Guardar Cambios</Button>
                        </div>


                        <div className="form-section">
                            {/* <legend className="card-label">Editando Viaje #{formData.trip_number || tripId} - Estado: {formData.status || 'Desconocido'}</legend> */}
                            <div className="input-columns">

                                <div className="column">
                                    <label htmlFor="driver_id">Driver:</label>
                                    <Select id="driver_id"
                                        name="driver_id"
                                        value={formData.driver_id ? { value: formData.driver_id, label: formData.driver_nombre || `ID: ${formData.driver_id}` } : null}
                                        onChange={(selected) => {
                                            handleFormChange('driver_id', selected ? selected.value : '');
                                            // Actualizar nombre si se selecciona de la lista activa
                                            const driverDetails = activeDrivers.find(d => d.driver_id === selected?.value);
                                            handleFormChange('driver_nombre', driverDetails ? driverDetails.nombre : '');
                                        }}
                                        options={driverOptions} // Usar opciones memoizadas
                                        placeholder="Seleccionar Driver"
                                        isLoading={loadingDrivers}
                                        styles={selectStyles}
                                        isClearable
                                        isDisabled={isFormDisabled}
                                    />
                                </div>
                                <div className="column">
                                    <label htmlFor="truck_id">Truck:</label>
                                    <Select id="truck_id"
                                        name="truck_id"
                                        value={formData.truck_id ? { value: formData.truck_id, label: formData.truck_unidad || `ID: ${formData.truck_id}` } : null}
                                        onChange={(selected) => {
                                            handleFormChange('truck_id', selected ? selected.value : '');
                                            const truckDetails = activeTrucks.find(t => t.truck_id === selected?.value);
                                            handleFormChange('truck_unidad', truckDetails ? truckDetails.unidad : '');
                                        }}
                                        options={truckOptions} // Usar opciones memoizadas
                                        placeholder="Seleccionar Truck"
                                        isLoading={loadingTrucks}
                                        styles={selectStyles}
                                        isClearable
                                        isDisabled={isFormDisabled}
                                    />
                                </div>
                                <div className="column">
                                    <label htmlFor="caja_id">Trailer (Caja):</label>
                                    <Select
                                        id="caja_id"
                                        name="caja_id"
                                        value={formData.caja_id ? { value: formData.caja_id, label: formData.caja_no_caja || `ID: ${formData.caja_id}` } : null}
                                        onChange={(selected) => {
                                            handleFormChange('caja_id', selected ? selected.value : '');
                                            const trailerDetails = activeTrailers.find(c => c.caja_id === selected?.value);
                                            handleFormChange('caja_no_caja', trailerDetails ? trailerDetails.no_caja : '');
                                        }}
                                        options={trailerOptions} // Usar opciones memoizadas
                                        placeholder="Seleccionar Trailer"
                                        isLoading={loadingCajas}
                                        styles={selectStyles}
                                        isClearable
                                        isDisabled={isFormDisabled}
                                    />
                                </div>
                            </div>
                        </div>

                        <br />


                        {etapas.map((etapa, index) => (
                            <div key={etapa.trip_stage_id || `new-stage-${index}`} className="etapa-container form-section">
                                <div className="card-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '10px', marginBottom: '10px' }}>
                                    {/* Mostrar tipo de etapa */}
                                    <span>{`Etapa ${etapa.stage_number} (${etapa.stageType === 'borderCrossing' ? 'Cruce Fronterizo' : 'Viaje Normal'})`}</span>
                                    {etapas.length > 0 && (<button type="button" className="delete-button" onClick={() => eliminarEtapa(index)} title="Eliminar Etapa" disabled={isFormDisabled}>&#x2716;</button>)}
                                </div>

                                <legend className="card-label">Origen / Destino / Detalles</legend>
                                <div className="input-columns">
                                    <div className="column">
                                        <label>Company:</label>
                                        <CreatableSelect // ###CORRECCIÓN: CreatableSelect para Company en Etapa
                                            value={companyOptions.find(opt => opt.value === etapa.company_id) || null}
                                            onChange={(selected) => handleStageChange(index, 'company_id', selected ? selected.value : '')}
                                            onCreateOption={(inputValue) => handleCreateCompany(inputValue, index, 'company_id')} // ###CORRECCIÓN: Pasar index y 'company_id'
                                            options={companyOptions}
                                            placeholder="Seleccionar o Crear Company"
                                            isLoading={loadingCompanies || isCreatingCompany}
                                            styles={selectStyles}
                                            isClearable
                                            formatCreateLabel={(inputValue) => `Crear nueva compañía: "${inputValue}"`}
                                            isDisabled={isFormDisabled}
                                        />
                                    </div>

                                    <div className="column">
                                        <label>Travel Direction:</label>
                                        <Select
                                            value={etapa.travel_direction ? { value: etapa.travel_direction, label: etapa.travel_direction } : null}
                                            onChange={(selected) => handleStageChange(index, 'travel_direction', selected ? selected.value : '')}
                                            options={[{ value: 'Going Up', label: 'Going Up' }, { value: 'Going Down', label: 'Going Down' }]}
                                            placeholder="Seleccionar Dirección"
                                            styles={selectStyles}
                                            isClearable 
                                            isDisabled={isFormDisabled}
                                            />
                                    </div>

                                    <div className="column">
                                        <label>CI Number:</label>
                                        <input
                                            type="text"
                                            value={etapa.ci_number}
                                            onChange={(e) => handleStageChange(index, 'ci_number', e.target.value)}
                                            placeholder="Número CI Etapa"
                                            className="form-input"
                                            readOnly={isFormDisabled}
                                             />
                                    </div>

                                </div>

                                <div className="input-columns">
                                    <div className="column">
                                        <label style={{ marginTop: '10px' }}>Origin Warehouse:</label>
                                        <CreatableSelect // ###Agregar: CreatableSelect para Origin Warehouse en Etapa
                                            value={warehouseOptions.find(opt => opt.value === etapa.warehouse_origin_id) || null}
                                            onChange={(selected) => handleStageChange(index, 'warehouse_origin_id', selected ? selected.value : '')}
                                            onCreateOption={(inputValue) => handleCreateWarehouse(inputValue, index, 'warehouse_origin_id')}
                                            options={warehouseOptions}
                                            placeholder="Seleccionar o Crear Bodega Origen"
                                            isLoading={loadingWarehouses || isCreatingWarehouse}
                                            styles={selectStyles}
                                            isClearable
                                            formatCreateLabel={(inputValue) => `Crear nueva bodega: "${inputValue}"`}
                                            isDisabled={isFormDisabled}
                                        />
                                    </div>

                                    <div className="column">
                                        <label style={{ marginTop: '10px' }}>Destination Warehouse:</label>
                                        <CreatableSelect // ###Agregar: CreatableSelect para Destination Warehouse en Etapa
                                            value={warehouseOptions.find(opt => opt.value === etapa.warehouse_destination_id) || null}
                                            onChange={(selected) => handleStageChange(index, 'warehouse_destination_id', selected ? selected.value : '')}
                                            onCreateOption={(inputValue) => handleCreateWarehouse(inputValue, index, 'warehouse_destination_id')}
                                            options={warehouseOptions}
                                            placeholder="Seleccionar o Crear Bodega Destino"
                                            isLoading={loadingWarehouses || isCreatingWarehouse}
                                            styles={selectStyles}
                                            isClearable
                                            formatCreateLabel={(inputValue) => `Crear nueva bodega: "${inputValue}"`}
                                            isDisabled={isFormDisabled}
                                        />
                                    </div>

                                </div>

                                <div className="input-columns">
                                    <div className="column">
                                        <label style={{ marginTop: '10px' }}>Origin City/State:</label>
                                        <input
                                            type="text"
                                            value={etapa.origin}
                                            onChange={(e) => handleStageChange(index, 'origin', e.target.value)}
                                            placeholder="Ciudad/Estado Origen"
                                            className="form-input"
                                            readOnly={isFormDisabled}
                                            />
                                    </div>

                                    <div className="column">
                                        <label style={{ marginTop: '10px' }}>Destination City/State:</label>
                                        <input
                                            type="text"
                                            value={etapa.destination}
                                            onChange={(e) => handleStageChange(index, 'destination', e.target.value)}
                                            placeholder="Ciudad/Estado Destino"
                                            className="form-input" 
                                            readOnly={isFormDisabled}
                                            />
                                    </div>

                                </div>

                                <div className="input-columns">
                                    <div className="column">
                                        <label style={{ marginTop: '10px' }}>Zip Code Origin:</label>
                                        <input
                                            type="text"
                                            value={etapa.zip_code_origin}
                                            onChange={(e) => handleStageChange(index, 'zip_code_origin', e.target.value)}
                                            placeholder="Zip Origen"
                                            className="form-input" 
                                            readOnly={isFormDisabled}
                                            />
                                    </div>

                                    <div className="column">
                                        <label style={{ marginTop: '10px' }}>Zip Code Destination:</label>
                                        <input
                                            type="text"
                                            value={etapa.zip_code_destination}
                                            onChange={(e) => handleStageChange(index, 'zip_code_destination', e.target.value)}
                                            placeholder="Zip Destino"
                                            className="form-input" 
                                            readOnly={isFormDisabled}
                                            />
                                    </div>

                                </div>

                                <div className="input-columns">
                                    <div className="column">
                                        <label style={{ marginTop: '10px' }}>Loading Date:</label>
                                        <DatePicker
                                            selected={etapa.loading_date}
                                            onChange={(date) => handleStageChange(index, 'loading_date', date)}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Fecha Carga"
                                            className="form-input date-picker-full-width"
                                            isClearable 
                                            disabled={isFormDisabled}
                                            />
                                    </div>

                                    <div className="column">
                                        <label style={{ marginTop: '10px' }}>Delivery Date:</label>
                                        <DatePicker
                                            selected={etapa.delivery_date}
                                            onChange={(date) => handleStageChange(index, 'delivery_date', date)}
                                            dateFormat="dd/MM/yyyy"
                                            placeholderText="Fecha Entrega"
                                            className="form-input date-picker-full-width"
                                            isClearable 
                                            disabled={isFormDisabled}
                                            />
                                    </div>

                                </div>

                                <div className="input-columns">
                                    <div className="column">
                                        <label style={{ marginTop: '10px' }}>Rate Tarifa (Etapa):</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={etapa.rate_tarifa}
                                            onChange={(e) => handleStageChange(index, 'rate_tarifa', e.target.value)}
                                            placeholder="Tarifa Etapa"
                                            className="form-input" 
                                            readOnly={isFormDisabled}
                                            />
                                    </div>

                                    <div className="column">
                                        <label style={{ marginTop: '10px' }}>Millas PC*Miler (Etapa):</label>
                                        <input
                                            type="number"
                                            step="1"
                                            value={etapa.millas_pcmiller}
                                            onChange={(e) => handleStageChange(index, 'millas_pcmiller', e.target.value)}
                                            placeholder="Millas Etapa"
                                            className="form-input" 
                                            readOnly={isFormDisabled}
                                            />
                                    </div>

                                </div>

                                {etapa.stageType === 'borderCrossing' && (
                                    <div className="subsection">
                                        <legend className="card-label">Documentos de Etapa {etapa.stage_number}</legend>
                                        <div className="input-columns">

                                            <div className="column">

                                                <div className="column">
                                                    <label htmlFor={`ima_invoice-${index}`}>IMA Invoice:</label>
                                                    <button type="button" className="upload-button" onClick={() => abrirModal('ima_invoice', index)} disabled={isFormDisabled}> Subir/Cambiar </button>
                                                    {etapa.documentos?.ima_invoice && (<p className="doc-info"><i> <a href={getDocumentUrl(etapa.documentos.ima_invoice.serverPath)} target="_blank" rel="noopener noreferrer">{etapa.documentos.ima_invoice.fileName}</a> {etapa.documentos.ima_invoice.vencimiento ? ` - V: ${etapa.documentos.ima_invoice.vencimiento}` : ''}</i></p>)}
                                                </div>

                                                <div className="column">
                                                    <label htmlFor={`carta_porte-${index}`}>Carta Porte:</label>
                                                    <button type="button" className="upload-button" onClick={() => abrirModal('carta_porte', index)} disabled={isFormDisabled}>Subir/Cambiar</button>
                                                    {etapa.documentos?.carta_porte && (<p className="doc-info"><i> <a href={getDocumentUrl(etapa.documentos.carta_porte.serverPath)} target="_blank" rel="noopener noreferrer">{etapa.documentos.carta_porte.fileName}</a> {etapa.documentos.carta_porte.vencimiento ? ` - V: ${etapa.documentos.carta_porte.vencimiento}` : ''}</i></p>)}
                                                </div>

                                                <div className="column">
                                                    <label htmlFor={`ci-${index}`}>CI:</label>
                                                    <button type="button" className="upload-button" onClick={() => abrirModal('ci', index)} disabled={isFormDisabled}>Subir/Cambiar</button>
                                                    {etapa.documentos?.ci && (<p className="doc-info"><i> <a href={getDocumentUrl(etapa.documentos.ci.serverPath)} target="_blank" rel="noopener noreferrer">{etapa.documentos.ci.fileName}</a> {etapa.documentos.ci.vencimiento ? ` - V: ${etapa.documentos.ci.vencimiento}` : ''}</i></p>)}
                                                </div>
                                            </div>

                                            <div className="column ">

                                                <div className="column">
                                                    <label htmlFor={`entry-${index}`}>Entry:</label>
                                                    <button type="button" className="upload-button" onClick={() => abrirModal('entry', index)} disabled={isFormDisabled}>Subir/Cambiar</button>
                                                    {etapa.documentos?.entry && (<p className="doc-info"><i> <a href={getDocumentUrl(etapa.documentos.entry.serverPath)} target="_blank" rel="noopener noreferrer">{etapa.documentos.entry.fileName}</a></i></p>)}
                                                </div>

                                                <div className="column">
                                                    <label htmlFor={`manifiesto-${index}`}>Manifiesto:</label>
                                                    <button type="button" className="upload-button" onClick={() => abrirModal('manifiesto', index)} disabled={isFormDisabled}>Subir/Cambiar</button>
                                                    {etapa.documentos?.manifiesto && (<p className="doc-info"><i> <a href={getDocumentUrl(etapa.documentos.manifiesto.serverPath)} target="_blank" rel="noopener noreferrer">{etapa.documentos.manifiesto.fileName}</a></i></p>)}
                                                </div>

                                                <div className="column">
                                                    <label htmlFor={`cita_entrega-${index}`}>Cita Entrega:</label>
                                                    <button type="button" className="upload-button" onClick={() => abrirModal('cita_entrega', index)} disabled={isFormDisabled}>Subir/Cambiar</button>
                                                    {etapa.documentos?.cita_entrega && (<p className="doc-info"><i> <a href={getDocumentUrl(etapa.documentos.cita_entrega.serverPath)} target="_blank" rel="noopener noreferrer">{etapa.documentos.cita_entrega.fileName}</a> {etapa.documentos.cita_entrega.vencimiento ? ` - V: ${etapa.documentos.cita_entrega.vencimiento}` : ''}</i></p>)}
                                                </div>
                                            </div>

                                            <div className="column">
                                                {/* BL */}
                                                <div className="column">
                                                    <label htmlFor={`bl-${index}`}>BL:</label>
                                                    <button type="button" className="upload-button" onClick={() => abrirModal('bl', index)} disabled={isFormDisabled}>Subir/Cambiar</button>
                                                    {etapa.documentos?.bl && (<p className="doc-info"><i> <a href={getDocumentUrl(etapa.documentos.bl.serverPath)} target="_blank" rel="noopener noreferrer">{etapa.documentos.bl.fileName}</a></i></p>)}
                                                </div>

                                                <div className="column">
                                                    <label htmlFor={`orden_retiro-${index}`}>Orden Retiro:</label>
                                                    <button type="button" className="upload-button" onClick={() => abrirModal('orden_retiro', index)} disabled={isFormDisabled}>Subir/Cambiar</button>
                                                    {etapa.documentos?.orden_retiro && (<p className="doc-info"><i> <a href={getDocumentUrl(etapa.documentos.orden_retiro.serverPath)} target="_blank" rel="noopener noreferrer">{etapa.documentos.orden_retiro.fileName}</a> {etapa.documentos.orden_retiro.vencimiento ? ` - V: ${etapa.documentos.orden_retiro.vencimiento}` : ''}</i></p>)}
                                                </div>

                                                <div className="column">
                                                    <label htmlFor={`bl_firmado-${index}`}>BL Firmado:</label>
                                                    <button type="button" className="upload-button" onClick={() => abrirModal('bl_firmado', index)} disabled={isFormDisabled}>Subir/Cambiar</button>
                                                    {etapa.documentos?.bl_firmado && (<p className="doc-info"><i> <a href={getDocumentUrl(etapa.documentos.bl_firmado.serverPath)} target="_blank" rel="noopener noreferrer">{etapa.documentos.bl_firmado.fileName}</a> {etapa.documentos.bl_firmado.vencimiento ? ` - V: ${etapa.documentos.bl_firmado.vencimiento}` : ''}</i></p>)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {etapa.stageType === 'normalTrip' && (
                                    <div className="subsection">
                                        <legend className="card-label">Documentos (Viaje Normal)</legend>
                                        <div className="input-columns">

                                            <div className="column">

                                                <div className="column">
                                                    <label htmlFor={`ima_invoice-${index}`}>IMA Invoice:</label>
                                                    <button type="button" className="upload-button" onClick={() => abrirModal('ima_invoice', index)} disabled={isFormDisabled}>Subir/Cambiar</button>
                                                    {etapa.documentos?.ima_invoice && (<p className="doc-info"><i> <a href={getDocumentUrl(etapa.documentos.ima_invoice.serverPath)} target="_blank" rel="noopener noreferrer">{etapa.documentos.ima_invoice.fileName}</a> {etapa.documentos.ima_invoice.vencimiento ? ` - V: ${etapa.documentos.ima_invoice.vencimiento}` : ''}</i></p>)}
                                                </div>


                                                <div className="column">
                                                    <label htmlFor={`ci-${index}`}>CI:</label>
                                                    <button type="button" className="upload-button" onClick={() => abrirModal('ci', index)} disabled={isFormDisabled}>Subir/Cambiar</button>
                                                    {etapa.documentos?.ci && (<p className="doc-info"><i> <a href={getDocumentUrl(etapa.documentos.ci.serverPath)} target="_blank" rel="noopener noreferrer">{etapa.documentos.ci.fileName}</a> {etapa.documentos.ci.vencimiento ? ` - V: ${etapa.documentos.ci.vencimiento}` : ''}</i></p>)}
                                                </div>

                                                <div className="column">
                                                    <label htmlFor={`cita_entrega-${index}`}>Cita Entrega:</label>
                                                    <button type="button" className="upload-button" onClick={() => abrirModal('cita_entrega', index)} disabled={isFormDisabled}>Subir/Cambiar</button>
                                                    {etapa.documentos?.cita_entrega && (<p className="doc-info"><i> <a href={getDocumentUrl(etapa.documentos.cita_entrega.serverPath)} target="_blank" rel="noopener noreferrer">{etapa.documentos.cita_entrega.fileName}</a> {etapa.documentos.cita_entrega.vencimiento ? ` - V: ${etapa.documentos.cita_entrega.vencimiento}` : ''}</i></p>)}
                                                </div>

                                            </div>


                                            <div className="column">
                                                {/* BL */}
                                                <div className="column">
                                                    <label htmlFor={`bl-${index}`}>BL:</label>
                                                    <button type="button" className="upload-button" onClick={() => abrirModal('bl', index)} disabled={isFormDisabled}>Subir/Cambiar</button>
                                                    {etapa.documentos?.bl && (<p className="doc-info"><i> <a href={getDocumentUrl(etapa.documentos.bl.serverPath)} target="_blank" rel="noopener noreferrer">{etapa.documentos.bl.fileName}</a></i></p>)}
                                                </div>



                                                <div className="column">
                                                    <label htmlFor={`bl_firmado-${index}`}>BL Firmado:</label>
                                                    <button type="button" className="upload-button" onClick={() => abrirModal('bl_firmado', index)} disabled={isFormDisabled}>Subir/Cambiar</button>
                                                    {etapa.documentos?.bl_firmado && (<p className="doc-info"><i> <a href={getDocumentUrl(etapa.documentos.bl_firmado.serverPath)} target="_blank" rel="noopener noreferrer">{etapa.documentos.bl_firmado.fileName}</a> {etapa.documentos.bl_firmado.vencimiento ? ` - V: ${etapa.documentos.bl_firmado.vencimiento}` : ''}</i></p>)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        <br />
                        {/* Botones para Añadir Etapas */}
                        <div className="add-stage-buttons-container" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button type="button" onClick={() => agregarNuevaEtapa('borderCrossing')} className="add-stage-button" disabled={isFormDisabled}>
                                + Añadir Etapa Cruce
                            </button>
                            <button type="button" onClick={() => agregarNuevaEtapa('normalTrip')} className="add-stage-button" disabled={isFormDisabled}>
                                + Añadir Etapa Normal
                            </button>
                            {/* Añadir más botones si tienes más tipos */}
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


                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button variant="outlined" onClick={() => navigate(-1)}>Cancelar / Volver</Button>


                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                disabled={isFormDisabled}
                                >Guardar Cambios
                            </Button>
                        </Box>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditTripForm;
