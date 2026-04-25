import { Box, Typography, Stack, Button, InputLabel, Paper } from '@mui/material';

/**
 * Componente para subir y visualizar el estado de un documento de conductor.
 * @param {string} label - Etiqueta del campo (Ej: INE).
 * @param {string} documentKey - Clave del documento en el objeto 'documentos'.
 * @param {object} documentos - Objeto state que contiene los documentos cargados.
 * @param {function} abrirModal - Handler para abrir el modal de subida.
 * @param {function} handleClear - Handler para eliminar el documento actual.
 */
const DriverInput = ({ label, documentKey, documentos, abrirModal, handleClear }) => {
    const doc = documentos[documentKey];
    
    // Función local para manejar la limpieza del documento
    const handleClearLocal = (e) => {
        e.stopPropagation();
        handleClear(documentKey);
    };

    return (
        <Box sx={{ mb: 2 }}>
            <InputLabel sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem' }}>{label}</InputLabel>
            
            <Stack direction="row" spacing={1} alignItems="center">
                {/* Botón de Acción */}
                <Button 
                    variant="outlined" 
                    onClick={() => abrirModal(documentKey)}
                    size="small"
                    sx={{ minWidth: '130px' }}
                >
                    Subir Documento
                </Button>
                
                {doc ? (
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: 1, 
                            flexGrow: 1, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            bgcolor: '#f5f5f5'
                        }}
                    >
                        {/* Nombre del archivo y vencimiento */}
                        <Typography variant="body2" color="primary" sx={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {doc.fileName} - Vence: {doc.vencimiento || 'N/A'}
                        </Typography>
                        {/* Botón de Eliminar/Limpiar */}
                        <Button 
                            color="error" 
                            size="small" 
                            onClick={handleClearLocal}
                            sx={{ minWidth: 'unset', p: 0.5, ml: 1 }}
                        >
                            X
                        </Button>
                    </Paper>
                ) : (
                    <Typography variant="body2" color="text.secondary">Sin Archivo</Typography>
                )}
            </Stack>
        </Box>
    );
};

export default DriverInput;