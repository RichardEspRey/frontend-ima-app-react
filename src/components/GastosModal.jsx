import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";

const apiHost = import.meta.env.VITE_API_HOST;

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "600px",
  bgcolor: "white",
  boxShadow: 24,
  p: 3,
  borderRadius: "10px",
  maxHeight: "80vh",
  overflowY: "auto",
};

const GastosModal = ({ open, onClose, tripId }) => {
  const [loading, setLoading] = useState(true);
  const [gastos, setGastos] = useState([]);

  const fetchGastos = useCallback(async () => {
    try {
      setLoading(true);

      const fd = new FormData();
      fd.append("op", "get_registers_gasto");
      fd.append("trip_id", tripId);

      const res = await fetch(`${apiHost}/formularios.php`, {
        method: "POST",
        body: fd,
      });

      const json = await res.json();

      if (json.status === "success") {
        setGastos(json.id);
      } else {
        Swal.fire("Sin datos", "No hay gastos registrados para este viaje.", "info");
      }

    } catch (err) {
      Swal.fire("Error", "No se pudo cargar la información.", "error");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    if (open) fetchGastos();
  }, [open, fetchGastos]);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={modalStyle}>

        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography variant="h6" fontWeight={700}>
            Gastos del Viaje
          </Typography>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Contenido */}
        {loading ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : gastos.length === 0 ? (
          <Typography>No hay registros de gastos.</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><strong>Tipo de gasto</strong></TableCell>
                <TableCell><strong>Monto</strong></TableCell>
                <TableCell><strong>Fecha</strong></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {gastos.map((g) => (
                <TableRow key={g.id}>
                  <TableCell>{g.tipo_gasto}</TableCell>
                  <TableCell>${g.monto}</TableCell>
                  <TableCell>{g.fecha}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Footer */}
        <Box sx={{ textAlign: "right", mt: 3 }}>
          <Button variant="outlined" onClick={onClose}>
            Cerrar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default GastosModal;
