import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Grid, Stack, TextField, Button, Paper, CircularProgress, InputLabel } from '@mui/material'; 
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

// 🚨 IMPORTAMOS LOS COMPONENTES ESTANDARIZADOS Y MODALES
import SelectWrapper from '../components/SelectWrapper';
import StageInput from '../components/StageInput';
import ModalArchivo from './ModalArchivo'; 
import ModalCajaExterna from '../components/ModalCajaExterna'; 

// IMPORTACIONES DE HOOKS (Mantenidas)
import useFetchActiveDrivers from '../hooks/useFetchActiveDrivers';
import useFetchActiveTrucks from '../hooks/useFetchActiveTrucks';
import useFetchActiveTrailers from '../hooks/useFetchActiveTrailers';
import useFetchActiveExternalTrailers from '../hooks/useFetchActiveExternalTrailers';
import useFetchCompanies from '../hooks/useFetchCompanies';
import useFetchWarehouses from '../hooks/useFetchWarehouses';


const initialBorderCrossingDocs = {
    ima_invoice: null, carta_porte: null, ci: null, entry: null,
    manifiesto: null, bl: null, orden_retiro: null, bl_firmado: null,
};

const initialNormalTripDocs = {
    ima_invoice: null, ci: null,
    bl: null, bl_firmado: null,
};

// Estado inicial de la etapa para reset
const initialEtapaStateBase = {
    stage_number: 1,
    stageType: 'normalTrip',
    origin: '', destination: '', zip_code_origin: '', zip_code_destination: '',
    loading_date: null, delivery_date: null, company_id: '', travel_direction: '',
    warehouse_origin_id: '', warehouse_destination_id: '', ci_number: '',
    rate_tarifa: '', millas_pcmiller: '', millas_pcmiller_practicas: '',
    documentos: { ...initialNormalTripDocs }, comments: '', time_of_delivery: ''
};


