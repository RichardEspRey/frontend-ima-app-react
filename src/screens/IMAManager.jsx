import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Button, Grid, Paper, Stack, CircularProgress, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  MenuItem, FormControlLabel, Switch, IconButton, Chip, Tooltip,
  Divider, Fade, Zoom
} from '@mui/material'; 

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const apiHost = import.meta.env.VITE_API_HOST;

const ImaManager = () => {
  const [loading, setLoading] = useState(true);
  const [requisitos, setRequisitos] = useState([]);
  const [valores, setValores] = useState({});

  // Estados Modal de Configuración
  const [openConfigModal, setOpenConfigModal] = useState(false);
  const [newField, setNewField] = useState({ label: '', region: 'USA', tipo: 'file', tiene_vencimiento: true });

  // Estados Modal de Edición (Subir/Escribir)
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editData, setEditData] = useState({ valor_texto: '', fecha_vencimiento: null, file: null, currentUrl: null });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const fd = new FormData();
    fd.append('op', 'getAll');
    try {
      const res = await fetch(`${apiHost}/IMA_Docsv2.php`, { method: 'POST', body: fd });
      const data = await res.json();
      if (data.status === 'success') {
        setRequisitos(data.requisitos);
        setValores(data.valores);
      }
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }, [apiHost]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ==========================================
  // HANDLERS: CONFIGURACIÓN DINÁMICA
  // ==========================================
  const handleCreateNewField = async () => {
    if (!newField.label) return Swal.fire('Oops', 'Asigna un nombre al requisito', 'warning');
    const fd = new FormData();
    fd.append('op', 'addConfig');
    fd.append('label', newField.label);
    fd.append('region', newField.region);
    fd.append('tipo', newField.tipo);
    fd.append('tiene_vencimiento', newField.tiene_vencimiento ? 1 : 0);

    await fetch(`${apiHost}/IMA_Docsv2.php`, { method: 'POST', body: fd });
    setOpenConfigModal(false);
    setNewField({ label: '', region: 'USA', tipo: 'file', tiene_vencimiento: true });
    fetchData();
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Requisito Creado', showConfirmButton: false, timer: 2000 });
  };

  const handleDeleteField = async (key_name, label) => {
    const { isConfirmed } = await Swal.fire({ 
        title: `¿Eliminar "${label}"?`, 
        text: 'Se ocultará del panel, pero los datos actuales se conservarán en la base de datos.', 
        icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, ocultar', cancelButtonText: 'Cancelar' 
    });
    if (!isConfirmed) return;
    const fd = new FormData();
    fd.append('op', 'deleteConfig');
    fd.append('key_name', key_name);
    await fetch(`${apiHost}/IMA_Docsv2.php`, { method: 'POST', body: fd });
    fetchData();
  };

  // ==========================================
  // HANDLERS: CAPTURA DE DATOS
  // ==========================================
  const openEditor = (req) => {
    const val = valores[req.key_name];
    setEditItem(req);
    setEditData({
      valor_texto: val?.valor_texto || '',
      fecha_vencimiento: val?.fecha_vencimiento ? new Date(`${val.fecha_vencimiento}T00:00:00`) : null,
      file: null,
      currentUrl: val?.url_pdf || null
    });
    setOpenEditModal(true);
  };

  const handleSaveValue = async () => {
    const fd = new FormData();
    fd.append('op', 'Alta');
    fd.append('tipo_documento', editItem.key_name);
    
    if (editItem.tipo === 'text') fd.append('valor_texto', editData.valor_texto);
    if (editItem.tiene_vencimiento == 1 && editData.fecha_vencimiento) {
        fd.append('fecha_vencimiento', editData.fecha_vencimiento.toISOString().split('T')[0]);
    }
    if (editData.file) fd.append('documento', editData.file);

    await fetch(`${apiHost}/IMA_Docsv2.php`, { method: 'POST', body: fd });
    setOpenEditModal(false);
    fetchData();
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Guardado correctamente', showConfirmButton: false, timer: 2000 });
  };

  // ==========================================
  // UI UX: LÓGICA DE TARJETAS (ESTADOS)
  // ==========================================
  const getCardTheme = (req) => {
    const val = valores[req.key_name];
    
    // ESTADO: VACÍO
    if (!val || (!val.url_pdf && !val.valor_texto)) {
        return { 
            status: 'Faltante', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', 
            icon: <HelpOutlineIcon sx={{ color: '#94a3b8' }} /> 
        };
    }
    
    // ESTADO: CON VENCIMIENTO
    if (req.tiene_vencimiento == 1 && val.fecha_vencimiento) {
        const diff = Math.floor((new Date(val.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return { 
            status: 'Vencido', color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', 
            icon: <ErrorOutlineIcon sx={{ color: '#ef4444' }} />, dateText: val.fecha_vencimiento 
        };
        if (diff <= 30) return { 
            status: 'Por Vencer', color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d', 
            icon: <WarningAmberIcon sx={{ color: '#f59e0b' }} />, dateText: val.fecha_vencimiento 
        };
        return { 
            status: 'Vigente', color: '#10b981', bg: '#f0fdf4', border: '#6ee7b7', 
            icon: <CheckCircleIcon sx={{ color: '#10b981' }} />, dateText: val.fecha_vencimiento 
        };
    }
    
    // ESTADO: SIN VENCIMIENTO (TEXTO O ARCHIVO PERMANENTE)
    return { 
        status: 'Completado', color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd', 
        icon: <CheckCircleIcon sx={{ color: '#3b82f6' }} /> 
    };
  };

  if (loading) return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', bgcolor: '#f8fafc' }}> 
          <CircularProgress size={40} thickness={4} sx={{ color: '#3b82f6', mb: 2 }} /> 
          <Typography variant="h6" color="text.secondary" fontWeight={500}>Sincronizando panel...</Typography> 
      </Box>
  );

  const usaReqs = requisitos.filter(r => r.region === 'USA');
  const mexReqs = requisitos.filter(r => r.region === 'MEX');

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
      
      {/* HEADER PRINCIPAL */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 5 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em">
                Centro de Documentos
            </Typography>
            <Typography variant="subtitle1" color="#64748b">
                Gestión dinámica de requisitos operativos y corporativos.
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            disableElevation
            startIcon={<AddIcon />} 
            onClick={() => setOpenConfigModal(true)} 
            sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#334155' }, borderRadius: 2, fontWeight: 600, px: 3, py: 1 }}
          >
            Nuevo Requisito
          </Button>
      </Stack>
      
      {/* CONTENEDOR DE REGIONES */}
      <Stack spacing={5}>
          
          {/* SECCIÓN USA */}
          <Box>
              <Typography variant="h6" fontWeight={700} color="#1e293b" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  Requisitos USA <Chip label={usaReqs.length} size="small" sx={{ bgcolor: '#e2e8f0', fontWeight: 700 }} />
              </Typography>
              <Grid container spacing={3}>
                  {usaReqs.map((req, i) => (
                      <Zoom in style={{ transitionDelay: `${i * 50}ms` }} key={req.key_name}>
                          <Grid item xs={12} sm={6} md={4} lg={3}>
                              <DocumentCard req={req} theme={getCardTheme(req)} val={valores[req.key_name]} onEdit={() => openEditor(req)} />
                          </Grid>
                      </Zoom>
                  ))}
                  {usaReqs.length === 0 && <Typography color="text.secondary" sx={{ ml: 3, fontStyle: 'italic' }}>No hay requisitos configurados.</Typography>}
              </Grid>
          </Box>

          <Divider sx={{ borderStyle: 'dashed', borderColor: '#cbd5e1' }} />

          {/* SECCIÓN MEX */}
          <Box>
              <Typography variant="h6" fontWeight={700} color="#1e293b" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  Requisitos MEX <Chip label={mexReqs.length} size="small" sx={{ bgcolor: '#e2e8f0', fontWeight: 700 }} />
              </Typography>
              <Grid container spacing={3}>
                  {mexReqs.map((req, i) => (
                      <Zoom in style={{ transitionDelay: `${i * 50}ms` }} key={req.key_name}>
                          <Grid item xs={12} sm={6} md={4} lg={3}>
                              <DocumentCard req={req} theme={getCardTheme(req)} val={valores[req.key_name]} onEdit={() => openEditor(req)} />
                          </Grid>
                      </Zoom>
                  ))}
                  {mexReqs.length === 0 && <Typography color="text.secondary" sx={{ ml: 3, fontStyle: 'italic' }}>No hay requisitos configurados.</Typography>}
              </Grid>
          </Box>

      </Stack>

      {/* ======================================================= */}
      {/* MODAL: CONFIGURAR NUEVO REQUISITO (UI MODERNA) */}
      {/* ======================================================= */}
      <Dialog open={openConfigModal} onClose={() => setOpenConfigModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', pb: 1 }}>Agregar Requisito</DialogTitle>
        <DialogContent>
            <Typography variant="body2" color="#64748b" mb={3}>Define un nuevo documento o campo de texto. Aparecerá inmediatamente en el panel para ser gestionado.</Typography>
            <Stack spacing={3}>
                <TextField label="Nombre del Requisito" fullWidth value={newField.label} onChange={(e) => setNewField({...newField, label: e.target.value})} placeholder="Ej. Número de Fianza" variant="outlined" />
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField select label="Región" fullWidth value={newField.region} onChange={(e) => setNewField({...newField, region: e.target.value})}>
                            <MenuItem value="USA">USA</MenuItem>
                            <MenuItem value="MEX">MEX</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField select label="Tipo de Dato" fullWidth value={newField.tipo} onChange={(e) => setNewField({...newField, tipo: e.target.value})}>
                            <MenuItem value="file">Archivo (PDF/IMG)</MenuItem>
                            <MenuItem value="text">Texto</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
                {newField.tipo === 'file' && (
                    <Box sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 2 }}>
                        <FormControlLabel control={<Switch checked={newField.tiene_vencimiento} onChange={(e) => setNewField({...newField, tiene_vencimiento: e.target.checked})} color="primary" />} label={<Typography fontWeight={500} color="#334155">Requiere control de vencimiento</Typography>} />
                    </Box>
                )}
            </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenConfigModal(false)} sx={{ color: '#64748b', fontWeight: 600 }}>Cancelar</Button>
            <Button variant="contained" disableElevation onClick={handleCreateNewField} sx={{ bgcolor: '#0f172a', borderRadius: 2, px: 3 }}>Crear Requisito</Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================= */}
      {/* MODAL: EDITAR / SUBIR VALOR (UI MODERNA) */}
      {/* ======================================================= */}
      <Dialog open={openEditModal} onClose={() => setOpenEditModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={800} color="#0f172a">Gestionar: {editItem?.label}</Typography>
            <Tooltip title="Ocultar requisito del panel"><IconButton size="small" color="error" onClick={() => { setOpenEditModal(false); handleDeleteField(editItem?.key_name, editItem?.label); }}><DeleteOutlineIcon /></IconButton></Tooltip>
        </DialogTitle>
        <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
                
                {/* PREVIEW DEL ACTUAL SI EXISTE */}
                {editItem?.tipo === 'file' && editData.currentUrl && (
                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f0fdf4', border: '1px dashed #4ade80', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="body2" color="#166534" fontWeight={600}>✓ Ya existe un documento cargado</Typography>
                        <Button size="small" endIcon={<OpenInNewIcon />} href={`${apiHost}/${editData.currentUrl}`} target="_blank" color="success">Ver</Button>
                    </Paper>
                )}

                {/* TEXT INPUT */}
                {editItem?.tipo === 'text' && (
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} color="#475569" mb={1}>Valor del Campo</Typography>
                        <TextField fullWidth placeholder="Ingresar valor..." value={editData.valor_texto} onChange={e => setEditData({...editData, valor_texto: e.target.value})} variant="outlined" />
                    </Box>
                )}
                
                {/* FILE UPLOAD (DRAG & DROP SIMULADO) */}
                {editItem?.tipo === 'file' && (
                    <Box sx={{ 
                        border: '2px dashed #cbd5e1', bgcolor: '#f8fafc', p: 4, textAlign: 'center', borderRadius: 3, 
                        cursor: 'pointer', transition: '0.2s', '&:hover': { borderColor: '#3b82f6', bgcolor: '#eff6ff' } 
                    }} component="label">
                        <CloudUploadOutlinedIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                        <Typography variant="subtitle1" fontWeight={700} color="#1e293b">Seleccionar archivo</Typography>
                        <Typography variant="body2" color="#64748b" mb={2}>PDF, JPG o PNG permitidos.</Typography>
                        
                        {editData.file && <Chip icon={<CheckCircleIcon />} label={editData.file.name} color="primary" variant="outlined" />}
                        <input type="file" hidden onChange={e => setEditData({...editData, file: e.target.files[0]})} />
                    </Box>
                )}

                {/* DATE PICKER */}
                {editItem?.tiene_vencimiento == 1 && (
                    <Box>
                        <Typography variant="subtitle2" fontWeight={600} color="#475569" mb={1}>Fecha de Expiración</Typography>
                        <DatePicker 
                            selected={editData.fecha_vencimiento} 
                            onChange={(d) => setEditData({...editData, fecha_vencimiento: d})} 
                            className="form-input" 
                            placeholderText="dd/mm/aaaa" 
                        />
                    </Box>
                )}
            </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setOpenEditModal(false)} sx={{ color: '#64748b', fontWeight: 600 }}>Cancelar</Button>
            <Button variant="contained" disableElevation onClick={handleSaveValue} sx={{ bgcolor: '#3b82f6', borderRadius: 2, px: 4 }}>Guardar</Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

