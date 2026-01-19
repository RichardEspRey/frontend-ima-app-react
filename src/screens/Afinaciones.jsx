import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, CircularProgress, 
  Stack, LinearProgress, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, InputAdornment, Chip, IconButton, Tooltip
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings'; // Icono de engranaje
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom"; 

const apiHost = import.meta.env.VITE_API_HOST;

// Helper para formato de números
const numberFmt = (n) => new Intl.NumberFormat('en-US').format(Number(n).toFixed(0));

export default function Afinaciones() {
  const navigate = useNavigate(); 

  // --- States ---
  const [trucksStatus, setTrucksStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal Reinicio
  const [openModal, setOpenModal] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [oilPercentage, setOilPercentage] = useState('');
  
  // Modal Ajuste Manual (Nuevo)
  const [openManualModal, setOpenManualModal] = useState(false);
  const [manualMiles, setManualMiles] = useState('');

  const [saving, setSaving] = useState(false);

  // --- Fetch Data ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const fdStatus = new FormData();
      fdStatus.append('op', 'get_maintenance_status');
      const resStatus = await fetch(`${apiHost}/afinaciones.php`, { method: 'POST', body: fdStatus });
      const jsonStatus = await resStatus.json();
      
      if (jsonStatus.status === 'success') {
        setTrucksStatus(jsonStatus.data);
      }
    } catch (err) {
      console.error("Error fetching afinaciones:", err);
      Swal.fire('Error', 'Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Handlers Reinicio ---
  const handleOpenReset = (truck) => {
    setSelectedTruck(truck);
    setOilPercentage(''); 
    setOpenModal(true);
  };

  const handleConfirmReset = async () => {
    if (!oilPercentage || isNaN(oilPercentage) || oilPercentage < 0 || oilPercentage > 100) {
        return Swal.fire('Atención', 'Ingresa un porcentaje de aceite válido (0-100)', 'warning');
    }

    setSaving(true);
    try {
        const fd = new FormData();
        fd.append('op', 'reset_counter');
        fd.append('truck_id', selectedTruck.truck_id);
        fd.append('millas_acumuladas', selectedTruck.millas_acumuladas);
        fd.append('porcentaje_aceite', oilPercentage);

        const res = await fetch(`${apiHost}/afinaciones.php`, { method: 'POST', body: fd });
        const json = await res.json();

        if (json.status === 'success') {
            Swal.fire('Reiniciado', 'El contador se ha reiniciado y guardado en historial.', 'success');
            setOpenModal(false);
            fetchData(); 
        } else {
            Swal.fire('Error', json.message, 'error');
        }
    } catch (e) {
        Swal.fire('Error', e.message, 'error');
    } finally {
        setSaving(false);
    }
  };

  // --- Handlers Ajuste Manual (Nuevos) ---
  const handleOpenManual = (truck) => {
      setSelectedTruck(truck);
      // Pre-llenar con el valor actual para que sea fácil editar
      setManualMiles(Math.round(truck.millas_acumuladas));
      setOpenManualModal(true);
  };

  const handleConfirmManualUpdate = async () => {
      if (manualMiles === '' || isNaN(manualMiles) || manualMiles < 0) {
          return Swal.fire('Atención', 'Ingresa un millaje válido', 'warning');
      }

      setSaving(true);
      try {
          const fd = new FormData();
          fd.append('op', 'update_manual_mileage');
          fd.append('truck_id', selectedTruck.truck_id);
          fd.append('nuevo_total', manualMiles);

          const res = await fetch(`${apiHost}/afinaciones.php`, { method: 'POST', body: fd });
          const json = await res.json();

          if (json.status === 'success') {
              Swal.fire('Ajustado', 'Millas actualizadas correctamente.', 'success');
              setOpenManualModal(false);
              fetchData();
          } else {
              Swal.fire('Error', json.message, 'error');
          }
      } catch (e) {
          Swal.fire('Error', e.message, 'error');
      } finally {
          setSaving(false);
      }
  };

  // --- Render Helpers ---
  const getProgressColor = (value) => {
      if (value >= 100) return 'error';
      if (value >= 80) return 'warning';
      return 'success';
  };

  if (loading && trucksStatus.length === 0) {
      return <Box p={5} display="flex" justifyContent="center"><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Stack direction="row" alignItems="center" spacing={2}>
            <BuildCircleIcon fontSize="large" color="primary" />
            <Box>
                <Typography variant="h4" fontWeight={800}>Control de Afinaciones</Typography>
                <Typography variant="body2" color="text.secondary">Monitoreo de cambio de aceite (Límite 15,000 mi)</Typography>
            </Box>
        </Stack>
        
        <Button 
            variant="outlined" 
            startIcon={<HistoryIcon />} 
            onClick={() => navigate('/registros-afinaciones')}
        >
            Ver Historial
        </Button>
      </Stack>

      {/* TABLA DE MONITOREO */}
      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 5 }}>
        <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderBottom: '1px solid #bbdefb' }}>
            <Typography variant="h6" fontWeight={700} color="primary.main">
                Estatus Actual de Flota
            </Typography>
        </Box>
        <TableContainer>
            <Table>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Camión</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: '50%' }}>Millas Acumuladas (Prácticas)</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Reiniciar</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Ajustar</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {trucksStatus.map((truck) => {
                        const millas = Number(truck.millas_acumuladas);
                        const progress = Math.min((millas / 15000) * 100, 100);
                        const isCritical = millas >= 15000;

                        return (
                            <TableRow key={truck.truck_id} hover>
                                <TableCell>
                                    <Typography fontWeight={700} variant="h6">{truck.unidad}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body1" fontWeight={600} sx={{ minWidth: 100 }}>
                                            {numberFmt(millas)} mi
                                        </Typography>
                                        <Box sx={{ width: '100%', mr: 1 }}>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={progress} 
                                                color={getProgressColor(progress)}
                                                sx={{ height: 10, borderRadius: 5 }}
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {progress.toFixed(0)}%
                                        </Typography>
                                    </Box>
                                    {isCritical && (
                                        <Chip label="¡Requiere Afinación!" color="error" size="small" sx={{ fontWeight: 'bold' }} />
                                    )}
                                </TableCell>
                                <TableCell align="center">
                                    <Button 
                                        variant="contained" 
                                        color={isCritical ? "error" : "primary"}
                                        startIcon={<RefreshIcon />}
                                        onClick={() => handleOpenReset(truck)}
                                        sx={{ textTransform: 'none', borderRadius: 2 }}
                                    >
                                        Reiniciar
                                    </Button>
                                </TableCell>
                                {/* Nueva columna de Ajuste */}
                                <TableCell align="center">
                                    <Tooltip title="Ajuste Manual de Millas">
                                        <IconButton onClick={() => handleOpenManual(truck)} color="default">
                                            <SettingsIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {trucksStatus.length === 0 && (
                        <TableRow><TableCell colSpan={4} align="center">No hay camiones activos</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
      </Paper>

      {/* MODAL 1: REINICIO (RESET) */}
      <Dialog open={openModal} onClose={() => !saving && setOpenModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
            Reiniciar Contador - {selectedTruck?.unidad}
        </DialogTitle>
        <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
                Al confirmar, se guardará el registro actual de <b>{selectedTruck && numberFmt(selectedTruck.millas_acumuladas)} millas</b> y el contador volverá a cero.
            </Typography>
            
            <TextField
                autoFocus
                label="% Vida de Aceite Restante"
                type="number"
                fullWidth
                variant="outlined"
                value={oilPercentage}
                onChange={(e) => setOilPercentage(e.target.value)}
                InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    inputProps: { min: 0, max: 100 }
                }}
                disabled={saving}
                sx={{ mt: 2 }}
            />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenModal(false)} disabled={saving} color="inherit">Cancelar</Button>
            <Button 
                onClick={handleConfirmReset} 
                variant="contained" 
                color="primary" 
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <RefreshIcon />}
            >
                {saving ? 'Guardando...' : 'Confirmar Reinicio'}
            </Button>
        </DialogActions>
      </Dialog>

      {/* MODAL 2: AJUSTE MANUAL (OFFSET) */}
      <Dialog open={openManualModal} onClose={() => !saving && setOpenManualModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
            Ajuste Manual - {selectedTruck?.unidad}
        </DialogTitle>
        <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
                Modifica el total de millas acumuladas actual. Útil para correcciones o desfases.
            </Typography>
            
            <TextField
                autoFocus
                label="Nuevo Total de Millas"
                type="number"
                fullWidth
                variant="outlined"
                value={manualMiles}
                onChange={(e) => setManualMiles(e.target.value)}
                InputProps={{
                    endAdornment: <InputAdornment position="end">mi</InputAdornment>,
                }}
                disabled={saving}
                sx={{ mt: 2 }}
            />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenManualModal(false)} disabled={saving} color="inherit">Cancelar</Button>
            <Button 
                onClick={handleConfirmManualUpdate} 
                variant="contained" 
                color="warning" 
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <SettingsIcon />}
            >
                {saving ? 'Guardando...' : 'Aplicar Ajuste'}
            </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}