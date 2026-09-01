import L from "leaflet"
import truckIcon from "../../../assets/images/icons/truck.png"

/**
 * Marcador de una unidad, apuntando hacia donde va.
 *
 * @param {number} rumbo Rumbo en grados, como lo reporta el GPS.
 * @param {string} color Color asignado a la unidad.
 * @returns {object} El icono de Leaflet.
 */
export function iconoUnidad(rumbo, color) {
  return L.divIcon({
    html: `
      <div style="width:40px; height:40px; background:${color}; border-radius:50%; display:flex; align-items:center; justify-content:center; border:3px solid white; box-shadow:0 0 5px rgba(0,0,0,.4);">
        <img src="${truckIcon}" style="transform:rotate(${rumbo}deg); width:22px; height:22px; margin-top:6px; margin-left:6px;" alt="" />
      </div>
    `,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })
}

/**
 * Marcador numerado de un extremo de la ruta.
 *
 * @param {string} etiqueta Lo que va dentro del círculo, normalmente 1 o 2.
 * @param {string} color Color del círculo.
 * @returns {object} El icono de Leaflet.
 */
export function iconoPunto(etiqueta, color) {
  return L.divIcon({
    html: `
      <div style="
        width:32px;height:32px;background:${color};border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,.5);
        color:white;font-weight:bold;font-size:15px;
      ">${etiqueta}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  })
}

/**
 * Color del primer punto de la ruta, el que marca la unidad de partida.
 *
 * @type {string}
 */
export const COLOR_PUNTO_1 = "#4363d8"

/**
 * Color del segundo punto de la ruta, el destino.
 *
 * @type {string}
 */
export const COLOR_PUNTO_2 = "#e6194b"
