import Swal from "sweetalert2"
import { COLOR } from "./tokens"

const AZUL_IMA = COLOR.TINTA
const ROJO_PELIGRO = COLOR.PELIGRO

/**
 * Avisos al usuario, en un solo lugar.
 *
 * El proyecto llegó a tener **tres** librerías para lo mismo: `sweetalert2`,
 * `react-toastify` y `@pablotheblink/flashyjs`. Las dos últimas ya se retiraron
 * —ver `docs/DECISIONES/0010`—; este módulo envuelve la que quedó.
 *
 * Envolverla es lo que hace que cambiarla algún día sea editar **este** archivo
 * y no los 56 que la llamaban.
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
    return Swal.fire({ icon: "success", title: titulo, text: mensaje, confirmButtonColor: AZUL_IMA })
  },

  /**
   * Informa de algo que necesita resaltar una parte del texto.
   *
   * Se separa de `exito` y `aviso` porque acepta marcas de formato, y eso hay
   * que poder buscarlo: es por donde entraría contenido del servidor al DOM sin
   * escapar. Los llamadores de hoy solo formatean texto propio.
   *
   * @param {string} contenido Texto con formato simple: negritas, saltos, listas.
   * @param {string} [titulo='Atención'] Encabezado del aviso.
   * @param {string} [icono='warning'] Icono a mostrar.
   * @returns {Promise} Se resuelve al cerrarse el aviso.
   */
  conFormato(contenido, titulo = "Atención", icono = "warning") {
    return Swal.fire({ icon: icono, title: titulo, html: contenido, confirmButtonColor: AZUL_IMA })
  },

  /**
   * Bloquea la pantalla mientras una operación larga termina.
   *
   * No se cierra sola: quien la abre es responsable de llamar a `cerrar()`,
   * normalmente en un `finally` para que un fallo no deje la pantalla trabada.
   *
   * @param {string} [titulo='Guardando…'] Qué se está haciendo.
   * @returns {void}
   */
  cargando(titulo = "Guardando…") {
    Swal.fire({
      title: titulo,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => Swal.showLoading(),
    })
  },

  /**
   * Cierra el aviso que esté abierto.
   *
   * @returns {void}
   */
  cerrar() {
    Swal.close()
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
    return Swal.fire({ icon: "error", title: titulo, text: mensaje, confirmButtonColor: AZUL_IMA })
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
   * Aparece arriba a la derecha y se va sola.
   *
   * @param {(string|Error)} problema Mensaje, o el error capturado.
   * @param {string} [icono='error'] Icono de sweetalert2.
   * @returns {Promise} Se resuelve al cerrarse el aviso.
   */
  discreto(problema, icono = "error") {
    const mensaje = problema instanceof Error ? problema.message : problema
    return Swal.fire({
      toast: true,
      position: "top-end",
      icon: icono,
      title: mensaje,
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true,
    })
  },

  /**
   * Advierte de algo que impide continuar, como un campo obligatorio vacío.
   *
   * @param {string} mensaje Qué falta o qué está mal.
   * @param {string} [titulo='Atención'] Encabezado del aviso.
   * @returns {Promise} Se resuelve al cerrarse el aviso.
   */
  aviso(mensaje, titulo = "Atención") {
    return Swal.fire({ icon: "warning", title: titulo, text: mensaje, confirmButtonColor: AZUL_IMA })
  },

  /**
   * Pide confirmación antes de una acción destructiva.
   *
   * Devuelve un booleano en vez del objeto de sweetalert2, para que quien llama
   * no tenga que conocer la forma `{ isConfirmed }` de la librería.
   *
   * @param {object} opciones Textos del diálogo.
   * @param {string} opciones.titulo Pregunta principal.
   * @param {string} [opciones.mensaje] Consecuencia de aceptar; conviene ser explícito.
   * @param {string} [opciones.formato] Igual que `mensaje`, pero admite marcas de formato.
   *   Se separa para que sea buscable: es por donde entraría al DOM contenido sin escapar.
   * @param {string} [opciones.confirmar='Sí, continuar'] Texto del botón de aceptar.
   * @param {string} [opciones.cancelar='Cancelar'] Texto del botón de cancelar.
   * @param {boolean} [opciones.peligroso=true] Pinta de rojo el botón de aceptar.
   * @returns {Promise.<boolean>} `true` si la persona aceptó.
   */
  async confirmar({ titulo, mensaje, formato, confirmar = "Sí, continuar", cancelar = "Cancelar", peligroso = true }) {
    const resultado = await Swal.fire({
      icon: "warning",
      title: titulo,
      ...(formato ? { html: formato } : { text: mensaje }),
      showCancelButton: true,
      confirmButtonText: confirmar,
      cancelButtonText: cancelar,
      confirmButtonColor: peligroso ? ROJO_PELIGRO : AZUL_IMA,
      reverseButtons: true,
    })
    return resultado.isConfirmed === true
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
  async elegir({ titulo, mensaje, opciones, cancelar = "Cancelar" }) {
    const [primera, segunda] = opciones

    const resultado = await Swal.fire({
      icon: "question",
      title: titulo,
      text: mensaje,
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: primera.texto,
      denyButtonText: segunda.texto,
      cancelButtonText: cancelar,
      confirmButtonColor: AZUL_IMA,
      denyButtonColor: ROJO_PELIGRO,
    })

    if (resultado.isConfirmed) return primera.valor
    if (resultado.isDenied) return segunda.valor
    return null
  },
}
