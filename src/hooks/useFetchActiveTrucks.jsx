
import { useState, useEffect } from 'react';
import { pedirCatalogo, VIGENCIA_UNIDADES_MS } from '../utils/catalogos';

function useFetchActiveTrucks() {
  const [activeTrucks, setActiveTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveTrucks = async () => {
      try {
        const data = await pedirCatalogo('trucks.php', 'getTrucksActivos', { vigenciaMs: VIGENCIA_UNIDADES_MS });

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
      } catch {
        setError('Error de red al obtener los trucks activos');
        setLoading(false);
      }
    };

    fetchActiveTrucks();
  }, []);

  return { activeTrucks, loading, error };
}

export default useFetchActiveTrucks;