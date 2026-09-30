import { useCallback, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"

/**
 * Vuelve a pedir todo lo que la pantalla tiene a la vista.
 *
 * Refresca las consultas **activas**, que son justo las de los componentes
 * montados: la tabla y los catálogos que la acompañan. No hace falta enumerar
 * llaves ni mantener una lista por pantalla, así que una pantalla que mañana
 * pida un dato más lo refresca sin tocar esto.
 *
 * Existe porque el operador sube cosas desde la app móvil —documentos de etapa,
 * salidas, tickets de gasto y diesel— contra la misma API, y el escritorio solo
 * las pedía al montar la pantalla.
 *
 * El estado de avance es local y no `useIsFetching`: así el botón solo se
 * bloquea por el refresco que él mismo disparó, y no cada vez que una consulta
 * de fondo —el tablero de cajas, la campana— sale a la red por su cuenta.
 *
 * @returns {{actualizar: Function, actualizando: boolean}} La acción y si está en curso.
 *
 * @example
 * const { actualizar, actualizando } = useActualizarPantalla()
 * <BotonActualizar onActualizar={actualizar} actualizando={actualizando} />
 */
export function useActualizarPantalla() {
  const cliente = useQueryClient()
  const [actualizando, setActualizando] = useState(false)

  const actualizar = useCallback(async () => {
    setActualizando(true)
    try {
      await cliente.refetchQueries({ type: "active" })
    } finally {
      setActualizando(false)
    }
  }, [cliente])

  return { actualizar, actualizando }
}
