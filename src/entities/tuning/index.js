export {
  ESTADO_AFINACION,
  UMBRAL_PROXIMA,
  esquemaAfinacion,
  esquemaHistorial,
  esquemaRegistroDiesel,
  progresoAfinacion,
  estadoAfinacion,
  millasRestantes,
  lecturasSospechosas,
  normalizarLista,
} from "./model/afinacion"

export {
  LLAVE_AFINACIONES,
  LLAVE_HISTORIAL,
  obtenerAfinaciones,
  obtenerHistorial,
  registrarAfinacion,
  actualizarLimite,
  corregirOdometro,
  useAfinaciones,
  useHistorialAfinaciones,
  useRegistrarAfinacion,
  useActualizarLimite,
  useCorregirOdometro,
} from "./api/afinaciones"
