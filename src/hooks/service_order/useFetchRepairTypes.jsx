import { useState, useEffect } from 'react';

const useFetchRepairTypes = () => {
    const apiHost = import.meta.env.VITE_API_HOST;
    
    const [repairTypes, setRepairTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTypes = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('op', 'getRepairTypes'); 

        try {
            const response = await fetch(`${apiHost}/service_order.php`, {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (result.status === 'success') {
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

    return { 
        repairTypes, 
        loadingRepairTypes: loading,
        refetchRepairTypes: fetchTypes
    };
};

export default useFetchRepairTypes;