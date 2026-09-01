/**
 * Los documentos que le faltan a un viaje, sumando los de todas sus etapas.
 *
 * La API manda el conteo y la lista por etapa; aquí se juntan y se prefija cada
 * documento con su etapa, que es lo que hace útil la lista: saber que falta un
 * BL no sirve si no se sabe de cuál de las tres etapas.
 *
 * @param {object} viaje El viaje con sus etapas.
 * @returns {{total: number, lista: Array.<string>}} Cuántos faltan y cuáles.
 */
export function documentosFaltantesDeViaje(viaje) {
  const etapas = Array.isArray(viaje?.etapas) ? viaje.etapas : []
  if (etapas.length === 0) return { total: 0, lista: [] }

  let total = 0
  const lista = []

  for (const etapa of etapas) {
    const faltantes = Number(etapa?.documentos_faltantes ?? 0)
    if (faltantes <= 0) continue

    total += faltantes
    if (Array.isArray(etapa.documentos_faltantes_lista)) {
      lista.push(...etapa.documentos_faltantes_lista.map((doc) => `E${etapa.stage_number}: ${doc}`))
    }
  }

  return { total, lista }
}

/**
 * La URL con la que se abre un documento del viaje.
 *
 * Del camino que manda el servidor solo sirve el nombre del archivo; el resto
 * es la ruta interna de su disco.
 *
 * @param {string} rutaServidor El camino tal como vino de la API.
 * @param {string} apiBase La base de la API.
 * @returns {string} La URL, o `#` si no hay documento.
 */
export function urlDocumento(rutaServidor, apiBase) {
  if (!rutaServidor || typeof rutaServidor !== "string") return "#"
  const archivo = rutaServidor.split(/[\\/]/).pop()
  return `${apiBase}/Uploads/Trips/${encodeURIComponent(archivo)}`
}

/**
 * Cuántas columnas tiene la tabla en la pestaña actual.
 *
 * Hace falta para que la fila de "no hay registros" ocupe todo el ancho. Las
 * columnas cambian por pestaña y por permiso.
 *
 * @param {object} contexto En qué pestaña y con qué permisos se está.
 * @param {boolean} contexto.conDocumentos Si se muestra la columna de faltantes.
 * @param {boolean} contexto.enRuta Si es la pestaña En Ruta, que añade "copiar".
 * @param {boolean} contexto.conAdmin Si se muestra la columna de administración.
 * @returns {number} Cuántas columnas hay.
 */
export function columnasDeTabla({ conDocumentos, enRuta, conAdmin }) {
  const base = conDocumentos ? 8 : 9
  return base + (enRuta ? 1 : 0) + (!conDocumentos && conAdmin ? 1 : 0)
}
