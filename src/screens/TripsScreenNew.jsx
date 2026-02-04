import { useEffect, useState, useCallback } from "react";
import {
    Box,
    Typography,
    Paper,
    TextField,
    Stack,
    Button,
    Tabs,
    Tab,
    MenuItem,
    Checkbox,
    FormControlLabel
} from "@mui/material";

import BorderCrossingFormNew from "../components/BorderCrossingFormNew";
import TripFormNew from "../components/TripFormNew";

const TripScreenNew = () => {
    // =========================
    // Estados base
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

    // Tabs
    const [activeForm, setActiveForm] = useState(0);
    const [formKey, setFormKey] = useState(1);

    // =========================
    // Helpers
    // =========================
    const tripYear2Digits = anio.toString().slice(-2);

    const oppositeCountry = pais === "MX" ? "US" : pais === "US" ? "MX" : "";

    // =========================
    // Obtener siguiente número de viaje
    // =========================
    useEffect(() => {
        if (!pais || !anio) return;

        const formData = new FormData();
        formData.append("op", "get_next_trip_number");
        formData.append("country_code", pais);
        formData.append("trip_year", tripYear2Digits);

        fetch(`${apiHost}/new_tripsv2.php`, {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setTripNumber(data.next_trip_number);
                }
            })
            .catch(() => setTripNumber(""));
    }, [pais, anio]);

    // =========================
    // Obtener viajes transnacionales (continuación)
    // =========================
    useEffect(() => {
        if (!isContinuation || !oppositeCountry || !anio) return;

        const formData = new FormData();
        formData.append("op", "get_transnational_trips");
        formData.append("country_code", oppositeCountry);
        formData.append("trip_year", tripYear2Digits);

        fetch(`${apiHost}/new_tripsv2.php`, {
            method: "POST",
            body: formData
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === "success") {
                    setTransnationalTrips(data.data || []);
                }
            });
    }, [isContinuation, oppositeCountry, anio]);

    // =========================
    // Reset al guardar
    // =========================
    const handleFormSuccess = useCallback(() => {
        setTripNumber("");
        setViajeTransnacional(false);
        setIsContinuation(false);
        setSelectedTransnational("");
        setMovementNumber("");
        setFormKey(prev => prev + 1);
    }, []);

    // =========================
    // Render
    // =========================
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
                Alta de Viajes / Etapas
            </Typography>

            {/* CABECERA */}
            <Paper elevation={1} sx={{ p: 3, mb: 3, border: "1px solid #ccc" }}>
                <Tabs
                    value={activeForm}
                    onChange={(_, v) => setActiveForm(v)}
                    sx={{ mb: 3 }}
                >
                    <Tab label="Border Crossing" />
                    <Tab label="Trip / Other Stage" />
                </Tabs>

                <Stack spacing={3}>
                    {/* Inputs base */}
                    <Stack direction="row" spacing={2}>
                        <TextField
                            label="País"
                            select
                            size="small"
                            value={pais}
                            onChange={e => setPais(e.target.value)}
                            sx={{ minWidth: 120 }}
                        >
                            <MenuItem value="MX">MX</MenuItem>
                            <MenuItem value="US">US</MenuItem>
                        </TextField>

                        <TextField
                            label="Año"
                            select
                            size="small"
                            value={anio}
                            onChange={e => setAnio(Number(e.target.value))}
                            sx={{ minWidth: 160 }}
                        >
                            <MenuItem value={currentYear}>{currentYear}</MenuItem>
                            <MenuItem value={currentYear - 1}>{currentYear - 1}</MenuItem>
                            <MenuItem value={currentYear + 1}>{currentYear + 1}</MenuItem>
                        </TextField>

                        <TextField
                            label="Número de viaje"
                            value={tripNumber}
                            size="small"
                            disabled
                            sx={{ width: 150 }}
                        />
                    </Stack>

                    {/* Checks */}
                    <Stack direction="row" spacing={4}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={viajeTransnacional}
                                    onChange={e => {
                                        setViajeTransnacional(e.target.checked);
                                        if (!e.target.checked) setIsContinuation(false);
                                    }}
                                />
                            }
                            label="Viaje transnacional"
                        />

                        {viajeTransnacional && (
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={isContinuation}
                                        onChange={e => setIsContinuation(e.target.checked)}
                                    />
                                }
                                label="Continuación"
                            />
                        )}
                    </Stack>

                    {/* Continuación */}
                    {viajeTransnacional && isContinuation && (
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Viaje transnacional"
                                select
                                size="small"
                                value={selectedTransnational}
                                onChange={e => setSelectedTransnational(e.target.value)}
                                sx={{ minWidth: 220 }}
                            >
                                {transnationalTrips.map(t => (
                                    <MenuItem
                                        key={t.transnational_number}
                                        value={t.transnational_number}
                                    >
                                        {`${t.trip_number}-${t.country_code}-${t.transnational_number}T${t.movement_number}-${t.trip_year}`}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Movimiento"
                                size="small"
                                value={movementNumber}
                                onChange={e => setMovementNumber(e.target.value)}
                                sx={{ width: 120 }}
                            />
                        </Stack>
                    )}
                </Stack>
            </Paper>

            {/* FORMULARIOS */}
            <Paper elevation={1} sx={{ p: 3, border: "1px solid #ccc" }}>
                {activeForm === 0 && (
                    <BorderCrossingFormNew
                        key={formKey}
                        tripNumber={tripNumber}
                        onSuccess={handleFormSuccess}

                        countryCode={pais}
                        tripYear={anio}
                        isTransnational={viajeTransnacional}
                        isContinuation={isContinuation}
                        transnationalNumber={selectedTransnational}
                        movementNumber={movementNumber}
                    />

                )}

                {activeForm === 1 && (
                    <TripFormNew
                        key={formKey + 1000}
                        tripNumber={tripNumber}
                        countryCode={pais}
                        tripYear={anio}
                        isTransnational={viajeTransnacional}
                        isContinuation={isContinuation}
                        transnationalNumber={selectedTransnational}
                        movementNumber={movementNumber}
                        onSuccess={handleFormSuccess}
                    />
                )}
            </Paper>
        </Box>
    );
};

export default TripScreenNew;