import { createContext, useCallback, useContext, useMemo, useState } from "react"
import {
  CLAVE_ALMACEN,
  IDIOMA_POR_OMISION,
  esIdiomaValido,
} from "./idiomas"
import { TEXTOS } from "./textos"

/**
 * Lo que se usa cuando nadie montó el proveedor.
 *
 * No se deja en `null` para que `useIdioma` no lance: un componente de
 * `shared/ui` tiene que poder montarse solo —en una prueba, en un catálogo de
 * componentes— sin arrastrar el árbol de proveedores de la aplicación. Sin
 * proveedor la app habla español y el botón no hace nada, que es un fallo
 * imposible de no ver, no uno silencioso.
 *
 * @readonly
 */
const SIN_PROVEEDOR = {
  idioma: IDIOMA_POR_OMISION,
  cambiarIdioma: () => {},
  textos: TEXTOS[IDIOMA_POR_OMISION],
}

const IdiomaContext = createContext(SIN_PROVEEDOR)

/**
 * Lee la preferencia guardada, si la hay y si es válida.
 *
 * No confía en lo que venga del almacenamiento: cualquiera puede editarlo desde
 * las herramientas del navegador, y puede traer un valor de una versión
 * anterior de la app. Un idioma desconocido dejaría la interfaz sin textos.
 *
 * @returns {string} El idioma guardado, o el de omisión.
 */
function leerPreferencia() {
  try {
    const guardado = window.localStorage.getItem(CLAVE_ALMACEN)
    return esIdiomaValido(guardado) ? guardado : IDIOMA_POR_OMISION
  } catch {
    // Un navegador con el almacenamiento bloqueado lanza al leer. No es motivo
    // para dejar la app sin idioma.
    return IDIOMA_POR_OMISION
  }
}

/**
 * Pone el idioma al alcance de toda la aplicación.
 *
 * **Sobre el rendimiento**, que es la duda razonable con cualquier sistema de
 * traducción: buscar un texto es leer una clave de un objeto, así que el costo
 * por texto es despreciable frente a lo que ya hace React en el mismo pintado.
 *
 * Lo que sí cuesta es **cambiar** de idioma, porque hay que repintar lo que está
 * en pantalla. Eso ocurre una vez, cuando alguien pulsa el botón, y es
 * exactamente lo que se le pidió a la app.
 *
 * Por eso el valor del contexto va memorizado: si se recreara en cada pintado,
 * repintaría toda la aplicación **también cuando el idioma no cambia**, que es
 * el error que convierte un sistema de traducción en un problema de
 * rendimiento. Aquí solo cambia cuando cambia el idioma.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.children El árbol de la aplicación.
 * @returns {object} El árbol con el idioma disponible.
 */
export function IdiomaProvider({ children }) {
  const [idioma, setIdioma] = useState(leerPreferencia)

  const cambiarIdioma = useCallback((nuevo) => {
    if (!esIdiomaValido(nuevo)) return
    setIdioma(nuevo)
    try {
      window.localStorage.setItem(CLAVE_ALMACEN, nuevo)
    } catch {
      // Si no se puede guardar, el idioma sigue funcionando en esta sesión.
      // Perder la preferencia es peor que nada, pero mucho mejor que reventar.
    }
  }, [])

  const valor = useMemo(
    () => ({ idioma, cambiarIdioma, textos: TEXTOS[idioma] }),
    [idioma, cambiarIdioma],
  )

  return <IdiomaContext.Provider value={valor}>{children}</IdiomaContext.Provider>
}

/**
 * Da la función que traduce y el idioma actual.
 *
 * Cuando una clave no existe **devuelve la clave misma**, no una cadena vacía.
 * Un hueco en blanco esconde el problema; ver `tabla.trip` en la pantalla lo
 * delata de inmediato y dice exactamente qué falta.
 *
 * @returns {{t: Function, idioma: string, cambiarIdioma: Function}} La traducción y el idioma.
 *
 * @example
 * const { t } = useIdioma()
 * <TableCell>{t("tabla.driver")}</TableCell>
 */
export function useIdioma() {
  const { idioma, cambiarIdioma, textos } = useContext(IdiomaContext)
  const t = useCallback((clave) => textos[clave] ?? clave, [textos])

  return { t, idioma, cambiarIdioma }
}
