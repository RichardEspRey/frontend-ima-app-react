import { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography,
    Stack, TextField, Checkbox, Autocomplete, LinearProgress, Alert,
    Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { readLoadDocument } from '../utils/documentOcr';

const STOP_WORDS = new Set(['inc', 'llc', 'co', 'corp', 'corporation', 'company', 'the', 'de', 'sa', 'cv', 'ltd']);
const tokens = (s) => (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w));

// Busca en el catálogo la opción más parecida al nombre detectado (coincidencia de palabras).
function bestMatch(name, options) {
    const a = new Set(tokens(name));
    if (!a.size) return null;
    let best = null, bestScore = 0;
    for (const opt of options || []) {
        const b = new Set(tokens(opt.label));
        if (!b.size) continue;
        const score = [...a].filter(w => b.has(w)).length / Math.max(a.size, b.size);
        if (score > bestScore) { best = opt; bestScore = score; }
    }
    return bestScore >= 0.5 ? best : null;
}

const TEXTS = {
    origin: { title: 'Cargar ORIGEN desde documento', date: 'Fecha Carga', bodega: 'Bodega Origen', city: 'Ciudad/Estado Origen', zip: 'Zip Code Origen' },
    destination: { title: 'Cargar DESTINO desde documento', date: 'Fecha Entrega', bodega: 'Bodega Destino', city: 'Ciudad/Estado Destino', zip: 'Zip Code Destino' },
};

// Para Origen se prefiere la sección de recolección (Shipper/Shed); para Destino la de entrega (Consignee).
// Si el documento solo trae una, se usa esa.
function pickRecord(result, target) {
    return target === 'destination' ? (result.delivery || result.pickup) : (result.pickup || result.delivery);
}

function buildFields(rec, warehouseOptions) {
    const field = (value) => ({ value: value || null, checked: !!value });
    const match = bestMatch(rec?.name, warehouseOptions);
    const bodega = match || (rec?.name ? { create: true, name: rec.name, label: `Crear bodega "${rec.name}"` } : null);
    return {
        warehouse: { value: bodega, checked: !!match }, // crear una bodega nueva requiere marcarlo a mano
        city: field(rec?.city ? (rec.state ? `${rec.city}, ${rec.state}` : rec.city) : ''),
        zip: field(rec?.zip),
        date: field(rec?.date),
    };
}

const FieldRow = ({ label, field, onChange, type = 'text' }) => (
    <Stack direction="row" alignItems="center" spacing={1}>
        <Checkbox size="small" checked={field.checked} onChange={e => onChange({ ...field, checked: e.target.checked })} />
        <TextField
            label={label} size="small" fullWidth type={type}
            InputLabelProps={type !== 'text' ? { shrink: true } : undefined}
            value={field.value || ''}
            onChange={e => onChange({ value: e.target.value, checked: !!e.target.value })}
        />
    </Stack>
);

/**
 * Lee una imagen/PDF y propone bodega, ciudad, zip y fecha para un lado del viaje.
 * onApply recibe { warehouse, city, zip, date } solo con los campos marcados;
 * warehouse es una opción del catálogo o { create: true, name } para crearla.
 */
