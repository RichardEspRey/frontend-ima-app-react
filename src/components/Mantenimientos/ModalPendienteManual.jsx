import { useEffect, useState } from 'react';
import {
    Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField,
    ToggleButton, ToggleButtonGroup, Typography
} from '@mui/material';

import useFetchActiveTrucks from '../../hooks/useFetchActiveTrucks';
import useFetchActiveTrailers from '../../hooks/useFetchActiveTrailers';
import { UNIDAD } from '../../services/mantenimiento';
import { DIALOG_PAPER_SX, SECTION_LABEL_SX } from '../../styles/estilosTabla';

const LARGO_DESCRIPCION = 250;

/**
 * Levanta una reparación pendiente que nadie reportó en un viaje.
 *
 * Es la otra mitad del reporte: lo que el taller ve con la unidad enfrente y no
 * pasó por el checklist del operador. Sin esto, eso seguiría viviendo en el Excel.
 */
const ModalPendienteManual = ({ unidadTipo: tipoInicial, onCancelar, onGuardar }) => {
    const { activeTrucks } = useFetchActiveTrucks();
    const { activeTrailers } = useFetchActiveTrailers();

    const [unidadTipo, setUnidadTipo] = useState(tipoInicial || UNIDAD.CAMION);
    const [unidadId, setUnidadId] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [guardando, setGuardando] = useState(false);

    useEffect(() => { setUnidadId(''); }, [unidadTipo]);

    const opciones = unidadTipo === UNIDAD.CAJA
        ? (activeTrailers || []).map(caja => ({ valor: caja.caja_id, etiqueta: caja.no_caja }))
        : (activeTrucks || []).map(camion => ({ valor: camion.truck_id, etiqueta: camion.unidad }));

    const guardar = async () => {
        setGuardando(true);
        try {
            await onGuardar({ unidadTipo, unidadId, descripcion: descripcion.trim() });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Dialog open onClose={guardando ? undefined : onCancelar} maxWidth="xs" fullWidth PaperProps={{ sx: DIALOG_PAPER_SX }}>
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="overline" sx={SECTION_LABEL_SX}>Mantenimiento</Typography>
                <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ mt: 0.25 }}>
                    Levantar reparación pendiente
                </Typography>
                <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                    Para lo que el taller vio y nadie reportó en un viaje.
                </Typography>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <ToggleButtonGroup
                        exclusive fullWidth size="small" value={unidadTipo} disabled={guardando}
                        onChange={(_evento, valor) => { if (valor) setUnidadTipo(valor); }}
                    >
                        <ToggleButton value={UNIDAD.CAMION} sx={{ textTransform: 'none' }}>Camión</ToggleButton>
                        <ToggleButton value={UNIDAD.CAJA} sx={{ textTransform: 'none' }}>Caja</ToggleButton>
                    </ToggleButtonGroup>

                    <TextField
                        select size="small" label={unidadTipo === UNIDAD.CAJA ? 'Caja' : 'Camión'}
                        value={unidadId} disabled={guardando}
                        onChange={(evento) => setUnidadId(evento.target.value)}
                    >
                        {opciones.map(opcion => (
                            <MenuItem key={opcion.valor} value={opcion.valor}>{opcion.etiqueta}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        size="small" multiline minRows={2} maxRows={4} label="Qué hay que atender"
                        value={descripcion} disabled={guardando}
                        onChange={(evento) => setDescripcion(evento.target.value.slice(0, LARGO_DESCRIPCION))}
                        inputProps={{ maxLength: LARGO_DESCRIPCION }}
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onCancelar} color="inherit" disabled={guardando}>Cancelar</Button>
                <Button variant="contained" onClick={guardar} disabled={!unidadId || !descripcion.trim() || guardando}>
                    {guardando ? 'Guardando…' : 'Levantar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalPendienteManual;
