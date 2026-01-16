import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, TextField, Box, Typography, CircularProgress, Chip, Button,
  Stack, Tooltip, IconButton, InputAdornment, Tabs, Tab
} from "@mui/material";

import VisibilityIcon from '@mui/icons-material/Visibility';
import PaidIcon from '@mui/icons-material/Paid';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SearchIcon from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';

const apiHost = import.meta.env.VITE_API_HOST;

const money = (v) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(v || 0));

const PaymentStatusChip = ({ value }) => {
  let label = "";
  let color = "default"; 

  switch (String(value)) {
    case "0":
      label = "Pendiente Autorización";
      color = "warning";
      break;
    case "1":
      label = "Pagado";
      color = "success";
      break;
    case "2":
      label = "Autorizado (Por Pagar)";
      color = "info";
      break;
    default:
      label = "Desconocido";
      color = "default";
  }

  return (
    <Chip
      label={label}
      size="small"
      color={color}
      variant={String(value) === "1" ? "filled" : "outlined"}
      sx={{ fontWeight: 600 }}
    />
  );
};

const StatusTrip = ({ value }) => {
  let label = value || "Desconocido";
  let color = "#bdbdbd";

  switch (String(value)) {
    case "Completed": color = "#2e7d32"; break;
    case "Almost Over": color = "#1976d2"; break;
    case "In Transit": color = "#ed6c02"; break;
    default: color = "#757575";
  }

  return (
    <Chip
      label={label}
      size="small"
      sx={{ bgcolor: color, color: "#fff", fontWeight: 600, fontSize: '0.75rem' }}
    />
  );
};

