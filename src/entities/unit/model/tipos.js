import { ENDPOINTS } from "../../../shared/api"

/**
 * Los tres tipos de unidad que IMA administra con expediente de documentos.
 *
 * @readonly
 * @enum {string}
 */
export const TIPO_UNIDAD = {
  CAMION: "camion",
  CAJA: "caja",
  CONDUCTOR: "conductor",
}

/**
 * Todo lo que distingue a un tipo de unidad de los otros dos.
 *
 * Las tres pantallas hacen exactamente lo mismo —listar, buscar, dar de alta,
 * editar el expediente y configurar requisitos— contra tres endpoints que solo
 * se diferencian en el nombre del sustantivo. En vez de tres pantallas casi
 * iguales que se van separando con cada arreglo, hay una y esta tabla.
 *
 * @typedef {object} DescriptorUnidad
 * @property {string} clave Un valor de `TIPO_UNIDAD`.
 * @property {string} endpoint Archivo PHP que atiende a este tipo.
 * @property {string} campoLista Clave del arreglo dentro de la respuesta.
 * @property {string} campoId Nombre de la columna que identifica a la unidad.
 * @property {object} ops Nombre de cada operación en este endpoint.
 * @property {boolean} columnasPersistidas Si el backend guarda qué columnas se ven.
 * @property {object} etiquetas Los textos de la pantalla.
 * @property {Array} columnas Las columnas fijas de la tabla, antes de los requisitos.
 * @property {Array} campos Los campos del formulario de alta y edición.
 * @property {Array} busquedas Los buscadores de la barra de filtros.
 */

const CAMION = {
  clave: TIPO_UNIDAD.CAMION,
  endpoint: ENDPOINTS.trucksV2,
  campoLista: "trucks",
  campoId: "truck_id",
  ops: { guardar: "saveTruck", eliminar: "deleteTruck" },
  columnasPersistidas: true,
  etiquetas: {
    singular: "Camión",
    plural: "Camiones",
    titulo: "Administrador de Camiones",
    descripcion: "Gestión centralizada de unidades, permisos y registros (USA/MEX).",
    alta: "Alta Camión",
    tituloAlta: "Alta de Nuevo Camión",
    tituloEdicion: "Editando Camión",
    seccionDatos: "Datos del Vehículo",
    vacio: "No se encontraron camiones. ¡Agrega un requisito y registra un camión!",
    porPagina: "Camiones por página:",
    confirmarBorrado: "¿Eliminar Camión?",
  },
  columnas: [
    { clave: "unidad", etiqueta: "Unidad", ancho: 80, principal: true },
    { clave: "placa_mex", etiqueta: "Placa MEX", ancho: 100 },
    { clave: "placa_eua", etiqueta: "Placa USA", ancho: 100 },
  ],
  campos: [
    { clave: "unidad", etiqueta: "Número de Unidad", requerido: true },
    { clave: "placa_mex", etiqueta: "Placa MEX" },
    { clave: "placa_eua", etiqueta: "Placa USA" },
    { clave: "modelo", etiqueta: "Modelo (Año)" },
    { clave: "marca", etiqueta: "Marca del Camión" },
    { clave: "numero_vin", etiqueta: "Número VIN" },
    { clave: "tag", etiqueta: "Laredo TAG" },
  ],
  busquedas: [
    { clave: "unidad", etiqueta: "Buscar por Unidad", campos: ["unidad"] },
    { clave: "placa", etiqueta: "Buscar por Placa (MX/USA)", campos: ["placa_mex", "placa_eua"] },
  ],
}

