import { useEffect, useState } from "react"
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined"

import { statusCajaDe } from "../../../entities/trip"
import { COLOR, Selector } from "../../../shared/ui"

/**
 * Pregunta el status de la caja antes de marcar un viaje como casi finalizado.
 *
 * Las opciones dependen del país del viaje y las decide la entidad, no este
 * componente: aquí solo se pintan.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.abierto Si el diálogo se muestra.
 * @param {string} [props.numeroViaje] Número del viaje, para el encabezado.
 * @param {string} [props.pais] Código de país del viaje.
 * @param {boolean} [props.guardando] Si la petición está en curso.
 * @param {Function} props.onCancelar Cierra sin registrar nada.
 * @param {Function} props.onConfirmar Recibe el status elegido.
 * @returns {object} El diálogo renderizado.
 */
export function ModalStatusCaja({
  abierto,
  numeroViaje,
  pais,
  guardando = false,
  onCancelar,
  onConfirmar,
}) {
  const [status, setStatus] = useState("")
  const opciones = statusCajaDe(pais)

  useEffect(() => {
    if (abierto) setStatus("")
  }, [abierto])

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
            Marcar Almost Over
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
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <Inventory2OutlinedIcon sx={{ fontSize: 18, color: COLOR.TENUE }} />
          <Typography variant="body2" fontWeight={600} color={COLOR.TEXTO}>
            ¿Cuál es el status de la caja?
          </Typography>
        </Stack>

        <Selector
          valor={status}
          onChange={setStatus}
          opciones={opciones.map((opcion) => ({ valor: opcion, etiqueta: opcion }))}
          deshabilitado={guardando}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button onClick={onCancelar} disabled={guardando} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={() => onConfirmar(status)}
          disabled={!status || guardando}
        >
          {guardando ? "Enviando…" : "Enviar"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
