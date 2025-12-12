import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Paper, Typography, Grid, TextField, Button, Stack, 
  CircularProgress, InputAdornment, Card, CardMedia
} from '@mui/material';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import Swal from 'sweetalert2';

// Iconos
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

const apiHost = import.meta.env.VITE_API_HOST;

const cleanValue = (val) => {
    if (!val) return '';
    const strVal = String(val).trim();
    if (strVal === '0' || strVal === '0.00') return '';
    return strVal;
};

const DieselEditor = () => {
  const navigate = useNavigate();
  const { id, trip_id } = useParams();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    id: '',
    trip_id: '',
    nombre: '',
    estado: '', 
    odometro: '',
    galones: '',
    monto: '',
    fleetone: '', 
    trip_number: ''
  });

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ** LÓGICA DE ACTUALIZACIÓN **
  const actualizar = async () => {
    try {
      const required = ["odometro", "galones", "monto"];
      const vacios = required.filter(
        k => String(formData[k] ?? "").trim() === ""
      );
      if (vacios.length) {
        Swal.fire({
          icon: "warning",
          title: "Campos vacíos",
          text: `Faltan: ${vacios.join(", ")}`,
        });
        return;
      }

      const odometroNum = Number(formData.odometro);
      const galonesNum = Number(formData.galones);
      const montoNum = Number(formData.monto);

      if (!Number.isFinite(odometroNum) || odometroNum <= 0) {
        Swal.fire({ icon: "warning", title: "Odómetro inválido", text: "Debe ser un número mayor a 0." });
        return;
      }
      if (!Number.isFinite(galonesNum) || galonesNum <= 0) {
        Swal.fire({ icon: "warning", title: "Galones inválidos", text: "Debe ser un número mayor a 0." });
        return;
      }
      if (!Number.isFinite(montoNum) || montoNum <= 0) {
        Swal.fire({ icon: "warning", title: "Monto inválido", text: "Debe ser un número mayor a 0." });
        return;
      }

      // 3) Construcción del payload
      const formDataToSend = new FormData();
      formDataToSend.append("op", "edit_diesel");
      formDataToSend.append("id", formData.id);
      formDataToSend.append("trip_id", formData.trip_id);
      formDataToSend.append("nombre", formData.nombre);
      
      formDataToSend.append("estado", formData.estado); 
      formDataToSend.append("fleetone", formData.fleetone);

      formDataToSend.append("odometro", String(odometroNum));
      formDataToSend.append("galones", String(galonesNum));
      formDataToSend.append("monto", String(montoNum));

      const response = await fetch(`${apiHost}/formularios.php`, {
        method: "POST",
        body: formDataToSend,
      });
      const result = await response.json();

      if (result.status === "success" && result.row?.[0]?.resp == 1) {
        await Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Cambios realizados con éxito.",
          timer: 1500,
          showConfirmButton: false
        });
        navigate(`/detalle-diesel/${trip_id}`);
      } else {
        throw new Error("Error al guardar datos básicos");
      }

    } catch (error) {
      console.error("Error al enviar los datos:", error);
      Swal.fire("Error", "Error al conectar con el servidor", "error");
    }
  };

  // ** LÓGICA DE ELIMINACIÓN **
  const eliminar = async () => {
    const result = await Swal.fire({
      title: '¿Eliminar registro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({ title: 'Eliminando…', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

      const formData = new FormData();
      formData.append('op', 'delete_diesel');
      formData.append('id', id); 

      const resp = await fetch(`${apiHost}/formularios.php`, { method: 'POST', body: formData });
      const data = await resp.json();
      Swal.close();

      if (data.status === 'success') {
        await Swal.fire({ icon: 'success', title: 'Eliminado', text: 'Registro eliminado correctamente.', timer: 1500, showConfirmButton: false });
        navigate(trip_id ? `/detalle-diesel/${trip_id}` : '/admin-diesel');
      } else {
        throw new Error(data.message || 'No se pudo eliminar el registro');
      }
    } catch (err) {
      Swal.close();
      Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'Ocurrió un problema al eliminar.' });
    }
  };

  // ** FETCH DATA **
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
        const fdReg = new FormData();
        fdReg.append('op', 'get_diesel');
        fdReg.append('id', id);
        fdReg.append('trip_id', trip_id);

        const respReg = await fetch(`${apiHost}/formularios.php`, { method: 'POST', body: fdReg });
        const dataReg = await respReg.json();

        if (dataReg.status === 'success' && dataReg.row && dataReg.row[0]) {
            const row = dataReg.row[0];
            setFormData({
                id: row.id || '',
                trip_number: row.trip_number || '',
                trip_id: row.trip_id || '',
                monto: row.monto || '',
                fecha: row.fecha || '',
                odometro: row.odometro || '',
                galones: row.galones || '',
                nombre: row.nombre || '',
                
                estado: cleanValue(row.estado),
                fleetone: cleanValue(row.fleetone)
            });
        }
        
        // 2. Fetch Tickets
        const fdTick = new FormData();
        fdTick.append('op', 'getTickets');
        fdTick.append('id', id);
        fdTick.append('trip_id', trip_id);
        fdTick.append('opcion', 'diesel');

        const respTick = await fetch(`${apiHost}/formularios.php`, { method: 'POST', body: fdTick });
        const jsonTick = await respTick.json();

        if (jsonTick.status === 'success' && Array.isArray(jsonTick.data)) {
            const list = jsonTick.data
              .filter(it => typeof it.url_pdf === 'string' && it.url_pdf)
              .map(it => {
                const ext = (it.url_pdf.split('.').pop() || '').toLowerCase();
                const url = it.url_pdf.startsWith('http')
                  ? it.url_pdf
                  : `${apiHost}/${it.url_pdf}`.replace(/([^:]\/)\/+/g, '$1');
                return { ...it, url, ext };
              });
            setTickets(list);
        } else {
            setTickets([]);
        }

    } catch (error) {
        console.error('Error cargando datos:', error);
    } finally {
        setLoading(false);
    }
  }, [apiHost, id, trip_id]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const cancelar = () => { navigate(`/detalle-diesel/${trip_id}`); }

  if (loading) {
      return (<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', p: 3 }}><CircularProgress /><Typography ml={2}>Cargando editor...</Typography></Box>);
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight={700}>Diesel Log Editor</Typography>
          <Stack direction="row" spacing={2}>
             <Button variant="outlined" color="inherit" startIcon={<ArrowBackIcon />} onClick={cancelar}>Cancel</Button>
             <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={eliminar}>Delete</Button>
             <Button variant="contained" color="primary" startIcon={<SaveIcon />} onClick={actualizar}>Save Changes</Button>
          </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 3, border: '1px solid #ccc' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 3 }}>
                    Detalles del Registro
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12}><TextField label="Trip Number" value={formData.trip_number} fullWidth size="small" disabled variant="filled" /></Grid>
                    <Grid item xs={12}><TextField label="Driver" value={formData.nombre} fullWidth size="small" disabled variant="filled" /></Grid>
                    
                    <Grid item xs={12} sm={6}>
                        <TextField
                            label="State"
                            value={formData.estado}
                            onChange={(e) => handleInputChange('estado', e.target.value)}
                            fullWidth size="small"
                            placeholder="e.g. TX, NM"
                        />
                    </Grid>
                     <Grid item xs={12} sm={6}>
                        <TextField
                            label="Fleet One ($)"
                            value={formData.fleetone}
                            onChange={(e) => handleInputChange('fleetone', e.target.value)}
                            fullWidth size="small"
                            type="number"
                            placeholder="0.00"
                        />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}><TextField label="Odometer" type="number" value={formData.odometro} onChange={(e) => handleInputChange('odometro', e.target.value)} fullWidth size="small" InputProps={{ endAdornment: <InputAdornment position="end">mi</InputAdornment> }} /></Grid>
                    <Grid item xs={12} sm={6}><TextField label="Gallons" type="number" value={formData.galones} onChange={(e) => handleInputChange('galones', e.target.value)} fullWidth size="small" InputProps={{ endAdornment: <InputAdornment position="end">gal</InputAdornment> }} /></Grid>
                    <Grid item xs={12}><TextField label="Total Cost" type="number" value={formData.monto} onChange={(e) => handleInputChange('monto', e.target.value)} fullWidth size="small" InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} /></Grid>
                </Grid>
            </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
            <Paper elevation={1} sx={{ p: 3, border: '1px solid #ccc', height: '100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 3 }}>
                    Tickets & Evidencia
                </Typography>

                <PhotoProvider>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {tickets.length === 0 ? (
                            <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>No hay documentos adjuntos.</Typography>
                        ) : (
                            tickets.map((item) => {
                                const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(item.ext);
                                if (isImage) {
                                    return (
                                        <PhotoView key={item.id} src={item.url}>
                                            <Card sx={{ width: 120, cursor: 'zoom-in' }}>
                                                <CardMedia component="img" height="120" image={item.url} alt={`ticket ${item.id}`} sx={{ objectFit: 'cover' }} />
                                            </Card>
                                        </PhotoView>
                                    );
                                } else {
                                    return (
                                        <Card key={item.id} sx={{ width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f5f5' }} variant="outlined">
                                            <Button href={item.url} target="_blank" rel="noreferrer" sx={{ display: 'flex', flexDirection: 'column', textTransform: 'none', height: '100%', width: '100%' }}>
                                                <PictureAsPdfIcon sx={{ fontSize: 40, color: '#d32f2f', mb: 1 }} />
                                                <Typography variant="caption" align="center" sx={{ lineHeight: 1.2 }}>Ver Archivo</Typography>
                                            </Button>
                                        </Card>
                                    );
                                }
                            })
                        )}
                    </Box>
                </PhotoProvider>
            </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DieselEditor;