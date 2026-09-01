export {
  COLORES_UNIDAD,
  CAPACIDAD_POR_OMISION,
  COLOR_ESTADO,
  colorEstado,
  esquemaUnidadGps,
  esquemaUnidadTablero,
  emparejarUnidad,
  direccionDeUnidad,
  combinarFlota,
  porcentajeTanque,
  lecturaTanqueSospechosa,
  filtrarFlota,
  normalizarUnidadesGps,
  ESTATUS_TODOS,
  ESTATUS_SIN_VIAJE,
  ESTATUS_TABLERO,
  filtrarPorEstatus,
} from "./model/flota"

export {
  ESTADO_PARADA,
  ETIQUETA_PARADA,
  ordenarParadas,
  estadoDeParadas,
  avanceParadas,
  tramoActivo,
} from "./model/paradas"

export {
  MODO_PING,
  ESPERA_BUSQUEDA_MS,
  puntoDesdeMapa,
  puntoDesdeBusqueda,
  puntoDesdeUnidad,
  coordenadasDeRuta,
  resumenRuta,
  METROS_POR_MILLA,
} from "./model/ruta"

export {
  REFRESCO_FLOTA_MS,
  TIMEOUT_GPS_MS,
  LLAVE_FLOTA,
  llaveParadas,
  obtenerUnidadesGps,
  obtenerTablero,
  obtenerFlota,
  obtenerParadasEtapa,
  guardarConfiguracionTanque,
  useFlota,
  useParadasEtapa,
  useGuardarTanque,
} from "./api/flota"

export {
  SERVICIO_RUTAS,
  SERVICIO_LUGARES,
  MAXIMO_LUGARES,
  buscarLugares,
  ubicarLugar,
  nombreCortoDeLugar,
  trazarRuta,
  useTrazarRuta,
} from "./api/geo"
