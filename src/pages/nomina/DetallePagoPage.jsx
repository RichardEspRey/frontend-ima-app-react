import { Button, Chip, Container, Grid, Typography } from "@mui/material"
import { useNavigate, useParams } from "react-router-dom"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn"
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"

import { DataTable, PageHeader, StatCard } from "../../shared/ui"
import { CHIP_SX, CELL_STRONG_SX, GHOST_BTN_SX } from "../../shared/ui/estilos"
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
    { id: "nombre", label: "Nombre del empleado", ordenable: true, sx: CELL_STRONG_SX },
    { id: "puesto", label: "Puesto", ordenable: true },
    {
      id: "frecuencia_pago",
      label: "Frecuencia",
      ordenable: true,
      render: (d) => <Chip label={d.frecuencia_pago} size="small" variant="outlined" sx={CHIP_SX} />,
    },
    {
      id: "tipo_nomina",
      label: "Divisa / Nómina",
      ordenable: true,
      render: (d) => (
        <Chip
          label={d.tipo_nomina === "MX" ? "MXN" : "USD"}
          size="small"
          sx={d.tipo_nomina === "MX" ? { ...CHIP_SX, bgcolor: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" } : { ...CHIP_SX, bgcolor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}
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
      <PageHeader
        seccion={`Nómina · corte al ${periodo.fecha_corte || "sin fecha"}`}
        titulo={`Desglose: ${etiquetaPeriodo(periodo)}`}
        descripcion={
          <>
            Estado:
            <Chip
              label={periodo.estado}
              size="small"
              color={periodo.estado === ESTADO_PERIODO.AUTORIZADO ? "default" : "warning"}
              sx={{ ...CHIP_SX, ml: 1 }}
            />
          </>
        }
        acciones={
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate("/nomina")} sx={GHOST_BTN_SX}>
            Volver a pagos
          </Button>
        }
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            etiqueta="Nómina total (MXN)"
            valor={dinero(periodo.total_mx, "es-MX")}
            pie={`Pagado a ${periodo.emps_mx} empleado(s)`}
            acento="#15803d"
            icono={<MonetizationOnIcon fontSize="small" />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            etiqueta="Nómina total (USD)"
            valor={dinero(periodo.total_us, "en-US")}
            pie={`Pagado a ${periodo.emps_us} empleado(s)`}
            acento="#1d4ed8"
            icono={<MonetizationOnIcon fontSize="small" />}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <StatCard
            etiqueta="Plantilla total semana"
            valor={`${plantillaTotal(periodo)} empleados`}
            pie="Activos antes de la fecha de corte"
            icono={<PeopleAltIcon fontSize="small" />}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={700} color="#0f172a" sx={{ mb: 2 }}>
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
