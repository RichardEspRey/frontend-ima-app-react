import {
  useDesuscribirInspeccion,
  useDisponiblesInspeccion,
  useSuscribirInspeccion,
  useSuscriptoresInspeccion,
} from "../../../entities/maintenance-point"
import {
  CATEGORIA_AVISO,
  hooksDeAviso,
  useDesuscribir,
  useSuscribir,
  useSuscriptores,
  useUsuariosDisponibles,
} from "../../../entities/notification"

const variablesDeAviso = (persona, usuarioId) => ({ userId: persona.id, usuarioId })

const deAviso = (categoria) => ({ id: categoria, ...hooksDeAviso(categoria), variables: variablesDeAviso })

/**
 * Los avisos de la campana agrupados por pantalla, y cómo se administra quién
 * recibe cada uno.
 *
 * Cada aviso tiene su propia lista de personas: de una misma pantalla salen
 * varios y se asignan por separado. Las consultas viven en endpoints distintos
 * —los BL y los avisos nuevos en `Notifications.php`, las inspecciones con falla
 * en `mtto.php`—, y `variables` traduce a la persona al formato que
 * espera la mutación de cada uno. El ícono y los colores viven en la UI, con la
 * misma `id`.
 *
 * @readonly
 * @type {Array.<{id: string, nombre: string, categorias: Array.<object>}>}
 */
export const SECCIONES_DE_AVISO = [
  {
    id: "viajes",
    nombre: "Viajes",
    categorias: [
      {
        id: "bl",
        nombre: "BL Firmado",
        corto: "BL firmado",
        descripcion: "Cuando se sube el BL firmado de un viaje.",
        ejemplo: { titulo: "BL Firmado", subtitulo: "243-US-88T2-26" },
        useSuscriptores,
        useDisponibles: useUsuariosDisponibles,
        useSuscribir,
        useDesuscribir,
        variables: (persona) => persona.id,
      },
      {
        ...deAviso(CATEGORIA_AVISO.VIAJE_PROGRAMADO),
        nombre: "Viaje programado",
        corto: "Programado",
        descripcion: "Cuando se agrega un viaje a la pestaña Programación de Viajes.",
        ejemplo: { titulo: "Viaje programado", subtitulo: "PALOS GARZA HUB · Camión 10 · Luis Mellado" },
      },
      {
        ...deAviso(CATEGORIA_AVISO.VIAJE_DESPACHO),
        nombre: "Viaje en despacho",
        corto: "En despacho",
        descripcion: "Cuando un viaje entra a Despacho. Dice qué documentos le faltan.",
        ejemplo: { titulo: "Viaje en despacho 266-US-26", subtitulo: "Faltan 1: ORDEN RETIRO" },
      },
      {
        ...deAviso(CATEGORIA_AVISO.VIAJE_DOCUMENTOS),
        nombre: "Documentos en despacho",
        corto: "Documentos",
        descripcion:
          "Cuando se agregan documentos a un viaje en Despacho. Los que entran juntos van en un solo aviso, con los que siguen faltando.",
        ejemplo: { titulo: "2 documentos agregados 264-US-26", subtitulo: "MANIFIESTO, QR MANIFESTO" },
      },
    ],
  },
  {
    id: "reparaciones",
    nombre: "Reparaciones",
    categorias: [
      {
        id: "inspecciones",
        nombre: "Inspecciones",
        corto: "Con fallas",
        descripcion:
          "Cuando un operador manda una inspección con algo que reparar. Camión y caja avisan por separado.",
        ejemplo: { titulo: "Nueva inspección 238-US-26", subtitulo: "Camión 11 · Alberto Cruz Galindo" },
        useSuscriptores: useSuscriptoresInspeccion,
        useDisponibles: useDisponiblesInspeccion,
        useSuscribir: useSuscribirInspeccion,
        useDesuscribir: useDesuscribirInspeccion,
        variables: variablesDeAviso,
      },
      {
        ...deAviso(CATEGORIA_AVISO.SIN_FALLAS),
        nombre: "Inspecciones sin fallas",
        corto: "Sin fallas",
        descripcion: "Cuando un operador manda una inspección sin nada que reparar, con o sin caja.",
        ejemplo: { titulo: "Inspección sin fallas 257-US-26", subtitulo: "Camión 12 · Jose Luis Valdes" },
      },
      {
        ...deAviso(CATEGORIA_AVISO.SIN_INSPECCION),
        nombre: "Viajes sin inspección",
        corto: "Sin inspección",
        descripcion:
          "Cuando un operador junta más de un viaje sin inspección. Vuelve a avisar cada vez que suma otro.",
        ejemplo: { titulo: "Viajes sin inspección", subtitulo: "Alejandro Zablah Ruiz · 5 viajes" },
      },
    ],
  },
  {
    id: "diesel",
    nombre: "Diesel",
    categorias: [
      {
        ...deAviso(CATEGORIA_AVISO.DIESEL_STATE),
        nombre: "State pending",
        corto: "State pending",
        descripcion:
          "Una vez al día, a las 10:00, con los estados pendientes acumulados en el administrador de diesel.",
        ejemplo: { titulo: "State pending", subtitulo: "15 estados pendientes en 8 viajes" },
      },
      {
        ...deAviso(CATEGORIA_AVISO.DIESEL_FLEETONE),
        nombre: "Fleet One pending",
        corto: "Fleet One",
        descripcion: "Una vez al día, a las 10:00, con los tickets de Fleet One pendientes acumulados.",
        ejemplo: { titulo: "Fleet One pending", subtitulo: "89 tickets pendientes en 32 viajes" },
      },
    ],
  },
]