const DocumentScanModal = ({ open, onClose, target = 'origin', warehouseOptions, onApply }) => {
    const [status, setStatus] = useState(null);
    const [error, setError] = useState('');
    const [result, setResult] = useState(null);
    const [fields, setFields] = useState(null);
    const inputRef = useRef(null);
    const t = TEXTS[target];

    const reset = () => { setStatus(null); setError(''); setResult(null); setFields(null); };
    const handleClose = () => { reset(); onClose(); };

    const processFile = async (file) => {
        if (!file) return;
        reset();
        setStatus({ text: 'Procesando…', progress: null });
        try {
            const res = await readLoadDocument(file, (text, progress) => setStatus({ text, progress }));
            const rec = pickRecord(res, target);
            if (!rec) setError('No se encontraron datos reconocibles. Revisa el texto detectado o intenta con una imagen más nítida.');
            setResult({ ...res, rec });
            setFields(buildFields(rec, warehouseOptions));
        } catch (e) {
            console.error(e);
            setError(e.message || 'No se pudo leer el documento.');
        } finally {
            setStatus(null);
        }
    };

    // Permite pegar una captura de pantalla con Ctrl+V mientras el modal está abierto.
    useEffect(() => {
        if (!open) return;
        const onPaste = (e) => {
            const item = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/'));
            if (item) { e.preventDefault(); processFile(item.getAsFile()); }
        };
        window.addEventListener('paste', onPaste);
        return () => window.removeEventListener('paste', onPaste);
    }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

    const setField = (key) => (value) => setFields(f => ({ ...f, [key]: value }));

    const apply = () => {
        const values = {};
        Object.entries(fields).forEach(([key, { value, checked }]) => { if (checked && value) values[key] = value; });
        onApply(values);
        handleClose();
    };

    const warehouseChoices = fields?.warehouse.value?.create ? [fields.warehouse.value, ...(warehouseOptions || [])] : (warehouseOptions || []);
    const checkedCount = fields ? Object.values(fields).filter(f => f.checked && f.value).length : 0;

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t.title}</DialogTitle>
            <DialogContent dividers>
                <Box
                    onClick={() => !status && inputRef.current?.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); processFile(e.dataTransfer.files?.[0]); }}
                    sx={{
                        border: '2px dashed #90caf9', borderRadius: 2, p: fields ? 1.5 : 4, textAlign: 'center',
                        cursor: status ? 'default' : 'pointer', bgcolor: '#f5f9ff', mb: 2,
                    }}
                >
                    <CloudUploadIcon color="primary" sx={{ fontSize: fields ? 24 : 40 }} />
                    <Typography variant="body2">
                        {fields ? 'Subir otro documento' : 'Haz clic, arrastra una imagen/PDF o pega una captura (Ctrl+V)'}
                    </Typography>
                    <input
                        ref={inputRef} type="file" hidden accept="image/*,application/pdf"
                        onChange={e => { processFile(e.target.files?.[0]); e.target.value = ''; }}
                    />
                </Box>

                {status && (
                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>{status.text}</Typography>
                        <LinearProgress variant={status.progress == null ? 'indeterminate' : 'determinate'} value={(status.progress || 0) * 100} />
                    </Box>
                )}

                {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}

                {fields && (
                    <>
                        <Alert severity="info" sx={{ mb: 2, py: 0 }}>
                            Revisa y corrige los datos. Solo se aplican los campos marcados.
                        </Alert>
                        {result.rec?.name && (
                            <Typography variant="caption" color="text.secondary" component="div" sx={{ mb: 1.5 }}>
                                Nombre detectado: <b>{result.rec.name}</b>
                                {result.rec.time && <> · Hora: <b>{result.rec.time}</b></>}
                            </Typography>
                        )}
                        <Stack spacing={1.5}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Checkbox size="small" checked={fields.warehouse.checked} onChange={e => setField('warehouse')({ ...fields.warehouse, checked: e.target.checked })} />
                                <Autocomplete
                                    fullWidth size="small" options={warehouseChoices}
                                    value={fields.warehouse.value}
                                    isOptionEqualToValue={(o, v) => (o.create ? v.create : o.value === v.value)}
                                    onChange={(_, v) => setField('warehouse')({ value: v, checked: !!v })}
                                    renderInput={(params) => <TextField {...params} label={t.bodega} />}
                                />
                            </Stack>
                            <FieldRow label={t.city} field={fields.city} onChange={setField('city')} />
                            <FieldRow label={t.zip} field={fields.zip} onChange={setField('zip')} />
                            <FieldRow label={t.date} type="date" field={fields.date} onChange={setField('date')} />
                        </Stack>

                        <Accordion disableGutters sx={{ mt: 2 }}>
                            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="body2">Texto detectado</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Box component="pre" sx={{ m: 0, fontSize: 12, whiteSpace: 'pre-wrap', maxHeight: 240, overflow: 'auto', userSelect: 'text' }}>
                                    {result.rawText || '(vacío)'}
                                </Box>
                            </AccordionDetails>
                        </Accordion>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
                <Button variant="contained" disabled={!checkedCount} onClick={apply}>
                    Aplicar {checkedCount ? `(${checkedCount})` : ''}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DocumentScanModal;
