import React, { useMemo } from 'react';
import {
  Box, Paper, Typography, Stack, Chip, Divider,
  Grid, Card, CardContent,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button
} from '@mui/material';

const money = (v, c = 'USD') =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: c }).format(Number(v || 0));

const dummy = {
  trip_id: 17025,
  trip_number: '170-25',
  driver: 'Sergio Marcos Cibrián Alvarez',
  status_trip: 3, // Completed
  created: '2025-09-27',
  delivery: 'Martes 30, 2025',
  mileage: 51812,
  stages: [
    {
      trip_stage_id: 1,
      title: 'E1 (Cruce)',
      subtitle: 'Nuevo Laredo, Tamps. → Oklahoma City, OK. (Going Up)',
      ci: '1041448',
      pickup: 'Carga: 27/09/25 • Entrega: 28/09/25 - 6:00 PM',
      company: 'FEMA USA',
      bodega_origen: 'FEMA NUEVO LAREDO',
      bodega_destino: 'FRANKLIN ELECTRIC CO., INC.',
      millas: 628.30,
      stageType: 'normalTrip',
      rate_tarifa: 3000.00,
    },
    {
      trip_stage_id: 2,
      title: 'E2 (Normal)',
      subtitle: 'Oklahoma City, OK. → San Antonio, TX. (Going Down)',
      ci: '529916223',
      pickup: 'Carga: 29/09/25 • Entrega: 30/09/25 - 4:30 PM',
      company: 'CHWR',
      bodega_origen: 'NESTLE PURINA',
      bodega_destino: 'HEB SAT SUPER REGIONAL DC',
      millas: 472.90,
      stageType: 'normalTrip',
      rate_tarifa: 1800.00,
    },
    {
      trip_stage_id: 3,
      title: 'E3: Etapa de Millaje Vacío',
      subtitle: '',
      stageType: 'emptyMileage',
      millas_pc_miler: 162.20,
      millas_practicas: 162.20,
      rate_tarifa: 0,
    }
  ],
  dieselLoads: [
    {
      n: 1,
      trip_number: '170-25',
      fecha: '2025-09-30 11:10:19',
      odometro: '1332067mi',
      galones: '71.52gal',
      monto: 214.48,
      driver: 'Sergio Marcos Cibrián Alvarez',
      estado: 'Aprobado',
      fleetone: 'OK'
    },
    {
      n: 2,
      trip_number: '170-25',
      fecha: '2025-09-30 11:11:55',
      odometro: '1332678mi',
      galones: '113.13gal',
      monto: 425.24,
      driver: 'Sergio Marcos Cibrián Alvarez',
      estado: 'Aprobado',
      fleetone: 'OK'
    }
  ],
  expenses: [
    {
      n: 1,
      trip_number: '170-25',
      fecha: '2025-10-04 10:45:39',
      tipo: 'Báscula',
      monto: 14.75,
      driver: 'Sergio Marcos Cibrián Alvarez'
    }
  ],
  driverPayManual: 0 // dato manual (puedes editar luego)
};

