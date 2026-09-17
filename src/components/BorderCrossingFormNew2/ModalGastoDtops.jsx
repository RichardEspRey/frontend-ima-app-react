import React, { useMemo, useState } from 'react';
import {
    Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogTitle, Divider, Stack, TextField, Typography
} from '@mui/material';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { format } from 'date-fns';
import Swal from 'sweetalert2';

import useFetchExpenseTypes from '../../hooks/expense_hooks/useFetchExpenseTypes';
import useFetchCategories from '../../hooks/expense_hooks/useFetchCategories';
import useFetchSubcategories from '../../hooks/expense_hooks/useFetchSubcategories';
import { useAuthStore } from '../../store/useAuthStore';
import { MONTOS_DTOPS, formatearMontoDtops, montoDtopsValido, resolverClasificacionDtops } from '../../utils/gastoDtops';
import { crearGastoDtops } from '../../services/gastoDtops';

const ResumenFila = ({ etiqueta, valor }) => (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Typography variant="body2" color="text.secondary">{etiqueta}</Typography>
        <Typography variant="body2" fontWeight={600} color="text.primary" noWrap sx={{ maxWidth: 260 }}>
            {valor || '—'}
        </Typography>
    </Stack>
);

const ModalGastoDtops = ({ open, onClose, archivo, tripNumber, yaExistia = false }) => {
    const { user } = useAuthStore();

    const { expenseTypes, loading: cargandoTipos } = useFetchExpenseTypes();
    const { maintenanceCategories, loading: cargandoCategorias } = useFetchCategories();
    const { subcategories, loading: cargandoSubcategorias } = useFetchSubcategories();

    const [montoPredeterminado, setMontoPredeterminado] = useState(MONTOS_DTOPS[0]);
    const [montoManual, setMontoManual] = useState('');
    const [fecha, setFecha] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [guardando, setGuardando] = useState(false);

    const cargandoCatalogos = cargandoTipos || cargandoCategorias || cargandoSubcategorias;

    const clasificacion = useMemo(
        () => (cargandoCatalogos ? null : resolverClasificacionDtops(expenseTypes, maintenanceCategories, subcategories)),
        [cargandoCatalogos, expenseTypes, maintenanceCategories, subcategories]
    );

    const monto = montoPredeterminado === null ? montoManual : montoPredeterminado;
    const montoValido = montoDtopsValido(monto);
    const puedeGuardar = montoValido && !!fecha && !!tripNumber && !!clasificacion && !guardando;

    const guardar = async () => {
        setGuardando(true);
        try {
            await crearGastoDtops({
                monto,
                fecha,
                tripNumber,
                archivo,
                usuarioId: user?.id,
                clasificacion,
            });
            Swal.fire({
                toast: true, position: 'top-end', icon: 'success',
                title: `Gasto del DTOPS registrado (${formatearMontoDtops(monto)})`,
                showConfirmButton: false, timer: 2500
            });
            onClose();
        } catch (err) {
            Swal.fire('Error', err.message, 'error');
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Dialog open={open} onClose={guardando ? undefined : onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <ReceiptLongOutlinedIcon color="primary" />
                    <Box>
                        <Typography variant="h6" fontWeight={800}>Gasto del DTOPS</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Se registra en Expense Manager con este documento como ticket.
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5}>
                    {yaExistia && (
                        <Alert severity="warning">
                            Esta etapa ya tenía un DTOPS guardado. Si continúas se registrará otro gasto además del anterior.
                        </Alert>
                    )}

                    {!cargandoCatalogos && !clasificacion && (
                        <Alert severity="error">
                            No se encontró la subcategoría «Dtops» en el catálogo de gastos. Revisa el catálogo o
                            registra el gasto a mano en Expense Manager.
                        </Alert>
                    )}

                    {!tripNumber && (
                        <Alert severity="error">
                            El viaje no tiene número asignado todavía, y ese número es la descripción del gasto.
                        </Alert>
                    )}

                    <Box>
                        <Typography variant="subtitle2" fontWeight={700} gutterBottom>Monto (USD)</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {MONTOS_DTOPS.map(valor => (
                                <Button
                                    key={valor}
                                    variant={montoPredeterminado === valor ? 'contained' : 'outlined'}
                                    onClick={() => setMontoPredeterminado(valor)}
                                    sx={{ fontWeight: 700, minWidth: 110 }}
                                >
                                    ${valor.toFixed(2)}
                                </Button>
                            ))}
                            <Button
                                variant={montoPredeterminado === null ? 'contained' : 'outlined'}
                                color="secondary"
                                onClick={() => setMontoPredeterminado(null)}
                                sx={{ fontWeight: 700, minWidth: 110 }}
                            >
                                Otro monto
                            </Button>
                        </Stack>

                        {montoPredeterminado === null && (
                            <TextField
                                type="number"
                                size="small"
                                fullWidth
                                autoFocus
                                label="Monto manual"
                                value={montoManual}
                                onChange={e => setMontoManual(e.target.value)}
                                error={montoManual !== '' && !montoValido}
                                helperText={montoManual !== '' && !montoValido ? 'Debe ser un número mayor a 0' : ' '}
                                inputProps={{ min: 0, step: '0.01' }}
                                sx={{ mt: 2 }}
                            />
                        )}
                    </Box>

                    <TextField
                        type="date"
                        size="small"
                        fullWidth
                        label="Payment date"
                        InputLabelProps={{ shrink: true }}
                        value={fecha}
                        onChange={e => setFecha(e.target.value)}
                    />

                    <Divider />

                    <Stack spacing={1}>
                        <Typography variant="subtitle2" fontWeight={700}>Se guarda así</Typography>
                        <ResumenFila etiqueta="País" valor="Estados Unidos" />
                        <ResumenFila etiqueta="Moneda" valor="USD" />
                        <ResumenFila etiqueta="Descripción" valor={tripNumber} />
                        <ResumenFila etiqueta="Cantidad" valor="1" />
                        <ResumenFila etiqueta="Precio unitario" valor={formatearMontoDtops(monto)} />
                        <ResumenFila etiqueta="Ticket" valor={archivo?.name} />
                        <ResumenFila etiqueta="Creador" valor={user?.name} />
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={guardando} color="inherit">Omitir</Button>
                <Button
                    variant="contained"
                    onClick={guardar}
                    disabled={!puedeGuardar}
                    startIcon={guardando ? <CircularProgress size={18} color="inherit" /> : null}
                >
                    {guardando ? 'Registrando…' : 'Registrar gasto'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalGastoDtops;
