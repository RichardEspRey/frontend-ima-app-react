import {
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import { moneda } from "../../../shared/lib/formato"
import { COLOR } from "../../../shared/ui"

const LARGO_REPARACION = 100

/**
 * Los conceptos de un servicio, con la categoría y el gasto del que salieron.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array.<object>} props.detalles Los conceptos, sin la mano de obra.
 * @returns {object} La tabla renderizada.
 */
function ConceptosDeServicio({ detalles }) {
  return (
    <TableContainer sx={{ mt: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Concepto</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Categoría</TableCell>
            <TableCell align="right">Cant.</TableCell>
            <TableCell align="right">Costo u.</TableCell>
            <TableCell align="right">Subtotal</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {detalles.map((detalle) => (
            <TableRow key={detalle.uid}>
              <TableCell>
                {detalle.descripcion}
                {detalle.id_gasto ? (
                  <Typography variant="caption" color={COLOR.APAGADO} display="block">
                    Gasto #{detalle.id_gasto}
                  </Typography>
                ) : null}
              </TableCell>
              <TableCell>{detalle.tipo_detalle}</TableCell>
              <TableCell>{detalle.categoria || "—"}</TableCell>
              <TableCell align="right">{detalle.cantidad}</TableCell>
              <TableCell align="right">{moneda(detalle.costo)}</TableCell>
              <TableCell align="right">{moneda(detalle.cantidad * detalle.costo)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

/**
 * Los servicios que ya tiene la orden, editables uno por uno.
 *
 * Cada servicio dice de dónde salió —la inspección y su viaje, o la pendiente
 * levantada a mano— y enseña sus conceptos con la categoría y el gasto que los
 * pagó. Los conceptos no se editan aquí: vienen de un gasto que ya existe.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array.<object>} props.servicios Los servicios, con `id_local`, `origen` y `detalles`.
 * @param {Function} props.onCambiar Recibe `(idLocal, cambios)`.
 * @param {Function} props.onQuitar Recibe el `idLocal` del servicio a quitar.
 * @returns {object} La sección renderizada.
 */
export function ServiciosDeOrden({ servicios, onCambiar, onQuitar }) {
  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={2}>
      <Typography variant="h6" gutterBottom fontWeight={600} color="primary">
        Servicios de la Orden
      </Typography>

      {servicios.length === 0 ? (
        <Typography variant="body2" color={COLOR.APAGADO} sx={{ fontStyle: "italic" }}>
          La orden no tiene servicios.
        </Typography>
      ) : null}

      <Stack spacing={2}>
        {servicios.map((servicio, indice) => (
          <Paper key={servicio.id_local} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography fontWeight={700}>Servicio #{indice + 1}</Typography>
                {servicio.origen ? (
                  <Chip
                    size="small"
                    label={servicio.origen}
                    sx={{ bgcolor: COLOR.INFO_FONDO, color: COLOR.INFO, fontWeight: 600 }}
                  />
                ) : null}
              </Stack>
              <IconButton size="small" color="error" onClick={() => onQuitar(servicio.id_local)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Grid container spacing={2}>
              <Grid size={12}>
                <TextField
                  label="Tipo de Reparación"
                  fullWidth
                  size="small"
                  multiline
                  maxRows={3}
                  value={servicio.tipo_reparacion || ""}
                  onChange={(evento) =>
                    onCambiar(servicio.id_local, {
                      tipo_reparacion: evento.target.value.slice(0, LARGO_REPARACION),
                    })
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Tipo Mantenimiento"
                  fullWidth
                  size="small"
                  value={servicio.tipo_mantenimiento || ""}
                  onChange={(evento) =>
                    onCambiar(servicio.id_local, { tipo_mantenimiento: evento.target.value })
                  }
                >
                  <MenuItem value="Correctivo">Correctivo</MenuItem>
                  <MenuItem value="Preventivo">Preventivo</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Origen Mantenimiento"
                  fullWidth
                  size="small"
                  value={servicio.origen_servicio || ""}
                  onChange={(evento) =>
                    onCambiar(servicio.id_local, { origen_servicio: evento.target.value })
                  }
                >
                  <MenuItem value="Interno">Interno</MenuItem>
                  <MenuItem value="Externo">Externo</MenuItem>
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Costo Mano Obra"
                  type="number"
                  fullWidth
                  size="small"
                  value={servicio.costo_mano_obra || ""}
                  onChange={(evento) =>
                    onCambiar(servicio.id_local, {
                      costo_mano_obra: Number(evento.target.value) || 0,
                    })
                  }
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                />
              </Grid>
            </Grid>

            {servicio.detalles.length > 0 ? <ConceptosDeServicio detalles={servicio.detalles} /> : null}
          </Paper>
        ))}
      </Stack>
    </Paper>
  )
}
