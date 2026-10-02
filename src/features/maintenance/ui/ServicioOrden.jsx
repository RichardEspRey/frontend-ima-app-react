import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import AddIcon from "@mui/icons-material/Add"
import { CARD_SX, COLOR, SECTION_LABEL_SX } from "../../../shared/ui"
import { gastoEnBlanco, totalDeGasto } from "../model/orden"
import { GastoServicio } from "./GastoServicio"

const TIPOS_MANTENIMIENTO = ["Correctivo", "Preventivo"]
const ORIGENES_SERVICIO = ["Interno", "Externo"]

const CHIP_ORIGEN = {
  inspeccion: { bgcolor: COLOR.INFO_FONDO, color: COLOR.INFO },
  pendiente: { bgcolor: COLOR.AVISO_FONDO, color: COLOR.AVISO },
}

/**
 * Un servicio de la orden: una reparación, su mano de obra y sus gastos.
 *
 * El tipo de reparación nace del punto que reportó el operador y se puede
 * corregir aquí mismo, que es lo que pidió operaciones: el taller trabaja con
 * una frase corta, no con el párrafo que escribió el conductor.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.servicio El servicio.
 * @param {number} props.indice Su número dentro de la orden.
 * @param {string} props.fecha La fecha de la orden, inicial de sus gastos.
 * @param {Array.<object>} props.categorias Las categorías de mantenimiento.
 * @param {Array.<object>} props.subcategorias Todas las subcategorías.
 * @param {Function} props.onCambiar Recibe el servicio completo ya actualizado.
 * @param {Function} props.onEliminar Quitar este servicio.
 * @returns {object} La tarjeta renderizada.
 */
export function ServicioOrden({
  servicio,
  indice,
  fecha,
  categorias,
  subcategorias,
  onCambiar,
  onEliminar,
}) {
  const cambiar = (campo, valor) => onCambiar({ ...servicio, [campo]: valor })

  const totalGastos = servicio.gastos.reduce((suma, gasto) => suma + totalDeGasto(gasto), 0)
  const total = (Number(servicio.costo_mano_obra) || 0) + totalGastos

  const etiquetaOrigen =
    servicio.origen === "pendiente" ? "Pendiente previo" : servicio.categoria || "Inspección"

  return (
    <Paper elevation={0} sx={{ ...CARD_SX, bgcolor: COLOR.BLANCO, mb: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="overline" sx={SECTION_LABEL_SX}>
            Servicio {indice + 1}
          </Typography>
          {CHIP_ORIGEN[servicio.origen] ? (
            <Chip
              size="small"
              label={etiquetaOrigen}
              sx={{ height: 20, fontSize: "0.65rem", ...CHIP_ORIGEN[servicio.origen] }}
            />
          ) : null}
        </Stack>

        <IconButton size="small" color="error" onClick={onEliminar}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Stack>

      <TextField
        fullWidth
        size="small"
        label="Tipo de Reparación"
        value={servicio.tipo_reparacion}
        onChange={(evento) => cambiar("tipo_reparacion", evento.target.value.slice(0, 100))}
        inputProps={{ maxLength: 100 }}
        sx={{ mb: 2 }}
      />

      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        <TextField
          select
          size="small"
          label="Mantenimiento"
          sx={{ width: 160 }}
          value={servicio.tipo_mantenimiento}
          onChange={(evento) => cambiar("tipo_mantenimiento", evento.target.value)}
        >
          {TIPOS_MANTENIMIENTO.map((tipo) => (
            <MenuItem key={tipo} value={tipo}>
              {tipo}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Origen"
          sx={{ width: 140 }}
          value={servicio.origen_servicio}
          onChange={(evento) => cambiar("origen_servicio", evento.target.value)}
        >
          {ORIGENES_SERVICIO.map((origen) => (
            <MenuItem key={origen} value={origen}>
              {origen}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          size="small"
          type="number"
          label="Costo Mano de Obra"
          sx={{ width: 190 }}
          value={servicio.costo_mano_obra}
          onChange={(evento) => cambiar("costo_mano_obra", evento.target.value)}
        />
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="overline" sx={SECTION_LABEL_SX}>
          Gastos
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          sx={{ textTransform: "none" }}
          onClick={() => cambiar("gastos", [...servicio.gastos, gastoEnBlanco(fecha)])}
        >
          Agregar gasto
        </Button>
      </Stack>

      {servicio.gastos.map((gasto, i) => (
        <GastoServicio
          key={gasto.clave}
          gasto={gasto}
          indice={i}
          categorias={categorias}
          subcategorias={subcategorias}
          onCambiar={(actualizado) =>
            cambiar(
              "gastos",
              servicio.gastos.map((otro, j) => (j === i ? actualizado : otro)),
            )
          }
          onEliminar={() =>
            cambiar(
              "gastos",
              servicio.gastos.filter((_, j) => j !== i),
            )
          }
        />
      ))}

      <Stack direction="row" alignItems="baseline" sx={{ mt: 1 }}>
        <Box sx={{ flexGrow: 1 }} />
        <Typography variant="caption" color={COLOR.APAGADO} sx={{ mr: 1 }}>
          Total del servicio
        </Typography>
        <Typography variant="body1" fontWeight={800} color={COLOR.TINTA}>
          ${total.toFixed(2)}
        </Typography>
      </Stack>
    </Paper>
  )
}
