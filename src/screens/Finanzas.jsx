import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, TextField, Box, Typography, CircularProgress,
  Select, MenuItem, InputAdornment, IconButton, Collapse, Button, Chip, Stack, Divider, Tooltip, Badge
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import SaveIcon from '@mui/icons-material/Save';
import Swal from 'sweetalert2';

import { PAYMENT_METHODS, STATUS_OPTIONS } from '../constants/finances';
import { StageDetailRow } from '../components/StageDetailRow'; 
import { AlertSummaryCards } from '../components/AlertSummaryCards';

const apiHost = import.meta.env.VITE_API_HOST;

/* === Helpers === */
const money = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, currencyDisplay: 'symbol' })
    .format(Number(v || 0));


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

// =========================================================================
// LÓGICA DE RESUMEN DE ESTATUS DEL VIAJE 
// =========================================================================
const getTripStatusSummary = (stages) => {
    if (!stages || stages.length === 0) {
        return { value: 3, label: 'Completado', color: STATUS_OPTIONS[3].color }; 
    }
    
    const normalizedStages = stages.map(s => ({
        ...s, 
        status: s.status != null ? Number(s.status) : 0 
    }));

    // El Naranja (1) se comporta como Rojo (0) para el estatus general.
    const hasCriticalStatus = normalizedStages.some(s => s.status === 0 || s.status === 1);
    
    if (hasCriticalStatus) {
        const redStatus = STATUS_OPTIONS.find(o => o.value === 0); // Usamos la meta del Rojo (0)
        return { 
            value: 0, 
            label: redStatus.label, // "Pendiente de cobrar"
            color: redStatus.color 
        };
    }

    // PRIORIDAD MEDIA (AMARILLO): Si no hay Rojos/Naranjas, pero hay Amarillos (2)
    const hasYellowStatus = normalizedStages.some(s => s.status === 2);
    
    if (hasYellowStatus) {
        const yellowStatus = STATUS_OPTIONS.find(o => o.value === 2);
        return { value: 2, label: yellowStatus.label, color: yellowStatus.color };
    }
    
    // PRIORIDAD MÍNIMA (VERDE): Si llegamos aquí, todos son 3 (Pagada)
    const completedStatus = STATUS_OPTIONS.find(o => o.value === 3);
    return { value: 3, label: completedStatus.label, color: completedStatus.color };
};

// =========================================================================
// FUNCIÓN DE CONTADOR DE ESTATUS CRÍTICOS (0, 1, 2)
// =========================================================================
const countCriticalStages = (stages) => {
    if (!stages || stages.length === 0) return { 0: 0, 1: 0, 2: 0 };

    const counts = stages.reduce((acc, s) => {
        const status = Number(s.status); 
        // 0 (Rojo), 1 (Naranja), 2 (Amarillo)
        if (status === 0 || status === 1 || status === 2) {
            acc[status] = (acc[status] || 0) + 1;
        }
        return acc;
    }, { 0: 0, 1: 0, 2: 0 }); // Inicializamos los contadores de los 3 estados críticos

    return counts;
};


