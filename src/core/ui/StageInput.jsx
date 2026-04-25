import { Box, Typography, Stack, Button, InputLabel, Paper } from '@mui/material';
import { RemoveCircleOutline } from '@mui/icons-material';

const StageInput = ({ label, docType, stageIndex, documentos, abrirModal }) => {
    const docData = documentos[docType];
    
    return (
        <Box sx={{ mb: 2 }}>
            <InputLabel sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem' }}>{label}</InputLabel>
            
            <Stack direction="row" spacing={1} alignItems="center">
                <Button 
                    variant="outlined" 
                    onClick={() => abrirModal(docType, stageIndex)}
                    size="small"
                    sx={{ minWidth: '100px' }}
                >
                    Subir
                </Button>
                
                {docData ? (
                    <Paper 
                        variant="outlined" 
                        sx={{ 
                            p: 1, 
                            flexGrow: 1, 
                            display: 'flex', 
                            alignItems: 'center', 
                            bgcolor: '#e3f2fd'
                        }}
                    >
                        <Typography variant="body2" color="primary" sx={{ flexGrow: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {docData.fileName}
                            {docData.vencimiento ? ` - V: ${docData.vencimiento}` : ''}
                        </Typography>
                    </Paper>
                ) : (
                    <Typography variant="body2" color="text.secondary">Sin Archivo</Typography>
                )}
            </Stack>
        </Box>
    );
};

export default StageInput;