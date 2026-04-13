import { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Tabs, Tab, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Chip, TextField,
    InputAdornment, CircularProgress, Stack, Button, MenuItem, Select,
    FormControl, InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';

const apiHost = import.meta.env.VITE_API_HOST;

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtDate = (d) => d ? d.split('T')[0] : '—';

// ── Component ─────────────────────────────────────────────────────────────────
export default function IFTA() {
    const [tabValue, setTabValue] = useState(0);

    // ── Tab 0: Por Viaje ──────────────────────────────────────────────────────
    const [trips, setTrips]             = useState([]);
    const [loadingTrips, setLoadingTrips] = useState(false);
    const [search, setSearch]           = useState('');

    const fetchTrips = async () => {
        setLoadingTrips(true);
        try {
            const fd = new FormData();
            fd.append('op', 'get_ifta_trips');
            const res  = await fetch(`${apiHost}/IFTA.php`, { method: 'POST', body: fd });
            const json = await res.json();
            if (json.status === 'success') setTrips(json.data);
        } catch (err) {
            console.error('IFTA fetchTrips:', err);
        } finally {
            setLoadingTrips(false);
        }
    };

    useEffect(() => { fetchTrips(); }, []);

    const filteredTrips = useMemo(() => {
        if (!search.trim()) return trips;
        const s = search.toLowerCase();
        return trips.filter(t =>
            t.trip_number?.toLowerCase().includes(s) ||
            t.states?.some(st => st.state.toLowerCase().includes(s))
        );
    }, [trips, search]);

    // ── Tab 1: Totales por Estado ─────────────────────────────────────────────
    const [totals, setTotals]               = useState([]);
    const [loadingTotals, setLoadingTotals] = useState(false);
    const [filterState, setFilterState]     = useState('');
    const [filterFrom, setFilterFrom]       = useState('');
    const [filterTo, setFilterTo]           = useState('');

    const fetchTotals = async () => {
        setLoadingTotals(true);
        try {
            const fd = new FormData();
            fd.append('op', 'get_ifta_totals_by_state');
            if (filterState.trim()) fd.append('state', filterState.trim().toUpperCase());
            if (filterFrom)         fd.append('date_from', filterFrom);
            if (filterTo)           fd.append('date_to', filterTo);
            const res  = await fetch(`${apiHost}/IFTA.php`, { method: 'POST', body: fd });
            const json = await res.json();
            if (json.status === 'success') setTotals(json.data);
        } catch (err) {
            console.error('IFTA fetchTotals:', err);
        } finally {
            setLoadingTotals(false);
        }
    };

    // Cargar totales al entrar al tab
    useEffect(() => {
        if (tabValue === 1) fetchTotals();
    }, [tabValue]); // eslint-disable-line react-hooks/exhaustive-deps

    const grandTotal = useMemo(() => totals.reduce((sum, r) => sum + r.total, 0), [totals]);

    // ── Tab 2: Millas por Periodo ─────────────────────────────────────────────
    const [periodos, setPeriodos]               = useState([]);
    const [loadingPeriodos, setLoadingPeriodos] = useState(false);
    const [filterPeriodo, setFilterPeriodo]     = useState('');
    const [filterPeriodoEstado, setFilterPeriodoEstado] = useState('');

    const fetchPeriodos = async () => {
        setLoadingPeriodos(true);
        try {
            const fd = new FormData();
            fd.append('op', 'periodos');
            const res  = await fetch(`${apiHost}/IFTA.php`, { method: 'POST', body: fd });
            const json = await res.json();
            if (json.status === 'success') setPeriodos(json.data);
        } catch (err) {
            console.error('IFTA fetchPeriodos:', err);
        } finally {
            setLoadingPeriodos(false);
        }
    };

    useEffect(() => {
        if (tabValue === 2) fetchPeriodos();
    }, [tabValue]); // eslint-disable-line react-hooks/exhaustive-deps

    const periodosUnicos = useMemo(() =>
        [...new Set(periodos.map(r => r.periodo))].sort(),
    [periodos]);

    const filteredPeriodos = useMemo(() => {
        return periodos.filter(r => {
            const matchPeriodo = !filterPeriodo || r.periodo === filterPeriodo;
            const matchEstado  = !filterPeriodoEstado.trim() ||
                r.estado.toLowerCase().includes(filterPeriodoEstado.trim().toLowerCase());
            return matchPeriodo && matchEstado;
        });
    }, [periodos, filterPeriodo, filterPeriodoEstado]);

    const grandTotalPeriodos = useMemo(() =>
        filteredPeriodos.reduce((sum, r) => sum + r.total_millas, 0),
    [filteredPeriodos]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={700} mb={2.5}>
                IFTA — Registros
            </Typography>

            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2.5 }}>
                <Tab label="Por Viaje" />
                <Tab label="Totales por Estado" />
                <Tab label="Millas por Periodo" />
            </Tabs>

            {/* ── TAB 0: Por Viaje ─────────────────────────────────────────── */}
            {tabValue === 0 && (
                <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <TextField
                            size="small"
                            placeholder="Buscar por viaje o estado..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            sx={{ width: 300 }}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
                        />
                        <Button
                            size="small"
                            startIcon={<RefreshIcon />}
                            onClick={fetchTrips}
                            disabled={loadingTrips}
                        >
                            Actualizar
                        </Button>
                    </Stack>

                    {loadingTrips ? (
                        <Box display="flex" alignItems="center" gap={1.5} py={4}>
                            <CircularProgress size={22} />
                            <Typography color="text.secondary">Cargando viajes IFTA...</Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>Viaje #</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Fecha Carga</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Fecha Entrega</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Estados / Millas</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">Total Mi</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredTrips.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                                {search ? 'Sin resultados para la búsqueda.' : 'No hay registros IFTA aún.'}
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredTrips.map(trip => (
                                        <TableRow key={trip.trip_id} hover>
                                            <TableCell sx={{ fontWeight: 600 }}>
                                                {trip.trip_number}
                                            </TableCell>
                                            <TableCell>{fmtDate(trip.creation_date)}</TableCell>
                                            <TableCell>{fmtDate(trip.return_date)}</TableCell>
                                            <TableCell>
                                                <Stack direction="row" gap={0.5} flexWrap="wrap">
                                                    {trip.states?.map(st => (
                                                        <Chip
                                                            key={st.state}
                                                            label={`${st.state} · ${fmt(st.total)}`}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.72rem', height: 22 }}
                                                        />
                                                    ))}
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600 }}>
                                                {fmt(trip.grand_total)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}

            {/* ── TAB 1: Totales por Estado ────────────────────────────────── */}
            {tabValue === 1 && (
                <Box>
                    {/* Filtros */}
                    <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
                        <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                            <FilterListIcon fontSize="small" color="action" />
                            <Typography variant="subtitle2" fontWeight={700}>Filtros</Typography>
                        </Stack>
                        <Stack direction="row" gap={2} flexWrap="wrap" alignItems="flex-end">
                            <TextField
                                size="small"
                                label="Estado (ej. TX)"
                                value={filterState}
                                onChange={e => setFilterState(e.target.value)}
                                sx={{ width: 130 }}
                                slotProps={{ htmlInput: { maxLength: 2, style: { textTransform: 'uppercase' } } }}
                            />
                            <TextField
                                size="small"
                                label="Desde"
                                type="date"
                                value={filterFrom}
                                onChange={e => setFilterFrom(e.target.value)}
                                slotProps={{ inputLabel: { shrink: true } }}
                                sx={{ width: 160 }}
                            />
                            <TextField
                                size="small"
                                label="Hasta"
                                type="date"
                                value={filterTo}
                                onChange={e => setFilterTo(e.target.value)}
                                slotProps={{ inputLabel: { shrink: true } }}
                                sx={{ width: 160 }}
                            />
                            <Button
                                variant="contained"
                                size="small"
                                onClick={fetchTotals}
                                disabled={loadingTotals}
                                startIcon={<FilterListIcon />}
                            >
                                Aplicar
                            </Button>
                            <Button
                                size="small"
                                color="inherit"
                                onClick={() => {
                                    setFilterState('');
                                    setFilterFrom('');
                                    setFilterTo('');
                                }}
                            >
                                Limpiar
                            </Button>
                        </Stack>
                    </Paper>

                    {loadingTotals ? (
                        <Box display="flex" alignItems="center" gap={1.5} py={4}>
                            <CircularProgress size={22} />
                            <Typography color="text.secondary">Calculando totales...</Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">Total Mi</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right"># Viajes</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {totals.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                                Sin datos para los filtros aplicados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <>
                                            {totals.map(row => (
                                                <TableRow key={row.state} hover>
                                                    <TableCell>
                                                        <Chip label={row.state} size="small" sx={{ fontWeight: 700, minWidth: 42 }} />
                                                    </TableCell>
                                                    <TableCell align="right">{fmt(row.total)}</TableCell>
                                                    <TableCell align="right">{row.trips}</TableCell>
                                                </TableRow>
                                            ))}
                                            {/* Totales footer */}
                                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                                <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(grandTotal)}</TableCell>
                                                <TableCell />
                                            </TableRow>
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}

            {/* ── TAB 2: Millas por Periodo ────────────────────────────────── */}
            {tabValue === 2 && (
                <Box>
                    {/* Filtros */}
                    <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
                        <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                            <FilterListIcon fontSize="small" color="action" />
                            <Typography variant="subtitle2" fontWeight={700}>Filtros</Typography>
                        </Stack>
                        <Stack direction="row" gap={2} flexWrap="wrap" alignItems="flex-end">
                            <FormControl size="small" sx={{ width: 140 }}>
                                <InputLabel>Periodo</InputLabel>
                                <Select
                                    value={filterPeriodo}
                                    label="Periodo"
                                    onChange={e => setFilterPeriodo(e.target.value)}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {periodosUnicos.map(p => (
                                        <MenuItem key={p} value={p}>{p}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                size="small"
                                label="Estado (ej. TX)"
                                value={filterPeriodoEstado}
                                onChange={e => setFilterPeriodoEstado(e.target.value)}
                                sx={{ width: 140 }}
                                slotProps={{ htmlInput: { maxLength: 2, style: { textTransform: 'uppercase' } } }}
                            />
                            <Button
                                size="small"
                                color="inherit"
                                onClick={() => {
                                    setFilterPeriodo('');
                                    setFilterPeriodoEstado('');
                                }}
                            >
                                Limpiar
                            </Button>
                            <Button
                                size="small"
                                startIcon={<RefreshIcon />}
                                onClick={fetchPeriodos}
                                disabled={loadingPeriodos}
                            >
                                Actualizar
                            </Button>
                        </Stack>
                    </Paper>

                    {loadingPeriodos ? (
                        <Box display="flex" alignItems="center" gap={1.5} py={4}>
                            <CircularProgress size={22} />
                            <Typography color="text.secondary">Cargando millas por periodo...</Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Periodo</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">Total Mi</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredPeriodos.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                                Sin datos para los filtros aplicados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <>
                                            {filteredPeriodos.map((row, i) => (
                                                <TableRow key={`${row.estado}-${row.periodo}-${i}`} hover>
                                                    <TableCell>
                                                        <Chip label={row.estado} size="small" sx={{ fontWeight: 700, minWidth: 42 }} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={row.periodo} size="small" variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
                                                    </TableCell>
                                                    <TableCell align="right">{fmt(row.total_millas)}</TableCell>
                                                </TableRow>
                                            ))}
                                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                                <TableCell sx={{ fontWeight: 700 }} colSpan={2}>TOTAL</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(grandTotalPeriodos)}</TableCell>
                                            </TableRow>
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Box>
            )}
        </Box>
    );
}

