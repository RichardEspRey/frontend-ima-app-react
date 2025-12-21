import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Box, Typography, CircularProgress, Alert, Button, Container, Stack, Paper } from '@mui/material';
import { format, parseISO } from 'date-fns';

import useFetchActiveDrivers from '../hooks/useFetchActiveDrivers';
import useFetchActiveTrucks from '../hooks/useFetchActiveTrucks';
import useFetchActiveTrailers from '../hooks/useFetchActiveTrailers';
import useFetchActiveExternalTrailers from '../hooks/useFetchActiveExternalTrailers';
import useFetchCompanies from '../hooks/useFetchCompanies';
import useFetchWarehouses from '../hooks/useFetchWarehouses';

import ModalArchivo from '../components/ModalArchivo';
import ModalCajaExterna from '../components/ModalCajaExterna';
import GeneralTripInfo from '../components/trip-form/GeneralTripInfo';
import StageCard from '../components/trip-form/StageCard';
import { initialBorderCrossingDocs, initialNormalTripDocs } from '../utils/tripFormConstants';
import './css/EditTripForm.css'; 

const EditTripForm = () => {
    const apiHost = import.meta.env.VITE_API_HOST;
    const { tripId } = useParams();
    const navigate = useNavigate();

    // --- STATE ---
    const [initialTripData, setInitialTripData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreatingCompany, setIsCreatingCompany] = useState(false);
    const [isCreatingWarehouse, setIsCreatingWarehouse] = useState(false);
    const [tripMode, setTripMode] = useState('individual');
    
    const [formData, setFormData] = useState({
        trip_number: '', driver_id: '', driver_id_second: '', driver_nombre: '', driver_second_nombre: '', truck_id: '', caja_id: '',
        caja_externa_id: '', caja_no_caja: '', caja_externa_no_caja: '', return_date: null, status: ''
    });
    const [etapas, setEtapas] = useState([]);
    const [trailerType, setTrailerType] = useState('interna');

    // Modals
    const [modalAbierto, setModalAbierto] = useState(false);
    const [modalTarget, setModalTarget] = useState({ stageIndex: null, docType: null, stopIndex: null });
    const [mostrarFechaVencimientoModal, setMostrarFechaVencimientoModal] = useState(true);
    const [isModalCajaExternaOpen, setIsModalCajaExternaOpen] = useState(false);

    // --- CUSTOM HOOKS ---
    const { activeDrivers, loading: loadingDrivers } = useFetchActiveDrivers();
    const { activeTrucks, loading: loadingTrucks } = useFetchActiveTrucks();
    const { activeTrailers, loading: loadingCajas } = useFetchActiveTrailers();
    const { activeExternalTrailers, loading: loadingCajasExternas, refetch: refetchExternalTrailers } = useFetchActiveExternalTrailers();
    const { activeCompanies, loading: loadingCompanies, refetchCompanies } = useFetchCompanies();
    const { activeWarehouses, loading: loadingWarehouses, refetchWarehouses } = useFetchWarehouses();

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchTripDetails = async () => {
            if (!tripId) { setError("ID inválido"); setLoading(false); return; }
            setLoading(true); setError(null);
            try {
                const fd = new FormData();
                fd.append('op', 'getById');
                fd.append('trip_id', tripId);
                const res = await fetch(`${apiHost}/new_trips.php`, { method: 'POST', body: fd });
                const result = await res.json();

                if (res.ok && result.status === "success" && result.trip) {
                    setInitialTripData(result);
                    const trip = result.trip;
                    
                    setFormData({
                        trip_number: trip.trip_number || '',
                        driver_id: trip.driver_id || '',
                        driver_id_second: trip.driver_id_second || '',
                        driver_nombre: trip.driver_nombre || '',
                        driver_second_nombre: trip.driver_second_nombre || '',
                        truck_id: trip.truck_id || '',
                        truck_unidad: trip.truck_unidad || '',
                        caja_id: trip.caja_id || '',
                        caja_no_caja: trip.caja_no_caja || '',
                        caja_externa_id: trip.caja_externa_id || '',
                        caja_externa_no_caja: trip.caja_externa_no_caja || '',
                        return_date: trip.return_date ? parseISO(trip.return_date) : null,
                        status: trip.status || 'In Transit',
                    });

                    setTripMode(trip.driver_id_second ? 'team' : 'individual');
                    setTrailerType(trip.caja_externa_id ? 'externa' : 'interna');

                    // Procesar Etapas
                    const processedEtapas = result.etapas.map(etapa => {
                        const type = etapa.stageType || 'normalTrip';
                        let baseDocs = type === 'normalTrip' ? { ...initialNormalTripDocs } : 
                                       type === 'borderCrossing' ? { ...initialBorderCrossingDocs } : {};

                        if (Array.isArray(etapa.documentos_adjuntos)) {
                            etapa.documentos_adjuntos.forEach(doc => {
                                if (baseDocs.hasOwnProperty(doc.tipo_documento)) {
                                    baseDocs[doc.tipo_documento] = {
                                        fileName: doc.nombre_archivo?.split(/[\\/]/).pop() || 'Archivo existente',
                                        vencimiento: doc.fecha_vencimiento || null,
                                        file: null,
                                        document_id: doc.document_id,
                                        serverPath: doc.path_servidor_real
                                    };
                                }
                            });
                        }

                        const stops = Array.isArray(etapa.stops_in_transit) ? etapa.stops_in_transit.map(stop => ({
                            ...stop,
                            bl_firmado_doc: stop.bl_firmado_doc ? {
                                fileName: stop.bl_firmado_doc.nombre_archivo?.split(/[\\/]/).pop() || 'Archivo',
                                vencimiento: stop.bl_firmado_doc.fecha_vencimiento || null,
                                file: null,
                                document_id: stop.bl_firmado_doc.document_id,
                                serverPath: stop.bl_firmado_doc.path_servidor_real
                            } : null
                        })) : [];

                        return {
                            ...etapa,
                            stageType: type,
                            invoice_number: etapa.invoice_number || '', 
                            loading_date: etapa.loading_date ? parseISO(etapa.loading_date) : null,
                            delivery_date: etapa.delivery_date ? parseISO(etapa.delivery_date) : null,
                            documentos: baseDocs,
                            stops_in_transit: stops,
                            comments: etapa.comments || '',
                            time_of_delivery: etapa.time_of_delivery || ''
                        };
                    });
                    setEtapas(processedEtapas);

                } else { throw new Error(result.message || 'Error al cargar viaje'); }
            } catch (err) { setError(err.message); Swal.fire('Error', err.message, 'error'); } 
            finally { setLoading(false); }
        };
        fetchTripDetails();
    }, [tripId, apiHost]);

    // --- HANDLERS ---
    const handleFormChange = (name, value) => setFormData(p => ({ ...p, [name]: value }));
    const handleTripModeChange = (mode) => {
        setTripMode(mode);
        if (mode === 'individual') { handleFormChange('driver_id_second', ''); handleFormChange('driver_second_nombre', ''); }
    };
    const handleTrailerTypeChange = (type) => {
        setTrailerType(type);
        type === 'interna' ? handleFormChange('caja_externa_id', '') : handleFormChange('caja_id', '');
    };

    const handleStageChange = (index, field, value) => {
        setEtapas(prev => {
            const copy = [...prev];
            copy[index] = { ...copy[index], [field]: value };
            if (field === 'ci_number' && copy[index].stageType === 'borderCrossing') {
                copy[index].estatus = value && value.trim() !== '' ? 'In Transit' : 'In Coming';
            }
            return copy;
        });
    };

    const handleStopChange = (stageIdx, stopIdx, field, value) => {
        setEtapas(prev => {
            const copy = [...prev];
            const stops = [...copy[stageIdx].stops_in_transit];
            stops[stopIdx] = { ...stops[stopIdx], [field]: value };
            copy[stageIdx].stops_in_transit = stops;
            return copy;
        });
    };

    // --- CREATORS ---
    const handleCreateEntity = async (inputValue, stageIdx, fieldKey, endpoint, op, refetch) => {
        const setter = fieldKey.includes('company') ? setIsCreatingCompany : setIsCreatingWarehouse;
        setter(true);
        try {
            const fd = new FormData();
            fd.append('op', op);
            fd.append(fieldKey.includes('company') ? 'nombre_compania' : 'nombre_almacen', inputValue);
            const res = await fetch(`${apiHost}/${endpoint}`, { method: 'POST', body: fd });
            const result = await res.json();
            
            if (result.status === "success") {
                const entity = result.company || result.warehouse;
                const id = entity.company_id || entity.warehouse_id;
                const label = entity.nombre_compania || entity.nombre_almacen;
                refetch();
                if (stageIdx === null) handleFormChange(fieldKey, id);
                else handleStageChange(stageIdx, fieldKey, id);
                Swal.fire('Éxito', `Creado: ${label}`, 'success');
                return { value: id, label: label };
            } else { throw new Error(result.message); }
        } catch (e) { Swal.fire('Error', e.message, 'error'); } 
        finally { setter(false); }
    };

    // --- MODAL & DOCS ---
    const abrirModal = (docType, stageIndex, stopIndex = null) => {
        setModalTarget({ stageIndex, docType, stopIndex });
        setModalAbierto(true);
        setMostrarFechaVencimientoModal(!['ima_invoice', 'doda', 'ci', 'entry', 'manifiesto', 'bl', 'orden_retiro', 'bl_firmado', 'bl_firmado_doc'].includes(docType));
    };

    const handleGuardarDocumento = (data) => {
        const { stageIndex, docType, stopIndex } = modalTarget;
        setEtapas(prev => {
            const copy = [...prev];
            const newDoc = {
                fileName: data.fileName, vencimiento: data.vencimiento, file: data.file,
                hasNewFile: !!data.file, serverPath: null
            };

            if (stopIndex !== null) {
                const stops = [...copy[stageIndex].stops_in_transit];
                newDoc.document_id = stops[stopIndex][docType]?.document_id || null;
                stops[stopIndex][docType] = newDoc;
                copy[stageIndex].stops_in_transit = stops;
            } else {
                newDoc.document_id = copy[stageIndex].documentos[docType]?.document_id || null;
                copy[stageIndex].documentos = { ...copy[stageIndex].documentos, [docType]: newDoc };
            }
            return copy;
        });
        setModalAbierto(false);
    };

    const getCurrentDocValueForModal = () => {
        const { stageIndex, docType, stopIndex } = modalTarget;
        if (stageIndex === null || !etapas[stageIndex]) return null;
        return stopIndex !== null 
            ? etapas[stageIndex].stops_in_transit?.[stopIndex]?.[docType] 
            : etapas[stageIndex].documentos[docType];
    };

    // --- STAGE MANAGEMENT ---
    const agregarParadaEnRuta = (idx) => {
        setEtapas(prev => {
            const copy = [...prev];
            const stops = [...(copy[idx].stops_in_transit || [])];
            stops.push({ stop_id: `new-stop-${Date.now()}`, location: '', stop_order: stops.length + 1, bl_firmado_doc: null, time_of_delivery: '' });
            copy[idx].stops_in_transit = stops;
            return copy;
        });
    };

    const eliminarParadaEnRuta = (stageIdx, stopIdx) => {
        Swal.fire({ title: '¿Eliminar Parada?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'No' }).then(r => {
            if(r.isConfirmed) {
                setEtapas(prev => {
                    const copy = [...prev];
                    copy[stageIdx].stops_in_transit = copy[stageIdx].stops_in_transit.filter((_, i) => i !== stopIdx);
                    return copy;
                });
            }
        });
    };

    const agregarNuevaEtapa = (type) => {
        const baseDocs = type === 'normalTrip' ? { ...initialNormalTripDocs } : type === 'borderCrossing' ? { ...initialBorderCrossingDocs } : {};
        const newStage = {
            trip_stage_id: `new-stage-${Date.now()}`, stageType: type,
            invoice_number: '', 
            origin: '', destination: '', estatus: type === 'borderCrossing' ? 'In Coming' : 'In Transit',
            documentos: baseDocs, stops_in_transit: [], comments: '',
            loading_date: null, delivery_date: null
        };
        setEtapas(prev => [...prev, newStage].map((e, i) => ({ ...e, stage_number: i + 1 })));
    };

    const eliminarEtapa = (index) => {
        if(etapas.length <= 1) return Swal.fire('Error', 'Debe haber al menos una etapa', 'warning');
        Swal.fire({ title: '¿Eliminar Etapa?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí', cancelButtonText: 'No' }).then(r => {
            if(r.isConfirmed) setEtapas(prev => prev.filter((_, i) => i !== index).map((e, i) => ({ ...e, stage_number: i + 1 })));
        });
    };

    // --- SAVE LOGIC ---
    const handleSaveChanges = async () => {
        if (!formData.driver_id || !formData.truck_id) return Swal.fire('Error', 'Driver y Truck obligatorios', 'warning');
        
        const fd = new FormData();
        fd.append('op', 'Update');
        fd.append('trip_id', tripId);
        fd.append('trip_number', formData.trip_number || '');
        fd.append('return_date', formData.return_date ? format(formData.return_date, 'yyyy-MM-dd') : '');
        
        Object.entries(formData).forEach(([k, v]) => {
            if (!['status', 'trip_number', 'return_date'].includes(k)) fd.append(k, v || '');
        });

        // Construcción del JSON de Etapas
        const etapasJson = etapas.map(etapa => {
             const docsMeta = Object.entries(etapa.documentos).map(([tipo, data]) => ({
                tipo_documento: tipo,
                document_id: data?.document_id,
                fileName: data?.fileName,
                vencimiento: data?.vencimiento,
                hasNewFile: data?.hasNewFile
            })).filter(d => d.fileName);

            const stopsJson = (etapa.stops_in_transit || []).map((stop, i) => ({
                stop_id: String(stop.stop_id).startsWith('new') ? null : stop.stop_id,
                location: stop.location, stop_order: i + 1, time_of_delivery: stop.time_of_delivery,
                bl_firmado_doc: stop.bl_firmado_doc ? { 
                    document_id: stop.bl_firmado_doc.document_id, 
                    fileName: stop.bl_firmado_doc.fileName, 
                    hasNewFile: stop.bl_firmado_doc.hasNewFile 
                } : null
            }));

            return {
                trip_stage_id: String(etapa.trip_stage_id).startsWith('new') ? null : etapa.trip_stage_id,
                stage_number: etapa.stage_number, stageType: etapa.stageType,
                origin: etapa.origin, destination: etapa.destination,
                zip_code_origin: etapa.zip_code_origin, zip_code_destination: etapa.zip_code_destination,
                loading_date: etapa.loading_date ? format(etapa.loading_date, 'yyyy-MM-dd') : null,
                delivery_date: etapa.delivery_date ? format(etapa.delivery_date, 'yyyy-MM-dd') : null,
                company_id: etapa.company_id, travel_direction: etapa.travel_direction,
                warehouse_origin_id: etapa.warehouse_origin_id, warehouse_destination_id: etapa.warehouse_destination_id,
                ci_number: etapa.ci_number, rate_tarifa: etapa.rate_tarifa,
                millas_pcmiller: etapa.millas_pcmiller, millas_pcmiller_practicas: etapa.millas_pcmiller_practicas,
                comments: etapa.comments, time_of_delivery: etapa.time_of_delivery,
                estatus: etapa.estatus, documentos: docsMeta, stops_in_transit: stopsJson
            };
        });
        fd.append('etapas', JSON.stringify(etapasJson));

        // Adjuntar Archivos
        etapas.forEach((etapa, idx) => {
            Object.entries(etapa.documentos).forEach(([type, data]) => {
                if (data?.hasNewFile) {
                    fd.append(`etapa_${idx}_doc_type_${type}_file`, data.file, data.fileName);
                    if (data.document_id) fd.append(`etapa_${idx}_doc_type_${type}_replace_id`, data.document_id);
                }
            });
            (etapa.stops_in_transit || []).forEach((stop, sIdx) => {
                if (stop.bl_firmado_doc?.hasNewFile) {
                    fd.append(`etapa_${idx}_stop_${sIdx}_bl_firmado_file`, stop.bl_firmado_doc.file, stop.bl_firmado_doc.fileName);
                    if (stop.bl_firmado_doc.document_id) fd.append(`etapa_${idx}_stop_${sIdx}_bl_firmado_replace_id`, stop.bl_firmado_doc.document_id);
                }
            });
        });

        const initialIds = initialTripData?.etapas.map(e => e.trip_stage_id).filter(id => id) || [];
        const currentIds = etapas.map(e => e.trip_stage_id).filter(id => id);
        const deletedIds = initialIds.filter(id => !currentIds.includes(id));
        if (deletedIds.length) fd.append('deleted_stage_ids', JSON.stringify(deletedIds));

        try {
            const res = await fetch(`${apiHost}/new_trips.php`, { method: 'POST', body: fd });
            const result = await res.json();
            
            if (result.status === 'success') {
                
                try {
                    const invoicesPayload = etapas.map(e => ({
                        stage_number: e.stage_number,
                        invoice_number: e.invoice_number
                    }));

                    const fdInv = new FormData();
                    fdInv.append('op', 'update_invoices');
                    fdInv.append('trip_id', tripId);
                    fdInv.append('invoices', JSON.stringify(invoicesPayload));

                    await fetch(`${apiHost}/update_invoices.php`, { method: 'POST', body: fdInv });
                    
                } catch (invErr) {
                    console.warn("Error guardando invoices:", invErr);
                }

                Swal.fire('Guardado', result.message, 'success');
                navigate('/admin-trips');

            } else { throw new Error(result.message); }
        } catch (e) { Swal.fire('Error', e.message, 'error'); }
    };

    const handleSaveExternalCaja = async (cajaData) => {
        const fd = new FormData();
        fd.append('op', 'Alta');
        Object.entries(cajaData).forEach(([k,v]) => fd.append(k,v));
        try {
            const res = await fetch(`${apiHost}/caja_externa.php`, { method: 'POST', body: fd });
            const r = await res.json();
            if(r.status === 'success') {
                handleFormChange('caja_externa_id', r.caja.caja_externa_id);
                handleFormChange('caja_externa_no_caja', r.caja.no_caja);
                handleFormChange('caja_id', '');
                refetchExternalTrailers();
                setIsModalCajaExternaOpen(false);
                Swal.fire('Éxito', 'Caja creada', 'success');
            } else { throw new Error(r.message); }
        } catch(e) { Swal.fire('Error', e.message, 'error'); }
    };

    // --- RENDER HELPERS ---
    const options = {
        drivers: activeDrivers.map(d => ({ value: d.driver_id, label: d.nombre })),
        trucks: activeTrucks.map(t => ({ value: t.truck_id, label: t.unidad })),
        trailers: activeTrailers.map(c => ({ value: c.caja_id, label: c.no_caja })),
        externalTrailers: activeExternalTrailers.map(c => ({ value: c.caja_externa_id, label: c.no_caja })),
        companies: useMemo(() => activeCompanies.map(c => ({ value: c.company_id, label: c.nombre_compania })), [activeCompanies]),
        warehouses: useMemo(() => activeWarehouses.map(w => ({ value: w.warehouse_id, label: w.nombre_almacen })), [activeWarehouses])
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Container maxWidth="xl" sx={{ py: 3, pb: 10 }}>
            <Paper sx={{ p: 2, mb: 3, position: 'sticky', top: 10, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>Editar Viaje #{formData.trip_number || tripId}</Typography>
                    <Typography variant="caption" color="textSecondary">Estado: {formData.status}</Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                    <Button variant="outlined" onClick={() => navigate(-1)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleSaveChanges} disabled={formData.status === 'Completed'}>Guardar</Button>
                </Stack>
            </Paper>

            <GeneralTripInfo 
                formData={formData}
                handleFormChange={handleFormChange}
                tripMode={tripMode}
                handleTripModeChange={handleTripModeChange}
                trailerType={trailerType}
                handleTrailerTypeChange={handleTrailerTypeChange}
                isFormDisabled={formData.status === 'Completed'}
                options={options}
                loadingStates={{ drivers: loadingDrivers, trucks: loadingTrucks, trailers: loadingCajas, externalTrailers: loadingCajasExternas }}
                setIsModalCajaExternaOpen={setIsModalCajaExternaOpen}
            />

            <Typography variant="h6" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>Itinerario (Etapas)</Typography>
            
            {etapas.map((etapa, idx) => (
                <StageCard 
                    key={etapa.trip_stage_id || `new-stage-${idx}`}
                    etapa={etapa}
                    index={idx}
                    handleStageChange={handleStageChange}
                    eliminarEtapa={eliminarEtapa}
                    agregarParadaEnRuta={agregarParadaEnRuta}
                    eliminarParadaEnRuta={eliminarParadaEnRuta}
                    handleStopChange={handleStopChange}
                    abrirModal={abrirModal}
                    isFormDisabled={formData.status === 'Completed'}
                    options={options}
                    creators={{
                        createCompany: (val, idx, field) => handleCreateEntity(val, idx, field, 'companies.php', 'CreateCompany', refetchCompanies),
                        createWarehouse: (val, idx, field) => handleCreateEntity(val, idx, field, 'warehouses.php', 'CreateWarehouse', refetchWarehouses)
                    }}
                    loadingStates={{ companies: loadingCompanies || isCreatingCompany, warehouses: loadingWarehouses || isCreatingWarehouse }}
                    apiHost={apiHost}
                />
            ))}

            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                <Button variant="contained" color="warning" onClick={() => agregarNuevaEtapa('borderCrossing')}>+ Cruce Fronterizo</Button>
                <Button variant="contained" color="primary" onClick={() => agregarNuevaEtapa('normalTrip')}>+ Viaje Normal</Button>
                <Button variant="contained" color="secondary" onClick={() => agregarNuevaEtapa('emptyMileage')}>+ Etapa Vacía</Button>
            </Stack>

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
            {isModalCajaExternaOpen && (
                <ModalCajaExterna
                    isOpen={isModalCajaExternaOpen}
                    onClose={() => setIsModalCajaExternaOpen(false)}
                    onSave={handleSaveExternalCaja}
                />
            )}
        </Container>
    );
};

export default EditTripForm;