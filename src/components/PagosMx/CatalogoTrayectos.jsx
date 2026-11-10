import { Fragment, useState } from 'react';
import {
    Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton,
    InputAdornment, Stack, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField,
    Tooltip, Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

import { guardarTrayecto, pesos } from '../../services/pagosMx';

const VACIO = { id: '', nombre: '', monto: '', activo: true };

const CatalogoTrayectos = ({ open, onClose, trayectos, onCambio }) => {
    const [edicion, setEdicion] = useState(null);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState(null);

    const empezar = (trayecto) => {
        setError(null);
        setEdicion(trayecto ? { ...trayecto, monto: String(trayecto.monto) } : { ...VACIO });
    };

    const guardar = async (cambios) => {
        setGuardando(true);
        setError(null);
        try {
            await guardarTrayecto(cambios);
            setEdicion(null);
            await onCambio();
        } catch (err) {
            setError(err.message);
        } finally {
            setGuardando(false);
        }
    };

    const valida = edicion && edicion.nombre.trim() !== '' && edicion.monto !== '' && Number(edicion.monto) >= 0;

    const filaEdicion = (
        <TableRow>
            <TableCell>
                <TextField
                    size="small" autoFocus fullWidth placeholder="Ej. Apodaca"
                    value={edicion?.nombre ?? ''}
                    onChange={(evento) => setEdicion(prev => ({ ...prev, nombre: evento.target.value }))}
                />
            </TableCell>
            <TableCell>
                <TextField
                    size="small" type="number" placeholder="0.00" sx={{ width: 160 }}
                    value={edicion?.monto ?? ''}
                    onChange={(evento) => setEdicion(prev => ({ ...prev, monto: evento.target.value }))}
                    InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        endAdornment: <InputAdornment position="end">MXN</InputAdornment>,
                    }}
                />
            </TableCell>
            <TableCell align="center">
                <Switch
                    checked={edicion?.activo ?? true}
                    onChange={(evento) => setEdicion(prev => ({ ...prev, activo: evento.target.checked }))}
                />
            </TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                <IconButton color="success" disabled={!valida || guardando} onClick={() => guardar(edicion)}>
                    <CheckIcon />
                </IconButton>
                <IconButton disabled={guardando} onClick={() => setEdicion(null)}>
                    <CloseIcon />
                </IconButton>
            </TableCell>
        </TableRow>
    );

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 800 }}>
                Trayectos de México
                <Typography variant="body2" color="text.secondary">
                    Cada viaje mexicano se paga con el monto de su trayecto. Cuando salga un destino nuevo, dalo de alta aquí con su monto.
                </Typography>
            </DialogTitle>

            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Trayecto</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Monto por viaje</TableCell>
                            <TableCell sx={{ fontWeight: 700 }} align="center">Activo</TableCell>
                            <TableCell sx={{ width: 120 }} />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {trayectos.map(trayecto => (edicion?.id === trayecto.id ? (
                            <Fragment key={trayecto.id}>{filaEdicion}</Fragment>
                        ) : (
                            <TableRow key={trayecto.id} sx={{ opacity: trayecto.activo ? 1 : 0.5 }}>
                                <TableCell>
                                    <Typography fontWeight={700}>{trayecto.nombre}</Typography>
                                </TableCell>
                                <TableCell>
                                    {trayecto.monto > 0
                                        ? <Typography fontWeight={700} color="success.main">{pesos(trayecto.monto)}</Typography>
                                        : <Chip size="small" color="warning" variant="outlined" label="Sin monto" />}
                                </TableCell>
                                <TableCell align="center">
                                    <Chip
                                        size="small"
                                        label={trayecto.activo ? 'Activo' : 'Inactivo'}
                                        color={trayecto.activo ? 'success' : 'default'}
                                        variant="outlined"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Editar">
                                        <span>
                                            <IconButton size="small" disabled={Boolean(edicion)} onClick={() => empezar(trayecto)}>
                                                <EditOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        )))}

                        {edicion && !edicion.id && filaEdicion}

                        {trayectos.length === 0 && !edicion && (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                    Todavía no hay trayectos.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'space-between', px: 3 }}>
                <Button startIcon={<AddIcon />} disabled={Boolean(edicion)} onClick={() => empezar(null)} sx={{ textTransform: 'none', fontWeight: 700 }}>
                    Nuevo trayecto
                </Button>
                <Stack direction="row" spacing={1}>
                    <Button onClick={onClose} sx={{ textTransform: 'none' }}>Cerrar</Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default CatalogoTrayectos;
