import { Box, Typography, Grid, IconButton, TextField, InputLabel, Paper} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpenseSelect from './ExpenseSelect';
import { useMemo } from 'react';

const DetailRow = ({ 
    detail, index, ID_MANTENIMIENTO, 
    handleDetailChange, handleArticleChange, handleRemoveDetail, getSubtotal, 
    expenseTypes, maintenanceCategories, subcategories, inventoryItems, 
    typesLoading, categoriesLoading, subcategoriesLoading, itemsLoading
}) => {

    const filteredSubcategories = useMemo(() => 
        (subcategories || []).filter(sub => parseInt(sub.id_categoria) === parseInt(detail.category)),
    [subcategories, detail.category]);

    const filteredItems = useMemo(() => 
        (inventoryItems || []).filter(item => parseInt(item.id_subcategoria) === parseInt(detail.subcategory)),
    [inventoryItems, detail.subcategory]);


    const currentItemValue = detail.itemDescription
        ? { value: detail.itemId, label: detail.itemDescription }
        : null;

    return (
        <Paper elevation={1} sx={{ p: 2, mb: 3, border: '1px solid #ccc' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                    Detalle de Gasto {index + 1}
                </Typography>
                <IconButton color="error" onClick={() => handleRemoveDetail(detail.id)} title="Eliminar detalle">
                    <DeleteIcon />
                </IconButton>
            </Box>

            <Grid container spacing={2} alignItems="flex-end">
                {/* Fila 1: Tipo de Gasto, Precio, Cantidad */}
                <Grid item xs={12} sm={4}>
                    <ExpenseSelect
                        label="Expense Type:"
                        options={expenseTypes}
                        isLoading={typesLoading}
                        value={expenseTypes.find(o => o.value === detail.expenseType)}
                        onChange={(selection) => handleDetailChange(detail.id, { expenseType: selection ? selection.value : null })}
                    />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <TextField
                        fullWidth size="small" type="number" label="Price:"
                        value={detail.price}
                        onChange={(e) => handleDetailChange(detail.id, { price: e.target.value })}
                    />
                </Grid>
                <Grid item xs={6} sm={3}>
                    <TextField
                        fullWidth size="small" type="number" label="Quantity:"
                        value={detail.quantity}
                        onChange={(e) => handleDetailChange(detail.id, { quantity: e.target.value })}
                    />
                </Grid>
                <Grid item xs={12} sm={2} sx={{ mb: 2 }}>
                    <InputLabel sx={{ fontWeight: 600, fontSize: '0.9rem' }}>Subtotal:</InputLabel>
                    <Typography variant="body1" fontWeight={700}>${getSubtotal(detail.price, detail.quantity)}</Typography>
                </Grid>
                

                {/* Fila 2: Campos de Mantenimiento (Condicional) */}
                {detail.expenseType === ID_MANTENIMIENTO && (
                    <>
                        <Grid item xs={12} md={4}>
                            <ExpenseSelect
                                label="Category (Maint.):"
                                options={maintenanceCategories}
                                isLoading={categoriesLoading}
                                value={maintenanceCategories.find(o => o.value === detail.category)}
                                onChange={(selection) => handleDetailChange(detail.id, { category: selection ? selection.value : null })}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <ExpenseSelect
                                label="Subcategory (Maint.):"
                                options={filteredSubcategories}
                                isLoading={subcategoriesLoading}
                                value={filteredSubcategories.find(o => o.value === detail.subcategory)}
                                onChange={(selection) => handleDetailChange(detail.id, { subcategory: selection ? selection.value : null })}
                                isDisabled={!detail.category || subcategoriesLoading}
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <ExpenseSelect
                                label="Item (Maint.):" isCreatable
                                options={filteredItems}
                                isLoading={itemsLoading}
                                value={currentItemValue}
                                onChange={(selection) => handleArticleChange(selection, detail)}
                                isDisabled={!detail.subcategory || itemsLoading}
                                placeholder="Select or type an item..."
                            />
                        </Grid>
                    </>
                )}
            </Grid>
        </Paper>
    );
};

export default DetailRow;