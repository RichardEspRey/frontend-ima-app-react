import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { AnfitrionAvisos } from "../../shared/ui/avisos/AnfitrionAvisos"
import { tema } from "../tema"

/**
 * Pone el tema de la aplicación al alcance de todo el árbol.
 *
 * `CssBaseline` va aquí y no en el CSS global porque necesita leer el tema para
 * pintar el fondo y la tipografía; ponerlo suelto en `index.css` obligaba a
 * repetir los mismos valores en dos sitios.
 *
 * `AnfitrionAvisos` también: es quien pinta lo que `notify` encola, y necesita
 * el tema. Va por fuera del enrutador para que un aviso sobreviva a un cambio
 * de pantalla y para que exista aunque la pantalla se haya caído.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.children El árbol de la aplicación.
 * @returns {object} El árbol envuelto en el tema.
 */
export function ThemeProvider({ children }) {
  return (
    <MuiThemeProvider theme={tema}>
      <CssBaseline />
      <AnfitrionAvisos />
      {children}
    </MuiThemeProvider>
  )
}
