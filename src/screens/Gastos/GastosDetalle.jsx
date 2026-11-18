import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Button, Box, Typography, Stack, CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { ResumenRegistro } from '../../components/EditorRegistro';
import {
    PAGE_SHELL_SX, PAGE_OVERLINE_SX, PAGE_TITLE_SX, HEADER_ROW_SX, HEADER_CELL_SX, TABLE_CONTAINER_SX,
    CELL_STRONG_SX, CELL_SX, CELL_MUTED_SX, GHOST_BTN_SX,
} from '../../styles/estilosTabla';

const EDITAR_BTN_SX = { ...GHOST_BTN_SX, px: 1.5, py: 0.4, fontSize: '0.78rem' };

const apiHost = import.meta.env.VITE_API_HOST;

const money = (v) =>
  new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD', 
    minimumFractionDigits: 2, 
    currencyDisplay: 'symbol' 
  }).format(Number(v || 0));

const GastosDetalle = () => {
  const navigate = useNavigate();
  const { tripId } = useParams();
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGasto = useCallback(async () => {
    setLoading(true);
    try {
        const formDataToSend = new FormData();
        formDataToSend.append('op', 'get_registers_gasto');
        formDataToSend.append('trip_id', tripId);

        const response = await fetch(`${apiHost}/formularios.php`, {
            method: 'POST',
            body: formDataToSend
        });
        const data = await response.json();

        if (data.status === 'success') {
            const formatted = data.id.map(t => ({
                trip_number: t.trip_number,
                id: t.id,
                trip_id: t.trip_id,
                fecha: t.fecha,
                monto: t.monto,
                tipo: t.tipo_gasto,
                nombre: t.nombre
            }));
            setRegistros(formatted);
        }
    } catch (error) {
        console.error('Error al obtener gastos:', error);
    } finally {
        setLoading(false);
    }
  }, [tripId]);

  useEffect(() => { 
      fetchGasto(); 
  }, [fetchGasto]);

  const handleVer = (id, trip_id) => {
    navigate(`/editor-gastos/${id}/${trip_id}`);
  };

  const cancelar = () => {
    navigate(`/admin-gastos`);
  }

  if (loading) {
      return (
          <Box sx={{ ...PAGE_SHELL_SX, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size={28} />
          </Box>
      );
  }

  const total = registros.reduce((suma, row) => suma + Number(row.monto || 0), 0);

  return (
   <Box sx={PAGE_SHELL_SX}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="overline" sx={PAGE_OVERLINE_SX}>Gastos · Viajes</Typography>
            <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em" sx={PAGE_TITLE_SX}>
                Expense Details
            </Typography>
            <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                Gastos registrados en el viaje #{registros[0]?.trip_number || tripId}.
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={cancelar} sx={GHOST_BTN_SX}>
            Return
          </Button>
      </Stack>

      <ResumenRegistro
        datos={[
          { etiqueta: 'Viaje', valor: registros[0]?.trip_number || tripId },
          { etiqueta: 'Registros', valor: String(registros.length) },
          { etiqueta: 'Total', valor: money(total), destacado: true },
        ]}
      />

      <TableContainer component={Paper} elevation={0} sx={TABLE_CONTAINER_SX}>
        <Table sx={{ minWidth: 800 }} aria-label="expenses detail table" size="small">
          <TableHead>
            <TableRow sx={HEADER_ROW_SX}>
              <TableCell sx={HEADER_CELL_SX}>No.</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Trip</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Last update</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Expense Type</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Total ($)</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Driver</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registros.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography color="#94a3b8" variant="body2">No hay registros de gastos para este viaje.</Typography>
                    </TableCell>
                </TableRow>
            ) : (
                registros.map((row, idx) => (
                <TableRow key={row.id} hover>
                    <TableCell sx={CELL_MUTED_SX}>{idx + 1}</TableCell>
                    <TableCell sx={CELL_STRONG_SX}>{row.trip_number}</TableCell>
                    <TableCell sx={{ ...CELL_MUTED_SX, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{row.fecha}</TableCell>
                    <TableCell sx={CELL_SX}>{row.tipo}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: '#b91c1c', fontVariantNumeric: 'tabular-nums' }}>
                        {money(row.monto)}
                    </TableCell>
                    <TableCell sx={CELL_SX}>{row.nombre}</TableCell>
                    <TableCell align="center">
                        <Button variant="outlined" size="small" startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />} onClick={() => handleVer(row.id, row.trip_id)} sx={EDITAR_BTN_SX}>
                            Edit
                        </Button>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GastosDetalle;