const CAJA = {
  clave: TIPO_UNIDAD.CAJA,
  endpoint: ENDPOINTS.cajasV2,
  campoLista: "cajas",
  campoId: "caja_id",
  ops: { guardar: "saveTrailer", eliminar: "deleteTrailer" },
  columnasPersistidas: false,
  etiquetas: {
    singular: "Caja",
    plural: "Cajas",
    titulo: "Administrador de Cajas",
    descripcion: "Gestión centralizada de remolques, placas y documentación.",
    alta: "Alta Caja",
    tituloAlta: "Alta de Nueva Caja",
    tituloEdicion: "Editando Caja",
    seccionDatos: "Datos de la Caja",
    vacio: "No se encontraron cajas registradas.",
    porPagina: "Cajas por página:",
    confirmarBorrado: "¿Eliminar Caja?",
  },
  columnas: [
    { clave: "no_caja", etiqueta: "No. Caja", ancho: 80, principal: true },
    { clave: "no_placa", etiqueta: "Placa", ancho: 100 },
    { clave: "estado_placa", etiqueta: "Estado", ancho: 100 },
  ],
  campos: [
    { clave: "no_caja", etiqueta: "Número de Caja", requerido: true },
    { clave: "no_placa", etiqueta: "Placa" },
    { clave: "estado_placa", etiqueta: "Estado de la Placa" },
    { clave: "no_vin", etiqueta: "Número VIN" },
  ],
  busquedas: [
    { clave: "caja", etiqueta: "Buscar por No. de Caja", campos: ["no_caja"] },
    { clave: "placa", etiqueta: "Buscar por Placa", campos: ["no_placa"] },
  ],
}

const CONDUCTOR = {
  clave: TIPO_UNIDAD.CONDUCTOR,
  endpoint: ENDPOINTS.driversV2,
  campoLista: "drivers",
  campoId: "driver_id",
  ops: { guardar: "saveDriver", eliminar: "deleteDriver", baja: "darDeBajaDriver" },
  columnasPersistidas: true,
  conBaja: true,
  etiquetas: {
    singular: "Conductor",
    plural: "Conductores",
    titulo: "Administrador de Conductores",
    descripcion: "Expediente, vigencias y estatus de la plantilla de operadores.",
    alta: "Alta Conductor",
    tituloAlta: "Alta de Nuevo Conductor",
    tituloEdicion: "Editando Conductor",
    seccionDatos: "Datos del Conductor",
    vacio: "No se encontraron conductores con este estatus.",
    porPagina: "Conductores por página:",
    confirmarBorrado: "¿Eliminar Conductor?",
  },
  columnas: [
    { clave: "driver_id", etiqueta: "#" },
    { clave: "nombre", etiqueta: "Nombre", ancho: 150, principal: true },
    { clave: "estado", etiqueta: "Estado", tipo: "estado" },
  ],
  campos: [
    { clave: "nombre", etiqueta: "Nombre Completo", requerido: true },
    { clave: "fecha_nacimiento", etiqueta: "Fecha de Nacimiento", tipo: "date" },
    { clave: "fecha_ingreso", etiqueta: "Fecha de Ingreso", tipo: "date" },
    { clave: "curp", etiqueta: "CURP" },
    { clave: "rfc", etiqueta: "RFC" },
    { clave: "phone_mex", etiqueta: "Teléfono MEX" },
    { clave: "phone_usa", etiqueta: "Teléfono USA" },
  ],
  busquedas: [{ clave: "nombre", etiqueta: "Buscar por Nombre", campos: ["nombre"] }],
}

/**
 * Los descriptores de los tres tipos, por su clave.
 *
 * @type {Object.<string, DescriptorUnidad>}
 */
export const CATALOGO_UNIDAD = {
  [TIPO_UNIDAD.CAMION]: CAMION,
  [TIPO_UNIDAD.CAJA]: CAJA,
  [TIPO_UNIDAD.CONDUCTOR]: CONDUCTOR,
}

/**
 * El descriptor de un tipo de unidad.
 *
 * @param {string} tipo Un valor de `TIPO_UNIDAD`.
 * @returns {DescriptorUnidad} El descriptor.
 * @throws {Error} Si el tipo no existe, porque todo lo demás depende de él.
 */
export function descriptorDe(tipo) {
  const descriptor = CATALOGO_UNIDAD[tipo]
  if (!descriptor) throw new Error(`Tipo de unidad desconocido: ${tipo}`)
  return descriptor
}

/**
 * Los campos vacíos con los que arranca un alta.
 *
 * @param {string} tipo Un valor de `TIPO_UNIDAD`.
 * @returns {object} El formulario en blanco, con su expediente vacío.
 */
export function unidadEnBlanco(tipo) {
  const { campos } = descriptorDe(tipo)
  const vacia = Object.fromEntries(campos.map((campo) => [campo.clave, ""]))
  return { ...vacia, docs: {} }
}
