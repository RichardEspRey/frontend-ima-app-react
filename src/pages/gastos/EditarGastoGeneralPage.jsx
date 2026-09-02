import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Paper, Typography, TextField, Button,
  Stack, Divider, IconButton, CircularProgress, Chip, Tooltip
} from '@mui/material';
import { urlSegura } from '../../shared/security';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SaveIcon from '@mui/icons-material/Save';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

import useFetchSubcategories from '../../hooks/expense_hooks/useFetchSubcategories';
import useFetchCategories from '../../hooks/expense_hooks/useFetchCategories';
import useFetchExpenseTypes from '../../hooks/expense_hooks/useFetchExpenseTypes';
import useFetchExchangeRate from '../../hooks/useFetchExchangeRate';
import { useAuthStore } from '../../store/useAuthStore';
import FieldLabel from '../../components/Gastos/FieldLabel';
import {
  SECTION_LABEL_SX, CARD_SX, DARK_BTN_SX, GHOST_BTN_SX,
  DATEPICKER_CSS, money,
} from '../../features/expense-manager/estilos';
import { archivoDelEvento, GRUPOS_ARCHIVO } from '../../shared/security';
import { COLOR, TINTE } from '../../shared/ui/tokens';
import { SelectorBusqueda } from '../../shared/ui';

// La app móvil puede subir el "ticket" como PDF escaneado en vez de imagen
// (ej. archivos "scan_*.pdf"), no solo JPG/PNG. Un <img> no puede mostrar un PDF.
const isImageUrl = (url = '') => /\.(png|jpe?g|gif|webp|bmp|tiff?)$/i.test(url);

/**
 * Edición de un gasto general, con sus renglones y sus archivos.
 *
 * Se llega desde el Expense Manager. Es la pantalla donde se corrige lo que la
 * gente capturó desde la aplicación móvil: reclasificar un renglón, ajustar un
 * importe, o adjuntar la factura que faltaba.
 *
 * @returns {object} La pantalla renderizada.
 */
