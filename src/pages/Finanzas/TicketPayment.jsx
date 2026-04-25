import { useEffect, useState, useCallback } from "react";
import { Box, Paper, Typography, Divider, Grid, Stack, Chip, TextField } from "@mui/material";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import RouteIcon from '@mui/icons-material/Route';

// Componentes modulares
import TicketHeader from "../../components/TicketPayment/TicketHeader";
import TicketInfoCards from "../../components/TicketPayment/TicketInfoCards";
import TicketStagesTable from "../../components/TicketPayment/TicketStagesTable";
import TicketDeductions from "../../components/TicketPayment/TicketDeductions";
import TicketSummary from "../../components/TicketPayment/TicketSummary";
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

  const [comentarios, setComentarios] = useState("");

  const fetchTicket = useCallback(async () => {
    try {
      const fd = new FormData();
      fd.append("op", "get_ticket_pago");
      fd.append("trip_id", trip_id);
      if (location.state?.driver_id) fd.append("driver_id", location.state.driver_id);

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
        } catch (err) { console.error("Error al precargar gastos:", err); }

        if (json.data.saved_data) {
            const valA1 = Number(json.data.saved_data.anticipo_1 || 0);
            const valA2 = Number(json.data.saved_data.anticipo_2 || 0);
            const valA3 = Number(json.data.saved_data.anticipo_3 || 0);

            setAvances({ a1: valA1, a2: valA2, a3: valA3 });
            let count = 1;
            if (valA3 > 0) count = 3;
            else if (valA2 > 0) count = 2;
            setVisibleAdvances(count);

            setComentarios(json.data.saved_data.comentarios || ""); 

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

  const handleAvanceChange = (key, value) => setAvances(prev => ({ ...prev, [key]: value }));
  const addNextAdvance = () => { if (visibleAdvances < 3) setVisibleAdvances(prev => prev + 1); };
  const removeAdvance = (key, levelToSet) => { handleAvanceChange(key, 0); setVisibleAdvances(levelToSet); };
  const handleAjuste = (stageNum, value) => setAjustes((prev) => ({ ...prev, [stageNum]: Number(value) || 0 }));

  const getDestino = (stage, index) => {
    if (stage.stageType !== "emptyMileage") return stage.destination;
    const next = stages[index + 1];
    return next?.origin || "N/A";
  };

  const totalMillasAjustadas = Number(stages.reduce((acc, s) => {
    const adj = ajustes[s.stage_number] ?? 0;
    return acc + (Number(s.millas_pcmiller) - adj);
  }, 0).toFixed(2));

  const totalAvances = Number((Number(avances.a1 || 0) + Number(avances.a2 || 0) + Number(avances.a3 || 0)).toFixed(2));
  const totalPagar = Number((Number(customRate) * totalMillasAjustadas).toFixed(2)) - totalAvances + Number(gastos || 0);

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
                fd.append("comentarios", comentarios);
          
                const res = await fetch(`${apiHost}/formularios.php`, { method: "POST", body: fd });
                const json = await res.json();
                if (json.status === "success") {
                  Swal.fire("¡Éxito!", "Pago Autorizado y datos guardados.", "success");
                  navigate(`/paymentDrivers`);
                } else {
                  Swal.fire("Error", json.message || "Error al autorizar pago.", "error");
                }
              } catch (err) { Swal.fire("Error", "No se pudo procesar la solicitud.", "error"); }
        }
    });
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
        
        return [
            `${s.zip_code_destination || 'N/A'} - ${destinoReal}`,
            isEmtpy ? "Vacía" : "Normal",
            finalMillas.toFixed(2)
        ];
    });

    autoTable(doc, {
        startY: 75,
        head: [['Destino (Zip / Ciudad)', 'Tipo Etapa', 'Millas']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [38, 50, 56], textColor: 255, fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 4 },
        columnStyles: {
            2: { halign: 'right', fontStyle: 'bold' } 
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

    printRightAligned("Millas Totales:", `${totalMillasAjustadas.toFixed(2)} mi`, sumY, true); sumY += 8;
    
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
    } else { sumY += 4; }

    doc.setFontSize(16);
    doc.setTextColor(46, 125, 50); 
    printRightAligned("TOTAL A PAGAR:", `$${isNaN(totalPagar) ? "0.00" : totalPagar.toFixed(2)}`, sumY, true);
    
    doc.save(`Ticket_Pago_${info?.trip_number || trip_id}.pdf`);
  };

  if (loading) return <Box p={5} textAlign="center"><Typography>Cargando información del ticket...</Typography></Box>;

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      
      <TicketHeader 
        onBack={() => navigate(`/paymentDrivers`)} 
        onPrint={handlePrint} 
        onAuthorize={AutorizarPago} 
      />

      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3} pb={2} borderBottom="1px solid #eee">
            <Box>
                <Typography variant="h4" fontWeight={800} color="primary.main">Ticket de Pago</Typography>
                <Typography variant="body2" color="text.secondary">ID Transacción: {trip_id}</Typography>
            </Box>
            <Box textAlign="right">
                <Chip icon={<RouteIcon />} label={`Trip #${info.trip_number}`} color="primary" variant="outlined" sx={{ fontWeight: 'bold', fontSize: '1rem', px: 1 }} />
            </Box>
        </Stack>

        <TicketInfoCards 
            driverName={info.driver_name} 
            unidad={info.unidad} 
            customRate={customRate} 
            setCustomRate={setCustomRate} 
        />

        <TicketStagesTable 
            stages={stages} 
            ajustes={ajustes} 
            handleAjuste={handleAjuste} 
            getDestino={getDestino} 
        />

        <Divider sx={{ mb: 4 }} />

        <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
                <TicketDeductions 
                    avances={avances}
                    handleAvanceChange={handleAvanceChange}
                    visibleAdvances={visibleAdvances}
                    addNextAdvance={addNextAdvance}
                    removeAdvance={removeAdvance}
                    gastos={gastos}
                    setGastos={setGastos}
                    setOpenGastosModal={setOpenGastosModal}
                />
            </Grid>

            <Grid item xs={12} md={6}>
                <Grid container spacing={3}> 

                    <Grid item xs={12} sm={6}>
                        <TicketSummary 
                            totalMillasAjustadas={totalMillasAjustadas}
                            customRate={customRate}
                            gastos={gastos}
                            totalAvances={totalAvances}
                            totalPagar={totalPagar}
                        />
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                        <Paper 
                            elevation={0} 
                            sx={{ 
                                p: 2, 
                                height: '100%', 
                                bgcolor: '#f8f9fa', 
                                border: '1px dashed #cfd8dc', 
                                borderRadius: 2,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <Typography 
                                variant="caption" 
                                fontWeight={700} 
                                color="primary.main" 
                                gutterBottom 
                                sx={{ textTransform: 'uppercase', mb: 1.5, display: 'block' }}
                            >
                                Notas / Comentarios Internos
                            </Typography>
                            
                            <TextField
                                fullWidth
                                multiline
                                minRows={6} 
                                placeholder="Escriba sus comentarios"
                                value={comentarios}
                                onChange={(e) => setComentarios(e.target.value)}
                                variant="outlined"
                                sx={{ 
                                    flexGrow: 1, 
                                    bgcolor: '#fff',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 1.5,
                                    }
                                }}
                            />
                        </Paper>
                    </Grid>
                    
                </Grid>
            </Grid>
        </Grid>
      </Paper>

      {openGastosModal && (
        <GastosModal open={openGastosModal} onClose={() => setOpenGastosModal(false)} tripId={trip_id} />
      )}
    </Box>
  );
};

export default TicketPayment;