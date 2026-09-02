import {
  Button,
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
import { COLOR } from "../../../shared/ui/tokens"
import { FilasEsqueleto } from "../../../shared/ui"

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
      sx={{ border: `1px solid ${COLOR.BORDE}`, borderRadius: 2, overflow: "hidden" }}
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
            <FilasEsqueleto columnas={9} />
          ) : programaciones.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                <InboxOutlinedIcon sx={{ fontSize: 34, color: COLOR.BORDE_FUERTE, mb: 1 }} />
                <Typography variant="body2" color={COLOR.TENUE} fontWeight={500}>
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
                <TableCell sx={{ color: COLOR.APAGADO }}>
                  {programacion.dist_nv_l != null ? `${programacion.dist_nv_l} Km` : "No obtenido"}
                </TableCell>
                <TableCell>{programacion.caja_numero || "-"}</TableCell>
                <TableCell>{programacion.caja_externa_numero || "-"}</TableCell>
                <TableCell>{programacion.nombre_compania || "-"}</TableCell>
                <TableCell>{programacion.destino || "-"}</TableCell>
                <TableCell sx={{ fontVariantNumeric: "tabular-nums", color: COLOR.APAGADO }}>
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
                      sx={{ "&:hover": { bgcolor: COLOR.RELLENO } }}
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
                      sx={{ "&:hover": { bgcolor: COLOR.PELIGRO_FONDO } }}
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
