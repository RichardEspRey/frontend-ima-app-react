import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TextField, Box, Typography, Chip, Button,
  Stack, Tooltip, IconButton, InputAdornment, Alert, MenuItem, CircularProgress
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

import { useNavigate } from 'react-router-dom';
import { COLOR } from '../../shared/ui/tokens';
import { FilasEsqueleto, Pestanas, PageHeader, PAGE_SHELL_SX, TABLE_CONTAINER_SX, HEADER_ROW_SX, HEADER_CELL_SX, GHOST_BTN_SX, Paginacion, notify, describirError } from '../../shared/ui';
import {
  PAIS, clavePago, pesos, sugerirTrayecto, useAutorizarPagoPorTrayecto, useDatosPagos, useTrayectos,
} from '../../entities/finance';
import { CatalogoTrayectos } from '../../features/pagos-mx';
import { useSesion } from '../../shared/auth';

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

  const { usuario } = useSesion();
  const [pais, setPais] = useState(PAIS.US);
  const [elegidos, setElegidos] = useState({});
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);
  const datosConsulta = useDatosPagos();
  const trayectosConsulta = useTrayectos();
  const autorizar = useAutorizarPagoPorTrayecto();
  const trayectos = useMemo(() => trayectosConsulta.data ?? [], [trayectosConsulta.data]);

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
      notify.error("No se pudo cargar la información.", "Error");
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
    notify.confirmar({
        titulo: '¿Finalizar Pago?',
        mensaje: "Se marcará este viaje como PAGADO.",
        confirmar: 'Sí, pagar',
        peligroso: false,
    }).then(async (confirmado) => {
        if (confirmado) {
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

                  notify.exito("Pago actualizado correctamente", "Éxito");
                  fetchPayments();
                } else {
                  notify.error("No se pudo actualizar el pago", "Error");
                }
              } catch {
                notify.error("Error de conexión", "Error");
              }
        }
    })
  };

  const conPais = useMemo(() => trips.map((t) => {
    const viaje = datosConsulta.data?.viajes.get(String(t.trip_id));
    return {
      ...t,
      nomenclatura: viaje?.nomenclatura || t.trip_number,
      pais: viaje?.pais || PAIS.US,
      recorrido: viaje?.recorrido || [],
      asignacion: datosConsulta.data?.asignaciones.get(clavePago(t.trip_id, t.driver_id)) || null,
    };
  }), [trips, datosConsulta.data]);

  const deLaPestana = useMemo(
    () => conPais.filter((t) => (tabValue === 0 ? String(t.status_payment) !== "1" : String(t.status_payment) === "1")),
    [conPais, tabValue],
  );

  const conteoPais = {
    [PAIS.US]: deLaPestana.filter((t) => t.pais === PAIS.US).length,
    [PAIS.MX]: deLaPestana.filter((t) => t.pais === PAIS.MX).length,
  };

  const trayectoDe = (t) => {
    const clave = clavePago(t.trip_id, t.driver_id);
    if (elegidos[clave] !== undefined) return trayectos.find((x) => x.id === elegidos[clave]) || null;
    if (t.asignacion) return trayectos.find((x) => x.id === t.asignacion.trayectoId) || null;
    return sugerirTrayecto(t.recorrido, trayectos);
  };

  const handleAutorizarTrayecto = async (t, trayecto) => {
    const confirmado = await notify.confirmar({
      titulo: '¿Autorizar pago?',
      mensaje: `${t.nomenclatura} · ${t.nombre} — Trayecto ${trayecto.nombre}: ${pesos(trayecto.monto)}`,
      confirmar: 'Sí, autorizar',
      peligroso: false,
    });
    if (!confirmado) return;

    try {
      await autorizar.mutateAsync({ tripId: t.trip_id, driverId: t.driver_id, trayecto, usuarioId: usuario?.id });
      setElegidos((previos) => {
        const siguientes = { ...previos };
        delete siguientes[clavePago(t.trip_id, t.driver_id)];
        return siguientes;
      });
      fetchPayments();
    } catch (error) {
      notify.error(error);
    }
  };

  const esMx = pais === PAIS.MX;
  const columnas = esMx ? 9 : 8;
  const sinMonto = trayectos.filter((x) => x.activo && x.monto <= 0);

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
    <Box sx={PAGE_SHELL_SX}>
      <PageHeader
        seccion="Finanzas · Nómina"
        titulo="Pago a Operadores"
        descripcion="Gestión de nómina y pagos de viajes."
        acciones={
          <Stack direction="row" spacing={1}>
          {esMx ? (
            <Button
              variant="outlined"
              startIcon={<RouteIcon />}
              onClick={() => setCatalogoAbierto(true)}
              sx={GHOST_BTN_SX}
            >
              Trayectos MX
            </Button>
          ) : null}
          <Button
            variant="outlined"
            startIcon={<AssignmentIndIcon />}
            onClick={() => navigate(`/millasDriversTable`)}
            sx={GHOST_BTN_SX}
          >
            Administrar Drivers
          </Button>
          </Stack>
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

      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
      <Pestanas
        valor={pais}
        onChange={(valor) => { setPais(valor); setPage(0); }}
        pestanas={[
          { id: PAIS.US, etiqueta: `US · ${conteoPais[PAIS.US]}` },
          { id: PAIS.MX, etiqueta: `MX · ${conteoPais[PAIS.MX]}` },
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
        sx={{ minWidth: 320 }}
      />
      </Stack>

      {datosConsulta.isError || trayectosConsulta.isError ? (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={<Button onClick={() => { datosConsulta.refetch(); trayectosConsulta.refetch(); }}>Reintentar</Button>}
        >
          No se pudo cargar la separación US / MX ni los trayectos: {describirError(datosConsulta.error || trayectosConsulta.error)}
        </Alert>
      ) : null}

      {esMx && tabValue === 0 && sinMonto.length > 0 ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Hay trayectos sin monto: {sinMonto.map((x) => x.nombre).join(', ')}. Asígnales uno en «Trayectos MX» para poder autorizar esos viajes.
        </Alert>
      ) : null}

      <TableContainer component={Paper} elevation={0} sx={TABLE_CONTAINER_SX}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={HEADER_ROW_SX}>
              <TableCell sx={HEADER_CELL_SX}>Trip #</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Driver</TableCell>
              <TableCell align="center" sx={HEADER_CELL_SX}>Etapas</TableCell>
              {esMx ? (
                <>
                  <TableCell sx={HEADER_CELL_SX}>Recorrido</TableCell>
                  <TableCell sx={{ ...HEADER_CELL_SX, minWidth: 190 }}>Trayecto</TableCell>
                </>
              ) : (
                <TableCell align="right" sx={HEADER_CELL_SX}>Millas</TableCell>
              )}
              <TableCell align="right" sx={HEADER_CELL_SX}>Monto Pago</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Estatus Pago</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Estatus Viaje</TableCell>
              <TableCell align="center" sx={HEADER_CELL_SX}>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <FilasEsqueleto columnas={columnas} filas={Math.min(rowsPerPage, 10)} />
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

                const uniqueKey = clavePago(t.trip_id, t.driver_id);
                const isPendiente = String(t.status_payment) === "0";
                const trayecto = esMx ? trayectoDe(t) : null;
                const sugerido = esMx && trayecto && elegidos[uniqueKey] === undefined && !t.asignacion;
                const autorizandoEste = autorizar.isPending && autorizar.variables?.tripId === t.trip_id && autorizar.variables?.driverId === t.driver_id;

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
                          <Typography variant="caption" color={COLOR.APAGADO}>
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
                              onChange={(e) => setElegidos((previos) => ({ ...previos, [uniqueKey]: e.target.value }))}
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
                            <Typography variant="body2" fontWeight={600}>{t.asignacion?.trayecto || '—'}</Typography>
                          )}
                        </TableCell>
                      </>
                    ) : (
                      <TableCell align="right">{t.total_millas_cortas}</TableCell>
                    )}

                    <TableCell align="right">
                      {!esMx ? (
                        <Typography fontWeight={700} color="success.main">
                            {t.Pago_driver ? money(t.Pago_driver) : "---"}
                        </Typography>
                      ) : isPendiente ? (
                        <Typography fontWeight={700} color={trayecto?.monto > 0 ? "success.main" : COLOR.APAGADO}>
                          {trayecto?.monto > 0 ? pesos(trayecto.monto) : "---"}
                        </Typography>
                      ) : t.asignacion ? (
                        <Typography fontWeight={700} color="success.main">{pesos(t.asignacion.monto)}</Typography>
                      ) : (
                        <Tooltip title="Pagado antes de los trayectos, por millas">
                          <Typography fontWeight={700} color={COLOR.APAGADO} sx={{ whiteSpace: "nowrap" }}>
                            {t.Pago_driver ? `${money(t.Pago_driver)} USD` : "---"}
                          </Typography>
                        </Tooltip>
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
                        {esMx && isPendiente ? (
                          <Tooltip title={!trayecto ? "Elige el trayecto" : trayecto.monto <= 0 ? "El trayecto no tiene monto" : "Autorizar pago"}>
                            <span>
                              <Button
                                variant="outlined"
                                size="small"
                                disabled={!trayecto || trayecto.monto <= 0 || autorizandoEste}
                                onClick={() => handleAutorizarTrayecto(t, trayecto)}
                                startIcon={autorizandoEste ? <CircularProgress size={14} /> : <TaskAltIcon />}
                                sx={{ textTransform: 'none', px: 2, py: 0.5, minWidth: '100px', fontSize: '0.75rem', fontWeight: 600 }}
                              >
                                Autorizar
                              </Button>
                            </span>
                          </Tooltip>
                        ) : null}

                        {!esMx ? (
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
                        ) : null}

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

      <Paginacion
        pagina={page}
        porPagina={rowsPerPage}
        total={filtered.length}
        onPagina={setPage}
        onPorPagina={(cuantas) => { setRowsPerPage(cuantas); setPage(0); }}
      />

      <CatalogoTrayectos open={catalogoAbierto} onClose={() => setCatalogoAbierto(false)} trayectos={trayectos} />
    </Box>
  );
};

export default PagosConductoresPage;