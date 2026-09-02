import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, TextField, Box, Typography, Chip, Button,
  Stack, Tooltip, IconButton, InputAdornment
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
import { COLOR } from '../../shared/ui/tokens';
import { FilasEsqueleto, Pestanas, PageHeader, PAGE_SHELL_SX, TABLE_CONTAINER_SX, HEADER_ROW_SX, HEADER_CELL_SX, PAGINATION_BOX_SX, PAGINATION_SX, GHOST_BTN_SX } from '../../shared/ui';

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
  let color = COLOR.BORDE_FUERTE;

  switch (String(value)) {
    case "Completed": color = COLOR.EXITO; break;
    case "Almost Over": color = COLOR.INFO; break;
    case "In Transit": color = COLOR.AVISO; break;
    default: color = COLOR.APAGADO;
  }

  return (
    <Chip
      label={label}
      size="small"
      sx={{ bgcolor: color, color: COLOR.BLANCO, fontWeight: 600, fontSize: '0.75rem' }}
    />
  );
};

/**
 * Pagos pendientes a conductores por sus viajes.
 *
 * @returns {object} La pantalla.
 */
const PagosConductoresPage = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  const [tabValue, setTabValue] = useState(0);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("op", "All_paymentDrivers");

      const res = await fetch(`${apiHost}/formularios.php`, { method: "POST", body: fd });
      
      const json = await res.json();

      console.log(json)

      if (json.status === "success" && Array.isArray(json.data)) {
        const rawData = json.data.map((t) => ({
          trip_id: Number(t.trip_id),
          trip_number: t.trip_number,
          driver_id: Number(t.driver_id),
          nombre: t.nombre,
          stages_count: Number(t.stages_count ?? 0),
          total_tarifa: Number(t.total_tarifa ?? 0),
          total_millas_cortas: Number(t.total_millas_cortas ?? 0),
          status_payment: t.status_payment,
          Pago_driver: t.Pago_driver ? Number(t.Pago_driver) : 0,
          status_trip: t.status_txt
        }));
        
        const uniqueTripsMap = new Map();
        
        rawData.forEach(item => {
            const uniqueKey = `${item.trip_id}-${item.driver_id}`;
            if (!uniqueTripsMap.has(uniqueKey)) {
                uniqueTripsMap.set(uniqueKey, item);
            }
        });

        const uniqueNorm = Array.from(uniqueTripsMap.values());

        setTrips(uniqueNorm);

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

  const handleFinalizarPago = async (tripId, driverId) => {
    Swal.fire({
        title: '¿Finalizar Pago?',
        text: "Se marcará este viaje como PAGADO.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: COLOR.EXITO,
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
                  const fdPush = new FormData();
                  fdPush.append("op", "send_push");
                  fdPush.append("driver_id", driverId);
                  fdPush.append("title", "Ticket de pago");
                  fdPush.append("body", "Viaje.");

                  fetch(`http://localhost/API/Mobile.php`, { method: "POST", body: fdPush }).catch(() => {});

                  Swal.fire("Éxito", "Pago actualizado correctamente", "success");
                  fetchPayments();
                } else {
                  Swal.fire("Error", "No se pudo actualizar el pago", "error");
                }
              } catch {
                Swal.fire("Error", "Error de conexión", "error");
              }
        }
    })
  };

  const filtered = useMemo(() => {
    let result = trips;

    if (tabValue === 0) {
        result = result.filter(t => String(t.status_payment) !== "1");
    } else {
        result = result.filter(t => String(t.status_payment) === "1");
    }

    const q = search.trim().toLowerCase();
    if (q) {
        result = result.filter((t) => (t.trip_number || "").toLowerCase().includes(q) || (t.nombre || "").toLowerCase().includes(q));
    }
    
    return result;
  }, [trips, search, tabValue]);

  const pageTrips = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={PAGE_SHELL_SX}>
      <PageHeader
        seccion="Finanzas · Nómina"
        titulo="Pago a Operadores"
        descripcion="Gestión de nómina y pagos de viajes."
        acciones={
          <Button
            variant="outlined"
            startIcon={<AssignmentIndIcon />}
            onClick={() => navigate(`/millasDriversTable`)}
            sx={GHOST_BTN_SX}
          >
            Administrar Drivers
          </Button>
        }
      />

      <Pestanas
        valor={tabValue}
        onChange={(valor) => handleTabChange(null, valor)}
        pestanas={[
          { etiqueta: 'Pendientes de Pago', icono: <PendingActionsIcon fontSize="small" /> },
          { etiqueta: 'Historial Pagados', icono: <CheckCircleIcon fontSize="small" /> },
        ]}
      />

      <TextField
        size="small"
        placeholder="Buscar Trip o Conductor..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(0); }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" sx={{ color: COLOR.APAGADO }} />
            </InputAdornment>
          ),
          sx: { bgcolor: COLOR.BLANCO },
        }}
        sx={{ minWidth: 320, mb: 3 }}
      />

      {/* Tabla de Resultados */}
      <TableContainer component={Paper} elevation={0} sx={TABLE_CONTAINER_SX}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={HEADER_ROW_SX}>
              <TableCell sx={HEADER_CELL_SX}>Trip #</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Conductor</TableCell>
              <TableCell align="center" sx={HEADER_CELL_SX}>Etapas</TableCell>
              <TableCell align="right" sx={HEADER_CELL_SX}>Millas</TableCell>
              <TableCell align="right" sx={HEADER_CELL_SX}>Monto Pago</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Estatus Pago</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Estatus Viaje</TableCell>
              <TableCell align="center" sx={HEADER_CELL_SX}>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <FilasEsqueleto columnas={8} filas={Math.min(rowsPerPage, 10)} />
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

                const uniqueKey = `${t.trip_id}-${t.driver_id}`;

                return (
                  <TableRow key={uniqueKey} hover>
                    <TableCell>
                        <Typography fontWeight={700} color="primary" variant="body2">{t.trip_number}</Typography>
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
                                  onClick={() => navigate(`/ticketPayment/${t.trip_id}`, { state: { driver_id: t.driver_id } })}
                                  sx={{ border: `1px solid ${COLOR.BORDE}` }}
                              >
                                  <VisibilityIcon fontSize="small" />
                              </IconButton>
                          </span>
                        </Tooltip>

                        {tabValue === 0 && (
                            <Tooltip title={!isAutorizado ? "Requiere Autorización" : "Finalizar Pago"}>
                                <span>
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    disabled={!isAutorizado}
                                    onClick={() => handleFinalizarPago(t.trip_id, t.driver_id)}
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

      <Box sx={PAGINATION_BOX_SX}>
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
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          sx={PAGINATION_SX}
        />
      </Box>
    </Box>
  );
};

export default PagosConductoresPage;