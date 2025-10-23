import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Button, Grid, Paper, Stack, InputLabel, CircularProgress } from '@mui/material'; 
import './css/ConductoresScreen.css'; 
import 'react-datepicker/dist/react-datepicker.css';
import ModalArchivo from '../components/ModalArchivoEditor.jsx'; 
import Swal from 'sweetalert2';


const ImaScreen = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [formData, setFormData] = useState({
    numero_caja: '',
    numero_placa: '',
    estado_placa: '',
    numero_vin: '',
  });

  const [originalDocumentos, setOriginalDocumentos] = useState({});
  const [loading, setLoading] = useState(true); // Nuevo estado de carga para los documentos

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const [documentos, setDocumentos] = useState({});
  const [modalAbierto, setModalAbierto] = useState(false);
  const [campoActual, setCampoActual] = useState(null);

  const handleGuardarDocumento = (campo, data) => {
    setDocumentos(prev => ({
      ...prev,
      [campo]: data
    }));
  };

  const abrirModal = (campo) => {
    setCampoActual(campo);
    setModalAbierto(true);
  };


  const enviarDocumentos = async () => {
    // ... (Tu lógica de envío se mantiene intacta)
    for (const [tipo_documento, { file, vencimiento }] of Object.entries(documentos)) {
      const original = originalDocumentos[tipo_documento];
      const hayNuevoArchivo = !!file;
      const vencimientoCambio = original?.vencimiento !== vencimiento;

      if (!hayNuevoArchivo && !vencimientoCambio) continue;

      const formDataFile = new FormData();
      formDataFile.append('op', 'Alta');
      formDataFile.append('tipo_documento', tipo_documento);
      formDataFile.append('fecha_vencimiento', vencimiento);
      if (hayNuevoArchivo) formDataFile.append('documento', file);

      try {
        const response = await fetch(`${apiHost}/IMA_Docs.php`, {
          method: 'POST',
          body: formDataFile,
        });

        const result = await response.json();
        console.log(`Documento ${tipo_documento} actualizado:`, result);

        const { isConfirmed } = await Swal.fire({
          icon: 'success',
          title: 'Success',
          text: `Document ${tipo_documento} updated`,
          confirmButtonText: 'Accept'
        });
        
        if (isConfirmed){
            window.location.reload();
        }return;

      } catch (error) {
        console.error(`Error al enviar ${tipo_documento}:`, error);
      }
    }
  };

  const handleSubmit = async () => {
    let cambios = [];

    for (const [tipo, doc] of Object.entries(documentos)) {
      const original = originalDocumentos[tipo];
      const nuevoArchivo = !!doc?.file;
      const cambioVencimiento = original?.vencimiento !== doc?.vencimiento;
      if (nuevoArchivo || cambioVencimiento) {
        cambios.push(`Documento: ${tipo}`);
      }
    }

    if (cambios.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'No changes detected',
        text: 'No changes were detected in the documents.'
      });
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: '¿Confirm changes?',
      html: `<b>Updates detected:</b><br>${cambios.join('<br>')}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, save',
      cancelButtonText: 'Cancel'
    });

    if (!isConfirmed) return;

    await enviarDocumentos();
  };


  const fetchDocs = useCallback(async () => {
    setLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('op', 'getAll');

    try {
      const response = await fetch(`${apiHost}/IMA_Docs.php`, {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (data.status === 'success' && data.Users.length > 0) {
        const documentos = data.Users[0];

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
          const url = documentos[claves.url];
          const fecha = documentos[claves.fecha];

          if (url) {
            nuevosDocumentos[campo] = {
              file: null,
              fileName: url.split('/').pop(),
              vencimiento: fecha || '',
              url: `${apiHost}/${url}`
            };
          }
        });

      setDocumentos(nuevosDocumentos);
      setOriginalDocumentos(nuevosDocumentos);

      }
    } catch (error) {
      console.error('Error al obtener los documentos:', error);
    } finally {
        setLoading(false);
    }
  }, [apiHost]);


  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  
  const DocumentUpload = ({ label, documentKey, accept = '.pdf' }) => {
    const doc = documentos[documentKey];
    
    // Función para manejar la limpieza del documento
    const handleClear = (e) => {
        e.stopPropagation();
        setDocumentos(prev => {
            const newState = { ...prev };
            delete newState[documentKey];
            return newState;
        });
    };

    return (
        <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column' }}>
            <InputLabel sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem' }}>{label}</InputLabel>
            
            <Stack direction="row" spacing={1} alignItems="center">
                <Button 
                    variant="outlined" 
                    onClick={() => abrirModal(documentKey)}
                    size="small"
                    sx={{ width: 150 }}
                >
                    {doc ? 'Reemplazar' : 'Subir Documento'}
                </Button>
                
                {doc ? (
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: 1, 
                            flexGrow: 1, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            bgcolor: '#f5f5f5'
                        }}
                    >
                        <Typography variant="body2" sx={{ mr: 1 }}>
                            {doc.fileName} | Vence: {doc.vencimiento || 'N/A'}
                        </Typography>
                        <Button 
                            color="error" 
                            size="small" 
                            onClick={handleClear}
                            sx={{ minWidth: 'unset', p: 0.5 }}
                        >
                            X
                        </Button>
                    </Paper>
                ) : (
                    <Typography variant="body2" color="text.secondary">Sin Archivo</Typography>
                )}
            </Stack>
        </Box>
    );
  };

  if (loading) {
      return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}> 
              <CircularProgress /> 
              <Typography ml={2}>Cargando documentos...</Typography> 
          </Box>
      );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Document Upload IMA EXPRESS LCC
      </Typography>
      
      {/* Contenedor principal del formulario */}
      <Paper elevation={1} sx={{ p: 3, border: '1px solid #ccc' }}>
        
        {/* Botones de acción (Save / Cancel) */}
        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mb: 3 }}>
          <Button variant="outlined" onClick={() => window.location.reload()}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>Save</Button>
        </Stack>

        <Grid container spacing={4}>
            {/* Columna 1: USA Documents */}
            <Grid item xs={12} md={6}>
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                    USA Documents
                </Typography>
                
                <DocumentUpload label="MC (PDF)" documentKey="MC" />
                <DocumentUpload label="W9 (PDF)" documentKey="W9" />
                <DocumentUpload label="IFTA (PDF)" documentKey="IFTA" />
                <DocumentUpload label="2290 (PDF)" documentKey="2290" />
                <DocumentUpload label="Permiso KYU (PDF)" documentKey="Permiso_KYU" />
                <DocumentUpload label="UCR (PDF)" documentKey="UCR" />
                <DocumentUpload label="SCAC (PDF)" documentKey="SCAC" />
            </Grid>

            {/* Columna 2: MEX Documents */}
            <Grid item xs={12} md={6}>
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                    MEX Documents
                </Typography>
                
                <DocumentUpload label="CAAT (PDF)" documentKey="CAAT" />
            </Grid>
        </Grid>
        
        {/* Modal */}
        <ModalArchivo
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          onSave={(data) => handleGuardarDocumento(campoActual, data)}
          nombreCampo={campoActual}
          valorActual={documentos[campoActual]}
        />
      </Paper>
    </Box>
  );
};

export default ImaScreen;