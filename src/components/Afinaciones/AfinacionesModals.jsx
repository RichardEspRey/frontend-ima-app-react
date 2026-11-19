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
} from '../../shared/ui/estilos';

const numberFmt = (n) => new Intl.NumberFormat('en-US').format(Number(n).toFixed(0));

const NUMERO_SX = { fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' };

const CAMPO_SX = { mt: 2, bgcolor: '#fff' };

/**
 * El marco común de los diálogos de afinaciones.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.open Si está abierto.
 * @param {Function} props.onClose Al cerrar.
 * @param {string} props.titulo El título.
 * @param {(string|null)} [props.subtitulo] La unidad, debajo del título.
 * @param {string} [props.maxWidth] El ancho máximo.
 * @param {object} [props.contenidoSx] Estilos extra del contenido.
 * @param {object} props.acciones Los botones de abajo.
 * @param {object} props.children El contenido.
 * @returns {object} El diálogo.
 */
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

/**
 * Cancelar y confirmar, con el indicador mientras guarda.
 *
 * @param {object} props Propiedades del componente.
 * @param {Function} props.onClose Al cancelar.
 * @param {Function} props.onConfirm Al confirmar.
 * @param {boolean} props.saving Si está guardando.
 * @param {object} props.icono El ícono del botón de confirmar.
 * @param {string} props.texto El texto del botón de confirmar.
 * @returns {object} Los dos botones.
 */
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

/**
 * Reinicia el contador de millas guardando el % de aceite restante.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.open Si está abierto.
 * @param {Function} props.onClose Al cerrar.
 * @param {Function} props.onConfirm Recibe el % de aceite.
 * @param {boolean} props.saving Si está guardando.
 * @param {object} props.truck El camión.
 * @returns {object} El diálogo.
 */
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

/**
 * Ajusta a mano el odómetro de la última afinación.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.open Si está abierto.
 * @param {Function} props.onClose Al cerrar.
 * @param {Function} props.onConfirm Recibe el odómetro.
 * @param {boolean} props.saving Si está guardando.
 * @param {object} props.truck El camión.
 * @returns {object} El diálogo.
 */
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

/**
 * Cambia cada cuántas millas toca afinación.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.open Si está abierto.
 * @param {Function} props.onClose Al cerrar.
 * @param {Function} props.onConfirm Recibe el límite.
 * @param {boolean} props.saving Si está guardando.
 * @param {object} props.truck El camión.
 * @returns {object} El diálogo.
 */
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

/**
 * Corrige un odómetro mal capturado por el operador.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.open Si está abierto.
 * @param {Function} props.onClose Al cerrar.
 * @param {Function} props.onConfirm Recibe el odómetro correcto.
 * @param {boolean} props.saving Si está guardando.
 * @param {object} props.truck El camión o el registro a corregir.
 * @returns {object} El diálogo.
 */
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

/**
 * Los últimos 15 registros de diesel del camión, con foto y corrección.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.open Si está abierto.
 * @param {Function} props.onClose Al cerrar.
 * @param {object} props.truck El camión con `ultimos_registros`.
 * @param {Function} props.onOpenPhoto Abre la foto de un registro.
 * @param {Function} props.onOpenCorrect Abre la corrección de un registro.
 * @returns {object} El diálogo.
 */
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

/**
 * La dirección completa de la foto del tablero.
 *
 * @param {(string|object|null)} photoUrl La ruta o un objeto con `ticket_url`.
 * @returns {(string|null)} La dirección, o nada si no hay foto.
 */
const resolvePhotoUrl = (photoUrl) => {
    if (!photoUrl) return null;
    const url = typeof photoUrl === 'string' ? photoUrl : photoUrl?.ticket_url;
    if (!url || typeof url !== 'string') return null;
    return url.startsWith('http') ? url : `http://imaexpressllc.com/API/${url}`;
};

/**
 * La foto del tablero.
 *
 * @param {object} props Propiedades del componente.
 * @param {boolean} props.open Si está abierto.
 * @param {Function} props.onClose Al cerrar.
 * @param {(string|object|null)} props.photoUrl La foto.
 * @returns {object} El diálogo.
 */
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
