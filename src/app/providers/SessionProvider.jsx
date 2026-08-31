import { SesionProvider } from "../../shared/auth"
import { useAuthStore } from "../../store/useAuthStore"

/**
 * Conecta la sesión guardada en zustand con `shared/auth`.
 *
 * Es la única pieza que conoce ambos lados. `shared/auth` no importa el store a
 * propósito: cuando la fase 2 emita un token firmado, se cambia este archivo y
 * nada más — ni los componentes que preguntan por permisos, ni el cálculo de
 * permisos efectivos.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.children Árbol de la aplicación.
 * @returns {object} El proveedor con sus hijos dentro.
 */
export function SessionProvider({ children }) {
  const usuario = useAuthStore((estado) => estado.user)
  const ajustes = useAuthStore((estado) => estado.userPermissions)

  return (
    <SesionProvider usuario={usuario} ajustesUsuario={ajustes}>
      {children}
    </SesionProvider>
  )
}
