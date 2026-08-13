import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Stack, Chip, CircularProgress,
  Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useParams, useNavigate } from 'react-router-dom';
import { getStatusColor } from '../components/TripStatusIndicator';

const apiHost = import.meta.env.VITE_API_HOST;

const money = (v, c = 'USD') =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: c,
    minimumFractionDigits: 2
  }).format(Number(v || 0));

const stageTypeLabel = (t) => {
  const k = String(t || '').toLowerCase();
  if (k === 'bordercrossing') return 'Cruce';
  if (k === 'emptymileage') return 'Etapa de Millaje Vacío';
  if (k === 'normaltrip') return 'Normal';
  return t || '—';
};

const fmtDate = (d) => (d ? new Date(d).toLocaleString('es-MX') : '—');
const fmtDateOnly = (d) => (d ? new Date(d).toLocaleDateString('es-MX') : '—');
const fmtTime = (t) => (t ? t.slice(0, 5) : null);

// Barra de acento + título, mismo lenguaje visual que el resto del rediseño
// de la app (Reports.jsx, etc.), para separar las secciones del resumen.
const SectionTitle = ({ color, children }) => (
  <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 1.5, mt: 3.5 }}>
    <Box sx={{ width: 4, height: 22, bgcolor: color, borderRadius: 1 }} />
    <Typography variant="subtitle1" fontWeight={800} color="#0f172a">{children}</Typography>
  </Stack>
);

const summaryRowSx = { border: 'none', borderBottom: '1px solid #f1f5f9', py: 1.2 };

