import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box, Paper, Typography, Stack, ToggleButton, ToggleButtonGroup,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, CircularProgress
} from "@mui/material";
import { BarChart } from '@mui/x-charts/BarChart';

const apiHost = import.meta.env.VITE_API_HOST;

const valueFormatter = (v) =>
  new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Number(v || 0));

const chartSetting = {
  height: 320,
  margin: { top: 16, right: 16, bottom: 24, left: 40 },
};

const toDayLabel = (iso) => (iso || '').slice(0, 10); // YYYY-MM-DD
const toMonthKey = (iso) => (iso || '').slice(0, 7);   // YYYY-MM

const toMonthLabel = (mKey) => {
  const [y, m] = (mKey || '').split('-').map(Number);
  if (!y || !m) return mKey || '—';
  return new Date(y, m - 1, 1).toLocaleDateString('es-MX', { year: 'numeric', month: 'short' });
};

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number (adjust for Sunday=0)
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7)); 
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to the start of the year
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

export default function Reports() {
  // DATA PARA EL CHART (op=chart_diesel)
  const [rows, setRows] = useState([]);
  const [chartLoading, setChartLoading] = useState(true);

  // DATA PARA LA TABLA (op=chart_diesel_table)
  const [tableRows, setTableRows] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);

  const [groupBy, setGroupBy] = useState('day'); // 'day' | 'week' | 'month'

  // ------- FETCH CHART -------
  const fetchChart = useCallback(async () => {
    setChartLoading(true);
    try {
      const fd = new FormData();
      fd.append('op', 'chart_diesel');
      const res = await fetch(`${apiHost}/charts.php`, { method: 'POST', body: fd });
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        setRows(json.data);
      } else {
        console.error(json.message || 'Respuesta no exitosa (chart)');
        setRows([]);
      }
    } catch (err) {
      console.error('Error cargando chart_diesel:', err);
      setRows([]);
    } finally {
      setChartLoading(false);
    }
  }, [apiHost]);

  // ------- FETCH TABLA -------
  const fetchTable = useCallback(async () => {
    setTableLoading(true);
    try {
      const fd = new FormData();
      fd.append('op', 'chart_diesel_table');
      const res = await fetch(`${apiHost}/charts.php`, { method: 'POST', body: fd });
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        setTableRows(json.data);
      } else {
        console.error(json.message || 'Respuesta no exitosa (tabla)');
        setTableRows([]);
      }
    } catch (err) {
      console.error('Error cargando chart_diesel_table:', err);
      setTableRows([]);
    } finally {
      setTableLoading(false);
    }
  }, [apiHost]);

  useEffect(() => {
    fetchChart();
    fetchTable();
  }, [fetchChart, fetchTable]);

  // --------- BASE ----------
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

  // --------- DATASET AGRUPADO PARA CHART ----------
  const dataset = useMemo(() => {
    if (groupBy === 'day') {
      return [...base].sort((a, b) => a.day.localeCompare(b.day));
    }
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
    if (groupBy === 'month') {
      out.forEach(o => o.label = toMonthLabel(o.month));
    }
    return out;
  }, [base, groupBy]);

  // xAxis según agrupación
  const xAxis = useMemo(() => {
    if (groupBy === 'day')   return [{ dataKey: 'day',   label: 'Fecha',        scaleType: 'band' }];
    if (groupBy === 'week')  return [{ dataKey: 'week',  label: 'Semana (ISO)', scaleType: 'band' }];
    return [{ dataKey: 'label', label: 'Mes', scaleType: 'band' }];
  }, [groupBy]);

  // --------- TABLA: normaliza lo que venga del endpoint ---------
  const tableBase = useMemo(() => {
    return (tableRows || []).map((r) => {
      if (r.fecha) {
        return {
          label: toDayLabel(r.fecha),
          galones: Number(r.galones ?? r.total_galones ?? 0),
        };
      }
      const y = String(r.anio ?? r.year ?? '').trim();
      const mRaw = String(r.mes ?? r.month ?? '').trim();
      const m = mRaw.padStart(2, '0');
      const key = y && m ? `${y}-${m}` : '—';
      return {
        label: toMonthLabel(key),
        galones: Number(r.total_galones ?? r.galones ?? 0),
      };
    });
  }, [tableRows]);

  const tableIsMonthly = (tableRows?.[0] && (('anio' in tableRows[0]) || ('mes' in tableRows[0]))) ?? false;
  const tableFirstColTitle = tableIsMonthly ? 'Mes' : 'Fecha';

  const totalGalones = useMemo(
    () => tableBase.reduce((acc, r) => acc + (Number(r.galones) || 0), 0),
    [tableBase]
  );

  return (
    <Paper sx={{ p: 3 }}>
      
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>Consumo de diésel (Gráfico)</Typography>

        <ToggleButtonGroup
          value={groupBy}
          exclusive
          size="small"
          onChange={useCallback((_, v) => v && setGroupBy(v), [])} 
        >
          <ToggleButton value="day" sx={{ fontWeight: 600 }}>Día</ToggleButton>
          <ToggleButton value="week" sx={{ fontWeight: 600 }}>Semana</ToggleButton>
          <ToggleButton value="month" sx={{ fontWeight: 600 }}>Mes</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Gráfico de Barras */}
      <Paper elevation={0} variant="outlined" sx={{ mb: 4, p: 1 }}>
        {chartLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: chartSetting.height }}>
            <CircularProgress size={24} sx={{ mr: 1 }} />
            <Typography>Cargando gráfico…</Typography>
          </Box>
        ) : (
          <BarChart
            dataset={dataset}
            xAxis={xAxis}
            series={[
              { dataKey: 'monto', label: 'Monto ($)', valueFormatter, color: '#3C48E1' },
              { dataKey: 'fleetone', label: 'Fleetone ($)', valueFormatter, color: '#4CAF50' },
            ]}
            {...chartSetting}
          />
        )}
      </Paper>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
        Galones consumidos (Tabla)
      </Typography>

      {tableLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', height: 100 }}>
          <CircularProgress size={24} sx={{ mr: 1 }} />
          <Typography>Cargando tabla…</Typography>
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ width: 'fit-content', display: 'inline-block', alignSelf: 'flex-start' }}
        >
          <Table
            size="small"
            sx={{ tableLayout: 'auto', '& td, & th': { whiteSpace: 'nowrap', px: 2, py: 1 } }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>{tableFirstColTitle}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>Galones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableBase.map((r, idx) => (
                <TableRow key={`${r.label}-${idx}`} hover>
                  <TableCell>{r.label}</TableCell>
                  <TableCell align="right">{Number(r.galones).toFixed(2)}</TableCell>
                </TableRow>
              ))}
              {tableBase.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ fontStyle: 'italic' }}>Sin registros</TableCell>
                </TableRow>
              )}
              {tableBase.length > 0 && (
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Total</TableCell> 
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {totalGalones.toFixed(2)}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
}