import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, Grid, IconButton,
  InputAdornment, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, TextField, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import BotonActualizar from '../components/BotonActualizar';
import { useAuthStore } from '../store/useAuthStore';
import { detalleBitacora, filtrosBitacora, listarBitacora } from '../services/bitacora';
import { accionDe, hoyLocal, horaLocal, leerDatos, moduloDe, rangoEnUtc, restarDias } from '../utils/bitacora';
import {
  PAGE_SHELL_SX, PAGE_OVERLINE_SX, PAGE_TITLE_SX, CARD_SX, SECTION_LABEL_SX, HEADER_ROW_SX, HEADER_CELL_SX,
  TABLE_CONTAINER_SX, PAGINATION_BOX_SX, PAGINATION_SX, CHIP_SX, CHIP_OK_SX, CHIP_DANGER_SX, CELL_STRONG_SX,
  CELL_SX, CELL_MUTED_SX, DIALOG_PAPER_SX,
} from '../styles/estilosTabla';

const CHIP_NEUTRO_SX = { ...CHIP_SX, bgcolor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' };

const OPERACION = { I: 'Alta', U: 'Cambio', D: 'Borrado' };

const nombreDeUsuario = (fila) => fila.usuario_nombre || fila.usuario_cuenta || (fila.usuario_id ? `Usuario ${fila.usuario_id}` : '');

const Resultado = ({ valor }) => {
  if (valor === 'error') return <Chip size="small" label="Error" sx={CHIP_DANGER_SX} />;
  if (valor === 'success') return <Chip size="small" label="Correcto" sx={CHIP_OK_SX} />;
  return <Chip size="small" label="Sin dato" sx={CHIP_NEUTRO_SX} />;
};

const Dato = ({ etiqueta, children }) => (
  <Box sx={{ mb: 1.5 }}>
    <Typography variant="caption" sx={{ ...SECTION_LABEL_SX, display: 'block', textTransform: 'uppercase' }}>{etiqueta}</Typography>
    <Typography variant="body2" sx={CELL_STRONG_SX}>{children || '—'}</Typography>
  </Box>
);

const Detalle = ({ id, onCerrar }) => {
  const [estado, setEstado] = useState({ cargando: true, error: null, fila: null, cambios: [] });

  useEffect(() => {
    if (!id) return undefined;
    let vigente = true;
    setEstado({ cargando: true, error: null, fila: null, cambios: [] });
    detalleBitacora(id)
      .then(({ fila, cambios }) => vigente && setEstado({ cargando: false, error: null, fila, cambios }))
      .catch((err) => vigente && setEstado({ cargando: false, error: err.message, fila: null, cambios: [] }));
    return () => {
      vigente = false;
    };
  }, [id]);

  const { cargando, error, fila, cambios } = estado;
  const datos = fila ? leerDatos(fila.datos) : [];

  return (
    <Dialog open={Boolean(id)} onClose={onCerrar} maxWidth="md" fullWidth PaperProps={{ sx: DIALOG_PAPER_SX }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0' }}>
        <Typography variant="h6" fontWeight={800} color="#0f172a">
          {fila ? accionDe(fila.archivo, fila.op) : 'Detalle'}
        </Typography>
        <IconButton size="small" onClick={onCerrar}><CloseIcon fontSize="small" /></IconButton>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: '#f8fafc', p: 3 }}>
        {cargando && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        {fila && (
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Paper elevation={0} sx={CARD_SX}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Dato etiqueta="Cuándo (hora de Monterrey)">{horaLocal(fila.fecha_utc)}</Dato>
                  <Dato etiqueta="Quién">{nombreDeUsuario(fila) || 'Sin usuario: la app no lo mandó'}</Dato>
                  <Dato etiqueta="Desde">{[fila.app, fila.app_version].filter(Boolean).join(' ') || 'App sin identificar'}{fila.ip ? ` · ${fila.ip}` : ''}</Dato>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Dato etiqueta="Módulo">{moduloDe(fila.archivo)}</Dato>
                  <Dato etiqueta="Operación">{`${fila.archivo} · ${fila.op}`}</Dato>
                  <Dato etiqueta="Resultado">
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                      <Resultado valor={fila.resultado} />
                      {fila.mensaje}
                    </Box>
                  </Dato>
                </Grid>
              </Grid>
            </Paper>

            <Box>
              <Typography variant="overline" sx={SECTION_LABEL_SX}>Datos que se enviaron</Typography>
              {datos.length === 0 ? (
                <Typography variant="body2" color="#94a3b8" sx={{ mt: 1 }}>No se enviaron datos.</Typography>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ ...TABLE_CONTAINER_SX, mt: 1 }}>
                  <Table size="small">
                    <TableBody>
                      {datos.map(([clave, valor]) => (
                        <TableRow key={clave}>
                          <TableCell sx={{ ...CELL_MUTED_SX, width: 200, fontWeight: 600, verticalAlign: 'top' }}>{clave}</TableCell>
                          <TableCell sx={{ ...CELL_SX, wordBreak: 'break-word', fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem' }}>{valor}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>

            <Box>
              <Typography variant="overline" sx={SECTION_LABEL_SX}>Antes y después</Typography>
              {cambios.length === 0 ? (
                <Typography variant="body2" color="#94a3b8" sx={{ mt: 1 }}>
                  Todavía no se registra el antes y el después de esta acción.
                </Typography>
              ) : (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {cambios.map((cambio) => (
                    <Paper key={cambio.id} elevation={0} sx={CARD_SX}>
                      <Typography variant="body2" sx={CELL_STRONG_SX}>
                        {OPERACION[cambio.operacion] || cambio.operacion} · {cambio.tabla} #{cambio.registro_id}
                      </Typography>
                      <Typography variant="caption" sx={{ ...CELL_MUTED_SX, fontFamily: 'ui-monospace, monospace', display: 'block', wordBreak: 'break-word' }}>
                        Antes: {cambio.antes || '—'}
                      </Typography>
                      <Typography variant="caption" sx={{ ...CELL_MUTED_SX, fontFamily: 'ui-monospace, monospace', display: 'block', wordBreak: 'break-word' }}>
                        Después: {cambio.despues || '—'}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>

            <Typography variant="caption" color="#94a3b8">Petición {fila.peticion}</Typography>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};

const Bitacora = () => {
  const permisos = useAuthStore((estado) => estado.userPermissions);
  const puedeVer = permisos?.bitacora_ver === true;

  const hoy = hoyLocal();
  const [filtros, setFiltros] = useState({ desde: restarDias(hoy, 6), hasta: hoy, usuario: '', archivo: '', resultado: '', texto: '' });
  const [texto, setTexto] = useState('');
  const [pagina, setPagina] = useState(0);
  const [porPagina, setPorPagina] = useState(25);
  const [datos, setDatos] = useState({ total: 0, filas: [] });
  const [opciones, setOpciones] = useState({ usuarios: [], archivos: [] });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [abierto, setAbierto] = useState(null);
  const ultima = useRef(0);

  const cambiar = (campo, valor) => {
    setFiltros((previos) => ({ ...previos, [campo]: valor }));
    setPagina(0);
  };

  useEffect(() => {
    const espera = setTimeout(() => cambiar('texto', texto.trim()), 400);
    return () => clearTimeout(espera);
  }, [texto]);

  const cargar = async () => {
    const numero = ++ultima.current;
    setCargando(true);
    setError(null);
    try {
      const resultado = await listarBitacora({
        pagina,
        porPagina,
        ...rangoEnUtc(filtros),
        usuario: filtros.usuario,
        archivo: filtros.archivo,
        resultado: filtros.resultado,
        texto: filtros.texto,
      });
      if (numero === ultima.current) setDatos(resultado);
    } catch (err) {
      if (numero === ultima.current) setError(err.message);
    } finally {
      if (numero === ultima.current) setCargando(false);
    }
  };

  useEffect(() => {
    if (!puedeVer) return;
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puedeVer, filtros, pagina, porPagina]);

  useEffect(() => {
    if (!puedeVer) return;
    filtrosBitacora().then(setOpciones).catch(() => {});
  }, [puedeVer]);

  const modulos = useMemo(
    () => opciones.archivos.map((archivo) => ({ archivo, nombre: moduloDe(archivo) })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    [opciones.archivos]
  );

  if (!puedeVer) {
    return (
      <Box sx={PAGE_SHELL_SX}>
        <Alert severity="info">No tienes permiso para ver la bitácora. Pídele a un administrador que te active «Ver bitácora» en el Gestor de accesos.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={PAGE_SHELL_SX}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mb={4} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="overline" sx={PAGE_OVERLINE_SX}>Configuración · Auditoría</Typography>
          <Typography variant="h4" fontWeight={800} color="#0f172a" letterSpacing="-0.02em" sx={PAGE_TITLE_SX}>Bitácora</Typography>
          <Typography variant="body2" color="#64748b" sx={{ mt: 0.5 }}>
            Quién hizo cada cambio y cuándo. Las horas están en hora de Monterrey.
          </Typography>
        </Box>
        <BotonActualizar onActualizar={cargar} />
      </Stack>

      <Paper elevation={0} sx={{ ...CARD_SX, mb: 3 }}>
        <Typography variant="overline" sx={SECTION_LABEL_SX}>Filtros de Búsqueda</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField fullWidth size="small" type="date" label="Desde" value={filtros.desde}
              onChange={(e) => cambiar('desde', e.target.value)}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: filtros.hasta || undefined } }} sx={{ bgcolor: 'white' }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField fullWidth size="small" type="date" label="Hasta" value={filtros.hasta}
              onChange={(e) => cambiar('hasta', e.target.value)}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: filtros.desde || undefined } }} sx={{ bgcolor: 'white' }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField fullWidth select size="small" label="Usuario" value={filtros.usuario}
              onChange={(e) => cambiar('usuario', e.target.value)} sx={{ bgcolor: 'white' }}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="sin">Sin usuario</MenuItem>
              {opciones.usuarios.map((u) => (
                <MenuItem key={u.id} value={String(u.id)}>{u.name || u.user}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField fullWidth select size="small" label="Módulo" value={filtros.archivo}
              onChange={(e) => cambiar('archivo', e.target.value)} sx={{ bgcolor: 'white' }}>
              <MenuItem value="">Todos</MenuItem>
              {modulos.map((m) => (
                <MenuItem key={m.archivo} value={m.archivo}>{m.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField fullWidth select size="small" label="Resultado" value={filtros.resultado}
              onChange={(e) => cambiar('resultado', e.target.value)} sx={{ bgcolor: 'white' }}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="exito">Correctos</MenuItem>
              <MenuItem value="error">Con error</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField fullWidth size="small" placeholder="Buscar en datos…" value={texto}
              onChange={(e) => setTexto(e.target.value)} sx={{ bgcolor: 'white' }}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#94a3b8' }} /></InputAdornment> } }} />
          </Grid>
        </Grid>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={cargar}>Reintentar</Button>}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} elevation={0} sx={{ ...TABLE_CONTAINER_SX, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={HEADER_ROW_SX}>
              <TableCell sx={HEADER_CELL_SX}>Fecha</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Usuario</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Acción</TableCell>
              <TableCell sx={HEADER_CELL_SX}>App</TableCell>
              <TableCell sx={HEADER_CELL_SX}>Resultado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {cargando && datos.filas.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><CircularProgress size={28} /></TableCell></TableRow>
            ) : datos.filas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography color="#94a3b8" variant="body2">No hay registros con estos filtros.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              datos.filas.map((fila) => (
                <TableRow key={fila.id} hover onClick={() => setAbierto(fila.id)} sx={{ cursor: 'pointer', opacity: cargando ? 0.6 : 1 }}>
                  <TableCell sx={{ ...CELL_MUTED_SX, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{horaLocal(fila.fecha_utc)}</TableCell>
                  <TableCell sx={nombreDeUsuario(fila) ? CELL_STRONG_SX : { color: '#94a3b8' }}>{nombreDeUsuario(fila) || 'Sin usuario'}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={CELL_SX}>{accionDe(fila.archivo, fila.op)}</Typography>
                    <Typography variant="caption" color="#94a3b8">{moduloDe(fila.archivo)}</Typography>
                  </TableCell>
                  <TableCell sx={{ ...CELL_MUTED_SX, whiteSpace: 'nowrap' }}>{[fila.app, fila.app_version].filter(Boolean).join(' ') || '—'}</TableCell>
                  <TableCell><Resultado valor={fila.resultado} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={PAGINATION_BOX_SX}>
        <TablePagination
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={datos.total}
          rowsPerPage={porPagina}
          page={pagina}
          onPageChange={(_e, nueva) => setPagina(nueva)}
          onRowsPerPageChange={(e) => { setPorPagina(parseInt(e.target.value, 10)); setPagina(0); }}
          labelRowsPerPage="Filas por página:"
          sx={PAGINATION_SX}
        />
      </Box>

      <Detalle id={abierto} onCerrar={() => setAbierto(null)} />
    </Box>
  );
};

export default Bitacora;
