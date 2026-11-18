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
    periodosDisponibles, filtrarPeriodos, llavePeriodo, totalesIfta,
    describirFiltrosTotales, describirFiltrosPeriodos,
    obtenerGalonesIfta, obtenerDetalleGalonesIfta, obtenerMillasUnidades,
    agruparUnidadesPorEstado, llaveAjusteUnidad, ajusteDeUnidad, ajusteDeEstado,
} from '../../entities/ifta';

const apiHost = import.meta.env.VITE_API_HOST;

const fmt = (n) => Number(n).toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtDate = (d) => d ? d.split('T')[0] : '—';
const fmtInt = (n) => Math.round(Number(n) || 0).toLocaleString('en-US');
const anioActual = () => String(new Date().getFullYear());

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
    const [filterTripYear, setFilterTripYear] = useState(anioActual);

    const [appliedFilters, setAppliedFilters] = useState({});

    const filtrosEnPantalla = {
        porViajes: filterByTrips,
        desde: filterFrom,
        hasta: filterTo,
        viajeDesde: filterTripFrom,
        viajeHasta: filterTripTo,
        anio: filterTripYear,
    };

    const buildFilters = () => filtrosTotalesIfta(filtrosEnPantalla);

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

    const printTotalsPDF = async () => {
        let data = totals;
        let ajustesDelPdf = ajustes;
        if (JSON.stringify(buildFilters()) !== JSON.stringify(appliedFilters)) {
            data = await fetchTotals();
            if (!data) return;
            ajustesDelPdf = {};
        }

        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
        const margin = 40;
        const pageW = doc.internal.pageSize.getWidth();

        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('IFTA — Millas', pageW / 2, margin, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(describirFiltrosTotales(filtrosEnPantalla), pageW / 2, margin + 22, { align: 'center' });

        const rows = data.map(r => [r.state, fmtInt(totalConAjuste(r, ajustesDelPdf))]);
        rows.push(['TOTAL', fmtInt(data.reduce((sum, r) => sum + totalConAjuste(r, ajustesDelPdf), 0))]);

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

    const [periodos, setPeriodos]               = useState([]);
    const [loadingPeriodos, setLoadingPeriodos] = useState(false);
    const [filterPeriodo, setFilterPeriodo]     = useState('');
    const [filterPeriodoEstado, setFilterPeriodoEstado] = useState('');

    const fetchPeriodos = async () => {
        setLoadingPeriodos(true);
        try {
            setPeriodos(await obtenerGalonesIfta());
        } catch (err) {
            console.error('IFTA galones_ifta:', err);
        } finally {
            setLoadingPeriodos(false);
        }
    };

    useEffect(() => {
        if (tabValue === 2) fetchPeriodos();
    }, [tabValue]);

    const periodosUnicos = useMemo(() => periodosDisponibles(periodos), [periodos]);

    const filteredPeriodos = useMemo(
        () => filtrarPeriodos(periodos, { periodo: filterPeriodo, estado: filterPeriodoEstado }),
        [periodos, filterPeriodo, filterPeriodoEstado],
    );

    const grandTotalPeriodos = useMemo(() => totalesIfta(filteredPeriodos).galones, [filteredPeriodos]);

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
            const detalle = await obtenerDetalleGalonesIfta({ estado: row.estado, periodo: row.periodo });
            setPeriodoTrips(prev => ({ ...prev, [key]: detalle }));
        } catch (err) {
            console.error('IFTA galones_ifta_detalle:', err);
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

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(
            describirFiltrosPeriodos({ periodo: filterPeriodo, estado: filterPeriodoEstado }),
            pageW / 2, margin + 18, { align: 'center' },
        );

        const rows = filteredPeriodos.map(r => [
            r.estado || '—',
            etiquetaPeriodo(r.periodo),
            fmtInt(r.galones),
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

    const [unidades, setUnidades]               = useState([]);
    const [loadingUnidades, setLoadingUnidades] = useState(false);
    const [unidTripFrom, setUnidTripFrom]       = useState('');
    const [unidTripTo, setUnidTripTo]           = useState('');
    const [unidYear, setUnidYear]               = useState(anioActual);
    const [ajustesUnidades, setAjustesUnidades] = useState({});

    const fetchUnidades = async () => {
        setLoadingUnidades(true);
        try {
            setUnidades(await obtenerMillasUnidades({ anio: unidYear, viajeDesde: unidTripFrom, viajeHasta: unidTripTo }));
            setAjustesUnidades({});
        } catch (err) {
            console.error('IFTA millas_unidades:', err);
        } finally {
            setLoadingUnidades(false);
        }
    };

    useEffect(() => {
        if (tabValue === 3) fetchUnidades();
    }, [tabValue]); // eslint-disable-line react-hooks/exhaustive-deps

    const unidadesPorEstado = useMemo(() => agruparUnidadesPorEstado(unidades), [unidades]);
    const grandTotalUnidades = useMemo(() => unidadesPorEstado.reduce((sum, g) => sum + g.total, 0), [unidadesPorEstado]);
    const grandAjusteUnidades = unidadesPorEstado.reduce((sum, g) => sum + ajusteDeEstado(g, ajustesUnidades), 0);
    const fmtAjuste = (n) => (n > 0 ? `+${fmt(n)}` : fmt(n));

    const printUnidadesPDF = () => {
        const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
        const margin = 40;
        const pageW = doc.internal.pageSize.getWidth();

        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('IFTA — Millas por Unidad', pageW / 2, margin, { align: 'center' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(
            [`Año: ${unidYear.trim() || 'todos'}`, `Viajes: ${unidTripFrom.trim() || 'inicio'} – ${unidTripTo.trim() || 'fin'}`].join('   ·   '),
            pageW / 2, margin + 18, { align: 'center' },
        );

        const rows = [];
        const filasDeEstado = new Set();
        unidadesPorEstado.forEach(g => {
            filasDeEstado.add(rows.length);
            rows.push([g.estado, fmtInt(g.total + ajusteDeEstado(g, ajustesUnidades))]);
            g.unidades.forEach(u => {
                rows.push([
                    `      ${u.unidad != null ? `Unidad ${u.unidad}` : 'Sin unidad'}`,
                    fmtInt(u.total + ajusteDeUnidad(ajustesUnidades, g.estado, u.unidad)),
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
                } else if (filasDeEstado.has(data.row.index)) {
                    data.cell.styles.fontStyle = 'bold';
                    data.cell.styles.fillColor = [250, 250, 250];
                }
            },
            pageBreak: 'auto',
            rowPageBreak: 'avoid',
        });

        doc.save('IFTA_Millas_Unidades.pdf');
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
                    { etiqueta: 'Millas Unidades' },
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
                                                    <TableCell align="right" sx={{ fontWeight: 600 }}>{fmtInt(totalFinal(row))}</TableCell>
                                                </TableRow>
                                                </Fragment>
                                            ))}
                                            <TableRow sx={{ bgcolor: COLOR.LIENZO }}>
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
                                    <TableRow sx={{ bgcolor: COLOR.LIENZO }}>
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
                                                const key = llavePeriodo(row);
                                                return (
                                                <Fragment key={`${key}-${i}`}>
                                                <TableRow hover>
                                                    <TableCell>
                                                        <Stack direction="row" alignItems="center" gap={0.5}>
                                                            <IconButton size="small" title="Ver detalle" onClick={() => openPeriodoTrips(row)}>
                                                                <ListAltIcon fontSize="small" />
                                                            </IconButton>
                                                            <Chip label={row.estado || '—'} size="small" sx={{ fontWeight: 700, minWidth: 42 }} />
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label={etiquetaPeriodo(row.periodo)} size="small" variant="outlined" color={row.periodo ? 'primary' : 'default'} sx={{ fontWeight: 600 }} />
                                                    </TableCell>
                                                    <TableCell align="right">{fmtInt(row.galones)}</TableCell>
                                                </TableRow>
                                                </Fragment>
                                                );
                                            })}
                                            <TableRow sx={{ bgcolor: COLOR.LIENZO }}>
                                                <TableCell sx={{ fontWeight: 700,  textAlign: 'right' }} colSpan={2}>TOTAL</TableCell>
                                                <TableCell align="right" sx={{ fontWeight: 700 }}>{fmtInt(grandTotalPeriodos)}</TableCell>
                                            </TableRow>
                                        </>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    <Dialog open={!!expandedPeriodo} onClose={() => setExpandedPeriodo(null)} maxWidth="sm" fullWidth>
                        <DialogTitle sx={{ fontWeight: 700 }}>
                            {expandedPeriodo && (() => {
                                const [estado, periodo] = expandedPeriodo.split('|');
                                return `Galones en ${estado || 'sin estado'} — ${etiquetaPeriodo(periodo)}`;
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
                                        {periodoTrips[expandedPeriodo].map((carga, i) => (
                                            <TableRow key={`${carga.trip_number}-${i}`}>
                                                <TableCell sx={{ fontWeight: 600 }}>{carga.trip_number}</TableCell>
                                                <TableCell align="right">{fmtInt(carga.galones)}</TableCell>
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

            {tabValue === 3 && (
                <Box>
                    <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
                        <Stack direction="row" alignItems="center" gap={1} mb={1.5}>
                            <FilterListIcon fontSize="small" color="action" />
                            <Typography variant="subtitle2" fontWeight={700}>Filtros</Typography>
                        </Stack>
                        <Stack direction="row" gap={2} flexWrap="wrap" alignItems="flex-end">
                            <TextField size="small" label="Del viaje" type="number" value={unidTripFrom}
                                onChange={e => setUnidTripFrom(e.target.value)} sx={{ width: 130 }} />
                            <TextField size="small" label="Al viaje" type="number" value={unidTripTo}
                                onChange={e => setUnidTripTo(e.target.value)} sx={{ width: 130 }} />
                            <TextField size="small" label="Año" value={unidYear}
                                onChange={e => setUnidYear(e.target.value)} sx={{ width: 100 }}
                                slotProps={{ htmlInput: { maxLength: 4 } }} />
                            <Button variant="contained" size="small" onClick={fetchUnidades}
                                disabled={loadingUnidades} startIcon={<FilterListIcon />}>
                                Aplicar
                            </Button>
                            <Button size="small" color="inherit" onClick={() => {
                                setUnidTripFrom('');
                                setUnidTripTo('');
                                setUnidYear(anioActual());
                            }}>
                                Limpiar
                            </Button>
                            <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />}
                                onClick={printUnidadesPDF} disabled={loadingUnidades || unidadesPorEstado.length === 0}>
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
                                    <TableRow sx={{ bgcolor: COLOR.LIENZO }}>
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
                                            {unidadesPorEstado.map(g => {
                                                const ajusteDelEstado = ajusteDeEstado(g, ajustesUnidades);
                                                return (
                                                <Fragment key={g.estado}>
                                                    <TableRow sx={{ bgcolor: COLOR.LIENZO }}>
                                                        <TableCell>
                                                            <Chip label={g.estado} size="small" sx={{ fontWeight: 700, minWidth: 42 }} />
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(g.total)}</TableCell>
                                                        <TableCell align="center" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                                                            {ajusteDelEstado !== 0 ? fmtAjuste(ajusteDelEstado) : '—'}
                                                        </TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 700 }}>{fmtInt(g.total + ajusteDelEstado)}</TableCell>
                                                    </TableRow>
                                                    {g.unidades.map(u => {
                                                        const llave = llaveAjusteUnidad(g.estado, u.unidad);
                                                        return (
                                                            <TableRow key={llave} hover>
                                                                <TableCell sx={{ pl: 6, color: 'text.secondary' }}>
                                                                    {u.unidad != null ? `Unidad ${u.unidad}` : 'Sin unidad'}
                                                                </TableCell>
                                                                <TableCell align="right">{fmt(u.total)}</TableCell>
                                                                <TableCell align="center">
                                                                    <TextField
                                                                        size="small"
                                                                        type="number"
                                                                        placeholder="0"
                                                                        value={ajustesUnidades[llave] ?? ''}
                                                                        onChange={e => setAjustesUnidades(prev => ({ ...prev, [llave]: e.target.value }))}
                                                                        sx={{ width: 120 }}
                                                                        slotProps={{ htmlInput: { step: 'any', style: { textAlign: 'right' } } }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="right">{fmtInt(u.total + ajusteDeUnidad(ajustesUnidades, g.estado, u.unidad))}</TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </Fragment>
                                                );
                                            })}
                                            <TableRow sx={{ bgcolor: COLOR.LIENZO }}>
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
