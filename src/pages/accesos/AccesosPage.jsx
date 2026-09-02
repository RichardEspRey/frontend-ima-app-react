import { useState } from "react"
import { Alert, Box, Button, Chip, Container, Tab, Tabs, TextField } from "@mui/material"
import GroupIcon from "@mui/icons-material/Group"
import PersonAddIcon from "@mui/icons-material/PersonAdd"

import { menuItemsConfig } from "../../config/menuConfig"
import { useConductoresActivos } from "../../entities/driver"
import { useSesion } from "../../shared/auth"
import { useAuthStore } from "../../store/useAuthStore"
import { DataTable, PageHeader, notify } from "../../shared/ui"
import { DARK_BTN_SX, GHOST_BTN_SX, CELL_STRONG_SX, CHIP_SX, TAB_SX, TABS_WRAPPER_SX } from "../../shared/ui/estilos"
import {
  TIPO_USUARIO_API,
  estaActivo,
  useActualizarUsuario,
  useCambiarPermisoUsuario,
  usePermisosUsuario,
  useUsuarios,
} from "../../entities/user"
import { EquiposDialog } from "../../features/access-manager/ui/EquiposDialog"
import { NuevoUsuarioDialog } from "../../features/access-manager/ui/NuevoUsuarioDialog"
import PermisosDrawer from "../../features/access-manager/ui/PermisosDrawer"

/**
 * Gestor de perfiles y accesos: usuarios, sus permisos y los equipos.
 *
 * La pantalla solo compone y decide qué diálogo está abierto. Cada caso de uso
 * —alta de usuario, equipos, permisos— vive en `features/access-manager`, y los
 * datos en `entities/user` y `entities/team`.
 *
 * Solo la ven los roles totales. Es una comprobación de experiencia, no de
 * seguridad: la autorización real vive en el servidor, y hoy la API no autentica.
 *
 * @returns {object} La pantalla.
 */
