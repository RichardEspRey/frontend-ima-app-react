import { Button, CircularProgress } from "@mui/material"
import RefreshIcon from "@mui/icons-material/Refresh"

import { GHOST_BTN_SX } from "./estilos"

/**
 * Botón para volver a pedir los datos de la pantalla.
 *
 * Solo pinta y avisa: quién se refresca lo decide quien lo usa, normalmente
 * con `useActualizarPantalla`. Mientras la petición va, se bloquea y lo dice
 * con su propio texto e indicador, porque un botón que no responde invita a
 * darle tres veces creyendo que no hizo nada.
 *
 * @param {object} props Propiedades del componente.
 * @param {Function} props.onActualizar Qué volver a pedir. Puede devolver una promesa.
 * @param {boolean} [props.actualizando=false] Si la petición está en curso.
 * @param {string} [props.etiqueta='Actualizar'] Texto del botón en reposo.
 * @param {object} [props.sx] Estilos para ajustarlo a la barra donde vive.
 * @returns {object} El botón renderizado.
 *
 * @example
 * const { actualizar, actualizando } = useActualizarPantalla()
 * <BotonActualizar onActualizar={actualizar} actualizando={actualizando} />
 */
export function BotonActualizar({
  onActualizar,
  actualizando = false,
  etiqueta = "Actualizar",
  sx,
}) {
  return (
    <Button
      variant="outlined"
      onClick={onActualizar}
      disabled={actualizando}
      startIcon={
        actualizando ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />
      }
      sx={{ ...GHOST_BTN_SX, fontWeight: 700, ...sx }}
    >
      {actualizando ? "Actualizando…" : etiqueta}
    </Button>
  )
}
