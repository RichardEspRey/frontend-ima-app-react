import { useState, useEffect } from 'react';

const useFetchInventoryItems = () => {
    const apiHost = import.meta.env.VITE_API_HOST;
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllItems = async () => {
            const formData = new FormData();
            
            // --- ESTA ES LA LÍNEA CRÍTICA ---
            // Aquí le decimos a PHP qué operación queremos: tráeme TODOS los artículos.
            formData.append('op', 'getAllInventoryItems'); 

            try {
                // Este es el fetch que busca los datos
                const response = await fetch(`${apiHost}/save_expense.php`, {
                    method: 'POST',
                    body: formData,
                });
                
                const result = await response.json();

                if (result.status === 'success') {
                    // Guardamos la lista completa de artículos en el estado
                    setInventoryItems(result.data);
                } else {
                    // Si algo sale mal, dejamos la lista vacía
                    setInventoryItems([]);
                }
            } catch (error) {
                console.error("Error fetching all inventory items:", error);
                setInventoryItems([]); // En caso de error, también la dejamos vacía
            } finally {
                setLoading(false);
            }
        };

        fetchAllItems();
    }, []); // El array vacío [] asegura que esto se ejecute solo una vez, cuando el componente se monta.

    // Devolvemos la lista y la función para poder modificarla después
    return { inventoryItems, loading, setInventoryItems }; 
};

export default useFetchInventoryItems;