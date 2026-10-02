import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Stack,
  TableCell,
  TableRow,
  Typography,
} from "@mui/material"
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined"
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined"
import { COLOR } from "../../../shared/ui"

const BOTON_SX = { textTransform: "none", fontWeight: 700, borderRadius: 2 }

/**
 * Una reparación pendiente, con su rubro y de dónde salió.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.reparacion La reparación.
 * @param {number} props.indice Su número dentro de la unidad.
 * @param {boolean} props.marcada Si está seleccionada.
 * @param {Function} props.onAlternar Marcar o desmarcar.
 * @returns {object} El renglón renderizado.
 */
function Reparacion({ reparacion, indice, marcada, onAlternar }) {
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ ml: 0.5 }}>
      <Checkbox
        size="small"
        sx={{ p: 0.5 }}
        checked={marcada}
        onChange={() => onAlternar(reparacion.id)}
      />
      <Box sx={{ pt: 0.4 }}>
        <Typography variant="body2" color={COLOR.TEXTO} component="span">
          {indice + 1}. {reparacion.descripcion}
        </Typography>
        {reparacion.categoria ? (
          <Chip
            size="small"
            label={reparacion.categoria}
            sx={{
              ml: 1,
              height: 18,
              fontSize: "0.65rem",
              bgcolor: COLOR.RELLENO,
              color: COLOR.TEXTO_SUAVE,
            }}
          />
        ) : null}
        {reparacion.origen === "manual" ? (
          <Chip
            size="small"
            label="a mano"
            sx={{
              ml: 0.5,
              height: 18,
              fontSize: "0.65rem",
              bgcolor: COLOR.INFO_FONDO,
              color: COLOR.INFO,
            }}
          />
        ) : null}
        {reparacion.trip_number ? (
          <Typography variant="caption" color={COLOR.TENUE} sx={{ ml: 1 }}>
            viaje {reparacion.trip_number}
          </Typography>
        ) : null}
      </Box>
    </Stack>
  )
}

/**
 * Una unidad con todo lo que se le debe, junto.
 *
 * Se agrupa así, y no como lista plana, porque la orden se levanta por unidad:
 * ver sueltas las reparaciones de un mismo camión es lo que las hacía olvidarse.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.unidad La unidad con sus reparaciones.
 * @param {object} props.panel El controlador de la pantalla.
 * @returns {object} La fila renderizada.
 */
export function FilaUnidadPendiente({ unidad, panel }) {
  const seleccion = panel.elegidosDe(unidad)
  const todas = seleccion.length === unidad.reparaciones.length

  return (
    <TableRow hover>
      <TableCell sx={{ verticalAlign: "top" }}>
        <Typography fontWeight={800} color={COLOR.TINTA}>
          {unidad.etiqueta}
        </Typography>
        <Typography variant="caption" color={COLOR.APAGADO}>
          {unidad.reparaciones.length} pendiente{unidad.reparaciones.length === 1 ? "" : "s"}
        </Typography>
      </TableCell>

      <TableCell>
        <FormControlLabel
          sx={{ ml: 0, mb: 0.5 }}
          control={
            <Checkbox
              size="small"
              checked={todas}
              indeterminate={!todas && seleccion.length > 0}
              onChange={() => panel.alternarUnidad(unidad, !todas)}
            />
          }
          label={
            <Typography variant="caption" fontWeight={700} color={COLOR.TEXTO_SUAVE}>
              Seleccionar todo
            </Typography>
          }
        />

        {unidad.reparaciones.map((reparacion, indice) => (
          <Reparacion
            key={reparacion.id}
            reparacion={reparacion}
            indice={indice}
            marcada={panel.elegidos.includes(reparacion.id)}
            onAlternar={panel.alternar}
          />
        ))}
      </TableCell>

      <TableCell align="right" sx={{ verticalAlign: "top" }}>
        <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
          <Button
            variant="outlined"
            size="small"
            startIcon={<BuildOutlinedIcon />}
            disabled={seleccion.length === 0 || panel.guardando}
            onClick={() => panel.abrirOrden(unidad)}
            sx={BOTON_SX}
          >
            Realizar orden ({seleccion.length})
          </Button>
          <Button
            variant="outlined"
            size="small"
            color="error"
            startIcon={<BlockOutlinedIcon />}
            disabled={seleccion.length === 0 || panel.guardando}
            onClick={() => panel.descartar(unidad)}
            sx={BOTON_SX}
          >
            Descartar
          </Button>
        </Stack>
      </TableCell>
    </TableRow>
  )
}