const Finanzas = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openMap, setOpenMap] = useState({});
  const [saving, setSaving] = useState(false);

  // ** LÓGICA DE FETCH **
  const toFormBody = useCallback((obj) =>
    Object.entries(obj)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v ?? '')}`)
      .join('&'), []);

  const fetchFinanzas = useCallback(async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('op', 'All_finanzas');

      const res = await fetch(`${apiHost}/formularios.php`, { method: 'POST', body: fd });
      const json = await res.json();

      if (json.status === 'success' && Array.isArray(json.data)) {
        // Normaliza
        const norm = json.data.map(t => {
            // Normalización de etapas
            const stages = Array.isArray(t.stages) ? t.stages
            .filter(s => String(s.stageType ?? '').toLowerCase() !== 'emptymileage')
            .map(s => ({
              trip_stage_id: Number(s.trip_stage_id),
              trip_id: Number(t.trip_id),
              stage_number: Number(s.stage_number ?? 0),
              origin: s.origin ?? '',
              destination: s.destination ?? '',
              rate_tarifa: s.rate_tarifa != null ? Number(s.rate_tarifa) : null,
              payment_method: (s.metodo_pago ?? '').trim(),
              paid_rate: s.tarifa_pagada != null ? String(Number(String(s.tarifa_pagada).replace(',', '.'))) : '',
              status: s.status != null ? Number(s.status) : 0, 
              moneda: s.moneda ?? 'USD', 
              _dirty: false, 
            })) : [];

            // CALCULAR EL ESTATUS RESUMIDO
            const summaryStatus = getTripStatusSummary(stages);

            return ({
              trip_id: Number(t.trip_id),
              trip_number: t.trip_number ?? '',
              stages_count: Number(t.stages_count ?? 0),
              total_tarifa: Number(t.total_tarifa ?? 0),
              total_pagada: Number(t.total_pagada ?? 0),
              status_trip: summaryStatus.value, // USAMOS EL VALOR RESUMIDO
              status_label: summaryStatus.label,
              stages: stages,
            });
        });

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
  }, [apiHost, toFormBody]);

  useEffect(() => { fetchFinanzas(); }, [fetchFinanzas]);

  // Filtro por trip_number
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return trips;
    return trips.filter(t => (t.trip_number || '').toLowerCase().includes(q));
  }, [trips, search]);

  const pageTrips = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const globalAlertCounts = useMemo(() => {
    const totals = { 0: 0, 1: 0, 2: 0 };
    trips.forEach(trip => {
      trip.stages.forEach(s => {
        const status = Number(s.status);
        if (totals[status] !== undefined) {
            totals[status]++;
        }
      });
    });
    return totals;
  }, [trips]);

  // Toggle colapsable por trip
  const toggleOpen = (trip_id) => {
    setOpenMap(prev => ({ ...prev, [trip_id]: !prev[trip_id] }));
  };

  // Cambios locales por stage (marca _dirty=true)
  const handleStageFieldChange = (trip_id, trip_stage_id, field, value) => {
    setTrips(prev => prev.map(t => {
      if (t.trip_id !== trip_id) return t;
      return {
        ...t,
        stages: t.stages.map(s => (
          s.trip_stage_id === trip_stage_id ? { ...s, [field]: value, _dirty: true } : s
        )),
      };
    }));
  };

  // === Utilidades para guardado general (RESTAURADAS) ===
  const validateStage = (stage) => {
    const errs = [];
    const metodo = (stage.payment_method ?? '').trim();
    const tarifaStr = String(stage.paid_rate ?? '').trim();
    const tarifaNum = Number(tarifaStr.replace(',', '.')); 

    if (!metodo) errs.push('Método de pago vacío');
    if (tarifaStr === '' || Number.isNaN(tarifaNum)) {
      errs.push('Tarifa pagada inválida');
    } else if (tarifaNum <= 0) {
      errs.push('Tarifa pagada debe ser > 0');
    }
    if (stage.status === '' || stage.status === null || Number.isNaN(Number(stage.status))) {
      errs.push('Status no seleccionado o inválido');
    }
    return errs;
  };

  const buildPayloadItem = (stage) => {
    const tarifaStr = String(stage.paid_rate ?? '').trim();
    const tarifaNum = Number(tarifaStr.replace(',', '.'));
    
    return {
      id: String(stage.trip_stage_id),
      metodo: (stage.payment_method ?? '').trim(),
      tarifa: Number.isFinite(tarifaNum) ? tarifaNum.toFixed(2) : '0.00',
      status: String(Number(stage.status)),
    };
  };

  const collectDirtyStages = () => {
    const dirty = [];
    for (const t of trips) {
      for (const s of t.stages) {
        if (s._dirty) dirty.push({ tripId: t.trip_id, stage: s });
      }
    }
    return dirty;
  };

  const dirtyCount = useMemo(() => collectDirtyStages().length, [trips]);

  const saveAll = async () => {
    const dirty = collectDirtyStages();
    if (dirty.length === 0) {
      await Swal.fire({ icon: 'info', title: 'Sin cambios', text: 'No hay filas modificadas por guardar.' });
      return;
    }

    // Validación masiva
    const invalids = [];
    for (const { stage } of dirty) {
      const errs = validateStage(stage);
      if (errs.length) invalids.push({ stage, errs });
    }

    if (invalids.length) {
      const html = invalids.slice(0, 10).map(({ stage, errs }) =>
        `<li><b>Stage ${stage.trip_stage_id}</b>: <ul>${errs.map(e => `<li>${e}</li>`).join('')}</ul></li>`
      ).join('');
      await Swal.fire({
        icon: 'warning',
        title: 'Revisa los datos',
        html: `<p>Hay ${invalids.length} filas con errores:</p><ul style="text-align:left">${html}${invalids.length > 10 ? '<li>...</li>' : ''}</ul>`,
      });
      return;
    }

    const confirm = await Swal.fire({
      icon: 'question',
      title: 'Confirmar guardado',
      text: `Se guardarán ${dirty.length} cambio(s).`,
      showCancelButton: true,
      confirmButtonText: 'Guardar todo',
      cancelButtonText: 'Cancelar',
    });
    if (!confirm.isConfirmed) return;

    setSaving(true);
    Swal.fire({ title: 'Guardando…', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    const controller = new AbortController();
    const tmo = setTimeout(() => controller.abort(), 30000); // 30s

    try {
      // Arreglo para API
      const items = dirty.map(({ stage }) => buildPayloadItem(stage));

      const fd = new FormData();
      fd.append('op', 'I_pago_stage_bulk');
      fd.append('items', JSON.stringify(items)); 

      const res = await fetch(`${apiHost}/formularios.php`, {
        method: 'POST',
        body: fd,
        signal: controller.signal,
      });

      clearTimeout(tmo);
      const json = await res.json();
      Swal.close();
      setSaving(false);

      if (json.status === 'success') {
        await Swal.fire({
          icon: 'success',
          title: 'Cambios guardados',
          text: `Se actualizaron ${dirty.length} fila(s).`,
          timer: 1600,
          showConfirmButton: false,
        });
        // Refrescar los datos para obtener los totales actualizados y limpiar _dirty
        await fetchFinanzas(); 
      } else {
        await Swal.fire({
          icon: 'error',
          title: 'Error al guardar',
          text: json.message || 'Ocurrió un error inesperado.',
        });
      }
    } catch (e) {
      clearTimeout(tmo);
      Swal.close();
      setSaving(false);

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
    <Paper sx={{ m: 2, p: 3 }}>
      {/* Título y Botón de Guardado */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1" fontWeight={700}>Administrador de Finanzas</Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            size="small"
            label="Buscar Trip number"
            placeholder="Trip number"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />

          <Tooltip title={dirtyCount ? `Hay ${dirtyCount} cambios por guardar` : 'No hay cambios'}>
            <span>
              <Badge badgeContent={dirtyCount} color="primary">
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saving || dirtyCount === 0}
                  onClick={saveAll}
                >
                  Guardar cambios
                </Button>
              </Badge>
            </span>
          </Tooltip>
        </Stack>
      </Box>

      {/* Tarjetas de Resumen de Alertas */}
      {!loading && (
          <AlertSummaryCards globalCounts={globalAlertCounts} />
      )}

      {/* Tabla Principal */}
      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              {/* Encabezados de Tabla Principal con fontWeight 600 */}
              <TableCell sx={{ fontWeight: 600 }}>Trip number</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Stages</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Total Rate</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Total Pagado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              {/* 🚨 NUEVA CABECERA: Alertas/Contadores */}
              <TableCell sx={{ fontWeight: 600, textAlign: 'center', width: '120px' }}>Alertas</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center"> {/* Colspan 7 (6 columnas + 1 de expansión) */}
                  <Box sx={{ py: 4, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress size={24} />
                    <Typography>Cargando…</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : pageTrips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center"> {/* Colspan 7 */}
                  <Typography color="text.secondary" sx={{ py: 3 }}>Sin registros.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              pageTrips.map((t) => {
                const isOpen = !!openMap[t.trip_id];
                // 🚨 CALCULAR CONTADORES DE ALERTAS
                const criticalCounts = countCriticalStages(t.stages);

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
                      <TableCell sx={{ fontWeight: 500 }}>{t.trip_number}</TableCell>

                      {/* Stages */}
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip size="small" label={`${t.stages_count}`} sx={{ fontWeight: 600 }} />
                          <Typography variant="body2" color="text.secondary">etapas</Typography>
                        </Stack>
                      </TableCell>

                      {/* Total Rate */}
                      <TableCell align="right">{money(t.total_tarifa)}</TableCell>

                      {/* Total Pagado */}
                      <TableCell align="right">{money(t.total_pagada ?? 0)}</TableCell>

                      {/* Status trip (Resumido) */}
                      <TableCell>
                        <StatusChip value={t.status_trip} />
                      </TableCell>
                      
                      {/* 🚨 NUEVA COLUMNA: CONTADORES DE ALERTAS 🚨 */}
                      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                        <Stack direction="row" spacing={1} justifyContent="center">
                            
                            {/* ROJO (Status 0: Pendiente de cobrar) */}
                            {criticalCounts[0] > 0 && (
                                <Tooltip title={`${criticalCounts[0]} pendiente(s) de cobrar (ROJO)`}>
                                    <Badge
                                        badgeContent={criticalCounts[0]}
                                        sx={{ '& .MuiBadge-badge': { bgcolor: STATUS_OPTIONS.find(o => o.value === 0).color, color: 'white', minWidth: '18px', height: '18px' } }}
                                    >
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: STATUS_OPTIONS.find(o => o.value === 0).color }} />
                                    </Badge>
                                </Tooltip>
                            )}

                            {/* NARANJA (Status 1: Cobrada, pendiente de pago) */}
                            {criticalCounts[1] > 0 && (
                                <Tooltip title={`${criticalCounts[1]} pendiente(s) de pago (NARANJA)`}>
                                    <Badge
                                        badgeContent={criticalCounts[1]}
                                        sx={{ '& .MuiBadge-badge': { bgcolor: STATUS_OPTIONS.find(o => o.value === 1).color, color: 'white', minWidth: '18px', height: '18px' } }}
                                    >
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: STATUS_OPTIONS.find(o => o.value === 1).color }} />
                                    </Badge>
                                </Tooltip>
                            )}

                            {/* AMARILLO (Status 2: Cobrada, pendiente RTS) */}
                            {criticalCounts[2] > 0 && (
                                <Tooltip title={`${criticalCounts[2]} pendiente(s) RTS (AMARILLO)`}>
                                    <Badge
                                        badgeContent={criticalCounts[2]}
                                        // Texto negro en amarillo para mejor contraste
                                        sx={{ '& .MuiBadge-badge': { bgcolor: STATUS_OPTIONS.find(o => o.value === 2).color, color: 'black', minWidth: '18px', height: '18px' } }}
                                    >
                                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: STATUS_OPTIONS.find(o => o.value === 2).color }} />
                                    </Badge>
                                </Tooltip>
                            )}

                        </Stack>
                      </TableCell>
                    </TableRow>

                    {/* Fila colapsable con etapas */}
                    <TableRow>
                      <TableCell colSpan={7} sx={{ p: 0, borderBottom: isOpen ? '1px solid rgba(224,224,224,1)' : 0 }}> {/* 🚨 Colspan ajustado a 7 */}
                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 2 }}>
                            <Typography variant="h6" fontWeight={700} gutterBottom>Stages</Typography>
                            <Divider sx={{ mb: 1 }} />
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ fontWeight: 600 }}>ID Stage</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Origen</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Destino</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Tarifa (rate)</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Método de pago</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Tarifa pagada</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {t.stages.map(s => (
                                  <StageDetailRow 
                                    key={s.trip_stage_id}
                                    trip_id={t.trip_id}
                                    stage={s} 
                                    handleStageFieldChange={handleStageFieldChange}
                                  />
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