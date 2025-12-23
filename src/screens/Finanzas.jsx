import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, TextField, Box, Typography, CircularProgress, Button, Badge, Tooltip, Stack, MenuItem
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import FilterListIcon from '@mui/icons-material/FilterList';
import Swal from 'sweetalert2';

import { TripFinanceRow } from '../components/TripFinanceRow';
import { AlertSummaryCards } from '../components/AlertSummaryCards';
import { getTripStatusSummary, validateStage, buildPayloadItem, collectDirtyStages } from '../utils/financeHelpers';
import { STATUS_OPTIONS } from '../constants/finances'; // Importamos las opciones para el filtro

const apiHost = import.meta.env.VITE_API_HOST;

const Finanzas = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); 
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openMap, setOpenMap] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchFinanzas = useCallback(async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('op', 'All_finanzas');
      const res = await fetch(`${apiHost}/formularios.php`, { method: 'POST', body: fd });
      const json = await res.json();

      if (json.status === 'success' && Array.isArray(json.data)) {
        const norm = json.data.map(t => {
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

            const summary = getTripStatusSummary(stages);
            return {
              trip_id: Number(t.trip_id),
              trip_number: t.trip_number ?? '',
              stages_count: Number(t.stages_count ?? 0),
              total_tarifa: Number(t.total_tarifa ?? 0),
              total_pagada: Number(t.total_pagada ?? 0),
              status_trip: summary.value,
              status_label: summary.label,
              stages: stages,
            };
        });
        setTrips(norm);
      } else {
        setTrips([]);
      }
    } catch (e) {
      console.error('Error cargando finanzas:', e);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFinanzas(); }, [fetchFinanzas]);

  const filteredAndSorted = useMemo(() => {
    let result = [...trips];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(t => (t.trip_number || '').toLowerCase().includes(q));
    }

    if (statusFilter !== 'All') {
      result = result.filter(t => t.status_trip === Number(statusFilter));
    }

    result.sort((a, b) => {
      const statusA = a.status_trip ?? 0;
      const statusB = b.status_trip ?? 0;
      return statusA - statusB; 
    });

    return result;
  }, [trips, search, statusFilter]);

  const pageTrips = filteredAndSorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  
  const dirtyCount = useMemo(() => collectDirtyStages(trips).length, [trips]);

  const globalAlertCounts = useMemo(() => {
      const totals = { 0: { count: 0, totalAmount: 0 }, 1: { count: 0, totalAmount: 0 }, 2: { count: 0, totalAmount: 0 } };
      trips.forEach(trip => {
          trip.stages.forEach(s => {
              const st = Number(s.status);
              if (totals[st]) {
                  totals[st].count++;
                  totals[st].totalAmount += Number(s.rate_tarifa || 0);
              }
          });
      });
      return totals;
  }, [trips]);

  const toggleOpen = (trip_id) => setOpenMap(prev => ({ ...prev, [trip_id]: !prev[trip_id] }));

  const handleStageFieldChange = (trip_id, trip_stage_id, field, value) => {
    setTrips(prev => prev.map(t => {
      if (t.trip_id !== trip_id) return t;
      return {
        ...t,
        stages: t.stages.map(s => s.trip_stage_id === trip_stage_id ? { ...s, [field]: value, _dirty: true } : s),
      };
    }));
  };

  const saveAll = async () => {
    const dirty = collectDirtyStages(trips);
    if (dirty.length === 0) return Swal.fire({ icon: 'info', title: 'Sin cambios' });

    const invalids = dirty.filter(({ stage }) => validateStage(stage).length > 0)
                          .map(({ stage }) => ({ stage, errs: validateStage(stage) }));

    if (invalids.length) {
      const html = invalids.slice(0, 10).map(i => `<li>ID ${i.stage.trip_stage_id}: ${i.errs.join(', ')}</li>`).join('');
      return Swal.fire({ icon: 'warning', title: 'Revisa los datos', html: `<ul>${html}</ul>` });
    }

    const confirm = await Swal.fire({
      icon: 'question',
      title: 'Confirmar guardado',
      text: `Se guardarán ${dirty.length} cambio(s).`,
      showCancelButton: true,
      confirmButtonText: 'Guardar'
    });
    if (!confirm.isConfirmed) return;

    setSaving(true);
    Swal.fire({ title: 'Guardando...', didOpen: () => Swal.showLoading() });

    try {
      const fd = new FormData();
      fd.append('op', 'I_pago_stage_bulk');
      fd.append('items', JSON.stringify(dirty.map(({ stage }) => buildPayloadItem(stage))));

      const res = await fetch(`${apiHost}/formularios.php`, { method: 'POST', body: fd });
      const json = await res.json();
      
      if (json.status === 'success') {
        Swal.fire('Guardado', `Se actualizaron ${dirty.length} registros`, 'success');
        await fetchFinanzas();
      } else {
        throw new Error(json.message);
      }
    } catch (e) {
      Swal.fire('Error', e.message || 'Error de conexión', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ m: 2, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>Administrador de Finanzas</Typography>
        
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Filtro de Estatus */}
          <TextField
            select
            label="Filtrar por Estatus"
            size="small"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
            sx={{ minWidth: 220 }}
            InputProps={{
                startAdornment: <FilterListIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />,
            }}
          >
            <MenuItem value="All">Todos</MenuItem>
            {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: opt.color }} />
                        {opt.label}
                    </Box>
                </MenuItem>
            ))}
          </TextField>

          {/* Búsqueda por Trip */}
          <TextField 
            size="small" 
            label="Buscar Trip" 
            value={search} 
            onChange={(e) => { setSearch(e.target.value); setPage(0); }} 
          />

          {/* Botón Guardar */}
          <Tooltip title={dirtyCount ? `Guardar ${dirtyCount} cambios` : 'Sin cambios'}>
            <Badge badgeContent={dirtyCount} color="primary">
              <Button variant="contained" startIcon={<SaveIcon />} disabled={saving || !dirtyCount} onClick={saveAll}>
                Guardar
              </Button>
            </Badge>
          </Tooltip>
        </Stack>
      </Box>

      {!loading && <AlertSummaryCards globalCounts={globalAlertCounts} />}

      <TableContainer component={Paper} variant="outlined" sx={{ mt: 3 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell sx={{ fontWeight: 600 }}>Trip number</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Stages</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Total Rate</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Total Pagado</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Alertas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center"><CircularProgress sx={{ m: 2 }} /></TableCell></TableRow>
            ) : pageTrips.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center">Sin registros coinciden con los filtros.</TableCell></TableRow>
            ) : (
              pageTrips.map((t) => (
                <TripFinanceRow 
                  key={t.trip_id} 
                  trip={t} 
                  isOpen={!!openMap[t.trip_id]} 
                  onToggle={toggleOpen} 
                  onStageChange={handleStageFieldChange} 
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filteredAndSorted.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, p) => setPage(p)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
      />
    </Paper>
  );
};

export default Finanzas;