const ExpenseEdit = () => {
  const { id_gasto } = useParams();
  const navigate = useNavigate();
  const apiHost = import.meta.env.VITE_API_HOST;
  const { user } = useAuthStore();

  const [country, setCountry] = useState(null);
  const [expenseDate, setExpenseDate] = useState(new Date());
  const [totalAmount, setTotalAmount] = useState('0.00');
  // La columna "Total (MX)" de la tabla sale de cantidad_original: sin estos
  // campos un gasto en pesos no se puede corregir.
  const [originalAmount, setOriginalAmount] = useState('');
  const { exchangeRate, setExchangeRate, fetchExchangeRate } = useFetchExchangeRate();
  const [expenseDetails, setExpenseDetails] = useState([]);
  
  const [deletedDetails, setDeletedDetails] = useState([]);
  const [deletedFiles, setDeletedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const { expenseTypes, loading: typesLoading } = useFetchExpenseTypes();
  const { maintenanceCategories, loading: catLoading } = useFetchCategories();
  const { subcategories, loading: subLoading } = useFetchSubcategories();
  
  const [files, setFiles] = useState({ facturaPdf: null, ticketJpg: null });

  const countries = [
    { value: 'MX', label: 'México' },
    { value: 'US', label: 'Estados Unidos' },
  ];

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        setLoading(true);
        const fd = new FormData();
        fd.append('op', 'getGastoById');
        fd.append('id_gasto', id_gasto);

        const res = await fetch(`${apiHost}/save_expense.php`, { method: 'POST', body: fd });
        const json = await res.json();

        if (json.status !== 'success') throw new Error(json.message);

        const data = json.data;
        
        setCountry(countries.find(c => c.value === data.pais) || null);
        if (data.fecha_gasto) setExpenseDate(new Date(`${data.fecha_gasto}T00:00:00`));
        setTotalAmount(parseFloat(data.monto_total || 0).toFixed(2));
        setOriginalAmount(data.cantidad_original ?? '');
        setExchangeRate(data.tipo_cambio ?? '');

        if (Array.isArray(data.detalles)) {
            const mapped = data.detalles.map(d => ({
                id: d.id_detalle_gasto,
                expenseType: d.id_tipo_gasto || null,
                category: d.id_categoria || null,
                subcategory: d.id_subcategoria || null,
                itemDescription: d.descripcion_articulo || '',
                price: d.precio_unitario || '',
                quantity: d.cantidad_articulo || '1'
            }));
            setExpenseDetails(mapped);
        }

        const ticket = data.tickets?.find(t => t.tipo_documento?.includes('Ticket'));
        const factura = data.tickets?.find(t => t.tipo_documento?.includes('Factura'));
        setFiles({
          ticketJpg: ticket ? { id_documento: ticket.id_documento, name: ticket.nombre_original, url: ticket.url } : null,
          facturaPdf: factura ? { id_documento: factura.id_documento, name: factura.nombre_original, url: factura.url } : null,
        });

      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchExpense();
  }, [id_gasto, apiHost]);

  const handleDetailChange = (id, field, value) => {
    setExpenseDetails(prev => prev.map(d => {
        if (d.id !== id) return d;
        const updated = { ...d, [field]: value };
        
        if (field === 'expenseType') {
            updated.category = null;
            updated.subcategory = null;
        }
        if (field === 'category') {
          const propias = subcategories.filter(sub => String(sub.id_categoria) === String(value));
          updated.subcategory = propias.length === 1 ? propias[0].value : null;
        }
        return updated;
    }));
  };

  const handleRemoveDetail = (id) => {
      setDeletedDetails(p => [...p, id]);
      setExpenseDetails(p => p.filter(d => d.id !== id));
  };

  const handleAddDetail = () => {
      setExpenseDetails(p => [...p, {
          id: `new-${Date.now()}`,
          expenseType: null, category: null, subcategory: null,
          itemDescription: '', price: '', quantity: '1'
      }]);
  };

  const handleFileChange = async (type, e) => {
      const grupo = type === 'facturaPdf' ? GRUPOS_ARCHIVO.SOLO_PDF : GRUPOS_ARCHIVO.IMAGEN;
      const file = await archivoDelEvento(e, { grupo });
      if (file) setFiles(p => ({ ...p, [type]: file }));
  };

  const handleRemoveFile = (type) => {
      if (files[type]?.id_documento) setDeletedFiles(p => [...p, files[type].id_documento]);
      setFiles(p => ({ ...p, [type]: null }));
  };

  const esMXN = country?.value === 'MX';

  const tasaValida = parseFloat(exchangeRate) > 0;
  const faltaTasa = esMXN && !tasaValida;
  const fechaISO = expenseDate instanceof Date && !isNaN(expenseDate)
    ? `${expenseDate.getFullYear()}-${String(expenseDate.getMonth() + 1).padStart(2, '0')}-${String(expenseDate.getDate()).padStart(2, '0')}`
    : null;
  const traerTasaDelGasto = () => fetchExchangeRate(fechaISO);

  const handleCountryChange = (opt) => {
    setCountry(opt);
    if (opt?.value === 'MX' && !(parseFloat(exchangeRate) > 0)) fetchExchangeRate(fechaISO);
  };

  useEffect(() => {
    const amount = parseFloat(originalAmount);
    if (!amount) return;
    if (esMXN) {
      const rate = parseFloat(exchangeRate) || 0;
      if (!rate) return;
      setTotalAmount((amount / rate).toFixed(2));
    } else {
      setTotalAmount(amount.toFixed(2));
    }
  }, [originalAmount, exchangeRate, esMXN]);

  const detailsSum = useMemo(() => expenseDetails.reduce((acc, d) => {
      const p = parseFloat(d.price) || 0;
      const q = parseFloat(d.quantity) || 0;
      return acc + p * q;
  }, 0), [expenseDetails]);

  const handleSubmit = async () => {
      if (faltaTasa) {
        return Swal.fire(
          'Falta el tipo de cambio',
          'Un gasto en pesos necesita un tipo de cambio mayor a cero: sin él, el Total (USD) se queda con el monto en pesos.',
          'warning',
        );
      }
      setSaving(true);
      try {
        const fd = new FormData();
        fd.append("op", "updateExpense");
        fd.append("id_gasto", id_gasto);
        fd.append("pais", country?.value || '');
        fd.append("fecha_gasto", expenseDate.toISOString().split('T')[0]);
        fd.append("moneda", esMXN ? 'MXN' : 'USD');
        fd.append("monto_total", totalAmount);
        // El backend solo escribe las columnas que recibe: omitir las vacías
        // evita borrar lo que ya tenía el gasto.
        if (originalAmount !== '' && originalAmount !== null) fd.append("cantidad_original", originalAmount);
        if (esMXN && exchangeRate) fd.append("tipo_cambio", exchangeRate);
        fd.append("id_usuario", user?.id);

        const detailsToSend = expenseDetails.map(d => ({
            id_detalle_gasto: String(d.id).startsWith('new') ? null : d.id,
            id_tipo_gasto: d.expenseType,
            descripcion_articulo: d.itemDescription,
            precio_unitario: d.price,
            cantidad_articulo: d.quantity,
            id_categoria_mantenimiento: d.category || null,
            id_subcategoria_mantenimiento: d.subcategory || null
        }));
        fd.append("detalles", JSON.stringify(detailsToSend));
        
        if (deletedDetails.length) fd.append("eliminados", JSON.stringify(deletedDetails));
        if (deletedFiles.length) fd.append("archivos_eliminados", JSON.stringify(deletedFiles));

        if (files.facturaPdf instanceof File) fd.append("facturaPdf", files.facturaPdf);
        if (files.ticketJpg instanceof File) fd.append("ticketJpg", files.ticketJpg);

        const res = await fetch(`${apiHost}/save_expense.php`, { method: "POST", body: fd });
        const json = await res.json();

        if (json.status === "success") {
            Swal.fire("Éxito", "Gasto actualizado", "success");
            navigate('/admin-gastos-generales');
        } else throw new Error(json.message);

      } catch (err) {
          Swal.fire("Error", err.message, 'error');
      } finally {
          setSaving(false);
      }
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: COLOR.LIENZO, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', pt: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: '100vh', bgcolor: COLOR.LIENZO }}>
      <style>{DATEPICKER_CSS}</style>

      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="overline" sx={{ ...SECTION_LABEL_SX, letterSpacing: '0.12em', fontSize: '0.7rem', lineHeight: 1 }}>
            Gastos · Edición
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 0.25 }}>
            <Typography variant="h4" fontWeight={800} color={COLOR.TINTA} letterSpacing="-0.02em">
              Gasto #{id_gasto}
            </Typography>
            <Chip
              size="small"
              label={esMXN ? 'MXN' : 'USD'}
              sx={{
                height: 22, fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.04em',
                bgcolor: esMXN ? TINTE.TEAL.fondo : TINTE.INDIGO.fondo,
                color: esMXN ? TINTE.TEAL.texto : TINTE.INDIGO.texto,
                border: `1px solid ${esMXN ? '#99f6e4' : '#e0e7ff'}`,
              }}
            />
          </Stack>
          <Typography variant="body2" color={COLOR.APAGADO} sx={{ mt: 0.5 }}>
            Actualiza los datos generales, los conceptos y los documentos del gasto.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={GHOST_BTN_SX}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={18} sx={{ color: COLOR.BLANCO }} /> : <SaveIcon />}
            sx={DARK_BTN_SX}
          >
            {saving ? 'Guardando…' : 'Guardar Cambios'}
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        <Grid
          size={{
            xs: 12,
            md: 8
          }}>
          <Paper elevation={0} sx={{ ...CARD_SX, mb: 3 }}>
            <Typography variant="overline" sx={SECTION_LABEL_SX}>Datos Generales</Typography>
            <Grid container spacing={2} sx={{ mt: 0.25 }}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3
                }}>
                <FieldLabel>País</FieldLabel>
                <SelectorBusqueda
                  value={country} onChange={handleCountryChange}
                  options={countries}
                  placeholder="Seleccionar…"
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3
                }}>
                <FieldLabel>Fecha del Gasto</FieldLabel>
                <DatePicker
                  selected={expenseDate}
                  onChange={setExpenseDate}
                  dateFormat="dd/MM/yyyy"
                  className="expense-datepicker"
                  wrapperClassName="expense-datepicker-wrapper"
                  popperClassName="expense-datepicker-popper"
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3
                }}>
                <FieldLabel>Monto Original ({esMXN ? 'MXN' : 'USD'})</FieldLabel>
                <TextField
                  fullWidth size="small" type="number" value={originalAmount}
                  onChange={e => setOriginalAmount(e.target.value)}
                  placeholder="Sin registrar"
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>
              {esMXN && (
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 3
                  }}>
                  <FieldLabel>Tipo de Cambio</FieldLabel>
                  <TextField
                    fullWidth size="small" type="number" value={exchangeRate}
                    onChange={e => setExchangeRate(e.target.value)}
                    error={faltaTasa}
                    helperText={faltaTasa ? 'Requerido para convertir a dólares' : ''}
                    InputProps={{
                      sx: { borderRadius: 2 },
                      endAdornment: (
                        <Tooltip title={`Traer la tasa del ${expenseDate?.toLocaleDateString?.('es-MX') || 'día del gasto'}`}>
                          <Button
                            size="small"
                            onClick={traerTasaDelGasto}
                            sx={{ textTransform: 'none', fontWeight: 700, minWidth: 0, px: 1, color: COLOR.TEXTO }}
                          >
                            Buscar
                          </Button>
                        </Tooltip>
                      ),
                    }}
                  />
                </Grid>
              )}
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 3
                }}>
                <FieldLabel>Total (USD)</FieldLabel>
                <TextField
                  fullWidth size="small" type="number" value={totalAmount}
                  onChange={e => setTotalAmount(e.target.value)}
                  InputProps={{ sx: { borderRadius: 2 } }}
                />
              </Grid>
            </Grid>
            {esMXN && (
              faltaTasa ? (
                <Typography variant="caption" sx={{ display: 'block', mt: 2, color: COLOR.PELIGRO, fontWeight: 600 }}>
                  Sin tipo de cambio no se puede convertir a dólares: el Total (USD) que ves es el monto en pesos, no una conversión. Pulsa &quot;Buscar&quot; para traer la tasa de la fecha del gasto, o escríbela.
                </Typography>
              ) : (
                <Typography variant="caption" color={COLOR.TENUE} sx={{ display: 'block', mt: 2 }}>
                  El total en USD se recalcula solo al cambiar el monto original o el tipo de cambio; también puedes escribirlo a mano.
                </Typography>
              )
            )}
          </Paper>

          <Paper elevation={0} sx={CARD_SX}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="overline" sx={SECTION_LABEL_SX}>Conceptos</Typography>
                <Typography variant="body2" color={COLOR.APAGADO}>
                  {expenseDetails.length} concepto{expenseDetails.length === 1 ? '' : 's'} en este gasto
                </Typography>
              </Box>
              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={handleAddDetail} sx={{ ...GHOST_BTN_SX, py: 0.75 }}>
                Agregar
              </Button>
            </Stack>

            {expenseDetails.length === 0 ? (
              <Box sx={{
                py: 6, textAlign: 'center', borderRadius: 2, border: `1px dashed ${COLOR.BORDE_FUERTE}`, bgcolor: COLOR.CABECERA,
              }}>
                <ReceiptLongOutlinedIcon sx={{ fontSize: 28, color: COLOR.BORDE_FUERTE }} />
                <Typography variant="body2" color={COLOR.APAGADO} fontWeight={600} sx={{ mt: 1 }}>
                  Este gasto no tiene conceptos.
                </Typography>
                <Typography variant="caption" color={COLOR.TENUE}>Agrega al menos uno antes de guardar.</Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {expenseDetails.map((detail, index) => {
                  const relevantCategories = maintenanceCategories.filter(c => String(c.id_tipo_gasto) === String(detail.expenseType));
                  const hasCategories = relevantCategories.length > 0;

                  const relevantSubs = subcategories.filter(s => String(s.id_categoria) === String(detail.category));
                  const hasSubcategories = relevantSubs.length > 0;

                  let mdSelectSize = 12;
                  if (hasCategories && hasSubcategories) mdSelectSize = 4;
                  else if (hasCategories) mdSelectSize = 6;

                  const lineTotal = (parseFloat(detail.price) || 0) * (parseFloat(detail.quantity) || 0);

                  return (
                    <Paper
                      key={detail.id}
                      elevation={0}
                      sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${COLOR.BORDE}`, bgcolor: COLOR.CABECERA }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{
                            width: 22, height: 22, borderRadius: '50%', bgcolor: COLOR.TINTA, color: COLOR.BLANCO,
                            fontSize: '0.7rem', fontWeight: 700,
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {index + 1}
                          </Box>
                          <Typography variant="caption" sx={SECTION_LABEL_SX}>Concepto</Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" fontWeight={700} color={COLOR.TINTA}>
                            {money(lineTotal)}
                          </Typography>
                          <Tooltip title="Eliminar concepto">
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveDetail(detail.id)}
                              sx={{ color: COLOR.TENUE, '&:hover': { color: COLOR.PELIGRO, bgcolor: COLOR.PELIGRO_FONDO } }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>

                      <Divider sx={{ borderColor: COLOR.BORDE, mb: 2 }} />

                      <Grid container spacing={2}>
                        <Grid
                          size={{
                            xs: 12,
                            md: mdSelectSize
                          }}>
                          <FieldLabel>Tipo de Gasto</FieldLabel>
                          <SelectorBusqueda 
                            options={expenseTypes} 
                            value={expenseTypes.find(t => String(t.value) === String(detail.expenseType)) || null}
                            onChange={opt => handleDetailChange(detail.id, 'expenseType', opt?.value)}
                            isLoading={typesLoading}
                            placeholder="Seleccionar…"
                          />
                        </Grid>
                        
                        {hasCategories && (
                          <Grid
                            size={{
                              xs: 12,
                              md: mdSelectSize
                            }}>
                            <FieldLabel>Categoría</FieldLabel>
                            <SelectorBusqueda 
                              options={relevantCategories}
                              value={relevantCategories.find(c => c.value === detail.category) || null}
                              onChange={opt => handleDetailChange(detail.id, 'category', opt?.value)}
                              isLoading={catLoading}
                              placeholder="Seleccionar…"
                            />
                          </Grid>
                        )}

                        {hasSubcategories && (
                          <Grid
                            size={{
                              xs: 12,
                              md: mdSelectSize
                            }}>
                            <FieldLabel>Subcategoría</FieldLabel>
                            <SelectorBusqueda 
                              options={relevantSubs}
                              value={relevantSubs.find(s => s.value === detail.subcategory) || null}
                              onChange={opt => handleDetailChange(detail.id, 'subcategory', opt?.value)}
                              isDisabled={!detail.category}
                              isLoading={subLoading}
                              placeholder="Seleccionar…"
                            />
                          </Grid>
                        )}

                        <Grid
                          size={{
                            xs: 12,
                            md: 8
                          }}>
                          <FieldLabel>Descripción</FieldLabel>
                          <TextField
                            fullWidth size="small" placeholder="Descripción del artículo o servicio"
                            value={detail.itemDescription}
                            onChange={e => handleDetailChange(detail.id, 'itemDescription', e.target.value)}
                            InputProps={{ sx: { borderRadius: 2, bgcolor: COLOR.BLANCO } }}
                          />
                        </Grid>
                        <Grid
                          size={{
                            xs: 6,
                            md: 2
                          }}>
                          <FieldLabel>Precio</FieldLabel>
                          <TextField
                            fullWidth size="small" type="number"
                            value={detail.price}
                            onChange={e => handleDetailChange(detail.id, 'price', e.target.value)}
                            InputProps={{ sx: { borderRadius: 2, bgcolor: COLOR.BLANCO } }}
                          />
                        </Grid>
                        <Grid
                          size={{
                            xs: 6,
                            md: 2
                          }}>
                          <FieldLabel>Cantidad</FieldLabel>
                          <TextField
                            fullWidth size="small" type="number"
                            value={detail.quantity}
                            onChange={e => handleDetailChange(detail.id, 'quantity', e.target.value)}
                            InputProps={{ sx: { borderRadius: 2, bgcolor: COLOR.BLANCO } }}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 4
          }}>
          <Box sx={{ position: 'sticky', top: 24 }}>
            <Paper elevation={0} sx={{ ...CARD_SX, mb: 3 }}>
              <Typography variant="overline" sx={SECTION_LABEL_SX}>Resumen</Typography>

              <Typography variant="h3" fontWeight={800} color={COLOR.TINTA} letterSpacing="-0.03em" sx={{ mt: 1 }}>
                {money(totalAmount)}
              </Typography>
              <Typography variant="caption" color={COLOR.TENUE}>Total capturado (USD)</Typography>

              <Divider sx={{ borderColor: COLOR.RELLENO, my: 2 }} />

              <Stack spacing={1.25}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color={COLOR.APAGADO}>País</Typography>
                  <Typography variant="body2" fontWeight={600} color={COLOR.TINTA}>{country?.label || '—'}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color={COLOR.APAGADO}>Fecha del gasto</Typography>
                  <Typography variant="body2" fontWeight={600} color={COLOR.TINTA}>{expenseDate.toLocaleDateString()}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color={COLOR.APAGADO}>Monto original</Typography>
                  <Typography variant="body2" fontWeight={600} color={originalAmount === '' ? COLOR.BORDE_FUERTE : COLOR.TINTA}>
                    {originalAmount === ''
                      ? 'Sin registrar'
                      : `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(Number(originalAmount) || 0)} ${esMXN ? 'MXN' : 'USD'}`}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color={COLOR.APAGADO}>Conceptos</Typography>
                  <Typography variant="body2" fontWeight={600} color={COLOR.TINTA}>{expenseDetails.length}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color={COLOR.APAGADO}>Suma de conceptos</Typography>
                  <Typography variant="body2" fontWeight={600} color={COLOR.TINTA}>
                    {new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(detailsSum)}
                  </Typography>
                </Stack>
              </Stack>

              {esMXN && (
                <Typography variant="caption" color={COLOR.TENUE} sx={{ display: 'block', mt: 2 }}>
                  Este gasto se capturó en pesos: los precios de los conceptos están en MXN y el total en USD.
                </Typography>
              )}
            </Paper>

            <Paper elevation={0} sx={CARD_SX}>
              <Typography variant="overline" sx={SECTION_LABEL_SX}>Documentos</Typography>

              <Box sx={{ mt: 1.5, mb: 3 }}>
                <FieldLabel>Factura (PDF)</FieldLabel>
                {files.facturaPdf ? (
                  <Paper
                    elevation={0}
                    sx={{ p: 1.25, borderRadius: 2, border: `1px solid ${COLOR.BORDE}`, bgcolor: COLOR.CABECERA, display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <InsertDriveFileOutlinedIcon sx={{ fontSize: 20, color: COLOR.TENUE }} />
                    <Typography variant="caption" noWrap sx={{ flexGrow: 1, color: COLOR.TEXTO }} title={files.facturaPdf.name}>
                      {files.facturaPdf.name || 'Archivo actual'}
                    </Typography>
                    {files.facturaPdf.url && (
                      <Button size="small" href={urlSegura(files.facturaPdf.url)} target="_blank" rel="noopener noreferrer"
                        sx={{ textTransform: 'none', fontWeight: 700, color: COLOR.TEXTO, minWidth: 0 }}>
                        Ver
                      </Button>
                    )}
                    <Tooltip title="Quitar archivo">
                      <IconButton size="small" onClick={() => handleRemoveFile('facturaPdf')}
                        sx={{ color: COLOR.TENUE, '&:hover': { color: COLOR.PELIGRO, bgcolor: COLOR.PELIGRO_FONDO } }}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                ) : (
                  <Button variant="outlined" component="label" fullWidth startIcon={<AttachFileIcon />} sx={GHOST_BTN_SX}>
                    Subir PDF
                    <input hidden type="file" accept="application/pdf" onChange={e => handleFileChange('facturaPdf', e)} />
                  </Button>
                )}
              </Box>

              <Box>
                <FieldLabel>Ticket (Imagen o PDF)</FieldLabel>
                {files.ticketJpg ? (() => {
                  const ticketUrl = files.ticketJpg.url || (files.ticketJpg instanceof File ? URL.createObjectURL(files.ticketJpg) : '');
                  const ticketIsImage = files.ticketJpg instanceof File
                    ? files.ticketJpg.type?.startsWith('image/')
                    : isImageUrl(ticketUrl);
                  return (
                    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 2, border: `1px solid ${COLOR.BORDE}`, bgcolor: COLOR.CABECERA }}>
                      {ticketIsImage ? (
                        <PhotoProvider>
                          <PhotoView src={ticketUrl}>
                            <img
                              src={ticketUrl}
                              alt="ticket"
                              style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 8, cursor: 'zoom-in', display: 'block' }}
                            />
                          </PhotoView>
                        </PhotoProvider>
                      ) : (
                        <Box sx={{
                          height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center',
                          justifyContent: 'center', gap: 1, bgcolor: COLOR.BLANCO, borderRadius: 1.5, border: `1px dashed ${COLOR.BORDE_FUERTE}`,
                        }}>
                          <InsertDriveFileOutlinedIcon sx={{ fontSize: 30, color: COLOR.TENUE }} />
                          <Typography variant="caption" color={COLOR.APAGADO} noWrap sx={{ maxWidth: '90%' }}>
                            {files.ticketJpg.name || 'Documento'}
                          </Typography>
                          {ticketUrl && (
                            <Button size="small" href={urlSegura(ticketUrl)} target="_blank" rel="noopener noreferrer"
                              sx={{ textTransform: 'none', fontWeight: 700, color: COLOR.TEXTO }}>
                              Ver documento
                            </Button>
                          )}
                        </Box>
                      )}
                      <Button
                        size="small" fullWidth onClick={() => handleRemoveFile('ticketJpg')}
                        startIcon={<DeleteOutlineIcon fontSize="small" />}
                        sx={{ mt: 1, textTransform: 'none', fontWeight: 600, color: COLOR.APAGADO, '&:hover': { color: COLOR.PELIGRO, bgcolor: COLOR.PELIGRO_FONDO } }}
                      >
                        Quitar
                      </Button>
                    </Paper>
                  );
                })() : (
                  <Button variant="outlined" component="label" fullWidth startIcon={<AttachFileIcon />} sx={GHOST_BTN_SX}>
                    Subir Ticket
                    <input hidden type="file" accept="image/*" onChange={e => handleFileChange('ticketJpg', e)} />
                  </Button>
                )}
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExpenseEdit;
