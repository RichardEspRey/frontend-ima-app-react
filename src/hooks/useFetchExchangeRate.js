// src/hooks/useFetchExchangeRate.js
import { useState, useCallback } from "react";
import Swal from "sweetalert2";

// Endpoint Correcto para cotizaciones USD/MXN
const DOLAR_API_URL = "https://mx.dolarapi.com/v1/cotizaciones/usd";

/**
 * Hook personalizado para obtener la tasa de cambio USD/MXN (Venta) del día.
 * La tasa se usa para convertir Monto Original (MXN) a Monto Total (USD).
 */
const useFetchExchangeRate = () => {
  // Almacena la tasa de cambio (Ej: 17.50 MXN por 1 USD)
  const [exchangeRate, setExchangeRate] = useState("");

  const fetchExchangeRate = useCallback(async () => {
    setExchangeRate(""); // Limpiar mientras se carga
    try {
      const response = await fetch(DOLAR_API_URL);

      if (!response.ok) {
        // Si la respuesta es 4xx o 5xx, lanzamos un error claro.
        throw new Error(`Error HTTP al consultar la API: ${response.status}`);
      }

      const data = await response.json();

      // Usamos la tasa de 'venta'
      const rate = data.venta;

      if (rate && typeof rate === "number" && rate > 0) {
        // Tasa: 17.50 (1 USD = 17.50 MXN)
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
        title: "Error al obtener la tasa de cambio. Usando 1.00.",
        showConfirmButton: false,
        timer: 3000,
      });
      // Valor de emergencia, aunque la lógica del useEffect lo maneja bien
      setExchangeRate("1.00");
    }
  }, []);

  return { exchangeRate, setExchangeRate, fetchExchangeRate };
};

export default useFetchExchangeRate;
