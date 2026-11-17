// hooks/useFetchActiveCajas.js
import { useState, useEffect, useCallback } from 'react'; 
import { pedirCatalogo, VIGENCIA_CATALOGO_MS } from '../utils/catalogos';

function useFetchActiveExternalTrailers() {
  const [activeExternalTrailers, setActiveExternalTrailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const fetchActiveCajas = useCallback(async (forzar = false) => {
    setLoading(true); 
    setError(null);   
    try {
      const data = await pedirCatalogo('caja_externa.php', 'getCajasExternasActivas', { vigenciaMs: VIGENCIA_CATALOGO_MS, forzar });

      if (data.status === 'success' && data.cajas) {
        const formattedActiveExternalTrailers = data.cajas.map(caja_externa => ({
            caja_externa_id: caja_externa.caja_externa_id, 
            no_caja: caja_externa.no_caja
        }));
        setActiveExternalTrailers(formattedActiveExternalTrailers);
      } else {
        setError(data.message || 'Error al obtener las cajas activas');
      }
    } catch {
      setError('Error de red al obtener las cajas activas');
    } finally {
   
        setLoading(false);
    }
  }, []); 

  useEffect(() => {
    fetchActiveCajas();
  }, [fetchActiveCajas]);


  const refetch = useCallback(() => fetchActiveCajas(true), [fetchActiveCajas]);

  return { activeExternalTrailers, loading, error, refetch };
}

export default useFetchActiveExternalTrailers;