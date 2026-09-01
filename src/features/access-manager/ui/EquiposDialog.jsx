import { useEffect, useState } from "react"
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import SearchIcon from "@mui/icons-material/Search"

import { notify } from "../../../shared/ui"
import {
  DARK_BTN_SX,
  DIALOG_ACTIONS_SX,
  DIALOG_CONTENT_SX,
  DIALOG_TITLE_SX,
  GHOST_BTN_SX,
  SECTION_LABEL_SX,
} from "../../../shared/ui/estilos"
import {
  useCrearEquipo,
  useEditarEquipo,
  useEliminarEquipo,
  useEquipos,
  useGuardarMiembros,
  useMiembros,
} from "../../../entities/team"
import { useUsuarios } from "../../../entities/user"

const FORM_VACIO = { name: "", description: "" }

/**
 * Gestor de equipos: crear, renombrar, borrar y asignar miembros.
 *
 * Los miembros se guardan por reemplazo, no de forma incremental: se manda la
 * lista completa, así que quien no esté en ella sale del equipo.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.abierto Si el diálogo está visible.
 * @param {Function} props.onCerrar Se llama al cerrar.
 * @returns {object} El diálogo renderizado.
 */
export function EquiposDialog({ abierto, onCerrar }) {
  const { data: equipos = [] } = useEquipos()
  const { data: usuarios = [] } = useUsuarios()

  const [equipoId, setEquipoId] = useState("")
  const [editandoId, setEditandoId] = useState(null)
  const [form, setForm] = useState(FORM_VACIO)
  const [busqueda, setBusqueda] = useState("")
  const [seleccionados, setSeleccionados] = useState([])

  const { data: miembros } = useMiembros(equipoId)
  const crear = useCrearEquipo()
  const editar = useEditarEquipo()
  const eliminar = useEliminarEquipo()
  const guardar = useGuardarMiembros()

  useEffect(() => {
    if (miembros) setSeleccionados(miembros)
  }, [miembros])

  const cambiar = (campo) => (evento) =>
    setForm((previo) => ({ ...previo, [campo]: evento.target.value }))

  const limpiarFormulario = () => {
    setForm(FORM_VACIO)
    setEditandoId(null)
  }

  const guardarEquipo = async () => {
    if (!form.name.trim()) return notify.aviso("El nombre del equipo es obligatorio.")

    try {
      if (editandoId) {
        await editar.mutateAsync({ teamId: editandoId, datos: form })
        notify.exito("Equipo actualizado")
      } else {
        await crear.mutateAsync(form)
        notify.exito("Equipo creado")
      }
      limpiarFormulario()
    } catch (e) {
      notify.error(e, "No se pudo guardar el equipo")
    }
  }

  const borrarEquipo = async (equipo) => {
    const acepto = await notify.confirmar({
      titulo: `¿Eliminar el equipo ${equipo.name}?`,
      mensaje: "Los usuarios no se borran, solo dejan de estar agrupados.",
      confirmar: "Sí, eliminar",
    })
    if (!acepto) return

    try {
      await eliminar.mutateAsync(equipo.id)
      if (String(equipoId) === String(equipo.id)) setEquipoId("")
      notify.exito("Equipo eliminado")
    } catch (e) {
      notify.error(e, "No se pudo eliminar el equipo")
    }
  }

  const alternarMiembro = (userId) =>
    setSeleccionados((previos) =>
      previos.includes(userId) ? previos.filter((id) => id !== userId) : [...previos, userId],
    )

  const guardarMiembros = async () => {
    try {
      await guardar.mutateAsync({ teamId: equipoId, miembros: seleccionados })
      notify.exito("Miembros actualizados")
    } catch (e) {
      notify.error(e, "No se pudieron guardar los miembros")
    }
  }

  const visibles = usuarios.filter((u) =>
    `${u.name} ${u.user}`.toLowerCase().includes(busqueda.toLowerCase()),
  )

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="md" fullWidth>
      <DialogTitle sx={DIALOG_TITLE_SX}>Gestor de equipos</DialogTitle>

      <DialogContent sx={DIALOG_CONTENT_SX}>
        <Typography variant="overline" sx={SECTION_LABEL_SX}>
          {editandoId ? "Editar equipo" : "Nuevo equipo"}
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ mb: 3, mt: 1 }} flexWrap="wrap">
          <TextField
            label="Nombre"
            value={form.name}
            onChange={cambiar("name")}
            size="small"
            sx={{ flex: "1 1 180px" }}
          />
          <TextField
            label="Descripción"
            value={form.description}
            onChange={cambiar("description")}
            size="small"
            sx={{ flex: "2 1 240px" }}
          />
          <Button variant="contained" onClick={guardarEquipo} sx={DARK_BTN_SX}>
            {editandoId ? "Guardar" : "Crear"}
          </Button>
          {editandoId && (
            <Button onClick={limpiarFormulario} sx={GHOST_BTN_SX}>
              Cancelar
            </Button>
          )}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="overline" sx={SECTION_LABEL_SX}>
          Equipos
        </Typography>
        <List dense sx={{ mb: 3 }}>
          {equipos.length === 0 && (
            <Typography variant="body2" color="text.secondary" fontStyle="italic" sx={{ py: 1 }}>
              Todavía no hay equipos.
            </Typography>
          )}
          {equipos.map((equipo) => (
            <ListItem
              key={equipo.id}
              secondaryAction={
                <>
                  <IconButton
                    size="small"
                    title="Editar"
                    onClick={() => {
                      setEditandoId(equipo.id)
                      setForm({ name: equipo.name, description: equipo.description ?? "" })
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    title="Eliminar"
                    sx={{ color: "#b91c1c" }}
                    onClick={() => borrarEquipo(equipo)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </>
              }
            >
              <ListItemText primary={equipo.name} secondary={equipo.description} />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="overline" sx={SECTION_LABEL_SX}>
          Miembros
        </Typography>
        <Box sx={{ mt: 1 }}>
          <Select
            value={equipoId}
            onChange={(evento) => setEquipoId(evento.target.value)}
            displayEmpty
            size="small"
            fullWidth
            sx={{ mb: 1.5 }}
          >
            <MenuItem value="">Selecciona un equipo…</MenuItem>
            {equipos.map((equipo) => (
              <MenuItem key={equipo.id} value={equipo.id}>
                {equipo.name}
              </MenuItem>
            ))}
          </Select>

          {equipoId && (
            <>
              <TextField
                placeholder="Buscar persona…"
                value={busqueda}
                onChange={(evento) => setBusqueda(evento.target.value)}
                size="small"
                fullWidth
                sx={{ mb: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <List dense sx={{ maxHeight: 260, overflowY: "auto" }}>
                {visibles.map((usuario) => (
                  <ListItem key={usuario.id} disablePadding>
                    <Checkbox
                      edge="start"
                      checked={seleccionados.includes(String(usuario.id))}
                      onChange={() => alternarMiembro(String(usuario.id))}
                    />
                    <ListItemText primary={usuario.name} secondary={usuario.nombreRol} />
                  </ListItem>
                ))}
              </List>
              <Button
                variant="contained"
                onClick={guardarMiembros}
                disabled={guardar.isPending}
                sx={{ ...DARK_BTN_SX, mt: 1 }}
              >
                {guardar.isPending ? "Guardando…" : "Guardar miembros"}
              </Button>
            </>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={DIALOG_ACTIONS_SX}>
        <Button onClick={onCerrar} sx={GHOST_BTN_SX}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
