// hooks/useFetchActiveCajas.js
import { useState, useEffect } from 'react';

function useFetchActiveTrailers() {
  const [activeTrailers, setActiveTrailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveCajas = async () => {
      try {
        const response = await fetch('http://localhost/api/cajas.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'op=getCajasActivas',
        });
        const data = await response.json();

        if (data.status === 'success' && data.cajas) {
            const formattedActiveTrailers = data.cajas.map(caja =>({
                caja_id: caja.caja_id, 
                no_caja: caja.no_caja
            }))
            setActiveTrailers(formattedActiveTrailers); // Ajusta el mapeo si es necesario
          setLoading(false);
        } else {
          setError(data.message || 'Error al obtener las cajas activas');
          setLoading(false);
        }
      } catch (err) {
        setError('Error de red al obtener las cajas activas');
        setLoading(false);
      }
    };

    fetchActiveCajas();
  }, []);

  return { activeTrailers, loading, error };
}

export default useFetchActiveTrailers;