import { useState } from "react"
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import dayjs from "dayjs"
import { archivosDelEvento, GRUPOS_ARCHIVO } from "../../../shared/security"

const CAMPOS = [
  { clave: "fecha", etiqueta: "Fecha y hora", tipo: "datetime-local", ancho: 12 },
  { clave: "odometro", etiqueta: "Odómetro *", tipo: "number", sufijo: "mi", ancho: 6 },
  { clave: "galones", etiqueta: "Galones *", tipo: "number", sufijo: "gal", ancho: 6 },
  { clave: "monto", etiqueta: "Monto Total *", tipo: "number", prefijo: "$", ancho: 6 },
  { clave: "estado", etiqueta: "Estado (State)", ayuda: "Ej. TX", ancho: 6 },
  { clave: "fleetone", etiqueta: "Fleet One", tipo: "number", prefijo: "$", ancho: 6 },
  { clave: "periodo", etiqueta: "Periodo", ayuda: "Ej. Q2", ancho: 6 },
]

/**
 * Los tres campos sin los que la carga no se puede registrar.
 *
 * @type {Array.<string>}
 */
export const OBLIGATORIOS_DIESEL = ["odometro", "galones", "monto"]

/**
 * Un formulario de carga manual en blanco, con la fecha de ahora.
 *
 * @returns {object} El formulario vacío.
 */
export const cargaEnBlanco = () => ({
  odometro: "",
  galones: "",
  monto: "",
  estado: "",
  fleetone: "",
  periodo: "",
  fecha: dayjs().format("YYYY-MM-DDTHH:mm"),
})

/**
 * Alta de una carga de diesel capturada a mano.
 *
 * Casi todas las cargas llegan solas del proveedor; esta pantalla es para las
 * que no, y por eso el registro queda marcado como manual.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.abierto Si el modal se muestra.
 * @param {Function} props.onCerrar Cierra el modal.
 * @param {object} props.formulario Los valores actuales.
 * @param {Function} props.onCampoChange Recibe `(campo, valor)`.
 * @param {Array} props.archivos Los tickets escogidos.
 * @param {Function} props.onArchivosChange Recibe los archivos.
 * @param {Function} props.onGuardar Registra la carga.
 * @param {boolean} [props.guardando] Si el guardado está en curso.
 * @returns {object} El modal renderizado.
 */
export function ModalDieselManual({
  abierto,
  onCerrar,
  formulario,
  onCampoChange,
  archivos = [],
  onArchivosChange,
  onGuardar,
  guardando,
}) {
  const [entrada, setEntrada] = useState(0)

  const agregarArchivos = async (evento) => {
    const nuevos = await archivosDelEvento(evento, { grupo: GRUPOS_ARCHIVO.DOCUMENTO })
    if (nuevos.length > 0) onArchivosChange([...archivos, ...nuevos])
    setEntrada((n) => n + 1)
  }

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="md" fullWidth scroll="paper">
      <DialogTitle
        sx={{
          bgcolor: "#f8f9fa",
          borderBottom: "1px solid #e0e0e0",
          fontWeight: 800,
          color: "primary.main",
          py: 2,
        }}
      >
        Registrar carga de diesel a mano
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, md: 4 }, bgcolor: "#f4f6f8" }}>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          {CAMPOS.map((campo) => (
            <Grid size={{ xs: 12, sm: campo.ancho }} key={campo.clave}>
              <TextField
                fullWidth
                size="small"
                label={campo.etiqueta}
                type={campo.tipo ?? "text"}
                value={formulario[campo.clave]}
                onChange={(e) => onCampoChange(campo.clave, e.target.value)}
                placeholder={campo.ayuda}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: campo.prefijo ? (
                    <InputAdornment position="start">{campo.prefijo}</InputAdornment>
                  ) : undefined,
                  endAdornment: campo.sufijo ? (
                    <InputAdornment position="end">{campo.sufijo}</InputAdornment>
                  ) : undefined,
                }}
              />
            </Grid>
          ))}

          <Grid size={{ xs: 12 }}>
            <Box sx={{ mt: 1 }}>
              <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
                Adjuntar tickets
                <input
                  key={entrada}
                  type="file"
                  hidden
                  multiple
                  onChange={agregarArchivos}
                />
              </Button>

              {archivos.length > 0 && (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                  {archivos.map((archivo, indice) => (
                    <Chip
                      key={`${archivo.name}-${indice}`}
                      label={archivo.name}
                      onDelete={() =>
                        onArchivosChange(archivos.filter((_, i) => i !== indice))
                      }
                      size="small"
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" color="text.secondary">
              Odómetro, galones y monto son obligatorios.
            </Typography>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, bgcolor: "#f8f9fa", borderTop: "1px solid #e0e0e0" }}>
        <Button onClick={onCerrar} color="inherit">
          Cancelar
        </Button>
        <Button variant="contained" onClick={onGuardar} disabled={guardando}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
