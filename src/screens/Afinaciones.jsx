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
import SettingsIcon from '@mui/icons-material/Settings'; 
import EditIcon from '@mui/icons-material/Edit'; 
// Nuevos iconos para auditoría e historial
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom"; 

const apiHost = import.meta.env.VITE_API_HOST;

const numberFmt = (n) => new Intl.NumberFormat('en-US').format(Number(n).toFixed(0));

export default function Afinaciones() {
  const navigate = useNavigate(); 

  const [trucksStatus, setTrucksStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [openModal, setOpenModal] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [oilPercentage, setOilPercentage] = useState('');
  
  const [openManualModal, setOpenManualModal] = useState(false);
  const [manualMiles, setManualMiles] = useState('');

  const [openLimitModal, setOpenLimitModal] = useState(false);
  const [newLimit, setNewLimit] = useState('');

  // === NUEVOS ESTADOS PARA AUDITORÍA ===
  const [openPhotoModal, setOpenPhotoModal] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState('');

  const [openCorrectModal, setOpenCorrectModal] = useState(false);
  const [correctMiles, setCorrectMiles] = useState('');

  // === NUEVOS ESTADOS PARA HISTORIAL 15 ===
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [historyRecords, setHistoryRecords] = useState([]);

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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  const handleOpenManual = (truck) => {
      setSelectedTruck(truck);
      setManualMiles(truck.odometro_base || ''); 
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

  const handleOpenLimit = (truck) => {
    setSelectedTruck(truck);
    setNewLimit(truck.limite_afinacion || 15000); 
    setOpenLimitModal(true);
  };

  const handleConfirmLimitUpdate = async () => {
    if (!newLimit || isNaN(newLimit) || newLimit <= 0) {
        return Swal.fire('Error', 'Ingresa un límite válido mayor a 0', 'warning');
    }

    setSaving(true);
    try {
        const fd = new FormData();
        fd.append('op', 'update_limit');
        fd.append('truck_id', selectedTruck.truck_id);
        fd.append('nuevo_limite', newLimit);

        const res = await fetch(`${apiHost}/afinaciones.php`, { method: 'POST', body: fd });
        const json = await res.json();

        if (json.status === 'success') {
            Swal.fire('Actualizado', 'Nuevo límite establecido.', 'success');
            setOpenLimitModal(false);
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

  // === NUEVAS FUNCIONES DE AUDITORÍA E HISTORIAL ===
  const handleOpenPhoto = (url) => {
      const imageUrl = url.startsWith('http') ? url : `http://imaexpressllc.com/API/${url}`;
      setCurrentPhoto(imageUrl);
      setOpenPhotoModal(true);
  };

  const handleOpenCorrectOdometer = (truckObj) => {
      if (!truckObj.id_diesel) return Swal.fire('Info', 'No hay registros de diésel para este camión aún.', 'info');
      setSelectedTruck(truckObj);
      setCorrectMiles(truckObj.ultimo_odometro_registrado || truckObj.odometro || '');
      setOpenCorrectModal(true);
  };

  const handleConfirmCorrection = async () => {
      if (!correctMiles || isNaN(correctMiles) || correctMiles < 0) {
          return Swal.fire('Error', 'Ingresa un odómetro válido', 'warning');
      }

      setSaving(true);
      try {
          const fd = new FormData();
          fd.append('op', 'correct_odometer');
          fd.append('diesel_id', selectedTruck.id_diesel);
          fd.append('nuevo_odometro', correctMiles);

          const res = await fetch(`${apiHost}/afinaciones.php`, { method: 'POST', body: fd });
          const json = await res.json();

          if (json.status === 'success') {
              Swal.fire('Corregido', 'El registro de diésel ha sido actualizado correctamente.', 'success');
              setOpenCorrectModal(false);
              setOpenHistoryModal(false); // Cierra historial si estaba abierto
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

  const handleOpenHistory = (truck) => {
      setSelectedTruck(truck);
      setHistoryRecords(truck.ultimos_registros || []);
      setOpenHistoryModal(true);
  };

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
                <Typography variant="body2" color="text.secondary">
                    Monitoreo de cambio de aceite y mantenimiento preventivo
                </Typography>
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
                        <TableCell sx={{ fontWeight: 700, width: '35%' }}>Estado (Millas vs Límite)</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Auditoría (App)</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Historial (15)</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Reiniciar</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Ajustes</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {trucksStatus.map((truck) => {
                        const millas = Number(truck.millas_acumuladas);
                        const limite = Number(truck.limite_afinacion) || 15000;
                        
                        const progress = Math.min((millas / limite) * 100, 100);
                        const isCritical = millas >= limite;

                        return (
                            <TableRow key={truck.truck_id} hover>
                                <TableCell>
                                    <Typography fontWeight={700} variant="h6">{truck.unidad}</Typography>
                                </TableCell>
                                
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body1" fontWeight={600}>
                                            {numberFmt(millas)} / {numberFmt(limite)} mi
                                        </Typography>
                                        
                                        <Tooltip title="Cambiar límite de afinación">
                                            <IconButton size="small" onClick={() => handleOpenLimit(truck)} sx={{ ml: 1, p: 0.5 }}>
                                                <EditIcon fontSize="small" color="action" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                    
                                    <Box sx={{ width: '100%', mr: 1, display: 'flex', alignItems: 'center' }}>
                                        <Box sx={{ width: '100%', mr: 1 }}>
                                            <LinearProgress 
                                                variant="determinate" 
                                                value={progress} 
                                                color={getProgressColor(progress)}
                                                sx={{ height: 10, borderRadius: 5 }}
                                            />
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 35 }}>
                                            {progress.toFixed(0)}%
                                        </Typography>
                                    </Box>

                                    {isCritical && (
                                        <Chip label="¡Requiere Mantenimiento!" color="error" size="small" sx={{ fontWeight: 'bold', mt: 0.5 }} />
                                    )}
                                </TableCell>

                                {/* --- NUEVA COLUMNA DE AUDITORÍA --- */}
                                <TableCell align="center">
                                    <Box sx={{ p: 1, border: '1px dashed #ccc', borderRadius: 2, display: 'inline-block' }}>
                                        <Typography variant="caption" color="text.secondary">Captura chofer:</Typography>
                                        <Typography variant="body1" fontWeight={700}>
                                            {truck.ultimo_odometro_registrado ? `${numberFmt(truck.ultimo_odometro_registrado)} mi` : 'N/A'}
                                        </Typography>
                                        <Stack direction="row" spacing={1} mt={0.5} justifyContent="center">
                                            <Tooltip title="Ver Foto del Tablero">
                                                <span>
                                                    <IconButton 
                                                        size="small" 
                                                        color="info" 
                                                        onClick={() => handleOpenPhoto(truck.ticket_url)}
                                                        disabled={!truck.ticket_url}
                                                    >
                                                        <PhotoCameraIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Corregir Error de Dedo">
                                                <IconButton 
                                                    size="small" 
                                                    color="warning" 
                                                    onClick={() => handleOpenCorrectOdometer(truck)}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Box>
                                </TableCell>

                                {/* --- NUEVA COLUMNA DE HISTORIAL --- */}
                                <TableCell align="center">
                                    <Button 
                                        variant="outlined" 
                                        size="small" 
                                        startIcon={<FormatListBulletedIcon />}
                                        onClick={() => handleOpenHistory(truck)}
                                        sx={{ textTransform: 'none', borderRadius: 2 }}
                                    >
                                        Ver 15
                                    </Button>
                                </TableCell>
                                
                                <TableCell align="center">
                                    <Button 
                                        variant="contained" 
                                        color={isCritical ? "error" : "primary"}
                                        startIcon={<RefreshIcon />}
                                        onClick={() => handleOpenReset(truck)}
                                        sx={{ textTransform: 'none', borderRadius: 2 }}
                                        size="small"
                                    >
                                        Reiniciar
                                    </Button>
                                </TableCell>
                                
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
                        <TableRow><TableCell colSpan={6} align="center">No hay camiones activos</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
      </Paper>

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

      <Dialog open={openManualModal} onClose={() => !saving && setOpenManualModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
            Odómetro de Última Afinación - {selectedTruck?.unidad}
        </DialogTitle>
        <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
                Ingresa el odómetro exacto que tenía el camión cuando se le hizo su última afinación. Este número será la base para contar las nuevas millas.
            </Typography>
            
            <TextField
                autoFocus
                label="Odómetro Base (mi)"
                type="number"
                fullWidth
                variant="outlined"
                value={manualMiles}
                onChange={(e) => setManualMiles(e.target.value)}
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

      <Dialog open={openLimitModal} onClose={() => !saving && setOpenLimitModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
            Configurar Límite - {selectedTruck?.unidad}
        </DialogTitle>
        <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
                Define cada cuántas millas este camión requiere mantenimiento preventivo.
            </Typography>
            
            <TextField
                autoFocus
                label="Límite de Afinación (millas)"
                type="number"
                fullWidth
                variant="outlined"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                InputProps={{
                    endAdornment: <InputAdornment position="end">mi</InputAdornment>,
                }}
                disabled={saving}
                sx={{ mt: 2 }}
            />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenLimitModal(false)} disabled={saving} color="inherit">Cancelar</Button>
            <Button 
                onClick={handleConfirmLimitUpdate} 
                variant="contained" 
                color="info" 
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <EditIcon />}
            >
                {saving ? 'Guardando...' : 'Guardar Límite'}
            </Button>
        </DialogActions>
      </Dialog>

      {/* --- NUEVO MODAL: FOTO DEL TABLERO --- */}
      <Dialog open={openPhotoModal} onClose={() => setOpenPhotoModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Evidencia de Odómetro</DialogTitle>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            {currentPhoto ? (
                <img src={currentPhoto} alt="Odómetro" style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: 8 }} />
            ) : (
                <Typography color="text.secondary">No hay imagen disponible.</Typography>
            )}
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenPhotoModal(false)} color="inherit">Cerrar</Button>
        </DialogActions>
      </Dialog>

      {/* --- NUEVO MODAL: CORREGIR ODÓMETRO --- */}
      <Dialog open={openCorrectModal} onClose={() => !saving && setOpenCorrectModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Corregir Lectura - {selectedTruck?.unidad}</DialogTitle>
        <DialogContent>
            <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
                Si el operador escribió mal el odómetro en la app, ingresa aquí el número correcto que aparece en la foto del tablero.
            </Typography>
            <TextField 
                autoFocus 
                label="Odómetro Correcto (mi)" 
                type="number" 
                fullWidth 
                variant="outlined" 
                value={correctMiles} 
                onChange={(e) => setCorrectMiles(e.target.value)} 
                disabled={saving} 
                sx={{ mt: 2 }} 
            />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenCorrectModal(false)} disabled={saving} color="inherit">Cancelar</Button>
            <Button 
                onClick={handleConfirmCorrection} 
                variant="contained" 
                color="warning" 
                disabled={saving} 
                startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <VerifiedUserIcon />}
            >
                {saving ? 'Guardando...' : 'Aplicar Corrección'}
            </Button>
        </DialogActions>
      </Dialog>

      {/* --- NUEVO MODAL: HISTORIAL DE LOS ÚLTIMOS 15 --- */}
      <Dialog open={openHistoryModal} onClose={() => setOpenHistoryModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>
            Últimos 15 Registros - Unidad {selectedTruck?.unidad}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>Viaje</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Odómetro</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Evidencia (Foto)</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 'bold' }}>Corregir</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {historyRecords.length === 0 ? (
                        <TableRow><TableCell colSpan={5} align="center">No hay registros recientes</TableCell></TableRow>
                    ) : (
                        historyRecords.map(rec => (
                            <TableRow key={rec.id_diesel} hover>
                                <TableCell>{rec.trip_number || 'N/A'}</TableCell>
                                <TableCell>{rec.fecha}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{numberFmt(rec.odometro)} mi</TableCell>
                                <TableCell align="center">
                                    <IconButton size="small" color="info" onClick={() => handleOpenPhoto(rec.ticket_url)} disabled={!rec.ticket_url}>
                                        <PhotoCameraIcon />
                                    </IconButton>
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton size="small" color="warning" onClick={() => handleOpenCorrectOdometer({ 
                                        unidad: selectedTruck.unidad, 
                                        id_diesel: rec.id_diesel, 
                                        odometro: rec.odometro 
                                    })}>
                                        <EditIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpenHistoryModal(false)} color="inherit">Cerrar</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}