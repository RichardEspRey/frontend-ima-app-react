/**
 * Busca un id en un catálogo, primero por id y luego por nombre.
 *
 * Una fila de programación no siempre trae el id de la compañía o del almacén:
 * a veces solo llegó el nombre escrito. Buscar por las dos vías es lo que evita
 * que el formulario se abra con el campo vacío y la persona lo vuelva a teclear.
 *
 * @param {Array} catalogo Las opciones vigentes.
 * @param {object} campos Cómo leer el catálogo y el dato a buscar.
 * @param {string} campos.campoId Nombre de la propiedad que guarda el id.
 * @param {string} campos.campoNombre Nombre de la propiedad que guarda el nombre.
 * @param {*} campos.id El id que trae la programación, si lo trae.
 * @param {string} campos.nombre El nombre que trae la programación.
 * @returns {*} El id encontrado, o `null`.
 */
export function resolverIdDeCatalogo(catalogo = [], { campoId, campoNombre, id, nombre }) {
  const lista = Array.isArray(catalogo) ? catalogo : []

  const porId = id != null && lista.find((fila) => String(fila[campoId]) === String(id))
  if (porId) return porId[campoId]

  const porNombre = nombre && lista.find((fila) => fila[campoNombre] === nombre)
  if (porNombre) return porNombre[campoId]

  return null
}

/**
 * El id de la compañía de una programación.
 *
 * @param {object} programacion La fila aprobada.
 * @param {Array} companias Las compañías activas.
 * @returns {*} El id, o `null` si no se pudo resolver.
 */
export const companiaDePrograma = (programacion, companias) =>
  resolverIdDeCatalogo(companias, {
    campoId: "company_id",
    campoNombre: "nombre_compania",
    id: programacion?.company_id,
    nombre: programacion?.nombre_compania,
  })

/**
 * El id del almacén de destino de una programación.
 *
 * @param {object} programacion La fila aprobada.
 * @param {Array} almacenes Los almacenes activos.
 * @returns {*} El id, o `null` si no se pudo resolver.
 */
export const almacenDePrograma = (programacion, almacenes) =>
  resolverIdDeCatalogo(almacenes, {
    campoId: "warehouse_id",
    campoNombre: "nombre_almacen",
    id: programacion?.warehouse_id,
    nombre: programacion?.nombre_almacen,
  })

/**
 * Los datos del viaje precargados desde una programación aprobada.
 *
 * Una caja externa y una propia son excluyentes: se rellena la que la
 * programación indique, y la otra queda vacía para que no viajen las dos.
 *
 * @param {object} programacion La fila aprobada.
 * @returns {(object|undefined)} Los campos precargados, o nada si no hay programación.
 */
export function datosInicialesDesdePrograma(programacion) {
  if (!programacion) return undefined

  const esExterna = Boolean(programacion.caja_externa_id)
  const texto = (valor) => (valor == null ? "" : String(valor))

  return {
    driver_id: texto(programacion.driver_id),
    driver_nombre: programacion.driver_nombre || "",
    truck_id: texto(programacion.truck_id),
    truck_unidad: programacion.truck_unidad || "",
    caja_id: esExterna ? "" : texto(programacion.caja_id),
    caja_no_caja: esExterna ? "" : programacion.caja_numero || "",
    caja_externa_id: esExterna ? texto(programacion.caja_externa_id) : "",
    caja_externa_no_caja: esExterna ? programacion.caja_externa_numero || "" : "",
  }
}

/**
 * La primera etapa precargada desde una programación aprobada.
 *
 * @param {object} programacion La fila aprobada.
 * @param {object} catalogos Los catálogos con los que resolver los ids.
 * @param {Array} catalogos.companias Las compañías activas.
 * @param {Array} catalogos.almacenes Los almacenes activos.
 * @returns {(object|undefined)} La etapa precargada, o nada si no hay programación.
 */
export function etapaInicialDesdePrograma(programacion, { companias, almacenes } = {}) {
  if (!programacion) return undefined

  return {
    company_id: companiaDePrograma(programacion, companias),
    destination: programacion.destino || "",
    warehouse_destination_id: almacenDePrograma(programacion, almacenes),
    loading_date: programacion.salida ? new Date(programacion.salida) : new Date(),
  }
}
