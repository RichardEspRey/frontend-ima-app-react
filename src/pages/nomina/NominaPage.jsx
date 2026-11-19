import { Button, Chip, Container, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"
import LockOutlinedIcon from "@mui/icons-material/LockOutlined"
import LockOpenIcon from "@mui/icons-material/LockOpen"
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts"
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined"

import { DataTable, PageHeader, notify } from "../../shared/ui"
import { CHIP_SX, DARK_BTN_SX, CELL_STRONG_SX, GHOST_BTN_SX } from "../../shared/ui/estilos"
import {
  estaPendiente,
  etiquetaPeriodo,
  usePeriodos,
  useAutorizarPeriodo,
} from "../../entities/payroll"
import { COLOR, TINTE } from "../../shared/ui/tokens"

const CHIP_NEUTRO_SX = { ...CHIP_SX, bgcolor: COLOR.LIENZO, color: COLOR.TEXTO_SUAVE, border: `1px solid ${COLOR.BORDE}` }

const BOTON_FILA_SX = { ...GHOST_BTN_SX, px: 1.5, py: 0.4, fontSize: "0.78rem" }

const AUTORIZAR_BTN_SX = {
  textTransform: "none",
  fontWeight: 700,
  borderRadius: 2,
  px: 1.5,
  py: 0.4,
  fontSize: "0.78rem",
  boxShadow: "none",
  bgcolor: TINTE.AMBAR.acento,
  color: COLOR.BLANCO,
  "&:hover": { bgcolor: TINTE.AMBAR.texto, boxShadow: "none" },
}

const MONTO_SX = { fontWeight: 700, color: COLOR.TINTA, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }

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
          <Typography variant="caption" color={COLOR.TEXTO_SUAVE} sx={{ fontVariantNumeric: "tabular-nums" }}>
            Corte {p.fecha_corte || "sin fecha"}
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
          label={`${p.emps_mx} personas`}
          size="small"
          sx={{ ...CHIP_SX, bgcolor: COLOR.EXITO_FONDO, color: COLOR.EXITO, border: `1px solid ${COLOR.EXITO_BORDE}` }}
        />
      ),
    },
    {
      id: "total_mx",
      label: "Nómina MXN",
      ordenable: true,
      align: "right",
      render: (p) => (
        <Typography variant="body2" sx={MONTO_SX}>
          {dinero(p.total_mx, "es-MX")}{" "}
          <Typography component="span" variant="caption" color={COLOR.APAGADO}>MXN</Typography>
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
          label={`${p.emps_us} personas`}
          size="small"
          sx={{ ...CHIP_SX, bgcolor: COLOR.INFO_FONDO, color: COLOR.INFO, border: `1px solid ${COLOR.INFO_BORDE}` }}
        />
      ),
    },
    {
      id: "total_us",
      label: "Nómina USD",
      ordenable: true,
      align: "right",
      render: (p) => (
        <Typography variant="body2" sx={MONTO_SX}>
          {dinero(p.total_us, "en-US")}{" "}
          <Typography component="span" variant="caption" color={COLOR.APAGADO}>USD</Typography>
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
            size="small"
            startIcon={<LockOpenIcon sx={{ fontSize: 16 }} />}
            disabled={autorizar.isPending}
            onClick={() => alAutorizar(p)}
            sx={AUTORIZAR_BTN_SX}
          >
            Autorizar pago
          </Button>
        ) : (
          <Chip label="Cerrado" icon={<LockOutlinedIcon sx={{ fontSize: 14 }} />} size="small" sx={CHIP_NEUTRO_SX} />
        ),
    },
    {
      id: "detalle",
      label: "Detalle",
      align: "center",
      render: (p) => (
        <Button
          variant="outlined"
          size="small"
          startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => navigate(`/detalle-pago/${p.period_id}`)}
          sx={BOTON_FILA_SX}
        >
          Resumen
        </Button>
      ),
    },
  ]

  return (
    <Container maxWidth="xl" sx={{ py: 4, pb: 10 }}>
      <PageHeader
        seccion="Finanzas · Nómina"
        titulo="Nómina Administrativa"
        descripcion="Control de nómina semanal y autorización de pagos."
        acciones={
          <Button
            variant="contained"
            startIcon={<ManageAccountsIcon />}
            onClick={() => navigate("/personal")}
            sx={DARK_BTN_SX}
          >
            Administrar Personal
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
