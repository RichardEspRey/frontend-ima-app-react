/**
 * Catálogo de permisos de IMA.
 *
 * Las claves son **exactamente** las que guarda `features.php` hoy. No se
 * renombran a `modulo.accion` todavía: son el formato de red, y cambiarlas
 * rompería la app móvil, que consume los mismos endpoints. El nombre nuevo vive
 * en la migración de base de datos (`docs/sql/`), para la fase 3.
 *
 * Lo que sí gana el frontend desde ya es que ningún componente vuelva a escribir
 * la cadena a mano: el día que cambien, se cambian aquí.
 *
 * @readonly
 * @enum {string}
 */
export const PERMISOS = {
  INICIO: "inicio",
  MAPA: "mapa",
  REPORTS: "reports",

  IMA_MANAGER: "ima_manager",
  IMA_DOCUMENTOS: "ima_documentos",
  IMA_CONDUCTORES: "ima_conductores",
  IMA_CAMIONES: "ima_camiones",
  IMA_CAJAS: "ima_cajas",

  GASTOS: "gastos",
  GASTOS_NUEVO: "gastos_nuevo",
  GASTOS_ADMIN_GENERAL: "gastos_admin_general",
  GASTOS_DIESEL: "gastos_diesel",
  GASTOS_VIAJES: "gastos_viajes",

  MANTENIMIENTOS: "mantenimientos",
  MANT_INSPECCION_FINAL: "mant_inspeccion_final",
  MANT_ORDENES_SERVICIO: "mant_ordenes_servicio",
  MANT_INVENTARIO: "mant_inventario",
  MANT_AUTONOMIAS: "mant_autonomias",
  MANT_AFINACIONES: "mant_afinaciones",

  VIAJES: "viajes",
  VIAJES_COTIZADOR: "viajes_cotizador",
  VIAJES_CREAR: "viajes_crear",
  VIAJES_ADMIN: "viajes_admin",
  VIAJES_TAB_PROGRAMACION: "viajes_tab_programacion",
  VIAJES_TAB_UPCOMING: "viajes_tab_upcoming",
  VIAJES_TAB_DESPACHO: "viajes_tab_despacho",
  VIAJES_TAB_EN_RUTA: "viajes_tab_en_ruta",
  VIAJES_TAB_COMPLETADOS: "viajes_tab_completados",
  VIAJES_VER_TODOS: "view_all_trips",
  VIAJES_INVOICES: "viajes_invoice_fields",

  SAFETY: "safety",
  SAFETY_GENERAL: "safety_general",
  SAFETY_IFTA: "safety_ifta",

  FINANZAS: "finanzas",
  FINANZAS_NOMINA: "finanzas_nomina",
  FINANZAS_PAGOS: "finanzas_pagos",
  FINANZAS_VENTAS: "finanzas_ventas",
  FINANZAS_MARGEN: "finanzas_margen",
}

/**
 * Los permisos agrupados por módulo, para las pantallas de administración y para
 * armar los paquetes de cada rol sin escribir 38 constantes a mano.
 *
 * @readonly
 * @enum {Array.<string>}
 */
export const MODULOS = {
  general: [PERMISOS.INICIO, PERMISOS.MAPA, PERMISOS.REPORTS],
  imaManager: [
    PERMISOS.IMA_MANAGER,
    PERMISOS.IMA_DOCUMENTOS,
    PERMISOS.IMA_CONDUCTORES,
    PERMISOS.IMA_CAMIONES,
    PERMISOS.IMA_CAJAS,
  ],
  gastos: [
    PERMISOS.GASTOS,
    PERMISOS.GASTOS_NUEVO,
    PERMISOS.GASTOS_ADMIN_GENERAL,
    PERMISOS.GASTOS_DIESEL,
    PERMISOS.GASTOS_VIAJES,
  ],
  mantenimientos: [
    PERMISOS.MANTENIMIENTOS,
    PERMISOS.MANT_INSPECCION_FINAL,
    PERMISOS.MANT_ORDENES_SERVICIO,
    PERMISOS.MANT_INVENTARIO,
    PERMISOS.MANT_AUTONOMIAS,
    PERMISOS.MANT_AFINACIONES,
  ],
  viajes: [
    PERMISOS.VIAJES,
    PERMISOS.VIAJES_COTIZADOR,
    PERMISOS.VIAJES_CREAR,
    PERMISOS.VIAJES_ADMIN,
    PERMISOS.VIAJES_TAB_PROGRAMACION,
    PERMISOS.VIAJES_TAB_UPCOMING,
    PERMISOS.VIAJES_TAB_DESPACHO,
    PERMISOS.VIAJES_TAB_EN_RUTA,
    PERMISOS.VIAJES_TAB_COMPLETADOS,
    PERMISOS.VIAJES_VER_TODOS,
    PERMISOS.VIAJES_INVOICES,
  ],
  safety: [PERMISOS.SAFETY, PERMISOS.SAFETY_GENERAL, PERMISOS.SAFETY_IFTA],
  finanzas: [
    PERMISOS.FINANZAS,
    PERMISOS.FINANZAS_NOMINA,
    PERMISOS.FINANZAS_PAGOS,
    PERMISOS.FINANZAS_VENTAS,
    PERMISOS.FINANZAS_MARGEN,
  ],
}

/**
 * Todos los permisos existentes, sin repetir.
 *
 * @type {Array.<string>}
 */
export const TODOS_LOS_PERMISOS = Object.values(PERMISOS)
