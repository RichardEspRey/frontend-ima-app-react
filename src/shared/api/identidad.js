const esDeLaApi = (url, apiHost) => Boolean(apiHost) && String(url ?? "").startsWith(apiHost)

const conCampos = (cuerpo, campos) => {
  if (typeof FormData !== "undefined" && cuerpo instanceof FormData) {
    const copia = new FormData()
    cuerpo.forEach((valor, clave) => copia.append(clave, valor))
    Object.entries(campos).forEach(([clave, valor]) => {
      if (!copia.has(clave)) copia.append(clave, valor)
    })
    return copia
  }

  if (cuerpo instanceof URLSearchParams) {
    const copia = new URLSearchParams(cuerpo)
    Object.entries(campos).forEach(([clave, valor]) => {
      if (!copia.has(clave)) copia.append(clave, valor)
    })
    return copia
  }

  if (typeof cuerpo === "string" && /(^|&)op=/.test(cuerpo)) {
    const existentes = new URLSearchParams(cuerpo)
    const extra = Object.entries(campos)
      .filter(([clave]) => !existentes.has(clave))
      .map(([clave, valor]) => `${encodeURIComponent(clave)}=${encodeURIComponent(valor)}`)
    return extra.length > 0 ? `${cuerpo}&${extra.join("&")}` : cuerpo
  }

  return cuerpo
}

/**
 * Agrega a una petición de la API quién la hace y desde qué app.
 *
 * La bitácora de auditoría lee `_usuario` y `_app` en el servidor. Van como campos del
 * formulario y no como cabeceras para no disparar la verificación previa de CORS, que
 * cada PHP configura por su cuenta; los PHP ignoran los campos que no conocen.
 *
 * Nunca modifica el cuerpo original ni pisa un campo que ya venga. Las peticiones a
 * otros sitios, las que no llevan cuerpo y las que no son formulario se devuelven igual.
 *
 * @param {(string|URL)} url A dónde va la petición.
 * @param {object} [opciones] Las opciones de `fetch`.
 * @param {object} identidad Quién y desde dónde.
 * @param {string} identidad.apiHost La dirección base de la API.
 * @param {(string|number)} [identidad.usuarioId] El usuario de la sesión, si hay.
 * @param {string} identidad.app Por ejemplo `Desktop 1.6.0`.
 * @returns {(object|undefined)} Las opciones, nuevas si hubo que agregar algo.
 *
 * @example
 * conIdentidad(`${API}/mtto.php`, { body: fd }, { apiHost: API, usuarioId: 14, app: "Desktop 1.6.0" })
 */
export function conIdentidad(url, opciones, { apiHost, usuarioId, app }) {
  if (!esDeLaApi(url, apiHost) || !opciones?.body) return opciones

  const campos = { _app: app }
  if (usuarioId !== undefined && usuarioId !== null && usuarioId !== "") campos._usuario = String(usuarioId)

  const body = conCampos(opciones.body, campos)
  return body === opciones.body ? opciones : { ...opciones, body }
}

/**
 * Envuelve `window.fetch` para que toda petición a la API lleve su identidad.
 *
 * Cubre tanto `post()` de `shared/api` como los `fetch` sueltos que quedan en
 * pantallas sin migrar. Se instala una sola vez, al arrancar; si algo falla al
 * agregar los campos, la petición sale como venía.
 *
 * @param {object} configuracion Cómo identificar.
 * @param {string} configuracion.apiHost La dirección base de la API.
 * @param {string} configuracion.app Por ejemplo `Desktop 1.6.0`.
 * @param {Function} configuracion.obtenerUsuario Devuelve el id de la sesión en ese momento.
 * @returns {void}
 */
export function instalarIdentidad({ apiHost, app, obtenerUsuario }) {
  if (typeof window === "undefined" || window.fetch.__conIdentidad) return
  const original = window.fetch.bind(window)

  const conIdentidadFetch = (url, opciones) => {
    try {
      return original(url, conIdentidad(url, opciones, { apiHost, app, usuarioId: obtenerUsuario() }))
    } catch {
      return original(url, opciones)
    }
  }

  conIdentidadFetch.__conIdentidad = true
  window.fetch = conIdentidadFetch
}
