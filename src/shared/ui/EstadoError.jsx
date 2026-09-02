import { useState } from "react"
import {
  Alert,
  Box,
  Button,
  Collapse,
  Paper,
  Stack,
  Typography,
} from "@mui/material"
import RefreshIcon from "@mui/icons-material/Refresh"
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline"
import { ApiError, CAUSA_ERROR } from "../api/errors"
import { BORDE, COLOR, RADIO } from "./tokens"

/**
 * Qué decirle a la persona según por qué falló la petición.
 *
 * El texto de un `ApiError` ya está escrito para leerse, así que se respeta. Lo
 * que se añade aquí es **qué puede hacer** al respecto, que es lo que un mensaje
 * de error suele omitir y es lo único que le sirve a quien lo lee.
 *
 * @readonly
 */
const SUGERENCIA = {
  [CAUSA_ERROR.RED]: "Revisa tu conexión y vuelve a intentarlo.",
  [CAUSA_ERROR.TIEMPO_AGOTADO]:
    "El servidor tardó demasiado en responder. Suele funcionar al segundo intento.",
  [CAUSA_ERROR.HTTP]: "Es un problema del servidor, no de lo que hiciste. Inténtalo de nuevo en un momento.",
  [CAUSA_ERROR.RESPUESTA_INVALIDA]:
    "El servidor respondió algo que la aplicación no entiende. Avísale a soporte si sigue pasando.",
  [CAUSA_ERROR.NEGOCIO]: null,
}

/**
 * Convierte cualquier cosa que se haya lanzado en un texto legible.
 *
 * Un `TypeError` de React dice "Cannot read properties of undefined", que no le
 * sirve a nadie que no esté leyendo el código. Ese texto no se tira —va al
 * detalle técnico— pero no es lo que se enseña.
 *
 * @param {*} error Lo que falló.
 * @returns {{titulo: string, mensaje: string, sugerencia: (string|null), tecnico: string}} Qué mostrar.
 */
export function describirError(error) {
  if (error instanceof ApiError) {
    return {
      titulo:
        error.causa === CAUSA_ERROR.NEGOCIO
          ? "No se pudo completar la operación"
          : "No se pudieron cargar los datos",
      mensaje: error.message,
      sugerencia: SUGERENCIA[error.causa] ?? null,
      tecnico: `${error.endpoint} · ${error.op} · ${error.causa}`,
    }
  }

  return {
    titulo: "Algo salió mal",
    mensaje: "Esta parte de la pantalla no se pudo mostrar.",
    sugerencia: "El resto de la aplicación sigue funcionando.",
    tecnico: error?.stack ?? String(error),
  }
}

/**
 * El hueco que ocupa una sección cuando sus datos no llegaron.
 *
 * Reemplaza al patrón de hoy —o un `Alert` con el texto crudo del error, o nada
 * en absoluto— por algo que dice qué pasó, qué se puede hacer y ofrece el botón
 * para hacerlo. El detalle técnico está, pero plegado: le sirve a quien reporta
 * el fallo, no a quien solo quería ver la tabla.
 *
 * @param {object} props Propiedades del componente.
 * @param {*} props.error Lo que falló.
 * @param {Function} [props.onReintentar] Si se pasa, aparece el botón de reintentar.
 * @param {string} [props.titulo] Sobrescribe el título deducido del error.
 * @param {boolean} [props.compacto=false] Versión de una línea, para un panel pequeño.
 * @returns {object} El estado de error renderizado.
 *
 * @example
 * if (error) return <EstadoError error={error} onReintentar={refetch} />
 */
export function EstadoError({ error, onReintentar, titulo, compacto = false }) {
  const [abierto, setAbierto] = useState(false)
  const info = describirError(error)

  if (compacto) {
    return (
      <Alert
        severity="error"
        action={
          onReintentar && (
            <Button color="inherit" size="small" onClick={onReintentar}>
              Reintentar
            </Button>
          )
        }
      >
        {info.mensaje}
      </Alert>
    )
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        border: BORDE,
        borderRadius: `${RADIO.NORMAL}px`,
        textAlign: "center",
      }}
    >
      <ErrorOutlineIcon sx={{ fontSize: 40, color: COLOR.PELIGRO, mb: 1.5 }} />

      <Typography variant="h6" sx={{ color: COLOR.TINTA, mb: 0.5 }}>
        {titulo ?? info.titulo}
      </Typography>

      <Typography variant="body2" sx={{ color: COLOR.TEXTO_SUAVE }}>
        {info.mensaje}
      </Typography>

      {info.sugerencia && (
        <Typography variant="body2" sx={{ color: COLOR.APAGADO, mt: 0.5 }}>
          {info.sugerencia}
        </Typography>
      )}

      <Stack direction="row" spacing={1.5} justifyContent="center" sx={{ mt: 3 }}>
        {onReintentar && (
          <Button variant="contained" startIcon={<RefreshIcon />} onClick={onReintentar}>
            Reintentar
          </Button>
        )}
        <Button variant="text" size="small" onClick={() => setAbierto((v) => !v)}>
          {abierto ? "Ocultar detalle" : "Ver detalle técnico"}
        </Button>
      </Stack>

      {/* unmountOnExit: sin esto el detalle sigue en el DOM aunque no se vea, y
          un lector de pantalla lee la traza entera a quien no la pidió. */}
      <Collapse in={abierto} unmountOnExit>
        <Box
          component="pre"
          sx={{
            mt: 2,
            p: 2,
            textAlign: "left",
            bgcolor: COLOR.RELLENO,
            borderRadius: `${RADIO.CHICO}px`,
            fontSize: "0.75rem",
            color: COLOR.TEXTO_SUAVE,
            overflowX: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {info.tecnico}
        </Box>
      </Collapse>
    </Paper>
  )
}
