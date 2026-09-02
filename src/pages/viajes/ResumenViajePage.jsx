import { useRef } from "react"
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
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
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import DownloadIcon from "@mui/icons-material/Download"
import { useNavigate, useParams } from "react-router-dom"

import {
  colorEstadoViaje,
  dieselDeResumen,
  etapasDeResumen,
  etiquetaTipoEtapa,
  gastosDeResumen,
  totalesViaje,
  useResumenViaje,
} from "../../entities/trip"
import { CLASE_NO_IMPRIMIR, exportarElementoAPdf } from "../../shared/lib/pdf"
import { decimales, fechaHora, moneda, soloFecha, soloHora } from "../../shared/lib/formato"
import { notify } from "../../shared/ui"
import { COLOR } from "../../shared/ui/tokens"

const FILA_RESUMEN = { border: "none", borderBottom: `1px solid ${COLOR.RELLENO}`, py: 1.2 }
const NOTA_BD = { color: COLOR.TENUE, fontStyle: "italic", fontSize: "0.75rem" }

const COLOR_DIRECCION = { "Going Up": COLOR.EXITO, "Going Down": COLOR.AVISO }

/**
 * Barra de acento y título, para separar las secciones del resumen.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.color Color de la barra.
 * @param {object} props.children El texto del título.
 * @returns {object} El título renderizado.
 */
function TituloSeccion({ color, children }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 1.5, mt: 3.5 }}>
      <Box sx={{ width: 4, height: 22, bgcolor: color, borderRadius: 1 }} />
      <Typography variant="subtitle1" fontWeight={800} color={COLOR.TINTA}>
        {children}
      </Typography>
    </Stack>
  )
}

/**
 * La ficha de una etapa del viaje.
 *
 * Una etapa de millaje vacío no tiene compañía ni tarifa: lo que importa de ella
 * son las millas, así que se dibuja distinta.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.etapa La etapa a mostrar.
 * @returns {object} La ficha renderizada.
 */
