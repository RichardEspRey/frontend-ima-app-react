import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert, Box, Button, Checkbox, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
    Divider, FormControlLabel, Paper, Stack, TextField, Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';

import ServicioOrden from './ServicioOrden';
import { useAuthStore } from '../../store/useAuthStore';
import useFetchCategories from '../../hooks/expense_hooks/useFetchCategories';
import useFetchSubcategories from '../../hooks/expense_hooks/useFetchSubcategories';
import {
    TIPO_GASTO_MANTENIMIENTO, UNIDAD, crearGasto, crearOrden, obtenerPendientes
} from '../../services/mantenimiento';
import {
    CARD_SX, DARK_BTN_SX, DIALOG_ACTIONS_SX, DIALOG_CONTENT_SX, DIALOG_PAPER_SX,
    DIALOG_TITLE_SX, SECTION_LABEL_SX,
} from '../../styles/estilosTabla';

const hoy = () => new Date().toISOString().slice(0, 10);

const servicioDesdePunto = (punto, inspeccion) => ({
    clave: `punto-${punto.clave}`,
    origen: 'inspeccion',
    categoria: punto.categoria,
    tipo_reparacion: punto.texto.slice(0, 100),
    tipo_mantenimiento: 'Correctivo',
    origen_servicio: 'Interno',
    costo_mano_obra: '',
    gastos: [],
    punto: {
        cl_final_id: inspeccion?.cl_final_id,
        viaje_id: inspeccion?.viaje_id,
        categoria: punto.categoria,
        origen_tabla: punto.origenTabla,
        origen_id: punto.origenId,
    },
});

const servicioDesdePendiente = (pendiente) => ({
    clave: `pendiente-${pendiente.id}`,
    origen: 'pendiente',
    categoria: pendiente.categoria,
    tipo_reparacion: (pendiente.descripcion || '').slice(0, 100),
    tipo_mantenimiento: 'Correctivo',
    origen_servicio: 'Interno',
    costo_mano_obra: '',
    gastos: [],
    punto_id: pendiente.id,
});

const servicioEnBlanco = () => ({
    clave: `extra-${Date.now()}-${Math.random()}`,
    origen: 'extra',
    tipo_reparacion: '',
    tipo_mantenimiento: 'Correctivo',
    origen_servicio: 'Interno',
    costo_mano_obra: '',
    gastos: [],
});

/**
 * La orden de servicio, armada sin salir de la inspección.
 *
 * Un servicio por punto, como lo trabaja el taller: la orden agrupa, pero cada
 * reparación se sigue por separado. Si la unidad traía reparaciones pendientes de
 * viajes anteriores, se ofrecen aquí para no dejarlas olvidadas.
 */
