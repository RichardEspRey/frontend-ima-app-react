import { useEffect, useState } from "react"
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"

import { ahoraParaCampo, validarFechasFinalizacion } from "../../../entities/trip"
import { COLOR } from "../../../shared/ui"

/**
 * Pide cuándo inició y cuándo terminó un viaje antes de finalizarlo.
 *
 * Con esas fechas se arma después el resumen de la ruta que hizo la unidad. La
 * validación la decide la entidad; aquí solo se pinta el aviso.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.abierto Si el diálogo se muestra.
 * @param {string} [props.numeroViaje] Número del viaje, para el encabezado.
 * @param {boolean} [props.guardando] Si la petición está en curso.
 * @param {Function} props.onCancelar Cierra sin finalizar.
 * @param {Function} props.onConfirmar Recibe `{inicio, fin}` ya validadas.
 * @returns {object} El diálogo renderizado.
 */
export function ModalFinalizarViaje({
  abierto,
  numeroViaje,
  guardando = false,
  onCancelar,
  onConfirmar,
}) {
  const [inicio, setInicio] = useState("")
  const [fin, setFin] = useState("")
  const [aviso, setAviso] = useState(null)
  const tope = ahoraParaCampo()

  useEffect(() => {
    if (!abierto) return
    setInicio("")
    setFin(ahoraParaCampo())
    setAviso(null)
  }, [abierto])

  const confirmar = () => {
    const problema = validarFechasFinalizacion({ inicio, fin })
    if (problema) return setAviso(problema)
    return onConfirmar({ inicio, fin })
  }

  return (
    <Dialog
      open={abierto}
      onClose={guardando ? undefined : onCancelar}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", pb: 1 }}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ color: COLOR.TENUE, fontWeight: 700, letterSpacing: "0.08em" }}
          >
            Finalizar viaje
          </Typography>
          <Typography variant="h6" fontWeight={800} color={COLOR.TINTA} sx={{ mt: 0.25 }}>
            Viaje #{numeroViaje}
          </Typography>
        </Box>

        <IconButton onClick={onCancelar} disabled={guardando} sx={{ color: COLOR.APAGADO }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color={COLOR.TEXTO} sx={{ mb: 2 }}>
          El viaje será completado. Indica cuándo inició y cuándo terminó.
        </Typography>

        <Stack spacing={2}>
          <TextField
            type="datetime-local"
            size="small"
            label="Fecha de inicio"
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: tope }}
            value={inicio}
            disabled={guardando}
            onChange={(evento) => setInicio(evento.target.value)}
          />
          <TextField
            type="datetime-local"
            size="small"
            label="Fecha final"
            InputLabelProps={{ shrink: true }}
            inputProps={{ max: tope }}
            value={fin}
            disabled={guardando}
            onChange={(evento) => setFin(evento.target.value)}
          />
          {aviso ? <Alert severity="warning">{aviso}</Alert> : null}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button onClick={onCancelar} disabled={guardando} color="inherit">
          Cancelar
        </Button>
        <Button variant="contained" onClick={confirmar} disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
