import { abrirCargando, anunciar, cerrarAbierto, pedir } from "./avisos/cola"

const ACEPTAR = [{ texto: "Entendido", valor: undefined, principal: true }]

/**
 * Contenido estructurado que acompaña a un aviso.
 *
 * Existe en lugar de una cadena de HTML. Un aviso que necesitaba negritas o una
 * lista se armaba concatenando etiquetas, y eso metía al DOM texto que venía del
 * servidor —un nombre de archivo, un mensaje de error— sin escapar. Con datos,
 * React escapa por su cuenta y la puerta se cierra sola.
 *
 * @typedef {object} Detalle
 * @property {Array.<string>} [lista] Puntos a enumerar, uno por renglón.
 * @property {Array.<{etiqueta: string, valor: string}>} [renglones] Pares dato-valor.
 * @property {{etiqueta: string, valor: string}} [total] El renglón destacado del final.
 */

/**
 * Avisos al usuario, en un solo lugar.
 *
 * El proyecto llegó a tener **tres** librerías para lo mismo: `sweetalert2`,
 * `react-toastify` y `@pablotheblink/flashyjs`. Hoy no tiene ninguna: los avisos
 * se pintan con los componentes de MUI y el tema de la aplicación —ver
 * `docs/DECISIONES/0010` y `0011`—, así que un diálogo de confirmación se ve
 * como el resto de la app y no como una librería ajena.
 *
 * Este módulo no pinta nada: encola. Quien pinta es `AnfitrionAvisos`, montado
 * una sola vez junto al tema. Esa separación es lo que permite llamar a `notify`
 * desde un `catch`, desde el manejador global de errores o desde un hook, sin
 * que ninguno de esos sitios tenga que ser un componente.
 *
 * Cada función devuelve una promesa, así que se puede esperar el cierre.
 */
