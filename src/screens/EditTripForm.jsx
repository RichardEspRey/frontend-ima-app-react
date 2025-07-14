import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';

import ModalArchivo from '../components/ModalArchivo';
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
import { format, parseISO } from 'date-fns';
import './css/EditTripForm.css';

const initialBorderCrossingDocs = {
    ima_invoice: null, doda: null, ci: null, entry: null,
    manifiesto: null, bl: null, orden_retiro: null, bl_firmado: null,
};
const initialNormalTripDocs = {
    ima_invoice: null, ci: null, bl: null, bl_firmado: null,
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

    const [isCreatingCompany, setIsCreatingCompany] = useState(false);
    const [isCreatingWarehouse, setIsCreatingWarehouse] = useState(false);
    const [tripMode, setTripMode] = useState('individual');

    const [formData, setFormData] = useState({
        trip_number: '', driver_id: '', driver_id_second: '', driver_nombre: '', driver_second_nombre: '', truck_id: '', caja_id: '',
        caja_externa_id: '', caja_no_caja: '', caja_externa_no_caja: ''
    });
    const [etapas, setEtapas] = useState([]);

    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalTarget, setModalTarget] = useState({ stageIndex: null, docType: null, stopIndex: null });
    const [mostrarFechaVencimientoModal, setMostrarFechaVencimientoModal] = useState(true);

    const { activeDrivers, loading: loadingDrivers } = useFetchActiveDrivers();
    const { activeTrucks, loading: loadingTrucks } = useFetchActiveTrucks();
    const { activeTrailers, loading: loadingCajas } = useFetchActiveTrailers();
    const { activeExternalTrailers, loading: loadingCajasExternas, refetch: refetchExternalTrailers } = useFetchActiveExternalTrailers();
    const { activeCompanies, loading: loadingCompanies, refetchCompanies } = useFetchCompanies();
    const { activeWarehouses, loading: loadingWarehouses, refetchWarehouses } = useFetchWarehouses();

    const [trailerType, setTrailerType] = useState('interna');
    const [IsModalCajaExternaOpen, setIsModalCajaExternaOpen] = useState(false);

    const getDocumentUrl = (serverPath) => {
        if (!serverPath) return '#';
        const uploadsWebPath = `${apiHost}/Uploads/Trips/`;
        const fileName = serverPath.split(/[\\/]/).pop();
        if (!fileName) return '#';
        return `${uploadsWebPath}${encodeURIComponent(fileName)}`;
    };

    useEffect(() => {
        const fetchTripDetails = async () => {
            if (!tripId) { setError("ID de viaje inválido."); setLoading(false); return; }
            setLoading(true); setError(null);
            try {
                const apiUrl = `${apiHost}/new_trips.php`;
                const apiFormData = new FormData();
                apiFormData.append('op', 'getById');
                apiFormData.append('trip_id', tripId);

                const response = await fetch(apiUrl, { method: 'POST', body: apiFormData });
                const responseText = await response.text();
                let result;
                try { result = JSON.parse(responseText); }
                catch (e) { throw new Error(`Respuesta inválida: ${responseText}`); }

                if (response.ok && result.status === "success" && result.trip) {
                    setInitialTripData(result);
                    const trip = result.trip;
                    setFormData({
                        trip_number: trip.trip_number || '',
                        driver_id: trip.driver_id || '',
                        driver_id_second: trip.driver_id_second || '',
                        driver_second_nombre: trip.driver_second_nombre || '',
                        truck_id: trip.truck_id || '',
                        caja_id: trip.caja_id || '',
                        caja_externa_id: trip.caja_externa_id || '',
                        status: trip.status || 'In Transit',
                        driver_nombre: trip.driver_nombre || '',
                        truck_unidad: trip.truck_unidad || '',
                        caja_no_caja: trip.caja_no_caja || '',
                        caja_externa_no_caja: trip.caja_externa_no_caja
                    });
                    if (trip.driver_id_second) {
                        setTripMode('team');
                    } else {
                        setTripMode('individual');
                    }
                    const processedEtapas = result.etapas.map(etapa => {
                        let loadingDateObj = null;
                        if (etapa.loading_date && typeof etapa.loading_date === 'string') { try { loadingDateObj = parseISO(etapa.loading_date); } catch (e) { } }
                        let deliveryDateObj = null;
                        if (etapa.delivery_date && typeof etapa.delivery_date === 'string') { try { deliveryDateObj = parseISO(etapa.delivery_date); } catch (e) { } }

                        const tipoEtapaActual = etapa.stageType || 'normalTrip';
                        let documentosBase;
                        if (tipoEtapaActual === 'normalTrip') { documentosBase = { ...initialNormalTripDocs }; }
                        else if (tipoEtapaActual === 'borderCrossing') { documentosBase = { ...initialBorderCrossingDocs }; }
                        else { documentosBase = {}; }

                        if (Array.isArray(etapa.documentos_adjuntos)) {
                            etapa.documentos_adjuntos.forEach(doc => {
                                if (documentosBase.hasOwnProperty(doc.tipo_documento)) {
                                    documentosBase[doc.tipo_documento] = {
                                        fileName: doc.nombre_archivo?.split(/[\\/]/).pop() || 'Archivo existente',
                                        vencimiento: doc.fecha_vencimiento || null, file: null,
                                        document_id: doc.document_id, serverPath: doc.path_servidor_real
                                    };
                                }
                            });
                        }

                        const stopsInTransit = Array.isArray(etapa.stops_in_transit) ?
                            etapa.stops_in_transit.map(stop => ({
                                stop_id: stop.stop_id,
                                location: stop.location || '',
                                stop_order: stop.stop_order,
                                time_of_delivery: stop.time_of_delivery || '',
                                bl_firmado_doc: stop.bl_firmado_doc ? {
                                    fileName: stop.bl_firmado_doc.nombre_archivo?.split(/[\\/]/).pop() || 'Archivo existente',
                                    vencimiento: stop.bl_firmado_doc.fecha_vencimiento || null,
                                    file: null,
                                    document_id: stop.bl_firmado_doc.document_id,
                                    serverPath: stop.bl_firmado_doc.path_servidor_real
                                } : null
                            }))
                            : [];

                        return {
                            ...etapa,
                            stageType: tipoEtapaActual,
                            loading_date: loadingDateObj, delivery_date: deliveryDateObj,
                            documentos: documentosBase,
                            stops_in_transit: stopsInTransit, comments: etapa.comments || '',
                            time_of_delivery: etapa.time_of_delivery || ''
                        };
                    });
                    setEtapas(processedEtapas);

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

    const handleTripModeChange = (mode) => {
        setTripMode(mode);
        if (mode === 'individual') {
            handleFormChange('driver_id_second', '');
            handleFormChange('driver_second_nombre', '');
        }
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

    const handleStopChange = (stageIndex, stopIndex, field, value) => {
        setEtapas(prevEtapas => {
            const updatedEtapas = [...prevEtapas];
            const updatedStage = { ...updatedEtapas[stageIndex] };
            const updatedStops = [...(updatedStage.stops_in_transit || [])];
            const updatedStop = { ...updatedStops[stopIndex] };
            updatedStop[field] = value;
            updatedStops[stopIndex] = updatedStop;
            updatedStage.stops_in_transit = updatedStops;
            updatedEtapas[stageIndex] = updatedStage;
            return updatedEtapas;
        });
    };

    const handleGuardarDocumento = (data) => {
        const { stageIndex, docType, stopIndex } = modalTarget;
        if (stageIndex === null || !docType) return;

        setEtapas(prevEtapas => {
            const updatedEtapas = [...prevEtapas];
            const etapaActual = { ...updatedEtapas[stageIndex] };

            if (stopIndex !== null) {
                const updatedStops = [...(etapaActual.stops_in_transit || [])];
                const updatedStop = { ...updatedStops[stopIndex] };

                updatedStop[docType] = {
                    fileName: data.fileName,
                    vencimiento: data.vencimiento,
                    file: data.file,
                    document_id: (updatedStop[docType] && updatedStop[docType].document_id) ? updatedStop[docType].document_id : null,
                    serverPath: null,
                    hasNewFile: !!data.file
                };
                updatedStops[stopIndex] = updatedStop;
                etapaActual.stops_in_transit = updatedStops;

            } else {
                etapaActual.documentos = {
                    ...etapaActual.documentos,
                    [docType]: {
                        fileName: data.fileName,
                        vencimiento: data.vencimiento,
                        file: data.file,
                        document_id: (etapaActual.documentos[docType] && etapaActual.documentos[docType].document_id) ? etapaActual.documentos[docType].document_id : null,
                        serverPath: null,
                        hasNewFile: !!data.file
                    }
                };
            }
            updatedEtapas[stageIndex] = etapaActual;
            return updatedEtapas;
        });
        setModalAbierto(false);
        setModalTarget({ stageIndex: null, docType: null, stopIndex: null });
    };

    const abrirModal = (docType, stageIndex, stopIndex = null) => {
        if (stageIndex === null) return;

        setModalTarget({ stageIndex, docType, stopIndex });
        setModalAbierto(true);

        if (docType === 'bl_firmado_doc' && stopIndex !== null) {
            setMostrarFechaVencimientoModal(false);
        } else if (['ima_invoice', 'doda', 'ci', 'entry', 'manifiesto', 'bl', 'orden_retiro', 'bl_firmado'].includes(docType)) {
            setMostrarFechaVencimientoModal(false);
        } else {
            setMostrarFechaVencimientoModal(true);
        }
    };

    const getCurrentDocValueForModal = () => {
        const { stageIndex, docType, stopIndex } = modalTarget;
        if (stageIndex === null || !etapas[stageIndex]) return null;

        if (stopIndex !== null) {
            const stop = etapas[stageIndex].stops_in_transit?.[stopIndex];
            return stop ? stop[docType] : null;
        } else {
            return etapas[stageIndex].documentos[docType] || null;
        }
    };

    const agregarParadaEnRuta = (stageIndex) => {
        setEtapas(prevEtapas => {
            const updatedEtapas = [...prevEtapas];
            const stageToUpdate = { ...updatedEtapas[stageIndex] };
            const currentStops = [...(stageToUpdate.stops_in_transit || [])];

            const newStop = {
                stop_id: `new-stop-${Date.now()}-${Math.random()}`,
                location: '',
                stop_order: currentStops.length + 1,
                bl_firmado_doc: null,
                time_of_delivery: '',

            };
            stageToUpdate.stops_in_transit = [...currentStops, newStop];
            updatedEtapas[stageIndex] = stageToUpdate;
            return updatedEtapas;
        });
    };

    const eliminarParadaEnRuta = (stageIndex, stopIndex) => {
        Swal.fire({
            title: `¿Eliminar Parada?`,
            text: "Deberás guardar los cambios para que la eliminación sea permanente.",
            icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6', confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                setEtapas(prevEtapas => {
                    const updatedEtapas = [...prevEtapas];
                    const stageToUpdate = { ...updatedEtapas[stageIndex] };
                    const currentStops = [...(stageToUpdate.stops_in_transit || [])];

                    const newStops = currentStops.filter((_, i) => i !== stopIndex);
                    stageToUpdate.stops_in_transit = newStops.map((stop, i) => ({ ...stop, stop_order: i + 1 }));

                    updatedEtapas[stageIndex] = stageToUpdate;
                    return updatedEtapas;
                });
            }
        });
    };

    const agregarNuevaEtapa = (tipoEtapa, insertAtIndex = etapas.length) => {
        let initialDocs;
        if (tipoEtapa === 'borderCrossing') { initialDocs = { ...initialBorderCrossingDocs }; }
        else if (tipoEtapa === 'normalTrip') { initialDocs = { ...initialNormalTripDocs }; }
        else if (tipoEtapa === 'emptyMileage') { initialDocs = {}; }
        else { initialDocs = {}; }

        setEtapas(prevEtapas => {
            const newEtapa = {
                trip_stage_id: `new-stage-${Date.now()}-${Math.random()}`,
                stageType: tipoEtapa,
                origin: '', destination: '', zip_code_origin: '', zip_code_destination: '',
                loading_date: null, delivery_date: null, company_id: null, travel_direction: '',
                warehouse_origin_id: null, warehouse_destination_id: null, ci_number: '',
                rate_tarifa: '', millas_pcmiller: '', millas_pcmiller_practicas: '', estatus: 'In Transit',
                documentos: initialDocs,
                comments: '',
                time_of_delivery: '',
                stops_in_transit: []
            };

            const updatedEtapas = [...prevEtapas];
            updatedEtapas.splice(insertAtIndex, 0, newEtapa);
            return updatedEtapas.map((etapa, i) => ({ ...etapa, stage_number: i + 1 }));
        });
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
        if (!formData.driver_id || !formData.truck_id) {
            Swal.fire('Campos incompletos', 'Driver y Truck son obligatorios.', 'warning'); return;
        }

        const dataToSend = new FormData();
        dataToSend.append('op', 'Update');
        dataToSend.append('trip_id', tripId); // Keep this to identify the trip for update

        // Append the potentially changed trip_number
        dataToSend.append('trip_number', formData.trip_number || ''); // Add this line

        Object.entries(formData).forEach(([key, value]) => {
            if (key !== 'status' && key !== 'trip_number') { // Exclude status and now trip_number, as it's added explicitly
                dataToSend.append(key, value || '');
            }
        });

        const etapasParaJson = etapas.map((etapa, indexEtapa) => {
            const etapaDocs = Object.entries(etapa.documentos).map(([tipo, docData]) => ({
                tipo_documento: tipo,
                document_id: docData?.document_id || null,
                fileName: docData?.fileName || null,
                vencimiento: docData?.vencimiento || null,
                hasNewFile: !!(docData && docData.file instanceof File)
            })).filter(doc => doc.fileName !== null);

            const stopsJson = (etapa.stops_in_transit || []).map((stop, indexStop) => {
                const stopDocData = stop.bl_firmado_doc;
                return {
                    stop_id: typeof stop.stop_id === 'string' && stop.stop_id.startsWith('new-stop-') ? null : stop.stop_id,
                    location: stop.location || null,
                    stop_order: stop.stop_order || (indexStop + 1),
                    time_of_delivery: stop.time_of_delivery || null,
                    bl_firmado_doc: stopDocData ? {
                        document_id: stopDocData.document_id || null,
                        fileName: stopDocData.fileName || null,
                        hasNewFile: !!(stopDocData && stopDocData.file instanceof File)
                    } : null
                };
            });

            return {
                trip_stage_id: typeof etapa.trip_stage_id === 'string' && etapa.trip_stage_id.startsWith('new-stage-') ? null : etapa.trip_stage_id,
                stage_number: etapa.stage_number,
                stageType: etapa.stageType,
                origin: etapa.origin || null, destination: etapa.destination || null,
                zip_code_origin: etapa.zip_code_origin || null, zip_code_destination: etapa.zip_code_destination || null,
                loading_date: etapa.loading_date instanceof Date ? format(etapa.loading_date, 'yyyy-MM-dd') : null,
                delivery_date: etapa.delivery_date instanceof Date ? format(etapa.delivery_date, 'yyyy-MM-dd') : null,
                company_id: etapa.company_id || null, travel_direction: etapa.travel_direction || null,
                warehouse_origin_id: etapa.warehouse_origin_id || null, warehouse_destination_id: etapa.warehouse_destination_id || null,
                ci_number: etapa.ci_number || null,
                rate_tarifa: etapa.rate_tarifa || null, millas_pcmiller: etapa.millas_pcmiller || null,
                millas_pcmiller_practicas: etapa.millas_pcmiller_practicas || null,
                comments: etapa.comments || null, // <-- AÑADIR
                time_of_delivery: etapa.time_of_delivery || null, // <-- AÑADIR
                estatus: etapa.estatus || 'In Transit',
                documentos: etapaDocs,
                stops_in_transit: stopsJson
            };
        });
        dataToSend.append('etapas', JSON.stringify(etapasParaJson));

        etapas.forEach((etapa, indexEtapa) => {
            Object.entries(etapa.documentos).forEach(([docType, docData]) => {
                if (docData && docData.file instanceof File) {
                    const fieldName = `etapa_${indexEtapa}_doc_type_${docType}_file`;
                    dataToSend.append(fieldName, docData.file, docData.fileName);
                    if (docData.document_id) { dataToSend.append(`etapa_${indexEtapa}_doc_type_${docType}_replace_id`, docData.document_id); }
                }
            });

            (etapa.stops_in_transit || []).forEach((stop, indexStop) => {
                const citaDoc = stop.bl_firmado_doc;
                if (citaDoc && citaDoc.file instanceof File) {
                    const fieldName = `etapa_${indexEtapa}_stop_${indexStop}_bl_firmado_file`;
                    dataToSend.append(fieldName, citaDoc.file, citaDoc.fileName);
                    if (citaDoc.document_id) { dataToSend.append(`etapa_${indexEtapa}_stop_${indexStop}_bl_firmado_replace_id`, citaDoc.document_id); }
                }
            });
        });

        const initialStageIds = initialTripData?.etapas.map(e => e.trip_stage_id).filter(id => id) || [];
        const currentStageIds = etapas.map(e => e.trip_stage_id).filter(id => id);
        const deletedStageIds = initialStageIds.filter(id => !currentStageIds.includes(id));
        if (deletedStageIds.length > 0) {
            dataToSend.append('deleted_stage_ids', JSON.stringify(deletedStageIds));
        }

        console.log("--- FormData para Update ---");
        for (let [key, value] of dataToSend.entries()) { console.log(`${key}:`, value); }
        console.log("--- Fin FormData ---");

        try {
            const apiUrl = `${apiHost}/new_trips.php`;
            const response = await fetch(apiUrl, { method: 'POST', body: dataToSend });
            const result = await response.json();
            if (response.ok && result.status === 'success') {
                Swal.fire('¡Guardado!', result.message || 'Cambios guardados.', 'success');
                navigate('/admin-trips');
            } else { throw new Error(result.error || result.message || 'Error al guardar.'); }
        } catch (err) { Swal.fire('Error', `No se guardaron los cambios: ${err.message}`, 'error'); }
    };

    const handleTrailerTypeChange = (type) => {
        setTrailerType(type);
        if (type === 'interna') {
            handleFormChange('caja_externa_id', '');
        } else {
            handleFormChange('caja_id', '');
        }
    };

    useEffect(() => {
        if (initialTripData && initialTripData.trip) {
            if (initialTripData.trip.caja_externa_id) {
                setTrailerType('externa');
            } else {
                setTrailerType('interna');
            }
        }
    }, [initialTripData]);

    const companyOptions = useMemo(() => {
        const options = activeCompanies.map(c => ({ value: c.company_id, label: c.nombre_compania }));
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
                refetchCompanies();

                if (stageIndex === null && companyFieldKey) {
                    handleFormChange(companyFieldKey, newOption.value);
                } else if (stageIndex !== null && companyFieldKey) {
                    handleStageChange(stageIndex, companyFieldKey, newOption.value);
                }

                Swal.fire('¡Éxito!', `Compañía "${inputValue}" creada y seleccionada.`, 'success');
                return newOption;
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
                refetchWarehouses();
                if (stageIndex === null && warehouseFieldKey) {
                    handleFormChange(warehouseFieldKey, newOption.value);
                } else if (stageIndex !== null && warehouseFieldKey) {
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
    const driverOptions = useMemo(() => {
        const options = activeDrivers.map(d => ({ value: d.driver_id, label: d.nombre }));
        if (formData.driver_id && !activeDrivers.some(d => d.driver_id === formData.driver_id)) {
            options.unshift({ value: formData.driver_id, label: formData.driver_nombre || `ID: ${formData.driver_id} (Inactivo/No encontrado)` });
        }
        return options;
    }, [activeDrivers, formData.driver_id, formData.driver_nombre]);
    const driverSecondOptions = useMemo(() => {
        const options = activeDrivers.map(d => ({ value: d.driver_id, label: d.nombre }));
        if (formData.driver_id_second && !activeDrivers.some(d => d.driver_id === formData.driver_id_second)) {
            options.unshift({ value: formData.driver_id_second, label: formData.driver_second_nombre || `ID: ${formData.driver_id_second} (Inactivo)` });
        }
        return options;
    }, [activeDrivers, formData.driver_id_second, formData.driver_second_nombre]);


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

    if (loading) { return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}> <CircularProgress /> <Typography ml={2}>Cargando datos...</Typography> </Box>); }
    if (error) { return (<Box sx={{ padding: 2 }}> <Alert severity="error">Error: {error}</Alert> <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2 }}>Volver</Button> </Box>); }
    if (!initialTripData) { return (<Box sx={{ padding: 2 }}> <Alert severity="warning">No se encontraron datos.</Alert> <Button variant="outlined" onClick={() => navigate(-1)} sx={{ mt: 2 }}>Volver</Button> </Box>); }

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
                            <Button type="submit" variant="contained" color="primary" sx={{ ml: 1 }} disabled={isFormDisabled}>Guardar Cambios</Button>
                        </div>

                        <div className="form-section">
                            <div className="input-columns">
                                <div className="column">
                                    <label>Tipo de Viaje:</label>
                                    <div className="trip-mode-selector">
                                        <button type="button" className={tripMode === 'individual' ? 'active' : ''} onClick={() => handleTripModeChange('individual')} disabled={isFormDisabled}>
                                            Viaje Individual
                                        </button>
                                        <button type="button" className={tripMode === 'team' ? 'active' : ''} onClick={() => handleTripModeChange('team')} disabled={isFormDisabled}>
                                            Viaje en Equipo
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="input-columns">

                                <div className="column">
                                    <label htmlFor="trip_number">Trip Number:</label> {/* Added Label */}
                                    <input
                                        type="text"
                                        id="trip_number"
                                        name="trip_number"
                                        value={formData.trip_number}
                                        onChange={(e) => handleFormChange('trip_number', e.target.value)}
                                        placeholder="Número de Viaje"
                                        className="form-input"
                                        readOnly={isFormDisabled} // Keep this based on the overall form status
                                    />
                                </div>
                                <div className="column">
                                    <label htmlFor="driver_id">Driver Principal:</label>
                                    <Select id="driver_id"
                                        name="driver_id"
                                        value={formData.driver_id ? { value: formData.driver_id, label: formData.driver_nombre || `ID: ${formData.driver_id}` } : null}
                                        onChange={(selected) => {
                                            handleFormChange('driver_id', selected ? selected.value : '');
                                            const driverDetails = activeDrivers.find(d => d.driver_id === selected?.value);
                                            handleFormChange('driver_nombre', driverDetails ? driverDetails.nombre : '');
                                        }}
                                        options={driverOptions}
                                        placeholder="Seleccionar Driver"
                                        isLoading={loadingDrivers}
                                        styles={selectStyles}
                                        isClearable
                                        isDisabled={isFormDisabled}
                                    />
                                </div>
                                {/* --- AÑADIR ESTE BLOQUE CONDICIONAL --- */}
                                {tripMode === 'team' && (
                                    <div className="column">
                                        <label htmlFor="driver_id_second">Segundo Driver:</label>
                                        <Select
                                            options={driverSecondOptions.filter(opt => opt.value !== formData.driver_id)}
                                            value={formData.driver_id_second ? { value: formData.driver_id_second, label: formData.driver_second_nombre || `ID: ${formData.driver_id_second}` } : null}
                                            onChange={(selected) => {
                                                handleFormChange('driver_id_second', selected ? selected.value : '');
                                                handleFormChange('driver_second_nombre', selected ? selected.label : '');
                                            }}
                                            placeholder="Seleccionar 2do Driver"
                                            isLoading={loadingDrivers}
                                            styles={selectStyles}
                                            isClearable
                                            isDisabled={isFormDisabled}
                                        />
                                    </div>
                                )}
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
                                        options={truckOptions}
                                        placeholder="Seleccionar Truck"
                                        isLoading={loadingTrucks}
                                        styles={selectStyles}
                                        isClearable
                                        isDisabled={isFormDisabled}
                                    />
                                </div>


                            </div>
                            <div className="input-columns" style={{ marginTop: '1rem' }}>
                                <div className="column">
                                    <label>Tipo de Trailer:</label>
                                    <div className="trailer-type-selector">
                                        <button type="button" className={trailerType === 'interna' ? 'active' : ''} onClick={() => handleTrailerTypeChange('interna')} disabled={isFormDisabled}>
                                            Caja Interna
                                        </button>
                                        <button type="button" className={trailerType === 'externa' ? 'active' : ''} onClick={() => handleTrailerTypeChange('externa')} disabled={isFormDisabled}>
                                            Caja Externa
                                        </button>
                                    </div>
                                </div>
                                <div className="column">
                                    {trailerType === 'interna' && (

                                        <div className="column">
                                            <label>Trailer (Caja Interna):</label>
                                            <Select
                                                id="caja_id"
                                                name="caja_id"
                                                value={formData.caja_id ? { value: formData.caja_id, label: formData.caja_no_caja || `ID: ${formData.caja_id}` } : null}
                                                onChange={(selected) => {
                                                    handleFormChange('caja_id', selected ? selected.value : '');
                                                    handleFormChange('caja_no_caja', selected ? selected.label : '');
                                                }}
                                                options={trailerOptions}
                                                placeholder="Seleccionar Trailer Interno"
                                                isLoading={loadingCajas}
                                                styles={selectStyles}
                                                isClearable
                                                isDisabled={isFormDisabled}
                                            />
                                        </div>
                                    )}
                                    {trailerType === 'externa' && (
                                        <div className="column">
                                            <label>Trailer (Caja Externa):</label>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <Select
                                                    id="caja_externa_id"
                                                    name="caja_externa_id"
                                                    value={formData.caja_externa_id ? { value: formData.caja_externa_id, label: formData.caja_externa_no_caja || `ID: ${formData.caja_externa_id}` } : null}
                                                    onChange={(selected) => {
                                                        handleFormChange('caja_externa_id', selected ? selected.value : '');
                                                        handleFormChange('caja_externa_no_caja', selected ? selected.label : '');
                                                    }}
                                                    options={activeExternalTrailers.map(c => ({ value: c.caja_externa_id, label: c.no_caja }))}
                                                    placeholder="Seleccionar Trailer Externo"
                                                    isLoading={loadingCajasExternas}
                                                    styles={{ ...selectStyles, container: (base) => ({ ...base, flex: 1 }) }}
                                                    isClearable
                                                    isDisabled={isFormDisabled}
                                                />
                                                <button
                                                    type='button'
                                                    onClick={() => setIsModalCajaExternaOpen(true)}
                                                    className="accept-button"
                                                    style={{ height: '48px', width: '48px', flexShrink: 0 }}
                                                    title="Registrar Nueva Caja Externa"
                                                    disabled={isFormDisabled}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                    )}
                                </div>

                            </div>


                        </div>

                        <br />

                        {etapas.map((etapa, index) => (
                            <div key={etapa.trip_stage_id || `new-stage-${index}`} className="etapa-container form-section">
                                <div className="card-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginTop: '10px', marginBottom: '10px' }}>
                                    <span>
                                        {`Etapa ${etapa.stage_number} (${etapa.stageType === 'borderCrossing' ? 'Cruce Fronterizo' :
                                            etapa.stageType === 'normalTrip' ? 'Viaje Normal' :
                                                etapa.stageType === 'emptyMileage' ? 'Etapa de Millaje' :
                                                    'Etapa'
                                            })`}
                                    </span>
                                    <Box sx={{ display: 'flex', gap: '5px' }}>
                                        {(etapa.stageType === 'normalTrip' || etapa.stageType === 'borderCrossing') && (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={() => agregarParadaEnRuta(index)}
                                                disabled={isFormDisabled}
                                                sx={{ whiteSpace: 'nowrap', minWidth: 'unset', padding: '4px 8px' }}
                                            >
                                                + Parada en Ruta
                                            </Button>
                                        )}
                                        {etapas.length > 1 && (
                                            <button type="button" className="delete-button" onClick={() => eliminarEtapa(index)} title="Eliminar Etapa" disabled={isFormDisabled}>&#x2716;</button>
                                        )}
                                    </Box>
                                </div>

                                {etapa.stageType === 'emptyMileage' ? (
                                    <div className="subsection">
                                        <legend className="card-label">Detalles de la Etapa</legend>
                                        <div className="input-columns">
                                            <div className="column">
                                                <label style={{ marginTop: '10px' }}>Millas PC*Miler Cortas (Etapa):</label>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    value={etapa.millas_pcmiller}
                                                    onChange={(e) => handleStageChange(index, 'millas_pcmiller', e.target.value)}
                                                    placeholder="Millas Cortas Etapa"
                                                    className="form-input"
                                                    readOnly={isFormDisabled}
                                                />


                                            </div>



                                            <div className="column">
                                                <label style={{ marginTop: '10px' }}>Millas PC*Miler Practicas (Etapa):</label>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    value={etapa.millas_pcmiller_practicas}
                                                    onChange={(e) => handleStageChange(index, 'millas_pcmiller_practicas', e.target.value)}
                                                    placeholder="Millas Practicas Etapa"
                                                    className="form-input"
                                                    readOnly={isFormDisabled}
                                                />
                                            </div>

                                            <div className="column">

                                                <label  >Comments:</label>
                                                <textarea
                                                    value={etapa.comments}
                                                    onChange={(e) => handleStageChange(index, 'comments', e.target.value)}
                                                    className="form-input"
                                                    rows="3"
                                                />

                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <legend className="card-label">Origen / Destino / Detalles</legend>
                                        <div className="input-columns">
                                            <div className="column">
                                                <label>Company:</label>
                                                <CreatableSelect
                                                    value={companyOptions.find(opt => opt.value === etapa.company_id) || null}
                                                    onChange={(selected) => handleStageChange(index, 'company_id', selected ? selected.value : '')}
                                                    onCreateOption={(inputValue) => handleCreateCompany(inputValue, index, 'company_id')}
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
                                                <CreatableSelect
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
                                                <CreatableSelect
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
                                                <label style={{ marginTop: '10px' }}>Millas PC*Miler Cortas (Etapa):</label>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    value={etapa.millas_pcmiller}
                                                    onChange={(e) => handleStageChange(index, 'millas_pcmiller', e.target.value)}
                                                    placeholder="Millas Cortas Etapa"
                                                    className="form-input"
                                                    readOnly={isFormDisabled}
                                                />
                                            </div>



                                        </div>
                                        <div className="input-columns">
                                            <div className="column">

                                                <label  >Comments:</label>
                                                <textarea
                                                    value={etapa.comments}
                                                    onChange={(e) => handleStageChange(index, 'comments', e.target.value)}
                                                    className="form-input"
                                                    rows="3"
                                                />

                                            </div>
                                            <div className="column">
                                                <label style={{ marginTop: '10px' }}>Millas PC*Miler Practicas (Etapa):</label>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    value={etapa.millas_pcmiller_practicas}
                                                    onChange={(e) => handleStageChange(index, 'millas_pcmiller_practicas', e.target.value)}
                                                    placeholder="Millas Practicas Etapa"
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
                                                            <label htmlFor={`ci-${index}`}>CI:</label>
                                                            <button type="button" className="upload-button" onClick={() => abrirModal('ci', index)} disabled={isFormDisabled}>Subir/Cambiar</button>
                                                            {etapa.documentos?.ci && (<p className="doc-info"><i> <a href={getDocumentUrl(etapa.documentos.ci.serverPath)} target="_blank" rel="noopener noreferrer">{etapa.documentos.ci.fileName}</a> {etapa.documentos.ci.vencimiento ? ` - V: ${etapa.documentos.ci.vencimiento}` : ''}</i></p>)}
                                                        </div>
                                                        <div className="column">
                                                            <label htmlFor={`doda-${index}`}>DODA:</label>
                                                            <button type="button" className="upload-button" onClick={() => abrirModal('doda', index)} disabled={isFormDisabled}>Subir/Cambiar</button>
                                                            {etapa.documentos?.doda && (<p className="doc-info"><i> <a href={getDocumentUrl(etapa.documentos.doda.serverPath)} target="_blank" rel="noopener noreferrer">{etapa.documentos.doda.fileName}</a> {etapa.documentos.doda.vencimiento ? ` - V: ${etapa.documentos.doda.vencimiento}` : ''}</i></p>)}
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
                                                            <div className="column">
                                                                <label htmlFor={`time_of_delivery-${index}`} style={{ marginTop: '10px' }}>Cita Entrega:</label>
                                                                <input
                                                                    type="time"
                                                                    id={`time_of_delivery-${index}`}
                                                                    name={`time_of_delivery-${index}`}
                                                                    value={etapa.time_of_delivery || ''}
                                                                    onChange={(e) => handleStageChange(index, 'time_of_delivery', e.target.value)}
                                                                    className="form-input"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="column">
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
                                                            <div className="column">
                                                                <label htmlFor={`time_of_delivery-${index}`} style={{ marginTop: '10px' }}>Cita Entrega:</label>
                                                                <input
                                                                    type="time"
                                                                    id={`time_of_delivery-${index}`}
                                                                    name={`time_of_delivery-${index}`}
                                                                    value={etapa.time_of_delivery || ''}
                                                                    onChange={(e) => handleStageChange(index, 'time_of_delivery', e.target.value)}
                                                                    className="form-input"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="column">
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

                                        {Array.isArray(etapa.stops_in_transit) && etapa.stops_in_transit.length > 0 && (
                                            <div className="subsection" style={{ border: '1px dashed #bbb', padding: '10px', marginTop: '15px' }}>
                                                <legend className="card-label" style={{ marginBottom: '10px' }}>Paradas en Ruta ({etapa.stops_in_transit.length})</legend>
                                                {etapa.stops_in_transit.map((stop, stopIndex) => (
                                                    <Box key={stop.stop_id || `new-stop-${stopIndex}`} sx={{ mb: 2, p: 1, border: '1px solid #ddd', borderRadius: '4px', position: 'relative' }}>
                                                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Parada #{stopIndex + 1}</Typography>
                                                        <button
                                                            type="button"
                                                            className="delete-button"
                                                            onClick={() => eliminarParadaEnRuta(index, stopIndex)}
                                                            title="Eliminar Parada"
                                                            disabled={isFormDisabled}
                                                            style={{ position: 'absolute', top: 5, right: 5 }}
                                                        >&#x2716;</button>
                                                        <div className="input-columns">
                                                            <div className="column">
                                                                <label style={{ marginTop: '10px' }}>Destino / Ubicación de Parada / Zip Code:</label>
                                                                <input
                                                                    type="text"
                                                                    value={stop.location}
                                                                    onChange={(e) => handleStopChange(index, stopIndex, 'location', e.target.value)}
                                                                    placeholder="Ciudad, Estado, Zip Code"
                                                                    className="form-input"
                                                                    readOnly={isFormDisabled}
                                                                />


                                                                <div className="column">
                                                                    <label>Hora de Entrega (Parada):</label>
                                                                    <input
                                                                        type="time"
                                                                        value={stop.time_of_delivery || ''}
                                                                        onChange={(e) => handleStopChange(index, stopIndex, 'time_of_delivery', e.target.value)}
                                                                        className="form-input"
                                                                        readOnly={isFormDisabled}
                                                                    />
                                                                </div>

                                                            </div>

                                                            <div className="column">
                                                                <label htmlFor={`bl_firmado_stop-${index}-${stopIndex}`} style={{ marginTop: '15px' }}>Bl Firmado (Parada):</label>
                                                                <button type="button" className="upload-button" onClick={() => abrirModal('bl_firmado_doc', index, stopIndex)} disabled={isFormDisabled}>Subir/Cambiar</button>
                                                                {stop.bl_firmado_doc && (
                                                                    <p className="doc-info">
                                                                        <i>
                                                                            <a href={getDocumentUrl(stop.bl_firmado_doc.serverPath)} target="_blank" rel="noopener noreferrer">
                                                                                {stop.bl_firmado_doc.fileName}
                                                                            </a>
                                                                        </i>
                                                                    </p>
                                                                )}
                                                                {stop.bl_firmado_doc && !isFormDisabled && (
                                                                    <Button
                                                                        variant="text"
                                                                        color="error"
                                                                        size="small"
                                                                        onClick={() => handleStopChange(index, stopIndex, 'bl_firmado_doc', null)}
                                                                        sx={{ fontSize: '0.7em', mt: 0.5, ml: 1, textTransform: 'none' }}
                                                                    >
                                                                        Eliminar Doc
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </Box>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}

                        <br />
                        <div className="add-stage-buttons-container" style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                            <button type="button" onClick={() => agregarNuevaEtapa('borderCrossing')} className="add-stage-button" disabled={isFormDisabled}>
                                + Añadir Etapa Cruce
                            </button>
                            <button type="button" onClick={() => agregarNuevaEtapa('normalTrip')} className="add-stage-button" disabled={isFormDisabled}>
                                + Añadir Etapa Normal
                            </button>
                            <button type="button" onClick={() => agregarNuevaEtapa('emptyMileage')} className="add-stage-button" disabled={isFormDisabled}>
                                + Añadir Etapa Vacía
                            </button>
                        </div>

                        {modalAbierto && (
                            <ModalArchivo
                                isOpen={modalAbierto}
                                onClose={() => { setModalAbierto(false); setModalTarget({ stageIndex: null, docType: null, stopIndex: null }); }}
                                onSave={handleGuardarDocumento}
                                nombreCampo={modalTarget.docType}
                                valorActual={getCurrentDocValueForModal()}
                                mostrarFechaVencimiento={mostrarFechaVencimientoModal}
                            />
                        )}

                        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button variant="outlined" onClick={() => navigate(-1)}>Cancelar / Volver</Button>
                            <Button variant="contained" color="primary" type="submit" disabled={isFormDisabled}>Guardar Cambios</Button>
                        </Box>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditTripForm;