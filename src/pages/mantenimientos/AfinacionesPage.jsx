import React, { useEffect, useState, useCallback } from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import HistoryIcon from '@mui/icons-material/History';
import { useNavigate } from "react-router-dom"; 

import { AfinacionesTable } from "../../components/Afinaciones/AfinacionesTable";
import { 
    ResetModal, ManualUpdateModal, LimitModal, 
    CorrectOdometerModal, HistoryModal, PhotoModal 
} from "../../components/Afinaciones/AfinacionesModals";
import { GHOST_BTN_SX, PAGE_SHELL_SX, PageHeader, notify } from "../../shared/ui";

const apiHost = import.meta.env.VITE_API_HOST;

/**
 * Estado de afinación de la flota.
 *
 * Muestra cuántas millas lleva cada camión desde su última afinación y permite
 * registrarla, cambiar el límite de millas o corregir una lectura de odómetro
 * mal capturada.
 *
 * @returns {object} La pantalla.
 */
export default function AfinacionesPage() {
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

  const handleApiRequest = async (op, dataPayload, successMessage) => {
    setSaving(true);
    try {
        const fd = new FormData();
        fd.append('op', op);
        Object.entries(dataPayload).forEach(([k, v]) => fd.append(k, v));

        const res = await fetch(`${apiHost}/afinaciones.php`, { method: 'POST', body: fd });
        const json = await res.json();

        if (json.status === 'success') {
            notify.exito(successMessage, 'Éxito');
            closeModal();
            fetchData();
        } else {
            notify.error(json.message, 'Error');
        }
    } catch (e) {
        notify.error(e.message, 'Error');
    } finally {
        setSaving(false);
    }
  };

  const onConfirmReset = (oilPercentage) => {
      if (!oilPercentage || isNaN(oilPercentage) || oilPercentage < 0 || oilPercentage > 100) return notify.aviso('Porcentaje inválido (0-100)', 'Atención');
      handleApiRequest('reset_counter', { truck_id: modalConfig.truck.truck_id, millas_acumuladas: modalConfig.truck.millas_acumuladas, porcentaje_aceite: oilPercentage }, 'El contador se ha reiniciado.');
  };

  const onConfirmManual = (manualMiles) => {
      if (manualMiles === '' || isNaN(manualMiles) || manualMiles < 0) return notify.aviso('Ingresa un millaje válido', 'Atención');
      handleApiRequest('update_manual_mileage', { truck_id: modalConfig.truck.truck_id, nuevo_total: manualMiles }, 'Millas actualizadas.');
  };

  const onConfirmLimit = (newLimit) => {
      if (!newLimit || isNaN(newLimit) || newLimit <= 0) return notify.aviso('Ingresa un límite válido mayor a 0', 'Error');
      handleApiRequest('update_limit', { truck_id: modalConfig.truck.truck_id, nuevo_limite: newLimit }, 'Nuevo límite establecido.');
  };

  const onConfirmCorrection = (correctMiles) => {
      if (!correctMiles || isNaN(correctMiles) || correctMiles < 0) return notify.aviso('Ingresa un odómetro válido', 'Error');
      if (!modalConfig.truck.id_diesel) return notify.aviso('No hay registros para este camión aún.', 'Info');
      handleApiRequest('correct_odometer', { diesel_id: modalConfig.truck.id_diesel, nuevo_odometro: correctMiles }, 'Odómetro corregido.');
  };

  if (loading && trucksStatus.length === 0) {
    return (
      <Box sx={{ ...PAGE_SHELL_SX, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  return (
    <Box sx={PAGE_SHELL_SX}>
      <PageHeader
        seccion="Mantenimiento · Afinaciones"
        titulo="Control de Afinaciones"
        descripcion="Estatus actual de la flota: cambio de aceite y mantenimiento preventivo."
        acciones={
          <Button variant="outlined" startIcon={<HistoryIcon />} onClick={() => navigate('/registros-afinaciones')} sx={GHOST_BTN_SX}>
            Ver Historial
          </Button>
        }
      />

      <AfinacionesTable trucksStatus={trucksStatus} onOpenModal={openModal} />

      <ResetModal open={modalConfig.type === 'reset'} onClose={closeModal} onConfirm={onConfirmReset} saving={saving} truck={modalConfig.truck} />

      <ManualUpdateModal open={modalConfig.type === 'manual'} onClose={closeModal} onConfirm={onConfirmManual} saving={saving} truck={modalConfig.truck} />

      <LimitModal open={modalConfig.type === 'limit'} onClose={closeModal} onConfirm={onConfirmLimit} saving={saving} truck={modalConfig.truck} />
      
      <CorrectOdometerModal open={modalConfig.type === 'correct'} onClose={closeModal} onConfirm={onConfirmCorrection} saving={saving} truck={modalConfig.truck} />
      
      <HistoryModal 
          open={modalConfig.type === 'history'} 
          onClose={closeModal} 
          truck={modalConfig.truck} 
          onOpenPhoto={(url) => openModal('photo', url)}
          onOpenCorrect={(truckData) => openModal('correct', truckData)} 
      />
      <PhotoModal open={modalConfig.type === 'photo'} onClose={closeModal} photoUrl={modalConfig.type === 'photo' ? modalConfig.truck : null} />

    </Box>
  );
}