import React, { useEffect, useMemo, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, TextField, Box, Typography, CircularProgress,
  Select, MenuItem, InputAdornment, IconButton, Collapse, Button, Chip, Stack, Divider
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Swal from 'sweetalert2';


const apiHost = import.meta.env.VITE_API_HOST;

/* === Helpers === */
const money = (v, c = 'MXN') =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: c })
    .format(Number(v || 0));

const PAYMENT_METHODS = ['RTS', 'CHEQUE', 'TRIUM PAY', 'DEPOSITO'];

/** Mapa de status para etiqueta/colores (ajústalo a tus valores reales) */
const STATUS_OPTIONS = [
  { value: 3, label: 'Pagada', color: '#2e7d32' }, // verde
  { value: 2, label: 'Cobrada, pendiente RTS', color: '#fdd835' }, // amarillo
  { value: 1, label: 'Cobrada, pendiente de pago', color: '#fb8c00' }, // naranja
  { value: 0, label: 'Pendiente de cobrar', color: '#d32f2f' }, // rojo
  { value: null, label: 'Pendiente de cobrar', color: '#d32f2f' }, // rojo
];

const StatusChip = ({ value }) => {
  const meta = STATUS_OPTIONS.find(o => o.value === Number(value));
  if (!meta) return <Chip size="small" label="Desconocido" />;
  return (
    <Chip
      label={meta.label}
      size="small"
      sx={{ bgcolor: meta.color, color: ['#fdd835'].includes(meta.color) ? '#000' : '#fff', fontWeight: 600 }}
    />
  );
};

