import { notify } from "../ui/notify"
import { GRUPOS_ARCHIVO, validarArchivos } from "./archivos"

/**
 * Toma los archivos de un `<input type="file">`, los valida y avisa de los malos.
 *
 * Existe porque las 16 subidas de la app hacen hoy lo mismo —`e.target.files`
 * directo al estado— y ninguna comprueba nada. Concentrarlo aquí evita repetir
 * la validación en cada pantalla y, sobre todo, evita olvidarla en la siguiente.
 *
 * Limpia el valor del input al terminar: sin eso, volver a elegir el mismo
 * archivo después de un rechazo no dispara `change` y parece que la app se colgó.
 *
 * @param {Event} evento El `change` del input.
 * @param {object} [opciones] Ajustes.
 * @param {Array.<string>} [opciones.grupo] Tipos aceptados; por omisión, documento.
 * @param {number} [opciones.maximoBytes] Tamaño máximo por archivo.
 * @param {boolean} [opciones.avisar=true] Si muestra el aviso de los rechazados.
 * @returns {Promise.<Array.<File>>} Solo los archivos que pasaron.
 *
 * @example
 * onChange={async (e) => setFiles(await archivosDelEvento(e, { grupo: GRUPOS_ARCHIVO.SOLO_PDF }))}
 */
export async function archivosDelEvento(evento, opciones = {}) {
  const { avisar = true, ...resto } = opciones
  const entrada = evento?.target
  const elegidos = [...(entrada?.files ?? [])]

  if (elegidos.length === 0) return []

  const { aceptados, rechazados } = await validarArchivos(elegidos, {
    grupo: resto.grupo ?? GRUPOS_ARCHIVO.DOCUMENTO,
    ...resto,
  })

  if (entrada) entrada.value = ""

  if (avisar && rechazados.length > 0) {
    const detalle = rechazados
      .map(({ archivo, motivo }) => `${archivo.name}: ${motivo}`)
      .join("\n")
    notify.error(
      rechazados.length === 1
        ? detalle
        : `No se pudieron usar ${rechazados.length} archivos.\n\n${detalle}`,
    )
  }

  return aceptados
}

/**
 * Igual que {@link archivosDelEvento}, para los inputs de un solo archivo.
 *
 * @param {Event} evento El `change` del input.
 * @param {object} [opciones] Los mismos que {@link archivosDelEvento}.
 * @returns {Promise.<(File|null)>} El archivo si pasó, o `null`.
 *
 * @example
 * onChange={async (e) => { const f = await archivoDelEvento(e); if (f) onArchivo(f) }}
 */
export async function archivoDelEvento(evento, opciones = {}) {
  const [archivo] = await archivosDelEvento(evento, opciones)
  return archivo ?? null
}
