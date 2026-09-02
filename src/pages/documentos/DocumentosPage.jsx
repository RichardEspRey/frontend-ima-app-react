import { useState } from 'react';
import { Box, Typography, Button, Grid, Stack, CircularProgress, Chip, Divider, Zoom } from '@mui/material'; 

import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { notify } from '../../shared/ui';

import DocumentCard from '../../features/documentos/ui/DocumentCard';
import ConfigRequirementModal from '../../features/documentos/ui/ConfigRequirementModal';
import EditValueModal from '../../features/documentos/ui/EditValueModal';
import {
  ESTADO_DOCUMENTO,
  REGION,
  estadoDocumento,
  porRegion,
  useCrearRequisito,
  useDocumentos,
  useEliminarRequisito,
  useGuardarDocumento,
} from '../../entities/document';
import { COLOR } from '../../shared/ui/tokens';

// Cada estado de vencimiento con su aspecto. Es una tabla porque la lógica de
// qué estado tiene un documento vive en la entidad; aquí solo se pinta.
const TEMA_POR_ESTADO = {
  [ESTADO_DOCUMENTO.SIN_CAPTURAR]: { status: 'Faltante', color: COLOR.APAGADO, bg: COLOR.LIENZO, border: COLOR.BORDE },
  [ESTADO_DOCUMENTO.VENCIDO]:      { status: 'Vencido', color: COLOR.PELIGRO, bg: COLOR.PELIGRO_FONDO, border: COLOR.PELIGRO_BORDE },
  [ESTADO_DOCUMENTO.POR_VENCER]:   { status: 'Por Vencer', color: COLOR.AVISO, bg: COLOR.AVISO_FONDO, border: COLOR.AVISO_BORDE },
  [ESTADO_DOCUMENTO.VIGENTE]:      { status: 'Vigente', color: COLOR.EXITO, bg: COLOR.EXITO_FONDO, border: '#6ee7b7' },
};

const ICONO_POR_ESTADO = {
  [ESTADO_DOCUMENTO.SIN_CAPTURAR]: <HelpOutlineIcon sx={{ color: COLOR.TENUE }} />,
  [ESTADO_DOCUMENTO.VENCIDO]:      <ErrorOutlineIcon sx={{ color: COLOR.PELIGRO }} />,
  [ESTADO_DOCUMENTO.POR_VENCER]:   <WarningAmberIcon sx={{ color: COLOR.AVISO }} />,
  [ESTADO_DOCUMENTO.VIGENTE]:      <CheckCircleIcon sx={{ color: COLOR.EXITO }} />,
};

/**
 * Centro de documentos: requisitos corporativos de México y Estados Unidos.
 *
 * @returns {object} La pantalla.
 */
