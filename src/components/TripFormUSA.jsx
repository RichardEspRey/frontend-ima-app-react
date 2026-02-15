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

const TripFormUSA = ({ tripNumber, countryCode, tripYear, isTransnational, isContinuation, transnationalNumber, movementNumber, onSuccess }) => {

    // Hooks
    const { activeDrivers, loading: loadingDrivers, error: errorDrivers } = useFetchActiveDrivers();
    const { activeTrucks, loading: loadingTrucks, error: errorTrucks } = useFetchActiveTrucks();
    const { activeTrailers, loading: loadingCajas, error: errorCajas } = useFetchActiveTrailers();
    const { activeExternalTrailers, loading: loadingCajasExternas, error: errorCajasExternas, refetch: refetchExternalTrailers } = useFetchActiveExternalTrailers();
    const { activeCompanies, loading: loadingCompanies, error: errorCompanies } = useFetchCompanies();
    const { activeWarehouses, loading: loadingWarehouses, error: errorWarehouses } = useFetchWarehouses();

    // States
    const [driver1, setDriver1] = useState(null);
    const [driver2, setDriver2] = useState(null);
    const [truck, setTruck] = useState(null);
    const [caja, setCaja] = useState(null);
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
        setEtapas(p => p.filter((_, idx) => idx !== i).map((e, idx) => ({ ...e, stage_number: idx + 1 })));
    };

    const updateStage = (i, f, v) => setEtapas(p => { const c = [...p]; c[i] = { ...c[i], [f]: v }; return c; });

    // Handlers Paradas
    const addStop = (i) => setEtapas(p => { const c = [...p]; c[i].stops_in_transit = [...(c[i].stops_in_transit || []), { location: '', time_of_delivery: '', bl_firmado_doc: null }]; return c; });
    const removeStop = (i, si) => setEtapas(p => { const c = [...p]; c[i].stops_in_transit = c[i].stops_in_transit.filter((_, idx) => idx !== si); return c; });
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
        const found = externalTrailers.find(t => t.id === newId);
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


    // Submit
    const handleSubmit = async () => {
        if (!tripNumber || !driver1 || !truck) return Swal.fire("Error", "Faltan datos de recursos", "error");
        if (tipoCaja === 'internal' && !caja) return Swal.fire("Error", "Falta caja interna", "error");
        if (tipoCaja === 'external' && !cajaExterna) return Swal.fire("Error", "Falta caja externa", "error");

        setLoadingSave(true);
        try {
            const fullTripId = `${countryCode}${tripYear.toString().slice(-2)}-${tripNumber}`;
            const fd = new FormData();
            fd.append('op', 'create_trip_complete');
            fd.append('trip_number', fullTripId);
            fd.append('pais', countryCode);
            fd.append('anio', tripYear);
            fd.append('driver_id', driver1);
            if (driver2) fd.append('driver2_id', driver2);
            fd.append('truck_id', truck);
            fd.append(tipoCaja === 'internal' ? 'trailer_id' : 'external_trailer_id', tipoCaja === 'internal' ? caja : (cajaExterna.value || cajaExterna));

            if (isTransnational) {
                fd.append('is_transnational', 1);
                if (isContinuation) fd.append('transnational_trip_id', transnationalNumber);
                if (movementNumber) fd.append('movement_number', movementNumber);
            }

            etapas.forEach((etapa, idx) => {
                const prefix = `etapas[${idx}]`;
                fd.append(`${prefix}[stageType]`, etapa.stageType);
                fd.append(`${prefix}[stage_number]`, etapa.stage_number);
                fd.append(`${prefix}[company_id]`, etapa.company_id || '');
                fd.append(`${prefix}[travel_direction]`, etapa.travel_direction || '');
                fd.append(`${prefix}[ci_number]`, etapa.ci_number || '');
                fd.append(`${prefix}[origin]`, etapa.origin || '');
                fd.append(`${prefix}[zip_code_origin]`, etapa.zip_code_origin || '');
                fd.append(`${prefix}[warehouse_origin_id]`, etapa.warehouse_origin_id || '');
                fd.append(`${prefix}[loading_date]`, etapa.loading_date ? format(etapa.loading_date, 'yyyy-MM-dd') : '');
                fd.append(`${prefix}[destination]`, etapa.destination || '');
                fd.append(`${prefix}[zip_code_destination]`, etapa.zip_code_destination || '');
                fd.append(`${prefix}[warehouse_destination_id]`, etapa.warehouse_destination_id || '');
                fd.append(`${prefix}[delivery_date]`, etapa.delivery_date ? format(etapa.delivery_date, 'yyyy-MM-dd') : '');
                fd.append(`${prefix}[millas_pcmiller]`, etapa.millas_pcmiller || '');
                fd.append(`${prefix}[millas_pcmiller_practicas]`, etapa.millas_pcmiller_practicas || '');
                fd.append(`${prefix}[comments]`, etapa.comments || '');

                if (etapa.documentos) {
                    Object.keys(etapa.documentos).forEach(key => {
                        if (etapa.documentos[key]?.file) fd.append(`${prefix}[docs][${key}]`, etapa.documentos[key].file);
                    });
                }
                if (etapa.stops_in_transit) {
                    etapa.stops_in_transit.forEach((s, si) => {
                        fd.append(`${prefix}[stops][${si}][location]`, s.location || '');
                        fd.append(`${prefix}[stops][${si}][time_of_delivery]`, s.time_of_delivery || '');
                        if (s.bl_firmado_doc?.file) fd.append(`${prefix}[stops][${si}][bl_firmado_doc]`, s.bl_firmado_doc.file);
                    });
                }
            });

            const res = await fetch(`${apiHost}/trips.php`, { method: "POST", body: fd });
            const data = await res.json();
            if (data.status === "success") {
                Swal.fire("¡Éxito!", `Viaje ${fullTripId} creado`, "success");
                onSuccess();
            } else throw new Error(data.message || "Error desconocido");
        } catch (e) {
            Swal.fire("Error", e.message, "error");
        } finally {
            setLoadingSave(false);
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
                {etapas.map((etapa, idx) => {
                    const isEmpty = etapa.stageType === 'emptyMileage';
                    return (
                        <Paper key={idx} elevation={2} sx={{ overflow: 'hidden', borderLeft: `6px solid ${isEmpty ? '#757575' : '#1976d2'}` }}>
                            <Box sx={{ bgcolor: isEmpty ? '#eeeeee' : '#e3f2fd', px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip label={`#${idx + 1}`} size="small" sx={{ bgcolor: isEmpty ? '#757575' : '#1976d2', color: 'white', fontWeight: 'bold' }} />
                                    <Typography variant="subtitle1" fontWeight={700}>{isEmpty ? 'Etapa Vacía' : 'Viaje Normal'}</Typography>
                                </Stack>
                                <Box>
                                    {!isEmpty && <Button size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => addStop(idx)} sx={{ mr: 1 }}>Parada</Button>}
                                    <IconButton size="small" color="error" onClick={() => removeStage(idx)}><DeleteIcon /></IconButton>
                                </Box>
                            </Box>
                            <Box sx={{ p: 3 }}>
                                {isEmpty ? (
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={4}><TextField fullWidth label="Millas PC*Miler" type="number" value={etapa.millas_pcmiller} onChange={e => updateStage(idx, 'millas_pcmiller', e.target.value)} /></Grid>
                                        <Grid item xs={12} sm={4}><TextField fullWidth label="Millas Prácticas" type="number" value={etapa.millas_pcmiller_practicas} onChange={e => updateStage(idx, 'millas_pcmiller_practicas', e.target.value)} /></Grid>
                                        <Grid item xs={12} sm={4}><TextField fullWidth label="Comentarios" multiline value={etapa.comments} onChange={e => updateStage(idx, 'comments', e.target.value)} /></Grid>
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
                                                    <Stack direction="row" spacing={1}><TextField label="Ciudad" fullWidth size="small" value={etapa.destination} onChange={e => updateStage(idx, 'destination', e.target.value)} /><TextField label="Zip" size="small" sx={{ width: 100 }} value={etapa.zip_code_destination} onChange={e => updateStage(idx, 'zip_code_destination', e.target.value)} /></Stack>
                                                    <TextField label="Fecha Entrega" type="date" InputLabelProps={{ shrink: true }} size="small" fullWidth value={etapa.delivery_date ? format(etapa.delivery_date, 'yyyy-MM-dd') : ''} onChange={e => updateStage(idx, 'delivery_date', e.target.value ? new Date(e.target.value + 'T12:00:00') : null)} />
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
                                                            <Grid item xs={5}><TextField label="Ubicación" size="small" fullWidth value={stop.location} onChange={e => updateStop(idx, si, 'location', e.target.value)} /></Grid>
                                                            <Grid item xs={3}><TextField label="Hora" type="time" size="small" fullWidth InputLabelProps={{ shrink: true }} value={stop.time_of_delivery} onChange={e => updateStop(idx, si, 'time_of_delivery', e.target.value)} /></Grid>
                                                            <Grid item xs={3}><DocButton label="BL Parada" doc={stop.bl_firmado_doc} onClick={() => openDocModal(idx, 'bl_firmado_doc', si)} /></Grid>
                                                            <Grid item xs={1}><IconButton size="small" color="error" onClick={() => removeStop(idx, si)}><DeleteIcon /></IconButton></Grid>
                                                        </Grid>
                                                    ))}
                                                </Paper>
                                            </Grid>
                                        )}

                                        <Grid item xs={12}><Divider /></Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" fontWeight={700}>Documentación</Typography>
                                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                                    {['doda','entry', 'manifiesto', 'bl', 'orden_de_retiro','DTOPS'].map(docKey => (
                                                    <Grid item xs={6} sm={3} key={docKey}>
                                                        <DocButton label={docKey.toUpperCase().replace('_', ' ')} doc={etapa.documentos[docKey]} onClick={() => openDocModal(idx, docKey)} />
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

export default TripFormUSA;





