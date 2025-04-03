import React from 'react';
import { TextField, Card, CardContent, Typography, Grid } from '@mui/material';

const CampoInput = ({ label, placeholder }) => (
  <div style={{ marginBottom: '15px' }}>
    <Typography variant="subtitle1" fontWeight={600}>{label}</Typography>
    <TextField 
      fullWidth
      variant="outlined"
      placeholder={placeholder}
      size="small"
    />
  </div>
);

const TripScreen = () => {
  return (
    <div style={{ padding: '20px' }}>
      
      <Card style={{ width: '35%', padding: '20px', marginBottom: '20px' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Trip Number
          </Typography>
          <TextField fullWidth variant="outlined" placeholder="Enter trip number" size="small" />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" align="center" fontWeight="bold" gutterBottom>
            Datos del Viaje
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <CampoInput label="Driver" placeholder="Conductor" />
              <CampoInput label="Trailer" placeholder="Trailer" />
              <CampoInput label="Truck" placeholder="Truck" />
            </Grid>
            <Grid item xs={6}>
              <CampoInput label="Customer" placeholder="Customer" />
              <CampoInput label="CI Number" placeholder="CI Number" />
              <CampoInput label="Invoice IMA" placeholder="Invoice IMA" />
            </Grid>
          </Grid>

          <Typography variant="h6" align="center" fontWeight="bold" gutterBottom>
            Origen/Destination
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <CampoInput label="Warehouse" placeholder="Warehouse" />
              <CampoInput label="Origin" placeholder="Origin" />
              <CampoInput label="Zip Code" placeholder="Zip Code" />
              <CampoInput label="Loading Date" placeholder="Loading Date" />
            </Grid>
            <Grid item xs={6}>
              <CampoInput label="Warehouse" placeholder="Warehouse" />
              <CampoInput label="Destination" placeholder="Destination" />
              <CampoInput label="Zip Code" placeholder="Zip Code" />
              <CampoInput label="Delivery" placeholder="Delivery" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};

export default TripScreen;
