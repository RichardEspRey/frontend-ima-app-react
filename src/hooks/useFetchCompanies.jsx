// hooks/useFetchActiveCompanies.js
import { useState, useEffect } from 'react';

function useFetchCompanies() {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [activeCompanies, setActiveCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveCompanies = async () => {
      try {
        const response = await fetch(`${apiHost}/companies.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'op=getCompanies',
        });
        const data = await response.json();

        if (data.status === 'success' && data.companies) {
          const formattedActiveCompanies = data.companies.map(company => ({
            company_id: company.company_id,
            nombre_compania: company.nombre_compania, 
          }));
          setActiveCompanies(formattedActiveCompanies);
          setLoading(false);
        } else {
          setError(data.message || 'Error al obtener los Companies');
          setLoading(false);
        }
      } catch (err) {
        setError('Error de red al obtener los Companies');
        setLoading(false);
      }
    };

    fetchActiveCompanies();
  }, []);

  return { activeCompanies, loading, error };
}

export default useFetchCompanies;