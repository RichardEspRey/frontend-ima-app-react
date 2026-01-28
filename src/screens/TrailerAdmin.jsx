import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
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


const TrailerAdmin = () => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [valorActual, setValorActual] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); 
  const [cajas, setCajas] = useState([]);
  const navigate = useNavigate();

  const from = page * rowsPerPage;
  
  // ** LÓGICA DE FILTRADO (useMemo) **
  const filteredCajas = useMemo(() => {
    const searchLower = search.toLowerCase();
    return cajas.filter(caja =>
        String(caja.no_caja || '').toLowerCase().includes(searchLower)
    );
  }, [cajas, search]);

  const to = Math.min((page + 1) * rowsPerPage, filteredCajas.length);


    // ** LÓGICA DE FETCH **
    const fetchCajas = useCallback(async () => {
      try {
        const response = await fetch(`${apiHost}/cajas.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'op=getAll'
        });
        const data = await response.json();

        if (data.status === 'success' && data.Users) {
          const formatted = data.Users.map(caja => ({
            id: caja.caja_id, 
            no_caja: caja.no_caja,

            seguro_Fecha: caja.seguro_Fecha, seguro_url_pdf: caja.seguro_url_pdf,
            CAB_CARD_Fecha: caja.CAB_CARD_Fecha, CAB_CARD_url_pdf: caja.CAB_CARD_url_pdf,
            FIANZA_fecha: caja.Fianza_Fecha, Fianza_url_pdf: caja.Fianza_url_pdf,
            CERTIFICADO_Fecha: caja.CERTIFICADO_Fecha, CERTIFICADO_url_pdf: caja.CERTIFICADO_url_pdf
          }));

          setCajas(formatted);
        }
      } catch (error) {
        console.error('Error al obtener las cajas:', error);
      }
    }, [apiHost]);

  useEffect(() => {
    fetchCajas();
  }, [fetchCajas]);

  
  // ** FUNCIÓN DE ICONOS **
  const getIconByFecha = (fechaStr, id, url, tipo) => {
    const iconStyle = { fontSize: 24, cursor: 'pointer' }; 

    if (!fechaStr) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <HelpOutlineIcon color="disabled" style={iconStyle}
            data-tooltip-id={`tooltip-${id}-${tipo}`}
            data-tooltip-content="No se cuenta con el documento"
            onClick={() => abrirModalConDocumento(url, fechaStr, id, tipo)}
          />
          <Tooltip id={`tooltip-${id}-${tipo}`} place="top" />
        </Box>
      );
    }

    const fecha = new Date(fechaStr);
    const hoy = new Date();
    const diffInDays = Math.floor((fecha - hoy) / (1000 * 60 * 60 * 24));

    let IconComponent = CheckCircleIcon;
    let color = 'success'; // Verde
    let mensaje = `Vencimiento: ${fecha.toLocaleDateString('es-MX')}`;

    if (diffInDays < 0) { // Vencido
      IconComponent = ErrorIcon;
      color = 'error'; // Rojo
      mensaje = `VENCIDO: ${fecha.toLocaleDateString('es-MX')}`;
    }
    else if (diffInDays <= 30) { // Menos de 30 días
      IconComponent = ErrorIcon;
      color = 'error'; // Rojo
    }
    else if (diffInDays <= 90) { // 30-90 días
      IconComponent = WarningIcon;
      color = 'warning'; // Amarillo
    }
    
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <IconComponent 
                color={color} 
                style={iconStyle}
                onClick={() => abrirModalConDocumento(url, fechaStr, id, tipo)}
                data-tooltip-id={`tooltip-${id}-${tipo}`}
                data-tooltip-content={mensaje}
            />
            <Tooltip id={`tooltip-${id}-${tipo}`} place="top" />
        </Box>
    );
  };

  // ** LÓGICA DE MODAL Y ELIMINAR (se mantiene) **
  const abrirModalConDocumento = (url, fecha, id, tipo) => {
    setValorActual({
      url: `${apiHost}/${url}`,
      vencimiento: fecha,
      id,
      tipo
    });
    setIsModalOpen(true);
  };

  const eliminar = async (id) =>  {
 
   const { isConfirmed } = await Swal.fire({
     title: '¿Deseas eliminar esta caja?',
     icon: 'question',
         showCancelButton: true,
         confirmButtonText: 'Aceptar'
       });
   
   if (!isConfirmed)return;
        
    try {
       const formDataToSend = new FormData();
         formDataToSend.append('op', 'Baja');
         formDataToSend.append('id', id);
 
         const response = await fetch(`${apiHost}/cajas.php`, {
           method: 'POST',
           body: formDataToSend,
         });
 
         const data = await response.json();
         if (data.status === 'success' ) {
          Swal.fire({
           icon: 'success',
           title: 'Éxito',
           text: 'Caja dada de baja!',
         });
         
         }
       } catch (error) {
         console.error('Error al obtener los Caja:', error);
       }
       fetchCajas();
      window.location.reload();
     };
 

  // ** MANEJADORES DE PAGINACIÓN MUI **
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  
  return (
    <Box sx={{ p: 3 }}>
      {/* Título Principal  */}
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Administrador de Cajas
      </Typography>

      {/* Toolbar */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Buscar por número de caja"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
        <Button variant="contained" onClick={fetchCajas} size="small">Refrescar</Button>
      </Stack>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer sx={{ overflowX: 'auto' }}> 
          <Table size="small" stickyHeader sx={{ minWidth: 800 }}> 
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>No. Caja</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '70px', textAlign: 'center' }}>Seguro</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '70px', textAlign: 'center' }}>CAB CARD</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '70px', textAlign: 'center' }}>Fianza</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '70px', textAlign: 'center' }}>Certificado</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '150px', textAlign: 'center' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Mapeo de Cajas */}
              {filteredCajas.slice(from, to).map(caja => (
                <TableRow key={caja.id} hover>
                  <TableCell component="th" scope="row">{caja.no_caja}</TableCell> 
                  
                  {/* CELDAS DE ICONOS */}
                  <TableCell>{getIconByFecha(caja.seguro_Fecha, caja.id, caja.seguro_url_pdf, 'seguro')}</TableCell>
                  <TableCell>{getIconByFecha(caja.CAB_CARD_Fecha, caja.id, caja.CAB_CARD_url_pdf, 'CAB CARD')}</TableCell>
                  <TableCell>{getIconByFecha(caja.FIANZA_fecha, caja.id, caja.Fianza_url_pdf, 'FIANZA')}</TableCell>
                  <TableCell>{getIconByFecha(caja.CERTIFICADO_Fecha, caja.id, caja.CERTIFICADO_url_pdf, 'CERTIFICADO')}</TableCell>
                  
                  {/* CONSOLIDACIÓN DE ACCIONES */}
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/editor-trailers/${caja.id}`)}
                      >
                        Ver
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => eliminar(caja.id)}
                      >
                        Eliminar
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {/* Fila para cuando no hay resultados */}
              {filteredCajas.length === 0 && (
                <TableRow>
                    <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" sx={{ py: 2 }}>No se encontraron cajas.</Typography>
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación MUI */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 1 }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
                {`Filas por página: ${rowsPerPage}`}
            </Typography>
            <Stack direction="row" spacing={1}>
                {/* Botones y Conteo */}
                <Button disabled={page === 0} onClick={() => setPage(page - 1)} size="small" variant="outlined">Anterior</Button>
                <Typography variant="body2" sx={{ px: 1, display: 'flex', alignItems: 'center' }}>
                    {`${from + 1}-${to} de ${filteredCajas.length}`}
                </Typography>
                <Button disabled={to >= filteredCajas.length} onClick={() => setPage(page + 1)} size="small" variant="outlined">Siguiente</Button>
            </Stack>
        </Box>
        
      </Paper>

      <ModalArchivo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => console.log('Guardado:', data)}
        nombreCampo="Documento"
        valorActual={valorActual}
        endpoint="cajas_docs.php" 
        tipo="caja_id"
      />
    </Box>
  );
};

export default TrailerAdmin;