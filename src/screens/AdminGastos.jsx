import React, { useEffect, useMemo, useState } from 'react';
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

// Función estandarizada para mostrar el monto en formato USD ($)
const money = (v) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    currencyDisplay: 'symbol' 
  }).format(Number(v || 0));
};

const isImageUrl = (url = '') => /\.(png|jpe?g|gif|webp|bmp|tiff?)$/i.test(url);
const fileName = (path = '') => path.split('/').pop() || '';

/* === Componente Fila (GastoRow) === */
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

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell padding="checkbox">
          <IconButton size="small" onClick={() => setOpen((p) => !p)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>#{gasto.id_gasto}</TableCell>
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

      {/* Detalles colapsables */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ m: 1, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
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
                      <TableCell>Expense Type</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
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

              {/* Tickets */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1rem' }}>Tickets</Typography>
                <Chip size="small" label={tickets.length} />
              </Box>

              {tickets.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No tickets attached.</Typography>
              ) : (
                // 🚨 PhotoProvider: Contenedor para visualizar imágenes en lightbox
                <PhotoProvider>
                  <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
                    {tickets.map((t) => {
                      const url = t.url || t.ruta_archivo;
                      const name = t.nombre_original || fileName(url);
                      const esImg = isImageUrl(url);
                      return (
                        <Box key={t.id_documento} sx={{
                          width: 140,
                          border: '1px solid #e0e0e0',
                          borderRadius: 1,
                          p: 1,
                          textAlign: 'center',
                          backgroundColor: '#fafafa',
                        }}>
                          {esImg ? (
                            // 🚨 PhotoView: Envuelve la imagen para la galería
                            <PhotoView src={url}>
                              <img
                                src={url}
                                alt={name}
                                style={{ width: '100%', height: 90, objectFit: 'cover', borderRadius: 6, cursor: 'zoom-in' }}
                              />
                            </PhotoView>
                          ) : (
                            // Renderizado para documentos que NO son imágenes
                            <Box
                              sx={{
                                height: 90,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 1,
                                bgcolor: '#fff',
                                border: '1px dashed #ccc',
                                fontSize: 12
                              }}
                              title={name}
                            >
                              {t.tipo_documento || 'Documento'}
                            </Box>
                          )}

                          <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }} noWrap title={name}>
                            {name}
                          </Typography>

                          <Button size="small" variant="text" href={url} target="_blank" rel="noopener noreferrer" sx={{ mt: 0.5 }}>
                            Open / Download
                          </Button>
                        </Box>
                      );
                    })}
                  </Stack>
                </PhotoProvider>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="subtitle1" fontWeight={700}> 
                  Total: <strong>{money(totalMostrado)}</strong>
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

/* === Tabla principal === */
const AdminGastos = () => {
  const navigate = useNavigate(); //
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  const [filterCountry, setFilterCountry] = useState('All');
  const [startDate, setStartDate] = useState(''); 
  const [endDate, setEndDate] = useState('');     
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20); 

  const uniqueCountries = useMemo(() => {
    const countries = new Set(gastos.map(g => g.pais).filter(Boolean));
    return ['All', ...Array.from(countries).sort()];
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
    } catch (e) {
      console.error('Error cargando gastos:', e);
      setGastos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGastos(); }, []);

  // ** LÓGICA DE FILTRADO **
  const filtered = useMemo(() => {
    let list = gastos;
    const q = search.trim().toLowerCase();

    // Filtro de búsqueda general (ID, país, moneda)
    if (q) {
      list = list.filter(g =>
        String(g.id_gasto).includes(q) ||
        (g.pais || '').toLowerCase().includes(q) ||
        (g.moneda || '').toLowerCase().includes(q)
      );
    }

    // Filtro por país
    if (filterCountry !== 'All') {
      list = list.filter(g => g.pais === filterCountry);
    }

    // Filtro por RANGO DE FECHAS
    if (startDate || endDate) {
        list = list.filter(g => {
            const expenseDate = g.fecha_gasto; 
            const afterStart = !startDate || expenseDate >= startDate;
            const beforeEnd = !endDate || expenseDate <= endDate;
            return afterStart && beforeEnd;
        });
    }
    return list;
  }, [gastos, search, filterCountry, startDate, endDate]);

  // ** LÓGICA DE PAGINACIÓN **
  const slice = rowsPerPage === -1
    ? filtered
    : filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(0); 
  };
  
  const rowsPerPageOptions = [20, 40, 60, { label: 'Todos', value: -1 }];


  return (
    <Paper sx={{ m: 2, p: 3 }}>
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>Expense Manager</Typography>
        
      {/* Controles de Filtrado */}
      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mb: 3 }}>
            
        {/* Filtro de Búsqueda Rápida */}
        <TextField
            size="small" 
            label="Buscar General"
            placeholder="ID, País o Moneda"
            value={search}
            onChange={(e) => handleFilterChange(setSearch, e.target.value)}
        />

        {/* Filtro por País */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Country</InputLabel>
            <Select
                value={filterCountry}
                label="Country"
                onChange={(e) => handleFilterChange(setFilterCountry, e.target.value)}
            >
                {uniqueCountries.map(country => (
                    <MenuItem key={country} value={country}>
                        {country}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>

        {/* Filtro por Fecha de Inicio */}
        <TextField
            size="small"
            label="Fecha Inicio"
            type="date"
            value={startDate}
            onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
        />
        
        {/* Filtro por Fecha de Fin */}
        <TextField
            size="small"
            label="Fecha Fin"
            type="date"
            value={endDate}
            onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 150 }}
        />
        <Button variant="outlined" onClick={() => { setStartDate(''); setEndDate(''); setPage(0); }} size="small">Limpiar Fechas</Button>
        <Button variant="contained" onClick={fetchGastos} size="small">Refrescar</Button>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table stickyHeader size="small" aria-label="Expenses table">
          <TableHead>
            <TableRow>
              <TableCell scope="col" /> 
              <TableCell scope="col" sx={{ fontWeight: 600 }}>Expense Number</TableCell>
              <TableCell scope="col" sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell scope="col" sx={{ fontWeight: 600 }}>Country</TableCell>
              <TableCell scope="col" sx={{ fontWeight: 600 }}>Total (USD)</TableCell>
              <TableCell scope="col" sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : (
              slice.map((g) => <GastoRow key={g.id_gasto} gasto={g} navigate={navigate} />)
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions} 
        component="div"
        count={filtered.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />
    </Paper>
  );
};

export default AdminGastos;
