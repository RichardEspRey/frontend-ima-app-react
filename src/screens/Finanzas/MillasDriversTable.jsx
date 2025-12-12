import React, { useState, useEffect, useCallback } from 'react';
import {
  Paper, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Box, Typography, Button
} from "@mui/material";
import Swal from "sweetalert2";
import { useNavigate } from 'react-router-dom';

const MillasDriversTable = () => {
  const navigate = useNavigate();
  const apiHost = import.meta.env.VITE_API_HOST;

  const [loading, setLoading] = useState(true);
  const [rates, setRates] = useState([]);

  // === CAMBIA EL RATE AL ESCRIBIR ===
  const handleChange = (driver_id, value) => {
    setRates(prev =>
      prev.map(r =>
        r.driver_id === driver_id ? { ...r, rate: value } : r
      )
    );
  };

  // === GUARDAR DATOS EN BD ===
  const handleSave = async () => {
    const payload = rates.map(r => ({
      driver_id: r.driver_id,
      valor_milla: Number(r.rate) || 0
    }));

    const fd = new FormData();
    fd.append("op", "I_update_millasDriverBulk");
    fd.append("items", JSON.stringify(payload));

    Swal.fire({ title: "Guardando...", allowOutsideClick: false });
    Swal.showLoading();

    try {
      const res = await fetch(`${apiHost}/formularios.php`, {
        method: "POST",
        body: fd
      });
      const json = await res.json();

      Swal.close();

      if (json.status === "success") {
        Swal.fire("Éxito", "Millas actualizadas correctamente.", "success");
      } else {
        Swal.fire("Error", json.message || "Error desconocido", "error");
      }
    } catch (err) {
      Swal.close();
      Swal.fire("Error", "No se pudo conectar al servidor.", "error");
    }
  };

  // === FETCH INICIAL ===
  const fetchMillas = useCallback(async () => {
    try {
      const res = await fetch(`${apiHost}/formularios.php`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "op=get_millasDriver"
      });
      const json = await res.json();

      if (json.status === "success") {
        const formatted = json.data.map(d => ({
          driver_id: d.driver_id,
          name: d.nombre,
          rate: d.valor_milla ?? ""
        }));
        setRates(formatted);
      }
    } catch (err) {
      console.error("Error cargando millas:", err);
    } finally {
      setLoading(false);
    }
  }, [apiHost]);

  useEffect(() => {
    fetchMillas();
  }, [fetchMillas]);

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      {/* TÍTULO + GUARDAR */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Drivers – Millas
        </Typography>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 3,
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Button variant="contained" color="primary" onClick={() => navigate(`/paymentDrivers`)}>
            Volver
          </Button>

          <Button variant="contained" color="primary" onClick={handleSave}>
            Guardar
          </Button>
        </Box>

      </Box>

      {/* TABLA */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>No. of employee</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="center">
              $/milla
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rates.map((d, i) => (
            <TableRow key={d.driver_id}>
              <TableCell>{i + 1}</TableCell>
              <TableCell>{d.name}</TableCell>

              <TableCell align="center">
                <TextField
                  size="small"
                  value={d.rate}
                  onChange={e => handleChange(d.driver_id, e.target.value)}
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
