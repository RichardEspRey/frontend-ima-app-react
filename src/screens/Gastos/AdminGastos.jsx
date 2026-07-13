import { useEffect, useMemo, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, TablePagination, TextField, Stack, FormControl, InputLabel, Select, MenuItem,
  Typography, CircularProgress, Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddCircleIcon from '@mui/icons-material/AddCircle';

// Componentes
import GastoRow from '../../components/GastoRow'; 
import ExpenseModal from './ExpenseModal';

const apiHost = import.meta.env.VITE_API_HOST;

const AdminGastos = () => {
  const navigate = useNavigate(); 
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [filterCountry, setFilterCountry] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const uniqueCountries = useMemo(() => {
    const countries = new Set(gastos.map(g => g.pais).filter(Boolean));
    return ['All', ...Array.from(countries).sort()];
  }, [gastos]);

  const uniqueTypes = useMemo(() => {
    const types = new Set();
    gastos.forEach(g => {
        if(g.detalles && Array.isArray(g.detalles)) {
            g.detalles.forEach(d => {
                if(d.tipo_gasto) {
                    types.add(d.tipo_gasto);
                }
            });
        }
    });
    return ['All', ...Array.from(types).sort()];
  }, [gastos]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set();
    gastos.forEach(g => {
        if(g.detalles && Array.isArray(g.detalles)) {
            g.detalles.forEach(d => {
                if(d.nombre_categoria) {
                    cats.add(d.nombre_categoria);
                }
            });
        }
    });
    return ['All', ...Array.from(cats).sort()];
  }, [gastos]);

  const fetchGastos = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('op', 'getAllGastos');
      const res = await fetch(`${apiHost}/save_expense.php`, { method: 'POST', body: fd });
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data)) setGastos(json.data);
      else setGastos([]);
    } catch (e) { console.error(e); setGastos([]); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGastos(); }, []);

  const filtered = useMemo(() => {
    let list = gastos;
    const q = search.trim().toLowerCase();

    if (q) {
      list = list.filter(g =>
        String(g.id_gasto).includes(q) ||
        (g.pais || '').toLowerCase().includes(q) ||
        (g.moneda || '').toLowerCase().includes(q)
      );
    }

    if (filterCountry !== 'All') {
        list = list.filter(g => g.pais === filterCountry);
    }

    if (filterType !== 'All') {
        list = list.filter(g => {
            if (!g.detalles || g.detalles.length === 0) return false;
            return g.detalles.some(d => d.tipo_gasto === filterType);
        });
    }

    if (filterCategory !== 'All') {
        list = list.filter(g => {
            if (!g.detalles || g.detalles.length === 0) return false;
            return g.detalles.some(d => d.nombre_categoria === filterCategory);
        });
    }

    if (startDate || endDate) {
        list = list.filter(g => {
            const d = g.fecha_gasto;
            return (!startDate || d >= startDate) && (!endDate || d <= endDate);
        });
    }
    return list;
  }, [gastos, search, filterCountry, filterType, filterCategory, startDate, endDate]);

  const slice = rowsPerPage === -1 ? filtered : filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleFilterChange = (setter, value) => { setter(value); setPage(0); };

  const handleSuccess = () => {
      setIsModalOpen(false);
      fetchGastos();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f8fafc' }}>
      
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
            <Typography variant="h4" fontWeight={800} color="#0f172a">Expense Manager</Typography>
            <Typography variant="subtitle1" color="#64748b">Control y administración general de gastos</Typography>
        </Box>
        <Button 
            variant="contained" 
            disableElevation 
            startIcon={<AddCircleIcon />} 
            onClick={() => setIsModalOpen(true)}
            sx={{ bgcolor: '#0f172a', fontWeight: 700, px: 3, py: 1 }}
        >
            Nuevo Gasto
        </Button>
      </Box>

      <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', mb: 3 }} elevation={0}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <TextField size="small" label="Buscar..." placeholder="ID, País..." value={search} onChange={(e) => handleFilterChange(setSearch, e.target.value)} sx={{ minWidth: 200, bgcolor: 'white' }} />
          
          <FormControl size="small" sx={{ minWidth: 150, bgcolor: 'white' }}>
              <InputLabel>País</InputLabel>
              <Select value={filterCountry} label="País" onChange={(e) => handleFilterChange(setFilterCountry, e.target.value)}>
                  {uniqueCountries.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white' }}>
              <InputLabel>Tipo de Gasto</InputLabel>
              <Select value={filterType} label="Tipo de Gasto" onChange={(e) => handleFilterChange(setFilterType, e.target.value)}>
                  {uniqueTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white' }}>
              <InputLabel>Categoría</InputLabel>
              <Select value={filterCategory} label="Categoría" onChange={(e) => handleFilterChange(setFilterCategory, e.target.value)}>
                  {uniqueCategories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
          </FormControl>

          <TextField size="small" label="Fecha Inicio" type="date" value={startDate} onChange={(e) => handleFilterChange(setStartDate, e.target.value)} InputLabelProps={{ shrink: true }} sx={{ bgcolor: 'white' }} />
          <TextField size="small" label="Fecha Fin" type="date" value={endDate} onChange={(e) => handleFilterChange(setEndDate, e.target.value)} InputLabelProps={{ shrink: true }} sx={{ bgcolor: 'white' }} />
          
          <Button variant="text" onClick={() => { setStartDate(''); setEndDate(''); setFilterType('All'); setFilterCategory('All'); setFilterCountry('All'); setSearch(''); setPage(0); }} sx={{ fontWeight: 600 }}>Limpiar Filtros</Button>
          <Button variant="outlined" onClick={fetchGastos} sx={{ fontWeight: 600 }}>Actualizar</Button>
        </Stack>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 3 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: '#f1f5f9' }}>
            <TableRow>
              <TableCell /> 
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Expense #</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Expense Type</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Country</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Total (USD)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Created By </TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Updated By</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 5 }}><CircularProgress size={24}/></TableCell></TableRow>
            ) : slice.length === 0 ? (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 5 }}><Typography color="text.secondary">No se encontraron gastos.</Typography></TableCell></TableRow>
            ) : (
              slice.map((g) => <GastoRow key={g.id_gasto} gasto={g} navigate={navigate} />)
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Box sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', borderTop: 'none', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
          <TablePagination
            rowsPerPageOptions={[20, 40, 60, { label: 'All', value: -1 }]} 
            component="div" count={filtered.length} rowsPerPage={rowsPerPage} page={page}
            onPageChange={(e, n) => setPage(n)} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
          />
      </Box>

      <ExpenseModal 
          open={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={handleSuccess} 
      />

    </Box>
  );
};

export default AdminGastos;