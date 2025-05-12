
import { useState, useEffect } from 'react';

function useFetchActiveTrucks() {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [activeTrucks, setActiveTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveTrucks = async () => {
      try {
        const response = await fetch(`${apiHost}/trucks.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'op=getTrucksActivos',
        });
        const data = await response.json();

        if (data.status === 'success' && data.trucks) {
            const formattedActiveTrucks = data.trucks.map(truck => ({
                truck_id: truck.truck_id,
                unidad: truck.unidad, 
              }));
          setActiveTrucks(formattedActiveTrucks); // Ajusta el mapeo si es necesario
          setLoading(false);
        } else {
          setError(data.message || 'Error al obtener los trucks activos');
          setLoading(false);
        }
      } catch (err) {
        setError('Error de red al obtener los trucks activos');
        setLoading(false);
      }
    };

    fetchActiveTrucks();
  }, []);

  return { activeTrucks, loading, error };
}

export default useFetchActiveTrucks;