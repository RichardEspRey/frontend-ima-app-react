export {
  REGION,
  TIPO_REQUISITO,
  ESTADO_DOCUMENTO,
  DIAS_POR_VENCER,
  esquemaRequisito,
  esquemaValor,
  diasRestantes,
  estadoDocumento,
  normalizarDocumentos,
  porRegion,
} from "./model/documento"

export {
  LLAVE_DOCUMENTOS,
  obtenerDocumentos,
  guardarDocumento,
  crearRequisito,
  eliminarRequisito,
  useDocumentos,
  useGuardarDocumento,
  useCrearRequisito,
  useEliminarRequisito,
} from "./api/documentos"
