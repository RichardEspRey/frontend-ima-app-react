import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, TextField, Box, Typography, CircularProgress, Stack, Button,
  Tabs, Tab, Collapse
} from '@mui/material';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Swal from 'sweetalert2';

import { MargenRow } from '../components/MargenRow'; 
import { MargenCharts } from '../components/Margen/MargenCharts';

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
  
  const [tabValue, setTabValue] = useState(0); 
  const [showCharts, setShowCharts] = useState(false);

  const calculatedTrips = useMemo(() => {
    return trips.map(t => {
      const driverPay = Number(t.driver_subtotal || 0); 
      
      const totalTarifa = Number(t.total_rate || 0); 

      const totalDiesel = Number(t.diesel || 0);
      
      const totalCost = totalDiesel + driverPay; 
      const totalMargin = totalTarifa - totalCost;

      const isDieselOk = Number(t.diesel_alerts || 0) === 0;
      const isDriverPaid = Number(t.driver_payment_status || 0) === 1;

      const isCompleted = isDieselOk && isDriverPaid;

      return {
        ...t,
        trip_id: Number(t.trip_id),
        total_rate: totalTarifa, 
        diesel: totalDiesel,
        driver_pay: driverPay,
        totalCost,
        totalMargin,
        isDieselOk,
        isDriverPaid,
        isCompleted
      };
    });
  }, [trips]);

  const fetchMarginData = useCallback(async () => {
    setLoading(true);
    try {
        const fdMargen = new FormData();
        fdMargen.append('op', 'residuo_trip'); 
        const fdVentas = new FormData();
        fdVentas.append('op', 'All_finanzas');
        
        const [json, jsonVentas] = await Promise.all([
            fetch(`${apiHost}/trips.php`, { method: 'POST', body: fdMargen }).then(r => r.json()),
            fetch(`${apiHost}/formularios.php`, { method: 'POST', body: fdVentas }).then(r => r.json()),
        ]);
        
        if (json.status === 'success' && Array.isArray(json.data) && jsonVentas.status === 'success' && Array.isArray(jsonVentas.data)) {
            const totalRatePorViaje = new Map(jsonVentas.data.map(v => [Number(v.trip_id), v.total_tarifa]));
            setTrips(json.data.map(t => ({ ...t, total_rate: totalRatePorViaje.get(Number(t.trip_id)) })));
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

  const filtered = useMemo(() => {
    let result = calculatedTrips;

    if (tabValue === 0) {
        result = result.filter(t => !t.isCompleted); 
    } else if (tabValue === 1) {
        result = result.filter(t => t.isCompleted); 
    }

    const q = search.trim().toLowerCase();
    if (q) {
        result = result.filter(t => (t.trip_number || '').toLowerCase().includes(q));
    }
    
    return result;
  }, [calculatedTrips, search, tabValue]);

  const pageTrips = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
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
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 1 }}>
        Reporte de Margen de Utilidad
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => { setTabValue(newValue); setPage(0); }}
            textColor="primary"
            indicatorColor="primary"
        >
            <Tab label="Pendientes" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '1rem' }} />
            <Tab label="Completados" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '1rem' }} />
        </Tabs>
      </Box>

      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <TextField
          size="small"
          label="Buscar Trip number"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ width: 300 }}
        />
        <Button variant="contained" onClick={fetchMarginData} size="small">Refrescar Datos</Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<InsertChartOutlinedIcon />}
          endIcon={showCharts ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          onClick={() => setShowCharts(p => !p)}
          sx={{ bgcolor: 'white', borderColor: '#cbd5e1', color: '#334155', fontWeight: 600, textTransform: 'none' }}
        >
          Gráficas de Margen
        </Button>
      </Stack>

      <Collapse in={showCharts}>
        <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', mb: 3 }} elevation={0}>
          <MargenCharts trips={calculatedTrips} loading={loading} />
        </Paper>
      </Collapse>

      <Paper elevation={1}>
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table stickyHeader size="small" sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Trip #</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Total Tarifa</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Costo Diesel</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Pago Driver</TableCell>
                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Estatus</TableCell>
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
                      <Typography color="text.secondary" sx={{ py: 3 }}>
                        No hay viajes que mostrar en esta pestaña.
                      </Typography>
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