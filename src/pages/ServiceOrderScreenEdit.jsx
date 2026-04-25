import { useMemo, useRef, useState, useEffect } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

import useFetchInventoryItems from "../hooks/expense_hooks/useFetchInventoryItems";
import useFetchRepairTypes from "../hooks/service_order/useFetchRepairTypes";

const apiHost = import.meta.env.VITE_API_HOST;

const customSelectStyles = {
  control: (provided) => ({
    ...provided, height: 56, borderRadius: 4, borderColor: 'rgba(0, 0, 0, 0.23)'
  }),
  menu: (provided) => ({ ...provided, zIndex: 9999 })
};

const money = (v) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD" }).format(Number(v || 0));

export default function ServiceOrderScreenEdit() {
    const navigate = useNavigate();
    const { orderId } = useParams();

    // --- Hooks ---
    const { inventoryItems, loading: itemsLoading } = useFetchInventoryItems();
    const { repairTypes, refetchRepairTypes } = useFetchRepairTypes();
    const [trucks, setTrucks] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    // Cargar Camiones
    useEffect(() => {
        const fetchTrucks = async () => {
            const formData = new FormData();
            formData.append("op", "getTrucks");
            try {
                const res = await fetch(`${apiHost}/service_order.php`, { method: "POST", body: formData });
                const json = await res.json();
                setTrucks(json.data || []);
            } catch (e) { console.error(e); }
        };
        fetchTrucks();
    }, []);

    // --- Estados Generales ---
    const [selectedTruck, setSelectedTruck] = useState(null);
    const [dateForm, setDateForm] = useState("");
    const [tipoCambioOrden, setTipoCambioOrden] = useState("");

    // --- Builder Servicio (Inputs) ---
    const [tipoMantenimiento, setTipoMantenimiento] = useState("Correctivo");
    const [origenServicio, setOrigenServicio] = useState("Interno"); // <--- NUEVO CAMPO
    const [tipoReparacion, setTipoReparacion] = useState(null);
    const [costoMO, setCostoMO] = useState("");
    const [usarItems, setUsarItems] = useState(false);
    
    // Items Builder
    const [itemSeleccionado, setItemSeleccionado] = useState(null);
    const [cant, setCant] = useState(1);
    const [pendItems, setPendItems] = useState([]);

    // Lista Servicios 
    const [services, setServices] = useState([]);
    const [saving, setSaving] = useState(false);
    const seq = useRef(1);

    // --- Memos ---
    const truckOptions = useMemo(() => trucks.map(t => ({ value: t.value, label: t.label })), [trucks]);
    const invOptions = useMemo(() => inventoryItems.map(it => ({
        value: it.value,
        label: it.label,
        costo_unidad: parseFloat(it.costo_unidad || 0),
        cantidad_stock: parseInt(it.cantidad_stock || 0, 10),
    })), [inventoryItems]);

    // --- CARGAR ORDEN EXISTENTE ---
    useEffect(() => {
        if (!orderId) return;
        const loadOrder = async () => {
            setLoadingData(true);
            const fd = new FormData();
            fd.append('op', 'getOrderById');
            fd.append('id_orden', orderId);
            try {
                const res = await fetch(`${apiHost}/service_order.php`, { method: "POST", body: fd });
                const json = await res.json();
                if (json.status === 'success') {
                    const o = json.data.orden;
                    setDateForm(o.fecha_orden);
                    setTipoCambioOrden(o.tipo_cambio || "");
                    
                    // Mapear Servicios
                    const mappedServices = json.data.servicios.map(s => {
                        let moCost = 0;
                        const items = [];
                        
                        s.detalles.forEach(d => {
                            if (d.tipo_detalle === 'Mano de Obra') {
                                moCost += Number(d.costo);
                            } else {
                                items.push({
                                    uid: d.id_detalle, 
                                    id_articulo: d.id_articulo,
                                    descripcion: d.descripcion,
                                    tipo_detalle: d.tipo_detalle,
                                    cantidad: Number(d.cantidad),
                                    costo: Number(d.costo),
                                    subtotal: Number(d.cantidad) * Number(d.costo)
                                });
                            }
                        });

                        return {
                            id_local: seq.current++, 
                            id_servicio: s.id_servicio, 
                            estatus: s.estatus,
                            tipo_mantenimiento: s.tipo_mantenimiento,
                            origen_servicio: s.origen_servicio || '',
                            tipo_reparacion: s.tipo_reparacion, 
                            costo_mano_obra: moCost,
                            detalles: items 
                        };
                    });
                    setServices(mappedServices);
                }
            } catch (e) { console.error(e); } 
            finally { setLoadingData(false); }
        };
        loadOrder();
    }, [orderId]);


    // --- Handlers Builder ---
    const addItemToPending = (tipo) => {
        if (!itemSeleccionado || !cant) return;
        setPendItems(prev => [...prev, {
            uid: Date.now() + Math.random(),
            id_articulo: itemSeleccionado.value,
            descripcion: itemSeleccionado.label,
            tipo_detalle: tipo === 'consumible' ? 'Consumible' : 'Refaccion',
            cantidad: Number(cant),
            costo: itemSeleccionado.costo_unidad,
            subtotal: Number(cant) * itemSeleccionado.costo_unidad
        }]);
        setItemSeleccionado(null);
        setCant(1);
    };

    const agregarServicio = () => {
        if (!tipoReparacion) return Swal.fire("Falta reparación", "", "warning");
        const nuevo = {
            id_local: seq.current++,
            id_servicio: null, 
            tipo_mantenimiento: tipoMantenimiento,
            origen_servicio: origenServicio,
            tipo_reparacion: tipoReparacion.label,
            estatus: 'Pendiente',
            costo_mano_obra: Number(costoMO || 0),
            detalles: usarItems ? [...pendItems] : []
        };
        
        if (nuevo.costo_mano_obra > 0) {
            // Ajustaremos el payload final para que sea consistente.
        }

        setServices(prev => [...prev, nuevo]);
        
        setTipoReparacion(null);
        setCostoMO("");
        setPendItems([]);
        setUsarItems(false);
    };

    const handleCreateRepair = (val) => setTipoReparacion({label: val, value: val});

    const totalGeneral = useMemo(() => services.reduce((acc, s) => {
        const itemsTotal = s.detalles.reduce((a, i) => a + (i.subtotal || (i.cantidad * i.costo)), 0);
        return acc + itemsTotal + (s.costo_mano_obra || 0);
    }, 0), [services]);

    // Guardar Edición
    const guardarCambios = async () => {
        if (!dateForm) return Swal.fire("Falta fecha", "", "warning");
        
        setSaving(true);

        const serviciosPayload = services.map(s => {
            const detallesFinales = [...s.detalles];
            
            if (s.costo_mano_obra > 0) {
                const tieneMO = detallesFinales.some(d => d.tipo_detalle === 'Mano de Obra');
                if (!tieneMO) {
                    detallesFinales.push({
                        id_articulo: null,
                        tipo_detalle: 'Mano de Obra',
                        descripcion: 'Mano de Obra',
                        cantidad: 1,
                        costo: s.costo_mano_obra
                    });
                }
            }

            return {
                id_servicio: s.id_servicio,
                tipo_mantenimiento: s.tipo_mantenimiento,
                origen_servicio: s.origen_servicio, 
                tipo_reparacion: s.tipo_reparacion,
                estatus: s.estatus || 'Pendiente',
                detalles: detallesFinales
            };
        });

        const fd = new FormData();
        fd.append('op', 'UpdateOrder');
        fd.append('id_orden', orderId);
        
        // Datos Orden
        const ordenData = {
            fecha: dateForm,
            truck_id: selectedTruck ? selectedTruck.value : null, 
            tipo_cambio: tipoCambioOrden
        };
        fd.append('ordenData', JSON.stringify(ordenData));
        fd.append('serviciosData', JSON.stringify(serviciosPayload));

        try {
            const res = await fetch(`${apiHost}/service_order.php`, { method: 'POST', body: fd });
            const json = await res.json();
            if (json.status === 'success') {
                Swal.fire("Actualizado", "La orden se actualizó correctamente", "success");
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

    if (loadingData) return <Box p={5} display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight={700}>Editar Orden #{orderId}</Typography>
                <Button variant="outlined" onClick={() => navigate('/admin-service-order')}>Cancelar</Button>
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
                                    placeholder={selectedTruck ? "Cargado..." : "Seleccionar..."}
                                    styles={customSelectStyles}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="caption" fontWeight={600}>Fecha</Typography>
                                <TextField type="date" fullWidth value={dateForm} onChange={e => setDateForm(e.target.value)} />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Typography variant="caption" fontWeight={600}>Tipo Cambio</Typography>
                                <TextField type="number" fullWidth value={tipoCambioOrden} onChange={e => setTipoCambioOrden(e.target.value)} />
                            </Grid>
                        </Grid>
                    </Paper>

                    <Paper sx={{ p: 3, borderRadius: 2 }} elevation={2}>
                        <Typography variant="h6" gutterBottom fontWeight={600} color="primary">Agregar Nuevo Servicio</Typography>
                        <Grid container spacing={2} alignItems="end">
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
                                        <Select 
                                            options={invOptions} 
                                            value={itemSeleccionado} 
                                            onChange={setItemSeleccionado} 
                                            placeholder="Buscar artículo..." 
                                            isLoading={itemsLoading}
                                            styles={customSelectStyles}
                                        />
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
                                                <TableRow><TableCell>Desc</TableCell><TableCell>Tipo</TableCell><TableCell align="right">Cant</TableCell><TableCell align="right">$$</TableCell><TableCell></TableCell></TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {pendItems.map(it => (
                                                    <TableRow key={it.uid}>
                                                        <TableCell>{it.descripcion}</TableCell>
                                                        <TableCell>{it.tipo_detalle}</TableCell>
                                                        <TableCell align="right">{it.cantidad}</TableCell>
                                                        <TableCell align="right">{money(it.subtotal)}</TableCell>
                                                        <TableCell align="center"><IconButton size="small" color="error" onClick={() => setPendItems(p => p.filter(x => x.uid !== it.uid))}><DeleteIcon/></IconButton></TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                )}
                            </Box>
                        )}

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant="contained" color="success" size="large" startIcon={<AddCircleIcon />} onClick={agregarServicio}>
                                Agregar Servicio
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} lg={4}>
                    <Paper sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 20 }} elevation={4}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>Detalle de Orden</Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Stack spacing={2} sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
                            {services.map((s, idx) => (
                                <Paper key={s.id_local} variant="outlined" sx={{ p: 2, position: 'relative', bgcolor: '#fafafa' }}>
                                    <IconButton 
                                        size="small" color="error" sx={{ position: 'absolute', top: 5, right: 5 }} 
                                        onClick={() => setServices(prev => prev.filter(x => x.id_local !== s.id_local))}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                    
                                    <Typography variant="subtitle2" fontWeight={700}>Servicio #{idx + 1}</Typography>
                                    <Typography variant="body2">{s.tipo_mantenimiento} — <b>{s.origen_servicio || 'Interno'}</b></Typography>
                                    <Typography variant="body2" color="text.secondary">{s.tipo_reparacion}</Typography>
                                    <Typography variant="body2" mt={1}>MO: {money(s.costo_mano_obra)}</Typography>
                                    <Typography variant="caption">
                                        {s.detalles.length} Items (aprox. {money(s.detalles.reduce((a,i)=>a+(i.subtotal||(i.cantidad*i.costo)),0))})
                                    </Typography>
                                </Paper>
                            ))}
                        </Stack>

                        <Box sx={{ mt: 3, pt: 2, borderTop: '2px solid #eee' }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="h6">Total:</Typography>
                                <Typography variant="h4" fontWeight={800} color="primary.main">{money(totalGeneral)}</Typography>
                            </Stack>
                        </Box>

                        <Button 
                            fullWidth variant="contained" size="large" sx={{ mt: 3 }}
                            disabled={saving} onClick={guardarCambios}
                            startIcon={saving ? <CircularProgress size={24} color="inherit" /> : <SaveIcon />}
                        >
                            {saving ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}