import { ToggleButton, ToggleButtonGroup } from "@mui/material"
import { COLOR, RADIO, SOMBRA } from "./tokens"

/**
 * Una opción del selector.
 *
 * @typedef {object} Opcion
 * @property {(string|number)} valor Lo que se entrega al elegirla.
 * @property {string} etiqueta Texto visible.
 * @property {object} [icono] Icono a la izquierda del texto.
 * @property {boolean} [deshabilitada] Si no se puede elegir.
 */

/**
 * Selector de una opción entre pocas, con el mismo aspecto que las pestañas.
 *
 * Es el control que filtra sin navegar: país, periodo, moneda. Se distingue de
 * {@link Pestanas} en el papel, no en el aspecto — las pestañas cambian **qué
 * conjunto de datos** se mira; el selector **filtra el que ya se está mirando**—
 * y por eso comparten lenguaje visual: las dos son "elegir una de pocas".
 *
 * Existía nueve veces, y solo el Expense Manager tenía el aspecto correcto,
 * escrito a mano. Las otras ocho usaban los botones cuadrados de MUI.
 *
 * **Nunca deja la selección vacía.** `ToggleButtonGroup` en modo exclusivo
 * entrega `null` cuando se vuelve a pulsar la opción activa, y quien lo usa
 * tiene que acordarse de descartarlo; olvidarlo deja un filtro sin valor y una
 * tabla vacía sin explicación. Aquí se descarta una sola vez, aquí dentro.
 *
 * @param {object} props Propiedades del componente.
 * @param {(string|number)} props.valor La opción activa.
 * @param {Function} props.onChange `(nuevoValor) => void`. Nunca recibe `null`.
 * @param {Array.<Opcion>} props.opciones Las opciones a mostrar.
 * @param {boolean} [props.deshabilitado] Apaga el selector entero, para cuando el
 *   formulario que lo contiene está bloqueado.
 * @param {string} [props.tamano='small'] Tamaño de los botones.
 * @param {object} [props.sx] Estilos para el contenedor.
 * @returns {object} El selector renderizado.
 *
 * @example
 * <Selector
 *   valor={pais}
 *   onChange={setPais}
 *   opciones={[
 *     { valor: "TODOS", etiqueta: "Todos" },
 *     { valor: "US", etiqueta: "USA" },
 *     { valor: "MX", etiqueta: "México" },
 *   ]}
 * />
 */
export function Selector({ valor, onChange, opciones, deshabilitado, tamano = "small", sx }) {
  return (
    <ToggleButtonGroup
      value={valor}
      exclusive
      size={tamano}
      disabled={deshabilitado}
      onChange={(_evento, nuevo) => {
        if (nuevo !== null) onChange(nuevo)
      }}
      sx={{
        bgcolor: COLOR.RELLENO,
        borderRadius: 2.5,
        p: 0.5,
        gap: 0.5,
        "& .MuiToggleButton-root": {
          border: "none",
          borderRadius: `${RADIO.NORMAL}px !important`,
          px: 3,
          py: 0.75,
          fontWeight: 600,
          fontSize: "0.85rem",
          textTransform: "none",
          color: COLOR.APAGADO,
          transition: "background-color 0.15s, color 0.15s",
          "&:hover": { bgcolor: "transparent", color: COLOR.TEXTO },
          "&.Mui-disabled": { border: "none", color: COLOR.TENUE },
          "&.Mui-selected": {
            bgcolor: COLOR.TINTA,
            color: COLOR.BLANCO,
            boxShadow: SOMBRA.NINGUNA,
            "&:hover": { bgcolor: COLOR.TINTA_CLARA, color: COLOR.BLANCO },
          },
        },
        ...sx,
      }}
    >
      {opciones.map((opcion) => (
        <ToggleButton
          key={opcion.valor}
          value={opcion.valor}
          disabled={opcion.deshabilitada}
          disableRipple
        >
          {opcion.icono}
          {opcion.etiqueta}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}
