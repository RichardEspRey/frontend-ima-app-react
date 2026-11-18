import { useState, useEffect, useMemo, Fragment } from 'react';
import {
    Box, Typography, Tabs, Tab, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Chip, TextField,
    InputAdornment, CircularProgress, Stack, Button, MenuItem, Select,
    FormControl, InputLabel, IconButton, Dialog, DialogTitle,
    DialogContent, DialogActions, Switch
} from '@mui/material';
import ListAltIcon from '@mui/icons-material/ListAlt';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const apiHost = import.meta.env.VITE_API_HOST;

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtDate = (d) => d ? d.split('T')[0] : '—';
const fmtInt = (n) => Math.round(Number(n) || 0).toLocaleString('en-US');
const fmtPeriodo = (p) => p || 'Vacío';

// Valor del Select para filtrar registros sin periodo ('' ya se usa para "Todos")
const PERIODO_VACIO = '__vacio__';

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

    // ── Tab 1: Millas IFTA ────────────────────────────────────────────────────
    const [totals, setTotals]               = useState([]);
    const [loadingTotals, setLoadingTotals] = useState(false);
    // Modo de filtro: por rango de fechas o por rango de viajes
    const [filterByTrips, setFilterByTrips] = useState(false);
    const [filterFrom, setFilterFrom]       = useState('');
    const [filterTo, setFilterTo]           = useState('');
    const [filterTripFrom, setFilterTripFrom] = useState('');
    const [filterTripTo, setFilterTripTo]     = useState('');
    const [filterTripYear, setFilterTripYear] = useState(String(new Date().getFullYear()));

    // Filtros con los que se obtuvo `totals` (el despliegue de viajes usa estos, no los inputs)
    const [appliedFilters, setAppliedFilters] = useState({});

    // El trip_number se reinicia cada año, así que el rango de viajes va acompañado del año (2 dígitos)
    const buildFilters = () => filterByTrips
        ? {
            trip_from: filterTripFrom.trim(),
            trip_to:   filterTripTo.trim(),
            trip_year: filterTripYear.trim() ? filterTripYear.trim().slice(-2) : '',
        }
        : { date_from: filterFrom, date_to: filterTo };

    const appendFilters = (fd, filters) => {
        Object.entries(filters).forEach(([k, v]) => { if (v) fd.append(k, v); });
    };

    const fetchTotals = async () => {
        setLoadingTotals(true);
        try {
            const filters = buildFilters();
            const fd = new FormData();
            fd.append('op', 'get_ifta_totals_by_state');
            appendFilters(fd, filters);
            const res  = await fetch(`${apiHost}/IFTA.php`, { method: 'POST', body: fd });
            const json = await res.json();
            if (json.status === 'success') {
                setAppliedFilters(filters);
                setTotals(json.data);
                return json.data;
            }
        } catch (err) {
            console.error('IFTA fetchTotals:', err);
        } finally {
            setLoadingTotals(false);
        }
        return null;
    };

    // Texto de los filtros para el encabezado del PDF
    const describeTotalsFilters = () => {
        if (filterByTrips) {
            const parts = [];
            if (filterTripFrom.trim()) parts.push(`del viaje ${filterTripFrom.trim()}`);
            if (filterTripTo.trim())   parts.push(`al viaje ${filterTripTo.trim()}`);
            if (filterTripYear.trim()) parts.push(`año ${filterTripYear.trim()}`);
            return parts.length ? `Viajes: ${parts.join(', ')}` : 'Viajes: todos';
        }
        if (!filterFrom && !filterTo) return 'Fechas: todas';
        return `Fechas: ${filterFrom || 'inicio'} a ${filterTo || 'hoy'}`;
    };

    // Cargar totales al entrar al tab
    useEffect(() => {
        if (tabValue === 1) fetchTotals();
    }, [tabValue]); // eslint-disable-line react-hooks/exhaustive-deps

    const grandTotal = useMemo(() => totals.reduce((sum, r) => sum + r.total, 0), [totals]);

    // Ajuste de millas por estado: positivo suma, negativo resta (solo en pantalla; el PDF exporta el resultado final)
    const [ajustes, setAjustes] = useState({});

    // Despliegue de viajes por estado
    const [expandedState, setExpandedState] = useState(null);
    const [stateTrips, setStateTrips]       = useState({});   // { TX: [...] }
    const [loadingStateTrips, setLoadingStateTrips] = useState(null);

    useEffect(() => {
        setAjustes({});
        setExpandedState(null);
        setStateTrips({});
    }, [totals]);

    const openStateTrips = async (state) => {
        setExpandedState(state);
        if (stateTrips[state]) return;

        setLoadingStateTrips(state);
        try {
            const fd = new FormData();
            fd.append('op', 'get_ifta_trips_by_state');
            fd.append('state', state);
            appendFilters(fd, appliedFilters);
            const res  = await fetch(`${apiHost}/IFTA.php`, { method: 'POST', body: fd });
            const json = await res.json();
            if (json.status === 'success') setStateTrips(prev => ({ ...prev, [state]: json.data }));
        } catch (err) {
            console.error('IFTA fetchStateTrips:', err);
        } finally {
            setLoadingStateTrips(null);
        }
    };

    const totalFinal = (row) => row.total + (parseFloat(ajustes[row.state]) || 0);

    const grandTotalFinal = useMemo(() =>
        totals.reduce((sum, r) => sum + r.total + (parseFloat(ajustes[r.state]) || 0), 0),
    [totals, ajustes]);

    const printTotalsPDF = async () => {
        // Si los filtros en pantalla no se han aplicado, se piden los datos con esos filtros antes de exportar
        let data = totals;
        let adj  = ajustes;
        if (JSON.stringify(buildFilters()) !== JSON.stringify(appliedFilters)) {
            data = await fetchTotals();
            if (!data) return;
            adj = {};
        }
        const final = (r) => r.total + (parseFloat(adj[r.state]) || 0);

        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
        const margin = 40;
        const pageW = doc.internal.pageSize.getWidth();

        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('IFTA — Millas', pageW / 2, margin, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(describeTotalsFilters(), pageW / 2, margin + 22, { align: 'center' });

        const rows = data.map(r => [r.state, fmtInt(final(r))]);
        rows.push(['TOTAL', fmtInt(data.reduce((sum, r) => sum + final(r), 0))]);

        autoTable(doc, {
            startY: margin + 40,
            margin: { left: margin, right: margin, top: margin, bottom: margin },
            head: [['Estado', 'Total Mi']],
            body: rows,
            styles: { fontSize: 13.5, cellPadding: 5 },
            headStyles: { fillColor: [245, 245, 245], textColor: 0, fontStyle: 'bold' },
            didParseCell: (data) => {
                if (data.column.index > 0) {
                    data.cell.styles.halign = 'right';
                }
                if (data.row.index === rows.length - 1 && data.section === 'body') {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [245, 245, 245];
                }
            },
            pageBreak: 'auto',
            rowPageBreak: 'avoid',
        });

        doc.save('IFTA_Millas.pdf');
    };

    // ── Tab 2: Galones IFTA ───────────────────────────────────────────────────
    const [periodos, setPeriodos]               = useState([]);
    const [loadingPeriodos, setLoadingPeriodos] = useState(false);
    const [filterPeriodo, setFilterPeriodo]     = useState('');
    const [filterPeriodoEstado, setFilterPeriodoEstado] = useState('');

    const fetchPeriodos = async () => {
        setLoadingPeriodos(true);
        try {
            const fd = new FormData();
            fd.append('op', 'galones_ifta');
            const res  = await fetch(`${apiHost}/IFTA.php`, { method: 'POST', body: fd });
            const json = await res.json();
            if (json.status === 'success') setPeriodos(json.data);
        } catch (err) {
            console.error('IFTA fetchPeriodos:', err);
        } finally {
            setLoadingPeriodos(false);
        }
    };

    // Cargar galones al entrar al tab
    useEffect(() => {
        if (tabValue === 2) fetchPeriodos();
    }, [tabValue]); // eslint-disable-line react-hooks/exhaustive-deps

    // Registros de diesel sin periodo llegan con periodo null o '' desde la API
    const periodosUnicos = useMemo(() =>
        [...new Set(periodos.map(r => r.periodo).filter(Boolean))].sort(),
    [periodos]);

    const filteredPeriodos = useMemo(() => {
        return periodos.filter(r => {
            const matchPeriodo = !filterPeriodo ||
                (filterPeriodo === PERIODO_VACIO ? !r.periodo : r.periodo === filterPeriodo);
            const matchEstado  = !filterPeriodoEstado.trim() ||
                (r.estado ?? '').toLowerCase().includes(filterPeriodoEstado.trim().toLowerCase());
            return matchPeriodo && matchEstado;
        });
    }, [periodos, filterPeriodo, filterPeriodoEstado]);

    const grandTotalPeriodos = useMemo(() =>
        filteredPeriodos.reduce((sum, r) => sum + (Number(r.total_galones) || 0), 0),
    [filteredPeriodos]);

    // Detalle de galones por estado + periodo
    const periodoKey = (r) => `${r.estado}|${r.periodo ?? ''}`;
    const [expandedPeriodo, setExpandedPeriodo] = useState(null);
    const [periodoTrips, setPeriodoTrips]       = useState({});   // { 'TX|Q1': [...] }
    const [loadingPeriodoTrips, setLoadingPeriodoTrips] = useState(null);

    useEffect(() => {
        setExpandedPeriodo(null);
        setPeriodoTrips({});
    }, [periodos]);

    const openPeriodoTrips = async (row) => {
        const key = periodoKey(row);
        setExpandedPeriodo(key);
        if (periodoTrips[key]) return;

        setLoadingPeriodoTrips(key);
        try {
            const fd = new FormData();
            fd.append('op', 'galones_ifta_detalle');
            fd.append('estado', row.estado ?? '');
            fd.append('periodo', row.periodo ?? '');
            const res  = await fetch(`${apiHost}/IFTA.php`, { method: 'POST', body: fd });
            const json = await res.json();
            if (json.status === 'success') setPeriodoTrips(prev => ({ ...prev, [key]: json.data }));
            else console.error('IFTA galones_ifta_detalle:', json.message);
        } catch (err) {
            console.error('IFTA fetchPeriodoTrips:', err);
        } finally {
            setLoadingPeriodoTrips(null);
        }
    };

    const printPDF = () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
        const margin = 40;
        const pageW = doc.internal.pageSize.getWidth();

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('IFTA — Registros', pageW / 2, margin, { align: 'center' });

        const filtros = [
            `Periodo: ${!filterPeriodo ? 'todos' : filterPeriodo === PERIODO_VACIO ? 'Vacío' : filterPeriodo}`,
            `Estado: ${filterPeriodoEstado.trim() ? filterPeriodoEstado.trim().toUpperCase() : 'todos'}`,
        ].join('   ·   ');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(filtros, pageW / 2, margin + 18, { align: 'center' });

        // Mismas columnas y valores que la tabla en pantalla
        const rows = filteredPeriodos.map(r => [
            r.estado,
            fmtPeriodo(r.periodo),
            fmtInt(r.total_galones),
        ]);
        rows.push(['TOTAL', '', fmtInt(grandTotalPeriodos)]);

        autoTable(doc, {
            startY: margin + 32,
            margin: { left: margin, right: margin, top: margin, bottom: margin },
            head: [['Estado', 'Periodo', 'Total Galones']],
            body: rows,
            styles: { fontSize: 9, cellPadding: 5 },
            headStyles: { fillColor: [245, 245, 245], textColor: 0, fontStyle: 'bold' },
            didParseCell: (data) => {
                if (data.column.index === 2) {
                    data.cell.styles.halign = 'right';
                }
                if (data.row.index === rows.length - 1 && data.section === 'body') {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [245, 245, 245];
                }
            },
            pageBreak: 'auto',
            rowPageBreak: 'avoid',
        });

        doc.save('IFTA_Galones.pdf');
    };

    // ── Tab 3: Millas Unidades ────────────────────────────────────────────────
    const [unidades, setUnidades]               = useState([]);
    const [loadingUnidades, setLoadingUnidades] = useState(false);
    const [unidTripFrom, setUnidTripFrom]       = useState('');
    const [unidTripTo, setUnidTripTo]           = useState('');
    const [unidYear, setUnidYear]               = useState(String(new Date().getFullYear()));
    // Ajuste manual (+/-) de millas por estado + unidad. Clave: `${state}-${unidad}`
    const [ajustesUnidades, setAjustesUnidades] = useState({});

    const ajusteKey = (state, unidad) => `${state}-${unidad ?? 'sin'}`;
    const getAjuste = (state, unidad) => {
        const n = parseFloat(ajustesUnidades[ajusteKey(state, unidad)]);
        return Number.isFinite(n) ? n : 0;
    };

    const fetchUnidades = async () => {
        setLoadingUnidades(true);
        try {
            const fd = new FormData();
            fd.append('op', 'millas_unidades');
            // El trip_number se reinicia cada año; el año va a 2 dígitos (ej. "26")
            if (unidYear.trim())     fd.append('year', unidYear.trim().slice(-2));
            if (unidTripFrom.trim()) fd.append('trip_from', unidTripFrom.trim());
            if (unidTripTo.trim())   fd.append('trip_to', unidTripTo.trim());
            const res  = await fetch(`${apiHost}/IFTA.php`, { method: 'POST', body: fd });
            const json = await res.json();
            if (json.status === 'success') {
                setUnidades(json.data);
                setAjustesUnidades({}); // los ajustes son sobre los datos cargados; se reinician al recargar
            }
        } catch (err) {
            console.error('IFTA fetchUnidades:', err);
        } finally {
            setLoadingUnidades(false);
        }
    };

    useEffect(() => {
        if (tabValue === 3) fetchUnidades();
    }, [tabValue]); // eslint-disable-line react-hooks/exhaustive-deps

    // La API regresa una fila por estado + unidad; se agrupan por estado para la tabla
    const unidadesPorEstado = useMemo(() => {
        const map = new Map();
        unidades.forEach(r => {
            if (!map.has(r.state)) map.set(r.state, { state: r.state, total: r.total_state_miles, trucks: [] });
            map.get(r.state).trucks.push({ unidad: r.unidad, total: r.total_truck_miles });
        });
        return [...map.values()];
    }, [unidades]);

    const grandTotalUnidades = useMemo(() =>
        unidadesPorEstado.reduce((sum, s) => sum + s.total, 0),
    [unidadesPorEstado]);

    // Totales con ajustes: total final por estado = total del estado + suma de ajustes de sus unidades
    const ajusteEstado = (s) => s.trucks.reduce((sum, t) => sum + getAjuste(s.state, t.unidad), 0);
    const grandAjusteUnidades = unidadesPorEstado.reduce((sum, s) => sum + ajusteEstado(s), 0);
    const fmtAjuste = (n) => (n > 0 ? `+${fmt(n)}` : fmt(n));

    // PDF del tab: solo Estado / Unidad y Total final (ya con los ajustes aplicados)
    const printUnidadesPDF = () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
        const margin = 40;
        const pageW = doc.internal.pageSize.getWidth();

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('IFTA — Millas por Unidad', pageW / 2, margin, { align: 'center' });

        const filtros = [
            `Año: ${unidYear.trim() || 'todos'}`,
            `Viajes: ${unidTripFrom.trim() || 'inicio'} – ${unidTripTo.trim() || 'fin'}`,
        ].join('   ·   ');
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(filtros, pageW / 2, margin + 18, { align: 'center' });

        const rows = [];
        const estadoRows = new Set(); // índices de filas de estado (van en negritas)
        unidadesPorEstado.forEach(s => {
            estadoRows.add(rows.length);
            rows.push([s.state, fmtInt(s.total + ajusteEstado(s))]);
            s.trucks.forEach(t => {
                rows.push([
                    `      ${t.unidad != null ? `Unidad ${t.unidad}` : 'Sin unidad'}`,
                    fmtInt(t.total + getAjuste(s.state, t.unidad)),
                ]);
            });
        });
        rows.push(['TOTAL', fmtInt(grandTotalUnidades + grandAjusteUnidades)]);

        autoTable(doc, {
            startY: margin + 32,
            margin: { left: margin, right: margin, top: margin, bottom: margin },
            head: [['Estado / Unidad', 'Total final']],
            body: rows,
            styles: { fontSize: 9, cellPadding: 5 },
            headStyles: { fillColor: [245, 245, 245], textColor: 0, fontStyle: 'bold' },
            didParseCell: (data) => {
                if (data.column.index === 1) data.cell.styles.halign = 'right';
                if (data.section !== 'body') return;
                if (data.row.index === rows.length - 1) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [245, 245, 245];
                } else if (estadoRows.has(data.row.index)) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [250, 250, 250];
                }
            },
            pageBreak: 'auto',
            rowPageBreak: 'avoid',
        });

        doc.save('IFTA_Millas_Unidades.pdf');
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={700} mb={2.5}>
                IFTA — Registros
            </Typography>

            <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ mb: 2.5 }}>
                <Tab label="Por Viaje" />
                <Tab label="Millas IFTA" />
                <Tab label="Galones IFTA" />
                <Tab label="Millas Unidades" />
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

            {/* ── TAB 1: Millas IFTA ─────────────────────────────────────────── */}
            {tabValue === 1 && (
                <Box>
                    {/* Filtros */}
                    <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
                        <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                            <FilterListIcon fontSize="small" color="action" />
                            <Typography variant="subtitle2" fontWeight={700}>Filtros</Typography>
                        </Stack>
                        <Stack direction="row" gap={2} flexWrap="wrap" alignItems="flex-end">
                            <Stack direction="row" alignItems="center" sx={{ height: 40 }}>
                                <Typography variant="body2" color={filterByTrips ? 'text.secondary' : 'text.primary'} fontWeight={filterByTrips ? 400 : 700}>
                                    Fechas
                                </Typography>
                                <Switch
                                    size="small"
                                    checked={filterByTrips}
                                    onChange={e => setFilterByTrips(e.target.checked)}
                                />
                                <Typography variant="body2" color={filterByTrips ? 'text.primary' : 'text.secondary'} fontWeight={filterByTrips ? 700 : 400}>
                                    Viajes
                                </Typography>
                            </Stack>
                            {filterByTrips ? (
                                <>
                                    <TextField
                                        size="small"
                                        label="Del viaje"
                                        type="number"
                                        value={filterTripFrom}
                                        onChange={e => setFilterTripFrom(e.target.value)}
                                        sx={{ width: 130 }}
                                    />
                                    <TextField
                                        size="small"
                                        label="Al viaje"
                                        type="number"
                                        value={filterTripTo}
                                        onChange={e => setFilterTripTo(e.target.value)}
                                        sx={{ width: 130 }}
                                    />
                                    <TextField
                                        size="small"
                                        label="Año"
                                        value={filterTripYear}
                                        onChange={e => setFilterTripYear(e.target.value)}
                                        sx={{ width: 100 }}
                                        slotProps={{ htmlInput: { maxLength: 4 } }}
                                    />
                                </>
                            ) : (
                                <>
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
                                </>
                            )}
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
                                    setFilterFrom('');
                                    setFilterTo('');
                                    setFilterTripFrom('');
                                    setFilterTripTo('');
                                    setFilterTripYear(String(new Date().getFullYear()));
                                }}
                            >
                                Limpiar
                            </Button>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={printTotalsPDF}
                                disabled={loadingTotals || totals.length === 0}
                                startIcon={<PictureAsPdfIcon />}
                            >
                                Exportar PDF
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
                                        <TableCell sx={{ fontWeight: 700 }} align="right">Modificar Millas</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">Total Final</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {totals.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                                Sin datos para los filtros aplicados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <>
                                            {totals.map(row => (
                                                <Fragment key={row.state}>
                                                <TableRow hover>
                                                    <TableCell>
                                                        <Stack direction="row" alignItems="center" gap={0.5}>
                                                            <IconButton size="small" title="Ver viajes" onClick={() => openStateTrips(row.state)}>
                                                                <ListAltIcon fontSize="small" />
                                                            </IconButton>
                                                            <Chip label={row.state} size="small" sx={{ fontWeight: 700, minWidth: 42 }} />
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell align="right">{fmt(row.total)}</TableCell>
                                                    <TableCell align="right" sx={{ py: 0.5 }}>
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            placeholder="0"
                                                            value={ajustes[row.state] ?? ''}
                                                            onChange={e => setAjustes(prev => ({ ...prev, [row.state]: e.target.value }))}
                                                            sx={{ width: 110 }}
                                                            slotProps={{ htmlInput: { step: 'any', style: { textAlign: 'right' } } }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600 }}>{fmtInt(totalFinal(row))}</TableCell>
                                                </TableRow>
                                                </Fragment>
                                            ))}
                                            {/* Totales footer */}
                                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                                <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(grandTotal)}</TableCell>
                                                <TableCell />
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>{fmtInt(grandTotalFinal)}</TableCell>
                                            </TableRow>
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Pop up: viajes del estado */}
                    <Dialog open={!!expandedState} onClose={() => setExpandedState(null)} maxWidth="md" fullWidth>
                        <DialogTitle sx={{ fontWeight: 700 }}>Viajes en {expandedState}</DialogTitle>
                        <DialogContent dividers>
                            {loadingStateTrips === expandedState ? (
                                <Box display="flex" alignItems="center" gap={1.5}>
                                    <CircularProgress size={18} />
                                    <Typography variant="body2" color="text.secondary">Cargando viajes...</Typography>
                                </Box>
                            ) : !stateTrips[expandedState]?.length ? (
                                <Typography variant="body2" color="text.secondary">Sin viajes.</Typography>
                            ) : (
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>Viaje #</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Fecha Carga</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Fecha Entrega</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }} align="right">Mi en {expandedState}</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {stateTrips[expandedState].map(trip => (
                                            <TableRow key={trip.trip_id}>
                                                <TableCell sx={{ fontWeight: 600 }}>{trip.trip_number}</TableCell>
                                                <TableCell>{fmtDate(trip.creation_date)}</TableCell>
                                                <TableCell>{fmtDate(trip.return_date)}</TableCell>
                                                <TableCell align="right">{fmt(trip.total)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setExpandedState(null)}>Cerrar</Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            )}

            {/* ── TAB 2: Galones IFTA ──────────────────────────────────────── */}
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
                                    <MenuItem value={PERIODO_VACIO}>Vacío</MenuItem>
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
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<PictureAsPdfIcon />}
                                onClick={printPDF}
                                disabled={filteredPeriodos.length === 0}
                            >
                                Imprimir PDF
                            </Button>
                        </Stack>
                    </Paper>

                    {loadingPeriodos ? (
                        <Box display="flex" alignItems="center" gap={1.5} py={4}>
                            <CircularProgress size={22} />
                            <Typography color="text.secondary">Cargando galones por periodo...</Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Periodo</TableCell>
                                        <TableCell sx={{ fontWeight: 700,  textAlign: 'right'}}>Total Galones</TableCell>
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
                                            {filteredPeriodos.map((row, i) => {
                                                const key = periodoKey(row);
                                                return (
                                                <Fragment key={`${key}-${i}`}>
                                                <TableRow hover>
                                                    <TableCell>
                                                        <Stack direction="row" alignItems="center" gap={0.5}>
                                                            <IconButton size="small" title="Ver detalle" onClick={() => openPeriodoTrips(row)}>
                                                                <ListAltIcon fontSize="small" />
                                                            </IconButton>
                                                            <Chip label={row.estado} size="small" sx={{ fontWeight: 700, minWidth: 42 }} />
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={fmtPeriodo(row.periodo)} size="small" variant="outlined" color={row.periodo ? 'primary' : 'default'} sx={{ fontWeight: 600 }} />
                                                    </TableCell>
                                                    <TableCell align="right">{fmtInt(row.total_galones)}</TableCell>
                                                </TableRow>
                                                </Fragment>
                                                );
                                            })}
                                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                                <TableCell sx={{ fontWeight: 700,  textAlign: 'right' }} colSpan={2}>TOTAL</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>{fmtInt(grandTotalPeriodos)}</TableCell>
                                            </TableRow>
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Pop up: detalle de galones del estado + periodo */}
                    <Dialog open={!!expandedPeriodo} onClose={() => setExpandedPeriodo(null)} maxWidth="sm" fullWidth>
                        <DialogTitle sx={{ fontWeight: 700 }}>
                            {expandedPeriodo && (() => {
                                const [estado, periodo] = expandedPeriodo.split('|');
                                return `Galones en ${estado} — ${fmtPeriodo(periodo)}`;
                            })()}
                        </DialogTitle>
                        <DialogContent dividers>
                            {loadingPeriodoTrips === expandedPeriodo ? (
                                <Box display="flex" alignItems="center" gap={1.5}>
                                    <CircularProgress size={18} />
                                    <Typography variant="body2" color="text.secondary">Cargando viajes...</Typography>
                                </Box>
                            ) : !periodoTrips[expandedPeriodo]?.length ? (
                                <Typography variant="body2" color="text.secondary">Sin viajes.</Typography>
                            ) : (
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ fontWeight: 700 }}>Viaje #</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }} align="right">Galones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {/* Un viaje puede tener varias cargas de diesel, por eso la key usa el índice */}
                                        {periodoTrips[expandedPeriodo].map((d, i) => (
                                            <TableRow key={`${d.trip_number}-${i}`}>
                                                <TableCell sx={{ fontWeight: 600 }}>{d.trip_number}</TableCell>
                                                <TableCell align="right">{fmtInt(d.galones)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setExpandedPeriodo(null)}>Cerrar</Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            )}

            {/* ── TAB 3: Millas Unidades ───────────────────────────────────── */}
            {tabValue === 3 && (
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
                                label="Del viaje"
                                type="number"
                                value={unidTripFrom}
                                onChange={e => setUnidTripFrom(e.target.value)}
                                sx={{ width: 130 }}
                            />
                            <TextField
                                size="small"
                                label="Al viaje"
                                type="number"
                                value={unidTripTo}
                                onChange={e => setUnidTripTo(e.target.value)}
                                sx={{ width: 130 }}
                            />
                            <TextField
                                size="small"
                                label="Año"
                                value={unidYear}
                                onChange={e => setUnidYear(e.target.value)}
                                sx={{ width: 100 }}
                                slotProps={{ htmlInput: { maxLength: 4 } }}
                            />
                            <Button
                                variant="contained"
                                size="small"
                                onClick={fetchUnidades}
                                disabled={loadingUnidades}
                                startIcon={<FilterListIcon />}
                            >
                                Aplicar
                            </Button>
                            <Button
                                size="small"
                                color="inherit"
                                onClick={() => {
                                    setUnidTripFrom('');
                                    setUnidTripTo('');
                                    setUnidYear(String(new Date().getFullYear()));
                                }}
                            >
                                Limpiar
                            </Button>
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<PictureAsPdfIcon />}
                                onClick={printUnidadesPDF}
                                disabled={loadingUnidades || unidadesPorEstado.length === 0}
                            >
                                Imprimir
                            </Button>
                        </Stack>
                    </Paper>

                    {loadingUnidades ? (
                        <Box display="flex" alignItems="center" gap={1.5} py={4}>
                            <CircularProgress size={22} />
                            <Typography color="text.secondary">Cargando millas por unidad...</Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>Estado / Unidad</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">Millas</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="center">Modificar millas</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }} align="right">Total final</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {unidadesPorEstado.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                                Sin datos para los filtros aplicados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <>
                                            {unidadesPorEstado.map(s => (
                                                <Fragment key={s.state}>
                                                    {/* Estado con su total */}
                                                    <TableRow sx={{ bgcolor: '#fafafa' }}>
                                                        <TableCell>
                                                            <Chip label={s.state} size="small" sx={{ fontWeight: 700, minWidth: 42 }} />
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(s.total)}</TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                                            {ajusteEstado(s) !== 0 ? fmtAjuste(ajusteEstado(s)) : '—'}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 700 }}>{fmtInt(s.total + ajusteEstado(s))}</TableCell>
                                                    </TableRow>
                                                    {/* Unidades que recorrieron ese estado */}
                                                    {s.trucks.map(t => {
                                                        const key = ajusteKey(s.state, t.unidad);
                                                        return (
                                                            <TableRow key={key} hover>
                                                                <TableCell sx={{ pl: 6, color: 'text.secondary' }}>
                                                                    {t.unidad != null ? `Unidad ${t.unidad}` : 'Sin unidad'}
                                                                </TableCell>
                                                                <TableCell align="right">{fmt(t.total)}</TableCell>
                                                                <TableCell align="center">
                                                                    <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        placeholder="0"
                                                                        value={ajustesUnidades[key] ?? ''}
                                                                        onChange={e => setAjustesUnidades(prev => ({ ...prev, [key]: e.target.value }))}
                                                                        sx={{ width: 120 }}
                                                                        slotProps={{ htmlInput: { step: 'any', style: { textAlign: 'right' } } }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="right">{fmtInt(t.total + getAjuste(s.state, t.unidad))}</TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </Fragment>
                                            ))}
                                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                                <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(grandTotalUnidades)}</TableCell>
                                                <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                                    {grandAjusteUnidades !== 0 ? fmtAjuste(grandAjusteUnidades) : '—'}
                                                </TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>{fmtInt(grandTotalUnidades + grandAjusteUnidades)}</TableCell>
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

