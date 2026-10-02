import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert, Box, Button, Checkbox, Chip, CircularProgress, FormControlLabel, MenuItem, Paper,
    Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow,
    TextField, ToggleButton, ToggleButtonGroup, Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import Swal from 'sweetalert2';

import BarraFiltros from './BarraFiltros';
import ConstructorOrden from './ConstructorOrden';
import ModalPendienteManual from './ModalPendienteManual';
import { useAuthStore } from '../../store/useAuthStore';
import {
    ESTATUS_PUNTO, UNIDAD, crearPendienteManual, obtenerPendientes, resolverPuntos
} from '../../services/mantenimiento';
import {
    TABLE_CONTAINER_SX, HEADER_ROW_SX, HEADER_CELL_SX, DARK_BTN_SX,
    PAGINATION_BOX_SX, PAGINATION_SX,
} from '../../styles/estilosTabla';

const LADOS = [
    { id: UNIDAD.CAMION, etiqueta: 'Camiones', columna: 'Camión' },
    { id: UNIDAD.CAJA, etiqueta: 'Cajas', columna: 'Caja' },
];

const ORIGENES = [
    { id: '', etiqueta: 'Todos' },
    { id: 'inspeccion', etiqueta: 'Del operador' },
    { id: 'manual', etiqueta: 'Levantados a mano' },
];

const SIN_FILTROS = { unidad: '', texto: '', origen: '' };

const agruparPorUnidad = (pendientes, lado) => {
    const unidades = new Map();

    pendientes.forEach(pendiente => {
        const id = lado === UNIDAD.CAJA ? pendiente.caja_id : pendiente.truck_id;
        const clave = String(id ?? 'sin-unidad');

        if (!unidades.has(clave)) {
            unidades.set(clave, {
                clave,
                unidadId: id,
                etiqueta: (lado === UNIDAD.CAJA ? pendiente.no_caja : pendiente.no_camion) || 'Sin unidad',
                reparaciones: [],
            });
        }
        unidades.get(clave).reparaciones.push(pendiente);
    });

    return [...unidades.values()].sort((a, b) => String(a.etiqueta).localeCompare(String(b.etiqueta), 'es', { numeric: true }));
};

/**
 * Las reparaciones que esperan orden, agrupadas por unidad.
 *
 * Es el Excel que la oficina llevaba a mano: lo que el mecánico dijo que queda para
 * después, más lo que el taller levanta por su cuenta. De aquí sale la orden cuando la
 * unidad vuelve, sin tener que acordarse de nada.
 */
