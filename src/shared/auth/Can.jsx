import { usePermisos } from "./SesionContext"

/**
 * Muestra su contenido solo si la persona tiene el permiso.
 *
 * Sustituye los `{esAdmin && <Boton/>}` repartidos por los componentes. La
 * diferencia no es cosmética: `esAdmin` obliga a que cada pantalla sepa qué es
 * ser admin, mientras que un permiso con nombre se puede reasignar a otro rol
 * sin tocar la pantalla.
 *
 * Recuerda que esconder un botón **no es seguridad**: la autorización real vive
 * en el servidor. Esto es consistencia de experiencia.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} [props.permiso] Permiso requerido.
 * @param {Array.<string>} [props.alguno] Basta con tener uno de estos.
 * @param {Array.<string>} [props.todos] Hacen falta todos estos.
 * @param {object} [props.siNo] Qué mostrar cuando no tiene permiso.
 * @param {object} props.children Contenido protegido.
 * @returns {object} El contenido, o la alternativa, o nada.
 */
export function Can({ permiso, alguno, todos, siNo = null, children }) {
  const { can, canAlguno, canTodos } = usePermisos()

  const permitido =
    (permiso ? can(permiso) : true) &&
    (alguno ? canAlguno(alguno) : true) &&
    (todos ? canTodos(todos) : true)

  return permitido ? children : siNo
}
