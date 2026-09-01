/**
 * Prefijo que llevan las etapas y paradas creadas en el navegador.
 *
 * La API asigna el id real al guardar, así que estos ids provisionales deben
 * viajar como `null`: si se mandan tal cual, el backend intenta actualizar una
 * fila inexistente en vez de insertarla.
 *
 * @type {string}
 */
export const PREFIJO_ID_NUEVO = "new"

/**
 * Indica si un id es provisional, de algo que todavía no existe en la base.
 *
 * @param {*} id El id a evaluar.
 * @returns {boolean} `true` si aún no se ha guardado.
 */
export const esNuevo = (id) => String(id ?? "").startsWith(PREFIJO_ID_NUEVO)

/**
 * El id que debe viajar a la API: el real, o `null` si es provisional.
 *
 * @param {*} id El id a convertir.
 * @returns {*} El id, o `null`.
 */
export const idParaGuardar = (id) => (esNuevo(id) ? null : id)

/**
 * Corrige el tipo de documento de los adjuntos guardados con la llave vieja.
 *
 * `BorderCrossingFormNew2` guardó durante un tiempo `orden_de_retiro` en lugar
 * de `orden_retiro`. Los documentos ya subidos con la llave vieja siguen en la
 * base; sin esta corrección desaparecen del detalle de la etapa.
 *
 * @param {string} tipo El tipo tal como vino de la API.
 * @returns {string} El tipo con el que trabaja la pantalla.
 */
export const normalizarTipoDocumento = (tipo) =>
  tipo === "orden_de_retiro" ? "orden_retiro" : tipo

/**
 * El nombre del archivo dentro de una ruta del servidor.
 *
 * Las rutas llegan con separadores de Windows o de Unix según cómo se subió el
 * archivo, así que se cortan por los dos.
 *
 * @param {string} ruta Ruta o nombre completo.
 * @param {string} [porOmision='Archivo existente'] Qué devolver si no hay ruta.
 * @returns {string} Solo el nombre.
 */
export const nombreDeArchivo = (ruta, porOmision = "Archivo existente") =>
  String(ruta ?? "").split(/[\\/]/).pop() || porOmision

/**
 * Convierte un documento de la API en el estado que maneja el formulario.
 *
 * @param {object} doc El documento como vino de la API.
 * @returns {object} El documento en el formato de la pantalla.
 */
export function documentoDesdeApi(doc) {
  return {
    fileName: nombreDeArchivo(doc?.nombre_archivo),
    vencimiento: doc?.fecha_vencimiento || null,
    file: null,
    hasNewFile: false,
    document_id: doc?.document_id,
    serverPath: doc?.path_servidor_real,
  }
}

/**
 * Rellena la plantilla de documentos de una etapa con los que ya están subidos.
 *
 * Solo se conservan los tipos que la plantilla contempla: un documento de un
 * tipo que la etapa ya no usa no debe reaparecer en el formulario.
 *
 * @param {object} plantilla Los tipos de documento que admite la etapa.
 * @param {Array} [adjuntos] Los documentos que devolvió la API.
 * @returns {object} La plantilla con los documentos existentes puestos.
 */
export function documentosDeEtapa(plantilla, adjuntos = []) {
  const documentos = { ...plantilla }

  for (const doc of Array.isArray(adjuntos) ? adjuntos : []) {
    const tipo = normalizarTipoDocumento(doc?.tipo_documento)
    if (Object.hasOwn(documentos, tipo)) documentos[tipo] = documentoDesdeApi(doc)
  }

  return documentos
}

/**
 * Convierte las paradas de una etapa al estado del formulario.
 *
 * @param {Array} [paradas] Las paradas como vinieron de la API.
 * @returns {Array} Las paradas con su documento ya convertido.
 */
export function paradasDesdeApi(paradas = []) {
  if (!Array.isArray(paradas)) return []

  return paradas.map((parada) => ({
    ...parada,
    bl_firmado_doc: parada?.bl_firmado_doc
      ? { ...documentoDesdeApi(parada.bl_firmado_doc), fileName: nombreDeArchivo(parada.bl_firmado_doc.nombre_archivo, "Archivo") }
      : null,
  }))
}

/**
 * Los metadatos de documentos que acompañan al guardado.
 *
 * Los archivos van aparte, en campos propios del `FormData`; esto es solo la
 * descripción de cada uno. Se omiten los tipos que no tienen archivo alguno.
 *
 * @param {object} [documentos] Los documentos de una etapa.
 * @returns {Array.<object>} Los metadatos de los que sí tienen archivo.
 */
export function metadatosDocumentos(documentos = {}) {
  return Object.entries(documentos)
    .map(([tipo, datos]) => ({
      tipo_documento: tipo,
      document_id: datos?.document_id,
      fileName: datos?.fileName,
      vencimiento: datos?.vencimiento,
      hasNewFile: datos?.hasNewFile,
    }))
    .filter((doc) => doc.fileName)
}

