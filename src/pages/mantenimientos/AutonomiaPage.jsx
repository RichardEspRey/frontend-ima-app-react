import { Box, Chip, Stack } from "@mui/material"

import { TablaAutonomia, useAutonomiaFlota } from "../../features/autonomia"
import { NIVEL_RENDIMIENTO, REGISTROS_POR_CAMION } from "../../entities/autonomy"
import { CHIP_NIVEL } from "../../features/autonomia/ui/coloresRendimiento"
import { BotonActualizar, PAGE_SHELL_SX, PageHeader } from "../../shared/ui"

/**
 * Rendimiento de la flota: millas por galón de cada camión.
 *
 * @returns {object} La pantalla.
 */
export default function AutonomiaPage() {
  const flota = useAutonomiaFlota()

  return (
    <Box sx={PAGE_SHELL_SX}>
      <PageHeader
        seccion="Mantenimiento · Autonomías"
        titulo="Autonomía (MPG)"
        descripcion={`${flota.camiones.length} unidades. Rendimiento de las últimas ${REGISTROS_POR_CAMION} cargas de más de 100 galones: distancia entre galones.`}
        acciones={
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip size="small" label="≥ 7 bueno" sx={CHIP_NIVEL[NIVEL_RENDIMIENTO.BUENO]} />
            <Chip size="small" label="5.5 – 7 regular" sx={CHIP_NIVEL[NIVEL_RENDIMIENTO.REGULAR]} />
            <Chip size="small" label="< 5.5 bajo" sx={CHIP_NIVEL[NIVEL_RENDIMIENTO.BAJO]} />
            <BotonActualizar onActualizar={() => flota.recargar()} actualizando={flota.recargando} />
          </Stack>
        }
      />
      <TablaAutonomia camiones={flota.camiones} cargando={flota.cargando} error={flota.mensajeError} />
    </Box>
  )
}