const PanelPendientes = () => {
    const usuario = useAuthStore(estado => estado.user);

    const [lado, setLado] = useState(UNIDAD.CAMION);
    const [pendientes, setPendientes] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [elegidos, setElegidos] = useState([]);
    const [apertura, setApertura] = useState(null);
    const [altaAbierta, setAltaAbierta] = useState(false);

    const [filtros, setFiltros] = useState(SIN_FILTROS);
    const [pagina, setPagina] = useState(0);
    const [porPagina, setPorPagina] = useState(10);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            setPendientes(await obtenerPendientes(lado));
            setElegidos([]);
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }, [lado]);

    useEffect(() => { cargar(); }, [cargar]);

    const filtrados = useMemo(() => pendientes.filter(pendiente => {
        const unidad = String((lado === UNIDAD.CAJA ? pendiente.no_caja : pendiente.no_camion) || '');
        if (filtros.unidad.trim() && unidad !== filtros.unidad.trim()) return false;

        if (filtros.origen && pendiente.origen !== filtros.origen) return false;

        const texto = `${pendiente.descripcion || ''} ${pendiente.categoria || ''}`.toLowerCase();
        if (filtros.texto.trim() && !texto.includes(filtros.texto.trim().toLowerCase())) return false;

        return true;
    }), [pendientes, lado, filtros]);

    const todasLasUnidades = useMemo(
        () => agruparPorUnidad(filtrados, lado),
        [filtrados, lado],
    );

    const unidades = useMemo(
        () => todasLasUnidades.slice(pagina * porPagina, pagina * porPagina + porPagina),
        [todasLasUnidades, pagina, porPagina],
    );

    const hayFiltros = Object.values(filtros).some(valor => valor !== '');

    const cambiarFiltro = (campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
        setPagina(0);
    };

    const limpiarFiltros = () => {
        setFiltros(SIN_FILTROS);
        setPagina(0);
    };

    const alternar = (id) => setElegidos(prev =>
        prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    const alternarUnidad = (unidad, encender) => {
        const ids = unidad.reparaciones.map(r => r.id);
        setElegidos(prev => encender
            ? [...new Set([...prev, ...ids])]
            : prev.filter(id => !ids.includes(id)));
    };

    const elegidosDe = (unidad) => unidad.reparaciones.filter(r => elegidos.includes(r.id));

    const descartar = async (unidad) => {
        const seleccion = elegidosDe(unidad);
        const confirmacion = await Swal.fire({
            title: `¿Descartar ${seleccion.length} reparación(es)?`,
            text: 'Dejan de aparecer en el reporte y no entran a ninguna orden.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, descartar',
            cancelButtonText: 'Cancelar',
        });
        if (!confirmacion.isConfirmed) return;

        try {
            await resolverPuntos({
                items: seleccion.map(r => ({
                    viaje_id: r.viaje_id,
                    categoria: r.categoria,
                    origen_tabla: r.origen_tabla,
                    origen_id: r.origen_id,
                    unidad_tipo: r.unidad_tipo,
                    truck_id: r.truck_id,
                    caja_id: r.caja_id,
                    descripcion: r.descripcion,
                })),
                estatus: ESTATUS_PUNTO.DESCARTADO,
                usuarioId: usuario?.id,
            });
            cargar();
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    const levantar = async (datos) => {
        try {
            await crearPendienteManual({ ...datos, usuarioId: usuario?.id });
            setAltaAbierta(false);
            setLado(datos.unidadTipo);
            cargar();
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    const pestanaActual = LADOS.find(l => l.id === lado);

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                <ToggleButtonGroup
                    exclusive size="small" value={lado}
                    onChange={(_evento, valor) => { if (valor) { setLado(valor); setPagina(0); } }}
                    sx={{ bgcolor: '#f1f5f9', borderRadius: 2.5, p: 0.5, gap: 0.5 }}
                >
                    {LADOS.map(l => (
                        <ToggleButton
                            key={l.id} value={l.id}
                            sx={{
                                border: 'none', borderRadius: '8px !important', px: 3, py: 0.75,
                                fontWeight: 600, textTransform: 'none', color: '#64748b',
                                '&.Mui-selected': { bgcolor: '#0f172a', color: 'white', '&:hover': { bgcolor: '#1e293b' } },
                            }}
                        >
                            {l.etiqueta}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>

                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setAltaAbierta(true)} sx={DARK_BTN_SX}>
                    Levantar pendiente
                </Button>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button onClick={cargar}>Reintentar</Button>}>{error}</Alert>}

            <BarraFiltros
                hayFiltros={hayFiltros}
                onLimpiar={limpiarFiltros}
                resumen={`${filtrados.length} reparación(es) en ${todasLasUnidades.length} unidad(es)`}
            >
                <TextField
                    size="small" label={lado === UNIDAD.CAJA ? 'Caja (exacto)' : 'Camión (exacto)'}
                    sx={{ width: 150 }} value={filtros.unidad}
                    onChange={(evento) => cambiarFiltro('unidad', evento.target.value)}
                />
                <TextField
                    size="small" label="Buscar en la reparación" placeholder="aceite, llanta…"
                    sx={{ width: 260 }} value={filtros.texto}
                    onChange={(evento) => cambiarFiltro('texto', evento.target.value)}
                />
                <TextField
                    select size="small" label="Origen" sx={{ width: 190 }} value={filtros.origen}
                    onChange={(evento) => cambiarFiltro('origen', evento.target.value)}
                >
                    {ORIGENES.map(origen => (
                        <MenuItem key={origen.id || 'todos'} value={origen.id}>{origen.etiqueta}</MenuItem>
                    ))}
                </TextField>
            </BarraFiltros>

            <TableContainer component={Paper} sx={TABLE_CONTAINER_SX}>
                <Table>
                    <TableHead>
                        <TableRow sx={HEADER_ROW_SX}>
                            <TableCell sx={{ ...HEADER_CELL_SX, width: 150 }}>{pestanaActual?.columna}</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Reparaciones</TableCell>
                            <TableCell sx={{ ...HEADER_CELL_SX, width: 300 }} align="right">Acciones</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {cargando && (
                            <TableRow><TableCell colSpan={3} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
                        )}

                        {!cargando && unidades.length === 0 && !error && (
                            <TableRow>
                                <TableCell colSpan={3} align="center" sx={{ py: 6, color: '#64748b' }}>
                                    {hayFiltros
                                        ? 'Ninguna reparación coincide con los filtros.'
                                        : `No hay reparaciones pendientes de ${lado === UNIDAD.CAJA ? 'cajas' : 'camiones'}.`}
                                </TableCell>
                            </TableRow>
                        )}

                        {!cargando && unidades.map(unidad => {
                            const seleccion = elegidosDe(unidad);
                            const todas = seleccion.length === unidad.reparaciones.length;

                            return (
                                <TableRow key={unidad.clave} hover>
                                    <TableCell sx={{ verticalAlign: 'top' }}>
                                        <Typography fontWeight={800} color="#0f172a">{unidad.etiqueta}</Typography>
                                        <Typography variant="caption" color="#64748b">
                                            {unidad.reparaciones.length} pendiente{unidad.reparaciones.length === 1 ? '' : 's'}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        <FormControlLabel
                                            sx={{ ml: 0, mb: 0.5 }}
                                            control={
                                                <Checkbox
                                                    size="small" checked={todas}
                                                    indeterminate={!todas && seleccion.length > 0}
                                                    onChange={() => alternarUnidad(unidad, !todas)}
                                                />
                                            }
                                            label={<Typography variant="caption" fontWeight={700} color="#475569">Seleccionar todo</Typography>}
                                        />

                                        {unidad.reparaciones.map((reparacion, indice) => (
                                            <Stack key={reparacion.id} direction="row" spacing={1} alignItems="flex-start" sx={{ ml: 0.5 }}>
                                                <Checkbox
                                                    size="small" sx={{ p: 0.5 }}
                                                    checked={elegidos.includes(reparacion.id)}
                                                    onChange={() => alternar(reparacion.id)}
                                                />
                                                <Box sx={{ pt: 0.4 }}>
                                                    <Typography variant="body2" color="#334155" component="span">
                                                        {indice + 1}. {reparacion.descripcion}
                                                    </Typography>
                                                    {reparacion.categoria && (
                                                        <Chip size="small" label={reparacion.categoria} sx={{ ml: 1, height: 18, fontSize: '0.65rem', bgcolor: '#f1f5f9', color: '#475569' }} />
                                                    )}
                                                    {reparacion.origen === 'manual' && (
                                                        <Chip size="small" label="a mano" sx={{ ml: 0.5, height: 18, fontSize: '0.65rem', bgcolor: '#eff6ff', color: '#1d4ed8' }} />
                                                    )}
                                                    {reparacion.trip_number && (
                                                        <Typography variant="caption" color="#94a3b8" sx={{ ml: 1 }}>
                                                            viaje {reparacion.trip_number}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Stack>
                                        ))}
                                    </TableCell>

                                    <TableCell align="right" sx={{ verticalAlign: 'top' }}>
                                        <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                                            <Button
                                                variant="outlined" size="small" startIcon={<BuildOutlinedIcon />}
                                                disabled={seleccion.length === 0}
                                                onClick={() => setApertura({
                                                    lado,
                                                    unidadId: unidad.unidadId,
                                                    etiquetaUnidad: unidad.etiqueta,
                                                    pendientes: seleccion,
                                                })}
                                                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                                            >
                                                Realizar orden ({seleccion.length})
                                            </Button>
                                            <Button
                                                variant="outlined" size="small" color="error" startIcon={<BlockOutlinedIcon />}
                                                disabled={seleccion.length === 0}
                                                onClick={() => descartar(unidad)}
                                                sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                                            >
                                                Descartar
                                            </Button>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={PAGINATION_BOX_SX}>
                <TablePagination
                    component="div"
                    rowsPerPageOptions={[10, 25, 50]}
                    count={todasLasUnidades.length}
                    rowsPerPage={porPagina}
                    page={pagina}
                    onPageChange={(_evento, destino) => setPagina(destino)}
                    onRowsPerPageChange={(evento) => {
                        setPorPagina(parseInt(evento.target.value, 10));
                        setPagina(0);
                    }}
                    labelRowsPerPage="Unidades por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    sx={PAGINATION_SX}
                />
            </Box>

            {apertura && (
                <ConstructorOrden
                    apertura={apertura}
                    onCerrar={() => setApertura(null)}
                    onCreada={(idOrden, gastos) => {
                        setApertura(null);
                        cargar();
                        Swal.fire(
                            'Orden creada',
                            gastos > 0
                                ? `Se levantó la orden #${idOrden} y su gasto quedó en el Administrador de Gastos.`
                                : `Se levantó la orden #${idOrden}.`,
                            'success',
                        );
                    }}
                />
            )}

            {altaAbierta && (
                <ModalPendienteManual
                    unidadTipo={lado}
                    onCancelar={() => setAltaAbierta(false)}
                    onGuardar={levantar}
                />
            )}
        </Box>
    );
};

export default PanelPendientes;
