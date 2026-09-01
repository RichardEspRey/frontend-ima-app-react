import { Box, Button, Chip, Container, Grid, Paper, Typography } from "@mui/material"
import { useNavigate, useParams } from "react-router-dom"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn"
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"

import { DataTable } from "../../shared/ui"
import {
  ESTADO_PERIODO,
  etiquetaPeriodo,
  plantillaTotal,
  usePeriodos,
  useDetallePeriodo,
} from "../../entities/payroll"

const dinero = (monto, locale) =>
  `$${Number(monto).toLocaleString(locale, { minimumFractionDigits: 2 })}`

/**
 * Tarjeta de resumen de la parte superior.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.titulo Encabezado de la tarjeta.
 * @param {object} props.valor Cifra principal.
 * @param {string} [props.pie] Texto pequeño bajo la cifra.
 * @param {string} props.color Color del borde y de la cifra.
 * @param {string} props.fondo Color de fondo.
 * @param {object} props.icono Icono junto al encabezado.
 * @returns {object} La tarjeta renderizada.
 */
function TarjetaResumen({ titulo, valor, pie, color, fondo, icono }) {
  return (
    <Paper
      elevation={0}
      sx={{ p: 3, borderLeft: `5px solid ${color}`, bgcolor: fondo, borderRadius: 2, height: "100%" }}
    >
      <Typography
        variant="subtitle2"
        color="text.secondary"
        fontWeight={700}
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        {icono} {titulo}
      </Typography>
      <Typography variant="h4" fontWeight={800} sx={{ mt: 1, color }}>
        {valor}
      </Typography>
      {pie && (
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          {pie}
        </Typography>
      )}
    </Paper>
  )
}

/**
 * Desglose por empleado de una semana de nómina.
 *
 * El periodo se saca de la lista de semanas usando el `period_id` de la URL, no
 * del `state` del router. Antes venía por `useLocation().state`, así que la ruta
 * `/detalle-pago/:period_id` **solo funcionaba llegando desde el botón**: recargar
 * la página o compartir el enlace mostraba "Falta contexto de la semana".
 * La lista de semanas ya está cacheada, así que no cuesta una petición extra.
 *
 * @returns {object} La pantalla.
 */
export default function DetallePagoPage() {
  const { period_id: periodId } = useParams()
  const navigate = useNavigate()

  const { data: periodos = [], isLoading: cargandoPeriodos, isError: errorPeriodos } = usePeriodos()
  const periodo = periodos.find((p) => String(p.period_id) === String(periodId))

  const { data: detalles = [], isLoading, isError, error } = useDetallePeriodo(periodo)

  if (cargandoPeriodos) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography color="text.secondary" fontStyle="italic">
          Cargando la semana…
        </Typography>
      </Container>
    )
  }

  if (errorPeriodos || !periodo) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography color="error" gutterBottom>
          No se encontró la semana {periodId}.
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/nomina")}>
          Volver a nómina
        </Button>
      </Container>
    )
  }

  const columnas = [
    { id: "nombre", label: "Nombre del empleado", ordenable: true, sx: { fontWeight: 600 } },
    { id: "puesto", label: "Puesto", ordenable: true },
    {
      id: "frecuencia_pago",
      label: "Frecuencia",
      ordenable: true,
      render: (d) => <Chip label={d.frecuencia_pago} size="small" variant="outlined" sx={{ fontWeight: 500 }} />,
    },
    {
      id: "tipo_nomina",
      label: "Divisa / Nómina",
      ordenable: true,
      render: (d) => (
        <Chip
          label={d.tipo_nomina === "MX" ? "MXN" : "USD"}
          size="small"
          color={d.tipo_nomina === "MX" ? "success" : "primary"}
          sx={{ fontWeight: "bold" }}
        />
      ),
    },
    {
      id: "sueldo",
      label: "Monto a pagar",
      ordenable: true,
      align: "right",
      render: (d) => (
        <Typography
          fontWeight={800}
          fontSize="1.05rem"
          color={d.tipo_nomina === "MX" ? "success.main" : "primary.main"}
        >
          {dinero(d.sueldo, "en-US")}
        </Typography>
      ),
    },
  ]

  return (
    <Container maxWidth="xl" sx={{ py: 4, pb: 10 }}>
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 4,
          position: "sticky",
          top: 10,
          zIndex: 100,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: 2,
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={800}
            color="primary.main"
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <ReceiptLongIcon /> Desglose: {etiquetaPeriodo(periodo)}
          </Typography>
          <Typography variant="body2" component="div" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
            Corte al: {periodo.fecha_corte || "sin fecha"} | Estado:
            <Chip
              label={periodo.estado}
              size="small"
              color={periodo.estado === ESTADO_PERIODO.AUTORIZADO ? "default" : "warning"}
              sx={{ ml: 1, fontWeight: "bold", height: 20 }}
            />
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/nomina")}
          sx={{ color: "text.secondary", borderColor: "divider", fontWeight: 600, textTransform: "none", bgcolor: "white" }}
        >
          Volver a pagos
        </Button>
      </Paper>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TarjetaResumen
            titulo="NÓMINA TOTAL (MXN)"
            valor={dinero(periodo.total_mx, "es-MX")}
            pie={`Pagado a ${periodo.emps_mx} empleado(s)`}
            color="#2e7d32"
            fondo="#f1f8e9"
            icono={<MonetizationOnIcon color="success" fontSize="small" />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TarjetaResumen
            titulo="NÓMINA TOTAL (USD)"
            valor={dinero(periodo.total_us, "en-US")}
            pie={`Pagado a ${periodo.emps_us} empleado(s)`}
            color="#0288d1"
            fondo="#e1f5fe"
            icono={<MonetizationOnIcon color="primary" fontSize="small" />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TarjetaResumen
            titulo="PLANTILLA TOTAL SEMANA"
            valor={`${plantillaTotal(periodo)} empleados`}
            color="#616161"
            fondo="#f5f5f5"
            icono={<PeopleAltIcon color="action" fontSize="small" />}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
        Desglose por empleado
      </Typography>

      <DataTable
        filas={detalles}
        columnas={columnas}
        claveFila="nombre"
        cargando={isLoading}
        error={isError ? error.message : null}
        vacio="No hubo empleados registrados activos antes de la fecha de corte."
      />
    </Container>
  )
}
