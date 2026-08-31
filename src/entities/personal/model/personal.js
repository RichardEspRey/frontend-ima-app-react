import { z } from "zod"

/**
 * Frecuencias de pago que acepta la nómina.
 * @readonly
 * @enum {string}
 */
export const FRECUENCIA_PAGO = {
  SEMANAL: "Semanal",
  QUINCENAL: "Quincenal",
  MENSUAL: "Mensual",
}

/**
 * Tipos de nómina, por divisa.
 *
 * Toda la app decide con `tipo_nomina === 'MX'` y trata cualquier otro valor
 * como dólares; el único punto que escribe el campo es el select del formulario,
 * que manda `US`. Por eso el dominio real son estos dos valores y no más.
 *
 * @readonly
 * @enum {string}
 */
export const TIPO_NOMINA = {
  MX: "MX",
  US: "US",
}

/**
 * Número que llega de PHP. MySQL devuelve los DECIMAL como cadena
 * (`"1500.00"`), así que se coacciona en vez de exigir `number`.
 */
const numeroDePhp = z.coerce.number()

/**
 * Identificador que llega de PHP, siempre como cadena en las respuestas.
 */
const idDePhp = z.coerce.string()

/**
 * Forma de un empleado tal como lo devuelve `personal_admin.php`.
 *
 * Es deliberadamente tolerante con lo que no afecta al render: `.catch()` pone
 * un valor por omisión en vez de tirar la lista entera porque un registro traiga
 * un campo raro. Lo que sí es obligatorio es `id` y `nombre`: sin eso la fila no
 * se puede ni pintar ni editar.
 *
 * `frecuencia_pago` se lee tal cual, sin enum: forzarla a un valor conocido
 * cambiaría en silencio el significado de un registro que traiga algo distinto.
 * El enum sí se aplica al **escribir**, en `esquemaFormularioEmpleado`, porque
 * ahí el valor sale de un select controlado.
 */
export const esquemaEmpleado = z.object({
  id: idDePhp,
  nombre: z.string().min(1),
  puesto: z.string().catch(""),
  sueldo: numeroDePhp.catch(0),
  frecuencia_pago: z.string().catch(""),
  tipo_nomina: z
    .string()
    .catch(TIPO_NOMINA.MX)
    .transform((valor) => (valor === TIPO_NOMINA.MX ? TIPO_NOMINA.MX : TIPO_NOMINA.US)),
})

/**
 * Empleado de nómina ya normalizado y validado.
 *
 * @typedef {object} Empleado
 * @property {string} id Identificador del empleado.
 * @property {string} nombre Nombre completo.
 * @property {string} puesto Puesto; cadena vacía si no se capturó.
 * @property {number} sueldo Sueldo a pagar, ya convertido a número.
 * @property {string} frecuencia_pago Semanal, Quincenal o Mensual.
 * @property {string} tipo_nomina `MX` (pesos) o `US` (dólares).
 */

/**
 * Valida y normaliza la lista de empleados que devuelve la API.
 *
 * Descarta los registros que no cumplen lo mínimo en lugar de dejar pasar
 * `undefined` hacia el render, que es el origen de los "cannot read properties
 * of undefined" que hay repartidos por el proyecto.
 *
 * @param {unknown[]} filas Lo que vino en la respuesta.
 * @returns {{empleados: Array.<Empleado>, descartados: number}} Los válidos y cuántos se cayeron.
 */
export function normalizarEmpleados(filas) {
  const empleados = []
  let descartados = 0

  for (const fila of filas) {
    const resultado = esquemaEmpleado.safeParse(fila)
    if (resultado.success) empleados.push(resultado.data)
    else descartados += 1
  }

  return { empleados, descartados }
}

/**
 * Valida los datos del formulario antes de mandarlos.
 *
 * `id` ausente significa alta; presente, edición.
 */
export const esquemaFormularioEmpleado = z.object({
  id: z.union([idDePhp, z.null()]).optional(),
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  puesto: z.string().trim().catch(""),
  sueldo: numeroDePhp.refine((n) => n > 0, "El sueldo debe ser mayor que 0"),
  frecuencia_pago: z.enum(Object.values(FRECUENCIA_PAGO)),
  tipo_nomina: z.enum(Object.values(TIPO_NOMINA)),
})

/**
 * Comprueba el formulario y devuelve el primer mensaje de error, si lo hay.
 *
 * @param {Record<string, unknown>} formulario Datos capturados en el modal.
 * @returns {{valido: boolean, datos: (object|undefined), mensaje: (string|undefined)}} Resultado de la validación.
 */
export function validarFormularioEmpleado(formulario) {
  const resultado = esquemaFormularioEmpleado.safeParse(formulario)
  if (resultado.success) return { valido: true, datos: resultado.data }
  return { valido: false, mensaje: resultado.error.issues[0].message }
}
