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
