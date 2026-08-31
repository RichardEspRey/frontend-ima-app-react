const HOST_API = import.meta.env.VITE_API_HOST

if (!HOST_API) {
  throw new Error(
    "Falta VITE_API_HOST. Copia .env.example a .env y apunta el host de la API.",
  )
}

/**
 * URL base de la API PHP, sin barra final.
 *
 * Es el único punto del proyecto que lee `VITE_API_HOST`. Cuando el hosting
 * tenga TLS funcionando, cambiar a `https://` se hace aquí y en `.env`,
 * no en las 96 pantallas que antes lo leían por su cuenta.
 *
 * @type {string}
 */
export const API_BASE = HOST_API.trim().replace(/\/+$/, "")

/**
 * Milisegundos que espera una petición antes de abortarse.
 * @type {number}
 */
export const TIMEOUT_PETICION_MS = 20000
