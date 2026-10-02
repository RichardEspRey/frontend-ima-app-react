import { z } from "zod"
import { idPhp, nullable } from "../../../shared/api/zodPhp"

/**
 * De qué unidad habla un punto. El mismo viaje se trabaja por los dos lados.
 *
 * @readonly
 * @enum {string}
 */
export const UNIDAD = { CAMION: "camion", CAJA: "caja" }

/**
 * En qué puede estar un punto reportado.
 *
 * Es la pieza que no existía: antes un punto del checklist no tenía identidad ni
 * estado, así que lo que la oficina decidía sobre él vivía en un Excel. Mientras
 * quede uno en `SIN_RESOLVER`, el lado de la inspección no se puede cerrar.
 *
 * @readonly
 * @enum {string}
 */
export const ESTATUS_PUNTO = {
  SIN_RESOLVER: "sin_resolver",
  EN_PENDIENTES: "en_pendientes",
  CON_ORDEN: "con_orden",
  DESCARTADO: "descartado",
}

/**
 * Cómo se nombra cada estado en pantalla.
 *
 * @readonly
 * @type {Object.<string, string>}
 */
export const ETIQUETA_ESTATUS = {
  [ESTATUS_PUNTO.EN_PENDIENTES]: "En pendientes",
  [ESTATUS_PUNTO.CON_ORDEN]: "Con orden",
  [ESTATUS_PUNTO.DESCARTADO]: "Descartado",
}

/**
 * Los seis rubros del checklist del operador.
 *
 * El remolque es de la caja; el resto, del tractor. De ahí sale que una misma
 * inspección se trabaje y se cierre por dos lados distintos.
 *
 * @readonly
 * @type {Array.<{clave: string, etiqueta: string, tabla: string, unidad: string}>}
 */
export const RUBROS = [
  { clave: "motor", etiqueta: "Motor", tabla: "cl_motor", unidad: UNIDAD.CAMION },
  { clave: "exterior", etiqueta: "Exterior", tabla: "cl_exterior", unidad: UNIDAD.CAMION },
  { clave: "neumaticos", etiqueta: "Neumáticos", tabla: "cl_neumaticos", unidad: UNIDAD.CAMION },
  { clave: "cabina", etiqueta: "Cabina", tabla: "cl_cabina", unidad: UNIDAD.CAMION },
  { clave: "otro", etiqueta: "Otro", tabla: "cl_otro", unidad: UNIDAD.CAMION },
  { clave: "remolque", etiqueta: "Remolque", tabla: "cl_remolque", unidad: UNIDAD.CAJA },
]

/**
 * Lo que el operador escribe cuando no hay nada que reparar.
 *
 * Medido contra producción: 64 de 145 renglones. Esconderlos es la diferencia
 * entre leer una lista de trabajo y leer una lista de "todo bien". El servidor
 * aplica el mismo filtro; esta copia es para lo que ya llegó al cliente.
 *
 * @readonly
 * @type {Set.<string>}
 */
const SIN_FALLA = new Set([
  "", "ok", "okay", "o k", "todo ok", "bien", "todo bien", "buen estado", "en buen estado",
  "todo en orden", "sin novedad", "sin novedades", "sin fallas", "sin falla", "correcto",
  "na", "n a", "ninguna", "ninguno", "nada", "no aplica",
])

const normalizar = (texto) =>
  (texto || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[\s.,;:!¡¿?*\-_/]+/g, " ")
    .trim()

/**
 * Indica si un punto del checklist dice que no hay nada que hacer.
 *
 * @param {string} texto Lo que escribió el operador.
 * @returns {boolean} `true` si no es trabajo.
 */
export const esPuntoSinFalla = (texto) => SIN_FALLA.has(normalizar(texto))

/**
 * Una inspección con lo que falta por atender de un lado.
 */
export const esquemaInspeccionMtto = z.object({
  cl_final_id: idPhp(),
  viaje_id: idPhp(),
  fecha_creacion: z.string().catch(""),
  truck_id: nullable(idPhp()),
  no_camion: z.coerce.string().catch(""),
  trip_number: z.coerce.string().catch(""),
  caja_id: nullable(idPhp()),
  no_caja: z.coerce.string().catch(""),
  operador: z.string().catch(""),
  por_atender: z.coerce.number().catch(0),
  reportados: z.coerce.number().catch(0),
  estatus_lado: z.string().catch("pendiente"),
})

/**
 * Un punto del checklist, con el estado que la oficina le haya dado.
 */
export const esquemaPunto = z.object({
  categoria: z.string().catch(""),
  rubro: z.string().catch(""),
  origen_tabla: z.string().catch(""),
  origen_id: z.coerce.number().catch(0),
  texto: z.string().catch(""),
  texto_original: z.string().catch(""),
  unidad_tipo: z.string().catch(UNIDAD.CAMION),
  estatus: z.string().catch(ESTATUS_PUNTO.SIN_RESOLVER),
  id_orden: nullable(idPhp()),
})

