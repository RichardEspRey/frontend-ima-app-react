import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Typography, TextField, InputAdornment, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, IconButton, Tooltip,
} from "@mui/material";

import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import {
  DIALOG_PAPER_SX, DIALOG_TITLE_SX, DIALOG_CONTENT_SX, DIALOG_ACTIONS_SX, SECTION_TITLE_SX,
  DARK_BTN_SX, GHOST_BTN_SX, ICON_BTN_SX, HEADER_ROW_SX, HEADER_CELL_SX, CELL_STRONG_SX, CELL_MUTED_SX,
} from '../../styles/estilosTabla';

const numberFmt = (n) => new Intl.NumberFormat('en-US').format(Number(n).toFixed(0));

const NUMERO_SX = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };

const CAMPO_SX = { mt: 2, bgcolor: '#fff' };

const Dialogo = ({ open, onClose, titulo, subtitulo, maxWidth = 'xs', contenidoSx, acciones, children }) => (
  <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth PaperProps={{ sx: DIALOG_PAPER_SX }}>
    <DialogTitle sx={DIALOG_TITLE_SX}>
      <Typography variant="h6" sx={SECTION_TITLE_SX}>{titulo}</Typography>
      {subtitulo && <Typography variant="body2" color="#64748b">{subtitulo}</Typography>}
    </DialogTitle>
    <DialogContent sx={{ ...DIALOG_CONTENT_SX, ...contenidoSx }}>{children}</DialogContent>
    <DialogActions sx={DIALOG_ACTIONS_SX}>{acciones}</DialogActions>
  </Dialog>
);

const Acciones = ({ onClose, onConfirm, saving, icono, texto }) => (
  <>
    <Button variant="outlined" onClick={onClose} disabled={saving} sx={GHOST_BTN_SX}>Cancelar</Button>
    <Button
      variant="contained"
      onClick={onConfirm}
      disabled={saving}
      startIcon={saving ? <CircularProgress size={18} color="inherit" /> : icono}
      sx={DARK_BTN_SX}
    >
      {saving ? 'Guardando...' : texto}
    </Button>
  </>
);

export const ResetModal = ({ open, onClose, onConfirm, saving, truck }) => {
    const [oil, setOil] = useState('');
    useEffect(() => { if (open) setOil(''); }, [open]);

    return (
        <Dialogo
            open={open}
            onClose={onClose}
            titulo="Reiniciar contador"
            subtitulo={truck?.unidad ? `Camión ${truck.unidad}` : null}
            acciones={<Acciones onClose={onClose} onConfirm={() => onConfirm(oil)} saving={saving} icono={<RefreshIcon />} texto="Confirmar reinicio" />}
        >
            <Typography variant="body2" color="#475569">
                Al confirmar, se guardará el registro actual de <b>{truck && numberFmt(truck.millas_acumuladas)} millas</b> y el contador volverá a cero.
            </Typography>
            <TextField autoFocus label="% Vida de Aceite Restante" type="number" fullWidth value={oil} onChange={(e) => setOil(e.target.value)} InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment>, inputProps: { min: 0, max: 100 } }} disabled={saving} sx={CAMPO_SX} />
        </Dialogo>
    );
};

export const ManualUpdateModal = ({ open, onClose, onConfirm, saving, truck }) => {
    const [miles, setMiles] = useState('');
    useEffect(() => { if (open) setMiles(truck?.odometro_base || ''); }, [open, truck]);

    return (
        <Dialogo
            open={open}
            onClose={onClose}
            titulo="Odómetro de última afinación"
            subtitulo={truck?.unidad ? `Camión ${truck.unidad}` : null}
            acciones={<Acciones onClose={onClose} onConfirm={() => onConfirm(miles)} saving={saving} icono={<SettingsIcon />} texto="Aplicar ajuste" />}
        >
            <Typography variant="body2" color="#475569">Ingresa el odómetro exacto de la última afinación.</Typography>
            <TextField autoFocus label="Odómetro Base (mi)" type="number" fullWidth value={miles} onChange={(e) => setMiles(e.target.value)} disabled={saving} sx={CAMPO_SX} />
        </Dialogo>
    );
};

export const LimitModal = ({ open, onClose, onConfirm, saving, truck }) => {
    const [limit, setLimit] = useState('');
    useEffect(() => { if (open) setLimit(truck?.limite_afinacion || 15000); }, [open, truck]);

    return (
        <Dialogo
            open={open}
            onClose={onClose}
            titulo="Configurar límite"
            subtitulo={truck?.unidad ? `Camión ${truck.unidad}` : null}
            acciones={<Acciones onClose={onClose} onConfirm={() => onConfirm(limit)} saving={saving} icono={<EditOutlinedIcon />} texto="Guardar límite" />}
        >
            <Typography variant="body2" color="#475569">Define cada cuántas millas requiere mantenimiento.</Typography>
            <TextField autoFocus label="Límite (millas)" type="number" fullWidth value={limit} onChange={(e) => setLimit(e.target.value)} InputProps={{ endAdornment: <InputAdornment position="end">mi</InputAdornment> }} disabled={saving} sx={CAMPO_SX} />
        </Dialogo>
    );
};

