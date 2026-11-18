import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Button, Stack, CircularProgress, Tooltip, Chip, TablePagination, Tabs, Tab, MenuItem, InputAdornment, Grid
} from '@mui/material'; 
import { useNavigate, useLocation } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import BotonActualizar from '../../components/BotonActualizar';
import { PERIODO_VACIO, textoDePeriodos, tienePeriodo } from '../../utils/periodos';
import {
    PAGE_SHELL_SX, PAGE_OVERLINE_SX, PAGE_TITLE_SX, TABS_WRAPPER_SX, TAB_SX, CARD_SX, SECTION_LABEL_SX,
    HEADER_ROW_SX, HEADER_CELL_SX, TABLE_CONTAINER_SX, PAGINATION_BOX_SX, PAGINATION_SX, CHIP_DANGER_SX,
    CHIP_WARN_SX, CHIP_NEUTRO_SX, CELL_STRONG_SX, CELL_SX, CELL_MUTED_SX, GHOST_BTN_SX, INPUT_SX,
} from '../../styles/estilosTabla';

const PILDORAS_SX = { minHeight: 0, '& .MuiTabs-flexContainer': { gap: 0.5 } };
const SIN_INDICADOR = { sx: { display: 'none' } };
const VER_BTN_SX = { ...GHOST_BTN_SX, px: 1.5, py: 0.4, fontSize: '0.78rem' };

const Contador = ({ valor, titulo, sx }) => (
    valor > 0 ? (
        <Tooltip title={titulo}>
            <Chip label={valor} size="small" sx={{ ...sx, minWidth: 32 }} />
        </Tooltip>
    ) : (
        <Typography variant="caption" color="#cbd5e1">—</Typography>
    )
);

// Helper para formato de moneda
const money = (v) => {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD', 
        minimumFractionDigits: 2, 
        currencyDisplay: 'symbol' 
    }).format(Number(v || 0));
};

const DieselAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const apiHost = import.meta.env.VITE_API_HOST;

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Inicialización de estados con persistencia
  const [search, setSearch] = useState(location.state?.search || '');
  const [page, setPage] = useState(location.state?.page || 0);
  const [rowsPerPage, setRowsPerPage] = useState(location.state?.rowsPerPage || 50);

  const [tabValue, setTabValue] = useState(location.state?.tabValue || 0);
  const [countryFilter, setCountryFilter] = useState('All');
  const [periodoFilter, setPeriodoFilter] = useState(location.state?.periodoFilter === 'EMPTY' ? PERIODO_VACIO : location.state?.periodoFilter || '');

  // ** LÓGICA DE FETCH **
  const fetchDiesel = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiHost}/formularios.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'op=getAll_diesel'
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        const formattedData = (data.id || []).map(item => ({
            trip_id: item.trip_id,
            trip_number: item.trip_number,
            nomenclatura: item.nomenclatura,
            country_code: item.country_code,
            fecha: item.fecha,
            nombre: item.nombre,
            
            // Totales
            total_monto: parseFloat(item.monto || 0),
            total_galones: parseFloat(item.galones || 0),
            
            // Contadores de alertas
            state_pending_count: parseInt(item.state_pending_count || 0, 10),
            fleetone_pending_count: parseInt(item.fleetone_pending_count || 0, 10),
            manual_count: parseInt(item.manual_count || 0, 10), // 🚨 Capturamos el conteo manual
            periodo: item.periodo,
        }));

        setTrips(formattedData);
      } else {
          setTrips([]);
      }
    } catch (error) {
      console.error('Error al obtener diesel:', error);
      setTrips([]);
    } finally {
        setLoading(false);
    }
  }, [apiHost]);

  useEffect(() => { fetchDiesel(); }, [fetchDiesel]);

  // ** LÓGICA DE FILTRADO **
  const filteredTrips = useMemo(() => {
    let result = trips;

    if (tabValue === 0) {
        result = result.filter(r => r.fleetone_pending_count > 0);
    } else {
        result = result.filter(r => r.fleetone_pending_count === 0);
    }

    if (countryFilter !== 'All') {
        result = result.filter(r => r.country_code === countryFilter);
    }

    if (periodoFilter) {
        result = result.filter(r => tienePeriodo(r.periodo, periodoFilter));
    }

    const searchLower = search.toLowerCase();
    if (searchLower) {
        result = result.filter(r =>
            String(r.nomenclatura || r.trip_number || '').toLowerCase().includes(searchLower) ||
            String(r.nombre || '').toLowerCase().includes(searchLower)
        );
    }

    return result;
  }, [trips, search, tabValue, countryFilter, periodoFilter]);

  const handleVer = (tripId) => {
    navigate(`/detalle-diesel/${tripId}`, { 
        state: { page, search, rowsPerPage, tabValue, periodoFilter }
    }); 
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const slice = filteredTrips.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
      return (
          <Box sx={{ ...PAGE_SHELL_SX, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size={28} />
          </Box>
      );
  }

  return (
    <Box sx={PAGE_SHELL_SX}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="overline" sx={PAGE_OVERLINE_SX}>Gastos · Diesel</Typography>
          <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em" sx={PAGE_TITLE_SX}>
            Diesel Management System
          </Typography>
          <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
            Cargas de combustible por viaje, con lo que falta conciliar con estados y Fleet One.
          </Typography>
        </Box>
        <BotonActualizar onActualizar={fetchDiesel} />
      </Stack>

      <Stack direction="row" flexWrap="wrap" columnGap={2}>
        <Box sx={TABS_WRAPPER_SX}>
          <Tabs value={tabValue} onChange={(e, newValue) => { setTabValue(newValue); setPage(0); }} TabIndicatorProps={SIN_INDICADOR} sx={PILDORAS_SX}>
            <Tab label="Pendientes" disableRipple sx={TAB_SX} />
            <Tab label="Completados" disableRipple sx={TAB_SX} />
          </Tabs>
        </Box>
        <Box sx={TABS_WRAPPER_SX}>
          <Tabs value={countryFilter} onChange={(e, val) => { if (val) { setCountryFilter(val); setPage(0); } }} TabIndicatorProps={SIN_INDICADOR} sx={PILDORAS_SX}>
            <Tab value="All" label="Todos" disableRipple sx={TAB_SX} />
            <Tab value="US" label="USA" disableRipple sx={TAB_SX} />
            <Tab value="MX" label="México" disableRipple sx={TAB_SX} />
          </Tabs>
        </Box>
      </Stack>

      <Paper elevation={0} sx={{ ...CARD_SX, mb: 3 }}>
        <Typography variant="overline" sx={SECTION_LABEL_SX}>Filtros de Búsqueda</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 8, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por Trip# o Driver"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              sx={{ bgcolor: 'white' }}
              slotProps={{
                input: {
                  sx: INPUT_SX,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4, md: 2 }}>
            <TextField
              select
              fullWidth
              label="Periodos"
              size="small"
              value={periodoFilter}
              onChange={(e) => { setPeriodoFilter(e.target.value); setPage(0); }}
              sx={{ bgcolor: 'white' }}
              slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true }, input: { sx: INPUT_SX } }}
            >
              <MenuItem value=""><em>Todos</em></MenuItem>
              <MenuItem value="Q1">Q1</MenuItem>
              <MenuItem value="Q2">Q2</MenuItem>
              <MenuItem value="Q3">Q3</MenuItem>
              <MenuItem value="Q4">Q4</MenuItem>
              <MenuItem value={PERIODO_VACIO}>V (vacío)</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ ...TABLE_CONTAINER_SX, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
        <Table size="small" aria-label="Diesel records table">
          <TableHead>
            <TableRow sx={HEADER_ROW_SX}>
              <TableCell sx={{ ...HEADER_CELL_SX, whiteSpace: 'nowrap' }}>Trip #</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, whiteSpace: 'nowrap' }}>Last Update</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, whiteSpace: 'nowrap', textAlign: 'right' }}>Total Gal.</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, whiteSpace: 'nowrap', textAlign: 'right' }}>Total Cost</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, whiteSpace: 'nowrap' }}>Driver</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, whiteSpace: 'nowrap', textAlign: 'center', width: 130 }}>State Pending</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, whiteSpace: 'nowrap', textAlign: 'center', width: 150 }}>Fleet One Pending</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, whiteSpace: 'nowrap', textAlign: 'center', width: 100 }}>Manuales</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, whiteSpace: 'nowrap', textAlign: 'center', width: 150 }}>Periodo</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, whiteSpace: 'nowrap', textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {slice.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                  <Typography color="#94a3b8" variant="body2">
                    {tabValue === 0
                      ? "No hay registros con Fleet One pendientes."
                      : "No hay registros completados para mostrar."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              slice.map((row) => (
                <TableRow key={row.trip_id} hover>
                  <TableCell sx={{ ...CELL_STRONG_SX, whiteSpace: 'nowrap' }}>{row.nomenclatura || row.trip_number}</TableCell>
                  <TableCell sx={{ ...CELL_MUTED_SX, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{row.fecha}</TableCell>
                  <TableCell align="right" sx={{ ...CELL_SX, fontVariantNumeric: 'tabular-nums' }}>{row.total_galones.toFixed(2)} gal</TableCell>
                  <TableCell align="right" sx={{ ...CELL_STRONG_SX, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{money(row.total_monto)}</TableCell>
                  <TableCell sx={CELL_SX}>{row.nombre}</TableCell>
                  <TableCell align="center">
                    <Contador valor={row.state_pending_count} titulo={`Faltan ${row.state_pending_count} estados`} sx={CHIP_DANGER_SX} />
                  </TableCell>
                  <TableCell align="center">
                    <Contador valor={row.fleetone_pending_count} titulo={`Faltan ${row.fleetone_pending_count} Fleet One`} sx={CHIP_WARN_SX} />
                  </TableCell>
                  <TableCell align="center">
                    <Contador valor={row.manual_count} titulo={`${row.manual_count} Registros ingresados a mano`} sx={CHIP_NEUTRO_SX} />
                  </TableCell>
                  <TableCell align="center" sx={{ ...CELL_SX, whiteSpace: 'nowrap' }}>{textoDePeriodos(row.periodo)}</TableCell>
                  <TableCell align="center">
                    <Button variant="outlined" size="small" startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />} onClick={() => handleVer(row.trip_id)} sx={VER_BTN_SX}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={PAGINATION_BOX_SX}>
        <TablePagination
          rowsPerPageOptions={[50, 100, 150]}
          component="div"
          count={filteredTrips.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
          sx={PAGINATION_SX}
        />
      </Box>
    </Box>
  );
};

export default DieselAdmin;