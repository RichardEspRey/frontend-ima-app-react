import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Stack, Chip, Divider, CircularProgress,
  Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button,TextField, InputAdornment
} from '@mui/material';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useParams } from 'react-router-dom';

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

export default function ResumenTrip() {
  const { tripId } = useParams();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef();
  const [driverPayManual, setDriverPayManual] = useState('');
  // Carga desde tu API: trips.php con op=trip_summary
  const fetchSummary = async (id) => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('op', 'trip_summary');
      fd.append('trip_id', String(id));

      const res = await fetch(`${apiHost}/trips.php`, { method: 'POST', body: fd });
      const json = await res.json();

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
    if (!summary) return { invoice: 0, diesel: 0, expenses: 0, driverPayManual: 0, total: 0 };
    const inv = Number(summary?.totales?.rate || 0);
    const diesel = Number(summary?.diesel?.total_monto || 0);
    const expenses = Number(summary?.expenses?.total_monto || 0);
    const driver = Number(String(driverPayManual).replace(/[^\d.]/g, '') || 0);
    const total = inv - diesel - expenses - driver;
    return { invoice: inv, diesel, expenses, driverPayManual: driver, total };
  }, [summary, driverPayManual]);

 const generatePDF = async () => {
  const elementsToHide = document.querySelectorAll('.no-print');
  elementsToHide.forEach(el => el.style.display = 'none');

  const element = printRef.current;
  const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
  const imgData = canvas.toDataURL('image/jpeg', 1.0);

  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageW = pdf.internal.pageSize.getWidth();   // 210 mm en A4
  const pageH = pdf.internal.pageSize.getHeight();  // 297 mm en A4

  // Márgenes deseados (ajusta a gusto)
  const margin = { top: 5, right: 8, bottom: 0, left: 8 };

  // Escalamos la imagen al ancho disponible (página - márgenes laterales)
  const imgW = pageW - margin.left - margin.right;
  const imgH = (imgW / canvas.width) * canvas.height;

  // Dibuja la imagen con padding/margen izquierdo
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

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      {/* CONTENEDOR CAPTURABLE */}
      <div ref={printRef}>
        {/* Encabezado del trip */}
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>{header.trip_number || '—'}</Typography>
          <Typography color="text.secondary">{header.nombre || '—'}</Typography>
          {/* Puedes mostrar la fecha de creación como chip */}
          <Chip label={fmtDate(header.creation_date)} />
          {/* Mapea el status a un color simple */}
          <Chip color="warning" label={header.status || '—'} />
          <Box flex={1} />
        
        </Stack>

        {/* Detalles de Etapas */}
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
          Detalles de Etapas y Documentos
        </Typography>

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

            return (
              <Grid key={s.trip_stage_id} item xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>

                    {subtitle && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {subtitle}
                      </Typography>
                    )}

                    {/* Bloque gris para etapas normales */}
                    {!isEmpty && (
                      <Box
                        sx={{
                          bgcolor: '#666',
                          color: '#fff',
                          borderRadius: 1,
                          p: 1.2,
                          fontSize: 13,
                          mb: 1.2
                        }}
                      >
                        <div><strong>Compañía:</strong> {s.nombre_compania || '—'}</div>
                        <div><strong>Bodega Origen:</strong> {s.warehouse_origin_name || '—'}</div>
                        <div><strong>Bodega Destino:</strong> {s.warehouse_destination_name || '—'}</div>
                        <div><strong>Millas:</strong> {s.millas_pcmiller ?? s.millas_pcmiller_practicas ?? '—'}</div>
                      </Box>
                    )}

                    {/* CI / fechas */}
                    {s.ci_number && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        CI: {s.ci_number}
                      </Typography>
                    )}
                    {pickupText && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        {pickupText}
                      </Typography>
                    )}

                    {/* Rate o bloque azul para emptyMileage */}
                    {!isEmpty ? (
                      <Typography variant="body2" fontWeight={700}>
                        Rate: {money(s.rate_tarifa || 0, 'USD')}
                      </Typography>
                    ) : (
                      <Box
                        sx={{
                          bgcolor: '#e3f2fd',
                          border: '1px solid #90caf9',
                          borderRadius: 1,
                          p: 1,
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={700}>
                          {title}
                        </Typography>
                        <Typography variant="body2">Millas PC*Miler: {s.millas_pcmiller ?? '—'}</Typography>
                        <Typography variant="body2">Millas Prácticas: {s.millas_pcmiller_practicas ?? '—'}</Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Tabla Diesel */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5">Diesel</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>Trip number</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Odómetro</TableCell>
                  <TableCell>Galones</TableCell>
                  <TableCell>Monto</TableCell>
                  <TableCell>Driver</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dieselItems.map((r, idx) => (
                  <TableRow key={`${r.fecha}-${idx}`} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{header.trip_number || '—'}</TableCell>
                    <TableCell>{fmtDate(r.fecha)}</TableCell>
                    <TableCell>{r.odometro || '—'}</TableCell> {/* no viene odómetro en payload */}
                    <TableCell>{Number(r.galones ?? 0).toFixed(2)} gal</TableCell>
                    <TableCell>{money(r.fleetone || 0, 'USD')}</TableCell>
                    <TableCell>{r.nombre || '—'}</TableCell>

                  </TableRow>
                ))}
                {dieselItems.length === 0 && (
                  <TableRow><TableCell colSpan={10} align="center">Sin registros</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Tabla Expenses */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5">Gastos viaje</Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>No</TableCell>
                  <TableCell>Trip number</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Tipo de gasto</TableCell>
                  <TableCell>Monto</TableCell>
                  <TableCell>Driver</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {expenseItems.map((r, idx) => (
                  <TableRow key={`${r.fecha}-${idx}`} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>{header.trip_number || '—'}</TableCell>
                    <TableCell>{fmtDate(r.fecha)}</TableCell>
                    <TableCell>{r.tipo_gasto || '—'}</TableCell>
                    <TableCell>{money(r.monto || 0, 'USD')}</TableCell>
                    <TableCell>{r.nombre || '—'}</TableCell>

                  </TableRow>
                ))}
                {expenseItems.length === 0 && (
                  <TableRow><TableCell colSpan={7} align="center">Sin registros</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Trip summary */}
        <Box sx={{ mt: 3 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Trip summary</Typography>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 360 }}>
                    Total invoice (suma de los rates de las etapas del viaje)
                  </TableCell>
                  <TableCell>{money(totals.invoice, 'USD')}</TableCell>
                  <TableCell sx={{ color: '#666' }}>Dato de la Base de datos (totales.rate)</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Diesel (suma de las cargas de diesel del viaje)</TableCell>
                  <TableCell>{money(totals.diesel, 'USD')}</TableCell>
                  <TableCell sx={{ color: '#2e7d32' }}>Dato de la Base de datos</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, color: '#bf360c' }}>Driver (dato manual)</TableCell>
                  <TableCell sx={{ minWidth: 160 }}>
                    <TextField
                      size="small"
                      value={driverPayManual}
                      onChange={(e) => {
                        // Solo números y punto decimal
                        const raw = e.target.value.replace(/[^\d.]/g, '');
                        setDriverPayManual(raw);
                      }}
                      onBlur={(e) => {
                        // Normaliza a 2 decimales al salir
                        const n = Number(String(e.target.value).replace(/[^\d.]/g, '') || 0);
                        setDriverPayManual(Number.isFinite(n) ? n.toFixed(2) : '0.00');
                      }}
                      placeholder="0.00"
                      inputProps={{ inputMode: 'decimal' }}
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#d32f2f' }}>No obtenido</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Expenses (suma de los gastos misc del viaje)</TableCell>
                  <TableCell>{money(totals.expenses, 'USD')}</TableCell>
                  <TableCell sx={{ color: '#2e7d32' }}>Dato de la Base de datos</TableCell>
                </TableRow>
                <TableRow className="no-print">
                  <TableCell sx={{ fontWeight: 900 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 900 }}>{money(totals.total, 'USD')}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Box>

        {/* Resumen final */}
        <Box sx={{ mt: 3 }} >
          <TableContainer component={Paper} variant="outlined" >
            <Table size="small">
              <TableHead>
                <TableRow className="no-print">
                  <TableCell>Viajes</TableCell>
                  <TableCell>Total ($)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow hover className="no-print">
                  <TableCell>{header.trip_number || '—'}</TableCell>
                  <TableCell>{money(totals.total, 'USD')}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Divider sx={{ mt: 3 }} />
      </div>

      {/* Botón imprimir */}
      <Box sx={{ mt: 3, pb: 3, display: 'flex', justifyContent: 'flex-end', pr: 2 }} className="no-print">
        <Button variant="contained" color="secondary" onClick={generatePDF}>
          Descargar PDF
        </Button>
      </Box>
    </Paper>
  );
}
