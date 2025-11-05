import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Button, Stack, CircularProgress,
} from '@mui/material'; 
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';


const money = (v) => {
    return `$${Number(v || 0).toFixed(2)}`;
};


const DieselAdmin = () => {
  const navigate = useNavigate();
  const apiHost = import.meta.env.VITE_API_HOST;

  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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
        const formatted = data.id.map(t => ({
          trip_number: t.trip_number,
          trip_id: t.trip_id,
          fecha: t.fecha,
          monto: t.monto,
          odometro: t.odometro,
          galones: t.galones,
          nombre: t.nombre
        }));
        setRegistros(formatted);
      }
    } catch (error) {
      console.error('Error al obtener diesel:', error);
    } finally {
        setLoading(false);
    }
  }, [apiHost]);

  useEffect(() => { fetchDiesel(); }, [fetchDiesel]);

  // ** LÓGICA DE FILTRADO **
  const filteredRegistros = useMemo(() => {
    const searchLower = search.toLowerCase();
    if (!searchLower) return registros;

    return registros.filter(r =>
        String(r.trip_number || '').toLowerCase().includes(searchLower) ||
        String(r.nombre || '').toLowerCase().includes(searchLower)
    );
  }, [registros, search]);


  const handleVer = (tripId) => {
    navigate(`/detalle-diesel/${tripId}`); 
  };

  const rowsPerPage = 15; 
  const [page, setPage] = useState(0);
  const from = page * rowsPerPage;
  const to = Math.min((page + 1) * rowsPerPage, filteredRegistros.length);
  const slice = filteredRegistros.slice(from, to);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage * rowsPerPage < filteredRegistros.length) {
        setPage(newPage);
    }
  };


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
      {/* Título Principal */}
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Diesel Management System
      </Typography>

      {/* Toolbar con Búsqueda */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <TextField
          label="Buscar por Trip# o Driver"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
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
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'right' }}>Travelled mi.</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'right' }}>Total gal.</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'right' }}>Total Cost</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Driver</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {slice.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} align="center">
                        <Typography color="text.secondary" sx={{ py: 2 }}>No se encontraron registros de diesel.</Typography>
                    </TableCell>
                </TableRow>
              ) : (
                slice.map((row) => ( 
                  <TableRow key={row.trip_id} hover>
                    <TableCell>{row.trip_number}</TableCell>
                    <TableCell>{row.fecha}</TableCell>
                    <TableCell align="right">{row.odometro} mi</TableCell>
                    <TableCell align="right">{row.galones} gal</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight={600}>{money(row.monto)}</Typography>
                    </TableCell>
                    <TableCell>{row.nombre}</TableCell>
                    <TableCell align="center">
                      <Button variant="contained" size="small" onClick={() => handleVer(row.trip_id)}>View</Button> 
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Paginación MUI Manual */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', p: 1 }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
                Filas por página: {rowsPerPage}
            </Typography>
            <Stack direction="row" spacing={1}>
                <Button disabled={page === 0} onClick={() => handlePageChange(page - 1)} size="small" variant="outlined">Anterior</Button>
                <Typography variant="body2" sx={{ px: 1, display: 'flex', alignItems: 'center' }}>
                    {`${from + 1}-${to} de ${filteredRegistros.length}`}
                </Typography>
                <Button disabled={to >= filteredRegistros.length} onClick={() => handlePageChange(page + 1)} size="small" variant="outlined">Siguiente</Button>
            </Stack>
        </Box>

      </Paper>
    </Box>
  );
};

export default DieselAdmin;