import React, { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

const BotonActualizar = ({ onActualizar, etiqueta = 'Actualizar', sx }) => {
    const [actualizando, setActualizando] = useState(false);

    const actualizar = async () => {
        setActualizando(true);
        try {
            await onActualizar();
        } finally {
            setActualizando(false);
        }
    };

    return (
        <Button
            variant="outlined"
            onClick={actualizar}
            disabled={actualizando}
            startIcon={actualizando
                ? <CircularProgress size={16} color="inherit" />
                : <RefreshIcon />}
            sx={{
                borderColor: '#cbd5e1', color: '#334155', bgcolor: 'white', fontWeight: 700,
                borderRadius: 2, px: 3, py: 1.1, textTransform: 'none', boxShadow: 'none',
                '&:hover': { borderColor: '#94a3b8', bgcolor: '#f8fafc' },
                ...sx,
            }}
        >
            {actualizando ? 'Actualizando…' : etiqueta}
        </Button>
    );
};

export default BotonActualizar;
