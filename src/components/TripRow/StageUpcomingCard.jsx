import React from 'react';
import { Paper, Box, Typography, Stack, Divider, Chip, Grid } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined';
import dayjs from 'dayjs';
import { usePermisos, PERMISOS } from '../../shared/auth';
import { urlSegura } from '../../shared/security';
import { COLOR } from '../../shared/ui/tokens';

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    return timeStr.substring(0, 5);
};

export const StageUpcomingCard = ({ etapa, getDocumentUrl }) => {
    const { can } = usePermisos();
    const canManageInvoice = can(PERMISOS.VIAJES_INVOICES);

    const departureDate = etapa.date_of_departure
        ? dayjs(etapa.date_of_departure).format("DD/MM/YYYY")
        : (etapa.loading_date
            ? dayjs(etapa.loading_date).format("DD/MM/YY")
            : (etapa.creation_date ? dayjs(etapa.creation_date).format("DD/MM/YY") : '--'));

    const deliveryDate = etapa.delivery_date ? dayjs(etapa.delivery_date).format("DD/MM/YY") : '--';
    const tieneParadas = Array.isArray(etapa.stops_in_transit) && etapa.stops_in_transit.length > 0;

    // 1. Separamos SOLO el BL Firmado
    const mainBLDocs = Array.isArray(etapa.documentos_adjuntos)
        ? etapa.documentos_adjuntos.filter(d => d.tipo_documento.toLowerCase() === 'bl_firmado')
        : [];

    const otrosDocumentos = Array.isArray(etapa.documentos_adjuntos)
        ? etapa.documentos_adjuntos.filter(d => {
            const tipo = d.tipo_documento.toLowerCase();
            if (tipo === 'bl_firmado') return false;
            if (!canManageInvoice && (tipo === 'ci' || tipo === 'ima_invoice')) return false;
            return true;
          })
        : [];

    return (
        <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: `1px solid ${COLOR.BORDE}`, mb: 1 }}>

            {/* ENCABEZADO DE LA ETAPA */}
            <Box sx={{ bgcolor: COLOR.CABECERA, px: 2.5, py: 1.5, borderBottom: `1px solid ${COLOR.BORDE}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2} flexWrap="wrap" useFlexGap>
                    <Typography variant="overline" sx={{ color: COLOR.TENUE, fontWeight: 700, letterSpacing: '0.06em', fontSize: '0.68rem' }}>
                        Etapa {etapa.stage_number}{etapa.travel_direction ? ` • ${etapa.travel_direction}` : ''}
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                        <BusinessIcon sx={{ fontSize: 18, color: COLOR.TENUE }} />
                        <Typography variant="subtitle1" fontWeight={700} color={COLOR.TINTA}>
                            {etapa.nombre_compania || 'Compañía sin nombre'}
                        </Typography>

                        {mainBLDocs.map(doc => (
                            <Chip
                                key={doc.document_id}
                                icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                                label="BL Firmado"
                                size="small"
                                component="a"
                                href={urlSegura(getDocumentUrl(doc.path_servidor_real || doc.nombre_archivo))}
                                target="_blank"
                                rel="noopener noreferrer"
                                clickable
                                sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: COLOR.INFO_FONDO, color: COLOR.INFO, border: `1px solid ${COLOR.INFO}22` }}
                            />
                        ))}
                    </Stack>
                </Stack>
                {canManageInvoice && etapa.ci_number && (
                    <Chip label={`CI: ${etapa.ci_number}`} sx={{ fontWeight: 700, bgcolor: COLOR.RELLENO, color: COLOR.TEXTO_SUAVE }} />
                )}
            </Box>

            <Box sx={{ p: 2.5, pb: tieneParadas ? 1 : 2.5 }}>
                <Grid container spacing={2} alignItems="center">
                    {/* ORIGEN Y FECHA SALIDA */}
                    <Grid item xs={12} md={5}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: COLOR.CABECERA, borderRadius: 2, borderLeft: `3px solid ${COLOR.INFO}`, borderColor: COLOR.BORDE }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                <RoomOutlinedIcon sx={{ fontSize: 18, color: COLOR.INFO }} />
                                <Typography variant="caption" fontWeight={700} color={COLOR.TENUE} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Origen</Typography>
                            </Stack>
                            <Typography variant="body1" fontWeight={600} color={COLOR.TINTA} mb={1.5} sx={{ minHeight: '48px' }}>
                                {etapa.origin || 'Sin origen especificado'}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                                <CalendarTodayOutlinedIcon sx={{ color: COLOR.TENUE, fontSize: 20 }} />
                                <Box>
                                    <Typography variant="caption" color={COLOR.TENUE} fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>Fecha Salida</Typography>
                                    <Typography variant="body1" color={COLOR.TINTA} fontWeight={700} lineHeight={1.2}>{departureDate}</Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={2} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowForwardIcon sx={{ fontSize: 24, color: COLOR.BORDE_FUERTE, display: { xs: 'none', md: 'block' } }} />
                    </Grid>

                    <Grid item xs={12} md={5}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: COLOR.CABECERA, borderRadius: 2, borderLeft: `3px solid ${COLOR.PELIGRO}`, borderColor: COLOR.BORDE }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                                <FlagOutlinedIcon sx={{ fontSize: 18, color: COLOR.PELIGRO }} />
                                <Typography variant="caption" fontWeight={700} color={COLOR.TENUE} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Destino</Typography>
                            </Stack>
                            <Typography variant="body1" fontWeight={600} color={COLOR.TINTA} mb={1.5} sx={{ minHeight: '48px' }}>
                                {etapa.destination || 'Sin destino especificado'}
                            </Typography>

                            <Stack direction="row" spacing={2}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexGrow: 1 }}>
                                    <CalendarTodayOutlinedIcon sx={{ color: COLOR.TENUE, fontSize: 20 }} />
                                    <Box>
                                        <Typography variant="caption" color={COLOR.TENUE} fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>Fecha Entrega</Typography>
                                        <Typography variant="body1" color={COLOR.TINTA} fontWeight={700} lineHeight={1.2}>{deliveryDate}</Typography>
                                    </Box>
                                </Box>

                                {etapa.time_of_delivery && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <AccessTimeOutlinedIcon sx={{ color: COLOR.TENUE, fontSize: 18 }} />
                                        <Box>
                                            <Typography variant="caption" color={COLOR.TENUE} fontWeight={700} sx={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>Hora</Typography>
                                            <Typography variant="body2" color={COLOR.TINTA} fontWeight={700} lineHeight={1.2}>{formatTime(etapa.time_of_delivery)}</Typography>
                                        </Box>
                                    </Box>
                                )}
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {tieneParadas && (
                <Box sx={{ px: 2.5, pb: 2.5 }}>
                    <Paper variant="outlined" sx={{ p: 2, bgcolor: COLOR.BLANCO, borderRadius: 2, borderColor: COLOR.BORDE }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                            <FmdGoodOutlinedIcon sx={{ fontSize: 16, color: COLOR.TENUE }} />
                            <Typography variant="overline" fontWeight={700} color={COLOR.TENUE} sx={{ fontSize: '0.65rem', letterSpacing: '0.06em' }}>
                                Detalle de Paradas en Tránsito ({etapa.stops_in_transit.length})
                            </Typography>
                        </Stack>

                        <Stack spacing={1} divider={<Divider sx={{ borderColor: COLOR.RELLENO }} />}>
                            {etapa.stops_in_transit.map((stop, index) => (
                                <Box key={index} sx={{ py: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexGrow: 1 }}>
                                        <Box sx={{
                                            width: 18, height: 18, borderRadius: '50%', bgcolor: COLOR.RELLENO, color: COLOR.APAGADO,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, flexShrink: 0,
                                        }}>
                                            {stop.stop_order || (index + 1)}
                                        </Box>
                                        <Typography variant="body2" fontWeight={600} color={COLOR.TEXTO}>
                                            {stop.location}
                                        </Typography>

                                        {stop.time_of_delivery && (
                                            <Chip
                                                icon={<AccessTimeOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                                                label={formatTime(stop.time_of_delivery)}
                                                size="small"
                                                sx={{ height: 20, fontSize: '0.7rem', bgcolor: COLOR.LIENZO, border: `1px solid ${COLOR.BORDE}`, color: COLOR.APAGADO }}
                                            />
                                        )}
                                    </Stack>

                                    {stop.bl_firmado_doc && (
                                        <Chip
                                            icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                                            label="BL"
                                            component="a"
                                            href={urlSegura(getDocumentUrl(stop.bl_firmado_doc.path_servidor_real || stop.bl_firmado_doc.nombre_archivo))}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            clickable
                                            size="small"
                                            sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700, bgcolor: COLOR.INFO_FONDO, color: COLOR.INFO, border: `1px solid ${COLOR.INFO}22` }}
                                        />
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    </Paper>
                </Box>
            )}

            <Divider sx={{ borderColor: COLOR.BORDE }} />

            <Box sx={{ px: 2.5, py: 2, bgcolor: COLOR.BLANCO }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={7}>
                        <Typography variant="overline" fontWeight={700} color={COLOR.TENUE} mb={1} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.65rem', letterSpacing: '0.06em' }}>
                            <InsertDriveFileOutlinedIcon sx={{ fontSize: 15 }} /> Documentos de la Etapa
                        </Typography>

                        {/* Renderizamos solo los "otros documentos" (Incluye el BL normal) */}
                        {otrosDocumentos.length > 0 ? (
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {otrosDocumentos.map(doc => (
                                    <Chip
                                        key={doc.document_id}
                                        label={doc.tipo_documento.toUpperCase().replace(/_/g, ' ')}
                                        component="a"
                                        href={urlSegura(getDocumentUrl(doc.path_servidor_real || doc.nombre_archivo))}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        clickable
                                        variant="outlined"
                                        sx={{ fontWeight: 700, fontSize: '0.75rem', borderColor: COLOR.BORDE, color: COLOR.TEXTO_SUAVE }}
                                    />
                                ))}
                            </Stack>
                        ) : (
                            <Typography variant="body2" color={COLOR.TENUE} fontStyle="italic">
                                Aún no se han subido documentos adicionales.
                            </Typography>
                        )}
                    </Grid>

                    {etapa.comments && (
                        <Grid item xs={12} md={5}>
                            <Box sx={{ bgcolor: COLOR.AVISO_FONDO, p: 1.5, borderRadius: 2, border: `1px dashed ${COLOR.AVISO_BORDE}` }}>
                                <Typography variant="caption" fontWeight={700} color={COLOR.AVISO} display="block">Comentarios:</Typography>
                                <Typography variant="body2" fontStyle="italic" color="#78350f">"{etapa.comments}"</Typography>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </Box>
        </Paper>
    );
};
