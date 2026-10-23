import { Autocomplete, Stack, TextField } from "@mui/material"
import { useConductoresActivos } from "../../../entities/driver"
import { CampoFecha, aFecha, aTextoFecha } from "../../../shared/ui"

/**
 * El operador y la fecha de enviado de una reparación pendiente.
 *
 * Si el operador guardado ya no está activo, se agrega a la lista para que el
 * campo siga mostrando su nombre.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.driverId El operador elegido.
 * @param {string} [props.operador] Su nombre, por si ya no está entre los activos.
 * @param {string} props.fecha La fecha de enviado, `AAAA-MM-DD`.
 * @param {boolean} [props.disabled] Si los campos están bloqueados.
 * @param {Function} props.onCambiarOperador Recibe `(driverId, nombre)`.
 * @param {Function} props.onCambiarFecha Recibe la fecha `AAAA-MM-DD`.
 * @returns {object} Los dos campos renderizados.
 */
export function CamposOperadorFecha({ driverId, operador, fecha, disabled, onCambiarOperador, onCambiarFecha }) {
  const { data: conductores, isLoading } = useConductoresActivos()

  const opciones = (conductores ?? [])
    .map((conductor) => ({ id: String(conductor.driver_id), nombre: conductor.nombre }))
    .sort((a, b) => String(a.nombre).localeCompare(String(b.nombre), "es"))

  if (driverId && !opciones.some((opcion) => opcion.id === String(driverId))) {
    opciones.unshift({ id: String(driverId), nombre: operador || `Operador ${driverId}` })
  }

  const elegido = opciones.find((opcion) => opcion.id === String(driverId)) ?? null

  return (
    <Stack spacing={2.5}>
      <Autocomplete
        size="small"
        options={opciones}
        loading={isLoading}
        value={elegido}
        disabled={disabled}
        getOptionLabel={(opcion) => opcion.nombre || ""}
        isOptionEqualToValue={(opcion, valor) => opcion.id === valor.id}
        onChange={(_evento, valor) => onCambiarOperador(valor ? valor.id : "", valor ? valor.nombre : "")}
        renderInput={(params) => <TextField {...params} label="Operador" />}
        noOptionsText="Sin coincidencias"
      />

      <CampoFecha
        label="Fecha de enviado"
        value={aFecha(fecha)}
        disabled={disabled}
        onChange={(valor) => onCambiarFecha(aTextoFecha(valor))}
      />
    </Stack>
  )
}
