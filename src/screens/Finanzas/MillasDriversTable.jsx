import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Box, Typography, Button, InputAdornment, Stack,
  CircularProgress, Container
} from "@mui/material";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';

import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const MillasDriversTable = () => {
  const navigate = useNavigate();
  const apiHost = import.meta.env.VITE_API_HOST;

  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState([]);
  const [search, setSearch] = useState("");

  const fetchMillas = useCallback(async () => {
    try {
      const res = await fetch(`${apiHost}/formularios.php`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "op=get_millasDriver"
      });
      const json = await res.json();

      if (json.status === "success") {
        const formatted = json.data.map(d => ({
          driver_id: d.driver_id,
          name: d.nombre,
          rate: d.valor_milla ?? ""
        }));
        setRates(formatted);
      }
    } catch (err) {
      console.error("Error cargando millas:", err);
      Swal.fire("Error", "No se pudo cargar la lista de conductores", "error");
    } finally {
      setLoading(false);
    }
  }, [apiHost]);

  useEffect(() => {
    fetchMillas();
  }, [fetchMillas]);

  const handleChange = (driver_id, value) => {
    if (!/^\d*\.?\d*$/.test(value)) return;

    setRates(prev =>
      prev.map(r =>
        r.driver_id === driver_id ? { ...r, rate: value } : r
      )
    );
  };

  const handleSave = async () => {
    const payload = rates.map(r => ({
      driver_id: r.driver_id,
      valor_milla: Number(r.rate) || 0
    }));

    const fd = new FormData();
    fd.append("op", "I_update_millasDriverBulk");
    fd.append("items", JSON.stringify(payload));

    Swal.fire({ title: "Guardando...", allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    try {
      const res = await fetch(`${apiHost}/formularios.php`, {
        method: "POST",
        body: fd
      });
      const json = await res.json();

      if (json.status === "success") {
        Swal.fire({ icon: "success", title: "¡Guardado!", text: "Tarifas actualizadas correctamente.", timer: 1500, showConfirmButton: false });
      } else {
        Swal.fire("Error", json.message || "Error desconocido", "error");
      }
    } catch (err) {
      Swal.fire("Error", "No se pudo conectar al servidor.", "error");
    }
  };

  const filteredRates = useMemo(() => {
    if (!search) return rates;
    const q = search.toLowerCase();
    return rates.filter(r => r.name.toLowerCase().includes(q));
  }, [rates, search]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
          
          <Box>
            <Typography variant="h5" fontWeight={700} color="primary">
              Tarifas por Conductor
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Configura el pago por milla para cada operador activo.
            </Typography>
          </Box>

          <Stack direction="row" spacing={2} width={{ xs: '100%', md: 'auto' }}>
            <Button 
                variant="outlined" 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate(`/paymentDrivers`)}
            >
              Volver
            </Button>
            <Button 
                variant="contained" 
                color="primary" 
                startIcon={<SaveIcon />} 
                onClick={handleSave}
            >
              Guardar Cambios
            </Button>
          </Stack>

        </Stack>

        <Box sx={{ mt: 3 }}>
            <TextField
                fullWidth
                size="small"
                placeholder="Buscar conductor por nombre..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon color="action" />
                        </InputAdornment>
                    ),
                }}
                sx={{ maxWidth: 500 }}
            />
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, color: '#555', width: 80 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#555' }}>Nombre del Operador</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#555', width: 200 }} align="center">
                Tarifa ($/milla)
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredRates.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No se encontraron conductores.</Typography>
                    </TableCell>
                </TableRow>
            ) : (
                filteredRates.map((d, i) => (
                <TableRow key={d.driver_id} hover>
                    <TableCell>
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>
                            {i + 1}
                        </Typography>
                    </TableCell>
                    <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <PersonIcon color="action" />
                            <Typography variant="body1" fontWeight={500}>
                                {d.name}
                            </Typography>
                        </Stack>
                    </TableCell>

                    <TableCell align="center">
                        <TextField
                            size="small"
                            value={d.rate}
                            onChange={e => handleChange(d.driver_id, e.target.value)}
                            placeholder="0.00"
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><Typography fontSize={14} fontWeight={700}>$</Typography></InputAdornment>,
                            }}
                            sx={{ 
                                width: "140px",
                                '& input': { textAlign: 'right', fontWeight: 600 }
                            }}
                        />
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </Paper>
      
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
         <Button 
            variant="contained" 
            size="large"
            color="primary" 
            startIcon={<SaveIcon />} 
            onClick={handleSave}
            sx={{ px: 4, borderRadius: 3 }}
        >
            Guardar Todo
        </Button>
      </Box>

    </Container>
  );
};

export default MillasDriversTable;