// ==========================================
// SUB-COMPONENTE: TARJETA DOCUMENTO
// ==========================================
// ==========================================
// SUB-COMPONENTE: TARJETA DOCUMENTO / DATO
// ==========================================
const DocumentCard = ({ req, theme, val, onEdit }) => {
    
    // --------------------------------------------------------
    // 1. DISEÑO RECTANGULAR PARA INPUTS DE TEXTO (DATOS)
    // --------------------------------------------------------
    if (req.tipo === 'text') {
        return (
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 2, 
                    borderRadius: 3, 
                    border: `1px solid ${theme.border}`, 
                    bgcolor: 'white',
                    borderLeft: `5px solid ${theme.color}`, // Borde izquierdo distintivo
                    display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.05)',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }
                    // 🚨 Nota: NO le ponemos height: '100%' para que se mantenga como un rectángulo compacto
                }}
            >
                {/* Encabezado del Dato */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextFieldsIcon sx={{ fontSize: 18, color: '#94a3b8' }}/>
                        <Typography variant="subtitle2" fontWeight={800} color="#0f172a" noWrap>
                            {req.label}
                        </Typography>
                    </Stack>
                    <Tooltip title={theme.status} arrow>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {theme.icon}
                        </Box>
                    </Tooltip>
                </Stack>

                {/* Caja de Valor (Simula un input moderno) */}
                <Box sx={{ 
                    bgcolor: val?.valor_texto ? '#f8fafc' : '#f1f5f9', 
                    p: 1.5, 
                    borderRadius: 2, 
                    border: '1px dashed', 
                    borderColor: val?.valor_texto ? '#cbd5e1' : '#e2e8f0',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                }}>
                    <Typography 
                        variant="body2" 
                        fontWeight={700} 
                        color={val?.valor_texto ? "#334155" : "#94a3b8"} 
                        noWrap 
                        sx={{ flexGrow: 1, mr: 1 }}
                    >
                        {val?.valor_texto || 'No registrado'}
                    </Typography>
                    
                    <Tooltip title="Editar Valor">
                        <IconButton size="small" onClick={onEdit} sx={{ color: '#3b82f6', bgcolor: '#eff6ff', '&:hover': { bgcolor: '#dbeafe' } }}>
                            <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Paper>
        );
    }

    // --------------------------------------------------------
    // 2. DISEÑO CLÁSICO PARA DOCUMENTOS (ARCHIVOS)
    // --------------------------------------------------------
    return (
        <Paper 
            elevation={0} 
            sx={{ 
                p: 2.5, borderRadius: 3, border: `1px solid ${theme.border}`, bgcolor: 'white',
                position: 'relative', overflow: 'hidden', height: '100%',
                display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }
            }}
        >
            {/* Fondo decorativo superior */}
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: theme.color }} />
            
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: theme.bg, display: 'flex' }}>
                    {theme.icon}
                </Box>
                <Chip label={theme.status} size="small" sx={{ bgcolor: theme.bg, color: theme.color, fontWeight: 700, fontSize: '0.7rem' }} />
            </Stack>

            <Typography variant="subtitle1" fontWeight={800} color="#0f172a" lineHeight={1.2} sx={{ mb: 1 }}>
                {req.label}
            </Typography>
            
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, flexGrow: 1 }}>
                <InsertDriveFileOutlinedIcon sx={{ fontSize: 16, color: '#94a3b8' }}/>
                <Typography variant="caption" color="#64748b" fontWeight={600}>
                    Documento PDF/IMG
                    {theme.dateText && ` • Vence: ${theme.dateText}`}
                </Typography>
            </Stack>

            <Button 
                fullWidth variant="outlined" onClick={onEdit} startIcon={<EditOutlinedIcon />}
                sx={{ 
                    mt: 'auto', borderRadius: 2, textTransform: 'none', fontWeight: 600, 
                    color: '#475569', borderColor: '#cbd5e1', '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' } 
                }}
            >
                Gestionar Archivo
            </Button>
        </Paper>
    );
};

export default ImaManager;