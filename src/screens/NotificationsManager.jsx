import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import BuildIcon from "@mui/icons-material/Build";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import DescriptionIcon from "@mui/icons-material/Description";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import SearchIcon from "@mui/icons-material/Search";
import Flashy from "@pablotheblink/flashyjs";
import { useAuthStore } from "../store/useAuthStore";
import {
  desuscribirInspeccion,
  obtenerDisponiblesInspeccion,
  obtenerSuscriptoresInspeccion,
  suscribirInspeccion,
} from "../services/mantenimiento";
import { suscriptoresDe } from "../services/avisos";
import { CATEGORIA, buscarPersonas, nombreDePersona, personasDeListas } from "../utils/avisos";
import { PAGE_SHELL_SX, PAGE_OVERLINE_SX, PAGE_TITLE_SX, INPUT_SX, TABLE_CONTAINER_SX } from "../styles/estilosTabla";

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
const SAFETY = { icono: FactCheckIcon, color: "#0f766e", fondo: "#ccfbf1" };

const deSafety = (categoria, nombre, corto, ejemplo) => ({
  id: categoria,
  nombre: `${nombre} pendiente`,
  corto,
  descripcion: `Una vez al día, a las 10:00, con los viajes que siguen sin ${nombre} en Safety General.`,
  ...SAFETY,
  ejemplo: { titulo: `${nombre} pendiente`, subtitulo: `${ejemplo} viajes sin ${nombre}` },
  ...suscriptoresDe(categoria),
});

const SECCIONES = [
  {
    id: "viajes",
    nombre: "Viajes",
    categorias: [
      {
        id: "bl",
        nombre: "BL Firmado",
        corto: "BL firmado",
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
        corto: "Programado",
        descripcion: "Cuando se agrega un viaje a la pestaña Programación de Viajes.",
        ...PROGRAMACION,
        ejemplo: { titulo: "Viaje programado", subtitulo: "PALOS GARZA HUB · Camión 10 · Luis Mellado" },
        ...suscriptoresDe(CATEGORIA.VIAJE_PROGRAMADO),
      },
      {
        id: CATEGORIA.VIAJE_DESPACHO,
        nombre: "Viaje en despacho",
        corto: "En despacho",
        descripcion: "Cuando un viaje entra a Despacho. Dice qué documentos le faltan.",
        ...VIAJES,
        ejemplo: { titulo: "Viaje en despacho 266-US-26", subtitulo: "Faltan 1: ORDEN RETIRO" },
        ...suscriptoresDe(CATEGORIA.VIAJE_DESPACHO),
      },
      {
        id: CATEGORIA.VIAJE_DOCUMENTOS,
        nombre: "Documentos en despacho",
        corto: "Documentos",
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
        corto: "Con fallas",
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
        corto: "Sin fallas",
        descripcion: "Cuando un operador manda una inspección sin nada que reparar, con o sin caja.",
        ...TALLER,
        ejemplo: { titulo: "Inspección sin fallas 257-US-26", subtitulo: "Camión 12 · Jose Luis Valdes" },
        ...suscriptoresDe(CATEGORIA.SIN_FALLAS),
      },
      {
        id: CATEGORIA.SIN_INSPECCION,
        nombre: "Viajes sin inspección",
        corto: "Sin inspección",
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
        corto: "State pending",
        descripcion: "Una vez al día, a las 10:00, con los estados pendientes acumulados en el administrador de diesel.",
        ...DIESEL,
        ejemplo: { titulo: "State pending", subtitulo: "15 estados pendientes en 8 viajes" },
        ...suscriptoresDe(CATEGORIA.DIESEL_STATE),
      },
      {
        id: CATEGORIA.DIESEL_FLEETONE,
        nombre: "Fleet One pending",
        corto: "Fleet One",
        descripcion: "Una vez al día, a las 10:00, con los tickets de Fleet One pendientes acumulados.",
        ...DIESEL,
        ejemplo: { titulo: "Fleet One pending", subtitulo: "89 tickets pendientes en 32 viajes" },
        ...suscriptoresDe(CATEGORIA.DIESEL_FLEETONE),
      },
    ],
  },
  {
    id: "safety",
    nombre: "Safety",
    categorias: [
      deSafety(CATEGORIA.SAFETY_LIBRO, "Libro Electrónico", "Libro electrónico", 12),
      deSafety(CATEGORIA.SAFETY_DIESEL, "Reporte Diesel", "Reporte diesel", 30),
      deSafety(CATEGORIA.SAFETY_PCMILLER, "Reporte PC Miller", "PC Miller", 41),
    ],
  },
];

