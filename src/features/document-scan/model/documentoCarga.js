const ESTADOS_EUA = new Set(
  "AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC".split(" "),
)
const PALABRA_DE_CALLE =
  /^(dr|drive|rd|road|st|street|ave|avenue|blvd|hwy|highway|ln|lane|pkwy|parkway|way|ct|court|cir|pl|ter|trl|loop|fwy|sw|se|nw|ne|suite|ste|unit|address)\.?$/i
const MESES = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"]

const ETIQUETA_RECOLECCION =
  /\b(shipper|shed|ship\s*from|pick\s*-?\s*up\s*(?:location|facility|at)|origin)\b\s*(?:#\s*\d+)?\s*(?::|$)/i
const ETIQUETA_ENTREGA =
  /\b(consignee|receiver|ship\s*to|deliver(?:y)?\s*(?:to|location|facility)|destination)\b\s*(?:#\s*\d+)?\s*(?::|$)/i

const CAMPOS_DE_ENCABEZADO = [
  ["name", /^(shed|shipper|consignee|receiver|facility|location|name|company|pickup|pick up|customer)$/],
  ["city", /^city$/],
  ["state", /^(state|st)$/],
  ["zip", /^(zip|zip code|zipcode|postal code)$/],
  ["date", /^(date|pu date|pick up date|pickup date|delivery date|del date|appt date)$/],
  ["time", /^(time|appt|appt time|appointment|hours)$/],
]

const CIUDAD_ESTADO_ZIP =
  /([A-Za-z][A-Za-z.'\- ]*?)\s*,?\s+([A-Z]{2})\.?\s*,?\s+([0-9OoIl]{5})(?:\s*[-\]}]?\s*\d{4})?(?![0-9])/g

/**
 * Una palabra leída del documento, con su posición.
 *
 * @typedef {object} Palabra
 * @property {string} text El texto.
 * @property {number} x0 Borde izquierdo.
 * @property {number} x1 Borde derecho.
 * @property {number} yc Centro vertical.
 * @property {number} h Alto.
 */

/**
 * Un renglón del documento: sus palabras y las celdas que forman.
 *
 * @typedef {object} Renglon
 * @property {Array.<Palabra>} words Las palabras, de izquierda a derecha.
 * @property {Array.<Palabra>} cells Palabras cercanas unidas; un hueco grande separa columnas.
 * @property {string} text Las celdas unidas con ` | `.
 */

/**
 * Lo que se encontró de una parada.
 *
 * @typedef {object} Parada
 * @property {string} name Nombre del lugar.
 * @property {string} city Ciudad.
 * @property {string} state Estado de EUA, dos letras.
 * @property {string} zip Código postal de cinco dígitos.
 * @property {string} date Fecha `AAAA-MM-DD`.
 * @property {string} time Hora `HH:mm`.
 */

function armarRenglon(palabras) {
  const ordenadas = [...palabras].sort((a, b) => a.x0 - b.x0)
  const celdas = []
  for (const palabra of ordenadas) {
    const ultima = celdas[celdas.length - 1]
    if (ultima && palabra.x0 - ultima.x1 < Math.max(palabra.h, ultima.h) * 1.2) {
      ultima.text += ` ${palabra.text}`
      ultima.x1 = palabra.x1
      ultima.h = Math.max(ultima.h, palabra.h)
    } else {
      celdas.push({ ...palabra })
    }
  }
  return { words: ordenadas, cells: celdas, text: celdas.map((c) => c.text).join(" | ") }
}

/**
 * Agrupa palabras en renglones por su posición vertical.
 *
 * No depende de cómo las haya cortado el OCR: Tesseract suele separar las
 * columnas de una tabla, y aquí se vuelven a juntar por altura.
 *
 * @param {Array.<Palabra>} palabras Las palabras con su posición.
 * @returns {Array.<Renglon>} Los renglones, de arriba hacia abajo.
 */
export function agruparRenglones(palabras) {
  const ordenadas = [...palabras].sort((a, b) => a.yc - b.yc)
  const filas = []
  for (const palabra of ordenadas) {
    const fila = filas[filas.length - 1]
    if (fila && Math.abs(palabra.yc - fila.yc) < Math.min(palabra.h, fila.h) * 0.6) {
      fila.palabras.push(palabra)
      fila.yc = (fila.yc * (fila.palabras.length - 1) + palabra.yc) / fila.palabras.length
    } else {
      filas.push({ yc: palabra.yc, h: palabra.h, palabras: [palabra] })
    }
  }
  return filas.map((fila) => armarRenglon(fila.palabras))
}

const corregirDigitos = (texto) => texto.replace(/[Oo]/g, "0").replace(/[Il|]/g, "1")

const titulo = (texto) => texto.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase())

/**
 * Lee una fecha como la escriben los documentos de EUA.
 *
 * Acepta `MM/DD/AAAA` (también con `-` o `.`, y año de dos dígitos) y
 * `Oct 21, 2026`.
 *
 * @param {string} texto Donde buscar.
 * @returns {string} La fecha `AAAA-MM-DD`, o cadena vacía.
 */
export function leerFecha(texto) {
  if (!texto) return ""
  let m = texto.match(/\b(\d{1,2})\s*[/\-.]\s*(\d{1,2})\s*[/\-.]\s*(\d{4}|\d{2})\b/)
  if (m) {
    const [, mes, dia, anio] = m.map(Number)
    const completo = anio < 100 ? 2000 + anio : anio
    if (mes >= 1 && mes <= 12 && dia >= 1 && dia <= 31) {
      return `${completo}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`
    }
  }
  m = texto.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})\b/i)
  if (m) {
    const mes = MESES.indexOf(m[1].toLowerCase()) + 1
    return `${m[3]}-${String(mes).padStart(2, "0")}-${m[2].padStart(2, "0")}`
  }
  return ""
}

