import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box, Typography, Grid, Stack, TextField, Button, Paper,
    CircularProgress, Divider, IconButton, Chip, InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PlaceIcon from '@mui/icons-material/Place';
import FlagIcon from '@mui/icons-material/Flag';
import SelectWrapper from '../components/SelectWrapper';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { format } from 'date-fns';

// Modales
import ModalArchivo from './ModalArchivo';
import ModalCajaExterna from './ModalCajaExterna';

// Hooks
import useFetchActiveDrivers from '../hooks/useFetchActiveDrivers';
import useFetchActiveTrucks from '../hooks/useFetchActiveTrucks';
import useFetchActiveTrailers from '../hooks/useFetchActiveTrailers';
import useFetchActiveExternalTrailers from '../hooks/useFetchActiveExternalTrailers';
import useFetchCompanies from '../hooks/useFetchCompanies';
import useFetchWarehouses from '../hooks/useFetchWarehouses';

const apiHost = import.meta.env.VITE_API_HOST;

const selectStyles = {
    control: (base) => ({
        ...base, height: '56px', minHeight: '56px', borderRadius: '4px',
        borderColor: 'rgba(0, 0, 0, 0.23)', '&:hover': { borderColor: 'rgba(0, 0, 0, 0.87)' }
    }),
    menu: (base) => ({ ...base, zIndex: 9999 })
};

// Estados iniciales
const initialNormalTripDocs = { ima_invoice: null, ci: null, bl: null, bl_firmado: null };

const initialEtapaStateBase = {
    stage_number: 1, company_id: null, origin: '', zip_code_origin: '', loading_date: new Date(),
    warehouse_origin_id: null, destination: '', zip_code_destination: '', delivery_date: new Date(),
    warehouse_destination_id: null, travel_direction: '', ci_number: '', invoice_number: '',
    rate_tarifa: '', millas_pcmiller: '', millas_pcmiller_practicas: '', comments: '',
    documentos: { ...initialNormalTripDocs }, time_of_delivery: '', stops_in_transit: []
};

