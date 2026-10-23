import { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

import CamposOperadorFecha from './CamposOperadorFecha';
import { DIALOG_PAPER_SX, SECTION_LABEL_SX } from '../../styles/estilosTabla';

/**
 * Corrige el operador y la fecha de enviado de una reparación pendiente.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.reparacion La reparación, como la devuelve `getPendientes`.
 * @param {Function} props.onCancelar Qué hacer al cerrar sin guardar.
 * @param {Function} props.onGuardar Recibe `{id, driverId, fechaReporte}`.
 * @returns {object} El diálogo renderizado.
 */
const ModalDatosPendiente = ({ reparacion, onCancelar, onGuardar }) => {
    const [driverId, setDriverId] = useState(reparacion.driver_id ? String(reparacion.driver_id) : '');
    const [operador, setOperador] = useState(reparacion.operador || '');
    const [fechaReporte, setFechaReporte] = useState(reparacion.fecha_reporte || '');
    const [guardando, setGuardando] = useState(false);

    const guardar = async () => {
        setGuardando(true);
        try {
            await onGuardar({ id: reparacion.id, driverId, fechaReporte });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <Dialog open onClose={guardando ? undefined : onCancelar} maxWidth="xs" fullWidth PaperProps={{ sx: DIALOG_PAPER_SX }}>
            <DialogTitle sx={{ pb: 1 }}>
                <Typography variant="overline" sx={SECTION_LABEL_SX}>Reparación pendiente</Typography>
                <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ mt: 0.25 }}>
                    Operador y fecha de enviado
                </Typography>
                <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
                    {reparacion.descripcion}
                </Typography>
            </DialogTitle>

            <DialogContent dividers>
                <Box sx={{ mt: 1 }}>
                    <CamposOperadorFecha
                        driverId={driverId}
                        operador={operador}
                        fecha={fechaReporte}
                        disabled={guardando}
                        onCambiarOperador={(id, nombre) => { setDriverId(id); setOperador(nombre); }}
                        onCambiarFecha={setFechaReporte}
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onCancelar} color="inherit" disabled={guardando}>Cancelar</Button>
                <Button variant="contained" onClick={guardar} disabled={guardando}>
                    {guardando ? 'Guardando…' : 'Guardar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalDatosPendiente;
