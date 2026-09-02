/**
 * El vocabulario de la aplicación: una palabra por concepto.
 *
 * Existe porque la interfaz estaba **mezclada en dos idiomas dentro de la misma
 * pantalla**: la misma columna decía `Driver` en una tabla y `Conductor` en
 * otra, `Status` aquí y `Estatus` allá, `Trip #` junto a `Total Pagado`.
 *
 * La regla que decidió el equipo, y que este archivo aplica:
 *
 * > **Los sustantivos del oficio van en inglés; todo lo demás en español.**
 *
 * `Trip` y `Driver` se quedan en inglés porque es como se habla en el
 * transporte de carga en la frontera —«el trip 199», «el driver»— y porque es
 * como los nombra el backend. Traducirlos haría que la pantalla dejara de
 * coincidir con la conversación. El resto de la interfaz va en español, que es
 * el idioma en que se trabaja.
 *
 * **Este archivo es también la semilla del catálogo de traducción.** Cuando
 * llegue el botón de idioma, estas claves son las que tendrán una versión en
 * cada idioma; por eso las claves describen el **concepto** y no el texto.
 *
 * @readonly
 * @enum {string}
 */
export const TERMINO = {
  TRIP: "Trip #",
  TRIP_LARGO: "Trip Number",
  DRIVER: "Driver",
  DRIVERS: "Driver(s)",

  CAMION: "Camión",
  CAJA: "Caja",
  ETAPAS: "Etapas",
  ESTATUS: "Estatus",
  ACCIONES: "Acciones",
  FECHA: "Fecha",
  TOTAL_TARIFA: "Total Tarifa",
  TOTAL_PAGADO: "Total Pagado",
  DOCUMENTOS: "Documentos",
  FILAS_POR_PAGINA: "Filas por página",
}

/**
 * «Estado» geográfico, que **no** es lo mismo que el estatus de un viaje.
 *
 * Se declara aparte a propósito. En IFTA, «Estado» significa entidad federativa
 * —Texas, Oklahoma— y en el resto de la app significaría la situación de un
 * registro. Por eso el estatus se llama `Estatus`: para que esta palabra
 * conserve un solo significado.
 *
 * @readonly
 * @type {string}
 */
export const ESTADO_GEOGRAFICO = "Estado"
