export {
  ESTADO_VIAJE,
  ESTADO_POR_OMISION,
  COLOR_ESTADO_VIAJE,
  colorEstadoViaje,
  TIPO_ETAPA,
  etiquetaTipoEtapa,
} from "./model/viaje"

export {
  totalesViaje,
  utilidadCuadra,
  utilidadNeta,
  etapasDeResumen,
  dieselDeResumen,
  gastosDeResumen,
  galonesDeResumen,
} from "./model/resumen"

export { llaveResumenViaje, obtenerResumenViaje, useResumenViaje } from "./api/resumen"

export {
  PREFIJO_ID_NUEVO,
  esNuevo,
  idParaGuardar,
  normalizarTipoDocumento,
  nombreDeArchivo,
  documentoDesdeApi,
  documentosDeEtapa,
  paradasDesdeApi,
  metadatosDocumentos,
  paradasParaGuardar,
  etapaParaGuardar,
  etapasEliminadas,
  archivosNuevos,
  etapasDesdeApi,
  TIPO_ETAPA_POR_OMISION,
} from "./model/edicion"

export {
  OP_GUARDADO,
  llaveViajeUpcoming,
  obtenerViajePorId,
  guardarViajeUpcoming,
  guardarInvoices,
  useViajeUpcoming,
  useGuardarViajeUpcoming,
} from "./api/edicion"
