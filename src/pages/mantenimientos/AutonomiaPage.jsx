import { Box } from "@mui/material"

import { TablaAutonomia, useAutonomiaFlota } from "../../features/autonomia"
import { REGISTROS_POR_CAMION } from "../../entities/autonomy"
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
        seccion="Mantenimientos"
        titulo="Autonomía (MPG)"
        descripcion={`${flota.camiones.length} unidades. Rendimiento de las últimas ${REGISTROS_POR_CAMION} cargas de más de 100 galones: distancia entre galones.`}
        acciones={<BotonActualizar onActualizar={() => flota.recargar()} actualizando={flota.recargando} />}
      />
      <TablaAutonomia camiones={flota.camiones} cargando={flota.cargando} error={flota.mensajeError} />
    </Box>
  )
}
