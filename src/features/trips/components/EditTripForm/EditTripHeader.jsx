import { Box, Typography, Stack, Button, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const EditTripHeader = ({ formData, tripId, handleSaveChanges, navigate }) => {
    return (
        <Paper sx={{ p: 2, mb: 3, position: 'sticky', top: 10, zIndex: 100, display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: 3 }}>
            <Box>
                <Typography variant="h5" fontWeight={700}>Editar Viaje #{formData.trip_number || tripId}</Typography>
                
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Typography variant="body1" fontWeight={600} color="primary.main">
                        {formData.driver_nombre || 'Sin Conductor Asignado'}
                    </Typography>
                    
                    {formData.truck_unidad && (
                        <>
                            <Typography variant="body2" color="text.disabled">•</Typography>
                            <Typography variant="body1" fontWeight={500} color="text.secondary">
                                Unidad {formData.truck_unidad}
                            </Typography>
                        </>
                    )}

                    {(formData.caja_no_caja || formData.caja_externa_no_caja) && (
                        <>
                            <Typography variant="body2" color="text.disabled">•</Typography>
                            <Typography variant="body1" fontWeight={500} color="text.secondary">
                                Caja {formData.caja_no_caja || formData.caja_externa_no_caja}
                            </Typography>
                        </>
                    )}
                </Stack>

                <Typography variant="caption" color="textSecondary">Estado: {formData.status}</Typography>
            </Box>
            <Stack direction="row" spacing={2}>
                <Button 
                    variant="outlined" 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate(-1)}
                    sx={{ 
                        color: 'text.secondary', 
                        borderColor: 'divider',
                        fontWeight: 600, 
                        textTransform: 'none',
                        bgcolor: 'white',
                        px: 3,
                        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
                        '&:hover': { bgcolor: '#f5f5f5', borderColor: '#bdbdbd' }
                    }}
                >
                    Cancelar
                </Button>
                <Button variant="contained" onClick={handleSaveChanges} disabled={formData.status === 'Completed'}>
                    Guardar
                </Button>
            </Stack>
        </Paper>
    );
};

export default EditTripHeader;