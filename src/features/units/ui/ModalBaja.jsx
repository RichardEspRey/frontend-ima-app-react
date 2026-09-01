import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material"

/**
 * Da de baja a un conductor, con su motivo y su fecha.
 *
 * No borra nada: el expediente sigue existiendo y el conductor pasa a la
 * pestaña de bajas, así que el aviso explica exactamente eso.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.abierto Si el modal se muestra.
 * @param {Function} props.onCerrar Cierra el modal.
 * @param {object} [props.conductor] El conductor que se va.
 * @param {object} props.datos Motivo, fecha y observaciones.
 * @param {Function} props.onDatosChange Recibe los datos con el cambio aplicado.
 * @param {Function} props.onConfirmar Ejecuta la baja.
 * @param {boolean} [props.guardando] Si la baja está en curso.
 * @returns {object} El modal renderizado.
 */
export function ModalBaja({
  abierto,
  onCerrar,
  conductor,
  datos,
  onDatosChange,
  onConfirmar,
  guardando,
}) {
  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, bgcolor: "#0f172a", color: "white" }}>
        Dar de baja a conductor
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Esta acción cambiará el estado del conductor a <b>&quot;Baja&quot;</b>.
          <br />
          El conductor ya no aparecerá en la lista de activos.
        </Alert>

        <Box mb={3} p={2} bgcolor="#f8fafc" borderRadius={2} border="1px solid #e2e8f0">
          <Typography variant="body2" color="text.secondary">
            Conductor
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            {conductor?.nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {conductor?.driver_id}
          </Typography>
        </Box>

        <Stack spacing={2}>
          <TextField
            label="Motivo de baja"
            required
            fullWidth
            size="small"
            value={datos.motivo}
            onChange={(e) => onDatosChange({ ...datos, motivo: e.target.value })}
          />
          <TextField
            label="Fecha de baja"
            type="date"
            required
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            value={datos.fecha}
            onChange={(e) => onDatosChange({ ...datos, fecha: e.target.value })}
          />
          <TextField
            label="Observaciones"
            fullWidth
            size="small"
            multiline
            rows={3}
            placeholder="Opcional..."
            value={datos.observaciones}
            onChange={(e) => onDatosChange({ ...datos, observaciones: e.target.value })}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
        <Button onClick={onCerrar} color="inherit">
          Cancelar
        </Button>
        <Button
          onClick={onConfirmar}
          variant="contained"
          color="error"
          disableElevation
          disabled={guardando}
        >
          Confirmar baja
        </Button>
      </DialogActions>
    </Dialog>
  )
}
