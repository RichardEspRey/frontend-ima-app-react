import React, { useState, useMemo } from 'react';
import {
  TableRow, TableCell, IconButton, Collapse, Box, Typography,
  Table, TableHead, TableBody, Chip, Stack, Button, Tooltip
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import EditIcon from '@mui/icons-material/Edit';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

const money = (v) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'symbol'
  }).format(Number(v || 0));
};

const moneyMXN = (v) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    currencyDisplay: 'symbol'
  }).format(Number(v || 0));
};

const isImageUrl = (url = '') => /\.(png|jpe?g|gif|webp|bmp|tiff?)$/i.test(url);
const fileName = (path = '') => path.split('/').pop() || '';

// Mismo lenguaje visual que el Administrador de Viajes.
const SUB_HEADER_CELL_SX = {
  fontWeight: 700, color: '#94a3b8', fontSize: '0.68rem',
  textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e2e8f0',
};
const MICRO_LABEL_SX = {
  color: '#94a3b8', fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.68rem',
};

const GastoRow = ({ gasto, navigate, mxnRate }) => {
  const [open, setOpen] = useState(false);
  const detalles = gasto?.detalles ?? [];
  const tickets = gasto?.tickets ?? [];

  const totalCalc = useMemo(() => {
    return detalles.reduce((acc, d) => {
      const cant = parseFloat(d.cantidad_articulo ?? 0) || 0;
      const pu = parseFloat(d.precio_unitario ?? 0) || 0;
      return acc + cant * pu;
    }, 0);
  }, [detalles]);

  const totalMostrado = Number(gasto.monto_total ?? 0) > 0
    ? Number(gasto.monto_total)
    : totalCalc;

  // El gasto ya se registró en pesos (moneda MXN): usamos el monto original exacto
  // que se capturó, en vez de reconvertir el total en USD con la tasa de hoy.
  // Si se registró en USD, no hay un monto en pesos "real" que mostrar, así que
  // convertimos el total en USD con la tasa del día (misma fuente que usa el
  // formulario de Nuevo Gasto para México).
  const esMXN = String(gasto.moneda || '').toUpperCase() === 'MXN';
  const cantidadOriginal = Number(gasto.cantidad_original ?? 0);
  const rate = parseFloat(mxnRate) || 0;

  let totalMXNMostrado = null;
  let totalMXNEsConvertido = false;
  if (esMXN && cantidadOriginal > 0) {
    totalMXNMostrado = cantidadOriginal;
  } else if (rate > 0) {
    totalMXNMostrado = totalMostrado * rate;
    totalMXNEsConvertido = true;
  }

  // Resalta la columna que refleja la moneda en la que realmente se capturó el
  // gasto (según el país elegido al crearlo), la otra columna es solo una conversión.
  const esOriginalUSD = !esMXN;
  const esOriginalMXN = esMXN && !totalMXNEsConvertido;
  const originalSx = { color: '#15803d', fontWeight: 700 };
  const secundarioSx = { color: '#64748b', fontWeight: 500 };

  const lastDetail = detalles.length > 0 ? detalles[detalles.length - 1] : null;
  const lastExpenseType = lastDetail?.tipo_gasto || '—';

  // Franja de color a la izquierda de la fila según el país del gasto.
  const accentColor = esMXN ? '#0d9488' : '#4f46e5';

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell padding="checkbox" sx={{ borderLeft: `3px solid ${accentColor}` }}>
          <IconButton size="small" onClick={() => setOpen((p) => !p)} sx={{ color: '#64748b' }}>
            {open ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
          </IconButton>
        </TableCell>

        <TableCell>
          <Typography variant="body2" fontWeight={700} color="#0f172a">#{gasto.id_gasto}</Typography>
          {detalles.length > 1 && (
            <Typography variant="caption" color="#94a3b8">{detalles.length} conceptos</Typography>
          )}
        </TableCell>

        <TableCell>
          <Typography variant="body2" color="#334155" noWrap sx={{ maxWidth: 220 }} title={lastExpenseType}>
            {lastExpenseType}
          </Typography>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap', color: '#475569' }}>{gasto.fecha_gasto}</TableCell>

        <TableCell>
          <Chip
            size="small"
            label={gasto.pais || '—'}
            sx={{
              height: 22, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.04em',
              bgcolor: esMXN ? '#f0fdfa' : '#eef2ff',
              color: esMXN ? '#0f766e' : '#4338ca',
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
            <Typography variant="body2" color="#cbd5e1">—</Typography>
          ) : totalMXNEsConvertido ? (
            <Tooltip title="Convertido con la tasa de cambio de hoy (el gasto se registró en USD)">
              <Box component="span" sx={{ ...secundarioSx, cursor: 'help', borderBottom: '1px dashed #cbd5e1' }}>
                {moneyMXN(totalMXNMostrado)}
              </Box>
            </Tooltip>
          ) : (
            <Tooltip title="Monto original (el gasto se registró en MXN)" disableHoverListener={!esOriginalMXN}>
              <Box component="span" sx={esOriginalMXN ? originalSx : secundarioSx}>{moneyMXN(totalMXNMostrado)}</Box>
            </Tooltip>
          )}
        </TableCell>

        <TableCell sx={{ color: '#475569' }}>{gasto.created_name || '—'}</TableCell>

        <TableCell>
          {gasto.updated_name
            ? <Typography variant="body2" color="#475569">{gasto.updated_name}</Typography>
            : <Typography variant="body2" color="#cbd5e1">—</Typography>}
        </TableCell>

        <TableCell align="center">
          <Tooltip title="Editar gasto">
            <IconButton
              size="small"
              onClick={() => navigate(`/edit-expense/${gasto.id_gasto}`)}
              sx={{
                color: '#334155', border: '1px solid #e2e8f0', borderRadius: 1.5,
                '&:hover': { bgcolor: '#0f172a', color: '#fff', borderColor: '#0f172a' },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={10}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ my: 1.5, mx: 1, p: 2.5, border: '1px solid #e2e8f0', borderRadius: 2, bgcolor: '#fafbfc' }}>
              <Typography variant="overline" sx={MICRO_LABEL_SX}>
                Detalle del gasto #{gasto.id_gasto}
              </Typography>

              {detalles.length === 0 ? (
                <Typography variant="body2" color="#64748b" sx={{ mt: 1 }}>
                  Sin conceptos registrados.
                </Typography>
              ) : (
                <Table size="small" sx={{ mb: 3, mt: 1, bgcolor: 'white', borderRadius: 2, border: '1px solid #e2e8f0' }}>
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
                          <TableCell sx={{ color: '#0f172a', fontWeight: 600 }}>{d.tipo_gasto || '—'}</TableCell>
                          <TableCell sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                            {d.nombre_categoria || '—'}
                          </TableCell>
                          <TableCell sx={{ color: '#64748b', fontSize: '0.82rem' }}>
                            {d.nombre_subcategoria || '—'}
                          </TableCell>
                          <TableCell sx={{ color: '#334155' }}>{d.descripcion_articulo || '—'}</TableCell>
                          <TableCell align="right" sx={{ color: '#475569' }}>{cant}</TableCell>
                          <TableCell align="right" sx={{ color: '#475569' }}>{money(pu)}</TableCell>
                          <TableCell align="right" sx={{ fontWeight: 700, color: '#0f172a' }}>{money(sub)}</TableCell>
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
                  sx={{ height: 18, fontSize: '0.68rem', fontWeight: 700, bgcolor: '#e2e8f0', color: '#475569' }}
                />
              </Stack>

              {tickets.length === 0 ? (
                <Typography variant="body2" color="#94a3b8">Sin documentos adjuntos.</Typography>
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
                          sx={{ width: 132, border: '1px solid #e2e8f0', borderRadius: 2, p: 1, textAlign: 'center', bgcolor: '#fff' }}
                        >
                          {esImg ? (
                            <PhotoView src={url}>
                              <img src={url} alt={name} style={{ width: '100%', height: 84, objectFit: 'cover', borderRadius: 6, cursor: 'zoom-in' }} />
                            </PhotoView>
                          ) : (
                            <Box sx={{
                              height: 84, display: 'flex', flexDirection: 'column', alignItems: 'center',
                              justifyContent: 'center', gap: 0.5, borderRadius: 1.5, bgcolor: '#f8fafc',
                              border: '1px dashed #cbd5e1',
                            }}>
                              <InsertDriveFileOutlinedIcon sx={{ fontSize: 22, color: '#94a3b8' }} />
                              <Typography variant="caption" color="#94a3b8" sx={{ fontSize: '0.65rem' }}>
                                {t.tipo_documento || 'Doc'}
                              </Typography>
                            </Box>
                          )}
                          <Typography variant="caption" noWrap sx={{ display: 'block', mt: 0.75, color: '#64748b', fontSize: '0.65rem' }} title={name}>
                            {name}
                          </Typography>
                          <Button
                            size="small"
                            href={url}
                            target="_blank"
                            sx={{ mt: 0.25, fontSize: '0.65rem', textTransform: 'none', fontWeight: 700, color: '#334155' }}
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
