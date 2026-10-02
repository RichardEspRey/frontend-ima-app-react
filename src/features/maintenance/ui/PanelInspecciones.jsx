import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material"
import { UNIDAD } from "../../../entities/maintenance-point"
import {
  COLOR,
  EstadoError,
  FilasEsqueleto,
  HEADER_CELL_SX,
  HEADER_ROW_SX,
  Paginacion,
  Pestanas,
  TABLE_CONTAINER_SX,
} from "../../../shared/ui"
import { usePanelInspecciones } from "../model/usePanelInspecciones"
import { BarraFiltros } from "./BarraFiltros"
import { ConstructorOrden } from "./ConstructorOrden"
import { FilaInspeccion } from "./FilaInspeccion"

const LADOS = [
  { id: UNIDAD.CAMION, etiqueta: "Camión" },
  { id: UNIDAD.CAJA, etiqueta: "Caja" },
]

const PESTANAS_ESTADO = [
  { id: "pendientes", etiqueta: "Pendientes" },
  { id: "completadas", etiqueta: "Completadas" },
]

/**
 * Las inspecciones que llegan del móvil, trabajadas por lado.
 *
 * Es el centro del flujo: de aquí se arman las órdenes, se mandan puntos a
 * pendientes y se descarta lo que no procede, sin salir de la pantalla.
 *
 * @returns {object} El panel renderizado.
 */
export function PanelInspecciones() {
  const panel = usePanelInspecciones()
  const esCaja = panel.lado === UNIDAD.CAJA

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        sx={{ mb: 2 }}
      >
        <Pestanas valor={panel.lado} onChange={panel.cambiarLado} pestanas={LADOS} />

        <Pestanas
          valor={panel.verCompletadas ? "completadas" : "pendientes"}
          onChange={(valor) => panel.cambiarPestana(valor === "completadas")}
          pestanas={PESTANAS_ESTADO}
        />
      </Stack>

      <BarraFiltros
        hayFiltros={panel.hayFiltros}
        onLimpiar={panel.limpiarFiltros}
        resumen={`${panel.filtradas.length} inspección(es)`}
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
          label={esCaja ? "Caja (exacto)" : "Camión (exacto)"}
          sx={{ width: 150 }}
          value={panel.filtros.unidad}
          onChange={(evento) => panel.cambiarFiltro("unidad", evento.target.value)}
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
              <TableCell sx={HEADER_CELL_SX}>{esCaja ? "Caja" : "Camión"}</TableCell>
              <TableCell sx={HEADER_CELL_SX} align="center">
                Por atender
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {panel.consulta.isLoading ? <FilasEsqueleto columnas={6} filas={5} /> : null}

            {panel.consulta.isError ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EstadoError error={panel.consulta.error} onReintentar={panel.consulta.refetch} />
                </TableCell>
              </TableRow>
            ) : null}

            {!panel.consulta.isLoading && !panel.consulta.isError && panel.filtradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: COLOR.APAGADO }}>
                  {panel.hayFiltros
                    ? "Ninguna inspección coincide con los filtros."
                    : `No hay inspecciones con puntos de ${esCaja ? "caja" : "camión"} en esta pestaña.`}
                </TableCell>
              </TableRow>
            ) : null}

            {panel.paginacion.visibles.map((fila) => (
              <FilaInspeccion key={fila.viaje_id} fila={fila} panel={panel} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Paginacion {...panel.paginacion.props} />

      {panel.apertura ? (
        <ConstructorOrden
          apertura={panel.apertura}
          onCerrar={panel.cerrarOrden}
          onCreada={panel.ordenCreada}
        />
      ) : null}
    </>
  )
}