const PaymentDrivers = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Estado de Pestañas (0: Pendientes, 1: Pagados)
  const [tabValue, setTabValue] = useState(0);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("op", "All_paymentDrivers");

      const res = await fetch(`${apiHost}/formularios.php`, { method: "POST", body: fd });
      const json = await res.json();

      if (json.status === "success" && Array.isArray(json.data)) {
        const norm = json.data.map((t) => ({
          trip_id: Number(t.trip_id),
          trip_number: t.trip_number,
          nombre: t.nombre,
          stages_count: Number(t.stages_count ?? 0),
          total_tarifa: Number(t.total_tarifa ?? 0),
          total_millas_cortas: Number(t.total_millas_cortas ?? 0),
          status_payment: t.status_payment,
          Pago_driver: t.Pago_driver ? Number(t.Pago_driver) : 0,
          status_trip: t.status
        }));
        setTrips(norm);
      } else {
        setTrips([]);
      }
    } catch (err) {
      console.error("Error cargando pagos:", err);
      Swal.fire("Error", "No se pudo cargar la información.", "error");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    setPage(0);
  };

  const handleFinalizarPago = async (tripId) => {
    Swal.fire({
        title: '¿Finalizar Pago?',
        text: "Se marcará este viaje como PAGADO.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2e7d32',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, pagar',
        cancelButtonText: 'Cancelar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const fd = new FormData();
                fd.append("op", "update_ticket_pago");
                fd.append("trip_id", tripId);
          
                const res = await fetch(`${apiHost}/formularios.php`, { method: "POST", body: fd });
                const json = await res.json();
          
                if (json.status === "success") {
                  Swal.fire("Éxito", "Pago actualizado correctamente", "success");
                  fetchPayments(); 
                } else {
                  Swal.fire("Error", "No se pudo actualizar el pago", "error");
                }
              } catch (err) {
                Swal.fire("Error", "Error de conexión", "error");
              }
        }
    })
  };

  const filtered = useMemo(() => {
    let result = trips;

    // 1. Filtro por Pestaña
    if (tabValue === 0) {
        // Pendientes: Estatus diferente de "1" (Pagado) -> Muestra "0" y "2"
        result = result.filter(t => String(t.status_payment) !== "1");
    } else {
        // Pagados: Estatus igual a "1"
        result = result.filter(t => String(t.status_payment) === "1");
    }

    // 2. Filtro de Búsqueda
    const q = search.trim().toLowerCase();
    if (q) {
        result = result.filter((t) => (t.trip_number || "").toLowerCase().includes(q) || (t.nombre || "").toLowerCase().includes(q));
    }
    
    return result;
  }, [trips, search, tabValue]);

  const pageTrips = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ m: 2, p: 3, minHeight: '85vh' }}>
      
      {/* Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h4" fontWeight={800} color="text.primary">Pago a Operadores</Typography>
        <Typography variant="body2" color="text.secondary">Gestión de nómina y pagos de viajes</Typography>
      </Box>

      {/* Pestañas */}
      <Paper elevation={0} variant="outlined" sx={{ mb: 3, bgcolor: '#f8f9fa', borderRadius: 2, overflow: 'hidden' }}>
        <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            variant="fullWidth" 
            indicatorColor="primary" 
            textColor="primary"
        >
            <Tab icon={<PendingActionsIcon />} label="Pendientes de Pago" iconPosition="start" sx={{ fontWeight: 600, py: 3 }} />
            <Tab icon={<CheckCircleIcon />} label="Historial Pagados" iconPosition="start" sx={{ fontWeight: 600, py: 3 }} />
        </Tabs>
      </Paper>

      {/* Barra de Herramientas */}
      <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5', borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <TextField 
                size="small" 
                placeholder="Buscar Trip o Conductor..." 
                value={search} 
                onChange={(e) => { setSearch(e.target.value); setPage(0); }} 
                InputProps={{
                    startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                    ),
                    sx: { bgcolor: 'white' }
                }}
                sx={{ minWidth: 300, flexGrow: 1 }}
            />
            
            <Button 
                variant="outlined" 
                color="primary"
                startIcon={<AssignmentIndIcon />}
                onClick={() => navigate(`/millasDriversTable`)}
                sx={{ textTransform: 'none', fontWeight: 600, bgcolor: 'white' }}
            >
                Administrar Drivers
            </Button>
        </Box>
      </Paper>

      {/* Tabla de Resultados */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#fff' }}>Trip #</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#fff' }}>Conductor</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#fff', textAlign:'center' }}>Etapas</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#fff', textAlign:'right' }}>Millas</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#fff', textAlign:'right' }}>Monto Pago</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#fff' }}>Estatus Pago</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#fff' }}>Estatus Viaje</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#fff', textAlign:'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 10 }}>
                  <CircularProgress size={30} sx={{ mr: 2 }} />
                  <Typography component="span" variant="body2" color="text.secondary">Cargando datos...</Typography>
                </TableCell>
              </TableRow>
            ) : pageTrips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary" variant="body1">
                      {tabValue === 0 
                        ? "No hay pagos pendientes por procesar." 
                        : "No se encontraron pagos en el historial."}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pageTrips.map((t) => {
                const isAutorizado = String(t.status_payment) === "2";
                // const isPagado = String(t.status_payment) === "1";

                return (
                  <TableRow key={t.trip_id} hover>
                    <TableCell>
                        <Typography fontWeight={700} color="primary" variant="body2">#{t.trip_number}</Typography>
                    </TableCell>
                    <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <LocalShippingIcon fontSize="small" color="action" />
                            <Typography variant="body2" fontWeight={500}>{t.nombre}</Typography>
                        </Stack>
                    </TableCell>
                    <TableCell align="center">
                        <Chip label={t.stages_count} size="small" />
                    </TableCell>
                    <TableCell align="right">{t.total_millas_cortas}</TableCell>

                    <TableCell align="right">
                      <Typography fontWeight={700} color="success.main">
                          {t.Pago_driver ? money(t.Pago_driver) : "---"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <PaymentStatusChip value={t.status_payment} />
                    </TableCell>

                    <TableCell>
                      <StatusTrip value={t.status_trip} />
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="Ver Ticket">
                          <span>
                              <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => navigate(`/ticketPayment/${t.trip_id}`)}
                                  sx={{ border: '1px solid #e0e0e0' }}
                              >
                                  <VisibilityIcon fontSize="small" />
                              </IconButton>
                          </span>
                        </Tooltip>

                        {/* Solo mostramos el botón de pagar si estamos en la pestaña de pendientes y está autorizado */}
                        {tabValue === 0 && (
                            <Tooltip title={!isAutorizado ? "Requiere Autorización" : "Finalizar Pago"}>
                                <span>
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    disabled={!isAutorizado}
                                    onClick={() => handleFinalizarPago(t.trip_id)}
                                    startIcon={<PaidIcon />}
                                    sx={{ 
                                        textTransform: 'none', 
                                        px: 2, 
                                        py: 0.5, 
                                        minWidth: '90px',
                                        fontSize: '0.75rem',
                                        fontWeight: 600
                                    }}
                                >
                                    Pagar
                                </Button>
                                </span>
                            </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[25, 50, 100]}
        component="div"
        count={filtered.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Filas:"
      />
    </Paper>
  );
};

export default PaymentDrivers;