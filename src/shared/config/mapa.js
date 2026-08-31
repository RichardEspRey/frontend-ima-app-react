/**
 * Capa base de los mapas, en un solo lugar.
 *
 * Son datos planos a propósito, no un componente: así `shared/config` no importa
 * react-leaflet y ninguna pantalla que no dibuje mapas arrastra leaflet en su
 * bundle. Se usa esparciéndolo sobre el `TileLayer`:
 *
 * ```jsx
 * import { TILES_BASE } from "../../shared/config/mapa";
 * <TileLayer {...TILES_BASE} />
 * ```
 *
 * Existe porque las cuatro pantallas con mapa lo tenían cada una por su cuenta y
 * se desincronizaron: tres usaban OpenStreetMap con atribución y `Tracking` usaba
 * CartoDB **sin** atribución. Carto empezó a exigir API key y devuelve los tiles
 * estampados con "API KEY REQUIRED" — con HTTP 200, así que no salta ningún error
 * en consola: el mapa simplemente se ve mal.
 *
 * Antes de cambiar de proveedor, lee `docs/DECISIONES/0005-proveedor-de-tiles-de-mapa.md`:
 * está el porqué de OpenStreetMap, el riesgo que se aceptó a sabiendas, las señales de
 * que toca migrar y la tabla de alternativas. Y acuérdate de actualizar el `img-src` de
 * la CSP en `vite.config.js`, o el proveedor nuevo se bloquea sin explicación visible.
 *
 * @readonly
 * @enum {string}
 */
export const TILES_BASE = {
  url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}

/**
 * Zoom máximo que sirven los tiles de OpenStreetMap. Pedir más devuelve 404 y
 * deja el mapa en gris.
 *
 * @type {number}
 */
export const ZOOM_MAXIMO_TILES = 19
