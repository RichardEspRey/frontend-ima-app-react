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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import RouteIcon from '@mui/icons-material/Route';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

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
  const [avances, setAvances] = useState({ a1: 0, a2: 0, a3: 0 });
  const [visibleAdvances, setVisibleAdvances] = useState(1);

  const [ajustes, setAjustes] = useState({});
  const [openGastosModal, setOpenGastosModal] = useState(false);
  const [customRate, setCustomRate] = useState(0);

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
        setCustomRate(Number(json.data.info_viaje.valor_milla || 0));

        const savedAjustes = {};
        if(json.data.stages) {
            json.data.stages.forEach(s => {
                if (s.ajuste_millas && Number(s.ajuste_millas) !== 0) {
                    savedAjustes[s.stage_number] = Number(s.ajuste_millas);
                }
            });
        }
        setAjustes(savedAjustes);

        if (json.data.saved_data) {
            const valA1 = Number(json.data.saved_data.anticipo_1 || 0);
            const valA2 = Number(json.data.saved_data.anticipo_2 || 0);
            const valA3 = Number(json.data.saved_data.anticipo_3 || 0);

            setAvances({ a1: valA1, a2: valA2, a3: valA3 });
            
            let count = 1;
            if (valA3 > 0) count = 3;
            else if (valA2 > 0) count = 2;
            setVisibleAdvances(count);

            setGastos(Number(json.data.saved_data.gastos_aplicados || 0));
        } 

      } else {
        Swal.fire("Error", "No se pudieron cargar los datos del ticket.", "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "No se pudo conectar al servidor.", "error");
    } finally {
      setLoading(false);
    }
  }, [apiHost, trip_id]);

  useEffect(() => { fetchTicket(); }, [fetchTicket]);

  const handleAvanceChange = (key, value) => {
      setAvances(prev => ({ ...prev, [key]: value }));
  };

  const addNextAdvance = () => {
      if (visibleAdvances < 3) {
          setVisibleAdvances(prev => prev + 1);
      }
  };

  const removeAdvance = (key, levelToSet) => {
      handleAvanceChange(key, 0); 
      setVisibleAdvances(levelToSet);
  };

  // === CÁLCULOS DINÁMICOS ===
  const totalMillasAjustadas = stages.reduce((acc, s) => {
    const adj = ajustes[s.stage_number] ?? 0;
    return acc + (Number(s.millas_pcmiller) - adj);
  }, 0);

  const totalAvances = Number(avances.a1 || 0) + Number(avances.a2 || 0) + Number(avances.a3 || 0);

  const totalPagar =
    Number((Number(customRate) * totalMillasAjustadas).toFixed(2)) -
    totalAvances -
    Number(gastos || 0);

  // === ENVÍO DE DATOS ===
  const AutorizarPago = async () => {
    Swal.fire({
        title: '¿Autorizar Pago?',
        html: `
            <div style="text-align:left; font-size: 0.9em;">
                <p>Tarifa: <b>$${Number(customRate).toFixed(2)}</b></p>
                <p>Millas Finales: <b>${totalMillasAjustadas}</b></p>
                <p>Total Anticipos: <b>$${totalAvances.toFixed(2)}</b></p>
                <p>Gastos: <b>$${Number(gastos).toFixed(2)}</b></p>
            </div>
            <h3 style="margin-top:10px; color:#2e7d32">Total: $${totalPagar.toFixed(2)}</h3>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#2e7d32',
        confirmButtonText: 'Sí, Guardar y Autorizar'
    }).then(async (result) => {
        if(result.isConfirmed) {
            try {
                const fd = new FormData();
                fd.append("op", "send_ticket_pago");
                fd.append("trip_id", trip_id);
                fd.append("driver_id", info.driver_id);
                fd.append("amount", totalPagar);
                fd.append("rate_per_mile", customRate);
                
                fd.append("anticipo_1", avances.a1);
                fd.append("anticipo_2", avances.a2);
                fd.append("anticipo_3", avances.a3);

                fd.append("gastos", gastos);
                fd.append("ajustes", JSON.stringify(ajustes));
          
                const res = await fetch(`${apiHost}/formularios.php`, { method: "POST", body: fd });
                const json = await res.json();
                
                if (json.status === "success") {
                  Swal.fire("¡Éxito!", "Pago Autorizado y datos guardados.", "success");
                  navigate(`/paymentDrivers`);
                } else {
                  Swal.fire("Error", json.message || "Error al autorizar pago.", "error");
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

  const handlePrint = async () => {
    const element = printRef.current;
    
    const ajustesCols = element.querySelectorAll(".col-ajuste");
    const inputsRate = element.querySelectorAll(".input-rate");
    const textRate = element.querySelectorAll(".text-rate");
    
    const inputsAvance = element.querySelectorAll(".input-avance");
    const textAvance = element.querySelectorAll(".text-avance");
    const botonesAdd = element.querySelectorAll(".btn-add-avance"); 

    const botones = element.querySelectorAll("button, .MuiIconButton-root");

    ajustesCols.forEach(col => (col.style.display = "none"));
    botones.forEach(btn => (btn.style.display = "none"));
    botonesAdd.forEach(btn => (btn.style.display = "none"));
    
    inputsRate.forEach(el => el.style.display = 'none');
    textRate.forEach(el => el.style.display = 'block');

    inputsAvance.forEach(el => el.style.display = 'none');
    textAvance.forEach(el => el.style.display = 'block');

    element.style.padding = "20px";

    const canvas = await html2canvas(element, { scale: 2, backgroundColor: "#ffffff" });
    const imgData = canvas.toDataURL("image/png");
    
    const pdf = new jsPDF("p", "mm", "letter");
    const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);
    pdf.save(`Ticket_Pago_${info?.trip_number || trip_id}.pdf`);

    // Restaurar
    ajustesCols.forEach(col => (col.style.display = ""));
    botones.forEach(btn => (btn.style.display = ""));
    botonesAdd.forEach(btn => (btn.style.display = "flex")); 
    inputsRate.forEach(el => el.style.display = 'block');
    textRate.forEach(el => el.style.display = 'none');
    inputsAvance.forEach(el => el.style.display = 'block');
    textAvance.forEach(el => el.style.display = 'none');
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
                 <Card variant="outlined" sx={{ height: '100%', borderColor: 'primary.light', bgcolor: '#e3f2fd' }}>
                    <CardContent>
                        <Typography variant="caption" textTransform="uppercase" fontWeight={700} color="primary.main">Tarifa por Milla</Typography>
                        
                        <Box className="input-rate" mt={1}>
                            <TextField 
                                value={customRate}
                                onChange={(e) => setCustomRate(e.target.value)}
                                type="number"
                                fullWidth
                                size="small"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><AttachMoneyIcon fontSize="small"/></InputAdornment>,
                                    style: { fontWeight: 700, fontSize: '1.2rem', backgroundColor: 'white' }
                                }}
                            />
                        </Box>

                        <Typography className="text-rate" variant="h4" fontWeight={700} color="primary.main" style={{display: 'none'}}>
                            ${Number(customRate).toFixed(2)}
                        </Typography>

                        <Typography variant="body2" color="text.secondary" mt={1}>
                            Total Recorrido: {info.total_millas_cortas} mi
                        </Typography>
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
                    <Box sx={{ border: '1px dashed #ccc', p: 2, borderRadius: 1 }}>
                        <Typography variant="caption" fontWeight={700} color="primary" gutterBottom>Anticipos / Avances</Typography>
                        
                        <Stack spacing={1} className="input-avance">
                            <TextField 
                                fullWidth size="small" 
                                label="Avance 1" 
                                type="number" 
                                value={avances.a1} 
                                onChange={(e) => handleAvanceChange('a1', e.target.value)} 
                                InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} 
                            />

                            {visibleAdvances >= 2 && (
                                <Stack direction="row" spacing={1}>
                                    <TextField 
                                        fullWidth size="small" 
                                        label="Avance 2" 
                                        type="number" 
                                        value={avances.a2} 
                                        onChange={(e) => handleAvanceChange('a2', e.target.value)} 
                                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} 
                                    />
                                    <IconButton size="small" color="error" onClick={() => removeAdvance('a2', 1)}>
                                        <DeleteOutlineIcon />
                                    </IconButton>
                                </Stack>
                            )}

                            {visibleAdvances >= 3 && (
                                <Stack direction="row" spacing={1}>
                                    <TextField 
                                        fullWidth size="small" 
                                        label="Avance 3" 
                                        type="number" 
                                        value={avances.a3} 
                                        onChange={(e) => handleAvanceChange('a3', e.target.value)} 
                                        InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} 
                                    />
                                    <IconButton size="small" color="error" onClick={() => removeAdvance('a3', 2)}>
                                        <DeleteOutlineIcon />
                                    </IconButton>
                                </Stack>
                            )}

                            {visibleAdvances < 3 && (
                                <Button 
                                    size="small" 
                                    startIcon={<AddCircleOutlineIcon />} 
                                    onClick={addNextAdvance}
                                    sx={{ textTransform: 'none', justifyContent: 'flex-start', color: 'primary.main' }}
                                    className="btn-add-avance"
                                >
                                    Agregar otro anticipo
                                </Button>
                            )}
                        </Stack>

                        <Box className="text-avance" style={{display:'none'}}>
                            {avances.a1 > 0 && <Typography variant="body2">Avance 1: -${Number(avances.a1).toFixed(2)}</Typography>}
                            {avances.a2 > 0 && <Typography variant="body2">Avance 2: -${Number(avances.a2).toFixed(2)}</Typography>}
                            {avances.a3 > 0 && <Typography variant="body2">Avance 3: -${Number(avances.a3).toFixed(2)}</Typography>}
                            {totalAvances === 0 && <Typography variant="body2" fontStyle="italic">Sin anticipos</Typography>}
                        </Box>
                    </Box>

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
                             <Typography variant="body2" color="rgba(255,255,255,0.7)">
                                Subtotal ({Number(customRate).toFixed(2)}/mi):
                             </Typography>
                             <Typography variant="body1">
                                ${(Number(customRate) * totalMillasAjustadas).toFixed(2)}
                             </Typography>
                        </Stack>
                        
                        {/* Resumen de Anticipos en Total */}
                        <Stack direction="row" justifyContent="space-between">
                             <Typography variant="body2" color="rgba(255,255,255,0.7)">Total Anticipos:</Typography>
                             <Typography variant="body1" color="error.light">
                                -${totalAvances.toFixed(2)}
                             </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                             <Typography variant="body2" color="rgba(255,255,255,0.7)">Otros Gastos:</Typography>
                             <Typography variant="body1" color="error.light">
                                -${Number(gastos).toFixed(2)}
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