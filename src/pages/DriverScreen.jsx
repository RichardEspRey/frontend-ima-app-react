import React, { useState, useCallback } from 'react';
import { Box, Paper, Typography, Grid, Stack, TextField, Button, InputLabel, CircularProgress } from '@mui/material'; 
import 'react-datepicker/dist/react-datepicker.css';
import ModalArchivo from '../components/ModalArchivo.jsx'; 
import Swal from 'sweetalert2';
import DatePicker from 'react-datepicker'; 
import DriverInput from '../components/DriverInput';


const DriverScreen = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [formData, setFormData] = useState({
    nombre: '',
    fechaEntrada: '',
    rfc: '',
    phone_usa: '',
    phone_mex: '',
    visa: ''
  });

  const [documentos, setDocumentos] = useState({});
  const [mostrarFechaVencimientoModal, setMostrarFechaVencimientoModal] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [campoActual, setCampoActual] = useState(null);

  // ** LÓGICA DE MANEJO DE ESTADO **
  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleGuardarDocumento = (campo, data) => {
    setDocumentos(prev => ({
      ...prev,
      [campo]: data
    }));
  };

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
    if (['INE', 'Acta_Nacimiento', 'CURP', 'Comprobante_domicilio', 'Constancia', 'Solicitud_empleo', 'Atidoping'].includes(campo)) {
      setMostrarFechaVencimientoModal(false);
    } else {
      setMostrarFechaVencimientoModal(true);
    }
  };


  // ** LÓGICA DE ENVÍO AL BACKEND **
  const envioDatosPrincipal = useCallback(async () => { 
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('op', 'Alta'); 
      formDataToSend.append('name', formData.nombre);
      formDataToSend.append('fecha_ingreso', formData.fechaEntrada);
      formDataToSend.append('rfc', formData.rfc);
      formDataToSend.append('visa', formData.visa);
      formDataToSend.append('phone_mex', formData.phone_mex);
      formDataToSend.append('phone_usa', formData.phone_usa);

      const response = await fetch(`${apiHost}/drivers.php`, {
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
      alert('Error al conectar con el servidor');
    }
  }, [apiHost, formData]);
  
  const enviarDocumentos = useCallback(async (idConductor) => { 
    const entries = Object.entries(documentos); 
    let success = true;

    for (const [tipo_documento, { file, vencimiento }] of entries) {
      const formDataFile = new FormData();
      formDataFile.append('op', 'Alta');
      formDataFile.append('driver_id', idConductor);
      formDataFile.append('tipo_documento', tipo_documento);
      formDataFile.append('fecha_vencimiento', vencimiento);
      formDataFile.append('documento', file);

      try {
        const response = await fetch(`${apiHost}/drivers_docs.php`, {
          method: 'POST',
          body: formDataFile,
        });

        const result = await response.json();
        if (result.status !== 'success') success = false;
        console.log(`Documento ${tipo_documento} enviado:`, result);

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
        const popup = Swal.getPopup();
        if (popup) {
            Swal.showLoading();
            const b = popup.querySelector('b');
            timerInterval = setInterval(() => {
              if (b) b.textContent = `${Date.now() - start}`;
            }, 100);
        }
      },
      willClose: () => clearInterval(timerInterval),
    });

    try {
      const idConductor = await envioDatosPrincipal();
      if (!idConductor) throw new Error('No se obtuvo el ID del conductor');

      const docsSuccess = await enviarDocumentos(idConductor);

      Swal.close();

      await Swal.fire({
        icon: docsSuccess ? 'success' : 'warning', // 🚨 Alerta basada en el éxito de los documentos
        title: docsSuccess ? 'Registro Completo' : 'Registro Parcial',
        text: docsSuccess ? 'Driver y documentos guardados con éxito.' : 'Driver guardado, pero hubo errores en la subida de algunos documentos.',
      });

      // Resetear el formulario
      setFormData({
        nombre: '', fechaEntrada: '', rfc: '', phone_usa: '', phone_mex: '', visa: '',
      });
      setDocumentos({});
    } catch (err) {

      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error de Guardado',
        text: err?.message || 'Ocurrió un error al guardar los datos principales.',
      });
    }
  };


  const cancelar = () => {
    setFormData({
      nombre: '', fechaEntrada: '', rfc: '', phone_usa: '', phone_mex: '', visa: ''
    });
    setDocumentos({});
  }


  return (
    <Box sx={{ p: 3 }}>

      {/* Título Principal */}
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Driver Registration
      </Typography>
      
      {/* Contenedor principal del formulario */}
      <Paper elevation={1} sx={{ p: 3, border: '1px solid #ccc' }}>
        
        {/* Botones de acción (Save / Cancel) */}
        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mb: 3 }}>
          <Button variant="outlined" color="error" onClick={cancelar}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>Save</Button>
        </Stack>

        <Grid container spacing={4}>
            {/* Columna 1: Información Principal y Documentos Personales */}
            <Grid item xs={12} md={4}>
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                    Datos del Conductor
                </Typography>
                
                <TextField
                    label="Name of Driver"
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                />

                <InputLabel sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>Entry Date</InputLabel>
                <TextField
                    type="date"
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                    value={formData.fechaEntrada}
                    onChange={(e) => handleInputChange('fechaEntrada', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                />

                <TextField
                    label="RFC"
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                    value={formData.rfc}
                    onChange={(e) => handleInputChange('rfc', e.target.value)}
                />
                
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1, mt: 3 }}>
                    Documentos Personales (MX)
                </Typography>
                
                <DriverInput label="INE" documentKey="INE" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <DriverInput label="Birth Certificate (PDF)" documentKey="Acta_Nacimiento" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <DriverInput label="CURP (PDF)" documentKey="CURP" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <DriverInput label="Proof of Address (PDF)" documentKey="Comprobante_domicilio" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <DriverInput label="Tax Status (PDF)" documentKey="Constancia" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
            </Grid>

            {/* Columna 2: Documentos de Viaje */}
            <Grid item xs={12} md={4}>
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                    Documentos de Viaje
                </Typography>
                
                <DriverInput label="Visa" documentKey="Visa" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <TextField
                    label="Visa Number"
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                    value={formData.visa}
                    onChange={(e) => handleInputChange('visa', e.target.value)}
                />
                <DriverInput label="I-94 (PDF)" documentKey="I" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <DriverInput label="Licenses (PDF)" documentKey="Licencia" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <DriverInput label="APTO Medico (PDF)" documentKey="APTO" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <DriverInput label="Antidoping" documentKey="Atidoping" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1, mt: 3 }}>
                    Contacto
                </Typography>
                
                <TextField
                    label="Numero celular USA"
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                    value={formData.phone_usa}
                    onChange={(e) => handleInputChange('phone_usa', e.target.value)}
                />
                <TextField
                    label="Phone Number MEX"
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                    value={formData.phone_mex}
                    onChange={(e) => handleInputChange('phone_mex', e.target.value)}
                />
            </Grid>


            {/* Columna 3: Campos sin Asignar / Reserva (Mantener estructura de 3 columnas) */}
            <Grid item xs={12} md={4}>
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                    Otros Documentos
                </Typography>
                
                <DriverInput label="Job Application (PDF)" documentKey="Solicitud_empleo" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                
                {/* Campo de texto de la visa (Lo movemos para estar cerca del documento Visa) 
                <TextField
                    label="Visa Number"
                    fullWidth
                    size="small"
                    sx={{ mb: 2 }}
                    value={formData.visa}
                    onChange={(e) => handleInputChange('visa', e.target.value)}
                /> */}
            </Grid>
        </Grid>
        
        {/* Modal (Fuera del Grid) */}
        <ModalArchivo
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          onSave={(data) => handleGuardarDocumento(campoActual, data)}
          nombreCampo={campoActual}
          valorActual={documentos[campoActual]}
          mostrarFechaVencimiento={mostrarFechaVencimientoModal}
        />
      </Paper>
    </Box>
  );
};

export default DriverScreen;