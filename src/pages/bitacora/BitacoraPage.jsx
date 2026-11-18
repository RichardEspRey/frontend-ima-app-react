import { useEffect, useMemo, useState } from "react"
import {
  Alert, Box, Button, Chip, Dialog, DialogContent, DialogTitle, Grid, IconButton, InputAdornment,
  MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField,
  Typography,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import SearchIcon from "@mui/icons-material/Search"

import {
  accionDe, hoyLocal, horaLocal, leerDatos, moduloDe, nombreDeUsuario, rangoEnUtc, restarDias, textoDeApp,
  useBitacora, useDetalleBitacora, useFiltrosBitacora,
} from "../../entities/audit"
import {
  BloqueEsqueleto, BotonActualizar, CARD_SX, CELL_MUTED_SX, CELL_STRONG_SX, CELL_SX, CHIP_DANGER_SX, CHIP_OK_SX,
  CHIP_SX, COLOR, DIALOG_PAPER_SX, FilasEsqueleto, HEADER_CELL_SX, HEADER_ROW_SX, PAGE_SHELL_SX, PageHeader,
  Paginacion, SECTION_LABEL_SX, TABLE_CONTAINER_SX, describirError,
} from "../../shared/ui"
import { useAuthStore } from "../../store/useAuthStore"

const CHIP_NEUTRO_SX = { ...CHIP_SX, bgcolor: COLOR.LIENZO, color: COLOR.TEXTO_SUAVE, border: `1px solid ${COLOR.BORDE}` }
const OPERACION = { I: "Alta", U: "Cambio", D: "Borrado" }
const MONO_SX = { fontFamily: "ui-monospace, monospace", wordBreak: "break-word" }

/**
 * La etiqueta de si una acción salió bien.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} [props.valor] El `resultado` guardado.
 * @returns {object} El chip.
 */
function Resultado({ valor }) {
  if (valor === "error") return <Chip size="small" label="Error" sx={CHIP_DANGER_SX} />
  if (valor === "success") return <Chip size="small" label="Correcto" sx={CHIP_OK_SX} />
  return <Chip size="small" label="Sin dato" sx={CHIP_NEUTRO_SX} />
}

/**
 * Un dato del detalle, con su etiqueta encima.
 *
 * @param {object} props Propiedades del componente.
 * @param {string} props.etiqueta Qué es.
 * @param {object} [props.children] El valor.
 * @returns {object} El bloque.
 */
function Dato({ etiqueta, children }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" sx={{ ...SECTION_LABEL_SX, display: "block", textTransform: "uppercase" }}>
        {etiqueta}
      </Typography>
      <Typography variant="body2" component="div" sx={CELL_STRONG_SX}>
        {children || "—"}
      </Typography>
    </Box>
  )
}

/**
 * El detalle de una acción: quién, cuándo, qué se envió y qué cambió.
 *
 * @param {object} props Propiedades del componente.
 * @param {(string|number|null)} props.id El renglón abierto, o `null`.
 * @param {Function} props.onCerrar Qué hacer al cerrar.
 * @returns {object} El diálogo.
 */
