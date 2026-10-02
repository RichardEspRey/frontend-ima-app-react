import { useState } from "react"
import { Box, Typography } from "@mui/material"
import { PanelInspecciones, PanelPendientes } from "../../features/maintenance"
import TablaOrdenes from "../../features/service-order/ui/TablaOrdenes.jsx"
import {
  COLOR,
  PAGE_OVERLINE_SX,
  PAGE_SHELL_SX,
  PAGE_TITLE_SX,
  Pestanas,
} from "../../shared/ui"

const PESTANAS = [
  { id: "inspecciones", etiqueta: "Inspecciones" },
  { id: "pendientes", etiqueta: "Reparaciones pendientes" },
  { id: "ordenes", etiqueta: "Órdenes de servicio" },
]

/**
 * El mantenimiento entero, de la inspección a la orden, en una sola pantalla.
 *
 * Las tres pestañas contestan tres preguntas distintas: qué reportaron los
 * operadores y nadie ha atendido, qué le debemos a cada unidad, y qué se mandó a
 * reparar. Antes eso vivía en dos pantallas y un Excel.
 *
 * Se montan de forma perezosa: cada panel pide sus datos cuando se abre.
 *
 * @returns {object} La pantalla.
 */
const MantenimientoPage = () => {
  const [pestana, setPestana] = useState("inspecciones")

  return (
    <Box sx={PAGE_SHELL_SX}>
      <Typography variant="overline" sx={PAGE_OVERLINE_SX}>
        Mantenimientos
      </Typography>
      <Typography variant="h4" fontWeight={800} color={COLOR.TINTA} sx={PAGE_TITLE_SX}>
        Mantenimiento
      </Typography>
      <Typography variant="body2" color={COLOR.APAGADO} sx={{ mb: 3 }}>
        De lo que reportó el operador a la orden de servicio, sin salir de aquí.
      </Typography>

      <Pestanas valor={pestana} onChange={setPestana} pestanas={PESTANAS} sx={{ mb: 3 }} />

      {pestana === "inspecciones" ? <PanelInspecciones /> : null}
      {pestana === "pendientes" ? <PanelPendientes /> : null}
      {pestana === "ordenes" ? <TablaOrdenes /> : null}
    </Box>
  )
}

export default MantenimientoPage
