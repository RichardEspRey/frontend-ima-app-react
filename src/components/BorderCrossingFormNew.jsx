import React, { useState, useMemo } from 'react';
import { 
    Box, Typography, Grid, Stack, TextField, Button, Paper, 
    CircularProgress, Divider, IconButton, Chip 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PlaceIcon from '@mui/icons-material/Place';
import FlagIcon from '@mui/icons-material/Flag';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { format } from 'date-fns'; 

import ModalArchivo from './ModalArchivo';
import ModalCajaExterna from '../components/ModalCajaExterna';

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

const initialBorderCrossingDocs = {
    ima_invoice: null, doda: null, ci: null, entry: null,
    manifiesto: null, cita_entrega: null, bl: null, orden_retiro: null, bl_firmado: null,
};

const initialEtapaStateBase = {
    stage_number: 1, company_id: null, origin: '', zip_code_origin: '', loading_date: new Date(),
    warehouse_origin_id: null, destination: '', zip_code_destination: '', delivery_date: new Date(),
    warehouse_destination_id: null, travel_direction: '', ci_number: '', invoice_number: '',
    rate_tarifa: '', millas_pcmiller: '', millas_pcmiller_practicas: '', comments: '',
    documentos: { ...initialBorderCrossingDocs }, time_of_delivery: '', stops_in_transit: []
};

const BorderCrossingFormNew = ({ tripNumber, countryCode, tripYear, isTransnational, isContinuation, transnationalNumber, movementNumber, onSuccess }) => {
    
    // Hooks
    const { drivers, loading: lDrivers } = useFetchActiveDrivers();
    const { trucks, loading: lTrucks } = useFetchActiveTrucks();
    const { trailers, loading: lTrailers } = useFetchActiveTrailers();
    const { externalTrailers, loading: lExt, refreshTrailers } = useFetchActiveExternalTrailers();
    const { companies, loading: lComp, createCompany } = useFetchCompanies();
    const { warehouses, loading: lWare, createWarehouse } = useFetchWarehouses();

    const [driver1, setDriver1] = useState(null);
    const [driver2, setDriver2] = useState(null);
    const [truck, setTruck] = useState(null);
    const [caja, setCaja] = useState(null);
    const [cajaExterna, setCajaExterna] = useState(null);
    const [tipoCaja, setTipoCaja] = useState('internal');
    const [etapas, setEtapas] = useState([{ ...initialEtapaStateBase, stageType: 'borderCrossing' }]);
    const [loadingSave, setLoadingSave] = useState(false);

    // Modales
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalTarget, setModalTarget] = useState({ stageIndex: null, docType: null, stopIndex: null });
    const [modalCajaOpen, setModalCajaOpen] = useState(false);

    // Memos 
    const driverOptions = useMemo(() => (drivers || []).map(d => ({ value: d.driver_id, label: d.nombre })), [drivers]);
    const truckOptions = useMemo(() => (trucks || []).map(t => ({ value: t.truck_id, label: t.unidad })), [trucks]);
    const trailerOptions = useMemo(() => (trailers || []).map(t => ({ value: t.trailer_id, label: `${t.no_economico} (${t.placas})` })), [trailers]);
    const externalTrailerOptions = useMemo(() => (externalTrailers || []).map(t => ({ value: t.id, label: `${t.numero_caja} - ${t.nombre_dueno}` })), [externalTrailers]);
    const companyOptions = useMemo(() => (companies || []).map(c => ({ value: c.company_id, label: c.name })), [companies]);
    const warehouseOptions = useMemo(() => (warehouses || []).map(w => ({ value: w.warehouse_id, label: w.name })), [warehouses]);

    // Handlers
    const addStage = (type) => setEtapas(p => [...p, { ...initialEtapaStateBase, stage_number: p.length + 1, stageType: type, documentos: type === 'borderCrossing' ? {...initialBorderCrossingDocs} : {} }]);
    const removeStage = (i) => {
        if (etapas.length === 1) return Swal.fire("Aviso", "Mínimo una etapa requerida", "info");
        setEtapas(p => p.filter((_, idx) => idx !== i).map((e, idx) => ({ ...e, stage_number: idx + 1 })));
    };
    const updateStage = (i, f, v) => setEtapas(p => { const c = [...p]; c[i] = { ...c[i], [f]: v }; return c; });

    // Docs
    const openDocModal = (si, dt) => { setModalTarget({ stageIndex: si, docType: dt }); setModalAbierto(true); };
    const saveDoc = (data) => {
        const { stageIndex, docType } = modalTarget;
        setEtapas(p => { const c = [...p]; c[stageIndex].documentos = { ...c[stageIndex].documentos, [docType]: data }; return c; });
        setModalAbierto(false);
    };
    const getDocValue = () => {
        const { stageIndex, docType } = modalTarget;
        if (stageIndex === null) return null;
        return etapas[stageIndex].documentos?.[docType];
    };

    const saveExtCaja = async (newId) => {
        await refreshTrailers();
        const found = externalTrailers.find(t => t.id === newId);
        setCajaExterna(found ? { value: newId, label: `${found.numero_caja} - ${found.nombre_dueno}` } : { value: newId, label: 'Nueva Caja' });
        setModalCajaOpen(false);
    };

    const handleSubmit = async () => {
        if (!tripNumber || !driver1 || !truck) return Swal.fire("Error", "Faltan datos de recursos", "error");
        if (tipoCaja === 'internal' && !caja) return Swal.fire("Error", "Falta caja interna", "error");
        if (tipoCaja === 'external' && !cajaExterna) return Swal.fire("Error", "Falta caja externa", "error");

        setLoadingSave(true);
        try {
            const fullTripId = `${countryCode}${tripYear.toString().slice(-2)}-${tripNumber}`;
            const fd = new FormData();
            fd.append('op', 'create_trip_transfer'); // LÓGICA DE CRUCE
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
            });

            const res = await fetch(`${apiHost}/trips.php`, { method: "POST", body: fd });
            const data = await res.json();
            if (data.status === "success") {
                Swal.fire("¡Éxito!", `Cruce ${fullTripId} creado`, "success");
                onSuccess();
            } else throw new Error(data.message || "Error desconocido");
        } catch (e) {
            Swal.fire("Error", e.message, "error");
        } finally {
            setLoadingSave(false);
        }
    };

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
            <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2, borderTop: '4px solid #ed6c02' }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShippingIcon color="warning" /> Recursos de Cruce (Transfer)
                </Typography>
                <Divider sx={{ mb: 3 }} />
                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2">Conductor Transfer</Typography>
                        <Select options={driverOptions} value={driverOptions.find(o => o.value === driver1)} onChange={o => setDriver1(o?.value)} isLoading={lDrivers} styles={selectStyles} placeholder="Seleccionar..." />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2">Camión Transfer</Typography>
                        <Select options={truckOptions} value={truckOptions.find(o => o.value === truck)} onChange={o => setTruck(o?.value)} isLoading={lTrucks} styles={selectStyles} placeholder="Seleccionar..." />
                    </Grid>
                    <Grid item xs={12} md={8}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="subtitle2">Tipo de Caja</Typography>
                                <Select options={[{value:'internal',label:'Interna'},{value:'external',label:'Externa'}]} value={{value:tipoCaja,label:tipoCaja==='internal'?'Interna':'Externa'}} onChange={o=>{setTipoCaja(o.value);setCaja(null);setCajaExterna(null);}} styles={selectStyles} />
                            </Grid>
                            <Grid item xs={12} sm={8}>
                                <Typography variant="subtitle2">Seleccionar Caja</Typography>
                                {tipoCaja === 'internal' ? (
                                    <Select options={trailerOptions} value={trailerOptions.find(o => o.value === caja)} onChange={o => setCaja(o?.value)} isLoading={lTrailers} styles={selectStyles} placeholder="Buscar..." />
                                ) : (
                                    <CreatableSelect options={externalTrailerOptions} value={cajaExterna} onChange={o => setCajaExterna(o)} onCreateOption={() => setModalCajaOpen(true)} isLoading={lExt} styles={selectStyles} placeholder="Buscar o Crear..." />
                                )}
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Paper>

            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4, mb: 2 }}>Itinerario Cruce</Typography>
            <Stack spacing={3}>
                {etapas.map((etapa, idx) => {
                    const isEmpty = etapa.stageType === 'emptyMileage';
                    return (
                        <Paper key={idx} elevation={2} sx={{ overflow: 'hidden', borderLeft: `6px solid ${isEmpty ? '#757575' : '#ed6c02'}` }}>
                            <Box sx={{ bgcolor: isEmpty ? '#eeeeee' : '#fff3e0', px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip label={`#${idx+1}`} size="small" sx={{ bgcolor: isEmpty ? '#757575' : '#ed6c02', color: 'white', fontWeight: 'bold' }} />
                                    <Typography variant="subtitle1" fontWeight={700}>{isEmpty ? 'Etapa Vacía' : 'Etapa Cruce'}</Typography>
                                </Stack>
                                <IconButton size="small" color="error" onClick={() => removeStage(idx)}><DeleteIcon/></IconButton>
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
                                        <Grid item xs={12} md={4}><Typography variant="caption" fontWeight={700}>Compañía</Typography><CreatableSelect options={companyOptions} value={companyOptions.find(o=>o.value===etapa.company_id)} onChange={o=>updateStage(idx,'company_id',o?.value)} onCreateOption={v=>createCompany(v).then(id=>updateStage(idx,'company_id',id))} isLoading={lComp} styles={selectStyles}/></Grid>
                                        <Grid item xs={12} md={4}><Typography variant="caption" fontWeight={700}>Dirección</Typography><Select options={[{value:'Going Up',label:'Going Up'},{value:'Going Down',label:'Going Down'}]} value={{value:etapa.travel_direction,label:etapa.travel_direction||'Seleccionar...'}} onChange={o=>updateStage(idx,'travel_direction',o?.value)} styles={selectStyles}/></Grid>
                                        <Grid item xs={12} md={4}><Typography variant="caption" fontWeight={700}>CI Number</Typography><TextField fullWidth value={etapa.ci_number} onChange={e=>updateStage(idx,'ci_number',e.target.value)} InputProps={{sx:{height:56}}}/></Grid>
                                        
                                        <Grid item xs={12} md={6}>
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                <Typography variant="subtitle2" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}><PlaceIcon fontSize="small"/> ORIGEN</Typography>
                                                <Stack spacing={2}>
                                                    <Box><Typography variant="caption">Bodega</Typography><CreatableSelect options={warehouseOptions} value={warehouseOptions.find(o=>o.value===etapa.warehouse_origin_id)} onChange={o=>updateStage(idx,'warehouse_origin_id',o?.value)} onCreateOption={v=>createWarehouse(v).then(id=>updateStage(idx,'warehouse_origin_id',id))} isLoading={lWare} styles={selectStyles}/></Box>
                                                    <Stack direction="row" spacing={1}><TextField label="Ciudad" fullWidth size="small" value={etapa.origin} onChange={e=>updateStage(idx,'origin',e.target.value)}/><TextField label="Zip" size="small" sx={{width:100}} value={etapa.zip_code_origin} onChange={e=>updateStage(idx,'zip_code_origin',e.target.value)}/></Stack>
                                                    <TextField label="Fecha Carga" type="date" InputLabelProps={{shrink:true}} size="small" fullWidth value={etapa.loading_date ? format(etapa.loading_date, 'yyyy-MM-dd') : ''} onChange={e => updateStage(idx, 'loading_date', e.target.value ? new Date(e.target.value+'T12:00:00') : null)} />
                                                </Stack>
                                            </Paper>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                <Typography variant="subtitle2" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}><FlagIcon fontSize="small"/> DESTINO</Typography>
                                                <Stack spacing={2}>
                                                    <Box><Typography variant="caption">Bodega</Typography><CreatableSelect options={warehouseOptions} value={warehouseOptions.find(o=>o.value===etapa.warehouse_destination_id)} onChange={o=>updateStage(idx,'warehouse_destination_id',o?.value)} onCreateOption={v=>createWarehouse(v).then(id=>updateStage(idx,'warehouse_destination_id',id))} isLoading={lWare} styles={selectStyles}/></Box>
                                                    <Stack direction="row" spacing={1}><TextField label="Ciudad" fullWidth size="small" value={etapa.destination} onChange={e=>updateStage(idx,'destination',e.target.value)}/><TextField label="Zip" size="small" sx={{width:100}} value={etapa.zip_code_destination} onChange={e=>updateStage(idx,'zip_code_destination',e.target.value)}/></Stack>
                                                    <TextField label="Fecha Entrega" type="date" InputLabelProps={{shrink:true}} size="small" fullWidth value={etapa.delivery_date ? format(etapa.delivery_date, 'yyyy-MM-dd') : ''} onChange={e => updateStage(idx, 'delivery_date', e.target.value ? new Date(e.target.value+'T12:00:00') : null)} />
                                                </Stack>
                                            </Paper>
                                        </Grid>

                                        <Grid item xs={12}><Divider/></Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" fontWeight={700}>Documentación Cruce</Typography>
                                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                                {Object.keys(initialBorderCrossingDocs).map(docKey => (
                                                    <Grid item xs={6} sm={3} key={docKey}>
                                                        <DocButton label={docKey.toUpperCase().replace('_', ' ')} doc={etapa.documentos[docKey]} onClick={()=>openDocModal(idx, docKey)} />
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
                <Button variant="contained" color="warning" onClick={() => addStage('borderCrossing')} startIcon={<AddCircleOutlineIcon/>}>Agregar Cruce</Button>
                <Button variant="outlined" color="secondary" onClick={() => addStage('emptyMileage')} startIcon={<AddCircleOutlineIcon/>}>Agregar Vacía</Button>
            </Stack>

            <Paper elevation={10} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, zIndex: 1000, textAlign: 'right', bgcolor: '#fff' }}>
                <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>
                    <Button variant="contained" size="large" color="success" startIcon={loadingSave ? <CircularProgress size={24} color="inherit"/> : <SaveIcon />} onClick={handleSubmit} disabled={loadingSave} sx={{ px: 6 }}>
                        {loadingSave ? "Guardando..." : "GUARDAR CRUCE"}
                    </Button>
                </Box>
            </Paper>

            {modalAbierto && <ModalArchivo isOpen={modalAbierto} onClose={() => { setModalAbierto(false); setModalTarget({ stageIndex: null, docType: null }); }} onSave={saveDoc} nombreCampo={modalTarget.docType} valorActual={getDocValue()} />}
            {modalCajaOpen && <ModalCajaExterna isOpen={modalCajaOpen} onClose={() => setModalCajaOpen(false)} onSave={saveExtCaja} />}
        </Box>
    );
};

export default BorderCrossingFormNew;