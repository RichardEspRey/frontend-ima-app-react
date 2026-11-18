import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Button, Stack, CircularProgress, Tabs, Tab, InputAdornment, Grid, Chip
} from '@mui/material'; 
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';
import BotonActualizar from '../../components/BotonActualizar';
import {
    PAGE_SHELL_SX, PAGE_OVERLINE_SX, PAGE_TITLE_SX, TABS_WRAPPER_SX, TAB_SX, CARD_SX, SECTION_LABEL_SX,
    HEADER_ROW_SX, HEADER_CELL_SX, TABLE_CONTAINER_SX, CHIP_NEUTRO_SX, CELL_STRONG_SX, CELL_SX, CELL_MUTED_SX,
    GHOST_BTN_SX, INPUT_SX,
} from '../../styles/estilosTabla';

const PILDORAS_SX = { minHeight: 0, '& .MuiTabs-flexContainer': { gap: 0.5 } };
const VER_BTN_SX = { ...GHOST_BTN_SX, px: 1.5, py: 0.4, fontSize: '0.78rem' };

const money = (v) => {
    return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        minimumFractionDigits: 2,
        currencyDisplay: 'symbol' 
    }).format(Number(v || 0));
};

//Administrador de gastos por viaje
const GastosAdmin = () => {
  const navigate = useNavigate();
  const apiHost = import.meta.env.VITE_API_HOST;

  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true); 

  const [countryFilter, setCountryFilter] = useState('All');
  const [search, setSearch] = useState('');

  // ** LÓGICA DE FETCH **
  const fetchGastos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiHost}/formularios.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'op=getAll_gastos'
      });
      const data = await response.json();
      if (data.status === 'success') {
        const formatted = data.id.map(t => ({
          trip_number: t.trip_number,
          nomenclatura: t.nomenclatura,
          country_code: t.country_code,
          trip_id: t.trip_id,
          fecha: t.fecha,
          registros: t.registros,
          monto: t.monto,
          nombre: t.nombre
        }));
        setRegistros(formatted);
      }
    } catch (error) {
      console.error('Error al obtener gastos de viaje:', error);
    } finally {
        setLoading(false);
    }
  }, [apiHost]);

  useEffect(() => { fetchGastos(); }, [fetchGastos]);

  const filteredRegistros = useMemo(() => {
      let result = registros;

      if (countryFilter !== 'All') {
          result = result.filter(r => r.country_code === countryFilter);
      }

      const searchLower = search.toLowerCase();
      if (searchLower) {
          result = result.filter(r =>
              String(r.nomenclatura || r.trip_number || '').toLowerCase().includes(searchLower) ||
              String(r.nombre || '').toLowerCase().includes(searchLower)
          );
      }

      return result;
  }, [registros, search, countryFilter]);


  const handleVer = (tripId) => {
    navigate(`/detalle-gastos/${tripId}`); 
  };

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
          <Typography variant="overline" sx={PAGE_OVERLINE_SX}>Gastos · Viajes</Typography>
          <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em" sx={PAGE_TITLE_SX}>
            Travel Expense Manager
          </Typography>
          <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
            Gastos que registran los operadores en cada viaje.
          </Typography>
        </Box>
        <BotonActualizar onActualizar={fetchGastos} />
      </Stack>

      <Box sx={TABS_WRAPPER_SX}>
        <Tabs value={countryFilter} onChange={(e, val) => val && setCountryFilter(val)} TabIndicatorProps={{ sx: { display: 'none' } }} sx={PILDORAS_SX}>
          <Tab value="All" label="Todos" disableRipple sx={TAB_SX} />
          <Tab value="US" label="USA" disableRipple sx={TAB_SX} />
          <Tab value="MX" label="México" disableRipple sx={TAB_SX} />
        </Tabs>
      </Box>

      <Paper elevation={0} sx={{ ...CARD_SX, mb: 3 }}>
        <Typography variant="overline" sx={SECTION_LABEL_SX}>Filtros de Búsqueda</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 8, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por Trip# o Driver"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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
        </Grid>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={TABLE_CONTAINER_SX}>
        <Table size="small" aria-label="Travel expenses table">
          <TableHead>
            <TableRow sx={HEADER_ROW_SX}>
              <TableCell sx={{ ...HEADER_CELL_SX, whiteSpace: 'nowrap' }}>Trip #</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, whiteSpace: 'nowrap' }}>Last Update</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, whiteSpace: 'nowrap', textAlign: 'right' }}>No of records</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, whiteSpace: 'nowrap', textAlign: 'right' }}>Total Cost</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, whiteSpace: 'nowrap' }}>Last Driver</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, whiteSpace: 'nowrap', textAlign: 'center', width: 120 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRegistros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="#94a3b8" variant="body2">No se encontraron registros de gastos de viaje.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRegistros.map((row) => (
                <TableRow key={row.trip_id} hover>
                  <TableCell component="th" scope="row" sx={{ ...CELL_STRONG_SX, whiteSpace: 'nowrap' }}>
                    {row.nomenclatura || row.trip_number}
                  </TableCell>
                  <TableCell sx={{ ...CELL_MUTED_SX, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{row.fecha}</TableCell>
                  <TableCell align="right">
                    <Chip size="small" label={row.registros} sx={{ ...CHIP_NEUTRO_SX, minWidth: 32 }} />
                  </TableCell>
                  <TableCell align="right" sx={{ ...CELL_STRONG_SX, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {money(row.monto)}
                  </TableCell>
                  <TableCell sx={CELL_SX}>{row.nombre}</TableCell>
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
    </Box>
  );
};

export default GastosAdmin;