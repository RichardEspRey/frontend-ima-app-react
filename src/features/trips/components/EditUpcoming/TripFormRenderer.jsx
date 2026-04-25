import { Box, Paper, Tabs, Tab, Alert } from '@mui/material';

import TripFormUSA from '../TripFormUSA'; 
import TripFormMX from '../TripFormMX'; 
import BorderCrossingFormNew2 from '../BorderCrossingFormNew2'; 

const TripFormRenderer = ({
    pais, activeForm, handleTabChange,
    formProps 
}) => {
    
    if (!pais) {
        return <Alert severity="info">Selecciona un país para comenzar.</Alert>;
    }

    return (
        <Box>
            {/* Pestañas de Navegación */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={activeForm} onChange={handleTabChange}>
                    {pais === "US" && <Tab label="Cruce Fronterizo (Transfer)" />}
                    <Tab label="Viaje Normal (Carretera)" />
                </Tabs>
            </Paper>

            {/* Lógica de Renderizado Limpia */}
            {pais === "US" && activeForm === 0 && (
                <BorderCrossingFormNew2 {...formProps} />
            )}

            {pais === "US" && activeForm === 1 && (
                <TripFormUSA {...formProps} />
            )}

            {pais === "MX" && activeForm === 0 && (
                <TripFormMX {...formProps} />
            )}
        </Box>
    );
};

export default TripFormRenderer;