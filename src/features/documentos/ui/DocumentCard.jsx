import React from 'react';
import { Paper, Stack, Box, Chip, Typography, Button, Tooltip, IconButton } from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { COLOR } from '../../../shared/ui/tokens';

/**
 * La ficha de un documento del expediente.
 *
 * Un requisito de texto se dibuja como un rectángulo con su valor; uno de
 * archivo, como una tarjeta con el estado de su vigencia.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.req El requisito que se exige.
 * @param {object} props.theme Los colores de su categoría.
 * @param {object} [props.val] Lo que hay guardado, si hay algo.
 * @param {Function} props.onEdit Abre la edición de ese documento.
 * @returns {object} La ficha renderizada.
 */
const DocumentCard = ({ req, theme, val, onEdit }) => {
    // 1. DISEÑO RECTANGULAR PARA INPUTS DE TEXTO (DATOS)
    if (req.tipo === 'text') {
        return (
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.border}`, bgcolor: 'white', borderLeft: `5px solid ${theme.color}`, display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease', boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.05)', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextFieldsIcon sx={{ fontSize: 18, color: COLOR.TENUE }}/>
                        <Typography variant="subtitle2" fontWeight={800} color={COLOR.TINTA} noWrap>{req.label}</Typography>
                    </Stack>
                    <Tooltip title={theme.status} arrow>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>{theme.icon}</Box>
                    </Tooltip>
                </Stack>

                <Box sx={{ bgcolor: val?.valor_texto ? COLOR.LIENZO : COLOR.RELLENO, p: 1.5, borderRadius: 2, border: '1px dashed', borderColor: val?.valor_texto ? COLOR.BORDE_FUERTE : COLOR.BORDE, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight={700} color={val?.valor_texto ? COLOR.TEXTO : COLOR.TENUE} noWrap sx={{ flexGrow: 1, mr: 1 }}>
                        {val?.valor_texto || 'No registrado'}
                    </Typography>
                    <Tooltip title="Editar Valor">
                        <IconButton size="small" onClick={onEdit} sx={{ color: COLOR.INFO, bgcolor: COLOR.INFO_FONDO, '&:hover': { bgcolor: COLOR.INFO_BORDE } }}>
                            <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Paper>
        );
    }

    // 2. DISEÑO CLÁSICO PARA DOCUMENTOS (ARCHIVOS)
    return (
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: `1px solid ${theme.border}`, bgcolor: 'white', position: 'relative', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}}>
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, bgcolor: theme.color }} />
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: 2, bgcolor: theme.bg, display: 'flex' }}>{theme.icon}</Box>
                <Chip label={theme.status} size="small" sx={{ bgcolor: theme.bg, color: theme.color, fontWeight: 700, fontSize: '0.7rem' }} />
            </Stack>

            <Typography variant="subtitle1" fontWeight={800} color={COLOR.TINTA} lineHeight={1.2} sx={{ mb: 1 }}>{req.label}</Typography>
            
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, flexGrow: 1 }}>
                <InsertDriveFileOutlinedIcon sx={{ fontSize: 16, color: COLOR.TENUE }}/>
                <Typography variant="caption" color={COLOR.APAGADO} fontWeight={600}>Documento PDF/IMG {theme.dateText && ` • Vence: ${theme.dateText}`}</Typography>
            </Stack>

            <Button fullWidth variant="outlined" onClick={onEdit} startIcon={<EditOutlinedIcon />} sx={{ mt: 'auto', borderRadius: 2, textTransform: 'none', fontWeight: 600, color: COLOR.TEXTO_SUAVE, borderColor: COLOR.BORDE_FUERTE, '&:hover': { bgcolor: COLOR.LIENZO, borderColor: COLOR.TENUE } }}>
                Gestionar Archivo
            </Button>
        </Paper>
    );
};

export default DocumentCard;