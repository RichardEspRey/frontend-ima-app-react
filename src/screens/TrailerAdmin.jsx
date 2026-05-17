import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, TextField, Button, Stack, CircularProgress, Paper } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewColumnIcon from '@mui/icons-material/ViewColumn'; 
import Swal from 'sweetalert2';

import TrailerTable from '../components/TrailerAdmin/TrailerTable';
import ColumnConfigModal from '../components/TrailerAdmin/ColumnConfigModal';
import RequirementConfigModal from '../components/TrailerAdmin/RequirementConfigModal';
import TrailerMasterFormModal from '../components/TrailerAdmin/TrailerMasterFormModal';

import { useAuthStore } from '../store/useAuthStore';

const apiHost = import.meta.env.VITE_API_HOST;
const API_ENDPOINT = 'cajas_v2.php';

const TrailerAdmin = () => {
  // Estados Globales
  const [loading, setLoading] = useState(true);
  const [cajas, setCajas] = useState([]);
  const [configFields, setConfigFields] = useState([]);
  
  // Búsquedas
  const [searchCaja, setSearchCaja] = useState('');
  const [searchPlaca, setSearchPlaca] = useState('');

  // Paginación y Vista
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [hiddenColumns, setHiddenColumns] = useState([]); 

  // Modales
  const [openConfigModal, setOpenConfigModal] = useState(false);
  const [openTrailerModal, setOpenTrailerModal] = useState(false);
  const [openColumnModal, setOpenColumnModal] = useState(false); 
  
  // Datos
  const [newField, setNewField] = useState({ label: '', categoria: 'USA', tipo: 'file', tiene_vencimiento: true });
  const [trailerData, setTrailerData] = useState({});
  const [trailerDocs, setTrailerDocs] = useState({});

  const { user } = useAuthStore();
  const isAdmin = user?.tipo_usuario?.toLowerCase() === 'admin';
  
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
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ==========================================
  // CONTROLADORES LÓGICOS
  // ==========================================
  const toggleColumnVisibility = (key_name) => setHiddenColumns(prev => prev.includes(key_name) ? prev.filter(k => k !== key_name) : [...prev, key_name]);

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
      const { isConfirmed } = await Swal.fire({ title: `¿Eliminar "${label}"?`, text: 'Históricos seguros en BD.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar', confirmButtonColor: '#d33' });
      if (!isConfirmed) return;
      const fd = new FormData(); fd.append('op', 'deleteConfig'); fd.append('key_name', key_name);
      await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd }); fetchData();
  };

  const openTrailerEditor = (caja = null) => {
      if (caja) { setTrailerData({ ...caja }); setTrailerDocs({}); } 
      else { setTrailerData({ no_caja: '', no_placa: '', estado_placa: '', no_vin: '', docs: {} }); setTrailerDocs({}); }
      setOpenTrailerModal(true);
  };

  const handleSaveTrailer = async () => {
      if (!trailerData.no_caja) return Swal.fire('Falta Número', 'El número de caja es obligatorio.', 'warning');
      setLoading(true);

      const fd = new FormData(); fd.append('op', 'saveTrailer');
      ['caja_id', 'no_caja', 'no_placa', 'estado_placa', 'no_vin'].forEach(k => { if (trailerData[k]) fd.append(k, trailerData[k]); });

      configFields.forEach(req => {
          const k = req.key_name; const val = trailerData.docs?.[k]; 
          if (req.tipo === 'text' && val?.valor_texto !== undefined) fd.append(`text_${k}`, val.valor_texto);
          if (req.tipo === 'file') {
              if (val?.fecha_vencimiento) fd.append(`date_${k}`, val.fecha_vencimiento.split('T')[0]);
              if (trailerDocs[k]) fd.append(`file_${k}`, trailerDocs[k]); 
          }
      });

      try {
          await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
          setOpenTrailerModal(false); fetchData();
          Swal.fire('Guardado', 'Caja actualizada.', 'success');
      } catch(e) { Swal.fire('Error', 'Conecta el backend.', 'error'); setLoading(false); }
  };

  const deleteTrailer = async (caja_id) => {
      const { isConfirmed } = await Swal.fire({ title: '¿Eliminar Caja?', icon: 'error', showCancelButton: true });
      if (!isConfirmed) return;
      const fd = new FormData(); fd.append('op', 'deleteTrailer'); fd.append('caja_id', caja_id);
      await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd }); fetchData();
  };

  // ==========================================
  // FILTROS EN MEMORIA
  // ==========================================
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

      {/* HEADER */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={4} spacing={2}>
        <Box>
            <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em">Administrador de Cajas</Typography>
            <Typography variant="subtitle1" color="#64748b">Gestión centralizada de remolques y cumplimiento documental.</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
            {isAdmin && (
                <>
                    <Button variant="outlined" color="inherit" startIcon={<ViewColumnIcon />} onClick={() => setOpenColumnModal(true)}>
                        Columnas
                    </Button>
                    <Button variant="outlined" color="inherit" startIcon={<SettingsIcon />} onClick={() => setOpenConfigModal(true)}>
                        Requisitos
                    </Button>
                </>
            )}
            <Button variant="contained" disableElevation startIcon={<AddIcon />} onClick={() => openTrailerEditor(null)} sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#334155' } }}>Alta Caja</Button>
        </Stack>
      </Stack>

      {/* FILTROS BÚSQUEDA */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <Stack direction="row" spacing={2}>
              <TextField label="Buscar por No. Caja" size="small" variant="outlined" value={searchCaja} onChange={(e) => { setSearchCaja(e.target.value); setPage(0); }} sx={{ width: 250 }} />
              <TextField label="Buscar por Placa" size="small" variant="outlined" value={searchPlaca} onChange={(e) => { setSearchPlaca(e.target.value); setPage(0); }} sx={{ width: 250 }} />
          </Stack>
      </Paper>

      <TrailerTable 
          filteredCajas={filteredCajas} visibleConfigFields={visibleConfigFields} 
          page={page} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} 
          openTrailerEditor={openTrailerEditor} deleteTrailer={deleteTrailer} 
      />

      <ColumnConfigModal 
          open={openColumnModal} onClose={() => setOpenColumnModal(false)}
          configFields={configFields} hiddenColumns={hiddenColumns} toggleColumnVisibility={toggleColumnVisibility}
      />

      <RequirementConfigModal 
          open={openConfigModal} onClose={() => setOpenConfigModal(false)}
          configFields={configFields} newField={newField} setNewField={setNewField} 
          handleCreateField={handleCreateField} handleDeleteField={handleDeleteField}
      />

      <TrailerMasterFormModal 
          open={openTrailerModal} onClose={() => setOpenTrailerModal(false)}
          trailerData={trailerData} setTrailerData={setTrailerData} trailerDocs={trailerDocs} setTrailerDocs={setTrailerDocs}
          configFields={configFields} categories={categories} handleSaveTrailer={handleSaveTrailer} loading={loading}
      />
    </Box>
  );
};

export default TrailerAdmin;