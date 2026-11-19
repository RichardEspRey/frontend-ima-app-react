import React from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Box, Typography, Tooltip, IconButton, LinearProgress, Chip, Button, Stack, Badge,
} from "@mui/material";

import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import {
  HEADER_ROW_SX, HEADER_CELL_SX, TABLE_CONTAINER_SX, CELL_STRONG_SX,
  GHOST_BTN_SX, DARK_BTN_SX, ICON_BTN_SX, CHIP_DANGER_SX,
} from '../../shared/ui/estilos';

const numberFmt = (n) => new Intl.NumberFormat('en-US').format(Number(n).toFixed(0));

const NUMERO_SX = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };

const BOTON_FILA_SX = { ...GHOST_BTN_SX, px: 1.5, py: 0.4, fontSize: '0.78rem' };

const REINICIAR_SX = { ...DARK_BTN_SX, px: 1.5, py: 0.4, fontSize: '0.78rem' };

const REINICIAR_CRITICO_SX = {
  ...REINICIAR_SX, bgcolor: '#b91c1c', '&:hover': { bgcolor: '#991b1b', boxShadow: '0 6px 16px rgba(185,28,28,0.25)' },
};

const ICONO_SX = { ...ICON_BTN_SX, borderRadius: 2 };

/**
 * Los colores de la barra y del borde según qué tan cerca está del límite.
 *
 * @param {number} value El porcentaje recorrido, de 0 a 100.
 * @returns {{barra: string, acento: string}} Los colores.
 */
const progreso = (value) => {
    if (value >= 100) return { barra: '#ef4444', acento: '#ef4444' };
    if (value >= 80) return { barra: '#f59e0b', acento: '#f59e0b' };
    return { barra: '#22c55e', acento: '#cbd5e1' };
};

/**
 * La tabla de estatus de afinación de la flota: millas contra límite, la última
 * captura del operador y las acciones de cada camión.
 *
 * @param {object} props Propiedades del componente.
 * @param {Array.<object>} props.trucksStatus Los camiones con su estatus.
 * @param {Function} props.onOpenModal Abre un diálogo: recibe el tipo y el camión.
 * @returns {object} La tabla renderizada.
 */
