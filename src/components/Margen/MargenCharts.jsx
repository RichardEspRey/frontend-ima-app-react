import { useMemo } from 'react';
import { Box, Typography, Stack, CircularProgress } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { MONTH_LABELS_ES, getRollingMonths, margenPorMes } from '../../utils/margenMensual';
import { SECTION_LABEL_SX } from '../../styles/estilosTabla';

const money = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(v || 0));

const percent = (v) => (v == null ? null : `${Number(v).toFixed(1)}%`);

const ChartHeader = ({ title, subtitle }) => (
  <Box sx={{ mb: 1 }}>
    <Typography variant="overline" sx={SECTION_LABEL_SX}>Analítica</Typography>
    <Typography variant="h6" fontWeight={700} color="#0f172a" sx={{ lineHeight: 1.3 }}>{title}</Typography>
    <Typography variant="body2" color="#64748b">{subtitle}</Typography>
  </Box>
);

const chartSlotProps = {
  legend: { hidden: false, direction: 'row', position: { vertical: 'top', horizontal: 'right' } },
  tooltip: { trigger: 'axis' },
};

export const MargenCharts = ({ trips, loading }) => {
  const months = useMemo(() => getRollingMonths(), []);
  const rangeLabel = `${MONTH_LABELS_ES[months[0].month - 1]} ${months[0].year} – ${MONTH_LABELS_ES[months[11].month - 1]} ${months[11].year}`;

  const dataset = useMemo(
    () => margenPorMes(trips.filter(t => t.isCompleted), months),
    [trips, months]
  );

  const hasData = dataset.some(row => row.viajes > 0);

  if (loading) {
    return <Stack alignItems="center" justifyContent="center" height={340}><CircularProgress size={28} /></Stack>;
  }

  if (!hasData) {
    return (
      <Stack alignItems="center" justifyContent="center" height={340}>
        <Typography color="text.secondary">No hay viajes completados entre {rangeLabel}.</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={4}>
      <Box>
        <ChartHeader
          title="Margen Total por Mes"
          subtitle="Últimos 12 meses · Suma del margen de los viajes completados, por mes de creación del viaje, en dólares"
        />
        <BarChart
          dataset={dataset}
          xAxis={[{ dataKey: 'label', scaleType: 'band' }]}
          yAxis={[{
            valueFormatter: money,
            width: 95,
            colorMap: { type: 'piecewise', thresholds: [0], colors: ['#dc2626', '#16a34a'] },
          }]}
          series={[
            { dataKey: 'margen', label: 'Margen', valueFormatter: (v, { dataIndex }) => (dataset[dataIndex].viajes ? money(v) : null) },
          ]}
          height={380}
          margin={{ top: 20, right: 20, bottom: 30, left: 10 }}
          borderRadius={4}
          slotProps={{ ...chartSlotProps, legend: { hidden: true } }}
        />
      </Box>

      <Box>
        <ChartHeader
          title="Diesel y Pago Driver sobre el Total Tarifa"
          subtitle="Últimos 12 meses · (Costo Diesel ÷ Total Tarifa) × 100 y (Pago Driver ÷ Total Tarifa) × 100, con los totales de cada mes"
        />
        <BarChart
          dataset={dataset}
          xAxis={[{ dataKey: 'label', scaleType: 'band' }]}
          yAxis={[{ valueFormatter: (v) => `${v}%`, width: 60 }]}
          series={[
            { dataKey: 'pctDiesel', label: 'Costo Diesel', stack: 'total', color: '#d97706', valueFormatter: percent },
            { dataKey: 'pctDriver', label: 'Pago Driver', stack: 'total', color: '#2563eb', valueFormatter: percent },
          ]}
          height={380}
          margin={{ top: 20, right: 20, bottom: 30, left: 10 }}
          borderRadius={4}
          slotProps={chartSlotProps}
        />
      </Box>
    </Stack>
  );
};

export default MargenCharts;