const CATEGORIAS = SECCIONES.flatMap((seccion) => seccion.categorias);
const CON_CANDIDATOS = CATEGORIAS.filter((c) => ["bl", "inspecciones", CATEGORIA.DIESEL_STATE].includes(c.id));

const BORDE = "1px solid #e2e8f0";
const ANCHO_PERSONA = 240;
const TODOS = "todos";

const Encabezado = ({ categoria, total, primera }) => {
  const Icono = categoria.icono;
  return (
    <TableCell align="center" sx={{ borderLeft: primera ? BORDE : "none", borderBottom: BORDE, px: 1, py: 1.25, minWidth: 96 }}>
      <Tooltip
        arrow
        title={
          <Box sx={{ p: 0.5 }}>
            <Typography variant="caption" fontWeight={800} sx={{ display: "block" }}>
              {categoria.nombre}
            </Typography>
            <Typography variant="caption" sx={{ display: "block", mb: 0.75 }}>
              {categoria.descripcion}
            </Typography>
            <Typography variant="caption" sx={{ display: "block", opacity: 0.8 }}>
              Ejemplo: {categoria.ejemplo.titulo} · {categoria.ejemplo.subtitulo}
            </Typography>
          </Box>
        }
      >
        <Box sx={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 0.5, cursor: "help" }}>
          <Avatar sx={{ bgcolor: categoria.fondo, color: categoria.color, width: 30, height: 30 }}>
            <Icono sx={{ fontSize: 17 }} />
          </Avatar>
          <Typography variant="caption" fontWeight={700} color="#0f172a" sx={{ lineHeight: 1.15 }}>
            {categoria.corto}
          </Typography>
          <Typography variant="caption" color="#94a3b8" sx={{ lineHeight: 1 }}>
            {total} {total === 1 ? "persona" : "personas"}
          </Typography>
        </Box>
      </Tooltip>
    </TableCell>
  );
};

