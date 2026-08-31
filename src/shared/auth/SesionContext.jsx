import { createContext, useContext, useMemo } from "react"
import { normalizarRol, ROLES, ROLES_TOTALES } from "./roles"
import { calcularPermisosEfectivos, crearComprobador } from "./permisosEfectivos"

const SesionContext = createContext(null)

/**
 * Publica la sesión y los permisos efectivos al árbol de componentes.
 *
 * No sabe de dónde salen: los recibe por props. Eso es deliberado — hoy vienen
 * de zustand y de `features.php`; cuando la fase 2 emita un token firmado, solo
 * cambia quien monta este proveedor, no los ~57 sitios que preguntan por
 * permisos.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} [props.usuario] Usuario autenticado, o `null` si no hay sesión.
 * @param {object} [props.ajustesUsuario] Mapa `clave -> boolean` de `features.php`.
 * @param {object} props.children Árbol de la aplicación.
 * @returns {object} El proveedor con sus hijos dentro.
 */
export function SesionProvider({ usuario, ajustesUsuario, children }) {
  const valor = useMemo(() => {
    const rol = usuario ? normalizarRol(usuario.tipo_usuario) : ROLES.CONSULTA
    const esTotal = ROLES_TOTALES.has(rol)
    const permisos = calcularPermisosEfectivos(rol, ajustesUsuario ?? {})

    return {
      usuario: usuario ?? null,
      autenticado: Boolean(usuario),
      rol,
      esTotal,
      permisos,
      can: crearComprobador(permisos, esTotal),
    }
  }, [usuario, ajustesUsuario])

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>
}

/**
 * Datos de la sesión vigente.
 *
 * @returns {{usuario: object, autenticado: boolean, rol: string, esTotal: boolean, permisos: Set, can: Function}} La sesión.
 * @throws {Error} Si se usa fuera de un `SesionProvider`.
 */
export function useSesion() {
  const valor = useContext(SesionContext)
  if (!valor) throw new Error("useSesion tiene que usarse dentro de <SesionProvider>.")
  return valor
}

/**
 * Comprobadores de permisos.
 *
 * @returns {{can: Function, canAlguno: Function, canTodos: Function, permisos: Set}} Los comprobadores.
 */
export function usePermisos() {
  const { can, permisos } = useSesion()
  return useMemo(
    () => ({
      can,
      canAlguno: (...claves) => claves.flat().some((c) => can(c)),
      canTodos: (...claves) => claves.flat().every((c) => can(c)),
      permisos,
    }),
    [can, permisos],
  )
}
