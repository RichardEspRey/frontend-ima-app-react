import { Stack, Button } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const TicketHeader = ({ onBack, onPrint, onAuthorize }) => {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
      <Button startIcon={<ArrowBackIcon />} onClick={onBack} sx={{ color: 'text.secondary' }}>
          Volver a Pagos
      </Button>
      <Stack direction="row" spacing={2}>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={onPrint}>
              Imprimir PDF
          </Button>
          <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={onAuthorize}>
              Autorizar Pago
          </Button>
      </Stack>
    </Stack>
  );
};

export default TicketHeader;