/**
 * Una reparación que espera a que la unidad vuelva.
 */
export const esquemaPendiente = z.object({
  id: idPhp(),
  origen: z.string().catch("inspeccion"),
  viaje_id: nullable(idPhp()),
  trip_number: z.coerce.string().catch(""),
  categoria: z.string().catch(""),
  origen_tabla: z.string().catch(""),
  origen_id: nullable(z.coerce.number()),
  unidad_tipo: z.string().catch(UNIDAD.CAMION),
  truck_id: nullable(idPhp()),
  no_camion: z.coerce.string().catch(""),
  caja_id: nullable(idPhp()),
  no_caja: z.coerce.string().catch(""),
  descripcion: z.string().catch(""),
})

/**
 * Indica si un punto ya tiene destino.
 *
 * Un punto resuelto se sigue viendo en la inspección —con su etiqueta y, si fue
 * descartado, tachado— pero ya no se puede volver a mandar: eso lo duplicaría.
 *
 * @param {object} punto El punto a evaluar.
 * @returns {boolean} `true` si alguien ya decidió qué hacer con él.
 */
export const estaResuelto = (punto) =>
  Boolean(punto?.estatus) && punto.estatus !== ESTATUS_PUNTO.SIN_RESOLVER

/**
 * La clave con la que se identifica un punto en la pantalla.
 *
 * El renglón del checklist no tiene id propio en la respuesta: lo identifica el
 * par tabla + id de origen, que es también la llave única del servidor.
 *
 * @param {object} punto El punto.
 * @returns {string} Su clave estable.
 */
export const clavePunto = (punto) => `${punto.origen_tabla}-${punto.origen_id}`

/**
 * Los rubros que se trabajan de un lado.
 *
 * @param {string} lado `camion` o `caja`.
 * @returns {Array.<object>} Los rubros de ese lado.
 */
export const rubrosDeLado = (lado) =>
  RUBROS.filter((rubro) => (lado === UNIDAD.CAJA ? rubro.unidad === UNIDAD.CAJA : rubro.unidad === UNIDAD.CAMION))

/**
 * Agrupa los puntos por rubro, en el orden del checklist.
 *
 * @param {Array.<object>} puntos Los puntos de una inspección.
 * @returns {Array.<{clave: string, etiqueta: string, puntos: Array.<object>}>} Los rubros con contenido.
 */
export function agruparPorRubro(puntos = []) {
  return RUBROS.map((rubro) => ({
    clave: rubro.clave,
    etiqueta: rubro.etiqueta,
    puntos: puntos.filter((punto) => punto.rubro === rubro.clave),
  })).filter((rubro) => rubro.puntos.length > 0)
}

/**
 * Agrupa las reparaciones pendientes por unidad.
 *
 * Se agrupa, y no se lista plano, porque la orden se levanta por unidad: ver
 * sueltas las reparaciones de un mismo camión es lo que hacía que se olvidaran.
 *
 * @param {Array.<object>} pendientes Las reparaciones.
 * @param {string} lado `camion` o `caja`.
 * @returns {Array.<{clave: string, unidadId: string, etiqueta: string, reparaciones: Array.<object>}>} Las unidades.
 */
export function agruparPorUnidad(pendientes = [], lado) {
  const unidades = new Map()

  for (const pendiente of pendientes) {
    const id = lado === UNIDAD.CAJA ? pendiente.caja_id : pendiente.truck_id
    const clave = String(id ?? "sin-unidad")

    if (!unidades.has(clave)) {
      unidades.set(clave, {
        clave,
        unidadId: id,
        etiqueta: (lado === UNIDAD.CAJA ? pendiente.no_caja : pendiente.no_camion) || "Sin unidad",
        reparaciones: [],
      })
    }
    unidades.get(clave).reparaciones.push(pendiente)
  }

  return [...unidades.values()].sort((a, b) =>
    String(a.etiqueta).localeCompare(String(b.etiqueta), "es", { numeric: true }),
  )
}

/**
 * Valida una lista descartando lo que no cumple el esquema.
 *
 * @param {object} esquema El esquema zod a aplicar.
 * @param {Array} filas Lo que vino en la respuesta.
 * @returns {{validas: Array, descartados: number}} Las válidas y cuántas se cayeron.
 */
export function normalizarCon(esquema, filas = []) {
  const validas = []
  let descartados = 0

  for (const fila of filas) {
    const resultado = esquema.safeParse(fila)
    if (resultado.success) validas.push(resultado.data)
    else descartados += 1
  }

  return { validas, descartados }
}
