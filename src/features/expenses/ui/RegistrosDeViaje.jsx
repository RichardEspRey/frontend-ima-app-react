import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import { useNavigate, useParams } from "react-router-dom"

import { esManual, useRegistros } from "../../../entities/expense"
import { decimales, moneda } from "../../../shared/lib/formato"
import { PageHeader, PantallaEsqueleto } from "../../../shared/ui"
import { COLOR } from "../../../shared/ui/tokens"

/**
 * El contenido de una celda del detalle, según lo que declare la columna.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.columna La columna del descriptor.
 * @param {object} props.registro El registro de la fila.
 * @returns {object} La celda renderizada.
 */
function Celda({ columna, registro }) {
  const valor = registro?.[columna.clave]

  if (columna.tipo === "dinero") {
    return (
      <Typography component="span" fontWeight={600} color={columna.color}>
        {moneda(valor)}
      </Typography>
    )
  }

  if (columna.tipo === "galones") return <>{decimales(valor)}</>

  if (columna.tipo === "origen") {
    const manual = esManual(registro)
    return (
      <Chip
        label={manual ? "Manual" : "Automático"}
        size="small"
        variant="outlined"
        sx={{
          fontWeight: 600,
          borderColor: manual ? COLOR.AVISO : COLOR.BORDE_FUERTE,
          color: manual ? COLOR.AVISO : COLOR.APAGADO,
        }}
      />
    )
  }

  if (columna.peso) {
    return (
      <Typography component="span" fontWeight={columna.peso}>
        {valor ?? "—"}
      </Typography>
    )
  }

  return <>{valor || "—"}</>
}

/**
 * Los registros de un viaje: sus gastos o sus cargas de diesel.
 *
 * Se llega desde el resumen tocando "View". Cada renglón se abre para editarlo,
 * y en diesel además se puede capturar una carga a mano.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.descriptor El descriptor del tipo de registro.
 * @param {Function} [props.onAlta] Abre el alta manual; solo diesel la tiene.
 * @param {object} [props.children] Lo que se dibuje después de la tabla, como el modal de alta.
 * @returns {object} La pantalla renderizada.
 */
export function RegistrosDeViaje({ descriptor, onAlta, children }) {
  const { tripId } = useParams()
  const navigate = useNavigate()

  const { data: registros = [], isLoading } = useRegistros(descriptor.clave, tripId)
  const columnas = descriptor.columnasDetalle.length + 2
  const viaje = registros[0]?.trip_number ?? tripId

  if (isLoading) {
    return <PantallaEsqueleto columnas={columnas} />
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        seccion={descriptor.etiquetas.plural}
        titulo={`Viaje ${viaje}`}
        descripcion={`${registros.length} registro${registros.length === 1 ? "" : "s"} en este viaje.`}
        acciones={
          <Stack direction="row" spacing={1.5}>
            {onAlta && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={onAlta}>
                Agregar manual
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(descriptor.rutas.volver)}
            >
              Return
            </Button>
          </Stack>
        }
      />

      <Paper elevation={1} sx={{ width: "100%", mb: 2, overflow: "hidden" }}>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 800 }} size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>No.</TableCell>
                {descriptor.columnasDetalle.map((columna) => (
                  <TableCell
                    key={columna.clave}
                    sx={{ fontWeight: 600, textAlign: columna.alineacion }}
                  >
                    {columna.etiqueta}
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 600, textAlign: "center" }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {registros.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columnas} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      {descriptor.etiquetas.vacioDetalle}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                registros.map((registro, indice) => (
                  <TableRow key={registro.id} hover>
                    <TableCell>{indice + 1}</TableCell>
                    {descriptor.columnasDetalle.map((columna) => (
                      <TableCell key={columna.clave} align={columna.alineacion}>
                        <Celda columna={columna} registro={registro} />
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        sx={{ textTransform: "none" }}
                        onClick={() =>
                          navigate(descriptor.rutas.editor(registro.id, registro.trip_id))
                        }
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {children}
    </Box>
  )
}
