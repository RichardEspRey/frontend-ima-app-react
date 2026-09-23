import { useEffect, useState } from "react"
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material"
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined"

import { archivoDelEvento } from "../../../shared/security"
import { CampoFecha, COLOR, aTextoFecha } from "../../../shared/ui"

/**
 * Sube la fianza de una caja: el archivo y hasta cuándo vale.
 *
 * La fecha se captura con {@link CampoFecha}, que convierte en hora local; la
 * pantalla vieja mandaba la fecha por UTC y guardaba el día anterior cuando se
 * capturaba por la tarde.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} [props.caja] La caja cuya fianza se sube; `null` cierra el diálogo.
 * @param {boolean} [props.guardando=false] Si la subida está en curso.
 * @param {Function} props.onCancelar Cierra sin subir nada.
 * @param {Function} props.onConfirmar Recibe `{archivo, vencimiento}`.
 * @returns {object} El diálogo renderizado.
 */
export function ModalFianza({ caja, guardando = false, onCancelar, onConfirmar }) {
  const [archivo, setArchivo] = useState(null)
  const [vence, setVence] = useState(null)

  useEffect(() => {
    if (caja) {
      setArchivo(null)
      setVence(null)
    }
  }, [caja])

  return (
    <Dialog
      open={Boolean(caja)}
      onClose={guardando ? undefined : onCancelar}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography
          variant="overline"
          sx={{ color: COLOR.TENUE, fontWeight: 700, letterSpacing: "0.08em" }}
        >
          Expediente de la caja
        </Typography>
        <Typography variant="h6" fontWeight={800} color={COLOR.TINTA} sx={{ mt: 0.25 }}>
          Fianza de la caja {caja?.no_caja}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadOutlinedIcon />}
            disabled={guardando}
            sx={{ bgcolor: COLOR.BLANCO, textTransform: "none" }}
          >
            {archivo ? archivo.name : "Elegir documento"}
            <input
              type="file"
              hidden
              onChange={async (evento) => {
                const elegido = await archivoDelEvento(evento)
                if (elegido) setArchivo(elegido)
              }}
            />
          </Button>

          <CampoFecha label="Vence" value={vence} onChange={setVence} disabled={guardando} />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
        <Button onClick={onCancelar} disabled={guardando} color="inherit">
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={!archivo || !vence || guardando}
          onClick={() => onConfirmar({ archivo, vencimiento: aTextoFecha(vence) })}
        >
          {guardando ? "Subiendo…" : "Subir fianza"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
