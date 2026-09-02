import { useMemo } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { COLOR } from '../../shared/ui/tokens';
import { BloqueEsqueleto } from '../../shared/ui';

const MONTH_LABELS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const PALETTE = [
  COLOR.INFO, COLOR.EXITO, COLOR.AVISO, COLOR.PELIGRO, '#7c3aed', '#0891b2',
  '#db2777', '#65a30d', '#ea580c', '#4f46e5', '#059669', COLOR.PELIGRO,
];

const money = (currency) => (v) =>
  new Intl.NumberFormat(currency === 'MXN' ? 'es-MX' : 'en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(v || 0));

const getRollingMonths = () => {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
};

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
    return <BloqueEsqueleto alto={340} conTitulo={false} />;
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
        yAxis={[{ valueFormatter: formatMoney, width: 95 }]}
        series={series}
        height={380}
        margin={{ top: 20, right: 20, bottom: 30, left: 10 }}
        borderRadius={4}
        slotProps={{
          legend: { hidden: false, direction: 'row', position: { vertical: 'top', horizontal: 'right' } },
          tooltip: { trigger: 'axis' },
        }}
      />
    </Box>
  );
};

export default ExpenseTypeChart;
