import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material"

import GastoRow from "../../../components/GastoRow"
import {
  HEADER_CELL_SX,
  HEADER_ROW_SX,
  SECTION_LABEL_SX,
  money,
  moneyMXN,
} from "../estilos"
import { COLOR } from "../../../shared/ui/tokens"
import { FilasEsqueleto } from "../../../shared/ui"

const COLUMNAS = [
  { campo: "id_gasto", etiqueta: "Expense #" },
  { campo: "tipo", etiqueta: "Expense Type" },
  { campo: "fecha_gasto", etiqueta: "Date" },
  { campo: "pais", etiqueta: "Country" },
  { campo: "usd", etiqueta: "Total (USD)", align: "right" },
  { campo: "mxn", etiqueta: "Total (MX)", align: "right" },
  { campo: "created_name", etiqueta: "Created By" },
  { campo: "updated_name", etiqueta: "Updated By" },
]

const SIGUIENTE = { asc: "Ordenar descendente", desc: "Quitar orden" }

/**
 * Una cabecera por la que se puede ordenar.
 *
 * El ciclo es ascendente, descendente y de vuelta al orden original: quitar el
 * orden es tan útil como ponerlo cuando la lista viene de la base ordenada por
 * fecha de captura.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.campo La columna.
 * @param {string} props.etiqueta Su nombre.
 * @param {object} props.orden El orden actual, `{campo, dir}`.
 * @param {Function} props.onOrdenar Recibe la columna que se tocó.
 * @param {string} [props.align='left'] Alineación del texto.
 * @returns {object} La cabecera renderizada.
 */
function CeldaOrdenable({ campo, etiqueta, orden, onOrdenar, align = "left" }) {
  const activa = orden.campo === campo
  const ayuda = activa ? SIGUIENTE[orden.dir] : "Ordenar ascendente"

  return (
    <TableCell
      sx={{ ...HEADER_CELL_SX, textAlign: align }}
      sortDirection={activa ? orden.dir : false}
    >
      <Tooltip title={ayuda} enterDelay={600}>
        <TableSortLabel
          active={activa}
          direction={activa ? orden.dir : "asc"}
          onClick={() => onOrdenar(campo)}
          sx={{
            color: "inherit !important",
            whiteSpace: "nowrap",
            "& .MuiTableSortLabel-icon": {
              color: `${COLOR.APAGADO} !important`,
              width: 0,
              mx: 0,
              overflow: "hidden",
            },
            "&.Mui-active .MuiTableSortLabel-icon": { width: 18, ml: "4px" },
          }}
        >
          {etiqueta}
        </TableSortLabel>
      </Tooltip>
    </TableCell>
  )
}

/**
 * La tabla de gastos, ordenable y con el total de lo filtrado.
 *
 * El renglón de totales solo aparece cuando hay algún filtro puesto: sumar los
 * 1 638 gastos de golpe no dice nada, sumar los que se están mirando sí.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array} props.gastos Los gastos de la página actual.
 * @param {number} props.total Cuántos hay tras filtrar.
 * @param {boolean} props.cargando Si se están pidiendo.
 * @param {object} props.orden El orden actual.
 * @param {Function} props.onOrdenar Recibe la columna que se tocó.
 * @param {object} props.paginacion Página, tamaño y sus manejadores.
 * @param {object} [props.totales] Lo que suman los gastos filtrados.
 * @param {number} props.mxnRate El tipo de cambio del día.
 * @param {boolean} props.puedeEliminar Si la sesión puede borrar gastos.
 * @param {Function} props.onEliminado Se llama al borrar uno.
 * @returns {object} La tabla renderizada.
 */
export function TablaGastos({
  gastos = [],
  total,
  cargando,
  orden,
  onOrdenar,
  paginacion,
  totales,
  mxnRate,
  puedeEliminar,
  onEliminado,
}) {
  const columnas = COLUMNAS.length + 2

  return (
    <Paper elevation={0} sx={{ border: `1px solid ${COLOR.BORDE}`, borderRadius: 2, overflow: "hidden" }}>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={HEADER_ROW_SX}>
              <TableCell sx={HEADER_CELL_SX} />
              {COLUMNAS.map((columna) => (
                <CeldaOrdenable
                  key={columna.campo}
                  campo={columna.campo}
                  etiqueta={columna.etiqueta}
                  orden={orden}
                  onOrdenar={onOrdenar}
                  align={columna.align}
                />
              ))}
              <TableCell sx={{ ...HEADER_CELL_SX, textAlign: "center" }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {cargando ? (
              <FilasEsqueleto columnas={columnas} />
            ) : gastos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnas} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color={COLOR.APAGADO} fontWeight={600}>
                    No se encontraron gastos.
                  </Typography>
                  <Typography variant="caption" color={COLOR.TENUE}>
                    Prueba a quitar algún filtro.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              gastos.map((gasto) => (
                <GastoRow
                  key={gasto.id_gasto}
                  gasto={gasto}
                  mxnRate={mxnRate}
                  puedeEliminar={puedeEliminar}
                  onEliminado={onEliminado}
                />
              ))
            )}
          </TableBody>

          {totales && !cargando && gastos.length > 0 && (
            <TableFooter>
              <TableRow
                sx={{
                  bgcolor: COLOR.LIENZO,
                  "& td": { borderTop: `2px solid ${COLOR.BORDE}`, borderBottom: "none" },
                }}
              >
                <TableCell colSpan={5} sx={{ py: 1.75 }}>
                  <Typography variant="caption" sx={{ ...SECTION_LABEL_SX, textTransform: "uppercase" }}>
                    Total filtrado
                  </Typography>
                  <Typography variant="body2" color={COLOR.APAGADO}>
                    {totales.cuantos} gasto{totales.cuantos === 1 ? "" : "s"}
                    {totales.sinConversion > 0 &&
                      ` · ${totales.sinConversion} sin conversión a pesos`}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ py: 1.75 }}>
                  <Typography variant="body2" fontWeight={800} color={COLOR.TINTA}>
                    {money(totales.usd)}
                  </Typography>
                </TableCell>
                <TableCell align="right" sx={{ py: 1.75 }}>
                  <Typography variant="body2" fontWeight={800} color={COLOR.TINTA}>
                    {moneyMXN(totales.mxn)}
                  </Typography>
                </TableCell>
                <TableCell colSpan={3} />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={paginacion.pagina}
        onPageChange={(evento, nueva) => paginacion.onPaginaChange(nueva)}
        rowsPerPage={paginacion.porPagina}
        onRowsPerPageChange={(evento) =>
          paginacion.onPorPaginaChange(Number.parseInt(evento.target.value, 10))
        }
        rowsPerPageOptions={[10, 20, 50, 100, { label: "Todos", value: -1 }]}
        labelRowsPerPage="Gastos por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to === -1 ? count : to} de ${count}`}
      />
    </Paper>
  )
}
