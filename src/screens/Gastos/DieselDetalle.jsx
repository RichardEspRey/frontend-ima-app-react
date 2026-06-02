import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, Box, Typography, Stack, CircularProgress, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, InputAdornment
} from '@mui/material';

// Íconos
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

import Swal from 'sweetalert2';
import dayjs from 'dayjs';

import { useAuthStore } from '../../store/useAuthStore';

const apiHost = import.meta.env.VITE_API_HOST;

const money = (v) =>
  new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    minimumFractionDigits: 2, 
    currencyDisplay: 'symbol' 
  }).format(Number(v || 0));

const formatCellData = (val) => {
    if (val === null || val === undefined || val === '' || val === '0' || val === '0.00' || val === 0) {
        return <span style={{ color: '#ccc' }}>—</span>;
    }
    return val;
};

const DieselDetalle = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { tripId } = useParams();
  const { user } = useAuthStore(); 

  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true); 

  const [openAddModal, setOpenAddModal] = useState(false);
  const [manualFiles, setManualFiles] = useState([]);
  
  // 🚨 Estado para guardar todo lo del formulario manual (incluyendo periodo y fecha)
  const [manualForm, setManualForm] = useState({
      odometro: '', galones: '', monto: '', estado: '', fleetone: '', periodo: '',
      fecha: dayjs().format('YYYY-MM-DDTHH:mm') 
  });

  const fetchDiesel = useCallback(async () => {
    setLoading(true);
    try {
        const formDataToSend = new FormData();
        formDataToSend.append('op', 'get_registers_diesel'); 
        formDataToSend.append('trip_id', tripId);

      const response = await fetch(`${apiHost}/formularios.php`, { method: 'POST', body: formDataToSend });
      const data = await response.json();
      
      if (data.status === 'success') {
        const formatted = data.id.map(t => ({
          trip_number: t.trip_number,
          id: t.id,
          trip_id: t.trip_id,
          fecha: t.fecha,
          monto: t.monto,
          odometro: t.odometro,
          galones: t.galones,
          nombre: t.nombre,
          estado: t.estado,
          fleetone: t.fleetone,
          periodo: t.periodo,
          // 🚨 FORZAMOS a evaluar matemáticamente que sea 1. Esto mata el bug fantasma.
          is_manual: Number(t.is_manual) === 1, 
          created_by: t.created_by || '' 
        }));

        setRegistros(formatted);
      }
    } catch (error) { console.error('Error al obtener diesel:', error); } finally { setLoading(false); }
  }, [apiHost, tripId]);

  useEffect(() => { fetchDiesel(); }, [fetchDiesel]);

  const handleVer = (id, trip_id) => {
    navigate(`/editor-diesel/${id}/${trip_id}`);
  };
  
  const cancelar = () => {
    navigate(`/admin-diesel`, { state: location.state });
  }

  const handleManualFormChange = (e) => {
      setManualForm({ ...manualForm, [e.target.name]: e.target.value });
  };

  const handleManualFileChange = (e) => {
      const newFiles = Array.from(e.target.files);
      setManualFiles(prev => [...prev, ...newFiles]);
  };

  const removeManualFile = (indexToRemove) => {
      setManualFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleCloseModal = () => {
      setOpenAddModal(false);
      setManualFiles([]); 
      // Reiniciamos con la fecha y hora de este momento
      setManualForm({ odometro: '', galones: '', monto: '', estado: '', fleetone: '', periodo: '', fecha: dayjs().format('YYYY-MM-DDTHH:mm') });
  };

  const handleSaveManual = async () => {
      if (!manualForm.odometro || !manualForm.galones || !manualForm.monto) {
          return Swal.fire('Campos requeridos', 'Odómetro, Galones y Monto son necesarios.', 'warning');
      }

      handleCloseModal();
      Swal.fire({ title: 'Guardando registro...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      try {
          const fd = new FormData();
          fd.append('op', 'add_manual_diesel');
          fd.append('trip_id', tripId);
          fd.append('odometro', manualForm.odometro);
          fd.append('galones', manualForm.galones);
          fd.append('monto', manualForm.monto);
          fd.append('estado', manualForm.estado);
          fd.append('fleetone', manualForm.fleetone);
          fd.append('periodo', manualForm.periodo);
          // MySQL necesita el formato sin la T
          fd.append('fecha', manualForm.fecha.replace('T', ' ')); 
          fd.append('created_by', user?.name || 'Administrador');

          manualFiles.forEach((f) => fd.append('manualFiles[]', f));

          const response = await fetch(`${apiHost}/formularios.php`, { method: 'POST', body: fd });
          const result = await response.json();
          Swal.close();

          if (result.status === 'success') {
              Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Registro manual añadido', showConfirmButton: false, timer: 2000 });
              fetchDiesel();
          } else {
              throw new Error(result.message);
          }
      } catch (error) {
          Swal.fire('Error', error.message, 'error');
      }
  };

  if (loading) {
      return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', p: 3 }}>
              <CircularProgress /> 
              <Typography ml={2}>Cargando detalles del viaje...</Typography> 
          </Box>
      );
  }

  return (
   <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
             <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                Diesel Detail
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
                Trip: <strong>#{registros[0]?.trip_number || tripId}</strong>
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
              <Button 
                variant="contained" 
                color="secondary"
                startIcon={<AddCircleIcon />} 
                onClick={() => setOpenAddModal(true)}
                sx={{ fontWeight: 600, bgcolor: '#0f172a' }}
              >
                Añadir Registro Manual
              </Button>
              <Button 
                variant="outlined" 
                startIcon={<ArrowBackIcon />} 
                onClick={cancelar}
                sx={{ fontWeight: 600 }}
              >
                Return
              </Button>
          </Stack>
      </Stack>

      <Paper elevation={1} sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 900 }} aria-label="diesel detail table" size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>No.</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Origen</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trip</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Last update</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Odometer</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Gal.</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Total ($)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Registrado por</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>State</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Fleet One</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {registros.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={11} align="center">
                          <Typography color="text.secondary" sx={{ py: 3 }}>No hay registros para este viaje.</Typography>
                      </TableCell>
                  </TableRow>
              ) : (
                  registros.map((row, idx) => ( 
                  <TableRow key={row.id} hover sx={{ bgcolor: row.is_manual ? '#fff8e1' : 'inherit' }}>
                      <TableCell>{idx + 1}</TableCell>
                      
                      <TableCell>
                          {row.is_manual ? (
                              <Chip size="small" icon={<AdminPanelSettingsIcon />} label={`Manual: ${row.created_by || 'Admin'}`} color="warning" variant="outlined" sx={{ fontWeight: 'bold', bgcolor: '#fff' }} />
                          ) : (
                              <Chip size="small" icon={<PersonIcon />} label="App Móvil" color="primary" variant="outlined" sx={{ fontWeight: 'bold' }} />
                          )}
                      </TableCell>

                      <TableCell sx={{ fontWeight: 500 }}>{row.trip_number}</TableCell>
                      <TableCell>{row.fecha}</TableCell>
                      
                      <TableCell align="right">{row.odometro} mi</TableCell>
                      <TableCell align="right">{row.galones} gal</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: '#3C48E1' }}> 
                          {money(row.monto)}
                      </TableCell>
                      
                      <TableCell>
                          <Typography variant="body2" fontWeight={row.is_manual ? 400 : 600} color={row.is_manual ? 'text.secondary' : 'inherit'}>
                              {row.nombre || '—'}
                          </Typography>
                      </TableCell>
                      
                      <TableCell>{formatCellData(row.estado)}</TableCell>
                      <TableCell>{formatCellData(row.fleetone)}</TableCell>
                      <TableCell align="center">
                          <Button variant="contained" size="small" onClick={() => handleVer(row.id, row.trip_id)} sx={{ textTransform: 'none' }}>
                              Edit
                          </Button>
                      </TableCell>
                  </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal de Captura Manual */}
      <Dialog open={openAddModal} onClose={handleCloseModal} maxWidth="md" fullWidth scroll="paper">
          <DialogTitle sx={{ bgcolor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', fontWeight: 800, color: 'primary.main', py: 2 }}>
              Nuevo Registro Manual (A destiempo)
          </DialogTitle>
          <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f4f6f8' }}>
              <Grid container spacing={4}>
                  
                  {/* Columna Izquierda: Formulario */}
                  <Grid item xs={12} md={6}>
                      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', height: '100%' }}>
                          <Typography variant="subtitle1" fontWeight={700} mb={2} color="primary">Datos del Ticket</Typography>
                          <Typography variant="body2" color="text.secondary" mb={3}>
                              Este registro se marcará como insertado manualmente por tu usuario.
                          </Typography>
                          
                          <Grid container spacing={2}>
                              <Grid item xs={12}>
                                  <TextField fullWidth size="small" label="Fecha y hora" type="datetime-local" name="fecha" value={manualForm.fecha} onChange={handleManualFormChange} InputLabelProps={{ shrink: true }} />
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                  <TextField fullWidth size="small" label="Odómetro *" name="odometro" type="number" value={manualForm.odometro} onChange={handleManualFormChange} InputLabelProps={{ shrink: true }} InputProps={{ endAdornment: <InputAdornment position="end">mi</InputAdornment> }}/>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                  <TextField fullWidth size="small" label="Galones *" name="galones" type="number" value={manualForm.galones} onChange={handleManualFormChange} InputLabelProps={{ shrink: true }} InputProps={{ endAdornment: <InputAdornment position="end">gal</InputAdornment> }}/>
                              </Grid>
                              <Grid item xs={12}>
                                  <TextField fullWidth size="small" label="Monto Total *" name="monto" type="number" value={manualForm.monto} onChange={handleManualFormChange} InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}/>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                  <TextField fullWidth size="small" label="Estado (State)" name="estado" value={manualForm.estado} onChange={handleManualFormChange} placeholder="Ej. TX" InputLabelProps={{ shrink: true }}/>
                              </Grid>
                              <Grid item xs={12} sm={6}>
                                  <TextField fullWidth size="small" label="Fleet One" name="fleetone" type="number" value={manualForm.fleetone} onChange={handleManualFormChange} InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}/>
                              </Grid>
                              <Grid item xs={12}>
                                  <TextField fullWidth size="small" label="Periodo" name="periodo" value={manualForm.periodo} onChange={handleManualFormChange} placeholder="Ej. Q2" InputLabelProps={{ shrink: true }}/>
                              </Grid>
                          </Grid>
                      </Paper>
                  </Grid>

                  {/* Columna Derecha: Carga de Archivos */}
                  <Grid item xs={12} md={6}>
                      <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: '1px solid #e0e0e0', height: '100%' }}>
                          <Typography variant="subtitle1" fontWeight={700} mb={2} color="primary">Evidencia (Tickets)</Typography>
                          
                          <Box sx={{ 
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                              width: '100%', border: '2px dashed #90caf9', bgcolor: '#e3f2fd', 
                              py: 4, px: 2, textAlign: 'center', borderRadius: 2,
                              cursor: 'pointer', transition: '0.2s', '&:hover': { bgcolor: '#e1f5fe', borderColor: '#42a5f5' }
                          }} component="label">
                              <CloudUploadIcon sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                              <Typography variant="button" fontWeight={700} color="primary" sx={{ display: 'block' }}>
                                  Seleccionar Tickets (PDF/IMG)
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                  Puedes subir múltiples archivos
                              </Typography>
                              <input type="file" hidden multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleManualFileChange} />
                          </Box>

                          {manualFiles.length > 0 && (
                              <Box sx={{ mt: 3 }}>
                                  <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                      Archivos adjuntos ({manualFiles.length}):
                                  </Typography>
                                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                      {manualFiles.map((file, index) => (
                                          <Chip 
                                              key={index} 
                                              icon={<InsertDriveFileIcon />} 
                                              label={file.name} 
                                              onDelete={() => removeManualFile(index)} 
                                              color="primary" 
                                              variant="outlined" 
                                              size="small"
                                              sx={{ fontWeight: 600 }}
                                          />
                                      ))}
                                  </Stack>
                              </Box>
                          )}
                      </Paper>
                  </Grid>

              </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
              <Button onClick={handleCloseModal} color="inherit" sx={{ fontWeight: 600 }}>Cancelar</Button>
              <Button onClick={handleSaveManual} variant="contained" disableElevation sx={{ bgcolor: '#0f172a', fontWeight: 700, px: 4, borderRadius: 2 }}>
                  Guardar Registro
              </Button>
          </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DieselDetalle;