const NotificationsManager = () => {
  const { user } = useAuthStore();
  const userType = String(user?.tipo_usuario || "").trim().toLowerCase();
  const esAdmin = Boolean(user) && ADMIN_TYPES.has(userType);

  const [listas, setListas] = useState({});
  const [fallidas, setFallidas] = useState([]);
  const [disponibles, setDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(() => new Set());
  const [busqueda, setBusqueda] = useState("");
  const [modulo, setModulo] = useState(TODOS);
  const secciones = modulo === TODOS ? SECCIONES : SECCIONES.filter((seccion) => seccion.id === modulo);
  const columnas = secciones.reduce((suma, seccion) => suma + seccion.categorias.length, 0);

  const cargar = useCallback(async () => {
    setCargando(true);
    const resultados = await Promise.allSettled([
      ...CATEGORIAS.map((categoria) => categoria.obtenerSuscriptores()),
      ...CON_CANDIDATOS.map((categoria) => categoria.obtenerDisponibles()),
    ]);
    const suscriptores = resultados.slice(0, CATEGORIAS.length);
    const candidatos = resultados.slice(CATEGORIAS.length);

    setListas(
      Object.fromEntries(
        CATEGORIAS.map((categoria, i) => [
          categoria.id,
          suscriptores[i].status === "fulfilled" ? suscriptores[i].value : null,
        ])
      )
    );
    setFallidas(CATEGORIAS.filter((_, i) => suscriptores[i].status !== "fulfilled").map((c) => c.nombre));
    setDisponibles(candidatos.flatMap((r) => (r.status === "fulfilled" ? r.value : [])));
    setCargando(false);
  }, []);

  useEffect(() => {
    if (esAdmin) cargar();
  }, [esAdmin, cargar]);

  const personas = useMemo(() => personasDeListas(listas, disponibles), [listas, disponibles]);
  const visibles = useMemo(() => buscarPersonas(personas, busqueda), [personas, busqueda]);

  const recibe = (categoria, persona) =>
    (listas[categoria.id] || []).some((p) => String(p.id) === String(persona.id));

  const alternar = async (categoria, persona) => {
    const llave = `${categoria.id}:${persona.id}`;
    if (guardando.has(llave)) return;
    const estaba = recibe(categoria, persona);

    const poner = (dentro) =>
      setListas((previas) => ({
        ...previas,
        [categoria.id]: dentro
          ? [...(previas[categoria.id] || []), persona]
          : (previas[categoria.id] || []).filter((p) => String(p.id) !== String(persona.id)),
      }));

    setGuardando((previas) => new Set(previas).add(llave));
    poner(!estaba);
    try {
      if (estaba) await categoria.desuscribir({ userId: persona.id, usuarioId: user.id });
      else await categoria.suscribir({ userId: persona.id, usuarioId: user.id });
    } catch (err) {
      poner(estaba);
      Flashy.error(err.message || `No se pudo cambiar ${categoria.nombre} para ${nombreDePersona(persona)}.`);
    } finally {
      setGuardando((previas) => {
        const siguientes = new Set(previas);
        siguientes.delete(llave);
        return siguientes;
      });
    }
  };

  if (!esAdmin) {
    return (
      <Box sx={PAGE_SHELL_SX}>
        <Alert severity="error">Acceso denegado. Solo administradores pueden ver esta sección.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={PAGE_SHELL_SX}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="overline" sx={PAGE_OVERLINE_SX}>Configuración</Typography>
          <Typography variant="h4" fontWeight={800} color="#0f172a" sx={PAGE_TITLE_SX}>
            Notificaciones
          </Typography>
          <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
            Enciende o apaga cada aviso por persona. El cambio se guarda al momento.
          </Typography>
        </Box>
        <TextField
          size="small"
          placeholder="Buscar persona"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          sx={{ width: 260, bgcolor: "#fff" }}
          slotProps={{
            input: {
              sx: INPUT_SX,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        {[{ id: TODOS, nombre: "Todos", categorias: CATEGORIAS }, ...SECCIONES].map((seccion) => {
          const activo = modulo === seccion.id;
          return (
            <Chip
              key={seccion.id}
              label={`${seccion.nombre} · ${seccion.categorias.length}`}
              onClick={() => setModulo(seccion.id)}
              sx={{
                fontWeight: 700,
                bgcolor: activo ? "#0f172a" : "#fff",
                color: activo ? "#fff" : "#475569",
                border: "1px solid",
                borderColor: activo ? "#0f172a" : "#e2e8f0",
                "&:hover": { bgcolor: activo ? "#0f172a" : "#f1f5f9" },
              }}
            />
          );
        })}
      </Box>

      {fallidas.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={cargar}>Reintentar</Button>}>
          No se pudo cargar: {fallidas.join(", ")}. Esas columnas quedan bloqueadas.
        </Alert>
      )}

      {cargando && personas.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ ...TABLE_CONTAINER_SX, maxHeight: "calc(100vh - 230px)" }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  rowSpan={2}
                  sx={{ position: "sticky", left: 0, zIndex: 4, bgcolor: "#fff", minWidth: ANCHO_PERSONA, borderBottom: BORDE, verticalAlign: "bottom" }}
                >
                  <Typography variant="caption" fontWeight={700} color="#94a3b8" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Persona
                  </Typography>
                </TableCell>
                {secciones.map((seccion) => (
                  <TableCell
                    key={seccion.id}
                    align="center"
                    colSpan={seccion.categorias.length}
                    sx={{ borderLeft: BORDE, borderBottom: "none", bgcolor: "#fafbfc", py: 0.75 }}
                  >
                    <Typography variant="caption" fontWeight={800} color="#475569" sx={{ textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {seccion.nombre}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                {secciones.map((seccion) =>
                  seccion.categorias.map((categoria, i) => (
                    <Encabezado
                      key={categoria.id}
                      categoria={categoria}
                      total={(listas[categoria.id] || []).length}
                      primera={i === 0}
                    />
                  ))
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {visibles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={columnas + 1} align="center" sx={{ py: 5, color: "#94a3b8" }}>
                    Nadie coincide con la búsqueda.
                  </TableCell>
                </TableRow>
              )}
              {visibles.map((persona) => (
                <TableRow key={persona.id} hover>
                  <TableCell sx={{ position: "sticky", left: 0, zIndex: 1, bgcolor: "#fff", minWidth: ANCHO_PERSONA }}>
                    <Typography variant="body2" fontWeight={700} color="#0f172a" noWrap>
                      {nombreDePersona(persona)}
                    </Typography>
                    {persona.user && persona.user !== nombreDePersona(persona) && (
                      <Typography variant="caption" color="#94a3b8" noWrap sx={{ display: "block" }}>
                        {persona.user}
                      </Typography>
                    )}
                  </TableCell>
                  {secciones.map((seccion) =>
                    seccion.categorias.map((categoria, i) => (
                      <TableCell key={categoria.id} align="center" sx={{ borderLeft: i === 0 ? BORDE : "none", py: 0.25 }}>
                        <Switch
                          size="small"
                          checked={recibe(categoria, persona)}
                          disabled={listas[categoria.id] === null}
                          onChange={() => alternar(categoria, persona)}
                          slotProps={{ input: { "aria-label": `${categoria.nombre} para ${nombreDePersona(persona)}` } }}
                        />
                      </TableCell>
                    ))
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default NotificationsManager;
