import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, TextField, Box, Typography, CircularProgress, Button, Badge, 
  Tooltip, Stack, MenuItem, Tabs, Tab, Grid, Divider
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import FilterListIcon from '@mui/icons-material/FilterList';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import ReceiptIcon from '@mui/icons-material/Receipt'; 
import Swal from 'sweetalert2';

import { TripFinanceRow } from '../components/TripFinanceRow';
import { AlertSummaryCards } from '../components/AlertSummaryCards';
import { getTripStatusSummary, validateStage, buildPayloadItem, collectDirtyStages } from '../utils/financeHelpers';
import { STATUS_OPTIONS } from '../constants/finances'; 

const apiHost = import.meta.env.VITE_API_HOST;

const STATUS_PAID = 3;

const Finanzas = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); 
  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openMap, setOpenMap] = useState({});
  const [saving, setSaving] = useState(false);

  const [tabValue, setTabValue] = useState(0);

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
              invoice_number: s.invoice_number ?? '',
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  // --- LÓGICA DE FILTRADO ---
  const filteredAndSorted = useMemo(() => {
    let result = [...trips];

    if (tabValue === 0) {
        result = result.filter(t => t.status_trip !== STATUS_PAID);
    } else {
        result = result.filter(t => t.status_trip === STATUS_PAID);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(t => String(t.trip_number || '').toLowerCase() === q);
    }

    if (invoiceSearch.trim()) {
        const qInv = invoiceSearch.trim().toLowerCase();
        result = result.filter(t => 
            Array.isArray(t.stages) && t.stages.some(s => 
                String(s.invoice_number || '').toLowerCase().includes(qInv)
            )
        );
    }

    if (statusFilter !== 'All') {
      result = result.filter(t => t.status_trip === Number(statusFilter));
    }

    // Ordenamiento
    result.sort((a, b) => {
      const statusA = a.status_trip ?? 0;
      const statusB = b.status_trip ?? 0;
      return statusA - statusB; 
    });

    return result;
  }, [trips, search, invoiceSearch, statusFilter, tabValue]);

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
    <Paper sx={{ m: 2, p: 3, minHeight: '85vh' }}>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary">Administrador de Finanzas</Typography>
        <Typography variant="body2" color="text.secondary">Gestión de cobros y pagos de viajes</Typography>
      </Box>

      <Paper elevation={0} variant="outlined" sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
        <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth" 
            indicatorColor="primary"
            textColor="primary"
            sx={{ bgcolor: '#f8f9fa' }}
        >
            <Tab icon={<AccessTimeIcon />} label="Pendientes de Cobrar" iconPosition="start" sx={{ fontWeight: 600, py: 3 }} />
            <Tab icon={<CheckCircleIcon />} label="Pagados / Histórico" iconPosition="start" sx={{ fontWeight: 600, py: 3 }} />
        </Tabs>
      </Paper>

      {!loading && tabValue === 0 && (
        <Box sx={{ mb: 4 }}>
             <Typography variant="subtitle2" textTransform="uppercase" fontWeight={700} color="text.secondary" mb={2}>
                Resumen de Pendientes
             </Typography>
             <AlertSummaryCards globalCounts={globalAlertCounts} />
        </Box>
      )}

      <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5', borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Grid container spacing={2} alignItems="center">
            
            <Grid item xs={12} md={3}>
                <TextField 
                    fullWidth
                    size="small" 
                    label="Buscar Trip # (Exacto)"
                    placeholder="Ej. 101" 
                    value={search} 
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }} 
                    InputProps={{
                        startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                        sx: { bgcolor: 'white' }
                    }}
                />
            </Grid>

            <Grid item xs={12} md={3}>
                <TextField 
                    fullWidth
                    size="small" 
                    label="Buscar Invoice"
                    placeholder="Ej. INV-2023" 
                    value={invoiceSearch} 
                    onChange={(e) => { setInvoiceSearch(e.target.value); setPage(0); }} 
                    InputProps={{
                        startAdornment: <ReceiptIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                        sx: { bgcolor: 'white' }
                    }}
                />
            </Grid>

            <Grid item xs={12} md={3}>
                <TextField
                    select
                    fullWidth
                    size="small"
                    label="Filtrar por Estatus"
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                    InputProps={{
                        startAdornment: <FilterListIcon fontSize="small" sx={{ mr: 1, color: 'action.active' }} />,
                        sx: { bgcolor: 'white' }
                    }}
                >
                    <MenuItem value="All">Todos los estatus</MenuItem>
                    {STATUS_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: opt.color }} />
                                {opt.label}
                            </Box>
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>

            {/* Botón Guardar */}
            <Grid item xs={12} md={3} display="flex" justifyContent="flex-end">
                <Tooltip title={dirtyCount ? `Guardar ${dirtyCount} cambios` : 'No hay cambios pendientes'}>
                    <span>
                        <Badge badgeContent={dirtyCount} color="error" overlap="circular">
                        <Button 
                            variant="contained" 
                            startIcon={<SaveIcon />} 
                            disabled={saving || !dirtyCount} 
                            onClick={saveAll}
                            size="large"
                            sx={{ px: 4, fontWeight: 700, boxShadow: 2 }}
                        >
                            Guardar
                        </Button>
                        </Badge>
                    </span>
                </Tooltip>
            </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell width={50} sx={{ bgcolor: '#fff' }} />
              <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', bgcolor: '#fff' }}>Trip Number</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', bgcolor: '#fff' }}>Stages</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', bgcolor: '#fff', textAlign: 'right' }}>Total Rate</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', bgcolor: '#fff', textAlign: 'right' }}>Total Pagado</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', bgcolor: '#fff' }}>Estatus General</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.9rem', bgcolor: '#fff', textAlign: 'center' }}>Alertas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 10 }}><CircularProgress /></TableCell></TableRow>
            ) : pageTrips.length === 0 ? (
              <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary" variant="body1">
                        {tabValue === 0 
                            ? "¡Todo al día! No hay viajes pendientes de cobrar." 
                            : "No se encontraron viajes en el histórico."}
                    </Typography>
                  </TableCell>
              </TableRow>
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
        labelRowsPerPage="Filas:"
      />
    </Paper>
  );
};

export default Finanzas;