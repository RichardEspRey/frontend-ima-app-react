import { Button, Chip, Container, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"
import LockIcon from "@mui/icons-material/Lock"
import LockOpenIcon from "@mui/icons-material/LockOpen"
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts"
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"
import VisibilityIcon from "@mui/icons-material/Visibility"

import { DataTable, PageHeader, notify } from "../../shared/ui"
import {
  estaPendiente,
  etiquetaPeriodo,
  usePeriodos,
  useAutorizarPeriodo,
} from "../../entities/payroll"

const dinero = (monto, locale) =>
  `$${Number(monto).toLocaleString(locale, { minimumFractionDigits: 2 })}`

/**
 * Nómina administrativa: las semanas de pago y su autorización.
 *
 * @returns {object} La pantalla.
 */
export default function NominaPage() {
  const navigate = useNavigate()
  const { data: periodos = [], isLoading, isError, error } = usePeriodos()
  const autorizar = useAutorizarPeriodo()

  const alAutorizar = async (periodo) => {
    const acepto = await notify.confirmar({
      titulo: `¿Autorizar ${etiquetaPeriodo(periodo)}?`,
      mensaje: "Se cerrará el corte y no se podrán agregar más pagos a esta semana.",
      confirmar: "Sí, autorizar",
    })
    if (!acepto) return

    try {
      await autorizar.mutateAsync(periodo)
      notify.exito("Semana cerrada correctamente", "Autorizado")
    } catch (e) {
      notify.error(e, "No se pudo autorizar la semana")
    }
  }

  const columnas = [
    {
      id: "semana",
      label: "Semana",
      ordenable: true,
      valor: (p) => p.anio * 100 + p.semana,
      render: (p) => (
        <>
          <Typography fontWeight={800} color="primary.main">
            {etiquetaPeriodo(p)}
          </Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Corte: {p.fecha_corte || "sin fecha"}
          </Typography>
        </>
      ),
    },
    {
      id: "emps_mx",
      label: "Personal MX",
      ordenable: true,
      align: "center",
      render: (p) => (
        <Chip
          icon={<PeopleAltIcon />}
          label={p.emps_mx}
          size="small"
          sx={{ fontWeight: 600, bgcolor: "#e8f5e9", color: "#2e7d32" }}
        />
      ),
    },
    {
      id: "total_mx",
      label: "Nómina MXN",
      ordenable: true,
      align: "right",
      render: (p) => (
        <Typography color="success.main" fontWeight={800}>
          {dinero(p.total_mx, "es-MX")} MXN
        </Typography>
      ),
    },
    {
      id: "emps_us",
      label: "Personal US",
      ordenable: true,
      align: "center",
      render: (p) => (
        <Chip
          icon={<PeopleAltIcon />}
          label={p.emps_us}
          size="small"
          sx={{ fontWeight: 600, bgcolor: "#e3f2fd", color: "#0288d1" }}
        />
      ),
    },
    {
      id: "total_us",
      label: "Nómina USD",
      ordenable: true,
      align: "right",
      render: (p) => (
        <Typography color="primary.main" fontWeight={800}>
          {dinero(p.total_us, "en-US")} USD
        </Typography>
      ),
    },
    {
      id: "estado",
      label: "Estado",
      ordenable: true,
      align: "center",
      render: (p) =>
        estaPendiente(p) ? (
          <Button
            variant="contained"
            color="warning"
            size="small"
            startIcon={<LockOpenIcon />}
            disabled={autorizar.isPending}
            onClick={() => alAutorizar(p)}
            sx={{ textTransform: "none", fontWeight: 700, boxShadow: 0 }}
          >
            Autorizar pago
          </Button>
        ) : (
          <Chip label="Cerrado" icon={<LockIcon />} size="small" sx={{ fontWeight: 600 }} />
        ),
    },
    {
      id: "detalle",
      label: "Detalle",
      align: "center",
      render: (p) => (
        <Button
          variant="outlined"
          color="info"
          size="small"
          startIcon={<VisibilityIcon />}
          onClick={() => navigate(`/detalle-pago/${p.period_id}`)}
          sx={{ textTransform: "none", fontWeight: 600 }}
        >
          Resumen
        </Button>
      ),
    },
  ]

  return (
    <Container maxWidth="xl" sx={{ py: 4, pb: 10 }}>
      <PageHeader
        titulo="Nómina Administrativa"
        descripcion="Control de nómina semanal y autorización de pagos."
        acciones={
          <Button
            variant="contained"
            color="secondary"
            startIcon={<ManageAccountsIcon />}
            onClick={() => navigate("/personal")}
            sx={{ fontWeight: 600, textTransform: "none", px: 3, py: 1 }}
          >
            Administrar personal
          </Button>
        }
      />

      <DataTable
        filas={periodos}
        columnas={columnas}
        claveFila="period_id"
        cargando={isLoading}
        error={isError ? error.message : null}
        vacio="No hay semanas de nómina registradas."
        colorBorde="#1976d2"
      />
    </Container>
  )
}
