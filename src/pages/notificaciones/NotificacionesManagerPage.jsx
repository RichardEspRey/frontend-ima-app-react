import { Alert, Box } from "@mui/material"

import { SuscriptoresDeAvisos } from "../../features/notifications"
import { useSesion } from "../../shared/auth"
import { PAGE_SHELL_SX, PageHeader } from "../../shared/ui"

/**
 * Administración de quién recibe cada notificación.
 *
 * Solo la ven los administradores, igual que el gestor de accesos: decidir a
 * quién le llegan los avisos —BL firmados e inspecciones— es una decisión de
 * permisos.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function NotificacionesManagerPage() {
  const { esTotal } = useSesion()

  if (!esTotal) {
    return (
      <Box sx={PAGE_SHELL_SX}>
        <Alert severity="error">
          Acceso denegado. Solo los administradores pueden ver esta sección.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={PAGE_SHELL_SX}>
      <PageHeader
        seccion="Configuración"
        titulo="Notificaciones"
        descripcion="Qué avisos existen y quién los recibe en la campana."
      />

      <SuscriptoresDeAvisos />
    </Box>
  )
}
