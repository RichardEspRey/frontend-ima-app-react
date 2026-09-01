import { Button, Chip, Container, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"
import LockIcon from "@mui/icons-material/Lock"
import LockOpenIcon from "@mui/icons-material/LockOpen"
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts"
import PeopleAltIcon from "@mui/icons-material/PeopleAlt"
import VisibilityIcon from "@mui/icons-material/Visibility"

import { DataTable, PageHeader, notify } from "../../shared/ui"
import { CHIP_SX, DARK_BTN_SX, CELL_STRONG_SX } from "../../shared/ui/estilos"
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
          <Typography sx={CELL_STRONG_SX} fontWeight={700}>
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
          sx={{ ...CHIP_SX, bgcolor: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }}
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
          sx={{ ...CHIP_SX, bgcolor: "#eff6ff", color: "#1d4ed8", border: "1px solid #bfdbfe" }}
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
          <Chip label="Cerrado" icon={<LockIcon />} size="small" sx={CHIP_SX} />
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
        seccion="Finanzas"
        titulo="Nómina Administrativa"
        descripcion="Control de nómina semanal y autorización de pagos."
        acciones={
          <Button
            variant="contained"
            startIcon={<ManageAccountsIcon />}
            onClick={() => navigate("/personal")}
            sx={DARK_BTN_SX}
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
      />
    </Container>
  )
}
