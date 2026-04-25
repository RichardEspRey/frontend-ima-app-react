import React, { useEffect, useMemo, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, TextField, Box, Typography, CircularProgress, Button
} from '@mui/material';

const apiHost = import.meta.env.VITE_API_HOST;

/** $#,###.## sin prefijo de MX */
const money = (v) =>
  `$${Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ResiduosTrips = () => {
  const [rows, setRows] = useState([]);      // [{ trip_id, trip_number, status, creation_date, nombre, rate_tarifa, diesel, gastos }]
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchResiduoTrips = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('op', 'residuo_trip');               // <- trips.php
      const res = await fetch(`${apiHost}/trips.php`, {
        method: 'POST',
        body: fd,
      });
      const json = await res.json();

      if (json.status === 'success' && Array.isArray(json.data)) {
        // normaliza tipos y calcula utilidad
        const norm = json.data.map((t) => {
          const rate = Number(t.rate_tarifa ?? 0);
          const diesel = Number(t.diesel ?? 0);
          const gastos = Number(t.gastos ?? 0);
          return {
            trip_id: Number(t.trip_id),
            trip_number: t.trip_number ?? '',
            status: t.status ?? '',
            creation_date: t.creation_date ?? '',
            nombre: t.nombre ?? '',
            rate_tarifa: rate,
            diesel,
            gastos,
            utilidad: rate - (diesel + gastos),
          };
        });
        setRows(norm);
      } else {
        console.error(json.message || 'Respuesta no exitosa');
        setRows([]);
      }
    } catch (e) {
      console.error('Error cargando residuo_trip:', e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResiduoTrips(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r => (r.trip_number || '').toLowerCase().includes(q));
  }, [rows, search]);

  const pageRows = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ m: 2, p: 2 }}>
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Residuo Trips</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Buscar por Trip number"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          />
          <Button variant="outlined" onClick={fetchResiduoTrips}>Recargar</Button>
        </Box>
      </Box>

      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>Trip #</TableCell>
              <TableCell>Conductor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Creado</TableCell>
              <TableCell align="right">Rate</TableCell>
              <TableCell align="right">Diesel</TableCell>
              <TableCell align="right">Gastos</TableCell>
              <TableCell align="right">Utilidad</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Box sx={{ py: 4, display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
                    <CircularProgress size={24} />
                    <Typography>Cargando…</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>Sin registros.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((r) => (
                <TableRow key={r.trip_id} hover>
                  <TableCell>{r.trip_number}</TableCell>
                  <TableCell>{r.nombre}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell>{r.creation_date}</TableCell>
                  <TableCell align="right">{money(r.rate_tarifa)}</TableCell>
                  <TableCell align="right">{money(r.diesel)}</TableCell>
                  <TableCell align="right">{money(r.gastos)}</TableCell>
                  <TableCell align="right">{money(r.utilidad)}</TableCell>
                </TableRow>
              ))
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

export default ResiduosTrips;
