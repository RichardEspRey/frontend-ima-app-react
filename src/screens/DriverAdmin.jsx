import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Button, Stack, CircularProgress, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; 

// import './css/DriverAdmin.css';
import ModalArchivo from '../components/ModalArchivoEditor.jsx'; 
import { Tooltip } from 'react-tooltip';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';


const DriverAdmin = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [valorActual, setValorActual] = useState(null); 

  const apiHost = import.meta.env.VITE_API_HOST;
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Valor estándar de MUI
  const [selectedValue, setSelectedValue] = useState(''); // Estado para el futuro filtro de Status
  const [drivers, setDrivers] = useState([]);

  // ** CÁLCULO DE RANGO y FILTRADO **
  const from = page * rowsPerPage;
  
  const filteredDrivers = useMemo(() => {
    const searchLower = search.toLowerCase();
    // Filtramos solo por nombre
    return drivers.filter(driver =>
      driver.name.toLowerCase().includes(searchLower)
    );
  }, [drivers, search]);

  const to = Math.min((page + 1) * rowsPerPage, filteredDrivers.length);


    // ** FETCH DE DATOS **
    const fetchDrivers = useCallback(async () => {
  try {
    const response = await fetch(`${apiHost}/drivers.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'op=getAll',
    });

    const data = await response.json();

    if (data.status === 'success' && data.Users) {
      const formatted = data.Users.map(user => ({
        id: user.driver_id.toString(),
        name: user.nombre || 'Sin nombre',
        fecha: user.fecha_ingreso || 'Sin fecha',
        APTO_tipo: user.APTO_tipo || '',
        APTO_fecha: user.APTO_fecha || '',
        APTO_URL: user.APTO_URL || '',
        I94_tipo: user.I94_tipo || '',
        I94_fecha: user.I94_fecha || '',
        I94_URL: user.I94_URL || '',
        VISA_tipo: user.VISA_tipo || '',
        VISA_fecha: user.VISA_fecha || '',
        VISA_URL: user.VISA_URL || '',
        Licencia_tipo: user.Licencia_tipo || '',
        Licencia_fecha: user.Licencia_fecha || '',
        Licencia_URL: user.Licencia_URL || '',
      }));

      setDrivers(formatted);
    }
  } catch (error) {
    console.error('Error al obtener los conductores:', error);
  }
}, [apiHost]); // 👈 dependencia correcta



    useEffect(() => {
      fetchDrivers();
    }, [fetchDrivers]);

    
  // ** FUNCIÓN DE ICONOS (Migrada a Iconos MUI y colores) **
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
    // Cálculo de diferencia en días
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
      IconComponent = WarningIcon;
      color = 'error';
    }
    // else if (diffInDays <= 60) {
    //   IconComponent = WarningIcon;
    //   color = 'warning';
    // }
    
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


  // ** MANEJADORES DE ACCIÓN **
  const abrirModalConDocumento = (url, fecha, id, tipo) => {
    setValorActual({
      url: `${apiHost}/${url}`,
      vencimiento: fecha,
      id: id,
      tipo: tipo
    });
    setIsModalOpen(true);
  }


  const eliminar = async (id) => {
    const { isConfirmed } = await Swal.fire({
        title: '¿Deseas eliminar a este driver?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Aceptar'
    });
      
    if (!isConfirmed) return;
           
    try {
        const formDataToSend = new FormData();
        formDataToSend.append('op', 'Baja');
        formDataToSend.append('id', id);

        const response = await fetch(`${apiHost}/drivers.php`, {
            method: 'POST',
            body: formDataToSend,
        });

        const data = await response.json();
        if (data.status === 'success' ) {
            Swal.fire({
                icon: 'success',
                title: 'Éxito',
                text: 'Driver dado de baja!',
            });
        }
    } catch (error) {
        console.error('Error al obtener los conductores:', error);
    }
    fetchDrivers();
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
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Drivers Administrator
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Search by name"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />

        <FormControl sx={{ minWidth: 120 }} size="small">
          <InputLabel>Status</InputLabel>
          <Select
            value={selectedValue}
            label="Status"
            onChange={(e) => setSelectedValue(e.target.value)}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="opcion1">Option 1</MenuItem>
            <MenuItem value="opcion2">Option 2</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" onClick={fetchDrivers} size="small">Refrescar</Button>
      </Stack>

      {/* Tabla Principal */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer sx={{ overflowX: 'auto' }}> 
          <Table size="small" stickyHeader sx={{ minWidth: 1000 }}> 
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>No of employee</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Entry Date</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'center' }}>APTO</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'center' }}>I-94</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'center' }}>VISA</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'center' }}>Licenses</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'center', width: '150px' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDrivers.slice(from, to).map(driver => (
                <TableRow key={driver.id} hover>
                  <TableCell component="th" scope="row">{driver.id}</TableCell>
                  <TableCell>{driver.name}</TableCell>
                  <TableCell>{driver.fecha}</TableCell>
                  
                  <TableCell>{getIconByFecha(driver.APTO_fecha, driver.id, driver.APTO_URL, driver.APTO_tipo || 'APTO')}</TableCell>
                  <TableCell>{getIconByFecha(driver.I94_fecha, driver.id, driver.I94_URL, driver.I94_tipo || 'I94')}</TableCell>
                  <TableCell>{getIconByFecha(driver.VISA_fecha, driver.id, driver.VISA_URL, driver.VISA_tipo || 'VISA')}</TableCell>
                  <TableCell>{getIconByFecha(driver.Licencia_fecha, driver.id, driver.Licencia_URL, driver.Licencia_tipo || 'LIC')}</TableCell>
                  
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/editor-drivers/${driver.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => eliminar(driver.id)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDrivers.length === 0 && (
                <TableRow>
                    <TableCell colSpan={8} align="center">
                        <Typography color="text.secondary" sx={{ py: 2 }}>No se encontraron conductores.</Typography>
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Paginación */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 1 }}>
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" sx={{ mr: 2 }}>
                    Filas por página: {rowsPerPage}
                </Typography>
                <Button disabled={page === 0} onClick={() => setPage(page - 1)} size="small" variant="outlined">Previous</Button>
                <Typography variant="body2" sx={{ px: 1 }}>
                    {`${from + 1}-${to} de ${filteredDrivers.length}`}
                </Typography>
                <Button disabled={to >= filteredDrivers.length} onClick={() => setPage(page + 1)} size="small" variant="outlined">Next</Button>
            </Stack>
        </Box>
        
      </Paper>

      <ModalArchivo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => console.log("Guardado:", data)}
        nombreCampo="Documento"
        valorActual={valorActual}
        endpoint="drivers_docs.php" 
        tipo="driver_id"
      />
    </Box>
  );
};


export default DriverAdmin;