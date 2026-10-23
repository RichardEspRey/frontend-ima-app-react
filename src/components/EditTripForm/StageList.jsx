import { useEffect, useState } from 'react';
import { Typography, Stack, Button } from '@mui/material';
import StageCard from '../trip-form/StageCard'; 

const StageList = ({
    etapas, handleStageChange, eliminarEtapa, agregarParadaEnRuta, eliminarParadaEnRuta,
    handleStopChange, abrirModal, isFormDisabled, options, creators, loadingStates, apiHost, agregarNuevaEtapa, handleOpenInvoiceModal
}) => {
    const [origenes, setOrigenes] = useState([]);

    useEffect(() => {
        const fd = new FormData();
        fd.append('op', 'get_origenes');
        fetch(`${apiHost}/new_tripsv2.php`, { method: 'POST', body: fd })
            .then((res) => res.json())
            .then((data) => { if (data.status === 'success') setOrigenes(data.data); })
            .catch((err) => console.error('Error cargando orígenes:', err));
    }, [apiHost]);

    return (
        <>
            <Typography variant="h6" sx={{ mb: 2, mt: 4, fontWeight: 600 }}>Itinerario (Etapas)</Typography>

            {etapas.map((etapa, idx) => (
                <StageCard
                    key={etapa.trip_stage_id || `new-stage-${idx}`}
                    etapa={etapa}
                    index={idx}
                    handleStageChange={handleStageChange}
                    eliminarEtapa={eliminarEtapa}
                    agregarParadaEnRuta={agregarParadaEnRuta}
                    eliminarParadaEnRuta={eliminarParadaEnRuta}
                    handleStopChange={handleStopChange}
                    abrirModal={abrirModal}
                    isFormDisabled={isFormDisabled}
                    options={options}
                    creators={creators}
                    loadingStates={loadingStates}
                    apiHost={apiHost}
                    handleOpenInvoiceModal={handleOpenInvoiceModal}
                    origenes={origenes}
                />
            ))}

            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                <Button variant="contained" color="warning" onClick={() => agregarNuevaEtapa('borderCrossing')}>+ Cruce Fronterizo</Button>
                <Button variant="contained" color="primary" onClick={() => agregarNuevaEtapa('normalTrip')}>+ Viaje Normal</Button>
                <Button variant="contained" color="secondary" onClick={() => agregarNuevaEtapa('emptyMileage')}>+ Etapa Vacía</Button>
            </Stack>
        </>
    );
};

export default StageList;