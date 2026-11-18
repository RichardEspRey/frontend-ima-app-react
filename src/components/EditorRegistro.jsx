import { Box, Button, Card, CardActionArea, CardMedia, Chip, CircularProgress, Grid, Paper, Stack, Typography } from '@mui/material';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import {
  PAGE_SHELL_SX, PAGE_OVERLINE_SX, PAGE_TITLE_SX, CARD_SX, SECTION_LABEL_SX, DARK_BTN_SX, GHOST_BTN_SX, CHIP_SX,
} from '../styles/estilosTabla';

const BOTON_BORRAR_SX = {
  ...GHOST_BTN_SX,
  color: '#b91c1c',
  borderColor: '#fecaca',
  '&:hover': { bgcolor: '#fef2f2', borderColor: '#fca5a5' },
};

const CHIP_NEUTRO_SX = { ...CHIP_SX, bgcolor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' };

const ES_IMAGEN = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

export const CargandoEditor = () => (
  <Box sx={{ ...PAGE_SHELL_SX, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
    <CircularProgress size={28} />
  </Box>
);

export const EditorShell = ({ seccion, titulo, descripcion, onCancelar, onEliminar, onGuardar, children }) => (
  <Box sx={PAGE_SHELL_SX}>
    <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4} flexWrap="wrap" gap={2}>
      <Box>
        <Typography variant="overline" sx={PAGE_OVERLINE_SX}>{seccion}</Typography>
        <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em" sx={PAGE_TITLE_SX}>
          {titulo}
        </Typography>
        {descripcion && (
          <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>{descripcion}</Typography>
        )}
      </Box>
      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
        <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={onCancelar} sx={GHOST_BTN_SX}>Cancel</Button>
        <Button variant="outlined" startIcon={<DeleteOutlineIcon />} onClick={onEliminar} sx={BOTON_BORRAR_SX}>Delete</Button>
        <Button variant="contained" startIcon={<SaveIcon />} onClick={onGuardar} sx={DARK_BTN_SX}>Save Changes</Button>
      </Stack>
    </Stack>
    {children}
  </Box>
);

export const TarjetaEditor = ({ titulo, extra, children, sx }) => (
  <Paper elevation={0} sx={{ ...CARD_SX, height: '100%', ...sx }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
      <Typography variant="overline" sx={SECTION_LABEL_SX}>{titulo}</Typography>
      {extra}
    </Stack>
    {children}
  </Paper>
);

export const ResumenRegistro = ({ datos }) => (
  <Paper elevation={0} sx={{ ...CARD_SX, mb: 3 }}>
    <Grid container spacing={2}>
      {datos.map(({ etiqueta, valor, destacado }) => (
        <Grid key={etiqueta} size={{ xs: 6, md: 12 / datos.length }}>
          <Typography variant="caption" sx={{ ...SECTION_LABEL_SX, display: 'block', textTransform: 'uppercase' }}>
            {etiqueta}
          </Typography>
          <Typography
            variant={destacado ? 'h6' : 'body1'}
            fontWeight={destacado ? 800 : 600}
            color={destacado ? '#0f172a' : '#334155'}
            sx={{ mt: 0.25, fontVariantNumeric: 'tabular-nums' }}
          >
            {valor || '—'}
          </Typography>
        </Grid>
      ))}
    </Grid>
  </Paper>
);

export const TicketsGaleria = ({ tickets }) => (
  <TarjetaEditor
    titulo="Tickets y evidencia"
    extra={<Chip size="small" label={`${tickets.length} ${tickets.length === 1 ? 'archivo' : 'archivos'}`} sx={CHIP_NEUTRO_SX} />}
  >
    {tickets.length === 0 ? (
      <Box sx={{ py: 5, textAlign: 'center', border: '1px dashed #e2e8f0', borderRadius: 2, bgcolor: '#f8fafc' }}>
        <DescriptionOutlinedIcon sx={{ color: '#cbd5e1', fontSize: 36 }} />
        <Typography variant="body2" color="#94a3b8" sx={{ mt: 1 }}>Este registro no tiene tickets adjuntos.</Typography>
      </Box>
    ) : (
      <PhotoProvider>
        <Grid container spacing={1.5}>
          {tickets.map((item) => (
            <Grid key={item.id} size={{ xs: 6, sm: 4 }}>
              <Card variant="outlined" sx={{ borderRadius: 2, borderColor: '#e2e8f0', overflow: 'hidden', '&:hover': { borderColor: '#cbd5e1', boxShadow: '0 4px 12px rgba(15,23,42,0.08)' } }}>
                {ES_IMAGEN.includes(item.ext) ? (
                  <PhotoView src={item.url}>
                    <CardMedia component="img" height="120" image={item.url} alt={`Ticket ${item.id}`} sx={{ objectFit: 'cover', cursor: 'zoom-in' }} />
                  </PhotoView>
                ) : (
                  <CardActionArea href={item.url} target="_blank" rel="noreferrer">
                    <Stack alignItems="center" justifyContent="center" spacing={0.5} sx={{ height: 120, bgcolor: '#f8fafc' }}>
                      <DescriptionOutlinedIcon sx={{ fontSize: 34, color: '#b91c1c' }} />
                      <Typography variant="caption" fontWeight={600} color="#475569">
                        {(item.ext || 'archivo').toUpperCase()} · Ver
                      </Typography>
                    </Stack>
                  </CardActionArea>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      </PhotoProvider>
    )}
  </TarjetaEditor>
);
