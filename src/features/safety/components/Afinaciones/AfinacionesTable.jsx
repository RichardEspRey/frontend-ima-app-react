import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Box, Typography, Tooltip, IconButton, LinearProgress, Chip, Button, Stack
} from "@mui/material";

import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings'; 
import EditIcon from '@mui/icons-material/Edit'; 
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

const numberFmt = (n) => new Intl.NumberFormat('en-US').format(Number(n).toFixed(0));

const getProgressColor = (value) => {
    if (value >= 100) return 'error';
    if (value >= 80) return 'warning';
    return 'success';
};

export const AfinacionesTable = ({ trucksStatus, onOpenModal }) => {
    return (
        <TableContainer>
            <Table>
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                    <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Camión</TableCell>
                        <TableCell sx={{ fontWeight: 700, width: '35%' }}>Estado (Millas vs Límite)</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Auditoría (App)</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Historial (15)</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Reiniciar</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Ajustes</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {trucksStatus.map((truck) => {
                        const millas = Number(truck.millas_acumuladas);
                        const limite = Number(truck.limite_afinacion) || 15000;
                        const progress = Math.min((millas / limite) * 100, 100);
                        const isCritical = millas >= limite;

                        return (
                            <TableRow key={truck.truck_id} hover>
                                <TableCell>
                                    <Typography fontWeight={700} variant="h6">{truck.unidad}</Typography>
                                </TableCell>
                                
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                        <Typography variant="body1" fontWeight={600}>
                                            {numberFmt(millas)} / {numberFmt(limite)} mi
                                        </Typography>
                                        <Tooltip title="Cambiar límite de afinación">
                                            <IconButton size="small" onClick={() => onOpenModal('limit', truck)} sx={{ ml: 1, p: 0.5 }}>
                                                <EditIcon fontSize="small" color="action" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                    
                                    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                                        <Box sx={{ width: '100%', mr: 1 }}>
                                            <LinearProgress variant="determinate" value={progress} color={getProgressColor(progress)} sx={{ height: 10, borderRadius: 5 }} />
                                        </Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ minWidth: 35 }}>
                                            {progress.toFixed(0)}%
                                        </Typography>
                                    </Box>
                                    {isCritical && <Chip label="¡Requiere Mantenimiento!" color="error" size="small" sx={{ fontWeight: 'bold', mt: 0.5 }} />}
                                </TableCell>

                                <TableCell align="center">
                                    <Box sx={{ p: 1, border: '1px dashed #ccc', borderRadius: 2, display: 'inline-block' }}>
                                        <Typography variant="caption" color="text.secondary">Captura chofer:</Typography>
                                        <Typography variant="body1" fontWeight={700}>
                                            {truck.ultimo_odometro_registrado ? `${numberFmt(truck.ultimo_odometro_registrado)} mi` : 'N/A'}
                                        </Typography>
                                        <Stack direction="row" spacing={1} mt={0.5} justifyContent="center">
                                            <Tooltip title="Ver Foto del Tablero">
                                                <span>
                                                    <IconButton size="small" color="info" onClick={() => onOpenModal('photo', truck)} disabled={!truck.ticket_url}>
                                                        <PhotoCameraIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Corregir Error de Dedo">
                                                <IconButton size="small" color="warning" onClick={() => onOpenModal('correct', truck)}>
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Box>
                                </TableCell>

                                <TableCell align="center">
                                    <Button variant="outlined" size="small" startIcon={<FormatListBulletedIcon />} onClick={() => onOpenModal('history', truck)} sx={{ textTransform: 'none', borderRadius: 2 }}>
                                        Ver 15
                                    </Button>
                                </TableCell>
                                
                                <TableCell align="center">
                                    <Button variant="contained" color={isCritical ? "error" : "primary"} startIcon={<RefreshIcon />} onClick={() => onOpenModal('reset', truck)} sx={{ textTransform: 'none', borderRadius: 2 }} size="small">
                                        Reiniciar
                                    </Button>
                                </TableCell>
                                
                                <TableCell align="center">
                                    <Tooltip title="Ajuste Manual de Millas">
                                        <IconButton onClick={() => onOpenModal('manual', truck)} color="default">
                                            <SettingsIcon />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {trucksStatus.length === 0 && (
                        <TableRow><TableCell colSpan={6} align="center">No hay camiones activos</TableCell></TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};