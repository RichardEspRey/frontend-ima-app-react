import {
    Box, Button, Chip, Divider, IconButton, MenuItem, Paper, Stack, TextField, Typography
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';

import GastoServicio from './GastoServicio';
import { CARD_SX, SECTION_LABEL_SX } from '../../styles/estilosTabla';

const hoy = () => new Date().toISOString().slice(0, 10);

const gastoEnBlanco = () => ({
    pais: '',
    fecha_ticket: hoy(),
    fecha_gasto: hoy(),
    cantidad_original: '',
    tipo_cambio: '',
    factura: null,
    ticket: null,
    conceptos: [{ categoria: '', subcategoria: '', descripcion: '', precio_unitario: '', cantidad: 1 }],
});

/**
 * Un servicio de la orden: una reparación, su mano de obra y los conceptos de gasto
 * que lleve. El tipo de reparación nace del punto que reportó el operador y se puede
 * corregir aquí mismo, que es lo que pidió operaciones.
 */
const ServicioOrden = ({ servicio, indice, categorias, subcategorias, onCambiar, onEliminar }) => {
    const cambiar = (campo, valor) => onCambiar({ ...servicio, [campo]: valor });

    const totalGastos = servicio.gastos.reduce((suma, gasto) => suma + gasto.conceptos.reduce(
        (sub, c) => sub + (Number(c.precio_unitario) || 0) * (Number(c.cantidad) || 0), 0), 0);
    const total = (Number(servicio.costo_mano_obra) || 0) + totalGastos;

    return (
        <Paper elevation={0} sx={{ ...CARD_SX, bgcolor: 'white', mb: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="overline" sx={SECTION_LABEL_SX}>Servicio {indice + 1}</Typography>
                    {servicio.origen === 'inspeccion' && (
                        <Chip size="small" label={servicio.categoria || 'Inspección'} sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#eff6ff', color: '#1d4ed8' }} />
                    )}
                    {servicio.origen === 'pendiente' && (
                        <Chip size="small" label="Pendiente previo" sx={{ height: 20, fontSize: '0.65rem', bgcolor: '#fff7ed', color: '#c2410c' }} />
                    )}
                </Stack>

                <IconButton size="small" color="error" onClick={onEliminar}>
                    <DeleteOutlineIcon fontSize="small" />
                </IconButton>
            </Stack>

            <TextField
                fullWidth
                size="small"
                label="Tipo de Reparación"
                value={servicio.tipo_reparacion}
                onChange={(evento) => cambiar('tipo_reparacion', evento.target.value.slice(0, 100))}
                inputProps={{ maxLength: 100 }}
                sx={{ mb: 2 }}
            />

            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                <TextField
                    select size="small" label="Mantenimiento" sx={{ minWidth: 150 }}
                    value={servicio.tipo_mantenimiento}
                    onChange={(evento) => cambiar('tipo_mantenimiento', evento.target.value)}
                >
                    <MenuItem value="Correctivo">Correctivo</MenuItem>
                    <MenuItem value="Preventivo">Preventivo</MenuItem>
                </TextField>

                <TextField
                    select size="small" label="Origen" sx={{ minWidth: 130 }}
                    value={servicio.origen_servicio}
                    onChange={(evento) => cambiar('origen_servicio', evento.target.value)}
                >
                    <MenuItem value="Interno">Interno</MenuItem>
                    <MenuItem value="Externo">Externo</MenuItem>
                </TextField>

                <TextField
                    size="small" label="Costo Mano de Obra" type="number" sx={{ minWidth: 170 }}
                    value={servicio.costo_mano_obra}
                    onChange={(evento) => cambiar('costo_mano_obra', evento.target.value)}
                    InputProps={{ startAdornment: <Typography sx={{ mr: 0.5, color: '#94a3b8' }}>$</Typography> }}
                />
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="overline" sx={SECTION_LABEL_SX}>
                    Gastos {servicio.gastos.length > 0 && `(${servicio.gastos.length})`}
                </Typography>
                <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => onCambiar({ ...servicio, gastos: [...servicio.gastos, gastoEnBlanco()] })}
                    sx={{ textTransform: 'none' }}
                >
                    Agregar gasto
                </Button>
            </Stack>

            {servicio.gastos.length === 0 && (
                <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#94a3b8', mb: 1 }}>
                    Sin refacciones, herramienta ni consumibles. Lo que agregues aquí se da de alta como gasto
                    en el Administrador de Gastos, no sale del inventario.
                </Typography>
            )}

            {servicio.gastos.map((gasto, i) => (
                <GastoServicio
                    key={i}
                    gasto={gasto}
                    indice={i}
                    categorias={categorias}
                    subcategorias={subcategorias}
                    onCambiar={(actualizado) => onCambiar({
                        ...servicio,
                        gastos: servicio.gastos.map((g, j) => (j === i ? actualizado : g)),
                    })}
                    onEliminar={() => onCambiar({ ...servicio, gastos: servicio.gastos.filter((_, j) => j !== i) })}
                />
            ))}

            <Box sx={{ textAlign: 'right', mt: 1.5 }}>
                <Typography variant="caption" color="#64748b">
                    Mano de obra ${(Number(servicio.costo_mano_obra) || 0).toFixed(2)}
                    {totalGastos > 0 && ` · Gastos $${totalGastos.toFixed(2)}`}
                </Typography>
                <Typography fontWeight={800} color="#0f172a">${total.toFixed(2)}</Typography>
            </Box>
        </Paper>
    );
};

export default ServicioOrden;
