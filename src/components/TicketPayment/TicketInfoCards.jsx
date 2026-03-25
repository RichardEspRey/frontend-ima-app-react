import { Grid, Card, CardContent, Stack, Typography, Box, TextField, InputAdornment } from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const TicketInfoCards = ({ driverName, unidad, customRate, setCustomRate }) => {
  return (
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
                          <Typography variant="h6" fontWeight={600}>{driverName}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                              <LocalShippingIcon color="action" fontSize="small" />
                              <Typography variant="caption" textTransform="uppercase" fontWeight={700} color="text.secondary">Unidad</Typography>
                          </Stack>
                          <Typography variant="h6" fontWeight={600}>{unidad}</Typography>
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
  );
};

export default TicketInfoCards;