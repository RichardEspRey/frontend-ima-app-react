// hooks/useFetchCompanies.js
import { useState, useEffect } from 'react';
import { pedirCatalogo, VIGENCIA_CATALOGO_MS } from '../utils/catalogos';

function useFetchCompanies() {
  const [activeCompanies, setActiveCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanies = async (forzar = false) => { // <-- Esta función ahora puede ser llamada externamente
    setLoading(true);
    setError(null);
    try {
      const data = await pedirCatalogo('companies.php', 'getCompanies', { vigenciaMs: VIGENCIA_CATALOGO_MS, forzar });
      if (data.status === 'success' && data.companies) { // Asegúrate que la respuesta tenga 'companies'
        setActiveCompanies([...data.companies]);
      } else {
        setError(data.message || 'Error al obtener compañías.');
      }
    } catch (err) {
      setError(err.message || 'Error de red al cargar compañías.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(); // Se ejecuta al montar el componente
  }, []);

  return { activeCompanies, loading, error, refetchCompanies: () => fetchCompanies(true) }; // ###Agregar: Devuelve la función de refetch
}

export default useFetchCompanies;