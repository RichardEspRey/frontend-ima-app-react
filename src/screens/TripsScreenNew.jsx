import{ useState, useCallback } from "react";
import { Box, Typography, Paper, TextField, Stack, Button, Tabs, Tab } from '@mui/material'; 

import BorderCrossingFormNew from '../components/BorderCrossingFormNew';
import TripFormNew from '../components/TripFormNew';

const TripScreenNew = () => {
  const [activeForm, setActiveForm] = useState(0); // 0 = Border Crossing, 1 = Trip
  const [tripNumber, setTripNumber] = useState('');
  
  // 1. Añade el estado para la key
  const [formKey, setFormKey] = useState(1);

  // Mapeamos el índice de la Tab al nombre del formulario (para pasar las props)
  const formMap = { 0: 'borderCrossing', 1: 'trip' };


  // ** HANDLERS DE ESTADO **
  
  // Handler para cambiar la pestaña
  const handleChangeTab = (event, newValue) => {
    setActiveForm(newValue);
  };
  
  const handleTripNumberChange = (event) => {
    setTripNumber(event.target.value);
  };

  // ** HANDLER DE ÉXITO (Lógica central de reinicio) **
  const handleFormSuccess = useCallback(() => {
    console.log("El formulario hijo guardó con éxito. Reiniciando desde el padre.");
    
    // 1. Limpia el campo de tripNumber en este componente (el padre)
    setTripNumber('');
    
    // 2. Cambia la key. Esto fuerza a React a desmontar y volver a montar el
    // componente hijo, reseteando todo su estado interno.
    setFormKey(prevKey => prevKey + 1);
  }, []); // Usamos useCallback para estabilizar la función


  return (
    <Box sx={{ p: 3 }}>
        
        {/* Título Principal */}
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
            Alta de Viajes / Etapas
        </Typography>

        {/* Contenedor Superior (Input de Trip Number y Tabs) */}
        <Paper elevation={1} sx={{ p: 3, mb: 3, border: '1px solid #ccc' }}>

            <Stack direction="row" spacing={4} alignItems="center">
                
                {/* Input de Trip Number (Estandarizado con TextField) */}
                <Box sx={{ minWidth: 300 }}>
                    <TextField
                        label="Trip Number"
                        placeholder="Enter trip number: 2025-01"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={tripNumber}
                        id='trip_number'
                        onChange={handleTripNumberChange}
                    />
                </Box>

                {/* Tabs de Selección de Formulario */}
                <Tabs 
                    value={activeForm} 
                    onChange={handleChangeTab} 
                    aria-label="Formulario Activo"
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab label="Border Crossing" id="tab-0" aria-controls="panel-0" />
                    <Tab label="Trip / Other Stage" id="tab-1" aria-controls="panel-1" />
                </Tabs>
                
            </Stack>
        </Paper>

        {/* Contenedor del Formulario Activo */}
        <Paper elevation={1} sx={{ p: 3, border: '1px solid #ccc' }}>
            <Box>
                {activeForm === 0 && (
                    <BorderCrossingFormNew
                        // Usamos la key para forzar el reseteo
                        key={formKey} 
                        tripNumber={tripNumber}
                        onSuccess={handleFormSuccess}
                    />
                )}
                {activeForm === 1 && (
                    <TripFormNew
                        // Usamos una key diferente para que no colisione
                        key={formKey + 1000} 
                        tripNumber={tripNumber}
                        onSuccess={handleFormSuccess} 
                    />
                )}
            </Box>
        </Paper>
    </Box>
  );
};

export default TripScreenNew;