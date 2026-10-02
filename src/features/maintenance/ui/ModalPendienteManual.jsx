import { useEffect, useState } from "react"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { UNIDAD } from "../../../entities/maintenance-point"
import { useCamionesActivos } from "../../../entities/truck"
import { useCajasActivas } from "../../../entities/trailer"
import { COLOR, DIALOG_PAPER_SX, Pestanas, SECTION_LABEL_SX } from "../../../shared/ui"

const LARGO_DESCRIPCION = 250

const LADOS = [
  { id: UNIDAD.CAMION, etiqueta: "Camión" },
  { id: UNIDAD.CAJA, etiqueta: "Caja" },
]

/**
 * Levanta una reparación pendiente que nadie reportó en un viaje.
 *
 * Es la otra mitad del reporte: lo que el taller ve con la unidad enfrente y no
 * pasó por el checklist del operador. Sin esto, eso seguiría viviendo en el Excel.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.unidadTipo El lado en el que se abrió, `camion` o `caja`.
 * @param {boolean} props.guardando Si la alta está en curso.
 * @param {Function} props.onCancelar Qué hacer al cerrar sin guardar.
 * @param {Function} props.onGuardar Recibe `{unidadTipo, unidadId, descripcion}`.
 * @returns {object} El diálogo renderizado.
 */
export function ModalPendienteManual({ unidadTipo: tipoInicial, guardando, onCancelar, onGuardar }) {
  const [unidadTipo, setUnidadTipo] = useState(tipoInicial || UNIDAD.CAMION)
  const [unidadId, setUnidadId] = useState("")
  const [descripcion, setDescripcion] = useState("")

  const { data: camiones } = useCamionesActivos()
  const { data: cajas } = useCajasActivas()

  useEffect(() => {
    setUnidadId("")
  }, [unidadTipo])

  const opciones =
    unidadTipo === UNIDAD.CAJA
      ? (cajas ?? []).map((caja) => ({ valor: caja.caja_id, etiqueta: caja.no_caja }))
      : (camiones ?? []).map((camion) => ({ valor: camion.truck_id, etiqueta: camion.unidad }))

  return (
    <Dialog
      open
      onClose={guardando ? undefined : onCancelar}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: DIALOG_PAPER_SX }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="overline" sx={SECTION_LABEL_SX}>
          Mantenimiento
        </Typography>
        <Typography variant="h6" fontWeight={800} color={COLOR.TINTA} sx={{ mt: 0.25 }}>
          Levantar reparación pendiente
        </Typography>
        <Typography variant="body2" color={COLOR.APAGADO} sx={{ mt: 0.5 }}>
          Para lo que el taller vio y nadie reportó en un viaje.
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <Pestanas valor={unidadTipo} onChange={setUnidadTipo} pestanas={LADOS} />

          <TextField
            select
            size="small"
            label={unidadTipo === UNIDAD.CAJA ? "Caja" : "Camión"}
            value={unidadId}
            disabled={guardando}
            onChange={(evento) => setUnidadId(evento.target.value)}
          >
            {opciones.map((opcion) => (
              <MenuItem key={opcion.valor} value={opcion.valor}>
                {opcion.etiqueta}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            multiline
            minRows={2}
            maxRows={4}
            label="Qué hay que atender"
            value={descripcion}
            disabled={guardando}
            onChange={(evento) => setDescripcion(evento.target.value.slice(0, LARGO_DESCRIPCION))}
            inputProps={{ maxLength: LARGO_DESCRIPCION }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCancelar} color="inherit" disabled={guardando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={!unidadId || !descripcion.trim() || guardando}
          onClick={() => onGuardar({ unidadTipo, unidadId, descripcion: descripcion.trim() })}
        >
          {guardando ? "Guardando…" : "Levantar"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
