import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert, Box, Button, Chip, CircularProgress, Collapse, IconButton, Paper, Stack, Tab,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, ToggleButton,
    ToggleButtonGroup, Typography
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import Swal from 'sweetalert2';

import ConstructorOrden from './ConstructorOrden';
import RubrosInspeccion from './RubrosInspeccion';
import { useAuthStore } from '../../store/useAuthStore';
import {
    ESTATUS_PUNTO, UNIDAD, completarLado, obtenerInspeccionesDeLado, obtenerPuntos, resolverPuntos
} from '../../services/mantenimiento';
import {
    TABLE_CONTAINER_SX, HEADER_ROW_SX, HEADER_CELL_SX, TABS_WRAPPER_SX, TAB_SX, DARK_BTN_SX,
} from '../../styles/estilosTabla';

const LADOS = [
    { id: UNIDAD.CAMION, etiqueta: 'Camión' },
    { id: UNIDAD.CAJA, etiqueta: 'Caja' },
];

/**
 * Las inspecciones que llegan del móvil, trabajadas por lado.
 *
 * Es el centro del flujo: de aquí se arman las órdenes, se mandan puntos a pendientes
 * y se descarta lo que no procede, sin salir de la pantalla.
 */
const PanelInspecciones = () => {
    const usuario = useAuthStore(estado => estado.user);
    const [lado, setLado] = useState(UNIDAD.CAMION);
    const [pestana, setPestana] = useState('pendientes');
    const [filas, setFilas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    const [abierta, setAbierta] = useState(null);
    const [detalles, setDetalles] = useState({});
    const [cargandoDetalle, setCargandoDetalle] = useState(false);
    const [seleccionados, setSeleccionados] = useState([]);
    const [apertura, setApertura] = useState(null);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            setFilas(await obtenerInspeccionesDeLado(lado));
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }, [lado]);

    useEffect(() => { cargar(); }, [cargar]);

    const visibles = useMemo(() => filas.filter(fila => {
        const completada = fila.estatus_lado === 'completada';
        return pestana === 'completadas' ? completada : !completada;
    }), [filas, pestana]);

    const abrir = async (fila) => {
        const viajeId = fila.viaje_id;
        if (abierta === viajeId) { setAbierta(null); return; }

        setAbierta(viajeId);
        setSeleccionados([]);

        setCargandoDetalle(true);
        try {
            const puntos = await obtenerPuntos(viajeId, lado);
            setDetalles(prev => ({ ...prev, [viajeId]: puntos }));
        } catch (err) {
            setError(err.message);
        } finally {
            setCargandoDetalle(false);
        }
    };

    const puntosAbiertos = useMemo(
        () => (detalles[abierta] || []).filter(p => p.estatus !== ESTATUS_PUNTO.DESCARTADO),
        [detalles, abierta],
    );

    const elegidos = useMemo(
        () => puntosAbiertos.filter(p => seleccionados.includes(p.clave)),
        [puntosAbiertos, seleccionados],
    );

    const alternar = (clave) => setSeleccionados(prev =>
        prev.includes(clave) ? prev.filter(x => x !== clave) : [...prev, clave]);

    const alternarRubro = (claves, encender) => setSeleccionados(prev => encender
        ? [...new Set([...prev, ...claves])]
        : prev.filter(clave => !claves.includes(clave)));

    const filaAbierta = filas.find(f => f.viaje_id === abierta);

    const recargarPuntos = async () => {
        const puntos = await obtenerPuntos(abierta, lado);
        setDetalles(prev => ({ ...prev, [abierta]: puntos }));
        setSeleccionados([]);
        cargar();
    };

    const resolver = async (estatus) => {
        const items = elegidos.map(punto => ({
            cl_final_id: filaAbierta?.cl_final_id,
            viaje_id: abierta,
            categoria: punto.categoria,
            origen_tabla: punto.origenTabla,
            origen_id: punto.origenId,
            unidad_tipo: punto.unidadTipo,
            truck_id: filaAbierta?.truck_id,
            caja_id: filaAbierta?.caja_id,
            descripcion: punto.texto,
        }));

        try {
            await resolverPuntos({ items, estatus, usuarioId: usuario?.id });
            await recargarPuntos();
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        }
    };

    const descartar = async () => {
        const confirmacion = await Swal.fire({
            title: `¿Descartar ${elegidos.length} punto(s)?`,
            text: 'No entran a ninguna orden ni quedan pendientes: se guardan como descartados.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, descartar',
            cancelButtonText: 'Cancelar',
        });
        if (confirmacion.isConfirmed) resolver(ESTATUS_PUNTO.DESCARTADO);
    };

    const cerrarLado = async () => {
        try {
            await completarLado({
                clFinalId: filaAbierta?.cl_final_id,
                viajeId: abierta,
                lado,
                usuarioId: usuario?.id,
            });
            setAbierta(null);
            cargar();
        } catch (err) {
            Swal.fire('Falta resolver puntos', err.message, 'warning');
        }
    };

    const sinResolver = puntosAbiertos.filter(p => p.estatus === ESTATUS_PUNTO.SIN_RESOLVER).length;

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 2 }}>
                <ToggleButtonGroup
                    exclusive
                    size="small"
                    value={lado}
                    onChange={(_evento, valor) => { if (valor) { setLado(valor); setSeleccionados([]); } }}
                    sx={{ bgcolor: '#f1f5f9', borderRadius: 2.5, p: 0.5, gap: 0.5 }}
                >
                    {LADOS.map(l => (
                        <ToggleButton
                            key={l.id}
                            value={l.id}
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

                <Box sx={TABS_WRAPPER_SX}>
                    <Tabs value={pestana} onChange={(_evento, valor) => setPestana(valor)} TabIndicatorProps={{ style: { display: 'none' } }}>
                        <Tab value="pendientes" label="Pendientes" sx={TAB_SX} />
                        <Tab value="completadas" label="Completadas" sx={TAB_SX} />
                    </Tabs>
                </Box>
            </Stack>

            {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button onClick={cargar}>Reintentar</Button>}>{error}</Alert>}

            <TableContainer component={Paper} sx={TABLE_CONTAINER_SX}>
                <Table>
                    <TableHead>
                        <TableRow sx={HEADER_ROW_SX}>
                            <TableCell sx={{ ...HEADER_CELL_SX, width: 50 }} />
                            <TableCell sx={HEADER_CELL_SX}>Viaje</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Operador</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>{lado === UNIDAD.CAJA ? 'Caja' : 'Camión'}</TableCell>
                            <TableCell sx={HEADER_CELL_SX} align="center">Por atender</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {cargando && (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
                        )}

                        {!cargando && visibles.length === 0 && !error && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 6, color: '#64748b' }}>
                                    No hay inspecciones con puntos de {lado === UNIDAD.CAJA ? 'caja' : 'camión'} en esta pestaña.
                                </TableCell>
                            </TableRow>
                        )}

                        {!cargando && visibles.map(fila => (
                            <>
                                <TableRow key={fila.viaje_id} hover>
                                    <TableCell>
                                        <IconButton size="small" onClick={() => abrir(fila)}>
                                            {abierta === fila.viaje_id ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                        </IconButton>
                                    </TableCell>
                                    <TableCell>
                                        <Typography fontWeight={800} color="#0f172a">{fila.trip_number}</Typography>
                                        <Typography variant="caption" color="#64748b">{fila.nomenclatura}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="#334155">{fila.operador}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={700} color="#334155">
                                            {lado === UNIDAD.CAJA ? (fila.no_caja || '—') : (fila.no_camion || '—')}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Chip
                                            size="small"
                                            label={fila.por_atender}
                                            sx={{ height: 22, fontWeight: 700, bgcolor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                                        />
                                    </TableCell>
                                </TableRow>

                                <TableRow key={`${fila.viaje_id}-detalle`}>
                                    <TableCell colSpan={5} sx={{ py: 0, borderBottom: abierta === fila.viaje_id ? '1px solid #e2e8f0' : 'none' }}>
                                        <Collapse in={abierta === fila.viaje_id} timeout="auto" unmountOnExit>
                                            <Box sx={{ py: 2.5, bgcolor: '#f8fafc', px: 2, borderRadius: 2, my: 1.5 }}>
                                                {cargandoDetalle && <CircularProgress size={22} />}

                                                {!cargandoDetalle && (
                                                    <>
                                                        <RubrosInspeccion
                                                            puntos={puntosAbiertos}
                                                            seleccionados={seleccionados}
                                                            onAlternar={alternar}
                                                            onAlternarRubro={alternarRubro}
                                                        />

                                                        {puntosAbiertos.length > 0 && (
                                                            <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }} flexWrap="wrap">
                                                                <Button
                                                                    variant="contained"
                                                                    startIcon={<BuildOutlinedIcon />}
                                                                    disabled={elegidos.length === 0}
                                                                    onClick={() => setApertura({ inspeccion: filaAbierta, lado, puntos: elegidos })}
                                                                    sx={DARK_BTN_SX}
                                                                >
                                                                    Crear orden ({elegidos.length})
                                                                </Button>
                                                                <Button
                                                                    variant="outlined"
                                                                    startIcon={<ScheduleOutlinedIcon />}
                                                                    disabled={elegidos.length === 0}
                                                                    onClick={() => resolver(ESTATUS_PUNTO.EN_PENDIENTES)}
                                                                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                                                                >
                                                                    Mandar a pendientes
                                                                </Button>
                                                                <Button
                                                                    variant="outlined"
                                                                    color="error"
                                                                    startIcon={<BlockOutlinedIcon />}
                                                                    disabled={elegidos.length === 0}
                                                                    onClick={descartar}
                                                                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                                                                >
                                                                    Descartar
                                                                </Button>

                                                                <Box sx={{ flexGrow: 1 }} />

                                                                <Button
                                                                    variant="outlined"
                                                                    color="success"
                                                                    startIcon={<CheckCircleOutlineIcon />}
                                                                    disabled={sinResolver > 0}
                                                                    onClick={cerrarLado}
                                                                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                                                                >
                                                                    {sinResolver > 0
                                                                        ? `Faltan ${sinResolver} por resolver`
                                                                        : 'Completar lado'}
                                                                </Button>
                                                            </Stack>
                                                        )}
                                                    </>
                                                )}
                                            </Box>
                                        </Collapse>
                                    </TableCell>
                                </TableRow>
                            </>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            {apertura && (
                <ConstructorOrden
                    apertura={apertura}
                    onCerrar={() => setApertura(null)}
                    onCreada={async (idOrden) => {
                        setApertura(null);
                        await recargarPuntos();
                        Swal.fire('Orden creada', `Se levantó la orden #${idOrden}.`, 'success');
                    }}
                />
            )}
        </Box>
    );
};

export default PanelInspecciones;
