export {
  FRECUENCIA_PAGO,
  TIPO_NOMINA,
  esquemaEmpleado,
  esquemaFormularioEmpleado,
  normalizarEmpleados,
  validarFormularioEmpleado,
} from "./model/personal"

export {
  LLAVE_PERSONAL,
  obtenerPersonal,
  guardarEmpleado,
  eliminarEmpleado,
  usePersonal,
  useGuardarEmpleado,
  useEliminarEmpleado,
} from "./api/personal"
