import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, TextField, Box, Typography, CircularProgress, Chip, Button,
  Stack, Tooltip, IconButton, InputAdornment, Tabs, Tab, Alert, MenuItem,
  ToggleButton, ToggleButtonGroup
} from "@mui/material";

import VisibilityIcon from '@mui/icons-material/Visibility';
import PaidIcon from '@mui/icons-material/Paid';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SearchIcon from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RouteIcon from '@mui/icons-material/Route';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import CatalogoTrayectos from '../../components/PagosMx/CatalogoTrayectos';
import { useAuthStore } from '../../store/useAuthStore';
import {
  PAIS, autorizarPagoPorTrayecto, obtenerDatosPagos, obtenerTrayectos, pesos, sugerirTrayecto
} from '../../services/pagosMx';

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
  
  const [tabValue, setTabValue] = useState(0);

  const usuario = useAuthStore(estado => estado.user);
  const [pais, setPais] = useState(PAIS.US);
  const [datosPagos, setDatosPagos] = useState({ viajes: new Map(), asignaciones: new Map() });
  const [trayectos, setTrayectos] = useState([]);
  const [errorTrayectos, setErrorTrayectos] = useState(null);
  const [elegidos, setElegidos] = useState({});
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);
  const [autorizando, setAutorizando] = useState(null);

  const cargarTrayectos = useCallback(async () => {
    try {
      const [datos, catalogo] = await Promise.all([obtenerDatosPagos(), obtenerTrayectos()]);
      setDatosPagos(datos);
      setTrayectos(catalogo);
      setErrorTrayectos(null);
    } catch (err) {
      setErrorTrayectos(err.message);
    }
  }, []);

  useEffect(() => {
    cargarTrayectos();
  }, [cargarTrayectos]);

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
              } catch (err) {
                Swal.fire("Error", "Error de conexión", "error");
              }
        }
    })
  };

  const conPais = useMemo(() => trips.map((t) => {
    const viaje = datosPagos.viajes.get(String(t.trip_id));
    return {
      ...t,
      nomenclatura: viaje?.nomenclatura || t.trip_number,
      pais: viaje?.pais || PAIS.US,
      recorrido: viaje?.recorrido || [],
      asignacion: datosPagos.asignaciones.get(`${t.trip_id}-${t.driver_id}`) || null,
    };
  }), [trips, datosPagos]);

  const conteoPais = useMemo(() => {
    const pendientes = conPais.filter((t) => (tabValue === 0 ? String(t.status_payment) !== "1" : String(t.status_payment) === "1"));
    return {
      [PAIS.US]: pendientes.filter((t) => t.pais === PAIS.US).length,
      [PAIS.MX]: pendientes.filter((t) => t.pais === PAIS.MX).length,
    };
  }, [conPais, tabValue]);

  const trayectoDe = (t) => {
    const clave = `${t.trip_id}-${t.driver_id}`;
    if (elegidos[clave] !== undefined) return trayectos.find((x) => x.id === elegidos[clave]) || null;
    if (t.asignacion) return trayectos.find((x) => x.id === t.asignacion.trayectoId) || null;
    return sugerirTrayecto(t.recorrido, trayectos);
  };

  const handleAutorizarTrayecto = async (t, trayecto) => {
    const confirmacion = await Swal.fire({
      title: '¿Autorizar pago?',
      html: `<p><b>${t.nomenclatura}</b> · ${t.nombre}</p><p>Trayecto: <b>${trayecto.nombre}</b></p><h3 style="color:#2e7d32">${pesos(trayecto.monto)}</h3>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2e7d32',
      confirmButtonText: 'Sí, autorizar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirmacion.isConfirmed) return;

    const clave = `${t.trip_id}-${t.driver_id}`;
    setAutorizando(clave);
    try {
      await autorizarPagoPorTrayecto({ tripId: t.trip_id, driverId: t.driver_id, trayecto, usuarioId: usuario?.id });
      setElegidos((prev) => {
        const siguiente = { ...prev };
        delete siguiente[clave];
        return siguiente;
      });
      await Promise.all([fetchPayments(), cargarTrayectos()]);
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setAutorizando(null);
    }
  };

  const esMx = pais === PAIS.MX;
  const columnas = esMx ? 9 : 8;

  const filtered = useMemo(() => {
    let result = conPais.filter((t) => t.pais === pais);

    if (tabValue === 0) {
        result = result.filter(t => String(t.status_payment) !== "1");
    } else {
        result = result.filter(t => String(t.status_payment) === "1");
    }

    const q = search.trim().toLowerCase();
    if (q) {
        result = result.filter((t) => (t.nomenclatura || "").toLowerCase().includes(q) || (t.nombre || "").toLowerCase().includes(q));
    }
    
    return result;
  }, [conPais, pais, search, tabValue]);

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
            
            <ToggleButtonGroup
                exclusive
                size="small"
                value={pais}
                onChange={(_e, valor) => { if (valor) { setPais(valor); setPage(0); } }}
                sx={{ bgcolor: 'white' }}
            >
                <ToggleButton value={PAIS.US} sx={{ px: 2.5, fontWeight: 700, textTransform: 'none' }}>
                    US · {conteoPais[PAIS.US]}
                </ToggleButton>
                <ToggleButton value={PAIS.MX} sx={{ px: 2.5, fontWeight: 700, textTransform: 'none' }}>
                    MX · {conteoPais[PAIS.MX]}
                </ToggleButton>
            </ToggleButtonGroup>

            {esMx && (
                <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<RouteIcon />}
                    onClick={() => setCatalogoAbierto(true)}
                    sx={{ textTransform: 'none', fontWeight: 600, bgcolor: 'white' }}
                >
                    Trayectos MX
                </Button>
            )}

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

      {errorTrayectos && (
        <Alert severity="warning" sx={{ mb: 2 }} action={<Button onClick={cargarTrayectos}>Reintentar</Button>}>
          No se pudo cargar la separación US / MX ni los trayectos: {errorTrayectos}
        </Alert>
      )}

      {esMx && tabValue === 0 && trayectos.some((x) => x.activo && x.monto <= 0) && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Hay trayectos sin monto: {trayectos.filter((x) => x.activo && x.monto <= 0).map((x) => x.nombre).join(', ')}. Asígnales uno en «Trayectos MX» para poder autorizar esos viajes.
        </Alert>
      )}

      {/* Tabla de Resultados */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#fff' }}>Trip #</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#fff' }}>Conductor</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#fff', textAlign:'center' }}>Etapas</TableCell>
              {esMx ? (
                <>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#fff' }}>Recorrido</TableCell>
                  <TableCell sx={{ fontWeight: 700, bgcolor: '#fff', minWidth: 190 }}>Trayecto</TableCell>
                </>
              ) : (
                <TableCell sx={{ fontWeight: 700, bgcolor: '#fff', textAlign:'right' }}>Millas</TableCell>
              )}
              <TableCell sx={{ fontWeight: 700, bgcolor: '#fff', textAlign:'right' }}>Monto Pago</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#fff' }}>Estatus Pago</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#fff' }}>Estatus Viaje</TableCell>
              <TableCell sx={{ fontWeight: 700, bgcolor: '#fff', textAlign:'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columnas} align="center" sx={{ py: 10 }}>
                  <CircularProgress size={30} sx={{ mr: 2 }} />
                  <Typography component="span" variant="body2" color="text.secondary">Cargando datos...</Typography>
                </TableCell>
              </TableRow>
            ) : pageTrips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnas} align="center" sx={{ py: 6 }}>
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
                const isPendiente = String(t.status_payment) === "0";
                const trayecto = esMx ? trayectoDe(t) : null;
                const sugerido = esMx && trayecto && elegidos[uniqueKey] === undefined && !t.asignacion;

                return (
                  <TableRow key={uniqueKey} hover>
                    <TableCell>
                        <Typography fontWeight={700} color="primary" variant="body2" sx={{ whiteSpace: "nowrap" }}>{t.nomenclatura}</Typography>
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
                    {esMx ? (
                      <>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {t.recorrido.length ? t.recorrido.join(' → ') : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {isPendiente ? (
                            <TextField
                              select
                              size="small"
                              fullWidth
                              value={trayecto?.id ?? ''}
                              onChange={(e) => setElegidos((prev) => ({ ...prev, [uniqueKey]: e.target.value }))}
                              helperText={sugerido ? 'Sugerido por el recorrido' : ' '}
                              SelectProps={{ displayEmpty: true }}
                              FormHelperTextProps={{ sx: { m: 0, mt: 0.25, fontSize: '0.68rem' } }}
                            >
                              <MenuItem value="" disabled>Elegir trayecto</MenuItem>
                              {trayectos.filter((x) => x.activo).map((x) => (
                                <MenuItem key={x.id} value={x.id}>
                                  {x.nombre} · {x.monto > 0 ? pesos(x.monto) : 'sin monto'}
                                </MenuItem>
                              ))}
                            </TextField>
                          ) : (
                            <Typography variant="body2" fontWeight={600}>
                              {t.asignacion?.trayecto || '—'}
                            </Typography>
                          )}
                        </TableCell>
                      </>
                    ) : (
                      <TableCell align="right">{t.total_millas_cortas}</TableCell>
                    )}

                    <TableCell align="right">
                      {esMx ? (
                        isPendiente ? (
                          <Typography fontWeight={700} color={trayecto?.monto > 0 ? "success.main" : "text.secondary"}>
                            {trayecto?.monto > 0 ? pesos(trayecto.monto) : "---"}
                          </Typography>
                        ) : t.asignacion ? (
                          <Typography fontWeight={700} color="success.main">{pesos(t.asignacion.monto)}</Typography>
                        ) : (
                          <Tooltip title="Pagado antes de los trayectos, por millas">
                            <Typography fontWeight={700} color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                              {t.Pago_driver ? `${money(t.Pago_driver)} USD` : "---"}
                            </Typography>
                          </Tooltip>
                        )
                      ) : (
                        <Typography fontWeight={700} color="success.main">
                            {t.Pago_driver ? money(t.Pago_driver) : "---"}
                        </Typography>
                      )}
                    </TableCell>

                    <TableCell>
                      <PaymentStatusChip value={t.status_payment} />
                    </TableCell>

                    <TableCell>
                      <StatusTrip value={t.status_trip} />
                    </TableCell>

                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {esMx && isPendiente && (
                          <Tooltip title={!trayecto ? "Elige el trayecto" : trayecto.monto <= 0 ? "El trayecto no tiene monto" : "Autorizar pago"}>
                            <span>
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                disabled={!trayecto || trayecto.monto <= 0 || autorizando === uniqueKey}
                                onClick={() => handleAutorizarTrayecto(t, trayecto)}
                                startIcon={autorizando === uniqueKey ? <CircularProgress size={14} /> : <TaskAltIcon />}
                                sx={{ textTransform: 'none', px: 2, py: 0.5, minWidth: '100px', fontSize: '0.75rem', fontWeight: 600 }}
                              >
                                Autorizar
                              </Button>
                            </span>
                          </Tooltip>
                        )}

                        {!esMx && (
                        <Tooltip title="Ver Ticket">
                          <span>
                              <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => navigate(`/ticketPayment/${t.trip_id}`, { state: { driver_id: t.driver_id } })}
                                  sx={{ border: '1px solid #e0e0e0' }}
                              >
                                  <VisibilityIcon fontSize="small" />
                              </IconButton>
                          </span>
                        </Tooltip>
                        )}

                        {tabValue === 0 && (!esMx || isAutorizado) && (
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

      <CatalogoTrayectos
        open={catalogoAbierto}
        onClose={() => setCatalogoAbierto(false)}
        trayectos={trayectos}
        onCambio={cargarTrayectos}
      />
    </Paper>
  );
};

export default PaymentDrivers;