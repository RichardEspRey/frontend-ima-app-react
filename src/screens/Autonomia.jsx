import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Paper, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, CircularProgress, Stack, Tooltip,
} from "@mui/material";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  PAGE_SHELL_SX, PAGE_OVERLINE_SX, PAGE_TITLE_SX, HEADER_ROW_SX, HEADER_CELL_SX, TABLE_CONTAINER_SX,
  CELL_STRONG_SX, CHIP_OK_SX, CHIP_WARN_SX, CHIP_DANGER_SX, CHIP_NEUTRO_SX,
} from '../styles/estilosTabla';

const apiHost = import.meta.env.VITE_API_HOST;

const NUMERO_SX = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };

const RENDIMIENTO = {
  bueno: { chip: CHIP_OK_SX, texto: '#15803d' },
  regular: { chip: CHIP_WARN_SX, texto: '#b45309' },
  malo: { chip: CHIP_DANGER_SX, texto: '#b91c1c' },
  sinDato: { chip: CHIP_NEUTRO_SX, texto: '#94a3b8' },
};

const rendimientoDe = (mpg) => {
  if (!mpg || mpg === 0) return RENDIMIENTO.sinDato;
  if (mpg >= 7) return RENDIMIENTO.bueno;
  if (mpg >= 5.5) return RENDIMIENTO.regular;
  return RENDIMIENTO.malo;
};

export default function Autonomia() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAutonomia = useCallback(async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('op', 'get_truck_autonomy');

      const res = await fetch(`${apiHost}/autonomia.php`, { method: 'POST', body: fd });
      const json = await res.json();

      if (json.status === 'success' && Array.isArray(json.data)) {
        setTrucks(json.data);
      } else {
        setTrucks([]);
        console.warn("No data or error:", json);
      }
    } catch (err) {
      console.error('Error fetching autonomia:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAutonomia();
  }, [fetchAutonomia]);

  return (
    <Box sx={PAGE_SHELL_SX}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="overline" sx={PAGE_OVERLINE_SX}>Mantenimiento · Autonomías</Typography>
          <Stack direction="row" alignItems="center" spacing={1} sx={PAGE_TITLE_SX}>
            <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em">
              Autonomía (MPG)
            </Typography>
            <Tooltip title="Cálculo basado en las últimas 5 cargas mayores a 100 galones. Autonomía = Distancia / Galones.">
              <InfoOutlinedIcon sx={{ color: '#94a3b8', cursor: 'help', fontSize: 20 }} />
            </Tooltip>
          </Stack>
          <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
            Rendimiento de cada camión en sus últimas cinco cargas de diesel.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip size="small" label={`${trucks.length} unidades`} sx={CHIP_NEUTRO_SX} />
          <Chip size="small" label="≥ 7 bueno" sx={CHIP_OK_SX} />
          <Chip size="small" label="5.5 – 7 regular" sx={CHIP_WARN_SX} />
          <Chip size="small" label="< 5.5 bajo" sx={CHIP_DANGER_SX} />
        </Stack>
      </Stack>

      <TableContainer component={Paper} elevation={0} sx={TABLE_CONTAINER_SX}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow sx={HEADER_ROW_SX}>
              <TableCell sx={{ ...HEADER_CELL_SX, width: 150 }}>Camión</TableCell>
              {[1, 2, 3, 4, 5].map(num => (
                <TableCell key={num} sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>
                  Registro {num}
                </TableCell>
              ))}
              <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center', width: 140, color: '#0f172a' }}>
                Promedio
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={24} />
                  <Typography variant="body2" color="#94a3b8" sx={{ mt: 1 }}>Calculando rendimiento de flota…</Typography>
                </TableCell>
              </TableRow>
            ) : trucks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="#94a3b8">
                    No hay suficientes cargas de más de 100 galones para calcular la autonomía.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              trucks.map((truck) => {
                const promedio = rendimientoDe(truck.promedio);
                return (
                  <TableRow key={truck.truck_id} hover>
                    <TableCell sx={{ borderLeft: `3px solid ${promedio.texto}`, pl: 2 }}>
                      <Typography variant="body2" sx={CELL_STRONG_SX}>{truck.unidad}</Typography>
                      <Typography variant="caption" color="#94a3b8" sx={{ fontFamily: 'monospace' }}>
                        {truck.placa}
                      </Typography>
                    </TableCell>

                    {truck.registros.map((reg, idx) => (
                      <TableCell key={idx} align="center">
                        {reg ? (
                          <Box>
                            <Typography variant="body2" fontWeight={700} color={rendimientoDe(reg.mpg).texto} sx={NUMERO_SX}>
                              {reg.mpg.toFixed(2)}
                            </Typography>
                            <Typography variant="caption" display="block" color="#64748b" sx={{ lineHeight: 1.2, ...NUMERO_SX }}>
                              {reg.galones.toFixed(0)} gal
                            </Typography>
                            <Typography variant="caption" display="block" color="#94a3b8" fontSize={10}>
                              {new Date(reg.fecha).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="#cbd5e1">—</Typography>
                        )}
                      </TableCell>
                    ))}

                    <TableCell align="center" sx={{ bgcolor: '#fafbfc' }}>
                      <Chip size="small" label={`${truck.promedio.toFixed(2)} MPG`} sx={{ ...promedio.chip, minWidth: 84, ...NUMERO_SX }} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
