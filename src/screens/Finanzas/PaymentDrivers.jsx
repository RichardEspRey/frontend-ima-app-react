import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  TablePagination, TextField, Box, Typography, CircularProgress, Chip
} from "@mui/material";

import Swal from "sweetalert2";

const apiHost = import.meta.env.VITE_API_HOST;

// === HELPER DE MONEY ===
const money = (v) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(v || 0));


// === CHIP DE STATUS DE PAGO ===
const PaymentStatusChip = ({ value }) => {
  let label = "";
  let color = "";

  switch (String(value)) {
    case "0":
      label = "Pendiente de autorización";
      color = "#ffa726"; // naranja
      break;
    case "1":
      label = "Pagado";
      color = "#66bb6a"; // verde
      break;
    case "2":
      label = "Autorización de pago";
      color = "#29b6f6"; // azul
      break;
    default:
      label = "Desconocido";
      color = "#bdbdbd";
  }

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: color,
        color: "#fff",
        fontWeight: 600,
      }}
    />
  );
};


const PaymentDrivers = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // === FETCH PRINCIPAL ===
  const fetchPayments = useCallback(async () => {
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("op", "All_paymentDrivers");

      const res = await fetch(`${apiHost}/formularios.php`, {
        method: "POST",
        body: fd,
      });

      const json = await res.json();

      if (json.status === "success" && Array.isArray(json.data)) {
        const norm = json.data.map((t) => ({
          trip_id: Number(t.trip_id),
          trip_number: t.trip_number,
          nombre: t.nombre,
          stages_count: Number(t.stages_count ?? 0),
          total_tarifa: Number(t.total_tarifa ?? 0),
          total_millas_cortas: Number(t.total_millas_cortas ?? 0),
          status_payment: t.status_payment,
          Pago_driver: t.Pago_driver ? Number(t.Pago_driver) : null,
          pago_aproximado: Number(t.pago_aproximado ?? 0),
        }));

        setTrips(norm);
      } else {
        setTrips([]);
      }
    } catch (err) {
      console.error("Error cargando pagos:", err);
      Swal.fire("Error", "No se pudo cargar la información.", "error");
      setTrips([]);
    } finally {
      setLoading(false);
    }
  }, [apiHost]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // === FILTRO POR TRIP_NUMBER ===
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return trips;
    return trips.filter((t) => (t.trip_number || "").toLowerCase().includes(q));
  }, [trips, search]);

  const pageTrips = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);


  return (
    <Paper sx={{ m: 2, p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h4" fontWeight={700}>
          Pago a Operadores
        </Typography>

        <TextField
          size="small"
          label="Buscar Trip"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell style={{ fontWeight: 600 }}>Trip</TableCell>
              <TableCell style={{ fontWeight: 600 }}>Conductor</TableCell>
              <TableCell style={{ fontWeight: 600 }}>Etapas</TableCell>
              <TableCell style={{ fontWeight: 600 }}>Millas cortas</TableCell>
              <TableCell style={{ fontWeight: 600 }}>Tarifa total</TableCell>
              <TableCell style={{ fontWeight: 600 }}>Pago Realizado</TableCell>
              <TableCell style={{ fontWeight: 600 }}>Pago aproximado (tarifa actual)</TableCell>
              <TableCell style={{ fontWeight: 600 }}>Estatus</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Box sx={{ py: 4, display: "flex", gap: 2, justifyContent: "center" }}>
                    <CircularProgress size={24} />
                    <Typography>Cargando…</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : pageTrips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography sx={{ py: 3 }} color="text.secondary">
                    Sin registros
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pageTrips.map((t) => (
                <TableRow key={t.trip_id}>
                  <TableCell>{t.trip_number}</TableCell>
                  <TableCell>{t.nombre}</TableCell>
                  <TableCell>{t.stages_count}</TableCell>
                  <TableCell>{t.total_millas_cortas}</TableCell>
                  <TableCell>{money(t.total_tarifa)}</TableCell>
                  <TableCell>{t.Pago_driver ? money(t.Pago_driver) : "---"}</TableCell>
                  <TableCell>{money(t.pago_aproximado)}</TableCell>
                  <TableCell>
                    <PaymentStatusChip value={t.status_payment} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={filtered.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
      />
    </Paper>
  );
};

export default PaymentDrivers;
