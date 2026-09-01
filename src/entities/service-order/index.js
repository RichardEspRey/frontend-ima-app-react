export {
  ESTATUS_ORDEN,
  esquemaOrden,
  esquemaServicio,
  normalizarOrdenes,
  estaAbierta,
  resumenServicios,
  todoCompletado,
} from "./model/orden"

export {
  LLAVE_ORDENES,
  obtenerOrdenes,
  obtenerOrden,
  obtenerCamionesDeOrden,
  cambiarEstatusServicio,
  useOrdenes,
  useCamionesDeOrden,
  useCambiarEstatusServicio,
} from "./api/ordenes"
