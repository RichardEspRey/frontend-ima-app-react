import { useEffect, useState } from "react"
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardMedia,
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
import DeleteIcon from "@mui/icons-material/Delete"
import DescriptionIcon from "@mui/icons-material/Description"
import SaveIcon from "@mui/icons-material/Save"
import { useNavigate, useParams } from "react-router-dom"

import {
  useEliminarRegistro,
  useGuardarRegistro,
  useRegistro,
  useTickets,
} from "../../../entities/expense"
import { API_BASE } from "../../../shared/config/env"
import { notify } from "../../../shared/ui"

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
      <Typography color="text.secondary" sx={{ py: 3 }}>
        Este registro no tiene tickets adjuntos.
      </Typography>
    )
  }

  return (
    <Grid container spacing={2}>
      {tickets.map((ticket) => {
        const url = `${API_BASE}/${ticket.url_pdf}`
        return (
          <Grid size={{ xs: 6, sm: 4 }} key={ticket.id}>
            <Card variant="outlined">
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
                  <Stack alignItems="center" justifyContent="center" sx={{ height: 120 }}>
                    <DescriptionIcon sx={{ fontSize: 34, color: "#94a3b8" }} />
                    <Typography variant="caption">Ver archivo</Typography>
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
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        {error ? (
          <Stack alignItems="center" spacing={2}>
            <Typography color="text.secondary">{error.message}</Typography>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={volver}>
              Volver
            </Button>
          </Stack>
        ) : (
          <CircularProgress />
        )}
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
        sx={{ mb: 3 }}
      >
        <Typography variant="h4" component="h1" fontWeight={700}>
          {descriptor.tituloEditor}
        </Typography>

        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" color="inherit" startIcon={<ArrowBackIcon />} onClick={volver}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={borrar}
            disabled={eliminar.isPending}
          >
            Delete
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={guardarCambios}
            disabled={guardar.isPending}
          >
            Save Changes
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={1} sx={{ p: 3, border: "1px solid #ccc" }}>
            <Typography
              variant="h6"
              fontWeight={600}
              gutterBottom
              sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 3 }}
            >
              Detalles
            </Typography>

            <Grid container spacing={2}>
              {descriptor.campos.map((campo) => (
                <Grid size={{ xs: 12, sm: campo.ancho ?? 12 }} key={campo.clave}>
                  <TextField
                    label={campo.etiqueta}
                    type={campo.tipo ?? "text"}
                    value={formulario[campo.clave] ?? ""}
                    onChange={(e) =>
                      setFormulario({ ...formulario, [campo.clave]: e.target.value })
                    }
                    placeholder={campo.ayuda}
                    fullWidth
                    size="small"
                    disabled={campo.soloLectura}
                    variant={campo.soloLectura ? "filled" : "outlined"}
                    InputProps={{
                      startAdornment: campo.prefijo ? (
                        <InputAdornment position="start">{campo.prefijo}</InputAdornment>
                      ) : undefined,
                      endAdornment: campo.sufijo ? (
                        <InputAdornment position="end">{campo.sufijo}</InputAdornment>
                      ) : undefined,
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={1} sx={{ p: 3, border: "1px solid #ccc", height: "100%" }}>
            <Typography
              variant="h6"
              fontWeight={600}
              gutterBottom
              sx={{ borderBottom: "1px solid #eee", pb: 1, mb: 3 }}
            >
              Tickets &amp; Evidencia
            </Typography>
            <Tickets tickets={tickets} cargando={cargandoTickets} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}
