import { Grid, Paper, Stack, Typography, Divider, Box, Chip } from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import dayjs from 'dayjs';
import { usePermisos, PERMISOS } from '../../shared/auth';
import { urlSegura } from '../../shared/security';

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  return timeStr.substring(0, 5);
};

const apiHost = import.meta.env.VITE_API_HOST;

// Mismos tonos semánticos que el resto del rediseño (success/warning/error),
// en versión "tinted badge" en vez de Chip sólido de MUI.
const TINTS = {
  success: { bg: '#f0fdf4', fg: '#16a34a' },
  warning: { bg: '#fffbeb', fg: '#d97706' },
  error:   { bg: '#fef2f2', fg: '#dc2626' },
  info:    { bg: '#eff6ff', fg: '#2563eb' },
};

const TintedBadge = ({ tone, icon, label, component, href, target }) => {
  const { bg, fg } = TINTS[tone] || TINTS.info;
  return (
    <Chip
      icon={icon}
      label={label}
      size="small"
      component={component}
      href={href}
      target={target}
      clickable={!!component}
      sx={{
        height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: bg, color: fg,
        border: `1px solid ${fg}22`, '& .MuiChip-icon': { color: fg },
        ...(component ? { cursor: 'pointer' } : {}),
      }}
    />
  );
};

