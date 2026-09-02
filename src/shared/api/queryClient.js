import { QueryCache, QueryClient } from "@tanstack/react-query"
import { ApiError } from "./errors"

/**
 * Decide si TanStack Query debe reintentar una consulta fallida.
 *
 * Solo se reintenta lo que puede arreglarse solo —red caída, tiempo agotado—.
 * Un error de negocio ("ese empleado ya existe") daría el mismo resultado tres
 * veces y solo retrasaría el mensaje.
 *
 * @param {number} intentosPrevios Cuántas veces ya se reintentó.
 * @param {*} error El error que lanzó la consulta.
 * @returns {boolean} `true` si debe reintentarse.
 */
export function debeReintentar(intentosPrevios, error) {
  if (intentosPrevios >= 2) return false
  return error instanceof ApiError ? error.esReintentable : false
}

/**
 * Bajo test, la caché se recolecta de inmediato y no se reintenta nada.
 *
 * El smoke test monta las 61 rutas en la misma sesión; sin esto, la caché de una
 * ruta sobrevive a la siguiente y los tests dependen del orden en que corren.
 * Los reintentos tampoco aportan nada cuando `fetch` está simulado.
 *
 * @type {boolean}
 */
const EN_PRUEBAS = import.meta.env?.MODE === "test"

/**
 * Crea el cliente de TanStack Query con la configuración del proyecto.
 *
 * Se crea con una función y no como constante de módulo para que cada test
 * pueda tener el suyo: una caché compartida entre tests los vuelve dependientes
 * del orden en que corren.
 *
 * @param {object} [opciones] Ajustes del cliente.
 * @param {Function} [opciones.alFallar] Qué hacer cuando una consulta falla y
 *   nadie más lo atrapó. Se inyecta para no acoplar la capa de API a la de UI, y
 *   para que las pruebas puedan comprobar que se llama.
 * @returns {object} Cliente de TanStack Query listo para el provider.
 */
export function crearQueryClient({ alFallar } = {}) {
  return new QueryClient({
    // Ninguna consulta debe fallar en silencio. Una pantalla que no mira su
    // `error` deja a la persona ante una tabla vacía sin saber si no hay datos o
    // si la petición se cayó, que son cosas muy distintas. Esto no sustituye al
    // estado de error de la pantalla: es la red por debajo, para lo que nadie
    // atrapó. Las cancelaciones no cuentan: cambiar de pantalla no es un fallo.
    queryCache: new QueryCache({
      onError: (error) => {
        if (error instanceof ApiError && error.fueCancelada) return
        console.error("Consulta fallida:", error)
        alFallar?.(error)
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: EN_PRUEBAS ? 0 : 5 * 60 * 1000,
        gcTime: EN_PRUEBAS ? 0 : 10 * 60 * 1000,
        retry: EN_PRUEBAS ? false : debeReintentar,
        retryDelay: (intento) => Math.min(1000 * 2 ** intento, 8000),
        refetchOnWindowFocus: false,
        placeholderData: (anterior) => anterior,
      },
      mutations: {
        retry: false,
      },
    },
  })
}

/**
 * Tiempo que un catálogo se considera fresco. Conductores, camiones, cajas y
 * almacenes cambian de vez en cuando, no dentro de una sesión de trabajo: no
 * tiene sentido volver a pedirlos en cada pantalla que los use.
 *
 * @type {number}
 */
export const FRESCURA_CATALOGO_MS = 30 * 60 * 1000
