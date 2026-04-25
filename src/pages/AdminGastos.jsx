import { useEffect, useMemo, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, TablePagination, TextField, Stack, FormControl, InputLabel, Select, MenuItem,
  Typography, CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

// Importamos el componente extraído
import GastoRow from '../components/GastoRow'; // Asegúrate que la ruta sea correcta

const apiHost = import.meta.env.VITE_API_HOST;

const AdminGastos = () => {
  const navigate = useNavigate(); 
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [filterCountry, setFilterCountry] = useState('All');
  const [filterSubcat, setFilterSubcat] = useState('All'); 
  const [startDate, setStartDate] = useState(''); 
  const [endDate, setEndDate] = useState('');     
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20); 

  const uniqueCountries = useMemo(() => {
    const countries = new Set(gastos.map(g => g.pais).filter(Boolean));
    return ['All', ...Array.from(countries).sort()];
  }, [gastos]);

  const uniqueSubcategories = useMemo(() => {
    const subs = new Set();
    gastos.forEach(g => {
        if(g.detalles && Array.isArray(g.detalles)) {
            g.detalles.forEach(d => {
                if(d.nombre_subcategoria) {
                    subs.add(d.nombre_subcategoria);
                }
            });
        }
    });
    return ['All', ...Array.from(subs).sort()];
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

    if (filterSubcat !== 'All') {
        list = list.filter(g => {
            if (!g.detalles || g.detalles.length === 0) return false;
            return g.detalles.some(d => d.nombre_subcategoria === filterSubcat);
        });
    }

    if (startDate || endDate) {
        list = list.filter(g => {
            const d = g.fecha_gasto; 
            return (!startDate || d >= startDate) && (!endDate || d <= endDate);
        });
    }
    return list;
  }, [gastos, search, filterCountry, filterSubcat, startDate, endDate]);

  const slice = rowsPerPage === -1 ? filtered : filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleFilterChange = (setter, value) => { setter(value); setPage(0); };

  return (
    <Paper sx={{ m: 2, p: 3 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>Expense Manager</Typography>
        
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mb: 3 }}>
        <TextField size="small" label="Search" placeholder="ID, Country..." value={search} onChange={(e) => handleFilterChange(setSearch, e.target.value)} />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Country</InputLabel>
            <Select value={filterCountry} label="Country" onChange={(e) => handleFilterChange(setFilterCountry, e.target.value)}>
                {uniqueCountries.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Subcategory</InputLabel>
            <Select value={filterSubcat} label="Subcategory" onChange={(e) => handleFilterChange(setFilterSubcat, e.target.value)}>
                {uniqueSubcategories.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
        </FormControl>

        <TextField size="small" label="Start Date" type="date" value={startDate} onChange={(e) => handleFilterChange(setStartDate, e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField size="small" label="End Date" type="date" value={endDate} onChange={(e) => handleFilterChange(setEndDate, e.target.value)} InputLabelProps={{ shrink: true }} />
        
        <Button variant="outlined" onClick={() => { setStartDate(''); setEndDate(''); setFilterSubcat('All'); setFilterCountry('All'); setPage(0); }} size="small">Clear</Button>
        <Button variant="contained" onClick={fetchGastos} size="small">Refresh</Button>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell /> 
              <TableCell sx={{ fontWeight: 600 }}>Expense #</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Expense Type</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Country</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Total (USD)</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center"><CircularProgress /></TableCell></TableRow>
            ) : (
              slice.map((g) => <GastoRow key={g.id_gasto} gasto={g} navigate={navigate} />)
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[20, 40, 60, { label: 'All', value: -1 }]} 
        component="div" count={filtered.length} rowsPerPage={rowsPerPage} page={page}
        onPageChange={(e, n) => setPage(n)} onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />
    </Paper>
  );
};

export default AdminGastos;