/**
 * Lee una hora, con o sin AM/PM.
 *
 * @param {string} texto Donde buscar.
 * @returns {string} La hora `HH:mm` en 24 horas, o cadena vacía.
 */
export function leerHora(texto) {
  if (!texto) return ""
  const m = texto.match(/\b([01]?\d|2[0-3])\s*:\s*([0-5]\d)(?:\s*([AaPp])\.?\s*[Mm]\.?)?/)
  if (!m) return ""
  let hora = Number(m[1])
  const meridiano = m[3]?.toLowerCase()
  if (meridiano === "p" && hora < 12) hora += 12
  if (meridiano === "a" && hora === 12) hora = 0
  return `${String(hora).padStart(2, "0")}:${m[2]}`
}

function limpiarCiudad(crudo) {
  const palabras = crudo.trim().split(/\s+/)
  let desde = 0
  palabras.forEach((palabra, i) => {
    if (/^st\.?$/i.test(palabra) && i === desde && i < palabras.length - 1) return
    if (PALABRA_DE_CALLE.test(palabra) || /\d/.test(palabra) || /[:#|]/.test(palabra)) desde = i + 1
  })
  return titulo(palabras.slice(desde).slice(-3).join(" "))
}

function encontrarCiudadEnTexto(texto) {
  for (const m of texto.matchAll(CIUDAD_ESTADO_ZIP)) {
    if (!ESTADOS_EUA.has(m[2])) continue
    const ciudad = limpiarCiudad(m[1])
    if (ciudad) return { city: ciudad, state: m[2], zip: corregirDigitos(m[3]) }
  }
  return null
}

function encontrarCiudad(renglones) {
  for (const renglon of renglones) {
    for (const celda of renglon.cells) {
      const hallazgo = encontrarCiudadEnTexto(celda.text)
      if (hallazgo) return hallazgo
    }
  }
  for (const renglon of renglones) {
    const hallazgo = encontrarCiudadEnTexto(renglon.cells.map((c) => c.text).join(" "))
    if (hallazgo) return hallazgo
  }
  return null
}

function nombreDeFila(renglones, ciudad) {
  for (const renglon of renglones) {
    if (renglon.cells.length < 3) continue
    if (!renglon.cells.some((c) => c.text.trim() === ciudad.state)) continue
    const primera = renglon.cells[0].text.trim()
    if (/[A-Za-z]{3}/.test(primera) && titulo(primera) !== ciudad.city && primera !== ciudad.state) {
      return primera
    }
  }
  return ""
}

function buscarConEtiqueta(renglones, etiqueta, leer) {
  for (const renglon of renglones) {
    const m = renglon.text.match(etiqueta)
    if (m) {
      const valor = leer(renglon.text.slice(m.index + m[0].length))
      if (valor) return valor
    }
  }
  return ""
}

function buscarPrimero(renglones, leer) {
  for (const renglon of renglones) {
    const valor = leer(renglon.text)
    if (valor) return valor
  }
  return ""
}

function campoDeEncabezado(texto) {
  const clave = texto.toLowerCase().replace(/[:#.]/g, "").trim()
  return CAMPOS_DE_ENCABEZADO.find(([, patron]) => patron.test(clave))?.[0] ?? null
}

function columnasDeEncabezado(renglon) {
  for (const partes of [renglon.cells, renglon.words]) {
    const columnas = partes.map((p) => ({ field: campoDeEncabezado(p.text), x0: p.x0, h: p.h, text: p.text }))
    const distintas = new Set(columnas.map((c) => c.field).filter(Boolean))
    if (distintas.size >= 3) return columnas
  }
  return null
}

function leerFilaDeTabla(renglon, columnas) {
  const valores = {}
  for (const palabra of renglon.words) {
    let indice = -1
    columnas.forEach((c, i) => {
      if (c.x0 - c.h * 0.8 <= palabra.x0) indice = i
    })
    const campo = columnas[Math.max(indice, 0)].field
    if (campo) valores[campo] = valores[campo] ? `${valores[campo]} ${palabra.text}` : palabra.text
  }
  const estado = valores.state?.toUpperCase().replace(/[^A-Z]/g, "")
  const zip = valores.zip && corregirDigitos(valores.zip).match(/\d{5}/)?.[0]
  return {
    name: valores.name?.trim() || "",
    city: valores.city ? titulo(valores.city.trim()) : "",
    state: ESTADOS_EUA.has(estado) ? estado : "",
    zip: zip || "",
    date: valores.date ? leerFecha(corregirDigitos(valores.date)) : "",
    time: leerHora(valores.time),
  }
}

const cuantosLlenos = (parada) => ["city", "state", "zip", "date", "name"].filter((k) => parada[k]).length

function leerTablas(renglones) {
  const encontradas = []
  renglones.forEach((renglon, i) => {
    const columnas = columnasDeEncabezado(renglon)
    if (!columnas) return
    const encabezadoNombre = columnas.find((c) => c.field === "name")?.text || ""
    const contexto = [encabezadoNombre, renglones[i - 1]?.text, renglones[i - 2]?.text].join(" ")
    const tipo = /consignee|receiver|deliver|drop/i.test(contexto) ? "delivery" : "pickup"
    for (const siguiente of renglones.slice(i + 1, i + 3)) {
      const parada = leerFilaDeTabla(siguiente, columnas)
      if (cuantosLlenos(parada) >= 2) {
        encontradas.push({ tipo, parada, indiceEncabezado: i })
        break
      }
    }
  })
  return encontradas
}

function leerSeccion(renglones, desde, hasta, tipo) {
  const ventana = renglones.slice(desde, hasta)
  const etiqueta = tipo === "pickup" ? ETIQUETA_RECOLECCION : ETIQUETA_ENTREGA
  const primero = renglones[desde]
  const m = primero.text.match(etiqueta)
  let nombre = primero.text.slice(m.index + m[0].length).replace(/^[\s:|-]+/, "").split("|")[0].trim()
  if (!nombre && renglones[desde + 1]) nombre = renglones[desde + 1].cells[0]?.text.trim() || ""

  const etiquetaFecha =
    tipo === "pickup" ? /(pick\s*-?\s*up|pu|ship)\s*date/i : /(deliver(?:y)?|del|drop)\s*date/i
  const etiquetaHora =
    tipo === "pickup"
      ? /(pick\s*-?\s*up|pu|appt|appointment)\s*time/i
      : /(deliver(?:y)?|del|appt|appointment)\s*time/i

  const ciudad = encontrarCiudad(ventana)
  return {
    name: nombre,
    city: ciudad?.city || "",
    state: ciudad?.state || "",
    zip: ciudad?.zip || "",
    date:
      buscarConEtiqueta(ventana, etiquetaFecha, leerFecha) ||
      buscarConEtiqueta(renglones, etiquetaFecha, leerFecha) ||
      buscarPrimero(ventana, leerFecha),
    time: buscarConEtiqueta(ventana, etiquetaHora, leerHora) || buscarConEtiqueta(renglones, etiquetaHora, leerHora),
  }
}

function leerSeccionesConEtiqueta(renglones, omitir) {
  const marcas = []
  renglones.forEach((renglon, i) => {
    if (omitir.has(i)) return
    if (ETIQUETA_RECOLECCION.test(renglon.text)) marcas.push({ i, tipo: "pickup" })
    else if (ETIQUETA_ENTREGA.test(renglon.text)) marcas.push({ i, tipo: "delivery" })
  })
  const resultado = {}
  marcas.forEach((marca, k) => {
    if (resultado[marca.tipo]) return
    const hasta = Math.min(marcas[k + 1]?.i ?? renglones.length, marca.i + 7)
    resultado[marca.tipo] = leerSeccion(renglones, marca.i, hasta, marca.tipo)
  })
  return resultado
}

/**
 * Junta dos lecturas de la misma parada: la primera manda y la segunda rellena.
 *
 * @param {(Parada|null)} principal La lectura con más datos.
 * @param {(Parada|null)} respaldo La otra.
 * @returns {(Parada|null)} La parada combinada.
 */
export function combinarParadas(principal, respaldo) {
  if (!principal) return respaldo || null
  if (!respaldo) return principal
  const salida = { ...principal }
  Object.keys(respaldo).forEach((k) => {
    if (!salida[k]) salida[k] = respaldo[k]
  })
  return salida
}

/**
 * Interpreta un documento de carga —rate confirmation, BOL, pickup sheet— por
 * reglas.
 *
 * Primero busca tablas (encabezados en un renglón y valores en el siguiente) y
 * luego secciones con etiqueta («SHIPPER:», «CONSIGNEE:»): lo de la tabla manda
 * y la sección rellena huecos. Si no reconoce ninguna estructura, toma lo
 * primero que parezca dirección, fecha y hora como recolección.
 *
 * @param {Array.<Renglon>} renglones Los renglones de {@link agruparRenglones}.
 * @returns {{pickup: (Parada|null), delivery: (Parada|null), rawText: string}} Recolección, entrega y el texto leído.
 */
export function interpretarDocumentoCarga(renglones) {
  const tablas = leerTablas(renglones)
  const omitir = new Set(tablas.map((t) => t.indiceEncabezado))
  const conEtiqueta = leerSeccionesConEtiqueta(renglones, omitir)

  let pickup = combinarParadas(tablas.find((t) => t.tipo === "pickup")?.parada, conEtiqueta.pickup)
  const delivery = combinarParadas(tablas.find((t) => t.tipo === "delivery")?.parada, conEtiqueta.delivery)

  if (!pickup && !delivery) {
    const ciudad = encontrarCiudad(renglones)
    const generica = {
      name: ciudad ? nombreDeFila(renglones, ciudad) : "",
      ...(ciudad || { city: "", state: "", zip: "" }),
      date: buscarPrimero(renglones, leerFecha),
      time: buscarPrimero(renglones, leerHora),
    }
    if (cuantosLlenos(generica) > 0) pickup = generica
  }

  for (const tabla of tablas) {
    const parada = tabla.tipo === "pickup" ? pickup : delivery
    if (parada && (!parada.city || !parada.zip)) {
      const ciudad = encontrarCiudad(renglones.slice(tabla.indiceEncabezado + 1, tabla.indiceEncabezado + 8))
      if (ciudad) {
        Object.keys(ciudad).forEach((k) => {
          if (!parada[k]) parada[k] = ciudad[k]
        })
      }
    }
  }

  return {
    pickup,
    delivery,
    rawText: renglones.map((r) => r.cells.map((c) => c.text).join("    ")).join("\n"),
  }
}

/**
 * Cuántos datos útiles se encontraron entre recolección y entrega.
 *
 * Decide si vale la pena una segunda pasada de OCR.
 *
 * @param {{pickup: (Parada|null), delivery: (Parada|null)}} resultado Lo interpretado.
 * @returns {number} Campos llenos, de 0 a 12.
 */
export function puntaje(resultado) {
  const campos = ["name", "city", "state", "zip", "date", "time"]
  const llenos = (parada) => (parada ? campos.filter((k) => parada[k]).length : 0)
  return llenos(resultado.pickup) + llenos(resultado.delivery)
}
