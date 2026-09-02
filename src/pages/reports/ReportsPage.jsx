import { useMemo, useState } from "react";
import { Box, Paper, Typography, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress, Container, Grid, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart'; 

import TableViewIcon from '@mui/icons-material/TableView';
import TimelineIcon from '@mui/icons-material/Timeline'; 
import BuildIcon from '@mui/icons-material/Build'; 
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import {
  GRAFICAS,
  agruparDieselPorMes,
  etiquetaMes,
  normalizarFinanzas,
  normalizarMantenimiento,
  ultimosMeses,
  useGraficas,
} from "../../entities/report";
import { COLOR, TINTE, SERIE, BORDE } from "../../shared/ui/tokens";
import { Selector } from "../../shared/ui";

const valueFormatter = (v) =>
  new Intl.NumberFormat('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .format(Number(v || 0));

const money = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(v || 0));

const chartSetting = {
  height: 350, 
  margin: { top: 20, right: 20, bottom: 40, left: 70 },
};

const toMonthLabel = etiquetaMes;

/**
 * Reportes financieros: diesel, finanzas y mantenimiento.
 *
 * Las seis gráficas se piden en paralelo con `useGraficas`, así que una lenta no
 * retrasa a las demás y cada una muestra su propio estado de carga. Antes eran
 * seis funciones de fetch casi idénticas, doce `useState` y dos `useEffect`.
 *
 * @returns {object} La pantalla.
 */
export default function ReportsPage() {
  const [historyMonths, setHistoryMonths] = useState(12);
  const [costPeriod, setCostPeriod] = useState('month');

  const [
    diesel,
    dieselTabla,
    finanzas,
    rts,
    mantenimiento,
    dieselCosto,
  ] = useGraficas([
    { op: GRAFICAS.DIESEL },
    { op: GRAFICAS.DIESEL_TABLA },
    { op: GRAFICAS.FINANZAS },
    { op: GRAFICAS.FINANZAS_RTS },
    { op: GRAFICAS.MANTENIMIENTO },
    { op: GRAFICAS.DIESEL_COSTO, parametros: { period: costPeriod } },
  ]);

  const rows = diesel.data ?? [];
  const chartLoading = diesel.isLoading;
  const tableRows = dieselTabla.data ?? [];
  const tableLoading = dieselTabla.isLoading;
  const costData = dieselCosto.data ?? [];
  const costLoading = dieselCosto.isLoading;

  const financesData = useMemo(() => normalizarFinanzas(finanzas.data), [finanzas.data]);
  const financesLoading = finanzas.isLoading;
  const rtsData = useMemo(() => normalizarFinanzas(rts.data), [rts.data]);
  const rtsLoading = rts.isLoading;
  const maintData = useMemo(() => normalizarMantenimiento(mantenimiento.data), [mantenimiento.data]);
  const maintLoading = mantenimiento.isLoading;

  const datasetDiesel = useMemo(
    () => agruparDieselPorMes(rows).map((f) => ({ ...f, label: etiquetaMes(f.month) })),
    [rows],
  );

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

  const sliceData = (data) => ultimosMeses(Array.isArray(data) ? data : [], historyMonths);

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

        <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white' }} variant="outlined">
            <InputLabel id="history-range-label" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                 Visualizar Historial
            </InputLabel>
            <Select
                labelId="history-range-label"
                value={historyMonths}
                label="Visualizar Historial"
                onChange={(e) => setHistoryMonths(e.target.value)}
                startAdornment={<CalendarMonthIcon sx={{ mr: 1, color: 'action.active', fontSize: 20 }} />}
            >
                <MenuItem value={6}>Últimos 6 Meses</MenuItem>
                <MenuItem value={12}>Últimos 12 Meses</MenuItem>
            </Select>
        </FormControl>
      </Stack>

      <Stack spacing={4}> 

        <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, bgcolor: COLOR.BLANCO }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <Box sx={{ width: 4, height: 24, bgcolor: COLOR.APAGADO, borderRadius: 1 }} />
                <BuildIcon sx={{ color: COLOR.APAGADO }} />
                <Typography variant="h6" fontWeight={700}>Gastos de Mantenimiento Acumulados</Typography>
            </Stack>
            <Box sx={{ width: '100%', minHeight: 400 }}>
                {maintLoading ? (
                    <Stack alignItems="center" justifyContent="center" height={350}><CircularProgress color="inherit" /></Stack>
                ) : maintData.length === 0 ? (
                    <Stack alignItems="center" justifyContent="center" height={350}>
                        <BuildIcon sx={{ fontSize: 60, color: COLOR.BORDE, mb: 2 }} />
                        <Typography color="text.secondary">No hay registros de mantenimiento</Typography>
                    </Stack>
                ) : (
                    <BarChart
                        dataset={sliceData(maintData)}
                        xAxis={[{ dataKey: 'label', label: 'Mes', scaleType: 'band' }]}
                        series={[{ dataKey: 'total', label: 'Total Mantenimiento', valueFormatter, color: COLOR.APAGADO }]}
                        {...chartSetting}
                        borderRadius={4}
                    />
                )}
            </Box>
        </Paper>

        <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, bgcolor: COLOR.BLANCO }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <Box sx={{ width: 4, height: 24, bgcolor: TINTE.VIOLETA.texto, borderRadius: 1 }} />
                <Typography variant="h6" fontWeight={700}>Facturación vs Cobranza (Global)</Typography>
            </Stack>
            <Box sx={{ width: '100%', minHeight: 400 }}>
                {financesLoading ? (
                    <Stack alignItems="center" justifyContent="center" height={350}><CircularProgress color="secondary" /></Stack>
                ) : (
                    <BarChart
                        dataset={sliceData(financesData)}
                        xAxis={[{ dataKey: 'label', label: 'Mes de Entrega', scaleType: 'band' }]}
                        series={[
                            { dataKey: 'rate', label: 'Total Tarifa (Rate)', valueFormatter, color: SERIE[0] }, 
                            { dataKey: 'paid', label: 'Total Pagado', valueFormatter, color: SERIE[1] }, 
                        ]}
                        {...chartSetting}
                        borderRadius={4}
                        slotProps={{ legend: { hidden: false } }} 
                    />
                )}
            </Box>
        </Paper>

        <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, bgcolor: COLOR.BLANCO }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <Box sx={{ width: 4, height: 24, bgcolor: TINTE.INDIGO.texto, borderRadius: 1 }} />
                <Typography variant="h6" fontWeight={700}>Facturación RTS</Typography>
            </Stack>
            <Box sx={{ width: '100%', minHeight: 400 }}>
                {rtsLoading ? <Stack alignItems="center" justifyContent="center" height={350}><CircularProgress /></Stack> : (
                    <BarChart
                        dataset={sliceData(rtsData)}
                        xAxis={[{ dataKey: 'label', label: 'Mes de Entrega', scaleType: 'band' }]}
                        series={[
                            { dataKey: 'rate', label: 'RTS Tarifa', valueFormatter, color: SERIE[3] }, 
                            { dataKey: 'paid', label: 'RTS Pagado', valueFormatter, color: SERIE[2] }, 
                        ]}
                        {...chartSetting}
                        borderRadius={4}
                    />
                )}
            </Box>
        </Paper>
        
        <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, bgcolor: COLOR.BLANCO }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 4, height: 24, bgcolor: SERIE[2], borderRadius: 1 }} />
                    <Box>
                        <Typography variant="h6" fontWeight={700}>Costo de Diesel por Galón</Typography>
                    </Box>
                </Stack>
                <Selector
                    valor={costPeriod}
                    onChange={(valor) => handlePeriodChange(null, valor)}
                    opciones={[
                        { valor: 'day', etiqueta: 'Día' },
                        { valor: 'week', etiqueta: 'Semana' },
                        { valor: 'month', etiqueta: 'Mes' },
                    ]}
                />
            </Stack>
            
            <Box sx={{ width: '100%', minHeight: 400 }}>
                {costLoading ? (
                    <Stack alignItems="center" justifyContent="center" height={350}><CircularProgress color="warning" /></Stack>
                ) : costData.length === 0 ? (
                    <Stack alignItems="center" justifyContent="center" height={350}>
                        <TimelineIcon sx={{ fontSize: 60, color: COLOR.BORDE, mb: 2 }} />
                        <Typography color="text.secondary">No hay datos</Typography>
                    </Stack>
                ) : (
                    <LineChart
                        dataset={costData}
                        xAxis={[{ dataKey: 'id', label: 'Periodo', scaleType: 'point' }]}
                        series={[{ 
                                dataKey: 'y', 
                                label: 'Precio Promedio ($/gal)', 
                                color: SERIE[2],
                                valueFormatter: (v) => `$${Number(v).toFixed(2)}`,
                                showMark: true,
                                curve: 'linear' 
                        }]}
                        yAxis={[{ label: 'Precio por Galón ($)', min: 0 }]}
                        {...chartSetting}
                    />
                )}
            </Box>
        </Paper>

        <Paper elevation={0} variant="outlined" sx={{ p: 4, borderRadius: 4, bgcolor: COLOR.BLANCO }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <Box sx={{ width: 4, height: 24, bgcolor: 'primary.main', borderRadius: 1 }} />
                <Typography variant="h6" fontWeight={700}>Evolución de Costos de Diésel</Typography>
            </Stack>
            <Box sx={{ width: '100%', minHeight: 400 }}>
                {chartLoading ? <Stack alignItems="center" justifyContent="center" height={350}><CircularProgress /></Stack> : (
                    <BarChart
                        dataset={datasetDiesel}
                        xAxis={xAxisDiesel}
                        series={[
                            { dataKey: 'monto', label: 'Monto ($)', valueFormatter, color: SERIE[0] },
                            { dataKey: 'fleetone', label: 'FleetOne ($)', valueFormatter, color: SERIE[1] },
                        ]}
                        {...chartSetting}
                        borderRadius={4}
                    />
                )}
            </Box>
        </Paper>
        

        <Paper elevation={0} variant="outlined" sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <Box sx={{ p: 3, bgcolor: COLOR.LIENZO, borderBottom: BORDE }}>
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
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.95rem', bgcolor: COLOR.BLANCO }}>Mes</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.95rem', bgcolor: COLOR.BLANCO }}>Consumo (Gal)</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700, fontSize: '0.95rem', bgcolor: COLOR.BLANCO }}>Costo Promedio ($/gal)</TableCell>
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
                                <TableRow sx={{ bgcolor: COLOR.LIENZO }}>
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

      </Stack>
    </Container>
  );
}