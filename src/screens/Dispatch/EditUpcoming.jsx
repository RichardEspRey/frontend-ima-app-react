import React, { useEffect, useState, useCallback } from "react";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Stack,
    Tabs,
    Tab,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Container,
    Grid,
    Divider,
    Alert,
    Button,
    CircularProgress
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LanguageIcon from "@mui/icons-material/Language";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NumbersIcon from "@mui/icons-material/Numbers";

import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { parseISO, format } from "date-fns";

// Componentes Hijos
import TripFormUSA from "../../components/TripFormUSA"; // USA
import TripFormMX from "../../components/TripFormMX"; // México
import BorderCrossingFormNew2 from "../../components/BorderCrossingFormNew2";
import { initialBorderCrossingDocs, NORMAL_TRIP_DOCS_BY_COUNTRY } from "../../utils/tripFormConstants";


const EditUpComing = () => {
    const { tripId } = useParams();
    const navigate = useNavigate();

    // =========================
    // Estados base (los tuyos)
    // =========================
    const apiHost = import.meta.env.VITE_API_HOST;
    const currentYear = new Date().getFullYear();

    const [pais, setPais] = useState("");
    const [anio, setAnio] = useState(currentYear);
    const [tripNumber, setTripNumber] = useState("");

    // Transnacional
    const [viajeTransnacional, setViajeTransnacional] = useState(false);
    const [isContinuation, setIsContinuation] = useState(false);
    const [transnationalTrips, setTransnationalTrips] = useState([]);
    const [selectedTransnational, setSelectedTransnational] = useState("");
    const [movementNumber, setMovementNumber] = useState("");

    // Tabs (0: Cruce, 1: Normal)
    const [activeForm, setActiveForm] = useState(0);

    // Key para reiniciar los formularios hijos al guardar
    const [formKey, setFormKey] = useState(1);

    // =========================
    // ✅ NUEVO: estados para edición (integración)
    // =========================
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [initialTripData, setInitialTripData] = useState(null);

    // OJO: este formData/etapas son los que usa tu handleSaveChanges
    const [formData, setFormData] = useState({
        trip_number: "",
        driver_id: "",
        driver_id_second: "",
        driver_nombre: "",
        driver_second_nombre: "",
        truck_id: "",
        truck_unidad: "",
        caja_id: "",
        caja_no_caja: "",
        caja_externa_id: "",
        caja_externa_no_caja: "",
        return_date: null,
        status: "",
        country_code: ""
    });

    const [etapas, setEtapas] = useState([]);

    const [tripMode, setTripMode] = useState("individual");
    const [trailerType, setTrailerType] = useState("interna");

    // =========================
    // Helpers (los tuyos)
    // =========================
    const tripYear2Digits = anio.toString().slice(-2);
    const oppositeCountry = pais === "MX" ? "US" : pais === "US" ? "MX" : "";

    // ✅ Mantienes tu lógica de tabs: si es MX no hay bordercrossing, te manda al tab 0 (normal)
    useEffect(() => {
        if (pais === "MX") {
            setActiveForm(0);
        }
    }, [pais]);

    const buildBaseDocsFromAdjuntos = (documentos_adjuntos) => {
        const base = {};
        if (Array.isArray(documentos_adjuntos)) {
            documentos_adjuntos.forEach((d) => {
                if (d?.tipo_documento && !base[d.tipo_documento]) {
                    base[d.tipo_documento] = null; // se llenará abajo con metadata
                }
            });
        }
        return base;
    };
    const getDocsByStageAndCountry = (stageType, country) => {
        if (stageType === 'borderCrossing') {
            return { ...initialBorderCrossingDocs };
        }

        if (stageType === 'normalTrip') {
            return { ...(NORMAL_TRIP_DOCS_BY_COUNTRY[country] || {}) };
        }

        return {};
    };

    useEffect(() => {
        const fetchTripDetails = async () => {
            if (!tripId) {
                setError("ID inválido");
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const fd = new FormData();
                fd.append("op", "getById");
                fd.append("trip_id", tripId);

                const res = await fetch(`${apiHost}/new_trips.php`, {
                    method: "POST",
                    body: fd
                });
                const result = await res.json();
                console.log(result);
                if (res.ok && result.status === "success" && result.trip) {
                    setInitialTripData(result);

                    const trip = result.trip;

                    // ✅ Llenar los estados del wrapper (pais/año/tripNumber)
                    setPais(trip.country_code || "");
                    // trip.trip_year viene "26" -> lo convertimos a 2026 (ajústalo si manejas 19xx)
                    const fullYear = trip.trip_year ? 2000 + Number(trip.trip_year) : currentYear;
                    setAnio(fullYear);
                    setTripNumber(trip.trip_number || "");

                    // ✅ transnacional desde backend
                    const isTrans = String(trip.is_transnational) === "1";
                    setViajeTransnacional(isTrans);

                    // Si viene transnational_number es que es continuación
                    const cont = !!trip.transnational_number;
                    setIsContinuation(cont);
                    setSelectedTransnational(trip.transnational_number || "");
                    setMovementNumber(trip.movement_number || "");

                    // ✅ FormData para el update (igual que tu función)
                    setFormData({
                        trip_number: result.trip.trip_number || "",
                        driver_id: trip.driver_id || "",
                        driver_id_second: trip.driver_id_second || "",
                        driver_nombre: trip.driver_nombre || "",
                        driver_second_nombre: trip.driver_second_nombre || "",
                        truck_id: trip.truck_id || "",
                        truck_unidad: trip.truck_unidad || "",
                        caja_id: trip.caja_id || "",
                        caja_no_caja: trip.caja_no_caja || "",
                        caja_externa_id: trip.caja_externa_id || "",
                        caja_externa_no_caja: trip.caja_externa_no_caja || "",
                        return_date: trip.return_date ? parseISO(trip.return_date) : null,
                        status: trip.status || "In Transit",
                        country_code: trip.country_code || ""
                    });

                    setTripMode(trip.driver_id_second ? "team" : "individual");
                    setTrailerType(trip.caja_externa_id ? "externa" : "interna");

                    const processedEtapas = (result.etapas || []).map((etapa) => {
                        const type = etapa.stageType || "normalTrip";

                        let baseDocs = getDocsByStageAndCountry(type, trip.country_code);

                        if (Array.isArray(etapa.documentos_adjuntos)) {
                            etapa.documentos_adjuntos.forEach((doc) => {
                                if (baseDocs.hasOwnProperty(doc.tipo_documento)) {
                                    baseDocs[doc.tipo_documento] = {
                                        fileName:
                                            doc.nombre_archivo?.split(/[\\/]/).pop() ||
                                            "Archivo existente",
                                        vencimiento: doc.fecha_vencimiento || null,
                                        file: null,
                                        hasNewFile: false,
                                        document_id: doc.document_id,
                                        serverPath: doc.path_servidor_real
                                    };
                                }
                            });
                        }

                        const stops = Array.isArray(etapa.stops_in_transit)
                            ? etapa.stops_in_transit.map((stop) => ({
                                ...stop,
                                bl_firmado_doc: stop.bl_firmado_doc
                                    ? {
                                        fileName:
                                            stop.bl_firmado_doc.nombre_archivo
                                                ?.split(/[\\/]/)
                                                .pop() || "Archivo",
                                        vencimiento: stop.bl_firmado_doc.fecha_vencimiento || null,
                                        file: null,
                                        hasNewFile: false,
                                        document_id: stop.bl_firmado_doc.document_id,
                                        serverPath: stop.bl_firmado_doc.path_servidor_real
                                    }
                                    : null
                            }))
                            : [];

                        return {
                            ...etapa,
                            stageType: type,
                            invoice_number: etapa.invoice_number || "",
                            loading_date: etapa.loading_date ? parseISO(etapa.loading_date) : null,
                            delivery_date: etapa.delivery_date ? parseISO(etapa.delivery_date) : null,
                            documentos: baseDocs,
                            stops_in_transit: stops,
                            comments: etapa.comments || "",
                            time_of_delivery: etapa.time_of_delivery || ""
                        };
                    });


                    setEtapas(processedEtapas);
                    console.log(formData.trip_number);
                    // ✅ Si el viaje es MX, por tu regla, debe quedar en tab normal (0)
                    // ✅ Si es US, respetamos si venía borderCrossing en la etapa 1 (si quieres, puedes forzar)
                    if ((trip.country_code || "") === "MX") setActiveForm(0);
                } else {
                    throw new Error(result.message || "Error al cargar viaje");
                }
            } catch (err) {
                setError(err.message);
                Swal.fire("Error", err.message, "error");
            } finally {
                setLoading(false);
            }
        };

        fetchTripDetails();
    }, [tripId, apiHost, currentYear]);

    // =========================
    // 🔒 IMPORTANTE:
    // Este effect NO debe correr en edición,
    // porque pisa el tripNumber real.
    // =========================
    const isEditMode = !!tripId;

    useEffect(() => {
        if (isEditMode) return; // ✅ en editar NO pedir "siguiente trip"
        if (!pais || !anio) return;

        const formDatatrip = new FormData();
        formDatatrip.append("op", "get_next_trip_number");
        formDatatrip.append("country_code", pais);
        formDatatrip.append("trip_year", tripYear2Digits);

        fetch(`${apiHost}/new_tripsv2.php`, {
            method: "POST",
            body: formDatatrip
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "success") setTripNumber(data.next_trip_number);
                else setTripNumber("");
            })
            .catch(() => setTripNumber(""));
    }, [apiHost, pais, anio, tripYear2Digits, isEditMode]);

    // =========================
    // Tu effect de transnacionales (lo dejo)
    // =========================
    useEffect(() => {
        if (!viajeTransnacional || !isContinuation || !oppositeCountry || !anio) return;

        const formDataTrans = new FormData();
        formDataTrans.append("op", "get_transnational_trips");
        formDataTrans.append("country_code", oppositeCountry);
        formDataTrans.append("trip_year", tripYear2Digits);

        fetch(`${apiHost}/new_tripsv2.php`, {
            method: "POST",
            body: formDataTrans
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.status === "success") setTransnationalTrips(data.data || []);
                else setTransnationalTrips([]);
            })
            .catch(() => setTransnationalTrips([]));
    }, [apiHost, viajeTransnacional, isContinuation, oppositeCountry, anio, tripYear2Digits]);

    // =========================
    // Reset al guardar (lo dejo)
    // =========================
    const handleFormSuccess = useCallback(() => {
        setTripNumber("");
        setViajeTransnacional(false);
        setIsContinuation(false);
        setSelectedTransnational("");
        setMovementNumber("");
        setFormKey((prev) => prev + 1);
    }, []);

    // =========================
    // Handlers checks (lo dejo)
    // =========================
    const handleTransnationalChange = (e) => {
        const checked = e.target.checked;
        setViajeTransnacional(checked);

        if (!checked) {
            setIsContinuation(false);
            setSelectedTransnational("");
            setMovementNumber("");
            setTransnationalTrips([]);
        }
    };

    const handleContinuationChange = (e) => {
        const checked = e.target.checked;
        setIsContinuation(checked);

        if (!checked) {
            setSelectedTransnational("");
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveForm(newValue);
    };

    // =========================
    // ✅ INTEGRACIÓN 2: handleSaveChanges (TU FUNCIÓN)
    // =========================
    const handleSaveChanges = async () => {

        /*
        if (!formData.driver_id || !formData.truck_id) {
            return Swal.fire("Error", "Driver y Truck obligatorios", "warning");
        }*/

        const fd = new FormData();
        fd.append("op", "UpdateUpcoming");
        fd.append("trip_id", tripId);

        fd.append("trip_number", formData.trip_number || "");
        fd.append("return_date", formData.return_date ? format(formData.return_date, "yyyy-MM-dd") : "");

        Object.entries(formData).forEach(([k, v]) => {
            if (!["status", "trip_number", "return_date"].includes(k)) fd.append(k, v || "");
        });

        // Construcción del JSON de Etapas
        const etapasJson = etapas.map((etapa) => {
            const docsMeta = Object.entries(etapa.documentos || {})
                .map(([tipo, data]) => ({
                    tipo_documento: tipo,
                    document_id: data?.document_id,
                    fileName: data?.fileName,
                    vencimiento: data?.vencimiento,
                    hasNewFile: data?.hasNewFile
                }))
                .filter((d) => d.fileName);

            const stopsJson = (etapa.stops_in_transit || []).map((stop, i) => ({
                stop_id: String(stop.stop_id).startsWith("new") ? null : stop.stop_id,
                location: stop.location,
                stop_order: i + 1,
                time_of_delivery: stop.time_of_delivery,
                bl_firmado_doc: stop.bl_firmado_doc
                    ? {
                        document_id: stop.bl_firmado_doc.document_id,
                        fileName: stop.bl_firmado_doc.fileName,
                        hasNewFile: stop.bl_firmado_doc.hasNewFile
                    }
                    : null
            }));

            return {
                trip_stage_id: String(etapa.trip_stage_id).startsWith("new") ? null : etapa.trip_stage_id,
                stage_number: etapa.stage_number,
                stageType: etapa.stageType,
                origin: etapa.origin,
                destination: etapa.destination,
                zip_code_origin: etapa.zip_code_origin,
                zip_code_destination: etapa.zip_code_destination,
                loading_date: etapa.loading_date ? format(etapa.loading_date, "yyyy-MM-dd") : null,
                delivery_date: etapa.delivery_date ? format(etapa.delivery_date, "yyyy-MM-dd") : null,
                company_id: etapa.company_id,
                travel_direction: etapa.travel_direction,
                warehouse_origin_id: etapa.warehouse_origin_id,
                warehouse_destination_id: etapa.warehouse_destination_id,
                ci_number: etapa.ci_number,
                rate_tarifa: etapa.rate_tarifa,
                millas_pcmiller: etapa.millas_pcmiller,
                millas_pcmiller_practicas: etapa.millas_pcmiller_practicas,
                comments: etapa.comments,
                time_of_delivery: etapa.time_of_delivery,
                estatus: etapa.estatus,
                documentos: docsMeta,
                stops_in_transit: stopsJson
            };
        });

        fd.append("etapas", JSON.stringify(etapasJson));

        // Adjuntar Archivos
        etapas.forEach((etapa, idx) => {
            Object.entries(etapa.documentos || {}).forEach(([type, data]) => {
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

        const initialIds = initialTripData?.etapas?.map((e) => e.trip_stage_id).filter((id) => id) || [];
        const currentIds = etapas.map((e) => e.trip_stage_id).filter((id) => id);
        const deletedIds = initialIds.filter((id) => !currentIds.includes(id));
        if (deletedIds.length) fd.append("deleted_stage_ids", JSON.stringify(deletedIds));

        try {
            const res = await fetch(`${apiHost}/new_trips.php`, { method: "POST", body: fd });
            const result = await res.json();

            if (result.status === "success") {
                try {
                    const invoicesPayload = etapas.map((e) => ({
                        stage_number: e.stage_number,
                        invoice_number: e.invoice_number
                    }));

                    const fdInv = new FormData();
                    fdInv.append("op", "update_invoices");
                    fdInv.append("trip_id", tripId);
                    fdInv.append("invoices", JSON.stringify(invoicesPayload));

                    await fetch(`${apiHost}/update_invoices.php`, { method: "POST", body: fdInv });
                } catch (invErr) {
                    console.warn("Error guardando invoices:", invErr);
                }

                Swal.fire("Guardado", result.message, "success");
                navigate("/admin-trips");
            } else {
                throw new Error(result.message);
            }
        } catch (e) {
            Swal.fire("Error", e.message, "error");
        }
    };

    // =========================
    // RENDER
    // =========================
    if (loading) {
        return (
            <Container maxWidth="xl" sx={{ py: 6 }}>
                <Paper sx={{ p: 4, borderRadius: 3 }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <CircularProgress />
                        <Typography>Cargando viaje...</Typography>
                    </Stack>
                </Paper>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4, display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
                <Box>
                    <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
                        Editar Viaje (Up Coming)
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Modifica los parámetros y guarda cambios.
                    </Typography>
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                </Box>

                </Box>

            {/* Panel de Configuración */}
            <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocalShippingIcon color="primary" /> Configuración General
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3} alignItems="flex-start">
                    {/* País */}
                    <Grid item xs={12} md={2}>
                        <TextField
                            select
                            label="País Base"
                            value={pais}
                            onChange={(e) => setPais(e.target.value)}
                            fullWidth
                            size="small"
                            InputProps={{
                                startAdornment: <LanguageIcon fontSize="small" sx={{ mr: 1 }} />
                            }}
                        >
                            <MenuItem value="MX">México (MX)</MenuItem>
                            <MenuItem value="US">Estados Unidos (US)</MenuItem>
                        </TextField>
                    </Grid>

                    {/* Año */}
                    <Grid item xs={12} md={2}>
                        <TextField
                            label="Año"
                            type="number"
                            value={anio}
                            onChange={(e) => setAnio(Number(e.target.value))}
                            fullWidth
                            size="small"
                            InputProps={{
                                startAdornment: <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} />
                            }}
                        />
                    </Grid>

                    {/* Trip Number */}
                    <Grid item xs={12} md={3}>
                        <TextField
                            label="Trip Number"
                            value={tripNumber}
                            fullWidth
                            size="small"
                            disabled
                            helperText={
                                pais && tripNumber ? `ID Final: ${pais}${tripYear2Digits}-${tripNumber}` : "Seleccione país y año"
                            }
                            InputProps={{
                                startAdornment: <NumbersIcon fontSize="small" sx={{ mr: 1 }} />
                            }}
                        />
                    </Grid>

                    {/* Transnacional */}
                    <Grid item xs={12} md={5}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                            <Stack spacing={1}>
                                <FormControlLabel
                                    control={<Checkbox checked={viajeTransnacional} onChange={handleTransnationalChange} />}
                                    label="Viaje transnacional"
                                />

                                {viajeTransnacional && (
                                    <Box sx={{ pl: 3 }}>
                                        <FormControlLabel
                                            control={<Checkbox checked={isContinuation} onChange={handleContinuationChange} size="small" />}
                                            label={`Continuación (${oppositeCountry})`}
                                        />

                                        {isContinuation && (
                                            <TextField
                                                select
                                                label={`Vincular con Viaje ${oppositeCountry}`}
                                                value={selectedTransnational}
                                                onChange={(e) => setSelectedTransnational(e.target.value)}
                                                fullWidth
                                                size="small"
                                                margin="dense"
                                            >
                                                <MenuItem value="">-- Seleccione --</MenuItem>
                                                {transnationalTrips.map((t) => (
                                                    <MenuItem
                                                        key={t.transnational_number ?? t.trip_id ?? `${t.trip_number}-${t.trip_year}`}
                                                        value={t.transnational_number ?? t.trip_number}
                                                    >
                                                        {t.trip_number && t.country_code && t.transnational_number
                                                            ? `${t.trip_number}-${t.country_code}-${t.transnational_number}T${t.movement_number}-${t.trip_year}`
                                                            : (t.trip_number ?? "Viaje")}
                                                    </MenuItem>
                                                ))}
                                            </TextField>
                                        )}

                                        <TextField
                                            label="Movimiento"
                                            value={movementNumber}
                                            onChange={(e) => setMovementNumber(e.target.value)}
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                            placeholder="Opcional"
                                        />
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>

            {/* Tabs */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={activeForm} onChange={handleTabChange}>
                    {pais === "US" && <Tab label="Cruce Fronterizo (Transfer)" />}
                    <Tab label="Viaje Normal (Carretera)" />
                </Tabs>
            </Paper>

            {/* Formularios */}
            <Box>
                {!pais && <Alert severity="info">Selecciona un país para comenzar.</Alert>}

                {pais === "US" && activeForm === 0 && (
                    <BorderCrossingFormNew2
                        key={`bc-${formKey}`}
                        tripNumber={tripNumber}
                        countryCode={pais}
                        tripYear={anio}
                        isTransnational={viajeTransnacional}
                        isContinuation={isContinuation}
                        transnationalNumber={selectedTransnational}
                        movementNumber={movementNumber}
                        onSuccess={handleFormSuccess}
                        initialTripData={initialTripData}
                        etapas={etapas}
                        setEtapas={setEtapas}
                        formData={formData}
                        setFormData={setFormData}
                        onSaveOverride={handleSaveChanges}
                    />
                )}

                {pais && ((pais === "US" && activeForm === 1) || (pais === "MX" && activeForm === 0)) && (
                    pais === "MX" ? (
                        <TripFormMX
                            key={`tn-${formKey}`}
                            tripNumber={tripNumber}
                            countryCode={pais}
                            tripYear={anio}
                            isTransnational={viajeTransnacional}
                            isContinuation={isContinuation}
                            transnationalNumber={selectedTransnational}
                            movementNumber={movementNumber}
                            onSuccess={handleFormSuccess}
                            initialTripData={initialTripData}
                            etapas={etapas}
                            setEtapas={setEtapas}
                            formData={formData}
                            setFormData={setFormData}
                            onSaveOverride={handleSaveChanges}
                        />
                    ) : (
                        <TripFormUSA
                            key={`tn-${formKey}`}
                            tripNumber={tripNumber}
                            countryCode={pais}
                            tripYear={anio}
                            isTransnational={viajeTransnacional}
                            isContinuation={isContinuation}
                            transnationalNumber={selectedTransnational}
                            movementNumber={movementNumber}
                            onSuccess={handleFormSuccess}
                            initialTripData={initialTripData}
                            etapas={etapas}
                            setEtapas={setEtapas}
                            formData={formData}
                            setFormData={setFormData}
                            onSaveOverride={handleSaveChanges}
                        />
                    )
                )}
            </Box>
        </Container>
    );
};

export default EditUpComing;
