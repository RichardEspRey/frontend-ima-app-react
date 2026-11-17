// hooks/useFetchActiveCajas.js
import { useState, useEffect } from 'react';
import { pedirCatalogo, VIGENCIA_UNIDADES_MS } from '../utils/catalogos';

function useFetchActiveTrailers() {
  const [activeTrailers, setActiveTrailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveCajas = async () => {
      try {
        const data = await pedirCatalogo('cajas.php', 'getCajasActivas', { vigenciaMs: VIGENCIA_UNIDADES_MS });

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
      } catch {
        setError('Error de red al obtener las cajas activas');
        setLoading(false);
      }
    };

    fetchActiveCajas();
  }, []);

  return { activeTrailers, loading, error };
}

export default useFetchActiveTrailers;