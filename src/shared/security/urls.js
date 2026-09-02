/**
 * Protocolos que se consideran seguros para navegar o abrir fuera de la app.
 *
 * Es una lista blanca a propósito: cualquier esquema que no esté aquí se
 * rechaza. Una lista negra siempre se queda corta \u2014`javascript:`, `vbscript:`,
 * `data:`, `file:`, `smb:` y los esquemas que registre cualquier programa
 * instalado en la máquina\u2014 y basta que se escape uno para perder la garantía.
 *
 * @readonly
 * @type {Array.<string>}
 */
export const PROTOCOLOS_SEGUROS = ["http:", "https:"]

/**
 * El valor que se pone en un `href` cuando la URL no es de fiar.
 *
 * No se usa cadena vacía ni `#`: ambos dejan el enlace con aspecto de enlace
 * funcional. `about:blank` abre una pestaña en blanco, que es un fallo visible
 * y sin daño.
 *
 * @readonly
 * @type {string}
 */
export const URL_INERTE = "about:blank"

/**
 * Indica si una URL se puede abrir sin riesgo.
 *
 * Importa más de lo normal en esta app: la API viaja por HTTP en claro, así que
 * un intermediario en la red puede cambiar la ruta de un documento por un
 * `javascript:...`. En un `<a href>` de Electron eso se ejecuta con los permisos
 * del renderer. Toda URL que venga de la API pasa por aquí antes de llegar al DOM.
 *
 * Las rutas relativas se aceptan: no llevan protocolo, así que no pueden
 * ejecutar nada, y son la forma normal de enlazar dentro de la propia app. Las
 * que empiezan con `//` no, porque heredan el protocolo de la página.
 *
 * @param {*} url La URL a evaluar; puede ser cualquier cosa.
 * @returns {boolean} `true` si es relativa o usa un protocolo de la lista blanca.
 *
 * @example
 * esUrlSegura('https://imaexpressllc.com/doc.pdf') // true
 * esUrlSegura('javascript:alert(1)')               // false
 */
export function esUrlSegura(url) {
  if (typeof url !== "string") return false

  const limpia = url.trim()
  if (limpia === "") return false

  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(limpia)) return false

  if (limpia.startsWith("//")) return false
  if (limpia.startsWith("/") || limpia.startsWith("./") || limpia.startsWith("../")) {
    return true
  }

  try {
    return PROTOCOLOS_SEGUROS.includes(new URL(limpia).protocol)
  } catch {
    return false
  }
}

/**
 * Devuelve la URL si es segura, y una URL inerte si no lo es.
 *
 * Pensada para usarse en el punto exacto donde el dato entra al DOM, de modo que
 * ningún componente tenga que acordarse de validar.
 *
 * @param {*} url La URL que viene del servidor o del usuario.
 * @returns {string} La misma URL sin espacios alrededor, o `URL_INERTE`.
 *
 * @example
 * <a href={urlSegura(doc.url)}>Ver</a>
 */
export const urlSegura = (url) => (esUrlSegura(url) ? url.trim() : URL_INERTE)

/**
 * Las props que necesita un enlace externo para ser seguro.
 *
 * `noopener` evita que la página abierta pueda manipular la que la abrió a
 * través de `window.opener`; `noreferrer` además le oculta de dónde viene. Van
 * juntas porque olvidar una de las dos es el error habitual.
 *
 * @param {*} url La URL destino.
 * @returns {{href: string, target: string, rel: string}} Props listas para el `<a>`.
 *
 * @example
 * <Button {...enlaceExterno(doc.url)}>Ver documento</Button>
 */
export const enlaceExterno = (url) => ({
  href: urlSegura(url),
  target: "_blank",
  rel: "noopener noreferrer",
})
