import { Box, Button, Paper, Stack, Typography } from "@mui/material"
import FilterAltOffOutlinedIcon from "@mui/icons-material/FilterAltOffOutlined"
import { CARD_SX, COLOR, SECTION_LABEL_SX } from "../../../shared/ui"

/**
 * El marco de los filtros, igual en las dos pestañas de mantenimiento.
 *
 * Cada panel pone sus campos; lo compartido es el encabezado, el acomodo y el
 * botón de limpiar, para que las dos listas se busquen de la misma forma.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.children Los campos de filtro.
 * @param {boolean} props.hayFiltros Si hay algo que limpiar.
 * @param {Function} props.onLimpiar Qué hacer al limpiar.
 * @param {string} [props.resumen] Cuántos registros quedan tras filtrar.
 * @returns {object} La barra renderizada.
 */
export function BarraFiltros({ children, hayFiltros, onLimpiar, resumen }) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, mb: 2.5, bgcolor: COLOR.BLANCO }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1.5 }}>
        <Typography variant="overline" sx={SECTION_LABEL_SX}>
          Filtros de búsqueda
        </Typography>
        {resumen ? (
          <Typography variant="caption" color={COLOR.APAGADO}>
            {resumen}
          </Typography>
        ) : null}
      </Stack>

      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap alignItems="center">
        {children}

        <Box sx={{ flexGrow: 1 }} />

        <Button
          size="small"
          color="inherit"
          startIcon={<FilterAltOffOutlinedIcon />}
          disabled={!hayFiltros}
          onClick={onLimpiar}
          sx={{ textTransform: "none", fontWeight: 700, color: COLOR.TEXTO_SUAVE }}
        >
          Limpiar
        </Button>
      </Stack>
    </Paper>
  )
}
