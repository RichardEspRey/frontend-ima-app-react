import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Divider,
  Button,
} from "@mui/material";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useNavigate } from 'react-router-dom';
import GastosModal from "../../components/GastosModal";

const TicketPayment = () => {
  const navigate = useNavigate();
  const apiHost = import.meta.env.VITE_API_HOST;
  const { trip_id } = useParams();

  const printRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);
  const [stages, setStages] = useState([]);
  const [gastos, setGastos] = useState(0);
  const [avance, setAvance] = useState(0);
  const [ajustes, setAjustes] = useState({});
  const [openGastosModal, setOpenGastosModal] = useState(false);

  // === FETCH PRINCIPAL ===
  const fetchTicket = useCallback(async () => {
    try {
      const fd = new FormData();
      fd.append("op", "get_ticket_pago");
      fd.append("trip_id", trip_id);

      const res = await fetch(`${apiHost}/formularios.php`, {
        method: "POST",
        body: fd,
      });

      const json = await res.json();

      if (json.status === "success") {
        setInfo(json.data.info_viaje);
        setStages(json.data.stages);
        setGastos(json.data.gastos?.[0]?.monto ?? 0);
      } else {
        Swal.fire("Error", "No se pudieron cargar los datos del ticket.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "No se pudo conectar al servidor.", "error");
    } finally {
      setLoading(false);
    }
  }, [apiHost, trip_id]);

  const AutorizarPago = async () => {
    try {
    
      const fd = new FormData();
      fd.append("op", "send_ticket_pago");
      fd.append("trip_id", trip_id);
      fd.append("driver_id", info.driver_id);
      fd.append("amount", totalPagar);

      const res = await fetch(`${apiHost}/formularios.php`, {
        method: "POST",
        body: fd,
      });

      const json = await res.json();
      console.log(json)
      if (json.status === "success") {
        Swal.fire({
          icon: "success",
          title: "¡Éxito!",
          text: "Pago Autorizado."
        });
        navigate(`/paymentDrivers`);

      } else {
        Swal.fire("Sin datos", "Error al autorizar pago.", "info");
      }

    } catch (err) {
      Swal.fire("Error", "No se pudo cargar la información.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  // === AJUSTES DE MILLAS ===
  const handleAjuste = (stageNum, value) => {
    setAjustes((prev) => ({
      ...prev,
      [stageNum]: Number(value) || 0,
    }));
  };

  // === CORRECCIÓN DE DESTINO PARA ETAPAS VACÍAS ===
  const getDestino = (stage, index) => {
    if (stage.stageType !== "emptyMileage") return stage.destination;

    const next = stages[index + 1];
    return next?.origin || "N/A";
  };

  // === TOTALES ===
  const totalMillasAjustadas = stages.reduce((acc, s) => {
    const adj = ajustes[s.stage_number] ?? 0;
    return acc + (Number(s.millas_pcmiller) - adj);
  }, 0);

  const totalPagar =
    Number(((info?.valor_milla ?? 0) * totalMillasAjustadas).toFixed(2)) -
    Number(avance || 0) -
    Number(gastos || 0);

  // =============================================
  // === FUNCIÓN GENERAR PDF SIN COLUMNAS EXTRA ===
  // =============================================
  const handlePrint = async () => {
    const element = printRef.current;

    // Ocultar columnas que NO deben imprimirse
    const ajustesCols = element.querySelectorAll(".col-ajuste");
    const finalesCols = element.querySelectorAll(".col-final");
    ajustesCols.forEach(col => (col.style.display = "none"));
    finalesCols.forEach(col => (col.style.display = "none"));

    // Aumentar padding SOLO para el render del PDF
    element.style.padding = "5px";

    // Captura
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    // Crear PDF con márgenes
    const pdf = new jsPDF("p", "mm", "letter");
    const marginX = 10;
    const marginY = 10;
    const pdfWidth = pdf.internal.pageSize.getWidth() - marginX * 2;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", marginX, marginY, pdfWidth, pdfHeight);
    pdf.save(`ticket_${trip_id}.pdf`);

    // Restaurar estilos
    ajustesCols.forEach(col => (col.style.display = ""));
    finalesCols.forEach(col => (col.style.display = ""));
    element.style.padding = "";
  };


  if (loading) return <Typography>Cargando…</Typography>;

  return (
    <Paper sx={{ p: 3, m: 2 }}>

      {/* TÍTULO + BOTÓN IMPRIMIR */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1, gap: 2 }}>
        <Button variant="contained" color="primary" onClick={() => navigate(`/paymentDrivers`)}>
          Volver
        </Button>
        <Button variant="outlined" color="secondary" onClick={handlePrint}>
          Imprimir PDF
        </Button>
      </Box>
      {/* === CONTENIDO A IMPRIMIR === */}
      <div ref={printRef}>
        <Typography variant="h4" fontWeight={700}>
          Ticket de Pago
        </Typography>
        <Divider sx={{ my: 2 }} />
        {/* INFO PRINCIPAL */}
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Box>
            <Typography fontWeight={700}>Nombre: {info.driver_name}</Typography>
            <Typography fontWeight={700}>Truck: {info.unidad}</Typography>
            <Typography>Trip: {info.trip_number}</Typography>
          </Box>

          <Box>
            <Typography fontWeight={700}>Pago de milla: ${info.valor_milla}</Typography>
            <Typography className="col-final" fontWeight={700}>
              Total de millas recorridas: {info.total_millas_cortas}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* TABLA */}
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Zip destino</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ciudad destino</TableCell>
              <TableCell className="col-final" sx={{ fontWeight: 700 }}>Millas</TableCell>

              <TableCell className="col-ajuste" sx={{ fontWeight: 700 }}>
                Ajuste de millas
              </TableCell>

              <TableCell sx={{ fontWeight: 700 }}>
                Millas finales
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {stages.map((s, i) => {
              const ajuste = ajustes[s.stage_number] ?? 0;
              const finalMillas = Number(s.millas_pcmiller) - ajuste;

              return (
                <TableRow key={s.stage_number}>
                  <TableCell>
                    {s.zip_code_destination || "N/A"}{" "}
                    {s.stageType === "normalTrip" && "(etapa normal)"}
                    {s.stageType === "emptyMileage" && "(etapa vacía)"}
                  </TableCell>

                  <TableCell
                    sx={{ color: s.stageType === "emptyMileage" ? "red" : "inherit" }}
                  >
                    {getDestino(s, i)}
                  </TableCell>

                  <TableCell className="col-final">{s.millas_pcmiller}</TableCell>

                  <TableCell className="col-ajuste">
                    <TextField
                      size="small"
                      type="number"
                      sx={{ width: "100px" }}
                      value={ajustes[s.stage_number] ?? ""}
                      onChange={(e) => handleAjuste(s.stage_number, e.target.value)}
                    />
                  </TableCell>

                  <TableCell >{finalMillas}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Divider sx={{ my: 3 }} />

        {/* TOTAL A PAGAR */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <TextField
            size="small"
            label="Avance"
            type="number"
            onChange={(e) => setAvance(e.target.value)}
          />
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <TextField
              size="small"
              label="Gastos"
              value={gastos}
              type="number"
              onChange={(e) => setGastos(e.target.value)}
            />

            <Button className="col-final"
              variant="contained"
              color="primary"
              onClick={() => setOpenGastosModal(true)}
            >
              Ver gastos
            </Button>
          </Box>


          <Typography fontWeight={700}>
            Millas finales: {totalMillasAjustadas}
          </Typography>

          <Typography fontWeight={700}>
            Total a pagar: ${isNaN(totalPagar) ? "0.00" : totalPagar.toFixed(2)}
          </Typography>
        </Box>
      </div>

      <Divider sx={{ my: 3 }} />

      {/* BOTÓN PAGO */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
        <Button variant="contained" color="primary"
          onClick={AutorizarPago}
        >
          Autorizar pago
        </Button>
      </Box>
      <GastosModal
        open={openGastosModal}
        onClose={() => setOpenGastosModal(false)}
        tripId={trip_id}
      />

    </Paper>

  );

};



export default TicketPayment;
