import { Alert, Box, Container } from "@mui/material"

import { SuscriptoresDeViajes } from "../../features/notifications"
import { useSesion } from "../../shared/auth"
import { PageHeader } from "../../shared/ui"

/**
 * Administración de quién recibe cada notificación.
 *
 * Solo la ven los administradores, igual que el gestor de accesos: decidir a
 * quién le llegan los avisos de los viajes es una decisión de permisos.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function NotificacionesManagerPage() {
  const { esTotal } = useSesion()

  if (!esTotal) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">
          Acceso denegado. Solo los administradores pueden ver esta sección.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageHeader
        titulo="Notificaciones Manager"
        descripcion="Funcionalidades disponibles y los usuarios que reciben sus notificaciones."
      />

      <Box sx={{ mt: 3 }}>
        <SuscriptoresDeViajes />
      </Box>
    </Container>
  )
}
