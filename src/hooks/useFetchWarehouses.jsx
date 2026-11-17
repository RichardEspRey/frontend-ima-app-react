// hooks/useFetchWarehouses.js
import { useState, useEffect } from 'react';
import { pedirCatalogo, VIGENCIA_CATALOGO_MS } from '../utils/catalogos';

function useFetchWarehouses() {
  const [activeWarehouses, setActiveWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWarehouses = async (forzar = false) => { // <-- Esta función ahora puede ser llamada externamente
    setLoading(true);
    setError(null);
    try {
      const data = await pedirCatalogo('warehouses.php', 'getWarehouses', { vigenciaMs: VIGENCIA_CATALOGO_MS, forzar });
      if (data.status === 'success' && data.warehouses) { // Asegúrate que la respuesta tenga 'warehouses'
        setActiveWarehouses([...data.warehouses]);
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

  return { activeWarehouses, loading, error, refetchWarehouses: () => fetchWarehouses(true) }; // ###Agregar: Devuelve la función de refetch
}

export default useFetchWarehouses;