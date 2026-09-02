/**
 * La paleta de la aplicación.
 *
 * Son los colores que ya usaban el Administrador de viajes y el Expense Manager,
 * que es el aspecto que el equipo quiere en toda la app. Estaban escritos a mano
 * en 1 212 lugares; aquí quedan con nombre para que el siguiente no tenga que
 * copiarlos de otra pantalla y para que un cambio de paleta sea un solo archivo.
 *
 * La escala va de más oscuro a más claro, como en las escalas de grises de
 * cualquier sistema de diseño: `TINTA` es el texto principal y el color de
 * marca; `LIENZO` es el fondo de la pantalla.
 *
 * @readonly
 */
export const COLOR = {
  TINTA: "#0f172a",
  TINTA_CLARA: "#1e293b",
  TEXTO: "#334155",
  TEXTO_SUAVE: "#475569",
  APAGADO: "#64748b",
  TENUE: "#94a3b8",
  BORDE_FUERTE: "#cbd5e1",
  BORDE: "#e2e8f0",
  RELLENO: "#f1f5f9",
  LIENZO: "#f8fafc",
  CABECERA: "#fafbfc",
  BLANCO: "#ffffff",

  EXITO: "#15803d",
  EXITO_FONDO: "#f0fdf4",
  EXITO_BORDE: "#bbf7d0",

  PELIGRO: "#b91c1c",
  PELIGRO_FONDO: "#fef2f2",
  PELIGRO_BORDE: "#fecaca",

  AVISO: "#b45309",
  AVISO_FONDO: "#fffbeb",
  AVISO_BORDE: "#fde68a",

  INFO: "#1d4ed8",
  INFO_FONDO: "#eff6ff",
  INFO_BORDE: "#bfdbfe",
}

/**
 * El azul de la barra lateral, que es la identidad de la aplicación.
 *
 * No se unifica con la paleta de contenido a propósito: una navegación de color
 * sobre un lienzo neutro es una decisión de diseño, no un descuido. Lo que sí se
 * unifica es que haya **un** azul de cada cosa. Antes había dos colores de
 * hover que se diferenciaban en un dígito —`#4F5DDA` y `#4f5bda`—, así que el
 * menú cambiaba de tono según por dónde se pasara el ratón.
 *
 * @readonly
 */
export const MARCA = {
  AZUL: "#3c48e1",
  AZUL_HOVER: "#4f5bda",
  AZUL_ACTIVO: "#2b36a0",
  AZUL_PROFUNDO: "#001f4d",
}

/**
 * Tintes para categorías: cuando el color es información y no decoración.
 *
 * Un chip de "Refacciones" y uno de "Consumibles" tienen que distinguirse a
 * simple vista; unificarlos al color de marca borraría el dato. Lo que sí se
 * unifica es la *forma* del tinte —fondo muy claro, texto oscuro, borde
 * intermedio y un acento— para que todas las categorías de la app se construyan
 * igual, sin importar la pantalla.
 *
 * @readonly
 */
export const TINTE = {
  INDIGO: { fondo: "#eef2ff", texto: "#4338ca", borde: "#e0e7ff", acento: "#6366f1" },
  TEAL: { fondo: "#f0fdfa", texto: "#0f766e", borde: "#99f6e4", acento: "#14b8a6" },
  VIOLETA: { fondo: "#f5f3ff", texto: "#6d28d9", borde: "#ddd6fe", acento: "#8b5cf6" },
  AMBAR: { fondo: "#fffbeb", texto: "#b45309", borde: "#fde68a", acento: "#f59e0b" },
}

/**
 * Radios de borde, en píxeles.
 *
 * MUI multiplica su `shape.borderRadius` por el factor que se le pase a `sx`,
 * así que estos valores son los que corresponden a `borderRadius: 1, 2, 2.5, 3`.
 *
 * @readonly
 * @enum {number}
 */
export const RADIO = {
  CHICO: 4,
  NORMAL: 8,
  PILDORA: 10,
  GRANDE: 12,
}

/**
 * Las sombras que usa la app.
 *
 * Son deliberadamente pocas: el lenguaje visual de las pantallas de referencia
 * separa las cosas con bordes de 1 px, no con sombras. La única sombra fuerte
 * es la del botón principal al pasar el ratón.
 *
 * @readonly
 * @enum {string}
 */
export const SOMBRA = {
  NINGUNA: "none",
  TARJETA: "0 1px 2px rgba(15, 23, 42, 0.04)",
  FLOTANTE: "0 6px 16px rgba(15, 23, 42, 0.22)",
  MENU: "0 8px 24px rgba(15, 23, 42, 0.12)",
}

/**
 * Los valores de tipografía que se repiten fuera de las variantes de MUI.
 *
 * @readonly
 */
export const TIPO = {
  FAMILIA: '"Roboto", "Segoe UI", Arial, sans-serif',
  ETIQUETA: {
    fontSize: "0.68rem",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  CABECERA_TABLA: {
    fontSize: "0.7rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
  },
}

/**
 * El borde estándar de un contenedor: 1 px del color de borde.
 *
 * @readonly
 * @type {string}
 */
export const BORDE = `1px solid ${COLOR.BORDE}`

/**
 * El relleno de una pantalla, que cambia con el ancho.
 *
 * @readonly
 */
export const RELLENO_PANTALLA = { xs: 2, md: 4 }