const DocumentosPage = () => {
  const { data, isLoading, isError, error } = useDocumentos();
  const requisitos = data?.requisitos ?? [];
  const valores = data?.valores ?? {};

  const guardar = useGuardarDocumento();
  const crear = useCrearRequisito();
  const eliminar = useEliminarRequisito();

  const [openConfigModal, setOpenConfigModal] = useState(false);
  const [newField, setNewField] = useState({ label: '', region: 'USA', tipo: 'file', tiene_vencimiento: true });

  const [openEditModal, setOpenEditModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editData, setEditData] = useState({ valor_texto: '', fecha_vencimiento: null, file: null, currentUrl: null });

  const openEditor = (req) => {
    const val = valores[req.key_name];
    setEditItem(req);
    setEditData({
      valor_texto: val?.valor_texto || '',
      fecha_vencimiento: val?.fecha_vencimiento ? new Date(`${val.fecha_vencimiento}T00:00:00`) : null,
      file: null,
      currentUrl: val?.url_pdf || null,
    });
    setOpenEditModal(true);
  };

  const handleCreateNewField = async () => {
    if (!newField.label) return notify.aviso('Asigna un nombre al requisito');

    try {
      await crear.mutateAsync({
        label: newField.label,
        region: newField.region,
        tipo: newField.tipo,
        tieneVencimiento: newField.tiene_vencimiento,
      });
      setOpenConfigModal(false);
      setNewField({ label: '', region: 'USA', tipo: 'file', tiene_vencimiento: true });
      notify.exito('Requisito creado');
    } catch (e) {
      notify.error(e, 'No se pudo crear el requisito');
    }
  };

  const handleDeleteField = async (key_name, label) => {
    const acepto = await notify.confirmar({
      titulo: `¿Eliminar "${label}"?`,
      mensaje: 'Se ocultará del panel, pero los datos actuales se conservarán.',
      confirmar: 'Sí, eliminar',
    });
    if (!acepto) return;

    try {
      await eliminar.mutateAsync(key_name);
      notify.exito('Requisito eliminado');
    } catch (e) {
      notify.error(e, 'No se pudo eliminar el requisito');
    }
  };

  const handleSaveValue = async () => {
    try {
      await guardar.mutateAsync({
        keyName: editItem.key_name,
        valorTexto: editItem.tipo === 'text' ? editData.valor_texto : undefined,
        fechaVencimiento:
          editItem.tiene_vencimiento && editData.fecha_vencimiento
            ? editData.fecha_vencimiento.toISOString().split('T')[0]
            : undefined,
        archivo: editData.file ?? undefined,
      });
      setOpenEditModal(false);
      notify.exito('Guardado correctamente');
    } catch (e) {
      notify.error(e, 'No se pudo guardar el documento');
    }
  };

  const getCardTheme = (req) => {
    const valor = valores[req.key_name];
    const estado = estadoDocumento(req, valor);
    return {
      ...TEMA_POR_ESTADO[estado],
      icon: ICONO_POR_ESTADO[estado],
      dateText: req.tiene_vencimiento ? valor?.fecha_vencimiento : undefined,
    };
  };

  if (isLoading) return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '80vh', bgcolor: COLOR.LIENZO }}> 
          <CircularProgress size={40} thickness={4} sx={{ color: COLOR.INFO, mb: 2 }} /> 
          <Typography variant="h6" color="text.secondary" fontWeight={500}>Sincronizando panel...</Typography> 
      </Box>
  );

  if (isError) return (
      <Box sx={{ p: 4 }}>
          <Typography color="error">{error.message}</Typography>
      </Box>
  );

  const { mexico: mexReqs, usa: usaReqs } = porRegion(requisitos);

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: COLOR.LIENZO }}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 5 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} color={COLOR.TINTA} letterSpacing="-0.02em">Centro de Documentos</Typography>
            <Typography variant="subtitle1" color={COLOR.APAGADO}>Gestión dinámica de requisitos operativos y corporativos.</Typography>
          </Box>
          <Button variant="contained" disableElevation startIcon={<AddIcon />} onClick={() => setOpenConfigModal(true)} sx={{ bgcolor: COLOR.TINTA, '&:hover': { bgcolor: COLOR.TEXTO }, borderRadius: 2, fontWeight: 600, px: 3, py: 1 }}>
            Nuevo Requisito
          </Button>
      </Stack>
      
      <Stack spacing={5}>
          <Box>
              <Typography variant="h6" fontWeight={700} color={COLOR.TINTA_CLARA} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  Requisitos USA <Chip label={usaReqs.length} size="small" sx={{ bgcolor: COLOR.BORDE, fontWeight: 700 }} />
              </Typography>
              <Grid container spacing={3}>
                  {usaReqs.map((req, i) => (
                      <Zoom in style={{ transitionDelay: `${i * 50}ms` }} key={req.key_name}>
                          <Grid item xs={12} sm={6} md={4} lg={3}>
                              <DocumentCard req={req} theme={getCardTheme(req)} val={valores[req.key_name]} onEdit={() => openEditor(req)} />
                          </Grid>
                      </Zoom>
                  ))}
                  {usaReqs.length === 0 && <Typography color="text.secondary" sx={{ ml: 3, fontStyle: 'italic' }}>No hay requisitos configurados.</Typography>}
              </Grid>
          </Box>

          <Divider sx={{ borderStyle: 'dashed', borderColor: COLOR.BORDE_FUERTE }} />

          <Box>
              <Typography variant="h6" fontWeight={700} color={COLOR.TINTA_CLARA} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  Requisitos MEX <Chip label={mexReqs.length} size="small" sx={{ bgcolor: COLOR.BORDE, fontWeight: 700 }} />
              </Typography>
              <Grid container spacing={3}>
                  {mexReqs.map((req, i) => (
                      <Zoom in style={{ transitionDelay: `${i * 50}ms` }} key={req.key_name}>
                          <Grid item xs={12} sm={6} md={4} lg={3}>
                              <DocumentCard req={req} theme={getCardTheme(req)} val={valores[req.key_name]} onEdit={() => openEditor(req)} />
                          </Grid>
                      </Zoom>
                  ))}
                  {mexReqs.length === 0 && <Typography color="text.secondary" sx={{ ml: 3, fontStyle: 'italic' }}>No hay requisitos configurados.</Typography>}
              </Grid>
          </Box>
      </Stack>

      <ConfigRequirementModal 
          open={openConfigModal} onClose={() => setOpenConfigModal(false)}
          newField={newField} setNewField={setNewField} onSave={handleCreateNewField}
      />

      <EditValueModal 
          open={openEditModal} onClose={() => setOpenEditModal(false)}
          editItem={editItem} editData={editData} setEditData={setEditData}
          onSave={handleSaveValue} onDelete={() => { setOpenEditModal(false); handleDeleteField(editItem?.key_name, editItem?.label); }}
      />
    </Box>
  );
};

export default DocumentosPage;