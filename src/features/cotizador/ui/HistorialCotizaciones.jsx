import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"

/**
 * El historial de cotizaciones guardadas.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.abierto Si el modal se muestra.
 * @param {Function} props.onCerrar Cierra el modal.
 * @param {Array} props.cotizaciones Las cotizaciones guardadas.
 * @param {boolean} props.cargando Si se están pidiendo.
 * @param {string} [props.error] Qué falló al pedirlas.
 * @param {Function} props.onElegir Recibe la cotización que se abre.
 * @param {Function} props.onEliminar Recibe el id de la que se borra.
 * @returns {object} El modal renderizado.
 */
export function HistorialCotizaciones({
  abierto,
  onCerrar,
  cotizaciones = [],
  cargando,
  error,
  onElegir,
  onEliminar,
}) {
  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle>Historial de cotizaciones</DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {cargando ? (
          <Stack alignItems="center" sx={{ p: 3 }}>
            <CircularProgress size={24} />
          </Stack>
        ) : error ? (
          <Typography variant="body2" color="error" sx={{ p: 3 }}>
            {error}
          </Typography>
        ) : cotizaciones.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>
            No hay cotizaciones guardadas.
          </Typography>
        ) : (
          <List disablePadding>
            {cotizaciones.map((cotizacion) => (
              <ListItem
                key={cotizacion.id}
                disablePadding
                divider
                secondaryAction={
                  <IconButton edge="end" size="small" onClick={() => onEliminar(cotizacion.id)}>
                    <DeleteOutlineIcon fontSize="small" sx={{ color: "error.light" }} />
                  </IconButton>
                }
              >
                <ListItemButton onClick={() => onElegir(cotizacion)}>
                  <ListItemText
                    primary={cotizacion.nombre}
                    secondary={
                      `${cotizacion.origen?.input || "—"} → ${cotizacion.destino?.input || "—"} · ` +
                      new Date(cotizacion.guardadaEn).toLocaleString("es-MX")
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onCerrar} sx={{ textTransform: "none" }}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
