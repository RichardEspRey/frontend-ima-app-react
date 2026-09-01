import {
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material"
import DeleteIcon from "@mui/icons-material/Delete"
import EditIcon from "@mui/icons-material/Edit"
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined"
import dayjs from "dayjs"

import { HEADER_CELL_SX, HEADER_ROW_SX } from "../../../shared/ui/estilos"

const COLUMNAS = [
  "Operador",
  "Camión",
  "Distancia Nv Laredo",
  "Caja",
  "Caja Externa",
  "Compañía",
  "Destino",
  "Salida",
]

/**
 * La tabla de viajes programados, pendientes de convertirse en viaje.
 *
 * Tocar una fila dibuja en el mapa la ruta de ese camión hasta Nuevo Laredo, y
 * "Aprobar" la convierte en un viaje real llevando los datos precargados.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array} props.programaciones Las programaciones guardadas.
 * @param {boolean} props.cargando Si se están pidiendo.
 * @param {(string|null)} props.seleccionada Cuál está marcada en el mapa.
 * @param {Function} props.onSeleccionar Recibe la programación tocada.
 * @param {Function} props.onAprobar Convierte la programación en viaje.
 * @param {Function} props.onEditar Abre el modal de edición.
 * @param {Function} props.onEliminar Borra la programación.
 * @returns {object} La tabla renderizada.
 */
export function TablaProgramaciones({
  programaciones = [],
  cargando,
  seleccionada,
  onSeleccionar,
  onAprobar,
  onEditar,
  onEliminar,
}) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: "1px solid #e2e8f0", borderRadius: 2, overflow: "hidden" }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={HEADER_ROW_SX}>
            {COLUMNAS.map((columna) => (
              <TableCell key={columna} sx={HEADER_CELL_SX}>
                {columna}
              </TableCell>
            ))}
            <TableCell sx={{ ...HEADER_CELL_SX, textAlign: "center" }}>Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {cargando ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                <CircularProgress
                  size={22}
                  sx={{ mr: 1.5, verticalAlign: "middle", color: "#94a3b8" }}
                />
                <Typography component="span" color="#64748b" fontWeight={500}>
                  Cargando programaciones...
                </Typography>
              </TableCell>
            </TableRow>
          ) : programaciones.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                <InboxOutlinedIcon sx={{ fontSize: 34, color: "#cbd5e1", mb: 1 }} />
                <Typography variant="body2" color="#94a3b8" fontWeight={500}>
                  No hay viajes programados. Usa &quot;Programar Viaje&quot; para agregar uno.
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            programaciones.map((programacion) => (
              <TableRow
                key={programacion.id}
                hover
                selected={seleccionada === programacion.id}
                onClick={() => onSeleccionar(programacion)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell sx={{ fontWeight: 600 }}>{programacion.driver_nombre || "-"}</TableCell>
                <TableCell>{programacion.truck_unidad || "-"}</TableCell>
                <TableCell sx={{ color: "#64748b" }}>
                  {programacion.dist_nv_l != null ? `${programacion.dist_nv_l} Km` : "No obtenido"}
                </TableCell>
                <TableCell>{programacion.caja_numero || "-"}</TableCell>
                <TableCell>{programacion.caja_externa_numero || "-"}</TableCell>
                <TableCell>{programacion.nombre_compania || "-"}</TableCell>
                <TableCell>{programacion.destino || "-"}</TableCell>
                <TableCell sx={{ fontVariantNumeric: "tabular-nums", color: "#64748b" }}>
                  {programacion.salida
                    ? dayjs(programacion.salida).format("DD/MM/YYYY HH:mm")
                    : "-"}
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    onClick={(evento) => {
                      evento.stopPropagation()
                      onAprobar(programacion)
                    }}
                    sx={{ textTransform: "none", fontWeight: 600, mr: 1 }}
                  >
                    Aprobar
                  </Button>
                  <Tooltip title="Editar">
                    <IconButton
                      size="small"
                      onClick={(evento) => {
                        evento.stopPropagation()
                        onEditar(programacion)
                      }}
                      sx={{ "&:hover": { bgcolor: "#f1f5f9" } }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(evento) => {
                        evento.stopPropagation()
                        onEliminar(programacion.id)
                      }}
                      sx={{ "&:hover": { bgcolor: "#fef2f2" } }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
