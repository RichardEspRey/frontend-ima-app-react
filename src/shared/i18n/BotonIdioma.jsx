import { Tooltip } from "@mui/material"
import { Selector } from "../ui/Selector"
import { IDIOMA, NOMBRE_IDIOMA } from "./idiomas"
import { useIdioma } from "./IdiomaContext"

/**
 * El control para cambiar el idioma de la interfaz.
 *
 * Usa el `Selector` compartido en vez de un menú desplegable: con **dos**
 * opciones, un menú obliga a abrir, leer y elegir —tres pasos— para lo que un
 * selector resuelve en uno, y además deja ver de un vistazo en qué idioma está
 * la app sin tener que abrir nada.
 *
 * Cada idioma se nombra **en su propio idioma**. Quien busca el inglés reconoce
 * «English» aunque no entienda el resto de la pantalla, que es exactamente la
 * situación en la que alguien va a usar este control.
 *
 * @returns {object} El selector de idioma renderizado.
 */
export function BotonIdioma() {
  const { idioma, cambiarIdioma, t } = useIdioma()

  return (
    <Tooltip title={t("header.idioma")}>
      <span>
        <Selector
          valor={idioma}
          onChange={cambiarIdioma}
          opciones={[
            { valor: IDIOMA.ES, etiqueta: NOMBRE_IDIOMA[IDIOMA.ES] },
            { valor: IDIOMA.EN, etiqueta: NOMBRE_IDIOMA[IDIOMA.EN] },
          ]}
          sx={{ "& .MuiToggleButton-root": { px: 1.75, fontSize: "0.78rem" } }}
        />
      </span>
    </Tooltip>
  )
}
