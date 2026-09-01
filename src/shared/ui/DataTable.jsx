import { useMemo, useState } from "react"
import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Typography,
} from "@mui/material"
import { ordenarPor, siguienteOrden } from "../lib/orden"
import {
  CELL_SX,
  HEADER_CELL_SX,
  HEADER_ROW_SX,
  PAGINATION_SX,
  TABLE_CONTAINER_SX,
} from "./estilos"

/**
 * Definición de una columna. Agregar una columna es agregar uno de estos objetos
 * al arreglo; no hay que tocar `DataTable`.
 *
 * @typedef {object} Columna
 * @property {string} id Identificador único; se usa como clave de orden.
 * @property {string} label Encabezado visible.
 * @property {Function} [render] `(fila) => contenido`. Por omisión, `fila[id]`.
 * @property {Function} [valor] `(fila, contexto) => valorOrdenable`. Requerido para
 *   ordenar por una columna calculada; por omisión, `fila[id]`.
 * @property {boolean} [ordenable=false] Si la cabecera permite ordenar.
 * @property {string} [align='left'] Alineación de la celda: `left`, `right` o `center`.
 * @property {object} [sx] Estilos MUI para la celda de datos.
 */

/**
 * Fila que ocupa toda la tabla para los estados de carga, error y vacío.
 *
 * El `Typography` va como `div` y no como su `p` por omisión: el estado de carga
 * mete dentro un `Box` con el spinner, y un `div` dentro de un `p` es HTML
 * inválido. React lo avisa en consola pero ningún test en jsdom lo detecta.
 *
 * @param {object} props Propiedades del componente.
 * @param {number} props.columnas Cuántas columnas abarcar.
 * @param {object} props.children Contenido a centrar.
 * @param {string} [props.color='text.secondary'] Color del texto.
 * @returns {object} La fila renderizada.
 */
function FilaMensaje({ columnas, children, color = "text.secondary" }) {
  return (
    <TableRow>
      <TableCell colSpan={columnas} align="center" sx={{ py: 4 }}>
        <Typography component="div" fontStyle="italic" color={color}>
          {children}
        </Typography>
      </TableCell>
    </TableRow>
  )
}

/**
 * Tabla con columnas declarativas, orden por columna y estados de carga, error y
 * vacío resueltos.
 *
 * Sustituye el patrón que hoy está copiado en 45 archivos, donde cada pantalla
 * reimplementa la cabecera, el cuerpo y sus tres estados. El orden reutiliza la
 * misma semántica que ya usaba el Expense Manager: ciclo ascendente → descendente
 * → sin orden, y los valores vacíos siempre al final.
 *
 * Trae de fábrica los tokens de `shared/ui/estilos`, que son los que ya usan el
 * Expense Manager y el Administrador de viajes: cabecera en mayúsculas espaciadas
 * sobre gris claro, borde fino en vez de sombra. Así un módulo que migra hereda el
 * aspecto sin copiar una sola regla de estilo, y cambiar el diseño de todas las
 * tablas del proyecto es editar `estilos.js`.
 *
 * El orden se lleva por dentro salvo que se pase `orden` y `onOrdenChange`, para
 * que una pantalla que necesite conservarlo entre navegaciones pueda hacerlo.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array} props.filas Datos a pintar.
 * @param {Array.<Columna>} props.columnas Definición de las columnas.
 * @param {string} [props.claveFila='id'] Campo que identifica cada fila.
 * @param {boolean} [props.cargando=false] Muestra el estado de carga.
 * @param {(string|null)} [props.error] Mensaje de error, si lo hay.
 * @param {string} [props.vacio='No hay registros.'] Texto cuando no hay filas.
 * @param {Function} [props.onFilaClick] `(fila) => void` al hacer clic en una fila.
 * @param {*} [props.contexto] Se pasa a los `valor()` de las columnas calculadas.
 * @param {object} [props.orden] Orden controlado, `{campo, dir}`.
 * @param {Function} [props.onOrdenChange] `(nuevoOrden) => void`; requiere `orden`.
 * @param {string} [props.colorBorde] Acento fino en el borde superior. Opcional:
 *   sin él la tabla usa el estilo neutro del resto del sistema.
 * @param {number} [props.porPagina] Filas por página. Sin este valor no pagina:
 *   una tabla de diez filas no necesita controles que estorben.
 * @returns {object} La tabla renderizada.
 *
 * @example
 * <DataTable
 *   filas={empleados}
 *   columnas={[
 *     { id: 'nombre', label: 'Nombre', ordenable: true },
 *     { id: 'sueldo', label: 'Sueldo', ordenable: true, align: 'right',
 *       render: (e) => `$${e.sueldo.toFixed(2)}` },
 *   ]}
 *   cargando={isLoading}
 * />
 */
