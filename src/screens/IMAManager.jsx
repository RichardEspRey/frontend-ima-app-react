import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Grid, Stack, CircularProgress, Chip, Divider, Zoom } from '@mui/material'; 

import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import Swal from 'sweetalert2';

import DocumentCard from '../components/ImaManager/DocumentCard';
import ConfigRequirementModal from '../components/ImaManager/ConfigRequirementModal';
import EditValueModal from '../components/ImaManager/EditValueModal';

const apiHost = import.meta.env.VITE_API_HOST;

const ImaManager = () => {
  const [loading, setLoading] = useState(true);
  const [requisitos, setRequisitos] = useState([]);
  const [valores, setValores] = useState({});

  const [openConfigModal, setOpenConfigModal] = useState(false);
  const [newField, setNewField] = useState({ label: '', region: 'USA', tipo: 'file', tiene_vencimiento: true });

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
        title: `¿Eliminar "${label}"?`, text: 'Se ocultará del panel, pero los datos actuales se conservarán.', icon: 'warning', showCancelButton: true 
    });
    if (!isConfirmed) return;
    const fd = new FormData();
    fd.append('op', 'deleteConfig');
    fd.append('key_name', key_name);
    await fetch(`${apiHost}/IMA_Docsv2.php`, { method: 'POST', body: fd });
    fetchData();
  };

  const openEditor = (req) => {
    const val = valores[req.key_name];
    setEditItem(req);
    setEditData({
      valor_texto: val?.valor_texto || '',
      fecha_vencimiento: val?.fecha_vencimiento ? new Date(`${val.fecha_vencimiento}T00:00:00`) : null,
      file: null, currentUrl: val?.url_pdf || null
    });
    setOpenEditModal(true);
  };

  const handleSaveValue = async () => {
    const fd = new FormData();
    fd.append('op', 'Alta');
    fd.append('tipo_documento', editItem.key_name);
    if (editItem.tipo === 'text') fd.append('valor_texto', editData.valor_texto);
    if (editItem.tiene_vencimiento == 1 && editData.fecha_vencimiento) fd.append('fecha_vencimiento', editData.fecha_vencimiento.toISOString().split('T')[0]);
    if (editData.file) fd.append('documento', editData.file);

    await fetch(`${apiHost}/IMA_Docsv2.php`, { method: 'POST', body: fd });
    setOpenEditModal(false);
    fetchData();
    Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Guardado correctamente', showConfirmButton: false, timer: 2000 });
  };

  const getCardTheme = (req) => {
    const val = valores[req.key_name];
    if (!val || (!val.url_pdf && !val.valor_texto)) return { status: 'Faltante', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', icon: <HelpOutlineIcon sx={{ color: '#94a3b8' }} /> };
    if (req.tiene_vencimiento == 1 && val.fecha_vencimiento) {
        const diff = Math.floor((new Date(val.fecha_vencimiento) - new Date()) / (1000 * 60 * 60 * 24));
        if (diff < 0) return { status: 'Vencido', color: '#ef4444', bg: '#fef2f2', border: '#fca5a5', icon: <ErrorOutlineIcon sx={{ color: '#ef4444' }} />, dateText: val.fecha_vencimiento };
        if (diff <= 30) return { status: 'Por Vencer', color: '#f59e0b', bg: '#fffbeb', border: '#fcd34d', icon: <WarningAmberIcon sx={{ color: '#f59e0b' }} />, dateText: val.fecha_vencimiento };
        return { status: 'Vigente', color: '#10b981', bg: '#f0fdf4', border: '#6ee7b7', icon: <CheckCircleIcon sx={{ color: '#10b981' }} />, dateText: val.fecha_vencimiento };
    }
    return { status: 'Completado', color: '#3b82f6', bg: '#eff6ff', border: '#93c5fd', icon: <CheckCircleIcon sx={{ color: '#3b82f6' }} /> };
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
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 5 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em">Centro de Documentos</Typography>
            <Typography variant="subtitle1" color="#64748b">Gestión dinámica de requisitos operativos y corporativos.</Typography>
          </Box>
          <Button variant="contained" disableElevation startIcon={<AddIcon />} onClick={() => setOpenConfigModal(true)} sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#334155' }, borderRadius: 2, fontWeight: 600, px: 3, py: 1 }}>
            Nuevo Requisito
          </Button>
      </Stack>
      
      <Stack spacing={5}>
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

      <ConfigRequirementModal 
          open={openConfigModal} onClose={() => setOpenConfigModal(false)}
          newField={newField} setNewField={setNewField} onSave={handleCreateNewField}
      />

      <EditValueModal 
          open={openEditModal} onClose={() => setOpenEditModal(false)}
          editItem={editItem} editData={editData} setEditData={setEditData}
          onSave={handleSaveValue} onDelete={() => { setOpenEditModal(false); handleDeleteField(editItem?.key_name, editItem?.label); }}
      />
    </Box>
  );
};

export default ImaManager;