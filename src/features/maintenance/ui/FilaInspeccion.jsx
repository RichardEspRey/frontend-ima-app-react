import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  Stack,
  TableCell,
  TableRow,
} from "@mui/material"
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined"
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined"
import BlockOutlinedIcon from "@mui/icons-material/BlockOutlined"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import { Typography } from "@mui/material"
import { UNIDAD } from "../../../entities/maintenance-point"
import { CELL_STRONG_SX, CHIP_INFO_SX, COLOR, DARK_BTN_SX } from "../../../shared/ui"
import { RubrosInspeccion } from "./RubrosInspeccion"

const BOTON_SX = { textTransform: "none", fontWeight: 700, borderRadius: 2 }

/**
 * Las acciones que se pueden tomar sobre los puntos marcados.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.panel El controlador de la pantalla.
 * @returns {object} La barra de acciones.
 */
function AccionesPuntos({ panel }) {
  const nada = panel.elegidos.length === 0

  return (
    <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }} flexWrap="wrap" useFlexGap>
      <Button
        variant="contained"
        startIcon={<BuildOutlinedIcon />}
        disabled={nada || panel.guardando}
        onClick={panel.abrirOrden}
        sx={DARK_BTN_SX}
      >
        Crear orden ({panel.elegidos.length})
      </Button>
      <Button
        variant="outlined"
        startIcon={<ScheduleOutlinedIcon />}
        disabled={nada || panel.guardando}
        onClick={panel.mandarAPendientes}
        sx={BOTON_SX}
      >
        Mandar a pendientes
      </Button>
      <Button
        variant="outlined"
        color="error"
        startIcon={<BlockOutlinedIcon />}
        disabled={nada || panel.guardando}
        onClick={panel.descartar}
        sx={BOTON_SX}
      >
        Descartar
      </Button>

      <Box sx={{ flexGrow: 1 }} />

      <Button
        variant="outlined"
        color="success"
        startIcon={<CheckCircleOutlineIcon />}
        disabled={panel.sinResolver > 0 || panel.guardando}
        onClick={panel.completar}
        sx={BOTON_SX}
      >
        {panel.sinResolver > 0 ? `Faltan ${panel.sinResolver} por resolver` : "Completar lado"}
      </Button>
    </Stack>
  )
}

/**
 * Una inspección en la lista, con sus puntos al desplegarla.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.fila La inspección.
 * @param {object} props.panel El controlador de la pantalla.
 * @returns {object} Las dos filas: la visible y la del detalle.
 */
export function FilaInspeccion({ fila, panel }) {
  const abierta = panel.abierta === fila.viaje_id
  const unidad = panel.lado === UNIDAD.CAJA ? fila.no_caja : fila.no_camion

  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={() => panel.abrir(fila)}>
            {abierta ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography fontWeight={800} sx={CELL_STRONG_SX}>
            {fila.nomenclatura || fila.trip_number}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" color={COLOR.TEXTO_SUAVE}>
            {String(fila.fecha_creacion ?? "").slice(0, 10) || "—"}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" color={COLOR.TEXTO}>
            {fila.operador}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={700} color={COLOR.TEXTO}>
            {unidad || "—"}
          </Typography>
        </TableCell>
        <TableCell align="center">
          <Chip size="small" label={fila.por_atender} sx={CHIP_INFO_SX} />
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell
          colSpan={6}
          sx={{ py: 0, borderBottom: abierta ? `1px solid ${COLOR.BORDE}` : "none" }}
        >
          <Collapse in={abierta} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2.5, bgcolor: COLOR.LIENZO, px: 2, borderRadius: 2, my: 1.5 }}>
              {panel.cargandoPuntos ? (
                <CircularProgress size={22} />
              ) : (
                <>
                  <RubrosInspeccion
                    puntos={panel.puntos}
                    seleccionados={panel.seleccionados}
                    onAlternar={panel.alternar}
                    onAlternarRubro={panel.alternarRubro}
                  />
                  {panel.puntos.length > 0 ? <AccionesPuntos panel={panel} /> : null}
                </>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}
