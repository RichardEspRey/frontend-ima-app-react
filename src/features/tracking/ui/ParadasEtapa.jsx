import { Chip, CircularProgress, Stack, Typography } from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked"

import { ESTADO_PARADA, ETIQUETA_PARADA, avanceParadas } from "../../../entities/tracking"

const ICONO = {
  [ESTADO_PARADA.COMPLETADA]: CheckCircleIcon,
  [ESTADO_PARADA.EN_CURSO]: LocalShippingIcon,
  [ESTADO_PARADA.PENDIENTE]: RadioButtonUncheckedIcon,
}

const COLOR_ICONO = {
  [ESTADO_PARADA.COMPLETADA]: "#16a34a",
  [ESTADO_PARADA.EN_CURSO]: "#f59e0b",
  [ESTADO_PARADA.PENDIENTE]: "#cbd5e1",
}

/**
 * Las paradas adicionales de la etapa, con su avance.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array} props.paradas Las paradas con su estado.
 * @param {boolean} props.cargando Si todavía se están pidiendo.
 * @returns {(object|null)} La lista, o nada si la etapa no tiene paradas.
 */
export function ParadasEtapa({ paradas = [], cargando }) {
  if (cargando) {
    return (
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.5 }}>
        <CircularProgress size={12} />
        <Typography variant="caption" color="#94a3b8">
          Cargando paradas...
        </Typography>
      </Stack>
    )
  }

  if (paradas.length === 0) return null

  const { completadas, total } = avanceParadas(paradas)

  return (
    <Stack spacing={0.6} sx={{ mt: 1.5, pt: 1, borderTop: "1px dashed #bfdbfe" }}>
      <Typography variant="caption" fontWeight={700} color="#1d4ed8">
        Paradas Adicionales ({completadas}/{total} completadas)
      </Typography>

      {paradas.map((parada, indice) => {
        const Icono = ICONO[parada.stopStatus] ?? RadioButtonUncheckedIcon
        const etiqueta = ETIQUETA_PARADA[parada.stopStatus] ?? ETIQUETA_PARADA[ESTADO_PARADA.PENDIENTE]
        const completada = parada.stopStatus === ESTADO_PARADA.COMPLETADA
        const enCurso = parada.stopStatus === ESTADO_PARADA.EN_CURSO

        return (
          <Stack key={parada.stop_id ?? indice} direction="row" alignItems="center" spacing={1}>
            <Icono sx={{ fontSize: 16, color: COLOR_ICONO[parada.stopStatus], flexShrink: 0 }} />
            <Typography
              variant="caption"
              sx={{
                flexGrow: 1,
                color: etiqueta.color,
                fontWeight: enCurso ? 700 : 500,
                textDecoration: completada ? "line-through" : "none",
              }}
            >
              {parada.location}
            </Typography>
            <Chip
              label={etiqueta.texto}
              size="small"
              sx={{
                height: 16,
                fontSize: "0.58rem",
                fontWeight: 700,
                px: 0.3,
                bgcolor: etiqueta.fondo,
                color: etiqueta.color,
              }}
            />
          </Stack>
        )
      })}
    </Stack>
  )
}
