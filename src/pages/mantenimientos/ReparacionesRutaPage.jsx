import { Box, Typography } from "@mui/material"

import TablaReparaciones from "../../features/inspections/ui/TablaReparaciones"
import { PAGE_SHELL_SX, PAGE_OVERLINE_SX, PAGE_TITLE_SX } from "../../shared/ui/estilos"

/**
 * Reparaciones en ruta: averías atendidas durante un viaje.
 *
 * Es el encabezado más la tabla. La tabla vive aparte porque Safety también la
 * monta, dentro de una pestaña que ya tiene su propio título.
 *
 * @returns {object} La pantalla.
 */
const ReparacionesRutaPage = () => (
  <Box sx={PAGE_SHELL_SX}>
    <Box sx={{ mb: 4 }}>
      <Typography variant="overline" sx={PAGE_OVERLINE_SX}>
        Safety · Reparaciones
      </Typography>
      <Typography
        variant="h4"
        fontWeight={800}
        color="#0f172a"
        letterSpacing="-0.02em"
        sx={PAGE_TITLE_SX}
      >
        Reparaciones en Carretera
      </Typography>
      <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
        Reparaciones realizadas fuera de taller durante un viaje.
      </Typography>
    </Box>

    <TablaReparaciones />
  </Box>
)

export default ReparacionesRutaPage
