// src/components/InspeccionRow.jsx (Nuevo Archivo)
import React from 'react';
import {
    Button, TableCell, TableRow, IconButton, Collapse, Box, Typography, CircularProgress, Chip, Grid, Divider
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';

function Categoria({ titulo, items = [] }) {
  return (
    <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 1, bgcolor: '#f9f9f9' }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 1, fontSize: '1.05rem' }}>{titulo} ({items.length})</Typography>
      {items.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Sin registros.</Typography>
      ) : (
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {items.map((it) => (
            <li key={it.id}>
              <Typography variant="body2" fontWeight={500}>
                {it.contenido || '—'}
                {it.fecha && <em style={{ opacity: 0.7, marginLeft: '8px', fontSize: '0.9em' }}> — {it.fecha}</em>}
              </Typography>
            </li>
          ))}
        </ul>
      )}
    </Box>
  );
}


export const InspeccionRow = ({ row, abierto, loading, error, det, toggleOpen, handleFinalizar }) => {
    const viajeId = row.viaje_id;
    const completed = Number(row.status) === 1;

    // Colores para el chip de estado
    const statusColor = completed ? 'success' : 'warning';
    const statusLabel = completed ? 'Completado' : 'Pendiente';

    return (
        <React.Fragment>
            {/* Fila Resumen Principal */}
            <TableRow hover>
                <TableCell>
                    <IconButton size="small" onClick={() => toggleOpen(viajeId)}>
                        {abierto ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </TableCell>

                <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>{row.trip_number}</TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {row.driver_nombre || row.nombre || '-'}
                </TableCell>
                <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {row.truck_unidad ?? row.unidad ?? '-'}
                </TableCell>
                
                {/* Fallas/Total de Conteo */}
                <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'left', fontWeight: 500 }}>
                    <Typography component="div" fontWeight={700}>Total: {row.total_cnt ?? 0}</Typography>
                    {(row.cnt_motor || row.cnt_exterior || row.cnt_neumaticos || row.cnt_cabina || row.cnt_remolque) && (
                        <Typography variant="caption" color="text.secondary">
                            M:{row.cnt_motor||0} E:{row.cnt_exterior||0} N:{row.cnt_neumaticos||0} C:{row.cnt_cabina||0} R:{row.cnt_remolque||0}
                        </Typography>
                    )}
                </TableCell>
                
                {/* Status Chip */}
                <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <Chip label={statusLabel} color={statusColor} size="small" sx={{ fontWeight: 600 }} />
                </TableCell>
                
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                    {row.ultimo_driver || row.driver_nombre || '-'}
                </TableCell>
                
                {/* Acciones */}
                <TableCell sx={{ whiteSpace: 'nowrap', textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleFinalizar(viajeId)}
                        disabled={completed}
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
                            <Divider sx={{ mb: 2 }} />
                            {loading && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CircularProgress size={20} /> <Typography>Cargando detalle…</Typography>
                                </Box>
                            )}

                            {!!error && (
                                <Typography color="error" sx={{ mb: 1 }}>Error al cargar: {error}</Typography>
                            )}

                            {det && !loading && !error && (
                                <Grid container spacing={2}> 
                                    <Grid item xs={12} sm={6}><Categoria titulo="Motor" items={det.motor} /></Grid>
                                    <Grid item xs={12} sm={6}><Categoria titulo="Exterior" items={det.exterior} /></Grid>
                                    <Grid item xs={12} sm={6}><Categoria titulo="Neumáticos" items={det.neumaticos} /></Grid>
                                    <Grid item xs={12} sm={6}><Categoria titulo="Cabina" items={det.cabina} /></Grid>
                                    <Grid item xs={12} sm={6}><Categoria titulo="Remolque" items={det.remolque} /></Grid>
                                </Grid>
                            )}
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};