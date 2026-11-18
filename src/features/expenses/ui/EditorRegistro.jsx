import { useEffect, useState } from "react"
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardMedia,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material"
import { urlSegura } from "../../../shared/security"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline"
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined"
import SaveIcon from "@mui/icons-material/Save"
import { useNavigate, useParams } from "react-router-dom"

import {
  useEliminarRegistro,
  useGuardarRegistro,
  useRegistro,
  useTickets,
} from "../../../entities/expense"
import { API_BASE } from "../../../shared/config/env"
import { moneda } from "../../../shared/lib/formato"
import {
  BloqueEsqueleto,
  CARD_SX,
  CHIP_SX,
  COLOR,
  DARK_BTN_SX,
  GHOST_BTN_SX,
  INPUT_SX,
  PAGE_SHELL_SX,
  PageHeader,
  SECTION_LABEL_SX,
  notify,
} from "../../../shared/ui"

const BOTON_BORRAR_SX = {
  ...GHOST_BTN_SX,
  color: COLOR.PELIGRO,
  borderColor: COLOR.PELIGRO_BORDE,
  "&:hover": { bgcolor: COLOR.PELIGRO_FONDO, borderColor: COLOR.PELIGRO_BORDE },
}

const CHIP_NEUTRO_SX = { ...CHIP_SX, bgcolor: COLOR.LIENZO, color: COLOR.TEXTO_SUAVE, border: `1px solid ${COLOR.BORDE}` }

/**
 * Una tarjeta del editor, con su etiqueta arriba.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.titulo La etiqueta.
 * @param {object} [props.extra] Lo que va a la derecha de la etiqueta.
 * @param {object} props.children El contenido.
 * @returns {object} La tarjeta.
 */
function Tarjeta({ titulo, extra, children }) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, height: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="overline" sx={SECTION_LABEL_SX}>{titulo}</Typography>
        {extra}
      </Stack>
      {children}
    </Paper>
  )
}

/**
 * La franja de arriba: los datos del registro que no se editan, la fecha y el total.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array.<{etiqueta: string, valor: string, destacado: boolean}>} props.datos Lo que se enseña.
 * @returns {object} La franja.
 */
