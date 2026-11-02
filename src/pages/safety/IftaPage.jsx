import { useState, useEffect, useMemo, Fragment } from 'react';
import {
    Box, Typography, Table, TableBody, TableCell,
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
import { COLOR } from '../../shared/ui/tokens';
import { Pestanas } from '../../shared/ui';
import {
    PERIODO_VACIO, etiquetaPeriodo, filtrosTotalesIfta, totalConAjuste,
    periodosDisponibles, filtrarPeriodos, llavePeriodo,
} from '../../entities/ifta';

const apiHost = import.meta.env.VITE_API_HOST;

const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtDate = (d) => d ? d.split('T')[0] : '—';
const fmtInt = (n) => Math.round(Number(n) || 0).toLocaleString('en-US');

/**
 * IFTA: millas recorridas y combustible cargado por estado.
 *
 * El impuesto se paga por la diferencia entre dónde se recorrió y dónde se compró
 * el combustible, así que lo que importa de cada estado es esa relación. Las millas
 * se filtran por fechas o por rango de viajes, se pueden ajustar a mano por estado
 * antes de exportarlas, y cada total abre los viajes que lo componen.
 *
 * @returns {object} La pantalla.
 */
export default function IftaPage() {
    const [tabValue, setTabValue] = useState(0);

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

    const [totals, setTotals]               = useState([]);
    const [loadingTotals, setLoadingTotals] = useState(false);
    const [filterByTrips, setFilterByTrips] = useState(false);
    const [filterFrom, setFilterFrom]       = useState('');
    const [filterTo, setFilterTo]           = useState('');
    const [filterTripFrom, setFilterTripFrom] = useState('');
    const [filterTripTo, setFilterTripTo]     = useState('');
    const [filterTripYear, setFilterTripYear] = useState(String(new Date().getFullYear()));

    const [appliedFilters, setAppliedFilters] = useState({});

    const buildFilters = () => filtrosTotalesIfta({
        porViajes: filterByTrips,
        desde: filterFrom,
        hasta: filterTo,
        viajeDesde: filterTripFrom,
        viajeHasta: filterTripTo,
        anio: filterTripYear,
    });

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
            }
        } catch (err) {
            console.error('IFTA fetchTotals:', err);
        } finally {
            setLoadingTotals(false);
        }
    };

    useEffect(() => {
        if (tabValue === 1) fetchTotals();
    }, [tabValue]); // eslint-disable-line react-hooks/exhaustive-deps

    const grandTotal = useMemo(() => totals.reduce((sum, r) => sum + r.total, 0), [totals]);

    const [ajustes, setAjustes] = useState({});

    const [expandedState, setExpandedState] = useState(null);
    const [stateTrips, setStateTrips]       = useState({});
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

    const totalFinal = (row) => totalConAjuste(row, ajustes);

    const grandTotalFinal = useMemo(() =>
        totals.reduce((sum, r) => sum + totalConAjuste(r, ajustes), 0),
    [totals, ajustes]);

    const printTotalsPDF = () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
        const margin = 40;
        const pageW = doc.internal.pageSize.getWidth();

        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('IFTA — Millas', pageW / 2, margin, { align: 'center' });

        const rows = totals.map(r => [r.state, fmt(totalFinal(r))]);
        rows.push(['TOTAL', fmt(grandTotalFinal)]);

        autoTable(doc, {
            startY: margin + 34,
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

    const [periodos, setPeriodos]               = useState([]);
    const [loadingPeriodos, setLoadingPeriodos] = useState(false);
    const [filterPeriodo, setFilterPeriodo]     = useState('');
    const [filterPeriodoEstado, setFilterPeriodoEstado] = useState('');
    const [filterYear, setFilterYear] = useState('');

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
    }, [tabValue]);

    const periodosUnicos = useMemo(() => periodosDisponibles(periodos), [periodos]);

    const filteredPeriodos = useMemo(
        () => filtrarPeriodos(periodos, { periodo: filterPeriodo, estado: filterPeriodoEstado, anio: filterYear }),
        [periodos, filterPeriodo, filterPeriodoEstado, filterYear],
    );

    const grandTotalPeriodos = useMemo(() =>
        filteredPeriodos.reduce((sum, r) => sum + r.total_millas, 0),
    [filteredPeriodos]);

    const [expandedPeriodo, setExpandedPeriodo] = useState(null);
    const [periodoTrips, setPeriodoTrips]       = useState({});
    const [loadingPeriodoTrips, setLoadingPeriodoTrips] = useState(null);

    useEffect(() => {
        setExpandedPeriodo(null);
        setPeriodoTrips({});
    }, [periodos]);

    const openPeriodoTrips = async (row) => {
        const key = llavePeriodo(row);
        setExpandedPeriodo(key);
        if (periodoTrips[key]) return;

        setLoadingPeriodoTrips(key);
        try {
            const fd = new FormData();
            fd.append('op', 'periodo_trips');
            fd.append('state', row.estado);
            fd.append('periodo', row.periodo ?? '');
            if (row.trip_year) fd.append('year', row.trip_year);
            const res  = await fetch(`${apiHost}/IFTA.php`, { method: 'POST', body: fd });
            const json = await res.json();
            if (json.status === 'success') setPeriodoTrips(prev => ({ ...prev, [key]: json.data }));
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

        const rows = filteredPeriodos.map(r => [
            r.estado,
            etiquetaPeriodo(r.periodo),
            r.trip_year ?? '—',
            fmtInt(r.galones),
            fmtInt(r.total_millas),
        ]);
        rows.push(['TOTAL', '', '', fmtInt(grandTotalPeriodos)]);

        autoTable(doc, {
            startY: margin + 24,
            margin: { left: margin, right: margin, top: margin, bottom: margin },
            head: [['Estado', 'Periodo', 'Año', 'Total Mi']],
            body: rows,
            styles: { fontSize: 9, cellPadding: 5 },
            headStyles: { fillColor: [245, 245, 245], textColor: 0, fontStyle: 'bold' },
            didParseCell: (data) => {
                if (data.column.index === 3) {
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

        doc.save('IFTA_Registros.pdf');
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={700} mb={2.5}>
                IFTA — Registros
            </Typography>

            <Pestanas
                valor={tabValue}
                onChange={setTabValue}
                pestanas={[
                    { etiqueta: 'Por Viaje' },
                    { etiqueta: 'Millas IFTA' },
                    { etiqueta: 'Galones IFTA' },
                ]}
                sx={{ mb: 2.5 }}
            />

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
                                    <TableRow sx={{ bgcolor: COLOR.LIENZO }}>
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

            {tabValue === 1 && (
                <Box>
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
                                    <TableRow sx={{ bgcolor: COLOR.LIENZO }}>
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
                                                    <TableCell align="right" sx={{ fontWeight: 600 }}>{fmt(totalFinal(row))}</TableCell>
                                                </TableRow>
                                                </Fragment>
                                            ))}
                                            <TableRow sx={{ bgcolor: COLOR.LIENZO }}>
                                                <TableCell sx={{ fontWeight: 700 }}>TOTAL</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(grandTotal)}</TableCell>
                                                <TableCell />
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(grandTotalFinal)}</TableCell>
                                            </TableRow>
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

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

            {tabValue === 2 && (
                <Box>
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
                            <TextField
                                size="small"
                                label="Año"
                                value={filterYear}
                                onChange={e => setFilterYear(e.target.value)}
                                sx={{ width: 100 }}
                                slotProps={{ htmlInput: { maxLength: 4 } }}
                            />
                            <Button
                                size="small"
                                color="inherit"
                                onClick={() => {
                                    setFilterPeriodo('');
                                    setFilterPeriodoEstado('');
                                    setFilterYear('');
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
                            <Typography color="text.secondary">Cargando millas por periodo...</Typography>
                        </Box>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: COLOR.LIENZO }}>
                                        <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Periodo</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Año</TableCell>
                                        <TableCell sx={{ fontWeight: 700,  textAlign: 'right'}}>Total Galones</TableCell>

                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredPeriodos.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                                Sin datos para los filtros aplicados.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        <>
                                            {filteredPeriodos.map((row, i) => {
                                                const key = llavePeriodo(row);
                                                return (
                                                <Fragment key={`${key}-${i}`}>
                                                <TableRow hover>
                                                    <TableCell>
                                                        <Stack direction="row" alignItems="center" gap={0.5}>
                                                            <IconButton size="small" title="Ver viajes" onClick={() => openPeriodoTrips(row)}>
                                                                <ListAltIcon fontSize="small" />
                                                            </IconButton>
                                                            <Chip label={row.estado} size="small" sx={{ fontWeight: 700, minWidth: 42 }} />
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={etiquetaPeriodo(row.periodo)} size="small" variant="outlined" color={row.periodo ? 'primary' : 'default'} sx={{ fontWeight: 600 }} />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={row.trip_year} size="small" variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
                                                    </TableCell>

                                                    <TableCell align="right">{fmtInt(row.total_millas)}</TableCell>
                                                </TableRow>
                                                </Fragment>
                                                );
                                            })}
                                            <TableRow sx={{ bgcolor: COLOR.LIENZO }}>
                                                <TableCell sx={{ fontWeight: 700,  textAlign: 'right' }} colSpan={3}>TOTAL</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>{fmtInt(grandTotalPeriodos)}</TableCell>
                                            </TableRow>
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    <Dialog open={!!expandedPeriodo} onClose={() => setExpandedPeriodo(null)} maxWidth="md" fullWidth>
                        <DialogTitle sx={{ fontWeight: 700 }}>
                            {expandedPeriodo && (() => {
                                const [estado, periodo, year] = expandedPeriodo.split('|');
                                return `Viajes en ${estado} — ${etiquetaPeriodo(periodo)} ${year}`;
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
                                            <TableCell sx={{ fontWeight: 700 }}>Fecha Carga</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Fecha Entrega</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }} align="right">Total Galones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {periodoTrips[expandedPeriodo].map(trip => (
                                            <TableRow key={trip.trip_id}>
                                                <TableCell sx={{ fontWeight: 600 }}>{trip.trip_number}</TableCell>
                                                <TableCell>{fmtDate(trip.creation_date)}</TableCell>
                                                <TableCell>{fmtDate(trip.return_date)}</TableCell>
                                                <TableCell align="right">{fmtInt(trip.total_millas)}</TableCell>
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
        </Box>
    );
}
