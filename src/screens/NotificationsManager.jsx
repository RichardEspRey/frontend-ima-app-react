import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BuildIcon from "@mui/icons-material/Build";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonAddIcon from "@mui/icons-material/PersonAddAlt1";
import PersonRemoveIcon from "@mui/icons-material/PersonRemoveOutlined";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import Flashy from "@pablotheblink/flashyjs";
import dayjs from "dayjs";
import { useAuthStore } from "../store/useAuthStore";
import {
  desuscribirInspeccion,
  obtenerDisponiblesInspeccion,
  obtenerSuscriptoresInspeccion,
  suscribirInspeccion,
} from "../services/mantenimiento";
import { suscriptoresDe } from "../services/avisos";
import { CATEGORIA } from "../utils/avisos";
import {
  PAGE_SHELL_SX, PAGE_OVERLINE_SX, PAGE_TITLE_SX, DIALOG_PAPER_SX, DARK_BTN_SX, INPUT_SX,
} from "../styles/estilosTabla";

const ADMIN_TYPES = new Set(["admin"]);

const apiHost = import.meta.env.VITE_API_HOST;

const pedirNotificaciones = async (op, campos = {}) => {
  const formData = new FormData();
  formData.append("op", op);
  Object.entries(campos).forEach(([clave, valor]) => formData.append(clave, valor ?? ""));
  const res = await fetch(`${apiHost}/Notifications.php`, { method: "POST", body: formData });
  const data = await res.json();
  if (data.status !== "success") throw new Error(data.message || "No se pudo completar la operación");
  return Array.isArray(data.users) ? data.users : [];
};

const VIAJES = { icono: LocalShippingIcon, color: "#1d4ed8", fondo: "#e0e9fd" };
const PROGRAMACION = { icono: EventAvailableIcon, color: "#15803d", fondo: "#dcfce7" };
const DOCUMENTOS = { icono: DescriptionIcon, color: "#6d28d9", fondo: "#ede9fe" };
const TALLER = { icono: BuildIcon, color: "#ea580c", fondo: "#ffedd5" };
const DIESEL = { icono: LocalGasStationIcon, color: "#b45309", fondo: "#fef3c7" };

