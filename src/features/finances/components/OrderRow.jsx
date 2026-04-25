import React, { useState, useMemo } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableRow, Paper,
    Button, Typography, CircularProgress,
    IconButton, Collapse, Chip, Stack, Divider, Card, CardContent, CardActions, CardHeader, Box
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

const money = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, currencyDisplay: 'symbol' })
    .format(Number(v || 0));

const getStatusChipColor = (status) => {
    if (!status) return 'default';
    const s = String(status).toLowerCase();
    if (s === 'completado' || s === 'cerrada' || s === 'cerrado') return 'success';
    if (s === 'pendiente' || s === 'abierta' || s === 'abierto') return 'warning';
    if (s === 'cancelado' || s === 'cancelada') return 'error';
    return 'default';
};

export const OrderRow = ({ order, onEdit, onEditDetail }) => {
    const [open, setOpen] = useState(false);
    const servicios = order?.servicios ?? [];
    const tipoCambio = Number(order?.tipo_cambio ?? 0) || 0;

 
    const serviciosResumen = useMemo(() => {
        const n = servicios.length;
        return n ? `${n} servicio${n > 1 ? 's' : ''}` : '—';
    }, [servicios]);

    const totalsOrder = useMemo(() => {
        let mo = 0;
        let items = 0;
        for (const s of servicios) {
            for (const d of (s.detalles ?? [])) {
                const isMO = String(d.tipo_detalle || '').toLowerCase() === 'mano de obra';
                const costo = parseFloat(d.costo ?? 0) || 0;
                const cant = parseFloat(d.cantidad ?? 0) || 0;
                if (isMO) mo += costo; else items += (costo * cant);
            }
        }
        return { mo, items, total: mo + items };
    }, [servicios]);
    
    const totalMostrado = useMemo(() => {
        return tipoCambio > 0 ? (totalsOrder.total * tipoCambio) : totalsOrder.total;
    }, [totalsOrder.total, tipoCambio]);

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} hover>
                <TableCell>
                    <IconButton size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row">#{order.id_orden}</TableCell>
                <TableCell>{order.fecha_orden}</TableCell>
                <TableCell>{order.nombre_camion || 'N/A'}</TableCell>
                <TableCell>{serviciosResumen}</TableCell>

                <TableCell align="right" sx={{ fontWeight: 500 }}>{money(totalsOrder.mo)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 500 }}>{money(totalsOrder.items)}</TableCell>

                <TableCell align="right" sx={{ fontWeight: 500 }}>
                    {tipoCambio > 0 ? tipoCambio.toFixed(2) : '—'}
                </TableCell>

                <TableCell align="right">
                    <Typography fontWeight={700}>{money(totalMostrado)}</Typography>
                </TableCell>

                <TableCell>
                    <Chip label={order.estatus || '—'} color={getStatusChipColor(order.estatus)} size="small" sx={{ fontWeight: 600 }} />
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    <Button size="small" variant="contained" onClick={() => onEdit(order.id_orden)}>
                        {String(order.estatus).toLowerCase() === 'completado' ? 'Ver' : 'Editar'}
                    </Button>
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ m: 1, p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
                            <Typography variant="h6" fontWeight={700} sx={{ fontSize: '1rem', mb: 2 }}>
                                Servicios de la Orden #{order.id_orden}
                            </Typography>

                            {servicios.length === 0 ? (
                                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                    Esta orden no tiene servicios registrados.
                                </Typography>
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 2,
                                        overflowX: 'auto',
                                        pb: 1,
                                        '&::-webkit-scrollbar': { height: 8 },
                                        '&::-webkit-scrollbar-thumb': { backgroundColor: '#c7c7c7', borderRadius: 8 }
                                    }}
                                >
                                    {servicios.map((svc, idx) => {
                                        const detalles = svc?.detalles ?? [];

                                        const totales = detalles.reduce((acc, d) => {
                                            const costo = parseFloat(d.costo ?? 0) || 0;
                                            const cant = parseFloat(d.cantidad ?? 0) || 0;
                                            const sub = (d.tipo_detalle?.toLowerCase() === 'mano de obra')
                                                ? costo 
                                                : costo * cant;
                                            return {
                                                mo: acc.mo + (d.tipo_detalle?.toLowerCase() === 'mano de obra' ? costo : 0),
                                                items: acc.items + (d.tipo_detalle?.toLowerCase() !== 'mano de obra' ? sub : 0),
                                            };
                                        }, { mo: 0, items: 0 });
                                        const totalServicio = totales.mo + totales.items;


                                        return (
                                            <Card key={svc.id_servicio} sx={{ minWidth: 360, maxWidth: 420, flex: '0 0 auto' }} elevation={2}>
                                                <CardHeader
                                                    title={
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                                                Servicio {idx + 1}
                                                            </Typography>
                                                            <Chip
                                                                label={svc.estatus || 'Abierta'}
                                                                size="small"
                                                                color={getStatusChipColor(svc.estatus)}
                                                                sx={{ fontWeight: 600 }}
                                                            />
                                                        </Box>
                                                    }
                                                    subheader={
                                                        <Box>
                                                            <Typography variant="body2">
                                                                <strong>Mantenimiento:</strong> {svc.tipo_mantenimiento || '—'}
                                                            </Typography>
                                                            <Typography variant="body2">
                                                                <strong>Reparación:</strong> {svc.tipo_reparacion || '—'}
                                                            </Typography>
                                                            {svc.fecha_termino && (
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Fecha: {svc.fecha_termino}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    }
                                                    sx={{ pb: 1 }}
                                                />
                                                <Divider />
                                                <CardContent>
                                                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                                                        Detalles
                                                    </Typography>

                                                    {detalles.length === 0 ? (
                                                        <Typography variant="body2" color="text.secondary">
                                                            Sin detalles.
                                                        </Typography>
                                                    ) : (
                                                        <Stack spacing={1.25}>
                                                            {detalles.map((det) => {
                                                                const isMO = String(det.tipo_detalle || '').toLowerCase() === 'mano de obra';
                                                                const costo = parseFloat(det.costo ?? 0) || 0;
                                                                const cantidad = parseFloat(det.cantidad ?? 0) || 0;
                                                                const subtotal = isMO ? costo : (costo * cantidad);

                                                                return (
                                                                    <Paper key={det.id_detalle} variant="outlined" sx={{ p: 1.25, borderRadius: 1.5 }}>
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 1 }}>
                                                                            <Box sx={{ minWidth: 0 }}>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                                                    <Chip
                                                                                        label={det.tipo_detalle || '—'}
                                                                                        size="small"
                                                                                        variant="outlined"
                                                                                    />
                                                                                    {det.id_articulo ? (
                                                                                        <Chip
                                                                                            label={`ID Art: ${det.id_articulo}`}
                                                                                            size="small"
                                                                                            color="default"
                                                                                            variant="outlined"
                                                                                        />
                                                                                    ) : null}
                                                                                </Box>
                                                                                <Typography variant="body2" sx={{ mt: 0.5 }} noWrap title={det.descripcion}>
                                                                                    {det.descripcion || '—'}
                                                                                </Typography>
                                                                                {!isMO && (
                                                                                    <Typography variant="caption" color="text.secondary">
                                                                                        Cant.: {cantidad} · Costo u.: {money(costo)}
                                                                                    </Typography>
                                                                                )}
                                                                            </Box>
                                                                            <Box sx={{ textAlign: 'right' }}>
                                                                                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                                                                    {money(subtotal)}
                                                                                </Typography>

                                                                            </Box>
                                                                        </Box>
                                                                    </Paper>
                                                                );
                                                            })}
                                                        </Stack>
                                                    )}

                                                    <Divider sx={{ my: 1.5 }} />
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            MO: <strong style={{ color: '#333' }}>{money(totales.mo)}</strong>
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Items: <strong style={{ color: '#333' }}>{money(totales.items)}</strong>
                                                        </Typography>
                                                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                                                            Total: {money(totalServicio)}
                                                        </Typography>
                                                    </Box>
                                                </CardContent>
                                                <CardActions sx={{ justifyContent: 'center', pt: 0, pb: 2 }}>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        onClick={() =>
                                                            onEditDetail({
                                                                id_servicio: svc.id_servicio,         
                                                                estatus: svc.estatus || 'Pendiente',  
                                                                titulo: `Servicio ${idx + 1}`,
                                                                tipo_mantenimiento: svc.tipo_mantenimiento,
                                                                tipo_reparacion: svc.tipo_reparacion,
                                                            })
                                                        }
                                                    >
                                                        EDITAR
                                                    </Button>
                                                </CardActions>
                                            </Card>
                                        );
                                    })}
                                </Box>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>

        </>
    );
};