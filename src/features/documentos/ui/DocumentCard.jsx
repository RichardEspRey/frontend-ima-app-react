import React from 'react';
import { Paper, Stack, Box, Chip, Typography, Button, Tooltip, IconButton } from '@mui/material';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

const DocumentCard = ({ req, theme, val, onEdit }) => {
    // 1. DISEÑO RECTANGULAR PARA INPUTS DE TEXTO (DATOS)
    if (req.tipo === 'text') {
        return (
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.border}`, bgcolor: 'white', borderLeft: `5px solid ${theme.color}`, display: 'flex', flexDirection: 'column', transition: 'all 0.2s ease', boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.05)', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextFieldsIcon sx={{ fontSize: 18, color: '#94a3b8' }}/>
                        <Typography variant="subtitle2" fontWeight={800} color="#0f172a" noWrap>{req.label}</Typography>
                    </Stack>
                    <Tooltip title={theme.status} arrow>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>{theme.icon}</Box>
                    </Tooltip>
                </Stack>

                <Box sx={{ bgcolor: val?.valor_texto ? '#f8fafc' : '#f1f5f9', p: 1.5, borderRadius: 2, border: '1px dashed', borderColor: val?.valor_texto ? '#cbd5e1' : '#e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight={700} color={val?.valor_texto ? "#334155" : "#94a3b8"} noWrap sx={{ flexGrow: 1, mr: 1 }}>
                        {val?.valor_texto || 'No registrado'}
                    </Typography>
                    <Tooltip title="Editar Valor">
                        <IconButton size="small" onClick={onEdit} sx={{ color: '#3b82f6', bgcolor: '#eff6ff', '&:hover': { bgcolor: '#dbeafe' } }}>
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

            <Typography variant="subtitle1" fontWeight={800} color="#0f172a" lineHeight={1.2} sx={{ mb: 1 }}>{req.label}</Typography>
            
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2, flexGrow: 1 }}>
                <InsertDriveFileOutlinedIcon sx={{ fontSize: 16, color: '#94a3b8' }}/>
                <Typography variant="caption" color="#64748b" fontWeight={600}>Documento PDF/IMG {theme.dateText && ` • Vence: ${theme.dateText}`}</Typography>
            </Stack>

            <Button fullWidth variant="outlined" onClick={onEdit} startIcon={<EditOutlinedIcon />} sx={{ mt: 'auto', borderRadius: 2, textTransform: 'none', fontWeight: 600, color: '#475569', borderColor: '#cbd5e1', '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' } }}>
                Gestionar Archivo
            </Button>
        </Paper>
    );
};

export default DocumentCard;