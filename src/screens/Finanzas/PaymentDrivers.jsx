import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, TextField, Box, Typography, CircularProgress, Chip, Button,
  Stack, Tooltip, IconButton, InputAdornment, Tabs, Tab, Alert, MenuItem
} from "@mui/material";

import VisibilityIcon from '@mui/icons-material/Visibility';
import PaidIcon from '@mui/icons-material/Paid';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SearchIcon from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RouteIcon from '@mui/icons-material/Route';
import TaskAltIcon from '@mui/icons-material/TaskAlt';

import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';
import CatalogoTrayectos from '../../components/PagosMx/CatalogoTrayectos';
import BotonActualizar from '../../components/BotonActualizar';
import { useAuthStore } from '../../store/useAuthStore';
import { paisesPermitidos } from '../../utils/pagos';
import {
  PAGE_SHELL_SX, PAGE_OVERLINE_SX, PAGE_TITLE_SX, TABS_WRAPPER_SX, TAB_SX, CARD_SX, SECTION_LABEL_SX,
  HEADER_ROW_SX, HEADER_CELL_SX, TABLE_CONTAINER_SX, PAGINATION_BOX_SX, PAGINATION_SX,
  CHIP_SX, CHIP_OK_SX, GHOST_BTN_SX, ICON_BTN_SX, CELL_STRONG_SX, CELL_SX, CELL_MUTED_SX,
} from '../../styles/estilosTabla';
import {
  PAIS, autorizarPagoPorTrayecto, crearTrayectosSinMonto, obtenerDatosPagos, obtenerTrayectos, pesos, sugerirTrayecto,
  trayectosPorCrear
} from '../../services/pagosMx';

const apiHost = import.meta.env.VITE_API_HOST;

const money = (v) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(v || 0));

