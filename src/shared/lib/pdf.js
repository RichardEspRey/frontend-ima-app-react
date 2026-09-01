import html2canvas from "html2canvas"
import jsPDF from "jspdf"

/**
 * Clase que marca lo que no debe salir en el PDF.
 *
 * Los botones de la pantalla estorban en un documento impreso, así que se
 * ocultan mientras se toma la foto y se restauran después.
 *
 * @type {string}
 */
export const CLASE_NO_IMPRIMIR = "no-print"

const MARGEN_MM = { arriba: 5, derecha: 8, izquierda: 8 }

/**
 * Convierte un trozo de la pantalla en un PDF y lo abre en una pestaña nueva.
 *
 * Es una foto del DOM, no un documento generado: sirve cuando lo que se quiere
 * imprimir es exactamente lo que se ve, con su maquetación.
 *
 * Los elementos marcados con {@link CLASE_NO_IMPRIMIR} se ocultan y **siempre**
 * se vuelven a mostrar, incluso si la captura falla. Sin eso, un error dejaba
 * los botones ocultos hasta recargar la página.
 *
 * @param {object} parametros Qué capturar y cómo llamarlo.
 * @param {HTMLElement} parametros.elemento El trozo de pantalla a capturar.
 * @param {string} parametros.nombreArchivo Nombre del PDF, sin extensión.
 * @param {number} [parametros.escala=2] Resolución de la captura.
 * @returns {Promise.<void>} Se resuelve cuando el PDF está abierto.
 * @throws {Error} Si no hay elemento que capturar.
 */
export async function exportarElementoAPdf({ elemento, nombreArchivo, escala = 2 }) {
  if (!elemento) throw new Error("No hay nada que exportar.")

  const ocultos = [...document.querySelectorAll(`.${CLASE_NO_IMPRIMIR}`)]
  const estilosPrevios = ocultos.map((nodo) => nodo.style.display)
  ocultos.forEach((nodo) => {
    nodo.style.display = "none"
  })

  try {
    const lienzo = await html2canvas(elemento, { scale: escala, useCORS: true, logging: false })
    const imagen = lienzo.toDataURL("image/jpeg", 1.0)

    const documento = new jsPDF("p", "mm", "a4")
    const anchoPagina = documento.internal.pageSize.getWidth()
    const ancho = anchoPagina - MARGEN_MM.izquierda - MARGEN_MM.derecha
    const alto = (ancho / lienzo.width) * lienzo.height

    documento.addImage(imagen, "JPEG", MARGEN_MM.izquierda, MARGEN_MM.arriba, ancho, alto)
    documento.output("dataurlnewwindow", { filename: `${nombreArchivo}.pdf` })
  } finally {
    ocultos.forEach((nodo, indice) => {
      nodo.style.display = estilosPrevios[indice]
    })
  }
}
