import { Box, Tab, Tabs } from "@mui/material"
import { TAB_SX, TABS_WRAPPER_SX } from "./estilos"

/**
 * Una pestaña de la barra.
 *
 * @typedef {object} Pestana
 * @property {(string|number)} [id] Valor que identifica la pestaña. Si se omite,
 *   se usa su posición, que es como se comporta `Tabs` por omisión.
 * @property {string} etiqueta Texto visible.
 * @property {object} [icono] Icono a la izquierda del texto.
 * @property {boolean} [deshabilitada] Si no se puede seleccionar.
 */

/**
 * La barra de pestañas de la aplicación.
 *
 * Recoge el aspecto que ya tenían el Administrador de viajes, Safety y Órdenes de
 * servicio —pastillas oscuras sobre un carril gris, sin la línea inferior de
 * MUI— y lo convierte en el único modo de poner pestañas.
 *
 * Existía copiado a mano en unos sitios, a medias en otros y sin tocar en el
 * resto: había **cuatro aspectos distintos** de pestaña en trece pantallas.
 * Cuando el estilo vive en un componente, una pantalla nueva no puede
 * equivocarse, porque no tiene dónde.
 *
 * La barra desplaza en lugar de partirse cuando no cabe, que es lo que hace
 * falta en las pantallas de cinco pestañas dentro de una ventana angosta.
 *
 * @param {object} props Propiedades del componente.
 * @param {(string|number)} props.valor La pestaña activa.
 * @param {Function} props.onChange `(nuevoValor) => void`. Recibe el valor, no el
 *   evento: quien llama casi nunca necesita el evento y olvidarse del primer
 *   argumento es el error habitual con `Tabs`.
 * @param {Array.<Pestana>} props.pestanas Las pestañas a mostrar.
 * @param {object} [props.sx] Estilos para el contenedor, por ejemplo el margen.
 * @returns {object} La barra renderizada.
 *
 * @example
 * <Pestanas
 *   valor={pestana}
 *   onChange={setPestana}
 *   pestanas={[
 *     { id: "pendientes", etiqueta: "Pendientes" },
 *     { id: "listos", etiqueta: "Completados" },
 *   ]}
 * />
 */
export function Pestanas({ valor, onChange, pestanas, sx }) {
  return (
    <Box sx={{ ...TABS_WRAPPER_SX, ...sx }}>
      <Tabs
        value={valor}
        onChange={(_evento, nuevo) => onChange(nuevo)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        // La línea inferior de MUI sobra: aquí lo que marca la pestaña activa es
        // la pastilla oscura, y las dos juntas se leen como un error de pintado.
        TabIndicatorProps={{ sx: { display: "none" } }}
        sx={{ minHeight: 0, "& .MuiTabs-flexContainer": { gap: 0.5 } }}
      >
        {pestanas.map((pestana, indice) => (
          <Tab
            key={pestana.id ?? indice}
            value={pestana.id ?? indice}
            label={pestana.etiqueta}
            icon={pestana.icono}
            iconPosition={pestana.icono ? "start" : undefined}
            disabled={pestana.deshabilitada}
            disableRipple
            sx={TAB_SX}
          />
        ))}
      </Tabs>
    </Box>
  )
}
