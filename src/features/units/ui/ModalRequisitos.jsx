import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"

const CATEGORIAS_SUGERIDAS = ["USA", "MEX", "Otros"]

/**
 * Configura qué documentos se le exigen a un tipo de unidad.
 *
 * Lo que se crea aquí se convierte en una columna de la tabla y en un campo del
 * expediente, sin tocar código.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.abierto Si el modal se muestra.
 * @param {Function} props.onCerrar Cierra el modal.
 * @param {object} props.descriptor El descriptor del tipo de unidad.
 * @param {Array} props.requisitos Los requisitos ya configurados.
 * @param {object} props.nuevo El requisito que se está creando.
 * @param {Function} props.onNuevoChange Recibe el requisito con el cambio aplicado.
 * @param {Function} props.onCrear Da de alta el requisito nuevo.
 * @param {Function} props.onEliminar Recibe el requisito a quitar.
 * @param {boolean} [props.guardando] Si hay una operación en curso.
 * @returns {object} El modal renderizado.
 */
export function ModalRequisitos({
  abierto,
  onCerrar,
  descriptor,
  requisitos = [],
  nuevo,
  onNuevoChange,
  onCrear,
  onEliminar,
  guardando,
}) {
  const categorias = [
    ...new Set([...CATEGORIAS_SUGERIDAS, ...requisitos.map((r) => r.categoria)]),
  ].filter(Boolean)

  return (
    <Dialog open={abierto} onClose={onCerrar} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ fontWeight: 800, display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        Configurar Requisitos de {descriptor.etiquetas.singular}
        <IconButton onClick={onCerrar} size="small" sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <Box sx={{ bgcolor: "#f8fafc", p: 2, borderRadius: 2, border: "1px solid #e2e8f0" }}>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>
              Requisitos Activos:
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {requisitos.map((requisito) => (
                <Chip
                  key={requisito.key_name}
                  label={requisito.label}
                  onDelete={() => onEliminar(requisito)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Stack>
          </Box>

          <Divider />

          <Typography variant="subtitle2" fontWeight={700}>
            Crear Nuevo Requisito
          </Typography>

          <TextField
            label="Nombre del Requisito"
            fullWidth
            size="small"
            value={nuevo.label}
            onChange={(e) => onNuevoChange({ ...nuevo, label: e.target.value })}
            placeholder="Ej. Tarjeta de Circulación"
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                select
                label="Categoría (Región)"
                size="small"
                fullWidth
                value={nuevo.categoria}
                onChange={(e) => onNuevoChange({ ...nuevo, categoria: e.target.value })}
              >
                {categorias.map((categoria) => (
                  <MenuItem key={categoria} value={categoria}>
                    {categoria}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                select
                label="Tipo de Dato"
                size="small"
                fullWidth
                value={nuevo.tipo}
                onChange={(e) => onNuevoChange({ ...nuevo, tipo: e.target.value })}
              >
                <MenuItem value="file">Subir Archivo</MenuItem>
                <MenuItem value="text">Texto Libre</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {nuevo.tipo === "file" && (
            <FormControlLabel
              control={
                <Switch
                  checked={nuevo.tiene_vencimiento}
                  onChange={(e) => onNuevoChange({ ...nuevo, tiene_vencimiento: e.target.checked })}
                />
              }
              label="Requiere Vencimiento"
            />
          )}

          <Button variant="contained" onClick={onCrear} disableElevation disabled={guardando}>
            Agregar al Expediente
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  )
}
