import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import truckIcon from "../../assets/images/icons/truck.png";
import Swal from 'sweetalert2';

const COLORS = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
  "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe"
];

function createColoredIcon(angle, color) {
  return L.divIcon({
    html: `
      <div style="
        width:40px;height:40px;background:${color};border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        border:3px solid white;box-shadow:0 0 5px rgba(0,0,0,.4);
      ">
        <img src="${truckIcon}" style="transform:rotate(${angle}deg);width:22px;height:22px;" />
      </div>`,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [30, 30],
  });
}

function createPinIcon(label, bgColor) {
  return L.divIcon({
    html: `
      <div style="
        width:32px;height:32px;background:${bgColor};border-radius:50%;
        display:flex;align-items:center;justify-content:center;
        border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,.5);
        color:white;font-weight:bold;font-size:15px;
      ">${label}</div>`,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function FlyToSelected({ unit }) {
  const map = useMap();
  useEffect(() => {
    if (unit) map.flyTo([unit.lat, unit.lon], 14, { duration: 1.2 });
  }, [unit]);
  return null;
}

function MapClickHandler({ active, onMapClick }) {
  useMapEvents({
    click(e) {
      if (active) onMapClick(e.latlng);
    },
  });
  return null;
}

export default function Tracking() {
  const [units, setUnits] = useState([]);
  const [selected, setSelected] = useState(null);
  const first = useRef(true);

  // Route state
  const [ping1, setPing1] = useState(null);      // { lat, lon, name, id? }
  const [ping2, setPing2] = useState(null);      // { lat, lon, name, id? }
  const [ping2Mode, setPing2Mode] = useState(null); // 'map' | 'truck' | null
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null); // { distance, duration }
  const [isTracing, setIsTracing] = useState(false);

  const fetchUnits = async () => {
    let timerInterval;
    const start = Date.now();
    if (first.current) {
      Swal.fire({
        title: 'Obteniendo unidades…',
        html: 'Tiempo transcurrido: <b>0</b> ms',
        allowOutsideClick: false,
        didOpen: () => {
          const popup = Swal.getPopup();
          if (popup) {
            Swal.showLoading();
            const b = popup.querySelector('b');
            timerInterval = setInterval(() => {
              if (b) b.textContent = `${Date.now() - start}`;
            }, 100);
          }
        },
        willClose: () => clearInterval(timerInterval),
      });
    }

    try {
      const res = await fetch("http://imaexpressllc.com/API/Tracking.php");
      const data = await res.json();

      if (data.status === "success") {
        Swal.close();
        first.current = false;
        const items = data.units.map((u, i) => ({
          id: u.id,
          name: u.nm,
          lat: u.pos?.y,
          lon: u.pos?.x,
          speed: u.pos?.s,
          heading: u.pos?.c,
          timestamp: u.pos?.t,
          address: u.address || "No address available",
          color: COLORS[i % COLORS.length],
        }));

        let previousSelected = null;
        if (selected) previousSelected = items.find(x => x.id === selected.id);

        setUnits(items);
        if (previousSelected) setSelected(previousSelected);
      }
    } catch (err) {
      console.error("Error cargando unidades:", err);
    }
  };

  useEffect(() => {
    fetchUnits();
    const interval = setInterval(fetchUnits, 50000);
    return () => clearInterval(interval);
  }, []);

  // Keep ping1/ping2 positions fresh when units refresh
  useEffect(() => {
    if (ping1?.id) {
      const upd = units.find(x => x.id === ping1.id);
      if (upd) setPing1(upd);
    }
    if (ping2?.id) {
      const upd = units.find(x => x.id === ping2.id);
      if (upd) setPing2(upd);
    }
  }, [units]);

  const handleTruckClick = (truck) => {
    if (ping2Mode === 'truck') {
      if (truck.id === ping1?.id) return; // can't pick same truck
      setPing2({ ...truck });
      setPing2Mode(null);
    } else {
      setSelected(truck);
      setPing1({ ...truck });
      setPing2(null);
      setPing2Mode(null);
      setRouteCoords([]);
      setRouteInfo(null);
    }
  };

  const handleMapClick = (latlng) => {
    setPing2({
      lat: latlng.lat,
      lon: latlng.lng,
      name: `${latlng.lat.toFixed(5)}, ${latlng.lng.toFixed(5)}`,
    });
    setPing2Mode(null);
  };

  const traceRoute = async () => {
    if (!ping1 || !ping2) return;
    setIsTracing(true);
    setRouteCoords([]);
    setRouteInfo(null);
    try {
      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${ping1.lon},${ping1.lat};${ping2.lon},${ping2.lat}` +
        `?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.code === "Ok" && data.routes.length > 0) {
        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
        setRouteCoords(coords);
        setRouteInfo({
          distance: (route.distance / 1000).toFixed(1),
          duration: Math.round(route.duration / 60),
        });
      } else {
        Swal.fire({ icon: "warning", title: "Sin ruta", text: "No se encontró ruta entre los puntos.", timer: 3000 });
      }
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo conectar al servicio de rutas.", timer: 3000 });
    } finally {
      setIsTracing(false);
    }
  };

  const clearRoute = () => {
    setPing1(null);
    setPing2(null);
    setPing2Mode(null);
    setRouteCoords([]);
    setRouteInfo(null);
    setSelected(null);
  };

  const btnBase = {
    border: "none", borderRadius: "6px", cursor: "pointer",
    padding: "6px 10px", fontSize: "12px", fontWeight: "bold",
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - 80px)", width: "100%" }}>

      {/* -------------------- SIDEBAR -------------------- */}
      <div style={{
        width: "350px", background: "#fff",
        borderRight: "1px solid #ccc",
        overflowY: "auto", display: "flex", flexDirection: "column",
      }}>

        {/* Route panel – visible when a truck is selected */}
        {ping1 && (
          <div style={{ padding: "12px", background: "#f0f4ff", borderBottom: "2px solid #4363d8" }}>
            <div style={{ fontWeight: "bold", color: "#4363d8", marginBottom: "8px", fontSize: "14px" }}>
              Trazador de ruta
            </div>

            {/* Ping 1 */}
            <PingRow number="1" color="#4363d8" name={ping1.name} />

            {/* Ping 2 */}
            {ping2 ? (
              <PingRow number="2" color="#e6194b" name={ping2.name} />
            ) : (
              <div style={{ marginBottom: "6px" }}>
                <div style={{ fontSize: "11px", color: "#666", marginBottom: "4px" }}>Seleccionar Ping 2:</div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    style={{
                      ...btnBase, flex: 1,
                      background: ping2Mode === 'map' ? "#4363d8" : "#e8eaf6",
                      color: ping2Mode === 'map' ? "white" : "#4363d8",
                    }}
                    onClick={() => setPing2Mode(ping2Mode === 'map' ? null : 'map')}
                  >
                    {ping2Mode === 'map' ? "Clic en mapa…" : "Punto en mapa"}
                  </button>
                  <button
                    style={{
                      ...btnBase, flex: 1,
                      background: ping2Mode === 'truck' ? "#4363d8" : "#e8eaf6",
                      color: ping2Mode === 'truck' ? "white" : "#4363d8",
                    }}
                    onClick={() => setPing2Mode(ping2Mode === 'truck' ? null : 'truck')}
                  >
                    {ping2Mode === 'truck' ? "Seleccionando…" : "2° camión"}
                  </button>
                </div>
              </div>
            )}

            {/* Trace button */}
            {ping2 && (
              <button
                onClick={traceRoute}
                disabled={isTracing}
                style={{
                  ...btnBase, width: "100%", padding: "8px",
                  marginTop: "6px", fontSize: "13px",
                  background: isTracing ? "#aaa" : "#3cb44b",
                  color: "white", cursor: isTracing ? "default" : "pointer",
                }}
              >
                {isTracing ? "Trazando…" : "Trazar ruta"}
              </button>
            )}

            {/* Summary */}
            {routeInfo && (
              <div style={{
                marginTop: "10px", padding: "10px", background: "white",
                borderRadius: "6px", border: "1px solid #c5cae9",
              }}>
                <div style={{ fontWeight: "bold", fontSize: "13px", marginBottom: "6px", color: "#333" }}>
                  Resumen de ruta
                </div>
                <div style={{ fontSize: "13px", marginBottom: "2px" }}>
                  Distancia: <strong>{routeInfo.distance} km</strong>
                </div>
                <div style={{ fontSize: "13px" }}>
                  Duración estimada: <strong>{routeInfo.duration} min</strong>
                </div>
              </div>
            )}

            <button
              onClick={clearRoute}
              style={{
                ...btnBase, width: "100%", marginTop: "8px",
                background: "transparent", color: "#999",
                border: "1px solid #ddd", fontWeight: "normal",
              }}
            >
              Limpiar ruta
            </button>
          </div>
        )}

        {/* Mode hint */}
        {ping2Mode && (
          <div style={{
            padding: "8px 12px", background: "#fff8e1",
            borderBottom: "1px solid #ffe082", fontSize: "12px", color: "#7b5e00",
          }}>
            {ping2Mode === 'map'
              ? "Haz clic en el mapa para colocar Ping 2"
              : "Haz clic en otro camión para usarlo como Ping 2"}
          </div>
        )}

        <h3 style={{ padding: "15px", margin: 0 }}>Camiones</h3>

        {units.map((truck) => {
          const isPing1 = ping1?.id === truck.id;
          const isPing2 = ping2?.id === truck.id;
          const isSelectablePing2 = ping2Mode === 'truck' && !isPing1;
          return (
            <div
              key={truck.id}
              onClick={() => handleTruckClick(truck)}
              style={{
                padding: "12px", cursor: "pointer", display: "flex",
                background: isPing1 ? "#eef5ff" : isPing2 ? "#fff0f0" : isSelectablePing2 ? "#fffde7" : "white",
                borderBottom: "1px solid #eee",
                outline: isSelectablePing2 ? "1px dashed #ffc107" : "none",
              }}
            >
              <div style={{ width: "4px", background: truck.color, marginRight: "10px", borderRadius: "2px" }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <strong>{truck.name}</strong>
                  {isPing1 && <Badge label="Ping 1" color="#4363d8" />}
                  {isPing2 && <Badge label="Ping 2" color="#e6194b" />}
                </div>
                <div style={{ fontSize: "12px", opacity: 0.7 }}>Velocidad: {truck.speed} km/h</div>
                <div style={{ fontSize: "12px", opacity: 0.7 }}>
                  Última actualización:{" "}
                  {truck.timestamp ? new Date(truck.timestamp * 1000).toLocaleString() : "---"}
                </div>
                <div style={{ marginTop: "4px", fontSize: "12px", color: "#444" }}>{truck.address}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* -------------------- MAPA -------------------- */}
      <div style={{ flex: 1, position: "relative" }}>

        {/* Crosshair cursor overlay when placing map pin */}
        {ping2Mode === 'map' && (
          <style>{`.leaflet-container { cursor: crosshair !important; }`}</style>
        )}

        {/* Floating instruction banner */}
        {ping2Mode === 'map' && (
          <div style={{
            position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
            zIndex: 1000, background: "#4363d8", color: "white",
            padding: "8px 18px", borderRadius: "20px", fontSize: "13px",
            boxShadow: "0 2px 10px rgba(0,0,0,.3)", pointerEvents: "none",
          }}>
            Haz clic en el mapa para establecer Ping 2
          </div>
        )}

        <MapContainer
          center={[25, -90]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />

          <MapClickHandler active={ping2Mode === 'map'} onMapClick={handleMapClick} />

          {/* Truck markers */}
          {units.map((u) => (
            <Marker
              key={u.id}
              position={[u.lat, u.lon]}
              icon={createColoredIcon(u.heading, u.color)}
              eventHandlers={{ click: () => handleTruckClick(u) }}
            >
              <Popup>
                <strong>{u.name}</strong><br />
                Velocidad: {u.speed} km/h<br />
                Dirección: {u.address}
              </Popup>
            </Marker>
          ))}

          {/* Ping 2 map-point marker */}
          {ping2 && !ping2.id && (
            <Marker position={[ping2.lat, ping2.lon]} icon={createPinIcon("2", "#e6194b")}>
              <Popup>Ping 2: {ping2.name}</Popup>
            </Marker>
          )}

          {/* Ping 1 highlight (small numbered overlay on the truck) */}
          {ping1 && (
            <Marker position={[ping1.lat, ping1.lon]} icon={createPinIcon("1", "#4363d8")} zIndexOffset={500} />
          )}

          {/* Route polyline */}
          {routeCoords.length > 0 && (
            <Polyline positions={routeCoords} color="#4363d8" weight={5} opacity={0.8} />
          )}

          {selected && <FlyToSelected unit={selected} />}
        </MapContainer>
      </div>

    </div>
  );
}

function PingRow({ number, color, name }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
      <div style={{
        width: 22, height: 22, borderRadius: "50%", background: color,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", fontSize: "12px", fontWeight: "bold", flexShrink: 0,
      }}>
        {number}
      </div>
      <span style={{ fontSize: "13px", color: "#333" }}>{name}</span>
    </div>
  );
}

function Badge({ label, color }) {
  return (
    <span style={{
      fontSize: "10px", background: color, color: "white",
      padding: "1px 6px", borderRadius: "8px",
    }}>
      {label}
    </span>
  );
}
