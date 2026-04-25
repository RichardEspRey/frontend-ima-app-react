// hooks/useFetchActiveCajas.js
import { useState, useEffect, useCallback } from 'react'; 

function useFetchActiveExternalTrailers() {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [activeExternalTrailers, setActiveExternalTrailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchActiveCajas = useCallback(async () => {
    setLoading(true); 
    setError(null);   
    try {
      const response = await fetch(`${apiHost}/caja_externa.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'op=getCajasExternasActivas',
      });
      const data = await response.json();

      if (data.status === 'success' && data.cajas) {
        const formattedActiveExternalTrailers = data.cajas.map(caja_externa => ({
            caja_externa_id: caja_externa.caja_externa_id, 
            no_caja: caja_externa.no_caja
        }));
        setActiveExternalTrailers(formattedActiveExternalTrailers);
      } else {
        setError(data.message || 'Error al obtener las cajas activas');
      }
    } catch (err) {
      setError('Error de red al obtener las cajas activas');
    } finally {
   
        setLoading(false);
    }
  }, [apiHost]); 

  useEffect(() => {
    fetchActiveCajas();
  }, [fetchActiveCajas]);


  return { activeExternalTrailers, loading, error, refetch: fetchActiveCajas };
}

export default useFetchActiveExternalTrailers;