import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, Box, Typography, Stack, CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const apiHost = import.meta.env.VITE_API_HOST;

const money = (v) =>
  new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    minimumFractionDigits: 2, 
    currencyDisplay: 'symbol' 
  }).format(Number(v || 0));

const GastosDetalle = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGasto = useCallback(async () => {
    setLoading(true);
    try {
        const formDataToSend = new FormData();
        formDataToSend.append('op', 'get_registers_gasto');
        formDataToSend.append('trip_id', tripId);

        const response = await fetch(`${apiHost}/formularios.php`, {
            method: 'POST',
            body: formDataToSend
        });
        const data = await response.json();

        if (data.status === 'success') {
            const formatted = data.id.map(t => ({
                trip_number: t.trip_number,
                id: t.id,
                trip_id: t.trip_id,
                fecha: t.fecha,
                monto: t.monto,
                tipo: t.tipo_gasto,
                nombre: t.nombre
            }));
            setRegistros(formatted);
        }
    } catch (error) {
        console.error('Error al obtener gastos:', error);
    } finally {
        setLoading(false);
    }
  }, [tripId]);

  useEffect(() => { 
      fetchGasto(); 
  }, [fetchGasto]);

  const handleVer = (id, trip_id) => {
    navigate(`/editor-gastos/${id}/${trip_id}`);
  };

  const cancelar = () => {
    navigate(`/admin-gastos`);
  }

  if (loading) {
      return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', p: 3 }}>
              <CircularProgress /> 
              <Typography ml={2}>Cargando detalles de gastos...</Typography> 
          </Box>
      );
  }

  return (
   <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
             <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                Expense Details
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
                Trip: <strong>#{registros[0]?.trip_number || tripId}</strong>
            </Typography>
          </Box>
          
          <Button 
            variant="outlined" 
            startIcon={<ArrowBackIcon />} 
            onClick={cancelar}
            sx={{ fontWeight: 600 }}
          >
            Return
          </Button>
      </Stack>

      <Paper elevation={1} sx={{ width: '100%', mb: 2, overflow: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 800 }} aria-label="expenses detail table" size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>No.</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trip</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Last update</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Expense Type</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Total ($)</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Driver</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            
            <TableBody>
              {registros.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={7} align="center">
                          <Typography color="text.secondary" sx={{ py: 3 }}>No hay registros de gastos para este viaje.</Typography>
                      </TableCell>
                  </TableRow>
              ) : (
                  registros.map((row, idx) => ( 
                  <TableRow key={row.id} hover>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{row.trip_number}</TableCell>
                      <TableCell>{row.fecha}</TableCell>
                      <TableCell>{row.tipo}</TableCell>
                      
                      <TableCell align="right" sx={{ fontWeight: 600, color: '#d32f2f' }}> 
                          {money(row.monto)}
                      </TableCell>
                      
                      <TableCell>{row.nombre}</TableCell>
                      
                      <TableCell align="center">
                          <Button 
                              variant="contained" 
                              size="small" 
                              onClick={() => handleVer(row.id, row.trip_id)}
                              sx={{ textTransform: 'none' }}
                          >
                              Edit
                          </Button>
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

export default GastosDetalle;