const TripFormMX = ({ tripNumber, countryCode, tripYear, isTransnational, isContinuation, transnationalNumber, movementNumber, onSuccess }) => {

    // Hooks
    const { activeDrivers, loading: loadingDrivers, error: errorDrivers } = useFetchActiveDrivers();
    const { activeTrucks, loading: loadingTrucks, error: errorTrucks } = useFetchActiveTrucks();
    const { activeTrailers, loading: loadingCajas, error: errorCajas } = useFetchActiveTrailers();
    const { activeExternalTrailers, loading: loadingCajasExternas, error: errorCajasExternas, refetch: refetchExternalTrailers } = useFetchActiveExternalTrailers();
    const { activeCompanies, loading: loadingCompanies, error: errorCompanies } = useFetchCompanies();
    const { activeWarehouses, loading: loadingWarehouses, error: errorWarehouses } = useFetchWarehouses();

    // States
    
    const [cajaExterna, setCajaExterna] = useState(null);
    const [tipoCaja, setTipoCaja] = useState('internal');
    const [etapas, setEtapas] = useState([{ ...initialEtapaStateBase, stageType: 'normalTrip' }]);
    const [loadingSave, setLoadingSave] = useState(false);
    const [tripMode, setTripMode] = useState('individual');
    // Modales
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalTarget, setModalTarget] = useState({ stageIndex: null, docType: null, stopIndex: null });
    const [mostrarFechaVencimientoModal, setMostrarFechaVencimientoModal] = useState(false);
    const [IsModalCajaExternaOpen, setIsModalCajaExternaOpen] = useState(false);

    // Memos para opciones 
    const [isCreatingCompany, setIsCreatingCompany] = useState(false);
    const [isCreatingWarehouse, setIsCreatingWarehouse] = useState(false);
    const [trailerType, setTrailerType] = useState('interna');
    const [companyOptions, setCompanyOptions] = useState([]);
    const [warehouseOptions, setWarehouseOptions] = useState([]);

    const [formData, setFormData] = useState({
        trip_number: tripNumber || '',
        driver_id: '',
        driver_id_second: '',
        truck_id: '',
        caja_id: '',
        caja_externa_id: ''
    });
    const setForm = (name, value) => {
        setFormData(prevData => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Handlers Etapas
    const addStage = (type) => setEtapas(p => [...p, { ...initialEtapaStateBase, stage_number: p.length + 1, stageType: type }]);

    const removeStage = (i) => {
        if (etapas.length === 1) return Swal.fire("Aviso", "Mínimo una etapa requerida", "info");
        setEtapas(p => p.filter((_, index) => index !== i).map((e, index) => ({ ...e, stage_number: index + 1 })));
    };

    const updateStage = (i, f, v) => setEtapas(p => { const c = [...p]; c[i] = { ...c[i], [f]: v }; return c; });

    // Handlers Paradas
    const addStop = (i) => setEtapas(p => { const c = [...p]; c[i].stops_in_transit = [...(c[i].stops_in_transit || []), { location: '', time_of_delivery: '', bl_firmado_doc: null }]; return c; });
    const removeStop = (i, si) => setEtapas(p => { const c = [...p]; c[i].stops_in_transit = c[i].stops_in_transit.filter((_, index) => index !== si); return c; });
    const updateStop = (i, si, f, v) => setEtapas(p => { const c = [...p]; c[i].stops_in_transit[si][f] = v; return c; });

    // Docs
    const openDocModal = (si, dt, spi = null) => { setModalTarget({ stageIndex: si, docType: dt, stopIndex: spi }); setMostrarFechaVencimientoModal(false); setModalAbierto(true); };

    const saveDoc = (data) => {
        const { stageIndex, docType, stopIndex } = modalTarget;
        setEtapas(p => {
            const c = [...p];
            if (stopIndex !== null) c[stageIndex].stops_in_transit[stopIndex][docType] = data;
            else c[stageIndex].documentos = { ...c[stageIndex].documentos, [docType]: data };
            return c;
        });
        setModalAbierto(false);
    };

    const getDocValue = () => {
        const { stageIndex, docType, stopIndex } = modalTarget;
        if (stageIndex === null) return null;
        return stopIndex !== null ? etapas[stageIndex].stops_in_transit[stopIndex]?.[docType] : etapas[stageIndex].documentos?.[docType];
    };

    // Caja Externa
    const saveExtCaja = async (newId) => {
        await refreshTrailers();
        const found = activeExternalTrailers.find(t => t.id === newId);
        setCajaExterna(found ? { value: newId, label: `${found.numero_caja} - ${found.nombre_dueno}` } : { value: newId, label: 'Nueva Caja' });
        setIsModalCajaExternaOpen(false);
    };


    const handleTrailerTypeChange = (type) => {
        setTrailerType(type);
        if (type === 'interna') {
            setFormData(prev => ({ ...prev, caja_externa_id: '' }));
        } else {
            setFormData(prev => ({ ...prev, caja_id: '' }));
        }
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


    // Submit
    const handleSubmit = async (e) => {
    e.preventDefault();

    // 🔐 Validaciones mínimas (igual que base)
    if (!formData.driver_id || !formData.truck_id) {
        Swal.fire('Campos incompletos', 'Seleccione Driver y Truck', 'warning');
        return;
    }

    for (let i = 0; i < etapas.length; i++) {
        const etapa = etapas[i];
        if (!etapa.company_id || !etapa.destination || !etapa.warehouse_destination_id) {
            Swal.fire(
                'Campos incompletos',
                `Complete los datos obligatorios de la etapa ${i + 1}`,
                'warning'
            );
            return;
        }
    }

    Swal.fire({
        title: 'Guardando viaje...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    const fd = new FormData();
    fd.append('op', 'Alta');

    // 🔹 Datos principales (IGUAL QUE BASE)
    fd.append('trip_number', formData.trip_number);
    fd.append('driver_id', formData.driver_id);
    fd.append('driver_id_second', formData.driver_id_second || '');
    fd.append('truck_id', formData.truck_id);
    fd.append('caja_id', trailerType === 'interna' ? formData.caja_id : '');
    fd.append('caja_externa_id', trailerType === 'externa' ? formData.caja_externa_id : '');
    fd.append('country_code', countryCode);
    fd.append('trip_year', String(tripYear).slice(-2));
    fd.append('is_transnational', isTransnational ? 1 : 0);

    if (isTransnational) {
        fd.append('transnational_number', isContinuation ? transnationalNumber : '');
        fd.append('movement_number', isContinuation ? movementNumber : 1);
    } else {
        fd.append('transnational_number', '');
        fd.append('movement_number', '');
    }

    // 🔹 Etapas → JSON (MISMA FORMA QUE BASE)
    const etapasJson = etapas.map((etapa) => ({
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
            acc[key] = value
                ? { fileName: value.fileName || '', vencimiento: value.vencimiento || null }
                : null;
            return acc;
        }, {})
    }));

    fd.append('etapas', JSON.stringify(etapasJson));

    // 🔹 Archivos por etapa (MISMA NOMENCLATURA)
    etapas.forEach((etapa, idx) => {
        Object.entries(etapa.documentos).forEach(([docType, docData]) => {
            if (docData?.file instanceof File) {
                fd.append(
                    `etapa_${idx}_${docType}_file`,
                    docData.file,
                    docData.fileName
                );
            }
        });
    });

    // 🔹 Envío
    try {
        const res = await fetch(`${apiHost}/new_tripsv2.php`, {
            method: 'POST',
            body: fd
        });

        const result = await res.json();

        if (res.ok && result.status === 'success') {
            Swal.fire('¡Éxito!', 'Viaje guardado correctamente', 'success');
            onSuccess?.();
        } else {
            throw new Error(result.message || 'Error al guardar');
        }
    } catch (err) {
        Swal.fire('Error', err.message, 'error');
    }
};


    const handleTripModeChange = (mode) => {
        setTripMode(mode);
        if (mode === 'individual') {
            setFormData(prev => ({ ...prev, driver_id_second: '' }));
        }
    };
    const handleCreateCompany = async (inputValue, stageIndex) => {
        setIsCreatingCompany(true);
        const fd = new FormData();
        fd.append('op', 'CreateCompany');
        fd.append('nombre_compania', inputValue);

        try {
            const res = await fetch(`${apiHost}/companies.php`, {
                method: 'POST',
                body: fd
            });
            const result = await res.json();

            if (result.status === 'success') {
                const newOption = {
                    value: result.company.company_id,
                    label: result.company.nombre_compania
                };
                setCompanyOptions(p => [...p, newOption]);
                handleEtapaChange(stageIndex, 'company_id', newOption.value);
                Swal.fire('Éxito', 'Compañía creada', 'success');
            }
        } catch (e) {
            Swal.fire('Error', 'No se pudo crear compañía', 'error');
        } finally {
            setIsCreatingCompany(false);
        }
    };
    const handleCreateWarehouse = async (inputValue, stageIndex, fieldKey) => {
        setIsCreatingWarehouse(true);
        const fd = new FormData();
        fd.append('op', 'CreateWarehouse');
        fd.append('nombre_almacen', inputValue);

        try {
            const res = await fetch(`${apiHost}/warehouses.php`, {
                method: 'POST',
                body: fd
            });
            const result = await res.json();

            if (result.status === 'success') {
                const newOption = {
                    value: result.warehouse.warehouse_id,
                    label: result.warehouse.nombre_almacen
                };
                setWarehouseOptions(p => [...p, newOption]);
                handleEtapaChange(stageIndex, fieldKey, newOption.value);
                Swal.fire('Éxito', 'Bodega creada', 'success');
            }
        } catch (e) {
            Swal.fire('Error', 'No se pudo crear bodega', 'error');
        } finally {
            setIsCreatingWarehouse(false);
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


    const DocButton = ({ label, doc, onClick }) => (
        <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderColor: doc ? 'success.main' : 'divider' }}>
            <Box sx={{ overflow: 'hidden', mr: 1 }}>
                <Typography variant="caption" fontWeight={700} display="block" color="text.secondary">{label}</Typography>
                <Typography variant="caption" noWrap display="block" color={doc ? 'text.primary' : 'text.disabled'}>
                    {doc ? (doc.fileName || doc.name) : 'Sin archivo'}
                </Typography>
            </Box>
            <IconButton size="small" color={doc ? "success" : "primary"} onClick={onClick}><UploadFileIcon fontSize="small" /></IconButton>
        </Paper>
    );

    return (
        <Box pb={10}>
            <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2, borderTop: '4px solid #1976d2' }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShippingIcon color="primary" /> Recursos del Viaje
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2">Conductor Principal</Typography>
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
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2">Tipo de viaje</Typography>
                        <InputLabel sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>Tipo de Viaje:</InputLabel>
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Button variant={tripMode === 'individual' ? 'contained' : 'outlined'} size="small" onClick={() => handleTripModeChange('individual')}>Viaje Individual</Button>
                            <Button variant={tripMode === 'team' ? 'contained' : 'outlined'} size="small" onClick={() => handleTripModeChange('team')}>Viaje en Equipo</Button>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2">Camión</Typography>
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
                    <Grid item xs={12} md={8}>
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
                </Grid>
            </Paper>

            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4, mb: 2 }}>Informacion del viaje</Typography>
            <Stack spacing={3}>
                {etapas.map((etapa, index) => {
                    const isEmpty = etapa.stageType === 'emptyMileage';
                    return (
                        <Paper key={index} elevation={2} sx={{ overflow: 'hidden', borderLeft: `6px solid ${isEmpty ? '#757575' : '#1976d2'}` }}>
                            <Box sx={{ bgcolor: isEmpty ? '#eeeeee' : '#e3f2fd', px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip label={`#${index + 1}`} size="small" sx={{ bgcolor: isEmpty ? '#757575' : '#1976d2', color: 'white', fontWeight: 'bold' }} />
                                    <Typography variant="subtitle1" fontWeight={700}>{isEmpty ? 'Etapa Vacía' : 'Viaje Normal'}</Typography>
                                </Stack>
                                <Box>
                                    {!isEmpty && <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => addStop(index)} sx={{ mr: 1 }}>Parada</Button>}
                                    <IconButton size="small" color="error" onClick={() => removeStage(index)}><DeleteIcon /></IconButton>
                                </Box>
                            </Box>
                            <Box sx={{ p: 3 }}>
                                {isEmpty ? (
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={4}><TextField fullWidth label="Millas PC*Miler" type="number" value={etapa.millas_pcmiller} onChange={e => updateStage(index, 'millas_pcmiller', e.target.value)} /></Grid>
                                        <Grid item xs={12} sm={4}><TextField fullWidth label="Millas Prácticas" type="number" value={etapa.millas_pcmiller_practicas} onChange={e => updateStage(index, 'millas_pcmiller_practicas', e.target.value)} /></Grid>
                                        <Grid item xs={12} sm={4}><TextField fullWidth label="Comentarios" multiline value={etapa.comments} onChange={e => updateStage(index, 'comments', e.target.value)} /></Grid>
                                    </Grid>
                                ) : (
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={4}><Typography variant="caption" fontWeight={700}>Compañía</Typography>
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

                                        <Grid item xs={12} md={6}>
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                <Typography variant="subtitle2" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}><FlagIcon fontSize="small" /> DESTINO</Typography>
                                                <Stack spacing={2}>
                                                    <Box><Typography variant="caption">Bodega</Typography>
                                                        <SelectWrapper
                                                            label="Destination Warehouse:" isCreatable
                                                            value={warehouseOptions.find(w => w.value === etapa.warehouse_destination_id) || null}
                                                            onChange={(selected) => handleEtapaChange(index, 'warehouse_destination_id', selected ? selected.value : '')}
                                                            onCreateOption={(inputValue) => handleCreateWarehouse(inputValue, index, 'warehouse_destination_id')}
                                                            options={warehouseOptions} placeholder="Seleccionar o Crear Bodega Destino"
                                                            isLoading={loadingWarehouses || isCreatingWarehouse}
                                                            formatCreateLabel={(inputValue) => `Crear bodega: "${inputValue}"`}
                                                        />
                                                    </Box>
                                                    <Stack direction="row" spacing={1}><TextField label="Ciudad" fullWidth size="small" value={etapa.destination} onChange={e => updateStage(index, 'destination', e.target.value)} /><TextField label="Zip" size="small" sx={{ width: 100 }} value={etapa.zip_code_destination} onChange={e => updateStage(index, 'zip_code_destination', e.target.value)} /></Stack>
                                                    <TextField label="Fecha Entrega" type="date" InputLabelProps={{ shrink: true }} size="small" fullWidth value={etapa.delivery_date ? format(etapa.delivery_date, 'yyyy-MM-dd') : ''} onChange={e => updateStage(index, 'delivery_date', e.target.value ? new Date(e.target.value + 'T12:00:00') : null)} />
                                                </Stack>
                                            </Paper>
                                        </Grid>

                                        {/* Paradas */}
                                        {etapa.stops_in_transit?.length > 0 && (
                                            <Grid item xs={12}>
                                                <Paper sx={{ p: 2, bgcolor: '#fff8e1', border: '1px dashed #ffb74d' }}>
                                                    <Typography variant="subtitle2" color="warning.dark">Paradas</Typography>
                                                    {etapa.stops_in_transit.map((stop, si) => (
                                                        <Grid container spacing={1} key={si} alignItems="center" sx={{ mt: 1 }}>
                                                            <Grid item xs={5}><TextField label="Ubicación" size="small" fullWidth value={stop.location} onChange={e => updateStop(index, si, 'location', e.target.value)} /></Grid>
                                                            <Grid item xs={3}><TextField label="Hora" type="time" size="small" fullWidth InputLabelProps={{ shrink: true }} value={stop.time_of_delivery} onChange={e => updateStop(index, si, 'time_of_delivery', e.target.value)} /></Grid>
                                                            <Grid item xs={3}><DocButton label="BL Parada" doc={stop.bl_firmado_doc} onClick={() => openDocModal(index, 'bl_firmado_doc', si)} /></Grid>
                                                            <Grid item xs={1}><IconButton size="small" color="error" onClick={() => removeStop(index, si)}><DeleteIcon /></IconButton></Grid>
                                                        </Grid>
                                                    ))}
                                                </Paper>
                                            </Grid>
                                        )}

                                        <Grid item xs={12}><Divider /></Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" fontWeight={700}>Documentación</Typography>
                                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                                {['carta_porte', 'fianza'].map(docKey => (
                                                    <Grid item xs={6} sm={3} key={docKey}>
                                                        <DocButton label={docKey.toUpperCase().replace('_', ' ')} doc={etapa.documentos[docKey]} onClick={() => openDocModal(index, docKey)} />
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                )}
                            </Box>
                        </Paper>
                    );
                })}
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                <Button variant="contained" onClick={() => addStage('normalTrip')} startIcon={<AddCircleOutlineIcon />}>Agregar Viaje</Button>
                <Button variant="outlined" color="secondary" onClick={() => addStage('emptyMileage')} startIcon={<AddCircleOutlineIcon />}>Agregar Vacía</Button>
            </Stack>

            <Paper elevation={10} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, zIndex: 1000, textAlign: 'right', bgcolor: '#fff' }}>
                <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>
                    <Button variant="contained" size="large" color="success" startIcon={loadingSave ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />} onClick={handleSubmit} disabled={loadingSave} sx={{ px: 6 }}>
                        {loadingSave ? "Guardando..." : "GUARDAR VIAJE"}
                    </Button>
                </Box>
            </Paper>

            {modalAbierto && <ModalArchivo isOpen={modalAbierto} onClose={() => { setModalAbierto(false); setModalTarget({ stageIndex: null, docType: null }); }} onSave={saveDoc} nombreCampo={modalTarget.docType} valorActual={getDocValue()} mostrarFechaVencimiento={mostrarFechaVencimientoModal} />}
            {IsModalCajaExternaOpen && <ModalCajaExterna isOpen={IsModalCajaExternaOpen} onClose={() => setIsModalCajaExternaOpen(false)} onSave={saveExtCaja} />}
        </Box>
    );
};

export default TripFormMX;