const diesel = hooksDeAviso(CATEGORIA_AVISO.DIESEL_STATE)

/**
 * Junta varias listas de personas en una sola, sin repetir y en orden.
 *
 * Ordena por nombre y, entre tocayos —hay dos cuentas «Angelica»—, por usuario.
 *
 * @param {Array.<(Array.<object>|undefined)>} listas Las listas que devolvió el servidor.
 * @returns {Array.<{id: string, name: string, user: string}>} Las personas, una vez cada una.
 *
 * @example
 * unirPersonas([[{ id: "14", name: "Richard" }], [{ id: 14, name: "Richard" }]]) // una sola
 */
export function unirPersonas(listas = []) {
  const porId = new Map()

  for (const persona of listas.flatMap((lista) => lista ?? [])) {
    const id = String(persona.id)
    if (!porId.has(id)) porId.set(id, { id, name: persona.name || "", user: persona.user || "" })
  }

  return [...porId.values()].sort(
    (a, b) =>
      nombreDe(a).localeCompare(nombreDe(b), "es", { sensitivity: "base" }) || a.user.localeCompare(b.user),
  )
}

/**
 * Todas las personas a las que se les puede asignar un aviso.
 *
 * Cada endpoint tiene su propia idea de quién es candidato, así que se juntan
 * los tres: suscritos más disponibles de BL, de inspecciones y de uno de los
 * avisos nuevos, que comparten población entre sí.
 *
 * @returns {{personas: Array.<object>, cargando: boolean}} Las personas y si falta alguna lista.
 */
export function usePersonasDeAvisos() {
  const consultas = [
    useSuscriptores(),
    useUsuariosDisponibles(),
    useSuscriptoresInspeccion(),
    useDisponiblesInspeccion(),
    diesel.useSuscriptores(),
    diesel.useDisponibles(),
  ]

  return {
    personas: unirPersonas(consultas.map((consulta) => consulta.data)),
    cargando: consultas.some((consulta) => consulta.isLoading),
  }
}

/**
 * Todos los avisos en una sola lista, en el orden en que se muestran.
 *
 * @readonly
 * @type {Array.<object>}
 */
export const CATEGORIAS_DE_AVISO = SECCIONES_DE_AVISO.flatMap((seccion) => seccion.categorias)

/**
 * El nombre con el que se conoce a una persona en las listas de avisos.
 *
 * @param {object} persona La persona devuelta por el servidor.
 * @returns {string} Su nombre, su usuario o «Sin nombre».
 */
export const nombreDe = (persona) => persona?.name || persona?.user || "Sin nombre"

/**
 * Filtra a las personas por nombre o usuario.
 *
 * @param {Array.<object>} personas Las candidatas.
 * @param {string} texto Lo que se escribió en el buscador.
 * @returns {Array.<object>} Las que coinciden; todas si el texto está vacío.
 *
 * @example
 * buscarPersonas([{ name: "Max", user: "Max_21028" }], "21028") // [{ name: "Max", ... }]
 */
export function buscarPersonas(personas = [], texto = "") {
  const buscado = texto.trim().toLowerCase()
  if (!buscado) return personas
  return personas.filter(
    (persona) =>
      nombreDe(persona).toLowerCase().includes(buscado) ||
      String(persona.user ?? "").toLowerCase().includes(buscado),
  )
}
