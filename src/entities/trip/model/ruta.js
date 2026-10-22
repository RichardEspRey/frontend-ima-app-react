import { z } from "zod"
import { nullable, numeroPhp } from "../../../shared/api/zodPhp"

const coordenada = nullable(z.object({ lat: z.coerce.number(), lng: z.coerce.number() }))
const texto = () => z.string().nullable().catch("").transform((valor) => valor ?? "")

/**
 * Un tramo de la ruta según Wialon: de dónde a dónde se movió la unidad.
 */
export const esquemaTramo = z.object({
  inicio: texto(),
  fin: texto(),
  ubicacion_inicial: texto(),
  ubicacion_final: texto(),
  coords_inicial: coordenada,
  coords_final: coordenada,
  km: numeroPhp(),
})

/**
 * La ruta que hizo un viaje finalizado.
 *
 * `ruta` llega nula cuando el servidor no puede armarla, y entonces `message`
 * dice por qué.
 */
export const esquemaRutaViaje = z.object({
  fecha_inicio: texto(),
  fecha_fin: texto(),
  unidad: nullable(z.coerce.string()),
  message: texto(),
  ruta: nullable(
    z.object({
      segmentos: z.array(esquemaTramo).catch([]),
      millas_total: numeroPhp(),
      km_total: numeroPhp(),
    }),
  ),
})

/**
 * Los puntos que se trazan en el mapa, en orden: el inicio y el final de cada
 * tramo.
 *
 * @param {Array.<object>} [tramos] Los tramos de la ruta.
 * @returns {Array.<Array.<number>>} Pares `[lat, lng]`.
 */
export function puntosDeRuta(tramos = []) {
  return tramos.flatMap((tramo) =>
    [tramo.coords_inicial, tramo.coords_final]
      .filter(Boolean)
      .map((coordenada) => [coordenada.lat, coordenada.lng]),
  )
}
