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
// 🚨 Apuntamos al futuro backend que crearemos después
const API_ENDPOINT = 'trucks_v2.php';

const TruckAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [trucks, setTrucks] = useState([]);
  const [configFields, setConfigFields] = useState([]);
  
  // Búsquedas
  const [searchUnidad, setSearchUnidad] = useState('');
  const [searchPlaca, setSearchPlaca] = useState('');

  // Estados de Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modales
  const [openConfigModal, setOpenConfigModal] = useState(false);
  const [openTruckModal, setOpenTruckModal] = useState(false);
  const [openColumnModal, setOpenColumnModal] = useState(false); 
  
  // Estado para ocultar/mostrar columnas en la tabla
  const [hiddenColumns, setHiddenColumns] = useState([]); 

  // Estados para nuevo requisito
  const [newField, setNewField] = useState({ label: '', categoria: 'USA', tipo: 'file', tiene_vencimiento: true });
  
  // Estados para el Camión (Master Form)
  const [truckData, setTruckData] = useState({});
  const [truckDocs, setTruckDocs] = useState({});
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const fd = new FormData();
        fd.append('op', 'getInitData');
        const res = await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
        const data = await res.json();
        if (data.status === 'success') {
            setConfigFields(data.requisitos || []);
            setTrucks(data.trucks || []);
        }
    } catch (error) { 
        console.warn('Esperando backend trucks_v2.php...', error); 
        // Mock data temporal solo para que veas la UI mientras hacemos el backend
        setConfigFields([]);
        setTrucks([]);
    }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ===============================================
  // HANDLERS: PAGINACIÓN
  // ===============================================
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // ===============================================
  // HANDLERS: VISIBILIDAD DE COLUMNAS
  // ===============================================
  const toggleColumnVisibility = (key_name) => {
      setHiddenColumns(prev => 
          prev.includes(key_name) ? prev.filter(k => k !== key_name) : [...prev, key_name]
      );
  };

  // ===============================================
  // HANDLERS: CONFIGURACIÓN DINÁMICA DE CAMPOS
  // ===============================================
  const handleCreateField = async () => {
      if (!newField.label) return Swal.fire('Oops', 'Asigna un nombre al requisito', 'warning');
      const fd = new FormData();
      fd.append('op', 'addConfig');
      Object.keys(newField).forEach(k => fd.append(k, k === 'tiene_vencimiento' ? (newField[k] ? 1 : 0) : newField[k]));
      
      try {
          await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
          setOpenConfigModal(false);
          setNewField({ label: '', categoria: 'USA', tipo: 'file', tiene_vencimiento: true });
          fetchData();
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Requisito Creado', showConfirmButton: false, timer: 2000 });
      } catch (e) {
          Swal.fire('Atención', 'Conecta el backend para guardar la configuración.', 'info');
      }
  };

  const handleDeleteField = async (key_name, label) => {
      const { isConfirmed } = await Swal.fire({ 
          title: `¿Eliminar "${label}"?`, 
          text: 'El campo se eliminará de la tabla y formularios. Los datos históricos se conservan seguros en BD.', 
          icon: 'warning', 
          showCancelButton: true, confirmButtonText: 'Sí, eliminar', confirmButtonColor: '#d33'
      });
      if (!isConfirmed) return;
      const fd = new FormData();
      fd.append('op', 'deleteConfig');
      fd.append('key_name', key_name);
      await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
      fetchData();
  };

  // ===============================================
  // HANDLERS: CAMIONES (TRUCKS)
  // ===============================================
  const openTruckEditor = (truck = null) => {
      if (truck) {
          setTruckData({ ...truck });
          setTruckDocs({});
      } else {
          setTruckData({ unidad: '', placa_mex: '', placa_eua: '', modelo: '', marca: '', numero_vin: '', tag: '', docs: {} });
          setTruckDocs({});
      }
      setOpenTruckModal(true);
  };

  const handleSaveTruck = async () => {
      if (!truckData.unidad) return Swal.fire('Falta Unidad', 'El número de unidad es obligatorio.', 'warning');
      setLoading(true);

      const fd = new FormData();
      fd.append('op', 'saveTruck');
      
      ['truck_id', 'unidad', 'placa_mex', 'placa_eua', 'modelo', 'marca', 'numero_vin', 'tag'].forEach(k => {
          if (truckData[k]) fd.append(k, truckData[k]);
      });

      configFields.forEach(req => {
          const k = req.key_name;
          const val = truckData.docs?.[k]; 
          if (req.tipo === 'text' && val?.valor_texto !== undefined) fd.append(`text_${k}`, val.valor_texto);
          if (req.tipo === 'file') {
              if (val?.fecha_vencimiento) fd.append(`date_${k}`, val.fecha_vencimiento.split('T')[0]);
              if (truckDocs[k]) fd.append(`file_${k}`, truckDocs[k]); 
          }
      });

      try {
          await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
          setOpenTruckModal(false);
          fetchData();
          Swal.fire('Guardado', 'Camión y documentos actualizados.', 'success');
      } catch(e) {
          Swal.fire('Atención', 'Conecta el backend para guardar el camión.', 'info');
          setLoading(false);
      }
  };

  const deleteTruck = async (truck_id) => {
      const { isConfirmed } = await Swal.fire({ title: '¿Eliminar Camión?', icon: 'error', showCancelButton: true });
      if (!isConfirmed) return;
      const fd = new FormData();
      fd.append('op', 'deleteTruck');
      fd.append('truck_id', truck_id);
      await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
      fetchData();
  };

  // ===============================================
  // RENDERIZADO DE ICONOS (UX SEMAFORO)
  // ===============================================
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

  // Filtrado por buscador múltiple
  const filteredTrucks = useMemo(() => {
    return trucks.filter(t => {
        const matchUnidad = !searchUnidad || String(t.unidad || '').toLowerCase().includes(searchUnidad.toLowerCase());
        const matchPlaca = !searchPlaca || 
            String(t.placa_mex || '').toLowerCase().includes(searchPlaca.toLowerCase()) || 
            String(t.placa_eua || '').toLowerCase().includes(searchPlaca.toLowerCase());
        return matchUnidad && matchPlaca;
    });
  }, [trucks, searchUnidad, searchPlaca]);

  const categories = [...new Set(configFields.map(f => f.categoria))];
  const visibleConfigFields = configFields.filter(req => !hiddenColumns.includes(req.key_name));

  if (loading && trucks.length === 0) return <Box p={5} display="flex" justifyContent="center"><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
      
      <style>{`.swal2-container { z-index: 2000 !important; }`}</style>

      {/* HEADER PRINCIPAL */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={4} spacing={2}>
        <Box>
            <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em">
                Administrador de Camiones
            </Typography>
            <Typography variant="subtitle1" color="#64748b">
                Gestión centralizada de unidades, permisos y registros (USA/MEX).
            </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
            <Button variant="outlined" color="inherit" startIcon={<ViewColumnIcon />} onClick={() => setOpenColumnModal(true)} sx={{ bgcolor: 'white' }}>
                Columnas
            </Button>
            <Button variant="outlined" color="inherit" startIcon={<SettingsIcon />} onClick={() => setOpenConfigModal(true)} sx={{ bgcolor: 'white' }}>
                Requisitos
            </Button>
            <Button variant="contained" disableElevation startIcon={<AddIcon />} onClick={() => openTruckEditor(null)} sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#334155' } }}>
                Alta Camión
            </Button>
        </Stack>
      </Stack>

      {/* FILTROS BÚSQUEDA */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <Stack direction="row" spacing={2}>
              <TextField label="Buscar por Unidad" size="small" variant="outlined" value={searchUnidad} onChange={(e) => { setSearchUnidad(e.target.value); setPage(0); }} sx={{ width: 250 }} />
              <TextField label="Buscar por Placa (MX/USA)" size="small" variant="outlined" value={searchPlaca} onChange={(e) => { setSearchPlaca(e.target.value); setPage(0); }} sx={{ width: 250 }} />
          </Stack>
      </Paper>

      {/* TABLA DINÁMICA */}
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}> 
            <Table size="small">
            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569', minWidth: 80 }}>Unidad</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', minWidth: 100 }}>Placa MEX</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', minWidth: 100 }}>Placa USA</TableCell>
                
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
                {filteredTrucks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(truck => (
                <TableRow key={truck.truck_id} hover>
                    <TableCell sx={{ fontWeight: 800, color: '#0f172a' }}>{truck.unidad}</TableCell>
                    <TableCell>{truck.placa_mex || '-'}</TableCell>
                    <TableCell>{truck.placa_eua || '-'}</TableCell>
                    
                    {visibleConfigFields.map(req => (
                        <TableCell key={req.key_name} align="center" sx={{ maxWidth: 100 }}>
                            {renderDocIcon(req, truck.docs?.[req.key_name])}
                        </TableCell>
                    ))}

                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton size="small" color="primary" onClick={() => openTruckEditor(truck)}><EditOutlinedIcon /></IconButton>
                        <IconButton size="small" color="error" onClick={() => deleteTruck(truck.truck_id)}><DeleteOutlineIcon /></IconButton>
                    </TableCell>
                </TableRow>
                ))}
                {filteredTrucks.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={visibleConfigFields.length + 4} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">No se encontraron camiones. ¡Agrega un requisito y registra un camión!</Typography>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </TableContainer>
        
        <TablePagination
            component="div" count={filteredTrucks.length} page={page} onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage} onRowsPerPageChange={handleChangeRowsPerPage} rowsPerPageOptions={[10, 25, 50]}
            labelRowsPerPage="Camiones por página:" labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* ========================================================= */}
      {/* MODAL 1: MOSTRAR/OCULTAR COLUMNAS (CHIPS)                   */}
      {/* ========================================================= */}
      <Dialog open={openColumnModal} onClose={() => setOpenColumnModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Mostrar Columnas
            <IconButton onClick={() => setOpenColumnModal(false)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Toca las etiquetas para encender o apagar las columnas en tu tabla de camiones.
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
      {/* MODAL 2: CONFIGURAR REQUISITOS (MODELO BD)                  */}
      {/* ========================================================= */}
      <Dialog open={openConfigModal} onClose={() => setOpenConfigModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            Configurar Requisitos de Camión
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
                <TextField label="Nombre del Requisito" fullWidth size="small" value={newField.label} onChange={(e) => setNewField({...newField, label: e.target.value})} placeholder="Ej. Tarjeta de Circulación" />
                <Grid container spacing={2}>
                    <Grid item xs={6}><TextField select label="Categoría (Región)" size="small" fullWidth value={newField.categoria} onChange={(e) => setNewField({...newField, categoria: e.target.value})}><MenuItem value="USA">USA</MenuItem><MenuItem value="MEX">MEX</MenuItem><MenuItem value="Otros">Otros</MenuItem></TextField></Grid>
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
      {/* MODAL 3: MASTER FORM (ALTA Y EDICIÓN DE CAMIÓN)             */}
      {/* ========================================================= */}
      <Dialog open={openTruckModal} onClose={() => setOpenTruckModal(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3, height: '90vh' } }}>
        <DialogTitle sx={{ bgcolor: '#0f172a', color: 'white', fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {truckData.truck_id ? `Editando Camión: ${truckData.unidad}` : 'Alta de Nuevo Camión'}
            <IconButton onClick={() => setOpenTruckModal(false)} size="small" sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
            <Box sx={{ p: 3 }}>
                <Grid container spacing={4}>
                    
                    {/* COLUMNA 1: INFO BASE */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>1. Datos del Vehículo</Typography>
                        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                            <Stack spacing={2.5}>
                                <TextField label="Número de Unidad" fullWidth size="small" value={truckData.unidad || ''} onChange={e => setTruckData({...truckData, unidad: e.target.value})} />
                                <TextField label="Placa MEX" fullWidth size="small" value={truckData.placa_mex || ''} onChange={e => setTruckData({...truckData, placa_mex: e.target.value})} />
                                <TextField label="Placa USA" fullWidth size="small" value={truckData.placa_eua || ''} onChange={e => setTruckData({...truckData, placa_eua: e.target.value})} />
                                <TextField label="Modelo (Año)" fullWidth size="small" value={truckData.modelo || ''} onChange={e => setTruckData({...truckData, modelo: e.target.value})} />
                                <TextField label="Marca del Camión" fullWidth size="small" value={truckData.marca || ''} onChange={e => setTruckData({...truckData, marca: e.target.value})} />
                                <TextField label="Número VIN" fullWidth size="small" value={truckData.numero_vin || ''} onChange={e => setTruckData({...truckData, numero_vin: e.target.value})} />
                                <TextField label="Laredo TAG" fullWidth size="small" value={truckData.tag || ''} onChange={e => setTruckData({...truckData, tag: e.target.value})} />
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* COLUMNA 2 Y 3: REQUISITOS DINÁMICOS POR CATEGORÍA (USA/MEX) */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>2. Expediente Dinámico</Typography>
                        <Grid container spacing={2}>
                            {categories.map(cat => (
                                <Grid item xs={12} sm={6} key={cat}>
                                    <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, height: '100%' }}>
                                        <Typography variant="subtitle2" fontWeight={800} color="#475569" gutterBottom sx={{ borderBottom: `2px solid ${cat==='USA'?'#1976d2':(cat==='MEX'?'#388e3c':'#f59e0b')}`, pb: 1 }}>{cat.toUpperCase()}</Typography>
                                        <Stack spacing={2} mt={2}>
                                            {configFields.filter(f => f.categoria === cat).map(req => {
                                                const k = req.key_name;
                                                const currentDoc = truckData.docs?.[k] || {};

                                                return (
                                                    <Box key={k} sx={{ p: 1.5, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                                                        <Typography variant="caption" fontWeight={700} color="primary.dark">{req.label}</Typography>
                                                        {req.tipo === 'text' ? (
                                                            <TextField size="small" fullWidth placeholder="Ingresar valor" value={currentDoc.valor_texto || ''} 
                                                                onChange={e => setTruckData({ ...truckData, docs: { ...truckData.docs, [k]: { ...currentDoc, valor_texto: e.target.value } } })} 
                                                                sx={{ mt: 1, bgcolor: 'white' }} 
                                                            />
                                                        ) : (
                                                            <Stack spacing={1} mt={1}>
                                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                                    <Button variant="outlined" component="label" size="small" startIcon={<CloudUploadOutlinedIcon />} sx={{ bgcolor: 'white' }}>
                                                                        Subir {truckDocs[k] ? '(1)' : ''}
                                                                        <input type="file" hidden onChange={e => setTruckDocs({...truckDocs, [k]: e.target.files[0]})} />
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
                                                                        onChange={e => setTruckData({ ...truckData, docs: { ...truckData.docs, [k]: { ...currentDoc, fecha_vencimiento: e.target.value } } })} 
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
            <Button onClick={() => setOpenTruckModal(false)} sx={{ fontWeight: 600, color: '#64748b' }}>Cancelar</Button>
            <Button variant="contained" disableElevation onClick={handleSaveTruck} disabled={loading} sx={{ px: 4, py: 1, borderRadius: 2, bgcolor: '#0f172a' }}>Guardar Camión</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TruckAdmin;