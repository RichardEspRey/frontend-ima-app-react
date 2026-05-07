import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Paper, TextField, Stack, Tabs, Tab, MenuItem,
  Checkbox, FormControlLabel, Container, Grid, Divider, Alert
} from "@mui/material";

// Iconos
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LanguageIcon from "@mui/icons-material/Language";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NumbersIcon from "@mui/icons-material/Numbers";

// Componentes Hijos
import TripFormUSA from "../../components/TripFormUSA"; 
import TripFormMX from "../../components/TripFormMX"; 
import BorderCrossingFormNew2 from "../../components/BorderCrossingFormNew2";

const CrearViaje = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const currentYear = new Date().getFullYear();

  // Estados base
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
  const [formKey, setFormKey] = useState(1);

  const tripYear2Digits = anio.toString().slice(-2);
  const oppositeCountry = pais === "MX" ? "US" : pais === "US" ? "MX" : "";

  useEffect(() => {
    if (pais === "MX") setActiveForm(0);
  }, [pais]);

  // Obtener siguiente número de viaje
  useEffect(() => {
    if (!pais || !anio) return;
    const formData = new FormData();
    formData.append("op", "get_next_trip_number");
    formData.append("country_code", pais);
    formData.append("trip_year", tripYear2Digits);

    fetch(`${apiHost}/new_tripsv2.php`, { method: "POST", body: formData })
      .then((res) => res.json())
      .then((data) => {
        setTripNumber(data.status === "success" ? data.next_trip_number : "");
      })
      .catch(() => setTripNumber(""));
  }, [apiHost, pais, anio, tripYear2Digits]);

  // Obtener viajes transnacionales
  useEffect(() => {
    if (!viajeTransnacional || !isContinuation || !oppositeCountry || !anio) return;
    const formData = new FormData();
    formData.append("op", "get_transnational_trips");
    formData.append("country_code", oppositeCountry);
    formData.append("trip_year", tripYear2Digits);

    fetch(`${apiHost}/new_tripsv2.php`, { method: "POST", body: formData })
      .then((res) => res.json())
      .then((data) => {
        setTransnationalTrips(data.status === "success" ? data.data || [] : []);
      })
      .catch(() => setTransnationalTrips([]));
  }, [apiHost, viajeTransnacional, isContinuation, oppositeCountry, anio, tripYear2Digits]);

  const handleFormSuccess = useCallback(() => {
    setTripNumber("");
    setViajeTransnacional(false);
    setIsContinuation(false);
    setSelectedTransnational("");
    setMovementNumber("");
    setFormKey((prev) => prev + 1);
  }, []);

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
    if (!checked) setSelectedTransnational("");
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
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
        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LocalShippingIcon color="primary" /> Configuración General
        </Typography>
        <Divider sx={{ mb: 3 }} />

        <Grid container spacing={3} alignItems="flex-start">
          
          <Grid item xs={12} md={3}>
            <TextField select label="País Base" value={pais} onChange={(e) => setPais(e.target.value)} fullWidth size="small" InputProps={{ startAdornment: <LanguageIcon fontSize="small" sx={{ mr: 1 }} /> }}>
              <MenuItem value="MX">México (MX)</MenuItem>
              <MenuItem value="US">Estados Unidos (US)</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField label="Año" type="number" value={anio} onChange={(e) => setAnio(Number(e.target.value))} fullWidth size="small" InputProps={{ startAdornment: <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} /> }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField label="Trip Number" value={tripNumber} fullWidth size="small" disabled helperText={pais && tripNumber ? `ID Final: ${pais}${tripYear2Digits}-${tripNumber}` : "Seleccione país y año"} InputProps={{ startAdornment: <NumbersIcon fontSize="small" sx={{ mr: 1 }} /> }} />
          </Grid>

          {/* ====== TRANSNACIONAL ====== */}
          <Grid item xs={12}>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
              <Stack spacing={1}>
                <FormControlLabel control={<Checkbox checked={viajeTransnacional} onChange={handleTransnationalChange} />} label="Viaje transnacional" />
                {viajeTransnacional && (
                  <Box sx={{ pl: 3 }}>
                    <FormControlLabel control={<Checkbox checked={isContinuation} onChange={handleContinuationChange} size="small" />} label={`Continuación (${oppositeCountry})`} />
                    {isContinuation && (
                      <TextField select label={`Vincular con Viaje ${oppositeCountry}`} value={selectedTransnational} onChange={(e) => setSelectedTransnational(e.target.value)} fullWidth size="small" margin="dense">
                        <MenuItem value="">-- Seleccione --</MenuItem>
                        {transnationalTrips.map((t) => (
                          <MenuItem key={t.transnational_number ?? t.trip_id ?? `${t.trip_number}-${t.trip_year}`} value={t.transnational_number ?? t.trip_number}>
                            {t.trip_number && t.country_code && t.transnational_number ? `${t.trip_number}-${t.country_code}-${t.transnational_number}T${t.movement_number}-${t.trip_year}` : (t.trip_number ?? "Viaje")}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                    <TextField label="Movimiento" value={movementNumber} onChange={(e) => setMovementNumber(e.target.value)} fullWidth size="small" margin="dense" placeholder="Opcional" />
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeForm} onChange={(e, val) => setActiveForm(val)}>
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
            />
          )
        )}
      </Box>
    </Container>
  );
};

export default CrearViaje;