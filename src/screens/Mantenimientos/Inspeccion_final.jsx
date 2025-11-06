import React, { useEffect, useState, useCallback } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Box, Typography, CircularProgress, Stack 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import { InspeccionRow } from '../../components/InspeccionRow'; 


const OPS = {
  SUMMARY: 'All_CL_Final',          
  DETAIL: 'collapse_CL_Final',    
  DETAIL_TRIP_PARAM: 'trip_id',     
};

const Inspeccion_final = () => {
  const navigate = useNavigate();
  const apiHost = import.meta.env.VITE_API_HOST;

  const [rows, setRows] = useState([]);                      
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [errorSummary, setErrorSummary] = useState('');

  const [openByTrip, setOpenByTrip] = useState({});          
  const [detailsByTrip, setDetailsByTrip] = useState({});    
  const [loadingByTrip, setLoadingByTrip] = useState({});     
  const [errorByTrip, setErrorByTrip] = useState({});         

  // Helpers 
  const toFormBody = useCallback((obj) =>
    Object.entries(obj)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v ?? '')}`)
      .join('&'), []);

  const groupIfNeeded = useCallback((data) => {
    if (data.motor || data.exterior || data.neumaticos || data.cabina || data.remolque) {
        return {
          motor: data.motor || [], exterior: data.exterior || [], neumaticos: data.neumaticos || [],
          cabina: data.cabina || [], remolque: data.remolque || [],
        };
      }
      const flat = data.rows || data.row || [];
      const grouped = { motor: [], exterior: [], neumaticos: [], cabina: [], remolque: [] };
      flat.forEach((r) => {
        const cat = (r.categoria || '').toLowerCase();
        if (grouped[cat]) {
          grouped[cat].push({
            id: r.id,
            contenido: r.contenido,
            fecha: r.fecha || r.fecha_creacion || null,
          });
        }
      });
      return grouped;
  }, []);


  const fetchSummary = useCallback(async () => {
    setLoadingSummary(true);
    setErrorSummary('');
    try {
      const resp = await fetch(`${apiHost}/formularios.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: toFormBody({ op: OPS.SUMMARY }),
      });
      const data = await resp.json();
      if (data.status === 'success') {
       const list = data.rows || data.row || data.data || [];

        const normalized = list.map(r => ({
        ...r,
        status: Number(r.status),
        cnt_motor: Number(r.cnt_motor ?? 0), cnt_exterior: Number(r.cnt_exterior ?? 0), 
        cnt_neumaticos: Number(r.cnt_neumaticos ?? 0), cnt_cabina: Number(r.cnt_cabina ?? 0),
        cnt_remolque: Number(r.cnt_remolque ?? 0), total_cnt: Number(r.total_cnt ?? 0),
        }));

        setRows(normalized);
      } else {
        setErrorSummary(data.message || 'No se pudo cargar el resumen.');
      }
    } catch (e) {
      setErrorSummary('Error de red al cargar el resumen.');
    } finally {
      setLoadingSummary(false);
    }
  }, [apiHost, toFormBody]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const fetchDetail = useCallback(async (viajeId) => {
    if (detailsByTrip[viajeId]) return;
    setLoadingByTrip((p) => ({ ...p, [viajeId]: true }));
    setErrorByTrip((p) => ({ ...p, [viajeId]: '' }));
    try {
      const resp = await fetch(`${apiHost}/formularios.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: toFormBody({ op: OPS.DETAIL, [OPS.DETAIL_TRIP_PARAM]: viajeId }),
      });
      const data = await resp.json();
      if (data.status === 'success') {
        const grouped = groupIfNeeded(data);
        setDetailsByTrip((p) => ({ ...p, [viajeId]: grouped }));
      } else {
        setErrorByTrip((p) => ({ ...p, [viajeId]: data.message || 'No se pudo cargar el detalle.' }));
      }
    } catch (e) {
      setErrorByTrip((p) => ({ ...p, [viajeId]: 'Error de red al cargar el detalle.' }));
    } finally {
      setLoadingByTrip((p) => ({ ...p, [viajeId]: false }));
    }
  }, [apiHost, detailsByTrip, toFormBody, groupIfNeeded]);


  const toggleOpen = async (viajeId) => {
    const next = !openByTrip[viajeId];
    setOpenByTrip((p) => ({ ...p, [viajeId]: next }));
    if (next) await fetchDetail(viajeId);
  };

  const handleFinalizar = async (viajeId) => {
      const formDataToSend = new FormData();
      formDataToSend.append('op', 'U_CL_Final');
      formDataToSend.append('trip_id', viajeId);
      
      const { isConfirmed } = await Swal.fire({
            title: '¿Confirmar Finalización?',
            text: "Esta acción marca la inspección como finalizada.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, finalizar'
        });

      if (!isConfirmed) return;

    try {
      const response = await fetch(`${apiHost}/formularios.php`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();
    
      if (data.status === 'success') {
         Swal.fire('Éxito', 'Inspección finalizada correctamente.', 'success');
         fetchSummary();
      } else {
        Swal.fire('Error', data.message || 'No se pudo finalizar la inspección.', 'error');
      }

    } catch (error) {
      Swal.fire('Error', 'Error de conexión al finalizar.', 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Título Principal  */}
      <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
        Inspecciones de Camiones
      </Typography>

      {/* Toolbar y Estado de Carga */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Button variant="contained" onClick={fetchSummary} size="small">Refrescar</Button>
        {loadingSummary && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={20} /> <Typography variant="body2">Cargando…</Typography>
            </Box>
        )}
        {!!errorSummary && (
            <Typography color="error" sx={{ ml: 1 }}>Error: {errorSummary}</Typography>
        )}
      </Stack>

      <TableContainer component={Paper}>
        <Table stickyHeader size="small" sx={{ minWidth: 900 }} aria-label="inspecciones">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Trip number</TableCell>
              <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Driver</TableCell>
              <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Truck</TableCell>
              <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Fallas</TableCell>
              <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Último driver</TableCell>
              <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'center' }}>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => {
              const viajeId = row.viaje_id;
              const abierto = !!openByTrip[viajeId];
              const loading = !!loadingByTrip[viajeId];
              const error = errorByTrip[viajeId];
              const det = detailsByTrip[viajeId];
              
              return (
                <InspeccionRow 
                    key={viajeId} 
                    row={row} 
                    abierto={abierto} 
                    loading={loading} 
                    error={error} 
                    det={det} 
                    toggleOpen={toggleOpen} 
                    handleFinalizar={handleFinalizar} 
                />
              );
            })}
             {rows.length === 0 && !loadingSummary && (
                <TableRow>
                    <TableCell colSpan={8} align="center">
                        <Typography color="text.secondary" sx={{ py: 2 }}>No se encontraron inspecciones pendientes.</Typography>
                    </TableCell>
                </TableRow>
              )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Inspeccion_final;