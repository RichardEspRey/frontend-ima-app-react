// hooks/useFetchCompanies.js
import { useState, useEffect } from 'react';

function useFetchCompanies() {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [activeCompanies, setActiveCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCompanies = async () => { // <-- Esta función ahora puede ser llamada externamente
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiHost}/companies.php`, { // Ajusta la URL si es diferente
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'op=getCompanies', // Asumiendo que esta es tu operación para obtener todas las compañías
      });
      const data = await response.json();
      if (data.status === 'success' && data.companies) { // Asegúrate que la respuesta tenga 'companies'
        setActiveCompanies(data.companies);
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

  return { activeCompanies, loading, error, refetchCompanies: fetchCompanies }; // ###Agregar: Devuelve la función de refetch
}

export default useFetchCompanies;