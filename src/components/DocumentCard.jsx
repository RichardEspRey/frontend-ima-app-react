import { Box, Typography, Paper, Button, Stack } from '@mui/material';
import { Tooltip } from 'react-tooltip';

const DocumentCard = ({ docKey, documento, getIconByFecha, abrirModalConDocumento }) => {
    const doc = documento[docKey];
    
    const StatusIconComponent = getIconByFecha(docKey); 
    
    const vencimiento = doc?.vencimiento 
        ? `Vence: ${new Date(doc.vencimiento).toLocaleDateString('es-MX')}` 
        : 'Sin Vencimiento';

    const docLabel = docKey === '2290' ? '2290' : docKey.replace('_', ' ');

    return (
        <Paper 
            elevation={2} 
            sx={{ 
                p: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%',
                justifyContent: 'space-between',
                minWidth: { xs: '200px', sm: '250px' },
                borderLeft: doc?.vencimiento ? '4px solid #3C48E1' : '4px solid #ccc',
            }}
        >
            <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <Typography variant="body1" fontWeight={700} sx={{ color: '#333' }}>
                        {docLabel}
                    </Typography>
                </Stack>
                
                <Box sx={{ mt: 1, minHeight: '35px' }}>
                    {StatusIconComponent}
                </Box>
            </Box>

            <Stack direction="column" justifyContent="flex-start" alignItems="flex-start" sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    {vencimiento}
                </Typography>
                
                <Button 
                    variant="contained" 
                    size="small" 
                    onClick={() => abrirModalConDocumento(docKey)}
                    color={doc?.vencimiento ? 'info' : 'success'} 
                    sx={{ ml: 1, minWidth: '80px' }}
                >
                    {doc?.vencimiento ? 'Ver' : 'Subir'}
                </Button>
            </Stack>
        </Paper>
    );
};

export default DocumentCard;