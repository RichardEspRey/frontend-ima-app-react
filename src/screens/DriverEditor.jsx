import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { Box, Paper, Typography, Grid, Stack, TextField, Button, InputLabel, CircularProgress } from '@mui/material'; 

// import './css/ConductoresScreen.css'; 
import 'react-datepicker/dist/react-datepicker.css';
import ModalArchivo from '../components/ModalArchivo.jsx'; 
import DriverInput from '../components/DriverInput';
import Swal from 'sweetalert2';


const DriverEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams(); 
  
  const apiHost = import.meta.env.VITE_API_HOST;

  const [formData, setFormData] = useState({
    nombre: '', fechaNacimiento: '', fechaEntrada: '', curp: '', rfc: '',
    phone_usa: '', phone_mex: '', visa: '', licencia: ''
  });

  const [documentos, setDocumentos] = useState({});
  const [modalAbierto, setModalAbierto] = useState(false);
  const [campoActual, setCampoActual] = useState(null);
  const [mostrarFechaVencimientoModal, setMostrarFechaVencimientoModal] = useState(true);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [originalDocumentos, setOriginalDocumentos] = useState({});
  const [loading, setLoading] = useState(true); 

  // ** LÓGICA DE ESTADO Y MODAL **
  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuardarDocumento = (campo, data) => {
    setDocumentos(prev => ({ ...prev, [campo]: data }));
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

  // ** LÓGICA DE FETCH (CARGA DE DATOS) **
  const fetchDrivers = useCallback(async () => {
    setLoading(true);
    const formDataToSend = new FormData();
    formDataToSend.append('op', 'getDriverEdit');
    formDataToSend.append('driver_id', id);

    try {
      const response = await fetch(`${apiHost}/drivers.php`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();
      
      if (data.status === 'success' && data.Users && data.Users.length > 0) {
        const user = data.Users[0];
        const formValues = {
          nombre: user.nombre || '', fechaNacimiento: user.fecha_nacimiento || '', 
          fechaEntrada: user.fecha_ingreso || '', curp: user.curp || '', 
          rfc: user.rfc || '', phone_usa: user.phone_usa || '', 
          phone_mex: user.phone_mex || '', visa: user.visa || '', 
          licencia: user.licencia || ''
        };

        setOriginalFormData(formValues);
        setFormData(formValues);

        const nuevosDocumentos = {};
        const campos = [
          'Acta_Nacimiento', 'CURP', 'RFC', 'Comprobante_domicilio', 'Solicitud_empleo', 'INE', 'Visa', 'Licencia',
          'I', 'APTO', 'Atidoping', 'Constancia'
        ];

        campos.forEach((campo) => {
          if (user[`${campo}_URL`]) {
            nuevosDocumentos[campo] = {
              file: null,
              fileName: user[`${campo}_URL`].split('/').pop(),
              vencimiento: user[`${campo}_fecha`] || '',
              url: `${apiHost}/${user[`${campo}_URL`]}`
            };
          }
        });

        setDocumentos(nuevosDocumentos);
        setOriginalDocumentos(nuevosDocumentos);
      }

    } catch (error) {
      console.error('Error al obtener los conductores:', error);
    } finally {
        setLoading(false);
    }
  }, [apiHost, id]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);


  // ** LÓGICA DE GUARDADO (Detección de cambios y envío) **
  const envioDatosPrincipal = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('op', 'editDriver');
      formDataToSend.append('driver_id', id); 

      // Detección de cambios campo por campo
      if (formData.nombre !== originalFormData.nombre) formDataToSend.append('nombre', formData.nombre);
      if (formData.fechaNacimiento !== originalFormData.fechaNacimiento) formDataToSend.append('fecha_nacimiento', formData.fechaNacimiento);
      if (formData.fechaEntrada !== originalFormData.fechaEntrada) formDataToSend.append('fecha_ingreso', formData.fechaEntrada);
      if (formData.curp !== originalFormData.curp) formDataToSend.append('curp', formData.curp);
      if (formData.rfc !== originalFormData.rfc) formDataToSend.append('rfc', formData.rfc);
      if (formData.phone_mex !== originalFormData.phone_mex) formDataToSend.append('phone_mex', formData.phone_mex);
      if (formData.phone_usa !== originalFormData.phone_usa) formDataToSend.append('phone_usa', formData.phone_usa);
      if (formData.visa !== originalFormData.visa) formDataToSend.append('visa', formData.visa);
      if (formData.licencia !== originalFormData.licencia) formDataToSend.append('licencia', formData.licencia);

      if (formDataToSend.entries().next().done) return null; // No hay cambios en campos de texto

      const response = await fetch(`${apiHost}/drivers.php`, { method: 'POST', body: formDataToSend });
      const result = await response.json();

      if (result.status === "success") {
        return id;
      } else {
        throw new Error("Error al guardar datos básicos");
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      alert('Error al conectar con el servidor');
    }
  };

  const enviarDocumentos = async (idConductor) => {
    const entries = Object.entries(documentos);
    let success = true;

    for (const [tipo_documento, { file, vencimiento }] of entries) {
      const original = originalDocumentos[tipo_documento];
      const hayNuevoArchivo = !!file;
      const vencimientoCambio = original?.vencimiento !== vencimiento;

      if (!hayNuevoArchivo && !vencimientoCambio) continue; 

      const formDataFile = new FormData();
      formDataFile.append('op', 'Update');
      formDataFile.append('driver_id', idConductor);
      formDataFile.append('tipo_documento', tipo_documento);
      formDataFile.append('fecha_vencimiento', vencimiento);
      if (hayNuevoArchivo) formDataFile.append('documento', file);

      try {
        const response = await fetch(`${apiHost}/drivers_docs.php`, { method: 'POST', body: formDataFile });
        const result = await response.json();
        if (result.status !== 'success') success = false;
        Swal.fire({ icon: 'success', title: 'Éxito', text: `Documentos actualizados` });
      } catch (error) {
        console.error(`Error al enviar ${tipo_documento}:`, error);
        success = false;
      }
    }
    return success;
  };

  const handleSubmit = async () => {
    const cambios = [];

    // Detección de cambios de campos de texto
    if (formData.nombre !== originalFormData.nombre) cambios.push('Nombre');
    if (formData.fechaNacimiento !== originalFormData.fechaNacimiento) cambios.push('Fecha de nacimiento');
    if (formData.curp !== originalFormData.curp) cambios.push('CURP');
    if (formData.rfc !== originalFormData.rfc) cambios.push('RFC');
    if (formData.phone_usa !== originalFormData.phone_usa) cambios.push('Teléfono USA');
    if (formData.phone_mex !== originalFormData.phone_mex) cambios.push('Teléfono MEX');
    if (formData.fechaEntrada !== originalFormData.fechaEntrada) cambios.push('Fecha de entrada');
    if (formData.visa !== originalFormData.visa) cambios.push('Visa');
    if (formData.licencia !== originalFormData.licencia) cambios.push('Licencia');

    // Detección de cambios en los documentos
    let hayCambiosEnDocumentos = false;
    for (const [tipo, doc] of Object.entries(documentos)) {
      const original = originalDocumentos[tipo];
      const nuevoArchivo = !!doc?.file;
      const cambioVencimiento = original?.vencimiento !== doc?.vencimiento;

      if (nuevoArchivo || cambioVencimiento) {
        hayCambiosEnDocumentos = true;
        cambios.push(`Documento: ${tipo}`);
      }
    }

    if (cambios.length === 0 && !hayCambiosEnDocumentos) {
      Swal.fire({ icon: 'info', title: 'Sin cambios', text: 'No se detectaron cambios en campos ni documentos' });
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: '¿Confirmar cambios?',
      html: `<b>Modificaciones detectadas:</b><br>${cambios.join('<br>')}`,
      icon: 'question', showCancelButton: true, confirmButtonText: 'Sí, guardar', cancelButtonText: 'Cancelar'
    });

    if (!isConfirmed) return;

    // 1. Enviar cambios de campos de texto (si existen)
    if (cambios.some(c => !c.startsWith('Documento'))) {
      await envioDatosPrincipal();
      Swal.fire({ icon: 'success', title: 'Éxito', text: `Datos principales actualizados` });
    }

    // 2. Enviar documentos (si existen cambios)
    if (hayCambiosEnDocumentos) {
      await enviarDocumentos(id);
    }
    
    // Al finalizar, volvemos a cargar los datos para refrescar los estados 'originales'
    fetchDrivers(); 
  };


  const cancelar = () =>{
    navigate(`/admin-drivers`)
  }

  if (loading) {
      return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', p: 3 }}>
              <CircularProgress /> 
              <Typography ml={2}>Cargando datos del conductor...</Typography> 
          </Box>
      );
  }


  return (
    <Box sx={{ p: 3 }}>

      {/* Título Principal */}
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Editing Driver: {formData.nombre} (ID: {id})
      </Typography>
      
      {/* Contenedor principal del formulario */}
      <Paper elevation={1} sx={{ p: 3, border: '1px solid #ccc' }}>
        
        {/* Botones de acción (Save / Cancel) */}
        <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mb: 3 }}>
          <Button variant="outlined" color="error" onClick={cancelar}>Cancel</Button>
          <Button variant="contained" color="success" onClick={handleSubmit}>Save Changes</Button>
        </Stack>

        <Grid container spacing={4}>
            {/* Columna 1: Información Personal y Documentos MX */}
            <Grid item xs={12} md={4}>
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                    Datos Personales
                </Typography>
                
                {/* Campos de texto (TextFields) */}
                <TextField label="Nombre de conductor" fullWidth size="small" sx={{ mb: 2 }} value={formData.nombre} onChange={(e) => handleInputChange('nombre', e.target.value)} />
                <InputLabel sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>Fecha de entrada</InputLabel>
                <TextField type="date" fullWidth size="small" sx={{ mb: 2 }} value={formData.fechaEntrada} onChange={(e) => handleInputChange('fechaEntrada', e.target.value)} InputLabelProps={{ shrink: true }} />
                <InputLabel sx={{ fontWeight: 600, mb: 0.5, color: 'text.primary' }}>Fecha de nacimiento</InputLabel>
                <TextField type="date" fullWidth size="small" sx={{ mb: 2 }} value={formData.fechaNacimiento} onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)} InputLabelProps={{ shrink: true }} />
                <TextField label="CURP" fullWidth size="small" sx={{ mb: 2 }} value={formData.curp} onChange={(e) => handleInputChange('curp', e.target.value)} />
                <TextField label="RFC" fullWidth size="small" sx={{ mb: 2 }} value={formData.rfc} onChange={(e) => handleInputChange('rfc', e.target.value)} />
                
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1, mt: 3 }}>
                    Documentos Personales (MX)
                </Typography>
                
                {/* Documentos Personales */}
                <DriverInput label="INE" documentKey="INE" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <DriverInput label="Acta de nacimiento (PDF)" documentKey="Acta_Nacimiento" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <DriverInput label="CURP (PDF)" documentKey="CURP" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <DriverInput label="Comprobante de domicilio (PDF)" documentKey="Comprobante_domicilio" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <DriverInput label="Constancia de situación fiscal (PDF)" documentKey="Constancia" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
            </Grid>

            {/* Columna 2: Documentos de Viaje y Contacto */}
            <Grid item xs={12} md={4}>
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                    Documentos de Viaje
                </Typography>
                
                {/* Documentos de Viaje */}
                <DriverInput label="Visa" documentKey="Visa" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <TextField label="No. Visa" fullWidth size="small" sx={{ mb: 2 }} value={formData.visa} onChange={(e) => handleInputChange('visa', e.target.value)} />
                <DriverInput label="I-94 (PDF)" documentKey="I" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <DriverInput label="Licencia (PDF)" documentKey="Licencia" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <DriverInput label="APTO Medico (PDF)" documentKey="APTO" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                <DriverInput label="Antidoping" documentKey="Atidoping" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
                
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1, mt: 3 }}>
                    Contacto
                </Typography>
                
                {/* Campos de Contacto */}
                <TextField label="Numero celular USA" fullWidth size="small" sx={{ mb: 2 }} value={formData.phone_usa} onChange={(e) => handleInputChange('phone_usa', e.target.value)} />
                <TextField label="Numero celular MEX" fullWidth size="small" sx={{ mb: 2 }} value={formData.phone_mex} onChange={(e) => handleInputChange('phone_mex', e.target.value)} />
            </Grid>


            {/* Columna 3: Otros Documentos */}
            <Grid item xs={12} md={4}>
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ borderBottom: '1px solid #eee', pb: 1 }}>
                    Otros Documentos
                </Typography>
                
                {/* Otros Documentos */}
                <DriverInput label="Solicitud de empleo (PDF)" documentKey="Solicitud_empleo" documentos={documentos} abrirModal={abrirModal} handleClear={handleClearDocument} />
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

export default DriverEditor;