import { Box, MenuItem, Select, Stack } from "@mui/material"
import { COLOR } from "../../../shared/ui"

/**
 * Combo de una celda de tabla: elige un valor de una lista cerrada y avisa.
 *
 * Las dos columnas capturables del tablero —ubicación y observación— son el
 * mismo control con otra lista, así que aquí hay uno y no dos.
 *
 * No ofrece la opción vacía: quitar una captura no es elegir "nada", es
 * esperar a que la caja cambie de viaje, que es cuando el endpoint la deja
 * caducar sola.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.valor La opción activa.
 * @param {Array.<string>} props.opciones Las opciones, en orden.
 * @param {Function} props.onChange `(nuevoValor) => void`.
 * @param {boolean} [props.deshabilitado=false] Apaga el combo mientras se guarda.
 * @param {string} [props.vacio='Sin capturar'] Texto cuando todavía no hay valor.
 * @param {number} [props.ancho=175] Ancho mínimo en píxeles.
 * @param {Object.<string, {fondo: string, texto: string, punto: string}>} [props.colores={}] El color de cada opción.
 * @returns {object} El combo renderizado.
 */
export function SelectCelda({
  valor,
  opciones,
  onChange,
  deshabilitado = false,
  vacio = "Sin capturar",
  ancho = 175,
  colores = {},
}) {
  const color = colores[valor]

  return (
    <Select
      size="small"
      value={valor ?? ""}
      onChange={(evento) => onChange(evento.target.value)}
      disabled={deshabilitado}
      displayEmpty
      sx={{
        minWidth: ancho,
        bgcolor: color?.fondo ?? COLOR.BLANCO,
        color: color?.texto,
        fontWeight: color ? 700 : 400,
        "& .MuiOutlinedInput-notchedOutline": { borderColor: color ? "transparent" : undefined },
        "& .MuiSelect-icon": { color: color?.texto },
      }}
    >
      <MenuItem value="" disabled>
        {vacio}
      </MenuItem>
      {opciones.map((opcion) => (
        <MenuItem key={opcion} value={opcion}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                flexShrink: 0,
                bgcolor: colores[opcion]?.punto ?? COLOR.BORDE_FUERTE,
              }}
            />
            <span>{opcion}</span>
          </Stack>
        </MenuItem>
      ))}
    </Select>
  )
}
