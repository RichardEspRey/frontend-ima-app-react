import { useMemo, useState } from "react"
import { Box, TablePagination } from "@mui/material"
import { PAGINATION_BOX_SX, PAGINATION_SX } from "./estilos"

/**
 * Opciones de tamaño de página que se ofrecen por omisión.
 *
 * @readonly
 * @type {Array.<number>}
 */
export const TAMANOS_PAGINA = [25, 50, 100]

/**
 * Lleva la paginación de una lista: página actual, tamaño y el trozo visible.
 *
 * Existe porque catorce pantallas repetían las mismas cuatro cosas —dos estados,
 * un `slice` y dos manejadores— y ninguna las repetía exactamente igual. Ese
 * copiado es también el que deja tablas **sin paginar**: si hay que escribirlo
 * a mano cada vez, alguna se queda sin él y pinta las 471 filas en el DOM.
 *
 * Corrige además un fallo que estaba en varias copias: al filtrar, la página
 * actual podía quedar más allá del final —te quedabas mirando una tabla vacía
 * con datos que sí existían—. Aquí la página se acota siempre al último trozo
 * que de verdad tiene filas.
 *
 * No pagina en el servidor: recorta en memoria, que es lo que necesitan estas
 * pantallas porque ya traen todo el conjunto.
 *
 * @param {Array} filas La lista completa, ya filtrada y ordenada.
 * @param {object} [opciones] Ajustes.
 * @param {number} [opciones.porPagina=25] Tamaño inicial de página.
 * @returns {{visibles: Array, pagina: number, porPagina: number, total: number,
 *   irAPagina: Function, cambiarPorPagina: Function, props: object}} El estado y
 *   los manejadores; `props` se le pasa tal cual a {@link Paginacion}.
 *
 * @example
 * const { visibles, props } = usePaginacion(filtrados)
 * return <>{visibles.map(...)}<Paginacion {...props} /></>
 */
export function usePaginacion(filas = [], { porPagina: inicial = 25 } = {}) {
  const [pagina, setPagina] = useState(0)
  const [porPagina, setPorPagina] = useState(inicial)

  const total = filas.length
  const ultimaPagina = Math.max(0, Math.ceil(total / porPagina) - 1)
  const paginaSegura = Math.min(pagina, ultimaPagina)

  const visibles = useMemo(
    () => filas.slice(paginaSegura * porPagina, paginaSegura * porPagina + porPagina),
    [filas, paginaSegura, porPagina],
  )

  const cambiarPorPagina = (cuantas) => {
    setPorPagina(cuantas)
    setPagina(0)
  }

  return {
    visibles,
    pagina: paginaSegura,
    porPagina,
    total,
    irAPagina: setPagina,
    cambiarPorPagina,
    props: {
      pagina: paginaSegura,
      porPagina,
      total,
      onPagina: setPagina,
      onPorPagina: cambiarPorPagina,
    },
  }
}

/**
 * El pie de paginación, con el aspecto y los textos del sistema.
 *
 * Va aparte del hook a propósito: hay tablas que llevan su paginación en otro
 * sitio de la pantalla, y forzarla a vivir pegada al hook las dejaría fuera.
 *
 * @param {object} props Propiedades del componente.
 * @param {number} props.pagina Página actual, empezando en cero.
 * @param {number} props.porPagina Cuántas filas por página.
 * @param {number} props.total Cuántas filas hay en total.
 * @param {Function} props.onPagina `(nuevaPagina) => void`.
 * @param {Function} props.onPorPagina `(cuantas) => void`.
 * @param {Array.<number>} [props.tamanos] Opciones de tamaño de página.
 * @returns {object} El pie renderizado.
 *
 * @example
 * <Paginacion {...props} />
 */
export function Paginacion({
  pagina,
  porPagina,
  total,
  onPagina,
  onPorPagina,
  tamanos = TAMANOS_PAGINA,
}) {
  return (
    <Box sx={PAGINATION_BOX_SX}>
      <TablePagination
        component="div"
        count={total}
        page={pagina}
        rowsPerPage={porPagina}
        onPageChange={(_evento, nueva) => onPagina(nueva)}
        onRowsPerPageChange={(evento) => onPorPagina(Number(evento.target.value))}
        rowsPerPageOptions={tamanos}
        labelRowsPerPage="Filas por página"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
        sx={PAGINATION_SX}
      />
    </Box>
  )
}
