import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { Box, Paper, Typography, Grid, Stack, TextField, Button, CircularProgress, Chip } from '@mui/material'; 
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import Swal from 'sweetalert2';

const apiHost = import.meta.env.VITE_API_HOST;

const DriverProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  const isEditing = id !== 'new';

  const [loading, setLoading] = useState(true);
  const [requisitos, setRequisitos] = useState([]);
  
  const [baseData, setBaseData] = useState({
      nombre: '', fecha_ingreso: '', fecha_nacimiento: '', curp: '', rfc: '', phone_usa: '', phone_mex: ''
  });
  
  // Guardará { file: null, valor_texto: '', fecha_vencimiento: '' }
  const [docsData, setDocsData] = useState({}); 

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Obtener Catálogo de Campos Dinámicos
      let fd = new FormData(); fd.append('op', 'getConfig');
      let res = await fetch(`${apiHost}/drivers_v2.php`, { method: 'POST', body: fd });
      let data = await res.json();
      setRequisitos(data.requisitos);

      // 2. Si es edición, traer datos del chofer
      if (isEditing) {
          fd = new FormData(); fd.append('op', 'getDriverProfile'); fd.append('driver_id', id);
          res = await fetch(`${apiHost}/drivers_v2.php`, { method: 'POST', body: fd });
          data = await res.json();
          
          if (data.status === 'success') {
              setBaseData({
                  nombre: data.driver.nombre || '', fecha_ingreso: data.driver.fecha_ingreso || '',
                  fecha_nacimiento: data.driver.fecha_nacimiento || '', curp: data.driver.curp || '',
                  rfc: data.driver.rfc || '', phone_usa: data.driver.phone_usa || '', phone_mex: data.driver.phone_mex || ''
              });

              const formattedDocs = {};
              Object.entries(data.documentos).forEach(([key, val]) => {
                  formattedDocs[key] = {
                      currentUrl: val.url_pdf,
                      valor_texto: val.valor_texto || '',
                      fecha_vencimiento: val.fecha_vencimiento || '',
                      file: null
                  };
              });
              setDocsData(formattedDocs);
          }
      }
    } catch (error) { console.error(error); } finally { setLoading(false); }
  }, [apiHost, id, isEditing]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleBaseChange = (field, value) => setBaseData(prev => ({ ...prev, [field]: value }));
  const handleDocChange = (key, field, value) => {
      setDocsData(prev => ({
          ...prev, 
          [key]: { ...(prev[key] || {}), [field]: value }
      }));
  };

  const handleSave = async () => {
      if (!baseData.nombre) return Swal.fire('Error', 'El nombre es obligatorio', 'error');

      setLoading(true);
      try {
          // 1. Guardar Base Data
          const fdBase = new FormData();
          fdBase.append('op', 'saveBaseData');
          if (isEditing) fdBase.append('driver_id', id);
          Object.entries(baseData).forEach(([key, val]) => fdBase.append(key, val));
          
          let res = await fetch(`${apiHost}/drivers_v2.php`, { method: 'POST', body: fdBase });
          let data = await res.json();
          if (data.status !== 'success') throw new Error('Error al guardar datos principales');
          
          const driverId = data.driver_id;

          // 2. Guardar Documentos y Textos Dinámicos
          for (const req of requisitos) {
              const doc = docsData[req.key_name];
              if (!doc) continue; // Si no interactuó ni tiene datos viejos, lo ignoramos

              // Solo subimos si hay un texto, un archivo nuevo o se cambió la fecha
              if (doc.file || doc.valor_texto !== '' || doc.fecha_vencimiento !== '') {
                  const fdDoc = new FormData();
                  fdDoc.append('op', 'saveDoc');
                  fdDoc.append('driver_id', driverId);
                  fdDoc.append('tipo_documento', req.key_name);
                  if (doc.valor_texto) fdDoc.append('valor_texto', doc.valor_texto);
                  if (doc.fecha_vencimiento) fdDoc.append('fecha_vencimiento', doc.fecha_vencimiento);
                  if (doc.file) fdDoc.append('documento', doc.file);

                  await fetch(`${apiHost}/drivers_v2.php`, { method: 'POST', body: fdDoc });
              }
          }

          Swal.fire('¡Éxito!', 'Expediente guardado correctamente', 'success').then(() => {
              navigate('/admin-drivers');
          });

      } catch (err) {
          Swal.fire('Error', err.message, 'error');
      } finally {
          setLoading(false);
      }
  };

  if (loading) return <Box p={5} display="flex" justifyContent="center"><CircularProgress /></Box>;

  // Agrupar campos dinámicos
  const reqsPersonales = requisitos.filter(r => r.categoria === 'Personales');
  const reqsViaje = requisitos.filter(r => r.categoria === 'Viaje');
  const reqsOtros = requisitos.filter(r => r.categoria === 'Otros');

  const renderDynamicField = (req) => {
      const doc = docsData[req.key_name] || {};
      return (
          <Box key={req.key_name} sx={{ mb: 3, p: 2, border: '1px dashed #cbd5e1', borderRadius: 2, bgcolor: '#f8fafc' }}>
              <Typography variant="subtitle2" fontWeight={700} color="#334155" mb={1}>{req.label}</Typography>
              
              {req.tipo === 'text' ? (
                  <TextField fullWidth size="small" placeholder="Ingresar valor..." value={doc.valor_texto || ''} onChange={e => handleDocChange(req.key_name, 'valor_texto', e.target.value)} />
              ) : (
                  <>
                      {doc.currentUrl && !doc.file && (
                          <Chip icon={<OpenInNewIcon />} label="Ver Actual" component="a" href={`${apiHost}/${doc.currentUrl}`} target="_blank" clickable color="primary" variant="outlined" sx={{ mb: 1, mr: 1 }} />
                      )}
                      <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} size="small" sx={{ mb: 1 }}>
                          {doc.file ? doc.file.name : 'Subir Archivo'}
                          <input type="file" hidden onChange={e => handleDocChange(req.key_name, 'file', e.target.files[0])} />
                      </Button>
                  </>
              )}

              {req.tiene_vencimiento == 1 && (
                  <TextField type="date" label="Vencimiento" InputLabelProps={{ shrink: true }} size="small" sx={{ ml: req.tipo==='file'? 2:0, mt: req.tipo==='text'? 2:0 }} value={doc.fecha_vencimiento || ''} onChange={e => handleDocChange(req.key_name, 'fecha_vencimiento', e.target.value)} />
              )}
          </Box>
      );
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#fff' }}>
        <Stack direction="row" justifyContent="space-between" mb={3}>
            <Typography variant="h4" fontWeight={800}>{isEditing ? `Editar Chofer: ${baseData.nombre}` : 'Nuevo Chofer'}</Typography>
            <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={() => navigate(-1)}>Cancelar</Button>
                <Button variant="contained" disableElevation sx={{ bgcolor: '#0f172a' }} onClick={handleSave}>Guardar Expediente</Button>
            </Stack>
        </Stack>

        <Grid container spacing={4}>
            {/* COLUMNA 1: Datos Base (Duros) */}
            <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight={700} borderBottom="2px solid #0f172a" pb={1} mb={3}>1. Datos Base</Typography>
                <TextField label="Nombre Completo" fullWidth size="small" sx={{ mb: 2 }} value={baseData.nombre} onChange={e => handleBaseChange('nombre', e.target.value)} />
                <TextField type="date" label="Fecha Ingreso" fullWidth size="small" InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} value={baseData.fecha_ingreso} onChange={e => handleBaseChange('fecha_ingreso', e.target.value)} />
                <TextField type="date" label="Fecha Nacimiento" fullWidth size="small" InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} value={baseData.fecha_nacimiento} onChange={e => handleBaseChange('fecha_nacimiento', e.target.value)} />
                <TextField label="CURP" fullWidth size="small" sx={{ mb: 2 }} value={baseData.curp} onChange={e => handleBaseChange('curp', e.target.value)} />
                <TextField label="RFC" fullWidth size="small" sx={{ mb: 2 }} value={baseData.rfc} onChange={e => handleBaseChange('rfc', e.target.value)} />
                <TextField label="Teléfono MEX" fullWidth size="small" sx={{ mb: 2 }} value={baseData.phone_mex} onChange={e => handleBaseChange('phone_mex', e.target.value)} />
                <TextField label="Teléfono USA" fullWidth size="small" sx={{ mb: 2 }} value={baseData.phone_usa} onChange={e => handleBaseChange('phone_usa', e.target.value)} />
            </Grid>

            {/* COLUMNA 2: Dinámicos Personales y Viaje */}
            <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight={700} borderBottom="2px solid #3b82f6" pb={1} mb={3}>2. Personales y RRHH</Typography>
                {reqsPersonales.map(renderDynamicField)}
                {reqsOtros.map(renderDynamicField)}
            </Grid>

            {/* COLUMNA 3: Dinámicos Viaje */}
            <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight={700} borderBottom="2px solid #10b981" pb={1} mb={3}>3. Documentos de Viaje</Typography>
                {reqsViaje.map(renderDynamicField)}
            </Grid>
        </Grid>
    </Box>
  );
};
export default DriverProfile;