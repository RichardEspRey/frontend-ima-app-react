import {
  Button,
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
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import { UNIDAD } from "../../../entities/maintenance-point"
import {
  COLOR,
  DARK_BTN_SX,
  EstadoError,
  FilasEsqueleto,
  HEADER_CELL_SX,
  HEADER_ROW_SX,
  Paginacion,
  Pestanas,
  TABLE_CONTAINER_SX,
} from "../../../shared/ui"
import { ORIGENES } from "../model/filtros"
import { usePanelPendientes } from "../model/usePanelPendientes"
import { BarraFiltros } from "./BarraFiltros"
import { ConstructorOrden } from "./ConstructorOrden"
import { FilaUnidadPendiente } from "./FilaUnidadPendiente"
import { ModalPendienteManual } from "./ModalPendienteManual"

const LADOS = [
  { id: UNIDAD.CAMION, etiqueta: "Camiones", columna: "Camión" },
  { id: UNIDAD.CAJA, etiqueta: "Cajas", columna: "Caja" },
]

/**
 * Las reparaciones que esperan orden, agrupadas por unidad.
 *
 * Es el Excel que la oficina llevaba a mano: lo que el mecánico dejó para
 * después más lo que el taller levanta por su cuenta. De aquí sale la orden
 * cuando la unidad vuelve, sin tener que acordarse de nada.
 *
 * @returns {object} El panel renderizado.
 */
export function PanelPendientes() {
  const panel = usePanelPendientes()
  const esCaja = panel.lado === UNIDAD.CAJA
  const columna = LADOS.find((lado) => lado.id === panel.lado)?.columna

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

        <Button variant="contained" startIcon={<AddIcon />} onClick={panel.abrirAlta} sx={DARK_BTN_SX}>
          Levantar pendiente
        </Button>
      </Stack>

      <BarraFiltros
        hayFiltros={panel.hayFiltros}
        onLimpiar={panel.limpiarFiltros}
        resumen={`${panel.totalFiltrado} reparación(es) en ${panel.totalUnidades} unidad(es)`}
      >
        <TextField
          size="small"
          label={esCaja ? "Caja (exacto)" : "Camión (exacto)"}
          sx={{ width: 150 }}
          value={panel.filtros.unidad}
          onChange={(evento) => panel.cambiarFiltro("unidad", evento.target.value)}
        />
        <TextField
          size="small"
          label="Buscar en la reparación"
          placeholder="aceite, llanta…"
          sx={{ width: 260 }}
          value={panel.filtros.texto}
          onChange={(evento) => panel.cambiarFiltro("texto", evento.target.value)}
        />
        <TextField
          select
          size="small"
          label="Origen"
          sx={{ width: 190 }}
          value={panel.filtros.origen}
          onChange={(evento) => panel.cambiarFiltro("origen", evento.target.value)}
        >
          {ORIGENES.map((origen) => (
            <MenuItem key={origen.id || "todos"} value={origen.id}>
              {origen.etiqueta}
            </MenuItem>
          ))}
        </TextField>
      </BarraFiltros>

      <TableContainer component={Paper} sx={TABLE_CONTAINER_SX}>
        <Table>
          <TableHead>
            <TableRow sx={HEADER_ROW_SX}>
              <TableCell sx={{ ...HEADER_CELL_SX, width: 150 }}>{columna}</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Reparaciones</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, width: 300 }} align="right">
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {panel.consulta.isLoading ? <FilasEsqueleto columnas={3} filas={3} /> : null}

            {panel.consulta.isError ? (
              <TableRow>
                <TableCell colSpan={3}>
                  <EstadoError error={panel.consulta.error} onReintentar={panel.consulta.refetch} />
                </TableCell>
              </TableRow>
            ) : null}

            {!panel.consulta.isLoading && !panel.consulta.isError && panel.totalUnidades === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ py: 6, color: COLOR.APAGADO }}>
                  {panel.hayFiltros
                    ? "Ninguna reparación coincide con los filtros."
                    : `No hay reparaciones pendientes de ${esCaja ? "cajas" : "camiones"}.`}
                </TableCell>
              </TableRow>
            ) : null}

            {panel.paginacion.visibles.map((unidad) => (
              <FilaUnidadPendiente key={unidad.clave} unidad={unidad} panel={panel} />
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

      {panel.altaAbierta ? (
        <ModalPendienteManual
          unidadTipo={panel.lado}
          guardando={panel.guardando}
          onCancelar={panel.cerrarAlta}
          onGuardar={panel.guardarManual}
        />
      ) : null}
    </>
  )
}
