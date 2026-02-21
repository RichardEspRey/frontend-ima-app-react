import { useEffect, useState, useCallback } from "react";
import {
  Box, Paper, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  TextField, Divider, Button, Grid, Stack, Chip, Card, CardContent, InputAdornment, IconButton, Tooltip
} from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const location = useLocation();
  const { trip_id } = useParams();

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

      if (location.state?.driver_id) {
        fd.append("driver_id", location.state.driver_id);
      }

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

        let gastosCalculados = 0;
        try {
            const fdGastos = new FormData();
            fdGastos.append("op", "get_registers_gasto");
            fdGastos.append("trip_id", trip_id);
            const resGastos = await fetch(`${apiHost}/formularios.php`, { method: "POST", body: fdGastos });
            const jsonGastos = await resGastos.json();
            
            if (jsonGastos.status === "success" && Array.isArray(jsonGastos.id)) {
                gastosCalculados = jsonGastos.id.reduce((sum, g) => sum + Number(g.monto || 0), 0);
            }
        } catch (err) {
            console.error("Error al precargar gastos:", err);
        }

        if (json.data.saved_data) {
            const valA1 = Number(json.data.saved_data.anticipo_1 || 0);
            const valA2 = Number(json.data.saved_data.anticipo_2 || 0);
            const valA3 = Number(json.data.saved_data.anticipo_3 || 0);

            setAvances({ a1: valA1, a2: valA2, a3: valA3 });
            
            let count = 1;
            if (valA3 > 0) count = 3;
            else if (valA2 > 0) count = 2;
            setVisibleAdvances(count);

            const savedGastos = Number(json.data.saved_data.gastos_aplicados || 0);
            
            setGastos(savedGastos > 0 ? savedGastos : gastosCalculados);
        } else {
            setGastos(gastosCalculados);
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
  }, [apiHost, trip_id, location.state]);

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

  const totalMillasAjustadas = Number(stages.reduce((acc, s) => {
    const adj = ajustes[s.stage_number] ?? 0;
    return acc + (Number(s.millas_pcmiller) - adj);
  }, 0).toFixed(2));

  const totalAvances = Number((
      Number(avances.a1 || 0) + 
      Number(avances.a2 || 0) + 
      Number(avances.a3 || 0)
  ).toFixed(2));

  const totalPagar =
    Number((Number(customRate) * totalMillasAjustadas).toFixed(2)) -
    totalAvances +
    Number(gastos || 0);

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

  const handlePrint = () => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.setTextColor(25, 118, 210); 
    doc.text("TICKET DE PAGO", 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Trip #: ${info?.trip_number || trip_id}`, 14, 30);
    doc.text(`ID Transacción: ${trip_id}`, 14, 35);
    doc.text(`Fecha de emisión: ${new Date().toLocaleDateString('es-MX')}`, 14, 40);

    doc.setDrawColor(200, 200, 200);
    doc.line(14, 45, 196, 45);

    doc.setFontSize(11);
    doc.setTextColor(50, 50, 50);
    doc.text("CONDUCTOR:", 14, 55);
    doc.setFont(undefined, 'bold');
    doc.text(`${info?.driver_name || 'N/A'}`, 45, 55);
    
    doc.setFont(undefined, 'normal');
    doc.text("UNIDAD:", 130, 55);
    doc.setFont(undefined, 'bold');
    doc.text(`${info?.unidad || 'N/A'}`, 150, 55);

    doc.setFont(undefined, 'normal');
    doc.text("TARIFA X MILLA:", 14, 63);
    doc.setFont(undefined, 'bold');
    doc.text(`$${Number(customRate).toFixed(4)}`, 48, 63);

    const tableData = stages.map((s, i) => {
        const ajuste = ajustes[s.stage_number] ?? 0;
        const finalMillas = Number(s.millas_pcmiller) - ajuste;
        const isEmtpy = s.stageType === "emptyMileage";
        const destinoReal = getDestino(s, i);
        
        const destinoTexto = `${s.zip_code_destination || 'N/A'} - ${destinoReal}`;
        const tipoTexto = isEmtpy ? "Vacía" : "Normal";
        
        return [
            destinoTexto,
            tipoTexto,
            ajuste > 0 ? `-${ajuste}` : "-", 
            finalMillas.toFixed(2)
        ];
    });

    autoTable(doc, {
        startY: 75,
        head: [['Destino (Zip / Ciudad)', 'Tipo Etapa', 'Ajuste (-)', 'Millas']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [38, 50, 56], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
            2: { halign: 'center', textColor: [211, 47, 47] }, 
            3: { halign: 'right', fontStyle: 'bold' } 
        }
    });

    const finalY = doc.lastAutoTable.finalY || 75;

    doc.setFontSize(14);
    doc.setTextColor(38, 50, 56);
    doc.text("RESUMEN FINANCIERO", 14, finalY + 15);
    doc.line(14, finalY + 18, 196, finalY + 18);

    let sumY = finalY + 28;
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');

    const printRightAligned = (label, value, yPos, isBold = false) => {
        doc.setFont(undefined, isBold ? 'bold' : 'normal');
        doc.text(label, 120, yPos);
        const valueWidth = doc.getTextWidth(value);
        doc.text(value, 196 - valueWidth, yPos);
    };

    printRightAligned("Millas Totales (Ajustadas):", `${totalMillasAjustadas.toFixed(2)} mi`, sumY, true); sumY += 8;
    printRightAligned(`Subtotal ($${Number(customRate).toFixed(2)}/mi):`, `$${(Number(customRate) * totalMillasAjustadas).toFixed(2)}`, sumY); sumY += 8;
    
    if (Number(gastos) > 0) {
        printRightAligned("Otros Gastos (Reembolso):", `+$${Number(gastos).toFixed(2)}`, sumY); sumY += 8;
    }
    
    if (avances.a1 > 0) { printRightAligned("Anticipo 1:", `-$${Number(avances.a1).toFixed(2)}`, sumY); sumY += 6; }
    if (avances.a2 > 0) { printRightAligned("Anticipo 2:", `-$${Number(avances.a2).toFixed(2)}`, sumY); sumY += 6; }
    if (avances.a3 > 0) { printRightAligned("Anticipo 3:", `-$${Number(avances.a3).toFixed(2)}`, sumY); sumY += 6; }
    
    if (totalAvances > 0) {
        doc.setTextColor(211, 47, 47); 
        printRightAligned("Total Anticipos:", `-$${totalAvances.toFixed(2)}`, sumY, true); sumY += 10;
        doc.setTextColor(38, 50, 56); 
    } else {
        sumY += 4;
    }

    doc.setFontSize(16);
    doc.setTextColor(46, 125, 50); 
    printRightAligned("TOTAL A PAGAR:", `$${isNaN(totalPagar) ? "0.00" : totalPagar.toFixed(2)}`, sumY, true);

    doc.save(`Ticket_Pago_${info?.trip_number || trip_id}.pdf`);
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

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        
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
                        
                        <Box mt={1}>
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
              <TableCell align="center" sx={{ fontWeight: 700 }}>Ajuste (-)</TableCell>
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
                  <TableCell align="right" sx={{ fontFamily: 'monospace' }}>{Number(s.millas_pcmiller).toFixed(2)}</TableCell>
                  
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      placeholder="0"
                      value={ajustes[s.stage_number] ?? ""}
                      onChange={(e) => handleAjuste(s.stage_number, e.target.value)}
                      sx={{ width: 80, '& input': { textAlign: 'center', p: 0.5 } }}
                    />
                  </TableCell>

                  <TableCell align="right" sx={{ fontWeight: 700 }}>{finalMillas.toFixed(2)}</TableCell>
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
                        
                        <Stack spacing={1}>
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
                                >
                                    Agregar otro anticipo
                                </Button>
                            )}
                        </Stack>
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
                            <Typography variant="body1" fontWeight={600}>{totalMillasAjustadas.toFixed(2)} mi</Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                             <Typography variant="body2" color="rgba(255,255,255,0.7)">
                                Subtotal ({Number(customRate).toFixed(2)}/mi):
                             </Typography>
                             <Typography variant="body1">
                                ${(Number(customRate) * totalMillasAjustadas).toFixed(2)}
                             </Typography>
                        </Stack>
                        
                        <Stack direction="row" justifyContent="space-between">
                             <Typography variant="body2" color="rgba(255,255,255,0.7)">Otros Gastos:</Typography>
                             <Typography variant="body1">
                                +${Number(gastos).toFixed(2)}
                             </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between">
                             <Typography variant="body2" color="rgba(255,255,255,0.7)">Total Anticipos:</Typography>
                             <Typography variant="body1" color="error.light">
                                -${totalAvances.toFixed(2)}
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

      {openGastosModal && (
        <GastosModal
            open={openGastosModal}
            onClose={() => setOpenGastosModal(false)}
            tripId={trip_id}
        />
      )}
    </Box>
  );
};

export default TicketPayment;