function Resumen({ datos }) {
  return (
    <Paper elevation={0} sx={{ ...CARD_SX, mb: 3 }}>
      <Grid container spacing={2}>
        {datos.map(({ etiqueta, valor, destacado }) => (
          <Grid key={etiqueta} size={{ xs: 6, md: 12 / datos.length }}>
            <Typography variant="caption" sx={{ ...SECTION_LABEL_SX, display: "block", textTransform: "uppercase" }}>
              {etiqueta}
            </Typography>
            <Typography
              variant={destacado ? "h6" : "body1"}
              fontWeight={destacado ? 800 : 600}
              color={destacado ? COLOR.TINTA : COLOR.TEXTO}
              sx={{ mt: 0.25, fontVariantNumeric: "tabular-nums" }}
            >
              {valor || "—"}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Paper>
  )
}

const ES_IMAGEN = /\.(jpe?g|png|webp|gif)$/i

/**
 * La galería de tickets escaneados de un registro.
 *
 * Las imágenes se ven; lo que no es imagen —un PDF— se ofrece como enlace.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array} props.tickets Los tickets del registro.
 * @param {boolean} props.cargando Si se están pidiendo.
 * @returns {object} La galería renderizada.
 */
function Tickets({ tickets = [], cargando }) {
  if (cargando) {
    return (
      <Stack alignItems="center" sx={{ py: 4 }}>
        <CircularProgress size={24} />
      </Stack>
    )
  }

  if (tickets.length === 0) {
    return (
      <Box sx={{ py: 5, textAlign: "center", border: `1px dashed ${COLOR.BORDE}`, borderRadius: 2, bgcolor: COLOR.LIENZO }}>
        <DescriptionOutlinedIcon sx={{ color: COLOR.BORDE_FUERTE, fontSize: 36 }} />
        <Typography variant="body2" color={COLOR.APAGADO} sx={{ mt: 1 }}>
          Este registro no tiene tickets adjuntos.
        </Typography>
      </Box>
    )
  }

  return (
    <Grid container spacing={1.5}>
      {tickets.map((ticket) => {
        const url = `${API_BASE}/${ticket.url_pdf}`
        return (
          <Grid size={{ xs: 6, sm: 4 }} key={ticket.id}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: 2,
                borderColor: COLOR.BORDE,
                overflow: "hidden",
                "&:hover": { borderColor: COLOR.BORDE_FUERTE, boxShadow: "0 4px 12px rgba(15,23,42,0.08)" },
              }}
            >
              <CardActionArea href={urlSegura(url)} target="_blank" rel="noopener noreferrer">
                {ES_IMAGEN.test(ticket.url_pdf ?? "") ? (
                  <CardMedia
                    component="img"
                    height="120"
                    image={url}
                    alt={`Ticket ${ticket.id}`}
                    sx={{ objectFit: "cover" }}
                  />
                ) : (
                  <Stack alignItems="center" justifyContent="center" spacing={0.5} sx={{ height: 120, bgcolor: COLOR.LIENZO }}>
                    <DescriptionOutlinedIcon sx={{ fontSize: 34, color: COLOR.PELIGRO }} />
                    <Typography variant="caption" fontWeight={600} color={COLOR.TEXTO_SUAVE}>
                      Ver archivo
                    </Typography>
                  </Stack>
                )}
              </CardActionArea>
            </Card>
          </Grid>
        )
      })}
    </Grid>
  )
}

/**
 * Edición de un gasto o de una carga de diesel, con sus tickets.
 *
 * Los campos los declara el descriptor del tipo. Los de solo lectura —viaje y
 * conductor— se enseñan para saber de qué registro se trata, pero no se mandan
 * al guardar: no son editables desde aquí.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.descriptor El descriptor del tipo de registro.
 * @returns {object} La pantalla renderizada.
 */
export function EditorRegistro({ descriptor }) {
  const { id, trip_id: tripId } = useParams()
  const navigate = useNavigate()
  const [formulario, setFormulario] = useState(null)

  const { data: registro, isLoading, error } = useRegistro(descriptor.clave, id, tripId)
  const { data: tickets = [], isLoading: cargandoTickets } = useTickets(descriptor.clave, id, tripId)
  const guardar = useGuardarRegistro(descriptor.clave)
  const eliminar = useEliminarRegistro(descriptor.clave)

  useEffect(() => {
    if (registro) setFormulario(registro)
  }, [registro])

  const volver = () => navigate(descriptor.rutas.detalle(tripId))

  const guardarCambios = async () => {
    const editables = descriptor.campos.filter((campo) => !campo.soloLectura)

    try {
      await guardar.mutateAsync({
        registro: {
          id,
          trip_id: tripId,
          ...Object.fromEntries(editables.map((campo) => [campo.clave, formulario[campo.clave]])),
        },
      })
      await notify.exito("Los cambios se guardaron.")
      volver()
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  const borrar = async () => {
    const confirmado = await notify.confirmar({
      titulo: descriptor.etiquetas.confirmarBorrado,
      mensaje: "Esta acción no se puede deshacer.",
    })
    if (!confirmado) return

    try {
      await eliminar.mutateAsync({ id, tripId })
      await notify.exito("Registro eliminado.")
      volver()
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  if (isLoading || !formulario) {
    return (
      <Box sx={{ ...PAGE_SHELL_SX, display: "flex", justifyContent: "center", alignItems: "center" }}>
        {error ? (
          <Stack alignItems="center" spacing={2}>
            <Typography color="text.secondary">{error.message}</Typography>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={volver}>
              Volver
            </Button>
          </Stack>
        ) : (
          <BloqueEsqueleto alto={260} />
        )}
      </Box>
    )
  }

  const fijos = descriptor.campos.filter((campo) => campo.soloLectura)
  const editables = descriptor.campos.filter((campo) => !campo.soloLectura)

  return (
    <Box sx={PAGE_SHELL_SX}>
      <PageHeader
        seccion={descriptor.seccionEditor}
        titulo={descriptor.tituloEditor}
        descripcion={descriptor.descripcionEditor}
        acciones={
          <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={volver} sx={GHOST_BTN_SX}>
              Cancel
            </Button>
            <Button
              variant="outlined"
              startIcon={<DeleteOutlineIcon />}
              onClick={borrar}
              disabled={eliminar.isPending}
              sx={BOTON_BORRAR_SX}
            >
              Delete
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={guardarCambios}
              disabled={guardar.isPending}
              sx={DARK_BTN_SX}
            >
              Save Changes
            </Button>
          </Stack>
        }
      />

      <Resumen
        datos={[
          ...fijos.map((campo) => ({ etiqueta: campo.etiqueta, valor: formulario[campo.clave] })),
          { etiqueta: "Fecha", valor: formulario.fecha },
          { etiqueta: "Total", valor: formulario.monto !== "" && formulario.monto != null ? moneda(formulario.monto) : "", destacado: true },
        ]}
      />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Tarjeta titulo={`Detalles · ${descriptor.etiquetas.singular}`}>
            <Grid container spacing={2}>
              {editables.map((campo) => (
                <Grid size={{ xs: 12, sm: campo.ancho ?? 12 }} key={campo.clave}>
                  <TextField
                    label={campo.etiqueta}
                    type={campo.tipo ?? "text"}
                    value={formulario[campo.clave] ?? ""}
                    onChange={(e) => setFormulario({ ...formulario, [campo.clave]: e.target.value })}
                    placeholder={campo.ayuda}
                    fullWidth
                    size="small"
                    slotProps={{
                      input: {
                        sx: INPUT_SX,
                        startAdornment: campo.prefijo ? (
                          <InputAdornment position="start">{campo.prefijo}</InputAdornment>
                        ) : undefined,
                        endAdornment: campo.sufijo ? (
                          <InputAdornment position="end">{campo.sufijo}</InputAdornment>
                        ) : undefined,
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Tarjeta>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Tarjeta
            titulo="Tickets y evidencia"
            extra={
              cargandoTickets ? null : (
                <Chip
                  size="small"
                  label={`${tickets.length} ${tickets.length === 1 ? "archivo" : "archivos"}`}
                  sx={CHIP_NEUTRO_SX}
                />
              )
            }
          >
            <Tickets tickets={tickets} cargando={cargandoTickets} />
          </Tarjeta>
        </Grid>
      </Grid>
    </Box>
  )
}
