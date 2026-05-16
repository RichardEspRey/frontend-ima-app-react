import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Button, Stack, CircularProgress, MenuItem, Dialog, DialogTitle, DialogContent, 
    DialogActions, IconButton, Chip, Tooltip, Grid, FormControlLabel, Switch, Divider, TablePagination
} from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; 
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewColumnIcon from '@mui/icons-material/ViewColumn'; 
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import FilePresentIcon from '@mui/icons-material/FilePresent';
import CloseIcon from '@mui/icons-material/Close';

import Swal from 'sweetalert2';

const apiHost = import.meta.env.VITE_API_HOST;
const API_ENDPOINT = 'cajas_v2.php';

const TrailerAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [cajas, setCajas] = useState([]);
  const [configFields, setConfigFields] = useState([]);
  
  const [searchCaja, setSearchCaja] = useState('');
  const [searchPlaca, setSearchPlaca] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openConfigModal, setOpenConfigModal] = useState(false);
  const [openTrailerModal, setOpenTrailerModal] = useState(false);
  const [openColumnModal, setOpenColumnModal] = useState(false); 
  
  const [hiddenColumns, setHiddenColumns] = useState([]); 

  const [newField, setNewField] = useState({ label: '', categoria: 'USA', tipo: 'file', tiene_vencimiento: true });
  
  const [trailerData, setTrailerData] = useState({});
  const [trailerDocs, setTrailerDocs] = useState({});
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const fd = new FormData();
        fd.append('op', 'getInitData');
        const res = await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
        const data = await res.json();
        if (data.status === 'success') {
            setConfigFields(data.requisitos || []);
            setCajas(data.cajas || []);
        }
    } catch (error) { 
        console.error(error); 
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleColumnVisibility = (key_name) => {
      setHiddenColumns(prev => 
          prev.includes(key_name) ? prev.filter(k => k !== key_name) : [...prev, key_name]
      );
  };

  const handleCreateField = async () => {
      if (!newField.label) return Swal.fire('Oops', 'Asigna un nombre al requisito', 'warning');
      const fd = new FormData();
      fd.append('op', 'addConfig');
      Object.keys(newField).forEach(k => fd.append(k, k === 'tiene_vencimiento' ? (newField[k] ? 1 : 0) : newField[k]));
      
      await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
      setOpenConfigModal(false);
      setNewField({ label: '', categoria: 'USA', tipo: 'file', tiene_vencimiento: true });
      fetchData();
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Requisito Creado', showConfirmButton: false, timer: 2000 });
  };

  const handleDeleteField = async (key_name, label) => {
      const { isConfirmed } = await Swal.fire({ 
          title: `¿Eliminar "${label}"?`, 
          text: 'El campo se eliminará. Los datos históricos se conservan seguros en BD.', 
          icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar', confirmButtonColor: '#d33'
      });
      if (!isConfirmed) return;
      const fd = new FormData();
      fd.append('op', 'deleteConfig');
      fd.append('key_name', key_name);
      await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
      fetchData();
  };

  const openTrailerEditor = (caja = null) => {
      if (caja) {
          setTrailerData({ ...caja });
          setTrailerDocs({});
      } else {
          setTrailerData({ no_caja: '', no_placa: '', estado_placa: '', no_vin: '', docs: {} });
          setTrailerDocs({});
      }
      setOpenTrailerModal(true);
  };

  const handleSaveTrailer = async () => {
      if (!trailerData.no_caja) return Swal.fire('Falta Número', 'El número de caja es obligatorio.', 'warning');
      setLoading(true);

      const fd = new FormData();
      fd.append('op', 'saveTrailer');
      
      ['caja_id', 'no_caja', 'no_placa', 'estado_placa', 'no_vin'].forEach(k => {
          if (trailerData[k]) fd.append(k, trailerData[k]);
      });

      configFields.forEach(req => {
          const k = req.key_name;
          const val = trailerData.docs?.[k]; 
          if (req.tipo === 'text' && val?.valor_texto !== undefined) fd.append(`text_${k}`, val.valor_texto);
          if (req.tipo === 'file') {
              if (val?.fecha_vencimiento) fd.append(`date_${k}`, val.fecha_vencimiento.split('T')[0]);
              if (trailerDocs[k]) fd.append(`file_${k}`, trailerDocs[k]); 
          }
      });

      try {
          await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
          setOpenTrailerModal(false);
          fetchData();
          Swal.fire('Guardado', 'Caja y documentos actualizados.', 'success');
      } catch(e) {
          Swal.fire('Error', 'Problema al conectar con el servidor.', 'error');
          setLoading(false);
      }
  };

  const deleteTrailer = async (caja_id) => {
      const { isConfirmed } = await Swal.fire({ title: '¿Eliminar Caja?', icon: 'error', showCancelButton: true });
      if (!isConfirmed) return;
      const fd = new FormData();
      fd.append('op', 'deleteTrailer');
      fd.append('caja_id', caja_id);
      await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
      fetchData();
  };

  const renderDocIcon = (req, val) => {
      if (req.tipo === 'text') {
          return val?.valor_texto ? <Typography variant="body2" fontWeight={600} color="primary" noWrap>{val.valor_texto}</Typography> : <Typography variant="body2" color="text.disabled">-</Typography>;
      }

      if (!val || (!val.url_pdf && !val.valor_texto)) {
          return <Tooltip title="Faltante"><HelpOutlineIcon sx={{ color: '#cbd5e1' }} /></Tooltip>;
      }

      if (req.tiene_vencimiento == 1 && val.fecha_vencimiento) {
          const diff = Math.floor((new Date(val.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24));
          if (diff < 0) return <Tooltip title={`Vencido: ${val.fecha_vencimiento}`}><ErrorIcon color="error" /></Tooltip>;
          if (diff <= 30) return <Tooltip title={`Vence pronto: ${val.fecha_vencimiento}`}><WarningIcon color="warning" /></Tooltip>;
      }
      
      return (
          <Tooltip title={val.fecha_vencimiento ? `Vigente hasta ${val.fecha_vencimiento}` : 'Archivo adjunto'}>
              <a href={`${apiHost}/${val.url_pdf}`} target="_blank" rel="noreferrer" style={{color: 'inherit'}}>
                  <CheckCircleIcon color="success" sx={{ '&:hover': { opacity: 0.7 } }} />
              </a>
          </Tooltip>
      );
  };

  const filteredCajas = useMemo(() => {
    return cajas.filter(c => {
        const matchCaja = !searchCaja || String(c.no_caja || '').toLowerCase().includes(searchCaja.toLowerCase());
        const matchPlaca = !searchPlaca || String(c.no_placa || '').toLowerCase().includes(searchPlaca.toLowerCase());
        return matchCaja && matchPlaca;
    });
  }, [cajas, searchCaja, searchPlaca]);

  const categories = [...new Set(configFields.map(f => f.categoria))];
  const visibleConfigFields = configFields.filter(req => !hiddenColumns.includes(req.key_name));

  if (loading && cajas.length === 0) return <Box p={5} display="flex" justifyContent="center"><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
      
      <style>{`.swal2-container { z-index: 2000 !important; }`}</style>

      {/* HEADER PRINCIPAL */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={4} spacing={2}>
        <Box>
            <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em">
                Administrador de Cajas
            </Typography>
            <Typography variant="subtitle1" color="#64748b">
                Gestión centralizada de remolques y cumplimiento documental.
            </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
            <Button variant="outlined" color="inherit" startIcon={<ViewColumnIcon />} onClick={() => setOpenColumnModal(true)} sx={{ bgcolor: 'white' }}>
                Columnas
            </Button>
            <Button variant="outlined" color="inherit" startIcon={<SettingsIcon />} onClick={() => setOpenConfigModal(true)} sx={{ bgcolor: 'white' }}>
                Requisitos
            </Button>
            <Button variant="contained" disableElevation startIcon={<AddIcon />} onClick={() => openTrailerEditor(null)} sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#334155' } }}>
                Alta Caja
            </Button>
        </Stack>
      </Stack>

      {/* FILTROS BÚSQUEDA */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <Stack direction="row" spacing={2}>
              <TextField label="Buscar por No. Caja" size="small" variant="outlined" value={searchCaja} onChange={(e) => { setSearchCaja(e.target.value); setPage(0); }} sx={{ width: 250 }} />
              <TextField label="Buscar por Placa" size="small" variant="outlined" value={searchPlaca} onChange={(e) => { setSearchPlaca(e.target.value); setPage(0); }} sx={{ width: 250 }} />
          </Stack>
      </Paper>

      {/* TABLA DINÁMICA */}
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}> 
            <Table size="small">
            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', minWidth: 80 }}>No. Caja</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', minWidth: 100 }}>Placa</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', minWidth: 100 }}>Estado</TableCell>
                
                {visibleConfigFields.map(req => (
                    <TableCell key={req.key_name} align="center" sx={{ fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>
                        <Tooltip title={req.label}>
                            <span>{req.label.length > 12 ? req.label.substring(0, 12) + '...' : req.label}</span>
                        </Tooltip>
                    </TableCell>
                ))}
                
                <TableCell align="center" sx={{ fontWeight: 700, color: '#475569', minWidth: 100 }}>Acciones</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {filteredCajas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(caja => (
                <TableRow key={caja.caja_id} hover>
                    <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>{caja.no_caja}</TableCell>
                    <TableCell>{caja.no_placa || '-'}</TableCell>
                    <TableCell>{caja.estado_placa || '-'}</TableCell>
                    
                    {visibleConfigFields.map(req => (
                        <TableCell key={req.key_name} align="center" sx={{ maxWidth: 100 }}>
                            {renderDocIcon(req, caja.docs?.[req.key_name])}
                        </TableCell>
                    ))}

                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton size="small" color="primary" onClick={() => openTrailerEditor(caja)}><EditOutlinedIcon /></IconButton>
                        <IconButton size="small" color="error" onClick={() => deleteTrailer(caja.caja_id)}><DeleteOutlineIcon /></IconButton>
                    </TableCell>
                </TableRow>
                ))}
                {filteredCajas.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={visibleConfigFields.length + 4} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">No se encontraron cajas registradas.</Typography>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </TableContainer>
        
        <TablePagination
            component="div" count={filteredCajas.length} page={page} onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[10, 25, 50]}
            labelRowsPerPage="Cajas por página:" labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* ========================================================= */}
      {/* MODAL 1: MOSTRAR/OCULTAR COLUMNAS                           */}
      {/* ========================================================= */}
      <Dialog open={openColumnModal} onClose={() => setOpenColumnModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Mostrar Columnas
            <IconButton onClick={() => setOpenColumnModal(false)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Toca las etiquetas para encender o apagar las columnas en tu tabla de cajas.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                {configFields.map(req => {
                    const isVisible = !hiddenColumns.includes(req.key_name);
                    return (
                        <Chip 
                            key={req.key_name} label={req.label} onClick={() => toggleColumnVisibility(req.key_name)}
                            color={isVisible ? "primary" : "default"} variant={isVisible ? "filled" : "outlined"}
                            icon={isVisible ? <CheckCircleIcon /> : undefined}
                            sx={{ fontWeight: 600, fontSize: '0.85rem', py: 1, transition: 'all 0.2s', '&:hover': { transform: 'scale(1.05)' } }}
                        />
                    );
                })}
            </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <Button onClick={() => setOpenColumnModal(false)} variant="contained" disableElevation sx={{ bgcolor: '#0f172a' }}>Aplicar</Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL 2: CONFIGURAR REQUISITOS                              */}
      {/* ========================================================= */}
      <Dialog open={openConfigModal} onClose={() => setOpenConfigModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Configurar Requisitos de Caja
            <IconButton onClick={() => setOpenConfigModal(false)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
                <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle2" fontWeight={700} mb={1}>Requisitos Activos:</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                        {configFields.map(f => (
                            <Chip key={f.key_name} label={f.label} onDelete={() => handleDeleteField(f.key_name, f.label)} size="small" color="primary" variant="outlined" />
                        ))}
                    </Stack>
                </Box>
                <Divider />
                <Typography variant="subtitle2" fontWeight={700}>Crear Nuevo Requisito</Typography>
                <TextField label="Nombre del Requisito" fullWidth size="small" value={newField.label} onChange={(e) => setNewField({...newField, label: e.target.value})} placeholder="Ej. Certificado Sanitario" />
                <Grid container spacing={2}>
                    <Grid item xs={6}><TextField select label="Categoría" size="small" fullWidth value={newField.categoria} onChange={(e) => setNewField({...newField, categoria: e.target.value})}><MenuItem value="USA">USA</MenuItem><MenuItem value="MEX">MEX</MenuItem><MenuItem value="Otros">Otros</MenuItem></TextField></Grid>
                    <Grid item xs={6}><TextField select label="Tipo de Dato" size="small" fullWidth value={newField.tipo} onChange={(e) => setNewField({...newField, tipo: e.target.value})}><MenuItem value="file">Subir Archivo</MenuItem><MenuItem value="text">Texto Libre</MenuItem></TextField></Grid>
                </Grid>
                {newField.tipo === 'file' && (
                    <FormControlLabel control={<Switch checked={newField.tiene_vencimiento} onChange={(e) => setNewField({...newField, tiene_vencimiento: e.target.checked})} />} label="Requiere Vencimiento" />
                )}
                <Button variant="contained" onClick={handleCreateField} disableElevation>Agregar al Expediente</Button>
            </Stack>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL 3: MASTER FORM (ALTA Y EDICIÓN DE CAJA)               */}
      {/* ========================================================= */}
      <Dialog open={openTrailerModal} onClose={() => setOpenTrailerModal(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3, height: '90vh' } }}>
        <DialogTitle sx={{ bgcolor: '#0f172a', color: 'white', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {trailerData.caja_id ? `Editando Caja: ${trailerData.no_caja}` : 'Alta de Nueva Caja'}
            <IconButton onClick={() => setOpenTrailerModal(false)} size="small" sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
            <Box sx={{ p: 3 }}>
                <Grid container spacing={4}>
                    
                    {/* COLUMNA 1: INFO BASE */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>1. Datos del Remolque</Typography>
                        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                            <Stack spacing={2.5}>
                                <TextField label="Número de Caja" fullWidth size="small" value={trailerData.no_caja || ''} onChange={e => setTrailerData({...trailerData, no_caja: e.target.value})} />
                                <TextField label="No. Placa" fullWidth size="small" value={trailerData.no_placa || ''} onChange={e => setTrailerData({...trailerData, no_placa: e.target.value})} />
                                <TextField label="Estado Placa" fullWidth size="small" value={trailerData.estado_placa || ''} onChange={e => setTrailerData({...trailerData, estado_placa: e.target.value})} />
                                <TextField label="Número VIN" fullWidth size="small" value={trailerData.no_vin || ''} onChange={e => setTrailerData({...trailerData, no_vin: e.target.value})} />
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* COLUMNA 2 Y 3: REQUISITOS DINÁMICOS POR CATEGORÍA */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>2. Expediente Documental</Typography>
                        <Grid container spacing={2}>
                            {categories.map(cat => (
                                <Grid item xs={12} sm={6} key={cat}>
                                    <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, height: '100%' }}>
                                        <Typography variant="subtitle2" fontWeight={800} color="#475569" gutterBottom sx={{ borderBottom: `2px solid ${cat==='USA'?'#1976d2':(cat==='MEX'?'#388e3c':'#f59e0b')}`, pb: 1 }}>{cat.toUpperCase()}</Typography>
                                        <Stack spacing={2} mt={2}>
                                            {configFields.filter(f => f.categoria === cat).map(req => {
                                                const k = req.key_name;
                                                const currentDoc = trailerData.docs?.[k] || {};

                                                return (
                                                    <Box key={k} sx={{ p: 1.5, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                                                        <Typography variant="caption" fontWeight={700} color="primary.dark">{req.label}</Typography>
                                                        {req.tipo === 'text' ? (
                                                            <TextField size="small" fullWidth placeholder="Ingresar valor" value={currentDoc.valor_texto || ''} 
                                                                onChange={e => setTrailerData({ ...trailerData, docs: { ...trailerData.docs, [k]: { ...currentDoc, valor_texto: e.target.value } } })} 
                                                                sx={{ mt: 1, bgcolor: 'white' }} 
                                                            />
                                                        ) : (
                                                            <Stack spacing={1} mt={1}>
                                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                                    <Button variant="outlined" component="label" size="small" startIcon={<CloudUploadOutlinedIcon />} sx={{ bgcolor: 'white' }}>
                                                                        Subir {trailerDocs[k] ? '(1)' : ''}
                                                                        <input type="file" hidden onChange={e => setTrailerDocs({...trailerDocs, [k]: e.target.files[0]})} />
                                                                    </Button>
                                                                    {currentDoc.url_pdf && (
                                                                        <Tooltip title="Ver Archivo">
                                                                            <IconButton size="small" color="info" component="a" href={`${apiHost}/${currentDoc.url_pdf}`} target="_blank"><FilePresentIcon /></IconButton>
                                                                        </Tooltip>
                                                                    )}
                                                                </Stack>
                                                                {req.tiene_vencimiento == 1 && (
                                                                    <TextField type="date" size="small" fullWidth label="Vence" InputLabelProps={{ shrink: true }}
                                                                        value={currentDoc.fecha_vencimiento || ''} 
                                                                        onChange={e => setTrailerData({ ...trailerData, docs: { ...trailerData.docs, [k]: { ...currentDoc, fecha_vencimiento: e.target.value } } })} 
                                                                        sx={{ bgcolor: 'white' }} 
                                                                    />
                                                                )}
                                                            </Stack>
                                                        )}
                                                    </Box>
                                                )
                                            })}
                                        </Stack>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </Grid>
                </Grid>
            </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
            <Button onClick={() => setOpenTrailerModal(false)} sx={{ fontWeight: 600, color: '#64748b' }}>Cancelar</Button>
            <Button variant="contained" disableElevation onClick={handleSaveTrailer} disabled={loading} sx={{ px: 4, py: 1, borderRadius: 2, bgcolor: '#0f172a' }}>Guardar Caja</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TrailerAdmin;