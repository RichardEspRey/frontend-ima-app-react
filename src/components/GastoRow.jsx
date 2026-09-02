import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TableRow, TableCell, IconButton, Collapse, Box, Typography,
  Table, TableHead, TableBody, Chip, Stack, Button, Tooltip
} from '@mui/material';
import { urlSegura } from '../shared/security';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import { esGastoMXN, totalUSD, totalMXN, tipoGastoPrincipal } from '../entities/expense';
import { money, moneyMXN } from '../features/expense-manager/estilos';
import { useAuthStore } from '../store/useAuthStore';
import { COLOR, TINTE } from '../shared/ui/tokens';
import { notify } from '../shared/ui';

const apiHost = import.meta.env.VITE_API_HOST;

const isImageUrl = (url = '') => /\.(png|jpe?g|gif|webp|bmp|tiff?)$/i.test(url);
const fileName = (path = '') => path.split('/').pop() || '';

const SUB_HEADER_CELL_SX = {
  fontWeight: 700, color: COLOR.TENUE, fontSize: '0.68rem',
  textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1px solid ${COLOR.BORDE}`,
};
const MICRO_LABEL_SX = {
  color: COLOR.TENUE, fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.68rem',
};

const GastoRow = ({ gasto, mxnRate, puedeEliminar = false, onEliminado }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const { user } = useAuthStore();
  const detalles = gasto?.detalles ?? [];
  const tickets = gasto?.tickets ?? [];

  const esMXN = esGastoMXN(gasto);
  const totalMostrado = useMemo(() => totalUSD(gasto), [gasto]);
  const { valor: totalMXNMostrado, esConvertido: totalMXNEsConvertido } = useMemo(
    () => totalMXN(gasto, mxnRate),
    [gasto, mxnRate],
  );

  const esOriginalUSD = !esMXN;
  const esOriginalMXN = esMXN && !totalMXNEsConvertido;
  const originalSx = { color: COLOR.EXITO, fontWeight: 700 };
  const secundarioSx = { color: COLOR.APAGADO, fontWeight: 500 };

  const eliminarGasto = async () => {
    const confirmado = await notify.confirmar({
      titulo: `¿Eliminar el gasto #${gasto.id_gasto}?`,
      formato: 'Se revertirá el stock que este gasto haya sumado al inventario.<br/>El gasto dejará de aparecer en la lista.',
      confirmar: 'Sí, eliminar',
    });

    if (!confirmado) return;

    setEliminando(true);
    try {
      const fd = new FormData();
      fd.append('op', 'deleteExpense');
      fd.append('id_gasto', gasto.id_gasto);
      fd.append('id_usuario', user?.id ?? '');

      const res = await fetch(`${apiHost}/save_expense.php`, { method: 'POST', body: fd });
      const data = await res.json();

      if (data.status === 'success') {
        notify.discreto('Gasto eliminado');
        onEliminado?.();
      } else {
        throw new Error(data.message || 'No se pudo eliminar el gasto.');
      }
    } catch (err) {
      notify.error(err.message, 'Error');
    } finally {
      setEliminando(false);
    }
  };

  const lastExpenseType = tipoGastoPrincipal(gasto) || '—';

  const accentColor = esMXN ? TINTE.TEAL.acento : TINTE.INDIGO.acento;

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell padding="checkbox" sx={{ borderLeft: `3px solid ${accentColor}` }}>
          <IconButton size="small" onClick={() => setOpen((p) => !p)} sx={{ color: COLOR.APAGADO }}>
            {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
          </IconButton>
        </TableCell>

        <TableCell>
          <Typography variant="body2" fontWeight={700} color={COLOR.TINTA}>#{gasto.id_gasto}</Typography>
          {detalles.length > 1 && (
            <Typography variant="caption" color={COLOR.TENUE}>{detalles.length} conceptos</Typography>
          )}
        </TableCell>

        <TableCell>
          <Typography variant="body2" color={COLOR.TEXTO} noWrap sx={{ maxWidth: 220 }} title={lastExpenseType}>
            {lastExpenseType}
          </Typography>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', color: COLOR.TEXTO_SUAVE }}>{gasto.fecha_gasto}</TableCell>

        <TableCell>
          <Chip
            size="small"
            label={gasto.pais || '—'}
            sx={{
              height: 22, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em',
              bgcolor: esMXN ? TINTE.TEAL.fondo : TINTE.INDIGO.fondo,
              color: esMXN ? TINTE.TEAL.texto : TINTE.INDIGO.texto,
              border: `1px solid ${esMXN ? '#99f6e4' : '#e0e7ff'}`,
            }}
          />
        </TableCell>

        <TableCell align="right">
          <Tooltip title={esOriginalUSD ? 'Monto original (el gasto se registró en USD)' : 'Conversión a dólares'}>
            <Box component="span" sx={esOriginalUSD ? originalSx : secundarioSx}>{money(totalMostrado)}</Box>
          </Tooltip>
        </TableCell>

        <TableCell align="right">
          {totalMXNMostrado === null ? (
            <Typography variant="body2" color={COLOR.BORDE_FUERTE}>—</Typography>
          ) : totalMXNEsConvertido ? (
            <Tooltip title="Convertido con la tasa de cambio de hoy (el gasto se registró en USD)">
              <Box component="span" sx={{ ...secundarioSx, cursor: 'help', borderBottom: `1px dashed ${COLOR.BORDE_FUERTE}` }}>
                {moneyMXN(totalMXNMostrado)}
              </Box>
            </Tooltip>
          ) : (
            <Tooltip title="Monto original (el gasto se registró en MXN)" disableHoverListener={!esOriginalMXN}>
              <Box component="span" sx={esOriginalMXN ? originalSx : secundarioSx}>{moneyMXN(totalMXNMostrado)}</Box>
            </Tooltip>
          )}
        </TableCell>

        <TableCell sx={{ color: COLOR.TEXTO_SUAVE }}>{gasto.created_name || '—'}</TableCell>

        <TableCell>
          {gasto.updated_name
            ? <Typography variant="body2" color={COLOR.TEXTO_SUAVE}>{gasto.updated_name}</Typography>
            : <Typography variant="body2" color={COLOR.BORDE_FUERTE}>—</Typography>}
        </TableCell>

        <TableCell align="center">
          <Tooltip title="Editar gasto">
            <IconButton
              size="small"
              onClick={() => navigate(`/edit-expense/${gasto.id_gasto}`)}
              sx={{
                color: COLOR.TEXTO, border: `1px solid ${COLOR.BORDE}`, borderRadius: 1.5,
                '&:hover': { bgcolor: COLOR.TINTA, color: COLOR.BLANCO, borderColor: COLOR.TINTA },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {puedeEliminar && (
            <Tooltip title="Eliminar gasto">
              <span>
                <IconButton
                  size="small"
                  onClick={eliminarGasto}
                  disabled={eliminando}
                  sx={{
                    ml: 0.5,
                    color: COLOR.PELIGRO, border: `1px solid ${COLOR.PELIGRO_BORDE}`, borderRadius: 1.5,
                    '&:hover': { bgcolor: COLOR.PELIGRO, color: COLOR.BLANCO, borderColor: COLOR.PELIGRO },
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ my: 1.5, mx: 1, p: 2.5, border: `1px solid ${COLOR.BORDE}`, borderRadius: 2, bgcolor: COLOR.CABECERA }}>
              <Typography variant="overline" sx={MICRO_LABEL_SX}>
                Detalle del gasto #{gasto.id_gasto}
              </Typography>

              {detalles.length === 0 ? (
                <Typography variant="body2" color={COLOR.APAGADO} sx={{ mt: 1 }}>
                  Sin conceptos registrados.
                </Typography>
              ) : (
                <Table size="small" sx={{ mb: 3, mt: 1, bgcolor: 'white', borderRadius: 2, border: `1px solid ${COLOR.BORDE}` }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={SUB_HEADER_CELL_SX}>Expense Type</TableCell>
                      <TableCell sx={SUB_HEADER_CELL_SX}>Category</TableCell>
                      <TableCell sx={SUB_HEADER_CELL_SX}>Subcategory</TableCell>
                      <TableCell sx={SUB_HEADER_CELL_SX}>Description</TableCell>
                      <TableCell align="right" sx={SUB_HEADER_CELL_SX}>Qty</TableCell>
                      <TableCell align="right" sx={SUB_HEADER_CELL_SX}>Unit Price</TableCell>
                      <TableCell align="right" sx={SUB_HEADER_CELL_SX}>Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detalles.map((d) => {
                      const cant = parseFloat(d.cantidad_articulo ?? 0) || 0;
                      const pu = parseFloat(d.precio_unitario ?? 0) || 0;
                      const sub = cant * pu;
                      
                      return (
                        <TableRow key={d.id_detalle_gasto} hover>
                          <TableCell sx={{ color: COLOR.TINTA, fontWeight: 600 }}>{d.tipo_gasto || '—'}</TableCell>
                          <TableCell sx={{ color: COLOR.APAGADO, fontSize: '0.82rem' }}>
                            {d.nombre_categoria || '—'}
                          </TableCell>
                          <TableCell sx={{ color: COLOR.APAGADO, fontSize: '0.82rem' }}>
                            {d.nombre_subcategoria || '—'}
                          </TableCell>
                          <TableCell sx={{ color: COLOR.TEXTO }}>{d.descripcion_articulo || '—'}</TableCell>
                          <TableCell align="right" sx={{ color: COLOR.TEXTO_SUAVE }}>{cant}</TableCell>
                          <TableCell align="right" sx={{ color: COLOR.TEXTO_SUAVE }}>{money(pu)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: COLOR.TINTA }}>{money(sub)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Typography variant="overline" sx={MICRO_LABEL_SX}>Documentos</Typography>
                <Chip
                  size="small"
                  label={tickets.length}
                  sx={{ height: 18, fontSize: '0.68rem', fontWeight: 700, bgcolor: COLOR.BORDE, color: COLOR.TEXTO_SUAVE }}
                />
              </Stack>

              {tickets.length === 0 ? (
                <Typography variant="body2" color={COLOR.TENUE}>Sin documentos adjuntos.</Typography>
              ) : (
                <PhotoProvider>
                  <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', gap: 1.5 }}>
                    {tickets.map((t) => {
                      const url = t.url || t.ruta_archivo;
                      const name = t.nombre_original || fileName(url);
                      const esImg = isImageUrl(url);
                      return (
                        <Box
                          key={t.id_documento}
                          sx={{ width: 132, border: `1px solid ${COLOR.BORDE}`, borderRadius: 2, p: 1, textAlign: 'center', bgcolor: COLOR.BLANCO }}
                        >
                          {esImg ? (
                            <PhotoView src={url}>
                              <img src={url} alt={name} style={{ width: '100%', height: 84, objectFit: 'cover', borderRadius: 6, cursor: 'zoom-in' }} />
                            </PhotoView>
                          ) : (
                            <Box sx={{
                              height: 84, display: 'flex', flexDirection: 'column', alignItems: 'center',
                              justifyContent: 'center', gap: 0.5, borderRadius: 1.5, bgcolor: COLOR.LIENZO,
                              border: `1px dashed ${COLOR.BORDE_FUERTE}`,
                            }}>
                              <InsertDriveFileOutlinedIcon sx={{ fontSize: 22, color: COLOR.TENUE }} />
                              <Typography variant="caption" color={COLOR.TENUE} sx={{ fontSize: '0.65rem' }}>
                                {t.tipo_documento || 'Doc'}
                              </Typography>
                            </Box>
                          )}
                          <Typography variant="caption" noWrap sx={{ display: 'block', mt: 0.75, color: COLOR.APAGADO, fontSize: '0.65rem' }} title={name}>
                            {name}
                          </Typography>
                          <Button
                            size="small"
                            href={urlSegura(url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ mt: 0.25, fontSize: '0.65rem', textTransform: 'none', fontWeight: 700, color: COLOR.TEXTO }}
                          >
                            Ver
                          </Button>
                        </Box>
                      );
                    })}
                  </Stack>
                </PhotoProvider>
              )}
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default GastoRow;