export const StageNormalCard = ({ etapa, getDocumentUrl, isCompleted }) => {
  const { can } = usePermisos();
  const canManageInvoice = can(PERMISOS.VIAJES_INVOICES);

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

  const hasInfoParaInvoice = etapa.ci_number && etapa.rate_tarifa && etapa.loading_date && etapa.delivery_date && etapa.origin && etapa.destination && etapa.invoice_number;

  const hasInvoiceGenerado = !!etapa.has_invoice_generado;

  let invoiceStatusTone = 'error';
  let invoiceStatusLabel = 'Falta Info Invoice';

  if (hasInvoiceGenerado) {
      invoiceStatusTone = 'success';
      invoiceStatusLabel = 'Invoice Generado';
  } else if (hasInfoParaInvoice) {
      invoiceStatusTone = 'warning';
      invoiceStatusLabel = 'Listo para Invoice';
  }

  const tarifa = parseFloat(etapa.rate_tarifa) || 0;
  const millasPracticas = parseFloat(etapa.millas_pcmiller_practicas) || 0;
  const rateFinal = millasPracticas > 0 ? (tarifa / millasPracticas) : 0;

  const directionColor = etapa.travel_direction === 'Going Up' ? '#16a34a' : '#d97706';

  return (
    <Grid item xs={12} sm={6} md={4}>
      <Paper elevation={0} sx={{ border: '1px solid #e2e8f0', p: 2, height: '100%', borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, bgcolor: directionColor }} />

        <Stack spacing={1.5} sx={{ pl: 1 }}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="overline" sx={{ color: '#94a3b8', fontWeight: 700, letterSpacing: '0.06em', fontSize: '0.68rem' }}>
                  Etapa {etapa.stage_number} • {etapa.travel_direction}
                </Typography>

                {isCompleted && (
                    <TintedBadge tone="success" label={`Rate: $${rateFinal.toFixed(2)}/mi`} />
                )}
            </Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5, flexWrap:'wrap' }}>
              <BusinessIcon sx={{ fontSize: 18, color: '#94a3b8' }} />
              <Typography variant="subtitle1" fontWeight={700} color="#0f172a" sx={{ lineHeight: 1.2 }}>
                {etapa.nombre_compania || 'Compañía sin nombre'}
              </Typography>

              {canManageInvoice && etapa.ci_number && (
                <Chip label={`CI: ${etapa.ci_number}`} size="small" sx={{ height: 20, fontSize:'0.7rem', fontWeight: 700, bgcolor: '#f1f5f9', color: '#475569' }} />
              )}

              {mainBLDocs.map(doc => (
                  <TintedBadge
                      key={doc.document_id}
                      tone="info"
                      icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                      label="BL Firmado"
                      component="a"
                      href={urlSegura(getDocumentUrl(doc.path_servidor_real || doc.nombre_archivo))}
                      target="_blank"
                      rel="noopener noreferrer"
                  />
              ))}

              {canManageInvoice && (
                hasInvoiceGenerado && etapa.invoice_file_path ? (
                    <TintedBadge
                        tone="success"
                        icon={<ReceiptOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                        label="Ver Invoice"
                        component="a"
                        href={urlSegura(`${apiHost}/${etapa.invoice_file_path}`)}
                        target="_blank"
                        rel="noopener noreferrer"
                    />
                ) : (
                    <TintedBadge
                        tone={invoiceStatusTone}
                        icon={<ReceiptOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                        label={invoiceStatusLabel}
                    />
                )
              )}
            </Stack>
          </Box>

          <Divider sx={{ borderColor: '#f1f5f9' }} />

          <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ mt: 1 }}>
            <RoomOutlinedIcon sx={{ fontSize: 18, color: '#94a3b8', mt: 0.2 }} />

            <Grid container spacing={1} alignItems="flex-start">
              {/* ORIGEN */}
              <Grid item xs={5} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" fontWeight={600} color="#334155" sx={{ lineHeight: 1.2 }}>{etapa.origin}</Typography>
                <Box sx={{ mt: 0.8 }}>
                    <Typography variant="caption" color="#94a3b8" display="block" sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                      Fecha Salida
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <CalendarTodayOutlinedIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                      <Typography variant="caption" fontWeight={700} color="#0f172a">
                        {etapa.date_of_departure
                          ? dayjs(etapa.date_of_departure).format("DD/MM/YY")
                          : (etapa.creation_date ? dayjs(etapa.creation_date).format("DD/MM/YY") : '--')}
                      </Typography>
                    </Stack>
                </Box>

                <Box sx={{ mt: 0.5 }}>
                    <Typography variant="caption" color="#94a3b8" display="block" sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>
                      Fecha Carga
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <CalendarTodayOutlinedIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                      <Typography variant="caption" fontWeight={500} color="#475569">
                        {etapa.loading_date ? dayjs(etapa.loading_date).format("DD/MM/YY") : '--'}
                      </Typography>
                    </Stack>
                </Box>
              </Grid>

              <Grid item xs={2} sx={{ display: 'flex', justifyContent: 'center', pt: 0.5 }}>
                <ArrowForwardIcon sx={{ fontSize: 16, color: '#cbd5e1' }} />
              </Grid>

              {/* DESTINO */}
              <Grid item xs={5} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography variant="body2" fontWeight={600} color="#334155" sx={{ lineHeight: 1.2 }}>{etapa.destination}</Typography>
                <Box sx={{ mt: 0.8 }}>
                    <Typography variant="caption" color="#94a3b8" display="block" sx={{ fontSize: '0.65rem', textTransform: 'uppercase' }}>Fecha Entrega</Typography>
                    <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.2 }}>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <CalendarTodayOutlinedIcon sx={{ fontSize: 12, color: '#94a3b8' }} />
                        <Typography variant="caption" fontWeight={500} color="#475569">{etapa.delivery_date ? dayjs(etapa.delivery_date).format("DD/MM/YY") : '--'}</Typography>
                      </Stack>

                      {etapa.time_of_delivery && (
                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ bgcolor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: 1, px: 0.6, py: 0.1 }}>
                          <AccessTimeOutlinedIcon sx={{ fontSize: 11 }} />
                          <Typography variant="caption" fontWeight={700} sx={{ lineHeight: 1, fontSize: '0.7rem' }}>{formatTime(etapa.time_of_delivery)}</Typography>
                        </Stack>
                      )}
                    </Stack>
                </Box>
              </Grid>
            </Grid>
          </Stack>

          {etapa.comments && (
            <Typography variant="caption" sx={{ fontStyle: 'italic', color: '#64748b', borderLeft: '2px solid #e2e8f0', pl: 1, display: 'block', maxWidth: '45ch', wordWrap: 'break-word', whiteSpace: 'pre-wrap' }}>
              "{etapa.comments}"
            </Typography>
          )}

          {/* PARADAS */}
          {Array.isArray(etapa.stops_in_transit) && etapa.stops_in_transit.length > 0 && (
            <Box sx={{ mt: 1, pt: 1, borderTop: '1px dashed #e2e8f0' }}>
              <Typography variant="overline" fontWeight={700} color="#94a3b8" sx={{ fontSize: '0.65rem', letterSpacing: '0.06em' }}>Paradas Adicionales</Typography>
              <Stack spacing={0.75} sx={{ mt: 0.5 }}>
                {etapa.stops_in_transit.map((stop, i) => (
                  <Stack key={i} direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                    <Box sx={{
                      width: 16, height: 16, borderRadius: '50%', bgcolor: '#f1f5f9', color: '#64748b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', fontWeight: 700, flexShrink: 0,
                    }}>
                      {stop.stop_order || i + 1}
                    </Box>
                    <Typography variant="body2" color="#334155" sx={{ fontSize: '0.8rem' }}>{stop.location}</Typography>
                    {stop.time_of_delivery && (
                        <Chip icon={<AccessTimeOutlinedIcon sx={{ fontSize: '12px !important' }} />} label={formatTime(stop.time_of_delivery)} size="small" sx={{ height: 20, fontSize: '0.7rem', bgcolor: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b' }} />
                    )}
                    {stop.bl_firmado_doc && (
                      <TintedBadge
                          tone="info"
                          icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: '12px !important' }} />}
                          label="BL Firmado"
                          component="a"
                          href={urlSegura(getDocumentUrl(stop.bl_firmado_doc.path_servidor_real || stop.bl_firmado_doc.nombre_archivo))}
                          target="_blank"
                          rel="noopener noreferrer"
                      />
                    )}
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}

          {/* DOCUMENTOS ADJUNTOS (Incluye el BL normal) */}
          {otrosDocumentos.length > 0 && (
            <Box sx={{ mt: 'auto', pt: 1 }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {otrosDocumentos.map(doc => (
                  <Chip
                      key={doc.document_id}
                      label={doc.tipo_documento.toUpperCase().replace(/_/g, ' ')}
                      size="small"
                      component="a"
                      href={urlSegura(getDocumentUrl(doc.path_servidor_real || doc.nombre_archivo))}
                      target="_blank"
                      rel="noopener noreferrer"
                      clickable
                      variant="outlined"
                      sx={{ fontSize: '0.72rem', fontWeight: 700, borderColor: '#e2e8f0', color: '#475569' }}
                  />
              ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </Paper>
    </Grid>
  );
};
