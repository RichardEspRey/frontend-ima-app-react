import { useMemo, useState } from "react"
import { Box, Button, Chip, Grid, InputAdornment, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Tooltip, Typography } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import VisibilityIcon from "@mui/icons-material/Visibility"
import { useNavigate } from "react-router-dom"

import {
  PAIS_REGISTRO,
  PERIODO_FISCAL,
  textoDePeriodos,
  filtrarResumen,
  identificadorViaje,
  useResumen,
} from "../../../entities/expense"
import { decimales, moneda } from "../../../shared/lib/formato"
import {
  BotonActualizar,
  CARD_SX,
  CELL_MUTED_SX,
  CELL_STRONG_SX,
  CELL_SX,
  CHIP_DANGER_SX,
  CHIP_SX,
  CHIP_WARN_SX,
  GHOST_BTN_SX,
  HEADER_CELL_SX,
  HEADER_ROW_SX,
  INPUT_SX,
  PAGE_SHELL_SX,
  PageHeader,
  Paginacion,
  PantallaEsqueleto,
  Pestanas,
  SECTION_LABEL_SX,
  Selector,
  TABLE_CONTAINER_SX,
} from "../../../shared/ui"
import { useActualizarPantalla } from "../../../shared/api"
import { COLOR } from "../../../shared/ui/tokens"

const CHIP_NEUTRO_SX = { ...CHIP_SX, bgcolor: COLOR.LIENZO, color: COLOR.TEXTO_SUAVE, border: `1px solid ${COLOR.BORDE}` }
const VER_BTN_SX = { ...GHOST_BTN_SX, px: 1.5, py: 0.4, fontSize: "0.78rem" }
const NUMERO_SX = { fontVariantNumeric: "tabular-nums" }

/**
 * El estilo de la etiqueta de un contador de pendientes: rojo para lo que falta
 * conciliar con estados, ámbar para Fleet One y neutro para los manuales.
 *
 * @param {object} columna La columna del descriptor.
 * @returns {object} Los estilos del chip.
 */
const estiloDeContador = (columna) => {
  if (columna.clave === "manual_count") return CHIP_NEUTRO_SX
  return columna.color === COLOR.PELIGRO ? CHIP_DANGER_SX : CHIP_WARN_SX
}

const PAISES = [
  { valor: PAIS_REGISTRO.TODOS, etiqueta: "Todos" },
  { valor: PAIS_REGISTRO.USA, etiqueta: "USA" },
  { valor: PAIS_REGISTRO.MEXICO, etiqueta: "México" },
]

const PERIODOS = [
  { valor: PERIODO_FISCAL.TODOS, etiqueta: "Todos" },
  { valor: PERIODO_FISCAL.Q1, etiqueta: "Q1" },
  { valor: PERIODO_FISCAL.Q2, etiqueta: "Q2" },
  { valor: PERIODO_FISCAL.Q3, etiqueta: "Q3" },
  { valor: PERIODO_FISCAL.Q4, etiqueta: "Q4" },
  { valor: PERIODO_FISCAL.SIN_PERIODO, etiqueta: "V (vacío)" },
]

/**
 * El contenido de una celda del resumen, según lo que declare la columna.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.columna La columna del descriptor.
 * @param {object} props.fila El renglón del resumen.
 * @returns {object} La celda renderizada.
 */
function Celda({ columna, fila }) {
  const valor = fila?.[columna.clave]

  if (columna.tipo === "dinero") {
    return (
      <Typography fontWeight={700} component="span" color={COLOR.TINTA} sx={NUMERO_SX}>
        {moneda(valor)}
      </Typography>
    )
  }

  if (columna.tipo === "galones") return <>{decimales(valor)} gal</>

  if (columna.tipo === "periodos") return <>{textoDePeriodos(fila)}</>

  if (columna.tipo === "pendiente") {
    const cuantos = Number(valor ?? 0)
    if (cuantos === 0) {
      return (
        <Typography variant="caption" color={COLOR.BORDE_FUERTE} component="span">
          —
        </Typography>
      )
    }
    return (
      <Tooltip title={`${cuantos} ${columna.aviso}`}>
        <Chip label={cuantos} size="small" sx={{ ...estiloDeContador(columna), minWidth: 32 }} />
      </Tooltip>
    )
  }

  return <>{valor ?? "—"}</>
}

/**
 * El resumen por viaje de un tipo de registro: cuánto lleva cada uno.
 *
 * Es la puerta de entrada de gastos y de diesel. Las columnas, las pestañas y si
 * hay paginación lo dice el descriptor del tipo, no una copia de la pantalla.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.descriptor El descriptor del tipo de registro.
 * @returns {object} La pantalla renderizada.
 */
