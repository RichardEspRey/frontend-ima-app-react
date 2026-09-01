/**
 * Estado de una parada dentro de la etapa activa.
 *
 * @readonly
 * @enum {string}
 */
export const ESTADO_PARADA = {
  COMPLETADA: "completed",
  EN_CURSO: "current",
  PENDIENTE: "pending",
}

/**
 * Cómo se muestra cada estado de parada.
 *
 * @readonly
 * @enum {object}
 */
export const ETIQUETA_PARADA = {
  [ESTADO_PARADA.COMPLETADA]: { texto: "Completada", color: "#16a34a", fondo: "#dcfce7" },
  [ESTADO_PARADA.EN_CURSO]: { texto: "En curso", color: "#b45309", fondo: "#fef3c7" },
  [ESTADO_PARADA.PENDIENTE]: { texto: "Pendiente", color: "#94a3b8", fondo: "#f1f5f9" },
}

/**
 * Ordena las paradas por el orden de la ruta.
 *
 * La API las devuelve en el orden en que se guardaron, no en el que se recorren.
 *
 * @param {Array} [paradas] Las paradas de la etapa.
 * @returns {Array} Las paradas ordenadas, sin tocar el arreglo original.
 */
export function ordenarParadas(paradas = []) {
  if (!Array.isArray(paradas)) return []
  return [...paradas].sort((a, b) => Number(a?.stop_order) - Number(b?.stop_order))
}

/**
 * Marca cada parada como completada, en curso o pendiente.
 *
 * El tablero solo manda **la próxima parada pendiente** (`current_stop`), así que
 * el resto se deduce por posición: lo anterior ya se cubrió, lo posterior falta.
 *
 * Cuando `current_stop` viene vacío significa que ya no queda ninguna pendiente y
 * todas cuentan como completadas. Ojo: eso también pasa si el nombre que manda el
 * tablero no coincide con ninguna parada de la etapa, y entonces se pintan todas
 * como hechas sin serlo.
 *
 * @param {Array} [paradas] Las paradas de la etapa.
 * @param {string} [paradaActual] El nombre de la próxima parada pendiente.
 * @returns {Array} Las paradas ordenadas, cada una con su `stopStatus`.
 */
export function estadoDeParadas(paradas = [], paradaActual = "") {
  const ordenadas = ordenarParadas(paradas)
  if (ordenadas.length === 0) return []

  const buscada = String(paradaActual ?? "").trim().toLowerCase()
  const indiceActual = buscada
    ? ordenadas.findIndex((p) => String(p?.location ?? "").trim().toLowerCase() === buscada)
    : -1

  return ordenadas.map((parada, indice) => ({
    ...parada,
    stopStatus:
      indiceActual === -1
        ? ESTADO_PARADA.COMPLETADA
        : indice < indiceActual
          ? ESTADO_PARADA.COMPLETADA
          : indice === indiceActual
            ? ESTADO_PARADA.EN_CURSO
            : ESTADO_PARADA.PENDIENTE,
  }))
}

/**
 * Cuántas paradas se han cubierto.
 *
 * @param {Array} [paradas] Las paradas con su estado.
 * @returns {{completadas: number, total: number}} El avance.
 */
export function avanceParadas(paradas = []) {
  const lista = Array.isArray(paradas) ? paradas : []
  return {
    completadas: lista.filter((p) => p?.stopStatus === ESTADO_PARADA.COMPLETADA).length,
    total: lista.length,
  }
}

/**
 * El tramo que la unidad está recorriendo ahora mismo.
 *
 * Mientras queden paradas, el tramo activo termina en la próxima; cuando ya no
 * queda ninguna, termina en el destino final de la etapa.
 *
 * @param {object} unidad La unidad seleccionada.
 * @returns {{origen: string, destino: string, destinoFinal: (string|null)}} El tramo.
 */
export function tramoActivo(unidad) {
  const { current_origin: origen, current_stop: parada, current_destination: destino } = unidad ?? {}

  return {
    origen: origen ?? "",
    destino: parada || destino || "",
    destinoFinal: parada ? (destino ?? null) : null,
  }
}
