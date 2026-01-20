import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Button, Stack, CircularProgress, Badge, Tooltip, Chip, TablePagination
} from '@mui/material'; 
import { useNavigate, useLocation } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Helper para formato de moneda
const money = (v) => {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        minimumFractionDigits: 2, 
        currencyDisplay: 'symbol' 
    }).format(Number(v || 0));
};

const DieselAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const apiHost = import.meta.env.VITE_API_HOST;

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Inicialización de estados con persistencia
  const [search, setSearch] = useState(location.state?.search || '');
  const [page, setPage] = useState(location.state?.page || 0);
  const [rowsPerPage, setRowsPerPage] = useState(location.state?.rowsPerPage || 15);

  // ** LÓGICA DE FETCH **
  const fetchDiesel = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiHost}/formularios.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'op=getAll_diesel'
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        const formattedData = (data.id || []).map(item => ({
            trip_id: item.trip_id,
            trip_number: item.trip_number,
            fecha: item.fecha,
            nombre: item.nombre,
            
            // Totales
            total_monto: parseFloat(item.monto || 0),
            total_galones: parseFloat(item.galones || 0),
            
            // Contadores de alertas
            state_pending_count: parseInt(item.state_pending_count || 0, 10),
            fleetone_pending_count: parseInt(item.fleetone_pending_count || 0, 10)
        }));

        setTrips(formattedData);
      } else {
          setTrips([]);
      }
    } catch (error) {
      console.error('Error al obtener diesel:', error);
      setTrips([]);
    } finally {
        setLoading(false);
    }
  }, [apiHost]);

  useEffect(() => { fetchDiesel(); }, [fetchDiesel]);

  // ** LÓGICA DE FILTRADO **
  const filteredTrips = useMemo(() => {
    const searchLower = search.toLowerCase();
    if (!searchLower) return trips;
    return trips.filter(r =>
        String(r.trip_number || '').toLowerCase().includes(searchLower) ||
        String(r.nombre || '').toLowerCase().includes(searchLower)
    );
  }, [trips, search]);

  const handleVer = (tripId) => {
    navigate(`/detalle-diesel/${tripId}`, { 
        state: { page, search, rowsPerPage } 
    }); 
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const slice = filteredTrips.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
      return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', p: 3 }}>
              <CircularProgress /> 
              <Typography ml={2}>Cargando registros de diesel...</Typography> 
          </Box>
      );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Diesel Management System
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <TextField
          label="Buscar por Trip# o Driver"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ width: 300 }}
        />
        <Button variant="contained" onClick={fetchDiesel} size="small">Refrescar</Button>
      </Stack>

      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer sx={{ overflowX: 'auto' }}> 
          <Table size="small" stickyHeader aria-label="Diesel records table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Trip #</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Last Update</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'right' }}>Total Gal.</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'right' }}>Total Cost</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Driver</TableCell>
                
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'center', width: 130 }}>State Pending</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'center', width: 150 }}>Fleet One Pending</TableCell>
                
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {slice.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={8} align="center">
                        <Typography color="text.secondary" sx={{ py: 2 }}>No se encontraron registros de diesel.</Typography>
                    </TableCell>
                </TableRow>
              ) : (
                slice.map((row) => ( 
                  <TableRow key={row.trip_id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{row.trip_number}</TableCell>
                    <TableCell>{row.fecha}</TableCell>
                    <TableCell align="right">{row.total_galones.toFixed(2)} gal</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600} color="primary.main">{money(row.total_monto)}</Typography>
                    </TableCell>
                    <TableCell>{row.nombre}</TableCell>
                    
                    {/* Contadores de alertas */}
                    <TableCell align="center">
                        {row.state_pending_count > 0 ? (
                            <Tooltip title={`Faltan ${row.state_pending_count} estados`}>
                                <Chip 
                                    label={row.state_pending_count} 
                                    size="small" 
                                    sx={{ 
                                        fontWeight: 'bold', 
                                        minWidth: 30,
                                        bgcolor: '#d32f2f', 
                                        color: '#ffffff',   
                                        border: '1px solid #d32f2f'
                                    }} 
                                />
                            </Tooltip>
                        ) : (
                            <Typography variant="caption" color="text.disabled">—</Typography>
                        )}
                    </TableCell>

                    {/* Contadores de alertas */}
                    <TableCell align="center">
                        {row.fleetone_pending_count > 0 ? (
                            <Tooltip title={`Faltan ${row.fleetone_pending_count} Fleet One`}>
                                <Chip 
                                    label={row.fleetone_pending_count} 
                                    size="small" 
                                    sx={{ 
                                        fontWeight: 'bold', 
                                        minWidth: 30,
                                        bgcolor: '#ed6c02', 
                                        color: '#ffffff',   
                                        border: '1px solid #ed6c02'
                                    }} 
                                />
                            </Tooltip>
                        ) : (
                            <Typography variant="caption" color="text.disabled">—</Typography>
                        )}
                    </TableCell>

                    <TableCell align="center">
                      <Button 
                        variant="contained" 
                        size="small" 
                        startIcon={<VisibilityIcon />}
                        onClick={() => handleVer(row.trip_id)}
                        sx={{ textTransform: 'none' }}
                      >
                        View
                      </Button> 
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
            rowsPerPageOptions={[15, 25, 50]}
            component="div"
            count={filteredTrips.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
        />
      </Paper>
    </Box>
  );
};

export default DieselAdmin;