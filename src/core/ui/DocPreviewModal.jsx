import { useState, useEffect, useRef } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Box, Typography, CircularProgress, Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';

const apiHost = import.meta.env.VITE_API_HOST;

export const DocPreviewModal = ({ open, onClose, file, filename, tripId, docType, docName, onUploadSuccess, onDeleteSuccess }) => {
    const [pendingFile, setPendingFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const internalFileInputRef = useRef(null);

    // Reset internal state when modal closes
    useEffect(() => {
        if (!open) {
            setPendingFile(null);
            setPreviewUrl(null);
            setError(null);
        }
    }, [open]);

    // Build preview URL from pending or passed file
    useEffect(() => {
        const activeFile = pendingFile || file;
        if (!open || !activeFile) {
            if (!pendingFile && !file) setPreviewUrl(null);
            return;
        }
        const url = URL.createObjectURL(activeFile);
        setPreviewUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [open, file, pendingFile]);

    // Viewing server file: use server URL directly
    const serverUrl = filename ? `${apiHost}/Uploads/Safety/${filename}` : null;

    const activeFile = pendingFile || file;
    const displayUrl = previewUrl || serverUrl;
    const displayName = activeFile?.name || filename || '';
    const isPdf = displayName.toLowerCase().endsWith('.pdf');

    // Is this file already on the server (not pending local replacement)
    const isServerFile = !!filename && !pendingFile && !file;

    const handleNewFileSelect = (e) => {
        const f = e.target.files[0];
        if (!f) return;
        e.target.value = null;
        setPendingFile(f);
    };

    const handleUpload = async () => {
        const fileToUpload = pendingFile || file;
        if (!fileToUpload) return;
        setUploading(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append('op', 'upload_doc');
            fd.append('trip_id', tripId);
            fd.append('doc_type', docType);
            fd.append('file', fileToUpload);
            const res = await fetch(`${apiHost}/safety.php`, { method: 'POST', body: fd });
            const json = await res.json();
            if (json.status === 'success') {
                onUploadSuccess?.();
                onClose();
            } else {
                setError(json.message || 'Error al subir el documento.');
            }
        } catch {
            setError('Error de conexión al subir el documento.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async () => {
        // Pending replacement → just clear (go back to server file view)
        if (pendingFile) {
            setPendingFile(null);
            return;
        }
        // New file passed from outside, not yet on server → just close
        if (!filename) {
            onDeleteSuccess?.();
            onClose();
            return;
        }
        // File is on server → delete it
        setDeleting(true);
        setError(null);
        try {
            const fd = new FormData();
            fd.append('op', 'delete_doc');
            fd.append('trip_id', tripId);
            fd.append('doc_type', docType);
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
            maxWidth="md"
            fullWidth
            slotProps={{ paper: { sx: { height: '85vh', display: 'flex', flexDirection: 'column' } } }}
        >
            <DialogTitle sx={{ fontWeight: 700, borderBottom: '1px solid #e0e0e0', pb: 1.5 }}>
                Vista previa — {docName}
            </DialogTitle>

            <DialogContent sx={{ p: 2, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {error && (
                    <Alert severity="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                <Box sx={{ flex: 1, border: '1px solid #e0e0e0', borderRadius: 1, overflow: 'hidden', bgcolor: '#f5f5f5' }}>
                    {displayUrl ? (
                        isPdf ? (
                            <iframe src={displayUrl} width="100%" height="100%" style={{ border: 'none', display: 'block' }} title={docName} />
                        ) : (
                            <Box component="img" src={displayUrl} alt={docName} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        )
                    ) : (
                        <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                            <Typography color="text.secondary">Sin previsualización</Typography>
                        </Box>
                    )}
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e0e0e0', justifyContent: 'space-between' }}>
                {/* Left: Delete */}
                <Button
                    variant="outlined"
                    color="error"
                    onClick={handleDelete}
                    disabled={uploading || deleting}
                    startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />}
                >
                    {deleting ? 'Eliminando...' : 'Eliminar'}
                </Button>

                {/* Right: Cancel + action */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button onClick={onClose} disabled={uploading || deleting} color="inherit">
                        Cancelar
                    </Button>

                    {/* Viewing server file, no replacement selected yet */}
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
                                variant="contained"
                                onClick={() => internalFileInputRef.current.click()}
                                startIcon={<CloudUploadIcon />}
                            >
                                Subir nuevo archivo
                            </Button>
                        </>
                    )}

                    {/* New file ready to upload (initial or replacement) */}
                    {activeFile && (
                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={uploading}
                            startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
                        >
                            {uploading ? 'Subiendo...' : filename ? 'Reemplazar documento' : 'Subir documento'}
                        </Button>
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );
};
