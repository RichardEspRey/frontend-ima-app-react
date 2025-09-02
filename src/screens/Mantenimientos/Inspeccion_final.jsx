import React, { useEffect, useState } from 'react';
import '../css/DriverAdmin.css';
import { useNavigate } from 'react-router-dom';

import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, IconButton, Collapse, Box, Typography, CircularProgress, Chip
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

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
  const toFormBody = (obj) =>
    Object.entries(obj)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v ?? '')}`)
      .join('&');

  const groupIfNeeded = (data) => {
    // Ya viene agrupado (motor, exterior, …)
    if (data.motor || data.exterior || data.neumaticos || data.cabina || data.remolque) {
      return {
        motor: data.motor || [],
        exterior: data.exterior || [],
        neumaticos: data.neumaticos || [],
        cabina: data.cabina || [],
        remolque: data.remolque || [],
      };
    }
    // Viene plano en data.row con 'categoria'
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
  };


  const fetchSummary = async () => {
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
        cnt_motor: Number(r.cnt_motor ?? 0),
        cnt_exterior: Number(r.cnt_exterior ?? 0),
        cnt_neumaticos: Number(r.cnt_neumaticos ?? 0),
        cnt_cabina: Number(r.cnt_cabina ?? 0),
        cnt_remolque: Number(r.cnt_remolque ?? 0),
        total_cnt: Number(r.total_cnt ?? 0),
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
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // 2) Cargar detalle por viaje (lazy)
  const fetchDetail = async (viajeId) => {
    if (detailsByTrip[viajeId]) return; // cache
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
  };

  const toggleOpen = async (viajeId) => {
    const next = !openByTrip[viajeId];
    setOpenByTrip((p) => ({ ...p, [viajeId]: next }));
    if (next) await fetchDetail(viajeId);
  };

  const handleFinalizar = async (viajeId) => {
      const formDataToSend = new FormData();
      formDataToSend.append('op', 'U_CL_Final');
      formDataToSend.append('trip_id', viajeId);


    try {
      const response = await fetch(`${apiHost}/formularios.php`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();
    
      if (data.status === 'success') {
         window.location.reload();
        
      }

    } catch (error) {
      console.error('Error al obtener los conductores:', error);
    }
  };

  return (
    <div className="driver-admin">
      <h1 className="title">Inspecciones de camiones</h1>

      {loadingSummary && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={20} /> <Typography>Cargando…</Typography>
        </Box>
      )}
      {!!errorSummary && (
        <Typography color="error" sx={{ mb: 2 }}>{errorSummary}</Typography>
      )}

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 900 }} aria-label="inspecciones">
          <TableHead>
            <TableRow>
              <TableCell />{/* collapse btn */}
              <TableCell align="center" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 22 }}>Trip ID</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 22 }}>Driver</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 22 }}>Truck</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 22 }}>Fallas</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 22 }}>Status</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 22 }}>Último driver</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap', fontSize: 22 }}>Acciones</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row) => {
              const viajeId = row.viaje_id || row.trip_id || row.tripId;
              const abierto = !!openByTrip[viajeId];
              const loading = !!loadingByTrip[viajeId];
              const error = errorByTrip[viajeId];
              const det = detailsByTrip[viajeId];
              
              const completed = Number(row.status) === 1;
              return (
                <React.Fragment key={viajeId}>
                  <TableRow hover>
                    <TableCell>
                      <IconButton size="small" onClick={() => toggleOpen(viajeId)}>
                        {abierto ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                      </IconButton>
                    </TableCell>

                    <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18 }}>{viajeId}</TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18 }}>
                      {row.driver_nombre || row.nombre || '-'}
                    </TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18 }}>
                      {row.truck_unidad ?? row.unidad ?? '-'}
                    </TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18 }}>
                      Total: {row.total_cnt ?? 0}
                      {(row.cnt_motor ?? row.cnt_exterior ?? row.cnt_neumaticos ?? row.cnt_cabina ?? row.cnt_remolque) && (
                        <Typography variant="caption" component="div">
                          M:{row.cnt_motor||0} E:{row.cnt_exterior||0} N:{row.cnt_neumaticos||0} C:{row.cnt_cabina||0} R:{row.cnt_remolque||0}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18 }}>
                      <Chip
                        label={completed ? 'Completado' : 'Pendiente'}
                        color={completed ? 'success' : 'warning'}
                        size="small"
                        />
                    </TableCell>
                    <TableCell align="center" sx={{ whiteSpace: 'nowrap', fontSize: 18 }}>
                      {row.ultimo_driver || row.driver_nombre || '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="text"
                        sx={{ fontWeight: 'bold', fontSize: 16 }}
                        onClick={() => handleFinalizar(viajeId)}
                      >
                        Finalizar
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* Collapse */}
                  <TableRow>
                    <TableCell colSpan={8} sx={{ p: 0, borderBottom: 0 }}>
                      <Collapse in={abierto} timeout="auto" unmountOnExit>
                        <Box sx={{ m: 2 }}>
                          {loading && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CircularProgress size={20} /> <Typography>Cargando detalle…</Typography>
                            </Box>
                          )}

                          {!!error && (
                            <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>
                          )}

                          {det && !loading && !error && (
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(260px, 1fr))', gap: 2 }}>
                              <Categoria titulo="Motor"      items={det.motor} />
                              <Categoria titulo="Exterior"   items={det.exterior} />
                              <Categoria titulo="Neumáticos" items={det.neumaticos} />
                              <Categoria titulo="Cabina"     items={det.cabina} />
                              <Categoria titulo="Remolque"   items={det.remolque} />
                            </Box>
                          )}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

function Categoria({ titulo, items = [] }) {
  return (
    <Box sx={{ p: 2, border: '1px solid #eee', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{titulo} ({items.length})</Typography>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Sin registros.</Typography>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {items.map((it) => (
            <li key={it.id}>
              <Typography variant="body2">
                {it.contenido || '—'}
                {it.fecha && <em style={{ opacity: 0.7 }}> — {it.fecha}</em>}
              </Typography>
            </li>
          ))}
        </ul>
      )}
    </Box>
  );
}

export default Inspeccion_final;
