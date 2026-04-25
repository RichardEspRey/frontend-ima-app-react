import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination, 
    CircularProgress,
    Stack,
    Button
} from '@mui/material';

// **Definición de las categorías para el filtro**
const CATEGORIES = ['Todas', 'Consumibles', 'Refacciones', 'Herramientas'];

const StockAdmin = () => {
    const [inventoryList, setInventoryList] = useState([]);
    const apiHost = import.meta.env.VITE_API_HOST;
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('Todas');
    const [loading, setLoading] = useState(true);

    // **Estados de Paginación**
    const [page, setPage] = useState(0); 
    const [rowsPerPage, setRowsPerPage] = useState(20); 

    const fetchInventory = useCallback(async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append('op', 'getFullInventoryList');

        try {
            const response = await fetch(`${apiHost}/inventory.php`, {
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
    }, [apiHost]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    // **Lógica de filtrado combinada**
    const filteredInventory = useMemo(() => {
        const searchLower = searchTerm.toLowerCase();
        
        return inventoryList.filter(item => {
            const matchesSearchTerm = (
                item.nombre_articulo.toLowerCase().includes(searchLower) ||
                item.nombre_categoria.toLowerCase().includes(searchLower) ||
                item.nombre_subcategoria.toLowerCase().includes(searchLower)
            );
            const matchesCategory = (
                categoryFilter === 'Todas' ||
                item.nombre_categoria === categoryFilter
            );
            return matchesSearchTerm && matchesCategory;
        });
    }, [inventoryList, searchTerm, categoryFilter]);
    
    // **Lógica de Paginación**
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredInventory.length - page * rowsPerPage);

    const paginatedInventory = filteredInventory.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    // **Manejadores de Paginación**
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        // Manejo de opción "Todos"
        const value = parseInt(event.target.value, 10);
        setRowsPerPage(value === -1 ? filteredInventory.length : value);
        setPage(0); 
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', p: 3 }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>Cargando inventario...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}> 
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                Administración de Stock
            </Typography>
            
            <Stack direction="row" spacing={3} sx={{ mb: 3 }} alignItems="center">
                <TextField
                    label="Búsqueda Rápida"
                    variant="outlined"
                    size="small" 
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(0); 
                    }}
                    placeholder="Buscar por artículo, categoría..."
                    sx={{ width: 300 }}
                />

                {/* Control: Filtro por Categoría (MUI Select) */}
                <FormControl sx={{ minWidth: 200 }} size="small"> 
                    <InputLabel id="category-label">Filtrar por Categoría</InputLabel>
                    <Select
                        labelId="category-label"
                        value={categoryFilter}
                        label="Filtrar por Categoría"
                        onChange={(e) => {
                            setCategoryFilter(e.target.value);
                            setPage(0); 
                        }}
                    >
                        {CATEGORIES.map(category => (
                            <MenuItem key={category} value={category}>
                                {category}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                
                <Button variant="contained" onClick={fetchInventory} size="small">Refrescar</Button>
            </Stack>

            <Paper elevation={3}>
                <TableContainer sx={{ overflowX: 'auto' }}> 
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell scope="col" sx={{ fontWeight: 600 }}>Artículo</TableCell>
                                <TableCell scope="col" sx={{ fontWeight: 600 }}>Categoría</TableCell>
                                <TableCell scope="col" sx={{ fontWeight: 600 }}>Subcategoría</TableCell>
                                <TableCell align="center" scope="col" sx={{ fontWeight: 600 }}>Stock</TableCell> 
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {paginatedInventory.length > 0 ? (
                                paginatedInventory.map(item => (
                                    <TableRow key={item.id_articulo} hover>
                                        <TableCell component="th" scope="row">
                                            {item.nombre_articulo}
                                        </TableCell>
                                        <TableCell>{item.nombre_categoria}</TableCell>
                                        <TableCell>{item.nombre_subcategoria}</TableCell>
                                        <TableCell align="center">{item.cantidad_stock}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        No se encontraron artículos con los filtros aplicados.
                                    </TableCell>
                                </TableRow>
                            )}

                            {emptyRows > 0 && paginatedInventory.length > 0 && (
                                <TableRow style={{ height: 53 * emptyRows }}>
                                    <TableCell colSpan={4} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[20, 50, 100, { label: 'Todos', value: -1 }]} 
                    component="div"
                    count={filteredInventory.length} 
                    rowsPerPage={rowsPerPage === filteredInventory.length ? -1 : rowsPerPage} 
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:" 
                    labelDisplayedRows={({ from, to, count }) => 
                        `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                    }
                />
            </Paper>
        </Box>
    );
};

export default StockAdmin;