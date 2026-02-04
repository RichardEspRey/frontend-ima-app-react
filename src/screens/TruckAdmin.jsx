import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Box, Typography, TextField, Button, CircularProgress, Stack,
} from '@mui/material'; 

import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; 

import ModalArchivo from '../components/ModalArchivoEditor.jsx'; 
import { Tooltip } from 'react-tooltip';
import { useNavigate } from 'react-router-dom'; 
import Swal from 'sweetalert2';

const ROWS_PER_PAGE_OPTIONS = [6, 12, 24, 48]; 


const TruckAdmin = () => {
  const navigate = useNavigate();
  const apiHost = import.meta.env.VITE_API_HOST;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [valorActual, setValorActual] = useState(null);
  const [filterUnidad, setFilterUnidad] = useState('');
  const [filterPlacaMex, setFilterPlacaMex] = useState('');
  const [filterPlacaEua, setFilterPlacaEua] = useState('');
  const [page, setPage] = useState(0);
  
  const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE_OPTIONS[0]); 
  
  const [trailers, setTrailers] = useState([]);

  // Lógica de cálculo de rango
  const from = page * rowsPerPage;
  const to = Math.min((page + 1) * rowsPerPage, trailers.length);

    // ** LÓGICA DE FETCH **
    const fetchTrailers = useCallback(async () => {
        try {
            const response = await fetch(`${apiHost}/trucks.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'op=getAll'
            });
            const data = await response.json();

            if (data.status === 'success' && data.Users) {
                const formatted = data.Users.map(t => ({
                    truck_id: t.truck_id,
                    unidad: t.unidad,
                    placa_mex: t.Placa_MEX,
                    placa_eua: t.Placa_EUA,

                    CAB_Fecha: t.CAB_Fecha, CAB_URL: t.CAB_URL,
                    COI_Fecha: t.COI_Fecha, COI_URL: t.COI_URL,
                    mecanica_Fecha: t.mecanica_Fecha, mecanica_URL: t.mecanica_URL, 
                    TX_DMV_Fecha: t.TX_DMV_Fecha, TX_DMV_URL: t.TX_DMV_URL, 
                    PERMISO_NY_Fecha: t.PERMISO_NY_Fecha, PERMISO_NY_URL: t.PERMISO_NY_URL, 
                    PERMISO_NM_Fecha: t.PERMISO_NM_Fecha, PERMISO_NM_URL: t.PERMISO_NM_URL, 
                    dtops_Fecha: t.dtops_Fecha, dtops_URL: t.dtops_URL, 
                    Inspecccion_fisio_Mecanica_Fecha: t.Inspecccion_fisio_Mecanica_Fecha, Inspecccion_fisio_Mecanica_URL: t.Inspecccion_fisio_Mecanica_URL,
                    Inspecion_humos_Fecha: t.Inspecion_humos_Fecha, Inspecion_humos_URL: t.Inspecion_humos_URL,
                    seguro_Fecha: t.seguro_Fecha, seguro_URL: t.seguro_URL
                }));
                setTrailers(formatted);
            }
        } catch (error) {
            console.error('Error al obtener los trailers:', error);
        }
    }, [apiHost]);

    useEffect(() => {
        fetchTrailers();
    }, [fetchTrailers]);

    // ** LÓGICA DE FILTRADO (useMemo para mejor rendimiento) **
    const filteredTrailers = useMemo(() => {
        const unidadLower = filterUnidad.toLowerCase();
        const placaMexLower = filterPlacaMex.toLowerCase();
        const placaEuaLower = filterPlacaEua.toLowerCase();

        return trailers.filter(t => {
            const matchUnidad = !unidadLower || 
                                String(t.unidad).toLowerCase().includes(unidadLower);
            
            const matchPlacaMex = !placaMexLower || 
                                  String(t.placa_mex || '').toLowerCase().includes(placaMexLower);
            
            const matchPlacaEua = !placaEuaLower || 
                                  String(t.placa_eua || '').toLowerCase().includes(placaEuaLower);
            
            return matchUnidad && matchPlacaMex && matchPlacaEua;
        });
    }, [trailers, filterUnidad, filterPlacaMex, filterPlacaEua]);

    const handleFilterChange = (setter, value) => {
        setter(value);
        setPage(0);
    };

    // ** LÓGICA DE ICONOS (Migrada a SVG MUI) **
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
        let color = 'success'; // Verde: > 30 días
        let mensaje = `Vencimiento: ${fecha.toLocaleDateString('es-MX')}`;

        if (diffInDays < 0) {
            IconComponent = ErrorIcon;
            color = 'error'; 
            mensaje = `VENCIDO: ${fecha.toLocaleDateString('es-MX')}`;
        }
        else if (diffInDays <= 30) { 
            IconComponent = WarningIcon;
            color = 'warning';
        }
        // else if (diffInDays <= 90) { 
        //     IconComponent = WarningIcon;
        //     color = 'warning'; 
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

    const eliminar = async (id) => {
        const { isConfirmed } = await Swal.fire({
            title: '¿Deseas eliminar este camion?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Aceptar'
        });
        
        if (!isConfirmed) return;
            
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('op', 'Baja');
            formDataToSend.append('id', id);

            const response = await fetch(`${apiHost}/trucks.php`, {
                method: 'POST',
                body: formDataToSend,
            });

            const data = await response.json();
            if (data.status === 'success') {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Truck dado de baja!',
                });
            }
        } catch (error) {
            console.error('Error al obtener los Trucks:', error);
        }
        fetchTrailers();
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
      {/* Título Principal */}
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Administrador de Trailers
      </Typography>
      
      {/* Toolbar */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
            
            <TextField
              label="Buscar Unidad"
              variant="outlined"
              size="small"
              value={filterUnidad}
              onChange={(e) => handleFilterChange(setFilterUnidad, e.target.value)}
              sx={{ width: 150 }}
            />
            <TextField
              label="Buscar Placa MEX"
              variant="outlined"
              size="small"
              value={filterPlacaMex}
              onChange={(e) => handleFilterChange(setFilterPlacaMex, e.target.value)}
              sx={{ width: 200 }}
            />
            <TextField
              label="Buscar Placa EUA"
              variant="outlined"
              size="small"
              value={filterPlacaEua}
              onChange={(e) => handleFilterChange(setFilterPlacaEua, e.target.value)}
              sx={{ width: 200 }}
            />
            
            <Button variant="contained" onClick={fetchTrailers} size="small">Refrescar</Button>

            <Button 
                variant="outlined" 
                onClick={() => { 
                    setFilterUnidad(''); 
                    setFilterPlacaMex(''); 
                    setFilterPlacaEua(''); 
                    setPage(0); 
                }} 
                size="small"
            >
                Limpiar Filtros
            </Button>
            
        </Stack>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer sx={{ overflowX: 'auto' }}> 
          <Table size="small" stickyHeader sx={{ minWidth: 1600 }}> 
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Unidad</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Placa MEX</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Placa EUA</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '70px', textAlign: 'center' }}>CAB CARD</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '70px', textAlign: 'center' }}>COI</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '70px', textAlign: 'center' }}>Mecánica</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '70px', textAlign: 'center' }}>TX DMV</TableCell>            
                <TableCell sx={{ fontWeight: 600, width: '70px', textAlign: 'center' }}>DTOPS</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '70px', textAlign: 'center' }}>Permiso NY</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '70px', textAlign: 'center' }}>Permiso NM</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '70px', textAlign: 'center' }}>Fisio Mecánica</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '70px', textAlign: 'center' }}>Humos</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '70px', textAlign: 'center' }}>Seguro</TableCell>
                <TableCell sx={{ fontWeight: 600, width: '150px', textAlign: 'center' }}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTrailers.slice(from, to).map(t => (
                <TableRow key={t.truck_id} hover>

                  <TableCell>{t.unidad}</TableCell>
                  <TableCell>{t.placa_mex}</TableCell>
                  <TableCell>{t.placa_eua}</TableCell>

                  {/* CELDAS DE ICONOS */}
                  <TableCell>{getIconByFecha(t.CAB_Fecha, t.truck_id, t.CAB_URL, 'CAB')}</TableCell>
                  <TableCell>{getIconByFecha(t.COI_Fecha, t.truck_id, t.COI_URL, 'COI')}</TableCell>
                  <TableCell>{getIconByFecha(t.mecanica_Fecha, t.truck_id, t.mecanica_URL, 'Mecanica')}</TableCell>
                  <TableCell>{getIconByFecha(t.TX_DMV_Fecha, t.truck_id, t.TX_DMV_URL, 'TX')}</TableCell>
                  <TableCell>{getIconByFecha(t.dtops_Fecha, t.truck_id, t.dtops_URL, 'DTOPS')}</TableCell>
                  <TableCell>{getIconByFecha(t.PERMISO_NY_Fecha, t.truck_id, t.PERMISO_NY_URL, 'PERMISO_NY')}</TableCell>
                  <TableCell>{getIconByFecha(t.PERMISO_NM_Fecha, t.truck_id, t.PERMISO_NM_URL, 'PERMISO_NM')}</TableCell>
                  <TableCell>{getIconByFecha(t.Inspecccion_fisio_Mecanica_Fecha, t.truck_id, t.Inspecccion_fisio_Mecanica_URL, 'Fisio Mecanica')}</TableCell>
                  <TableCell>{getIconByFecha(t.Inspecion_humos_Fecha, t.truck_id, t.Inspecion_humos_URL, 'Humos')}</TableCell>
                  <TableCell>{getIconByFecha(t.seguro_Fecha, t.truck_id, t.seguro_URL, 'Seguro')}</TableCell>

                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Stack direction="row" spacing={1} justifyContent="center"> 
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => navigate(`/editor-trucks/${t.truck_id}`)}
                      >
                        Ver
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => eliminar(t.truck_id)}
                      >
                        Eliminar
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTrailers.length === 0 && (
                <TableRow>
                    <TableCell colSpan={14} align="center">
                        <Typography color="text.secondary" sx={{ py: 2 }}>No se encontraron trailers.</Typography>
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 1 }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
                {`Filas por página: ${rowsPerPage}`}
            </Typography>
            <Stack direction="row" spacing={1}>
                <Button disabled={page === 0} onClick={() => setPage(page - 1)} size="small" variant="outlined">Anterior</Button>
                <Typography variant="body2" sx={{ px: 1, display: 'flex', alignItems: 'center' }}>
                    {`${from + 1}-${to} de ${filteredTrailers.length}`}
                </Typography>
                <Button disabled={to >= filteredTrailers.length} onClick={() => setPage(page + 1)} size="small" variant="outlined">Siguiente</Button>
            </Stack>
        </Box>
        
      </Paper>

      <ModalArchivo
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => console.log('Guardado:', data)}
        nombreCampo="Documento"
        valorActual={valorActual}
        endpoint="trucks_docs.php" 
        tipo="truck_id"
      />
    </Box>
  );
};

export default TruckAdmin;

// import React, { useState, useEffect } from 'react';
// import './css/DriverAdmin.css';
// import redIcon from '../assets/images/Icons_alerts/shield-red.png'; 
// import greenIcon from '../assets/images/Icons_alerts/shield-green.png'; 
// import yellowIcon from '../assets/images/Icons_alerts/shield-yellow.png'; 
// import greyIcon from '../assets/images/Icons_alerts/shield-grey.png'; 
// import questionIcon from '../assets/images/Icons_alerts/question3.png'; 
// import ModalArchivo from '../components/ModalArchivoEditor.jsx'; 
// import { Tooltip } from 'react-tooltip';
// import { useNavigate } from 'react-router-dom'; // Asegúrate de tener react-router-dom instalado
// import Swal from 'sweetalert2';

// const TruckAdmin = () => {
//   const navigate = useNavigate();
//   const apiHost = import.meta.env.VITE_API_HOST;
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [valorActual, setValorActual] = useState(null);
//   const [search, setSearch] = useState('');
//   const [page, setPage] = useState(0);
//   const rowsPerPage = 6;
//   const [trailers, setTrailers] = useState([]);

//   const from = page * rowsPerPage;
//   const to = Math.min((page + 1) * rowsPerPage, trailers.length);


//     const fetchTrailers = async () => {
//       try {
//         const response = await fetch(`${apiHost}/trucks.php`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//           body: 'op=getAll'
//         });
//         const data = await response.json();

//         if (data.status === 'success' && data.Users) {
//           const formatted = data.Users.map(t => ({
//             truck_id: t.truck_id,
//             unidad: t.unidad,
//             placa_mex: t.Placa_MEX,
//             placa_eua: t.Placa_EUA,

//             CAB_Fecha: t.CAB_Fecha,
//             CAB_URL: t.CAB_URL,
//             COI_Fecha: t.COI_Fecha,
//             COI_URL: t.COI_URL,
//             mecanica_Fecha: t.mecanica_Fecha,
//             mecanica_URL: t.mecanica_URL, 
//             TX_DMV_Fecha: t.TX_DMV_Fecha,
//             TX_DMV_URL: t.TX_DMV_URL, 
//             PERMISO_NY_Fecha: t.PERMISO_NY_Fecha,
//             PERMISO_NY_URL: t.PERMISO_NY_URL, 
//             PERMISO_NM_Fecha: t.PERMISO_NM_Fecha, 
//             PERMISO_NM_URL: t.PERMISO_NM_URL, 
//             dtops_Fecha: t.dtops_Fecha, 
//             dtops_URL: t.dtops_URL, 
//             Inspecccion_fisio_Mecanica_Fecha: t.Inspecccion_fisio_Mecanica_Fecha,
//             Inspecccion_fisio_Mecanica_URL: t.Inspecccion_fisio_Mecanica_URL,
//             Inspecion_humos_Fecha: t.Inspecion_humos_Fecha,
//             Inspecion_humos_URL: t.Inspecion_humos_URL,
//             seguro_Fecha: t.seguro_Fecha,
//             seguro_URL: t.seguro_URL
//           }));


         
//           setTrailers(formatted);
//         }
//       } catch (error) {
//         console.error('Error al obtener los trailers:', error);
//       }
//     };

//   useEffect(() => {
//     fetchTrailers();
//   }, []);

//   const filteredTrailers = trailers.filter(t =>
//   t.unidad.toString().includes(search)
// );

//   const getIconByFecha = (fechaStr, id, url, tipo) => {
//     if (!fechaStr) {
//       return (
//         <>
//           <img
//             src={questionIcon}
//             alt="Sin documento"
//             className="icon-img"
//             data-tooltip-id={`tooltip-${id}-${tipo}`}
//             data-tooltip-content="No se cuenta con el documento"
//           />
//           <Tooltip id={`tooltip-${id}-${tipo}`} place="top" />
//         </>
//       );
//     }

//     const fecha = new Date(fechaStr);
//     const hoy = new Date();
//     const diffInDays = Math.floor((fecha - hoy) / (1000 * 60 * 60 * 24));

//     let icon = redIcon;
//     let mensaje = `Vencimiento: ${fecha.toLocaleDateString('es-MX')}`;

//     if (diffInDays >= 90) icon = greenIcon;
//     else if (diffInDays >= 60) icon = yellowIcon;
//     else if (diffInDays >= 30) icon = redIcon;

//     return (
//       <>
//         <img
//           src={icon}
//           alt={tipo}
//           className="icon-img"
//           onClick={() => abrirModalConDocumento(url, fechaStr, id, tipo)}
//           data-tooltip-id={`tooltip-${id}-${tipo}`}
//           data-tooltip-content={mensaje}
//           style={{ cursor: 'pointer' }}
//         />
//         <Tooltip id={`tooltip-${id}-${tipo}`} place="top" />
//       </>
//     );
//   };

//   const abrirModalConDocumento = (url, fecha, id, tipo) => {
//     setValorActual({
//       url: `${apiHost}/${url}`,
//       vencimiento: fecha,
//       id,
//       tipo
//     });
//     setIsModalOpen(true);
//   };

  
 
//   const eliminar = async (id) =>  {
 
//    const { isConfirmed } = await Swal.fire({
//      title: '¿Deseas eliminar este camion?',
//      icon: 'question',
//          showCancelButton: true,
//          confirmButtonText: 'Aceptar'
//        });
   
//    if (!isConfirmed)return;
        
//     try {
//        const formDataToSend = new FormData();
//          formDataToSend.append('op', 'Baja'); // operación que espera el backend
//          formDataToSend.append('id', id);
 
//          const response = await fetch(`${apiHost}/trucks.php`, {
//            method: 'POST',
//            body: formDataToSend,
//          });
 
//          const data = await response.json();
//          if (data.status === 'success' ) {
//           Swal.fire({
//            icon: 'success',
//            title: 'Éxito',
//            text: 'Truck dado de baja!',
//          });
         
//          }
//        } catch (error) {
//          console.error('Error al obtener los Trucks:', error);
//        }
//        fetchTrailers();
//         window.location.reload();
     
//      };

//   return (
//     <div className="driver-admin">
//       <h1 className="title">Administrador de trailers</h1>
//       <div className="toolbar">
//         <input
//           type="text"
//           placeholder="Buscar por unidad"
//           value={search}
//           onChange={(e) => {
//             setSearch(e.target.value);
//             setPage(0);
//           }}
//         />
//       </div>

//       <div className="table-container">
//         <table>
//           <thead>
//             <tr>
//               <th>Unidad</th>
//               <th>Placa MEX</th>
//               <th>Placa EUA</th>
//               <th>CAB CARD</th>
//               <th>COI</th>
//               <th>Inspeccion mecanica</th>
//               <th>TX DMV</th>            
//               <th>DTOPS</th>
//               <th>Permiso NY</th>
//               <th>Permiso NM</th>
//               <th>Inspeccion fisio mecanica</th>
//               <th>Inspeccion humos</th>
//               <th>Carta Seguro</th>
//               <th>Acciones</th>
//             </tr>
//           </thead>
//           <tbody>
//             {filteredTrailers.slice(from, to).map(t => (
//               <tr key={t.truck_id}>

//                 <td>{t.unidad}</td>
//                 <td>{t.placa_mex}</td>
//                 <td>{t.placa_eua}</td>

//                 <td>{getIconByFecha(t.CAB_Fecha, t.truck_id, t.CAB_URL, 'CAB')}</td>
//                 <td>{getIconByFecha(t.COI_Fecha, t.truck_id, t.COI_URL, 'COI')}</td>
//                 <td>{getIconByFecha(t.mecanica_Fecha, t.truck_id, t.mecanica_URL, 'Mecanica')}</td>
//                 <td>{getIconByFecha(t.TX_DMV_Fecha, t.truck_id, t.TX_DMV_URL, 'TX')}</td>
//                 <td>{getIconByFecha(t.dtops_Fecha, t.truck_id, t.dtops_URL, 'DTOPS')}</td>
//                 <td>{getIconByFecha(t.PERMISO_NY_Fecha, t.truck_id, t.PERMISO_NY_URL, 'PERMISO_NY')}</td>
//                 <td>{getIconByFecha(t.PERMISO_NM_Fecha, t.truck_id, t.PERMISO_NM_URL, 'PERMISO_NM')}</td>
//                 <td>{getIconByFecha(t.Inspecccion_fisio_Mecanica_Fecha, t.truck_id, t.Inspecccion_fisio_Mecanica_URL, 'Inspeccion fisio mecanica')}</td>
//                 <td>{getIconByFecha(t.Inspecion_humos_Fecha, t.truck_id, t.Inspecion_humos_URL, 'DTOPS')}</td>
//                 <td>{getIconByFecha(t.seguro_Fecha, t.truck_id, t.seguro_URL, 'Seguro')}</td>
//                 <td>

//                   <button
//                     className="ver-btn"
//                     onClick={() => navigate(`/editor-trucks/${t.truck_id}`)}
//                   >
//                     Ver
//                   </button>
//                 </td>
//                   <td>
//                   <button
//                     className="ver-btn"
//                     onClick={() => eliminar(t.truck_id)}
//                     >
//                     Eliminar
//                   </button>
//                 </td>
//               </tr>

//             ))}
//           </tbody>
//         </table>

//         <div className="pagination">
//           <button disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</button>
//           <span>{`${from + 1}-${to} de ${filteredTrailers.length}`}</span>
//           <button disabled={to >= filteredTrailers.length} onClick={() => setPage(page + 1)}>Siguiente</button>
//         </div>
//       </div>

//       <ModalArchivo
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//         onSave={(data) => console.log('Guardado:', data)}
//         nombreCampo="Documento"
//         valorActual={valorActual}
//         endpoint="trucks_docs.php" 
//         tipo="truck_id"
//       />
//     </div>
//   );
// };

// export default TruckAdmin;