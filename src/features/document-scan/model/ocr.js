import * as pdfjsLib from "pdfjs-dist"
import { agruparRenglones, combinarParadas, interpretarDocumentoCarga, puntaje } from "./documentoCarga"

pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdf.worker.min.mjs"

const MAX_PAGINAS_PDF = 3
const TEXTO_MINIMO_PDF = 40
const PUNTAJE_SUFICIENTE = 5

function palabrasDeItemPdf(item) {
  const x = item.transform[4]
  const alto = Math.abs(item.transform[3]) || item.height || 10
  const anchoLetra = item.str.length ? item.width / item.str.length : 0
  return [...item.str.matchAll(/\S+/g)].map((m) => ({
    text: m[0],
    x0: x + m.index * anchoLetra,
    x1: x + (m.index + m[0].length) * anchoLetra,
    yc: -item.transform[5],
    h: alto,
  }))
}

async function renglonesDeTextoPdf(pdf) {
  const renglones = []
  for (let p = 1; p <= Math.min(pdf.numPages, MAX_PAGINAS_PDF); p++) {
    const contenido = await (await pdf.getPage(p)).getTextContent()
    renglones.push(...agruparRenglones(contenido.items.filter((i) => i.str?.trim()).flatMap(palabrasDeItemPdf)))
  }
  return renglones
}

async function paginasPdfALienzos(pdf) {
  const lienzos = []
  for (let p = 1; p <= Math.min(pdf.numPages, MAX_PAGINAS_PDF); p++) {
    const pagina = await pdf.getPage(p)
    const vista = pagina.getViewport({ scale: 2.5 })
    const lienzo = document.createElement("canvas")
    lienzo.width = vista.width
    lienzo.height = vista.height
    await pagina.render({ canvasContext: lienzo.getContext("2d"), viewport: vista }).promise
    lienzos.push(lienzo)
  }
  return lienzos
}

function prepararLienzo(origen, modo) {
  const escala = origen.width < 1600 ? 2 : 1
  const lienzo = document.createElement("canvas")
  lienzo.width = origen.width * escala
  lienzo.height = origen.height * escala
  const contexto = lienzo.getContext("2d", { willReadFrequently: true })
  contexto.imageSmoothingQuality = "high"
  contexto.drawImage(origen, 0, 0, lienzo.width, lienzo.height)

  const imagen = contexto.getImageData(0, 0, lienzo.width, lienzo.height)
  const d = imagen.data
  for (let i = 0; i < d.length; i += 4) {
    const valor =
      modo === "max"
        ? Math.max(d[i], d[i + 1], d[i + 2])
        : 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
    d[i] = d[i + 1] = d[i + 2] = valor
  }
  contexto.putImageData(imagen, 0, 0)
  return lienzo
}

async function renglonesPorOcr(trabajador, lienzo) {
  const { data } = await trabajador.recognize(lienzo, {}, { blocks: true })
  const palabras = []
  for (const bloque of data.blocks || []) {
    for (const parrafo of bloque.paragraphs) {
      for (const linea of parrafo.lines) {
        for (const w of linea.words) {
          const texto = w.text.trim()
          if (!texto) continue
          palabras.push({
            text: texto,
            x0: w.bbox.x0,
            x1: w.bbox.x1,
            yc: (w.bbox.y0 + w.bbox.y1) / 2,
            h: w.bbox.y1 - w.bbox.y0,
          })
        }
      }
    }
  }
  return agruparRenglones(palabras)
}

async function interpretarLienzos(origenes, alAvanzar) {
  const { createWorker } = await import("tesseract.js")
  const total = origenes.length * 2
  let hechos = 0
  const trabajador = await createWorker("eng", 1, {
    logger: (m) => {
      if (m.status === "recognizing text") alAvanzar?.("Leyendo texto…", (hechos + m.progress) / total)
      else if (hechos === 0) alAvanzar?.("Preparando OCR (la primera vez descarga el idioma)…", null)
    },
  })

  try {
    const pasada = async (modo) => {
      const renglones = []
      for (const origen of origenes) {
        renglones.push(...(await renglonesPorOcr(trabajador, prepararLienzo(origen, modo))))
        hechos++
      }
      return interpretarDocumentoCarga(renglones)
    }

    const primera = await pasada("max")
    if (puntaje(primera) >= PUNTAJE_SUFICIENTE) return primera

    const segunda = await pasada("gray")
    const [mejor, otra] = puntaje(segunda) > puntaje(primera) ? [segunda, primera] : [primera, segunda]
    return {
      pickup: combinarParadas(mejor.pickup, otra.pickup),
      delivery: combinarParadas(mejor.delivery, otra.delivery),
      rawText: mejor.rawText,
    }
  } finally {
    await trabajador.terminate()
  }
}

/**
 * Lee un documento de carga, imagen o PDF, y devuelve la recolección y la
 * entrega que encuentre.
 *
 * Un PDF con texto se lee directo, sin OCR, que es exacto. Una imagen o un PDF
 * escaneado pasan por Tesseract, que se carga solo cuando hace falta. El OCR da
 * una primera pasada con el canal más claro de cada píxel —los fondos de color,
 * las líneas de tabla y el resaltado se vuelven blancos— y, si faltaron datos,
 * una segunda en gris normal que rellena los huecos.
 *
 * @param {(File|Blob)} archivo La imagen o el PDF.
 * @param {Function} [alAvanzar] Recibe `(mensaje, progreso)`; el progreso va de 0 a 1, o `null` si no se sabe.
 * @returns {Promise.<{pickup: (object|null), delivery: (object|null), rawText: string}>} Lo encontrado.
 * @throws {Error} Si el archivo no es imagen ni PDF.
 */
export async function leerDocumentoCarga(archivo, alAvanzar) {
  if (archivo.type === "application/pdf" || /\.pdf$/i.test(archivo.name || "")) {
    alAvanzar?.("Leyendo PDF…", null)
    const pdf = await pdfjsLib.getDocument({ data: await archivo.arrayBuffer() }).promise
    const renglones = await renglonesDeTextoPdf(pdf)
    if (renglones.reduce((n, r) => n + r.text.length, 0) > TEXTO_MINIMO_PDF) {
      const resultado = interpretarDocumentoCarga(renglones)
      if (puntaje(resultado) > 0) return resultado
    }
    return interpretarLienzos(await paginasPdfALienzos(pdf), alAvanzar)
  }

  if (!archivo.type.startsWith("image/")) {
    throw new Error("Formato no soportado. Usa una imagen (PNG/JPG) o un PDF.")
  }
  const mapa = await createImageBitmap(archivo)
  try {
    return await interpretarLienzos([mapa], alAvanzar)
  } finally {
    mapa.close()
  }
}
