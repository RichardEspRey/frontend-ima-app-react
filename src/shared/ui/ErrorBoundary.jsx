import { Component } from "react"
import { Alert, AlertTitle, Box, Button } from "@mui/material"

/**
 * Aísla el fallo de una pantalla para que no tumbe la aplicación entera.
 *
 * Sin esto, un error de render en cualquier módulo deja al usuario con la
 * ventana en blanco y sin forma de salir salvo reiniciar la app de escritorio.
 * Se monta por página, no una sola vez arriba, para que el resto de la
 * navegación siga funcionando.
 */
export class ErrorBoundary extends Component {
  /**
   * Arranca sin error registrado.
   *
   * @param {object} props Propiedades del componente.
   */
  constructor(props) {
    super(props)
    this.state = { error: null }
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
   * Pinta el mensaje de error, o los hijos si todo va bien.
   *
   * @returns {object} El contenido renderizado.
   */
  render() {
    if (!this.state.error) return this.props.children

    return (
      <Box sx={{ p: 4 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => this.setState({ error: null })}>
              Reintentar
            </Button>
          }
        >
          <AlertTitle>Esta pantalla no se pudo mostrar</AlertTitle>
          {this.state.error.message}
        </Alert>
      </Box>
    )
  }
}
