import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography,
    Stack, ToggleButtonGroup, ToggleButton, Box, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

const STATUS_OPTIONS_BY_COUNTRY = {
    US: ['Impo', 'Vacio'],
    MX: ['Impo', 'Expo', 'Vacio'],
};

const AlmostOverCajaModal = ({ open, tripNumber, countryCode, saving, onCancel, onConfirm }) => {
    const [status, setStatus] = useState('');

    const options = STATUS_OPTIONS_BY_COUNTRY[countryCode] || STATUS_OPTIONS_BY_COUNTRY.MX;

    useEffect(() => {
        if (open) setStatus('');
    }, [open]);

    const handleConfirm = () => {
        if (!status) return;
        onConfirm(status);
    };

    return (
        <Dialog open={open} onClose={!saving ? onCancel : undefined} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', pb: 1 }}>
                <Box>
                    <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.68rem' }}>
                        Marcar Almost Over
                    </Typography>
                    <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ mt: 0.25 }}>
                        Viaje #{tripNumber}
                    </Typography>
                </Box>
                <IconButton onClick={onCancel} disabled={saving} sx={{ color: '#64748b' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                    <Inventory2OutlinedIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
                    <Typography variant="body2" fontWeight={600} color="#334155">
                        ¿Cuál es el status de la caja?
                    </Typography>
                </Stack>
                <ToggleButtonGroup
                    value={status}
                    exclusive
                    fullWidth
                    onChange={(e, val) => { if (val) setStatus(val); }}
                    sx={{
                        '& .MuiToggleButton-root': {
                            textTransform: 'none', fontWeight: 600, fontSize: '0.85rem',
                            py: 1, color: '#64748b', borderColor: '#e2e8f0',
                            '&.Mui-selected': { bgcolor: '#0f172a', color: '#fff', '&:hover': { bgcolor: '#1e293b' } },
                        },
                    }}
                >
                    {options.map((opt) => (
                        <ToggleButton key={opt} value={opt}>{opt}</ToggleButton>
                    ))}
                </ToggleButtonGroup>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
                <Button onClick={onCancel} disabled={saving} color="inherit" sx={{ textTransform: 'none', fontWeight: 600 }}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={handleConfirm}
                    disabled={!status || saving}
                    sx={{
                        bgcolor: '#0f172a', fontWeight: 700, borderRadius: 2, px: 3, textTransform: 'none', boxShadow: 'none',
                        '&:hover': { bgcolor: '#1e293b', boxShadow: '0 6px 16px rgba(15,23,42,0.22)' },
                    }}
                >
                    {saving ? 'Enviando...' : 'Enviar'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AlmostOverCajaModal;