export const CorrectOdometerModal = ({ open, onClose, onConfirm, saving, truck }) => {
    const [correctMiles, setCorrectMiles] = useState('');
    useEffect(() => { if (open) setCorrectMiles(truck?.ultimo_odometro_registrado || truck?.odometro || ''); }, [open, truck]);

    return (
        <Dialogo
            open={open}
            onClose={onClose}
            titulo="Corregir lectura"
            subtitulo={truck?.unidad ? `Camión ${truck.unidad}` : null}
            acciones={<Acciones onClose={onClose} onConfirm={() => onConfirm(correctMiles)} saving={saving} icono={<VerifiedUserIcon />} texto="Aplicar corrección" />}
        >
            <Typography variant="body2" color="#475569">Si el operador escribió mal el odómetro, ingresa el correcto aquí.</Typography>
            <TextField autoFocus label="Odómetro Correcto (mi)" type="number" fullWidth value={correctMiles} onChange={(e) => setCorrectMiles(e.target.value)} disabled={saving} sx={CAMPO_SX} />
        </Dialogo>
    );
};

export const HistoryModal = ({ open, onClose, truck, onOpenPhoto, onOpenCorrect }) => {
    const historyRecords = truck?.ultimos_registros || [];
    return (
        <Dialogo
            open={open}
            onClose={onClose}
            maxWidth="md"
            titulo="Últimos 15 registros"
            subtitulo={truck?.unidad ? `Camión ${truck.unidad}` : null}
            contenidoSx={{ p: 0 }}
            acciones={<Button variant="outlined" onClick={onClose} sx={GHOST_BTN_SX}>Cerrar</Button>}
        >
            <Table size="small" stickyHeader>
                <TableHead>
                    <TableRow sx={HEADER_ROW_SX}>
                        <TableCell sx={{ ...HEADER_CELL_SX, bgcolor: '#fafbfc' }}>Viaje</TableCell>
                        <TableCell sx={{ ...HEADER_CELL_SX, bgcolor: '#fafbfc' }}>Fecha</TableCell>
                        <TableCell sx={{ ...HEADER_CELL_SX, bgcolor: '#fafbfc', textAlign: 'right' }}>Odómetro</TableCell>
                        <TableCell sx={{ ...HEADER_CELL_SX, bgcolor: '#fafbfc', textAlign: 'center' }}>Evidencia</TableCell>
                        <TableCell sx={{ ...HEADER_CELL_SX, bgcolor: '#fafbfc', textAlign: 'center' }}>Corregir</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody sx={{ bgcolor: '#fff' }}>
                    {historyRecords.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                <Typography variant="body2" color="#94a3b8">No hay registros recientes.</Typography>
                            </TableCell>
                        </TableRow>
                    ) : (
                        historyRecords.map(rec => (
                            <TableRow key={rec.id_diesel} hover>
                                <TableCell sx={CELL_STRONG_SX}>{rec.trip_number || '—'}</TableCell>
                                <TableCell sx={{ ...CELL_MUTED_SX, ...NUMERO_SX }}>{rec.fecha}</TableCell>
                                <TableCell align="right" sx={{ ...CELL_STRONG_SX, ...NUMERO_SX }}>{numberFmt(rec.odometro)} mi</TableCell>
                                <TableCell align="center">
                                    <Tooltip title={rec.ticket_url ? 'Ver foto' : 'Sin foto'}>
                                        <span>
                                            <IconButton size="small" onClick={() => onOpenPhoto(rec.ticket_url)} disabled={!rec.ticket_url} sx={{ ...ICON_BTN_SX, borderRadius: 2 }}>
                                                <PhotoCameraOutlinedIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </span>
                                    </Tooltip>
                                </TableCell>
                                <TableCell align="center">
                                    <Tooltip title="Corregir lectura">
                                        <IconButton size="small" onClick={() => onOpenCorrect({ unidad: truck.unidad, id_diesel: rec.id_diesel, odometro: rec.odometro })} sx={{ ...ICON_BTN_SX, borderRadius: 2 }}>
                                            <EditOutlinedIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Dialogo>
    );
};

const resolvePhotoUrl = (photoUrl) => {
    if (!photoUrl) return null;
    const url = typeof photoUrl === 'string' ? photoUrl : photoUrl?.ticket_url;
    if (!url || typeof url !== 'string') return null;
    return url.startsWith('http') ? url : `http://imaexpressllc.com/API/${url}`;
};

export const PhotoModal = ({ open, onClose, photoUrl }) => {
    const imageUrl = resolvePhotoUrl(photoUrl);
    return (
        <Dialogo
            open={open}
            onClose={onClose}
            maxWidth="sm"
            titulo="Evidencia de odómetro"
            contenidoSx={{ display: 'flex', justifyContent: 'center' }}
            acciones={<Button variant="outlined" onClick={onClose} sx={GHOST_BTN_SX}>Cerrar</Button>}
        >
            {imageUrl
                ? <img src={imageUrl} alt="Odómetro" style={{ maxWidth: '100%', maxHeight: '60vh', borderRadius: 8, border: '1px solid #e2e8f0' }} />
                : <Typography variant="body2" color="#94a3b8">No hay imagen disponible.</Typography>}
        </Dialogo>
    );
};
