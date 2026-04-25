import { useState, useEffect,  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Grid, Paper, Typography, TextField, Button, 
  Stack, Divider, IconButton, CircularProgress 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import Select from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

import useFetchInventoryItems from '../hooks/expense_hooks/useFetchInventoryItems';
import useFetchSubcategories from '../hooks/expense_hooks/useFetchSubcategories';
import useFetchCategories from '../hooks/expense_hooks/useFetchCategories';
import useFetchExpenseTypes from '../hooks/expense_hooks/useFetchExpenseTypes';
import useFetchExchangeRate from '../hooks/useFetchExchangeRate';

const customSelectStyles = {
  control: (provided) => ({
    ...provided, height: 56, borderRadius: 4, borderColor: 'rgba(0, 0, 0, 0.23)'
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999 })
};

const ID_MANTENIMIENTO = "3"; 

const ExpenseEdit = () => {
  const { id_gasto } = useParams();
  const navigate = useNavigate();
  const apiHost = import.meta.env.VITE_API_HOST;

  // Estados Generales
  const [country, setCountry] = useState(null);
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [ticketDate, setTicketDate] = useState(new Date());
  const [totalAmount, setTotalAmount] = useState('0.00');
  const [expenseDetails, setExpenseDetails] = useState([]);
  
  const [deletedDetails, setDeletedDetails] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Hooks Data
  const { expenseTypes, loading: typesLoading } = useFetchExpenseTypes();
  const { maintenanceCategories, loading: catLoading } = useFetchCategories();
  const { subcategories, loading: subLoading } = useFetchSubcategories();
  
  // Archivos
  const [files, setFiles] = useState({ facturaPdf: null, ticketJpg: null });

  const countries = [
    { value: 'MX', label: 'México' },
    { value: 'US', label: 'Estados Unidos' },
  ];

  // --- CARGA INICIAL ---
  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoading(true);
        const fd = new FormData();
        fd.append('op', 'getGastoById');
        fd.append('id_gasto', id_gasto);

        const res = await fetch(`${apiHost}/save_expense.php`, { method: 'POST', body: fd });
        const json = await res.json();

        if (json.status !== 'success') throw new Error(json.message);

        const data = json.data;
        
        // General
        setCountry(countries.find(c => c.value === data.pais) || null);
        setExpenseDate(new Date(`${data.fecha_gasto}T00:00:00`));
        if(data.fecha_ticket) setTicketDate(new Date(`${data.fecha_ticket}T00:00:00`));
        setTotalAmount(parseFloat(data.monto_total || 0).toFixed(2));

        // Detalles
        if (Array.isArray(data.detalles)) {
            const mapped = data.detalles.map(d => ({
                id: d.id_detalle_gasto,
                expenseType: d.id_tipo_gasto || null, 
                category: d.id_categoria_mantenimiento || null,
                subcategory: d.id_subcategoria_mantenimiento || null,
                itemDescription: d.descripcion_articulo || '',
                price: d.precio_unitario || '',
                quantity: d.cantidad_articulo || '1'
            }));
            setExpenseDetails(mapped);
        }

        // Archivos
        const ticket = data.tickets?.find(t => t.tipo_documento?.includes('Ticket'));
        const factura = data.tickets?.find(t => t.tipo_documento?.includes('Factura'));
        setFiles({
          ticketJpg: ticket ? { id_documento: ticket.id_documento, name: ticket.nombre_original, url: ticket.url } : null,
          facturaPdf: factura ? { id_documento: factura.id_documento, name: factura.nombre_original, url: factura.url } : null,
        });

      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
  }, [id_gasto, apiHost]);

  // --- HANDLERS ---
  const handleDetailChange = (id, field, value) => {
    setExpenseDetails(prev => prev.map(d => {
        if (d.id !== id) return d;
        const updated = { ...d, [field]: value };
        
        if (field === 'expenseType' && String(value) !== ID_MANTENIMIENTO) {
            updated.category = null;
            updated.subcategory = null;
        }
        if (field === 'category') updated.subcategory = null;
        return updated;
    }));
  };

  const handleRemoveDetail = (id) => {
      setDeletedDetails(p => [...p, id]);
      setExpenseDetails(p => p.filter(d => d.id !== id));
  };

  const handleAddDetail = () => {
      setExpenseDetails(p => [...p, {
          id: `new-${Date.now()}`,
          expenseType: null, category: null, subcategory: null,
          itemDescription: '', price: '', quantity: '1'
      }]);
  };

  const handleFileChange = (type, e) => {
      if (e.target.files[0]) setFiles(p => ({ ...p, [type]: e.target.files[0] }));
  };

  const handleRemoveFile = (type) => {
      if (files[type]?.id_documento) setDeletedFiles(p => [...p, files[type].id_documento]);
      setFiles(p => ({ ...p, [type]: null }));
  };

  // --- SAVE ---
  const handleSubmit = async () => {
      setSaving(true);
      try {
        const fd = new FormData();
        fd.append("op", "updateExpense");
        fd.append("id_gasto", id_gasto);
        fd.append("pais", country?.value || '');
        fd.append("fecha_gasto", expenseDate.toISOString().split('T')[0]);
        fd.append("fecha_ticket", ticketDate.toISOString().split('T')[0]);
        fd.append("monto_total", totalAmount);
        
        // Detalles
        const detailsToSend = expenseDetails.map(d => ({
            id_detalle_gasto: String(d.id).startsWith('new') ? null : d.id,
            id_tipo_gasto: d.expenseType,
            descripcion_articulo: d.itemDescription,
            precio_unitario: d.price,
            cantidad_articulo: d.quantity,
            id_categoria_mantenimiento: d.category,
            id_subcategoria_mantenimiento: d.subcategory
        }));
        fd.append("detalles", JSON.stringify(detailsToSend));
        
        if (deletedDetails.length) fd.append("eliminados", JSON.stringify(deletedDetails));
        if (deletedFiles.length) fd.append("archivos_eliminados", JSON.stringify(deletedFiles));

        if (files.facturaPdf instanceof File) fd.append("facturaPdf", files.facturaPdf);
        if (files.ticketJpg instanceof File) fd.append("ticketJpg", files.ticketJpg);

        const res = await fetch(`${apiHost}/save_expense.php`, { method: "POST", body: fd });
        const json = await res.json();

        if (json.status === "success") {
            Swal.fire("Éxito", "Gasto actualizado", "success");
            navigate('/admin-gastos');
        } else throw new Error(json.message);

      } catch (err) {
          Swal.fire("Error", err.message, 'error');
      } finally {
          setSaving(false);
      }
  };

  if (loading) return <Box p={5} display="flex" justifyContent="center"><CircularProgress /></Box>;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4" fontWeight={700}>Edit Expense #{id_gasto}</Typography>
            <Stack direction="row" spacing={2}>
                <Button variant="outlined" color="error" onClick={() => navigate(-1)}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={saving} startIcon={saving ? <CircularProgress size={20}/> : <SaveIcon/>}>
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </Stack>
        </Box>

        <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>General Data</Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <Typography variant="caption" fontWeight={600}>Country</Typography>
                            <Select 
                                value={country} onChange={setCountry} 
                                options={countries} styles={customSelectStyles} 
                            />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="caption" fontWeight={600}>Ticket Date</Typography>
                            <div style={{ display: 'block' }}>
                                <DatePicker selected={ticketDate} onChange={setTicketDate} className="form-input" />
                            </div>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Typography variant="caption" fontWeight={600}>Total Amount (USD)</Typography>
                            <TextField fullWidth type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} />
                        </Grid>
                    </Grid>
                </Paper>

                <Paper sx={{ p: 3 }}>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="h6" fontWeight={600}>Expense Details</Typography>
                        <Button size="small" variant="outlined" onClick={handleAddDetail}>+ Add Item</Button>
                    </Box>
                    
                    <Stack spacing={3}>
                        {expenseDetails.map((detail, index) => {
                            const isMaint = String(detail.expenseType) === ID_MANTENIMIENTO;
                            
                            const relevantSubs = subcategories.filter(s => s.id_categoria === detail.category);

                            return (
                                <Paper key={detail.id} variant="outlined" sx={{ p: 2, bgcolor: '#fafafa' }}>
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item xs={12} md={isMaint ? 4 : 12}>
                                            <Typography variant="caption">Type</Typography>
                                            <Select 
                                                options={expenseTypes} 
                                                value={expenseTypes.find(t => String(t.value) === String(detail.expenseType)) || null}
                                                onChange={opt => handleDetailChange(detail.id, 'expenseType', opt?.value)}
                                                styles={customSelectStyles}
                                                isLoading={typesLoading}
                                            />
                                        </Grid>
                                        
                                        {isMaint && (
                                            <>
                                                <Grid item xs={12} md={4}>
                                                    <Typography variant="caption">Category</Typography>
                                                    <Select 
                                                        options={maintenanceCategories}
                                                        value={maintenanceCategories.find(c => c.value === detail.category) || null}
                                                        onChange={opt => handleDetailChange(detail.id, 'category', opt?.value)}
                                                        styles={customSelectStyles}
                                                        isLoading={catLoading}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={4}>
                                                    <Typography variant="caption">Subcategory</Typography>
                                                    <Select 
                                                        options={relevantSubs}
                                                        value={relevantSubs.find(s => s.value === detail.subcategory) || null}
                                                        onChange={opt => handleDetailChange(detail.id, 'subcategory', opt?.value)}
                                                        styles={customSelectStyles}
                                                        isDisabled={!detail.category}
                                                        isLoading={subLoading}
                                                    />
                                                </Grid>
                                            </>
                                        )}

                                        <Grid item xs={12} md={6}>
                                            <TextField fullWidth label="Description" size="small" 
                                                value={detail.itemDescription} onChange={e => handleDetailChange(detail.id, 'itemDescription', e.target.value)} 
                                            />
                                        </Grid>
                                        <Grid item xs={6} md={2}>
                                            <TextField fullWidth label="Price" type="number" size="small" 
                                                value={detail.price} onChange={e => handleDetailChange(detail.id, 'price', e.target.value)} 
                                            />
                                        </Grid>
                                        <Grid item xs={6} md={2}>
                                            <TextField fullWidth label="Qty" type="number" size="small" 
                                                value={detail.quantity} onChange={e => handleDetailChange(detail.id, 'quantity', e.target.value)} 
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={2} display="flex" justifyContent="flex-end">
                                            <IconButton color="error" onClick={() => handleRemoveDetail(detail.id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            );
                        })}
                    </Stack>
                </Paper>
            </Grid>

            <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3, mb: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>Summary</Typography>
                    <Box mb={2}>
                        <Typography variant="body2"><strong>Date:</strong> {ticketDate.toLocaleDateString()}</Typography>
                        <Typography variant="body2"><strong>Items:</strong> {expenseDetails.length}</Typography>
                        <Typography variant="h5" color="primary" fontWeight={700} mt={1}>${totalAmount}</Typography>
                    </Box>
                </Paper>

                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>Documents</Typography>
                    
                    <Box mb={3}>
                        <Typography variant="caption" fontWeight={600}>Invoice (PDF)</Typography>
                        {files.facturaPdf ? (
                            <Paper variant="outlined" sx={{ p: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                                <Typography variant="caption" noWrap sx={{ maxWidth: 200 }}>
                                    {files.facturaPdf.name || 'Archivo Actual'}
                                </Typography>
                                <IconButton size="small" color="error" onClick={() => handleRemoveFile('facturaPdf')}><DeleteIcon fontSize="small"/></IconButton>
                            </Paper>
                        ) : (
                            <Button variant="outlined" component="label" fullWidth startIcon={<AttachFileIcon />} sx={{ mt: 1 }}>
                                Upload PDF <input hidden type="file" accept="application/pdf" onChange={e => handleFileChange('facturaPdf', e)} />
                            </Button>
                        )}
                    </Box>

                    <Box>
                        <Typography variant="caption" fontWeight={600}>Ticket (Image)</Typography>
                        {files.ticketJpg ? (
                            <Paper variant="outlined" sx={{ p: 1, mt: 1 }}>
                                <PhotoProvider>
                                    <PhotoView src={files.ticketJpg.url || (files.ticketJpg instanceof File ? URL.createObjectURL(files.ticketJpg) : '')}>
                                        <img 
                                            src={files.ticketJpg.url || (files.ticketJpg instanceof File ? URL.createObjectURL(files.ticketJpg) : '')} 
                                            alt="ticket" 
                                            style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 4, cursor: 'zoom-in' }} 
                                        />
                                    </PhotoView>
                                </PhotoProvider>
                                <Button size="small" color="error" fullWidth onClick={() => handleRemoveFile('ticketJpg')} sx={{ mt: 1 }}>Remove</Button>
                            </Paper>
                        ) : (
                            <Button variant="outlined" component="label" fullWidth startIcon={<AttachFileIcon />} sx={{ mt: 1 }}>
                                Upload Image <input hidden type="file" accept="image/*" onChange={e => handleFileChange('ticketJpg', e)} />
                            </Button>
                        )}
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    </Container>
  );
};

export default ExpenseEdit;