function Detalle({ id, onCerrar }) {
  const consulta = useDetalleBitacora(id)
  const fila = consulta.data?.fila
  const cambios = consulta.data?.cambios ?? []
  const datos = fila ? leerDatos(fila.datos) : []

  return (
    <Dialog open={Boolean(id)} onClose={onCerrar} maxWidth="md" fullWidth slotProps={{ paper: { sx: DIALOG_PAPER_SX } }}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${COLOR.BORDE}` }}>
        <Typography variant="h6" component="span" fontWeight={800} color={COLOR.TINTA}>
          {fila ? accionDe(fila.archivo, fila.op) : "Detalle"}
        </Typography>
        <IconButton size="small" onClick={onCerrar} aria-label="Cerrar">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: COLOR.LIENZO, p: 3 }}>
        {consulta.isLoading ? <BloqueEsqueleto alto={220} conTitulo={false} /> : null}
        {consulta.isError ? <Alert severity="error" sx={{ mt: 2 }}>{describirError(consulta.error)}</Alert> : null}
        {fila ? (
          <Stack spacing={3} sx={{ mt: 2 }}>
            <Paper elevation={0} sx={CARD_SX}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Dato etiqueta="Cuándo (hora de Monterrey)">{horaLocal(fila.fecha_utc)}</Dato>
                  <Dato etiqueta="Quién">{nombreDeUsuario(fila) || "Sin usuario: la app no lo mandó"}</Dato>
                  <Dato etiqueta="Desde">
                    {textoDeApp(fila, "App sin identificar")}
                    {fila.ip ? ` · ${fila.ip}` : ""}
                  </Dato>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Dato etiqueta="Módulo">{moduloDe(fila.archivo)}</Dato>
                  <Dato etiqueta="Operación">{`${fila.archivo} · ${fila.op}`}</Dato>
                  <Dato etiqueta="Resultado">
                    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
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
                <Typography variant="body2" color={COLOR.APAGADO} sx={{ mt: 1 }}>No se enviaron datos.</Typography>
              ) : (
                <TableContainer component={Paper} elevation={0} sx={{ ...TABLE_CONTAINER_SX, mt: 1 }}>
                  <Table size="small">
                    <TableBody>
                      {datos.map(([clave, valor]) => (
                        <TableRow key={clave}>
                          <TableCell sx={{ ...CELL_MUTED_SX, width: 200, fontWeight: 600, verticalAlign: "top" }}>{clave}</TableCell>
                          <TableCell sx={{ ...CELL_SX, ...MONO_SX, fontSize: "0.8rem" }}>{valor}</TableCell>
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
                <Typography variant="body2" color={COLOR.APAGADO} sx={{ mt: 1 }}>
                  Todavía no se registra el antes y el después de esta acción.
                </Typography>
              ) : (
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {cambios.map((cambio) => (
                    <Paper key={cambio.id} elevation={0} sx={CARD_SX}>
                      <Typography variant="body2" sx={CELL_STRONG_SX}>
                        {OPERACION[cambio.operacion] || cambio.operacion} · {cambio.tabla} #{cambio.registro_id}
                      </Typography>
                      <Typography variant="caption" sx={{ ...CELL_MUTED_SX, ...MONO_SX, display: "block" }}>
                        Antes: {cambio.antes || "—"}
                      </Typography>
                      <Typography variant="caption" sx={{ ...CELL_MUTED_SX, ...MONO_SX, display: "block" }}>
                        Después: {cambio.despues || "—"}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              )}
            </Box>

            <Typography variant="caption" color={COLOR.APAGADO}>Petición {fila.peticion}</Typography>
          </Stack>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

/**
 * La bitácora de auditoría: quién hizo cada cambio y cuándo.
 *
 * Solo la ve quien tenga encendido «Ver bitácora» en el Gestor de accesos, aunque sea
 * administrador: ser Admin no basta (decisión de Emiliano, 2026-11-17). Las horas se guardan en UTC y se muestran en hora de Monterrey; los filtros
 * de fecha se convierten antes de pedirlos. La paginación es en el servidor.
 *
 * @returns {object} La pantalla.
 */
export default function BitacoraPage() {
  const permisos = useAuthStore((estado) => estado.userPermissions)
  const puedeVer = permisos?.bitacora_ver === true

  const hoy = hoyLocal()
  const [filtros, setFiltros] = useState({ desde: restarDias(hoy, 6), hasta: hoy, usuario: "", archivo: "", resultado: "", texto: "" })
  const [texto, setTexto] = useState("")
  const [pagina, setPagina] = useState(0)
  const [porPagina, setPorPagina] = useState(25)
  const [abierto, setAbierto] = useState(null)

  const cambiar = (campo, valor) => {
    setFiltros((previos) => ({ ...previos, [campo]: valor }))
    setPagina(0)
  }

  useEffect(() => {
    const espera = setTimeout(() => {
      setFiltros((previos) => (previos.texto === texto.trim() ? previos : { ...previos, texto: texto.trim() }))
      setPagina(0)
    }, 400)
    return () => clearTimeout(espera)
  }, [texto])

  const consulta = useMemo(
    () => ({
      pagina,
      porPagina,
      ...rangoEnUtc(filtros),
      usuario: filtros.usuario,
      archivo: filtros.archivo,
      resultado: filtros.resultado,
      texto: filtros.texto,
    }),
    [pagina, porPagina, filtros],
  )

  const lista = useBitacora(consulta, { habilitada: puedeVer })
  const opciones = useFiltrosBitacora(puedeVer)
  const filas = lista.data?.filas ?? []
  const total = lista.data?.total ?? 0

  const modulos = useMemo(
    () =>
      (opciones.data?.archivos ?? [])
        .map((archivo) => ({ archivo, nombre: moduloDe(archivo) }))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, "es")),
    [opciones.data],
  )

  if (!puedeVer) {
    return (
      <Box sx={PAGE_SHELL_SX}>
        <Alert severity="info">
          No tienes permiso para ver la bitácora. Pídele a un administrador que te active «Ver bitácora» en el Gestor de accesos.
        </Alert>
      </Box>
    )
  }

  return (
    <Box sx={PAGE_SHELL_SX}>
      <PageHeader
        seccion="Configuración · Auditoría"
        titulo="Bitácora"
        descripcion="Quién hizo cada cambio y cuándo. Las horas están en hora de Monterrey."
        acciones={<BotonActualizar onActualizar={() => lista.refetch()} actualizando={lista.isFetching} />}
      />

      <Paper elevation={0} sx={{ ...CARD_SX, mb: 3 }}>
        <Typography variant="overline" sx={SECTION_LABEL_SX}>Filtros de Búsqueda</Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField fullWidth size="small" type="date" label="Desde" value={filtros.desde}
              onChange={(evento) => cambiar("desde", evento.target.value)}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: filtros.hasta || undefined } }}
              sx={{ bgcolor: COLOR.BLANCO }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField fullWidth size="small" type="date" label="Hasta" value={filtros.hasta}
              onChange={(evento) => cambiar("hasta", evento.target.value)}
              slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: filtros.desde || undefined } }}
              sx={{ bgcolor: COLOR.BLANCO }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField fullWidth select size="small" label="Usuario" value={filtros.usuario}
              onChange={(evento) => cambiar("usuario", evento.target.value)} sx={{ bgcolor: COLOR.BLANCO }}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="sin">Sin usuario</MenuItem>
              {(opciones.data?.usuarios ?? []).map((u) => (
                <MenuItem key={u.id} value={String(u.id)}>{u.name || u.user}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField fullWidth select size="small" label="Módulo" value={filtros.archivo}
              onChange={(evento) => cambiar("archivo", evento.target.value)} sx={{ bgcolor: COLOR.BLANCO }}>
              <MenuItem value="">Todos</MenuItem>
              {modulos.map((m) => (
                <MenuItem key={m.archivo} value={m.archivo}>{m.nombre}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField fullWidth select size="small" label="Resultado" value={filtros.resultado}
              onChange={(evento) => cambiar("resultado", evento.target.value)} sx={{ bgcolor: COLOR.BLANCO }}>
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="exito">Correctos</MenuItem>
              <MenuItem value="error">Con error</MenuItem>
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <TextField fullWidth size="small" placeholder="Buscar en datos…" value={texto}
              onChange={(evento) => setTexto(evento.target.value)} sx={{ bgcolor: COLOR.BLANCO }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: COLOR.APAGADO }} />
                    </InputAdornment>
                  ),
                },
              }} />
          </Grid>
        </Grid>
      </Paper>

      {lista.isError ? (
        <Alert severity="error" sx={{ mb: 2 }}
          action={<Button color="inherit" size="small" onClick={() => lista.refetch()}>Reintentar</Button>}>
          {describirError(lista.error)}
        </Alert>
      ) : null}

      <TableContainer component={Paper} elevation={0} sx={TABLE_CONTAINER_SX}>
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
            {lista.isLoading ? (
              <FilasEsqueleto columnas={5} filas={8} />
            ) : filas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography color={COLOR.APAGADO} variant="body2">No hay registros con estos filtros.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              filas.map((fila) => (
                <TableRow key={fila.id} hover onClick={() => setAbierto(fila.id)}
                  sx={{ cursor: "pointer", opacity: lista.isFetching ? 0.6 : 1 }}>
                  <TableCell sx={{ ...CELL_MUTED_SX, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {horaLocal(fila.fecha_utc)}
                  </TableCell>
                  <TableCell sx={nombreDeUsuario(fila) ? CELL_STRONG_SX : { color: COLOR.APAGADO }}>
                    {nombreDeUsuario(fila) || "Sin usuario"}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={CELL_SX}>{accionDe(fila.archivo, fila.op)}</Typography>
                    <Typography variant="caption" color={COLOR.APAGADO}>{moduloDe(fila.archivo)}</Typography>
                  </TableCell>
                  <TableCell sx={{ ...CELL_MUTED_SX, whiteSpace: "nowrap" }}>
                    {textoDeApp(fila)}
                  </TableCell>
                  <TableCell><Resultado valor={fila.resultado} /></TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Paginacion
        pagina={pagina}
        porPagina={porPagina}
        total={total}
        onPagina={setPagina}
        onPorPagina={(cuantas) => { setPorPagina(cuantas); setPagina(0) }}
      />

      <Detalle id={abierto} onCerrar={() => setAbierto(null)} />
    </Box>
  )
}
