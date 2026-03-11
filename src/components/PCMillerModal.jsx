import { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, Paper,
    CircularProgress, IconButton, Tooltip, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).href;

const apiHost = import.meta.env.VITE_API_HOST;

// ── Client-side PDF extraction — accepts File/Blob or a URL string ──────────
async function extractStateRows(source) {
    try {
        let arrayBuffer;
        if (typeof source === 'string') {
            const res = await fetch(source);
            arrayBuffer = await res.arrayBuffer();
        } else {
            arrayBuffer = await source.arrayBuffer();
        }

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const rowMap = new Map();

        for (let p = 1; p <= pdf.numPages; p++) {
            const page = await pdf.getPage(p);
            const content = await page.getTextContent();

            for (const item of content.items) {
                const text = item.str?.trim();
                if (!text) continue;
                const y = Math.round(item.transform[5]);
                let merged = false;
                for (const [ky] of rowMap) {
                    if (Math.abs(ky - y) <= 2) {
                        rowMap.get(ky).push({ text, x: item.transform[4] });
                        merged = true;
                        break;
                    }
                }
                if (!merged) rowMap.set(y, [{ text, x: item.transform[4] }]);
            }
        }

        const sortedRows = [...rowMap.entries()]
            .sort((a, b) => b[0] - a[0])
            .map(([, items]) => items.sort((a, b) => a.x - b.x));

        let inSection = false;
        const results = [];

        for (const items of sortedRows) {
            const texts = items.map(i => i.text);
            const rowStr = texts.join(' ');
            if (!inSection) {
                if (rowStr.includes('State') && rowStr.includes('Country')) inSection = true;
                continue;
            }
            const first = texts[0];
            if (/^[A-Z]{2}$/.test(first) && first !== 'US') {
                const total = texts.find(t => /^\d+(\.\d+)?$/.test(t));
                if (total) results.push({ state: first, total });
            } else if (first && results.length > 0) {
                break;
            }
        }

        return results;
    } catch (err) {
        console.error('PDF extraction error:', err);
        return [];
    }
}

