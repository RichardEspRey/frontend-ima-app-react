import {
  Alert,
  Chip,
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
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined"
import {
  CARD_SX,
  CELL_STRONG_SX,
  CHIP_WARN_SX,
  COLOR,
  EstadoError,
  FilasEsqueleto,
  HEADER_CELL_SX,
  HEADER_ROW_SX,
  Paginacion,
  SECTION_LABEL_SX,
  TABLE_CONTAINER_SX,
} from "../../../shared/ui"
import { usePanelSinInspeccion } from "../model/usePanelSinInspeccion"
import { BarraFiltros } from "./BarraFiltros"

const COLUMNAS = 6

const CHIP_ELEGIDO_SX = {
  ...CHIP_WARN_SX,
  bgcolor: COLOR.TINTA,
  color: COLOR.BLANCO,
  border: `1px solid ${COLOR.TINTA}`,
  "&:hover": { bgcolor: COLOR.TINTA_CLARA },
}

/**
 * Cuántos viajes sin inspección tiene cada operador; al tocar uno se filtra por él.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array.<{operador: string, total: number}>} props.porOperador El conteo.
 * @param {string} props.elegido El operador por el que se está filtrando.
 * @param {Function} props.onAlternar Filtra por un operador o quita el filtro.
 * @returns {object} La tarjeta del resumen.
 */
function ResumenPorOperador({ porOperador, elegido, onAlternar }) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, mb: 2.5, bgcolor: COLOR.BLANCO }}>
      <Typography variant="overline" sx={{ ...SECTION_LABEL_SX, display: "block", mb: 1.5 }}>
        Por operador
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {porOperador.map(({ operador, total }) => (
          <Chip
            key={operador}
            label={`${operador} · ${total}`}
            onClick={() => onAlternar(operador)}
            sx={elegido === operador ? CHIP_ELEGIDO_SX : CHIP_WARN_SX}
          />
        ))}
      </Stack>
    </Paper>
  )
}

/**
 * Los viajes terminados de los que el operador no mandó la inspección final.
 *
 * Sirve para que mantenimiento sepa a quién reclamarle: la lista no se trabaja,
 * solo se consulta.
 *
 * @returns {object} El panel renderizado.
 */
export function PanelSinInspeccion() {
  const panel = usePanelSinInspeccion()
  const listo = !panel.consulta.isLoading && !panel.consulta.isError

  return (
    <>
      <Alert severity="warning" icon={<ReportProblemOutlinedIcon />} sx={{ mb: 2, borderRadius: 2 }}>
        Viajes terminados de los que el operador no mandó la inspección final. Cuentan desde que
        existe la inspección en la app móvil; los viajes que todavía no terminan no aparecen.
      </Alert>

      <BarraFiltros
        hayFiltros={panel.hayFiltros}
        onLimpiar={panel.limpiarFiltros}
        resumen={`${panel.filtradas.length} viaje(s) sin inspección`}
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
          sx={{ width: 160 }}
          value={panel.filtros.camion}
          onChange={(evento) => panel.cambiarFiltro("camion", evento.target.value)}
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

      {listo && panel.porOperador.length > 0 ? (
        <ResumenPorOperador
          porOperador={panel.porOperador}
          elegido={panel.filtros.operador}
          onAlternar={panel.alternarOperador}
        />
      ) : null}

      <TableContainer component={Paper} sx={TABLE_CONTAINER_SX}>
        <Table>
          <TableHead>
            <TableRow sx={HEADER_ROW_SX}>
              <TableCell sx={HEADER_CELL_SX}>Viaje</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Creado</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Regreso</TableCell>
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

            {listo && panel.filtradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={COLUMNAS} align="center" sx={{ py: 6, color: COLOR.APAGADO }}>
                  {panel.hayFiltros
                    ? "Ningún viaje coincide con los filtros."
                    : "Todos los viajes terminados tienen su inspección."}
                </TableCell>
              </TableRow>
            ) : null}

            {panel.paginacion.visibles.map((viaje) => (
              <TableRow key={viaje.viaje_id} hover>
                <TableCell>
                  <Typography fontWeight={800} sx={CELL_STRONG_SX}>
                    {viaje.nomenclatura || viaje.trip_number}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color={COLOR.TEXTO_SUAVE}>
                    {viaje.creation_date.slice(0, 10) || "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color={COLOR.TEXTO_SUAVE}>
                    {viaje.return_date.slice(0, 10) || "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color={COLOR.TEXTO}>
                    {viaje.operador || "—"}
                  </Typography>
                  {viaje.operador_2 ? (
                    <Typography variant="caption" color={COLOR.APAGADO}>
                      {viaje.operador_2}
                    </Typography>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700} color={COLOR.TEXTO}>
                    {viaje.no_camion || "—"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={700} color={COLOR.TEXTO}>
                    {viaje.no_caja || "—"}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Paginacion {...panel.paginacion.props} />
    </>
  )
}
