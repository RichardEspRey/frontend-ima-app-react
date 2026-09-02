import { Box, Typography } from "@mui/material"

import TablaInspecciones from "../../features/inspections/ui/TablaInspecciones"
import { PAGE_SHELL_SX, PAGE_OVERLINE_SX, PAGE_TITLE_SX } from "../../shared/ui/estilos"
import { COLOR } from "../../shared/ui/tokens"

/**
 * Inspecciones operativas hechas a los camiones en ruta.
 *
 * Es el encabezado más la tabla. La tabla vive aparte porque Safety también la
 * monta, dentro de una pestaña que ya tiene su propio título.
 *
 * @returns {object} La pantalla.
 */
const InspeccionesPage = () => (
  <Box sx={PAGE_SHELL_SX}>
    <Box sx={{ mb: 4 }}>
      <Typography variant="overline" sx={PAGE_OVERLINE_SX}>
        Safety · Inspecciones
      </Typography>
      <Typography
        variant="h4"
        fontWeight={800}
        color={COLOR.TINTA}
        letterSpacing="-0.02em"
        sx={PAGE_TITLE_SX}
      >
        Inspecciones Operativas
      </Typography>
      <Typography variant="body2" color={COLOR.APAGADO} sx={{ mt: 0.5 }}>
        Inspecciones realizadas a las unidades durante un viaje.
      </Typography>
    </Box>

    <TablaInspecciones />
  </Box>
)

export default InspeccionesPage
