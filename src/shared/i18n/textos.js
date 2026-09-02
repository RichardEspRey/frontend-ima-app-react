import { IDIOMA } from "./idiomas"

/**
 * El catálogo de textos de la interfaz, por idioma.
 *
 * **Las claves describen el concepto, no el texto.** `tabla.trip` y no
 * `tabla.tripNumero`: si mañana la columna se llama distinto, cambia el valor y
 * no la clave, así que no hay que tocar las pantallas.
 *
 * La regla de vocabulario que decidió el equipo —los sustantivos del oficio en
 * inglés, el resto en español— vive en `../lib/terminos.js` y es la que explica
 * por qué `tabla.trip` y `tabla.driver` dicen lo mismo en los dos idiomas: en
 * español también se dice «Trip» y «Driver» al hablar de esto.
 *
 * Se agrupa por área con un prefijo. No es decoración: permite ver de un
 * vistazo qué le falta a un idioma, y evita que dos pantallas se peleen por la
 * clave `titulo`.
 *
 * @readonly
 */
export const TEXTOS = {
  [IDIOMA.ES]: {
    // Cabeceras y controles de tabla
    "tabla.trip": "Trip #",
    "tabla.driver": "Driver",
    "tabla.drivers": "Driver(s)",
    "tabla.camion": "Camión",
    "tabla.caja": "Caja",
    "tabla.etapas": "Etapas",
    "tabla.estatus": "Estatus",
    "tabla.acciones": "Acciones",
    "tabla.fecha": "Fecha",
    "tabla.documentos": "Documentos",
    "tabla.total": "Total",
    "tabla.tarifa": "Total Tarifa",
    "tabla.pagado": "Total Pagado",
    "tabla.filasPorPagina": "Filas por página",
    "tabla.de": "de",
    "tabla.sinRegistros": "No hay registros.",

    // Acciones que se repiten en toda la app
    "accion.guardar": "Guardar",
    "accion.cancelar": "Cancelar",
    "accion.cerrar": "Cerrar",
    "accion.eliminar": "Eliminar",
    "accion.editar": "Editar",
    "accion.ver": "Ver",
    "accion.subir": "Subir",
    "accion.refrescar": "Refrescar",
    "accion.reintentar": "Reintentar",
    "accion.buscar": "Buscar",
    "accion.limpiarFiltros": "Limpiar Filtros",
    "accion.mostrarFiltros": "Mostrar Filtros",
    "accion.ocultarFiltros": "Ocultar Filtros",

    // Estados de la interfaz
    "estado.cargando": "Cargando…",
    "estado.cargandoPantalla": "Cargando la pantalla…",
    "estado.sinDatos": "No hay nada que mostrar.",
    "estado.errorTitulo": "Algo salió mal",
    "estado.errorPantalla": "Esta pantalla no se pudo mostrar",
    "estado.verDetalle": "Ver detalle técnico",
    "estado.ocultarDetalle": "Ocultar detalle",

    // El menú
    "menu.inicio": "Inicio",
    "menu.mapa": "Mapa",
    "menu.reports": "Reports",
    "menu.imaManager": "IMA Manager",
    "menu.gastos": "Gastos",
    "menu.mantenimientos": "Mantenimientos",
    "menu.viajes": "Viajes",
    "menu.safety": "Safety",
    "menu.finanzas": "Finanzas",
    "menu.accesos": "Gestor de Acceso",
    "menu.cerrarSesion": "Cerrar Sesión",

    // La cabecera
    "header.idioma": "Idioma",
  },

  [IDIOMA.EN]: {
    "tabla.trip": "Trip #",
    "tabla.driver": "Driver",
    "tabla.drivers": "Driver(s)",
    "tabla.camion": "Truck",
    "tabla.caja": "Trailer",
    "tabla.etapas": "Stages",
    "tabla.estatus": "Status",
    "tabla.acciones": "Actions",
    "tabla.fecha": "Date",
    "tabla.documentos": "Documents",
    "tabla.total": "Total",
    "tabla.tarifa": "Total Rate",
    "tabla.pagado": "Total Paid",
    "tabla.filasPorPagina": "Rows per page",
    "tabla.de": "of",
    "tabla.sinRegistros": "No records.",

    "accion.guardar": "Save",
    "accion.cancelar": "Cancel",
    "accion.cerrar": "Close",
    "accion.eliminar": "Delete",
    "accion.editar": "Edit",
    "accion.ver": "View",
    "accion.subir": "Upload",
    "accion.refrescar": "Refresh",
    "accion.reintentar": "Retry",
    "accion.buscar": "Search",
    "accion.limpiarFiltros": "Clear filters",
    "accion.mostrarFiltros": "Show filters",
    "accion.ocultarFiltros": "Hide filters",

    "estado.cargando": "Loading…",
    "estado.cargandoPantalla": "Loading the screen…",
    "estado.sinDatos": "Nothing to show.",
    "estado.errorTitulo": "Something went wrong",
    "estado.errorPantalla": "This screen could not be displayed",
    "estado.verDetalle": "Show technical detail",
    "estado.ocultarDetalle": "Hide detail",

    "menu.inicio": "Home",
    "menu.mapa": "Map",
    "menu.reports": "Reports",
    "menu.imaManager": "IMA Manager",
    "menu.gastos": "Expenses",
    "menu.mantenimientos": "Maintenance",
    "menu.viajes": "Trips",
    "menu.safety": "Safety",
    "menu.finanzas": "Finance",
    "menu.accesos": "Access Manager",
    "menu.cerrarSesion": "Sign out",

    "header.idioma": "Language",
  },
}

/**
 * Las claves que le faltan a un idioma respecto del español.
 *
 * El español es la referencia porque es el idioma en que se escribe primero.
 * Esto no corre en producción: lo usa la prueba que impide que un catálogo se
 * quede atrás del otro, que es lo que produce esas pantallas mitad traducidas
 * que se ven en tantas aplicaciones.
 *
 * @param {string} idioma El idioma a revisar.
 * @returns {Array.<string>} Las claves ausentes.
 */
export function clavesFaltantes(idioma) {
  const referencia = Object.keys(TEXTOS[IDIOMA.ES])
  const propias = new Set(Object.keys(TEXTOS[idioma] ?? {}))
  return referencia.filter((clave) => !propias.has(clave))
}