export default function ResumenTrip() {
  // Totales calculados
  const totals = useMemo(() => {
    const invoice = dummy.stages
      .filter(s => String(s.stageType).toLowerCase() !== 'emptymileage')
      .reduce((acc, s) => acc + Number(s.rate_tarifa || 0), 0);

    const diesel = dummy.dieselLoads.reduce((acc, r) => acc + Number(r.monto || 0), 0);
    const expenses = dummy.expenses.reduce((acc, r) => acc + Number(r.monto || 0), 0);
    const total = invoice - diesel - expenses - Number(dummy.driverPayManual || 0);

    return { invoice, diesel, expenses, total };
  }, []);

  const printResumen = () => {
    // por ahora simple window.print; más adelante podrías abrir una ruta /resumen/:trip
    window.print();
  };

  return (
    <Paper sx={{ p: 2, m: 2 }}>
      {/* Encabezado del trip */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>{dummy.trip_number}</Typography>
        <Typography color="text.secondary">{dummy.driver}</Typography>
        <Chip label={dummy.mileage} />
        <Chip color="success" label="Completed" />
        <Chip variant="outlined" label={dummy.delivery} />
        <Box flex={1} />
        <Stack direction="row" spacing={1}>
          <Button variant="outlined">VER</Button>
          <Button variant="outlined" disabled>ALMOST OVER</Button>
          <Button variant="contained" color="primary">FINALIZAR</Button>
        </Stack>
      </Stack>

      {/* Detalles de Etapas y Documentos */}
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
        Detalles de Etapas y Documentos
      </Typography>

      <Grid container spacing={2}>
        {dummy.stages.map((s) => (
          <Grid key={s.trip_stage_id} item xs={12} md={4}>
            <Card variant="outlined" sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700}>{s.title}</Typography>
                {s.subtitle && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {s.subtitle}
                  </Typography>
                )}

                {/* Bloque gris estilo "bocadillo" */}
                {s.stageType !== 'emptyMileage' ? (
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
                    <div><strong>Compañía:</strong> {s.company}</div>
                    <div><strong>Bodega Origen:</strong> {s.bodega_origen}</div>
                    <div><strong>Bodega Destino:</strong> {s.bodega_destino}</div>
                    <div><strong>Millas:</strong> {s.millas}</div>
                  </Box>
                ) : (
                  <></>
                )}

                {/* CI / fechas (si aplica) */}
                {s.ci && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    CI: {s.ci}
                  </Typography>
                )}
                {s.pickup && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {s.pickup}
                  </Typography>
                )}

                {/* Rate visible para cada etapa normal, y bloque azul para emptyMileage */}
                {String(s.stageType).toLowerCase() !== 'emptymileage' ? (
                  <Typography variant="body2" fontWeight={700}>
                    Rate: {money(s.rate_tarifa, 'USD')}
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
                    <Typography variant="subtitle2" fontWeight={700}>E3: Etapa de Millaje Vacío</Typography>
                    <Typography variant="body2">Millas PC*Miler: {s.millas_pc_miler}</Typography>
                    <Typography variant="body2">Millas Prácticas: {s.millas_practicas}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabla Diesel */}
      <Box sx={{ mt: 3 }}>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Trip number</TableCell>
                <TableCell>Fecha de modificación</TableCell>
                <TableCell>Odómetro al momento</TableCell>
                <TableCell>Galones</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fleetone</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dummy.dieselLoads.map((r) => (
                <TableRow key={r.n} hover>
                  <TableCell>{r.n}</TableCell>
                  <TableCell>{r.trip_number}</TableCell>
                  <TableCell>{r.fecha}</TableCell>
                  <TableCell>{r.odometro}</TableCell>
                  <TableCell>{r.galones}</TableCell>
                  <TableCell>{money(r.monto, 'USD')}</TableCell>
                  <TableCell>{r.driver}</TableCell>
                  <TableCell>{r.estado}</TableCell>
                  <TableCell>{r.fleetone}</TableCell>
                  <TableCell align="center">
                    <Button size="small">EDITAR</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Tabla Expenses */}
      <Box sx={{ mt: 3 }}>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>No</TableCell>
                <TableCell>Trip number</TableCell>
                <TableCell>Fecha de modificación</TableCell>
                <TableCell>Tipo de gasto</TableCell>
                <TableCell>Monto</TableCell>
                <TableCell>Driver</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {dummy.expenses.map((r) => (
                <TableRow key={r.n} hover>
                  <TableCell>{r.n}</TableCell>
                  <TableCell>{r.trip_number}</TableCell>
                  <TableCell>{r.fecha}</TableCell>
                  <TableCell>{r.tipo}</TableCell>
                  <TableCell>{money(r.monto, 'USD')}</TableCell>
                  <TableCell>{r.driver}</TableCell>
                  <TableCell align="center">
                    <Button size="small">EDITAR</Button>
                  </TableCell>
                </TableRow>
              ))}
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
                <TableCell sx={{ color: '#666' }}>Se tiene este dato (sumado de etapas)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>
                  Diesel (suma de las cargas de diesel del viaje)
                </TableCell>
                <TableCell>{money(totals.diesel, 'USD')}</TableCell>
                <TableCell sx={{ color: '#2e7d32' }}>Se tiene este dato</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: '#bf360c' }}>
                  Driver (dato manual)
                </TableCell>
                <TableCell>{money(dummy.driverPayManual, 'USD')}</TableCell>
                <TableCell sx={{ color: '#d32f2f' }}>No se tiene este dato en la app</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>
                  Expenses (suma de los gastos misc del viaje)
                </TableCell>
                <TableCell>{money(totals.expenses, 'USD')}</TableCell>
                <TableCell sx={{ color: '#2e7d32' }}>Se tiene este dato</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 900 }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 900 }}>{money(totals.total, 'USD')}</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </Box>

      {/* Resumen de viaje (tabla final) */}
      <Box sx={{ mt: 3 }}>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Viajes</TableCell>
                <TableCell>Total ($)</TableCell>
                <TableCell align="center">Botón de imprimir</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow hover>
                <TableCell>{dummy.trip_number}</TableCell>
                <TableCell>{money(totals.total, 'USD')}</TableCell>
                <TableCell align="center">
                  <Button variant="contained" onClick={printResumen}>Imprimir</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Línea fina al final */}
      <Divider sx={{ mt: 3 }} />
    </Paper>
  );
}
