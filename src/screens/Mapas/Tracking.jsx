import { useEffect, useState,useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import truckIcon from "../../assets/images/icons/truck.png";
import Swal from 'sweetalert2';

// Colores únicos por camión
const COLORS = [
  "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231",
  "#911eb4", "#46f0f0", "#f032e6", "#bcf60c", "#fabebe"
];

// Ícono con color único
function createColoredIcon(angle, color) {
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
    iconAnchor: [20, 20],
  });
}

// Hace zoom al camión seleccionado
function FlyToSelected({ unit }) {
  const map = useMap();

  useEffect(() => {
    if (unit) {
      map.flyTo([unit.lat, unit.lon], 14, { duration: 1.2 });
    }
  }, [unit]);

  return null;
}

export default function Tracking() {

  const [units, setUnits] = useState([]);
  const [selected, setSelected] = useState(null);
  const first = useRef(true);


  // Obtener datos reales
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
          color: COLORS[i % COLORS.length]
        }));

        // Mantener selección si sigue existiendo
        let previousSelected = null;
        if (selected) {
          previousSelected = items.find(x => x.id === selected.id);
        }

        setUnits(items);

        if (previousSelected) {
          setSelected(previousSelected);
        }
      }

    } catch (err) {
      console.error("Error cargando unidades:", err);
    }
  };

  useEffect(() => {
    fetchUnits();
    const interval = setInterval(fetchUnits, 30000);
  
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 80px)", width: "100%" }}>

      {/* ---------------------- LISTA IZQUIERDA ---------------------- */}
      <div style={{
        width: "350px",
        background: "#fff",
        borderRight: "1px solid #ccc",
        overflowY: "auto"
      }}>
        <h3 style={{ padding: "15px", margin: 0 }}>Camiones</h3>

        {units.map((truck) => (
          <div
            key={truck.id}
            onClick={() => setSelected(truck)}
            style={{
              padding: "12px",
              cursor: "pointer",
              display: "flex",
              background: selected?.id === truck.id ? "#eef5ff" : "white",
              borderBottom: "1px solid #eee"
            }}
          >

            {/* Línea vertical de color */}
            <div style={{
              width: "4px",
              background: truck.color,
              marginRight: "10px",
              borderRadius: "2px"
            }}></div>

            <div>
              <strong>{truck.name}</strong>

              <div style={{ fontSize: "12px", opacity: 0.7 }}>
                Velocidad: {truck.speed} km/h
              </div>

              <div style={{ fontSize: "12px", opacity: 0.7 }}>
                Última actualización:
                {truck.timestamp ? " " + new Date(truck.timestamp * 1000).toLocaleString() : '---'}
              </div>

              {/* Dirección */}
              <div style={{
                marginTop: "4px",
                fontSize: "12px",
                color: "#444"
              }}>
                {truck.address}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------------- MAPA DERECHA ---------------------- */}
      <div style={{ flex: 1 }}>
        <MapContainer
          center={[units[0]?.lat || 0, units[0]?.lon || 0]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Mostrar todos los camiones */}
          {units.map((u) => (
            <Marker
              key={u.id}
              position={[u.lat, u.lon]}
              icon={createColoredIcon(u.heading, u.color)}
              eventHandlers={{ click: () => setSelected(u) }}
            >
              <Popup>
                <strong>{u.name}</strong><br />
                Velocidad: {u.speed} km/h <br />
                Dirección: {u.address}
              </Popup>
            </Marker>
          ))}

          {/* Zoom automático */}
          {selected && <FlyToSelected unit={selected} />}
        </MapContainer>
      </div>

    </div>
  );
}
