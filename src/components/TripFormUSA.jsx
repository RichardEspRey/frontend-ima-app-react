import { useState, useEffect } from 'react';
import { Box, Typography, Stack, Button, Paper, CircularProgress } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SaveIcon from '@mui/icons-material/Save';
import Swal from 'sweetalert2';
import { format } from 'date-fns';

import TripResources from './TripFormUSA/TripResources';
import TripStageItem from './TripFormUSA/TripStageItem';
import ModalArchivo from './ModalArchivo'; 
import ModalCajaExterna from './ModalCajaExterna'; 

import useFetchActiveDrivers from '../hooks/useFetchActiveDrivers';
import useFetchActiveTrucks from '../hooks/useFetchActiveTrucks';
import useFetchActiveTrailers from '../hooks/useFetchActiveTrailers';
import useFetchActiveExternalTrailers from '../hooks/useFetchActiveExternalTrailers';
import useFetchCompanies from '../hooks/useFetchCompanies';
import useFetchWarehouses from '../hooks/useFetchWarehouses';

const apiHost = import.meta.env.VITE_API_HOST;

const initialNormalTripDocs = { ima_invoice: null, ci: null, bl: null, bl_firmado: null, qr_manifesto: null };

const initialEtapaStateBase = {
    stage_number: 1, company_id: null, origin: '', zip_code_origin: '', loading_date: new Date(),
    warehouse_origin_id: null, destination: '', zip_code_destination: '', delivery_date: new Date(),
    warehouse_destination_id: null, travel_direction: '', ci_number: '', invoice_number: '',
    rate_tarifa: '', millas_pcmiller: '', millas_pcmiller_practicas: '', comments: '',
    documentos: { ...initialNormalTripDocs }, time_of_delivery: '', date_of_departure: new Date(), stops_in_transit: []
};

