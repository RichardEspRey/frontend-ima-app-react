import { useSyncExternalStore } from "react"
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material"
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded"
import ErrorRounded from "@mui/icons-material/ErrorRounded"
import WarningAmberRounded from "@mui/icons-material/WarningAmberRounded"
import HelpOutlineRounded from "@mui/icons-material/HelpOutlineRounded"
import InfoRounded from "@mui/icons-material/InfoRounded"
import { BORDE, COLOR, RADIO, SOMBRA } from "../tokens"
import { DIALOG_ACTIONS_SX, DIALOG_PAPER_SX } from "../estilos"
import { leer, responder, retirar, suscribir } from "./cola"

const ICONOS = {
  success: { Icono: CheckCircleRounded, color: COLOR.EXITO, fondo: COLOR.EXITO_FONDO },
  error: { Icono: ErrorRounded, color: COLOR.PELIGRO, fondo: COLOR.PELIGRO_FONDO },
  warning: { Icono: WarningAmberRounded, color: COLOR.AVISO, fondo: COLOR.AVISO_FONDO },
  question: { Icono: HelpOutlineRounded, color: COLOR.INFO, fondo: COLOR.INFO_FONDO },
  info: { Icono: InfoRounded, color: COLOR.INFO, fondo: COLOR.INFO_FONDO },
}

/**
 * El disco de color con el icono del aviso.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.icono Clave de `ICONOS`.
 * @returns {(object|null)} El disco, o nada si el icono no existe.
 */
function Disco({ icono }) {
  const definicion = ICONOS[icono]
  if (!definicion) return null

  const { Icono, color, fondo } = definicion
  return (
    <Box
      sx={{
        width: 44,
        height: 44,
        flexShrink: 0,
        borderRadius: "50%",
        bgcolor: fondo,
        display: "grid",
        placeItems: "center",
      }}
    >
      <Icono sx={{ color, fontSize: 26 }} />
    </Box>
  )
}

/**
 * El detalle estructurado de un aviso: una lista, o un resumen de renglones.
 *
 * Sustituye al HTML que se le pasaba antes a la librería de diálogos. Aquello
 * era la única puerta de XSS de la aplicación, y no era teórica: tres avisos
 * metían el nombre de archivo que devuelve el servidor dentro de una cadena de
 * HTML. Aquí el contenido son datos y React los escapa.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array.<string>} [props.lista] Puntos a enumerar.
 * @param {Array.<{etiqueta: string, valor: string}>} [props.renglones] Pares dato-valor.
 * @param {{etiqueta: string, valor: string}} [props.total] El renglón destacado del final.
 * @returns {(object|null)} El detalle, o nada si no hay ninguno.
 */
function Detalle({ lista, renglones, total }) {
  if (!lista && !renglones && !total) return null

  return (
    <Stack spacing={0.75} sx={{ mt: 1 }}>
      {lista?.map((punto) => (
        <Stack key={punto} direction="row" spacing={1} alignItems="flex-start">
          <Box sx={{ mt: "9px", width: 4, height: 4, borderRadius: "50%", bgcolor: COLOR.APAGADO, flexShrink: 0 }} />
          <Typography sx={{ color: COLOR.TEXTO }}>{punto}</Typography>
        </Stack>
      ))}

      {renglones?.map((renglon) => (
        <Stack key={renglon.etiqueta} direction="row" justifyContent="space-between" spacing={2}>
          <Typography sx={{ color: COLOR.TEXTO_SUAVE }}>{renglon.etiqueta}</Typography>
          <Typography sx={{ color: COLOR.TINTA, fontWeight: 600 }}>{renglon.valor}</Typography>
        </Stack>
      ))}

      {total && (
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={2}
          sx={{ mt: 0.5, pt: 1, borderTop: BORDE }}
        >
          <Typography sx={{ color: COLOR.TINTA, fontWeight: 700 }}>{total.etiqueta}</Typography>
          <Typography sx={{ color: COLOR.EXITO, fontWeight: 700 }}>{total.valor}</Typography>
        </Stack>
      )}
    </Stack>
  )
}

