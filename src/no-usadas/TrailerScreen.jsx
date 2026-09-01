import React, { useState, useCallback } from 'react';
import { Box, Paper, Typography, Grid, Stack, TextField, Button, CircularProgress } from '@mui/material'; 
// 🚨 ELIMINAMOS la importación del CSS nativo
import 'react-datepicker/dist/react-datepicker.css';
import ModalArchivo from '../components/ModalArchivo.jsx'; 
import Swal from 'sweetalert2';
// 🚨 Importamos el componente TruckInput (lo usaremos para Cajas/Trailers)
import TruckInput from '../components/TruckInput'; 


const TrailerScreen = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [formData, setFormData] = useState({
    numero_caja: '',
    no_placa: '',
    estado_placa: '',
    numero_vin: '',
  });

  const [documentos, setDocumentos] = useState({});
  const [modalAbierto, setModalAbierto] = useState(false);
  const [campoActual, setCampoActual] = useState(null);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardarDocumento = (campo, data) => {
    setDocumentos(prev => ({
      ...prev,
      [campo]: data
    }));
  };
  
  // Añadimos el handler de limpieza (es buena práctica)
  const handleClearDocument = (documentKey) => {
      setDocumentos(prev => {
          const newState = { ...prev };
          delete newState[documentKey];
          return newState;
      });
  };

  const abrirModal = (campo) => {
    setCampoActual(campo);
    setModalAbierto(true);
  };


  // ** LÓGICA DE ENVÍO AL BACKEND (Envio de datos principales) **
  const envioDatosPrincipal = useCallback(async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('op', 'Alta');
      formDataToSend.append('numero_caja', formData.numero_caja);
      formDataToSend.append('no_placa', formData.no_placa);
      formDataToSend.append('estado_placa', formData.estado_placa);
      formDataToSend.append('no_vin', formData.numero_vin);

      const response = await fetch(`${apiHost}/cajas.php`, {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.status === "success") {
        return result.id;
      } else {
        throw new Error(`Error al guardar datos básicos: ${result.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      throw new Error('Error al conectar con el servidor para guardar datos principales.');
    }
  }, [apiHost, formData]);

  // ** LÓGICA DE ENVÍO AL BACKEND (Envio de documentos) **
  const enviarDocumentos = useCallback(async (caja_id) => {
    const entries = Object.entries(documentos);
    let success = true;

    for (const [tipo_documento, { file, vencimiento }] of entries) {
      const formDataFile = new FormData();
      formDataFile.append('op', 'Alta');
      formDataFile.append('caja_id', caja_id);
      formDataFile.append('tipo_documento', tipo_documento);
      formDataFile.append('fecha_vencimiento', vencimiento);
      formDataFile.append('documento', file);

      try {
        const response = await fetch(`${apiHost}/cajas_docs.php`, {
          method: 'POST',
          body: formDataFile,
        });

        const result = await response.json();
        if (result.status !== "success") success = false;
        
      } catch (error) {
        console.error(`Error al enviar ${tipo_documento}:`, error);
        success = false;
      }
    }
    return success;
  }, [apiHost, documentos]);
  
    const handleSubmit = async () => {
      let timerInterval;
      const start = Date.now();
  
      Swal.fire({
        title: 'Procesando…',
        html: 'Tiempo transcurrido: <b>0</b> ms',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
          const b = Swal.getPopup().querySelector('b');
          timerInterval = setInterval(() => {
            if (b) b.textContent = `${Date.now() - start}`;
          }, 100);
        },
        willClose: () => clearInterval(timerInterval),
      });
  
      try {
        const caja_id = await envioDatosPrincipal(); // Corregido el nombre de la variable a caja_id
        if (!caja_id) throw new Error('No se obtuvo el ID de la caja');
  
        const docsSuccess = await enviarDocumentos(caja_id);
  
        Swal.close();
  
        await Swal.fire({
          icon: docsSuccess ? 'success' : 'warning',
          title: docsSuccess ? 'Éxito' : 'Registro Parcial',
          text: docsSuccess ? 'Caja dada de alta!' : 'Caja registrada, pero algunos documentos fallaron.',
        });
  
        // Limpieza (Reset)
        setFormData({
          numero_caja: '',
          no_placa: '',
          estado_placa: '',
          numero_vin: '',
        });
        setDocumentos({});
      } catch (err) {
  
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err?.message || 'Ocurrió un problema al guardar.',
        });
      }
    };


  const cancelar = () => {
    setFormData({
        numero_caja: '',
        no_placa: '',
        estado_placa: '',
        numero_vin: '',
      });

      setDocumentos({});
  }

  return (
    <Box sx={{ p: 3 }}>

      {/* Título Principal */}
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Alta de Caja (Trailer)
      </Typography>
      
      {/* Contenedor principal del formulario */}
      <Paper elevation={1} sx={{ p: 3, border: '1px solid #ccc' }}>
        
        {/* Botones de acción (Save / Cancel) */}
        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mb: 3 }}>
          <Button variant="outlined" color="error" onClick={cancelar}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>Guardar</Button>
        </Stack>

        {/* 🚨 ESTRUCTURA DE DOS COLUMNAS (6/6) PARA UN MEJOR ACOMODO */}
        <Grid container spacing={4}>
          
          {/* Columna 1: Datos Generales */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                Registros Generales
            </Typography>
            
            <TextField label="Número de caja" fullWidth size="small" sx={{ mb: 2 }} value={formData.numero_caja} onChange={(e) => handleInputChange('numero_caja', e.target.value)} />
            <TextField label="Placa" fullWidth size="small" sx={{ mb: 2 }} value={formData.no_placa} onChange={(e) => handleInputChange('no_placa', e.target.value)} />
            <TextField label="Estado de Placa" fullWidth size="small" sx={{ mb: 2 }} value={formData.estado_placa} onChange={(e) => handleInputChange('estado_placa', e.target.value)} />
            <TextField label="Número de VIN" fullWidth size="small" sx={{ mb: 2 }} value={formData.numero_vin} onChange={(e) => handleInputChange('numero_vin', e.target.value)} />
          </Grid>
              
          {/* Columna 2: Documentos (Unificado) */}
          <Grid item xs={12} md={6}>
            <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                Documentos de Cumplimiento
            </Typography>

            <TruckInput label="Registracion (PDF)" documentKey="Registracion" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
            <TruckInput label="Seguro (PDF)" documentKey="seguro" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
            <TruckInput label="Cab Card (PDF)" documentKey="CAB_CARD" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
            <TruckInput label="Fianza (PDF)" documentKey="Fianza" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
            <TruckInput label="Certificado de fumigación (PDF)" documentKey="CERTIFICADO" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
          </Grid>

        </Grid>
        
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

export default TrailerScreen;