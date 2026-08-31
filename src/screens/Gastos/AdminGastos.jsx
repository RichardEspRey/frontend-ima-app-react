import { useEffect, useMemo, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, TablePagination, TextField, Stack, FormControl, InputLabel, Select, MenuItem,
  Typography, CircularProgress, Box, Collapse, ToggleButton, ToggleButtonGroup,
  Grid, Divider, InputAdornment, Tooltip, IconButton, TableSortLabel, TableFooter
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

// Componentes
import GastoRow from '../../components/GastoRow';
import ExpenseModal from './ExpenseModal';
import { ExpenseTypeChart } from '../../components/Gastos/ExpenseTypeChart';
import useFetchExchangeRate from '../../hooks/useFetchExchangeRate';
import { ordenarGastos, siguienteOrden } from '../../utils/ordenarGastos';
import { normalizarTexto } from '../../utils/texto';
import { totalUSD, totalMXN } from '../../utils/gastosValores';
import { useGastosFiltrosStore } from '../../store/useGastosFiltrosStore';
import useFetchExpenseTypes from '../../hooks/expense_hooks/useFetchExpenseTypes';
import useFetchCategories from '../../hooks/expense_hooks/useFetchCategories';
import useFetchSubcategories from '../../hooks/expense_hooks/useFetchSubcategories';
import { SECTION_LABEL_SX, HEADER_ROW_SX, HEADER_CELL_SX, DARK_BTN_SX, money, moneyMXN } from './estilosGastos';
import { useSesion } from '../../shared/auth';

const apiHost = import.meta.env.VITE_API_HOST;


const TOOLTIP_SIGUIENTE = { asc: 'Ordenar descendente', desc: 'Quitar orden' };

const CeldaOrdenable = ({ campo, label, orden, onOrdenar, align = 'left' }) => {
  const activa = orden.campo === campo;
  const siguiente = activa ? TOOLTIP_SIGUIENTE[orden.dir] : 'Ordenar ascendente';
  return (
    <TableCell
      sx={{ ...HEADER_CELL_SX, textAlign: align }}
      sortDirection={activa ? orden.dir : false}
    >
      <Tooltip title={siguiente} enterDelay={600}>
        <TableSortLabel
          active={activa}
          direction={activa ? orden.dir : 'asc'}
          onClick={() => onOrdenar(campo)}
          sx={{
            color: 'inherit !important',
            whiteSpace: 'nowrap',
            '& .MuiTableSortLabel-icon': {
              color: '#64748b !important',
              width: 0,
              mx: 0,
              overflow: 'hidden',
            },
            '&.Mui-active .MuiTableSortLabel-icon': { width: 18, ml: '4px' },
          }}
        >
          {label}
        </TableSortLabel>
      </Tooltip>
    </TableCell>
  );
};

const AdminGastos = () => {
  const navigate = useNavigate();
  const { esTotal: esAdmin } = useSesion();
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showChart, setShowChart] = useState(false);

  const {
    search, filterCountry, filterType, filterCategory, filterSubcategory, filterDescription, startDate, endDate,
    page, rowsPerPage, orden, showFilters,
    set: setEstado, setFiltro, limpiarFiltros,
  } = useGastosFiltrosStore();
  const [chartCountry, setChartCountry] = useState('US');

  // Tasa USD -> MXN del día (misma fuente que usa el formulario de gastos en México)
  // para convertir en pantalla los gastos registrados en USD a su equivalente en pesos.
  const { exchangeRate: mxnRate, fetchExchangeRate: fetchMxnRate } = useFetchExchangeRate();
  useEffect(() => { fetchMxnRate(); }, [fetchMxnRate]);

  const { expenseTypes } = useFetchExpenseTypes();
  const { maintenanceCategories } = useFetchCategories();
  const { subcategories } = useFetchSubcategories();

  const uniqueCountries = useMemo(() => {
    const countries = new Set(gastos.map(g => g.pais).filter(Boolean));
    return ['All', ...Array.from(countries).sort()];
  }, [gastos]);

  const uniqueTypes = useMemo(
    () => ['All', ...expenseTypes.map(t => t.label).sort((a, b) => a.localeCompare(b, 'es'))],
    [expenseTypes],
  );

  const tipoSeleccionado = useMemo(
    () => expenseTypes.find(t => t.label === filterType) || null,
    [expenseTypes, filterType],
  );

  const uniqueCategories = useMemo(() => {
    const relevantes = tipoSeleccionado
      ? maintenanceCategories.filter(c => String(c.id_tipo_gasto) === String(tipoSeleccionado.value))
      : maintenanceCategories;
    return ['All', ...relevantes.map(c => c.label).sort((a, b) => a.localeCompare(b, 'es'))];
  }, [maintenanceCategories, tipoSeleccionado]);

  const categoriaSeleccionada = useMemo(
    () => maintenanceCategories.find(c => c.label === filterCategory) || null,
    [maintenanceCategories, filterCategory],
  );

  const uniqueSubcategories = useMemo(() => {
    if (!categoriaSeleccionada) return [];
    return subcategories
      .filter(sub => String(sub.id_categoria) === String(categoriaSeleccionada.value))
      .map(sub => sub.label)
      .sort((a, b) => a.localeCompare(b, 'es'));
  }, [subcategories, categoriaSeleccionada]);

  const haySubcategorias = uniqueSubcategories.length > 0;

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

    if (filterSubcategory !== 'All') {
        list = list.filter(g => {
            if (!g.detalles || g.detalles.length === 0) return false;
            return g.detalles.some(d => d.nombre_subcategoria === filterSubcategory);
        });
    }

    const descripcionBuscada = normalizarTexto(filterDescription);
    if (descripcionBuscada) {
        list = list.filter(g => {
            if (!g.detalles || g.detalles.length === 0) return false;
            return g.detalles.some(d => normalizarTexto(d.descripcion_articulo).includes(descripcionBuscada));
        });
    }

    if (startDate || endDate) {
        list = list.filter(g => {
            const d = g.fecha_gasto;
            return (!startDate || d >= startDate) && (!endDate || d <= endDate);
        });
    }
    return list;
  }, [gastos, search, filterCountry, filterType, filterCategory, filterSubcategory, filterDescription, startDate, endDate]);

  const ordenados = useMemo(
    () => ordenarGastos(filtered, orden, mxnRate),
    [filtered, orden, mxnRate],
  );

  const totales = useMemo(() => {
    let usd = 0;
    let mxn = 0;
    let sinConversion = 0;
    for (const g of filtered) {
      usd += totalUSD(g);
      const { valor } = totalMXN(g, mxnRate);
      if (valor === null) sinConversion += 1;
      else mxn += valor;
    }
    return { usd, mxn, sinConversion, cuantos: filtered.length };
  }, [filtered, mxnRate]);

  const slice = rowsPerPage === -1 ? ordenados : ordenados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  useEffect(() => {
    if (loading || rowsPerPage === -1) return;
    const ultimaPagina = Math.max(0, Math.ceil(ordenados.length / rowsPerPage) - 1);
    if (page > ultimaPagina) setEstado({ page: ultimaPagina });
  }, [loading, ordenados.length, rowsPerPage, page, setEstado]);

  const handleOrdenar = (campo) => {
    setEstado({ orden: siguienteOrden(orden, campo), page: 0 });
  };

  const activeFilterCount = useMemo(() => (
    [search, filterCountry !== 'All', filterType !== 'All', filterCategory !== 'All',
     filterSubcategory !== 'All', filterDescription.trim(), startDate, endDate]
      .filter(Boolean).length
  ), [search, filterCountry, filterType, filterCategory, filterSubcategory, filterDescription, startDate, endDate]);

  const handleFilterChange = (campo, value) => {
    if (campo === 'filterType') setFiltro({ filterType: value, filterCategory: 'All', filterSubcategory: 'All' });
    else if (campo === 'filterCategory') setFiltro({ filterCategory: value, filterSubcategory: 'All' });
    else setFiltro({ [campo]: value });
  };

  useEffect(() => {
    if (expenseTypes.length === 0) return;
    if (filterType !== 'All' && !uniqueTypes.includes(filterType)) {
      setEstado({ filterType: 'All', filterCategory: 'All', filterSubcategory: 'All', page: 0 });
    } else if (filterCategory !== 'All' && !uniqueCategories.includes(filterCategory)) {
      setEstado({ filterCategory: 'All', filterSubcategory: 'All', page: 0 });
    } else if (filterSubcategory !== 'All' && !uniqueSubcategories.includes(filterSubcategory)) {
      setEstado({ filterSubcategory: 'All', page: 0 });
    }
  }, [expenseTypes.length, uniqueTypes, uniqueCategories, uniqueSubcategories,
      filterType, filterCategory, filterSubcategory, setEstado]);

  const clearFilters = () => limpiarFiltros();

  const handleSuccess = () => {
      setIsModalOpen(false);
      fetchGastos();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: '#f8fafc' }}>

      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="overline" sx={{ ...SECTION_LABEL_SX, letterSpacing: '0.12em', fontSize: '0.7rem', lineHeight: 1 }}>
            Gastos · Administración
          </Typography>
          <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em" sx={{ mt: 0.25 }}>
            Expense Manager
          </Typography>
          <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
            Control y administración general de gastos por país, tipo y categoría.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<InsertChartOutlinedIcon />}
            endIcon={showChart ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setShowChart(p => !p)}
            sx={{
              bgcolor: 'white', borderColor: '#cbd5e1', color: '#334155',
              fontWeight: 600, textTransform: 'none', borderRadius: 2, px: 2.5, py: 1.1,
            }}
          >
            Gráfica de Gastos
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIsModalOpen(true)} sx={DARK_BTN_SX}>
            Nuevo Gasto
          </Button>
        </Stack>
      </Stack>

      <Collapse in={showChart}>
        <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #e2e8f0', mb: 3 }} elevation={0}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 1 }}>
            <Box>
              <Typography variant="overline" sx={SECTION_LABEL_SX}>Analítica</Typography>
              <Typography variant="h6" fontWeight={700} color="#0f172a" sx={{ lineHeight: 1.3 }}>
                Gastos por Tipo (Acumulativo Mensual)
              </Typography>
              <Typography variant="body2" color="#64748b">
                Últimos 12 meses · Total por mes dividido por Expense Type, en {chartCountry === 'MX' ? 'pesos mexicanos' : 'dólares'}
              </Typography>
            </Box>
            <ToggleButtonGroup
              value={chartCountry}
              exclusive
              size="small"
              onChange={(e, val) => val && setChartCountry(val)}
              sx={{
                bgcolor: '#f1f5f9', borderRadius: 2.5, p: 0.5, gap: 0.5,
                '& .MuiToggleButton-root': {
                  border: 'none', borderRadius: '8px !important', px: 3, py: 0.75,
                  fontWeight: 600, fontSize: '0.85rem', textTransform: 'none', color: '#64748b',
                },
                '& .Mui-selected': { bgcolor: '#0f172a !important', color: '#fff !important' },
              }}
            >
              <ToggleButton value="US">USA</ToggleButton>
              <ToggleButton value="MX">México</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <ExpenseTypeChart gastos={gastos} country={chartCountry} loading={loading} />
        </Paper>
      </Collapse>

      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setEstado({ showFilters: !showFilters })}
          sx={{
            bgcolor: 'white', borderColor: activeFilterCount > 0 ? '#0f172a' : '#cbd5e1',
            color: '#334155', fontWeight: 600, textTransform: 'none', borderRadius: 2,
          }}
        >
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          {activeFilterCount > 0 && (
            <Box component="span" sx={{
              ml: 1, minWidth: 20, height: 20, px: 0.6, borderRadius: '10px',
              bgcolor: '#0f172a', color: '#fff', fontSize: '0.72rem', fontWeight: 700,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {activeFilterCount}
            </Box>
          )}
        </Button>

        <Tooltip title="Actualizar listado">
          <span>
            <IconButton
              onClick={fetchGastos}
              disabled={loading}
              sx={{ bgcolor: 'white', border: '1px solid #cbd5e1', borderRadius: 2, color: '#334155' }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Collapse in={showFilters}>
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid #e2e8f0' }} elevation={0}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="overline" sx={SECTION_LABEL_SX}>Búsqueda</Typography>
              <Grid container spacing={2} sx={{ mt: 0.25 }}>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4
                  }}>
                  <TextField
                    label="Buscar" placeholder="ID, país, moneda…" size="small" fullWidth
                    value={search} onChange={(e) => handleFilterChange('search', e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment> }}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4
                  }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>País</InputLabel>
                    <Select
                      value={filterCountry} label="País"
                      onChange={(e) => handleFilterChange('filterCountry', e.target.value)}
                      startAdornment={<InputAdornment position="start"><PublicOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment>}
                    >
                      {uniqueCountries.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4
                  }}>
                  <TextField
                    label="Descripción" placeholder="Llantas, aceite, filtro…" size="small" fullWidth
                    value={filterDescription} onChange={(e) => handleFilterChange('filterDescription', e.target.value)}
                    InputProps={{ startAdornment: <InputAdornment position="start"><NotesOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment> }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ borderColor: '#f1f5f9' }} />

            <Box>
              <Typography variant="overline" sx={SECTION_LABEL_SX}>Clasificación</Typography>
              <Grid container spacing={2} sx={{ mt: 0.25 }}>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4
                  }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Tipo de Gasto</InputLabel>
                    <Select
                      value={filterType} label="Tipo de Gasto"
                      onChange={(e) => handleFilterChange('filterType', e.target.value)}
                      startAdornment={<InputAdornment position="start"><SellOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment>}
                    >
                      {uniqueTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4
                  }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Categoría</InputLabel>
                    <Select
                      value={filterCategory} label="Categoría"
                      onChange={(e) => handleFilterChange('filterCategory', e.target.value)}
                      startAdornment={<InputAdornment position="start"><CategoryOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment>}
                    >
                      {uniqueCategories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                  <Tooltip
                    title={
                      filterCategory === 'All'
                        ? 'Elige una categoría primero'
                        : haySubcategorias ? '' : `"${filterCategory}" no tiene subcategorías`
                    }
                  >
                    <span>
                      <FormControl size="small" fullWidth disabled={!haySubcategorias}>
                        <InputLabel>Subcategoría</InputLabel>
                        <Select
                          value={filterSubcategory} label="Subcategoría"
                          onChange={(e) => handleFilterChange('filterSubcategory', e.target.value)}
                          startAdornment={<InputAdornment position="start"><AccountTreeOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment>}
                        >
                          <MenuItem value="All">All</MenuItem>
                          {uniqueSubcategories.map(sub => <MenuItem key={sub} value={sub}>{sub}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </span>
                  </Tooltip>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ borderColor: '#f1f5f9' }} />

            <Box>
              <Typography variant="overline" sx={SECTION_LABEL_SX}>Periodo</Typography>
              <Grid container spacing={2} sx={{ mt: 0.25 }}>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3
                  }}>
                  <TextField
                    label="Fecha Inicio" type="date" size="small" fullWidth
                    value={startDate} onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3
                  }}>
                  <TextField
                    label="Fecha Fin" type="date" size="small" fullWidth
                    value={endDate} onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Stack direction="row" justifyContent="flex-end">
              <Button
                variant="text"
                disabled={activeFilterCount === 0}
                onClick={clearFilters}
                sx={{ textTransform: 'none', fontWeight: 600, color: '#64748b' }}
              >
                Limpiar Filtros
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Collapse>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid #e2e8f0', borderRadius: 2, overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={HEADER_ROW_SX}>
              <TableCell sx={HEADER_CELL_SX} />
              <CeldaOrdenable campo="id_gasto"     label="Expense #"    orden={orden} onOrdenar={handleOrdenar} />
              <CeldaOrdenable campo="tipo"         label="Expense Type" orden={orden} onOrdenar={handleOrdenar} />
              <CeldaOrdenable campo="fecha_gasto"  label="Date"         orden={orden} onOrdenar={handleOrdenar} />
              <CeldaOrdenable campo="pais"         label="Country"      orden={orden} onOrdenar={handleOrdenar} />
              <CeldaOrdenable campo="usd"          label="Total (USD)"  orden={orden} onOrdenar={handleOrdenar} align="right" />
              <CeldaOrdenable campo="mxn"          label="Total (MX)"   orden={orden} onOrdenar={handleOrdenar} align="right" />
              <CeldaOrdenable campo="created_name" label="Created By"   orden={orden} onOrdenar={handleOrdenar} />
              <CeldaOrdenable campo="updated_name" label="Updated By"   orden={orden} onOrdenar={handleOrdenar} />
              <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={10} align="center" sx={{ py: 6 }}><CircularProgress size={24}/></TableCell></TableRow>
            ) : slice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="#64748b" fontWeight={600}>No se encontraron gastos.</Typography>
                  <Typography variant="caption" color="#94a3b8">
                    Ajusta los filtros o registra un nuevo gasto.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              slice.map((g) => (
                <GastoRow
                  key={g.id_gasto}
                  gasto={g}
                  navigate={navigate}
                  mxnRate={mxnRate}
                  puedeEliminar={esAdmin}
                  onEliminado={fetchGastos}
                />
              ))
            )}
          </TableBody>

          {activeFilterCount > 0 && !loading && ordenados.length > 0 && (
            <TableFooter>
              <TableRow sx={{ bgcolor: '#f8fafc', '& td': { borderTop: '2px solid #e2e8f0', borderBottom: 'none' } }}>
                <TableCell colSpan={5} sx={{ py: 1.75 }}>
                  <Typography variant="caption" sx={{ ...SECTION_LABEL_SX, textTransform: 'uppercase' }}>
                    Total filtrado
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    {totales.cuantos} gasto{totales.cuantos === 1 ? '' : 's'}
                    {totales.sinConversion > 0 && ` · ${totales.sinConversion} sin conversión a pesos`}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ py: 1.75 }}>
                  <Typography variant="body2" fontWeight={800} color="#0f172a">{money(totales.usd)}</Typography>
                </TableCell>
                <TableCell align="right" sx={{ py: 1.75 }}>
                  <Typography variant="body2" fontWeight={800} color="#0f172a">{moneyMXN(totales.mxn)}</Typography>
                </TableCell>
                <TableCell colSpan={3} />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>

      <Box sx={{ bgcolor: 'white', border: '1px solid #e2e8f0', borderTop: 'none', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
          <TablePagination
            rowsPerPageOptions={[20, 40, 60, { label: 'All', value: -1 }]} 
            component="div" count={ordenados.length} rowsPerPage={rowsPerPage} page={page}
            onPageChange={(e, n) => setEstado({ page: n })} onRowsPerPageChange={(e) => setEstado({ rowsPerPage: parseInt(e.target.value, 10), page: 0 })}
            sx={{ color: '#475569', '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': { fontSize: '0.8rem' } }}
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
