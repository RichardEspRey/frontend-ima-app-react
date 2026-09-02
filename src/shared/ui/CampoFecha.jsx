import { TextField } from "@mui/material"

/**
 * Convierte una fecha al texto `AAAA-MM-DD` que entiende el campo nativo.
 *
 * **No usa `toISOString()`, y esa es la parte importante.** `toISOString()`
 * pasa a UTC, así que en Monterrey —UTC-6— una fecha con hora de la tarde se
 * convierte en el día siguiente: un gasto capturado el 2 a las 19:00 se
 * guardaba como día 3. Aquí se leen el año, el mes y el día **locales**, que es
 * lo que la persona eligió y lo que espera ver.
 *
 * @param {*} valor Una `Date`, un texto `AAAA-MM-DD`, o nada.
 * @returns {string} El texto para el input, o cadena vacía.
 */
export function aTextoFecha(valor) {
  if (!valor) return ""
  if (typeof valor === "string") return valor.slice(0, 10)
  if (!(valor instanceof Date) || Number.isNaN(valor.getTime())) return ""

  const anio = valor.getFullYear()
  const mes = String(valor.getMonth() + 1).padStart(2, "0")
  const dia = String(valor.getDate()).padStart(2, "0")
  return `${anio}-${mes}-${dia}`
}

/**
 * Convierte el texto del campo nativo a una `Date` local.
 *
 * Se construye con `new Date(anio, mes, dia)` y no con `new Date(texto)`: la
 * segunda forma interpreta `"2026-09-02"` como medianoche **UTC**, que en
 * México es el día anterior por la tarde. Es el mismo error de UTC, al revés.
 *
 * @param {string} texto Un `AAAA-MM-DD`.
 * @returns {(Date|null)} La fecha local, o `null` si el texto está vacío o mal.
 */
export function aFecha(texto) {
  if (!texto) return null
  const [anio, mes, dia] = texto.split("-").map(Number)
  if (!anio || !mes || !dia) return null
  return new Date(anio, mes - 1, dia)
}

/**
 * Campo de fecha, en sustitución de `react-datepicker`.
 *
 * Usa el campo de fecha del navegador, que es lo que **ya hacían 15 archivos**
 * de la app frente a los 9 de `react-datepicker`. No agrega ninguna
 * dependencia: `@mui/x-date-pickers` habría significado instalar una librería
 * para quitar otra.
 *
 * **Conserva el contrato de `react-datepicker`**: recibe y entrega objetos
 * `Date`, o `null`. Ninguna pantalla tiene que cambiar cómo guarda ni cómo
 * arma el envío, que es donde una sustitución de este tipo rompe cosas sin
 * avisar.
 *
 * De paso corrige un fallo que venía de antes: las pantallas convertían con
 * `fecha.toISOString().split('T')[0]`, y eso pasa por UTC. Un registro
 * capturado después de las 18:00 hora de Monterrey se guardaba con la fecha del
 * día siguiente. Aquí la conversión es local en las dos direcciones.
 *
 * @param {object} props Propiedades del componente.
 * @param {(Date|string|null)} props.value La fecha seleccionada.
 * @param {Function} props.onChange `(Date|null) => void`, igual que react-datepicker.
 * @param {string} [props.label] Etiqueta del campo.
 * @param {boolean} [props.disabled] Bloquea el campo.
 * @param {boolean} [props.fullWidth=true] Si ocupa todo el ancho disponible.
 * @param {string} [props.size='small'] Tamaño del campo.
 * @param {string} [props.min] Fecha mínima aceptada, en `AAAA-MM-DD`.
 * @param {string} [props.max] Fecha máxima aceptada, en `AAAA-MM-DD`.
 * @param {object} [props.sx] Estilos del contenedor.
 * @returns {object} El campo renderizado.
 *
 * @example
 * <CampoFecha value={ticketDate} onChange={setTicketDate} label="Fecha de Ticket" />
 */
export function CampoFecha({
  value,
  onChange,
  label,
  disabled = false,
  fullWidth = true,
  size = "small",
  min,
  max,
  sx,
}) {
  return (
    <TextField
      type="date"
      value={aTextoFecha(value)}
      onChange={(evento) => onChange(aFecha(evento.target.value))}
      label={label}
      disabled={disabled}
      fullWidth={fullWidth}
      size={size}
      sx={sx}
      inputProps={{ min, max }}
      InputLabelProps={{ shrink: true }}
    />
  )
}
