import { useState, useEffect } from 'react';

// 1. Cambiamos el nombre del hook para que sea específico a su función.
const useFetchRepairTypes = () => {
    const apiHost = import.meta.env.VITE_API_HOST;
    
    // 2. Renombramos las variables de estado para mayor claridad.
    const [repairTypes, setRepairTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    // 3. Adaptamos el nombre de la función y los detalles de la API.
    const fetchTypes = async () => {
        setLoading(true); // Se activa el loading en cada llamada
        const formData = new FormData();
        // La operación en PHP ahora es la que creamos para los tipos de reparación.
        formData.append('op', 'getRepairTypes'); 

        try {
            // Apuntamos al endpoint correcto.
            const response = await fetch(`${apiHost}/service_order.php`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (result.status === 'success') {
                // La data ya viene como { value, label }, perfecta para react-select.
                setRepairTypes(result.data);
            }
        } catch (error) {
            console.error("Error fetching repair types:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTypes();
    }, []);

    // 4. Devolvemos la función `fetchTypes` para poder "refrescar" la lista 
    //    desde el componente principal después de crear un nuevo tipo.
    return { 
        repairTypes, 
        loadingRepairTypes: loading, // Renombramos 'loading' para evitar conflictos
        refetchRepairTypes: fetchTypes // <-- Esta es la función para refrescar
    };
};

export default useFetchRepairTypes;