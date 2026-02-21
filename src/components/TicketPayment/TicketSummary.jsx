import { Paper, Stack, Typography, Divider } from "@mui/material";

const TicketSummary = ({ totalMillasAjustadas, customRate, gastos, totalAvances, totalPagar }) => {
  return (
    <Paper elevation={0} sx={{ bgcolor: '#263238', color: '#fff', p: 3, borderRadius: 2, textAlign: 'right' }}>
        <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" color="rgba(255,255,255,0.7)">Millas Totales (Ajustadas):</Typography>
                <Typography variant="body1" fontWeight={600}>{totalMillasAjustadas.toFixed(2)} mi</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">Subtotal ({Number(customRate).toFixed(2)}/mi):</Typography>
                  <Typography variant="body1">${(Number(customRate) * totalMillasAjustadas).toFixed(2)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">Otros Gastos:</Typography>
                  <Typography variant="body1">+${Number(gastos).toFixed(2)}</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="rgba(255,255,255,0.7)">Total Anticipos:</Typography>
                  <Typography variant="body1" color="error.light">-${totalAvances.toFixed(2)}</Typography>
            </Stack>
            
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 1 }} />
            
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight={400}>Total a Pagar:</Typography>
                <Typography variant="h3" fontWeight={700}>${isNaN(totalPagar) ? "0.00" : totalPagar.toFixed(2)}</Typography>
            </Stack>
        </Stack>
    </Paper>
  );
};

export default TicketSummary;