/**
 * El cuerpo del diálogo: el texto y, si lo hay, el detalle.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} [props.mensaje] Texto plano. Los saltos de línea se respetan.
 * @param {object} [props.detalle] Contenido estructurado para `Detalle`.
 * @returns {(object|null)} El cuerpo, o nada si el diálogo solo tiene título.
 */
function Cuerpo({ mensaje, detalle }) {
  if (!mensaje && !detalle) return null

  return (
    <>
      {mensaje && (
        <Typography sx={{ color: COLOR.TEXTO, whiteSpace: "pre-line" }}>{mensaje}</Typography>
      )}
      {detalle && <Detalle {...detalle} />}
    </>
  )
}

/**
 * Un diálogo de la cola.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.peticion El diálogo a mostrar.
 * @returns {object} El diálogo renderizado.
 */
function DialogoAviso({ peticion }) {
  const { id, icono, titulo, mensaje, detalle, acciones, valorAlCerrar, bloqueante } = peticion

  const cerrar = () => {
    if (bloqueante) return
    responder(id, valorAlCerrar)
  }

  return (
    <Dialog
      open
      onClose={cerrar}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: DIALOG_PAPER_SX }}
      aria-labelledby="aviso-titulo"
    >
      <DialogTitle id="aviso-titulo" sx={{ px: 3, pt: 3, pb: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Disco icono={icono} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: COLOR.TINTA, lineHeight: 1.3 }}>
            {titulo}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 1, pl: 9 }}>
        <Cuerpo mensaje={mensaje} detalle={detalle} />
      </DialogContent>

      <DialogActions sx={{ ...DIALOG_ACTIONS_SX, bgcolor: "transparent", borderTop: "none", pt: 2 }}>
        {acciones.map((accion) => (
          <Button
            key={accion.texto}
            onClick={() => responder(id, accion.valor)}
            variant={accion.principal ? "contained" : "text"}
            color={accion.tono === "peligro" ? "error" : "primary"}
            disableElevation
            autoFocus={accion.principal}
            sx={{ fontWeight: 600, borderRadius: `${RADIO.NORMAL}px`, px: 2.5 }}
          >
            {accion.texto}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  )
}

/**
 * El indicador de carga que bloquea la pantalla.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.titulo Qué se está haciendo.
 * @returns {object} El indicador renderizado.
 */
function DialogoCargando({ titulo }) {
  return (
    <Dialog open maxWidth="xs" PaperProps={{ sx: { ...DIALOG_PAPER_SX, px: 5, py: 4 } }}>
      <Stack spacing={2} alignItems="center">
        <CircularProgress size={38} thickness={4.5} sx={{ color: COLOR.TINTA }} />
        <Typography sx={{ fontWeight: 600, color: COLOR.TINTA }}>{titulo}</Typography>
      </Stack>
    </Dialog>
  )
}

/**
 * Monta los avisos de `notify` en el árbol de React.
 *
 * `notify` se llama desde sitios que no son componentes —un `catch`, el manejador
 * global de errores, un hook fuera de render—, así que no puede devolver JSX.
 * Lo que hace es encolar; este componente es quien mira la cola y pinta. Va
 * montado una sola vez, junto al tema.
 *
 * @returns {object} Los avisos visibles en este momento.
 */
export function AnfitrionAvisos() {
  const { actual, cargando, flotantes } = useSyncExternalStore(suscribir, leer, leer)

  return (
    <>
      {actual && <DialogoAviso key={actual.id} peticion={actual} />}
      {!actual && cargando && <DialogoCargando titulo={cargando.titulo} />}

      <Snackbar
        open={flotantes.length > 0}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ top: { xs: 72, sm: 80 } }}
      >
        <Stack spacing={1} sx={{ width: { xs: "88vw", sm: 380 } }}>
          {flotantes.map((aviso) => (
            <Alert
              key={aviso.id}
              severity={aviso.icono === "question" ? "info" : aviso.icono}
              variant="standard"
              onClose={() => retirar(aviso.id)}
              sx={{ borderRadius: `${RADIO.NORMAL}px`, boxShadow: SOMBRA.MENU, alignItems: "center" }}
            >
              {aviso.mensaje}
            </Alert>
          ))}
        </Stack>
      </Snackbar>
    </>
  )
}
