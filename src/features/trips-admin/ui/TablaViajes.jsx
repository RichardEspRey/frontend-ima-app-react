import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material"
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined"

import { TripRow } from "../../../components/TripRow"
import { API_BASE } from "../../../shared/config/env"
import { HEADER_CELL_SX, HEADER_ROW_SX } from "../../../shared/ui/estilos"
import { columnasDeTabla, documentosFaltantesDeViaje, urlDocumento } from "../model/documentos"
import { COLOR } from "../../../shared/ui/tokens"

const CELDA_CENTRADA = { ...HEADER_CELL_SX, textAlign: "center" }

/**
 * La fila que ocupa toda la tabla cuando no hay nada que mostrar.
 *
 * @param {object} props Propiedades del componente.
 * @param {number} props.columnas Cuántas columnas abarcar.
 * @param {boolean} props.cargando Si todavía se están pidiendo los viajes.
 * @returns {object} La fila renderizada.
 */
function FilaVacia({ columnas, cargando }) {
  if (cargando) {
    return (
      <TableRow>
        <TableCell colSpan={columnas} align="center" sx={{ py: 5 }}>
          <CircularProgress
            size={22}
            sx={{ mr: 1.5, verticalAlign: "middle", color: COLOR.TENUE }}
          />
          <Typography component="span" color={COLOR.APAGADO} fontWeight={500}>
            Actualizando datos...
          </Typography>
        </TableCell>
      </TableRow>
    )
  }

  return (
    <TableRow>
      <TableCell colSpan={columnas} align="center" sx={{ py: 6 }}>
        <InboxOutlinedIcon sx={{ fontSize: 34, color: COLOR.BORDE_FUERTE, mb: 1 }} />
        <Typography variant="body2" color={COLOR.TENUE} fontWeight={500}>
          No se localizaron registros en esta categoría.
        </Typography>
      </TableCell>
    </TableRow>
  )
}

/**
 * La tabla de viajes, con las columnas que corresponden a la pestaña.
 *
 * Qué columnas hay depende de la pestaña y de los permisos: las de próximos y
 * despacho enseñan los documentos que faltan en lugar de las fechas, la de en
 * ruta añade el botón de copiar, y las de en ruta y finalizados añaden acciones
 * de administración.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array} props.viajes Los viajes de la página actual.
 * @param {number} props.total Cuántos viajes hay en total.
 * @param {boolean} props.cargando Si se están pidiendo.
 * @param {object} props.vista En qué pestaña y con qué permisos se está.
 * @param {object} props.paginacion Página, tamaño y sus manejadores.
 * @param {object} props.acciones Los manejadores de cada acción de fila.
 * @returns {object} La tabla renderizada.
 */
export function TablaViajes({ viajes = [], total, cargando, vista, paginacion, acciones }) {
  const { conDocumentos, enRuta, proximos, despacho, finalizados, esAdmin } = vista
  const conAdmin = esAdmin && (finalizados || enRuta)
  const columnas = columnasDeTabla({ conDocumentos, enRuta, conAdmin })

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: `1px solid ${COLOR.BORDE}`, borderRadius: 2, overflow: "hidden" }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={HEADER_ROW_SX}>
              <TableCell sx={HEADER_CELL_SX} />
              <TableCell sx={HEADER_CELL_SX}>Trip</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Driver(s)</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Truck</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Trailer</TableCell>

              {!conDocumentos && <TableCell sx={HEADER_CELL_SX}>Initial Date</TableCell>}
              <TableCell sx={HEADER_CELL_SX}>Status</TableCell>
              {!conDocumentos && <TableCell sx={HEADER_CELL_SX}>Return Date</TableCell>}
              {conDocumentos && <TableCell sx={CELDA_CENTRADA}>Documentos Faltantes</TableCell>}

              {enRuta && <TableCell sx={CELDA_CENTRADA}>Copiar Info</TableCell>}

              <TableCell sx={CELDA_CENTRADA}>Actions</TableCell>
              {conAdmin && <TableCell sx={CELDA_CENTRADA}>Admin</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {cargando || viajes.length === 0 ? (
              <FilaVacia columnas={columnas} cargando={cargando} />
            ) : (
              viajes.map((viaje) => {
                const { total: faltantes, lista } = documentosFaltantesDeViaje(viaje)
                return (
                  <TripRow
                    key={viaje.trip_id}
                    trip={viaje}
                    isAdmin={esAdmin}
                    canSpecialEdit={vista.puedeEdicionEspecial}
                    canManageInvoice={vista.puedeFacturar}
                    isCompletedTab={finalizados}
                    isDespachoTab={despacho}
                    isUpcomingTab={proximos}
                    isEnRutaTab={enRuta}
                    showDocsColumn={conDocumentos}
                    documentosFaltantes={faltantes}
                    documentosFaltantesLista={lista}
                    getDocumentUrl={(ruta) => urlDocumento(ruta, API_BASE)}
                    colSpanOverride={columnas}
                    {...acciones}
                  />
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box
        sx={{
          bgcolor: "white",
          border: `1px solid ${COLOR.BORDE}`,
          borderTop: "none",
          borderBottomLeftRadius: 8,
          borderBottomRightRadius: 8,
        }}
      >
        <TablePagination
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={total}
          rowsPerPage={paginacion.porPagina}
          page={paginacion.pagina}
          onPageChange={(evento, nueva) => paginacion.onPaginaChange(nueva)}
          onRowsPerPageChange={(evento) =>
            paginacion.onPorPaginaChange(Number.parseInt(evento.target.value, 10))
          }
          sx={{
            color: COLOR.TEXTO_SUAVE,
            ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows": {
              fontSize: "0.8rem",
            },
          }}
        />
      </Box>
    </>
  )
}
