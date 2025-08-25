import { useState, useEffect } from 'react';

const useFetchExpenseTypes = () => {
    const apiHost = import.meta.env.VITE_API_HOST;
    const [expenseTypes, setExpenseTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTypes = async () => {
            try {
                // Asume que tu API está en el mismo archivo
                const formData = new FormData();
                formData.append('op', 'getExpenseTypes');

                const response = await fetch(`${apiHost}/save_expense.php`, {
                    method: 'POST',
                    body: formData
                });
                
                const result = await response.json();

                if (result.status === 'success') {
                    setExpenseTypes(result.data);
                } else {
                    throw new Error(result.message || 'Error fetching expense types');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTypes();
    }, []);

    return { expenseTypes, loading, error };
};

export default useFetchExpenseTypes;