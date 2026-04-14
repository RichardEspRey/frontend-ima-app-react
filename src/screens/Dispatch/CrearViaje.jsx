import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Paper, TextField, Stack, Tabs, Tab, MenuItem,
  Checkbox, FormControlLabel, Container, Grid, Divider, Alert,
  Autocomplete, IconButton, Tooltip, Dialog, DialogTitle,
  DialogContent, DialogActions, Button, CircularProgress
} from "@mui/material";

// Iconos
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import LanguageIcon from "@mui/icons-material/Language";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import NumbersIcon from "@mui/icons-material/Numbers";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import MarkunreadMailboxIcon from "@mui/icons-material/MarkunreadMailbox"; // Icono para el Zip Code

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

  // ====== ESTADOS PARA ORIGEN Y ZIP CODE ======
  const [origenes, setOrigenes] = useState([]);
  const [selectedOrigen, setSelectedOrigen] = useState(null); // Objeto {id, nombre}
  const [zipCodeOrigen, setZipCodeOrigen] = useState(""); // NUEVO ESTADO PARA ZIP CODE
  const [openModalOrigen, setOpenModalOrigen] = useState(false);
  const [nuevoOrigenNombre, setNuevoOrigenNombre] = useState("");
  const [guardandoOrigen, setGuardandoOrigen] = useState(false);

  // Tabs (0: Cruce, 1: Normal)
  const [activeForm, setActiveForm] = useState(0);
  const [formKey, setFormKey] = useState(1);

  const tripYear2Digits = anio.toString().slice(-2);
  const oppositeCountry = pais === "MX" ? "US" : pais === "US" ? "MX" : "";

  useEffect(() => {
    if (pais === "MX") setActiveForm(0);
  }, [pais]);

  // ====== CARGAR ORÍGENES AL INICIAR ======
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

  // ====== GUARDAR NUEVO ORIGEN ======
  const handleGuardarOrigen = async () => {
    if (!nuevoOrigenNombre.trim()) return;
    setGuardandoOrigen(true);
    
    const fd = new FormData();
    fd.append("op", "add_origen");
    fd.append("nombre", nuevoOrigenNombre.trim());

    try {
      const res = await fetch(`${apiHost}/new_tripsv2.php`, { method: "POST", body: fd });
      const data = await res.json();
      
      if (data.status === "success") {
        const nuevoObj = { id: data.id, nombre: nuevoOrigenNombre.trim() };
        setOrigenes((prev) => [...prev, nuevoObj].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        setSelectedOrigen(nuevoObj); // Lo autoselecciona
        setOpenModalOrigen(false);
        setNuevoOrigenNombre("");
      } else {
        alert("Error al guardar origen: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    } finally {
      setGuardandoOrigen(false);
    }
  };

  const handleFormSuccess = useCallback(() => {
    setTripNumber("");
    setViajeTransnacional(false);
    setIsContinuation(false);
    setSelectedTransnational("");
    setMovementNumber("");
    setSelectedOrigen(null); // Limpiar origen
    setZipCodeOrigen("");    // Limpiar zip code
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
          
          {/* ====== FILA 1: PAÍS, AÑO, TRIP NUMBER ====== */}
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

          {/* ====== FILA 2: ORIGEN Y ZIP CODE ====== */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Autocomplete
                fullWidth
                size="small"
                options={origenes}
                getOptionLabel={(option) => option.nombre}
                value={selectedOrigen}
                onChange={(event, newValue) => setSelectedOrigen(newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Origen Inicial" 
                    placeholder="Seleccionar Ciudad o Patio..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <LocationOnIcon color="action" sx={{ ml: 1, mr: 0.5, fontSize: 20 }} />
                          {params.InputProps.startAdornment}
                        </>
                      )
                    }}
                  />
                )}
              />
              <Tooltip title="Agregar nuevo origen al catálogo">
                <IconButton onClick={() => setOpenModalOrigen(true)} color="primary" sx={{ bgcolor: "primary.50", '&:hover': { bgcolor: "primary.100" } }}>
                  <AddCircleIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField 
                label="Zip Code (Origen)" 
                placeholder="Ej: 78045"
                fullWidth 
                size="small" 
                value={zipCodeOrigen}
                onChange={(e) => setZipCodeOrigen(e.target.value)}
                InputProps={{
                    startAdornment: <MarkunreadMailboxIcon color="action" sx={{ mr: 1, fontSize: 20 }} />
                }}
            />
          </Grid>

          {/* ====== FILA 3: TRANSNACIONAL ====== */}
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
            origenId={selectedOrigen?.id || null} 
            zipCodeOrigen={zipCodeOrigen} // <-- NUEVO PROP LISTO PARA USARSE
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
              origenId={selectedOrigen?.id || null} 
              zipCodeOrigen={zipCodeOrigen} // <-- NUEVO PROP LISTO PARA USARSE
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
              origenId={selectedOrigen?.id || null} 
              zipCodeOrigen={zipCodeOrigen} // <-- NUEVO PROP LISTO PARA USARSE
              onSuccess={handleFormSuccess}
            />
          )
        )}
      </Box>

      {/* ====== MODAL PARA AGREGAR ORIGEN ====== */}
      <Dialog open={openModalOrigen} onClose={() => !guardandoOrigen && setOpenModalOrigen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Nuevo Origen</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Agrega una nueva ciudad o patio al catálogo de orígenes.
          </Typography>
          <TextField
            autoFocus
            label="Nombre del Origen"
            placeholder="Ej: Monterrey, N.L."
            fullWidth
            value={nuevoOrigenNombre}
            onChange={(e) => setNuevoOrigenNombre(e.target.value)}
            disabled={guardandoOrigen}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenModalOrigen(false)} color="inherit" disabled={guardandoOrigen}>
            Cancelar
          </Button>
          <Button 
            onClick={handleGuardarOrigen} 
            variant="contained" 
            disabled={guardandoOrigen || !nuevoOrigenNombre.trim()}
            startIcon={guardandoOrigen ? <CircularProgress size={20} /> : null}
          >
            {guardandoOrigen ? "Guardando..." : "Guardar Origen"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CrearViaje;