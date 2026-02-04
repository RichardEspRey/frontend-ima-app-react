import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, CircularProgress, 
  Stack, TextField, TablePagination, Chip, IconButton, Grid
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import OpacityIcon from '@mui/icons-material/Opacity';
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Date Handling
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// Configuración DayJS 
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const apiHost = import.meta.env.VITE_API_HOST;

// Helper número
const numberFmt = (n) => new Intl.NumberFormat('en-US').format(Number(n).toFixed(0));

export default function AfinacionesHistory() {
  const navigate = useNavigate();

  // --- States ---
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [truckFilter, setTruckFilter] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // --- Fetch ---
  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('op', 'get_history');
      const res = await fetch(`${apiHost}/afinaciones.php`, { method: 'POST', body: fd });
      const json = await res.json();

      if (json.status === 'success') {
        setHistory(json.data);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("Error cargando historial:", err);
      Swal.fire('Error', 'No se pudo cargar el historial', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  // --- Filtrado ---
  const filteredData = useMemo(() => {
    return history.filter(reg => {
        const matchTruck = truckFilter === '' || String(reg.unidad || '').toLowerCase().includes(truckFilter.toLowerCase());

        let regDate = null;
        if (reg.fecha_registro) regDate = dayjs(reg.fecha_registro);
        
        const start = startDate ? dayjs(startDate).startOf('day') : null;
        const end = endDate ? dayjs(endDate).endOf('day') : null;

        const matchDate = (!start || (regDate && regDate.isSameOrAfter(start))) && 
                          (!end || (regDate && regDate.isSameOrBefore(end)));

        return matchTruck && matchDate;
    });
  }, [history, truckFilter, startDate, endDate]);

  // --- Handlers ---
  const handleClearFilters = () => {
      setTruckFilter('');
      setStartDate(null);
      setEndDate(null);
      setPage(0);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} color="inherit">
            Volver
        </Button>
        <Typography variant="h4" fontWeight={800}>Historial de Afinaciones</Typography>
      </Stack>

      <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: '#f8f9fa' }}>
        <Typography variant="subtitle2" fontWeight={600} color="text.secondary" mb={2} display="flex" alignItems="center" gap={1}>
            <FilterListIcon fontSize="small" /> Filtros de Búsqueda
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
                <TextField 
                    label="Buscar Camión" 
                    size="small" 
                    fullWidth 
                    value={truckFilter}
                    onChange={(e) => { setTruckFilter(e.target.value); setPage(0); }}
                    placeholder="Ej: 101"
                />
            </Grid>
            <Grid item xs={12} sm={6}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => { setStartDate(date); setPage(0); }}
                        selectsStart startDate={startDate} endDate={endDate}
                        placeholderText="Fecha Inicio" dateFormat="dd/MM/yyyy"
                        className="form-input-datepicker" isClearable 
                        customInput={<TextField size="small" fullWidth label="Desde" />}
                    />
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => { setEndDate(date); setPage(0); }}
                        selectsEnd startDate={startDate} endDate={endDate} minDate={startDate}
                        placeholderText="Fecha Fin" dateFormat="dd/MM/yyyy"
                        className="form-input-datepicker" isClearable 
                        customInput={<TextField size="small" fullWidth label="Hasta" />}
                    />
                </Stack>
            </Grid>
            <Grid item xs={12} sm={3} display="flex" justifyContent="flex-end">
                <Button 
                    variant="outlined" 
                    color="error" 
                    startIcon={<DeleteSweepIcon />} 
                    onClick={handleClearFilters}
                    size="small"
                >
                    Limpiar Filtros
                </Button>
            </Grid>
        </Grid>
      </Paper>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
            <Table stickyHeader size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#eee' }}>Fecha Registro</TableCell>
                        <TableCell sx={{ fontWeight: 700, bgcolor: '#eee' }}>Camión</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, bgcolor: '#eee' }}>Millas al Corte</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, bgcolor: '#eee' }}>Aceite Restante</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5 }}><CircularProgress /></TableCell></TableRow>
                    ) : filteredData.length === 0 ? (
                        <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3, color: 'text.secondary' }}>No se encontraron registros con estos filtros</TableCell></TableRow>
                    ) : (
                        filteredData
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((reg) => (
                                <TableRow key={reg.id_afinacion} hover>
                                    <TableCell>
                                        {dayjs(reg.fecha_registro).format('DD/MM/YYYY hh:mm A')}
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: '1.1em' }}>{reg.unidad}</TableCell>
                                    <TableCell align="right" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                                        {numberFmt(reg.millas_acumuladas)} mi
                                    </TableCell>
                                    <TableCell align="right">
                                        <Chip 
                                            icon={<OpacityIcon style={{ fontSize: 16 }} />} 
                                            label={`${reg.porcentaje_aceite}%`} 
                                            size="small" 
                                            color={Number(reg.porcentaje_aceite) < 20 ? "error" : "default"}
                                            variant="outlined"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>

        <TablePagination
            rowsPerPageOptions={[25, 50, 100]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            labelRowsPerPage="Filas por página:"
        />
      </Paper>

    </Box>
  );
}