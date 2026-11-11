export const MONTH_LABELS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const getRollingMonths = (hoy = new Date()) =>
  Array.from({ length: 12 }, (_, i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - (11 - i), 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });

const porcentaje = (parte, total) => (total > 0 ? (parte / total) * 100 : null);

export const margenPorMes = (trips, months) => {
  const indexByKey = {};
  months.forEach(({ year, month }, i) => { indexByKey[`${year}-${month}`] = i; });

  const buckets = months.map(({ year, month }) => ({
    label: `${MONTH_LABELS_ES[month - 1]} ${String(year).slice(2)}`,
    viajes: 0,
    tarifa: 0,
    diesel: 0,
    driver: 0,
    margen: 0,
  }));

  trips.forEach(t => {
    const [y, m] = String(t.creation_date || '').split('-').map(Number);
    const idx = indexByKey[`${y}-${m}`];
    if (idx === undefined) return;
    const b = buckets[idx];
    b.viajes += 1;
    b.tarifa += Number(t.total_rate || 0);
    b.diesel += Number(t.diesel || 0);
    b.driver += Number(t.driver_pay || 0);
    b.margen += Number(t.totalMargin || 0);
  });

  return buckets.map(b => ({
    ...b,
    pctDiesel: porcentaje(b.diesel, b.tarifa),
    pctDriver: porcentaje(b.driver, b.tarifa),
  }));
};
