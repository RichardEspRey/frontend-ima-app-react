import { useState, useCallback } from "react";
import Swal from "sweetalert2";

const DOLAR_API_URL = "https://mx.dolarapi.com/v1/cotizaciones/usd";
const HISTORICO_API_URL = "https://api.frankfurter.dev/v1";

const esHoy = (fecha) => {
  if (!fecha) return true;
  const hoy = new Date();
  const iso = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-${String(hoy.getDate()).padStart(2, "0")}`;
  return fecha >= iso;
};

const tasaDelDia = async () => {
  const res = await fetch(DOLAR_API_URL);
  if (!res.ok) throw new Error(`Error HTTP al consultar la API: ${res.status}`);
  const data = await res.json();
  return data.venta;
};

const tasaHistorica = async (fecha) => {
  const res = await fetch(`${HISTORICO_API_URL}/${fecha}?base=USD&symbols=MXN`);
  if (!res.ok) throw new Error(`Error HTTP al consultar el historico: ${res.status}`);
  const data = await res.json();
  return data?.rates?.MXN;
};

/**
 * Hook personalizado para obtener la tasa de cambio USD/MXN (Venta) del día.
 * La tasa se usa para convertir Monto Original (MXN) a Monto Total (USD).
 */
const useFetchExchangeRate = () => {
  const [exchangeRate, setExchangeRate] = useState("");

  const fetchExchangeRate = useCallback(async (fecha) => {
    setExchangeRate("");
    try {
      const rate = esHoy(fecha) ? await tasaDelDia() : await tasaHistorica(fecha);

      if (rate && typeof rate === "number" && rate > 0) {
        setExchangeRate(rate.toFixed(4));
      } else {
        throw new Error("API devolvió un formato o valor de tasa no válido.");
      }
    } catch (error) {
      console.error("Error al obtener el tipo de cambio:", error.message);
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "No se pudo obtener la tasa. Escríbela a mano.",
        showConfirmButton: false,
        timer: 4000,
      });
      setExchangeRate("");
    }
  }, []);

  return { exchangeRate, setExchangeRate, fetchExchangeRate };
};

export default useFetchExchangeRate;
