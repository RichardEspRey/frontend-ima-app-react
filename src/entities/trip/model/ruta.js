import { z } from "zod"
import { nullable, numeroPhp } from "../../../shared/api/zodPhp"

const coordenada = nullable(z.object({ lat: z.coerce.number(), lng: z.coerce.number() }))
const texto = () => z.string().nullable().catch("").transform((valor) => valor ?? "")

/**
 * Tipos de alto que reporta Wialon: una parada es breve con el motor
 * encendido; un estacionamiento es con la unidad apagada.
 *
 * @type {{PARADA: string, ESTACIONAMIENTO: string}}
 */
export const TIPO_PARADA = { PARADA: "parada", ESTACIONAMIENTO: "estacionamiento" }

/**
 * De dónde salió y a dónde llegó la unidad, y cuánto recorrió.
 */
export const esquemaResumenRuta = z.object({
  inicio: texto(),
  fin: texto(),
  ubicacion_inicial: texto(),
  ubicacion_final: texto(),
  coords_inicial: coordenada,
  coords_final: coordenada,
  km_total: numeroPhp(),
  millas_total: numeroPhp(),
})

/**
 * Un alto de la unidad en el camino.
 */
export const esquemaParada = z.object({
  tipo: z.enum([TIPO_PARADA.PARADA, TIPO_PARADA.ESTACIONAMIENTO]).catch(TIPO_PARADA.PARADA),
  llegada: texto(),
  salida: texto(),
  minutos: numeroPhp(),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
})

const puntoGps = z.tuple([z.coerce.number(), z.coerce.number()])

/**
 * La ruta que hizo un viaje finalizado: el trazo GPS en pares `[lat, lng]`, los
 * altos y el resumen.
 *
 * `ruta` llega nula cuando el servidor no puede armarla, y entonces `message`
 * dice por qué. Un punto o un alto que no se puede leer se descarta en vez de
 * tirar la ruta entera.
 */
export const esquemaRutaViaje = z.object({
  fecha_inicio: texto(),
  fecha_fin: texto(),
  unidad: nullable(z.coerce.string()),
  message: texto(),
  ruta: nullable(
    z.object({
      resumen: nullable(esquemaResumenRuta),
      track: z
        .array(z.unknown())
        .catch([])
        .transform((puntos) => puntos.flatMap((p) => (puntoGps.safeParse(p).success ? [puntoGps.parse(p)] : []))),
      paradas: z
        .array(z.unknown())
        .catch([])
        .transform((altos) => altos.flatMap((a) => (esquemaParada.safeParse(a).success ? [esquemaParada.parse(a)] : []))),
    }),
  ),
})

/**
 * Cuántos altos hubo de cada tipo.
 *
 * @param {Array.<{tipo: string}>} [paradas] Los altos de la ruta.
 * @returns {{paradas: number, estacionamientos: number}} El conteo.
 */
export function contarParadas(paradas = []) {
  const estacionamientos = paradas.filter((p) => p.tipo === TIPO_PARADA.ESTACIONAMIENTO).length
  return { paradas: paradas.length - estacionamientos, estacionamientos }
}

/**
 * Una duración en minutos, como se lee en pantalla: días y horas, horas y
 * minutos, o solo minutos.
 *
 * @param {number} minutos La duración.
 * @returns {string} Por ejemplo `1 d 3 h`, `4 h 33 min` o `18 min`.
 */
export function duracionLegible(minutos) {
  const total = Math.max(0, Math.round(Number(minutos) || 0))
  const dias = Math.floor(total / 1440)
  const horas = Math.floor((total % 1440) / 60)
  const resto = total % 60
  if (dias) return `${dias} d ${horas} h`
  if (horas) return `${horas} h ${resto} min`
  return `${resto} min`
}
