import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, TextField, Button, Stack, CircularProgress, Paper } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewColumnIcon from '@mui/icons-material/ViewColumn'; 
import Swal from 'sweetalert2';

import TruckTable from '../components/TruckAdmin/TruckTable';
import ColumnConfigModal from '../components/TruckAdmin/ColumnConfigModal';
import RequirementConfigModal from '../components/TruckAdmin/RequirementConfigModal';
import TruckMasterFormModal from '../components/TruckAdmin/TruckMasterFormModal';

import { useAuthStore } from '../store/useAuthStore';

const apiHost = import.meta.env.VITE_API_HOST;
const API_ENDPOINT = 'trucks_v2.php';

const TruckAdmin = () => {
  // Estados Globales
  const [loading, setLoading] = useState(true);
  const [trucks, setTrucks] = useState([]);
  const [configFields, setConfigFields] = useState([]);
  
  // Búsquedas
  const [searchUnidad, setSearchUnidad] = useState('');
  const [searchPlaca, setSearchPlaca] = useState('');

  // Paginación y Vista
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [hiddenColumns, setHiddenColumns] = useState([]); 

  // Modales
  const [openConfigModal, setOpenConfigModal] = useState(false);
  const [openTruckModal, setOpenTruckModal] = useState(false);
  const [openColumnModal, setOpenColumnModal] = useState(false); 
  
  // Datos
  const [newField, setNewField] = useState({ label: '', categoria: 'USA', tipo: 'file', tiene_vencimiento: true });
  const [truckData, setTruckData] = useState({});
  const [truckDocs, setTruckDocs] = useState({});

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
            setTrucks(data.trucks || []);
        }
    } catch (error) { console.warn('Esperando backend trucks_v2.php...'); setConfigFields([]); setTrucks([]); }
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
      
      try {
          await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
          setOpenConfigModal(false);
          setNewField({ label: '', categoria: 'USA', tipo: 'file', tiene_vencimiento: true });
          fetchData();
          Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Requisito Creado', showConfirmButton: false, timer: 2000 });
      } catch (e) { Swal.fire('Atención', 'Conecta el backend para guardar.', 'info'); }
  };

  const handleDeleteField = async (key_name, label) => {
      const { isConfirmed } = await Swal.fire({ title: `¿Eliminar "${label}"?`, text: 'Históricos seguros en BD.', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, eliminar', confirmButtonColor: '#d33' });
      if (!isConfirmed) return;
      const fd = new FormData(); fd.append('op', 'deleteConfig'); fd.append('key_name', key_name);
      await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd }); fetchData();
  };

  const openTruckEditor = (truck = null) => {
      if (truck) { setTruckData({ ...truck }); setTruckDocs({}); } 
      else { setTruckData({ unidad: '', placa_mex: '', placa_eua: '', modelo: '', marca: '', numero_vin: '', tag: '', docs: {} }); setTruckDocs({}); }
      setOpenTruckModal(true);
  };

  const handleSaveTruck = async () => {
      if (!truckData.unidad) return Swal.fire('Falta Unidad', 'El número es obligatorio.', 'warning');
      setLoading(true);

      const fd = new FormData(); fd.append('op', 'saveTruck');
      ['truck_id', 'unidad', 'placa_mex', 'placa_eua', 'modelo', 'marca', 'numero_vin', 'tag'].forEach(k => { if (truckData[k]) fd.append(k, truckData[k]); });

      configFields.forEach(req => {
          const k = req.key_name; const val = truckData.docs?.[k]; 
          if (req.tipo === 'text' && val?.valor_texto !== undefined) fd.append(`text_${k}`, val.valor_texto);
          if (req.tipo === 'file') {
              if (val?.fecha_vencimiento) fd.append(`date_${k}`, val.fecha_vencimiento.split('T')[0]);
              if (truckDocs[k]) fd.append(`file_${k}`, truckDocs[k]); 
          }
      });

      try {
          await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
          setOpenTruckModal(false); fetchData();
          Swal.fire('Guardado', 'Camión actualizado.', 'success');
      } catch(e) { Swal.fire('Atención', 'Conecta el backend.', 'info'); setLoading(false); }
  };

  const deleteTruck = async (truck_id) => {
      const { isConfirmed } = await Swal.fire({ title: '¿Eliminar Camión?', icon: 'error', showCancelButton: true });
      if (!isConfirmed) return;
      const fd = new FormData(); fd.append('op', 'deleteTruck'); fd.append('truck_id', truck_id);
      await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd }); fetchData();
  };

  // ==========================================
  // FILTROS EN MEMORIA
  // ==========================================
  const filteredTrucks = useMemo(() => {
    return trucks.filter(t => {
        const matchUnidad = !searchUnidad || String(t.unidad || '').toLowerCase().includes(searchUnidad.toLowerCase());
        const matchPlaca = !searchPlaca || String(t.placa_mex || '').toLowerCase().includes(searchPlaca.toLowerCase()) || String(t.placa_eua || '').toLowerCase().includes(searchPlaca.toLowerCase());
        return matchUnidad && matchPlaca;
    });
  }, [trucks, searchUnidad, searchPlaca]);

  const categories = [...new Set(configFields.map(f => f.categoria))];
  const visibleConfigFields = configFields.filter(req => !hiddenColumns.includes(req.key_name));

  if (loading && trucks.length === 0) return <Box p={5} display="flex" justifyContent="center"><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <style>{`.swal2-container { z-index: 2000 !important; }`}</style>

      {/* HEADER */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={4} spacing={2}>
        <Box>
            <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em">Administrador de Camiones</Typography>
            <Typography variant="subtitle1" color="#64748b">Gestión centralizada de unidades, permisos y registros (USA/MEX).</Typography>
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
            <Button variant="contained" disableElevation startIcon={<AddIcon />} onClick={() => openTruckEditor(null)} sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#334155' } }}>Alta Camión</Button>
        </Stack>
      </Stack>

      {/* FILTROS BÚSQUEDA */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <Stack direction="row" spacing={2}>
              <TextField label="Buscar por Unidad" size="small" variant="outlined" value={searchUnidad} onChange={(e) => { setSearchUnidad(e.target.value); setPage(0); }} sx={{ width: 250 }} />
              <TextField label="Buscar por Placa (MX/USA)" size="small" variant="outlined" value={searchPlaca} onChange={(e) => { setSearchPlaca(e.target.value); setPage(0); }} sx={{ width: 250 }} />
          </Stack>
      </Paper>

      <TruckTable 
          filteredTrucks={filteredTrucks} visibleConfigFields={visibleConfigFields} 
          page={page} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} 
          openTruckEditor={openTruckEditor} deleteTruck={deleteTruck} 
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

      <TruckMasterFormModal 
          open={openTruckModal} onClose={() => setOpenTruckModal(false)}
          truckData={truckData} setTruckData={setTruckData} truckDocs={truckDocs} setTruckDocs={setTruckDocs}
          configFields={configFields} categories={categories} handleSaveTruck={handleSaveTruck} loading={loading}
      />
    </Box>
  );
};

export default TruckAdmin;