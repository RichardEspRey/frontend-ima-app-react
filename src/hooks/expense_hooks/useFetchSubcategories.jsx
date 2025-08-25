import { useState, useEffect } from 'react';

// Este hook ahora trae TODAS las subcategorías de una vez.
const useFetchSubcategories = () => {
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllSubcategories = async () => {
            const formData = new FormData();
            // La operación en PHP debe ser una que traiga todas las subcategorías
            formData.append('op', 'getAllSubcategories'); 

            try {
                const response = await fetch('http://localhost/API/save_expense.php', {
                    method: 'POST',
                    body: formData,
                });
                const result = await response.json();
                if (result.status === 'success') {
                    // Importante: La data de PHP debe incluir el ID de la categoría padre
                    // para poder filtrar. Ej: { value: 10, label: 'Sub X', id_categoria: 1 }
                    setSubcategories(result.data);
                }
            } catch (error) {
                console.error("Error fetching all subcategories:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllSubcategories();
    }, []);

    return { subcategories, loading };
};

export default useFetchSubcategories;