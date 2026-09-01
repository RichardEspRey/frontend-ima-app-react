import { useState } from "react"
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material"

import { notify } from "../../../shared/ui"
import { DARK_BTN_SX, DIALOG_ACTIONS_SX, DIALOG_CONTENT_SX, DIALOG_TITLE_SX, GHOST_BTN_SX } from "../../../shared/ui/estilos"
import { TIPO_USUARIO_API, useCrearUsuario, validarFormularioUsuario } from "../../../entities/user"

const VACIO = { name: "", user: "", pass: "", type: "", driver_id: "" }

/**
 * Alta de un usuario del sistema.
 *
 * El formulario vive aquí y no en la pantalla porque es un caso de uso completo:
 * captura, validación y guardado. La pantalla solo decide cuándo se abre.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.abierto Si el diálogo está visible.
 * @param {Function} props.onCerrar Se llama al cerrar, con o sin guardar.
 * @param {Array} props.conductores Conductores activos, para los usuarios de tipo Driver.
 * @returns {object} El diálogo renderizado.
 */
export function NuevoUsuarioDialog({ abierto, onCerrar, conductores = [] }) {
  const [form, setForm] = useState(VACIO)
  const crear = useCrearUsuario()

  const cambiar = (campo) => (evento) =>
    setForm((previo) => ({ ...previo, [campo]: evento.target.value }))

  const cerrar = () => {
    setForm(VACIO)
    onCerrar()
  }

  const guardar = async () => {
    const validacion = validarFormularioUsuario(form, { esAlta: true })
    if (!validacion.valido) return notify.aviso(validacion.mensaje)

    try {
      await crear.mutateAsync(form)
      notify.exito("Usuario creado correctamente")
      cerrar()
    } catch (e) {
      notify.error(e, "No se pudo crear el usuario")
    }
  }

  return (
    <Dialog open={abierto} onClose={cerrar} maxWidth="sm" fullWidth>
      <DialogTitle sx={DIALOG_TITLE_SX}>Nuevo usuario</DialogTitle>

      <DialogContent sx={DIALOG_CONTENT_SX}>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <TextField
            label="Nombre completo"
            value={form.name}
            onChange={cambiar("name")}
            fullWidth
            size="small"
          />
          <TextField
            label="Usuario de acceso"
            value={form.user}
            onChange={cambiar("user")}
            fullWidth
            size="small"
          />
          <TextField
            label="Contraseña"
            type="password"
            value={form.pass}
            onChange={cambiar("pass")}
            fullWidth
            size="small"
          />
          <TextField
            select
            label="Tipo de usuario"
            value={form.type}
            onChange={cambiar("type")}
            fullWidth
            size="small"
          >
            <MenuItem value={TIPO_USUARIO_API.ADMIN}>Administrador</MenuItem>
            <MenuItem value={TIPO_USUARIO_API.ADMINISTRATIVO}>Administrativo</MenuItem>
            <MenuItem value={TIPO_USUARIO_API.DRIVER}>Operador (conductor)</MenuItem>
          </TextField>

          {form.type === TIPO_USUARIO_API.DRIVER && (
            <Autocomplete
              options={conductores}
              getOptionLabel={(opcion) => opcion.nombre ?? ""}
              onChange={(_evento, valor) =>
                setForm((previo) => ({ ...previo, driver_id: valor?.driver_id ?? "" }))
              }
              renderInput={(params) => (
                <TextField {...params} label="Conductor asociado" size="small" />
              )}
            />
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={DIALOG_ACTIONS_SX}>
        <Button onClick={cerrar} sx={GHOST_BTN_SX}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={guardar} disabled={crear.isPending} sx={DARK_BTN_SX}>
          {crear.isPending ? "Creando…" : "Crear usuario"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