const CHIP_AVISO_SX = { ...CHIP_SX, bgcolor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' };
const CHIP_INFO_SX = { ...CHIP_SX, bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' };
const CHIP_NEUTRO_SX = { ...CHIP_SX, bgcolor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' };

const ESTATUS_PAGO = {
  0: { label: 'Pendiente de autorización', sx: CHIP_AVISO_SX },
  1: { label: 'Pagado', sx: CHIP_OK_SX },
  2: { label: 'Autorizado · por pagar', sx: CHIP_INFO_SX },
};

const PaymentStatusChip = ({ value }) => {
  const estatus = ESTATUS_PAGO[String(value)] || { label: 'Desconocido', sx: CHIP_NEUTRO_SX };
  return <Chip label={estatus.label} size="small" sx={estatus.sx} />;
};

const ESTATUS_VIAJE = {
  Completed: CHIP_OK_SX,
  'Almost Over': CHIP_INFO_SX,
  'In Transit': CHIP_AVISO_SX,
};

const StatusTrip = ({ value }) => (
  <Chip label={value || 'Desconocido'} size="small" sx={ESTATUS_VIAJE[String(value)] || CHIP_NEUTRO_SX} />
);

const ACCION_BTN_SX = { textTransform: 'none', borderRadius: 2, px: 2, py: 0.5, minWidth: 96, fontSize: '0.75rem', fontWeight: 700, boxShadow: 'none' };

const PaymentDrivers = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  const [tabValue, setTabValue] = useState(0);

  const usuario = useAuthStore(estado => estado.user);
  const permisos = useAuthStore(estado => estado.userPermissions);
  const esAdmin = usuario?.tipo_usuario?.toLowerCase() === 'admin';
  const paises = useMemo(() => paisesPermitidos(permisos, esAdmin), [permisos, esAdmin]);
  const [paisElegido, setPais] = useState(PAIS.US);
  const pais = paises.includes(paisElegido) ? paisElegido : paises[0] || null;
  const [datosPagos, setDatosPagos] = useState({ viajes: new Map(), asignaciones: new Map() });
  const [trayectos, setTrayectos] = useState([]);
  const [errorTrayectos, setErrorTrayectos] = useState(null);
  const [trayectosListos, setTrayectosListos] = useState(false);
  const intentados = useRef(new Set());
  const [elegidos, setElegidos] = useState({});
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);
  const [autorizando, setAutorizando] = useState(null);

  const cargarTrayectos = useCallback(async () => {
    try {
      const [datos, catalogo] = await Promise.all([obtenerDatosPagos(), obtenerTrayectos()]);
      setDatosPagos(datos);
      setTrayectos(catalogo);
      setTrayectosListos(true);
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

  const handleFinalizarPago = async (tripId, driverId, nomenclatura) => {
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
                  fdPush.append("title", "Pago realizado");
                  fdPush.append("body", `Se registró el pago de tu viaje ${nomenclatura}.`);

                  fetch(`${apiHost}/Mobile.php`, { method: "POST", body: fdPush }).catch(() => {});

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
    const pendientes = conPais.filter((t) => String(t.status_payment) !== "1");
    return {
      [PAIS.US]: pendientes.filter((t) => t.pais === PAIS.US).length,
      [PAIS.MX]: pendientes.filter((t) => t.pais === PAIS.MX).length,
    };
  }, [conPais]);

  const conteoEstado = useMemo(() => {
    const delPais = conPais.filter((t) => t.pais === pais);
    const pagados = delPais.filter((t) => String(t.status_payment) === "1").length;
    return { pendientes: delPais.length - pagados, pagados };
  }, [conPais, pais]);

  const actualizar = () => Promise.all([fetchPayments(), cargarTrayectos()]);

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

  useEffect(() => {
    if (!esMx || loading || !trayectosListos) return;
    const sinTrayecto = conPais.filter((t) => t.pais === PAIS.MX && String(t.status_payment) === "0" && !t.asignacion);
    const nombres = trayectosPorCrear(sinTrayecto, trayectos).filter((nombre) => !intentados.current.has(nombre.toLowerCase()));
    if (nombres.length === 0) return;
    nombres.forEach((nombre) => intentados.current.add(nombre.toLowerCase()));
    crearTrayectosSinMonto(nombres).then((creados) => {
      if (creados.length > 0) cargarTrayectos();
    });
  }, [esMx, loading, trayectosListos, conPais, trayectos, cargarTrayectos]);
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

  if (!pais) {
    return (
      <Box sx={PAGE_SHELL_SX}>
        <Alert severity="info">
          No tienes permiso para ver los pagos de US ni de MX. Pídele a un administrador que te active la pestaña que te corresponde en el Gestor de accesos.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={PAGE_SHELL_SX}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="overline" sx={PAGE_OVERLINE_SX}>Finanzas · Pagos</Typography>
          <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em" sx={PAGE_TITLE_SX}>
            Pago a Operadores
          </Typography>
          <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
            Autorización y pago de viajes por operador, separados por país.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
          {esMx && (
            <Button variant="outlined" startIcon={<RouteIcon />} onClick={() => setCatalogoAbierto(true)} sx={GHOST_BTN_SX}>
              Trayectos MX
            </Button>
          )}
          <Button variant="outlined" startIcon={<AssignmentIndIcon />} onClick={() => navigate(`/millasDriversTable`)} sx={GHOST_BTN_SX}>
            Administrar Drivers
          </Button>
          <BotonActualizar onActualizar={actualizar} />
        </Stack>
      </Stack>

      <Stack direction="row" flexWrap="wrap" columnGap={2}>
        <Box sx={TABS_WRAPPER_SX}>
          <Tabs
            value={pais}
            onChange={(_e, valor) => { setPais(valor); setPage(0); }}
            TabIndicatorProps={{ sx: { display: 'none' } }}
            sx={{ minHeight: 0, '& .MuiTabs-flexContainer': { gap: 0.5 } }}
          >
            {paises.map((codigo) => (
              <Tab key={codigo} value={codigo} disableRipple sx={TAB_SX} label={`Viajes ${codigo} · ${conteoPais[codigo]}`} />
            ))}
          </Tabs>
        </Box>

        <Box sx={TABS_WRAPPER_SX}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            TabIndicatorProps={{ sx: { display: 'none' } }}
            sx={{ minHeight: 0, '& .MuiTabs-flexContainer': { gap: 0.5 } }}
          >
            <Tab disableRipple sx={TAB_SX} label={`Pendientes de pago · ${conteoEstado.pendientes}`} />
            <Tab disableRipple sx={TAB_SX} label={`Historial pagados · ${conteoEstado.pagados}`} />
          </Tabs>
        </Box>
      </Stack>

      <Paper elevation={0} sx={{ ...CARD_SX, mb: 3 }}>
        <Typography variant="overline" sx={SECTION_LABEL_SX}>Filtros de Búsqueda</Typography>
        <Box sx={{ mt: 1.5 }}>
          <TextField
            size="small"
            placeholder="Buscar por viaje u operador..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                  </InputAdornment>
                ),
                sx: { bgcolor: 'white', minWidth: 320 },
              },
            }}
          />
        </Box>
      </Paper>

      {errorTrayectos && (
        <Alert severity="warning" sx={{ mb: 2 }} action={<Button onClick={cargarTrayectos}>Reintentar</Button>}>
          No se pudo cargar la separación US / MX ni los trayectos: {errorTrayectos}
        </Alert>
      )}

      {esMx && tabValue === 0 && trayectos.some((x) => x.activo && x.monto <= 0) && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Hay trayectos sin monto: {trayectos.filter((x) => x.activo && x.monto <= 0).map((x) => x.nombre).join(', ')}. Ponles su monto en «Trayectos MX» para poder autorizar esos viajes.
        </Alert>
      )}

      {/* Tabla de Resultados */}
      <TableContainer component={Paper} elevation={0} sx={{ ...TABLE_CONTAINER_SX, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={HEADER_ROW_SX}>
              <TableCell sx={HEADER_CELL_SX}>Trip #</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Operador</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Etapas</TableCell>
              {esMx ? (
                <>
                  <TableCell sx={HEADER_CELL_SX}>Recorrido</TableCell>
                  <TableCell sx={{ ...HEADER_CELL_SX, minWidth: 190 }}>Trayecto</TableCell>
                </>
              ) : (
                <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Millas</TableCell>
              )}
              <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'right' }}>Monto Pago</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Estatus Pago</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Estatus Viaje</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columnas} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : pageTrips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnas} align="center" sx={{ py: 6 }}>
                  <Typography color="#94a3b8" variant="body2">
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
                        <Typography variant="body2" sx={{ ...CELL_STRONG_SX, whiteSpace: "nowrap" }}>{t.nomenclatura}</Typography>
                    </TableCell>
                    <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <LocalShippingIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
                            <Typography variant="body2" sx={CELL_SX}>{t.nombre}</Typography>
                        </Stack>
                    </TableCell>
                    <TableCell align="center">
                        <Chip label={t.stages_count} size="small" sx={CHIP_NEUTRO_SX} />
                    </TableCell>
                    {esMx ? (
                      <>
                        <TableCell>
                          <Typography variant="caption" sx={CELL_MUTED_SX}>
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
                      <TableCell align="right" sx={{ ...CELL_SX, fontVariantNumeric: 'tabular-nums' }}>{t.total_millas_cortas}</TableCell>
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
                                sx={ACCION_BTN_SX}
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
                                  onClick={() => navigate(`/ticketPayment/${t.trip_id}`, { state: { driver_id: t.driver_id } })}
                                  sx={ICON_BTN_SX}
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
                                    onClick={() => handleFinalizarPago(t.trip_id, t.driver_id, t.nomenclatura)}
                                    startIcon={<PaidIcon />}
                                    sx={ACCION_BTN_SX}
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
          labelRowsPerPage="Filas por página:"
          sx={PAGINATION_SX}
        />
      </Box>

      <CatalogoTrayectos
        open={catalogoAbierto}
        onClose={() => setCatalogoAbierto(false)}
        trayectos={trayectos}
        onCambio={cargarTrayectos}
      />
    </Box>
  );
};

export default PaymentDrivers;