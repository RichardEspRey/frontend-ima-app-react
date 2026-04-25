import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, Paper, Grid,
    TextField, Button, Stack, CircularProgress,
} from '@mui/material';

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import ModalArchivo from '../components/ModalArchivoEditor.jsx';
import { Tooltip } from 'react-tooltip';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import DocumentCard from '../components/DocumentCard';


const ImaAdmin = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [valorActual, setValorActual] = useState(null);
  const [documentos, setDocumentos] = useState({});
  const [loading, setLoading] = useState(true); 
  
  const documentKeys = useMemo(() => ['MC', 'W9', 'IFTA', '2290', 'Permiso_KYU', 'UCR', 'SCAC', 'CAAT'], []);


  // ** LÓGICA DE FETCH **
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
        const caja = data.Users[0];

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
          const url = caja[claves.url];
          const fecha = caja[claves.fecha];

          if (url || fecha) {
            nuevosDocumentos[campo] = {
              file: null,
              fileName: url?.split('/').pop() || '',
              vencimiento: fecha || '',
              url: url ? `${apiHost}/${url}` : ''
            };
          }
        });

        setDocumentos(nuevosDocumentos);
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


  // ** LÓGICA DE ICONOS**
  const getIconByFecha = (campo) => {
        const doc = documentos[campo];
        const fechaStr = doc?.vencimiento;
        const url = doc?.url;
        const iconStyle = { fontSize: 32 }; 

        if (!fechaStr) {
            return (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <HelpOutlineIcon color="disabled" style={iconStyle} />
                    <Tooltip id={`tooltip-${campo}`} place="top" content="No se cuenta con el documento" />
                </Box>
            );
        }

        const fecha = new Date(fechaStr);
        const hoy = new Date();
        const diffInDays = Math.floor((fecha - hoy) / (1000 * 60 * 60 * 24));

        let IconComponent = CheckCircleIcon;
        let color = 'success';
        let mensaje = `Vencimiento: ${fecha.toLocaleDateString('es-MX')}`;

        if (diffInDays < 0) {
            IconComponent = ErrorIcon;
            color = 'error';
            mensaje = `VENCIDO: ${fecha.toLocaleDateString('es-MX')}`;
        }
        else if (diffInDays <= 30) {
            IconComponent = ErrorIcon;
            color = 'warning';
        }
        // else if (diffInDays <= 90) {
        //     IconComponent = WarningIcon; // Amarillo (30-90 días)
        //     color = 'warning';
        // }

        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <IconComponent 
                    color={color} 
                    style={iconStyle}
                    data-tooltip-id={`tooltip-${campo}`}
                    data-tooltip-content={mensaje}
                    sx={{ cursor: 'pointer' }}
                />
                <Tooltip id={`tooltip-${campo}`} place="top" />
            </Box>
        );
  };


  const abrirModalConDocumento = (campo) => {
    const doc = documentos[campo];

    setValorActual({
      url: doc?.url || '',
      vencimiento: doc?.vencimiento || '',
      tipo: campo
    });
    setIsModalOpen(true);
  };

  
  if (loading) {
      return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', p: 3 }}>
              <CircularProgress /> 
              <Typography ml={2}>Cargando documentos corporativos...</Typography> 
          </Box>
      );
  }


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Documents Administrator IMA EXPRESS LCC
      </Typography>
      
      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 3 }}>
        <Button variant="contained" onClick={fetchDocs} size="small">Refrescar Estatus</Button>
      </Stack>

      <Paper elevation={1} sx={{ p: 3, border: '1px solid #ccc' }}>
        <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3, borderBottom: '1px solid #eee', pb: 1 }}>
             Estatus General de Documentos
        </Typography>

        <Grid container spacing={3}>
            {documentKeys.map(key => (
                <Grid item xs={12} sm={6} md={3} lg={2} key={key}>
                    <DocumentCard
                        docKey={key}
                        documento={documentos}
                        getIconByFecha={getIconByFecha}
                        abrirModalConDocumento={abrirModalConDocumento}
                    />
                </Grid>
            ))}
        </Grid>
      </Paper>

      {/* Modal */}
      <ModalArchivo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => console.log('Saved:', data)}
        nombreCampo={valorActual?.tipo || "Documento"} 
        valorActual={valorActual}
        endpoint="IMA_Docs.php" 
        tipo="caja_id"
      />
    </Box>
  );
};

export default ImaAdmin;