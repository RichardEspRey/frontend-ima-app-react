import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box, Paper, Typography, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  CircularProgress, Container, ToggleButton, ToggleButtonGroup
} from "@mui/material";
import { BarChart } from '@mui/x-charts/BarChart';
import { ScatterChart } from '@mui/x-charts/ScatterChart'; 

import TableViewIcon from '@mui/icons-material/TableView';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'; 
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange'; 
import TimelineIcon from '@mui/icons-material/Timeline'; 
import BuildIcon from '@mui/icons-material/Build'; 

const apiHost = import.meta.env.VITE_API_HOST;

const valueFormatter = (v) =>
  new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Number(v || 0));

const money = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v || 0));

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

export default function Reports() {
  
  const [rows, setRows] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);
  const [tableRows, setTableRows] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);

  const [costData, setCostData] = useState([]);
  const [costLoading, setCostLoading] = useState(true);
  const [costPeriod, setCostPeriod] = useState('month'); 

  const [financesData, setFinancesData] = useState([]);
  const [financesLoading, setFinancesLoading] = useState(true);
  const [rtsData, setRtsData] = useState([]);
  const [rtsLoading, setRtsLoading] = useState(true);

  const [maintData, setMaintData] = useState([]);
  const [maintLoading, setMaintLoading] = useState(true);

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

  const fetchDieselCost = useCallback(async () => {
    setCostLoading(true);
    try {
        const fd = new FormData();
        fd.append('op', 'chart_diesel_cost');
        fd.append('period', costPeriod); 
        
        const res = await fetch(`${apiHost}/charts.php`, { method: 'POST', body: fd });
        const json = await res.json();
        
        if (json.status === 'success' && Array.isArray(json.data)) {
            setCostData(json.data);
        } else {
            setCostData([]);
        }
    } catch (e) {
        console.error("Error fetching cost data", e);
        setCostData([]);
    } finally {
        setCostLoading(false);
    }
  }, [costPeriod]); 

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
        } else { setFinancesData([]); }
    } catch (e) { setFinancesData([]); } 
    finally { setFinancesLoading(false); }
  }, []);

  const fetchRTS = useCallback(async () => {
    setRtsLoading(true);
    try {
        const fd = new FormData();
        fd.append('op', 'chart_finances_rts');
        const res = await fetch(`${apiHost}/charts.php`, { method: 'POST', body: fd });
        const json = await res.json();
        if (json.status === 'success' && Array.isArray(json.data)) {
            const mapped = json.data.map(item => ({
                periodo: item.periodo,
                label: toMonthLabel(item.periodo),
                rate: Number(item.total_rate),
                paid: Number(item.total_paid)
            }));
            setRtsData(mapped);
        } else { setRtsData([]); }
    } catch (e) { setRtsData([]); } 
    finally { setRtsLoading(false); }
  }, []);

  const fetchMaintenance = useCallback(async () => {
    setMaintLoading(true);
    try {
        const fd = new FormData();
        fd.append('op', 'chart_maintenance_costs');
        const res = await fetch(`${apiHost}/charts.php`, { method: 'POST', body: fd });
        const json = await res.json();
        if (json.status === 'success' && Array.isArray(json.data)) {
            const mapped = json.data.map(item => ({
                periodo: item.periodo,
                label: toMonthLabel(item.periodo),
                total: Number(item.total)
            }));
            setMaintData(mapped);
        } else { setMaintData([]); }
    } catch (e) { setMaintData([]); } 
    finally { setMaintLoading(false); }
  }, []);

  useEffect(() => {
    fetchChart();
    fetchTable();
    fetchFinances();
    fetchRTS();
    fetchMaintenance(); 
  }, [fetchChart, fetchTable, fetchFinances, fetchRTS, fetchMaintenance]);

  useEffect(() => {
      fetchDieselCost();
  }, [fetchDieselCost]); 

  const base = useMemo(() => {
    return rows.map(r => ({
      fecha: r.fecha,
      monto: Number(r.monto ?? 0),
      galones: Number(r.galones ?? 0),
      fleetone: Number(r.fleetone ?? 0),
      month: toMonthKey(r.fecha),
    }));
  }, [rows]);

  const datasetDiesel = useMemo(() => {
    const acc = {};
    for (const r of base) {
      const k = r.month || '—';
      if (!acc[k]) acc[k] = { month: k, label: k, monto: 0, fleetone: 0 };
      acc[k].monto += r.monto;
      acc[k].fleetone += r.fleetone;
    }
    const out = Object.values(acc).sort((a, b) => a.label.localeCompare(b.label));
    out.forEach(o => o.label = toMonthLabel(o.month));
    return out;
  }, [base]);

  const xAxisDiesel = [{ dataKey: 'label', label: 'Mes', scaleType: 'band' }];

  const tableBase = useMemo(() => {
    return (tableRows || []).map((r) => {
      const y = String(r.anio ?? '').trim();
      const mRaw = String(r.mes ?? '').trim();
      const m = mRaw.padStart(2, '0');
      const key = y && m ? `${y}-${m}` : '—';
      
      return { 
          label: toMonthLabel(key), 
          galones: Number(r.total_galones ?? 0),
          avg_cost: Number(r.avg_cost ?? 0) 
      };
    });
  }, [tableRows]);

  const totalGalones = useMemo(() => tableBase.reduce((acc, r) => acc + r.galones, 0), [tableBase]);
  
  const globalAvgCost = useMemo(() => {
      const validRows = tableBase.filter(r => r.avg_cost > 0);
      if (validRows.length === 0) return 0;
      const sum = validRows.reduce((acc, r) => acc + r.avg_cost, 0);
      return sum / validRows.length;
  }, [tableBase]);


  const handlePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) setCostPeriod(newPeriod);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" mb={4} spacing={2}>
        <Box>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.5px' }}>
                Reportes Financieros
            </Typography>
            <Typography variant="body1" color="text.secondary">
                Análisis de consumo, costos y facturación mensual.
            </Typography>
        </Box>
      </Stack>

      <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, mb: 5, bgcolor: '#fff' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3} flexWrap="wrap" gap={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
                <Box sx={{ width: 4, height: 24, bgcolor: '#ff5722', borderRadius: 1 }} />
                <Box>
                    <Typography variant="h6" fontWeight={700}>Costo de Diesel por Galón</Typography>
                    <Typography variant="caption" color="text.secondary">
                        Dispersión: Eje X (Volumen) vs Eje Y (Precio Unitario)
                    </Typography>
                </Box>
            </Stack>
            
            <ToggleButtonGroup
                value={costPeriod}
                exclusive
                onChange={handlePeriodChange}
                size="small"
                sx={{ '& .MuiToggleButton-root': { fontWeight: 600, textTransform: 'none', px: 2 } }}
            >
                <ToggleButton value="day">Día</ToggleButton>
                <ToggleButton value="week">Semana</ToggleButton>
                <ToggleButton value="month">Mes</ToggleButton>
            </ToggleButtonGroup>
        </Stack>
        
        <Box sx={{ width: '100%', minHeight: 400 }}>
            {costLoading ? (
                <Stack alignItems="center" justifyContent="center" height={350}>
                    <CircularProgress color="warning" />
                </Stack>
            ) : costData.length === 0 ? (
                <Stack alignItems="center" justifyContent="center" height={350}>
                    <TimelineIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
                    <Typography color="text.secondary">No hay datos de precio Fleet One</Typography>
                </Stack>
            ) : (
                <ScatterChart
                    series={[{
                        label: 'Costo Promedio',
                        data: costData.map(d => ({ x: d.x, y: d.y, id: d.id })),
                        color: '#ff5722',
                    }]}
                    xAxis={[{ label: 'Volumen Total (Galones)', min: 0 }]}
                    yAxis={[{ label: 'Precio por Galón ($)', min: 0 }]}
                    {...chartSetting}
                    tooltip={{ trigger: 'item' }}
                />
            )}
        </Box>
      </Paper>

      <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, mb: 5, bgcolor: '#fff' }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={3}>
            <Box sx={{ width: 4, height: 24, bgcolor: '#607d8b', borderRadius: 1 }} />
            <BuildIcon sx={{ color: '#607d8b' }} />
            <Typography variant="h6" fontWeight={700}>Gastos de Mantenimiento Acumulados</Typography>
        </Stack>
        
        <Box sx={{ width: '100%', minHeight: 400 }}>
            {maintLoading ? (
                <Stack alignItems="center" justifyContent="center" height={350}>
                    <CircularProgress color="inherit" />
                </Stack>
            ) : maintData.length === 0 ? (
                <Stack alignItems="center" justifyContent="center" height={350}>
                    <BuildIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 2 }} />
                    <Typography color="text.secondary">No hay registros de mantenimiento</Typography>
                </Stack>
            ) : (
                <BarChart
                    dataset={maintData}
                    xAxis={[{ dataKey: 'label', label: 'Mes', scaleType: 'band' }]}
                    series={[
                        { dataKey: 'total', label: 'Total Mantenimiento', valueFormatter, color: '#607d8b' }, 
                    ]}
                    {...chartSetting}
                    borderRadius={4}
                />
            )}
        </Box>
      </Paper>

      <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, mb: 5, bgcolor: '#fff' }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={3}>
            <Box sx={{ width: 4, height: 24, bgcolor: '#9c27b0', borderRadius: 1 }} />
            <Typography variant="h6" fontWeight={700}>Facturación vs Cobranza (Global)</Typography>
        </Stack>
        
        <Box sx={{ width: '100%', minHeight: 400 }}>
            {financesLoading ? (
                <Stack alignItems="center" justifyContent="center" height={350}>
                    <CircularProgress color="secondary" />
                </Stack>
            ) : (
                <BarChart
                    dataset={financesData}
                    xAxis={[{ dataKey: 'label', label: 'Mes de Entrega', scaleType: 'band' }]}
                    series={[
                        { dataKey: 'rate', label: 'Total Tarifa (Rate)', valueFormatter, color: '#1976d2' }, 
                        { dataKey: 'paid', label: 'Total Pagado', valueFormatter, color: '#ed6c02' }, 
                    ]}
                    {...chartSetting}
                    borderRadius={4}
                />
            )}
        </Box>
      </Paper>

      <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, mb: 5, bgcolor: '#fff' }}>
        <Stack direction="row" alignItems="center" spacing={1} mb={3}>
            <Box sx={{ width: 4, height: 24, bgcolor: '#e91e63', borderRadius: 1 }} />
            <Typography variant="h6" fontWeight={700}>Facturación RTS</Typography>
        </Stack>
        <Box sx={{ width: '100%', minHeight: 400 }}>
            {rtsLoading ? <CircularProgress /> : (
                <BarChart
                    dataset={rtsData}
                    xAxis={[{ dataKey: 'label', label: 'Mes de Entrega', scaleType: 'band' }]}
                    series={[
                        { dataKey: 'rate', label: 'RTS Tarifa', valueFormatter, color: '#8e24aa' }, 
                        { dataKey: 'paid', label: 'RTS Pagado', valueFormatter, color: '#ff9800' }, 
                    ]}
                    {...chartSetting}
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
            {chartLoading ? <CircularProgress /> : (
                <BarChart
                    dataset={datasetDiesel}
                    xAxis={xAxisDiesel}
                    series={[
                        { dataKey: 'monto', label: 'Monto ($)', valueFormatter, color: '#3C48E1' },
                        { dataKey: 'fleetone', label: 'FleetOne ($)', valueFormatter, color: '#00C853' },
                    ]}
                    {...chartSetting}
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
                            <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', bgcolor: '#fff' }}>Mes</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.95rem', bgcolor: '#fff' }}>Consumo (Gal)</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.95rem', bgcolor: '#fff' }}>Costo Promedio ($/gal)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableBase.map((r, idx) => (
                            <TableRow key={`${r.label}-${idx}`} hover>
                                <TableCell sx={{ fontWeight: 500, color: 'text.secondary' }}>{r.label}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>{valueFormatter(r.galones)}</TableCell>
                                <TableCell align="right" sx={{ color: 'text.primary', fontSize: '0.9rem', fontWeight: 700 }}>
                                    {money(r.avg_cost)}
                                </TableCell>
                            </TableRow>
                        ))}
                        {tableBase.length > 0 && (
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 800 }}>TOTAL GLOBAL</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800, color: 'primary.main', fontSize: '1.1rem' }}>
                                    {valueFormatter(totalGalones)}
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 800 }}>
                                    ~ {money(globalAvgCost)}
                                </TableCell>
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