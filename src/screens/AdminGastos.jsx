import { useEffect, useMemo, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, TablePagination, TextField, Box, Typography, CircularProgress,
  IconButton, Collapse, Chip, Stack, Divider, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { useNavigate } from 'react-router-dom';

const apiHost = import.meta.env.VITE_API_HOST;

const money = (v) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    currencyDisplay: 'symbol' 
  }).format(Number(v || 0));
};

const isImageUrl = (url = '') => /\.(png|jpe?g|gif|webp|bmp|tiff?)$/i.test(url);
const fileName = (path = '') => path.split('/').pop() || '';

const GastoRow = ({ gasto, navigate }) => {
  const [open, setOpen] = useState(false);
  const detalles = gasto?.detalles ?? [];
  const tickets = gasto?.tickets ?? [];

  const totalCalc = useMemo(() => {
    return detalles.reduce((acc, d) => {
      const cant = parseFloat(d.cantidad_articulo ?? 0) || 0;
      const pu = parseFloat(d.precio_unitario ?? 0) || 0;
      return acc + cant * pu;
    }, 0);
  }, [detalles]);

  const totalMostrado = Number(gasto.monto_total ?? 0) > 0
    ? Number(gasto.monto_total)
    : totalCalc;

  const lastDetail = detalles.length > 0 ? detalles[detalles.length - 1] : null;
  const lastExpenseType = lastDetail?.tipo_gasto || '—';

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell padding="checkbox">
          <IconButton size="small" onClick={() => setOpen((p) => !p)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>#{gasto.id_gasto}</TableCell>
        <TableCell>{lastExpenseType}</TableCell>
        <TableCell>{gasto.fecha_gasto}</TableCell>
        <TableCell>{gasto.pais}</TableCell>
        <TableCell><strong>{money(totalMostrado)}</strong></TableCell>
        <TableCell align="left">
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate(`/edit-expense/${gasto.id_gasto}`)}
          >
            Editar
          </Button>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ m: 1, p: 2, border: '1px solid #eee', borderRadius: 2, bgcolor: '#f9f9f9' }}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1rem', mb: 1.5 }}>
                Expense details #{gasto.id_gasto}
              </Typography>

              {detalles.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No details available.
                </Typography>
              ) : (
                <Table size="small" sx={{ mb: 2 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Expense Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Subcategory</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Qty</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Unit Price</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detalles.map((d) => {
                      const cant = parseFloat(d.cantidad_articulo ?? 0) || 0;
                      const pu = parseFloat(d.precio_unitario ?? 0) || 0;
                      const sub = cant * pu;
                      
                      return (
                        <TableRow key={d.id_detalle_gasto}>
                          <TableCell>{d.tipo_gasto || '—'}</TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                            {d.nombre_subcategoria || '—'}
                          </TableCell>
                          <TableCell>{d.descripcion_articulo || '—'}</TableCell>
                          <TableCell align="right">{cant}</TableCell>
                          <TableCell align="right">{money(pu)}</TableCell>
                          <TableCell align="right">{money(sub)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>Tickets</Typography>
                <Chip size="small" label={tickets.length} />
              </Box>

              {tickets.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No tickets attached.</Typography>
              ) : (
                <PhotoProvider>
                  <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
                    {tickets.map((t) => {
                      const url = t.url || t.ruta_archivo;
                      const name = t.nombre_original || fileName(url);
                      const esImg = isImageUrl(url);
                      return (
                        <Box key={t.id_documento} sx={{ width: 120, border: '1px solid #e0e0e0', borderRadius: 1, p: 1, textAlign: 'center', bgcolor: '#fff' }}>
                          {esImg ? (
                            <PhotoView src={url}>
                              <img src={url} alt={name} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4, cursor: 'zoom-in' }} />
                            </PhotoView>
                          ) : (
                            <Box sx={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1, border: '1px dashed #ccc', fontSize: 11 }}>
                              {t.tipo_documento || 'Doc'}
                            </Box>
                          )}
                          <Button size="small" sx={{ mt: 0.5, fontSize: '0.65rem' }} href={url} target="_blank">View</Button>
                        </Box>
                      );
                    })}
                  </Stack>
                </PhotoProvider>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const AdminGastos = () => {
  const navigate = useNavigate(); 
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [filterCountry, setFilterCountry] = useState('All');
  const [filterSubcat, setFilterSubcat] = useState('All'); // NUEVO ESTADO DE FILTRO
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