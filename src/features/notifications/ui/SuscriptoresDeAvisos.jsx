import { useState } from "react"
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import BuildIcon from "@mui/icons-material/Build"
import CheckIcon from "@mui/icons-material/Check"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import PersonAddIcon from "@mui/icons-material/PersonAddAlt1"
import PersonRemoveIcon from "@mui/icons-material/PersonRemoveOutlined"
import SearchIcon from "@mui/icons-material/Search"

import { fechaDeNotificacion } from "../../../entities/notification"
import { useSesion } from "../../../shared/auth"
import {
  BloqueEsqueleto,
  COLOR,
  DARK_BTN_SX,
  DIALOG_PAPER_SX,
  EstadoError,
  INPUT_SX,
  SECTION_LABEL_SX,
  TINTE,
  notify,
} from "../../../shared/ui"
import { CATEGORIAS_DE_AVISO, buscarPersonas, nombreDe } from "../model/categorias"

const APARIENCIA = {
  bl: { Icono: LocalShippingIcon, color: COLOR.INFO, fondo: COLOR.INFO_FONDO },
  inspecciones: { Icono: BuildIcon, color: TINTE.NARANJA.texto, fondo: TINTE.NARANJA.fondo },
}

const ETIQUETA_SX = { ...SECTION_LABEL_SX, display: "block", lineHeight: 1, textTransform: "uppercase" }

/**
 * La inicial que va en el avatar de una persona.
 *
 * @param {object} persona La persona.
 * @returns {string} Una letra mayúscula, o `?`.
 */
const inicialDe = (persona) => nombreDe(persona).trim().charAt(0).toUpperCase() || "?"

/**
 * Desde cuándo recibe la persona el aviso, como `17/09/26`.
 *
 * @param {string} [texto] La fecha de PHP.
 * @returns {string} La fecha corta, o vacío si no vino.
 */
function desdeCuando(texto) {
  const fecha = fechaDeNotificacion(texto)
  if (!fecha || Number.isNaN(fecha.getTime())) return ""
  return fecha.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "2-digit" })
}

/**
 * La muestra de cómo se ve el aviso en la campana.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.categoria La categoría del aviso.
 * @returns {object} El renglón de muestra.
 */
function Muestra({ categoria }) {
  const { Icono, color, fondo } = APARIENCIA[categoria.id]
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1.5,
        py: 1.25,
        borderRadius: 2,
        bgcolor: COLOR.LIENZO,
        border: `1px dashed ${COLOR.BORDE}`,
      }}
    >
      <Avatar sx={{ bgcolor: fondo, color, width: 32, height: 32 }}>
        <Icono sx={{ fontSize: 18 }} />
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" fontWeight={800} color={COLOR.TINTA} noWrap>
          {categoria.ejemplo.titulo}
        </Typography>
        <Typography variant="caption" color={COLOR.APAGADO} noWrap sx={{ display: "block" }}>
          {categoria.ejemplo.subtitulo}
        </Typography>
      </Box>
    </Box>
  )
}

/**
 * El diálogo para agregar personas a un aviso.
 *
 * Se queda abierto para agregar a varias seguidas; cada una se marca al entrar.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.categoria La categoría del aviso.
 * @param {boolean} props.abierto Si se ve.
 * @param {Function} props.onCerrar Qué hacer al cerrarlo.
 * @returns {object} El diálogo renderizado.
 */
