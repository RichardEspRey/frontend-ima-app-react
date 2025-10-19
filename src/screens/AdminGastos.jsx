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

const apiHost = import.meta.env.VITE_API_HOST;

// const money = (v, c = 'MXN') =>
//   new Intl.NumberFormat('es-MX', { style: 'currency', currency: c })
//     .format(Number(v || 0));

const money = (v) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    currencyDisplay: 'symbol' 
  }).format(Number(v || 0));
};

const isImageUrl = (url = '') => /\.(png|jpe?g|gif|webp|bmp|tiff?)$/i.test(url);
const fileName = (path = '') => path.split('/').pop() || '';

/* === Componente Fila (GastoRow) - Se mantiene igual === */
const GastoRow = ({ gasto }) => {
  const [open, setOpen] = useState(false);
  const detalles = gasto?.detalles ?? [];
  const tickets  = gasto?.tickets ?? [];

  const totalCalc = useMemo(() => {
    const t = detalles.reduce((acc, d) => {
      const cant = parseFloat(d.cantidad_articulo ?? 0) || 0;
      const pu   = parseFloat(d.precio_unitario ?? 0)  || 0;
      return acc + cant * pu;
    }, 0);
    return t;
  }, [detalles]);

  const totalMostrado = Number(gasto.monto_total ?? 0) > 0
    ? Number(gasto.monto_total)
    : totalCalc;

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell padding="checkbox">
          <IconButton size="small" onClick={() => setOpen(p => !p)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>#{gasto.id_gasto}</TableCell>
        <TableCell>{gasto.fecha_gasto}</TableCell>
        <TableCell>{gasto.pais}</TableCell>
        <TableCell><strong>{money(totalMostrado)}</strong></TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}> 
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ m: 1, p: 2, border: '1px solid #eee', borderRadius: 2 }}>
              
              <Typography variant="h6" sx={{ fontSize: '1rem', mb: 1.5 }}>
                Expense details #{gasto.id_gasto}
              </Typography>

              {detalles.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No details available.</Typography>
              ) : (
                <>
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
                        const pu   = parseFloat(d.precio_unitario ?? 0)  || 0;
                        const sub  = cant * pu;
                        return (
                          <TableRow key={d.id_detalle_gasto}>
                            <TableCell>{d.tipo_gasto || '—'}</TableCell>
                            <TableCell>{d.descripcion_articulo || '—'}</TableCell>
                            <TableCell align="right">{cant}</TableCell>
                            <TableCell align="right">{money(pu, gasto.moneda || 'MXN')}</TableCell>
                            <TableCell align="right">{money(sub, gasto.moneda || 'MXN')}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem' }}>Tickets</Typography>
                <Chip size="small" label={tickets.length} />
              </Box>

              {tickets.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No tickets attached.</Typography>
              ) : (
                <PhotoProvider>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{
                      flexWrap: 'wrap',
                      '& img': { display: 'block' }
                    }}
                  >
                    {tickets.map((t) => {
                      const url = t.url || t.ruta_archivo;
                      const name = t.nombre_original || fileName(url);
                      const esImg = isImageUrl(url);

                      return (
                        <Box
                          key={t.id_documento}
                          sx={{
                            width: 140,
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            p: 1,
                            textAlign: 'center',
                            backgroundColor: '#fafafa'
                          }}
                        >
                          {esImg ? (
                            <PhotoView src={url}>
                              <img
                                src={url}
                                alt={name}
                                style={{
                                  width: '100%',
                                  height: 90,
                                  objectFit: 'cover',
                                  borderRadius: 6,
                                  cursor: 'zoom-in'
                                }}
                              />
                            </PhotoView>
                          ) : (
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

                          <Typography
                            variant="caption"
                            sx={{ display: 'block', mt: 0.5 }}
                            noWrap
                            title={name}
                          >
                            {name}
                          </Typography>

                          <Button
                            size="small"
                            variant="text"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ mt: 0.5 }}
                          >
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
                <Typography variant="subtitle1">
                  Total: <strong>{money(totalMostrado, gasto.moneda || 'MXN')}</strong>
                </Typography>
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

/* === Tabla de gastos (AdminGastos) === */
const AdminGastos = () => {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // ** NUEVOS ESTADOS PARA FILTRO DE RANGO DE FECHAS **
  const [filterCountry, setFilterCountry] = useState('All');
  const [startDate, setStartDate] = useState(''); // Fecha de inicio 'YYYY-MM-DD'
  const [endDate, setEndDate] = useState('');     // Fecha de fin 'YYYY-MM-DD'
  
  // ** PAGINACIÓN AJUSTADA **
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20); // Valor por defecto cambiado a 20

  // Obtener la lista única de países para el filtro
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
      if (json.status === 'success' && Array.isArray(json.data)) {
        setGastos(json.data);
      } else {
        setGastos([]);
        console.error(json.message || 'Respuesta no exitosa.');
      }
    } catch (e) {
      console.error('Error cargando gastos:', e);
      setGastos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGastos(); }, []);

  // ** LÓGICA DE FILTRADO COMBINADA CON RANGO DE FECHAS **
  const filtered = useMemo(() => {
    let list = gastos;
    const q = search.trim().toLowerCase();

    // 1. Filtro de búsqueda general (ID, país, moneda)
    if (q) {
      list = list.filter(g =>
        String(g.id_gasto).includes(q) ||
        (g.pais || '').toLowerCase().includes(q) ||
        (g.moneda || '').toLowerCase().includes(q)
      );
    }

    // 2. Filtro por país
    if (filterCountry !== 'All') {
      list = list.filter(g => g.pais === filterCountry);
    }

    // 3. Filtro por RANGO DE FECHAS
    if (startDate || endDate) {
        list = list.filter(g => {
            const expenseDate = g.fecha_gasto; // Asumimos formato 'YYYY-MM-DD'
            
            // Si hay fecha de inicio, la fecha del gasto debe ser igual o posterior
            const afterStart = !startDate || expenseDate >= startDate;
            
            // Si hay fecha de fin, la fecha del gasto debe ser igual o anterior
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

  // Reinicia la paginación a la página 0 cuando se aplica un filtro
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(0); 
  };
  
  // Opciones de filas por página, incluyendo "Todos" (valor -1)
  const rowsPerPageOptions = [20, 40, 60, { label: 'Todos', value: -1 }];


  return (
    <Paper sx={{ m: 2, p: 2 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Expense Manager</Typography>
        
        {/* Controles de Filtrado */}
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            
            {/* Filtro de Búsqueda Rápida */}
            <TextField
                size="small"
                placeholder="Search by ID or currency"
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

            {/* NUEVO: Filtro por Fecha de Inicio */}
            <TextField
                size="small"
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => handleFilterChange(setStartDate, e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 150 }}
            />
            
            {/* NUEVO: Filtro por Fecha de Fin */}
            <TextField
                size="small"
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => handleFilterChange(setEndDate, e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 150 }}
            />
        </Stack>
      </Box>

      <TableContainer>
        <Table stickyHeader size="small" aria-label="Expenses table">
          <TableHead>
            <TableRow>
              <TableCell scope="col" /> {/* Columna de Expansión */}
              <TableCell scope="col">Expense Number</TableCell>
              <TableCell scope="col">Date</TableCell>
              <TableCell scope="col">Country</TableCell>
              <TableCell scope="col">Total (USD)</TableCell> 
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ py: 4, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress size={24} />
                    <Typography>Loading expenses…</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : slice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>No expenses found with applied filters.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              slice.map((g) => <GastoRow key={g.id_gasto} gasto={g} />)
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={rowsPerPageOptions} // Usamos las opciones personalizadas
        component="div"
        count={filtered.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        labelRowsPerPage="Rows per page:"
      />
    </Paper>
  );
};

export default AdminGastos;