export {
  esquemaInspeccion,
  esquemaReporte,
  sinMulta,
  cuentaViolaciones,
  totalCuadra,
  normalizarInspecciones,
} from "./model/inspeccion"

export {
  LLAVE_INSPECCIONES,
  obtenerInspecciones,
  obtenerDescripciones,
  guardarInspeccion,
  eliminarDocumento,
  useInspecciones,
  useDescripciones,
  useGuardarInspeccion,
  useEliminarDocumentoInspeccion,
} from "./api/inspecciones"
