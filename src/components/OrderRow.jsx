import React, { useState, useMemo } from 'react';
import {
    TableCell, TableRow, Paper, Button, Typography, IconButton, Collapse, Chip, Stack, Box, Tooltip,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import {
    CELL_STRONG_SX, CELL_SX, CELL_MUTED_SX, GHOST_BTN_SX, ICON_BTN_SX, SECTION_LABEL_SX,
    CHIP_OK_SX, CHIP_WARN_SX, CHIP_INFO_SX, CHIP_NEUTRO_SX, CHIP_SX,
} from '../styles/estilosTabla';

const money = (v) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, currencyDisplay: 'symbol' })
    .format(Number(v || 0));

const NUMERO_SX = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };

const ESTATUS = {
    abierta: { chip: CHIP_WARN_SX, acento: '#f59e0b' },
    pendiente: { chip: CHIP_INFO_SX, acento: '#3b82f6' },
    completado: { chip: CHIP_OK_SX, acento: '#22c55e' },
};

const CHIP_EXTERNO_SX = { ...CHIP_SX, bgcolor: '#f5f3ff', color: '#6d28d9', border: '1px solid #ddd6fe' };

const MANTENIMIENTO_CHIP = { correctivo: CHIP_WARN_SX, preventivo: CHIP_INFO_SX };

const EDITAR_BTN_SX = { ...GHOST_BTN_SX, px: 1.5, py: 0.4, fontSize: '0.78rem' };

const BORRAR_BTN_SX = {
    ...ICON_BTN_SX,
    borderRadius: 2,
    color: '#b91c1c',
    borderColor: '#fecaca',
    '&:hover': { bgcolor: '#fef2f2', borderColor: '#fca5a5' },
};

const esManoDeObra = (detalle) => String(detalle?.tipo_detalle || '').toLowerCase() === 'mano de obra';

const subtotalDetalle = (detalle) => {
    const costo = parseFloat(detalle?.costo ?? 0) || 0;
    const cantidad = parseFloat(detalle?.cantidad ?? 0) || 0;
    return esManoDeObra(detalle) ? costo : costo * cantidad;
};

const totalesDe = (detalles) =>
    (detalles ?? []).reduce((acc, d) => {
        const sub = subtotalDetalle(d);
        return esManoDeObra(d) ? { ...acc, mo: acc.mo + sub } : { ...acc, items: acc.items + sub };
    }, { mo: 0, items: 0 });

const estatusDe = (valor) => ESTATUS[String(valor || '').toLowerCase()];

const Dato = ({ etiqueta, children }) => (
    <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ ...SECTION_LABEL_SX, display: 'block', textTransform: 'uppercase' }}>
            {etiqueta}
        </Typography>
        <Box sx={{ mt: 0.25 }}>{children}</Box>
    </Box>
);

