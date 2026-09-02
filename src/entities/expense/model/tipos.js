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
  /** Columnas del resumen, además del viaje y la fecha. */
  columnasResumen: [
    { clave: "registros", etiqueta: "No of records", alineacion: "right" },
    { clave: "monto", etiqueta: "Total Cost", alineacion: "right", tipo: "dinero" },
    { clave: "nombre", etiqueta: "Last Driver" },
  ],
  /** Columnas del detalle, entre el número de renglón y las acciones. */
  columnasDetalle: [
    { clave: "trip_number", etiqueta: "Trip", peso: 500 },
    { clave: "fecha", etiqueta: "Last update" },
    { clave: "tipo_gasto", etiqueta: "Expense Type" },
    { clave: "monto", etiqueta: "Total ($)", alineacion: "right", tipo: "dinero", color: "#d32f2f" },
    { clave: "nombre", etiqueta: "Driver" },
  ],
  /** Campos del editor. Los de solo lectura vienen del registro, no se envían. */
  campos: [
    { clave: "trip_number", etiqueta: "Trip Number", soloLectura: true },
    { clave: "nombre", etiqueta: "Driver", soloLectura: true },
    { clave: "tipo_gasto", etiqueta: "Expense Type", ayuda: "e.g. Comida, Peaje" },
    { clave: "monto", etiqueta: "Total Cost", tipo: "number", prefijo: "$" },
  ],
  tituloEditor: "Expense Log Editor",
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
  columnasResumen: [
    { clave: "galones", etiqueta: "Total Gal.", alineacion: "right", tipo: "galones" },
    { clave: "monto", etiqueta: "Total Cost", alineacion: "right", tipo: "dinero" },
    { clave: "nombre", etiqueta: "Driver" },
    { clave: "state_pending_count", etiqueta: "State Pending", alineacion: "center", tipo: "pendiente", color: "#d32f2f", aviso: "estados" },
    { clave: "fleetone_pending_count", etiqueta: "Fleet One Pending", alineacion: "center", tipo: "pendiente", color: "#ed6c02", aviso: "Fleet One" },
    { clave: "manual_count", etiqueta: "Manuales", alineacion: "center", tipo: "pendiente", color: "#f59e0b", aviso: "Registros ingresados a mano" },
    { clave: "periodo", etiqueta: "Periodo", alineacion: "center" },
  ],
  columnasDetalle: [
    { clave: "is_manual", etiqueta: "Origen", tipo: "origen" },
    { clave: "trip_number", etiqueta: "Trip", peso: 500 },
    { clave: "fecha", etiqueta: "Last update" },
    { clave: "odometro", etiqueta: "Odometer", alineacion: "right" },
    { clave: "galones", etiqueta: "Gal.", alineacion: "right", tipo: "galones" },
    { clave: "monto", etiqueta: "Total ($)", alineacion: "right", tipo: "dinero", color: "#d32f2f" },
    { clave: "created_by", etiqueta: "Registrado por" },
    { clave: "estado", etiqueta: "State" },
    { clave: "fleetone", etiqueta: "Fleet One" },
  ],
  campos: [
    { clave: "trip_number", etiqueta: "Trip Number", soloLectura: true },
    { clave: "nombre", etiqueta: "Driver", soloLectura: true },
    { clave: "estado", etiqueta: "State" },
    { clave: "fleetone", etiqueta: "Fleet One ($)", tipo: "number", prefijo: "$" },
    { clave: "odometro", etiqueta: "Odometer", tipo: "number", sufijo: "mi", ancho: 6 },
    { clave: "galones", etiqueta: "Gallons", tipo: "number", sufijo: "gal", ancho: 6 },
    { clave: "monto", etiqueta: "Total Cost", tipo: "number", prefijo: "$" },
    { clave: "periodo", etiqueta: "Periodo", ayuda: "Ej. Q1, Q2..." },
  ],
  tituloEditor: "Diesel Log Editor",
  conPendientes: true,
  conPaginacion: true,
  /** Las dos pestañas del resumen de diesel, por conciliar y conciliado. */
  pestanas: [
    { etiqueta: "Pendientes", filtro: (fila) => Number(fila?.fleetone_pending_count ?? 0) > 0 },
    { etiqueta: "Completados", filtro: (fila) => Number(fila?.fleetone_pending_count ?? 0) === 0 },
  ],
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