/**
 * Las paradas de una etapa, listas para el JSON del guardado.
 *
 * El orden se recalcula a partir de la posición en la lista: es lo que el
 * usuario ve, y arrastrar una parada no actualiza su `stop_order`.
 *
 * @param {Array} [paradas] Las paradas de la etapa.
 * @returns {Array.<object>} Las paradas en el formato de la API.
 */
export function paradasParaGuardar(paradas = []) {
  return paradas.map((parada, indice) => ({
    stop_id: idParaGuardar(parada.stop_id),
    location: parada.location,
    stop_order: indice + 1,
    time_of_delivery: parada.time_of_delivery,
    bl_firmado_doc: parada.bl_firmado_doc
      ? {
          document_id: parada.bl_firmado_doc.document_id,
          fileName: parada.bl_firmado_doc.fileName,
          hasNewFile: parada.bl_firmado_doc.hasNewFile,
        }
      : null,
  }))
}

/**
 * Los campos de una etapa que se guardan, en el formato de la API.
 *
 * @param {object} etapa La etapa del formulario.
 * @param {Function} formatearFecha Convierte una fecha al formato de la API.
 * @returns {object} La etapa lista para serializar.
 */
export function etapaParaGuardar(etapa, formatearFecha) {
  return {
    trip_stage_id: idParaGuardar(etapa.trip_stage_id),
    stage_number: etapa.stage_number,
    stageType: etapa.stageType,
    origin: etapa.origin,
    destination: etapa.destination,
    zip_code_origin: etapa.zip_code_origin,
    zip_code_destination: etapa.zip_code_destination,
    loading_date: formatearFecha(etapa.loading_date),
    delivery_date: formatearFecha(etapa.delivery_date),
    company_id: etapa.company_id,
    travel_direction: etapa.travel_direction,
    warehouse_origin_id: etapa.warehouse_origin_id,
    warehouse_destination_id: etapa.warehouse_destination_id,
    ci_number: etapa.ci_number,
    rate_tarifa: etapa.rate_tarifa,
    millas_pcmiller: etapa.millas_pcmiller,
    millas_pcmiller_practicas: etapa.millas_pcmiller_practicas,
    comments: etapa.comments,
    time_of_delivery: etapa.time_of_delivery,
    estatus: etapa.estatus,
    documentos: metadatosDocumentos(etapa.documentos),
    stops_in_transit: paradasParaGuardar(etapa.stops_in_transit),
  }
}

/**
 * Las etapas que el usuario quitó durante la edición.
 *
 * La API no borra por omisión: hay que decirle explícitamente cuáles ya no
 * están, o las etapas eliminadas reaparecen al recargar.
 *
 * @param {Array} [etapasIniciales] Las etapas como llegaron de la API.
 * @param {Array} [etapasActuales] Las etapas que quedaron en pantalla.
 * @returns {Array} Los ids a eliminar.
 */
export function etapasEliminadas(etapasIniciales = [], etapasActuales = []) {
  const vigentes = new Set(
    etapasActuales.map((etapa) => etapa?.trip_stage_id).filter(Boolean).map(String),
  )

  return (etapasIniciales ?? [])
    .map((etapa) => etapa?.trip_stage_id)
    .filter(Boolean)
    .filter((id) => !vigentes.has(String(id)))
}

/**
 * Los archivos nuevos de las etapas, con el nombre de campo que espera la API.
 *
 * Solo viajan los que el usuario acaba de escoger; los ya subidos se
 * identifican por su `document_id` en los metadatos. Cuando un archivo nuevo
 * reemplaza a uno existente se manda además el id del que se sustituye.
 *
 * @param {Array} [etapas] Las etapas del formulario.
 * @returns {object} Campos del `FormData`, de nombre a valor.
 */
export function archivosNuevos(etapas = []) {
  const campos = {}

  etapas.forEach((etapa, indice) => {
    for (const [tipo, datos] of Object.entries(etapa.documentos || {})) {
      if (!datos?.hasNewFile) continue
      campos[`etapa_${indice}_doc_type_${tipo}_file`] = datos.file
      if (datos.document_id) campos[`etapa_${indice}_doc_type_${tipo}_replace_id`] = datos.document_id
    }

    ;(etapa.stops_in_transit || []).forEach((parada, iParada) => {
      const doc = parada.bl_firmado_doc
      if (!doc?.hasNewFile) return
      campos[`etapa_${indice}_stop_${iParada}_bl_firmado_file`] = doc.file
      if (doc.document_id) campos[`etapa_${indice}_stop_${iParada}_bl_firmado_replace_id`] = doc.document_id
    })
  })

  return campos
}
