import { MenuItem, Select } from "@mui/material"
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
 * @returns {object} El combo renderizado.
 */
export function SelectCelda({
  valor,
  opciones,
  onChange,
  deshabilitado = false,
  vacio = "Sin capturar",
  ancho = 175,
}) {
  return (
    <Select
      size="small"
      value={valor ?? ""}
      onChange={(evento) => onChange(evento.target.value)}
      disabled={deshabilitado}
      displayEmpty
      sx={{ minWidth: ancho, bgcolor: COLOR.BLANCO }}
    >
      <MenuItem value="" disabled>
        {vacio}
      </MenuItem>
      {opciones.map((opcion) => (
        <MenuItem key={opcion} value={opcion}>
          {opcion}
        </MenuItem>
      ))}
    </Select>
  )
}