const ConstructorOrden = ({ apertura, onCerrar, onCreada }) => {
    const usuario = useAuthStore(estado => estado.user);
    const { maintenanceCategories } = useFetchCategories();
    const { subcategories } = useFetchSubcategories();
    const categorias = useMemo(
        () => (maintenanceCategories || []).filter(c => String(c.id_tipo_gasto) === TIPO_GASTO_MANTENIMIENTO),
        [maintenanceCategories],
    );
    const { inspeccion, lado, puntos } = apertura;

    const unidadId = lado === UNIDAD.CAJA ? inspeccion?.caja_id : inspeccion?.truck_id;
    const etiquetaUnidad = lado === UNIDAD.CAJA ? inspeccion?.no_caja : inspeccion?.no_camion;

    const [fecha, setFecha] = useState(hoy());
    const [tipoCambio, setTipoCambio] = useState('');
    const [servicios, setServicios] = useState(() => puntos.map(p => servicioDesdePunto(p, inspeccion)));
    const [previos, setPrevios] = useState([]);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);

    const cargarPrevios = useCallback(async () => {
        try {
            const pendientes = await obtenerPendientes(lado);
            setPrevios(pendientes.filter(p => String(lado === UNIDAD.CAJA ? p.caja_id : p.truck_id) === String(unidadId)));
        } catch {
            setPrevios([]);
        }
    }, [lado, unidadId]);

    useEffect(() => { cargarPrevios(); }, [cargarPrevios]);

    const clavesEnOrden = useMemo(() => servicios.map(s => s.clave), [servicios]);

    const agregarPrevio = (pendiente) => setServicios(prev => {
        const nuevo = servicioDesdePendiente(pendiente);
        return prev.some(s => s.clave === nuevo.clave) ? prev : [...prev, nuevo];
    });

    const quitarServicio = (clave) => setServicios(prev => prev.filter(s => s.clave !== clave));

    const cambiarServicio = (clave, actualizado) => setServicios(prev =>
        prev.map(s => (s.clave === clave ? actualizado : s)));

    const total = useMemo(() => servicios.reduce((suma, servicio) => {
        const gastos = servicio.gastos.reduce((sub, gasto) => sub + gasto.conceptos.reduce(
            (sub2, c) => sub2 + (Number(c.precio_unitario) || 0) * (Number(c.cantidad) || 0), 0), 0);
        return suma + (Number(servicio.costo_mano_obra) || 0) + gastos;
    }, 0), [servicios]);

    const sinReparacion = servicios.some(s => !s.tipo_reparacion.trim());

    // El gasto no se puede dar de alta a medias: sin país no hay moneda ni tipo de
    // cambio, y sin categoría el Expense Manager no lo puede filtrar.
    const gastoIncompleto = servicios.some(servicio => servicio.gastos.some(gasto =>
        !gasto.pais
        || gasto.conceptos.length === 0
        || gasto.conceptos.some(c => !c.categoria || !c.subcategoria || !c.descripcion.trim() || !(Number(c.cantidad) > 0))));

    const guardar = async () => {
        setGuardando(true);
        setError(null);
        try {
            // Primero los gastos y al final la orden. Si se hiciera al revés, un gasto
            // que truena deja la orden levantada sin su comprobante; así, lo peor que
            // puede quedar es un gasto en el Admin de Gastos, que es real: se pagó.
            const servicate = await Promise.all(servicios.map(async (servicio) => ({
                ...servicio,
                gastos: await Promise.all(servicio.gastos.map(async (gasto) => {
                    const creado = await crearGasto({ gasto, usuarioId: usuario?.id });
                    return { ...gasto, id_gasto: creado.id_gasto };
                })),
            })));

            const resultado = await crearOrden({
                unidadTipo: lado,
                unidadId,
                fecha,
                tipoCambio,
                servicios: servicate.map(servicio => ({
                    tipo_reparacion: servicio.tipo_reparacion.trim(),
                    tipo_mantenimiento: servicio.tipo_mantenimiento,
                    origen_servicio: servicio.origen_servicio,
                    costo_mano_obra: Number(servicio.costo_mano_obra) || 0,
                    punto: servicio.punto,
                    punto_id: servicio.punto_id,
                    gastos: servicio.gastos.map(gasto => ({
                        id_gasto: gasto.id_gasto,
                        conceptos: gasto.conceptos.map(concepto => ({
                            categoria_label: categorias.find(c => String(c.value) === String(concepto.categoria))?.label,
                            descripcion: concepto.descripcion.trim(),
                            precio_unitario: Number(concepto.precio_unitario) || 0,
                            cantidad: Number(concepto.cantidad) || 0,
                        })),
                    })),
                })),
                usuarioId: usuario?.id,
            });

            const gastosCreados = servicate.reduce((suma, s) => suma + s.gastos.length, 0);
            onCreada(resultado.id_orden, gastosCreados);
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Dialog open onClose={guardando ? undefined : onCerrar} maxWidth="lg" fullWidth PaperProps={{ sx: DIALOG_PAPER_SX }}>
            <DialogTitle sx={DIALOG_TITLE_SX}>
                <Box>
                    <Typography variant="overline" sx={SECTION_LABEL_SX}>
                        Mantenimiento · {lado === UNIDAD.CAJA ? 'Caja' : 'Camión'} {etiquetaUnidad}
                    </Typography>
                    <Typography variant="h5" fontWeight={800} color="#0f172a">Nueva Orden de Servicio</Typography>
                    <Typography variant="body2" color="#64748b">
                        Un servicio por cada reparación. Del viaje {inspeccion?.trip_number}.
                    </Typography>
                </Box>
                <Button onClick={onCerrar} disabled={guardando} startIcon={<CloseIcon />} color="inherit" sx={{ textTransform: 'none' }}>
                    Cerrar
                </Button>
            </DialogTitle>

            <DialogContent sx={DIALOG_CONTENT_SX}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="flex-start">
                    <Box sx={{ flex: '1 1 auto', minWidth: 0, width: '100%' }}>
                        <Paper elevation={0} sx={{ ...CARD_SX, bgcolor: 'white', mb: 2 }}>
                            <Typography variant="overline" sx={SECTION_LABEL_SX}>Datos generales</Typography>
                            <Stack direction="row" spacing={2} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                                <TextField
                                    size="small" label={lado === UNIDAD.CAJA ? 'Caja' : 'Camión'}
                                    value={etiquetaUnidad || ''} disabled sx={{ width: 140 }}
                                />
                                <TextField
                                    size="small" type="date" label="Fecha" InputLabelProps={{ shrink: true }}
                                    value={fecha} onChange={(evento) => setFecha(evento.target.value)} sx={{ width: 180 }}
                                />
                                <TextField
                                    size="small" label="Tipo de cambio (opcional)" type="number" sx={{ width: 200 }}
                                    value={tipoCambio} onChange={(evento) => setTipoCambio(evento.target.value)}
                                />
                            </Stack>
                        </Paper>

                        {previos.length > 0 && (
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                <Typography fontWeight={700} sx={{ mb: 1 }}>
                                    {lado === UNIDAD.CAJA ? 'Esta caja' : 'Este camión'} trae {previos.length} reparación(es) pendiente(s) de antes
                                </Typography>
                                {previos.map(pendiente => (
                                    <FormControlLabel
                                        key={pendiente.id}
                                        sx={{ display: 'block', ml: 0 }}
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={clavesEnOrden.includes(`pendiente-${pendiente.id}`)}
                                                onChange={(evento) => evento.target.checked
                                                    ? agregarPrevio(pendiente)
                                                    : quitarServicio(`pendiente-${pendiente.id}`)}
                                            />
                                        }
                                        label={<Typography variant="body2">{pendiente.descripcion}</Typography>}
                                    />
                                ))}
                            </Alert>
                        )}

                        {servicios.map((servicio, indice) => (
                            <ServicioOrden
                                key={servicio.clave}
                                servicio={servicio}
                                indice={indice}
                                categorias={categorias}
                                subcategorias={subcategories || []}
                                onCambiar={(actualizado) => cambiarServicio(servicio.clave, actualizado)}
                                onEliminar={() => quitarServicio(servicio.clave)}
                            />
                        ))}

                        <Button
                            startIcon={<AddIcon />}
                            onClick={() => setServicios(prev => [...prev, servicioEnBlanco()])}
                            sx={{ textTransform: 'none', fontWeight: 700 }}
                        >
                            Agregar otro servicio
                        </Button>
                    </Box>

                    <Paper elevation={0} sx={{ ...CARD_SX, bgcolor: 'white', width: { xs: '100%', md: 320 }, flexShrink: 0, position: { md: 'sticky' }, top: 16 }}>
                        <Typography variant="overline" sx={SECTION_LABEL_SX}>Detalle de orden</Typography>

                        <Stack spacing={1} sx={{ mt: 1.5, mb: 2 }}>
                            {servicios.length === 0 && (
                                <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#94a3b8' }}>
                                    No hay servicios en la orden.
                                </Typography>
                            )}
                            {servicios.map((servicio, indice) => (
                                <Stack key={servicio.clave} direction="row" justifyContent="space-between" spacing={1}>
                                    <Typography variant="body2" color="#334155" noWrap sx={{ maxWidth: 180 }}>
                                        {indice + 1}. {servicio.tipo_reparacion || 'Sin descripción'}
                                    </Typography>
                                    <Chip size="small" label={servicio.gastos.length ? `${servicio.gastos.length} gasto(s)` : 'MO'} sx={{ height: 18, fontSize: '0.65rem' }} />
                                </Stack>
                            ))}
                        </Stack>

                        <Divider />

                        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mt: 2 }}>
                            <Typography variant="body2" color="#64748b">Total</Typography>
                            <Typography variant="h5" fontWeight={800} color="#0f172a">${total.toFixed(2)}</Typography>
                        </Stack>
                    </Paper>
                </Stack>
            </DialogContent>

            <DialogActions sx={DIALOG_ACTIONS_SX}>
                <Button onClick={onCerrar} color="inherit" disabled={guardando}>Cancelar</Button>
                <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={guardar}
                    disabled={guardando || servicios.length === 0 || sinReparacion || gastoIncompleto}
                    sx={DARK_BTN_SX}
                >
                    {guardando ? 'Guardando…' : 'Guardar orden'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConstructorOrden;
