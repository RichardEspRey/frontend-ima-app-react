import { MODULOS, PERMISOS, TODOS_LOS_PERMISOS } from "./permisos"

/**
 * Catálogo canónico de roles.
 *
 * Sale de los valores que existen de verdad en `Users_credentials.type`
 * (`Admin` 3, `Administrativo` 12, `Driver` 16 al 2026-08-31), con los nombres
 * que se acordaron: `Admin` pasa a **Administrador** y `Driver` a **Operador**.
 * `Administrativo` se subdivide en roles por área.
 *
 * @readonly
 * @enum {string}
 */
export const ROLES = {
  ADMINISTRADOR: "administrador",
  OPERACIONES: "operaciones",
  FINANZAS: "finanzas",
  MANTENIMIENTO: "mantenimiento",
  SAFETY: "safety",
  ADMINISTRATIVO: "administrativo",
  OPERADOR: "operador",
  CONSULTA: "consulta",
}

/**
 * Nombre de cada rol tal como se le muestra a una persona.
 *
 * @readonly
 * @enum {string}
 */
export const NOMBRE_ROL = {
  [ROLES.ADMINISTRADOR]: "Administrador",
  [ROLES.OPERACIONES]: "Operaciones",
  [ROLES.FINANZAS]: "Finanzas",
  [ROLES.MANTENIMIENTO]: "Mantenimiento",
  [ROLES.SAFETY]: "Safety",
  [ROLES.ADMINISTRATIVO]: "Administrativo",
  [ROLES.OPERADOR]: "Operador",
  [ROLES.CONSULTA]: "Consulta",
}

/**
 * Permisos que trae cada rol de fábrica.
 *
 * Es el **paquete de arranque**, no la última palabra: encima siguen mandando
 * los permisos por usuario de `features.php`, que pueden conceder o quitar casos
 * puntuales. Sirve para no tener que palomear 38 casillas cada vez que entra
 * alguien nuevo, que es lo que pasa hoy.
 *
 * `ADMINISTRATIVO` existe a propósito con el paquete mínimo: es el destino del
 * `Administrativo` actual mientras no se decida en qué área cae cada persona.
 * Nadie pierde accesos al migrar porque sus flags individuales siguen mandando.
 *
 * @readonly
 * @enum {Array.<string>}
 */
export const PERMISOS_POR_ROL = {
  [ROLES.ADMINISTRADOR]: TODOS_LOS_PERMISOS,

  [ROLES.OPERACIONES]: [
    ...MODULOS.general,
    ...MODULOS.viajes,
    ...MODULOS.imaManager,
    PERMISOS.GASTOS,
    PERMISOS.GASTOS_VIAJES,
  ],

  [ROLES.FINANZAS]: [
    ...MODULOS.general,
    ...MODULOS.finanzas,
    ...MODULOS.gastos,
    PERMISOS.VIAJES,
    PERMISOS.VIAJES_ADMIN,
    PERMISOS.VIAJES_INVOICES,
  ],

  [ROLES.MANTENIMIENTO]: [
    ...MODULOS.general,
    ...MODULOS.mantenimientos,
    PERMISOS.IMA_MANAGER,
    PERMISOS.IMA_CAMIONES,
    PERMISOS.IMA_CAJAS,
    PERMISOS.GASTOS,
    PERMISOS.GASTOS_DIESEL,
  ],

  [ROLES.SAFETY]: [
    ...MODULOS.general,
    ...MODULOS.safety,
    PERMISOS.IMA_MANAGER,
    PERMISOS.IMA_CONDUCTORES,
    PERMISOS.IMA_DOCUMENTOS,
  ],

  [ROLES.ADMINISTRATIVO]: [PERMISOS.INICIO],

  [ROLES.OPERADOR]: [],

  [ROLES.CONSULTA]: [PERMISOS.INICIO],
}

/**
 * Roles que ven toda la aplicación sin pasar por la comprobación de permisos.
 *
 * Es deliberadamente un solo rol. Sustituye los cinco `ADMIN_TYPES` sueltos que
 * hoy están declarados por separado en `useAuthStore`, `Sidebar`, `AccessManager`,
 * `AdminGastos` y `AdminOrdenesServicio`.
 *
 * @type {Set.<string>}
 */
export const ROLES_TOTALES = new Set([ROLES.ADMINISTRADOR])

/**
 * Traduce el valor crudo de `Users_credentials.type` al catálogo canónico.
 *
 * Los valores reales en producción al 2026-08-31 son `Admin`, `Administrativo` y
 * `Driver`. El mapa acepta además variantes de escritura que podrían aparecer al
 * dar de alta a alguien a mano.
 *
 * @readonly
 * @enum {string}
 */
export const ALIAS_ROL = {
  admin: ROLES.ADMINISTRADOR,
  administrador: ROLES.ADMINISTRADOR,
  administrator: ROLES.ADMINISTRADOR,
  dev: ROLES.ADMINISTRADOR,

  administrativo: ROLES.ADMINISTRATIVO,
  administrativa: ROLES.ADMINISTRATIVO,

  operaciones: ROLES.OPERACIONES,
  finanzas: ROLES.FINANZAS,
  mantenimiento: ROLES.MANTENIMIENTO,
  safety: ROLES.SAFETY,

  driver: ROLES.OPERADOR,
  operador: ROLES.OPERADOR,
  conductor: ROLES.OPERADOR,

  consulta: ROLES.CONSULTA,
  viewer: ROLES.CONSULTA,
}

/**
 * Normaliza un valor de rol al catálogo canónico.
 *
 * Es el mismo patrón que `normalizarSubcategoria` en el backend, y por la misma
 * razón: deja la aplicación consistente **hoy** sin depender de que la base de
 * datos migre primero, que en producción no tiene red de seguridad. Cuando la
 * migración ocurra, esta función se queda como camino de lectura hasta que ya no
 * aplique a nadie y entonces se borra.
 *
 * Un valor desconocido cae a `CONSULTA`, el rol de **menor** privilegio: un rol
 * que nadie reconoce no debe abrir puertas.
 *
 * @param {*} crudo Valor de `type` tal como viene de la API.
 * @returns {string} Un valor de `ROLES`.
 */
export function normalizarRol(crudo) {
  const clave = String(crudo ?? "").trim().toLowerCase()
  return ALIAS_ROL[clave] ?? ROLES.CONSULTA
}
