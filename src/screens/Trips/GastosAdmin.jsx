import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Button, Stack, CircularProgress,
} from '@mui/material'; 
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const money = (v) => {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 2,
        currencyDisplay: 'symbol' 
    }).format(Number(v || 0));
};


const GastosAdmin = () => {
  const navigate = useNavigate();
  const apiHost = import.meta.env.VITE_API_HOST;

  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true); 

  // ** LÓGICA DE FETCH **
  const fetchGastos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiHost}/formularios.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'op=getAll_gastos'
      });
      const data = await response.json();
      if (data.status === 'success') {
        const formatted = data.id.map(t => ({
          trip_number: t.trip_number,
          trip_id: t.trip_id,
          fecha: t.fecha,
          registros: t.registros,
          monto: t.monto,
          nombre: t.nombre
        }));
        setRegistros(formatted);
      }
    } catch (error) {
      console.error('Error al obtener gastos de viaje:', error);
    } finally {
        setLoading(false);
    }
  }, [apiHost]);

  useEffect(() => { fetchGastos(); }, [fetchGastos]);

  // ** LÓGICA DE FILTRADO (Añadimos un estado de búsqueda simple para consistencia) **
  const [search, setSearch] = useState('');

  const filteredRegistros = useMemo(() => {
      const searchLower = search.toLowerCase();
      if (!searchLower) return registros;
      
      return registros.filter(r =>
          String(r.trip_number || '').toLowerCase().includes(searchLower) ||
          String(r.nombre || '').toLowerCase().includes(searchLower)
      );
  }, [registros, search]);


  const handleVer = (tripId) => {
    navigate(`/detalle-gastos/${tripId}`); 
  };

  if (loading) {
      return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', p: 3 }}>
              <CircularProgress /> 
              <Typography ml={2}>Cargando registros de gastos...</Typography> 
          </Box>
      );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Título Principal */}
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Travel Expense Manager
      </Typography>

      {/* Toolbar con Búsqueda */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <TextField
          label="Buscar por Trip# o Driver"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ width: 300 }}
        />
        <Button variant="contained" onClick={fetchGastos} size="small">Refrescar</Button>
      </Stack>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" stickyHeader aria-label="Travel expenses table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Trip #</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Last Update</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'right' }}>No of records</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'right' }}>Total Cost</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Last Driver</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'center', width: 120 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRegistros.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} align="center">
                        <Typography color="text.secondary" sx={{ py: 2 }}>No se encontraron registros de gastos de viaje.</Typography>
                    </TableCell>
                </TableRow>
              ) : (
                filteredRegistros.map((row) => ( 
                  <TableRow key={row.trip_id} hover>
                    <TableCell component="th" scope="row">{row.trip_number}</TableCell>
                    <TableCell>{row.fecha}</TableCell>
                    <TableCell align="right">{row.registros}</TableCell>
                    
                    <TableCell align="right">
                      <Typography fontWeight={700}>{money(row.monto)}</Typography>
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
      </Paper>
    </Box>
  );
};

export default GastosAdmin;