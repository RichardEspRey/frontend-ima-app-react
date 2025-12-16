import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Paper, Typography, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, CircularProgress, Stack, Tooltip
} from "@mui/material";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InfoIcon from '@mui/icons-material/Info';

const apiHost = import.meta.env.VITE_API_HOST;

// Colores tipo semáforo para el rendimiento
const getPerformanceColor = (mpg) => {
    if (!mpg || mpg === 0) return 'default';
    if (mpg >= 7) return 'success'; // Bueno
    if (mpg >= 5.5) return 'warning'; // Regular
    return 'error'; // Malo
};

export default function Autonomia() {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAutonomia = useCallback(async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      // Usamos el endpoint específico para esta lógica avanzada
      fd.append('op', 'get_truck_autonomy'); 
      
      const res = await fetch(`${apiHost}/autonomia.php`, { method: 'POST', body: fd });
      const json = await res.json();
      
      if (json.status === 'success' && Array.isArray(json.data)) {
        setTrucks(json.data);
        console.log(json.data)
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

  if (loading) {
      return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Calculando rendimiento de flota...</Typography>
          </Box>
      );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Encabezado */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight={700}>
          Autonomía (MPG)
        </Typography>
        <Chip 
            icon={<LocalShippingIcon />} 
            label={`${trucks.length} Unidades`} 
            color="primary" 
            variant="outlined" 
            sx={{ fontWeight: 'bold' }}
        />
        <Tooltip title="Cálculo basado en las últimas 5 cargas mayores a 100 galones. Autonomía = Distancia / Galones.">
            <InfoIcon color="action" sx={{ cursor: 'help' }} />
        </Tooltip>
      </Stack>

      {/* Tabla */}
      <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
        <TableContainer>
          <Table size="medium">
            <TableHead sx={{ bgcolor: '#f5f5f5' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, width: 150 }}>Camión</TableCell>
                {/* Columnas de registros 1 (más reciente) al 5 */}
                {[1, 2, 3, 4, 5].map(num => (
                    <TableCell key={num} align="center" sx={{ fontWeight: 600, color: '#555' }}>
                        Registro {num}
                    </TableCell>
                ))}
                <TableCell align="center" sx={{ fontWeight: 800, bgcolor: '#e3f2fd', color: '#0d47a1', width: 140 }}>
                    PROMEDIO
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trucks.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                            No hay suficientes datos de cargas (menos de 100 gal) para calcular autonomía.
                        </Typography>
                    </TableCell>
                </TableRow>
              ) : (
                trucks.map((truck) => (
                  <TableRow key={truck.truck_id} hover>
                    {/* Información del Camión */}
                    <TableCell>
                        <Typography fontWeight={700} variant="body1">
                            {truck.unidad}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                            {truck.placa}
                        </Typography>
                    </TableCell>

                    {/* Registros de Autonomía (1 al 5) */}
                    {truck.registros.map((reg, idx) => (
                        <TableCell key={idx} align="center">
                            {reg ? (
                                <Box>
                                    <Typography fontWeight={700} fontSize={15} color={getPerformanceColor(reg.mpg) + '.main'}>
                                        {reg.mpg.toFixed(2)}
                                    </Typography>
                                    <Typography variant="caption" display="block" color="text.secondary" sx={{ lineHeight: 1 }}>
                                        {reg.galones.toFixed(0)} gal
                                    </Typography>
                                    <Typography variant="caption" display="block" color="text.disabled" fontSize={10}>
                                        {new Date(reg.fecha).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                    </Typography>
                                </Box>
                            ) : (
                                <Typography variant="caption" color="text.disabled">—</Typography>
                            )}
                        </TableCell>
                    ))}

                    {/* Promedio Final */}
                    <TableCell align="center" sx={{ bgcolor: '#f1f8ff' }}>
                        <Chip 
                            label={`${truck.promedio.toFixed(2)} MPG`}
                            color={getPerformanceColor(truck.promedio)}
                            sx={{ fontWeight: 'bold', fontSize: '0.95rem', minWidth: 80 }}
                        />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}