const TarjetaServicio = ({ servicio, indice }) => {
    const detalles = servicio?.detalles ?? [];
    const totales = totalesDe(detalles);
    const estatus = estatusDe(servicio.estatus);
    const origen = servicio.origen_servicio;

    return (
        <Paper
            elevation={0}
            sx={{ minWidth: 340, maxWidth: 400, flex: '0 0 auto', border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#fff', display: 'flex', flexDirection: 'column' }}
        >
            <Box sx={{ p: 2, borderBottom: '1px solid #f1f5f9' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="overline" sx={{ ...SECTION_LABEL_SX, lineHeight: 1.4 }}>
                        Servicio {indice + 1}
                    </Typography>
                    {servicio.estatus && <Chip size="small" label={servicio.estatus} sx={estatus?.chip || CHIP_NEUTRO_SX} />}
                </Stack>
                <Typography variant="body2" fontWeight={700} color="#0f172a" sx={{ mb: 1.5 }}>
                    {servicio.tipo_reparacion || 'Sin reparación indicada'}
                </Typography>
                <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
                    <Dato etiqueta="Mantenimiento">
                        {servicio.tipo_mantenimiento
                            ? <Chip size="small" label={servicio.tipo_mantenimiento} sx={MANTENIMIENTO_CHIP[servicio.tipo_mantenimiento.toLowerCase()] || CHIP_NEUTRO_SX} />
                            : <Typography variant="body2" color="#94a3b8">—</Typography>}
                    </Dato>
                    <Dato etiqueta="Mantenimiento realizado">
                        {origen
                            ? <Chip size="small" label={origen} sx={origen.toLowerCase() === 'externo' ? CHIP_EXTERNO_SX : CHIP_NEUTRO_SX} />
                            : <Typography variant="body2" color="#94a3b8">—</Typography>}
                    </Dato>
                    {servicio.fecha_termino && (
                        <Dato etiqueta="Fecha">
                            <Typography variant="body2" sx={{ ...CELL_MUTED_SX, ...NUMERO_SX }}>{servicio.fecha_termino}</Typography>
                        </Dato>
                    )}
                </Stack>
            </Box>

            <Box sx={{ px: 2, py: 1.5, flex: 1 }}>
                {detalles.length === 0 ? (
                    <Typography variant="body2" color="#94a3b8" sx={{ py: 1 }}>Sin conceptos registrados.</Typography>
                ) : (
                    <Stack divider={<Box sx={{ borderTop: '1px dashed #e2e8f0' }} />}>
                        {detalles.map((det) => {
                            const isMO = esManoDeObra(det);
                            return (
                                <Stack key={det.id_detalle} direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1.5} sx={{ py: 1 }}>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="body2" sx={{ ...CELL_SX, fontWeight: 600 }} noWrap title={det.descripcion}>
                                            {det.descripcion || '—'}
                                        </Typography>
                                        <Typography variant="caption" color="#94a3b8" sx={NUMERO_SX}>
                                            {det.tipo_detalle || '—'}
                                            {!isMO && ` · ${parseFloat(det.cantidad ?? 0) || 0} × ${money(det.costo)}`}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" fontWeight={700} color="#0f172a" sx={NUMERO_SX}>
                                        {money(subtotalDetalle(det))}
                                    </Typography>
                                </Stack>
                            );
                        })}
                    </Stack>
                )}
            </Box>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.25, bgcolor: '#fafbfc', borderTop: '1px solid #f1f5f9', borderBottomLeftRadius: 8, borderBottomRightRadius: 8 }}>
                <Typography variant="caption" color="#64748b" sx={NUMERO_SX}>
                    MO {money(totales.mo)} · Refacciones {money(totales.items)}
                </Typography>
                <Typography variant="body2" fontWeight={800} color="#0f172a" sx={NUMERO_SX}>
                    {money(totales.mo + totales.items)}
                </Typography>
            </Stack>
        </Paper>
    );
};

export const OrderRow = ({ order, onEdit, onDelete }) => {
    const [open, setOpen] = useState(false);
    const servicios = useMemo(() => order?.servicios ?? [], [order]);
    const tipoCambio = Number(order?.tipo_cambio ?? 0) || 0;
    const estatus = estatusDe(order?.estatus);
    const completada = String(order?.estatus).toLowerCase() === 'completado';

    const totalsOrder = useMemo(() => {
        const { mo, items } = servicios.reduce((acc, s) => {
            const t = totalesDe(s.detalles);
            return { mo: acc.mo + t.mo, items: acc.items + t.items };
        }, { mo: 0, items: 0 });
        return { mo, items, total: mo + items };
    }, [servicios]);

    const totalMostrado = tipoCambio > 0 ? totalsOrder.total * tipoCambio : totalsOrder.total;

    const unidad = order.nombre_camion
        ? `Camión ${order.nombre_camion}`
        : order.nombre_caja
            ? `Caja ${order.nombre_caja}`
            : null;

    return (
        <>
            <TableRow hover sx={{ '& > *': { borderBottom: open ? 'none' : undefined } }}>
                <TableCell sx={{ borderLeft: `3px solid ${estatus?.acento || '#cbd5e1'}`, pl: 1.5, width: 48 }}>
                    <IconButton size="small" onClick={() => setOpen(!open)} aria-label="Ver servicios">
                        {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                    </IconButton>
                </TableCell>
                <TableCell sx={{ ...CELL_STRONG_SX, ...NUMERO_SX }}>#{order.id_orden}</TableCell>
                <TableCell sx={{ ...CELL_MUTED_SX, ...NUMERO_SX }}>{order.fecha_orden}</TableCell>
                <TableCell sx={CELL_STRONG_SX}>
                    {unidad || <Typography component="span" variant="body2" color="#94a3b8">Sin unidad</Typography>}
                </TableCell>
                <TableCell>
                    {order.estatus
                        ? <Chip size="small" label={order.estatus} sx={estatus?.chip || CHIP_NEUTRO_SX} />
                        : '—'}
                </TableCell>
                <TableCell>
                    <Chip
                        size="small"
                        label={servicios.length ? `${servicios.length} servicio${servicios.length > 1 ? 's' : ''}` : 'Sin servicios'}
                        sx={CHIP_NEUTRO_SX}
                    />
                </TableCell>
                <TableCell align="right" sx={{ ...CELL_SX, ...NUMERO_SX }}>{money(totalsOrder.mo)}</TableCell>
                <TableCell align="right" sx={{ ...CELL_SX, ...NUMERO_SX }}>{money(totalsOrder.items)}</TableCell>
                <TableCell align="right" sx={{ ...CELL_MUTED_SX, ...NUMERO_SX }}>
                    {tipoCambio > 0 ? tipoCambio.toFixed(2) : '—'}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, color: '#0f172a', ...NUMERO_SX }}>
                    {money(totalMostrado)}
                </TableCell>
                <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                    <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={completada ? <VisibilityOutlinedIcon sx={{ fontSize: 16 }} /> : <EditOutlinedIcon sx={{ fontSize: 16 }} />}
                            onClick={() => onEdit(order.id_orden)}
                            sx={EDITAR_BTN_SX}
                        >
                            {completada ? 'Ver' : 'Editar'}
                        </Button>
                        <Tooltip title="Eliminar orden">
                            <IconButton size="small" onClick={() => onDelete(order)} sx={BORRAR_BTN_SX}>
                                <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </TableCell>
            </TableRow>

            <TableRow>
                <TableCell sx={{ p: 0, borderBottom: open ? '1px solid #e2e8f0' : 'none' }} colSpan={11}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ bgcolor: '#f8fafc', px: 3, py: 2.5, borderTop: '1px solid #f1f5f9' }}>
                            <Typography variant="overline" sx={{ ...SECTION_LABEL_SX, display: 'block', mb: 1.5 }}>
                                Servicios de la orden #{order.id_orden}
                            </Typography>

                            {servicios.length === 0 ? (
                                <Box sx={{ py: 4, textAlign: 'center', border: '1px dashed #e2e8f0', borderRadius: 2, bgcolor: '#fff' }}>
                                    <Typography variant="body2" color="#94a3b8">Esta orden no tiene servicios registrados.</Typography>
                                </Box>
                            ) : (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        gap: 2,
                                        overflowX: 'auto',
                                        pb: 1,
                                        '&::-webkit-scrollbar': { height: 8 },
                                        '&::-webkit-scrollbar-thumb': { backgroundColor: '#cbd5e1', borderRadius: 8 },
                                    }}
                                >
                                    {servicios.map((svc, idx) => (
                                        <TarjetaServicio key={svc.id_servicio} servicio={svc} indice={idx} />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
};
