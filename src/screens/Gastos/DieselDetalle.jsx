import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, Box, Typography, Stack, CircularProgress, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, Grid, TextField, InputAdornment,
    Switch, Tooltip
} from '@mui/material';

// Íconos
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { ResumenRegistro } from '../../components/EditorRegistro';
import {
    PAGE_SHELL_SX, PAGE_OVERLINE_SX, PAGE_TITLE_SX, CARD_SX, SECTION_LABEL_SX, HEADER_ROW_SX, HEADER_CELL_SX,
    TABLE_CONTAINER_SX, CHIP_WARN_SX, CHIP_INFO_SX, CELL_STRONG_SX, CELL_SX, CELL_MUTED_SX, GHOST_BTN_SX, DARK_BTN_SX,
    DIALOG_PAPER_SX, DIALOG_TITLE_SX, DIALOG_CONTENT_SX, DIALOG_ACTIONS_SX, INPUT_SX,
} from '../../styles/estilosTabla';

const EDITAR_BTN_SX = { ...GHOST_BTN_SX, px: 1.5, py: 0.4, fontSize: '0.78rem' };
const CAMPO = { InputProps: { sx: INPUT_SX }, InputLabelProps: { shrink: true } };

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
          created_by: t.created_by || '',
          usar_fleetone: Number(t.usar_fleetone ?? 1) === 1
        }));

        setRegistros(formatted);
      }
    } catch (error) { console.error('Error al obtener diesel:', error); } finally { setLoading(false); }
  }, [apiHost, tripId]);

  useEffect(() => { fetchDiesel(); }, [fetchDiesel]);

  const [guardandoFuente, setGuardandoFuente] = useState({});

  const handleToggleFuente = async (row) => {
    const usarFleetone = !row.usar_fleetone;
    setRegistros(prev => prev.map(r => r.id === row.id ? { ...r, usar_fleetone: usarFleetone } : r));
    setGuardandoFuente(prev => ({ ...prev, [row.id]: true }));
    try {
      const fd = new FormData();
      fd.append('op', 'set_diesel_usar_fleetone');
      fd.append('id', row.id);
      fd.append('usar_fleetone', usarFleetone ? '1' : '0');
      fd.append('actualizado_por', user?.name || 'Administrador');
      const response = await fetch(`${apiHost}/formularios.php`, { method: 'POST', body: fd });
      const data = await response.json();
      if (data.status !== 'success') throw new Error(data.message || 'No se pudo guardar.');
    } catch (error) {
      console.error('Error al cambiar la fuente del diesel:', error);
      setRegistros(prev => prev.map(r => r.id === row.id ? { ...r, usar_fleetone: row.usar_fleetone } : r));
      Swal.fire('Error', 'No se pudo cambiar de dónde toma Margen el costo de este registro.', 'error');
    } finally {
      setGuardandoFuente(prev => ({ ...prev, [row.id]: false }));
    }
  };

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
          <Box sx={{ ...PAGE_SHELL_SX, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size={28} />
          </Box>
      );
  }

  const totalMonto = registros.reduce((suma, row) => suma + Number(row.monto || 0), 0);
  const totalGalones = registros.reduce((suma, row) => suma + Number(row.galones || 0), 0);

  return (
      <Box sx={PAGE_SHELL_SX}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4} flexWrap="wrap" gap={2}>
              <Box>
                <Typography variant="overline" sx={PAGE_OVERLINE_SX}>Gastos · Diesel</Typography>
                <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em" sx={PAGE_TITLE_SX}>
                    Diesel Detail
                </Typography>
                <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                    Cargas de combustible del viaje #{registros[0]?.trip_number || tripId}.
                </Typography>
              </Box>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={cancelar} sx={GHOST_BTN_SX}>
                    Return
                  </Button>
                  <Button variant="contained" startIcon={<AddCircleIcon />} onClick={() => setOpenAddModal(true)} sx={DARK_BTN_SX}>
                    Añadir Registro Manual
                  </Button>
              </Stack>
          </Stack>

          <ResumenRegistro
            datos={[
              { etiqueta: 'Viaje', valor: registros[0]?.trip_number || tripId },
              { etiqueta: 'Registros', valor: String(registros.length) },
              { etiqueta: 'Galones', valor: `${totalGalones.toFixed(2)} gal` },
              { etiqueta: 'Total', valor: money(totalMonto), destacado: true },
            ]}
          />

          <TableContainer component={Paper} elevation={0} sx={TABLE_CONTAINER_SX}>
            <Table sx={{ minWidth: 900 }} aria-label="diesel detail table" size="small">
              <TableHead>
                <TableRow sx={HEADER_ROW_SX}>
                  <TableCell sx={HEADER_CELL_SX}>No.</TableCell>
                  <TableCell sx={HEADER_CELL_SX}>Origen</TableCell>
                  <TableCell sx={HEADER_CELL_SX}>Trip</TableCell>
                  <TableCell sx={HEADER_CELL_SX}>Last update</TableCell>
                  <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Odometer</TableCell>
                  <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Gal.</TableCell>
                  <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Total ($)</TableCell>
                  <TableCell sx={HEADER_CELL_SX}>Registrado por</TableCell>
                  <TableCell sx={HEADER_CELL_SX}>State</TableCell>
                  <TableCell sx={HEADER_CELL_SX}>Fleet One</TableCell>
                  <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Margen usa</TableCell>
                  <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registros.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={12} align="center" sx={{ py: 6 }}>
                            <Typography color="#94a3b8" variant="body2">No hay registros para este viaje.</Typography>
                        </TableCell>
                    </TableRow>
                ) : (
                    registros.map((row, idx) => (
                    <TableRow key={row.id} hover sx={{ bgcolor: row.is_manual ? '#fffdf5' : 'inherit' }}>
                        <TableCell sx={CELL_MUTED_SX}>{idx + 1}</TableCell>
                        <TableCell>
                            {row.is_manual ? (
                                <Chip size="small" icon={<AdminPanelSettingsIcon sx={{ fontSize: 14 }} />} label={`Manual: ${row.created_by || 'Admin'}`} sx={{ ...CHIP_WARN_SX, '& .MuiChip-icon': { color: 'inherit' } }} />
                            ) : (
                                <Chip size="small" icon={<PersonIcon sx={{ fontSize: 14 }} />} label="App Móvil" sx={{ ...CHIP_INFO_SX, '& .MuiChip-icon': { color: 'inherit' } }} />
                            )}
                        </TableCell>
                        <TableCell sx={CELL_STRONG_SX}>{row.trip_number}</TableCell>
                        <TableCell sx={{ ...CELL_MUTED_SX, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{row.fecha}</TableCell>
                        <TableCell align="right" sx={{ ...CELL_SX, fontVariantNumeric: 'tabular-nums' }}>{row.odometro} mi</TableCell>
                        <TableCell align="right" sx={{ ...CELL_SX, fontVariantNumeric: 'tabular-nums' }}>{row.galones} gal</TableCell>
                        <TableCell align="right" sx={{ ...CELL_STRONG_SX, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                            {money(row.monto)}
                        </TableCell>
                        <TableCell>
                            <Typography variant="body2" fontWeight={row.is_manual ? 400 : 600} color={row.is_manual ? '#64748b' : '#334155'}>
                                {row.nombre || '—'}
                            </Typography>
                        </TableCell>
                        <TableCell sx={CELL_SX}>{formatCellData(row.estado)}</TableCell>
                        <TableCell sx={CELL_SX}>{formatCellData(row.fleetone)}</TableCell>
                        <TableCell align="center">
                            <Tooltip title={row.usar_fleetone ? 'Margen toma el Fleet One de este registro' : 'Margen toma el Total de este registro'}>
                                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                                    <Switch
                                        size="small"
                                        checked={row.usar_fleetone}
                                        disabled={!!guardandoFuente[row.id]}
                                        onChange={() => handleToggleFuente(row)}
                                    />
                                    <Typography variant="body2" sx={{ ...CELL_SX, minWidth: 60, textAlign: 'left' }}>
                                        {row.usar_fleetone ? 'Fleet One' : 'Total'}
                                    </Typography>
                                </Stack>
                            </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                            <Button variant="outlined" size="small" startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />} onClick={() => handleVer(row.id, row.trip_id)} sx={EDITAR_BTN_SX}>
                                Edit
                            </Button>
                        </TableCell>
                    </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Dialog open={openAddModal} onClose={handleCloseModal} maxWidth="md" fullWidth scroll="paper" PaperProps={{ sx: DIALOG_PAPER_SX }}>
              <DialogTitle sx={DIALOG_TITLE_SX}>
                  <Typography variant="overline" sx={{ ...SECTION_LABEL_SX, display: 'block' }}>Gastos · Diesel</Typography>
                  <Typography variant="h6" component="span" fontWeight={800} color="#0f172a">
                      Nuevo Registro Manual (A destiempo)
                  </Typography>
              </DialogTitle>
              <DialogContent sx={DIALOG_CONTENT_SX}>
                  <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                          <Paper elevation={0} sx={{ ...CARD_SX, height: '100%' }}>
                              <Typography variant="overline" sx={SECTION_LABEL_SX}>Datos del Ticket</Typography>
                              <Typography variant="body2" color="#64748b" sx={{ mt: 0.5, mb: 2.5 }}>
                                  Este registro se marcará como insertado manualmente por tu usuario.
                              </Typography>
                              <Grid container spacing={2}>
                                  <Grid size={12}>
                                      <TextField {...CAMPO} fullWidth size="small" label="Fecha y hora" type="datetime-local" name="fecha" value={manualForm.fecha} onChange={handleManualFormChange} />
                                  </Grid>
                                  <Grid size={{ xs: 12, sm: 6 }}>
                                      <TextField {...CAMPO} fullWidth size="small" label="Odómetro *" name="odometro" type="number" value={manualForm.odometro} onChange={handleManualFormChange} InputProps={{ sx: INPUT_SX, endAdornment: <InputAdornment position="end">mi</InputAdornment> }} />
                                  </Grid>
                                  <Grid size={{ xs: 12, sm: 6 }}>
                                      <TextField {...CAMPO} fullWidth size="small" label="Galones *" name="galones" type="number" value={manualForm.galones} onChange={handleManualFormChange} InputProps={{ sx: INPUT_SX, endAdornment: <InputAdornment position="end">gal</InputAdornment> }} />
                                  </Grid>
                                  <Grid size={12}>
                                      <TextField {...CAMPO} fullWidth size="small" label="Monto Total *" name="monto" type="number" value={manualForm.monto} onChange={handleManualFormChange} InputProps={{ sx: INPUT_SX, startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                                  </Grid>
                                  <Grid size={{ xs: 12, sm: 6 }}>
                                      <TextField {...CAMPO} fullWidth size="small" label="Estado (State)" name="estado" value={manualForm.estado} onChange={handleManualFormChange} placeholder="Ej. TX" />
                                  </Grid>
                                  <Grid size={{ xs: 12, sm: 6 }}>
                                      <TextField {...CAMPO} fullWidth size="small" label="Fleet One" name="fleetone" type="number" value={manualForm.fleetone} onChange={handleManualFormChange} InputProps={{ sx: INPUT_SX, startAdornment: <InputAdornment position="start">$</InputAdornment> }} />
                                  </Grid>
                                  <Grid size={12}>
                                      <TextField {...CAMPO} fullWidth size="small" label="Periodo" name="periodo" value={manualForm.periodo} onChange={handleManualFormChange} placeholder="Ej. Q2" />
                                  </Grid>
                              </Grid>
                          </Paper>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                          <Paper elevation={0} sx={{ ...CARD_SX, height: '100%' }}>
                              <Typography variant="overline" sx={SECTION_LABEL_SX}>Evidencia (Tickets)</Typography>
                              <Box sx={{
                                  mt: 1.5,
                                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                  width: '100%', border: '2px dashed #cbd5e1', bgcolor: '#f8fafc',
                                  py: 4, px: 2, textAlign: 'center', borderRadius: 2,
                                  cursor: 'pointer', transition: '0.2s', '&:hover': { bgcolor: '#f1f5f9', borderColor: '#94a3b8' }
                              }} component="label">
                                  <CloudUploadIcon sx={{ fontSize: 36, color: '#64748b', mb: 1 }} />
                                  <Typography variant="body2" fontWeight={700} color="#0f172a">
                                      Seleccionar Tickets (PDF/IMG)
                                  </Typography>
                                  <Typography variant="caption" color="#94a3b8" sx={{ display: 'block', mt: 0.5 }}>
                                      Puedes subir múltiples archivos
                                  </Typography>
                                  <input type="file" hidden multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleManualFileChange} />
                              </Box>

                              {manualFiles.length > 0 && (
                                  <Box sx={{ mt: 3 }}>
                                      <Typography variant="caption" fontWeight={600} color="#64748b" sx={{ display: 'block', mb: 1 }}>
                                          Archivos adjuntos ({manualFiles.length}):
                                      </Typography>
                                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                                          {manualFiles.map((file, index) => (
                                              <Chip
                                                  key={index}
                                                  icon={<InsertDriveFileIcon sx={{ fontSize: 14 }} />}
                                                  label={file.name}
                                                  onDelete={() => removeManualFile(index)}
                                                  size="small"
                                                  sx={{ ...CHIP_INFO_SX, '& .MuiChip-icon': { color: 'inherit' } }}
                                              />
                                          ))}
                                      </Stack>
                                  </Box>
                              )}
                          </Paper>
                      </Grid>
                  </Grid>
              </DialogContent>
              <DialogActions sx={DIALOG_ACTIONS_SX}>
                  <Button onClick={handleCloseModal} variant="outlined" sx={GHOST_BTN_SX}>Cancelar</Button>
                  <Button onClick={handleSaveManual} variant="contained" disableElevation sx={DARK_BTN_SX}>
                      Guardar Registro
                  </Button>
              </DialogActions>
          </Dialog>
      </Box>
  );
};

export default DieselDetalle;