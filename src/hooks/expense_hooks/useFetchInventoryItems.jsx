import { useState, useEffect } from 'react';

const useFetchInventoryItems = () => {
    const apiHost = import.meta.env.VITE_API_HOST;
    const [inventoryItems, setInventoryItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllItems = async () => {
            const formData = new FormData();
            
            formData.append('op', 'getAllInventoryItems'); 

            try {
                const response = await fetch(`${apiHost}/save_expense.php`, {
                    method: 'POST',
                    body: formData,
                });
                
                const result = await response.json();

                if (result.status === 'success') {
                    setInventoryItems(result.data);
                } else {
                    setInventoryItems([]);
                }
            } catch (error) {
                console.error("Error fetching all inventory items:", error);
                setInventoryItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAllItems();
    }, []); 

    
    return { inventoryItems, loading, setInventoryItems }; 
};

export default useFetchInventoryItems;