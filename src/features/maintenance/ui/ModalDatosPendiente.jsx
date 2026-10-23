import { useState } from "react"
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material"
import { COLOR, DIALOG_PAPER_SX, SECTION_LABEL_SX } from "../../../shared/ui"
import { CamposOperadorFecha } from "./CamposOperadorFecha"

/**
 * Corrige el operador y la fecha de enviado de una reparación pendiente.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.reparacion La reparación, como la devuelve `getPendientes`.
 * @param {boolean} props.guardando Si el guardado está en curso.
 * @param {Function} props.onCancelar Qué hacer al cerrar sin guardar.
 * @param {Function} props.onGuardar Recibe `{id, driverId, fechaReporte}`.
 * @returns {object} El diálogo renderizado.
 */
export function ModalDatosPendiente({ reparacion, guardando, onCancelar, onGuardar }) {
  const [driverId, setDriverId] = useState(reparacion.driver_id ? String(reparacion.driver_id) : "")
  const [operador, setOperador] = useState(reparacion.operador || "")
  const [fechaReporte, setFechaReporte] = useState(reparacion.fecha_reporte || "")

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
          Reparación pendiente
        </Typography>
        <Typography variant="h6" fontWeight={800} color={COLOR.TINTA} sx={{ mt: 0.25 }}>
          Operador y fecha de enviado
        </Typography>
        <Typography variant="body2" color={COLOR.APAGADO} sx={{ mt: 0.5 }}>
          {reparacion.descripcion}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ mt: 1 }}>
          <CamposOperadorFecha
            driverId={driverId}
            operador={operador}
            fecha={fechaReporte}
            disabled={guardando}
            onCambiarOperador={(id, nombre) => {
              setDriverId(id)
              setOperador(nombre)
            }}
            onCambiarFecha={setFechaReporte}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onCancelar} color="inherit" disabled={guardando}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={guardando}
          onClick={() => onGuardar({ id: reparacion.id, driverId, fechaReporte })}
        >
          {guardando ? "Guardando…" : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
