import React, { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { 
  Box, Typography, Paper, Stack, Chip, CircularProgress, 
  Slider, IconButton, Divider, LinearProgress, TextField, InputAdornment, Button, Grid
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

// Componentes modulares
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
      <div style="width:40px; height:40px; background:${color}; border-radius:50%; display:flex; alignItems:center; justify-content:center; border:3px solid white; box-shadow:0 0 5px rgba(0,0,0,.4);">
        <img src="${truckIcon}" style="transform:rotate(${angle}deg); width:22px; height:22px; margin-top:6px; margin-left:6px;" />
      </div>
    `,
    className: "", iconSize: [40, 40], iconAnchor: [20, 20],
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

export default function FleetCommandCenter() {
  const [units, setUnits] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [isHudExpanded, setIsHudExpanded] = useState(true);
  
  // Estados para Telemetría y Configuración
  const [fuelDirty, setFuelDirty] = useState(false);
  const [tempFuel, setTempFuel] = useState(0);
  const [openConfig, setOpenConfig] = useState(false);

  const stateRef = useRef({ selected, fuelDirty });
  useEffect(() => { stateRef.current = { selected, fuelDirty }; }, [selected, fuelDirty]);

  const first = useRef(true);

  // ==========================================
  // FETCH Y FUSIÓN DE DATOS (Inteligente)
  // ==========================================
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
      // 1. Fetch GPS (Wialon)
      const resGps = await fetch("http://imaexpressllc.com/API/Tracking.php");
      const dataGps = await resGps.json();

      // 2. Fetch Telemetría (DB Interna)
      const fd = new FormData();
      fd.append('op', 'get_dashboard');
      const resDb = await fetch(`${apiHost}/estatus_unidades.php`, { method: 'POST', body: fd });
      const dataDb = await resDb.json();

      if (dataGps.status === "success") {
        if (first.current) { Swal.close(); first.current = false; }

        const dbUnits = dataDb.data || [];
        const { selected: currentSelected, fuelDirty: currentFuelDirty } = stateRef.current;

        // 3. Fusión de datos
        const mergedItems = dataGps.units.map((u, i) => {
            let dbMatch = {};
            const wialonName = String(u.nm).toLowerCase().trim();
            const numerosEnWialon = wialonName.match(/\d+/g) || []; 

            for (let db of dbUnits) {
                if (!db.unidad) continue;
                const numDB = parseInt(db.unidad, 10);
                if (!isNaN(numDB) && numerosEnWialon.some(numW => parseInt(numW, 10) === numDB)) {
                    dbMatch = db; break;
                }
                if (wialonName.includes(String(db.unidad).toLowerCase())) {
                    dbMatch = db; break;
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
                estimated_range: Number(dbMatch.estimated_range || 0)
            };
        });

        setUnits(mergedItems);

        // Actualizamos el panel flotante de inmediato sin trabarse
        if (currentSelected) {
            const updatedSelected = mergedItems.find(x => x.id === currentSelected.id);
            if (updatedSelected) {
                setSelected(updatedSelected);
                if (!currentFuelDirty) {
                    setTempFuel(updatedSelected.current_fuel);
                }
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

  // ==========================================
  // HANDLERS
  // ==========================================
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
      } catch (e) {
          Swal.fire('Error', 'No se pudo actualizar la configuración.', 'error');
      }
  };

  const handleSliderChange = (e, newValue) => {
      setTempFuel(newValue);
      setFuelDirty(true);
  };

  const saveManualAdjustment = () => {
      if(selected && selected.truck_id) {
          handleUpdateFuel(selected.truck_id, tempFuel, selected.tank_capacity);
      }
  };

  const filteredUnits = useMemo(() => {
      return units.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));
  }, [units, search]);

  const selectUnit = (unit) => {
      setSelected(unit);
      setTempFuel(unit.current_fuel);
      setFuelDirty(false);
      setIsHudExpanded(true); // 🚨 Siempre que se elija un camión, la tarjeta se expande
  };

  const getStatusColor = (status) => {
      const s = (status || '').toLowerCase();
      if (s === 'completed') return '#64748b';
      if (s === 'almost over') return '#3b82f6';
      if (s === 'in transit') return '#10b981';
      if (s === 'up coming') return '#f59e0b';
      return '#0f172a';
  };

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 70px)", width: "100%", overflow: 'hidden', bgcolor: '#f8fafc' }}>

      {/* ---------------------- SIDEBAR IZQUIERDO (FLOTA) ---------------------- */}
      <Box sx={{ width: { xs: 300, lg: 380 }, bgcolor: "#fff", borderRight: "1px solid #e2e8f0", display: 'flex', flexDirection: 'column', zIndex: 2 }}>
        
        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", bgcolor: '#0f172a', color: 'white' }}>
            <Typography variant="h6" fontWeight={800}>Centro de Comando</Typography>
            <Typography variant="caption" sx={{ opacity: 0.7 }}>Rastreo Satelital & Telemetría Activa</Typography>
            
            <TextField
                fullWidth size="small" placeholder="Buscar unidad..." value={search} onChange={(e) => setSearch(e.target.value)}
                sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 1, '& input': { color: 'white' } }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'white' }} fontSize="small"/></InputAdornment> }}
            />
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
          {filteredUnits.map((truck) => {
            const fuelPercent = truck.tank_capacity > 0 ? Math.min(100, (truck.current_fuel / truck.tank_capacity) * 100) : 0;
            const isSelected = selected?.id === truck.id;

            return (
                <Paper 
                    key={truck.id} elevation={0} onClick={() => selectUnit(truck)}
                    sx={{ 
                        p: 1.5, mb: 1, cursor: "pointer", border: '1px solid', borderColor: isSelected ? '#3b82f6' : '#e2e8f0',
                        bgcolor: isSelected ? "#eff6ff" : "white", transition: '0.2s', '&:hover': { borderColor: '#93c5fd' }
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

      {/* ---------------------- ÁREA PRINCIPAL (MAPA + HUD OVERLAY) ---------------------- */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        
        <Box sx={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
            <MapContainer center={[units[0]?.lat || 25.6866, units[0]?.lon || -100.3161]} zoom={5} style={{ height: "100%", width: "100%" }} zoomControl={false}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
            
            {units.map((u) => (
                <Marker key={u.id} position={[u.lat, u.lon]} icon={createColoredIcon(u.heading, u.color)} eventHandlers={{ click: () => selectUnit(u) }}>
                    <Popup>
                        <strong>{u.name}</strong><br />
                        Velocidad: {u.speed} km/h <br />
                        Dirección: {u.address}
                    </Popup>
                </Marker>
            ))}
            {selected && <FlyToSelected unit={selected} />}
            </MapContainer>
        </Box>

        {/* ========================================================================= */}
        {/* HUD OVERLAY: TARJETA DE ESTADO COMPLETA Y COLAPSABLE                      */}
        {/* ========================================================================= */}
        {selected && (
            isHudExpanded ? (
                /* ESTADO EXPANDIDO (Tarjeta Completa) */
                <Paper elevation={6} sx={{ 
                    position: 'absolute', top: { xs: 10, md: 20 }, right: { xs: 10, md: 20 }, zIndex: 1000, 
                    width: { xs: 290, sm: 320, md: 340, lg: 360 }, // 🚨 Ancho responsivo
                    borderRadius: 3, overflow: 'hidden', 
                    animation: 'fade-in 0.2s ease-out', '@keyframes fade-in': { '0%': { opacity: 0, transform: 'translateY(-10px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } }
                }}>
                    {/* CABECERA */}
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

                    {/* CUERPO DE LA TARJETA */}
                    <Box sx={{ p: { xs: 1.5, md: 2 } }}> 
                        
                        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, p: 1, bgcolor: '#f8fafc', borderRadius: 2, border: '1px dashed #cbd5e1' }}>
                            <Typography variant="caption" fontWeight={700} color="#475569">
                                {selected.trip_number ? `Viaje: #${selected.trip_number}` : 'Unidad Libre'}
                            </Typography>
                            {selected.trip_number && (
                                <Chip label={selected.status} size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, color: 'white', bgcolor: getStatusColor(selected.status) }} />
                            )}
                        </Stack>

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
                                <Typography variant="caption" color="#64748b">Últ. act: {selected.timestamp ? new Date(selected.timestamp * 1000).toLocaleTimeString() : '---'}</Typography>
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
                /* ESTADO MINIMIZADO (Pastilla Flotante) */
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

      {/* MODAL DE CONFIGURACIÓN DEL TANQUE */}
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