// ── Component ────────────────────────────────────────────────────────────────
export const PCMillerModal = ({ open, onClose, tripId, file, filename, onSave, onDeleteSuccess }) => {
    const [pendingFile, setPendingFile] = useState(null);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const internalFileInputRef = useRef(null);

    const activeFile = pendingFile || file;
    const isServerFile = !!filename && !activeFile;
    const serverUrl = filename ? `${apiHost}/Uploads/Safety/${filename}` : null;
    const displayName = activeFile?.name || filename || '';
    const isPdf = displayName.toLowerCase().endsWith('.pdf');

    // Reset on close
    useEffect(() => {
        if (!open) {
            setPendingFile(null);
            setRows([]);
            setError(null);
            setPreviewUrl(null);
        }
    }, [open]);

    // Build preview URL and extract rows whenever source changes
    useEffect(() => {
        if (!open) return;

        const currentActiveFile = pendingFile || file;

        if (currentActiveFile) {
            // New or replacement file — blob preview
            const url = URL.createObjectURL(currentActiveFile);
            setPreviewUrl(url);
            setRows([]);
            setError(null);

            if (currentActiveFile.type === 'application/pdf' || currentActiveFile.name?.toLowerCase().endsWith('.pdf')) {
                setLoading(true);
                extractStateRows(currentActiveFile)
                    .then(result => {
                        setRows(result.length > 0 ? result : [{ state: '', total: '' }]);
                        if (result.length === 0) setError('No se extrajeron datos automáticamente. Ingréselos manualmente.');
                    })
                    .finally(() => setLoading(false));
            } else {
                setRows([{ state: '', total: '' }]);
                setError('El archivo no es un PDF. Ingrese los datos manualmente.');
            }

            return () => URL.revokeObjectURL(url);
        } else if (filename) {
            // View server file — fetch and extract
            setPreviewUrl(serverUrl);
            setRows([]);
            setError(null);

            if (filename.toLowerCase().endsWith('.pdf')) {
                setLoading(true);
                extractStateRows(serverUrl)
                    .then(result => {
                        setRows(result.length > 0 ? result : [{ state: '', total: '' }]);
                        if (result.length === 0) setError('No se extrajeron datos automáticamente. Ingréselos manualmente.');
                    })
                    .finally(() => setLoading(false));
            } else {
                setRows([{ state: '', total: '' }]);
                setError('El archivo no es un PDF. Ingrese los datos manualmente.');
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, file, pendingFile, filename]);

    const handleRowChange = (index, field, value) => {
        setRows(prev => prev.map((r, i) => i === index ? { ...r, [field]: value } : r));
    };

    const addRow = () => setRows(prev => [...prev, { state: '', total: '' }]);
    const removeRow = (index) => setRows(prev => prev.filter((_, i) => i !== index));

    const handleNewFileSelect = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        e.target.value = null;
        setPendingFile(f);
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const fileToUpload = pendingFile || file;

            // 1. Upload file only if there's a new one
            if (fileToUpload) {
                const uploadFd = new FormData();
                uploadFd.append('op', 'upload_doc');
                uploadFd.append('trip_id', tripId);
                uploadFd.append('doc_type', 'reporte_pcmiller');
                uploadFd.append('file', fileToUpload);
                const uploadRes = await fetch(`${apiHost}/safety.php`, { method: 'POST', body: uploadFd });
                const uploadJson = await uploadRes.json();
                if (uploadJson.status !== 'success') {
                    setError(uploadJson.message || 'Error al subir el archivo.');
                    return;
                }
            }

            // 2. Insert/update IFTA states
            const iftaFd = new FormData();
            iftaFd.append('op', 'insert_ifta');
            iftaFd.append('trip_id', tripId);
            iftaFd.append('states', JSON.stringify(rows));
            const iftaRes = await fetch(`${apiHost}/IFTA.php`, { method: 'POST', body: iftaFd });
            const iftaJson = await iftaRes.json();
            if (iftaJson.status !== 'success') {
                setError(iftaJson.message || 'Error al guardar los estados IFTA.');
                return;
            }

            onSave?.();
            onClose();
        } catch {
            setError('Error de conexión al guardar.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        // Pending replacement → clear, go back to server file view
        if (pendingFile) {
            setPendingFile(null);
            return;
        }
        // New file from outside, not yet on server → just close
        if (!filename) {
            onDeleteSuccess?.();
            onClose();
            return;
        }
        // Delete from server
        setDeleting(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append('op', 'delete_doc');
            fd.append('trip_id', tripId);
            fd.append('doc_type', 'reporte_pcmiller');
            const res = await fetch(`${apiHost}/safety.php`, { method: 'POST', body: fd });
            const json = await res.json();
            if (json.status === 'success') {
                onDeleteSuccess?.();
                onClose();
            } else {
                setError(json.message || 'Error al eliminar el documento.');
            }
        } catch {
            setError('Error de conexión al eliminar.');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            slotProps={{ paper: { sx: { height: '92vh', display: 'flex', flexDirection: 'column' } } }}
        >
            <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #e0e0e0', pb: 1.5 }}>
                Reporte PC Miller — Revisión y extracción de datos
            </DialogTitle>

            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, p: 2.5, overflow: 'hidden', flex: 1 }}>

                {/* ── Document preview ── */}
                <Box sx={{ flex: '0 0 55%', border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                    {previewUrl ? (
                        isPdf ? (
                            <iframe src={previewUrl} width="100%" height="100%" style={{ border: 'none', display: 'block' }} title="Reporte PC Miller" />
                        ) : (
                            <Box component="img" src={previewUrl} alt="Reporte PC Miller" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        )
                    ) : (
                        <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                            <Typography color="text.secondary">Sin previsualización</Typography>
                        </Box>
                    )}
                </Box>

                {/* ── Extracted state rows ── */}
                <Box sx={{ flex: 1, overflow: 'auto' }}>
                    <Typography variant="subtitle1" fontWeight={700} mb={1}>
                        Datos Extraídos — State / Country
                    </Typography>

                    {error && (
                        <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setError(null)}>
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <Box display="flex" alignItems="center" gap={1.5} py={2}>
                            <CircularProgress size={20} />
                            <Typography color="text.secondary">Extrayendo datos del documento...</Typography>
                        </Box>
                    ) : (
                        <>
                            <TableContainer component={Paper} variant="outlined" sx={{ mb: 1.5 }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                            <TableCell sx={{ fontWeight: 700 }}>State / Country</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Total Mi</TableCell>
                                            <TableCell width={52} />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {rows.map((row, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <TextField size="small" value={row.state} onChange={(e) => handleRowChange(index, 'state', e.target.value)} placeholder="Ej: TX" sx={{ minWidth: 90 }} />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField size="small" value={row.total} onChange={(e) => handleRowChange(index, 'total', e.target.value)} placeholder="0.0" sx={{ minWidth: 110 }} />
                                                </TableCell>
                                                <TableCell>
                                                    <Tooltip title="Eliminar fila">
                                                        <IconButton size="small" color="error" onClick={() => removeRow(index)}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Button startIcon={<AddIcon />} onClick={addRow} size="small" variant="outlined">
                                Agregar fila
                            </Button>
                        </>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0', justifyContent: 'space-between' }}>
                {/* Left: Delete */}
                <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDelete}
                    disabled={saving || deleting || loading}
                    startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                >
                    {deleting ? 'Eliminando...' : pendingFile ? 'Cancelar reemplazo' : 'Eliminar'}
                </Button>

                {/* Right: Cancel + action buttons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={onClose} disabled={saving || deleting} color="inherit">
                        Cancelar
                    </Button>

                    {/* Viewing server file — offer replacement */}
                    {isServerFile && (
                        <>
                            <input
                                type="file"
                                ref={internalFileInputRef}
                                style={{ display: 'none' }}
                                accept=".pdf,.png,.jpg,.jpeg"
                                onChange={handleNewFileSelect}
                            />
                            <Button
                                variant="outlined"
                                onClick={() => internalFileInputRef.current.click()}
                                startIcon={<CloudUploadIcon />}
                                disabled={saving || deleting}
                            >
                                Subir nuevo archivo
                            </Button>
                        </>
                    )}

                    {/* Save / upload */}
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving || loading}
                        startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                    >
                        {saving ? 'Guardando...' : activeFile && filename ? 'Reemplazar y guardar' : 'Guardar'}
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
};
