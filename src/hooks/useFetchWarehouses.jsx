// hooks/useFetchWarehouses.js
import { useState, useEffect } from 'react';

function useFetchWarehouses() {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [activeWarehouses, setActiveWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWarehouses = async () => { // <-- Esta función ahora puede ser llamada externamente
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiHost}/warehouses.php`, { // Ajusta la URL si es diferente
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'op=getWarehouses', // Asumiendo que esta es tu operación para obtener todas las bodegas
      });
      const data = await response.json();
      if (data.status === 'success' && data.warehouses) { // Asegúrate que la respuesta tenga 'warehouses'
        setActiveWarehouses(data.warehouses);
      } else {
        setError(data.message || 'Error al obtener bodegas.');
      }
    } catch (err) {
      setError(err.message || 'Error de red al cargar bodegas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses(); // Se ejecuta al montar el componente
  }, []);

  return { activeWarehouses, loading, error, refetchWarehouses: fetchWarehouses }; // ###Agregar: Devuelve la función de refetch
}

export default useFetchWarehouses;