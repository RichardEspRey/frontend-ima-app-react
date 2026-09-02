import { Component } from "react"
import { Box } from "@mui/material"
import { RELLENO_PANTALLA } from "./tokens"
import { EstadoError } from "./EstadoError"

/**
 * Aísla el fallo de una pantalla para que no tumbe la aplicación entera.
 *
 * Sin esto, un error de render en cualquier módulo deja al usuario con la
 * ventana en blanco. En el navegador se puede recargar; en la app de escritorio
 * no hay barra de direcciones, así que la única salida es cerrar y volver a
 * abrir. Por eso se monta **dentro** del layout, alrededor del contenido de la
 * página: el menú y la cabecera sobreviven al fallo y se puede navegar a otro
 * lado sin reiniciar nada.
 *
 * @example
 * <ErrorBoundary clave={location.pathname}>
 *   <Outlet />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends Component {
  /**
   * Arranca sin error registrado.
   *
   * @param {object} props Propiedades del componente.
   */
  constructor(props) {
    super(props)
    this.state = { error: null, clave: props.clave }
  }

  /**
   * Pasa el componente a estado de error cuando un hijo lanza.
   *
   * @param {Error} error El error capturado.
   * @returns {object} El nuevo estado.
   */
  static getDerivedStateFromError(error) {
    return { error }
  }

  /**
   * Olvida el error cuando cambia la pantalla.
   *
   * Sin esto, un fallo en una pantalla dejaba el mensaje puesto para siempre:
   * el usuario navegaba a otro módulo y seguía viendo el error del anterior,
   * porque el componente que falló ya no está pero el estado sí. Es el fallo que
   * convierte "esta pantalla falló" en "la aplicación se rompió".
   *
   * @param {object} props Las props entrantes.
   * @param {object} estado El estado actual.
   * @returns {(object|null)} El estado corregido, o `null` si no cambia.
   */
  static getDerivedStateFromProps(props, estado) {
    if (props.clave !== estado.clave) {
      return { error: null, clave: props.clave }
    }
    return null
  }

  /**
   * Registra el fallo con su traza de componentes.
   *
   * @param {Error} error El error capturado.
   * @param {object} info Traza de componentes de React.
   * @returns {void}
   */
  componentDidCatch(error, info) {
    console.error("Fallo en la pantalla:", error, info?.componentStack)
  }

  /**
   * Pinta el estado de error, o los hijos si todo va bien.
   *
   * @returns {object} El contenido renderizado.
   */
  render() {
    if (!this.state.error) return this.props.children

    return (
      // Centrado en el alto disponible, no con un margen fijo arriba. Con un
      // margen, el aviso queda pegado a la cabecera y parece que la pantalla
      // cargó a medias; centrado se lee como lo que es: el estado de toda la
      // pantalla. `minHeight: 100%` en vez de `100vh` porque esto vive dentro
      // del área de contenido, que ya descuenta la cabecera.
      <Box
        sx={{
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: RELLENO_PANTALLA,
        }}
      >
        <Box sx={{ width: "100%" }}>
          <EstadoError
            error={this.state.error}
            titulo="Esta pantalla no se pudo mostrar"
            onReintentar={() => this.setState({ error: null })}
            onInicio={() => {
              window.location.hash = "#/home"
              this.setState({ error: null })
            }}
          />
        </Box>
      </Box>
    )
  }
}
