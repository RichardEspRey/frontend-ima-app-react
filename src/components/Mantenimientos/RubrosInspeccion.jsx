import { Box, Checkbox, Chip, FormControlLabel, Paper, Stack, Typography } from '@mui/material';

import { agruparPorRubro } from '../../services/mantenimiento';

const CARD_RUBRO_SX = {
    p: 2,
    borderRadius: 2,
    border: '1px solid #e2e8f0',
    bgcolor: 'white',
    minWidth: 280,
    flex: '1 1 300px',
};

/**
 * Los puntos de una inspección, agrupados por rubro y con su casilla para entrar
 * a una orden. Solo pinta: quién está seleccionado lo decide la pantalla.
 */
const RubrosInspeccion = ({ puntos, seleccionados, onAlternar, onAlternarRubro }) => {
    const rubros = agruparPorRubro(puntos);

    if (rubros.length === 0) {
        return (
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#94a3b8', py: 2 }}>
                El operador no reportó nada que atender de este lado.
            </Typography>
        );
    }

    return (
        <Stack direction="row" flexWrap="wrap" gap={2}>
            {rubros.map(rubro => {
                const claves = rubro.puntos.map(p => p.clave);
                const todos = claves.every(clave => seleccionados.includes(clave));
                const algunos = !todos && claves.some(clave => seleccionados.includes(clave));

                return (
                    <Paper key={rubro.clave} elevation={0} sx={CARD_RUBRO_SX}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Checkbox
                                    size="small"
                                    checked={todos}
                                    indeterminate={algunos}
                                    onChange={() => onAlternarRubro(claves, !todos)}
                                    sx={{ p: 0.5 }}
                                />
                                <Typography fontWeight={800} color="#0f172a">{rubro.etiqueta}</Typography>
                            </Stack>
                            <Chip
                                size="small"
                                label={rubro.puntos.length}
                                sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: '#f1f5f9', color: '#475569' }}
                            />
                        </Stack>

                        <Box sx={{ pl: 0.5 }}>
                            {rubro.puntos.map(punto => (
                                <FormControlLabel
                                    key={punto.clave}
                                    sx={{ alignItems: 'flex-start', mb: 0.5, ml: 0 }}
                                    control={
                                        <Checkbox
                                            size="small"
                                            checked={seleccionados.includes(punto.clave)}
                                            onChange={() => onAlternar(punto.clave)}
                                            sx={{ pt: 0.25 }}
                                        />
                                    }
                                    label={
                                        <Typography variant="body2" color="#334155" sx={{ mt: 0.25 }}>
                                            {punto.texto}
                                        </Typography>
                                    }
                                />
                            ))}
                        </Box>
                    </Paper>
                );
            })}
        </Stack>
    );
};

export default RubrosInspeccion;
