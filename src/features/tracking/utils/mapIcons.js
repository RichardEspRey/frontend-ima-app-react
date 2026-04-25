import L from "leaflet";
import truckIcon from "../../../assets/images/icons/truck.png";

export const COLORS = [
  "#e6194b",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#46f0f0",
  "#f032e6",
  "#bcf60c",
  "#fabebe",
];

export function createColoredIcon(angle, color) {
  return L.divIcon({
    html: `
      <div style="
        width:40px;
        height:40px;
        background:${color};
        border-radius:50%;
        display:flex;
        align-items:center;
        justify-content:center;
        border:3px solid white;
        box-shadow:0 0 5px rgba(0,0,0,.4);
      ">
        <img src="${truckIcon}" style="transform:rotate(${angle}deg); width:22px; height:22px;" />
      </div>
    `,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [30, 30],
  });
}

