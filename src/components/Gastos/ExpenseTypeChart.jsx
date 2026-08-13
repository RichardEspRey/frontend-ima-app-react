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

// Los 12 meses terminando en el mes actual (ventana móvil), del más antiguo
// (izquierda) al más reciente (derecha). Ej. si hoy es agosto 2026, va de
// septiembre 2025 a agosto 2026, y el próximo mes la ventana se recorre sola.
const getRollingMonths = () => {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
};

// Gráfica de barras acumulativa (stacked): eje X = últimos 12 meses (ventana
// móvil), eje Y = dinero, cada columna se divide por Expense Type (una serie
// por tipo, todas compartiendo el mismo `stack`). El hover y la leyenda de
// colores los da @mui/x-charts de forma nativa.
export const ExpenseTypeChart = ({ gastos, country, loading }) => {
  const currency = country === 'MX' ? 'MXN' : 'USD';
  const formatMoney = money(currency);

  const months = useMemo(() => getRollingMonths(), []);
  const rangeLabel = `${MONTH_LABELS_ES[months[0].month - 1]} ${months[0].year} – ${MONTH_LABELS_ES[months[11].month - 1]} ${months[11].year}`;

  const { dataset, series } = useMemo(() => {
    const gastosDelPais = gastos.filter(g => g.pais === country);

    const indexByKey = {};
    months.forEach(({ year, month }, i) => { indexByKey[`${year}-${month}`] = i; });

    const types = new Set();
    gastosDelPais.forEach(g => (g.detalles || []).forEach(d => {
      if (d.tipo_gasto) types.add(d.tipo_gasto);
    }));

    const buckets = months.map(({ year, month }) => {
      const row = { label: `${MONTH_LABELS_ES[month - 1]} ${String(year).slice(2)}` };
      types.forEach(t => { row[t] = 0; });
      return row;
    });

    gastosDelPais.forEach(g => {
      const fecha = g.fecha_gasto;
      if (!fecha) return;
      const [y, m] = fecha.split('-').map(Number);
      if (!y || !m) return;
      const idx = indexByKey[`${y}-${m}`];
      if (idx === undefined) return;

      (g.detalles || []).forEach(d => {
        if (!d.tipo_gasto) return;
        const cant = parseFloat(d.cantidad_articulo ?? 0) || 0;
        const pu = parseFloat(d.precio_unitario ?? 0) || 0;
        buckets[idx][d.tipo_gasto] += cant * pu;
      });
    });

    // Orden por total de la ventana (mayor a menor), para que la leyenda quede
    // en el mismo orden que la columna: `stackOrder: 'descending'` es lo que
    // en realidad manda al gasto más grande hasta abajo de cada columna.
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
  }, [gastos, country, currency, months]);

  const hasData = series.length > 0 && dataset.some(row => series.some(s => row[s.dataKey] > 0));

  if (loading) {
    return <Stack alignItems="center" justifyContent="center" height={340}><CircularProgress size={28} /></Stack>;
  }

  if (!hasData) {
    return (
      <Stack alignItems="center" justifyContent="center" height={340} spacing={1}>
        <Typography color="text.secondary">
          No hay gastos registrados para {country === 'MX' ? 'México' : 'Estados Unidos'} entre {rangeLabel}.
        </Typography>
      </Stack>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <BarChart
        dataset={dataset}
        xAxis={[{ dataKey: 'label', scaleType: 'band' }]}
        // El ancho por default del eje Y es de solo 45px (65 si tiene label),
        // insuficiente para montos completos como "$123,456" — por eso se
        // veían cortados sin importar el margen del chart. Con `width` se
        // reserva el espacio real que necesita el texto.
        yAxis={[{ valueFormatter: formatMoney, width: 95 }]}
        series={series}
        height={380}
        margin={{ top: 20, right: 20, bottom: 30, left: 10 }}
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