export const AfinacionesTable = ({ trucksStatus, onOpenModal }) => {
    return (
        <TableContainer component={Paper} elevation={0} sx={TABLE_CONTAINER_SX}>
            <style>
                {`
                @keyframes pulse-ring {
                    0% { transform: scale(0.8); opacity: 0.5; }
                    50% { transform: scale(1.2); opacity: 1; }
                    100% { transform: scale(0.8); opacity: 0.5; }
                }
                `}
            </style>
            <Table size="small" sx={{ minWidth: 1000 }}>
                <TableHead>
                    <TableRow sx={HEADER_ROW_SX}>
                        <TableCell sx={HEADER_CELL_SX}>Camión</TableCell>
                        <TableCell sx={{ ...HEADER_CELL_SX, width: '35%' }}>Millas vs límite</TableCell>
                        <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Captura del operador</TableCell>
                        <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Historial</TableCell>
                        <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Reiniciar</TableCell>
                        <TableCell sx={{ ...HEADER_CELL_SX, textAlign: 'center' }}>Ajuste</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {trucksStatus.map((truck) => {
                        const millas = Number(truck.millas_acumuladas);
                        const limite = Number(truck.limite_afinacion) || 15000;
                        const progress = Math.min((millas / limite) * 100, 100);
                        const isCritical = millas >= limite;
                        const alarmaActiva = truck.requiere_actualizacion == 1;
                        const color = progreso(progress);

                        return (
                            <TableRow key={truck.truck_id} hover sx={{ bgcolor: alarmaActiva ? '#fef2f2' : 'inherit' }}>
                                <TableCell sx={{ borderLeft: `3px solid ${color.acento}`, pl: 2 }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography variant="body1" sx={{ ...CELL_STRONG_SX, fontWeight: 700 }}>{truck.unidad}</Typography>
                                        {alarmaActiva && (
                                            <Tooltip title="Actualización manual pendiente">
                                                <NotificationsActiveIcon sx={{ fontSize: 18, color: '#ef4444', animation: 'pulse-ring 2s infinite' }} />
                                            </Tooltip>
                                        )}
                                    </Stack>
                                </TableCell>

                                <TableCell>
                                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                                        <Typography variant="body2" fontWeight={600} color="#0f172a" sx={NUMERO_SX}>
                                            {numberFmt(millas)} <Typography component="span" variant="body2" color="#94a3b8">/ {numberFmt(limite)} mi</Typography>
                                        </Typography>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            {isCritical && <Chip size="small" label="Requiere mantenimiento" sx={CHIP_DANGER_SX} />}
                                            <Tooltip title="Cambiar límite de afinación">
                                                <IconButton size="small" onClick={() => onOpenModal('limit', truck)} sx={{ p: 0.5, color: '#94a3b8' }}>
                                                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={progress}
                                            sx={{ flex: 1, height: 8, borderRadius: 4, bgcolor: '#f1f5f9', '& .MuiLinearProgress-bar': { bgcolor: color.barra, borderRadius: 4 } }}
                                        />
                                        <Typography variant="caption" color="#64748b" sx={{ minWidth: 34, textAlign: 'right', ...NUMERO_SX }}>
                                            {progress.toFixed(0)}%
                                        </Typography>
                                    </Stack>
                                </TableCell>

                                <TableCell align="center">
                                    <Box sx={{ px: 1.5, py: 1, border: `1px ${alarmaActiva ? 'solid #fecaca' : 'dashed #e2e8f0'}`, borderRadius: 2, display: 'inline-block', bgcolor: alarmaActiva ? '#fff' : 'transparent', minWidth: 140 }}>
                                        <Typography variant="caption" sx={{ display: 'block', color: alarmaActiva ? '#b91c1c' : '#94a3b8', fontWeight: 700 }}>
                                            {alarmaActiva ? 'Nueva captura' : 'Última captura'}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={700} color="#0f172a" sx={NUMERO_SX}>
                                            {truck.ultimo_odometro_registrado ? `${numberFmt(truck.ultimo_odometro_registrado)} mi` : '—'}
                                        </Typography>
                                        <Stack direction="row" spacing={1} mt={0.75} justifyContent="center">
                                            <Tooltip title="Ver foto del tablero">
                                                <span>
                                                    <IconButton size="small" onClick={() => onOpenModal('photo', truck.ticket_url)} disabled={!truck.ticket_url} sx={ICONO_SX}>
                                                        <Badge color="error" variant="dot" invisible={!alarmaActiva}>
                                                            <PhotoCameraOutlinedIcon sx={{ fontSize: 16 }} />
                                                        </Badge>
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip title="Corregir error de dedo">
                                                <IconButton size="small" onClick={() => onOpenModal('correct', truck)} sx={ICONO_SX}>
                                                    <EditOutlinedIcon sx={{ fontSize: 16 }} />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </Box>
                                </TableCell>

                                <TableCell align="center">
                                    <Button variant="outlined" size="small" startIcon={<FormatListBulletedIcon sx={{ fontSize: 16 }} />} onClick={() => onOpenModal('history', truck)} sx={BOTON_FILA_SX}>
                                        Ver 15
                                    </Button>
                                </TableCell>

                                <TableCell align="center">
                                    <Button variant="contained" size="small" startIcon={<RefreshIcon sx={{ fontSize: 16 }} />} onClick={() => onOpenModal('reset', truck)} sx={isCritical ? REINICIAR_CRITICO_SX : REINICIAR_SX}>
                                        Reiniciar
                                    </Button>
                                </TableCell>

                                <TableCell align="center">
                                    <Tooltip title="Ajuste manual de millas">
                                        <IconButton size="small" onClick={() => onOpenModal('manual', truck)} sx={{ ...ICONO_SX, ...(alarmaActiva ? { color: '#b91c1c', borderColor: '#fecaca' } : {}) }}>
                                            <Badge color="error" variant="dot" invisible={!alarmaActiva}>
                                                <SettingsOutlinedIcon sx={{ fontSize: 18 }} />
                                            </Badge>
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                    {trucksStatus.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                                <Typography variant="body2" color="#94a3b8">No hay camiones activos.</Typography>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
