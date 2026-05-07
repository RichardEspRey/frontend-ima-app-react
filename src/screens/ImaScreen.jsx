import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, Typography, Button, Grid, Paper, Stack, InputLabel, 
  CircularProgress, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, MenuItem, FormControlLabel, Switch, IconButton
} from '@mui/material'; 
import DeleteIcon from '@mui/icons-material/Delete';
import AddBoxIcon from '@mui/icons-material/AddBox';
import './css/ConductoresScreen.css'; 
import 'react-datepicker/dist/react-datepicker.css';
import ModalArchivo from '../components/ModalArchivoEditor.jsx'; 
import Swal from 'sweetalert2';

const ImaScreen = () => {
  const apiHost = import.meta.env.VITE_API_HOST;

  // ==========================================
  // 1. SIMULADOR EAV (Para la Junta)
  // ==========================================
  // Estos son los campos que ya existen hoy, cargados como configuración dinámica
  const [configFields, setConfigFields] = useState([
    { id: 'MC', name: 'MC', region: 'USA', type: 'file', hasExpiration: true },
    { id: 'W9', name: 'W9', region: 'USA', type: 'file', hasExpiration: true },
    { id: 'IFTA', name: 'IFTA', region: 'USA', type: 'file', hasExpiration: true },
    { id: '2290', name: '2290', region: 'USA', type: 'file', hasExpiration: true },
    { id: 'Permiso_KYU', name: 'Permiso KYU', region: 'USA', type: 'file', hasExpiration: true },
    { id: 'UCR', name: 'UCR', region: 'USA', type: 'file', hasExpiration: true },
    { id: 'SCAC', name: 'SCAC', region: 'USA', type: 'file', hasExpiration: true },
    { id: 'CAAT', name: 'CAAT', region: 'MEX', type: 'file', hasExpiration: true }
  ]);

  // Modal para agregar nuevos campos (UX/UI)
  const [openConfigModal, setOpenConfigModal] = useState(false);
  const [newField, setNewField] = useState({ name: '', region: 'USA', type: 'file', hasExpiration: true });

  const handleCreateNewField = () => {
    if (!newField.name) return Swal.fire('Oops', 'Dale un nombre al campo', 'warning');
    
    const fieldId = newField.name.replace(/\s+/g, '_');
    setConfigFields([...configFields, { ...newField, id: fieldId }]);
    setOpenConfigModal(false);
    setNewField({ name: '', region: 'USA', type: 'file', hasExpiration: true });
    
    Swal.fire({
      toast: true, position: 'top-end', icon: 'success',
      title: '¡Campo agregado a la interfaz!', showConfirmButton: false, timer: 2000
    });
  };

  const handleDeleteField = (id) => {
    setConfigFields(configFields.filter(f => f.id !== id));
  };


  // ==========================================
  // 2. LÓGICA DE DATOS (Mantiene tu funcionalidad actual)
  // ==========================================
  const [documentos, setDocumentos] = useState({});
  const [textValues, setTextValues] = useState({}); // Para guardar los inputs de texto
  const [originalDocumentos, setOriginalDocumentos] = useState({});
  const [loading, setLoading] = useState(true); 
  const [modalAbierto, setModalAbierto] = useState(false);
  const [campoActual, setCampoActual] = useState(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('op', 'getAll');

    try {
      const response = await fetch(`${apiHost}/IMA_Docs.php`, { method: 'POST', body: formDataToSend });
      const data = await response.json();

      if (data.status === 'success' && data.Users.length > 0) {
        const docs = data.Users[0];
        const camposDoc = {
          MC: { url: 'MC_URL', fecha: 'MC_fecha' },
          W9: { url: 'W9_URL', fecha: 'W9_fecha' },
          IFTA: { url: 'IFTA_URL', fecha: 'IFTA_fecha' },
          '2290': { url: '_2290_URL', fecha: '_2290_fecha' },
          Permiso_KYU: { url: 'Permiso_KYU_URL', fecha: 'Permiso_KYU_fecha' },
          UCR: { url: 'UCR_URL', fecha: 'UCR_fecha' },
          SCAC: { url: 'SCAC_URL', fecha: 'SCAC_fecha' },
          CAAT: { url: 'CAAT_URL', fecha: 'CAAT_fecha' }
        };

        const nuevosDocumentos = {};
        Object.entries(camposDoc).forEach(([campo, claves]) => {
          const url = docs[claves.url];
          const fecha = docs[claves.fecha];
          if (url) {
            nuevosDocumentos[campo] = {
              file: null, fileName: url.split('/').pop(), vencimiento: fecha || '', url: `${apiHost}/${url}`
            };
          }
        });
        setDocumentos(nuevosDocumentos);
        setOriginalDocumentos(nuevosDocumentos);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
        setLoading(false);
    }
  }, [apiHost]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const handleGuardarDocumento = (campo, data) => {
    setDocumentos(prev => ({ ...prev, [campo]: data }));
  };

  const abrirModal = (campo) => {
    setCampoActual(campo);
    setModalAbierto(true);
  };

  const handleSubmit = async () => {
    Swal.fire('Simulación', 'Para propósitos de la junta, el guardado de los nuevos campos dinámicos se conectará a la BD en la siguiente fase.', 'info');
  };

  // ==========================================
  // 3. RENDERIZADORES DINÁMICOS
  // ==========================================
  
  // Renderizador para subir archivos
  const DocumentUpload = ({ field }) => {
    const doc = documentos[field.id];
    
    const handleClear = (e) => {
        e.stopPropagation();
        setDocumentos(prev => {
            const newState = { ...prev };
            delete newState[field.id];
            return newState;
        });
    };

    return (
        <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <InputLabel sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#1976d2' }}>
                  {field.name} (PDF) {field.hasExpiration && ''}
                </InputLabel>
                <IconButton size="small" color="error" onClick={() => handleDeleteField(field.id)}><DeleteIcon fontSize="small" /></IconButton>
            </Box>
            
            <Stack direction="row" spacing={1} alignItems="center">
                <Button variant="outlined" onClick={() => abrirModal(field.id)} size="small" sx={{ width: 150 }}>
                    {doc ? 'Reemplazar' : 'Subir Documento'}
                </Button>
                
                {doc ? (
                    <Paper variant="outlined" sx={{ p: 1, flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#f5f5f5' }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                            {doc.fileName} {field.hasExpiration && `| Vence: ${doc.vencimiento || 'N/A'}`}
                        </Typography>
                        <Button color="error" size="small" onClick={handleClear} sx={{ minWidth: 'unset', p: 0.5 }}>X</Button>
                    </Paper>
                ) : (
                    <Typography variant="body2" color="text.secondary">Sin Archivo</Typography>
                )}
            </Stack>
        </Box>
    );
  };

  // Renderizador para inputs de texto normales
  const TextInputField = ({ field }) => {
      return (
        <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <InputLabel sx={{ fontWeight: 600, fontSize: '0.9rem', color: '#388e3c' }}>{field.name}</InputLabel>
                <IconButton size="small" color="error" onClick={() => handleDeleteField(field.id)}><DeleteIcon fontSize="small" /></IconButton>
            </Box>
            <TextField 
                fullWidth size="small" 
                placeholder={`Ingresa ${field.name}...`}
                value={textValues[field.id] || ''}
                onChange={(e) => setTextValues({...textValues, [field.id]: e.target.value})}
            />
        </Box>
      )
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}> <CircularProgress /> <Typography ml={2}>Cargando documentos...</Typography> </Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4" component="h1" fontWeight={700}>
            Gestión Dinámica de Documentos (IMA)
          </Typography>
          <Button 
            variant="contained" 
            color="info" 
            startIcon={<AddBoxIcon />}
            onClick={() => setOpenConfigModal(true)}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            + Configurar Nuevo Requisito
          </Button>
      </Stack>
      
      <Paper elevation={1} sx={{ p: 3, border: '1px solid #ccc', borderRadius: 3 }}>
        
        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mb: 3 }}>
          <Button variant="outlined" onClick={() => window.location.reload()}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>Guardar Todo</Button>
        </Stack>

        <Grid container spacing={4}>
            {/* ================================== */}
            {/* COLUMNA USA */}
            {/* ================================== */}
            <Grid item xs={12} md={6}>
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '2px solid #1976d2', pb: 1, color: '#1976d2' }}>
                    USA Requirements
                </Typography>
                <Box sx={{ mt: 3 }}>
                    {configFields.filter(f => f.region === 'USA').map(field => (
                        field.type === 'file' ? <DocumentUpload key={field.id} field={field} /> : <TextInputField key={field.id} field={field} />
                    ))}
                    {configFields.filter(f => f.region === 'USA').length === 0 && (
                        <Typography color="text.secondary" fontStyle="italic">No hay requisitos configurados para USA.</Typography>
                    )}
                </Box>
            </Grid>

            {/* ================================== */}
            {/* COLUMNA MEX */}
            {/* ================================== */}
            <Grid item xs={12} md={6}>
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '2px solid #388e3c', pb: 1, color: '#388e3c' }}>
                    MEX Requirements
                </Typography>
                <Box sx={{ mt: 3 }}>
                    {configFields.filter(f => f.region === 'MEX').map(field => (
                        field.type === 'file' ? <DocumentUpload key={field.id} field={field} /> : <TextInputField key={field.id} field={field} />
                    ))}
                    {configFields.filter(f => f.region === 'MEX').length === 0 && (
                        <Typography color="text.secondary" fontStyle="italic">No hay requisitos configurados para MEX.</Typography>
                    )}
                </Box>
            </Grid>
        </Grid>
      </Paper>

      {/* ======================================================= */}
      {/* MODAL PARA CREAR NUEVOS CAMPOS DINÁMICOS */}
      {/* ======================================================= */}
      <Dialog open={openConfigModal} onClose={() => setOpenConfigModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, bgcolor: '#f5f5f5' }}>Configurar Nuevo Requisito</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
            <Stack spacing={3} sx={{ mt: 1 }}>
                <TextField 
                    label="Nombre del Documento o Dato" 
                    fullWidth 
                    value={newField.name}
                    onChange={(e) => setNewField({...newField, name: e.target.value})}
                    placeholder="Ej. Examen Médico, Número de Póliza, etc."
                />
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField 
                            select label="Región" fullWidth
                            value={newField.region}
                            onChange={(e) => setNewField({...newField, region: e.target.value})}
                        >
                            <MenuItem value="USA">USA</MenuItem>
                            <MenuItem value="MEX">MEX</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField 
                            select label="Tipo de Requisito" fullWidth
                            value={newField.type}
                            onChange={(e) => setNewField({...newField, type: e.target.value})}
                        >
                            <MenuItem value="file">Subir Archivo (PDF/IMG)</MenuItem>
                            <MenuItem value="text">Texto (Input Libre)</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>
                
                {newField.type === 'file' && (
                    <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                        <FormControlLabel 
                            control={<Switch checked={newField.hasExpiration} onChange={(e) => setNewField({...newField, hasExpiration: e.target.checked})} />} 
                            label="¿Este documento requiere registrar fecha de vencimiento?" 
                        />
                    </Box>
                )}
            </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenConfigModal(false)}>Cancelar</Button>
            <Button variant="contained" color="primary" onClick={handleCreateNewField}>Añadir a la Pantalla</Button>
        </DialogActions>
      </Dialog>

      <ModalArchivo
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          onSave={(data) => handleGuardarDocumento(campoActual, data)}
          nombreCampo={campoActual}
          valorActual={documentos[campoActual]}
          // Si en la configuración dice que NO tiene expiración, le ocultamos la fecha al modal
          mostrarFechaVencimiento={configFields.find(f => f.id === campoActual)?.hasExpiration ?? true} 
        />
    </Box>
  );
};

export default ImaScreen;