function DialogoAgregar({ categoria, abierto, onCerrar }) {
  const { usuario } = useSesion()
  const [busqueda, setBusqueda] = useState("")
  const [agregadas, setAgregadas] = useState([])
  const [agregando, setAgregando] = useState(null)

  const disponibles = categoria.useDisponibles(abierto)
  const suscribir = categoria.useSuscribir()


  const agregar = async (persona) => {
    setAgregando(persona.id)
    try {
      await suscribir.mutateAsync(categoria.variables(persona, usuario?.id))
      setAgregadas((previas) => [...previas, persona])
    } catch (fallo) {
      notify.error(fallo)
    } finally {
      setAgregando(null)
    }
  }

  const cerrar = () => {
    setBusqueda("")
    setAgregadas([])
    onCerrar()
  }

  const visibles = [
    ...buscarPersonas(agregadas, busqueda),
    ...buscarPersonas(disponibles.data ?? [], busqueda),
  ].filter((persona, indice, lista) => lista.findIndex((otra) => otra.id === persona.id) === indice)

  return (
    <Dialog open={abierto} onClose={cerrar} maxWidth="xs" fullWidth PaperProps={{ sx: DIALOG_PAPER_SX }}>
      <DialogTitle component="div" sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={800} color={COLOR.TINTA}>
          Agregar a {categoria.nombre}
        </Typography>
        <Typography variant="body2" color={COLOR.APAGADO}>
          Toca a cada persona que deba recibir estos avisos.
        </Typography>
      </DialogTitle>

      <DialogContent>
        <TextField
          fullWidth
          size="small"
          autoFocus
          placeholder="Buscar por nombre o usuario"
          value={busqueda}
          onChange={(evento) => setBusqueda(evento.target.value)}
          sx={{ mt: 1, mb: 1.5, "& .MuiOutlinedInput-root": INPUT_SX }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {disponibles.isLoading ? (
          <BloqueEsqueleto alto={200} conTitulo={false} />
        ) : (
          <List dense disablePadding sx={{ maxHeight: 320, overflowY: "auto" }}>
            {visibles.length === 0 && (
              <Typography variant="body2" color={COLOR.TENUE} sx={{ py: 3, textAlign: "center" }}>
                {busqueda.trim() ? "Nadie coincide con la búsqueda." : "Todas las personas ya reciben estos avisos."}
              </Typography>
            )}

            {visibles.map((persona) => {
              const yaAgregada = agregadas.some((una) => una.id === persona.id)
              return (
                <ListItemButton
                  key={persona.id}
                  onClick={() => (yaAgregada ? null : agregar(persona))}
                  disabled={agregando === persona.id}
                  sx={{ borderRadius: 2, mb: 0.5, bgcolor: yaAgregada ? COLOR.EXITO_FONDO : "transparent" }}
                >
                  <ListItemAvatar sx={{ minWidth: 44 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        bgcolor: TINTE.INDIGO.fondo,
                        color: TINTE.INDIGO.texto,
                      }}
                    >
                      {inicialDe(persona)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={700} color={COLOR.TINTA}>
                        {nombreDe(persona)}
                      </Typography>
                    }
                    secondary={persona.user || null}
                  />
                  {agregando === persona.id ? <CircularProgress size={16} /> : null}
                  {yaAgregada ? <CheckIcon fontSize="small" sx={{ color: COLOR.EXITO }} /> : null}
                </ListItemButton>
              )
            })}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={cerrar} variant="contained" sx={DARK_BTN_SX}>
          Listo
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/**
 * La tarjeta de un aviso: qué es, cómo se ve y quién lo recibe.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.categoria Una de `CATEGORIAS_DE_AVISO`.
 * @returns {object} La tarjeta renderizada.
 */
function TarjetaAviso({ categoria }) {
  const { usuario } = useSesion()
  const { Icono, color, fondo } = APARIENCIA[categoria.id]
  const [agregarAbierto, setAgregarAbierto] = useState(false)
  const [quitando, setQuitando] = useState(null)

  const suscriptores = categoria.useSuscriptores()
  const desuscribir = categoria.useDesuscribir()
  const personas = suscriptores.data ?? []

  const quitar = async (persona) => {
    setQuitando(persona.id)
    try {
      await desuscribir.mutateAsync(categoria.variables(persona, usuario?.id))
      notify.exito(`${nombreDe(persona)} ya no recibirá los avisos de ${categoria.nombre}.`)
    } catch (fallo) {
      notify.error(fallo)
    } finally {
      setQuitando(null)
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${COLOR.BORDE}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Box sx={{ p: 3, pb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar sx={{ bgcolor: fondo, color, width: 44, height: 44, borderRadius: 2.5 }}>
            <Icono />
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h6" fontWeight={800} color={COLOR.TINTA} sx={{ lineHeight: 1.3 }}>
                {categoria.nombre}
              </Typography>
              {suscriptores.isSuccess ? (
                <Chip
                  size="small"
                  label={`${personas.length} ${personas.length === 1 ? "persona" : "personas"}`}
                  sx={{ height: 22, fontWeight: 700, bgcolor: COLOR.RELLENO, color: COLOR.TEXTO_SUAVE }}
                />
              ) : null}
            </Stack>
            <Typography variant="body2" color={COLOR.APAGADO} sx={{ mt: 0.5 }}>
              {categoria.descripcion}
            </Typography>
          </Box>
        </Stack>

        <Typography variant="overline" sx={{ ...ETIQUETA_SX, mt: 2.5, mb: 1 }}>
          Así se ve en la campana
        </Typography>
        <Muestra categoria={categoria} />
      </Box>

      <Box sx={{ px: 3, pt: 1, pb: 1, flexGrow: 1 }}>
        <Typography variant="overline" sx={{ ...ETIQUETA_SX, mb: 0.5 }}>
          Quién lo recibe
        </Typography>

        {suscriptores.isLoading ? <BloqueEsqueleto alto={120} conTitulo={false} /> : null}

        {suscriptores.isError ? (
          <EstadoError error={suscriptores.error} onReintentar={suscriptores.refetch} />
        ) : null}

        {suscriptores.isSuccess && personas.length === 0 ? (
          <Typography variant="body2" color={COLOR.TENUE} sx={{ py: 3, textAlign: "center" }}>
            Nadie recibe estos avisos todavía.
          </Typography>
        ) : null}

        {suscriptores.isSuccess && personas.length > 0 ? (
          <List disablePadding sx={{ maxHeight: 320, overflowY: "auto" }}>
            {personas.map((persona) => {
              const desde = desdeCuando(persona.subscribed_at)
              return (
                <Box
                  key={persona.id}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    py: 1,
                    borderBottom: `1px solid ${COLOR.RELLENO}`,
                    "&:last-of-type": { borderBottom: "none" },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 34,
                      height: 34,
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      bgcolor: TINTE.INDIGO.fondo,
                      color: TINTE.INDIGO.texto,
                    }}
                  >
                    {inicialDe(persona)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700} color={COLOR.TINTA} noWrap>
                      {nombreDe(persona)}
                    </Typography>
                    <Typography variant="caption" color={COLOR.TENUE} noWrap sx={{ display: "block" }}>
                      {persona.user || "—"}
                      {desde ? ` · desde ${desde}` : ""}
                    </Typography>
                  </Box>
                  <Tooltip title="Quitar">
                    <span>
                      <IconButton
                        size="small"
                        aria-label={`Quitar a ${nombreDe(persona)}`}
                        onClick={() => quitar(persona)}
                        disabled={quitando === persona.id}
                        sx={{
                          color: COLOR.TENUE,
                          "&:hover": { color: COLOR.PELIGRO, bgcolor: COLOR.PELIGRO_FONDO },
                        }}
                      >
                        {quitando === persona.id ? (
                          <CircularProgress size={16} />
                        ) : (
                          <PersonRemoveIcon fontSize="small" />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              )
            })}
          </List>
        ) : null}
      </Box>

      <Box sx={{ px: 3, py: 2, borderTop: `1px solid ${COLOR.BORDE}`, bgcolor: COLOR.CABECERA }}>
        <Button
          fullWidth
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => setAgregarAbierto(true)}
          disabled={!suscriptores.isSuccess}
          sx={DARK_BTN_SX}
        >
          Agregar persona
        </Button>
      </Box>

      <DialogoAgregar
        categoria={categoria}
        abierto={agregarAbierto}
        onCerrar={() => setAgregarAbierto(false)}
      />
    </Paper>
  )
}

/**
 * Los avisos de la campana, una tarjeta por cada uno, con quién los recibe.
 *
 * @returns {object} La rejilla de tarjetas.
 */
export function SuscriptoresDeAvisos() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" },
        gap: 3,
        alignItems: "start",
      }}
    >
      {CATEGORIAS_DE_AVISO.map((categoria) => (
        <TarjetaAviso key={categoria.id} categoria={categoria} />
      ))}
    </Box>
  )
}
