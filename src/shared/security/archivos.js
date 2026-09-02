import { notify } from "../ui"
/**
 * Tamaño máximo que se acepta en una subida, en bytes.
 *
 * El límite real lo pone PHP (`upload_max_filesize`), pero cuando se rebasa allá
 * la petición muere sin mensaje útil y la persona no sabe qué pasó. Rechazarlo
 * aquí permite decirle cuánto pesa su archivo y cuánto cabe.
 *
 * @readonly
 * @type {number}
 */
export const TAMANO_MAXIMO_BYTES = 10 * 1024 * 1024

/**
 * Los tipos de archivo que la app acepta, con su firma binaria.
 *
 * `firmas` son los primeros bytes reales del archivo. La extensión y el
 * `file.type` que reporta el navegador los controla quien sube: renombrar
 * `algo.exe` a `algo.pdf` cambia las dos cosas, pero no cambia el contenido.
 * Comparar la firma es lo único que dice qué es el archivo de verdad.
 *
 * @readonly
 */
export const TIPOS_PERMITIDOS = {
  pdf: {
    etiqueta: "PDF",
    extensiones: [".pdf"],
    mimes: ["application/pdf"],
    firmas: [[0x25, 0x50, 0x44, 0x46]],
  },
  jpg: {
    etiqueta: "JPG",
    extensiones: [".jpg", ".jpeg"],
    mimes: ["image/jpeg"],
    firmas: [[0xff, 0xd8, 0xff]],
  },
  png: {
    etiqueta: "PNG",
    extensiones: [".png"],
    mimes: ["image/png"],
    firmas: [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
  },
}

/**
 * Los grupos de tipos que pide cada pantalla.
 *
 * @readonly
 */
export const GRUPOS_ARCHIVO = {
  DOCUMENTO: ["pdf", "jpg", "png"],
  SOLO_PDF: ["pdf"],
  IMAGEN: ["jpg", "png"],
}

/**
 * El resultado de validar un archivo.
 *
 * @typedef {object} ResultadoArchivo
 * @property {boolean} valido Si el archivo se puede subir.
 * @property {string} [motivo] Texto para mostrarle a la persona; solo si no es válido.
 * @property {string} [tipo] La clave de `TIPOS_PERMITIDOS` que se reconoció.
 */

/**
 * Convierte bytes a un texto legible.
 *
 * @param {number} bytes La cantidad.
 * @returns {string} Por ejemplo `2.4 MB`.
 */
export function pesoLegible(bytes) {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 KB"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * El valor de `accept` para un `<input type="file">` a partir de un grupo.
 *
 * Se genera de la misma tabla que valida, para que el filtro del explorador de
 * archivos y la comprobación real nunca se desincronicen.
 *
 * @param {Array.<string>} grupo Un valor de `GRUPOS_ARCHIVO`.
 * @returns {string} La lista para el atributo `accept`.
 *
 * @example
 * <input type="file" accept={atributoAccept(GRUPOS_ARCHIVO.SOLO_PDF)} />
 */
export const atributoAccept = (grupo = GRUPOS_ARCHIVO.DOCUMENTO) =>
  grupo.flatMap((clave) => TIPOS_PERMITIDOS[clave]?.extensiones ?? []).join(",")

/**
 * Lee los primeros bytes de un archivo.
 *
 * @param {File} archivo El archivo a leer.
 * @param {number} [cuantos=8] Cuántos bytes leer.
 * @returns {Promise.<Uint8Array>} Los bytes leídos.
 */
async function primerosBytes(archivo, cuantos = 8) {
  const trozo = archivo.slice(0, cuantos)
  return new Uint8Array(await trozo.arrayBuffer())
}

/**
 * Indica si unos bytes empiezan con una firma dada.
 *
 * @param {Uint8Array} bytes Los bytes del archivo.
 * @param {Array.<number>} firma La secuencia esperada.
 * @returns {boolean} `true` si coincide.
 */
const coincideFirma = (bytes, firma) => firma.every((byte, i) => bytes[i] === byte)

/**
 * Valida un archivo antes de subirlo: tamaño, extensión y contenido real.
 *
 * Las tres comprobaciones son distintas y ninguna sobra. El tamaño evita el
 * fallo mudo de PHP. La extensión da un mensaje claro cuando alguien se
 * equivoca de archivo. La firma binaria es la única que resiste a alguien que
 * renombra a propósito.
 *
 * @param {File} archivo El archivo elegido.
 * @param {object} [opciones] Ajustes.
 * @param {Array.<string>} [opciones.grupo] Tipos aceptados; por omisión, documento.
 * @param {number} [opciones.maximoBytes] Tamaño máximo; por omisión, `TAMANO_MAXIMO_BYTES`.
 * @returns {Promise.<ResultadoArchivo>} Si se puede subir, y si no, por qué.
 *
 * @example
 * const r = await validarArchivo(file, { grupo: GRUPOS_ARCHIVO.SOLO_PDF })
 * if (!r.valido) return notify.error(r.motivo)
 */
export async function validarArchivo(archivo, opciones = {}) {
  const { grupo = GRUPOS_ARCHIVO.DOCUMENTO, maximoBytes = TAMANO_MAXIMO_BYTES } = opciones

  if (!(archivo instanceof File)) {
    return { valido: false, motivo: "No se recibió ningún archivo." }
  }

  if (archivo.size === 0) {
    return { valido: false, motivo: "El archivo está vacío." }
  }

  if (archivo.size > maximoBytes) {
    return {
      valido: false,
      motivo: `El archivo pesa ${pesoLegible(archivo.size)} y el máximo es ${pesoLegible(maximoBytes)}.`,
    }
  }

  const permitidos = grupo.map((clave) => TIPOS_PERMITIDOS[clave]).filter(Boolean)
  const etiquetas = permitidos.map((tipo) => tipo.etiqueta).join(", ")
  const nombre = archivo.name.toLowerCase()
  const porExtension = permitidos.find((tipo) =>
    tipo.extensiones.some((ext) => nombre.endsWith(ext)),
  )

  if (!porExtension) {
    return { valido: false, motivo: `Solo se aceptan archivos ${etiquetas}.` }
  }

  const bytes = await primerosBytes(archivo)
  const porFirma = permitidos.find((tipo) =>
    tipo.firmas.some((firma) => coincideFirma(bytes, firma)),
  )

  if (!porFirma) {
    return {
      valido: false,
      motivo: `El archivo dice ser ${porExtension.etiqueta} pero su contenido no lo es. Puede estar dañado o tener la extensión cambiada.`,
    }
  }

  const clave = Object.keys(TIPOS_PERMITIDOS).find(
    (k) => TIPOS_PERMITIDOS[k] === porFirma,
  )
  return { valido: true, tipo: clave }
}

/**
 * Valida varios archivos y separa los que pasan de los que no.
 *
 * Los modales de inspecciones y reparaciones aceptan selección múltiple; que un
 * archivo malo tire los demás sería peor que avisar de cuál falló.
 *
 * @param {Array.<File>} archivos Los archivos elegidos.
 * @param {object} [opciones] Los mismos que {@link validarArchivo}.
 * @returns {Promise.<{aceptados: Array.<File>, rechazados: Array.<{archivo: File, motivo: string}>}>} El reparto.
 */
export async function validarArchivos(archivos = [], opciones = {}) {
  const resultados = await Promise.all(
    [...archivos].map(async (archivo) => ({
      archivo,
      resultado: await validarArchivo(archivo, opciones),
    })),
  )

  return {
    aceptados: resultados.filter((r) => r.resultado.valido).map((r) => r.archivo),
    rechazados: resultados
      .filter((r) => !r.resultado.valido)
      .map((r) => ({ archivo: r.archivo, motivo: r.resultado.motivo })),
  }
}
