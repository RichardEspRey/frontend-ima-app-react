import React, { useEffect, useState, useCallback } from "react";
import { Box, Paper, Typography, Button, CircularProgress, Stack } from "@mui/material";
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import HistoryIcon from '@mui/icons-material/History';
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom"; 

import { AfinacionesTable } from "../components/Afinaciones/AfinacionesTable";
import { 
    ResetModal, ManualUpdateModal, LimitModal, 
    CorrectOdometerModal, HistoryModal, PhotoModal 
} from "../components/Afinaciones/AfinacionesModals";

const apiHost = import.meta.env.VITE_API_HOST;

export default function Afinaciones() {
  const navigate = useNavigate(); 
  const [trucksStatus, setTrucksStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [modalConfig, setModalConfig] = useState({ type: null, truck: null });

  const closeModal = () => !saving && setModalConfig({ type: null, truck: null });
  const openModal = (type, truck) => setModalConfig({ type, truck });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const fdStatus = new FormData();
      fdStatus.append('op', 'get_maintenance_status');
      const resStatus = await fetch(`${apiHost}/afinaciones.php`, { method: 'POST', body: fdStatus });
      const jsonStatus = await resStatus.json();
      if (jsonStatus.status === 'success') setTrucksStatus(jsonStatus.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- MANEJADORES DE API ---
  const handleApiRequest = async (op, dataPayload, successMessage) => {
    setSaving(true);
    try {
        const fd = new FormData();
        fd.append('op', op);
        Object.entries(dataPayload).forEach(([k, v]) => fd.append(k, v));

        const res = await fetch(`${apiHost}/afinaciones.php`, { method: 'POST', body: fd });
        const json = await res.json();

        if (json.status === 'success') {
            Swal.fire('Éxito', successMessage, 'success');
            closeModal();
            fetchData();
        } else {
            Swal.fire('Error', json.message, 'error');
        }
    } catch (e) {
        Swal.fire('Error', e.message, 'error');
    } finally {
        setSaving(false);
    }
  };

  const onConfirmReset = (oilPercentage) => {
      if (!oilPercentage || isNaN(oilPercentage) || oilPercentage < 0 || oilPercentage > 100) return Swal.fire('Atención', 'Porcentaje inválido (0-100)', 'warning');
      handleApiRequest('reset_counter', { truck_id: modalConfig.truck.truck_id, millas_acumuladas: modalConfig.truck.millas_acumuladas, porcentaje_aceite: oilPercentage }, 'El contador se ha reiniciado.');
  };

  const onConfirmManual = (manualMiles) => {
      if (manualMiles === '' || isNaN(manualMiles) || manualMiles < 0) return Swal.fire('Atención', 'Ingresa un millaje válido', 'warning');
      handleApiRequest('update_manual_mileage', { truck_id: modalConfig.truck.truck_id, nuevo_total: manualMiles }, 'Millas actualizadas.');
  };

  const onConfirmLimit = (newLimit) => {
      if (!newLimit || isNaN(newLimit) || newLimit <= 0) return Swal.fire('Error', 'Ingresa un límite válido mayor a 0', 'warning');
      handleApiRequest('update_limit', { truck_id: modalConfig.truck.truck_id, nuevo_limite: newLimit }, 'Nuevo límite establecido.');
  };

  const onConfirmCorrection = (correctMiles) => {
      if (!correctMiles || isNaN(correctMiles) || correctMiles < 0) return Swal.fire('Error', 'Ingresa un odómetro válido', 'warning');
      if (!modalConfig.truck.id_diesel) return Swal.fire('Info', 'No hay registros para este camión aún.', 'info');
      handleApiRequest('correct_odometer', { diesel_id: modalConfig.truck.id_diesel, nuevo_odometro: correctMiles }, 'Odómetro corregido.');
  };

  if (loading && trucksStatus.length === 0) return <Box p={5} display="flex" justifyContent="center"><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto' }}>
      
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}>
        <Stack direction="row" alignItems="center" spacing={2}>
            <BuildCircleIcon fontSize="large" color="primary" />
            <Box>
                <Typography variant="h4" fontWeight={800}>Control de Afinaciones</Typography>
                <Typography variant="body2" color="text.secondary">Monitoreo de cambio de aceite y mantenimiento preventivo</Typography>
            </Box>
        </Stack>
        <Button variant="outlined" startIcon={<HistoryIcon />} onClick={() => navigate('/registros-afinaciones')}>Ver Historial</Button>
      </Stack>

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden', mb: 5 }}>
        <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderBottom: '1px solid #bbdefb' }}>
            <Typography variant="h6" fontWeight={700} color="primary.main">Estatus Actual de Flota</Typography>
        </Box>
        
        <AfinacionesTable trucksStatus={trucksStatus} onOpenModal={openModal} />
      </Paper>

      <ResetModal open={modalConfig.type === 'reset'} onClose={closeModal} onConfirm={onConfirmReset} saving={saving} truck={modalConfig.truck} />

      <ManualUpdateModal open={modalConfig.type === 'manual'} onClose={closeModal} onConfirm={onConfirmManual} saving={saving} truck={modalConfig.truck} />

      <LimitModal open={modalConfig.type === 'limit'} onClose={closeModal} onConfirm={onConfirmLimit} saving={saving} truck={modalConfig.truck} />
      
      <CorrectOdometerModal open={modalConfig.type === 'correct'} onClose={closeModal} onConfirm={onConfirmCorrection} saving={saving} truck={modalConfig.truck} />
      
      <HistoryModal 
          open={modalConfig.type === 'history'} 
          onClose={closeModal} 
          truck={modalConfig.truck} 
          onOpenPhoto={(url) => openModal('photo', url)} // En este caso le pasamos la URL como data
          onOpenCorrect={(truckData) => openModal('correct', truckData)} 
      />
      <PhotoModal open={modalConfig.type === 'photo'} onClose={closeModal} photoUrl={modalConfig.truck} />

    </Box>
  );
}