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
    Alert
} from "@mui/material";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LanguageIcon from '@mui/icons-material/Language';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NumbersIcon from '@mui/icons-material/Numbers';

// Componentes Hijos
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

    // Tabs (0: Cruce, 1: Normal)
    const [activeForm, setActiveForm] = useState(0);
    
    // Key para reiniciar los formularios hijos al guardar
    const [formKey, setFormKey] = useState(1);

    // =========================
    // Helpers & Effects
    // =========================
    const tripYear2Digits = anio.toString().slice(-2);
    const oppositeCountry = pais === "MX" ? "US" : pais === "US" ? "MX" : "";

    const fetchTransnationalTrips = useCallback(async () => {
        if (!viajeTransnacional || !pais) return;
        try {
            const fd = new FormData();
            fd.append("op", "get_transnational_trips");
            fd.append("current_country", pais); 
            const res = await fetch(`${apiHost}/trips.php`, { method: "POST", body: fd });
            const data = await res.json();
            if (data.status === "success") {
                setTransnationalTrips(data.data || []);
            }
        } catch (error) {
            console.error("Error fetching transnational trips:", error);
        }
    }, [apiHost, pais, viajeTransnacional]);

    useEffect(() => {
        fetchTransnationalTrips();
    }, [fetchTransnationalTrips]);

    // Handlers
    const handleTransnationalChange = (e) => {
        const checked = e.target.checked;
        setViajeTransnacional(checked);
        if (!checked) {
            setIsContinuation(false);
            setSelectedTransnational("");
            setMovementNumber("");
        }
    };

    const handleContinuationChange = (e) => {
        setIsContinuation(e.target.checked);
        if (!e.target.checked) {
            setSelectedTransnational("");
        }
    };

    const handleFormSuccess = () => {
        setFormKey(prev => prev + 1); // Esto resetea los estados de los hijos (limpia el formulario)
        setTripNumber("");
        setMovementNumber("");
        setSelectedTransnational("");
        setIsContinuation(false);
        setViajeTransnacional(false);
    };

    const handleTabChange = (event, newValue) => {
        setActiveForm(newValue);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800} color="primary.main" gutterBottom>
                    Crear Nuevo Viaje
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Configura los parámetros iniciales y selecciona el tipo de operación.
                </Typography>
            </Box>

            {/* Panel de Configuración */}
            <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalShippingIcon color="primary" /> Configuración General
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3} alignItems="flex-start">
                    {/* Fila 1: Datos Base */}
                    <Grid item xs={12} md={2}>
                        <TextField
                            select
                            label="País Base"
                            value={pais}
                            onChange={(e) => setPais(e.target.value)}
                            fullWidth
                            size="small"
                            InputProps={{ startAdornment: <LanguageIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} /> }}
                        >
                            <MenuItem value="MX">México (MX)</MenuItem>
                            <MenuItem value="US">Estados Unidos (US)</MenuItem>
                        </TextField>
                    </Grid>

                    <Grid item xs={12} md={2}>
                        <TextField
                            label="Año"
                            type="number"
                            value={anio}
                            onChange={(e) => setAnio(e.target.value)}
                            fullWidth
                            size="small"
                            InputProps={{ startAdornment: <CalendarTodayIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} /> }}
                        />
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <TextField
                            label="Trip Number"
                            value={tripNumber}
                            onChange={(e) => setTripNumber(e.target.value)}
                            fullWidth
                            size="small"
                            placeholder="Ej. 101"
                            helperText={pais && tripNumber ? `ID Final: ${pais}${tripYear2Digits}-${tripNumber}` : "Ingrese consecutivo"}
                            InputProps={{ startAdornment: <NumbersIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} /> }}
                        />
                    </Grid>

                    {/* Fila 2: Transnacional Checkboxes */}
                    <Grid item xs={12} md={5}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: 2 }}>
                            <Stack spacing={1}>
                                <FormControlLabel
                                    control={<Checkbox checked={viajeTransnacional} onChange={handleTransnationalChange} />}
                                    label={<Typography variant="body2" fontWeight={600}>¿Es Viaje Transnacional?</Typography>}
                                />

                                {viajeTransnacional && (
                                    <Box sx={{ pl: 3, borderLeft: '2px solid #e0e0e0', ml: 1 }}>
                                        <FormControlLabel
                                            control={<Checkbox checked={isContinuation} onChange={handleContinuationChange} size="small" />}
                                            label={<Typography variant="body2">Es continuación ({oppositeCountry})</Typography>}
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
                                                sx={{ bgcolor: 'white' }}
                                            >
                                                <MenuItem value="">-- Seleccione --</MenuItem>
                                                {transnationalTrips.map((t) => (
                                                    <MenuItem key={t.trip_id} value={t.trip_number}>{t.trip_number}</MenuItem>
                                                ))}
                                            </TextField>
                                        )}

                                        <TextField
                                            label="Movement Number"
                                            value={movementNumber}
                                            onChange={(e) => setMovementNumber(e.target.value)}
                                            fullWidth
                                            size="small"
                                            margin="dense"
                                            placeholder="Opcional"
                                            sx={{ bgcolor: 'white' }}
                                        />
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Paper>

            {/* Pestañas de Tipo de Viaje */}
            <Paper elevation={0} sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'transparent', mb: 3 }}>
                <Tabs value={activeForm} onChange={handleTabChange} aria-label="trip form tabs">
                    <Tab label="Cruce Fronterizo (Transfer)" sx={{ fontWeight: 700, textTransform: 'none', fontSize: '1rem' }} />
                    <Tab label="Viaje Normal (Carretera)" sx={{ fontWeight: 700, textTransform: 'none', fontSize: '1rem' }} />
                </Tabs>
            </Paper>

            {/* Renderizado de Formularios */}
            <Box>
                {!pais && <Alert severity="info">Selecciona un país para comenzar.</Alert>}
                
                {pais && activeForm === 0 && (
                    <BorderCrossingFormNew
                        key={`bc-${formKey}`}
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

                {pais && activeForm === 1 && (
                    <TripFormNew
                        key={`tn-${formKey}`}
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
            </Box>
        </Container>
    );
};

export default TripScreenNew;