import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, 
  Typography, TextField, InputAdornment, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton
} from "@mui/material";

import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings'; 
import EditIcon from '@mui/icons-material/Edit'; 
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';

const numberFmt = (n) => new Intl.NumberFormat('en-US').format(Number(n).toFixed(0));

// 1. Modal de Reinicio
export const ResetModal = ({ open, onClose, onConfirm, saving, truck }) => {
    const [oil, setOil] = useState('');
    useEffect(() => { if(open) setOil(''); }, [open]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>Reiniciar Contador - {truck?.unidad}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>
                    Al confirmar, se guardará el registro actual de <b>{truck && numberFmt(truck.millas_acumuladas)} millas</b> y el contador volverá a cero.
                </Typography>
                <TextField autoFocus label="% Vida de Aceite Restante" type="number" fullWidth value={oil} onChange={(e) => setOil(e.target.value)} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment>, inputProps: { min: 0, max: 100 } }} disabled={saving} sx={{ mt: 2 }} />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={saving} color="inherit">Cancelar</Button>
                <Button onClick={() => onConfirm(oil)} variant="contained" color="primary" disabled={saving} startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <RefreshIcon />}>
                    {saving ? 'Guardando...' : 'Confirmar Reinicio'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// 2. Modal Manual
export const ManualUpdateModal = ({ open, onClose, onConfirm, saving, truck }) => {
    const [miles, setMiles] = useState('');
    useEffect(() => { if(open) setMiles(truck?.odometro_base || ''); }, [open, truck]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>Odómetro de Última Afinación - {truck?.unidad}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>Ingresa el odómetro exacto de la última afinación.</Typography>
                <TextField autoFocus label="Odómetro Base (mi)" type="number" fullWidth value={miles} onChange={(e) => setMiles(e.target.value)} disabled={saving} sx={{ mt: 2 }} />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={saving} color="inherit">Cancelar</Button>
                <Button onClick={() => onConfirm(miles)} variant="contained" color="warning" disabled={saving} startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <SettingsIcon />}>
                    Aplicar Ajuste
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// 3. Modal Límite
export const LimitModal = ({ open, onClose, onConfirm, saving, truck }) => {
    const [limit, setLimit] = useState('');
    useEffect(() => { if(open) setLimit(truck?.limite_afinacion || 15000); }, [open, truck]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>Configurar Límite - {truck?.unidad}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>Define cada cuántas millas requiere mantenimiento.</Typography>
                <TextField autoFocus label="Límite (millas)" type="number" fullWidth value={limit} onChange={(e) => setLimit(e.target.value)} InputProps={{ endAdornment: <InputAdornment position="end">mi</InputAdornment> }} disabled={saving} sx={{ mt: 2 }} />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={saving} color="inherit">Cancelar</Button>
                <Button onClick={() => onConfirm(limit)} variant="contained" color="info" disabled={saving} startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <EditIcon />}>
                    Guardar Límite
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// 4. Modal Corregir Odómetro
export const CorrectOdometerModal = ({ open, onClose, onConfirm, saving, truck }) => {
    const [correctMiles, setCorrectMiles] = useState('');
    useEffect(() => { if(open) setCorrectMiles(truck?.ultimo_odometro_registrado || truck?.odometro || ''); }, [open, truck]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>Corregir Lectura - {truck?.unidad}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" paragraph sx={{ mt: 1 }}>Si el operador escribió mal el odómetro, ingresa el correcto aquí.</Typography>
                <TextField autoFocus label="Odómetro Correcto (mi)" type="number" fullWidth value={correctMiles} onChange={(e) => setCorrectMiles(e.target.value)} disabled={saving} sx={{ mt: 2 }} />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={saving} color="inherit">Cancelar</Button>
                <Button onClick={() => onConfirm(correctMiles)} variant="contained" color="warning" disabled={saving} startIcon={saving ? <CircularProgress size={20} color="inherit"/> : <VerifiedUserIcon />}>
                    Aplicar Corrección
                </Button>
            </DialogActions>
        </Dialog>
    );
};

// 5. Modal Historial
export const HistoryModal = ({ open, onClose, truck, onOpenPhoto, onOpenCorrect }) => {
    const historyRecords = truck?.ultimos_registros || [];
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 700, bgcolor: '#f5f5f5' }}>Últimos 15 Registros - Unidad {truck?.unidad}</DialogTitle>
            <DialogContent dividers sx={{ p: 0 }}>
                <Table size="small" stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Viaje</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Odómetro</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Evidencia (Foto)</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 'bold' }}>Corregir</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {historyRecords.length === 0 ? (
                            <TableRow><TableCell colSpan={5} align="center">No hay registros recientes</TableCell></TableRow>
                        ) : (
                            historyRecords.map(rec => (
                                <TableRow key={rec.id_diesel} hover>
                                    <TableCell>{rec.trip_number || 'N/A'}</TableCell>
                                    <TableCell>{rec.fecha}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{numberFmt(rec.odometro)} mi</TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" color="info" onClick={() => onOpenPhoto(rec.ticket_url)} disabled={!rec.ticket_url}>
                                            <PhotoCameraIcon />
                                        </IconButton>
                                    </TableCell>
                                    <TableCell align="center">
                                        <IconButton size="small" color="warning" onClick={() => onOpenCorrect({ unidad: truck.unidad, id_diesel: rec.id_diesel, odometro: rec.odometro })}>
                                            <EditIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions><Button onClick={onClose} color="inherit">Cerrar</Button></DialogActions>
        </Dialog>
    );
};

// 6. Modal Foto
export const PhotoModal = ({ open, onClose, photoUrl }) => {
    const imageUrl = photoUrl?.startsWith('http') ? photoUrl : `http://imaexpressllc.com/API/${photoUrl}`;
    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>Evidencia de Odómetro</DialogTitle>
            <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                {photoUrl ? <img src={imageUrl} alt="Odómetro" style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: 8 }} /> : <Typography color="text.secondary">No hay imagen disponible.</Typography>}
            </DialogContent>
            <DialogActions><Button onClick={onClose} color="inherit">Cerrar</Button></DialogActions>
        </Dialog>
    );
};