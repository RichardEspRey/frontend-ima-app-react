import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import CloseIcon from "@mui/icons-material/Close"
import { COLOR } from "../../../shared/ui/tokens"

/**
 * Elige qué requisitos se ven como columna en la tabla.
 *
 * En camiones y conductores el cambio se guarda y aplica a todos; en cajas la
 * base no tiene dónde guardarlo, así que dura lo que dura la sesión y el modal
 * lo dice en vez de fingir que quedó guardado.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.abierto Si el modal se muestra.
 * @param {Function} props.onCerrar Cierra el modal.
 * @param {object} props.descriptor El descriptor del tipo de unidad.
 * @param {Array} props.requisitos Todos los requisitos del expediente.
 * @param {Array} props.ocultasLocales Claves ocultas solo en esta sesión.
 * @param {Function} props.onAlternar Recibe la clave del requisito que se tocó.
 * @returns {object} El modal renderizado.
 */
export function ModalColumnas({
  abierto,
  onCerrar,
  descriptor,
  requisitos = [],
  ocultasLocales = [],
  onAlternar,
}) {
  const estaVisible = (requisito) =>
    descriptor.columnasPersistidas
      ? !Number(requisito.oculto_en_tabla)
      : !ocultasLocales.includes(requisito.key_name)

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        Mostrar Columnas
        <IconButton onClick={onCerrar} size="small" sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Toca las etiquetas para encender o apagar las columnas de la tabla de{" "}
          {descriptor.etiquetas.plural.toLowerCase()}.
        </Typography>

        {descriptor.columnasPersistidas ? (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            El cambio aplica para todos los usuarios de inmediato.
          </Typography>
        ) : (
          <Alert severity="info" sx={{ mb: 3 }}>
            En {descriptor.etiquetas.plural.toLowerCase()} esta preferencia solo dura mientras la
            pantalla esté abierta: el servidor todavía no la guarda.
          </Alert>
        )}

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          {requisitos.map((requisito) => {
            const visible = estaVisible(requisito)
            return (
              <Chip
                key={requisito.key_name}
                label={requisito.label}
                onClick={() => onAlternar(requisito)}
                color={visible ? "primary" : "default"}
                variant={visible ? "filled" : "outlined"}
                icon={visible ? <CheckCircleIcon /> : undefined}
                sx={{
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  py: 1,
                  transition: "all 0.2s",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              />
            )
          })}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: COLOR.LIENZO, borderTop: `1px solid ${COLOR.BORDE}` }}>
        <Button onClick={onCerrar} variant="contained" disableElevation sx={{ bgcolor: COLOR.TINTA }}>
          Aplicar
        </Button>
      </DialogActions>
    </Dialog>
  )
}
