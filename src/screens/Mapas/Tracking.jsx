import React, { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  Box, Typography, Paper, Stack, Chip,
  Slider, IconButton, Divider, LinearProgress, TextField, InputAdornment, Button, Grid, CircularProgress
} from "@mui/material";

import SpeedIcon from '@mui/icons-material/Speed';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CloseIcon from '@mui/icons-material/Close';

import Swal from 'sweetalert2';
import truckIcon from "../../assets/images/icons/truck.png";

import FuelGauge from "../../components/FuelGauge";
import TankConfigModal from "../../components/TankConfigModal";

const apiHost = import.meta.env.VITE_API_HOST;

const COLORS = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
  "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe"
];

function createColoredIcon(angle, color) {
  return L.divIcon({
    html: `
      <div style="width:40px; height:40px; background:${color}; border-radius:50%; display:flex; align-items:center; justify-content:center; border:3px solid white; box-shadow:0 0 5px rgba(0,0,0,.4);">
        <img src="${truckIcon}" style="transform:rotate(${angle}deg); width:22px; height:22px; margin-top:6px; margin-left:6px;" />
      </div>
    `,
    className: "", iconSize: [40, 40], iconAnchor: [20, 20],
  });
}

function createPinIcon(label, bgColor) {
  return L.divIcon({
    html: `
      <div style="
        width:32px;height:32px;background:${bgColor};border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,.5);
        color:white;font-weight:bold;font-size:15px;
      ">${label}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function FlyToSelected({ unit }) {
  const map = useMap();
  useEffect(() => {
    if (unit && unit.lat && unit.lon) {
      map.flyTo([unit.lat, unit.lon], 15, { duration: 1.5 });
    }
  }, [unit, map]);
  return null;
}

function MapClickHandler({ active, onMapClick }) {
  useMapEvents({
    click(e) {
      if (active) onMapClick(e.latlng);
    },
  });
  return null;
}

export default function Tracking() {
  const [units, setUnits] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [isHudExpanded, setIsHudExpanded] = useState(true);

  const [fuelDirty, setFuelDirty] = useState(false);
  const [tempFuel, setTempFuel] = useState(0);
  const [openConfig, setOpenConfig] = useState(false);

  const [ping1, setPing1] = useState(null);
  const [ping2, setPing2] = useState(null);
  const [ping2Mode, setPing2Mode] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [isTracing, setIsTracing] = useState(false);
  const [ping2SearchQuery, setPing2SearchQuery] = useState("");
  const [ping2SearchResults, setPing2SearchResults] = useState([]);
  const [ping2Searching, setPing2Searching] = useState(false);

  const stateRef = useRef({ selected, fuelDirty });
  const ping2SearchTimeout = useRef(null);
  useEffect(() => { stateRef.current = { selected, fuelDirty }; }, [selected, fuelDirty]);

  const first = useRef(true);

  const fetchData = async () => {
    if (first.current) {
      Swal.fire({
        title: 'Sincronizando Satélite y Telemetría...',
        html: 'Iniciando conexión...',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });
    }

    try {
      const resGps = await fetch("http://imaexpressllc.com/API/Tracking.php");
      const dataGps = await resGps.json();

      const fd = new FormData();
      fd.append('op', 'get_dashboard');
      const resDb = await fetch(`${apiHost}/estatus_unidades.php`, { method: 'POST', body: fd });
      const dataDb = await resDb.json();

      if (dataGps.status === "success") {
        if (first.current) { Swal.close(); first.current = false; }

        const dbUnits = dataDb.data || [];
        const { selected: currentSelected, fuelDirty: currentFuelDirty } = stateRef.current;

        const mergedItems = dataGps.units.map((u, i) => {
          let dbMatch = {};
          const wialonName = String(u.nm).toLowerCase().trim();
          const numerosEnWialon = wialonName.match(/\d+/g) || [];

          for (let db of dbUnits) {
            // Buscamos la columna sin importar si la BD la manda en mayúscula o minúscula
            const unidadReal = db.unidad || db.Unidad || db.UNIDAD; 
            const truckIdReal = db.truck_id || db.Truck_id || db.id_truck;

            if (!unidadReal) continue; // Si de plano no viene la unidad, lo saltamos
            
            const numDB = parseInt(unidadReal, 10);
            if (!isNaN(numDB) && numerosEnWialon.some(numW => parseInt(numW, 10) === numDB)) {
              dbMatch = { ...db, unidad: unidadReal, truck_id: truckIdReal }; 
              break;
            }
            if (wialonName.includes(String(unidadReal).toLowerCase())) {
              dbMatch = { ...db, unidad: unidadReal, truck_id: truckIdReal }; 
              break;
            }
          }

          const locationString = u.address || u.location || u.pos?.a || (u.pos ? `Coordenadas: ${u.pos.y}, ${u.pos.x}` : "Dirección satelital resolviendo...");

          return {
            id: u.id,
            name: u.nm,
            lat: u.pos?.y,
            lon: u.pos?.x,
            speed: u.pos?.s || 0,
            heading: u.pos?.c || 0,
            timestamp: u.pos?.t,
            address: locationString,
            color: COLORS[i % COLORS.length],
            truck_id: dbMatch.truck_id || null,
            unidad: dbMatch.unidad || (numerosEnWialon[0] || 'N/A'),
            placa: dbMatch.Placa_MEX || 'N/A',
            status: dbMatch.status || 'Sin Estado',
            trip_number: dbMatch.trip_number || null,
            current_fuel: Number(dbMatch.current_fuel || 0),
            tank_capacity: Number(dbMatch.tank_capacity || 200),
            avg_mpg: Number(dbMatch.avg_mpg || 0),
            estimated_range: Number(dbMatch.estimated_range || 0),
            current_stage_number: dbMatch.current_stage_number || null,
            current_origin: dbMatch.current_origin || null,
            current_destination: dbMatch.current_destination || null,
            current_stop: dbMatch.current_stop || null
          };
        });

        setUnits(mergedItems);

        if (currentSelected) {
          const updatedSelected = mergedItems.find(x => x.id === currentSelected.id);
          if (updatedSelected) {
            setSelected(updatedSelected);
            if (!currentFuelDirty) setTempFuel(updatedSelected.current_fuel);
          }
        }
      }
    } catch (err) {
      console.error("Error sincronizando flota:", err);
      if (first.current) Swal.close();
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 50000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (ping1?.id) {
      const upd = units.find(x => x.id === ping1.id);
      if (upd) setPing1(upd);
    }
    if (ping2?.id) {
      const upd = units.find(x => x.id === ping2.id);
      if (upd) setPing2(upd);
    }
  }, [units]);

  const handleUpdateFuel = async (truckId, currentFuel, capacity) => {
    try {
      const fd = new FormData();
      fd.append('op', 'update_config');
      fd.append('truck_id', truckId);
      fd.append('current_fuel', currentFuel);
      fd.append('tank_capacity', capacity);

      const res = await fetch(`${apiHost}/estatus_unidades.php`, { method: 'POST', body: fd });
      const json = await res.json();

      if (json.status === 'success') {
        Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, icon: 'success', title: 'Telemetría actualizada' });
        setFuelDirty(false);
        fetchData();
      }
    } catch {
      Swal.fire('Error', 'No se pudo actualizar la configuración.', 'error');
    }
  };

  const handleSliderChange = (e, newValue) => {
    setTempFuel(newValue);
    setFuelDirty(true);
  };

  const saveManualAdjustment = () => {
    if (selected && selected.truck_id) {
      handleUpdateFuel(selected.truck_id, tempFuel, selected.tank_capacity);
    }
  };

  const filteredUnits = useMemo(() => {
    return units.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
  }, [units, search]);

  const selectUnit = (unit) => {
    if (ping2Mode === 'truck') {
      if (unit.id === ping1?.id) return;
      setPing2({ ...unit });
      setPing2Mode(null);
      return;
    }
    setSelected(unit);
    setTempFuel(unit.current_fuel);
    setFuelDirty(false);
    setIsHudExpanded(true);
    setPing1({ ...unit });
    setPing2(null);
    setPing2Mode(null);
    setRouteCoords([]);
    setRouteInfo(null);
  };

  const handleMapClick = (latlng) => {
    setPing2({
      lat: latlng.lat,
      lon: latlng.lng,
      name: `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`,
    });
    setPing2Mode(null);
  };

  const traceRoute = async () => {
    if (!ping1 || !ping2) return;
    setIsTracing(true);
    setRouteCoords([]);
    setRouteInfo(null);
    try {
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${ping1.lon},${ping1.lat};${ping2.lon},${ping2.lat}` +
        `?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.code === "Ok" && data.routes.length > 0) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
        setRouteCoords(coords);
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(1),
          duration: Math.round(route.duration / 60),
        });
      } else {
        Swal.fire({ icon: "warning", title: "Sin ruta", text: "No se encontró ruta entre los puntos.", timer: 3000 });
      }
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo conectar al servicio de rutas.", timer: 3000 });
    } finally {
      setIsTracing(false);
    }
  };

  const clearRoute = () => {
    setPing1(null);
    setPing2(null);
    setPing2Mode(null);
    setRouteCoords([]);
    setRouteInfo(null);
    setPing2SearchQuery("");
    setPing2SearchResults([]);
  };

  const togglePing2Mode = (mode) => {
    setPing2Mode(prev => prev === mode ? null : mode);
    setPing2SearchQuery("");
    setPing2SearchResults([]);
  };

  const handlePing2Search = (query) => {
    setPing2SearchQuery(query);
    if (ping2SearchTimeout.current) clearTimeout(ping2SearchTimeout.current);
    if (!query.trim()) { setPing2SearchResults([]); return; }
    ping2SearchTimeout.current = setTimeout(async () => {
      setPing2Searching(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=es`;
        const res = await fetch(url);
        const data = await res.json();
        setPing2SearchResults(data);
      } catch {
        setPing2SearchResults([]);
      } finally {
        setPing2Searching(false);
      }
    }, 500);
  };

  const selectSearchResult = (result) => {
    const shortName = result.display_name.length > 70
      ? result.display_name.substring(0, 70) + '…'
      : result.display_name;
    setPing2({ lat: parseFloat(result.lat), lon: parseFloat(result.lon), name: shortName });
    setPing2Mode(null);
    setPing2SearchQuery("");
    setPing2SearchResults([]);
  };

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') return '#64748b';
    if (s === 'almost over') return '#3b82f6';
    if (s === 'in transit') return '#10b981';
    if (s === 'up coming') return '#f59e0b';
    return '#0f172a';
  };

  const btnBase = {
    border: "none", borderRadius: "6px", cursor: "pointer",
    padding: "6px 10px", fontSize: "12px", fontWeight: "bold",
  };

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 70px)", width: "100%", overflow: 'hidden', bgcolor: '#f8fafc' }}>

      {/* SIDEBAR */}
      <Box sx={{ width: { xs: 300, lg: 380 }, bgcolor: "#fff", borderRight: "1px solid #e2e8f0", display: 'flex', flexDirection: 'column', zIndex: 2 }}>

        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", bgcolor: '#0f172a', color: 'white' }}>
          <Typography variant="h6" fontWeight={800}>Centro de Comando</Typography>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>Rastreo Satelital & Telemetría Activa</Typography>

          <TextField
            fullWidth size="small" placeholder="Buscar unidad..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1, '& input': { color: 'white' } }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'white' }} fontSize="small" /></InputAdornment> }}
          />
        </Box>

        {/* Panel trazador de ruta */}
        {ping1 && (
          <Box sx={{ p: 1.5, bgcolor: '#f0f4ff', borderBottom: '2px solid #4363d8' }}>
            <Typography variant="subtitle2" fontWeight={700} color="#4363d8" mb={1}>Trazador de ruta</Typography>

            <PingRow number="1" color="#4363d8" name={ping1.name} />

            {ping2 ? (
              <PingRow number="2" color="#e6194b" name={ping2.name} />
            ) : (
              <Box mb={0.5}>
                <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Seleccionar Ping 2:</Typography>
                <Stack direction="row" spacing={0.5}>
                  <button
                    style={{ ...btnBase, flex: 1, background: ping2Mode === 'search' ? "#4363d8" : "#e8eaf6", color: ping2Mode === 'search' ? "white" : "#4363d8", fontSize: "11px", padding: "6px 4px" }}
                    onClick={() => togglePing2Mode('search')}
                  >
                    Búsqueda
                  </button>
                  <button
                    style={{ ...btnBase, flex: 1, background: ping2Mode === 'map' ? "#4363d8" : "#e8eaf6", color: ping2Mode === 'map' ? "white" : "#4363d8", fontSize: "11px", padding: "6px 4px" }}
                    onClick={() => togglePing2Mode('map')}
                  >
                    {ping2Mode === 'map' ? "Clic mapa…" : "En el mapa"}
                  </button>
                  <button
                    style={{ ...btnBase, flex: 1, background: ping2Mode === 'truck' ? "#4363d8" : "#e8eaf6", color: ping2Mode === 'truck' ? "white" : "#4363d8", fontSize: "11px", padding: "6px 4px" }}
                    onClick={() => togglePing2Mode('truck')}
                  >
                    {ping2Mode === 'truck' ? "Eligiendo…" : "2° camión"}
                  </button>
                </Stack>

                {ping2Mode === 'search' && (
                  <Box sx={{ mt: 1, position: 'relative' }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Escribe una dirección..."
                      value={ping2SearchQuery}
                      onChange={(e) => handlePing2Search(e.target.value)}
                      autoFocus
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: 16, color: '#4363d8' }} />
                          </InputAdornment>
                        ),
                        endAdornment: ping2Searching ? (
                          <InputAdornment position="end">
                            <CircularProgress size={14} sx={{ color: '#4363d8' }} />
                          </InputAdornment>
                        ) : null,
                      }}
                      sx={{ bgcolor: 'white', borderRadius: 1 }}
                    />
                    {ping2SearchResults.length > 0 && (
                      <Paper elevation={6} sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20, maxHeight: 200, overflowY: 'auto', mt: 0.5, borderRadius: 1 }}>
                        {ping2SearchResults.map((result, i) => (
                          <Box
                            key={i}
                            onClick={() => selectSearchResult(result)}
                            sx={{
                              px: 1.5, py: 0.75, cursor: 'pointer',
                              borderBottom: '1px solid #f1f5f9',
                              '&:hover': { bgcolor: '#eef5ff' },
                              '&:last-child': { borderBottom: 'none' }
                            }}
                          >
                            <Typography variant="caption" display="block" color="#1e293b" fontWeight={600} sx={{ lineHeight: 1.3, fontSize: '0.68rem' }}>
                              {result.display_name}
                            </Typography>
                          </Box>
                        ))}
                      </Paper>
                    )}
                  </Box>
                )}
              </Box>
            )}

            {ping2 && (
              <button
                onClick={traceRoute}
                disabled={isTracing}
                style={{ ...btnBase, width: "100%", padding: "8px", marginTop: "6px", fontSize: "13px", background: isTracing ? "#aaa" : "#3cb44b", color: "white", cursor: isTracing ? "default" : "pointer" }}
              >
                {isTracing ? "Trazando…" : "Trazar ruta"}
              </button>
            )}

            {routeInfo && (
              <Box sx={{ mt: 1, p: 1.5, bgcolor: 'white', borderRadius: 1, border: '1px solid #c5cae9' }}>
                <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>Resumen de ruta</Typography>
                <Typography variant="caption" display="block">Distancia: <strong>{routeInfo.distance} km</strong></Typography>
                <Typography variant="caption" display="block">Duración estimada: <strong>{routeInfo.duration} min</strong></Typography>
              </Box>
            )}

            <button
              onClick={clearRoute}
              style={{ ...btnBase, width: "100%", marginTop: "8px", background: "transparent", color: "#999", border: "1px solid #ddd", fontWeight: "normal" }}
            >
              Limpiar ruta
            </button>
          </Box>
        )}

        {ping2Mode && ping2Mode !== 'search' && (
          <Box sx={{ px: 1.5, py: 1, bgcolor: '#fff8e1', borderBottom: '1px solid #ffe082' }}>
            <Typography variant="caption" color="#7b5e00">
              {ping2Mode === 'map' ? "Haz clic en el mapa para colocar Ping 2" : "Haz clic en otro camión para usarlo como Ping 2"}
            </Typography>
          </Box>
        )}

        <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
          {filteredUnits.map((truck) => {
            const fuelPercent = truck.tank_capacity > 0 ? Math.min(100, (truck.current_fuel / truck.tank_capacity) * 100) : 0;
            const isSelected = selected?.id === truck.id;
            const isPing1 = ping1?.id === truck.id;
            const isPing2 = ping2?.id === truck.id;

            return (
              <Paper
                key={truck.id} elevation={0} onClick={() => selectUnit(truck)}
                sx={{
                  p: 1.5, mb: 1, cursor: "pointer", border: '1px solid',
                  borderColor: isPing1 ? '#4363d8' : isPing2 ? '#e6194b' : isSelected ? '#3b82f6' : '#e2e8f0',
                  bgcolor: isPing1 ? "#eef5ff" : isPing2 ? "#fff0f0" : isSelected ? "#eff6ff" : "white",
                  transition: '0.2s', '&:hover': { borderColor: '#93c5fd' }
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box sx={{ width: 6, height: 40, bgcolor: truck.color, borderRadius: 1 }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2" fontWeight={800} color="#0f172a">{truck.name}</Typography>
                      <Typography variant="caption" fontWeight={700} color={truck.speed > 0 ? '#10b981' : '#64748b'}>
                        {truck.speed > 0 ? `${truck.speed} km/h` : 'Detenido'}
                      </Typography>
                    </Stack>

                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, lineHeight: 1.2 }}>
                      {truck.address}
                    </Typography>

                    {truck.truck_id && (
                      <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocalGasStationIcon sx={{ fontSize: 14, color: fuelPercent < 20 ? '#ef4444' : '#64748b' }} />
                        <LinearProgress
                          variant="determinate" value={fuelPercent}
                          sx={{ flexGrow: 1, height: 6, borderRadius: 3, bgcolor: '#e2e8f0', '& .MuiLinearProgress-bar': { bgcolor: fuelPercent < 20 ? '#ef4444' : '#10b981' } }}
                        />
                      </Box>
                    )}
                  </Box>
                </Stack>
              </Paper>
            );
          })}
        </Box>
      </Box>

      {/* MAPA */}
      <Box sx={{ flex: 1, position: 'relative' }}>

        {ping2Mode === 'map' && (
          <style>{`.leaflet-container { cursor: crosshair !important; }`}</style>
        )}
        {ping2Mode === 'map' && (
          <Box sx={{
            position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
            zIndex: 1000, bgcolor: '#4363d8', color: 'white',
            px: 2.5, py: 1, borderRadius: 10,
            boxShadow: '0 2px 10px rgba(0,0,0,.3)', pointerEvents: 'none'
          }}>
            <Typography variant="caption">Haz clic en el mapa para establecer Ping 2</Typography>
          </Box>
        )}

        <Box sx={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
          <MapContainer
            center={[units[0]?.lat || 25.6866, units[0]?.lon || -100.3161]}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
            zoomControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />

            <MapClickHandler active={ping2Mode === 'map'} onMapClick={handleMapClick} />

            {units.map((u) => (
              <Marker key={u.id} position={[u.lat, u.lon]} icon={createColoredIcon(u.heading, u.color)} eventHandlers={{ click: () => selectUnit(u) }}>
                <Popup>
                  <strong>{u.name}</strong><br />
                  Velocidad: {u.speed} km/h<br />
                  Dirección: {u.address}
                </Popup>
              </Marker>
            ))}

            {ping2 && !ping2.id && (
              <Marker position={[ping2.lat, ping2.lon]} icon={createPinIcon("2", "#e6194b")}>
                <Popup>Ping 2: {ping2.name}</Popup>
              </Marker>
            )}

            {ping1 && (
              <Marker position={[ping1.lat, ping1.lon]} icon={createPinIcon("1", "#4363d8")} zIndexOffset={500} />
            )}

            {routeCoords.length > 0 && (
              <Polyline positions={routeCoords} color="#4363d8" weight={5} opacity={0.8} />
            )}

            {selected && <FlyToSelected unit={selected} />}
          </MapContainer>
        </Box>

        {/* HUD OVERLAY */}
        {selected && (
          isHudExpanded ? (
            <Paper elevation={6} sx={{
              position: 'absolute', top: { xs: 10, md: 20 }, right: { xs: 10, md: 20 }, zIndex: 1000,
              width: { xs: 290, sm: 320, md: 340, lg: 360 },
              borderRadius: 3, overflow: 'hidden',
              animation: 'fade-in 0.2s ease-out',
              '@keyframes fade-in': { '0%': { opacity: 0, transform: 'translateY(-10px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } }
            }}>
              <Box sx={{ bgcolor: selected.color, p: { xs: 1.5, md: 2 }, color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>{selected.name}</Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>Placa: {selected.placa}</Typography>
                </Box>

                <Stack direction="row" spacing={0.5}>
                  {selected.truck_id && (
                    <IconButton size="small" onClick={() => setOpenConfig(true)} sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.2)', '&:hover': { bgcolor: 'rgba(0,0,0,0.4)' } }}>
                      <SettingsIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton size="small" onClick={() => setIsHudExpanded(false)} sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.2)', '&:hover': { bgcolor: 'rgba(0,0,0,0.4)' } }}>
                    <KeyboardArrowDownIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => setSelected(null)} sx={{ color: 'white', bgcolor: 'rgba(0,0,0,0.2)', '&:hover': { bgcolor: 'rgba(0,0,0,0.4)' } }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Box>

              <Box sx={{ p: { xs: 1.5, md: 2 } }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, p: 1, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                  <Typography variant="caption" fontWeight={700} color="#475569">
                    {selected.trip_number ? `Viaje: #${selected.trip_number}` : 'Unidad Libre'}
                  </Typography>
                  {selected.trip_number && (
                    <Chip label={selected.status} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, color: 'white', bgcolor: getStatusColor(selected.status) }} />
                  )}
                </Stack>

                {selected.current_stage_number && (
                  <Box sx={{ mb: 2, p: 1.5, bgcolor: '#eff6ff', borderRadius: 2, border: '1px solid #bfdbfe' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                       <Typography variant="caption" fontWeight={800} color="#1d4ed8">
                          Etapa {selected.current_stage_number}
                       </Typography>
                       {selected.current_stop && (
                          <Chip label={`Parada: ${selected.current_stop}`} size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#f59e0b', color: 'white', fontWeight: 'bold' }} />
                       )}
                    </Stack>
                    <Typography variant="caption" display="block" color="#334155" fontWeight={600}>
                       {selected.current_origin} ➔ {selected.current_destination}
                    </Typography>
                  </Box>
                )}

                <Stack spacing={1.5} sx={{ mb: 2 }}>
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <LocationOnIcon sx={{ color: '#ef4444', fontSize: 20, mt: 0.2 }} />
                    <Typography variant="body2" color="#334155" fontWeight={600} lineHeight={1.3} sx={{ wordBreak: 'break-word' }}>
                      {selected.address}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <SpeedIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                    <Typography variant="body2" color="#334155" fontWeight={700}>{selected.speed} km/h</Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <AccessTimeIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                    <Typography variant="caption" color="#64748b">
                      Últ. act: {selected.timestamp ? new Date(selected.timestamp * 1000).toLocaleTimeString() : '---'}
                    </Typography>
                  </Stack>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                {selected.truck_id ? (
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} color="#0f172a" mb={1} textAlign="center">
                      Niveles y Autonomía
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1, transform: { xs: 'scale(0.85)', md: 'scale(1)' }, transformOrigin: 'top center' }}>
                      <FuelGauge
                        percent={selected.tank_capacity > 0 ? (tempFuel / selected.tank_capacity) * 100 : 0}
                        value={tempFuel}
                        capacity={selected.tank_capacity}
                      />
                    </Box>

                    <Box sx={{ mb: 1, px: 2 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">Calibración Manual (Galones)</Typography>
                        {fuelDirty && (
                          <Button size="small" variant="contained" onClick={saveManualAdjustment} sx={{ minWidth: 50, py: 0, fontSize: '0.6rem', height: 20, bgcolor: '#0f172a' }}>
                            Guardar
                          </Button>
                        )}
                      </Stack>
                      <Slider
                        value={tempFuel} min={0} max={selected.tank_capacity || 200} onChange={handleSliderChange}
                        size="small" sx={{ color: (tempFuel / selected.tank_capacity) < 0.2 ? '#ef4444' : '#3b82f6' }}
                      />
                    </Box>

                    <Grid container spacing={1} sx={{ pt: 1, borderTop: '1px dashed #e2e8f0' }}>
                      <Grid item xs={6} sx={{ textAlign: 'center', borderRight: '1px solid #e2e8f0' }}>
                        <Typography variant="caption" color="#64748b" display="block" fontWeight={600}>Rendimiento</Typography>
                        <Typography variant="h6" fontWeight={800} color="#3b82f6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                          {selected.avg_mpg > 0 ? Number(selected.avg_mpg).toFixed(2) : '--'} <span style={{ fontSize: '0.5em' }}>MPG</span>
                        </Typography>
                      </Grid>
                      <Grid item xs={6} sx={{ textAlign: 'center' }}>
                        <Typography variant="caption" color="#64748b" display="block" fontWeight={600}>Alcance</Typography>
                        <Typography variant="h6" fontWeight={800} color="#10b981" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                          {selected.estimated_range > 0 ? Number(selected.estimated_range).toFixed(0) : '--'} <span style={{ fontSize: '0.5em' }}>mi</span>
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Box sx={{ p: 1.5, textAlign: 'center', bgcolor: '#f1f5f9', borderRadius: 2 }}>
                    <Typography variant="caption" color="#64748b" fontWeight={600}>
                      Telemetría no disponible. Unidad no registrada internamente.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          ) : (
            <Paper
              elevation={6}
              onClick={() => setIsHudExpanded(true)}
              sx={{
                position: 'absolute', top: { xs: 10, md: 20 }, right: { xs: 10, md: 20 }, zIndex: 1000,
                bgcolor: selected.color, color: 'white', px: 2, py: 1, borderRadius: 5,
                display: 'flex', alignItems: 'center', cursor: 'pointer',
                boxShadow: '0 4px 10px rgba(0,0,0,0.3)', transition: '0.2s',
                '&:hover': { transform: 'scale(1.05)', opacity: 0.9 }
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} sx={{ mr: 1, fontSize: '0.9rem' }}>
                {selected.name}
              </Typography>
              <KeyboardArrowUpIcon fontSize="small" />
            </Paper>
          )
        )}
      </Box>

      {selected && openConfig && (
        <TankConfigModal
          open={openConfig}
          onClose={() => setOpenConfig(false)}
          onSave={(truckId, currentFuel, newCap) => handleUpdateFuel(truckId, currentFuel, newCap)}
          truck={selected}
        />
      )}
    </Box>
  );
}

function PingRow({ number, color, name }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
      <Box sx={{
        width: 22, height: 22, borderRadius: '50%', bgcolor: color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontSize: 12, fontWeight: 'bold', flexShrink: 0,
      }}>
        {number}
      </Box>
      <Typography variant="caption" color="#333">{name}</Typography>
    </Stack>
  );
}
