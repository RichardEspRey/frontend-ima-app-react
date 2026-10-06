export {
  DOCUMENTOS_REQUERIDOS,
  NOMBRE_DOCUMENTO,
  esquemaViajeSafety,
  tieneDocumento,
  documentosFaltantes,
  cumplimientoCompleto,
  separarPorCumplimiento,
  contarFaltantes,
  filtrarPorNumero,
  normalizarViajesSafety,
} from "./model/cumplimiento"

export { LLAVE_SAFETY, obtenerViajesSafety, useViajesSafety } from "./api/cumplimiento"