const TripFormNew = ({ tripNumber, onSuccess }) => {
    const apiHost = import.meta.env.VITE_API_HOST;

    const { activeDrivers, loading: loadingDrivers, error: errorDrivers } = useFetchActiveDrivers();
    const { activeTrucks, loading: loadingTrucks, error: errorTrucks } = useFetchActiveTrucks();
    const { activeTrailers, loading: loadingCajas, error: errorCajas } = useFetchActiveTrailers();
    const { activeExternalTrailers, loading: loadingCajasExternas, error: errorCajasExternas, refetch: refetchExternalTrailers } = useFetchActiveExternalTrailers();
    const { activeCompanies, loading: loadingCompanies, error: errorCompanies } = useFetchCompanies();
    const { activeWarehouses, loading: loadingWarehouses, error: errorWarehouses } = useFetchWarehouses();

    const [trailerType, setTrailerType] = useState('interna'); 
    const [tripMode, setTripMode] = useState('individual'); 
    const [isCreatingCompany, setIsCreatingCompany] = useState(false);
    const [isCreatingWarehouse, setIsCreatingWarehouse] = useState(false);

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

    const initialEtapaState = useMemo(() => ({...initialEtapaStateBase}), []);
    const [etapas, setEtapas] = useState([initialEtapaState]);

    const handleTrailerTypeChange = (type) => {
        setTrailerType(type);
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

    // ** LÓGICA DE OPCIONES **
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

    useEffect(() => {
        setFormData(prevFormData => ({
            ...prevFormData,
            trip_number: tripNumber || '',
        }));
    }, [tripNumber]);


    // ** CREACIÓN DE ENTIDADES **
    const handleCreateCompany = async (inputValue, stageIndex) => {
        setIsCreatingCompany(true);
        const newCompanyFormData = new FormData();
        newCompanyFormData.append('op', 'CreateCompany');
        newCompanyFormData.append('nombre_compania', inputValue);

        try {
            const response = await fetch(`${apiHost}/companies.php`, { method: 'POST', body: newCompanyFormData });
            const result = await response.json();

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
            const response = await fetch(`${apiHost}/warehouses.php`, { method: 'POST', body: newWarehouseFormData });
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

    // ** MANEJO DE ESTADOS **
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
            initialDocs = {};
        }

        setEtapas(prevEtapas => [
            ...prevEtapas,
            {
                ...initialEtapaStateBase, 
                stage_number: prevEtapas.length + 1,
                stageType: tipoEtapa,
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

    const abrirModalDocs = (docType, stageIndex = null) => {
        setModalTarget({ stageIndex, docType });
        setModalAbierto(true);

        if (['ima_invoice', 'carta_porte', 'ci', 'entry', 'manifiesto', 'bl', 'orden_retiro', 'bl_firmado'].includes(docType)) {
            setMostrarFechaVencimientoModal(false);
        } else {
            setMostrarFechaVencimientoModal(true);
        }
    };

    // ** HANDLER DE GUARDADO **
    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validaciones básicas (se mantienen)
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
        
        let timerInterval;
        const start = Date.now();

        Swal.fire({
            title: 'Procesando…',
            html: 'Tiempo transcurrido: <b>0</b> ms',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
                const b = Swal.getPopup().querySelector('b');
                timerInterval = setInterval(() => {
                    if (b) b.textContent = `${Date.now() - start}`;
                }, 100);
            },
            willClose: () => clearInterval(timerInterval),
        });

        const dataToSend = new FormData();
        dataToSend.append('op', 'Alta');

        // Datos principales del viaje
        dataToSend.append('trip_number', formData.trip_number);
        dataToSend.append('driver_id', formData.driver_id);
        dataToSend.append('driver_id_second', formData.driver_id_second || '');
        dataToSend.append('truck_id', formData.truck_id);
        dataToSend.append('caja_id', formData.caja_id || '');
        dataToSend.append('caja_externa_id', formData.caja_externa_id || '');


        // 1. Preparar JSON de etapas y añadir archivos al FormData
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
            estatus: 'In Transit',
            comments: etapa.comments || '',
            time_of_delivery: etapa.time_of_delivery || '',
            
            documentos: Object.entries(etapa.documentos).reduce((acc, [key, value]) => {
                if (value) { 
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

        // 2. Añadir los archivos de CADA etapa al FormData
        etapas.forEach((etapa, index) => {
            Object.entries(etapa.documentos).forEach(([docType, docData]) => {
                if (docData && docData.file instanceof File) {
                    const fieldName = `etapa_${index}_${docType}_file`;
                    dataToSend.append(fieldName, docData.file, docData.fileName);
                }
            });
        });


        // Enviar a la API
        try {
            const apiUrl = `${apiHost}/new_trips.php`; 
            const response = await fetch(apiUrl, {
                method: 'POST',
                body: dataToSend,
            });

            const result = await response.json();

            if (response.ok && result.status === "success") {
                Swal.close();
                Swal.fire({
                    icon: 'success', title: '¡Éxito!',
                    text: result.message || 'Viaje y etapas guardados correctamente.',
                    timer: 2500, showConfirmButton: false
                });

                if (onSuccess) {
                    onSuccess();
                }
            } else {
                Swal.close();
                Swal.fire({
                    icon: 'error', title: 'Error al Guardar',
                    text: result.error || result.message || 'No se pudo guardar la información. Verifica los datos e intenta de nuevo.',
                });
            }
        } catch (error) {
            console.error('Error en fetch o procesando respuesta (Alta):', error);
            Swal.close();
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
        if (onSuccess) {
            onSuccess();
        }
    }
    

    return (
        // 🚨 La etiqueta form envuelve todo el contenido
        <form onSubmit={handleSubmit}>

            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mb: 3 }}>
                <Button variant="outlined" color="error" onClick={resetform}>Cancelar</Button>
                <Button variant="contained" color="primary" type="submit">Guardar Viaje</Button>
            </Stack>

            {/* SECCIÓN DE INFORMACIÓN GENERAL */}
            <Paper elevation={1} sx={{ p: 4, mb: 4, border: '1px solid #ccc' }}>
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 3 }}>
                    Información General
                </Typography>

                <Grid container spacing={4}>
                    {/* Columna 1: Driver Principal / Segundo Driver / Truck */}
                    <Grid item xs={12} md={4}>
                        <SelectWrapper
                            label="Driver Principal:"
                            isCreatable={false}
                            value={activeDrivers.find(d => d.driver_id === formData.driver_id) ? { value: formData.driver_id, label: activeDrivers.find(d => d.driver_id === formData.driver_id).nombre } : null}
                            onChange={(selected) => setForm('driver_id', selected ? selected.value : '')}
                            options={activeDrivers.map(driver => ({ value: driver.driver_id, label: driver.nombre }))}
                            placeholder="Seleccionar Driver"
                            isLoading={loadingDrivers}
                            isDisabled={loadingDrivers || !!errorDrivers}
                        />
                        {tripMode === 'team' && (
                            <SelectWrapper
                                label="Segundo Driver:"
                                isCreatable={false}
                                value={activeDrivers.find(d => d.driver_id === formData.driver_id_second) ? { value: formData.driver_id_second, label: activeDrivers.find(d => d.driver_id === formData.driver_id_second).nombre } : null}
                                onChange={(selected) => setForm('driver_id_second', selected ? selected.value : '')}
                                options={activeDrivers.filter(d => d.driver_id !== formData.driver_id).map(driver => ({ value: driver.driver_id, label: driver.nombre }))}
                                placeholder="Seleccionar 2do Driver"
                                isLoading={loadingDrivers}
                                isDisabled={loadingDrivers || !!errorDrivers}
                            />
                        )}
                        <SelectWrapper
                            label="Truck:"
                            isCreatable={false}
                            value={activeTrucks.find(t => t.truck_id === formData.truck_id) ? { value: formData.truck_id, label: activeTrucks.find(t => t.truck_id === formData.truck_id).unidad } : null}
                            onChange={(selected) => setForm('truck_id', selected ? selected.value : '')}
                            options={activeTrucks.map(truck => ({ value: truck.truck_id, label: truck.unidad }))}
                            placeholder="Seleccionar Truck"
                            isLoading={loadingTrucks}
                            isDisabled={loadingTrucks || !!errorTrucks}
                        />
                    </Grid>

                    {/* Columna 2: Tipo de Viaje / Selector de Modo */}
                    <Grid item xs={12} md={4}>
                        <InputLabel sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>Tipo de Viaje:</InputLabel>
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Button variant={tripMode === 'individual' ? 'contained' : 'outlined'} size="small" onClick={() => handleTripModeChange('individual')}>Viaje Individual</Button>
                            <Button variant={tripMode === 'team' ? 'contained' : 'outlined'} size="small" onClick={() => handleTripModeChange('team')}>Viaje en Equipo</Button>
                        </Stack>
                    </Grid>

                    {/* Columna 3: Tipo de Trailer / Selector de Caja */}
                    <Grid item xs={12} md={4}>
                        <InputLabel sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>Tipo de Trailer:</InputLabel>
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Button variant={trailerType === 'interna' ? 'contained' : 'outlined'} size="small" onClick={() => handleTrailerTypeChange('interna')}>Caja Interna</Button>
                            <Button variant={trailerType === 'externa' ? 'contained' : 'outlined'} size="small" onClick={() => handleTrailerTypeChange('externa')}>Caja Externa</Button>
                        </Stack>

                        {trailerType === 'interna' && (
                            <SelectWrapper
                                label="Trailer (Caja Interna):"
                                isCreatable={false}
                                value={activeTrailers.find(c => c.caja_id === formData.caja_id) ? { value: formData.caja_id, label: activeTrailers.find(c => c.caja_id === formData.caja_id).no_caja } : null}
                                onChange={(selected) => setForm('caja_id', selected ? selected.value : '')}
                                options={activeTrailers.map(caja => ({ value: caja.caja_id, label: caja.no_caja }))}
                                placeholder="Seleccionar Trailer"
                                isLoading={loadingCajas} isDisabled={loadingCajas || !!errorCajas}
                            />
                        )}
                        {trailerType === 'externa' && (
                            <Stack direction="row" spacing={1} alignItems="flex-end">
                                <Box sx={{ flexGrow: 1 }}>
                                    <SelectWrapper
                                        label="Trailer (Caja Externa):"
                                        isCreatable={false}
                                        value={activeExternalTrailers.find(c => c.caja_externa_id === formData.caja_externa_id) ? { value: formData.caja_externa_id, label: activeExternalTrailers.find(c => c.caja_externa_id === formData.caja_externa_id).no_caja } : null}
                                        onChange={(selected) => setForm('caja_externa_id', selected ? selected.value : '')}
                                        options={activeExternalTrailers.map(caja => ({ value: caja.caja_externa_id, label: caja.no_caja }))}
                                        placeholder="Seleccionar Trailer"
                                        isLoading={loadingCajasExternas}
                                        isDisabled={loadingCajasExternas || !!errorCajasExternas}
                                    />
                                </Box>
                                <Button variant="contained" color="primary" size="small" sx={{ height: '40px', minWidth: '40px', p: 0 }} onClick={() => setIsModalCajaExternaOpen(true)} title="Registrar Nueva Caja Externa">+</Button>
                            </Stack>
                        )}
                    </Grid>
                </Grid>
            </Paper>

            {/* Sección de Etapas */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 3 }}>
                    Detalles de Etapas
                </Typography>

                {etapas.map((etapa, index) => (
                    <Paper key={index} elevation={1} sx={{ p: 4, mb: 4, border: '1px solid #ccc' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                            <Typography variant="h6" fontWeight={600}>
                                {`Etapa ${etapa.stage_number} (${etapa.stageType === 'borderCrossing' ? 'Cruce Fronterizo' : 'Viaje Normal'})`}
                            </Typography>
                            {etapas.length > 1 && (
                                <Button type="button" variant="outlined" color="error" size="small" onClick={() => eliminarEtapa(index)} title="Eliminar Etapa">Eliminar Etapa</Button>
                            )}
                        </Stack>

                        <Grid container spacing={3}>
                            {/* Fila 1: Compañía, Dirección, CI */}
                            <Grid item xs={12} md={4}>
                                <SelectWrapper
                                    label="Company:" isCreatable
                                    value={companyOptions.find(c => c.value === etapa.company_id) || null}
                                    onChange={(selected) => handleEtapaChange(index, 'company_id', selected ? selected.value : '')}
                                    onCreateOption={(inputValue) => handleCreateCompany(inputValue, index)}
                                    options={companyOptions} placeholder="Seleccionar o Crear Compañía"
                                    isLoading={loadingCompanies || isCreatingCompany}
                                    formatCreateLabel={(inputValue) => `Crear compañía: "${inputValue}"`}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <SelectWrapper
                                    label="Travel Direction:" isCreatable={false}
                                    value={etapa.travel_direction ? { value: etapa.travel_direction, label: etapa.travel_direction } : null}
                                    onChange={(selected) => handleEtapaChange(index, 'travel_direction', selected ? selected.value : '')}
                                    options={[{ value: 'Going Up', label: 'Going Up' }, { value: 'Going Down', label: 'Going Down' }]}
                                    placeholder="Seleccionar Dirección"
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField fullWidth size="small" label="CI Number:" value={etapa.ci_number} onChange={(e) => handleEtapaChange(index, 'ci_number', e.target.value)} />
                            </Grid>
                            
                            {/* Fila 2: Bodegas Origen/Destino */}
                            <Grid item xs={12} md={6}>
                                <SelectWrapper
                                    label="Origin Warehouse:" isCreatable
                                    value={warehouseOptions.find(w => w.value === etapa.warehouse_origin_id) || null}
                                    onChange={(selected) => handleEtapaChange(index, 'warehouse_origin_id', selected ? selected.value : '')}
                                    onCreateOption={(inputValue) => handleCreateWarehouse(inputValue, index, 'warehouse_origin_id')}
                                    options={warehouseOptions} placeholder="Seleccionar o Crear Bodega Origen"
                                    isLoading={loadingWarehouses || isCreatingWarehouse}
                                    formatCreateLabel={(inputValue) => `Crear bodega: "${inputValue}"`}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <SelectWrapper
                                    label="Destination Warehouse:" isCreatable
                                    value={warehouseOptions.find(w => w.value === etapa.warehouse_destination_id) || null}
                                    onChange={(selected) => handleEtapaChange(index, 'warehouse_destination_id', selected ? selected.value : '')}
                                    onCreateOption={(inputValue) => handleCreateWarehouse(inputValue, index, 'warehouse_destination_id')}
                                    options={warehouseOptions} placeholder="Seleccionar o Crear Bodega Destino"
                                    isLoading={loadingWarehouses || isCreatingWarehouse}
                                    formatCreateLabel={(inputValue) => `Crear bodega: "${inputValue}"`}
                                />
                            </Grid>
                            
                            {/* Fila 3: Origen/Destino (Ciudad/Zip) */}
                            <Grid item xs={12} md={3}>
                                <TextField fullWidth size="small" label="Origin City/State:" value={etapa.origin} onChange={(e) => handleEtapaChange(index, 'origin', e.target.value)} />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField fullWidth size="small" label="Destination City/State:" value={etapa.destination} onChange={(e) => handleEtapaChange(index, 'destination', e.target.value)} />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField fullWidth size="small" label="Zip Code Origin:" value={etapa.zip_code_origin} onChange={(e) => handleEtapaChange(index, 'zip_code_origin', e.target.value)} />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField fullWidth size="small" label="Zip Code Destination:" value={etapa.zip_code_destination} onChange={(e) => handleEtapaChange(index, 'zip_code_destination', e.target.value)} />
                            </Grid>
                            
                            {/* Fila 4: Fechas */}
                            <Grid item xs={12} md={3}>
                                <InputLabel sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem' }}>Loading Date:</InputLabel>
                                <DatePicker
                                    selected={etapa.loading_date} onChange={(date) => handleEtapaChange(index, 'loading_date', date)}
                                    dateFormat="dd/MM/yyyy" placeholderText="Fecha Carga" className="form-input date-picker-full-width" isClearable
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <InputLabel sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem' }}>Delivery Date:</InputLabel>
                                <DatePicker
                                    selected={etapa.delivery_date} onChange={(date) => handleEtapaChange(index, 'delivery_date', date)}
                                    dateFormat="dd/MM/yyyy" placeholderText="Fecha Entrega" className="form-input date-picker-full-width" isClearable
                                />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField fullWidth size="small" label="Cita Entrega (Hora):" value={etapa.time_of_delivery || ''} onChange={(e) => handleEtapaChange(index, 'time_of_delivery', e.target.value)} />
                            </Grid>
                            
                            {/* Fila 5: Rates / Millas */}
                            <Grid item xs={12} md={3}>
                                <TextField fullWidth size="small" type="number" label="Rate Tarifa:" value={etapa.rate_tarifa} onChange={(e) => handleEtapaChange(index, 'rate_tarifa', e.target.value)} />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField fullWidth size="small" type="number" label="Millas PC Miller Cortas:" value={etapa.millas_pcmiller} onChange={(e) => handleEtapaChange(index, 'millas_pcmiller', e.target.value)} />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField fullWidth size="small" type="number" label="Millas PC Miller Practicas:" value={etapa.millas_pcmiller_practicas} onChange={(e) => handleEtapaChange(index, 'millas_pcmiller_practicas', e.target.value)} />
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextField fullWidth size="small" multiline rows={3} label="Comments:" value={etapa.comments} onChange={(e) => handleEtapaChange(index, 'comments', e.target.value)} />
                            </Grid>
                            
                            {/* Fila 6: Documentos */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 2, mb: 1, borderTop: '1px dashed #ccc', pt: 1 }}>
                                    Documentos de Etapa
                                </Typography>
                            </Grid>

                            <Grid item xs={12}>
                                <Stack direction="row" spacing={3} sx={{ flexWrap: 'wrap' }}>
                                    {/* Mapeo de Documentos NormalTrip/BorderCrossing */}
                                    {etapa.stageType === 'normalTrip' && (
                                        <>
                                            <StageInput label="IMA Invoice" docType="ima_invoice" stageIndex={index} documentos={etapa.documentos} abrirModal={abrirModalDocs} />
                                            <StageInput label="CI" docType="ci" stageIndex={index} documentos={etapa.documentos} abrirModal={abrirModalDocs} />
                                            <StageInput label="BL" docType="bl" stageIndex={index} documentos={etapa.documentos} abrirModal={abrirModalDocs} />
                                            <StageInput label="BL Firmado" docType="bl_firmado" stageIndex={index} documentos={etapa.documentos} abrirModal={abrirModalDocs} />
                                        </>
                                    )}
                                    {etapa.stageType === 'borderCrossing' && (
                                        <>
                                            <StageInput label="IMA Invoice" docType="ima_invoice" stageIndex={index} documentos={etapa.documentos} abrirModal={abrirModalDocs} />
                                            <StageInput label="Carta Porte" docType="carta_porte" stageIndex={index} documentos={etapa.documentos} abrirModal={abrirModalDocs} />
                                            <StageInput label="CI" docType="ci" stageIndex={index} documentos={etapa.documentos} abrirModal={abrirModalDocs} />
                                            <StageInput label="Entry" docType="entry" stageIndex={index} documentos={etapa.documentos} abrirModal={abrirModalDocs} />
                                            <StageInput label="Manifiesto" docType="manifiesto" stageIndex={index} documentos={etapa.documentos} abrirModal={abrirModalDocs} />
                                            <StageInput label="BL" docType="bl" stageIndex={index} documentos={etapa.documentos} abrirModal={abrirModalDocs} />
                                            <StageInput label="Orden Retiro" docType="orden_retiro" stageIndex={index} documentos={etapa.documentos} abrirModal={abrirModalDocs} />
                                            <StageInput label="BL Firmado" docType="bl_firmado" stageIndex={index} documentos={etapa.documentos} abrirModal={abrirModalDocs} />
                                        </>
                                    )}
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>
                ))}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mt: 3, pb: 2 }}>
                <Button type="button" variant="outlined" size="small" onClick={() => agregarNuevaEtapa('borderCrossing')}>+ Añadir Etapa Cruce</Button>
                <Button type="button" variant="outlined" size="small" onClick={() => agregarNuevaEtapa('normalTrip')}>+ Añadir Etapa Normal</Button>
            </Box>


            {/* Modal de Documentos y Modal de Caja Externa */}
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

export default TripFormNew;