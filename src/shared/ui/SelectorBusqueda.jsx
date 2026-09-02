import { Autocomplete, CircularProgress, TextField, createFilterOptions } from "@mui/material"

const filtrar = createFilterOptions()

/**
 * Una opción, con la misma forma que usa `react-select`.
 *
 * @typedef {object} Opcion
 * @property {(string|number)} value El dato que viaja a la API.
 * @property {string} label Lo que se lee en pantalla.
 */

/**
 * Selector con búsqueda, en sustitución de `react-select`.
 *
 * **Respeta el contrato de `react-select` al pie de la letra**, y eso es
 * deliberado: `onChange` entrega **el objeto completo** `{value, label}` —o
 * `null` al limpiar—, nunca el valor suelto.
 *
 * La razón no es estética. Las pantallas guardan la opción entera y sacan el
 * dato después: `pais: country?.value`. Si este componente entregara solo
 * `"MX"`, ese `country?.value` daría `undefined`, la capa de API omite los
 * `undefined`, y **el gasto se guardaría sin país sin que nadie viera un
 * error**. Cambiar el contrato aquí corrompe datos en silencio; mantenerlo es
 * lo que hace que la sustitución sea invisible.
 *
 * Compara por `value` y no por identidad de objeto. `react-select` acepta que
 * el valor seleccionado sea un objeto distinto pero equivalente al de la lista
 * —lo que pasa siempre que el valor viene del servidor y las opciones se piden
 * aparte— y sin esto el campo se vería vacío teniendo dato.
 *
 * @param {object} props Propiedades del componente.
 * @param {(Opcion|null)} props.value La opción seleccionada.
 * @param {Function} props.onChange `(opcion|null) => void`, igual que react-select.
 * @param {Array.<Opcion>} props.options Las opciones disponibles.
 * @param {string} [props.label] Etiqueta del campo.
 * @param {string} [props.placeholder] Texto cuando está vacío.
 * @param {boolean} [props.isLoading] Muestra que las opciones están llegando.
 * @param {boolean} [props.isDisabled] Bloquea el campo.
 * @param {boolean} [props.isClearable=true] Si se puede vaciar.
 * @param {boolean} [props.permitirCrear] Ofrece crear una opción con lo escrito.
 * @param {Function} [props.etiquetaCrear] `(texto) => string` para el texto de la entrada
 *   de crear. Por omisión `Crear: "lo escrito"`. Los formularios de viaje dicen «Crear
 *   compañía» y «Crear bodega», y perder esa precisión haría más lento reconocer qué se
 *   está creando.
 * @param {Function} [props.onCrear] `(texto) => void` cuando se elige crear. Se llama
 *   **en lugar** de `onChange`: quien crea la opción decide qué hacer con ella, y suele
 *   ser una petición al servidor antes de poder seleccionarla.
 * @param {string} [props.size='small'] Tamaño del campo.
 * @param {object} [props.sx] Estilos del contenedor.
 * @returns {object} El selector renderizado.
 *
 * @example
 * <SelectorBusqueda
 *   options={paises}
 *   value={country}
 *   onChange={setCountry}
 * />
 */
export function SelectorBusqueda({
  value,
  onChange,
  options = [],
  label,
  placeholder,
  isLoading = false,
  isDisabled = false,
  isClearable = true,
  permitirCrear = false,
  onCrear,
  etiquetaCrear,
  size = "small",
  sx,
}) {
  return (
    <Autocomplete
      value={value ?? null}
      onChange={(_evento, opcion) => {
        // La entrada de "crear" no es una opción real: no tiene `value`, así que
        // dejarla pasar a onChange guardaría un valor inexistente y el envío
        // llevaría basura. Se desvía a onCrear, que es quien sabe darla de alta.
        if (opcion?.__crear) {
          onCrear?.(opcion.__texto)
          return
        }
        onChange(opcion ?? null)
      }}
      options={options}
      filterOptions={
        permitirCrear
          ? (opciones, estado) => {
              const filtradas = filtrar(opciones, estado)
              const escrito = estado.inputValue.trim()
              const yaExiste = opciones.some(
                (o) => o.label?.toLowerCase() === escrito.toLowerCase(),
              )
              if (escrito && !yaExiste) {
                filtradas.push({
                  __crear: true,
                  __texto: escrito,
                  label: (etiquetaCrear ?? ((t) => `Crear: "${t}"`))(escrito),
                })
              }
              return filtradas
            }
          : undefined
      }
      loading={isLoading}
      disabled={isDisabled}
      disableClearable={!isClearable}
      size={size}
      sx={sx}
      getOptionLabel={(opcion) => opcion?.label ?? ""}
      isOptionEqualToValue={(opcion, elegida) => opcion?.value === elegida?.value}
      noOptionsText="Sin resultados"
      loadingText="Cargando…"
      renderInput={(parametros) => (
        <TextField
          {...parametros}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...parametros.InputProps,
            endAdornment: (
              <>
                {isLoading && <CircularProgress size={16} />}
                {parametros.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  )
}
