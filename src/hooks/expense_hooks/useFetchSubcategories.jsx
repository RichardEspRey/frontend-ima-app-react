import { useState, useEffect } from 'react';

const useFetchSubcategories = () => {
    const apiHost = import.meta.env.VITE_API_HOST;
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllSubcategories = async () => {
            const formData = new FormData();
            formData.append('op', 'getAllSubcategories'); 

            try {
                const response = await fetch(`${apiHost}/save_expense.php`, {
                    method: 'POST',
                    body: formData,
                });
                const result = await response.json();
                if (result.status === 'success') {
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