export function DataTable({
  filas,
  columnas,
  claveFila = "id",
  cargando = false,
  error = null,
  vacio = "No hay registros.",
  onFilaClick,
  contexto,
  orden: ordenControlado,
  onOrdenChange,
  colorBorde,
  porPagina,
}) {
  const [ordenInterno, setOrdenInterno] = useState({ campo: null, dir: null })
  const [pagina, setPagina] = useState(0)
  const [tamanoPagina, setTamanoPagina] = useState(porPagina ?? 10)
  const controlado = ordenControlado !== undefined
  const orden = controlado ? ordenControlado : ordenInterno

  const accesores = useMemo(
    () =>
      Object.fromEntries(
        columnas
          .filter((c) => c.ordenable)
          .map((c) => [c.id, c.valor ?? ((fila) => fila[c.id])]),
      ),
    [columnas],
  )

  const ordenadas = useMemo(
    () => ordenarPor(filas ?? [], orden, accesores, contexto),
    [filas, orden, accesores, contexto],
  )

  const alClicCabecera = (campo) => {
    const nuevo = siguienteOrden(orden, campo)
    if (controlado) onOrdenChange?.(nuevo)
    else setOrdenInterno(nuevo)
  }

  const pagina_ = Math.min(pagina, Math.max(0, Math.ceil(ordenadas.length / tamanoPagina) - 1))
  const visibles = porPagina
    ? ordenadas.slice(pagina_ * tamanoPagina, pagina_ * tamanoPagina + tamanoPagina)
    : ordenadas

  const hayFilas = visibles.length > 0

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        ...TABLE_CONTAINER_SX,
        ...(colorBorde ? { borderTop: `3px solid ${colorBorde}` } : {}),
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={HEADER_ROW_SX}>
            {columnas.map((columna) => (
              <TableCell
                key={columna.id}
                align={columna.align ?? "left"}
                sx={{ ...HEADER_CELL_SX, whiteSpace: "nowrap" }}
                sortDirection={orden.campo === columna.id ? orden.dir : false}
              >
                {columna.ordenable ? (
                  <TableSortLabel
                    active={orden.campo === columna.id}
                    direction={orden.campo === columna.id ? orden.dir : "asc"}
                    onClick={() => alClicCabecera(columna.id)}
                  >
                    {columna.label}
                  </TableSortLabel>
                ) : (
                  columna.label
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {cargando && (
            <FilaMensaje columnas={columnas.length}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
                <CircularProgress size={18} />
                Cargando…
              </Box>
            </FilaMensaje>
          )}

          {!cargando && error && (
            <FilaMensaje columnas={columnas.length} color="error.main">
              {error}
            </FilaMensaje>
          )}

          {!cargando && !error && !hayFilas && (
            <FilaMensaje columnas={columnas.length}>{vacio}</FilaMensaje>
          )}

          {!cargando &&
            !error &&
            visibles.map((fila, indice) => (
              <TableRow
                key={fila[claveFila] ?? indice}
                hover
                onClick={onFilaClick ? () => onFilaClick(fila) : undefined}
                sx={onFilaClick ? { cursor: "pointer" } : undefined}
              >
                {columnas.map((columna) => (
                  <TableCell
                    key={columna.id}
                    align={columna.align ?? "left"}
                    sx={{ ...CELL_SX, ...columna.sx }}
                  >
                    {columna.render ? columna.render(fila) : fila[columna.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {porPagina && ordenadas.length > tamanoPagina && (
        <TablePagination
          component="div"
          count={ordenadas.length}
          page={pagina_}
          onPageChange={(_evento, nueva) => setPagina(nueva)}
          rowsPerPage={tamanoPagina}
          onRowsPerPageChange={(evento) => {
            setTamanoPagina(Number(evento.target.value))
            setPagina(0)
          }}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
          sx={PAGINATION_SX}
        />
      )}
    </TableContainer>
  )
}
