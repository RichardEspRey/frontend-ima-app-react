import { Box, Paper, Typography } from "@mui/material"
import { CARD_SX, SECTION_LABEL_SX } from "./estilos"
import { COLOR } from "./tokens"

/**
 * Tarjeta de cifra: una etiqueta, un número grande y una nota al pie.
 *
 * Sigue el lenguaje del sistema, que es el del Expense Manager y el Administrador
 * de viajes: **tarjeta blanca con borde fino**, etiqueta gris en mayúsculas
 * espaciadas, y el color reservado para la cifra. Nada de fondos de color ni
 * barras laterales gruesas — eso compite con los datos en vez de destacarlos.
 *
 * El icono va junto a la etiqueta y no junto a la cifra, para que la fila de
 * tarjetas se lea de un vistazo por sus números.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.etiqueta Qué mide la tarjeta. Se pinta en mayúsculas.
 * @param {object} props.valor La cifra. Puede ser texto ya formateado.
 * @param {string} [props.pie] Nota pequeña bajo la cifra.
 * @param {string} [props.acento] Color de la cifra. Por omisión, el gris oscuro del sistema.
 * @param {object} [props.icono] Icono junto a la etiqueta.
 * @returns {object} La tarjeta renderizada.
 *
 * @example
 * <StatCard
 *   etiqueta="Nómina total (MXN)"
 *   valor="$18,800.00"
 *   pie="Pagado a 7 empleado(s)"
 *   acento={COLOR.EXITO}
 * />
 */
export function StatCard({ etiqueta, valor, pie, acento = COLOR.TINTA, icono }) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, height: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
        {icono && <Box sx={{ display: "flex", color: COLOR.TENUE }}>{icono}</Box>}
        <Typography variant="overline" sx={SECTION_LABEL_SX}>
          {etiqueta}
        </Typography>
      </Box>

      <Typography variant="h4" fontWeight={800} letterSpacing="-0.02em" sx={{ color: acento }}>
        {valor}
      </Typography>

      {pie && (
        <Typography variant="body2" color={COLOR.APAGADO} sx={{ mt: 0.5 }}>
          {pie}
        </Typography>
      )}
    </Paper>
  )
}
