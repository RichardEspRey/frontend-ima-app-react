import {
    Box, Button, Divider, IconButton, MenuItem, Paper, Stack, TextField, Typography
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';

import { SECTION_LABEL_SX } from '../../styles/estilosTabla';

const PAISES = [
    { valor: 'MX', etiqueta: 'México' },
    { valor: 'US', etiqueta: 'Estados Unidos' },
];

/**
 * Un gasto del taller dentro de un servicio.
 *
 * Lleva sus propios datos generales porque cada uno es un ticket distinto: un
 * servicio puede pagar la refacción en un lado y el consumible en otro. Lo que se
 * capture aquí se da de alta en el Administrador de Gastos tal cual, con su país,
 * sus fechas y su comprobante.
 */
const GastoServicio = ({ gasto, indice, categorias, subcategorias, onCambiar, onEliminar }) => {
    const cambiar = (campo, valor) => onCambiar({ ...gasto, [campo]: valor });

    // Recibe los cambios juntos: dos llamadas seguidas se calculan sobre el mismo
    // `gasto` y la segunda pisa a la primera, que es lo que borraba la categoría al
    // elegirla, porque enseguida se limpiaba la subcategoría.
    const cambiarConcepto = (i, cambios) => onCambiar({
        ...gasto,
        conceptos: gasto.conceptos.map((concepto, j) => (j === i ? { ...concepto, ...cambios } : concepto)),
    });

    const total = gasto.conceptos.reduce(
        (suma, c) => suma + (Number(c.precio_unitario) || 0) * (Number(c.cantidad) || 0), 0);

    const esMexico = gasto.pais === 'MX';

    return (
        <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px dashed #cbd5e1', bgcolor: '#f8fafc', mb: 1.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="overline" sx={SECTION_LABEL_SX}>Gasto {indice + 1}</Typography>
                <IconButton size="small" color="error" onClick={onEliminar}>
                    <DeleteOutlineIcon fontSize="small" />
                </IconButton>
            </Stack>

            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                <TextField
                    select size="small" label="País" required sx={{ width: 150 }}
                    value={gasto.pais}
                    onChange={(evento) => cambiar('pais', evento.target.value)}
                >
                    {PAISES.map(p => <MenuItem key={p.valor} value={p.valor}>{p.etiqueta}</MenuItem>)}
                </TextField>

                <TextField
                    size="small" type="date" label="Fecha de ticket" InputLabelProps={{ shrink: true }}
                    sx={{ width: 170 }} value={gasto.fecha_ticket}
                    onChange={(evento) => cambiar('fecha_ticket', evento.target.value)}
                />

                <TextField
                    size="small" type="date" label="Fecha contable" InputLabelProps={{ shrink: true }}
                    sx={{ width: 170 }} value={gasto.fecha_gasto}
                    onChange={(evento) => cambiar('fecha_gasto', evento.target.value)}
                />

                <TextField
                    size="small" label="Monto original" type="number" sx={{ width: 150 }}
                    value={gasto.cantidad_original}
                    onChange={(evento) => cambiar('cantidad_original', evento.target.value)}
                    helperText={esMexico ? 'En pesos' : 'En dólares'}
                />

                {esMexico && (
                    <TextField
                        size="small" label="Tipo de cambio" type="number" sx={{ width: 150 }}
                        value={gasto.tipo_cambio}
                        onChange={(evento) => cambiar('tipo_cambio', evento.target.value)}
                    />
                )}
            </Stack>

            <Divider sx={{ my: 1.5 }} />

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569' }}>
                    Conceptos · tipo Mantenimiento
                </Typography>
                <Button
                    size="small" startIcon={<AddIcon />} sx={{ textTransform: 'none' }}
                    onClick={() => onCambiar({
                        ...gasto,
                        conceptos: [...gasto.conceptos, { categoria: '', subcategoria: '', descripcion: '', precio_unitario: '', cantidad: 1 }],
                    })}
                >
                    Concepto
                </Button>
            </Stack>

            {gasto.conceptos.map((concepto, i) => (
                <Stack key={i} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
                    <TextField
                        select size="small" label="Categoría" required sx={{ width: 160 }}
                        value={concepto.categoria}
                        onChange={(evento) => cambiarConcepto(i, { categoria: evento.target.value, subcategoria: '' })}
                    >
                        {categorias.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                    </TextField>
                    <TextField
                        select size="small" label="Subcategoría" required sx={{ width: 170 }}
                        value={concepto.subcategoria}
                        disabled={!concepto.categoria}
                        onChange={(evento) => cambiarConcepto(i, { subcategoria: evento.target.value })}
                    >
                        {subcategorias
                            .filter(sub => String(sub.id_categoria) === String(concepto.categoria))
                            .map(sub => <MenuItem key={sub.value} value={sub.value}>{sub.label}</MenuItem>)}
                    </TextField>
                    <TextField
                        size="small" label="Descripción" sx={{ flex: '1 1 180px' }}
                        value={concepto.descripcion}
                        onChange={(evento) => cambiarConcepto(i, { descripcion: evento.target.value })}
                    />
                    <TextField
                        size="small" label="Precio Unit." type="number" sx={{ width: 120 }}
                        value={concepto.precio_unitario}
                        onChange={(evento) => cambiarConcepto(i, { precio_unitario: evento.target.value })}
                    />
                    <TextField
                        size="small" label="Cant." type="number" sx={{ width: 90 }}
                        value={concepto.cantidad}
                        onChange={(evento) => cambiarConcepto(i, { cantidad: evento.target.value })}
                    />
                    <IconButton
                        size="small" color="error"
                        onClick={() => onCambiar({ ...gasto, conceptos: gasto.conceptos.filter((_, j) => j !== i) })}
                    >
                        <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                </Stack>
            ))}

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                <Button component="label" size="small" startIcon={<AttachFileIcon />} sx={{ textTransform: 'none' }}>
                    {gasto.factura ? gasto.factura.name.slice(0, 22) : 'Factura (PDF)'}
                    <input type="file" hidden accept="application/pdf" onChange={(evento) => cambiar('factura', evento.target.files[0] || null)} />
                </Button>
                <Button component="label" size="small" startIcon={<AttachFileIcon />} sx={{ textTransform: 'none' }}>
                    {gasto.ticket ? gasto.ticket.name.slice(0, 22) : 'Ticket (imagen)'}
                    <input type="file" hidden accept="image/*" onChange={(evento) => cambiar('ticket', evento.target.files[0] || null)} />
                </Button>

                <Box sx={{ flexGrow: 1 }} />

                <Typography variant="body2" fontWeight={800} color="#0f172a">${total.toFixed(2)}</Typography>
            </Stack>
        </Paper>
    );
};

export default GastoServicio;
