import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert, Box, Button, Chip, CircularProgress, Collapse, IconButton, Paper, Stack, Table,
    TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

import BarraFiltros from './BarraFiltros';
import { COLOR_INSPECCION, UNIDAD, obtenerInspeccionesSinFallas } from '../../services/mantenimiento';
import {
    TABLE_CONTAINER_SX, HEADER_ROW_SX, HEADER_CELL_SX, PAGINATION_BOX_SX, PAGINATION_SX,
} from '../../styles/estilosTabla';

const SIN_FILTROS = { viaje: '', operador: '', camion: '', caja: '', desde: '', hasta: '' };

const COLUMNAS = 6;

const PanelSinFallas = () => {
    const [filas, setFilas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [abierta, setAbierta] = useState(null);
    const [filtros, setFiltros] = useState(SIN_FILTROS);
    const [pagina, setPagina] = useState(0);
    const [porPagina, setPorPagina] = useState(10);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            setFilas(await obtenerInspeccionesSinFallas());
        } catch (err) {
            setError(err.message);
        } finally {
            setCargando(false);
        }
    }, []);

    useEffect(() => { cargar(); }, [cargar]);

    const filtradas = useMemo(() => filas.filter(fila => {
        const viaje = `${fila.nomenclatura || ''} ${fila.trip_number || ''}`.toLowerCase();
        if (filtros.viaje.trim() && !viaje.includes(filtros.viaje.trim().toLowerCase())) return false;

        const operador = (fila.operador || '').toLowerCase();
        if (filtros.operador.trim() && !operador.includes(filtros.operador.trim().toLowerCase())) return false;

        if (filtros.camion.trim() && String(fila.no_camion || '') !== filtros.camion.trim()) return false;
        if (filtros.caja.trim() && String(fila.no_caja || '') !== filtros.caja.trim()) return false;

        const fecha = (fila.fecha_creacion || '').slice(0, 10);
        if (filtros.desde && fecha < filtros.desde) return false;
        if (filtros.hasta && fecha > filtros.hasta) return false;

        return true;
    }), [filas, filtros]);

    const visibles = useMemo(
        () => filtradas.slice(pagina * porPagina, pagina * porPagina + porPagina),
        [filtradas, pagina, porPagina],
    );

    const hayFiltros = Object.values(filtros).some(valor => valor !== '');

    const cambiarFiltro = (campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
        setPagina(0);
        setAbierta(null);
    };

    const irAPagina = (destino) => {
        setPagina(destino);
        setAbierta(null);
    };

    return (
        <Box>
            <Alert severity="success" icon={<CheckCircleOutlineIcon />} sx={{ mb: 2, borderRadius: 2 }}>
                Inspecciones en las que el operador no reportó nada que reparar. No requieren orden de servicio;
                se muestran aquí para llevar el control de qué viajes sí mandaron su inspección.
            </Alert>

            {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button onClick={cargar}>Reintentar</Button>}>{error}</Alert>}

            <BarraFiltros
                hayFiltros={hayFiltros}
                onLimpiar={() => { setFiltros(SIN_FILTROS); setPagina(0); setAbierta(null); }}
                resumen={`${filtradas.length} inspección(es) sin fallas`}
            >
                <TextField
                    size="small" label="Viaje" placeholder="221 o 221-US"
                    sx={{ width: 170 }} value={filtros.viaje}
                    onChange={(evento) => cambiarFiltro('viaje', evento.target.value)}
                />
                <TextField
                    size="small" label="Operador" sx={{ width: 200 }} value={filtros.operador}
                    onChange={(evento) => cambiarFiltro('operador', evento.target.value)}
                />
                <TextField
                    size="small" label="Camión (exacto)" sx={{ width: 160 }} value={filtros.camion}
                    onChange={(evento) => cambiarFiltro('camion', evento.target.value)}
                />
                <TextField
                    size="small" label="Caja (exacto)" sx={{ width: 140 }} value={filtros.caja}
                    onChange={(evento) => cambiarFiltro('caja', evento.target.value)}
                />
                <TextField
                    size="small" type="date" label="Desde" InputLabelProps={{ shrink: true }}
                    sx={{ width: 160 }} value={filtros.desde}
                    onChange={(evento) => cambiarFiltro('desde', evento.target.value)}
                />
                <TextField
                    size="small" type="date" label="Hasta" InputLabelProps={{ shrink: true }}
                    sx={{ width: 160 }} value={filtros.hasta}
                    onChange={(evento) => cambiarFiltro('hasta', evento.target.value)}
                />
            </BarraFiltros>

            <TableContainer component={Paper} sx={TABLE_CONTAINER_SX}>
                <Table>
                    <TableHead>
                        <TableRow sx={HEADER_ROW_SX}>
                            <TableCell sx={{ ...HEADER_CELL_SX, width: 50 }} />
                            <TableCell sx={HEADER_CELL_SX}>Viaje</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Fecha</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Operador</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Camión</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Caja</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {cargando && (
                            <TableRow><TableCell colSpan={COLUMNAS} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
                        )}

                        {!cargando && visibles.length === 0 && !error && (
                            <TableRow>
                                <TableCell colSpan={COLUMNAS} align="center" sx={{ py: 6, color: '#64748b' }}>
                                    {hayFiltros
                                        ? 'Ninguna inspección coincide con los filtros.'
                                        : 'No hay inspecciones sin fallas.'}
                                </TableCell>
                            </TableRow>
                        )}

                        {!cargando && visibles.map(fila => {
                            const estaAbierta = abierta === fila.cl_final_id;
                            return (
                                <Fragment key={fila.cl_final_id}>
                                    <TableRow hover>
                                        <TableCell>
                                            <IconButton size="small" onClick={() => setAbierta(estaAbierta ? null : fila.cl_final_id)}>
                                                {estaAbierta ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>
                                            <Typography fontWeight={800} color="#0f172a">
                                                {fila.nomenclatura || fila.trip_number || `Viaje ${fila.viaje_id}`}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="#475569">
                                                {(fila.fecha_creacion || '').slice(0, 10) || '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="#334155">{fila.operador || '—'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={700} color="#334155">{fila.no_camion || '—'}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={700} color="#334155">{fila.no_caja || '—'}</Typography>
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell colSpan={COLUMNAS} sx={{ py: 0, borderBottom: estaAbierta ? '1px solid #e2e8f0' : 'none' }}>
                                            <Collapse in={estaAbierta} timeout="auto" unmountOnExit>
                                                <Box sx={{ py: 2, bgcolor: '#f8fafc', px: 2, borderRadius: 2, my: 1.5 }}>
                                                    <Typography variant="caption" color="#64748b" sx={{ display: 'block', mb: 1 }}>
                                                        Lo que escribió el operador
                                                    </Typography>

                                                    {fila.reporte.length === 0 && (
                                                        <Typography variant="body2" color="#64748b">
                                                            La inspección llegó sin ningún renglón.
                                                        </Typography>
                                                    )}

                                                    <Stack spacing={0.75}>
                                                        {fila.reporte.map((renglon, indice) => (
                                                            <Stack key={indice} direction="row" spacing={1.5} alignItems="center">
                                                                <Chip
                                                                    size="small"
                                                                    label={renglon.categoria}
                                                                    sx={{
                                                                        minWidth: 96, height: 22, fontWeight: 700, bgcolor: 'white',
                                                                        color: COLOR_INSPECCION[renglon.unidad_tipo] || COLOR_INSPECCION[UNIDAD.CAMION],
                                                                        border: `1px solid ${COLOR_INSPECCION[renglon.unidad_tipo] || COLOR_INSPECCION[UNIDAD.CAMION]}`,
                                                                    }}
                                                                />
                                                                <Typography variant="body2" color="#334155">
                                                                    {renglon.texto || <em style={{ color: '#94a3b8' }}>(vacío)</em>}
                                                                </Typography>
                                                            </Stack>
                                                        ))}
                                                    </Stack>
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </Fragment>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={PAGINATION_BOX_SX}>
                <TablePagination
                    component="div"
                    rowsPerPageOptions={[10, 25, 50]}
                    count={filtradas.length}
                    rowsPerPage={porPagina}
                    page={pagina}
                    onPageChange={(_evento, destino) => irAPagina(destino)}
                    onRowsPerPageChange={(evento) => {
                        setPorPagina(parseInt(evento.target.value, 10));
                        irAPagina(0);
                    }}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    sx={PAGINATION_SX}
                />
            </Box>
        </Box>
    );
};

export default PanelSinFallas;
