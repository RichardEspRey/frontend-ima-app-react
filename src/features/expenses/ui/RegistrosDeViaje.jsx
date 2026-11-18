import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Switch,
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
import EditOutlinedIcon from "@mui/icons-material/EditOutlined"
import { useNavigate, useParams } from "react-router-dom"

import { esManual, usaFleetone, useRegistros } from "../../../entities/expense"
import { decimales, moneda } from "../../../shared/lib/formato"
import {
  CARD_SX,
  CELL_MUTED_SX,
  CELL_STRONG_SX,
  CELL_SX,
  CHIP_INFO_SX,
  CHIP_WARN_SX,
  DARK_BTN_SX,
  GHOST_BTN_SX,
  HEADER_CELL_SX,
  HEADER_ROW_SX,
  PAGE_SHELL_SX,
  PageHeader,
  PantallaEsqueleto,
  SECTION_LABEL_SX,
  TABLE_CONTAINER_SX,
} from "../../../shared/ui"
import { COLOR } from "../../../shared/ui/tokens"

const EDITAR_BTN_SX = { ...GHOST_BTN_SX, px: 1.5, py: 0.4, fontSize: "0.78rem" }
const NUMERO_SX = { fontVariantNumeric: "tabular-nums" }

/**
 * La franja de arriba del detalle: el viaje, cuántos registros tiene y sus totales.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array.<{etiqueta: string, valor: string, destacado: boolean}>} props.datos Lo que se enseña.
 * @returns {object} La franja.
 */
function Resumen({ datos }) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, mb: 3 }}>
      <Stack direction="row" flexWrap="wrap" useFlexGap columnGap={6} rowGap={2}>
        {datos.map(({ etiqueta, valor, destacado }) => (
          <Box key={etiqueta}>
            <Typography variant="caption" sx={{ ...SECTION_LABEL_SX, display: "block", textTransform: "uppercase" }}>
              {etiqueta}
            </Typography>
            <Typography
              variant={destacado ? "h6" : "body1"}
              fontWeight={destacado ? 800 : 600}
              color={destacado ? COLOR.TINTA : COLOR.TEXTO}
              sx={{ mt: 0.25, ...NUMERO_SX }}
            >
              {valor}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  )
}

/**
 * El contenido de una celda del detalle, según lo que declare la columna.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.columna La columna del descriptor.
 * @param {object} props.registro El registro de la fila.
 * @param {Function} [props.onFuenteMargen] Mueve el switch de Fleet One / Total.
 * @returns {object} La celda renderizada.
 */
function Celda({ columna, registro, onFuenteMargen }) {
  const valor = registro?.[columna.clave]

  if (columna.tipo === "dinero") {
    return (
      <Typography component="span" fontWeight={700} color={columna.color ?? COLOR.TINTA} sx={NUMERO_SX}>
        {moneda(valor)}
      </Typography>
    )
  }

  if (columna.tipo === "galones") return <>{decimales(valor)}</>

  if (columna.tipo === "origen") {
    const manual = esManual(registro)
    return (
      <Chip label={manual ? "Manual" : "Automático"} size="small" sx={manual ? CHIP_WARN_SX : CHIP_INFO_SX} />
    )
  }

  if (columna.tipo === "fuenteMargen") {
    const fleetone = usaFleetone(registro)
    return (
      <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
        <Switch
          size="small"
          checked={fleetone}
          disabled={!onFuenteMargen}
          onChange={() => onFuenteMargen?.(registro, !fleetone)}
          slotProps={{ input: { "aria-label": "Margen toma el Fleet One" } }}
        />
        <Typography component="span" variant="body2" sx={{ minWidth: 60, textAlign: "left" }}>
          {fleetone ? "Fleet One" : "Total"}
        </Typography>
      </Stack>
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
 * @param {Function} [props.onFuenteMargen] Cambia si Margen toma el Fleet One o el Total; solo diesel la tiene.
 * @param {object} [props.children] Lo que se dibuje después de la tabla, como el modal de alta.
 * @returns {object} La pantalla renderizada.
 */
export function RegistrosDeViaje({ descriptor, onAlta, onFuenteMargen, children }) {
  const { tripId } = useParams()
  const navigate = useNavigate()

  const { data: registros = [], isLoading } = useRegistros(descriptor.clave, tripId)
  const columnas = descriptor.columnasDetalle.length + 2
  const viaje = registros[0]?.trip_number ?? tripId

  if (isLoading) {
    return <PantallaEsqueleto columnas={columnas} />
  }

  const sumar = (clave) => registros.reduce((suma, registro) => suma + Number(registro?.[clave] ?? 0), 0)
  const conGalones = descriptor.columnasDetalle.some((columna) => columna.clave === "galones")

  return (
    <Box sx={PAGE_SHELL_SX}>
      <PageHeader
        seccion={descriptor.seccionEditor}
        titulo={`Viaje ${viaje}`}
        descripcion={`${registros.length} registro${registros.length === 1 ? "" : "s"} en este viaje.`}
        acciones={
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(descriptor.rutas.volver)}
              sx={GHOST_BTN_SX}
            >
              Return
            </Button>
            {onAlta && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={onAlta} sx={DARK_BTN_SX}>
                Agregar manual
              </Button>
            )}
          </Stack>
        }
      />

      <Resumen
        datos={[
          { etiqueta: "Viaje", valor: viaje },
          { etiqueta: "Registros", valor: String(registros.length) },
          ...(conGalones ? [{ etiqueta: "Galones", valor: `${decimales(sumar("galones"))} gal` }] : []),
          { etiqueta: "Total", valor: moneda(sumar("monto")), destacado: true },
        ]}
      />

      <TableContainer component={Paper} elevation={0} sx={TABLE_CONTAINER_SX}>
        <Table sx={{ minWidth: 800 }} size="small">
          <TableHead>
            <TableRow sx={HEADER_ROW_SX}>
              <TableCell sx={HEADER_CELL_SX}>No.</TableCell>
              {descriptor.columnasDetalle.map((columna) => (
                <TableCell key={columna.clave} sx={{ ...HEADER_CELL_SX, textAlign: columna.alineacion }}>
                  {columna.etiqueta}
                </TableCell>
              ))}
              <TableCell sx={{ ...HEADER_CELL_SX, textAlign: "center" }}>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {registros.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnas} align="center" sx={{ py: 6 }}>
                  <Typography color={COLOR.APAGADO} variant="body2">
                    {descriptor.etiquetas.vacioDetalle}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              registros.map((registro, indice) => (
                <TableRow key={registro.id} hover sx={{ bgcolor: esManual(registro) ? COLOR.AVISO_FONDO : "inherit" }}>
                  <TableCell sx={CELL_MUTED_SX}>{indice + 1}</TableCell>
                  {descriptor.columnasDetalle.map((columna) => (
                    <TableCell
                      key={columna.clave}
                      align={columna.alineacion}
                      sx={{ ...(columna.peso ? CELL_STRONG_SX : CELL_SX), ...NUMERO_SX }}
                    >
                      <Celda columna={columna} registro={registro} onFuenteMargen={onFuenteMargen} />
                    </TableCell>
                  ))}
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
                      onClick={() => navigate(descriptor.rutas.editor(registro.id, registro.trip_id))}
                      sx={EDITAR_BTN_SX}
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

      {children}
    </Box>
  )
}