export const notify = {
  /**
   * Confirma que una operación salió bien.
   *
   * @param {string} mensaje Qué ocurrió, en lenguaje de la persona.
   * @param {string} [titulo='Listo'] Encabezado del aviso.
   * @returns {Promise} Se resuelve al cerrarse el aviso.
   */
  exito(mensaje, titulo = "Listo") {
    return pedir({ icono: "success", titulo, mensaje, acciones: ACEPTAR })
  },

  /**
   * Informa de algo que se lee mejor enumerado que en un párrafo.
   *
   * Sustituye al aviso con HTML que había antes. El contenido son **datos**, no
   * marcas: así un nombre que venga del servidor no puede convertirse en
   * etiquetas al pintarse.
   *
   * @param {Detalle} detalle El contenido estructurado.
   * @param {string} [titulo='Atención'] Encabezado del aviso.
   * @param {string} [icono='warning'] Icono a mostrar.
   * @returns {Promise} Se resuelve al cerrarse el aviso.
   */
  conDetalle(detalle, titulo = "Atención", icono = "warning") {
    return pedir({ icono, titulo, detalle, acciones: ACEPTAR })
  },

  /**
   * Bloquea la pantalla mientras una operación larga termina.
   *
   * No se cierra sola. Se cierra al llamar a `cerrar()` o, más habitualmente,
   * en cuanto se abre cualquier otro aviso: las pantallas que muestran
   * «Guardando…» terminan siempre en un `exito` o un `error`, y ese aviso la
   * releva.
   *
   * @param {string} [titulo='Guardando…'] Qué se está haciendo.
   * @returns {void}
   */
  cargando(titulo = "Guardando…") {
    abrirCargando(titulo)
  },

  /**
   * Cierra el aviso que esté abierto.
   *
   * @returns {void}
   */
  cerrar() {
    cerrarAbierto()
  },

  /**
   * Informa de un fallo.
   *
   * Acepta un `Error` directamente, para que un `catch` no tenga que acordarse
   * de sacar el `.message`.
   *
   * @param {(string|Error)} problema Mensaje, o el error capturado.
   * @param {string} [titulo='No se pudo completar'] Encabezado del aviso.
   * @returns {Promise} Se resuelve al cerrarse el aviso.
   */
  error(problema, titulo = "No se pudo completar") {
    const mensaje = problema instanceof Error ? problema.message : problema
    return pedir({ icono: "error", titulo, mensaje, acciones: ACEPTAR })
  },

  /**
   * Avisa de algo sin interrumpir lo que la persona está haciendo.
   *
   * `error` abre un diálogo con un botón, que es lo correcto cuando el fallo es
   * consecuencia de algo que la persona acaba de pulsar: hay que enterarse antes
   * de seguir. Para un fallo de fondo —una consulta que se cayó sola, una
   * promesa rechazada— ese diálogo es peor que el fallo: tapa la pantalla y
   * obliga a descartarlo para poder seguir trabajando con lo que sí cargó.
   *
   * Aparece arriba a la derecha y se va solo.
   *
   * @param {(string|Error)} problema Mensaje, o el error capturado.
   * @param {string} [icono='error'] Severidad del aviso: `error`, `warning`, `info`, `success`.
   * @returns {Promise} Se resuelve cuando el aviso desaparece.
   */
  discreto(problema, icono = "error") {
    const mensaje = problema instanceof Error ? problema.message : problema
    return anunciar({ icono, mensaje })
  },

  /**
   * Advierte de algo que impide continuar, como un campo obligatorio vacío.
   *
   * @param {string} mensaje Qué falta o qué está mal.
   * @param {string} [titulo='Atención'] Encabezado del aviso.
   * @returns {Promise} Se resuelve al cerrarse el aviso.
   */
  aviso(mensaje, titulo = "Atención") {
    return pedir({ icono: "warning", titulo, mensaje, acciones: ACEPTAR })
  },

  /**
   * Pide confirmación antes de una acción destructiva.
   *
   * Devuelve un booleano, para que quien llama no tenga que conocer la forma
   * interna del diálogo. Cerrar sin elegir cuenta como no aceptar.
   *
   * El botón de cancelar va primero y el de aceptar al final, que es donde la
   * vista termina de leer y donde MUI pone la acción principal.
   *
   * @param {object} opciones Textos del diálogo.
   * @param {string} opciones.titulo Pregunta principal.
   * @param {string} [opciones.mensaje] Consecuencia de aceptar; conviene ser explícito.
   * @param {Detalle} [opciones.detalle] Contenido estructurado bajo el mensaje:
   *   una lista de puntos, o un resumen de renglones con su total.
   * @param {string} [opciones.confirmar='Sí, continuar'] Texto del botón de aceptar.
   * @param {string} [opciones.cancelar='Cancelar'] Texto del botón de cancelar.
   * @param {boolean} [opciones.peligroso=true] Pinta de rojo el botón de aceptar.
   * @returns {Promise.<boolean>} `true` si la persona aceptó.
   */
  async confirmar({ titulo, mensaje, detalle, confirmar = "Sí, continuar", cancelar = "Cancelar", peligroso = true }) {
    const elegido = await pedir({
      icono: "warning",
      titulo,
      mensaje,
      detalle,
      valorAlCerrar: false,
      acciones: [
        { texto: cancelar, valor: false },
        { texto: confirmar, valor: true, principal: true, tono: peligroso ? "peligro" : "principal" },
      ],
    })
    return elegido === true
  },

  /**
   * Pide elegir entre dos caminos, o cancelar.
   *
   * No es una confirmación: son dos acciones distintas que no se pueden
   * plantear como "sí o no". Reactivar un viaje, por ejemplo, es distinto según
   * se reactive para administrativos o para operadores.
   *
   * @param {object} opciones Textos del diálogo.
   * @param {string} opciones.titulo Pregunta principal.
   * @param {string} [opciones.mensaje] Detalle de la elección.
   * @param {Array.<{valor: *, texto: string}>} opciones.opciones Las dos opciones, en orden.
   * @param {string} [opciones.cancelar='Cancelar'] Texto del botón de cancelar.
   * @returns {Promise.<*>} El valor elegido, o `null` si se canceló.
   */
  elegir({ titulo, mensaje, opciones, cancelar = "Cancelar" }) {
    const [primera, segunda] = opciones

    return pedir({
      icono: "question",
      titulo,
      mensaje,
      valorAlCerrar: null,
      acciones: [
        { texto: cancelar, valor: null },
        { texto: segunda.texto, valor: segunda.valor },
        { texto: primera.texto, valor: primera.valor, principal: true },
      ],
    })
  },
}
