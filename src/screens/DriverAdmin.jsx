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
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import FilePresentIcon from '@mui/icons-material/FilePresent';

import Swal from 'sweetalert2';

const apiHost = import.meta.env.VITE_API_HOST;
const API_ENDPOINT = 'drivers_v2.php';

const DriverAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [configFields, setConfigFields] = useState([]);
  const [search, setSearch] = useState('');

  // Estados de Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modales
  const [openConfigModal, setOpenConfigModal] = useState(false);
  const [openDriverModal, setOpenDriverModal] = useState(false);
  
  // Estados para nuevo campo
  const [newField, setNewField] = useState({ label: '', categoria: 'Viaje', tipo: 'file', tiene_vencimiento: true });
  
  // Estados para chofer
  const [driverData, setDriverData] = useState({});
  const [driverDocs, setDriverDocs] = useState({});
  
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const fd = new FormData();
        fd.append('op', 'getInitData');
        const res = await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
        const data = await res.json();
        if (data.status === 'success') {
            setConfigFields(data.requisitos);
            setDrivers(data.drivers);
        }
    } catch (error) { console.error('Error fetching data:', error); }
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
  // HANDLERS: CONFIGURACIÓN DINÁMICA DE CAMPOS
  // ===============================================
  const handleCreateField = async () => {
      if (!newField.label) return Swal.fire('Oops', 'Asigna un nombre al requisito', 'warning');
      const fd = new FormData();
      fd.append('op', 'addConfig');
      Object.keys(newField).forEach(k => fd.append(k, k === 'tiene_vencimiento' ? (newField[k] ? 1 : 0) : newField[k]));
      
      await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
      setOpenConfigModal(false);
      setNewField({ label: '', categoria: 'Viaje', tipo: 'file', tiene_vencimiento: true });
      fetchData();
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Requisito Creado', showConfirmButton: false, timer: 2000 });
  };

  const handleDeleteField = async (key_name, label) => {
      const { isConfirmed } = await Swal.fire({ 
          title: `¿Eliminar "${label}"?`, 
          text: 'El campo se eliminará de la tabla y de los formularios de captura. Los datos guardados históricamente se conservarán por seguridad.', 
          icon: 'warning', 
          showCancelButton: true,
          confirmButtonText: 'Sí, eliminar',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#d33'
      });
      if (!isConfirmed) return;
      const fd = new FormData();
      fd.append('op', 'deleteConfig');
      fd.append('key_name', key_name);
      await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
      fetchData();
  };

  // ===============================================
  // HANDLERS: CHOFERES
  // ===============================================
  const openDriverEditor = (driver = null) => {
      if (driver) {
          setDriverData({ ...driver });
          setDriverDocs({});
      } else {
          setDriverData({ nombre: '', curp: '', rfc: '', phone_mex: '', phone_usa: '', fecha_nacimiento: '', fecha_ingreso: '', docs: {} });
          setDriverDocs({});
      }
      setOpenDriverModal(true);
  };

  const handleSaveDriver = async () => {
      if (!driverData.nombre) return Swal.fire('Falta Nombre', 'El nombre es obligatorio.', 'warning');
      setLoading(true);

      const fd = new FormData();
      fd.append('op', 'saveDriver');
      
      ['driver_id', 'nombre', 'fecha_nacimiento', 'fecha_ingreso', 'curp', 'rfc', 'phone_mex', 'phone_usa'].forEach(k => {
          if (driverData[k]) fd.append(k, driverData[k]);
      });

      configFields.forEach(req => {
          const k = req.key_name;
          const val = driverData.docs?.[k]; 
          
          if (req.tipo === 'text' && val?.valor_texto !== undefined) {
              fd.append(`text_${k}`, val.valor_texto);
          }
          if (req.tipo === 'file') {
              if (val?.fecha_vencimiento) fd.append(`date_${k}`, val.fecha_vencimiento.split('T')[0]);
              if (driverDocs[k]) fd.append(`file_${k}`, driverDocs[k]); 
          }
      });

      try {
          await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
          setOpenDriverModal(false);
          fetchData();
          Swal.fire('Guardado', 'Conductor y documentos actualizados.', 'success');
      } catch(e) {
          Swal.fire('Error', 'Problema al guardar.', 'error');
          setLoading(false);
      }
  };

  const deleteDriver = async (driver_id) => {
      const { isConfirmed } = await Swal.fire({ title: '¿Eliminar Conductor?', icon: 'error', showCancelButton: true });
      if (!isConfirmed) return;
      const fd = new FormData();
      fd.append('op', 'deleteDriver');
      fd.append('driver_id', driver_id);
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

  // Filtrado por buscador
  const filteredDrivers = useMemo(() => {
    return drivers.filter(d => d.nombre.toLowerCase().includes(search.toLowerCase()));
  }, [drivers, search]);

  const categories = [...new Set(configFields.map(f => f.categoria))];

  if (loading && drivers.length === 0) return <Box p={5} display="flex" justifyContent="center"><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
      
      {/* 🚨 INYECCIÓN DE CSS PARA ARREGLAR Z-INDEX DE SWEETALERT 🚨 */}
      <style>{`
        .swal2-container {
          z-index: 2000 !important;
        }
      `}</style>

      {/* HEADER */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={4} spacing={2}>
        <Box>
            <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em">
                Gestión de Conductores
            </Typography>
            <Typography variant="subtitle1" color="#64748b">
                Administración centralizada de perfiles y requisitos.
            </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
            <Button variant="outlined" color="inherit" startIcon={<SettingsIcon />} onClick={() => setOpenConfigModal(true)} sx={{ bgcolor: 'white' }}>
                Configurar Columnas
            </Button>
            <Button variant="contained" disableElevation startIcon={<AddIcon />} onClick={() => openDriverEditor(null)} sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#334155' } }}>
                Alta Conductor
            </Button>
        </Stack>
      </Stack>

      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <TextField label="Buscar por nombre..." size="small" variant="outlined" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} sx={{ width: 300 }} />
      </Paper>

      {/* TABLA DINÁMICA CON PAGINACIÓN */}
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}> 
            <Table size="small">
            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', minWidth: 150 }}>Nombre</TableCell>
                
                {/* 🚨 AHORA MAPEA TODAS LAS COLUMNAS DINÁMICAS (Sin filtro de categoría) 🚨 */}
                {configFields.map(req => (
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
                {filteredDrivers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(driver => (
                <TableRow key={driver.driver_id} hover>
                    <TableCell>{driver.driver_id}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: '#0f172a' }}>{driver.nombre}</TableCell>
                    
                    {configFields.map(req => (
                        <TableCell key={req.key_name} align="center" sx={{ maxWidth: 100 }}>
                            {renderDocIcon(req, driver.docs?.[req.key_name])}
                        </TableCell>
                    ))}

                    <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                        <IconButton size="small" color="primary" onClick={() => openDriverEditor(driver)}><EditOutlinedIcon /></IconButton>
                        <IconButton size="small" color="error" onClick={() => deleteDriver(driver.driver_id)}><DeleteOutlineIcon /></IconButton>
                    </TableCell>
                </TableRow>
                ))}
                {filteredDrivers.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={configFields.length + 3} align="center" sx={{ py: 3 }}>
                            <Typography color="text.secondary">No se encontraron conductores.</Typography>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </TableContainer>
        
        {/* Paginador de Material UI */}
        <TablePagination
            component="div"
            count={filteredDrivers.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50]}
            labelRowsPerPage="Conductores por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* ========================================================= */}
      {/* MODAL: CONFIGURAR COLUMNAS / REQUISITOS                   */}
      {/* ========================================================= */}
      <Dialog open={openConfigModal} onClose={() => setOpenConfigModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Configurar Requisitos</DialogTitle>
        <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
                <Box sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2, border: '1px solid #e2e8f0' }}>
                    <Typography variant="subtitle2" fontWeight={700} mb={1}>Columnas Activas:</Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                        {configFields.map(f => (
                            <Chip key={f.key_name} label={f.label} onDelete={() => handleDeleteField(f.key_name, f.label)} size="small" color="primary" variant="outlined" />
                        ))}
                    </Stack>
                </Box>
                <Divider />
                <Typography variant="subtitle2" fontWeight={700}>Crear Nuevo Requisito</Typography>
                <TextField label="Nombre del Requisito" fullWidth size="small" value={newField.label} onChange={(e) => setNewField({...newField, label: e.target.value})} />
                <Grid container spacing={2}>
                    <Grid item xs={6}><TextField select label="Categoría" size="small" fullWidth value={newField.categoria} onChange={(e) => setNewField({...newField, categoria: e.target.value})}><MenuItem value="Personales">Personales</MenuItem><MenuItem value="Viaje">Viaje</MenuItem><MenuItem value="Otros">Otros</MenuItem></TextField></Grid>
                    <Grid item xs={6}><TextField select label="Tipo" size="small" fullWidth value={newField.tipo} onChange={(e) => setNewField({...newField, tipo: e.target.value})}><MenuItem value="file">Subir Archivo</MenuItem><MenuItem value="text">Input Texto Libre</MenuItem></TextField></Grid>
                </Grid>
                {newField.tipo === 'file' && (
                    <FormControlLabel control={<Switch checked={newField.tiene_vencimiento} onChange={(e) => setNewField({...newField, tiene_vencimiento: e.target.checked})} />} label="Requiere Vencimiento" />
                )}
                <Button variant="contained" onClick={handleCreateField} disableElevation>Crear Requisito</Button>
            </Stack>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL: ALTA Y EDICIÓN DE CONDUCTOR (MASTER FORM)          */}
      {/* ========================================================= */}
      <Dialog open={openDriverModal} onClose={() => setOpenDriverModal(false)} maxWidth="lg" fullWidth PaperProps={{ sx: { borderRadius: 3, height: '90vh' } }}>
        <DialogTitle sx={{ bgcolor: '#0f172a', color: 'white', fontWeight: 800 }}>
            {driverData.driver_id ? `Editando: ${driverData.nombre}` : 'Alta de Nuevo Conductor'}
        </DialogTitle>
        <DialogContent sx={{ p: 0, bgcolor: '#f8fafc' }}>
            <Box sx={{ p: 3 }}>
                <Grid container spacing={4}>
                    
                    {/* INFO BASE */}
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>1. Datos Base</Typography>
                        <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2 }}>
                            <Stack spacing={2}>
                                <TextField label="Nombre Completo" fullWidth size="small" value={driverData.nombre || ''} onChange={e => setDriverData({...driverData, nombre: e.target.value})} />
                                <TextField label="CURP" fullWidth size="small" value={driverData.curp || ''} onChange={e => setDriverData({...driverData, curp: e.target.value})} />
                                <TextField label="RFC" fullWidth size="small" value={driverData.rfc || ''} onChange={e => setDriverData({...driverData, rfc: e.target.value})} />
                                <TextField label="Teléfono USA" fullWidth size="small" value={driverData.phone_usa || ''} onChange={e => setDriverData({...driverData, phone_usa: e.target.value})} />
                                <TextField label="Teléfono MEX" fullWidth size="small" value={driverData.phone_mex || ''} onChange={e => setDriverData({...driverData, phone_mex: e.target.value})} />
                                
                                <Box>
                                    <Typography variant="caption" fontWeight={600}>Fecha Nacimiento</Typography>
                                    <TextField type="date" fullWidth size="small" value={driverData.fecha_nacimiento || ''} onChange={e => setDriverData({...driverData, fecha_nacimiento: e.target.value})} />
                                </Box>
                                <Box>
                                    <Typography variant="caption" fontWeight={600}>Fecha Ingreso</Typography>
                                    <TextField type="date" fullWidth size="small" value={driverData.fecha_ingreso || ''} onChange={e => setDriverData({...driverData, fecha_ingreso: e.target.value})} />
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* REQUISITOS DINÁMICOS POR CATEGORÍA */}
                    <Grid item xs={12} md={8}>
                        <Typography variant="h6" fontWeight={700} color="primary" gutterBottom>2. Requisitos Dinámicos</Typography>
                        <Grid container spacing={2}>
                            {categories.map(cat => (
                                <Grid item xs={12} sm={6} key={cat}>
                                    <Paper elevation={0} sx={{ p: 2, border: '1px solid #e2e8f0', borderRadius: 2, height: '100%' }}>
                                        <Typography variant="subtitle2" fontWeight={800} color="#475569" gutterBottom sx={{ borderBottom: '1px dashed #cbd5e1', pb: 1 }}>{cat.toUpperCase()}</Typography>
                                        <Stack spacing={2} mt={2}>
                                            {configFields.filter(f => f.categoria === cat).map(req => {
                                                const k = req.key_name;
                                                const currentDoc = driverData.docs?.[k] || {};

                                                return (
                                                    <Box key={k} sx={{ p: 1.5, bgcolor: '#f1f5f9', borderRadius: 2 }}>
                                                        <Typography variant="caption" fontWeight={700} color="primary.dark">{req.label}</Typography>
                                                        
                                                        {req.tipo === 'text' ? (
                                                            <TextField size="small" fullWidth placeholder="Ingresar valor" value={currentDoc.valor_texto || ''} 
                                                                onChange={e => setDriverData({ ...driverData, docs: { ...driverData.docs, [k]: { ...currentDoc, valor_texto: e.target.value } } })} 
                                                                sx={{ mt: 1, bgcolor: 'white' }} 
                                                            />
                                                        ) : (
                                                            <Stack spacing={1} mt={1}>
                                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                                    <Button variant="outlined" component="label" size="small" startIcon={<CloudUploadOutlinedIcon />} sx={{ bgcolor: 'white' }}>
                                                                        Subir {driverDocs[k] ? '(1)' : ''}
                                                                        <input type="file" hidden onChange={e => setDriverDocs({...driverDocs, [k]: e.target.files[0]})} />
                                                                    </Button>
                                                                    {currentDoc.url_pdf && (
                                                                        <Tooltip title="Ver Documento">
                                                                            <IconButton size="small" color="info" component="a" href={`${apiHost}/${currentDoc.url_pdf}`} target="_blank"><FilePresentIcon /></IconButton>
                                                                        </Tooltip>
                                                                    )}
                                                                </Stack>
                                                                {req.tiene_vencimiento == 1 && (
                                                                    <TextField type="date" size="small" fullWidth label="Vence" InputLabelProps={{ shrink: true }}
                                                                        value={currentDoc.fecha_vencimiento || ''} 
                                                                        onChange={e => setDriverData({ ...driverData, docs: { ...driverData.docs, [k]: { ...currentDoc, fecha_vencimiento: e.target.value } } })} 
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
            <Button onClick={() => setOpenDriverModal(false)} sx={{ fontWeight: 600, color: '#64748b' }}>Cancelar</Button>
            <Button variant="contained" disableElevation onClick={handleSaveDriver} disabled={loading} sx={{ px: 4, py: 1, borderRadius: 2 }}>Guardar Conductor</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DriverAdmin;