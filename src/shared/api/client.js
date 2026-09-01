import { API_BASE, TIMEOUT_PETICION_MS } from "../config/env"
import { ApiError, CAUSA_ERROR } from "./errors"

/**
 * Convierte un objeto plano en el `FormData` que espera la API PHP.
 *
 * Omite `undefined` y `null` en vez de mandarlos: `FormData` los serializa como
 * las cadenas `"undefined"` y `"null"`, y PHP las recibe como texto, que es de
 * donde salen los campos con el literal "undefined" guardado en la base.
 * Los booleanos van como `1`/`0`, que es lo que el backend interpreta.
 *
 * @param {string} op Operación a ejecutar, el campo `op` del POST.
 * @param {object} [payload] Campos adicionales.
 * @returns {FormData} El cuerpo listo para enviar.
 */
export function construirFormData(op, payload = {}) {
  const fd = new FormData()
  fd.append("op", op)

  for (const [clave, valor] of Object.entries(payload)) {
    if (valor === undefined || valor === null) continue
    if (valor instanceof File || valor instanceof Blob) {
      fd.append(clave, valor)
    } else if (typeof valor === "boolean") {
      fd.append(clave, valor ? "1" : "0")
    } else if (Array.isArray(valor) || typeof valor === "object") {
      fd.append(clave, JSON.stringify(valor))
    } else {
      fd.append(clave, String(valor))
    }
  }

  return fd
}

/**
 * Llama a una operación de la API de IMA.
 *
 * Concentra lo que hoy está repetido en 232 llamadas sueltas: armar el
 * `FormData`, poner el `op`, abortar por tiempo, y traducir la respuesta a un
 * valor o a un `ApiError`. La API contesta HTTP 200 aunque falle —el fallo va
 * en `{status:'error'}`— así que aquí es donde eso se convierte en excepción.
 *
 * @param {string} endpoint Valor de `ENDPOINTS`, por ejemplo `ENDPOINTS.personalAdmin`.
 * @param {string} op Operación, por ejemplo `getAll`.
 * @param {object} [payload] Campos del POST.
 * @param {object} [opciones] Ajustes de la petición.
 * @param {AbortSignal} [opciones.signal] Señal externa; se combina con el timeout.
 * @param {number} [opciones.timeoutMs] Sobrescribe el timeout por omisión.
 * @returns {Promise.<object>} El cuerpo de la respuesta ya parseado.
 * @throws {ApiError} Si falla la red, se agota el tiempo, el HTTP no es 2xx,
 *   el cuerpo no es JSON, o la API responde `status: 'error'`. Una cancelación
 *   desde fuera —cambiar de pantalla, `StrictMode`— llega con causa
 *   `CANCELADA`, no como tiempo agotado: son cosas distintas y confundirlas
 *   hacía que un cambio de pantalla se registrara como servidor lento.
 *
 * @example
 * const respuesta = await post(ENDPOINTS.personalAdmin, 'getAll')
 */
export async function post(endpoint, op, payload = {}, opciones = {}) {
  const { signal, timeoutMs = TIMEOUT_PETICION_MS } = opciones
  const control = new AbortController()
  const temporizador = setTimeout(() => control.abort(), timeoutMs)

  if (signal) {
    if (signal.aborted) control.abort()
    else signal.addEventListener("abort", () => control.abort(), { once: true })
  }

  const fallar = (mensaje, causa, detalle) =>
    new ApiError({ mensaje, causa, endpoint, op, detalle })

  let respuesta
  try {
    respuesta = await fetch(`${API_BASE}/${endpoint}`, {
      method: "POST",
      body: construirFormData(op, payload),
      signal: control.signal,
    })
  } catch (error) {
    if (signal?.aborted) {
      throw fallar("La operación se canceló.", CAUSA_ERROR.CANCELADA, error)
    }
    if (control.signal.aborted) {
      throw fallar(
        "La operación tardó demasiado. Revisa tu conexión e inténtalo de nuevo.",
        CAUSA_ERROR.TIEMPO_AGOTADO,
        error,
      )
    }
    throw fallar(
      "No se pudo conectar con el servidor.",
      CAUSA_ERROR.RED,
      error,
    )
  } finally {
    clearTimeout(temporizador)
  }

  if (!respuesta.ok) {
    throw fallar(
      `El servidor respondió con un error (${respuesta.status}).`,
      CAUSA_ERROR.HTTP,
      respuesta.status,
    )
  }

  const texto = await respuesta.text()
  let cuerpo
  try {
    cuerpo = JSON.parse(texto)
  } catch {
    throw fallar(
      "El servidor devolvió una respuesta que no se pudo interpretar.",
      CAUSA_ERROR.RESPUESTA_INVALIDA,
      texto.slice(0, 500),
    )
  }

  if (cuerpo?.status === "error" || cuerpo?.status === "fail") {
    throw fallar(
      cuerpo.message || "La operación no se pudo completar.",
      CAUSA_ERROR.NEGOCIO,
      cuerpo,
    )
  }

  return cuerpo
}

/**
 * Igual que {@link post}, pero devuelve directo el arreglo del campo indicado.
 *
 * Casi todas las pantallas hacen lo mismo con la respuesta: comprobar el status
 * y quedarse con una lista. Cuando la API responde bien pero sin esa clave,
 * devuelve `[]` en vez de `undefined`, que es el origen de la mitad de los
 * "cannot read properties of undefined" del proyecto.
 *
 * @param {string} endpoint Valor de `ENDPOINTS`.
 * @param {string} op Operación.
 * @param {object} [opciones] Ajustes de la petición.
 * @param {string} [opciones.campo='data'] Clave del arreglo dentro de la respuesta.
 * @param {object} [opciones.payload] Campos del POST.
 * @param {AbortSignal} [opciones.signal] Señal de cancelación.
 * @param {number} [opciones.timeoutMs] Sobrescribe el timeout por omisión.
 * @returns {Promise.<Array>} La lista, o `[]` si la clave no vino.
 * @throws {ApiError} Lo mismo que {@link post}.
 */
export async function postLista(endpoint, op, opciones = {}) {
  const { campo = "data", payload, signal, timeoutMs } = opciones
  const cuerpo = await post(endpoint, op, payload, { signal, timeoutMs })
  const lista = cuerpo?.[campo]
  return Array.isArray(lista) ? lista : []
}