const SECCIONES = [
  {
    id: "viajes",
    nombre: "Viajes",
    categorias: [
      {
        id: "bl",
        nombre: "BL Firmado",
        descripcion: "Cuando se sube el BL firmado de un viaje.",
        ...VIAJES,
        ejemplo: { titulo: "BL Firmado", subtitulo: "243-US-88T2-26" },
        obtenerSuscriptores: () => pedirNotificaciones("getSubscribers"),
        obtenerDisponibles: () => pedirNotificaciones("getAvailableUsers"),
        suscribir: ({ userId }) => pedirNotificaciones("subscribe", { user_id: userId }),
        desuscribir: ({ userId }) => pedirNotificaciones("unsubscribe", { user_id: userId }),
      },
      {
        id: CATEGORIA.VIAJE_PROGRAMADO,
        nombre: "Viaje programado",
        descripcion: "Cuando se agrega un viaje a la pestaña Programación de Viajes.",
        ...PROGRAMACION,
        ejemplo: { titulo: "Viaje programado", subtitulo: "PALOS GARZA HUB · Camión 10 · Luis Mellado" },
        ...suscriptoresDe(CATEGORIA.VIAJE_PROGRAMADO),
      },
      {
        id: CATEGORIA.VIAJE_DESPACHO,
        nombre: "Viaje en despacho",
        descripcion: "Cuando un viaje entra a Despacho. Dice qué documentos le faltan.",
        ...VIAJES,
        ejemplo: { titulo: "Viaje en despacho 266-US-26", subtitulo: "Faltan 1: ORDEN RETIRO" },
        ...suscriptoresDe(CATEGORIA.VIAJE_DESPACHO),
      },
      {
        id: CATEGORIA.VIAJE_DOCUMENTOS,
        nombre: "Documentos en despacho",
        descripcion: "Cuando se agregan documentos a un viaje en Despacho. Los que entran juntos van en un solo aviso, con los que siguen faltando.",
        ...DOCUMENTOS,
        ejemplo: { titulo: "2 documentos agregados 264-US-26", subtitulo: "MANIFIESTO, QR MANIFESTO" },
        ...suscriptoresDe(CATEGORIA.VIAJE_DOCUMENTOS),
      },
    ],
  },
  {
    id: "reparaciones",
    nombre: "Reparaciones",
    categorias: [
      {
        id: "inspecciones",
        nombre: "Inspecciones",
        descripcion: "Cuando un operador manda una inspección con algo que reparar. Camión y caja avisan por separado.",
        ...TALLER,
        ejemplo: { titulo: "Nueva inspección 238-US-26", subtitulo: "Camión 11 · Alberto Cruz Galindo" },
        obtenerSuscriptores: obtenerSuscriptoresInspeccion,
        obtenerDisponibles: obtenerDisponiblesInspeccion,
        suscribir: suscribirInspeccion,
        desuscribir: desuscribirInspeccion,
      },
      {
        id: CATEGORIA.SIN_FALLAS,
        nombre: "Inspecciones sin fallas",
        descripcion: "Cuando un operador manda una inspección sin nada que reparar, con o sin caja.",
        ...TALLER,
        ejemplo: { titulo: "Inspección sin fallas 257-US-26", subtitulo: "Camión 12 · Jose Luis Valdes" },
        ...suscriptoresDe(CATEGORIA.SIN_FALLAS),
      },
      {
        id: CATEGORIA.SIN_INSPECCION,
        nombre: "Viajes sin inspección",
        descripcion: "Cuando un operador junta más de un viaje sin inspección. Vuelve a avisar cada vez que suma otro.",
        ...TALLER,
        ejemplo: { titulo: "Viajes sin inspección", subtitulo: "Alejandro Zablah Ruiz · 5 viajes" },
        ...suscriptoresDe(CATEGORIA.SIN_INSPECCION),
      },
    ],
  },
  {
    id: "diesel",
    nombre: "Diesel",
    categorias: [
      {
        id: CATEGORIA.DIESEL_STATE,
        nombre: "State pending",
        descripcion: "Una vez al día, a las 10:00, con los estados pendientes acumulados en el administrador de diesel.",
        ...DIESEL,
        ejemplo: { titulo: "State pending", subtitulo: "15 estados pendientes en 8 viajes" },
        ...suscriptoresDe(CATEGORIA.DIESEL_STATE),
      },
      {
        id: CATEGORIA.DIESEL_FLEETONE,
        nombre: "Fleet One pending",
        descripcion: "Una vez al día, a las 10:00, con los tickets de Fleet One pendientes acumulados.",
        ...DIESEL,
        ejemplo: { titulo: "Fleet One pending", subtitulo: "89 tickets pendientes en 32 viajes" },
        ...suscriptoresDe(CATEGORIA.DIESEL_FLEETONE),
      },
    ],
  },
];

const nombreDe = (persona) => persona?.name || persona?.user || "Sin nombre";

const inicialDe = (persona) => nombreDe(persona).trim().charAt(0).toUpperCase() || "?";

const Vista = ({ categoria }) => {
  const Icono = categoria.icono;
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1.5,
        py: 1.25,
        borderRadius: 2,
        bgcolor: "#f8fafc",
        border: "1px dashed #e2e8f0",
      }}
    >
      <Avatar sx={{ bgcolor: categoria.fondo, color: categoria.color, width: 32, height: 32 }}>
        <Icono sx={{ fontSize: 18 }} />
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={800} color="#0f172a" noWrap>
          {categoria.ejemplo.titulo}
        </Typography>
        <Typography variant="caption" color="#64748b" noWrap sx={{ display: "block" }}>
          {categoria.ejemplo.subtitulo}
        </Typography>
      </Box>
    </Box>
  );
};

