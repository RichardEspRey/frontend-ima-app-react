import React, { useMemo, useRef, useState, useEffect } from "react";
import { 
  Box, Container, Grid, Paper, Typography, TextField, Button, 
  MenuItem, Divider, FormControlLabel, Switch, IconButton, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
  CircularProgress, Stack, InputAdornment
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

import useFetchInventoryItems from "../hooks/expense_hooks/useFetchInventoryItems";
import useFetchRepairTypes from "../hooks/service_order/useFetchRepairTypes";

const apiHost = import.meta.env.VITE_API_HOST;

const customSelectStyles = {
  control: (provided) => ({
    ...provided, height: 56, borderRadius: 4, borderColor: 'rgba(0, 0, 0, 0.23)',
    '&:hover': { borderColor: 'rgba(0, 0, 0, 0.87)' }
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999 })
};

const money = (v) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD" }).format(Number(v || 0));

export default function ServiceOrderScreen() {
    const navigate = useNavigate();

    // --- Hooks ---
    const { inventoryItems, loading: itemsLoading } = useFetchInventoryItems();
    const { repairTypes, refetchRepairTypes } = useFetchRepairTypes(); 
    const [trucks, setTrucks] = useState([]);

    // Cargar Camiones
    useEffect(() => {
        const fetchTrucks = async () => {
            const formData = new FormData();
            formData.append("op", "getTrucks");
            try {
                const res = await fetch(`${apiHost}/service_order.php`, { method: "POST", body: formData });
                const json = await res.json();
                if (json.status === "success") setTrucks(json.data || []);
            } catch (e) { console.error(e); }
        };
        fetchTrucks();
    }, []);

    // --- Estados Generales ---
    const [selectedTruck, setSelectedTruck] = useState(null);
    const [dateForm, setDateForm] = useState(new Date().toISOString().slice(0, 10));
    const [tipoCambioOrden, setTipoCambioOrden] = useState("");
    
    // --- Estados Builder (Servicio actual) ---
    const [tipoMantenimiento, setTipoMantenimiento] = useState("Correctivo");
    const [origenServicio, setOrigenServicio] = useState("Interno");
    const [tipoReparacion, setTipoReparacion] = useState(null);
    const [costoMO, setCostoMO] = useState("");
    const [usarItems, setUsarItems] = useState(false);

    // Items Builder
    const [itemSeleccionado, setItemSeleccionado] = useState(null);
    const [cant, setCant] = useState(1);
    const [pendItems, setPendItems] = useState([]);
    
    // Lista de Servicios (Ticket)
    const [services, setServices] = useState([]);
    const [saving, setSaving] = useState(false);
    const seq = useRef(1);

    // --- Memos ---
    const truckOptions = useMemo(() => trucks.map(t => ({ value: t.value, label: t.label })), [trucks]);
    const invOptions = useMemo(() => inventoryItems.map(it => ({
        value: it.value, label: it.label,
        costo_unidad: parseFloat(it.costo_unidad || 0),
        cantidad_stock: parseInt(it.cantidad_stock || 0, 10),
    })), [inventoryItems]);

    const stockSelected = itemSeleccionado?.cantidad_stock || 0;

    // --- Handlers ---
    const addItemToPending = (tipo) => {
        if (!itemSeleccionado || !cant || cant <= 0) return;
        setPendItems(prev => [...prev, {
            uid: Date.now() + Math.random(),
            item_id: itemSeleccionado.value,
            descripcion: itemSeleccionado.label,
            tipo, 
            cantidad: Number(cant),
            costo_unitario: itemSeleccionado.costo_unidad,
            subtotal: Number(cant) * itemSeleccionado.costo_unidad
        }]);
        setItemSeleccionado(null);
        setCant(1);
    };

    const agregarServicio = () => {
        if (!selectedTruck) return Swal.fire("Falta camión", "Selecciona un camión primero", "warning");
        if (!tipoReparacion) return Swal.fire("Falta reparación", "Selecciona el tipo de reparación", "warning");
        
        setServices(prev => [...prev, {
            id: seq.current++,
            tipo_mantenimiento: tipoMantenimiento,
            origen_servicio: origenServicio,
            tipo_reparacion_label: tipoReparacion.label,
            costo_mano_obra: Number(costoMO || 0),
            items: usarItems ? [...pendItems] : []
        }]);
        
        setTipoReparacion(null);
        setCostoMO("");
        setPendItems([]);
        setUsarItems(false);
    };

    const handleCreateRepair = (val) => setTipoReparacion({label: val, value: val});

    const totalGeneral = useMemo(() => services.reduce((acc, s) => {
        const itemsTotal = s.items.reduce((a, i) => a + i.subtotal, 0);
        return acc + itemsTotal + s.costo_mano_obra;
    }, 0), [services]);

    const enviarOrden = async () => {
        if (services.length === 0) return Swal.fire("Sin servicios", "Agrega al menos un servicio", "warning");
        setSaving(true);
        
        const payload = {
            truck_id: selectedTruck.value,
            fecha: dateForm,
            tipo_cambio: tipoCambioOrden,
            servicios: services
        };

        const fd = new FormData();
        fd.append("op", "AltaOrden");
        fd.append("truck_id", payload.truck_id);
        fd.append("fecha", payload.fecha);
        if(payload.tipo_cambio) fd.append("tipo_cambio", payload.tipo_cambio);
        fd.append("servicios", JSON.stringify(payload.servicios));

        try {
            const res = await fetch(`${apiHost}/service_order.php`, { method: "POST", body: fd });
            const json = await res.json();
            if (json.status === "success") {
                Swal.fire("¡Orden Creada!", `Folio: ${json.id_orden}`, "success");
                navigate('/admin-service-order');
            } else {
                throw new Error(json.message);
            }
        } catch (e) {
            Swal.fire("Error", e.message, "error");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" fontWeight={700} color="text.primary">Nueva Orden de Servicio</Typography>
                    <Typography variant="body2" color="text.secondary">Registro inicial de mantenimiento</Typography>
                </Box>
                <Button variant="outlined" color="inherit" onClick={() => navigate('/admin-service-order')}>
                    Cancelar
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} lg={8}>
                    
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={2}>
                        <Typography variant="h6" gutterBottom fontWeight={600} color="primary">Datos Generales</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4}>
                                <Typography variant="caption" fontWeight={600}>Camión</Typography>
                                <Select 
                                    options={truckOptions} 
                                    value={selectedTruck} 
                                    onChange={setSelectedTruck} 
                                    placeholder="Seleccionar..." 
                                    styles={customSelectStyles}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="caption" fontWeight={600}>Fecha</Typography>
                                <TextField 
                                    type="date" 
                                    fullWidth 
                                    value={dateForm} 
                                    onChange={e => setDateForm(e.target.value)} 
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="caption" fontWeight={600}>Tipo Cambio (Opcional)</Typography>
                                <TextField 
                                    type="number" 
                                    fullWidth 
                                    placeholder="Ej. 18.50"
                                    value={tipoCambioOrden} 
                                    onChange={e => setTipoCambioOrden(e.target.value)} 
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper sx={{ p: 3, borderRadius: 2 }} elevation={2}>
                        <Typography variant="h6" fontWeight={600} gutterBottom color="primary">
                            Agregar Servicio
                        </Typography>
                        
                        <Grid container spacing={2} sx={{ mt: 0 }} alignItems="end">
                            <Grid item xs={12} md={4}>
                                <TextField 
                                    select label="Tipo Mantenimiento" fullWidth 
                                    value={tipoMantenimiento} onChange={e => setTipoMantenimiento(e.target.value)}
                                >
                                    <MenuItem value="Correctivo">Correctivo</MenuItem>
                                    <MenuItem value="Preventivo">Preventivo</MenuItem>
                                </TextField>
                            </Grid>
                            
                            <Grid item xs={12} md={4}>
                                <TextField 
                                    select label="Origen Mantenimiento" fullWidth 
                                    value={origenServicio} onChange={e => setOrigenServicio(e.target.value)}
                                >
                                    <MenuItem value="Interno">Interno</MenuItem>
                                    <MenuItem value="Externo">Externo</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField 
                                    label="Costo Mano Obra" type="number" fullWidth 
                                    value={costoMO} onChange={e => setCostoMO(e.target.value)}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} 
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="caption" fontWeight={600}>Tipo de Reparación</Typography>
                                <CreatableSelect
                                    isClearable
                                    options={repairTypes}
                                    value={tipoReparacion}
                                    onChange={setTipoReparacion}
                                    onCreateOption={handleCreateRepair}
                                    placeholder="Selecciona o escribe para crear..."
                                    styles={customSelectStyles}
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <FormControlLabel
                            control={<Switch checked={usarItems} onChange={e => setUsarItems(e.target.checked)} />}
                            label={<Typography fontWeight={600}>Agregar Refacciones</Typography>}
                        />

                        {usarItems && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 2 }}>
                                <Grid container spacing={2} alignItems="flex-end">
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="caption">Artículo</Typography>
                                        <Select 
                                            options={invOptions} 
                                            value={itemSeleccionado} 
                                            onChange={setItemSeleccionado} 
                                            placeholder="Buscar en inventario..." 
                                            isLoading={itemsLoading}
                                            styles={customSelectStyles}
                                        />
                                        <Typography variant="caption" color="text.secondary">Stock: {stockSelected}</Typography>
                                    </Grid>
                                    <Grid item xs={6} md={2}>
                                        <TextField label="Cant." type="number" size="small" fullWidth value={cant} onChange={e => setCant(e.target.value)} />
                                    </Grid>
                                    <Grid item xs={6} md={4}>
                                        <Stack direction="row" spacing={1}>
                                            <Button variant="outlined" fullWidth onClick={() => addItemToPending('consumible')}>Consumible</Button>
                                            <Button variant="contained" fullWidth onClick={() => addItemToPending('refaccion')}>Refacción</Button>
                                        </Stack>
                                    </Grid>
                                </Grid>

                                {pendItems.length > 0 && (
                                    <TableContainer component={Paper} sx={{ mt: 2 }} variant="outlined">
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: '#eee' }}>
                                                    <TableCell>Desc</TableCell>
                                                    <TableCell>Tipo</TableCell>
                                                    <TableCell align="right">Cant</TableCell>
                                                    <TableCell align="right">$$</TableCell>
                                                    <TableCell align="center">X</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {pendItems.map(it => (
                                                    <TableRow key={it.uid}>
                                                        <TableCell>{it.descripcion}</TableCell>
                                                        <TableCell><Chip label={it.tipo} size="small" /></TableCell>
                                                        <TableCell align="right">{it.cantidad}</TableCell>
                                                        <TableCell align="right">{money(it.subtotal)}</TableCell>
                                                        <TableCell align="center">
                                                            <IconButton size="small" color="error" onClick={() => setPendItems(p => p.filter(x => x.uid !== it.uid))}>
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Box>
                        )}

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button 
                                variant="contained" 
                                color="success" 
                                size="large" 
                                startIcon={<AddCircleIcon />} 
                                onClick={agregarServicio}
                            >
                                Agregar a la Orden
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 20 }} elevation={4}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>Detalle de Orden</Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
                            {services.length === 0 ? (
                                <Typography color="text.secondary" fontStyle="italic" align="center" py={4}>
                                    No hay servicios agregados.
                                </Typography>
                            ) : (
                                <Stack spacing={2}>
                                    {services.map((s, idx) => (
                                        <Paper key={s.id} variant="outlined" sx={{ p: 2, position: 'relative', bgcolor: '#fafafa' }}>
                                            <IconButton 
                                                size="small" 
                                                color="error" 
                                                sx={{ position: 'absolute', top: 5, right: 5 }} 
                                                onClick={() => setServices(prev => prev.filter(x => x.id !== s.id))}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                            
                                            <Typography variant="subtitle2" fontWeight={700}>Servicio #{idx + 1}</Typography>
                                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                                {s.tipo_mantenimiento} — <b>{s.origen_servicio}</b>
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                                {s.tipo_reparacion_label}
                                            </Typography>
                                            
                                            <Stack direction="row" justifyContent="space-between" mt={1}>
                                                <Typography variant="caption">Mano de Obra:</Typography>
                                                <Typography variant="caption" fontWeight={600}>{money(s.costo_mano_obra)}</Typography>
                                            </Stack>
                                            
                                            {s.items.length > 0 && (
                                                <Box mt={1} pt={1} borderTop="1px dashed #ccc">
                                                    <Typography variant="caption" color="text.secondary">
                                                        {s.items.length} Refacciones/Consumibles
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Paper>
                                    ))}
                                </Stack>
                            )}
                        </Box>

                        <Box sx={{ mt: 3, pt: 2, borderTop: '2px solid #eee' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">Total General:</Typography>
                                <Typography variant="h4" fontWeight={800} color="primary.main">
                                    {money(totalGeneral)}
                                </Typography>
                            </Stack>
                        </Box>

                        <Button 
                            fullWidth 
                            variant="contained" 
                            size="large"
                            sx={{ mt: 3, py: 1.5, fontSize: '1.1rem', fontWeight: 700 }}
                            disabled={saving || services.length === 0}
                            onClick={enviarOrden}
                            startIcon={saving ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                        >
                            {saving ? "Guardando..." : "Guardar Orden"}
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}