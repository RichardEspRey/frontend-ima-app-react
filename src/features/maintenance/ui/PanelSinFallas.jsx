import {
  Alert,
  Box,
  Chip,
  Collapse,
  IconButton,
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
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown"
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp"
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"
import {
  CELL_STRONG_SX,
  COLOR,
  EstadoError,
  FilasEsqueleto,
  HEADER_CELL_SX,
  HEADER_ROW_SX,
  Paginacion,
  TABLE_CONTAINER_SX,
} from "../../../shared/ui"
import { usePanelSinFallas } from "../model/usePanelSinFallas"
import { BarraFiltros } from "./BarraFiltros"

const COLUMNAS = 6

const CHIP_RUBRO_SX = {
  minWidth: 96,
  height: 22,
  fontWeight: 700,
  bgcolor: COLOR.RELLENO,
  color: COLOR.TEXTO_SUAVE,
}

/**
 * Una inspección sin fallas, con lo que escribió el operador al desplegarla.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.fila La inspección.
 * @param {boolean} props.abierta Si el detalle está desplegado.
 * @param {Function} props.onAbrir Despliega o pliega el detalle.
 * @returns {object} Las dos filas: la visible y la del detalle.
 */
function FilaSinFallas({ fila, abierta, onAbrir }) {
  return (
    <>
      <TableRow hover>
        <TableCell>
          <IconButton size="small" onClick={onAbrir}>
            {abierta ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>
          <Typography fontWeight={800} sx={CELL_STRONG_SX}>
            {fila.nomenclatura || fila.trip_number || `Viaje ${fila.viaje_id}`}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" color={COLOR.TEXTO_SUAVE}>
            {String(fila.fecha_creacion ?? "").slice(0, 10) || "—"}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" color={COLOR.TEXTO}>
            {fila.operador || "—"}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={700} color={COLOR.TEXTO}>
            {fila.no_camion || "—"}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" fontWeight={700} color={COLOR.TEXTO}>
            {fila.no_caja || "—"}
          </Typography>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell
          colSpan={COLUMNAS}
          sx={{ py: 0, borderBottom: abierta ? `1px solid ${COLOR.BORDE}` : "none" }}
        >
          <Collapse in={abierta} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, bgcolor: COLOR.LIENZO, px: 2, borderRadius: 2, my: 1.5 }}>
              <Typography variant="caption" color={COLOR.APAGADO} sx={{ display: "block", mb: 1 }}>
                Lo que escribió el operador
              </Typography>

              {fila.reporte.length === 0 ? (
                <Typography variant="body2" color={COLOR.APAGADO}>
                  La inspección llegó sin ningún renglón.
                </Typography>
              ) : null}

              <Stack spacing={0.75}>
                {fila.reporte.map((renglon, indice) => (
                  <Stack key={indice} direction="row" spacing={1.5} alignItems="center">
                    <Chip size="small" label={renglon.categoria} sx={CHIP_RUBRO_SX} />
                    <Typography variant="body2" color={renglon.texto ? COLOR.TEXTO : COLOR.TENUE}>
                      {renglon.texto || "(vacío)"}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

/**
 * Las inspecciones en las que el operador no reportó nada que reparar.
 *
 * No requieren orden de servicio; están aparte para saber qué viajes sí mandaron
 * su inspección.
 *
 * @returns {object} El panel renderizado.
 */
export function PanelSinFallas() {
  const panel = usePanelSinFallas()

  return (
    <>
      <Alert severity="success" icon={<CheckCircleOutlineIcon />} sx={{ mb: 2, borderRadius: 2 }}>
        Inspecciones en las que el operador no reportó nada que reparar. No requieren orden de
        servicio; se muestran aquí para llevar el control de qué viajes sí mandaron su inspección.
      </Alert>

      <BarraFiltros
        hayFiltros={panel.hayFiltros}
        onLimpiar={panel.limpiarFiltros}
        resumen={`${panel.filtradas.length} inspección(es) sin fallas`}
      >
        <TextField
          size="small"
          label="Viaje"
          placeholder="221 o 221-US"
          sx={{ width: 170 }}
          value={panel.filtros.viaje}
          onChange={(evento) => panel.cambiarFiltro("viaje", evento.target.value)}
        />
        <TextField
          size="small"
          label="Operador"
          sx={{ width: 200 }}
          value={panel.filtros.operador}
          onChange={(evento) => panel.cambiarFiltro("operador", evento.target.value)}
        />
        <TextField
          size="small"
          label="Camión (exacto)"
          sx={{ width: 140 }}
          value={panel.filtros.camion}
          onChange={(evento) => panel.cambiarFiltro("camion", evento.target.value)}
        />
        <TextField
          size="small"
          label="Caja (exacto)"
          sx={{ width: 140 }}
          value={panel.filtros.caja}
          onChange={(evento) => panel.cambiarFiltro("caja", evento.target.value)}
        />
        <TextField
          size="small"
          type="date"
          label="Desde"
          InputLabelProps={{ shrink: true }}
          sx={{ width: 160 }}
          value={panel.filtros.desde}
          onChange={(evento) => panel.cambiarFiltro("desde", evento.target.value)}
        />
        <TextField
          size="small"
          type="date"
          label="Hasta"
          InputLabelProps={{ shrink: true }}
          sx={{ width: 160 }}
          value={panel.filtros.hasta}
          onChange={(evento) => panel.cambiarFiltro("hasta", evento.target.value)}
        />
      </BarraFiltros>

      <TableContainer component={Paper} sx={TABLE_CONTAINER_SX}>
        <Table>
          <TableHead>
            <TableRow sx={HEADER_ROW_SX}>
              <TableCell sx={{ ...HEADER_CELL_SX, width: 50 }} />
              <TableCell sx={HEADER_CELL_SX}>Viaje</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Fecha</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Operador</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Camión</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Caja</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {panel.consulta.isLoading ? <FilasEsqueleto columnas={COLUMNAS} filas={5} /> : null}

            {panel.consulta.isError ? (
              <TableRow>
                <TableCell colSpan={COLUMNAS}>
                  <EstadoError error={panel.consulta.error} onReintentar={panel.consulta.refetch} />
                </TableCell>
              </TableRow>
            ) : null}

            {!panel.consulta.isLoading && !panel.consulta.isError && panel.filtradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMNAS} align="center" sx={{ py: 6, color: COLOR.APAGADO }}>
                  {panel.hayFiltros
                    ? "Ninguna inspección coincide con los filtros."
                    : "No hay inspecciones sin fallas."}
                </TableCell>
              </TableRow>
            ) : null}

            {panel.paginacion.visibles.map((fila) => (
              <FilaSinFallas
                key={fila.cl_final_id}
                fila={fila}
                abierta={panel.abierta === fila.cl_final_id}
                onAbrir={() => panel.abrir(fila)}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Paginacion {...panel.paginacion.props} />
    </>
  )
}
