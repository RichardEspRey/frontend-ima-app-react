import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, TextField, Box, Typography, CircularProgress, Stack, Button
} from '@mui/material';
import Swal from 'sweetalert2';

import { MargenRow } from '../components/MargenRow'; 

const apiHost = import.meta.env.VITE_API_HOST;

const money = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, currencyDisplay: 'symbol' })
    .format(Number(v || 0));


const MargenScreen = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25); 

  // LÓGICA DE CÁLCULO DE MÁRGENES Y TOTALES
  const calculatedTrips = useMemo(() => {
    return trips.map(t => {
      const driverPay = Number(t.driver_pay || 0); 
      
      const totalTarifa = Number(t.tarifa_pagada || 0); 
      const totalDiesel = Number(t.diesel || 0);
      const totalGastos = Number(t.gastos || 0); 

      const totalCost = totalDiesel + totalGastos + driverPay;
      const totalMargin = totalTarifa - totalCost;
      
      return {
        ...t,
        trip_id: Number(t.trip_id),
        tarifa_pagada: totalTarifa,
        diesel: totalDiesel,
        expenses: totalGastos,
        driver_pay: driverPay,
        totalCost,
        totalMargin,
      };
    });
  }, [trips]);

  const fetchMarginData = useCallback(async () => {
    setLoading(true);
    try {
        const fd = new FormData();
        fd.append('op', 'residuo_trip'); 
        
        const res = await fetch(`${apiHost}/trips.php`, { method: 'POST', body: fd }); 
        const json = await res.json();
        
        if (json.status === 'success' && Array.isArray(json.data)) {
            console.log(json.data)
            setTrips(json.data); 
        } else {
             setTrips([]); 
             Swal.fire('Error de API', 'No se pudieron cargar los datos financieros.', 'error');
        }

    } catch (error) {
        console.error('Error cargando datos de margen:', error);
        Swal.fire('Error de Conexión', 'Fallo al comunicarse con el servidor.', 'error');
        setTrips([]);
    } finally {
        setLoading(false);
    }
  }, [apiHost]);

  useEffect(() => { fetchMarginData(); }, [fetchMarginData]);

  // Filtro
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return calculatedTrips;
    return calculatedTrips.filter(t => (t.trip_number || '').toLowerCase().includes(q));
  }, [calculatedTrips, search]);

  const pageTrips = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  // Handlers
  const handlePageChange = (e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); };

  if (loading) {
      return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', p: 3 }}>
              <CircularProgress /> 
              <Typography ml={2}>Calculando márgenes de viajes...</Typography> 
          </Box>
      );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Reporte de Margen de Utilidad
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <TextField
          size="small"
          label="Buscar Trip number"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ width: 300 }}
        />
        <Button variant="contained" onClick={fetchMarginData} size="small">Refrescar Datos</Button>
      </Stack>

      <Paper elevation={1}>
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table stickyHeader size="small" sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Trip #</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Total Tarifa</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Costo Diesel</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Otros Gastos</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Pago Driver</TableCell>
                <TableCell sx={{ fontWeight: 700, textAlign: 'right', bgcolor: '#f0f0f0' }}>Margen Total (USD)</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {pageTrips.map((t) => (
                <MargenRow 
                    key={t.trip_id} 
                    trip={t} 
                />
              ))}
              {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center"> 
                      <Typography color="text.secondary" sx={{ py: 3 }}>No hay viajes que mostrar.</Typography>
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
        />
      </Paper>
    </Box>
  );
};

export default MargenScreen;