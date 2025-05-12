// hooks/useFetchActiveDrivers.js
import { useState, useEffect } from 'react';

function useFetchActiveDrivers() {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [activeDrivers, setActiveDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveDrivers = async () => {
      try {
        const response = await fetch(`${apiHost}/drivers.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'op=getDriversActivos',
        });
        const data = await response.json();

        if (data.status === 'success' && data.drivers) {
          const formattedActiveDrivers = data.drivers.map(driver => ({
            driver_id: driver.driver_id,
            nombre: driver.nombre, 
          }));
          setActiveDrivers(formattedActiveDrivers);
          setLoading(false);
        } else {
          setError(data.message || 'Error al obtener los conductores activos');
          setLoading(false);
        }
      } catch (err) {
        setError('Error de red al obtener los conductores activos');
        setLoading(false);
      }
    };

    fetchActiveDrivers();
  }, [apiHost]);

  return { activeDrivers, loading, error };
}

export default useFetchActiveDrivers;