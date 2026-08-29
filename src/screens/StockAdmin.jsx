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
    Button,
    Chip,
    TableFooter
} from '@mui/material';

import {
    HEADER_ROW_SX, HEADER_CELL_SX, TABLE_CONTAINER_SX, CARD_SX, SECTION_LABEL_SX,
    PAGINATION_BOX_SX, PAGINATION_SX, GHOST_BTN_SX, CELL_STRONG_SX, CELL_MUTED_SX, CHIP_SX,
} from '../styles/estilosTabla';

// **Definición de las categorías para el filtro**
const CATEGORIES = ['Todas', 'Consumibles', 'Refacciones', 'Herramientas'];

const TONO_NEUTRO = { bg: '#f8fafc', texto: '#475569', borde: '#e2e8f0', acento: '#cbd5e1' };

const TONOS_CATEGORIA = {
    Refacciones: { bg: '#eef2ff', texto: '#4338ca', borde: '#e0e7ff', acento: '#6366f1' },
    Consumibles: { bg: '#f0fdfa', texto: '#0f766e', borde: '#99f6e4', acento: '#14b8a6' },
    Herramientas: { bg: '#fffbeb', texto: '#b45309', borde: '#fde68a', acento: '#f59e0b' },
    Basicos: { bg: '#f5f3ff', texto: '#6d28d9', borde: '#ddd6fe', acento: '#8b5cf6' },
};

const tonoCategoria = (nombre) => TONOS_CATEGORIA[nombre] || TONO_NEUTRO;

const tonoStock = (cantidad) => (
    cantidad <= 0
        ? { bg: '#fef2f2', texto: '#b91c1c', borde: '#fecaca' }
        : { bg: '#f8fafc', texto: '#334155', borde: '#e2e8f0' }
);


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
    const agotados = useMemo(
        () => filteredInventory.filter(item => (Number(item.cantidad_stock) || 0) <= 0).length,
        [filteredInventory]
    );

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

    return (
        <Box>
            <Paper elevation={0} sx={{ ...CARD_SX, mb: 3 }}>
                <Typography variant="overline" sx={SECTION_LABEL_SX}>
                    Filtros de Búsqueda
                </Typography>

                <Stack direction="row" spacing={2} sx={{ mt: 1.5 }} alignItems="center" flexWrap="wrap" useFlexGap>
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
                
                    <Button
                        variant="outlined"
                        onClick={fetchInventory}
                        sx={{ ...GHOST_BTN_SX, py: 0.75 }}
                    >
                        Refrescar
                    </Button>
                </Stack>
            </Paper>

            <TableContainer component={Paper} elevation={0} sx={TABLE_CONTAINER_SX}>
                <Table size="small">
                    <TableHead>
                        <TableRow sx={HEADER_ROW_SX}>
                            <TableCell scope="col" sx={HEADER_CELL_SX}>Artículo</TableCell>
                            <TableCell scope="col" sx={HEADER_CELL_SX}>Categoría</TableCell>
                            <TableCell scope="col" sx={HEADER_CELL_SX}>Subcategoría</TableCell>
                            <TableCell scope="col" sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Stock</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        ) : paginatedInventory.length > 0 ? (
                            paginatedInventory.map(item => (
                                <TableRow key={item.id_articulo} hover>
                                    <TableCell
                                        component="th"
                                        scope="row"
                                        sx={{ ...CELL_STRONG_SX, borderLeft: `3px solid ${tonoCategoria(item.nombre_categoria).acento}` }}
                                    >
                                        {item.nombre_articulo?.trim() || (
                                            <Box component="span" sx={{ color: '#94a3b8', fontWeight: 500 }}>Sin nombre</Box>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="small"
                                            label={item.nombre_categoria || '—'}
                                            sx={{
                                                ...CHIP_SX,
                                                bgcolor: tonoCategoria(item.nombre_categoria).bg,
                                                color: tonoCategoria(item.nombre_categoria).texto,
                                                border: `1px solid ${tonoCategoria(item.nombre_categoria).borde}`,
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={CELL_MUTED_SX}>{item.nombre_subcategoria || '—'}</TableCell>
                                    <TableCell align="center">
                                        <Box
                                            component="span"
                                            sx={{
                                                display: 'inline-block', minWidth: 44, py: 0.25, borderRadius: 1.5,
                                                fontWeight: 700, fontSize: '0.78rem',
                                                bgcolor: tonoStock(Number(item.cantidad_stock) || 0).bg,
                                                color: tonoStock(Number(item.cantidad_stock) || 0).texto,
                                                border: `1px solid ${tonoStock(Number(item.cantidad_stock) || 0).borde}`,
                                            }}
                                        >
                                            {item.cantidad_stock}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                    <Typography variant="body2" color="#64748b" fontWeight={600}>
                                        No se encontraron artículos.
                                    </Typography>
                                    <Typography variant="caption" color="#94a3b8">
                                        Ajusta la búsqueda o el filtro de categoría.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}

                        {emptyRows > 0 && paginatedInventory.length > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={4} />
                            </TableRow>
                        )}
                    </TableBody>

                    {!loading && filteredInventory.length > 0 && (
                        <TableFooter>
                            <TableRow sx={{ bgcolor: '#f8fafc', '& td': { borderTop: '2px solid #e2e8f0', borderBottom: 'none' } }}>
                                <TableCell colSpan={2} sx={{ py: 1.75 }}>
                                    <Typography variant="caption" sx={{ ...SECTION_LABEL_SX, textTransform: 'uppercase' }}>
                                        Resumen
                                    </Typography>
                                    <Typography variant="body2" color="#64748b">
                                        {filteredInventory.length} artículo{filteredInventory.length === 1 ? '' : 's'}
                                    </Typography>
                                </TableCell>
                                <TableCell colSpan={2} align="right" sx={{ py: 1.75 }}>
                                    <Chip
                                        size="small"
                                        label={`${agotados} agotado${agotados === 1 ? '' : 's'}`}
                                        sx={{ ...CHIP_SX, bgcolor: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
                                    />
                                </TableCell>
                            </TableRow>
                        </TableFooter>
                    )}
                </Table>
            </TableContainer>

            <Box sx={PAGINATION_BOX_SX}>
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
                    sx={PAGINATION_SX}
                />
            </Box>
        </Box>
    );
};

export default StockAdmin;