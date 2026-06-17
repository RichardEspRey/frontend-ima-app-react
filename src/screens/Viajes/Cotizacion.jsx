import { useState, useRef, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Box, Typography, TextField, Button, Paper, Divider, Stack,
  CircularProgress, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, List, ListItem, ListItemButton, ListItemText,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import FmdGoodIcon from "@mui/icons-material/FmdGood";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PlaceIcon from "@mui/icons-material/Place";
import HistoryIcon from "@mui/icons-material/History";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";

// ── API base ────────────────────────────────────────────────────────────────

const apiHost = import.meta.env.VITE_API_HOST;

// Convierte la fila plana que devuelve el SP al shape que usa el componente
function mapApiQuote(q) {
  return {
    id:       q.id,
    name:     q.nombre,
    savedAt:  q.guardado_en,
    tarifa:   q.tarifa    ?? "",
    millas:   q.millas_total ?? "",
    rate:     q.rate      ?? "",
    origenLoc: {
      input: q.origen_nombre,
      geo:   { lat: parseFloat(q.origen_lat), lon: parseFloat(q.origen_lon) },
    },
    destinoLoc: {
      input: q.destino_nombre,
      geo:   { lat: parseFloat(q.destino_lat), lon: parseFloat(q.destino_lon) },
    },
    origenCamionLoc: q.origen_camion_nombre
      ? { input: q.origen_camion_nombre, geo: { lat: parseFloat(q.origen_camion_lat), lon: parseFloat(q.origen_camion_lon) } }
      : { input: "", geo: null },
    stops: (q.paradas ?? []).map((p) => ({
      input: p.nombre,
      geo:   { lat: parseFloat(p.lat), lon: parseFloat(p.lon) },
    })),
    millasViaje:  q.millas_viaje  !== null ? parseFloat(q.millas_viaje)  : null,
    millasVacias: q.millas_vacias !== null ? parseFloat(q.millas_vacias) : null,
  };
}

async function apiFetchHistorial() {
  const res = await fetch(`${apiHost}/Cotizaciones.php?op=obtener_todas`);
  const json = await res.json();
  if (json.status !== "success") throw new Error(json.message);
  return json.data.map(mapApiQuote);
}

// ── API helpers ────────────────────────────────────────────────────────────────

async function nominatimSearch(query) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`,
    { headers: { "Accept-Language": "es" } }
  );
  return res.json();
}

async function geocode(input) {
  const data = await nominatimSearch(input);
  if (!data.length) throw new Error(`No se encontró: "${input}"`);
  return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
}

async function getRoute(points) {
  const coords = points.map((p) => `${p.lon},${p.lat}`).join(";");
  const res = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
  );
  const data = await res.json();
  if (data.code !== "Ok") throw new Error("No se pudo calcular la ruta");
  return {
    miles: data.routes[0].distance / 1609.344,
    coords: data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]),
  };
}

// ── Map helpers ────────────────────────────────────────────────────────────────

function makeDotIcon(color, size = 14) {
  return L.divIcon({
    className: "",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2.5px solid white;box-shadow:0 1px 5px rgba(0,0,0,.45)"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function FitBounds({ coords }) {
  const map = useMap();
  const prevRef = useRef(null);
  useEffect(() => {
    if (!coords || coords.length === 0) return;
    const key = coords[0]?.toString() + coords[coords.length - 1]?.toString();
    if (key === prevRef.current) return;
    prevRef.current = key;
    map.fitBounds(L.latLngBounds(coords), { padding: [40, 40] });
  }, [coords, map]);
  return null;
}

// ── Location Autocomplete ──────────────────────────────────────────────────────

function LocationAutocomplete({ label, placeholder, value, onChange, startIcon }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const handleType = (text) => {
    onChange({ input: text, geo: null });
    clearTimeout(timerRef.current);
    if (text.trim().length < 3) { setSuggestions([]); setOpen(false); return; }
    timerRef.current = setTimeout(async () => {
      setFetching(true);
      try {
        const data = await nominatimSearch(text);
        const opts = data.map((r) => ({
          label: r.display_name,
          short: [r.address?.city || r.address?.town || r.address?.village || r.address?.county, r.address?.state, r.address?.country].filter(Boolean).join(", "),
          lat: parseFloat(r.lat),
          lon: parseFloat(r.lon),
        }));
        setSuggestions(opts);
        setOpen(opts.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setFetching(false);
      }
    }, 350);
  };

  const handleSelect = useCallback((opt) => {
    onChange({ input: opt.short || opt.label, geo: { lat: opt.lat, lon: opt.lon } });
    setSuggestions([]);
    setOpen(false);
  }, [onChange]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <Box ref={containerRef} sx={{ position: "relative" }}>
      <TextField
        label={label}
        placeholder={placeholder}
        value={value.input}
        onChange={(e) => handleType(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        size="small"
        fullWidth
        slotProps={{
          input: {
            startAdornment: startIcon,
            endAdornment: fetching ? <CircularProgress size={14} /> : null,
          },
        }}
      />

      {open && (
        <Paper
          elevation={6}
          sx={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 1500,
            maxHeight: 230,
            overflowY: "auto",
            borderRadius: 1.5,
          }}
        >
          {suggestions.map((opt, i) => (
            <Box
              key={i}
              onMouseDown={() => handleSelect(opt)}
              sx={{
                px: 2,
                py: 1,
                cursor: "pointer",
                "&:hover": { bgcolor: "action.hover" },
                borderBottom: i < suggestions.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
            >
              <Typography variant="body2" fontWeight={500} noWrap>
                {opt.short || opt.label}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                {opt.label}
              </Typography>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
}

// ── Summary row ────────────────────────────────────────────────────────────────

function SummaryRow({ label, value, bold }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ py: 0.6 }}>
      <Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, mr: 1 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={bold ? 700 : 500}
        sx={{ textAlign: "right", wordBreak: "break-word", maxWidth: "60%" }}
      >
        {value || "—"}
      </Typography>
    </Stack>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

const EMPTY_LOC = { input: "", geo: null };

export default function Cotizacion() {
  const [tarifa, setTarifa] = useState("");
  const [millas, setMillas] = useState("");
  const [rate, setRate] = useState("");

  const [origenLoc, setOrigenLoc] = useState(EMPTY_LOC);
  const [destinoLoc, setDestinoLoc] = useState(EMPTY_LOC);
  const [origenCamionLoc, setOrigenCamionLoc] = useState(EMPTY_LOC);
  const [stops, setStops] = useState([]); // [{input, geo}]

  const [routeCoords, setRouteCoords] = useState(null);
  const [emptyCoords, setEmptyCoords] = useState(null);
  const [geoMarkers, setGeoMarkers] = useState(null);
  const [millasViaje, setMillasViaje] = useState(null);
  const [millasVacias, setMillasVacias] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Historial ──────────────────────────────────────────────────────────
  const [historial, setHistorial] = useState([]);
  const [historialOpen, setHistorialOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [previewQuote, setPreviewQuote] = useState(null);
  const [historialLoading, setHistorialLoading] = useState(false);
  const [historialError, setHistorialError] = useState("");

  const [previewRouteCoords, setPreviewRouteCoords] = useState(null);
  const [previewEmptyCoords, setPreviewEmptyCoords] = useState(null);
  const [previewGeoMarkers, setPreviewGeoMarkers] = useState(null);
  const [previewMapLoading, setPreviewMapLoading] = useState(false);

  useEffect(() => {
    apiFetchHistorial()
      .then(setHistorial)
      .catch(() => {});
  }, []);

  // ── Tarifa / Millas / Rate cross-calc ─────────────────────────────────────
  const handleTarifa = (val) => {
    setTarifa(val);
    if (val !== "" && millas !== "")
      setRate((parseFloat(val) / parseFloat(millas)).toFixed(4));
  };

  const handleMillas = (val) => {
    setMillas(val);
    if (tarifa !== "" && val !== "")
      setRate((parseFloat(tarifa) / parseFloat(val)).toFixed(4));
    else if (rate !== "" && val !== "")
      setTarifa((parseFloat(rate) * parseFloat(val)).toFixed(2));
  };

  const handleRate = (val) => {
    setRate(val);
    if (val !== "" && millas !== "")
      setTarifa((parseFloat(val) * parseFloat(millas)).toFixed(2));
  };

  // ── Stops management ──────────────────────────────────────────────────────
  const addStop = () => setStops((prev) => [...prev, { ...EMPTY_LOC }]);
  const removeStop = (i) => setStops((prev) => prev.filter((_, idx) => idx !== i));
  const updateStop = (i, loc) =>
    setStops((prev) => prev.map((s, idx) => (idx === i ? loc : s)));

  // Resolve geo: use cached if available, else geocode
  const resolveGeo = async (loc) => {
    if (!loc.input.trim()) throw new Error("Hay campos de ubicación vacíos");
    if (loc.geo) return loc.geo;
    return geocode(loc.input);
  };

  // ── Buscar millas ─────────────────────────────────────────────────────────
  const buscar = async () => {
    if (!origenLoc.input || !destinoLoc.input) {
      setError("Ingresa origen y destino para calcular millas.");
      return;
    }
    setLoading(true);
    setError("");
    setRouteCoords(null);
    setEmptyCoords(null);
    setGeoMarkers(null);
    setMillasViaje(null);
    setMillasVacias(null);

    try {
      const filledStops = stops.filter((s) => s.input.trim() !== "");

      const [geoOrigen, geoDestino, ...geoStops] = await Promise.all([
        resolveGeo(origenLoc),
        resolveGeo(destinoLoc),
        ...filledStops.map((s) => resolveGeo(s)),
      ]);

      const mainPoints = [geoOrigen, ...geoStops, geoDestino];
      const mainRoute = await getRoute(mainPoints);
      setRouteCoords(mainRoute.coords);
      setMillasViaje(mainRoute.miles);

      let miVacias = 0;
      let truckGeo = null;
      if (origenCamionLoc.input.trim()) {
        truckGeo = await resolveGeo(origenCamionLoc);
        const emptyRoute = await getRoute([truckGeo, geoOrigen]);
        miVacias = emptyRoute.miles;
        setEmptyCoords(emptyRoute.coords);
        setMillasVacias(miVacias);
      }

      setGeoMarkers({
        origin: geoOrigen,
        stops: geoStops,
        destination: geoDestino,
        truck: truckGeo,
      });

      const total = mainRoute.miles + miVacias;
      setMillas(total.toFixed(0));
      if (tarifa !== "")
        setRate((parseFloat(tarifa) / total).toFixed(4));
      else if (rate !== "")
        setTarifa((parseFloat(rate) * total).toFixed(2));
    } catch (e) {
      setError(e.message || "Error al calcular distancias.");
    } finally {
      setLoading(false);
    }
  };

  // ── Historial: guardar / seleccionar / eliminar ───────────────────────────
  const confirmSave = async () => {
    const name = saveName.trim();
    if (!name) return;

    const paradasJson = JSON.stringify(
      stops
        .filter((s) => s.input.trim() && s.geo)
        .map((s) => ({ nombre: s.input, lat: s.geo.lat, lon: s.geo.lon }))
    );

    const fd = new FormData();
    fd.append("nombre",               name);
    fd.append("origen_nombre",        origenLoc.input);
    fd.append("origen_lat",           origenLoc.geo?.lat  ?? "");
    fd.append("origen_lon",           origenLoc.geo?.lon  ?? "");
    fd.append("destino_nombre",       destinoLoc.input);
    fd.append("destino_lat",          destinoLoc.geo?.lat ?? "");
    fd.append("destino_lon",          destinoLoc.geo?.lon ?? "");
    fd.append("origen_camion_nombre", origenCamionLoc.input           ?? "");
    fd.append("origen_camion_lat",    origenCamionLoc.geo?.lat        ?? "");
    fd.append("origen_camion_lon",    origenCamionLoc.geo?.lon        ?? "");
    fd.append("millas_viaje",         millasViaje   ?? "");
    fd.append("millas_vacias",        millasVacias  ?? "");
    fd.append("millas_total",         millas        ?? "");
    fd.append("tarifa",               tarifa        ?? "");
    fd.append("rate",                 rate          ?? "");
    fd.append("paradas_json",         paradasJson);

    try {
      const res  = await fetch(`${apiHost}/Cotizaciones.php?op=guardar`, { method: "POST", body: fd });
      const json = await res.json();
      if (json.status !== "success") throw new Error(json.message);

      const refreshed = await apiFetchHistorial();
      setHistorial(refreshed);
    } catch (e) {
      console.error("Error al guardar cotización:", e.message);
    } finally {
      setSaveModalOpen(false);
      setSaveName("");
    }
  };

  const selectQuote = async (quote) => {
    setPreviewQuote(quote);
    setHistorialOpen(false);
    setPreviewRouteCoords(null);
    setPreviewEmptyCoords(null);
    setPreviewGeoMarkers(null);
    setPreviewMapLoading(true);

    try {
      const mainPoints = [
        quote.origenLoc.geo,
        ...quote.stops.filter((s) => s.geo).map((s) => s.geo),
        quote.destinoLoc.geo,
      ];
      const mainRoute = await getRoute(mainPoints);
      setPreviewRouteCoords(mainRoute.coords);

      if (quote.origenCamionLoc?.geo) {
        const emptyRoute = await getRoute([quote.origenCamionLoc.geo, quote.origenLoc.geo]);
        setPreviewEmptyCoords(emptyRoute.coords);
      }

      setPreviewGeoMarkers({
        origin:      quote.origenLoc.geo,
        stops:       quote.stops.filter((s) => s.geo).map((s) => s.geo),
        destination: quote.destinoLoc.geo,
        truck:       quote.origenCamionLoc?.geo ?? null,
      });
    } catch (e) {
      console.error("Error al calcular ruta del historial:", e.message);
    } finally {
      setPreviewMapLoading(false);
    }
  };

  const deleteQuote = async (id) => {
    const fd = new FormData();
    fd.append("id", id);

    try {
      const res  = await fetch(`${apiHost}/Cotizaciones.php?op=eliminar`, { method: "POST", body: fd });
      const json = await res.json();
      if (json.status !== "success") throw new Error(json.message);

      setHistorial((prev) => prev.filter((q) => q.id !== id));
      if (previewQuote?.id === id) setPreviewQuote(null);
    } catch (e) {
      console.error("Error al eliminar cotización:", e.message);
    }
  };

  const reloadHistorial = async () => {
    setHistorialLoading(true);
    setHistorialError("");
    try {
      const data = await apiFetchHistorial();
      setHistorial(data);
    } catch {
      setHistorialError("No se pudo cargar el historial.");
    } finally {
      setHistorialLoading(false);
    }
  };

  const fmt$ = (v) =>
    v !== "" ? `$${parseFloat(v).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—";
  const fmtMi = (v) =>
    v != null ? `${parseFloat(v).toLocaleString("en-US", { maximumFractionDigits: 1 })} mi` : "—";

  const allCoords = [...(routeCoords ?? []), ...(emptyCoords ?? [])];

  return (
    <Box sx={{ p: 3, bgcolor: "#f4f6f8", minHeight: "100vh" }}>
      {/* Title */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Cotizador de viajes</Typography>
          <Box sx={{ width: 44, height: 3, bgcolor: "primary.main", mt: 0.75, borderRadius: 1 }} />
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => { setHistorialOpen(true); reloadHistorial(); }}
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 1.5 }}
          >
            Historial
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => setSaveModalOpen(true)}
            disableElevation
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: 1.5 }}
          >
            Guardar
          </Button>
        </Stack>
      </Stack>

      <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start", flexWrap: "wrap" }}>

        {/* ── Panel 1: Form ─────────────────────────────────────────────────── */}
        <Paper
          elevation={0}
          sx={{ flex: "0 0 300px", p: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}
        >
          <Typography variant="subtitle2" fontWeight={700} color="text.secondary"
            sx={{ mb: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Ruta
          </Typography>

          <Stack spacing={2}>
            <LocationAutocomplete
              label="Origen"
              placeholder="Ciudad o código postal"
              value={origenLoc}
              onChange={setOrigenLoc}
              startIcon={<FmdGoodIcon sx={{ mr: 1, color: "success.main", fontSize: 18 }} />}
            />

            {stops.map((stop, i) => (
              <Stack key={i} direction="row" spacing={0.5} alignItems="flex-start">
                <Box sx={{ flex: 1 }}>
                  <LocationAutocomplete
                    label={`Parada ${i + 1}`}
                    placeholder="Ciudad o código postal"
                    value={stop}
                    onChange={(loc) => updateStop(i, loc)}
                    startIcon={<PlaceIcon sx={{ mr: 1, color: "#f59e0b", fontSize: 18 }} />}
                  />
                </Box>
                <IconButton
                  size="small"
                  onClick={() => removeStop(i)}
                  sx={{ color: "error.light", mt: 0.5, flexShrink: 0 }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}

            <Button
              size="small"
              variant="outlined"
              startIcon={<AddLocationAltIcon />}
              onClick={addStop}
              sx={{
                textTransform: "none", alignSelf: "flex-start",
                borderStyle: "dashed", color: "#f59e0b", borderColor: "#f59e0b",
                "&:hover": { borderColor: "#d97706", borderStyle: "dashed" },
              }}
            >
              Agregar Parada
            </Button>

            <LocationAutocomplete
              label="Destino"
              placeholder="Ciudad o código postal"
              value={destinoLoc}
              onChange={setDestinoLoc}
              startIcon={<FmdGoodIcon sx={{ mr: 1, color: "error.main", fontSize: 18 }} />}
            />

            <LocationAutocomplete
              label="Origen Camión"
              placeholder="Ciudad o CP — millas vacías"
              value={origenCamionLoc}
              onChange={setOrigenCamionLoc}
              startIcon={<LocalShippingIcon sx={{ mr: 1, color: "primary.main", fontSize: 18 }} />}
            />

            <Button
              variant="contained"
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}
              onClick={buscar}
              disabled={loading}
              disableElevation
              sx={{ textTransform: "none", fontWeight: 600, borderRadius: 1.5 }}
            >
              {loading ? "Calculando..." : "Buscar Millas"}
            </Button>

            {error && (
              <Typography variant="caption" color="error">{error}</Typography>
            )}
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" fontWeight={700} color="text.secondary"
            sx={{ mb: 2, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Cotización
          </Typography>
          <Stack spacing={2}>
            <TextField label="Tarifa ($)" type="number" value={tarifa}
              onChange={(e) => handleTarifa(e.target.value)} size="small" fullWidth />
            <TextField label="Millas" type="number" value={millas}
              onChange={(e) => handleMillas(e.target.value)} size="small" fullWidth />
            <TextField label="Rate ($/mi)" type="number" value={rate}
              onChange={(e) => handleRate(e.target.value)} size="small" fullWidth />
          </Stack>
        </Paper>

        {/* ── Panel 2: Map ──────────────────────────────────────────────────── */}
        <Paper
          elevation={0}
          sx={{ flex: "1 1 420px", borderRadius: 2, border: "1px solid #e0e0e0" }}
        >
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid #e0e0e0" }}>
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
              Mapa de Ruta
            </Typography>
          </Box>

          {/* Legend */}
          <Stack direction="row" spacing={2.5}
            sx={{ px: 2.5, py: 1, borderBottom: "1px solid #f0f0f0", flexWrap: "wrap" }}>
            {[
              { color: "#4caf50", label: "Origen" },
              { color: "#f59e0b", label: "Paradas" },
              { color: "#f44336", label: "Destino" },
              { color: "#9c27b0", label: "Origen Camión" },
            ].map(({ color, label }) => (
              <Stack key={label} direction="row" alignItems="center" spacing={0.8}>
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color,
                  border: "2px solid white", boxShadow: "0 0 3px rgba(0,0,0,.3)" }} />
                <Typography variant="caption" color="text.secondary">{label}</Typography>
              </Stack>
            ))}
            <Stack direction="row" alignItems="center" spacing={0.8}>
              <Box sx={{ width: 20, height: 3, bgcolor: "#1976d2", borderRadius: 1 }} />
              <Typography variant="caption" color="text.secondary">Ruta</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.8}>
              <Box sx={{ width: 20, height: 3, bgcolor: "#9c27b0", borderRadius: 1 }} />
              <Typography variant="caption" color="text.secondary">Millas vacías</Typography>
            </Stack>
          </Stack>

          <Box sx={{ position: "relative", height: 460,
            borderBottomLeftRadius: 8, borderBottomRightRadius: 8, overflow: "hidden" }}>
            <MapContainer
              center={[29.0, -100.0]}
              zoom={5}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {allCoords.length > 0 && <FitBounds coords={allCoords} />}

              {/* Empty miles — solid purple */}
              {emptyCoords && (
                <Polyline
                  positions={emptyCoords}
                  pathOptions={{ color: "#9c27b0", weight: 4, opacity: 0.9 }}
                />
              )}

              {/* Main route — solid blue */}
              {routeCoords && (
                <Polyline
                  positions={routeCoords}
                  pathOptions={{ color: "#1976d2", weight: 4, opacity: 0.9 }}
                />
              )}

              {geoMarkers?.truck && (
                <Marker position={[geoMarkers.truck.lat, geoMarkers.truck.lon]}
                  icon={makeDotIcon("#9c27b0", 16)}>
                  <Popup>Origen Camión: {origenCamionLoc.input}</Popup>
                </Marker>
              )}
              {geoMarkers?.origin && (
                <Marker position={[geoMarkers.origin.lat, geoMarkers.origin.lon]}
                  icon={makeDotIcon("#4caf50", 16)}>
                  <Popup>Origen: {origenLoc.input}</Popup>
                </Marker>
              )}
              {geoMarkers?.stops?.map((s, i) => (
                <Marker key={i} position={[s.lat, s.lon]} icon={makeDotIcon("#f59e0b", 14)}>
                  <Popup>Parada {i + 1}: {stops.filter((x) => x.input.trim())[i]?.input}</Popup>
                </Marker>
              ))}
              {geoMarkers?.destination && (
                <Marker position={[geoMarkers.destination.lat, geoMarkers.destination.lon]}
                  icon={makeDotIcon("#f44336", 16)}>
                  <Popup>Destino: {destinoLoc.input}</Popup>
                </Marker>
              )}
            </MapContainer>
          </Box>
        </Paper>

        {/* ── Panel 3: Summary ──────────────────────────────────────────────── */}
        <Paper
          elevation={0}
          sx={{ flex: "0 0 250px", p: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}
        >
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2.5 }}>
            <ReceiptLongIcon sx={{ color: "primary.main" }} />
            <Typography variant="subtitle1" fontWeight={700}>Resumen</Typography>
          </Stack>

          <Typography variant="caption" fontWeight={700} color="primary"
            sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
            Ruta
          </Typography>
          <Box sx={{ mt: 1, mb: 2 }}>
            <SummaryRow label="Origen" value={origenLoc.input} />
            <SummaryRow label="Destino" value={destinoLoc.input} />
            {origenCamionLoc.input && (
              <SummaryRow label="Origen Camión" value={origenCamionLoc.input} />
            )}
          </Box>

          {(millasViaje !== null || millasVacias !== null) && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="caption" fontWeight={700} color="primary"
                sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                Distancias
              </Typography>
              <Box sx={{ mt: 1, mb: 2 }}>
                {millasViaje !== null && <SummaryRow label="Millas de Viaje" value={fmtMi(millasViaje)} />}
                {millasVacias !== null && <SummaryRow label="Millas Vacías" value={fmtMi(millasVacias)} />}
                {millasViaje !== null && (
                  <SummaryRow
                    label="Total Millas"
                    value={fmtMi(millasViaje + (millasVacias ?? 0))}
                    bold
                  />
                )}
              </Box>
            </>
          )}

          <Divider sx={{ my: 1.5 }} />
          <Typography variant="caption" fontWeight={700} color="primary"
            sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
            Cotización
          </Typography>
          <Box sx={{ mt: 1 }}>
            <SummaryRow label="Tarifa" value={fmt$(tarifa)} />
            <SummaryRow label="Millas" value={millas ? fmtMi(millas) : "—"} />
            <SummaryRow label="Rate" value={rate ? `$${parseFloat(rate).toFixed(4)}/mi` : "—"} bold />
          </Box>
        </Paper>

      </Box>

      {/* ── Preview de cotización guardada ───────────────────────────────── */}
      {previewQuote && (
        <>
        <Paper
          elevation={0}
          sx={{ mt: 2.5, p: 3, borderRadius: 2, border: "1px solid #e0e0e0" }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ReceiptLongIcon sx={{ color: "primary.main" }} />
                <Typography variant="subtitle1" fontWeight={700}>{previewQuote.name}</Typography>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                Guardada el {new Date(previewQuote.savedAt).toLocaleString("es-MX")}
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => {
              setPreviewQuote(null);
              setPreviewRouteCoords(null);
              setPreviewEmptyCoords(null);
              setPreviewGeoMarkers(null);
            }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            <Box sx={{ flex: "1 1 220px" }}>
              <Typography variant="caption" fontWeight={700} color="primary"
                sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                Ruta
              </Typography>
              <Box sx={{ mt: 1 }}>
                <SummaryRow label="Origen" value={previewQuote.origenLoc?.input} />
                {previewQuote.stops?.filter((s) => s.input?.trim()).map((s, i) => (
                  <SummaryRow key={i} label={`Parada ${i + 1}`} value={s.input} />
                ))}
                <SummaryRow label="Destino" value={previewQuote.destinoLoc?.input} />
                {previewQuote.origenCamionLoc?.input && (
                  <SummaryRow label="Origen Camión" value={previewQuote.origenCamionLoc.input} />
                )}
              </Box>
            </Box>

            <Box sx={{ flex: "1 1 220px" }}>
              <Typography variant="caption" fontWeight={700} color="primary"
                sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                Distancias
              </Typography>
              <Box sx={{ mt: 1 }}>
                <SummaryRow label="Millas de Viaje" value={fmtMi(previewQuote.millasViaje)} />
                <SummaryRow label="Millas Vacías" value={fmtMi(previewQuote.millasVacias)} />
                {previewQuote.millasViaje != null && (
                  <SummaryRow
                    label="Total Millas"
                    value={fmtMi(previewQuote.millasViaje + (previewQuote.millasVacias ?? 0))}
                    bold
                  />
                )}
              </Box>
            </Box>

            <Box sx={{ flex: "1 1 220px" }}>
              <Typography variant="caption" fontWeight={700} color="primary"
                sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                Cotización
              </Typography>
              <Box sx={{ mt: 1 }}>
                <SummaryRow label="Tarifa" value={fmt$(previewQuote.tarifa)} />
                <SummaryRow label="Millas" value={previewQuote.millas ? fmtMi(previewQuote.millas) : "—"} />
                <SummaryRow
                  label="Rate"
                  value={previewQuote.rate ? `$${parseFloat(previewQuote.rate).toFixed(4)}/mi` : "—"}
                  bold
                />
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* ── Mapa de ruta del historial ───────────────────────────────────── */}
        <Paper
          elevation={0}
          sx={{ mt: 2, borderRadius: 2, border: "1px solid #e0e0e0" }}
        >
          <Box sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid #e0e0e0" }}>
            <Typography variant="subtitle2" fontWeight={700} color="text.secondary"
              sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
              Mapa de Ruta — {previewQuote.name}
            </Typography>
          </Box>

          {/* Legend */}
          <Stack direction="row" spacing={2.5}
            sx={{ px: 2.5, py: 1, borderBottom: "1px solid #f0f0f0", flexWrap: "wrap" }}>
            {[
              { color: "#4caf50", label: "Origen" },
              { color: "#f59e0b", label: "Paradas" },
              { color: "#f44336", label: "Destino" },
              { color: "#9c27b0", label: "Origen Camión" },
            ].map(({ color, label }) => (
              <Stack key={label} direction="row" alignItems="center" spacing={0.8}>
                <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: color,
                  border: "2px solid white", boxShadow: "0 0 3px rgba(0,0,0,.3)" }} />
                <Typography variant="caption" color="text.secondary">{label}</Typography>
              </Stack>
            ))}
            <Stack direction="row" alignItems="center" spacing={0.8}>
              <Box sx={{ width: 20, height: 3, bgcolor: "#1976d2", borderRadius: 1 }} />
              <Typography variant="caption" color="text.secondary">Ruta</Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.8}>
              <Box sx={{ width: 20, height: 3, bgcolor: "#9c27b0", borderRadius: 1 }} />
              <Typography variant="caption" color="text.secondary">Millas vacías</Typography>
            </Stack>
          </Stack>

          <Box sx={{ position: "relative", height: 420,
            borderBottomLeftRadius: 8, borderBottomRightRadius: 8, overflow: "hidden" }}>

            {previewMapLoading && (
              <Stack alignItems="center" justifyContent="center"
                sx={{ position: "absolute", inset: 0, zIndex: 1000, bgcolor: "rgba(255,255,255,0.7)" }}>
                <CircularProgress size={32} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  Calculando ruta…
                </Typography>
              </Stack>
            )}

            <MapContainer
              key={previewQuote.id}
              center={[29.0, -100.0]}
              zoom={5}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {(() => {
                const all = [...(previewRouteCoords ?? []), ...(previewEmptyCoords ?? [])];
                return all.length > 0 ? <FitBounds coords={all} /> : null;
              })()}

              {previewEmptyCoords && (
                <Polyline
                  positions={previewEmptyCoords}
                  pathOptions={{ color: "#9c27b0", weight: 4, opacity: 0.9 }}
                />
              )}
              {previewRouteCoords && (
                <Polyline
                  positions={previewRouteCoords}
                  pathOptions={{ color: "#1976d2", weight: 4, opacity: 0.9 }}
                />
              )}

              {previewGeoMarkers?.truck && (
                <Marker position={[previewGeoMarkers.truck.lat, previewGeoMarkers.truck.lon]}
                  icon={makeDotIcon("#9c27b0", 16)}>
                  <Popup>Origen Camión: {previewQuote.origenCamionLoc.input}</Popup>
                </Marker>
              )}
              {previewGeoMarkers?.origin && (
                <Marker position={[previewGeoMarkers.origin.lat, previewGeoMarkers.origin.lon]}
                  icon={makeDotIcon("#4caf50", 16)}>
                  <Popup>Origen: {previewQuote.origenLoc.input}</Popup>
                </Marker>
              )}
              {previewGeoMarkers?.stops?.map((s, i) => (
                <Marker key={i} position={[s.lat, s.lon]} icon={makeDotIcon("#f59e0b", 14)}>
                  <Popup>Parada {i + 1}: {previewQuote.stops[i]?.input}</Popup>
                </Marker>
              ))}
              {previewGeoMarkers?.destination && (
                <Marker position={[previewGeoMarkers.destination.lat, previewGeoMarkers.destination.lon]}
                  icon={makeDotIcon("#f44336", 16)}>
                  <Popup>Destino: {previewQuote.destinoLoc.input}</Popup>
                </Marker>
              )}
            </MapContainer>
          </Box>
        </Paper>
        </>
      )}

      {/* ── Modal: Guardar cotización ────────────────────────────────────── */}
      <Dialog open={saveModalOpen} onClose={() => setSaveModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Guardar cotización</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre de la cotización"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            fullWidth
            autoFocus
            size="small"
            sx={{ mt: 1 }}
            onKeyDown={(e) => { if (e.key === "Enter") confirmSave(); }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveModalOpen(false)} sx={{ textTransform: "none" }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            disableElevation
            onClick={confirmSave}
            disabled={!saveName.trim()}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Modal: Historial de cotizaciones ─────────────────────────────── */}
      <Dialog open={historialOpen} onClose={() => setHistorialOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Historial de cotizaciones</DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {historialLoading ? (
            <Stack alignItems="center" sx={{ p: 3 }}>
              <CircularProgress size={24} />
            </Stack>
          ) : historialError ? (
            <Typography variant="body2" color="error" sx={{ p: 3 }}>{historialError}</Typography>
          ) : historial.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>
              No hay cotizaciones guardadas.
            </Typography>
          ) : (
            <List disablePadding>
              {historial.map((q) => (
                <ListItem
                  key={q.id}
                  disablePadding
                  secondaryAction={
                    <IconButton edge="end" size="small" onClick={() => deleteQuote(q.id)}>
                      <DeleteOutlineIcon fontSize="small" sx={{ color: "error.light" }} />
                    </IconButton>
                  }
                  divider
                >
                  <ListItemButton onClick={() => selectQuote(q)}>
                    <ListItemText
                      primary={q.name}
                      secondary={
                        `${q.origenLoc?.input || "—"} → ${q.destinoLoc?.input || "—"} · ` +
                        new Date(q.savedAt).toLocaleString("es-MX")
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistorialOpen(false)} sx={{ textTransform: "none" }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
