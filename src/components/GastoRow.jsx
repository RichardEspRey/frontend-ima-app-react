import React, { useState, useMemo } from 'react';
import {
  TableRow, TableCell, IconButton, Collapse, Box, Typography,
  Table, TableHead, TableBody, Divider, Chip, Stack, Button
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

const money = (v) => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: 'USD',
    currencyDisplay: 'symbol' 
  }).format(Number(v || 0));
};

const isImageUrl = (url = '') => /\.(png|jpe?g|gif|webp|bmp|tiff?)$/i.test(url);
const fileName = (path = '') => path.split('/').pop() || '';

const GastoRow = ({ gasto, navigate }) => {
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

  const lastDetail = detalles.length > 0 ? detalles[detalles.length - 1] : null;
  const lastExpenseType = lastDetail?.tipo_gasto || '—';

  return (
    <>
      <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell padding="checkbox">
          <IconButton size="small" onClick={() => setOpen((p) => !p)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>#{gasto.id_gasto}</TableCell>
        <TableCell>{lastExpenseType}</TableCell>
        <TableCell>{gasto.fecha_gasto}</TableCell>
        <TableCell>{gasto.pais}</TableCell>
        <TableCell><strong>{money(totalMostrado)}</strong></TableCell>
        <TableCell align="left">
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate(`/edit-expense/${gasto.id_gasto}`)}
          >
            Editar
          </Button>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ m: 1, p: 2, border: '1px solid #eee', borderRadius: 2, bgcolor: '#f9f9f9' }}>
              <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1rem', mb: 1.5 }}>
                Expense details #{gasto.id_gasto}
              </Typography>

              {detalles.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No details available.
                </Typography>
              ) : (
                <Table size="small" sx={{ mb: 2 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Expense Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Subcategory</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Qty</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Unit Price</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>Subtotal</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detalles.map((d) => {
                      const cant = parseFloat(d.cantidad_articulo ?? 0) || 0;
                      const pu = parseFloat(d.precio_unitario ?? 0) || 0;
                      const sub = cant * pu;
                      
                      return (
                        <TableRow key={d.id_detalle_gasto}>
                          <TableCell>{d.tipo_gasto || '—'}</TableCell>
                          <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                            {d.nombre_subcategoria || '—'}
                          </TableCell>
                          <TableCell>{d.descripcion_articulo || '—'}</TableCell>
                          <TableCell align="right">{cant}</TableCell>
                          <TableCell align="right">{money(pu)}</TableCell>
                          <TableCell align="right">{money(sub)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>Tickets</Typography>
                <Chip size="small" label={tickets.length} />
              </Box>

              {tickets.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No tickets attached.</Typography>
              ) : (
                <PhotoProvider>
                  <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
                    {tickets.map((t) => {
                      const url = t.url || t.ruta_archivo;
                      const name = t.nombre_original || fileName(url);
                      const esImg = isImageUrl(url);
                      return (
                        <Box key={t.id_documento} sx={{ width: 120, border: '1px solid #e0e0e0', borderRadius: 1, p: 1, textAlign: 'center', bgcolor: '#fff' }}>
                          {esImg ? (
                            <PhotoView src={url}>
                              <img src={url} alt={name} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 4, cursor: 'zoom-in' }} />
                            </PhotoView>
                          ) : (
                            <Box sx={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1, border: '1px dashed #ccc', fontSize: 11 }}>
                              {t.tipo_documento || 'Doc'}
                            </Box>
                          )}
                          <Button size="small" sx={{ mt: 0.5, fontSize: '0.65rem' }} href={url} target="_blank">View</Button>
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