const Finanzas = () => {
  const [trips, setTrips] = useState([]);     // [{ trip_id, trip_number, stages_count, total_tarifa, stages: [...] }]
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openMap, setOpenMap] = useState({}); // { [trip_id]: boolean } para colapsables

  // Carga desde formularios.php con op=All_finanzas
  const fetchFinanzas = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('op', 'All_finanzas');

      const res = await fetch(`${apiHost}/formularios.php`, {
        method: 'POST',
        body: fd,
      });
      const json = await res.json();

      if (json.status === 'success' && Array.isArray(json.data)) {
        // Normaliza: asegura que stages tenga campos editables (si el backend aún no los manda)
        const norm = json.data.map(t => ({
          trip_id: Number(t.trip_id),
          trip_number: t.trip_number ?? '',
          stages_count: Number(t.stages_count ?? 0),
          total_tarifa: Number(t.total_tarifa ?? 0),
          total_pagada: Number(t.total_pagada ?? 0), 
          status_trip: t.status_trip != null ? Number(t.status_trip) : null, 
          stages: Array.isArray(t.stages) ? t.stages
            .filter(s => String(s.stageType ?? '').toLowerCase() !== 'emptymileage') // si ya filtras
            .map(s => ({
              trip_stage_id: Number(s.trip_stage_id),
              trip_id: Number(s.trip_id),
              stage_number: Number(s.stage_number ?? 0),
              origin: s.origin ?? '',
              destination: s.destination ?? '',
              rate_tarifa: s.rate_tarifa != null ? Number(s.rate_tarifa) : null,
              payment_method: (s.metodo_pago ?? '').trim(),
              paid_rate: s.tarifa_pagada != null ? String(Number(String(s.tarifa_pagada).replace(',', '.'))) : '',
              status: s.status != null ? Number(s.status) : '',
              moneda: s.moneda ?? 'MXN',
            })) : [],
        }));

        setTrips(norm);

      } else {
        console.error(json.message || 'Respuesta no exitosa.');
        setTrips([]);
      }
    } catch (e) {
      console.error('Error cargando finanzas:', e);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFinanzas(); }, []);

  // Filtro por trip_number
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return trips;
    return trips.filter(t => (t.trip_number || '').toLowerCase().includes(q));
  }, [trips, search]);

  const pageTrips = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  // Toggle colapsable por trip
  const toggleOpen = (trip_id) => {
    setOpenMap(prev => ({ ...prev, [trip_id]: !prev[trip_id] }));
  };

  // Cambios locales por stage
  const handleStageFieldChange = (trip_id, trip_stage_id, field, value) => {
    setTrips(prev => prev.map(t => {
      if (t.trip_id !== trip_id) return t;
      return {
        ...t,
        stages: t.stages.map(s => (
          s.trip_stage_id === trip_stage_id ? { ...s, [field]: value } : s
        )),
      };
    }));
  };

  // Guardado por stage (ajusta op y payload a tu backend real)
  const saveStage = async (trip_id, stage) => {
    const metodo = (stage.payment_method ?? '').trim();
    const tarifaStr = String(stage.paid_rate ?? '').trim();
    const statusVal = stage.status;

    const faltantes = [];

    if (!metodo) faltantes.push('Selecciona un método de pago');

    const tarifaNum = Number(tarifaStr);
    if (tarifaStr === '' || Number.isNaN(tarifaNum)) {
      faltantes.push('Captura una tarifa válida (número)');
    } else if (tarifaNum <= 0) {
      faltantes.push('La tarifa debe ser mayor a 0');
    }

    if (statusVal === '' || statusVal === null || Number.isNaN(Number(statusVal))) {
      faltantes.push('Selecciona un status');
    }

    if (faltantes.length) {
      await Swal.fire({
        icon: 'warning',
        title: 'Faltan datos',
        html: `<ul style="text-align:left;margin:0;padding-left:18px">${faltantes.map(f => `<li>${f}</li>`).join('')}</ul>`,
        confirmButtonText: 'Entendido',
      });
      return;
    }

    const confirm = await Swal.fire({
      icon: 'question',
      title: '¿Guardar cambios del stage?',
      text: `Stage #${stage.trip_stage_id}`,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;

    // Spinner (sin await)
    Swal.fire({
      title: 'Guardando…',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 20000); // 20s

    try {
      const fd = new FormData();
      fd.append('op', 'I_pago_stage');
      fd.append('id', String(stage.trip_stage_id));
      fd.append('metodo', metodo);
      fd.append('tarifa', tarifaNum.toFixed(2));
      fd.append('status', String(Number(statusVal)));

      const res = await fetch(`${apiHost}/formularios.php`, {
        method: 'POST',
        body: fd,
        // credentials: 'include', // descomenta si usas sesión/cookies
        signal: controller.signal,
      });

      clearTimeout(t);
      const json = await res.json();
      Swal.close();

      if (json.status === 'success') {

        await Swal.fire({
          icon: 'success',
          title: 'Cambios guardados',
          text: 'Stage actualizado correctamente.',
          timer: 1500,
          showConfirmButton: false,
        });
        await fetchFinanzas();
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error al guardar',
          text: json.message || 'Ocurrió un error inesperado.',
        });
      }
    } catch (e) {
      clearTimeout(t);
      Swal.close();
      console.error('Error al guardar stage:', e);
      await Swal.fire({
        icon: 'error',
        title: e.name === 'AbortError' ? 'Tiempo de espera agotado' : 'Error de red',
        text: e.name === 'AbortError'
          ? 'El servidor tardó demasiado en responder.'
          : 'No se pudo contactar el servidor.',
      });
    }
  };



  return (
    <Paper sx={{ m: 2, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Finanzas</Typography>
        <TextField
          size="small"
          placeholder="Buscar por Trip number"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        />
      </Box>

      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Trip number</TableCell>
              <TableCell>Stages</TableCell>
              <TableCell>Total Rate</TableCell>
              <TableCell>Total Pagado</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Box sx={{ py: 4, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress size={24} />
                    <Typography>Cargando…</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : pageTrips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>Sin registros.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              pageTrips.map((t) => {
                const isOpen = !!openMap[t.trip_id];
                return (
                  <React.Fragment key={t.trip_id}>
                    {/* Fila principal (trip) */}
                    <TableRow hover>
                      <TableCell width={48}>
                        <IconButton size="small" onClick={() => toggleOpen(t.trip_id)}>
                          {isOpen ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                      </TableCell>

                      {/* Trip number */}
                      <TableCell>{t.trip_number}</TableCell>

                      {/* Stages */}
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip size="small" label={`${t.stages_count}`} />
                          <Typography variant="body2" color="text.secondary">etapas</Typography>
                        </Stack>
                      </TableCell>

                      {/* Total Rate */}
                      <TableCell>{money(t.total_tarifa, 'USD')}</TableCell>

                      {/* Total Pagado (nuevo) */}
                      <TableCell>{money(t.total_pagada ?? 0, 'USD')}</TableCell>

                      {/* Status (nuevo) */}
                      <TableCell>
                        { <StatusChip value={t.status_trip} /> }
                      </TableCell>
                    </TableRow>


                    {/* Fila colapsable con etapas */}
                    <TableRow>
                      <TableCell colSpan={4} sx={{ p: 0, borderBottom: isOpen ? '1px solid rgba(224,224,224,1)' : 0 }}>
                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 2 }}>
                            <Typography variant="h6" gutterBottom>Stages</Typography>
                            <Divider sx={{ mb: 1 }} />
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>ID Stage</TableCell>
                                  <TableCell>#</TableCell>
                                  <TableCell>Origen</TableCell>
                                  <TableCell>Destino</TableCell>
                                  <TableCell>Tarifa (rate)</TableCell>
                                  <TableCell>Método de pago</TableCell>
                                  <TableCell>Tarifa pagada</TableCell>
                                  <TableCell>Status</TableCell>
                                  <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {t.stages.map(s => (
                                  <TableRow key={s.trip_stage_id} hover>
                                    <TableCell>{s.trip_stage_id}</TableCell>
                                    <TableCell>{s.stage_number}</TableCell>
                                    <TableCell>{s.origin || <em>-</em>}</TableCell>
                                    <TableCell>{s.destination || <em>-</em>}</TableCell>
                                    <TableCell>{s.rate_tarifa != null ? money(s.rate_tarifa, s.moneda || 'USD') : <em>-</em>}</TableCell>

                                    {/* Método de pago */}
                                    <TableCell sx={{ minWidth: 180 }}>
                                      <Select
                                        size="small"
                                        value={s.payment_method}
                                        onChange={(e) => handleStageFieldChange(t.trip_id, s.trip_stage_id, 'payment_method', e.target.value)}
                                        displayEmpty
                                        fullWidth
                                      >
                                        <MenuItem value=""><em>Seleccionar…</em></MenuItem>
                                        {PAYMENT_METHODS.map(opt => (
                                          <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                                        ))}
                                      </Select>
                                    </TableCell>

                                    {/* Tarifa pagada */}
                                    <TableCell sx={{ minWidth: 160 }}>
                                      <TextField
                                        size="small"
                                        value={s.paid_rate}
                                        onChange={(e) => {
                                          const clean =
                                            e.target.value === ''
                                              ? ''
                                              : e.target.value.replace(/[^\d.]/g, '');
                                          handleStageFieldChange(t.trip_id, s.trip_stage_id, 'paid_rate', clean);
                                        }}
                                        placeholder="0.00"
                                        inputProps={{ inputMode: 'decimal' }}
                                        fullWidth
                                        InputProps={{
                                          startAdornment: (
                                            <InputAdornment position="start">$</InputAdornment>
                                          ),
                                        }}
                                      />
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell sx={{ minWidth: 220 }}>
                                      <Select
                                        size="small"
                                        value={s.status}
                                        onChange={(e) => handleStageFieldChange(t.trip_id, s.trip_stage_id, 'status', Number(e.target.value))}
                                        displayEmpty
                                        fullWidth
                                        renderValue={(val) => {
                                          const opt = STATUS_OPTIONS.find(o => o.value === Number(val));
                                          return opt ? (
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: opt.color }} />
                                              {opt.label}
                                            </Box>
                                          ) : <em>Seleccionar status…</em>;
                                        }}
                                      >
                                        <MenuItem value="">
                                          <em>Seleccionar status…</em>
                                        </MenuItem>
                                        {STATUS_OPTIONS.map(opt => (
                                          <MenuItem key={opt.value} value={opt.value}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: opt.color }} />
                                              {opt.label}
                                            </Box>
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </TableCell>

                                    {/* Acciones */}
                                    <TableCell align="right">
                                      <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => saveStage(t.trip_id, s)}
                                      >
                                        Guardar
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filtered.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
      />
    </Paper>
  );
};

export default Finanzas;