export default function ResumenTrip() {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();

  const fetchSummary = async (id) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('op', 'trip_summary');
      fd.append('trip_id', String(id));

      const res = await fetch(`${apiHost}/trips.php`, { method: 'POST', body: fd });
      const json = await res.json();

      console.log(json)

      if (json.status === 'success' && json.data) {
        setSummary(json.data);
      } else {
        console.error(json.message || 'Respuesta no exitosa.');
        setSummary(null);
      }
    } catch (e) {
      console.error('Error cargando trip_summary:', e);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tripId) fetchSummary(tripId);
  }, [tripId]);

  const totals = useMemo(() => {
    if (!summary) return { invoice: 0, diesel: 0, expenses: 0, driverPay: 0, total: 0 };

    const inv = Number(summary?.totales?.rate || 0);
    const diesel = Number(summary?.diesel?.total_monto || 0);
    const expenses = Number(summary?.expenses?.total_monto || 0);

    const driver = Number(summary?.driver_payments?.total_monto || 0);

    const total = inv - diesel - expenses - driver;
    return { invoice: inv, diesel, expenses, driverPay: driver, total };
  }, [summary]);

 const generatePDF = async () => {
  const elementsToHide = document.querySelectorAll('.no-print');
  elementsToHide.forEach(el => el.style.display = 'none');

  const element = printRef.current;
  const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
  const imgData = canvas.toDataURL('image/jpeg', 1.0);

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const margin = { top: 5, right: 8, bottom: 0, left: 8 };

  const imgW = pageW - margin.left - margin.right;
  const imgH = (imgW / canvas.width) * canvas.height;

  pdf.addImage(imgData, 'JPEG', margin.left, margin.top, imgW, imgH);

  pdf.output('dataurlnewwindow', {
    filename: `Resumen_Viaje_${summary?.trip?.trip_number || 'NA'}.pdf`
  });

  elementsToHide.forEach(el => el.style.display = '');
};

  if (loading || !summary) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
        <Typography ml={2}>Cargando resumen del viaje...</Typography>
      </Box>
    );
  }

  const header = summary.trip || {};
  const stages = Array.isArray(summary.stages) ? summary.stages : [];
  const dieselItems = Array.isArray(summary.diesel?.items) ? summary.diesel.items : [];
  const expenseItems = Array.isArray(summary.expenses?.items) ? summary.expenses.items : [];
  const statusColor = getStatusColor(header.status);

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, m: 2, borderRadius: 3, border: '1px solid #e2e8f0', bgcolor: '#fff' }}>
      <Box sx={{ mb: 2 }} className="no-print">
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          color="inherit"
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 1.5, borderColor: '#cbd5e1', color: '#334155' }}
        >
          Volver a TripAdmin
        </Button>
      </Box>

      <div ref={printRef}>
        {/* ENCABEZADO */}
        <Box sx={{
          p: 2.5, borderRadius: 2, border: '1px solid #e2e8f0', bgcolor: '#f8fafc',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 1
        }}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="#0f172a" sx={{ lineHeight: 1.2 }}>
              {header.trip_number || '—'}
            </Typography>
            <Typography variant="body2" color="#64748b">{header.nombre || 'Sin nombre de viaje'}</Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              label={fmtDate(header.creation_date)}
              size="small"
              sx={{ bgcolor: '#fff', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}
            />
            <Chip
              label={header.status || '—'}
              size="small"
              sx={{ bgcolor: `${statusColor}1a`, color: statusColor, fontWeight: 700, border: `1px solid ${statusColor}55` }}
            />
          </Stack>
        </Box>

        {/* ETAPAS */}
        <SectionTitle color="#2563eb">Detalles de Etapas y Documentos</SectionTitle>
        <Grid container spacing={2}>
          {stages.map((s) => {
            const isEmpty = String(s.stageType || '').toLowerCase() === 'emptymileage';
            const title = `E${s.stage_number || '—'} (${stageTypeLabel(s.stageType)})`;
            const subtitle = s.origin && s.destination
              ? `${s.origin} → ${s.destination}${s.travel_direction ? ` (${s.travel_direction})` : ''}`
              : s.travel_direction ? `(${s.travel_direction})` : '';
            const pickupText = (s.loading_date || s.delivery_date || s.time_of_delivery)
              ? `Carga: ${fmtDateOnly(s.loading_date)} • Entrega: ${fmtDateOnly(s.delivery_date)}${fmtTime(s.time_of_delivery) ? ` - ${fmtTime(s.time_of_delivery)} hrs` : ''}`
              : '';
            const directionColor = s.travel_direction === 'Going Up' ? '#16a34a' : (s.travel_direction === 'Going Down' ? '#d97706' : '#cbd5e1');

            return (
              <Grid key={s.trip_stage_id} item xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%', borderRadius: 2, borderColor: '#e2e8f0', borderLeft: `3px solid ${directionColor}` }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" fontWeight={800} color="#0f172a">{title}</Typography>
                    {subtitle && <Typography variant="body2" color="#64748b" sx={{ mb: 1.2 }}>{subtitle}</Typography>}

                    {!isEmpty && (
                      <Box sx={{ bgcolor: '#f1f5f9', borderRadius: 1.5, p: 1.4, mb: 1.2 }}>
                        <Stack spacing={0.4}>
                          <Typography variant="caption" sx={{ fontSize: '0.72rem', color: '#334155' }}><strong>Compañía:</strong> {s.nombre_compania || '—'}</Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.72rem', color: '#334155' }}><strong>Bodega Origen:</strong> {s.warehouse_origin_name || '—'}</Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.72rem', color: '#334155' }}><strong>Bodega Destino:</strong> {s.warehouse_destination_name || '—'}</Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.72rem', color: '#334155' }}><strong>Millas:</strong> {s.millas_pcmiller ?? s.millas_pcmiller_practicas ?? '—'}</Typography>
                        </Stack>
                      </Box>
                    )}

                    {s.ci_number && <Typography variant="caption" color="#94a3b8" sx={{ display: 'block', mb: 0.5 }}>CI: {s.ci_number}</Typography>}
                    {pickupText && <Typography variant="caption" color="#94a3b8" sx={{ display: 'block', mb: 1 }}>{pickupText}</Typography>}

                    {!isEmpty ? (
                      <Box sx={{ display: 'inline-block', bgcolor: '#f0fdf4', border: '1px solid #16a34a33', borderRadius: 1, px: 1.2, py: 0.5 }}>
                        <Typography variant="body2" fontWeight={800} color="#16a34a" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                          Rate: {money(s.rate_tarifa || 0, 'USD')}
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ bgcolor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 1.5, p: 1.2 }}>
                        <Typography variant="subtitle2" fontWeight={700} color="#1d4ed8">{title}</Typography>
                        <Typography variant="body2" color="#1e3a8a">Millas PC*Miler: {s.millas_pcmiller ?? '—'}</Typography>
                        <Typography variant="body2" color="#1e3a8a">Millas Prácticas: {s.millas_pcmiller_practicas ?? '—'}</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* DIESEL */}
        <SectionTitle color="#d97706">Diesel</SectionTitle>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', borderColor: '#e2e8f0' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>No</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Trip number</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Odómetro</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Galones</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'right' }}>Monto</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Driver</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dieselItems.map((r, idx) => (
                <TableRow key={`${r.fecha}-${idx}`} hover>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{header.trip_number || '—'}</TableCell>
                  <TableCell>{fmtDate(r.fecha)}</TableCell>
                  <TableCell>{r.odometro || '—'}</TableCell>
                  <TableCell>{Number(r.galones ?? 0).toFixed(2)} gal</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{money(r.monto || 0, 'USD')}</TableCell>
                  <TableCell>{r.nombre || '—'}</TableCell>
                </TableRow>
              ))}
              {dieselItems.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3, color: '#94a3b8', fontStyle: 'italic' }}>Sin registros</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* GASTOS VIAJE */}
        <SectionTitle color="#dc2626">Gastos viaje</SectionTitle>
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', borderColor: '#e2e8f0' }}>
          <Table size="small">
            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>No</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Trip number</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Fecha</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Tipo de gasto</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569', textAlign: 'right' }}>Monto</TableCell>
                <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Driver</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expenseItems.map((r, idx) => (
                <TableRow key={`${r.fecha}-${idx}`} hover>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{header.trip_number || '—'}</TableCell>
                  <TableCell>{fmtDate(r.fecha)}</TableCell>
                  <TableCell>{r.tipo_gasto || '—'}</TableCell>
                  <TableCell sx={{ textAlign: 'right', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{money(r.monto || 0, 'USD')}</TableCell>
                  <TableCell>{r.nombre || '—'}</TableCell>
                </TableRow>
              ))}
              {expenseItems.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 3, color: '#94a3b8', fontStyle: 'italic' }}>Sin registros</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* TRIP SUMMARY */}
        <SectionTitle color="#0f172a">Trip Summary</SectionTitle>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: '#e2e8f0' }}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ ...summaryRowSx, fontWeight: 700, width: 360, color: '#0f172a' }}>
                  Total invoice (suma de los rates de las etapas del viaje)
                </TableCell>
                <TableCell sx={{ ...summaryRowSx, fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                  {money(totals.invoice, 'USD')}
                </TableCell>
                <TableCell sx={{ ...summaryRowSx, color: '#94a3b8', fontStyle: 'italic', fontSize: '0.75rem' }}>
                  Dato de la Base de datos (totales.rate)
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell sx={{ ...summaryRowSx, fontWeight: 700, color: '#0f172a' }}>Diesel (suma de las cargas de diesel del viaje)</TableCell>
                <TableCell sx={{ ...summaryRowSx, fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{money(totals.diesel, 'USD')}</TableCell>
                <TableCell sx={{ ...summaryRowSx, color: '#94a3b8', fontStyle: 'italic', fontSize: '0.75rem' }}>Dato de la Base de datos</TableCell>
              </TableRow>

              <TableRow>
                <TableCell sx={{ ...summaryRowSx, fontWeight: 700, color: '#0f172a' }}>Driver Pay (Pagos Autorizados)</TableCell>
                <TableCell sx={{ ...summaryRowSx, fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>{money(totals.driverPay, 'USD')}</TableCell>
                <TableCell sx={{ ...summaryRowSx, color: '#94a3b8', fontStyle: 'italic', fontSize: '0.75rem' }}>Dato de la Base de datos</TableCell>
              </TableRow>

              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#0f172a', border: 'none', py: 1.2 }}>Expenses (suma de los gastos misc del viaje)</TableCell>
                <TableCell sx={{ fontWeight: 800, color: '#0f172a', border: 'none', py: 1.2, fontVariantNumeric: 'tabular-nums' }}>{money(totals.expenses, 'USD')}</TableCell>
                <TableCell sx={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.75rem', border: 'none', py: 1.2 }}>Dato de la Base de datos</TableCell>
              </TableRow>

              {/* <TableRow sx={{ bgcolor: '#f1f8e9' }}>
                 <TableCell sx={{ fontWeight: 700 }}>Utilidad Estimada</TableCell>
                 <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem' }}>{money(totals.total, 'USD')}</TableCell>
                 <TableCell>Calculado</TableCell>
              </TableRow> */}

            </TableBody>
          </Table>
        </Paper>
      </div>

      <Box sx={{ mt: 3, pb: 1, display: 'flex', justifyContent: 'flex-end' }} className="no-print">
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={generatePDF}
          sx={{ bgcolor: '#0f172a', fontWeight: 700, borderRadius: 1.5, textTransform: 'none', px: 3, '&:hover': { bgcolor: '#1e293b' } }}
        >
          Descargar PDF
        </Button>
      </Box>
    </Paper>
  );
}
