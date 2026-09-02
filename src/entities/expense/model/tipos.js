import { ENDPOINTS } from "../../../shared/api"

/**
 * Los dos tipos de registro que lleva `formularios.php`.
 *
 * Son la misma pantalla tres veces —resumen por viaje, registros de un viaje y
 * edición de uno— contra operaciones que solo cambian el sustantivo.
 *
 * @readonly
 * @enum {string}
 */
export const TIPO_REGISTRO = {
  GASTO: "gasto",
  DIESEL: "diesel",
}

/**
 * Dónde viene la lista en cada respuesta de `formularios.php`.
 *
 * El endpoint usa **tres claves distintas** según la operación, y ninguna es la
 * habitual `data`: las listas vienen en `id` —sí, un arreglo en un campo que se
 * llama `id`—, un registro suelto en `row`, y solo los tickets en `data`.
 *
 * @readonly
 * @enum {string}
 */
export const CAMPO_RESPUESTA = {
  LISTA: "id",
  REGISTRO: "row",
  TICKETS: "data",
}

const GASTO = {
  clave: TIPO_REGISTRO.GASTO,
  endpoint: ENDPOINTS.formularios,
  ops: {
    resumen: "getAll_gastos",
    registros: "get_registers_gasto",
    uno: "get_gasto",
    editar: "edit_gasto",
    eliminar: "delete_gasto",
  },
  etiquetas: {
    singular: "Gasto",
    plural: "Gastos",
    titulo: "Travel Expense Manager",
    descripcion: "Gastos de viaje capturados por los operadores.",
    vacioResumen: "No se encontraron registros de gastos de viaje.",
    vacioDetalle: "Este viaje no tiene gastos registrados.",
    confirmarBorrado: "¿Eliminar este gasto?",
  },
  rutas: {
    detalle: (tripId) => `/detalle-gastos/${tripId}`,
    editor: (id, tripId) => `/editor-gastos/${id}/${tripId}`,
    volver: "/admin-gastos",
  },
  /** Columnas propias del detalle, además de las comunes. */
  columnasDetalle: [{ clave: "tipo_gasto", etiqueta: "Tipo de gasto" }],
  campos: [
    { clave: "tipo_gasto", etiqueta: "Tipo de gasto" },
    { clave: "monto", etiqueta: "Monto", tipo: "number" },
  ],
}

const DIESEL = {
  clave: TIPO_REGISTRO.DIESEL,
  endpoint: ENDPOINTS.formularios,
  ops: {
    resumen: "getAll_diesel",
    registros: "get_registers_diesel",
    uno: "get_diesel",
    editar: "edit_diesel",
    eliminar: "delete_diesel",
    alta: "add_manual_diesel",
  },
  etiquetas: {
    singular: "Carga de diesel",
    plural: "Diesel",
    titulo: "Diesel Manager",
    descripcion: "Cargas de combustible por viaje, con su periodo fiscal.",
    vacioResumen: "No se encontraron registros de diesel.",
    vacioDetalle: "Este viaje no tiene cargas de diesel registradas.",
    confirmarBorrado: "¿Eliminar esta carga de diesel?",
  },
  rutas: {
    detalle: (tripId) => `/detalle-diesel/${tripId}`,
    editor: (id, tripId) => `/editor-diesel/${id}/${tripId}`,
    volver: "/admin-diesel",
  },
  columnasDetalle: [
    { clave: "odometro", etiqueta: "Odómetro" },
    { clave: "galones", etiqueta: "Galones" },
    { clave: "estado", etiqueta: "Estado" },
    { clave: "periodo", etiqueta: "Periodo" },
  ],
  campos: [
    { clave: "monto", etiqueta: "Monto", tipo: "number" },
    { clave: "galones", etiqueta: "Galones", tipo: "number" },
    { clave: "odometro", etiqueta: "Odómetro", tipo: "number" },
    { clave: "estado", etiqueta: "Estado" },
    { clave: "periodo", etiqueta: "Periodo" },
  ],
  conPendientes: true,
}

/**
 * Los descriptores de los dos tipos, por su clave.
 *
 * @type {Object.<string, object>}
 */
export const CATALOGO_REGISTRO = {
  [TIPO_REGISTRO.GASTO]: GASTO,
  [TIPO_REGISTRO.DIESEL]: DIESEL,
}

/**
 * El descriptor de un tipo de registro.
 *
 * @param {string} tipo Un valor de `TIPO_REGISTRO`.
 * @returns {object} El descriptor.
 * @throws {Error} Si el tipo no existe.
 */
export function descriptorDe(tipo) {
  const descriptor = CATALOGO_REGISTRO[tipo]
  if (!descriptor) throw new Error(`Tipo de registro desconocido: ${tipo}`)
  return descriptor
}
