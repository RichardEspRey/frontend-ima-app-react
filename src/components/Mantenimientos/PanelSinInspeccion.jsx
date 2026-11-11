import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Alert, Box, Button, Chip, CircularProgress, Paper, Stack, Table, TableBody, TableCell,
    TableContainer, TableHead, TablePagination, TableRow, TextField, Typography
} from '@mui/material';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';

import BarraFiltros from './BarraFiltros';
import { obtenerViajesSinInspeccion } from '../../services/mantenimiento';
import {
    CARD_SX, SECTION_LABEL_SX, TABLE_CONTAINER_SX, HEADER_ROW_SX, HEADER_CELL_SX,
    PAGINATION_BOX_SX, PAGINATION_SX,
} from '../../styles/estilosTabla';

const SIN_FILTROS = { viaje: '', operador: '', camion: '', desde: '', hasta: '' };

const COLUMNAS = 6;

const operadoresDe = (fila) => [fila.operador, fila.operador_2].filter(Boolean);

const PanelSinInspeccion = () => {
    const [filas, setFilas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState(SIN_FILTROS);
    const [pagina, setPagina] = useState(0);
    const [porPagina, setPorPagina] = useState(10);

    const cargar = useCallback(async () => {
        setCargando(true);
        setError(null);
        try {
            setFilas(await obtenerViajesSinInspeccion());
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

        const operadores = operadoresDe(fila).join(' ').toLowerCase();
        if (filtros.operador.trim() && !operadores.includes(filtros.operador.trim().toLowerCase())) return false;

        if (filtros.camion.trim() && String(fila.no_camion || '') !== filtros.camion.trim()) return false;

        const fecha = (fila.creation_date || '').slice(0, 10);
        if (filtros.desde && fecha < filtros.desde) return false;
        if (filtros.hasta && fecha > filtros.hasta) return false;

        return true;
    }), [filas, filtros]);

    const porOperador = useMemo(() => {
        const conteo = new Map();
        filtradas.forEach(fila => {
            const nombre = fila.operador || 'Sin operador';
            conteo.set(nombre, (conteo.get(nombre) || 0) + 1);
        });
        return [...conteo.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    }, [filtradas]);

    const visibles = useMemo(
        () => filtradas.slice(pagina * porPagina, pagina * porPagina + porPagina),
        [filtradas, pagina, porPagina],
    );

    const hayFiltros = Object.values(filtros).some(valor => valor !== '');

    const cambiarFiltro = (campo, valor) => {
        setFiltros(prev => ({ ...prev, [campo]: valor }));
        setPagina(0);
    };

    return (
        <Box>
            <Alert severity="warning" icon={<ReportProblemOutlinedIcon />} sx={{ mb: 2, borderRadius: 2 }}>
                Viajes terminados de los que el operador no mandó la inspección final. Cuentan desde que
                existe la inspección en la app móvil; los viajes que todavía no terminan no aparecen.
            </Alert>

            {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button onClick={cargar}>Reintentar</Button>}>{error}</Alert>}

            <BarraFiltros
                hayFiltros={hayFiltros}
                onLimpiar={() => { setFiltros(SIN_FILTROS); setPagina(0); }}
                resumen={`${filtradas.length} viaje(s) sin inspección`}
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

            {!cargando && porOperador.length > 0 && (
                <Paper elevation={0} sx={{ ...CARD_SX, mb: 2.5, bgcolor: 'white' }}>
                    <Typography variant="overline" sx={{ ...SECTION_LABEL_SX, display: 'block', mb: 1.5 }}>
                        Por operador
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {porOperador.map(([nombre, total]) => {
                            const elegido = filtros.operador === nombre;
                            return (
                                <Chip
                                    key={nombre}
                                    label={`${nombre} · ${total}`}
                                    onClick={() => cambiarFiltro('operador', elegido ? '' : nombre)}
                                    sx={{
                                        fontWeight: 700,
                                        bgcolor: elegido ? '#0f172a' : '#fffbeb',
                                        color: elegido ? 'white' : '#b45309',
                                        border: `1px solid ${elegido ? '#0f172a' : '#fde68a'}`,
                                        '&:hover': { bgcolor: elegido ? '#1e293b' : '#fef3c7' },
                                    }}
                                />
                            );
                        })}
                    </Stack>
                </Paper>
            )}

            <TableContainer component={Paper} sx={TABLE_CONTAINER_SX}>
                <Table>
                    <TableHead>
                        <TableRow sx={HEADER_ROW_SX}>
                            <TableCell sx={HEADER_CELL_SX}>Viaje</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Creado</TableCell>
                            <TableCell sx={HEADER_CELL_SX}>Regreso</TableCell>
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
                                        ? 'Ningún viaje coincide con los filtros.'
                                        : 'Todos los viajes terminados tienen su inspección.'}
                                </TableCell>
                            </TableRow>
                        )}

                        {!cargando && visibles.map(fila => (
                            <TableRow key={fila.viaje_id} hover>
                                <TableCell>
                                    <Typography fontWeight={800} color="#0f172a">
                                        {fila.nomenclatura || fila.trip_number}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="#475569">
                                        {(fila.creation_date || '').slice(0, 10) || '—'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="#475569">
                                        {(fila.return_date || '').slice(0, 10) || '—'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="#334155">{fila.operador || '—'}</Typography>
                                    {fila.operador_2 && (
                                        <Typography variant="caption" color="#64748b">{fila.operador_2}</Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={700} color="#334155">{fila.no_camion || '—'}</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" fontWeight={700} color="#334155">{fila.no_caja || '—'}</Typography>
                                </TableCell>
                            </TableRow>
                        ))}
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
                    onPageChange={(_evento, destino) => setPagina(destino)}
                    onRowsPerPageChange={(evento) => {
                        setPorPagina(parseInt(evento.target.value, 10));
                        setPagina(0);
                    }}
                    labelRowsPerPage="Filas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                    sx={PAGINATION_SX}
                />
            </Box>
        </Box>
    );
};

export default PanelSinInspeccion;
