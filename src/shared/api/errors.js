/**
 * Causas por las que una petición a la API puede fallar. El componente decide
 * qué mostrar según la causa, sin tener que leer el texto del mensaje.
 *
 * @readonly
 * @enum {string}
 */
export const CAUSA_ERROR = {
  RED: "red",
  TIEMPO_AGOTADO: "tiempo_agotado",
  CANCELADA: "cancelada",
  HTTP: "http",
  RESPUESTA_INVALIDA: "respuesta_invalida",
  NEGOCIO: "negocio",
}

/**
 * Error de una llamada a la API de IMA.
 *
 * Separa el mensaje que se le enseña a la persona del detalle técnico que va al
 * log. La API responde HTTP 200 incluso cuando falla —el fallo viaja en
 * `{status:'error'}`— así que sin esta clase cada pantalla tiene que decidir
 * por su cuenta qué significa un error, que es lo que pasa hoy.
 */
export class ApiError extends Error {
  /**
   * Construye el error con su causa y el contexto de la llamada.
   *
   * @param {object} opciones Datos del fallo.
   * @param {string} opciones.mensaje Texto apto para mostrarle a la persona.
   * @param {string} opciones.causa Por qué falló; un valor de `CAUSA_ERROR`.
   * @param {string} opciones.endpoint Endpoint que se llamó, por ejemplo `personal_admin.php`.
   * @param {string} opciones.op Operación que se pidió, por ejemplo `getAll`.
   * @param {*} [opciones.detalle] Payload o excepción original, para el log.
   */
  constructor({ mensaje, causa, endpoint, op, detalle }) {
    super(mensaje)
    this.name = "ApiError"
    this.causa = causa
    this.endpoint = endpoint
    this.op = op
    this.detalle = detalle
  }

  /**
   * Indica si reintentar la petición tiene sentido. Un fallo de red o un 5xx
   * pueden pasar solos; un error de negocio ("ya existe ese empleado") no.
   *
   * @returns {boolean} `true` si conviene reintentar.
   */
  get esReintentable() {
    return this.causa === CAUSA_ERROR.RED || this.causa === CAUSA_ERROR.TIEMPO_AGOTADO
  }

  /**
   * Indica si la petición se canceló en vez de fallar.
   *
   * Una cancelación no es un error que contarle a nadie: pasa cada vez que se
   * cambia de pantalla con una petición en vuelo, y en desarrollo en cada
   * montaje por el doble render de `StrictMode`.
   *
   * @returns {boolean} `true` si se canceló desde fuera.
   */
  get fueCancelada() {
    return this.causa === CAUSA_ERROR.CANCELADA
  }

  /**
   * Representación corta para el log, sin volcar el payload completo.
   *
   * @returns {string} Por ejemplo `ApiError(personal_admin.php#getAll, negocio): ...`.
   */
  toString() {
    return `ApiError(${this.endpoint}#${this.op}, ${this.causa}): ${this.message}`
  }
}
