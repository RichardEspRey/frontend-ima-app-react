import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, CircularProgress, 
  Stack, TextField, Chip, IconButton, Grid, Tooltip
} from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import OpacityIcon from '@mui/icons-material/Opacity';
import { useNavigate } from "react-router-dom";

import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import {
  Paginacion, CampoFecha, notify, PageHeader, PAGE_SHELL_SX, CARD_SX, SECTION_LABEL_SX, HEADER_ROW_SX,
  HEADER_CELL_SX, TABLE_CONTAINER_SX, CELL_STRONG_SX, CELL_MUTED_SX, GHOST_BTN_SX, ICON_BTN_SX,
  CHIP_SX, CHIP_DANGER_SX,
} from '../../shared/ui';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const apiHost = import.meta.env.VITE_API_HOST;

const numberFmt = (n) => new Intl.NumberFormat('en-US').format(Number(n).toFixed(0));

const NUMERO_SX = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };

const CHIP_NEUTRO_SX = { ...CHIP_SX, bgcolor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' };

/**
 * Historial de afinaciones ya registradas.
 *
 * @returns {object} La pantalla.
 */
export default function AfinacionesHistorialPage() {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [truckFilter, setTruckFilter] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('op', 'get_history');
      const res = await fetch(`${apiHost}/afinaciones.php`, { method: 'POST', body: fd });
      const json = await res.json();

      if (json.status === 'success') {
        setHistory(json.data);
      } else {
        setHistory([]);
      }
    } catch (err) {
      console.error("Error cargando historial:", err);
      notify.error('No se pudo cargar el historial', 'Error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filteredData = useMemo(() => {
    return history.filter(reg => {
        const matchTruck = truckFilter === '' || String(reg.unidad || '').toLowerCase().includes(truckFilter.toLowerCase());

        let regDate = null;
        if (reg.fecha_registro) regDate = dayjs(reg.fecha_registro);
        
        const start = startDate ? dayjs(startDate).startOf('day') : null;
        const end = endDate ? dayjs(endDate).endOf('day') : null;

        const matchDate = (!start || (regDate && regDate.isSameOrAfter(start))) && 
                          (!end || (regDate && regDate.isSameOrBefore(end)));

        return matchTruck && matchDate;
    });
  }, [history, truckFilter, startDate, endDate]);

  const handleClearFilters = () => {
      setTruckFilter('');
      setStartDate(null);
      setEndDate(null);
      setPage(0);
  };

  return (
    <Box sx={PAGE_SHELL_SX}>
      <PageHeader
        seccion="Mantenimiento · Afinaciones"
        titulo="Historial de Afinaciones"
        descripcion="Cada reinicio de contador con las millas al corte y el aceite restante."
        acciones={
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={GHOST_BTN_SX}>
            Volver
          </Button>
        }
      />

      <Paper elevation={0} sx={{ ...CARD_SX, mb: 3 }}>
        <Typography variant="overline" sx={SECTION_LABEL_SX}>Filtros de Búsqueda</Typography>
        <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 3 }}>
                <TextField 
                    label="Buscar Camión" 
                    size="small" 
                    fullWidth 
                    value={truckFilter}
                    onChange={(e) => { setTruckFilter(e.target.value); setPage(0); }}
                    placeholder="Ej: 101"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <CampoFecha
                        value={startDate}
                        onChange={(date) => { setStartDate(date); setPage(0); }} 
                        customInput={<TextField size="small" fullWidth label="Desde" />}
                    />
                    <CampoFecha
                        value={endDate}
                        onChange={(date) => { setEndDate(date); setPage(0); }} 
                        customInput={<TextField size="small" fullWidth label="Hasta" />}
                    />
                </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }} display="flex" justifyContent="flex-end">
                <Tooltip title="Limpiar filtros">
                    <IconButton onClick={handleClearFilters} sx={{ ...ICON_BTN_SX, borderRadius: 2 }}>
                        <DeleteSweepIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Grid>
        </Grid>
      </Paper>

      <Box>
        <TableContainer component={Paper} elevation={0} sx={{ ...TABLE_CONTAINER_SX, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={HEADER_ROW_SX}>
                        <TableCell sx={HEADER_CELL_SX}>Fecha de registro</TableCell>
                        <TableCell sx={HEADER_CELL_SX}>Camión</TableCell>
                        <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Millas al corte</TableCell>
                        <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Aceite restante</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow><TableCell colSpan={4} align="center" sx={{ py: 6 }}><CircularProgress size={24} /></TableCell></TableRow>
                    ) : filteredData.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                <Typography variant="body2" color="text.secondary">No se encontraron registros con estos filtros.</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        filteredData
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((reg) => (
                                <TableRow key={reg.id_afinacion} hover>
                                    <TableCell sx={{ ...CELL_MUTED_SX, ...NUMERO_SX }}>
                                        {dayjs(reg.fecha_registro).format('DD/MM/YYYY hh:mm A')}
                                    </TableCell>
                                    <TableCell sx={CELL_STRONG_SX}>{reg.unidad}</TableCell>
                                    <TableCell align="right" sx={{ ...CELL_STRONG_SX, ...NUMERO_SX }}>
                                        {numberFmt(reg.millas_acumuladas)} mi
                                    </TableCell>
                                    <TableCell align="right">
                                        <Chip
                                            icon={<OpacityIcon style={{ fontSize: 14 }} />}
                                            label={`${reg.porcentaje_aceite}%`}
                                            size="small"
                                            sx={Number(reg.porcentaje_aceite) < 20 ? CHIP_DANGER_SX : CHIP_NEUTRO_SX}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                    )}
                </TableBody>
            </Table>
        </TableContainer>
        <Paginacion
            pagina={page}
            porPagina={rowsPerPage}
            total={filteredData.length}
            onPagina={setPage}
            onPorPagina={(cuantas) => { setRowsPerPage(cuantas); setPage(0); }}
        />
      </Box>

    </Box>
  );
}