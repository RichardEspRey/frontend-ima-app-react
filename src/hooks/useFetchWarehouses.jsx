// hooks/useFetchActiveWarehouses.js
import { useState, useEffect } from 'react';

function useFetchWarehouses() {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [activeWarehouses, setActiveWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveWarehouses = async () => {
      try {
        const response = await fetch(`${apiHost}/warehouses.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'op=getWarehouses',
        });
        const data = await response.json();

        if (data.status === 'success' && data.warehouses) {
          const formattedActiveWarehouses = data.warehouses.map(warehouse => ({
            warehouse_id: warehouse.warehouse_id,
            nombre_almacen: warehouse.nombre_almacen, 
          }));
          setActiveWarehouses(formattedActiveWarehouses);
          setLoading(false);
        } else {
          setError(data.message || 'Error al obtener los warehouses');
          setLoading(false);
        }
      } catch (err) {
        setError('Error de red al obtener los warehouses');
        setLoading(false);
      }
    };

    fetchActiveWarehouses();
  }, []);

  return { activeWarehouses, loading, error };
}

export default useFetchWarehouses;