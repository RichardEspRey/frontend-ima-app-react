import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import { createColoredIcon } from "../utils/mapIcons";

function FlyToSelected({ unit }) {
  const map = useMap();

  useEffect(() => {
    if (unit) {
      map.flyTo([unit.lat, unit.lon], 14, { duration: 1.2 });
    }
  }, [map, unit]);

  return null;
}

export function TrackingMap({ units, selected, setSelected }) {
  return (
    <div style={{ flex: 1 }}>
      <MapContainer
        center={[units[0]?.lat || 0, units[0]?.lon || 0]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {units.map((u) => (
          <Marker
            key={u.id}
            position={[u.lat, u.lon]}
            icon={createColoredIcon(u.heading, u.color)}
            eventHandlers={{ click: () => setSelected(u) }}
          >
            <Popup>
              <strong>{u.name}</strong>
              <br />
              Velocidad: {u.speed} km/h
              <br />
              Dirección: {u.address}
            </Popup>
          </Marker>
        ))}

        {selected && <FlyToSelected unit={selected} />}
      </MapContainer>
    </div>
  );
}

