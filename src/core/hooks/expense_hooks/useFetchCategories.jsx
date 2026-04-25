import { useState, useEffect, useCallback } from 'react';

// SUGERENCIA: Renombrar la función para que sea más descriptiva
function useFetchCategories() {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [maintenanceCategories, setMaintenanceCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('op', 'getCategories');

      const response = await fetch(`${apiHost}/save_expense.php`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      
      if (data.status === 'success' && Array.isArray(data.data)) {
        
      
        const formattedCategories = data.data.map(category => ({
          value: category.value, 
          label: category.label,      
        }));
        setMaintenanceCategories(formattedCategories);

      } else {
        setError(data.message || 'Error al obtener las categorías de mantenimiento');
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError('Error de red al obtener las categorías');
    } finally {
      setLoading(false);
    }
  }, [apiHost]); 

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]); 

  return { maintenanceCategories, loading, error, refetch: fetchCategories };
}

// SUGERENCIA: Exportar con el nuevo nombre
export default useFetchCategories;