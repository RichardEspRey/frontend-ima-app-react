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
import { useNavigate, useParams } from "react-router-dom";

import useFetchInventoryItems from "../../hooks/expense_hooks/useFetchInventoryItems";
import useFetchRepairTypes from "../../hooks/service_order/useFetchRepairTypes";
import { COLOR } from "../../shared/ui/tokens";
import { EstadoError, SelectorBusqueda, notify } from "../../shared/ui";
import { etiquetaUnidad, origenDeServicio, separarManoDeObra, useActualizarOrden, useCamionesDeOrden, useOrden } from "../../entities/service-order";
import { ServiciosDeOrden } from "../../features/service-order";

const RUTA_ORDENES = "/mantenimiento?pestana=ordenes";

const money = (v) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD" }).format(Number(v || 0));

/**
 * Edición de una orden de servicio existente.
 *
 * La orden llega completa de `mtto.php`: cada servicio con la reparación de la
 * que salió y cada concepto con su categoría y su gasto. Los servicios que ya
 * tiene se editan ahí mismo; al guardar o cancelar se vuelve a la pestaña de
 * órdenes de Reparaciones.
 *
 * @returns {object} La pantalla.
 */
export default function EditarOrdenPage() {
    const navigate = useNavigate();
    const { orderId } = useParams();

    const { inventoryItems, loading: itemsLoading } = useFetchInventoryItems();
    const { repairTypes } = useFetchRepairTypes();
    const { data: trucks = [] } = useCamionesDeOrden();
    const consultaOrden = useOrden(orderId);
    const actualizar = useActualizarOrden();
    const [cargada, setCargada] = useState(false);

    const [selectedTruck, setSelectedTruck] = useState(null);
    const [ordenDeCaja, setOrdenDeCaja] = useState(null);
    const [dateForm, setDateForm] = useState("");
    const [tipoCambioOrden, setTipoCambioOrden] = useState("");

    const [tipoMantenimiento, setTipoMantenimiento] = useState("Correctivo");
    const [origenServicio, setOrigenServicio] = useState("Interno");
    const [tipoReparacion, setTipoReparacion] = useState(null);
    const [costoMO, setCostoMO] = useState("");
    const [usarItems, setUsarItems] = useState(false);
    
    const [itemSeleccionado, setItemSeleccionado] = useState(null);
    const [cant, setCant] = useState(1);
    const [pendItems, setPendItems] = useState([]);

    const [services, setServices] = useState([]);
    const [saving, setSaving] = useState(false);
    const seq = useRef(1);

    const truckOptions = useMemo(() => trucks.map(t => ({ value: t.value, label: t.label })), [trucks]);
    const invOptions = useMemo(() => inventoryItems.map(it => ({
        value: it.value,
        label: it.label,
        costo_unidad: parseFloat(it.costo_unidad || 0),
        cantidad_stock: parseInt(it.cantidad_stock || 0, 10),
    })), [inventoryItems]);

    useEffect(() => {
        if (!consultaOrden.data || cargada) return;
        const { orden: o, servicios } = consultaOrden.data;

        setDateForm(o.fecha_orden);
        setTipoCambioOrden(o.tipo_cambio || "");
        setOrdenDeCaja(o.caja_id ? etiquetaUnidad({ nombre_caja: o.nombre_caja || o.caja_id }) : null);
        setSelectedTruck(o.truck_id ? { value: o.truck_id, label: o.nombre_camion || o.truck_id } : null);
        setServices(servicios.map(s => {
            const { manoDeObra, conceptos } = separarManoDeObra(s.detalles);
            return {
                id_local: seq.current++,
                id_servicio: s.id_servicio,
                estatus: s.estatus,
                tipo_mantenimiento: s.tipo_mantenimiento,
                origen_servicio: s.origen_servicio,
                tipo_reparacion: s.tipo_reparacion,
                origen: origenDeServicio(s),
                costo_mano_obra: manoDeObra,
                detalles: conceptos.map(d => ({
                    uid: d.id_detalle,
                    id_articulo: d.id_articulo,
                    descripcion: d.descripcion,
                    tipo_detalle: d.tipo_detalle,
                    categoria: d.categoria,
                    id_gasto: d.id_gasto,
                    cantidad: d.cantidad,
                    costo: d.costo,
                    subtotal: d.cantidad * d.costo,
                })),
            };
        }));
        setCargada(true);
    }, [consultaOrden.data, cargada]);

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
        if (!tipoReparacion) return notify.aviso("", "Falta reparación");
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
        
        setServices(prev => [...prev, nuevo]);
        
        setTipoReparacion(null);
        setCostoMO("");
        setPendItems([]);
        setUsarItems(false);
    };

    const actualizarServicio = (idLocal, cambios) =>
        setServices(prev => prev.map(x => (x.id_local === idLocal ? { ...x, ...cambios } : x)));

    const quitarServicio = (idLocal) => setServices(prev => prev.filter(x => x.id_local !== idLocal));

    const handleCreateRepair = (val) => setTipoReparacion({label: val, value: val});

    const totalGeneral = useMemo(() => services.reduce((acc, s) => {
        const itemsTotal = s.detalles.reduce((a, i) => a + (i.subtotal || (i.cantidad * i.costo)), 0);
        return acc + itemsTotal + (s.costo_mano_obra || 0);
    }, 0), [services]);

    const guardarCambios = async () => {
        if (!dateForm) return notify.aviso("", "Falta fecha");
        
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

        try {
            await actualizar.mutateAsync({
                ordenId: orderId,
                orden: {
                    fecha: dateForm,
                    truck_id: selectedTruck ? selectedTruck.value : null,
                    tipo_cambio: tipoCambioOrden,
                },
                servicios: serviciosPayload,
            });
            notify.exito("La orden se actualizó correctamente", "Actualizado");
            navigate(RUTA_ORDENES);
        } catch (e) {
            notify.error(e);
        } finally {
            setSaving(false);
        }
    };

    if (consultaOrden.isError) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <EstadoError error={consultaOrden.error} onReintentar={consultaOrden.refetch} />
                <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate(RUTA_ORDENES)}>Volver a órdenes</Button>
            </Container>
        );
    }

    if (!cargada) return <Box p={5} display="flex" justifyContent="center"><CircularProgress /></Box>;

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4" fontWeight={700}>Editar Orden #{orderId}</Typography>
                <Button variant="outlined" onClick={() => navigate(RUTA_ORDENES)}>Cancelar</Button>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }} elevation={2}>
                        <Typography variant="h6" gutterBottom fontWeight={600} color="primary">Datos Generales</Typography>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="caption" fontWeight={600}>{ordenDeCaja ? "Unidad" : "Camión"}</Typography>
                                {ordenDeCaja ? (
                                    <TextField fullWidth value={ordenDeCaja} disabled />
                                ) : (
                                    <SelectorBusqueda 
                                        options={truckOptions} 
                                        value={selectedTruck} 
                                        onChange={setSelectedTruck} 
                                        placeholder="Seleccionar..."
                                    />
                                )}
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="caption" fontWeight={600}>Fecha</Typography>
                                <TextField type="date" fullWidth value={dateForm} onChange={e => setDateForm(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="caption" fontWeight={600}>Tipo Cambio</Typography>
                                <TextField type="number" fullWidth value={tipoCambioOrden} placeholder="Sin tipo de cambio" onChange={e => setTipoCambioOrden(e.target.value)} />
                            </Grid>
                        </Grid>
                    </Paper>

                    <ServiciosDeOrden servicios={services} onCambiar={actualizarServicio} onQuitar={quitarServicio} />

                    <Paper sx={{ p: 3, borderRadius: 2 }} elevation={2}>
                        <Typography variant="h6" gutterBottom fontWeight={600} color="primary">Agregar Nuevo Servicio</Typography>
                        <Grid container spacing={2} alignItems="end">
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField 
                                    select label="Tipo Mantenimiento" fullWidth 
                                    value={tipoMantenimiento} onChange={e => setTipoMantenimiento(e.target.value)}
                                >
                                    <MenuItem value="Correctivo">Correctivo</MenuItem>
                                    <MenuItem value="Preventivo">Preventivo</MenuItem>
                                </TextField>
                            </Grid>
                            
                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField 
                                    select label="Origen Mantenimiento" fullWidth 
                                    value={origenServicio} onChange={e => setOrigenServicio(e.target.value)}
                                >
                                    <MenuItem value="Interno">Interno</MenuItem>
                                    <MenuItem value="Externo">Externo</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid size={{ xs: 12, md: 4 }}>
                                <TextField 
                                    label="Costo Mano Obra" type="number" fullWidth 
                                    value={costoMO} onChange={e => setCostoMO(e.target.value)}
                                    InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} 
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <Typography variant="caption" fontWeight={600}>Tipo de Reparación</Typography>
                                <SelectorBusqueda permitirCrear
                                    isClearable
                                    options={repairTypes}
                                    value={tipoReparacion}
                                    onChange={setTipoReparacion}
                                    onCrear={handleCreateRepair}
                                />
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />
                        
                        <FormControlLabel
                            control={<Switch checked={usarItems} onChange={e => setUsarItems(e.target.checked)} />}
                            label={<Typography fontWeight={600}>Agregar Refacciones</Typography>}
                        />

                        {usarItems && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: COLOR.LIENZO, borderRadius: 2 }}>
                                <Grid container spacing={2} alignItems="flex-end">
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <SelectorBusqueda 
                                            options={invOptions} 
                                            value={itemSeleccionado} 
                                            onChange={setItemSeleccionado} 
                                            placeholder="Buscar artículo..." 
                                            isLoading={itemsLoading}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 6, md: 2 }}>
                                        <TextField label="Cant." type="number" size="small" fullWidth value={cant} onChange={e => setCant(e.target.value)} />
                                    </Grid>
                                    <Grid size={{ xs: 6, md: 4 }}>
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

                <Grid size={{ xs: 12, lg: 4 }}>
                    <Paper sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 20 }} elevation={4}>
                        <Typography variant="h6" fontWeight={700} gutterBottom>Detalle de Orden</Typography>
                        <Divider sx={{ mb: 2 }} />

                        <Stack spacing={2} sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
                            {services.map((s, idx) => (
                                <Paper key={s.id_local} variant="outlined" sx={{ p: 2, position: 'relative', bgcolor: COLOR.LIENZO }}>
                                    <IconButton 
                                        size="small" color="error" sx={{ position: 'absolute', top: 5, right: 5 }} 
                                        onClick={() => quitarServicio(s.id_local)}
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