export function ResumenPorViaje({ descriptor }) {
  const navigate = useNavigate()

  const [pais, setPais] = useState(PAIS_REGISTRO.TODOS)
  const [periodo, setPeriodo] = useState(PERIODO_FISCAL.TODOS)
  const [busqueda, setBusqueda] = useState("")
  const [pestana, setPestana] = useState(0)
  const [pagina, setPagina] = useState(0)
  const [porPagina, setPorPagina] = useState(50)

  const { data: filas = [], isLoading, isFetching } = useResumen(descriptor.clave)
  const { actualizar, actualizando } = useActualizarPantalla()

  const visibles = useMemo(() => {
    const porPestana = descriptor.pestanas
      ? filas.filter(descriptor.pestanas[pestana].filtro)
      : filas
    return filtrarResumen(porPestana, { pais, busqueda, periodo })
  }, [filas, descriptor.pestanas, pestana, pais, busqueda, periodo])

  const ultimaPagina = Math.max(0, Math.ceil(visibles.length / porPagina) - 1)
  const paginaActual = Math.min(pagina, ultimaPagina)

  const enPantalla = descriptor.conPaginacion
    ? visibles.slice(paginaActual * porPagina, paginaActual * porPagina + porPagina)
    : visibles

  const columnas = descriptor.columnasResumen.length + 3

  if (isLoading) {
    return <PantallaEsqueleto columnas={columnas} />
  }

  return (
    <Box sx={PAGE_SHELL_SX}>
      <PageHeader
        seccion={descriptor.seccionEditor}
        titulo={descriptor.etiquetas.titulo}
        descripcion={descriptor.etiquetas.descripcion}
        acciones={<BotonActualizar onActualizar={actualizar} actualizando={actualizando || isFetching} />}
      />

      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
        {descriptor.pestanas && (
          <Pestanas
            valor={pestana}
            onChange={(valor) => {
              setPestana(valor)
              setPagina(0)
            }}
            pestanas={descriptor.pestanas.map((tab) => ({ etiqueta: tab.etiqueta }))}
            sx={{ mb: 0 }}
          />
        )}
        <Selector
          valor={pais}
          onChange={(valor) => {
            setPais(valor)
            setPagina(0)
          }}
          opciones={PAISES.map((o) => ({ valor: o.valor, etiqueta: o.etiqueta }))}
        />
      </Stack>

      <Paper elevation={0} sx={{ ...CARD_SX, mb: 3 }}>
        <Typography variant="overline" sx={SECTION_LABEL_SX}>Filtros de Búsqueda</Typography>
        <Grid container spacing={2} alignItems="center" sx={{ mt: 0.5 }}>
          <Grid size={{ xs: 12, sm: 8, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por Trip# o Driver"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setPagina(0)
              }}
              sx={{ bgcolor: COLOR.BLANCO }}
              slotProps={{
                input: {
                  sx: INPUT_SX,
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 18, color: COLOR.APAGADO }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
          {descriptor.conFiltroPeriodo && (
            <Grid size={{ xs: 12, sm: "auto" }}>
              <Selector
                valor={periodo}
                onChange={(valor) => {
                  setPeriodo(valor)
                  setPagina(0)
                }}
                opciones={PERIODOS}
              />
            </Grid>
          )}
        </Grid>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={TABLE_CONTAINER_SX}>
        <Table size="small">
          <TableHead>
            <TableRow sx={HEADER_ROW_SX}>
              <TableCell sx={{ ...HEADER_CELL_SX, whiteSpace: "nowrap" }}>Trip #</TableCell>
              <TableCell sx={{ ...HEADER_CELL_SX, whiteSpace: "nowrap" }}>Last Update</TableCell>
              {descriptor.columnasResumen.map((columna) => (
                <TableCell
                  key={columna.clave}
                  sx={{ ...HEADER_CELL_SX, whiteSpace: "nowrap", textAlign: columna.alineacion }}
                >
                  {columna.etiqueta}
                </TableCell>
              ))}
              <TableCell sx={{ ...HEADER_CELL_SX, whiteSpace: "nowrap", textAlign: "center", width: 120 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {enPantalla.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columnas} align="center" sx={{ py: 6 }}>
                  <Typography color={COLOR.APAGADO} variant="body2">
                    {descriptor.etiquetas.vacioResumen}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              enPantalla.map((fila) => (
                <TableRow key={fila.trip_id} hover>
                  <TableCell sx={{ ...CELL_STRONG_SX, whiteSpace: "nowrap" }}>{identificadorViaje(fila)}</TableCell>
                  <TableCell sx={{ ...CELL_MUTED_SX, ...NUMERO_SX, whiteSpace: "nowrap" }}>{fila.fecha}</TableCell>
                  {descriptor.columnasResumen.map((columna) => (
                    <TableCell key={columna.clave} align={columna.alineacion} sx={{ ...CELL_SX, ...NUMERO_SX }}>
                      <Celda columna={columna} fila={fila} />
                    </TableCell>
                  ))}
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon sx={{ fontSize: 16 }} />}
                      onClick={() => navigate(descriptor.rutas.detalle(fila.trip_id))}
                      sx={VER_BTN_SX}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {descriptor.conPaginacion && (
        <Paginacion
          pagina={paginaActual}
          porPagina={porPagina}
          total={visibles.length}
          onPagina={setPagina}
          onPorPagina={(cuantas) => { setPorPagina(cuantas); setPagina(0) }}
        />
      )}
    </Box>
  )
}
