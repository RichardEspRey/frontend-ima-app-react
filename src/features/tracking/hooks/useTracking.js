import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

import { COLORS } from "../utils/mapIcons";

const TRACKING_URL = "http://imaexpressllc.com/API/Tracking.php";
const POLL_MS = 50000;

export function useTracking() {
  const [units, setUnits] = useState([]);
  const [selected, setSelected] = useState(null);
  const first = useRef(true);

  const fetchUnits = async () => {
    let timerInterval;
    const start = Date.now();

    if (first.current) {
      Swal.fire({
        title: "Obteniendo unidades…",
        html: 'Tiempo transcurrido: <b>0</b> ms',
        allowOutsideClick: false,
        didOpen: () => {
          const popup = Swal.getPopup();
          if (!popup) return;
          Swal.showLoading();
          const b = popup.querySelector("b");
          timerInterval = setInterval(() => {
            if (b) b.textContent = `${Date.now() - start}`;
          }, 100);
        },
        willClose: () => clearInterval(timerInterval),
      });
    }

    try {
      const res = await fetch(TRACKING_URL);
      const data = await res.json();

      if (data.status === "success") {
        Swal.close();
        first.current = false;

        const items = (data.units || []).map((u, i) => ({
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
        if (selected) {
          previousSelected = items.find((x) => x.id === selected.id) || null;
        }

        setUnits(items);
        if (previousSelected) setSelected(previousSelected);
      }
    } catch (err) {
      console.error("Error cargando unidades:", err);
    }
  };

  useEffect(() => {
    fetchUnits();
    const interval = setInterval(fetchUnits, POLL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { units, selected, setSelected };
}

