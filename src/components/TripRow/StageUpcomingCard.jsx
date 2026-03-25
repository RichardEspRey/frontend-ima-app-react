import React from 'react';
import { Paper, Box, Typography, Stack, Divider, Chip, Grid } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import RoomIcon from '@mui/icons-material/Room';
import FlagIcon from '@mui/icons-material/Flag';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import dayjs from 'dayjs';

// Helper para formatear hora
const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
};

export const StageUpcomingCard = ({ etapa, getDocumentUrl }) => {
    // Lógica de fechas priorizada
    const departureDate = etapa.date_of_departure
        ? dayjs(etapa.date_of_departure).format("DD/MM/YYYY")
        : (etapa.loading_date
            ? dayjs(etapa.loading_date).format("DD/MM/YY")
            : (etapa.creation_date ? dayjs(etapa.creation_date).format("DD/MM/YY") : '--'));

    const deliveryDate = etapa.delivery_date ? dayjs(etapa.delivery_date).format("DD/MM/YY") : '--';

    const tieneParadas = Array.isArray(etapa.stops_in_transit) && etapa.stops_in_transit.length > 0;

    return (
        <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #e0e0e0', mb: 1 }}>
            {/* ENCABEZADO DE LA ETAPA */}
            <Box sx={{ bgcolor: '#f0f4f8', px: 3, py: 1.5, borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Chip 
                        label={`Etapa ${etapa.stage_number}${etapa.travel_direction ? ` • ${etapa.travel_direction}` : ''}`} 
                        size="small" 
                        color={etapa.travel_direction === 'Going Up' ? 'success' : (etapa.travel_direction === 'Going Down' ? 'warning' : 'default')} 
                        sx={{ fontWeight: 'bold' }} 
                    />
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <BusinessIcon color="action" />
                        <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                            {etapa.nombre_compania || 'Compañía sin nombre'}
                        </Typography>
                    </Stack>
                </Stack>
                {etapa.ci_number && (
                    <Chip label={`CI: ${etapa.ci_number}`} variant="outlined" color="primary" sx={{ fontWeight: 'bold', bgcolor: '#fff' }} />
                )}
            </Box>

            <Box sx={{ p: 3, pb: tieneParadas ? 1 : 3 }}> 
                <Grid container spacing={2} alignItems="center">
                    
                    {/* ORIGEN Y FECHA SALIDA */}
                    <Grid item xs={12} md={5}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa', borderRadius: 2, borderLeft: '4px solid #0288d1' }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                <RoomIcon color="primary" />
                                <Typography variant="h6" fontWeight={700} color="text.secondary">Origen</Typography>
                            </Stack>
                            <Typography variant="body1" fontWeight={600} mb={2} sx={{ minHeight: '48px' }}>
                                {etapa.origin || 'Sin origen especificado'}
                            </Typography>
                            
                            <Box sx={{ bgcolor: '#e1f5fe', p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <CalendarMonthIcon sx={{ color: '#0288d1', fontSize: 32 }} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>FECHA SALIDA</Typography>
                                    <Typography variant="h6" color="#0288d1" fontWeight={800} lineHeight={1}>{departureDate}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowForwardIosIcon sx={{ fontSize: 40, color: '#bdbdbd', display: { xs: 'none', md: 'block' } }} />
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fafafa', borderRadius: 2, borderLeft: '4px solid #d32f2f' }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                <FlagIcon color="error" />
                                <Typography variant="h6" fontWeight={700} color="text.secondary">Destino</Typography>
                            </Stack>
                            <Typography variant="body1" fontWeight={600} mb={2} sx={{ minHeight: '48px' }}>
                                {etapa.destination || 'Sin destino especificado'}
                            </Typography>

                            <Stack direction="row" spacing={1}>
                                <Box sx={{ bgcolor: '#ffebee', p: 1.5, borderRadius: 2, flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <CalendarMonthIcon sx={{ color: '#d32f2f', fontSize: 32 }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>FECHA ENTREGA</Typography>
                                        <Typography variant="h6" color="#d32f2f" fontWeight={800} lineHeight={1}>{deliveryDate}</Typography>
                                    </Box>
                                </Box>
                                
                                {etapa.time_of_delivery && (
                                    <Box sx={{ bgcolor: '#fff3e0', p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AccessTimeIcon sx={{ color: '#d32f2f', fontSize: 28 }} />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>HORA</Typography>
                                            <Typography variant="h6" color="#d32f2f" fontWeight={800} lineHeight={1}>{formatTime(etapa.time_of_delivery)}</Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {tieneParadas && (
                <Box sx={{ px: 3, pb: 3 }}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fff', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                        <Typography variant="subtitle2" fontWeight={800} color="text.primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <FmdGoodOutlinedIcon color="action" /> Detalle de Paradas en Tránsito ({etapa.stops_in_transit.length})
                        </Typography>
                        
                        <Stack spacing={1} divider={<Divider orientation="horizontal" flexItem sx={{ borderStyle: 'dashed' }} />}>
                            {etapa.stops_in_transit.map((stop, index) => (
                                <Box key={index} sx={{ py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexGrow: 1 }}>
                                        <Typography variant="body2" fontWeight={700} color="text.secondary" sx={{ minWidth: '25px' }}>
                                            #{stop.stop_order || (index + 1)}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600} color="text.primary">
                                            {stop.location}
                                        </Typography>
                                        
                                        {stop.time_of_delivery && (
                                            <Chip 
                                                icon={<AccessTimeIcon sx={{ fontSize: '14px !important' }} />} 
                                                label={formatTime(stop.time_of_delivery)} 
                                                size="small" 
                                                sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#f5f5f5', border: '1px solid #e0e0e0' }} 
                                            />
                                        )}
                                    </Stack>

                                    {stop.bl_firmado_doc && (
                                        <Chip 
                                            icon={<InsertDriveFileIcon style={{ fontSize: '14px', color: '#fff' }} />}
                                            label="BL" // 🚨 Cambio de label de "BL Firmado" a "BL"
                                            component="a" 
                                            href={getDocumentUrl(stop.bl_firmado_doc.path_servidor_real || stop.bl_firmado_doc.nombre_archivo)} 
                                            target="_blank" 
                                            clickable 
                                            color="info" // Color distinto para diferenciar de los docs principales
                                            size="small"
                                            sx={{ height: 24, fontSize: '0.75rem', fontWeight: 'bold', px: 1 }} 
                                        />
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Box>
            )}

            <Divider />

            <Box sx={{ px: 3, py: 2, bgcolor: '#fff' }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={7}>
                        <Typography variant="subtitle2" fontWeight={700} color="text.secondary" mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <InsertDriveFileIcon fontSize="small" /> Documentos de la Etapa:
                        </Typography>
                        {Array.isArray(etapa.documentos_adjuntos) && etapa.documentos_adjuntos.length > 0 ? (
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {etapa.documentos_adjuntos.map(doc => (
                                    <Chip
                                        key={doc.document_id}
                                        icon={<InsertDriveFileIcon style={{ color: '#fff' }} />}
                                        label={doc.tipo_documento.toUpperCase().replace(/_/g, ' ')}
                                        component="a"
                                        href={getDocumentUrl(doc.path_servidor_real || doc.nombre_archivo)}
                                        target="_blank"
                                        clickable
                                        color="success"
                                        sx={{ fontWeight: 'bold', fontSize: '0.8rem', boxShadow: 1 }}
                                    />
                                ))}
                            </Stack>
                        ) : (
                            <Typography variant="body2" color="text.disabled" fontStyle="italic">
                                Aún no se han subido documentos para esta etapa.
                            </Typography>
                        )}
                    </Grid>

                    {etapa.comments && (
                        <Grid item xs={12} md={5}>
                            <Box sx={{ bgcolor: '#fff9c4', p: 1.5, borderRadius: 2, border: '1px dashed #ffb300' }}>
                                <Typography variant="caption" fontWeight={700} color="#f57c00" display="block">Comentarios:</Typography>
                                <Typography variant="body2" fontStyle="italic" color="text.primary">"{etapa.comments}"</Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </Paper>
    );
};