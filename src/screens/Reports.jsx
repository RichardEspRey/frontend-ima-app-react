import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box, Paper, Typography, Stack, ToggleButton, ToggleButtonGroup,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  CircularProgress, Grid, Card, CardContent, Avatar, Divider, Container
} from "@mui/material";
import { BarChart } from '@mui/x-charts/BarChart';

// Iconos
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableViewIcon from '@mui/icons-material/TableView';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'; 

const apiHost = import.meta.env.VITE_API_HOST;

const valueFormatter = (v) =>
  new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Number(v || 0));

const chartSetting = {
  height: 350, 
  margin: { top: 20, right: 20, bottom: 40, left: 70 },
};

const toDayLabel = (iso) => (iso || '').slice(0, 10);
const toMonthKey = (iso) => (iso || '').slice(0, 7);

const toMonthLabel = (mKey) => {
  const [y, m] = (mKey || '').split('-').map(Number);
  if (!y || !m) return mKey || '—';
  return new Date(y, m - 1, 1).toLocaleDateString('es-MX', { year: 'numeric', month: 'short' });
};

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

function toWeekKey(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  const { year, week } = getISOWeek(d);
  return `${year}-W${String(week).padStart(2, '0')}`;
}

const KPICard = ({ title, value, icon, color, subLabel }) => (
  <Card 
    elevation={0} 
    sx={{ 
      height: '100%', 
      border: '1px solid #e0e0e0', 
      borderRadius: 3,
      transition: 'transform 0.2s',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
    }}
  >
    <CardContent sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
      <Avatar sx={{ bgcolor: `${color}15`, color: color, width: 56, height: 56, mr: 2.5 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing={0.5}>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight={800} color="text.primary" sx={{ my: 0.5 }}>
          {value}
        </Typography>
        {subLabel && (
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {subLabel}
            </Typography>
        )}
      </Box>
    </CardContent>
  </Card>
);

export default function Reports() {
  
  // -- STATES DIESEL --
  const [rows, setRows] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [tableRows, setTableRows] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [groupBy, setGroupBy] = useState('day'); 

  // -- STATES FINANZAS --
  const [financesData, setFinancesData] = useState([]);
  const [financesLoading, setFinancesLoading] = useState(true);

  // --- FETCH DIESEL ---
  const fetchChart = useCallback(async () => {
    setChartLoading(true);
    try {
      const fd = new FormData();
      fd.append('op', 'chart_diesel');
      const res = await fetch(`${apiHost}/charts.php`, { method: 'POST', body: fd });
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data)) setRows(json.data);
      else setRows([]);
    } catch (err) { console.error(err); setRows([]); } 
    finally { setChartLoading(false); }
  }, []);

  const fetchTable = useCallback(async () => {
    setTableLoading(true);
    try {
      const fd = new FormData();
      fd.append('op', 'chart_diesel_table');
      const res = await fetch(`${apiHost}/charts.php`, { method: 'POST', body: fd });
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data)) setTableRows(json.data);
      else setTableRows([]);
    } catch (err) { console.error(err); setTableRows([]); } 
    finally { setTableLoading(false); }
  }, []);

  // --- FETCH FINANZAS ---
  const fetchFinances = useCallback(async () => {
    setFinancesLoading(true);
    try {
        const fd = new FormData();
        fd.append('op', 'chart_finances');
        const res = await fetch(`${apiHost}/charts.php`, { method: 'POST', body: fd });
        const json = await res.json();
        if (json.status === 'success' && Array.isArray(json.data)) {
            const mapped = json.data.map(item => ({
                periodo: item.periodo,
                label: toMonthLabel(item.periodo),
                rate: Number(item.total_rate),
                paid: Number(item.total_paid)
            }));
            setFinancesData(mapped);
        } else {
            setFinancesData([]);
        }
    } catch (e) {
        console.error("Error fetching finances", e);
        setFinancesData([]);
    } finally {
        setFinancesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChart();
    fetchTable();
    fetchFinances();
  }, [fetchChart, fetchTable, fetchFinances]);

  // --- DATA PROCESSING DIESEL ---
  const base = useMemo(() => {
    return rows.map(r => ({
      day: toDayLabel(r.fecha),
      fecha: r.fecha,
      monto: Number(r.monto ?? 0),
      galones: Number(r.galones ?? 0),
      fleetone: Number(r.fleetone ?? 0),
      week: toWeekKey(r.fecha),
      month: toMonthKey(r.fecha),
    }));
  }, [rows]);

  const datasetDiesel = useMemo(() => {
    if (groupBy === 'day') return [...base].sort((a, b) => a.day.localeCompare(b.day));
    const key = groupBy === 'week' ? 'week' : 'month';
    const acc = {};
    for (const r of base) {
      const k = r[key] || '—';
      if (!acc[k]) acc[k] = { [key]: k, label: k, monto: 0, galones: 0, fleetone: 0 };
      acc[k].monto += r.monto;
      acc[k].galones += r.galones;
      acc[k].fleetone += r.fleetone;
    }
    const out = Object.values(acc).sort((a, b) => a.label.localeCompare(b.label));
    if (groupBy === 'month') out.forEach(o => o.label = toMonthLabel(o.month));
    return out;
  }, [base, groupBy]);

  const xAxisDiesel = useMemo(() => {
    if (groupBy === 'day')   return [{ dataKey: 'day',   label: 'Día', scaleType: 'band' }];
    if (groupBy === 'week')  return [{ dataKey: 'week',  label: 'Semana', scaleType: 'band' }];
    return [{ dataKey: 'label', label: 'Mes', scaleType: 'band' }];
  }, [groupBy]);

  const tableBase = useMemo(() => {
    return (tableRows || []).map((r) => {
      if (r.fecha) return { label: toDayLabel(r.fecha), galones: Number(r.galones ?? r.total_galones ?? 0) };
      const y = String(r.anio ?? r.year ?? '').trim();
      const mRaw = String(r.mes ?? r.month ?? '').trim();
      const m = mRaw.padStart(2, '0');
      const key = y && m ? `${y}-${m}` : '—';
      return { label: toMonthLabel(key), galones: Number(r.total_galones ?? r.galones ?? 0) };
    });
  }, [tableRows]);

  // --- TOTALS ---
  const totalMonto = useMemo(() => rows.reduce((acc, curr) => acc + (Number(curr.monto) || 0), 0), [rows]);
  const totalFleetone = useMemo(() => rows.reduce((acc, curr) => acc + (Number(curr.fleetone) || 0), 0), [rows]);
  const totalGalones = useMemo(() => tableBase.reduce((acc, r) => acc + (Number(r.galones) || 0), 0), [tableBase]);

  const tableFirstColTitle = (tableRows?.[0] && (('anio' in tableRows[0]) || ('mes' in tableRows[0]))) ? 'Mes' : 'Fecha';

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={4} spacing={2}>
        <Box>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
                Reportes Financieros
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Análisis de consumo, costos y facturación.
            </Typography>
        </Box>
        <Paper elevation={0} variant="outlined" sx={{ p: 0.5, borderRadius: 3, bgcolor: '#f9fafb' }}>
            <ToggleButtonGroup
                value={groupBy}
                exclusive
                onChange={(_, v) => v && setGroupBy(v)}
                size="small"
                sx={{ '& .MuiToggleButton-root': { border: 'none', borderRadius: 2, px: 2, fontWeight: 600 } }}
            >
                <ToggleButton value="day">Día</ToggleButton>
                <ToggleButton value="week">Semana</ToggleButton>
                <ToggleButton value="month">Mes</ToggleButton>
            </ToggleButtonGroup>
        </Paper>
      </Stack>

      <Grid container spacing={3} mb={5}>
        <Grid item xs={12} md={4}>
            <KPICard 
                title="Gasto Diésel Total" 
                value={`$${valueFormatter(totalMonto)}`} 
                icon={<AttachMoneyIcon fontSize="large" />} 
                color="#3C48E1" 
                subLabel="Total acumulado"
            />
        </Grid>
        <Grid item xs={12} md={4}>
            <KPICard 
                title="Gasto FleetOne" 
                value={`$${valueFormatter(totalFleetone)}`} 
                icon={<ShowChartIcon fontSize="large" />} 
                color="#00C853" 
                subLabel="Pago electrónico"
            />
        </Grid>
        <Grid item xs={12} md={4}>
            <KPICard 
                title="Consumo Diésel" 
                value={`${valueFormatter(totalGalones)}`} 
                icon={<LocalGasStationIcon fontSize="large" />} 
                color="#FF6D00" 
                subLabel="Galones consumidos"
            />
        </Grid>
      </Grid>

      <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, mb: 5, bgcolor: '#fff' }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={3}>
            <Box sx={{ width: 4, height: 24, bgcolor: '#9c27b0', borderRadius: 1 }} />
            <Typography variant="h6" fontWeight={700}>Facturación vs Cobranza (Por mes de finalización)</Typography>
        </Stack>
        
        <Box sx={{ width: '100%', minHeight: 400 }}>
            {financesLoading ? (
                <Stack alignItems="center" justifyContent="center" height={350}>
                    <CircularProgress color="secondary" />
                    <Typography variant="caption" mt={2}>Calculando finanzas...</Typography>
                </Stack>
            ) : financesData.length === 0 ? (
                <Stack alignItems="center" justifyContent="center" height={350}>
                    <AccountBalanceIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
                    <Typography color="text.secondary">No hay datos financieros para mostrar</Typography>
                </Stack>
            ) : (
                <BarChart
                    dataset={financesData}
                    xAxis={[{ dataKey: 'label', label: 'Mes de Finalización', scaleType: 'band' }]}
                    series={[
                        { dataKey: 'rate', label: 'Total Tarifa (Rate)', valueFormatter, color: '#1976d2' }, 
                        { dataKey: 'paid', label: 'Total Pagado', valueFormatter, color: '#ed6c02' }, 
                    ]}
                    {...chartSetting}
                    slotProps={{ legend: { direction: 'row', position: { vertical: 'top', horizontal: 'middle' }, padding: -5 } }}
                    borderRadius={4}
                />
            )}
        </Box>
      </Paper>

      <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, mb: 5, bgcolor: '#fff' }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={3}>
            <Box sx={{ width: 4, height: 24, bgcolor: 'primary.main', borderRadius: 1 }} />
            <Typography variant="h6" fontWeight={700}>Evolución de Costos de Diésel</Typography>
        </Stack>
        
        <Box sx={{ width: '100%', minHeight: 400 }}>
            {chartLoading ? (
                <Stack alignItems="center" justifyContent="center" height={350}>
                    <CircularProgress />
                    <Typography variant="caption" mt={2}>Cargando...</Typography>
                </Stack>
            ) : (
                <BarChart
                    dataset={datasetDiesel}
                    xAxis={xAxisDiesel}
                    series={[
                        { dataKey: 'monto', label: 'Monto ($)', valueFormatter, color: '#3C48E1' },
                        { dataKey: 'fleetone', label: 'FleetOne ($)', valueFormatter, color: '#00C853' },
                    ]}
                    {...chartSetting}
                    slotProps={{ legend: { direction: 'row', position: { vertical: 'top', horizontal: 'middle' }, padding: -5 } }}
                    borderRadius={4}
                />
            )}
        </Box>
      </Paper>

      <Paper elevation={0} variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
        <Box sx={{ p: 3, bgcolor: '#fcfcfc', borderBottom: '1px solid #eee' }}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <TableViewIcon color="action" />
                <Typography variant="h6" fontWeight={700}>Detalle Volumetría (Diésel)</Typography>
            </Stack>
        </Box>

        {tableLoading ? (
            <Box p={5} display="flex" justifyContent="center"><CircularProgress /></Box>
        ) : (
            <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', bgcolor: '#fff' }}>{tableFirstColTitle}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.95rem', bgcolor: '#fff' }}>Consumo (Gal)</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.95rem', bgcolor: '#fff' }}>% del Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableBase.map((r, idx) => {
                            const percent = totalGalones > 0 ? (r.galones / totalGalones) * 100 : 0;
                            return (
                                <TableRow key={`${r.label}-${idx}`} hover>
                                    <TableCell sx={{ fontWeight: 500, color: 'text.secondary' }}>{r.label}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 600 }}>{valueFormatter(r.galones)}</TableCell>
                                    <TableCell align="right" sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                                        {percent < 0.1 ? '< 0.1%' : `${percent.toFixed(1)}%`}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {tableBase.length > 0 && (
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 800 }}>TOTAL GLOBAL</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.1rem' }}>
                                    {valueFormatter(totalGalones)}
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800 }}>100%</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        )}
      </Paper>

    </Container>
  );
}