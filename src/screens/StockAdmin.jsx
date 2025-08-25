import React, { useState, useEffect } from 'react';

// (Puedes poner estos estilos en un archivo .css si lo prefieres)
const styles = {
    container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
    filterInput: {
        padding: '10px',
        fontSize: '16px',
        width: '300px',
        marginBottom: '20px',
    },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: {
        borderBottom: '2px solid #333',
        padding: '12px',
        textAlign: 'left',
        backgroundColor: '#f2f2f2',
    },
    td: { borderBottom: '1px solid #ddd', padding: '12px' },
};

const StockAdmin = () => {
    const [inventoryList, setInventoryList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInventory = async () => {
            setLoading(true);
            const formData = new FormData();
            formData.append('op', 'getFullInventoryList');

            try {
         
                const response = await fetch('http://localhost/API/inventory.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                
                if (result.status === 'success') {
                    setInventoryList(result.data);
                }
            } catch (error) {
                console.error("Error al cargar el inventario:", error);
                alert("No se pudo cargar el inventario.");
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);

    // Filtramos la lista basándonos en lo que el usuario busca
    const filteredInventory = inventoryList.filter(item =>
        item.nombre_articulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nombre_categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.nombre_subcategoria.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <h2 style={styles.container}>Cargando inventario...</h2>;
    }

    return (
        <div style={styles.container}>
            <h2>Administración de Stock</h2>
            
            <input
                type="text"
                style={styles.filterInput}
                placeholder="Buscar por artículo, categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            
            <table style={styles.table}>
                <thead>
                    <tr>
                        <th style={styles.th}>Artículo</th>
                        <th style={styles.th}>Categoría</th>
                        <th style={styles.th}>Subcategoría</th>
                        <th style={{...styles.th, textAlign: 'center'}}>Stock</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredInventory.length > 0 ? (
                        filteredInventory.map(item => (
                            <tr key={item.id_articulo}>
                                <td style={styles.td}>{item.nombre_articulo}</td>
                                <td style={styles.td}>{item.nombre_categoria}</td>
                                <td style={styles.td}>{item.nombre_subcategoria}</td>
                                <td style={{...styles.td, textAlign: 'center'}}>{item.cantidad_stock}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" style={styles.td}>No se encontraron artículos.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default StockAdmin;