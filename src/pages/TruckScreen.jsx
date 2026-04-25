import { useState, useCallback } from 'react';
import { Box, Paper, Typography, Grid, Stack, TextField, Button, CircularProgress } from '@mui/material'; 
import 'react-datepicker/dist/react-datepicker.css';
import ModalArchivo from '../core/ui/ModalArchivo.jsx'; 
import Swal from 'sweetalert2';
import TruckInput from '../features/vehicles/components/TruckInput.jsx';


const TruckScreen = () => {
   const apiHost = import.meta.env.VITE_API_HOST;
  const [formData, setFormData] = useState({
    Unidad: '', PlacaMX: '', PlacaEUA: '', Modelo: '',
    Marca: '', Numero: '', Tag: ''
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


  // ** LÓGICA DE ENVÍO AL BACKEND (se mantiene) **
  const envioDatosPrincipal = useCallback(async () => { /* ... */
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('op', 'Alta'); 
      formDataToSend.append('Unidad', formData.Unidad);
      formDataToSend.append('PlacaMX', formData.PlacaMX);
      formDataToSend.append('PlacaEUA', formData.PlacaEUA);
      formDataToSend.append('Modelo', formData.Modelo);
      formDataToSend.append('Marca', formData.Marca);
      formDataToSend.append('Numero', formData.Numero);
      formDataToSend.append('Tag', formData.Tag);

      const response = await fetch(`${apiHost}/trucks.php`, {
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

  const enviarDocumentos = useCallback(async (truck_id) => {
    const entries = Object.entries(documentos); 
    let success = true;

    for (const [tipo_documento, { file, vencimiento }] of entries) {
      const formDataFile = new FormData();
      formDataFile.append('op', 'Alta');
      formDataFile.append('truck_id', truck_id);
      formDataFile.append('tipo_documento', tipo_documento);
      formDataFile.append('fecha_vencimiento', vencimiento);
      formDataFile.append('documento', file);

      try {
          const response = await fetch(`${apiHost}/trucks_docs.php`, {
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


  const handleSubmit = async () => { /* ... */
    let timerInterval;
    const start = Date.now();

    Swal.fire({
      title: 'Procesando…',
      html: 'Tiempo transcurrido: <b>0</b> ms',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
        const b = Swal.getPopup().querySelector('b');
        timerInterval = setInterval(() => { if (b) b.textContent = `${Date.now() - start}`; }, 100);
      },
      willClose: () => clearInterval(timerInterval),
    });

    try {
      const truck_id = await envioDatosPrincipal();
      if (!truck_id) throw new Error('No se obtuvo el ID del camión');

      const docsSuccess = await enviarDocumentos(truck_id);

      Swal.close();

      await Swal.fire({
        icon: docsSuccess ? 'success' : 'warning',
        title: docsSuccess ? 'Éxito' : 'Registro Parcial',
        text: docsSuccess ? 'Camión dado de alta!' : 'Camión registrado, pero algunos documentos fallaron.',
      });

      // Limpieza (Reset)
      setFormData({ Unidad: '', PlacaMX: '', PlacaEUA: '', Modelo: '', Marca: '', Numero: '', Tag: '' });
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
    setFormData({ Unidad: '', PlacaMX: '', PlacaEUA: '', Modelo: '', Marca: '', Numero: '', Tag: '' });
    setDocumentos({});
  }


  return (
    <Box sx={{ p: 3 }}>

      {/* Título Principal */}
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Alta de Camión
      </Typography>
      
      {/* Contenedor principal del formulario */}
      <Paper elevation={1} sx={{ p: 3, border: '1px solid #ccc' }}>
        
        {/* Botones de acción (Save / Cancel) */}
        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mb: 3 }}>
          <Button variant="outlined" color="error" onClick={cancelar}>Cancelar</Button>
          <Button variant="contained" color="primary" onClick={handleSubmit}>Guardar</Button>
        </Stack>

        <Grid container spacing={4}>
          
            <Grid item xs={12} md={4} 
                // 🚨 AÑADIMOS ESTOS ESTILOS PARA FORZAR LA FLEXIBILIDAD Y MINIMIZAR EL ANCHO 🚨
                sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    minWidth: 0, /* Permite que el contenido interno se encoja */
                    px: 2 /* Asegura padding lateral */
                }}
            >
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                    Registros Generales
                </Typography>
                
                {/* Aseguramos que los TextFields usen 100% de ese espacio flexible */}
                <TextField label="Unidad" fullWidth size="small" sx={{ mb: 2 }} value={formData.Unidad} onChange={(e) => handleInputChange('Unidad', e.target.value)} />
                <TextField label="Placa MEX" fullWidth size="small" sx={{ mb: 2 }} value={formData.PlacaMX} onChange={(e) => handleInputChange('PlacaMX', e.target.value)} />
                <TextField label="Placa USA" fullWidth size="small" sx={{ mb: 2 }} value={formData.PlacaEUA} onChange={(e) => handleInputChange('PlacaEUA', e.target.value)} />
                <TextField label="Modelo (Año)" fullWidth size="small" sx={{ mb: 2 }} value={formData.Modelo} onChange={(e) => handleInputChange('Modelo', e.target.value)} />
                <TextField label="Marca de camion" fullWidth size="small" sx={{ mb: 2 }} value={formData.Marca} onChange={(e) => handleInputChange('Marca', e.target.value)} />
                <TextField label="Numero de VIN" fullWidth size="small" sx={{ mb: 2 }} value={formData.Numero} onChange={(e) => handleInputChange('Numero', e.target.value)} />
            </Grid>
              
            <Grid item xs={12} md={4}>
               <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                    Registros USA
                </Typography>

                {/* Documentos USA */}
                <TruckInput label="Registracion" documentKey="registracion" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <TruckInput label="Cab Card (PDF)" documentKey="CAB" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <TruckInput label="COI (PDF)" documentKey="COI" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <TruckInput label="Inspección mecánica (PDF)" documentKey="mecanica" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <TruckInput label="TX DMV (PDF)" documentKey="TX_DMV" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <TruckInput label="PERMISO NY (PDF)" documentKey="PERMISO_NY" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <TruckInput label="PERMISO NM (PDF)" documentKey="PERMISO_NM" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <TruckInput label="DTOPS (PDF)" documentKey="dtops" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                
                <TextField label="Laredo TAG" fullWidth size="small" sx={{ mb: 2, mt: 2 }} value={formData.Tag} onChange={(e) => handleInputChange('Tag', e.target.value)} />
            </Grid>
            
            <Grid item xs={12} md={4}>
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                    Registros MEX
                </Typography>
                
                {/* Documentos MEX */}
                <TruckInput label="Tarjeta de circulación (PDF)" documentKey="Tarjeta_circulacion" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <TruckInput label="Inspección fisio-mecanica (PDF)" documentKey="Inspecccion_fisio_Mecanica" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <TruckInput label="Inspección humos (PDF)" documentKey="Inspecion_humos" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <TruckInput label="Puente fideicomiso (PDF)" documentKey="fideicomiso" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <TruckInput label="Seguro (PDF)" documentKey="seguro" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
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

export default TruckScreen;