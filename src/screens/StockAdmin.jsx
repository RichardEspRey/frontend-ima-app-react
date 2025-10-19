import React, { useState, useEffect } from 'react';
import {
    Container,
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
    const [page, setPage] = useState(0); // Página actual (inicia en 0)
    const [rowsPerPage, setRowsPerPage] = useState(20); // Filas por página

    useEffect(() => {
        const fetchInventory = async () => {
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
                // Usar el componente Snackbar de MUI para alertas sería mejor
                alert("No se pudo cargar el inventario.");
            } finally {
                setLoading(false);
            }
        };

        fetchInventory();
    }, []);

    // **Lógica de filtrado combinada**
    const filteredInventory = inventoryList.filter(item => {
        const matchesSearchTerm = (
            item.nombre_articulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.nombre_categoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.nombre_subcategoria.toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesCategory = (
            categoryFilter === 'Todas' ||
            item.nombre_categoria === categoryFilter
        );
        return matchesSearchTerm && matchesCategory;
    });
    
    // **Lógica de Paginación para mostrar solo 10 filas**
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
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); 
    };

    if (loading) {
        return (
            <Container style={{ textAlign: 'center', padding: '50px' }}>
                <CircularProgress />
                <Typography variant="h6" style={{ marginTop: '20px' }}>Cargando inventario...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="full" sx={{ pt: 3 }} style={{paddingTop:'0'}}>
            <Typography variant="h4" gutterBottom component={"h1"}>
                Administración de Stock
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 3, mb: 3, alignItems: 'center' }}>
                <TextField
                    label="Búsqueda Rápida"
                    variant="outlined"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setPage(0); // Reinicia la paginación al buscar
                    }}
                    placeholder="Buscar por artículo, categoría..."
                    sx={{ width: 300 }}
                />

                {/* Control: Filtro por Categoría (MUI Select) */}
                <FormControl sx={{ minWidth: 200 }}>
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
            </Box>

            <Paper elevation={3}>
                <TableContainer>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell scope="col">Artículo</TableCell>
                                <TableCell scope="col">Categoría</TableCell>
                                <TableCell scope="col">Subcategoría</TableCell>
                                <TableCell align="center" scope="col">Stock</TableCell> 
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
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Filas por página:" 
                    labelDisplayedRows={({ from, to, count }) => 
                        `${from}-${to} de ${count}`
                    }
                />
            </Paper>
        </Container>
    );
};

export default StockAdmin;