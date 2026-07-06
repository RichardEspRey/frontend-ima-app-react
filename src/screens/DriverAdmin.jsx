import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, TextField, Button, Stack, CircularProgress, Paper } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import ViewColumnIcon from '@mui/icons-material/ViewColumn'; 
import Swal from 'sweetalert2';

import DriverTable from '../components/DriverAdmin/DriverTable';
import ColumnConfigModal from '../components/DriverAdmin/ColumnConfigModal';
import RequirementConfigModal from '../components/DriverAdmin/RequirementConfigModal';
import DriverMasterFormModal from '../components/DriverAdmin/DriverMasterFormModal';

import { useAuthStore } from '../store/useAuthStore';

const apiHost = import.meta.env.VITE_API_HOST;
const API_ENDPOINT = 'drivers_v2.php';

const DriverAdmin = () => {
  // Estados Globales
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);
  const [configFields, setConfigFields] = useState([]);
  const [search, setSearch] = useState('');
  
  // Paginación y Vistas
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Control de Modales
  const [openConfigModal, setOpenConfigModal] = useState(false);
  const [openDriverModal, setOpenDriverModal] = useState(false);
  const [openColumnModal, setOpenColumnModal] = useState(false); 
  
  // Datos Activos
  const [newField, setNewField] = useState({ label: '', categoria: 'Viaje', tipo: 'file', tiene_vencimiento: true });
  const [driverData, setDriverData] = useState({});
  const [driverDocs, setDriverDocs] = useState({});

  const { user } = useAuthStore();
  const isAdmin = user?.tipo_usuario?.toLowerCase() === 'admin';

  // ==========================================
  // FETCH DE DATOS
  // ==========================================
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

  // ==========================================
  // LÓGICA DE NEGOCIO (Controladores)
  // ==========================================
  const toggleColumnVisibility = async (key_name) => {
      if (!isAdmin) return;
      const target = configFields.find(f => f.key_name === key_name);
      if (!target) return;
      const nextOculto = Number(target.oculto_en_tabla) ? 0 : 1;

      const fd = new FormData();
      fd.append('op', 'updateColumnVisibility');
      fd.append('key_name', key_name);
      fd.append('oculto_en_tabla', nextOculto);
      if (user?.tipo_usuario) fd.append('user_type', user.tipo_usuario);

      try {
          const res = await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
          const result = await res.json();
          if (result.status !== 'success') throw new Error(result.message || 'No se pudo actualizar la columna.');
          setConfigFields(prev => prev.map(f => f.key_name === key_name ? { ...f, oculto_en_tabla: nextOculto } : f));
      } catch (e) {
          Swal.fire('Error', e.message, 'error');
      }
  };

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
          title: `¿Eliminar "${label}"?`, text: 'Se eliminará de la tabla. Históricos seguros en BD.', icon: 'warning', 
          showCancelButton: true, confirmButtonText: 'Sí, eliminar', confirmButtonColor: '#d33'
      });
      if (!isConfirmed) return;
      const fd = new FormData(); fd.append('op', 'deleteConfig'); fd.append('key_name', key_name);
      await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
      fetchData();
  };

  const openDriverEditor = (driver = null) => {
      if (driver) {
          setDriverData({ ...driver }); setDriverDocs({});
      } else {
          setDriverData({ nombre: '', curp: '', rfc: '', phone_mex: '', phone_usa: '', fecha_nacimiento: '', fecha_ingreso: '', docs: {} });
          setDriverDocs({});
      }
      setOpenDriverModal(true);
  };

  const handleSaveDriver = async () => {
      if (!driverData.nombre) return Swal.fire('Falta Nombre', 'El nombre es obligatorio.', 'warning');
      setLoading(true);

      const fd = new FormData(); fd.append('op', 'saveDriver');
      ['driver_id', 'nombre', 'fecha_nacimiento', 'fecha_ingreso', 'curp', 'rfc', 'phone_mex', 'phone_usa'].forEach(k => {
          if (driverData[k]) fd.append(k, driverData[k]);
      });

      configFields.forEach(req => {
          const k = req.key_name; const val = driverData.docs?.[k]; 
          if (req.tipo === 'text' && val?.valor_texto !== undefined) fd.append(`text_${k}`, val.valor_texto);
          if (req.tipo === 'file') {
              if (val?.fecha_vencimiento) fd.append(`date_${k}`, val.fecha_vencimiento.split('T')[0]);
              if (driverDocs[k]) fd.append(`file_${k}`, driverDocs[k]); 
          }
      });

      try {
          await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd });
          setOpenDriverModal(false); fetchData();
          Swal.fire('Guardado', 'Conductor actualizado.', 'success');
      } catch(e) { Swal.fire('Error', 'Problema al guardar.', 'error'); setLoading(false); }
  };

  const deleteDriver = async (driver_id) => {
      const { isConfirmed } = await Swal.fire({ title: '¿Eliminar Conductor?', icon: 'error', showCancelButton: true });
      if (!isConfirmed) return;
      const fd = new FormData(); fd.append('op', 'deleteDriver'); fd.append('driver_id', driver_id);
      await fetch(`${apiHost}/${API_ENDPOINT}`, { method: 'POST', body: fd }); fetchData();
  };

  // ==========================================
  // FILTROS EN MEMORIA
  // ==========================================
  const filteredDrivers = useMemo(() => drivers.filter(d => d.nombre.toLowerCase().includes(search.toLowerCase())), [drivers, search]);
  const visibleConfigFields = configFields.filter(req => !Number(req.oculto_en_tabla));
  const categories = [...new Set(configFields.map(f => f.categoria))];

  if (loading && drivers.length === 0) return <Box p={5} display="flex" justifyContent="center"><CircularProgress /></Box>;

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
      <style>{`.swal2-container { z-index: 2000 !important; }`}</style>

      {/* HEADER Y BOTONERA */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} mb={4} spacing={2}>
        <Box>
            <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em">Gestión de Conductores</Typography>
            <Typography variant="subtitle1" color="#64748b">Administración centralizada de perfiles y requisitos.</Typography>
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
            <Button variant="contained" disableElevation startIcon={<AddIcon />} onClick={() => openDriverEditor(null)} sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#334155' } }}>Alta Conductor</Button>
        </Stack>
      </Stack>

      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid #e2e8f0', borderRadius: 3 }}>
          <TextField label="Buscar por nombre..." size="small" variant="outlined" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} sx={{ width: 300 }} />
      </Paper>

      {/* MODULARES */}
      <DriverTable 
          filteredDrivers={filteredDrivers} visibleConfigFields={visibleConfigFields} 
          page={page} setPage={setPage} rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage} 
          openDriverEditor={openDriverEditor} deleteDriver={deleteDriver} 
      />

      <ColumnConfigModal
          open={openColumnModal} onClose={() => setOpenColumnModal(false)}
          configFields={configFields} toggleColumnVisibility={toggleColumnVisibility}
      />

      <RequirementConfigModal 
          open={openConfigModal} onClose={() => setOpenConfigModal(false)}
          configFields={configFields} newField={newField} setNewField={setNewField} 
          handleCreateField={handleCreateField} handleDeleteField={handleDeleteField}
      />

      <DriverMasterFormModal 
          open={openDriverModal} onClose={() => setOpenDriverModal(false)}
          driverData={driverData} setDriverData={setDriverData} driverDocs={driverDocs} setDriverDocs={setDriverDocs}
          configFields={configFields} categories={categories} handleSaveDriver={handleSaveDriver} loading={loading}
      />
    </Box>
  );
};

export default DriverAdmin;