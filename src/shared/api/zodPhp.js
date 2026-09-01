import { z } from "zod"

/**
 * Ayudas de zod para la forma en que responde la API PHP.
 *
 * Existen porque los mismos tres errores se repitieron al escribir cada entidad:
 * los números llegan como cadena, los booleanos como `"1"`/`"0"`, y `z.coerce`
 * convierte `null` en `0` o en la cadena `"null"` en vez de conservarlo.
 */

/**
 * Un identificador: siempre cadena, aunque PHP lo mande como número.
 *
 * @returns {object} El esquema de zod.
 */
export const idPhp = () => z.coerce.string()

/**
 * Un número que puede llegar como cadena. MySQL devuelve los `DECIMAL` así.
 *
 * @param {number} [porOmision=0] Valor si el campo falta o no es numérico.
 * @returns {object} El esquema de zod.
 */
export const numeroPhp = (porOmision = 0) => z.coerce.number().catch(porOmision)

/**
 * Un booleano que llega como `"1"` o `"0"`.
 *
 * @returns {object} El esquema de zod.
 */
export const booleanoPhp = () =>
  z.coerce.number().catch(0).transform((n) => n === 1)

/**
 * Un campo que puede venir nulo, **conservando el nulo**.
 *
 * `z.coerce.number()` convierte `null` en `0` y `z.coerce.string()` en la cadena
 * `"null"`; ambas cosas cambian el significado del dato. Un `tipo_cambio` de 0 no
 * es "orden en pesos", y un `driver_id` de `"null"` acaba viajando así al backend.
 * Por eso el nullable va **antes** que la coacción en la unión.
 *
 * @param {object} esquema El esquema a aplicar cuando sí hay valor.
 * @returns {object} El esquema de zod, que devuelve `null` si no hay valor.
 */
export const nullable = (esquema) =>
  z
    .union([z.null(), z.undefined(), esquema])
    .transform((valor) => (valor === undefined ? null : valor))
    .catch(null)

/**
 * Una fecha de la que solo interesa el día.
 *
 * La API devuelve `"2026-08-31 00:00:00"` y las pantallas solo muestran la fecha.
 * Recortarla aquí evita el `fecha.split(' ')[0]` repartido por el JSX, que
 * revienta cuando la fecha viene nula.
 *
 * @returns {object} El esquema de zod.
 */
export const fechaDia = () =>
  z.string().catch("").transform((valor) => valor.split(" ")[0] ?? "")