export default function AccesosPage() {
  const { esTotal, usuario } = useSesion()
  const refrescarPermisosPropios = useAuthStore((estado) => estado.fetchPermissions)
  const { data: usuarios = [], isLoading, isError, error } = useUsuarios()
  const { data: activeDrivers = [] } = useConductoresActivos()

  const [pestana, setPestana] = useState(0)
  const [busqueda, setBusqueda] = useState("")
  const [usuarioEnEdicion, setUsuarioEnEdicion] = useState(null)
  const [nuevoAbierto, setNuevoAbierto] = useState(false)
  const [equiposAbierto, setEquiposAbierto] = useState(false)

  const { data: permisos, isLoading: cargandoPermisos } = usePermisosUsuario(usuarioEnEdicion?.id)
  const cambiarPermiso = useCambiarPermisoUsuario()
  const actualizar = useActualizarUsuario()

  if (!esTotal) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Acceso denegado. Solo los administradores pueden ver esta sección.
        </Alert>
      </Container>
    )
  }

  const alCambiarPermiso = async (userId, featureId, _plataforma, concedido) => {
    try {
      await cambiarPermiso.mutateAsync({ userId, featureId, concedido })
      // Si el admin se cambió sus propios permisos, el menú tiene que reflejarlo.
      if (String(userId) === String(usuario?.id)) await refrescarPermisosPropios(userId)
    } catch (e) {
      notify.error(e, "No se pudo cambiar el permiso")
    }
  }

  const alGuardarUsuario = async (userId, datos) => {
    try {
      await actualizar.mutateAsync({ userId, datos })
      notify.exito("Usuario actualizado")
      setUsuarioEnEdicion(null)
    } catch (e) {
      notify.error(e, "No se pudo actualizar el usuario")
    }
  }

  // Los conductores van en su propia pestaña: son 16 de 31 y su acceso es a la
  // app móvil, así que mezclarlos con el personal de oficina hace más difícil
  // encontrar a cualquiera de los dos.
  const esConductor = (usuario) => usuario.type === TIPO_USUARIO_API.DRIVER
  const dePestana = usuarios.filter((u) => (pestana === 1 ? esConductor(u) : !esConductor(u)))
  const visibles = busqueda
    ? dePestana.filter((u) =>
        `${u.name} ${u.user}`.toLowerCase().includes(busqueda.trim().toLowerCase()),
      )
    : dePestana

  const columnas = [
    { id: "name", label: "Nombre", ordenable: true, sx: CELL_STRONG_SX },
    { id: "user", label: "Usuario", ordenable: true },
    {
      id: "rol",
      label: "Rol",
      ordenable: true,
      valor: (u) => u.nombreRol,
      render: (u) => <Chip label={u.nombreRol} size="small" variant="outlined" sx={CHIP_SX} />,
    },
    {
      id: "active",
      label: "Estado",
      ordenable: true,
      align: "center",
      render: (u) => (
        <Chip
          label={estaActivo(u) ? "Activo" : "Inactivo"}
          size="small"
          sx={
            estaActivo(u)
              ? { ...CHIP_SX, bgcolor: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" }
              : { ...CHIP_SX, bgcolor: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" }
          }
        />
      ),
    },
    {
      id: "acciones",
      label: "",
      align: "right",
      render: (u) => (
        <Button size="small" onClick={() => setUsuarioEnEdicion(u)} sx={GHOST_BTN_SX}>
          Gestionar accesos
        </Button>
      ),
    },
  ]

  return (
    <Container maxWidth="xl" sx={{ py: 4, pb: 10 }}>
      <PageHeader
        seccion="Administración"
        titulo="Gestor de Perfiles y Accesos"
        descripcion="Usuarios, permisos por plataforma y equipos de trabajo."
        acciones={
          <>
            <Button
              variant="outlined"
              startIcon={<GroupIcon />}
              onClick={() => setEquiposAbierto(true)}
              sx={GHOST_BTN_SX}
            >
              Gestor de equipos
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => setNuevoAbierto(true)}
              sx={DARK_BTN_SX}
            >
              Nuevo usuario
            </Button>
          </>
        }
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
        <Tabs
          value={pestana}
          onChange={(_evento, valor) => setPestana(valor)}
          sx={TABS_WRAPPER_SX}
          TabIndicatorProps={{ sx: { display: "none" } }}
        >
          <Tab label={`Personal (${usuarios.filter((u) => !esConductor(u)).length})`} sx={TAB_SX} />
          <Tab label={`Conductores (${usuarios.filter(esConductor).length})`} sx={TAB_SX} />
        </Tabs>

        <TextField
          placeholder="Buscar por nombre o usuario…"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          size="small"
          sx={{ minWidth: 260, mb: 3 }}
        />
      </Box>

      <DataTable
        filas={visibles}
        columnas={columnas}
        cargando={isLoading}
        error={isError ? error.message : null}
        vacio={busqueda ? "Nadie coincide con la búsqueda." : "No hay usuarios registrados."}
        porPagina={10}
      />

      <PermisosDrawer
        open={Boolean(usuarioEnEdicion)}
        handleClose={() => setUsuarioEnEdicion(null)}
        user={usuarioEnEdicion}
        featuresDesktop={permisos?.escritorio ?? []}
        featuresMobile={permisos?.movil ?? []}
        featuresLoading={cargandoPermisos}
        onToggleFeature={alCambiarPermiso}
        onUpdateUser={alGuardarUsuario}
        sectionsToManage={menuItemsConfig}
      />

      <NuevoUsuarioDialog
        abierto={nuevoAbierto}
        onCerrar={() => setNuevoAbierto(false)}
        conductores={activeDrivers}
      />

      <EquiposDialog abierto={equiposAbierto} onCerrar={() => setEquiposAbierto(false)} />
    </Container>
  )
}