const TarjetaCategoria = ({ categoria, usuarioId }) => {
  const Icono = categoria.icono;
  const [suscriptores, setSuscriptores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [quitando, setQuitando] = useState(null);

  const [buscador, setBuscador] = useState(false);
  const [disponibles, setDisponibles] = useState([]);
  const [cargandoDisponibles, setCargandoDisponibles] = useState(false);
  const [agregando, setAgregando] = useState(null);
  const [agregados, setAgregados] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      setSuscriptores(await categoria.obtenerSuscriptores());
    } catch (err) {
      setError(err.message || "No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoria.id]);

  const abrirBuscador = async () => {
    setBusqueda("");
    setAgregados([]);
    setBuscador(true);
    setCargandoDisponibles(true);
    try {
      setDisponibles(await categoria.obtenerDisponibles());
    } catch (err) {
      Flashy.error(err.message || "No se pudo conectar con el servidor.");
    } finally {
      setCargandoDisponibles(false);
    }
  };

  const agregar = async (persona) => {
    setAgregando(persona.id);
    try {
      await categoria.suscribir({ userId: persona.id, usuarioId });
      setAgregados((prev) => [...prev, persona.id]);
      setSuscriptores((prev) =>
        [...prev, persona].sort((a, b) => nombreDe(a).localeCompare(nombreDe(b)))
      );
    } catch (err) {
      Flashy.error(err.message || "No se pudo agregar a la persona.");
    } finally {
      setAgregando(null);
    }
  };

  const quitar = async (persona) => {
    setQuitando(persona.id);
    try {
      await categoria.desuscribir({ userId: persona.id, usuarioId });
      setSuscriptores((prev) => prev.filter((otra) => otra.id !== persona.id));
      Flashy.success(`${nombreDe(persona)} ya no recibirá los avisos de ${categoria.nombre}.`);
    } catch (err) {
      Flashy.error(err.message || "No se pudo quitar a la persona.");
    } finally {
      setQuitando(null);
    }
  };

  const candidatos = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return disponibles.filter(
      (persona) =>
        !texto ||
        nombreDe(persona).toLowerCase().includes(texto) ||
        String(persona.user || "").toLowerCase().includes(texto)
    );
  }, [disponibles, busqueda]);

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: 3, border: "1px solid #e2e8f0", display: "flex", flexDirection: "column", overflow: "hidden" }}
    >
      <Box sx={{ p: 3, pb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar sx={{ bgcolor: categoria.fondo, color: categoria.color, width: 44, height: 44, borderRadius: 2.5 }}>
            <Icono />
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ lineHeight: 1.3 }}>
                {categoria.nombre}
              </Typography>
              {!cargando && !error && (
                <Chip
                  size="small"
                  label={`${suscriptores.length} ${suscriptores.length === 1 ? "persona" : "personas"}`}
                  sx={{ height: 22, fontWeight: 700, bgcolor: "#f1f5f9", color: "#475569" }}
                />
              )}
            </Stack>
            <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
              {categoria.descripcion}
            </Typography>
          </Box>
        </Stack>

        <Typography
          variant="overline"
          sx={{ display: "block", mt: 2.5, mb: 1, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.08em", lineHeight: 1 }}
        >
          Así se ve en la campana
        </Typography>
        <Vista categoria={categoria} />
      </Box>

      <Box sx={{ px: 3, pt: 1, pb: 1, flexGrow: 1 }}>
        <Typography
          variant="overline"
          sx={{ display: "block", mb: 0.5, color: "#94a3b8", fontWeight: 700, letterSpacing: "0.08em", lineHeight: 1 }}
        >
          Quién lo recibe
        </Typography>

        {cargando && (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={26} />
          </Box>
        )}

        {!cargando && error && (
          <Alert
            severity="error"
            sx={{ my: 1, borderRadius: 2 }}
            action={<Button color="inherit" size="small" onClick={cargar}>Reintentar</Button>}
          >
            {error}
          </Alert>
        )}

        {!cargando && !error && suscriptores.length === 0 && (
          <Box sx={{ py: 3, textAlign: "center" }}>
            <Typography variant="body2" color="#94a3b8">
              Nadie recibe estos avisos todavía.
            </Typography>
          </Box>
        )}

        {!cargando && !error && suscriptores.length > 0 && (
          <List disablePadding sx={{ maxHeight: 320, overflowY: "auto" }}>
            {suscriptores.map((persona) => (
              <Box
                key={persona.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  py: 1,
                  borderBottom: "1px solid #f1f5f9",
                  "&:last-of-type": { borderBottom: "none" },
                }}
              >
                <Avatar sx={{ width: 34, height: 34, fontSize: "0.9rem", fontWeight: 700, bgcolor: "#eef2ff", color: "#4338ca" }}>
                  {inicialDe(persona)}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={700} color="#0f172a" noWrap>
                    {nombreDe(persona)}
                  </Typography>
                  <Typography variant="caption" color="#94a3b8" noWrap sx={{ display: "block" }}>
                    {persona.user || "—"}
                    {persona.subscribed_at ? ` · desde ${dayjs(persona.subscribed_at).format("DD/MM/YY")}` : ""}
                  </Typography>
                </Box>
                <Tooltip title="Quitar">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => quitar(persona)}
                      disabled={quitando === persona.id}
                      sx={{ color: "#94a3b8", "&:hover": { color: "#b91c1c", bgcolor: "#fef2f2" } }}
                    >
                      {quitando === persona.id ? <CircularProgress size={16} /> : <PersonRemoveIcon fontSize="small" />}
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            ))}
          </List>
        )}
      </Box>

      <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e2e8f0", bgcolor: "#fafbfc" }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={abrirBuscador}
          disabled={cargando || Boolean(error)}
          sx={DARK_BTN_SX}
        >
          Agregar persona
        </Button>
      </Box>

      <Dialog
        open={buscador}
        onClose={() => setBuscador(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: DIALOG_PAPER_SX }}
      >
        <DialogTitle component="div" sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={800} color="#0f172a">
            Agregar a {categoria.nombre}
          </Typography>
          <Typography variant="body2" color="#64748b">
            Toca a cada persona que deba recibir estos avisos.
          </Typography>
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            size="small"
            autoFocus
            placeholder="Buscar por nombre o usuario"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            sx={{ mt: 1, mb: 1.5, "& .MuiOutlinedInput-root": INPUT_SX }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />

          {cargandoDisponibles ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={26} />
            </Box>
          ) : (
            <List dense disablePadding sx={{ maxHeight: 320, overflowY: "auto" }}>
              {candidatos.length === 0 && (
                <Typography variant="body2" color="#94a3b8" sx={{ py: 3, textAlign: "center" }}>
                  {disponibles.length === 0 ? "Todas las personas ya reciben estos avisos." : "Nadie coincide con la búsqueda."}
                </Typography>
              )}
              {candidatos.map((persona) => {
                const yaAgregada = agregados.includes(persona.id);
                return (
                  <ListItemButton
                    key={persona.id}
                    onClick={() => !yaAgregada && agregar(persona)}
                    disabled={agregando === persona.id}
                    sx={{ borderRadius: 2, mb: 0.5, bgcolor: yaAgregada ? "#f0fdf4" : "transparent" }}
                  >
                    <ListItemAvatar sx={{ minWidth: 44 }}>
                      <Avatar sx={{ width: 32, height: 32, fontSize: "0.85rem", fontWeight: 700, bgcolor: "#eef2ff", color: "#4338ca" }}>
                        {inicialDe(persona)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={<Typography variant="body2" fontWeight={700} color="#0f172a">{nombreDe(persona)}</Typography>}
                      secondary={persona.user || null}
                    />
                    {agregando === persona.id && <CircularProgress size={16} />}
                    {yaAgregada && <CheckIcon fontSize="small" sx={{ color: "#15803d" }} />}
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setBuscador(false)} variant="contained" sx={DARK_BTN_SX}>
            Listo
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

const NotificationsManager = () => {
  const { user } = useAuthStore();
  const userType = String(user?.tipo_usuario || "").trim().toLowerCase();

  if (!user || !ADMIN_TYPES.has(userType)) {
    return (
      <Box sx={PAGE_SHELL_SX}>
        <Alert severity="error">Acceso denegado. Solo administradores pueden ver esta sección.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={PAGE_SHELL_SX}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" sx={PAGE_OVERLINE_SX}>Configuración</Typography>
        <Typography variant="h4" fontWeight={800} color="#0f172a" sx={PAGE_TITLE_SX}>
          Notificaciones
        </Typography>
        <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
          Qué avisos existen y quién los recibe en la campana.
        </Typography>
      </Box>

      {SECCIONES.map((seccion) => (
        <Box key={seccion.id} sx={{ mb: 5 }}>
          <Typography variant="subtitle1" fontWeight={800} color="#0f172a" sx={{ mb: 2 }}>
            {seccion.nombre}
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
              gap: 3,
              alignItems: "start",
            }}
          >
          {seccion.categorias.map((categoria) => (
            <TarjetaCategoria key={categoria.id} categoria={categoria} usuarioId={user.id} />
          ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default NotificationsManager;
