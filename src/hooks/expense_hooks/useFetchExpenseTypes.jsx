import { useState, useEffect, useCallback } from 'react';

import { postConReintento } from '../../utils/peticionConReintento';

const useFetchExpenseTypes = () => {
    const apiHost = import.meta.env.VITE_API_HOST;
    const [expenseTypes, setExpenseTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTypes = useCallback(async () => {
            try {
                // Asume que tu API está en el mismo archivo
                const formData = new FormData();
                formData.append('op', 'getExpenseTypes');

                const result = await postConReintento(`${apiHost}/save_expense.php`, formData);

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
    }, [apiHost]);

    useEffect(() => { fetchTypes(); }, [fetchTypes]);

    return { expenseTypes, loading, error, refetch: fetchTypes };
};

export default useFetchExpenseTypes;