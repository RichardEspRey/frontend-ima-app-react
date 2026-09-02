import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { tema } from "../tema"

/**
 * Pone el tema de la aplicación al alcance de todo el árbol.
 *
 * `CssBaseline` va aquí y no en el CSS global porque necesita leer el tema para
 * pintar el fondo y la tipografía; ponerlo suelto en `index.css` obligaba a
 * repetir los mismos valores en dos sitios.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.children El árbol de la aplicación.
 * @returns {object} El árbol envuelto en el tema.
 */
export function ThemeProvider({ children }) {
  return (
    <MuiThemeProvider theme={tema}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  )
}