function FichaEtapa({ etapa }) {
  const esVacia = String(etapa.stageType ?? "").toLowerCase() === "emptymileage"
  const titulo = `E${etapa.stage_number || "—"} (${etiquetaTipoEtapa(etapa.stageType)})`

  const recorrido =
    etapa.origin && etapa.destination
      ? `${etapa.origin} → ${etapa.destination}${etapa.travel_direction ? ` (${etapa.travel_direction})` : ""}`
      : etapa.travel_direction
        ? `(${etapa.travel_direction})`
        : ""

  const hora = soloHora(etapa.time_of_delivery)
  const fechas =
    etapa.loading_date || etapa.delivery_date || etapa.time_of_delivery
      ? `Carga: ${soloFecha(etapa.loading_date)} • Entrega: ${soloFecha(etapa.delivery_date)}${hora ? ` - ${hora} hrs` : ""}`
      : ""

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 2,
        borderColor: COLOR.BORDE,
        borderLeft: `3px solid ${COLOR_DIRECCION[etapa.travel_direction] ?? COLOR.BORDE_FUERTE}`,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={800} color={COLOR.TINTA}>
          {titulo}
        </Typography>
        {recorrido && (
          <Typography variant="body2" color={COLOR.APAGADO} sx={{ mb: 1.2 }}>
            {recorrido}
          </Typography>
        )}

        {!esVacia && (
          <Box sx={{ bgcolor: COLOR.RELLENO, borderRadius: 1.5, p: 1.4, mb: 1.2 }}>
            <Stack spacing={0.4}>
              <Typography variant="caption" sx={{ fontSize: "0.72rem", color: COLOR.TEXTO }}>
                <strong>Compañía:</strong> {etapa.nombre_compania || "—"}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: "0.72rem", color: COLOR.TEXTO }}>
                <strong>Bodega Origen:</strong> {etapa.warehouse_origin_name || "—"}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: "0.72rem", color: COLOR.TEXTO }}>
                <strong>Bodega Destino:</strong> {etapa.warehouse_destination_name || "—"}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: "0.72rem", color: COLOR.TEXTO }}>
                <strong>Millas:</strong>{" "}
                {etapa.millas_pcmiller ?? etapa.millas_pcmiller_practicas ?? "—"}
              </Typography>
            </Stack>
          </Box>
        )}

        {etapa.ci_number && (
          <Typography variant="caption" color={COLOR.TENUE} sx={{ display: "block", mb: 0.5 }}>
            CI: {etapa.ci_number}
          </Typography>
        )}
        {fechas && (
          <Typography variant="caption" color={COLOR.TENUE} sx={{ display: "block", mb: 1 }}>
            {fechas}
          </Typography>
        )}

        {esVacia ? (
          <Box sx={{ bgcolor: COLOR.INFO_FONDO, border: `1px solid ${COLOR.INFO_BORDE}`, borderRadius: 1.5, p: 1.2 }}>
            <Typography variant="subtitle2" fontWeight={700} color={COLOR.INFO}>
              {titulo}
            </Typography>
            <Typography variant="body2" color="#1e3a8a">
              Millas PC*Miler: {etapa.millas_pcmiller ?? "—"}
            </Typography>
            <Typography variant="body2" color="#1e3a8a">
              Millas Prácticas: {etapa.millas_pcmiller_practicas ?? "—"}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "inline-block",
              bgcolor: COLOR.EXITO_FONDO,
              border: `1px solid ${COLOR.EXITO}33`,
              borderRadius: 1,
              px: 1.2,
              py: 0.5,
            }}
          >
            <Typography
              variant="body2"
              fontWeight={800}
              color={COLOR.EXITO}
              sx={{ fontVariantNumeric: "tabular-nums" }}
            >
              Rate: {moneda(etapa.rate_tarifa)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Una fila del cuadro de totales.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.concepto Qué se está sumando.
 * @param {number} props.importe Cuánto.
 * @param {string} [props.nota] De dónde sale el dato.
 * @param {boolean} [props.ultima] Si es la última, para quitarle la línea.
 * @returns {object} La fila renderizada.
 */
function FilaTotal({ concepto, importe, nota = "Dato de la Base de datos", ultima }) {
  const estilo = ultima ? { border: "none", py: 1.2 } : FILA_RESUMEN

  return (
    <TableRow>
      <TableCell sx={{ ...estilo, fontWeight: 700, width: 360, color: COLOR.TINTA }}>
        {concepto}
      </TableCell>
      <TableCell
        sx={{ ...estilo, fontWeight: 800, color: COLOR.TINTA, fontVariantNumeric: "tabular-nums" }}
      >
        {moneda(importe)}
      </TableCell>
      <TableCell sx={{ ...estilo, ...NOTA_BD }}>{nota}</TableCell>
    </TableRow>
  )
}

/**
 * Resumen de un viaje: etapas, diesel, gastos y totales, listo para imprimir.
 *
 * Se llega desde el administrador de viajes y su razón de ser es el PDF: es el
 * documento que se manda cuando alguien pregunta qué se hizo y qué costó.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function ResumenViajePage() {
  const { tripId } = useParams()
  const navigate = useNavigate()
  const paraImprimir = useRef(null)

  const { data: resumen, isLoading, error } = useResumenViaje(tripId)

  const descargar = async () => {
    try {
      await exportarElementoAPdf({
        elemento: paraImprimir.current,
        nombreArchivo: `Resumen_Viaje_${resumen?.trip?.trip_number || "NA"}`,
      })
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
        <Typography ml={2}>Cargando resumen del viaje...</Typography>
      </Box>
    )
  }

  if (error || !resumen) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography color="text.secondary" mb={2}>
          {error?.message ?? "No se pudo cargar el resumen de este viaje."}
        </Typography>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
          Volver
        </Button>
      </Box>
    )
  }

  const viaje = resumen.trip ?? {}
  const etapas = etapasDeResumen(resumen)
  const cargas = dieselDeResumen(resumen)
  const gastos = gastosDeResumen(resumen)
  const totales = totalesViaje(resumen)
  const colorEstado = colorEstadoViaje(viaje.status)

  return (
    <Paper
      elevation={0}
      sx={{ p: { xs: 2, md: 3 }, m: 2, borderRadius: 3, border: `1px solid ${COLOR.BORDE}`, bgcolor: COLOR.BLANCO }}
    >
      <Box sx={{ mb: 2 }} className={CLASE_NO_IMPRIMIR}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          color="inherit"
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: 1.5,
            borderColor: COLOR.BORDE_FUERTE,
            color: COLOR.TEXTO,
          }}
        >
          Volver a TripAdmin
        </Button>
      </Box>

      <div ref={paraImprimir}>
        <Box
          sx={{
            p: 2.5,
            borderRadius: 2,
            border: `1px solid ${COLOR.BORDE}`,
            bgcolor: COLOR.LIENZO,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
            mb: 1,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={800} color={COLOR.TINTA} sx={{ lineHeight: 1.2 }}>
              {viaje.trip_number || "—"}
            </Typography>
            <Typography variant="body2" color={COLOR.APAGADO}>
              {viaje.nombre || "Sin nombre de viaje"}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              label={fechaHora(viaje.creation_date)}
              size="small"
              sx={{ bgcolor: COLOR.BLANCO, border: `1px solid ${COLOR.BORDE}`, color: COLOR.TEXTO_SUAVE, fontWeight: 600 }}
            />
            <Chip
              label={viaje.status || "—"}
              size="small"
              sx={{
                bgcolor: `${colorEstado}1a`,
                color: colorEstado,
                fontWeight: 700,
                border: `1px solid ${colorEstado}55`,
              }}
            />
          </Stack>
        </Box>

        <TituloSeccion color={COLOR.INFO}>Detalles de Etapas y Documentos</TituloSeccion>
        <Grid container spacing={2}>
          {etapas.map((etapa) => (
            <Grid key={etapa.trip_stage_id} size={{ xs: 12, md: 4 }}>
              <FichaEtapa etapa={etapa} />
            </Grid>
          ))}
        </Grid>

        <TituloSeccion color={COLOR.AVISO}>Diesel</TituloSeccion>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2, overflow: "hidden", borderColor: COLOR.BORDE }}
        >
          <Table size="small">
            <TableHead sx={{ bgcolor: COLOR.RELLENO }}>
              <TableRow>
                {["No", "Trip number", "Fecha", "Odómetro", "Galones"].map((titulo) => (
                  <TableCell key={titulo} sx={{ fontWeight: 700, color: COLOR.TEXTO_SUAVE }}>
                    {titulo}
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 700, color: COLOR.TEXTO_SUAVE, textAlign: "right" }}>
                  Monto
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: COLOR.TEXTO_SUAVE }}>Driver</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {cargas.map((carga, indice) => (
                <TableRow key={carga.diesel_id ?? `${carga.fecha}-${indice}`} hover>
                  <TableCell>{indice + 1}</TableCell>
                  <TableCell>{viaje.trip_number || "—"}</TableCell>
                  <TableCell>{fechaHora(carga.fecha)}</TableCell>
                  <TableCell>{carga.odometro || "—"}</TableCell>
                  <TableCell>{decimales(carga.galones)} gal</TableCell>
                  <TableCell
                    sx={{ textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
                  >
                    {moneda(carga.monto)}
                  </TableCell>
                  <TableCell>{carga.nombre || "—"}</TableCell>
                </TableRow>
              ))}
              {cargas.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    sx={{ py: 3, color: COLOR.TENUE, fontStyle: "italic" }}
                  >
                    Sin registros
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TituloSeccion color={COLOR.PELIGRO}>Gastos viaje</TituloSeccion>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ borderRadius: 2, overflow: "hidden", borderColor: COLOR.BORDE }}
        >
          <Table size="small">
            <TableHead sx={{ bgcolor: COLOR.RELLENO }}>
              <TableRow>
                {["No", "Trip number", "Fecha", "Tipo de gasto"].map((titulo) => (
                  <TableCell key={titulo} sx={{ fontWeight: 700, color: COLOR.TEXTO_SUAVE }}>
                    {titulo}
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 700, color: COLOR.TEXTO_SUAVE, textAlign: "right" }}>
                  Monto
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: COLOR.TEXTO_SUAVE }}>Driver</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {gastos.map((gasto, indice) => (
                <TableRow key={gasto.expense_id ?? `${gasto.fecha}-${indice}`} hover>
                  <TableCell>{indice + 1}</TableCell>
                  <TableCell>{viaje.trip_number || "—"}</TableCell>
                  <TableCell>{fechaHora(gasto.fecha)}</TableCell>
                  <TableCell>{gasto.tipo_gasto || "—"}</TableCell>
                  <TableCell
                    sx={{ textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}
                  >
                    {moneda(gasto.monto)}
                  </TableCell>
                  <TableCell>{gasto.nombre || "—"}</TableCell>
                </TableRow>
              ))}
              {gastos.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    align="center"
                    sx={{ py: 3, color: COLOR.TENUE, fontStyle: "italic" }}
                  >
                    Sin registros
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TituloSeccion color={COLOR.TINTA}>Trip Summary</TituloSeccion>
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, borderColor: COLOR.BORDE }}>
          <Table size="small">
            <TableBody>
              <FilaTotal
                concepto="Total invoice (suma de los rates de las etapas del viaje)"
                importe={totales.tarifa}
                nota="Dato de la Base de datos (totales.rate)"
              />
              <FilaTotal
                concepto="Diesel (suma de las cargas de diesel del viaje)"
                importe={totales.diesel}
              />
              <FilaTotal concepto="Driver Pay (Pagos Autorizados)" importe={totales.pagoConductor} />
              <FilaTotal
                concepto="Expenses (suma de los gastos misc del viaje)"
                importe={totales.gastos}
                ultima
              />
            </TableBody>
          </Table>
        </Paper>
      </div>

      <Box sx={{ mt: 3, pb: 1, display: "flex", justifyContent: "flex-end" }} className={CLASE_NO_IMPRIMIR}>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={descargar}
          sx={{
            bgcolor: COLOR.TINTA,
            fontWeight: 700,
            borderRadius: 1.5,
            textTransform: "none",
            px: 3,
            "&:hover": { bgcolor: COLOR.TINTA_CLARA },
          }}
        >
          Descargar PDF
        </Button>
      </Box>
    </Paper>
  )
}
