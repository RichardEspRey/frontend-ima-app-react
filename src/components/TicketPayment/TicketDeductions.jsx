import { Typography, Stack, Box, TextField, InputAdornment, IconButton, Button, Tooltip } from "@mui/material";
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const TicketDeductions = ({ 
    avances, handleAvanceChange, visibleAdvances, addNextAdvance, removeAdvance, 
    gastos, setGastos, setOpenGastosModal 
}) => {
  return (
    <>
      <Typography variant="subtitle2" textTransform="uppercase" color="text.secondary" mb={2}>Deducciones y Gastos</Typography>
      <Stack spacing={2}>
          <Box sx={{ border: '1px dashed #ccc', p: 2, borderRadius: 1 }}>
              <Typography variant="caption" fontWeight={700} color="primary" gutterBottom>Anticipos / Avances</Typography>
              <Stack spacing={1}>
                  <TextField 
                      fullWidth size="small" label="Avance 1" type="number" 
                      value={avances.a1} onChange={(e) => handleAvanceChange('a1', e.target.value)} 
                      InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} 
                  />

                  {visibleAdvances >= 2 && (
                      <Stack direction="row" spacing={1}>
                          <TextField 
                              fullWidth size="small" label="Avance 2" type="number" 
                              value={avances.a2} onChange={(e) => handleAvanceChange('a2', e.target.value)} 
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
                              fullWidth size="small" label="Avance 3" type="number" 
                              value={avances.a3} onChange={(e) => handleAvanceChange('a3', e.target.value)} 
                              InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} 
                          />
                          <IconButton size="small" color="error" onClick={() => removeAdvance('a3', 2)}>
                              <DeleteOutlineIcon />
                          </IconButton>
                      </Stack>
                  )}

                  {visibleAdvances < 3 && (
                      <Button 
                          size="small" startIcon={<AddCircleOutlineIcon />} onClick={addNextAdvance}
                          sx={{ textTransform: 'none', justifyContent: 'flex-start', color: 'primary.main' }}
                      >
                          Agregar otro anticipo
                      </Button>
                  )}
              </Stack>
          </Box>

          <Stack direction="row" spacing={1}>
              <TextField
                  fullWidth size="small" label="Gastos de Viaje" type="number"
                  value={gastos} onChange={(e) => setGastos(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }}
              />
              <Tooltip title="Ver detalle de gastos">
                  <IconButton color="primary" onClick={() => setOpenGastosModal(true)} sx={{ border: '1px solid #ddd', borderRadius: 1 }}>
                      <ReceiptLongIcon />
                  </IconButton>
              </Tooltip>
          </Stack>
      </Stack>
    </>
  );
};

export default TicketDeductions;