const TripFormUSA = ({ tripNumber, countryCode, tripYear, isTransnational, isContinuation, transnationalNumber, movementNumber, origenId, onSuccess, etapas: etapasProp, setEtapas: setEtapasProp, formData: formDataProp, setFormData: setFormDataProp, onSaveOverride }) => {

    // Hooks
    const { activeDrivers, loading: loadingDrivers, error: errorDrivers } = useFetchActiveDrivers();
    const { activeTrucks, loading: loadingTrucks, error: errorTrucks } = useFetchActiveTrucks();
    const { activeTrailers, loading: loadingCajas, error: errorCajas } = useFetchActiveTrailers();
    const { activeExternalTrailers, loading: loadingCajasExternas, error: errorCajasExternas, refetch: refetchExternalTrailers } = useFetchActiveExternalTrailers();
    const { activeCompanies, loading: loadingCompanies } = useFetchCompanies();
    const { activeWarehouses, loading: loadingWarehouses } = useFetchWarehouses();

    // States
    const [etapasLocal, setEtapasLocal] = useState([{ ...initialEtapaStateBase, stageType: 'normalTrip' }]);
    const etapas = etapasProp ?? etapasLocal;
    const setEtapas = setEtapasProp ?? setEtapasLocal;
    const [loadingSave, setLoadingSave] = useState(false);
    const [tripMode, setTripMode] = useState(() => formDataProp?.driver_id_second ? 'team' : 'individual');
    
    // Modales
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalTarget, setModalTarget] = useState({ stageIndex: null, docType: null, stopIndex: null });
    const [mostrarFechaVencimientoModal, setMostrarFechaVencimientoModal] = useState(false);
    const [IsModalCajaExternaOpen, setIsModalCajaExternaOpen] = useState(false);

    // Memos para opciones
    const [isCreatingCompany, setIsCreatingCompany] = useState(false);
    const [isCreatingWarehouse, setIsCreatingWarehouse] = useState(false);
    const [trailerType, setTrailerType] = useState(() => formDataProp?.caja_externa_id ? 'externa' : 'interna');
    const [companyOptions, setCompanyOptions] = useState([]);
    const [warehouseOptions, setWarehouseOptions] = useState([]);

    const [origenes, setOrigenes] = useState([]);

    // 👇 AGREGA ESTE useEffect
    useEffect(() => {
        const fd = new FormData();
        fd.append("op", "get_origenes");
        fetch(`${apiHost}/new_tripsv2.php`, { method: "POST", body: fd })
          .then((res) => res.json())
          .then((data) => {
            if (data.status === "success") setOrigenes(data.data);
          })
          .catch((err) => console.error("Error cargando orígenes:", err));
    }, [apiHost]);

    const [formDataLocal, setFormDataLocal] = useState({
        trip_number: tripNumber || '', driver_id: '', driver_id_second: '', truck_id: '', caja_id: '', caja_externa_id: ''
    });
    const formData = formDataProp ?? formDataLocal;
    const setFormData = setFormDataProp ?? setFormDataLocal;

    const setForm = (name, value) => setFormData(prevData => ({ ...prevData, [name]: value }));

    useEffect(() => { if (activeCompanies) setCompanyOptions(activeCompanies.map(c => ({ value: c.company_id, label: c.nombre_compania }))); }, [activeCompanies]);
    useEffect(() => { if (activeWarehouses) setWarehouseOptions(activeWarehouses.map(w => ({ value: w.warehouse_id, label: w.nombre_almacen }))); }, [activeWarehouses]);
    useEffect(() => { setForm('trip_number', tripNumber || ''); }, [tripNumber]);

    // Handlers Etapas
    const addStage = (type) => setEtapas(p => [...p, { ...initialEtapaStateBase, stage_number: p.length + 1, stageType: type }]);
    const removeStage = (i) => {
        if (etapas.length === 1) return Swal.fire("Aviso", "Mínimo una etapa requerida", "info");
        setEtapas(p => p.filter((_, index) => index !== i).map((e, index) => ({ ...e, stage_number: index + 1 })));
    };
    const updateStage = (i, f, v) => setEtapas(p => { const c = [...p]; c[i] = { ...c[i], [f]: v }; return c; });
    const handleEtapaChange = (index, field, value) => setEtapas(p => { const c = [...p]; c[index] = { ...c[index], [field]: value }; return c; });

    // Handlers Paradas
    const addStop = (i) => setEtapas(p => { const c = [...p]; c[i].stops_in_transit = [...(c[i].stops_in_transit || []), { location: '', time_of_delivery: '', bl_firmado_doc: null }]; return c; });
    const removeStop = (i, si) => setEtapas(p => { const c = [...p]; c[i].stops_in_transit = c[i].stops_in_transit.filter((_, index) => index !== si); return c; });
    const updateStop = (i, si, f, v) => setEtapas(p => { const c = [...p]; c[i].stops_in_transit[si][f] = v; return c; });

    // Docs
    const openDocModal = (si, dt, spi = null) => { setModalTarget({ stageIndex: si, docType: dt, stopIndex: spi }); setMostrarFechaVencimientoModal(false); setModalAbierto(true); };
    const getDocValue = () => {
        const { stageIndex, docType, stopIndex } = modalTarget;
        if (stageIndex === null) return null;
        return stopIndex !== null ? etapas[stageIndex].stops_in_transit[stopIndex]?.[docType] : etapas[stageIndex].documentos?.[docType];
    };
    const handleGuardarDocumentoEtapa = (data) => {
        const { stageIndex, docType } = modalTarget;
        if (stageIndex === null || !docType) return;
        setEtapas(prev => {
            const up = [...prev];
            up[stageIndex] = { ...up[stageIndex], documentos: { ...up[stageIndex].documentos, [docType]: { ...up[stageIndex].documentos[docType], ...data } } };
            return up;
        });
        setModalAbierto(false); setModalTarget({ stageIndex: null, docType: null });
    };

    // Creaciones de Base de datos
    const handleCreateCompany = async (inputValue, stageIndex) => {
        setIsCreatingCompany(true);
        const fd = new FormData(); fd.append('op', 'CreateCompany'); fd.append('nombre_compania', inputValue);
        try {
            const res = await fetch(`${apiHost}/companies.php`, { method: 'POST', body: fd });
            const result = await res.json();
            if (result.status === 'success') {
                const newOption = { value: result.company.company_id, label: result.company.nombre_compania };
                setCompanyOptions(p => [...p, newOption]); handleEtapaChange(stageIndex, 'company_id', newOption.value);
                Swal.fire('Éxito', 'Compañía creada', 'success');
            }
        } catch (e) { Swal.fire('Error', 'No se pudo crear compañía', 'error'); } finally { setIsCreatingCompany(false); }
    };

    const handleCreateWarehouse = async (inputValue, stageIndex, fieldKey) => {
        setIsCreatingWarehouse(true);
        const fd = new FormData(); fd.append('op', 'CreateWarehouse'); fd.append('nombre_almacen', inputValue);
        try {
            const res = await fetch(`${apiHost}/warehouses.php`, { method: 'POST', body: fd });
            const result = await res.json();
            if (result.status === 'success') {
                const newOption = { value: result.warehouse.warehouse_id, label: result.warehouse.nombre_almacen };
                setWarehouseOptions(p => [...p, newOption]); handleEtapaChange(stageIndex, fieldKey, newOption.value);
                Swal.fire('Éxito', 'Bodega creada', 'success');
            }
        } catch (e) { Swal.fire('Error', 'No se pudo crear bodega', 'error'); } finally { setIsCreatingWarehouse(false); }
    };

    const handleSaveExternalCaja = async (cajaData) => {
        const dataToSend = new FormData(); dataToSend.append('op', 'Alta');
        Object.entries(cajaData).forEach(([k, v]) => dataToSend.append(k, v));
        try {
            const res = await fetch(`${apiHost}/caja_externa.php`, { method: 'POST', body: dataToSend });
            const result = await res.json();
            if (result.status === 'success' && result.caja) {
                Swal.fire('¡Éxito!', 'Caja externa registrada.', 'success');
                setForm('caja_externa_id', result.caja.caja_externa_id); setForm('caja_id', '');
                refetchExternalTrailers(); setIsModalCajaExternaOpen(false);
            }
        } catch (e) { Swal.fire('Error', e.message, 'error'); }
    };

    // Submits y Handlers simples
    const handleTripModeChange = (mode) => { setTripMode(mode); if (mode === 'individual') setForm('driver_id_second', ''); };
    const handleTrailerTypeChange = (type) => { setTrailerType(type); if (type === 'interna') setForm('caja_externa_id', ''); else setForm('caja_id', ''); };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        if (onSaveOverride) { onSaveOverride(); return; }

        for (let i = 0; i < etapas.length; i++) {
            const etapa = etapas[i];
            if (!etapa.company_id || !etapa.destination || !etapa.warehouse_destination_id) {
                return Swal.fire('Incompletos', `Complete campos obligatorios etapa ${i + 1}`, 'warning');
            }
        }
        Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() });
        setLoadingSave(true);

        const fd = new FormData();
        fd.append('op', 'Alta');
        fd.append('trip_number', formData.trip_number);
        fd.append('driver_id', formData.driver_id || null);
        fd.append('driver_id_second', formData.driver_id_second || null);
        fd.append('truck_id', formData.truck_id || null);
        fd.append('caja_id', trailerType === 'interna' ? (formData.caja_id || null) : null);
        fd.append('caja_externa_id', trailerType === 'externa' ? (formData.caja_externa_id || null) : null);
        fd.append('country_code', countryCode);
        fd.append('trip_year', String(tripYear).slice(-2));
        fd.append('is_transnational', isTransnational ? 1 : 0);
        fd.append('transnational_number', isTransnational && isContinuation ? transnationalNumber : '');
        fd.append('movement_number', isTransnational && isContinuation ? movementNumber : (isTransnational ? 1 : ''));
        fd.append('origen_id', origenId || '');

        const etapasJson = etapas.map(etapa => ({
            ...etapa,
            loading_date: etapa.loading_date ? format(etapa.loading_date, 'yyyy-MM-dd') : null,
            delivery_date: etapa.delivery_date ? format(etapa.delivery_date, 'yyyy-MM-dd') : null,
            time_of_delivery: etapa.time_of_delivery || '', 
            date_of_departure: etapa.date_of_departure ? format(etapa.date_of_departure, 'yyyy-MM-dd') : null,
            estatus: 'Up Coming',
            documentos: Object.entries(etapa.documentos).reduce((acc, [k, v]) => { acc[k] = v ? { fileName: v.fileName || '', vencimiento: v.vencimiento || null } : null; return acc; }, {}),
            stops_in_transit: (etapa.stops_in_transit || []).map(s => ({ ...s, bl_firmado_doc: s.bl_firmado_doc ? { fileName: s.bl_firmado_doc.fileName || '' } : null }))
        }));
        fd.append('etapas', JSON.stringify(etapasJson));

        etapas.forEach((etapa, idx) => {
            Object.entries(etapa.documentos).forEach(([docType, docData]) => { if (docData?.file instanceof File) fd.append(`etapa_${idx}_${docType}_file`, docData.file, docData.fileName); });
            (etapa.stops_in_transit || []).forEach((stop, si) => { if (stop.bl_firmado_doc?.file instanceof File) fd.append(`etapa_${idx}_stop_${si}_bl_firmado_file`, stop.bl_firmado_doc.file, stop.bl_firmado_doc.fileName); });
        });

        try {
            const res = await fetch(`${apiHost}/new_tripsv2.php`, { method: 'POST', body: fd });
            const result = await res.json();
            if (res.ok && result.status === 'success') { Swal.fire('¡Éxito!', 'Viaje guardado', 'success'); onSuccess?.(); } 
            else throw new Error(result.message);
        } catch (err) { Swal.fire('Error', err.message, 'error'); } finally { setLoadingSave(false); }
    };

    return (
        <Box pb={10}>
            
            {/* 1. SECCIÓN DE RECURSOS */}
            <TripResources 
                formData={formData} 
                setForm={setForm}
                tripMode={tripMode} 
                handleTripModeChange={handleTripModeChange}
                trailerType={trailerType} 
                handleTrailerTypeChange={handleTrailerTypeChange}
                setIsModalCajaExternaOpen={setIsModalCajaExternaOpen}
                options={{ activeDrivers, activeTrucks, activeTrailers, activeExternalTrailers }}
                loaders={{ drivers: loadingDrivers, trucks: loadingTrucks, trailers: loadingCajas, externalTrailers: loadingCajasExternas }}
                errors={{ drivers: errorDrivers, trucks: errorTrucks, trailers: errorCajas, externalTrailers: errorCajasExternas }}
            />

            {/* 2. SECCIÓN DE ETAPAS */}
            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4, mb: 2 }}>Información del viaje</Typography>
            <Stack spacing={3}>
                {etapas.map((etapa, index) => (
                    <TripStageItem 
                        key={index}
                        etapa={etapa} 
                        index={index} 
                        removeStage={removeStage} 
                        updateStage={updateStage}
                        handleEtapaChange={handleEtapaChange}
                        addStop={addStop} 
                        removeStop={removeStop} 
                        updateStop={updateStop}
                        openDocModal={openDocModal}
                        companyOptions={companyOptions}
                        warehouseOptions={warehouseOptions}
                        handleCreateCompany={handleCreateCompany}
                        handleCreateWarehouse={handleCreateWarehouse}
                        loadingStates={{ companies: loadingCompanies, creatingCompany: isCreatingCompany, warehouses: loadingWarehouses, creatingWarehouse: isCreatingWarehouse }}
                        origenes={origenes}
                    />
                ))}
            </Stack>

            {/* 3. BOTONES DE ACCIÓN */}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                <Button variant="contained" onClick={() => addStage('normalTrip')} startIcon={<AddCircleOutlineIcon />}>Agregar Viaje</Button>
                <Button variant="outlined" color="secondary" onClick={() => addStage('emptyMileage')} startIcon={<AddCircleOutlineIcon />}>Agregar Vacía</Button>
            </Stack>

            {/* 4. FOOTER FLOTANTE */}
            <Paper elevation={10} sx={{ position: 'fixed', bottom: 0, left: '250px', right: 0, p: 2, zIndex: 1000, textAlign: 'right', bgcolor: '#fff' }}>
                <Box sx={{ maxWidth: '1600px', mx: 'auto' }}>
                    <Button variant="contained" size="large" color="success" startIcon={loadingSave ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />} onClick={onSaveOverride ?? handleSubmit} disabled={loadingSave} sx={{ px: 6 }}>
                        {loadingSave ? "Guardando..." : "GUARDAR VIAJE"}
                    </Button>
                </Box>
            </Paper>

            {/* MODALES */}
            {modalAbierto && (
                <ModalArchivo
                    isOpen={modalAbierto}
                    onClose={() => { setModalAbierto(false); setModalTarget({ stageIndex: null, docType: null }); }}
                    onSave={handleGuardarDocumentoEtapa}
                    nombreCampo={modalTarget.docType}
                    valorActual={getDocValue()}
                    mostrarFechaVencimiento={mostrarFechaVencimientoModal} 
                />
            )}

            {IsModalCajaExternaOpen && (
                <ModalCajaExterna isOpen={IsModalCajaExternaOpen} onClose={() => setIsModalCajaExternaOpen(false)} onSave={handleSaveExternalCaja} />
            )}
        </Box>
    );
};

export default TripFormUSA;