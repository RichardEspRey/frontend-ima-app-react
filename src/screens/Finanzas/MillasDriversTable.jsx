import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Box, Typography, Button
} from "@mui/material";

const MillasDriversTable = ({ drivers = [], onSave }) => {
  const apiHost = import.meta.env.VITE_API_HOST;
  const [Drivers, setDrivers] =useState();
  const [rates, setRates] = useState([]);


  const handleChange = (driver_id, value) => {
    setRates((prev) =>
      prev.map((r) =>
        r.driver_id === driver_id ? { ...r, rate: value } : r
      )
    );
  };

  const handleSave = () => {
    if (onSave) onSave(rates);
  };

  const fetchMillas = useCallback(async () => {
      try {
        const response = await fetch(`${apiHost}/formularios.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'op=get_millasDriver'
        });
        const data = await response.json();
        if (data.status === 'success') {
          const formatted = data.data.map(t => ({
            driver_id: t.driver_id,
            name: t.nombre,
            activo: t.activo,
            valor_milla: t.valor_milla,
          
          }));
          
          setRates(formatted);
          setDrivers(formatted);
        }
      } catch (error) {
        console.error('Error al obtener diesel:', error);
      } finally {
          setLoading(false);
      }
    }, [apiHost]);

  useEffect(() => {
    fetchMillas();
  }, [fetchMillas]);

  return (
    <Paper sx={{ p: 3, m: 2 }}>

      {/* TÍTULO + BOTÓN GUARDAR */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Drivers
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={{ fontWeight: 600 }}
        >
          Guardar
        </Button>
      </Box>

      {/* TABLA */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>No. of employee</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 700, width: 150 }} align="center">
              $/milla
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rates.map((d, index) => (
            <TableRow key={d.driver_id}>
              <TableCell>{index + 1}</TableCell>

              <TableCell>{d.name}</TableCell>

              <TableCell align="center">
                <TextField
                  size="small"
                  value={d.rate}
                  onChange={(e) => handleChange(d.driver_id, e.target.value)}
                  placeholder="0.00"
                  sx={{ width: "110px" }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default MillasDriversTable;
