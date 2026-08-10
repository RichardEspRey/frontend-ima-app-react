import { useMemo } from 'react';
import { Box, Typography, Stack, CircularProgress } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';

const MONTH_LABELS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Paleta fija para que cada Expense Type conserve siempre el mismo color entre
// renders/filtros; se recicla si hay más tipos que colores en la lista.
const PALETTE = [
  '#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2',
  '#db2777', '#65a30d', '#ea580c', '#4f46e5', '#059669', '#b91c1c',
];

const money = (currency) => (v) =>
  new Intl.NumberFormat(currency === 'MXN' ? 'es-MX' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(v || 0));

// Gráfica de barras acumulativa (stacked): eje X = los 12 meses del año en curso,
// eje Y = dinero, cada columna se divide por Expense Type (una serie por tipo,
// todas compartiendo el mismo `stack`). El hover y la leyenda de colores los da
// @mui/x-charts de forma nativa.
export const ExpenseTypeChart = ({ gastos, country, loading }) => {
  const currency = country === 'MX' ? 'MXN' : 'USD';
  const year = new Date().getFullYear();
  const formatMoney = money(currency);

  const { dataset, series } = useMemo(() => {
    const gastosDelPais = gastos.filter(g => g.pais === country);

    const types = new Set();
    gastosDelPais.forEach(g => (g.detalles || []).forEach(d => {
      if (d.tipo_gasto) types.add(d.tipo_gasto);
    }));

    const buckets = Array.from({ length: 12 }, (_, i) => {
      const row = { label: MONTH_LABELS_ES[i] };
      types.forEach(t => { row[t] = 0; });
      return row;
    });

    gastosDelPais.forEach(g => {
      const fecha = g.fecha_gasto;
      if (!fecha) return;
      const [y, m] = fecha.split('-').map(Number);
      if (y !== year || !m || m < 1 || m > 12) return;

      (g.detalles || []).forEach(d => {
        if (!d.tipo_gasto) return;
        const cant = parseFloat(d.cantidad_articulo ?? 0) || 0;
        const pu = parseFloat(d.precio_unitario ?? 0) || 0;
        buckets[m - 1][d.tipo_gasto] += cant * pu;
      });
    });

    // Orden por total del año (mayor a menor), para que la leyenda quede en el
    // mismo orden que la columna: `stackOrder: 'descending'` es lo que en
    // realidad manda al gasto más grande hasta abajo de cada columna.
    const totalByType = {};
    types.forEach(t => { totalByType[t] = buckets.reduce((sum, row) => sum + row[t], 0); });
    const typeList = Array.from(types).sort((a, b) => totalByType[b] - totalByType[a]);

    const seriesArr = typeList.map((t, i) => ({
      dataKey: t,
      label: t,
      stack: 'total',
      stackOrder: 'descending',
      color: PALETTE[i % PALETTE.length],
      valueFormatter: (v) => (v ? formatMoney(v) : null),
    }));

    return { dataset: buckets, series: seriesArr };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gastos, country, currency, year]);

  const hasData = series.length > 0 && dataset.some(row => series.some(s => row[s.dataKey] > 0));

  if (loading) {
    return <Stack alignItems="center" justifyContent="center" height={340}><CircularProgress size={28} /></Stack>;
  }

  if (!hasData) {
    return (
      <Stack alignItems="center" justifyContent="center" height={340} spacing={1}>
        <Typography color="text.secondary">
          No hay gastos registrados para {country === 'MX' ? 'México' : 'Estados Unidos'} en {year}.
        </Typography>
      </Stack>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <BarChart
        dataset={dataset}
        xAxis={[{ dataKey: 'label', scaleType: 'band' }]}
        yAxis={[{ valueFormatter: formatMoney }]}
        series={series}
        height={380}
        margin={{ top: 20, right: 20, bottom: 30, left: 130 }}
        borderRadius={4}
        slotProps={{
          legend: { hidden: false, direction: 'row', position: { vertical: 'top', horizontal: 'right' } },
          // 'axis' (el default): muestra todos los Expense Types del mes en un
          // solo tooltip. Los que están en $0 no aparecen porque su
          // valueFormatter devuelve null, y ChartsAxisTooltipContent omite
          // cualquier fila cuyo valor formateado sea null.
          tooltip: { trigger: 'axis' },
        }}
      />
    </Box>
  );
};

export default ExpenseTypeChart;
