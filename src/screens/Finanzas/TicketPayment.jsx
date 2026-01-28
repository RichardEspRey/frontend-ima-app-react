import { useEffect, useState, useCallback, useRef } from "react";
import {
  Box, Paper, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  TextField, Divider, Button, Grid, Stack, Chip, Card, CardContent, InputAdornment, IconButton, Tooltip
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import PrintIcon from '@mui/icons-material/Print';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import RouteIcon from '@mui/icons-material/Route';

import GastosModal from "../../components/GastosModal";

const apiHost = import.meta.env.VITE_API_HOST;

const TicketPayment = () => {
  const navigate = useNavigate();
  const { trip_id } = useParams();
  const printRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);
  const [stages, setStages] = useState([]);
  const [gastos, setGastos] = useState(0);
  const [avance, setAvance] = useState(0);
  const [ajustes, setAjustes] = useState({});
  const [openGastosModal, setOpenGastosModal] = useState(false);

  const fetchTicket = useCallback(async () => {
    try {
      const fd = new FormData();
      fd.append("op", "get_ticket_pago");
      fd.append("trip_id", trip_id);

      const res = await fetch(`${apiHost}/formularios.php`, { method: "POST", body: fd });
      const json = await res.json();

      if (json.status === "success") {
        setInfo(json.data.info_viaje);
        setStages(json.data.stages);
        
        const savedAjustes = {};
        json.data.stages.forEach(s => {
            if (s.ajuste_millas && Number(s.ajuste_millas) !== 0) {
                savedAjustes[s.stage_number] = Number(s.ajuste_millas);
            }
        });
        setAjustes(savedAjustes);

        if (json.data.saved_data) {
            setAvance(Number(json.data.saved_data.anticipo || 0));
            setGastos(Number(json.data.saved_data.gastos_aplicados || 0));
        } else {
            setGastos(json.data.gastos?.[0]?.monto ?? 0);
            setAvance(0);
        }

      } else {
        Swal.fire("Error", "No se pudieron cargar los datos del ticket.", "error");
      }
    } catch (err) {
      Swal.fire("Error", "No se pudo conectar al servidor.", "error");
    } finally {
      setLoading(false);
    }
  }, [apiHost, trip_id]);

  useEffect(() => { fetchTicket(); }, [fetchTicket]);

  const AutorizarPago = async () => {
    Swal.fire({
        title: '¿Autorizar Pago?',
        text: `Total a pagar: $${totalPagar.toFixed(2)}`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2e7d32',
        confirmButtonText: 'Sí, Autorizar'
    }).then(async (result) => {
        if(result.isConfirmed) {
            try {
                const fd = new FormData();
                fd.append("op", "send_ticket_pago");
                fd.append("trip_id", trip_id);
                fd.append("driver_id", info.driver_id);
                fd.append("amount", totalPagar);
                
                fd.append("anticipo", avance);
                fd.append("gastos", gastos);
                fd.append("ajustes", JSON.stringify(ajustes)); 
          
                const res = await fetch(`${apiHost}/formularios.php`, { method: "POST", body: fd });
                const json = await res.json();
                
                if (json.status === "success") {
                  Swal.fire("¡Éxito!", "Pago Autorizado y datos guardados.", "success");
                  navigate(`/paymentDrivers`);
                } else {
                  Swal.fire("Error", "Error al autorizar pago.", "error");
                }
              } catch (err) {
                Swal.fire("Error", "No se pudo procesar la solicitud.", "error");
              }
        }
    });
  };

  const handleAjuste = (stageNum, value) => {
    setAjustes((prev) => ({ ...prev, [stageNum]: Number(value) || 0 }));
  };

  const getDestino = (stage, index) => {
    if (stage.stageType !== "emptyMileage") return stage.destination;
    const next = stages[index + 1];
    return next?.origin || "N/A";
  };

  const totalMillasAjustadas = stages.reduce((acc, s) => {
    const adj = ajustes[s.stage_number] ?? 0;
    return acc + (Number(s.millas_pcmiller) - adj);
  }, 0);

  const totalPagar =
    Number(((info?.valor_milla ?? 0) * totalMillasAjustadas).toFixed(2)) -
    Number(avance || 0) +
    Number(gastos || 0);

  const handlePrint = async () => {
    const element = printRef.current;
    const ajustesCols = element.querySelectorAll(".col-ajuste");
    const finalesCols = element.querySelectorAll(".col-final"); 
    
    ajustesCols.forEach(col => (col.style.display = "none"));
    finalesCols.forEach(col => (col.style.display = "none"));
    
    element.style.padding = "20px";

    const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    
    const pdf = new jsPDF("p", "mm", "letter");
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);
    pdf.save(`Ticket_Pago_${info?.trip_number || trip_id}.pdf`);

    ajustesCols.forEach(col => (col.style.display = ""));
    finalesCols.forEach(col => (col.style.display = ""));
    element.style.padding = "";
  };

  if (loading) return <Box p={5} textAlign="center"><Typography>Cargando información del ticket...</Typography></Box>;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/paymentDrivers`)} sx={{ color: 'text.secondary' }}>
            Volver a Pagos
        </Button>
        <Stack direction="row" spacing={2}>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={handlePrint}>
                Imprimir PDF
            </Button>
            <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={AutorizarPago}>
                Autorizar Pago
            </Button>
        </Stack>
      </Stack>

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }} ref={printRef}>
        
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3} pb={2} borderBottom="1px solid #eee">
            <Box>
                <Typography variant="h4" fontWeight={800} color="primary.main">Ticket de Pago</Typography>
                <Typography variant="body2" color="text.secondary">ID Transacción: {trip_id}</Typography>
            </Box>
            <Box textAlign="right">
                <Chip 
                    icon={<RouteIcon />} 
                    label={`Trip #${info.trip_number}`} 
                    color="primary" 
                    variant="outlined" 
                    sx={{ fontWeight: 'bold', fontSize: '1rem', px: 1 }} 
                />
            </Box>
        </Stack>

        <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={8}>
                <Card variant="outlined" sx={{ bgcolor: '#f8f9fa', height: '100%' }}>
                    <CardContent>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                    <PersonIcon color="action" fontSize="small" />
                                    <Typography variant="caption" textTransform="uppercase" fontWeight={700} color="text.secondary">Conductor</Typography>
                                </Stack>
                                <Typography variant="h6" fontWeight={600}>{info.driver_name}</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                    <LocalShippingIcon color="action" fontSize="small" />
                                    <Typography variant="caption" textTransform="uppercase" fontWeight={700} color="text.secondary">Unidad</Typography>
                                </Stack>
                                <Typography variant="h6" fontWeight={600}>{info.unidad}</Typography>
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={12} md={4}>
                 <Card variant="outlined" sx={{ height: '100%', borderColor: 'primary.light' }}>
                    <CardContent>
                        <Typography variant="caption" textTransform="uppercase" fontWeight={700} color="primary.main">Tarifa por Milla</Typography>
                        <Typography variant="h4" fontWeight={700} color="primary.main">${info.valor_milla}</Typography>
                        <Typography variant="body2" color="text.secondary" mt={1}>Total Recorrido: {info.total_millas_cortas} mi</Typography>
                    </CardContent>
                 </Card>
            </Grid>
        </Grid>

        <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 4 }}>Detalle de Recorrido</Typography>
        <Table size="small" sx={{ mb: 4 }}>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Destino (Zip / Ciudad)</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tipo Etapa</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Millas Orig.</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }} className="col-ajuste">Ajuste (-)</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>Millas Finales</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stages.map((s, i) => {
              const ajuste = ajustes[s.stage_number] ?? 0;
              const finalMillas = Number(s.millas_pcmiller) - ajuste;
              const isEmtpy = s.stageType === "emptyMileage";

              return (
                <TableRow key={s.stage_number}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{s.zip_code_destination || "N/A"}</Typography>
                    <Typography variant="caption" color={isEmtpy ? "error" : "text.secondary"}>
                         {getDestino(s, i)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                        label={isEmtpy ? "Vacía" : "Normal"} 
                        size="small" 
                        color={isEmtpy ? "default" : "primary"} 
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{s.millas_pcmiller}</TableCell>
                  
                  <TableCell align="center" className="col-ajuste">
                    <TextField
                      size="small"
                      type="number"
                      placeholder="0"
                      value={ajustes[s.stage_number] ?? ""}
                      onChange={(e) => handleAjuste(s.stage_number, e.target.value)}
                      sx={{ width: 80, '& input': { textAlign: 'center', p: 0.5 } }}
                    />
                  </TableCell>

                  <TableCell align="right" sx={{ fontWeight: 700 }}>{finalMillas}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" textTransform="uppercase" color="text.secondary" mb={2}>Deducciones y Gastos</Typography>
                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Anticipo / Avance"
                        type="number"
                        value={avance}
                        onChange={(e) => setAvance(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                    />
                    <Stack direction="row" spacing={1}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Gastos de Viaje"
                            value={gastos}
                            type="number"
                            onChange={(e) => setGastos(e.target.value)}
                            InputProps={{
                                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                            }}
                        />
                        <Tooltip title="Ver detalle de gastos">
                            <IconButton 
                                color="primary" 
                                onClick={() => setOpenGastosModal(true)} 
                                sx={{ border: '1px solid #ddd', borderRadius: 1 }}
                                className="col-final"
                            >
                                <ReceiptLongIcon />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
                <Paper 
                    elevation={0} 
                    sx={{ 
                        bgcolor: '#263238', 
                        color: '#fff', 
                        p: 3, 
                        borderRadius: 2, 
                        textAlign: 'right' 
                    }}
                >
                    <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="body2" color="rgba(255,255,255,0.7)">Millas Totales (Ajustadas):</Typography>
                            <Typography variant="body1" fontWeight={600}>{totalMillasAjustadas} mi</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                             <Typography variant="body2" color="rgba(255,255,255,0.7)">Subtotal Bruto:</Typography>
                             <Typography variant="body1">
                                ${(Number(info?.valor_milla ?? 0) * totalMillasAjustadas).toFixed(2)}
                             </Typography>
                        </Stack>
                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 1 }} />
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight={400}>Total a Pagar:</Typography>
                            <Typography variant="h3" fontWeight={700}>
                                ${isNaN(totalPagar) ? "0.00" : totalPagar.toFixed(2)}
                            </Typography>
                        </Stack>
                    </Stack>
                </Paper>
            </Grid>
        </Grid>
      </Paper>

      <GastosModal
        open={openGastosModal}
        onClose={() => setOpenGastosModal(false)}
        tripId={trip_id}
      />
    </Box>
  );
};

export default TicketPayment;