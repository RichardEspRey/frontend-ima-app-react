import { useState } from "react"
import {
  Avatar,
  Box,
  InputAdornment,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material"
import BuildIcon from "@mui/icons-material/Build"
import DescriptionIcon from "@mui/icons-material/Description"
import EventAvailableIcon from "@mui/icons-material/EventAvailable"
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation"
import LocalShippingIcon from "@mui/icons-material/LocalShipping"
import SearchIcon from "@mui/icons-material/Search"

import { CATEGORIA_AVISO } from "../../../entities/notification"
import { useSesion } from "../../../shared/auth"
import { BloqueEsqueleto, COLOR, INPUT_SX, SECTION_LABEL_SX, Selector, TINTE, notify } from "../../../shared/ui"
import {
  MODULO_TODOS,
  buscarPersonas,
  nombreDe,
  opcionesDeModulo,
  seccionesDeModulo,
  usePersonasDeAvisos,
} from "../model/categorias"

const APARIENCIA = {
  bl: { Icono: LocalShippingIcon, color: COLOR.INFO, fondo: COLOR.INFO_FONDO },
  inspecciones: { Icono: BuildIcon, color: TINTE.NARANJA.texto, fondo: TINTE.NARANJA.fondo },
  [CATEGORIA_AVISO.SIN_FALLAS]: { Icono: BuildIcon, color: TINTE.NARANJA.texto, fondo: TINTE.NARANJA.fondo },
  [CATEGORIA_AVISO.SIN_INSPECCION]: { Icono: BuildIcon, color: TINTE.NARANJA.texto, fondo: TINTE.NARANJA.fondo },
  [CATEGORIA_AVISO.VIAJE_PROGRAMADO]: { Icono: EventAvailableIcon, color: TINTE.TEAL.texto, fondo: TINTE.TEAL.fondo },
  [CATEGORIA_AVISO.VIAJE_DESPACHO]: { Icono: LocalShippingIcon, color: COLOR.INFO, fondo: COLOR.INFO_FONDO },
  [CATEGORIA_AVISO.VIAJE_DOCUMENTOS]: { Icono: DescriptionIcon, color: TINTE.VIOLETA.texto, fondo: TINTE.VIOLETA.fondo },
  [CATEGORIA_AVISO.DIESEL_STATE]: { Icono: LocalGasStationIcon, color: TINTE.AMBAR.texto, fondo: TINTE.AMBAR.fondo },
  [CATEGORIA_AVISO.DIESEL_FLEETONE]: { Icono: LocalGasStationIcon, color: TINTE.AMBAR.texto, fondo: TINTE.AMBAR.fondo },
}

const BORDE = `1px solid ${COLOR.BORDE}`
const ANCHO_PERSONA = 240
const ETIQUETA_SX = { ...SECTION_LABEL_SX, display: "block", lineHeight: 1, textTransform: "uppercase" }

/**
 * El encabezado de la columna de un aviso.
 *
 * Enseña el ícono, el nombre corto y cuántas personas lo reciben. La
 * descripción y el ejemplo salen al pasar el cursor, que es lo que antes
 * ocupaba media tarjeta.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.categoria Una de `CATEGORIAS_DE_AVISO`.
 * @param {boolean} props.primera Si abre su sección, para pintar la división.
 * @returns {object} La celda de encabezado.
 */
function Encabezado({ categoria, primera }) {
  const { Icono, color, fondo } = APARIENCIA[categoria.id]
  const { data: suscriptores = [], isError } = categoria.useSuscriptores()
  const total = suscriptores.length

  return (
    <TableCell
      align="center"
      sx={{ borderLeft: primera ? BORDE : "none", borderBottom: BORDE, px: 1, py: 1.25, minWidth: 96 }}
    >
      <Tooltip
        arrow
        title={
          <Box sx={{ p: 0.5 }}>
            <Typography variant="caption" fontWeight={800} sx={{ display: "block" }}>
              {categoria.nombre}
            </Typography>
            <Typography variant="caption" sx={{ display: "block", mb: 0.75 }}>
              {categoria.descripcion}
            </Typography>
            <Typography variant="caption" sx={{ display: "block", opacity: 0.8 }}>
              Ejemplo: {categoria.ejemplo.titulo} · {categoria.ejemplo.subtitulo}
            </Typography>
          </Box>
        }
      >
        <Stack alignItems="center" spacing={0.5} sx={{ display: "inline-flex", cursor: "help" }}>
          <Avatar sx={{ bgcolor: fondo, color, width: 30, height: 30 }}>
            <Icono sx={{ fontSize: 17 }} />
          </Avatar>
          <Typography variant="caption" fontWeight={700} color={COLOR.TINTA} sx={{ lineHeight: 1.15 }}>
            {categoria.corto}
          </Typography>
          <Typography variant="caption" color={isError ? COLOR.PELIGRO : COLOR.APAGADO} sx={{ lineHeight: 1 }}>
            {isError ? "No cargó" : `${total} ${total === 1 ? "persona" : "personas"}`}
          </Typography>
        </Stack>
      </Tooltip>
    </TableCell>
  )
}

/**
 * El cruce de una persona con un aviso: un interruptor.
 *
 * Lee la misma lista en caché que el encabezado, así que no agrega peticiones.
 * Mientras guarda queda bloqueado; si falla, avisa y la lista sigue como estaba.
 *
 * @param {object} props Propiedades del componente.
 * @param {object} props.categoria Una de `CATEGORIAS_DE_AVISO`.
 * @param {object} props.persona La persona de la fila.
 * @param {boolean} props.primera Si abre su sección, para pintar la división.
 * @returns {object} La celda con el interruptor.
 */
function Celda({ categoria, persona, primera }) {
  const { usuario } = useSesion()
  const { data: suscriptores, isError } = categoria.useSuscriptores()
  const suscribir = categoria.useSuscribir()
  const desuscribir = categoria.useDesuscribir()

  const recibe = (suscriptores ?? []).some((una) => String(una.id) === String(persona.id))
  const guardando = suscribir.isPending || desuscribir.isPending

  const alternar = async () => {
    try {
      const mutacion = recibe ? desuscribir : suscribir
      await mutacion.mutateAsync(categoria.variables(persona, usuario?.id))
    } catch (fallo) {
      notify.error(fallo)
    }
  }

  return (
    <TableCell align="center" sx={{ borderLeft: primera ? BORDE : "none", py: 0.25 }}>
      <Switch
        size="small"
        checked={recibe}
        disabled={guardando || isError || suscriptores === undefined}
        onChange={alternar}
        slotProps={{ input: { "aria-label": `${categoria.nombre} para ${nombreDe(persona)}` } }}
      />
    </TableCell>
  )
}

/**
 * Quién recibe cada aviso de la campana, en una sola tabla.
 *
 * Una fila por persona, una columna por aviso —agrupadas por pantalla— y un
 * interruptor en cada cruce, que guarda al momento. Sustituye a las tarjetas:
 * con nueve avisos había que abrir nueve listas para saber qué recibía alguien.
 *
 * El filtro de módulo deja ver solo las columnas de una pantalla, para que la
 * tabla siga siendo legible cuando se sumen más avisos.
 *
 * @returns {object} El buscador y la tabla.
 */
export function SuscriptoresDeAvisos() {
  const { personas, cargando } = usePersonasDeAvisos()
  const [busqueda, setBusqueda] = useState("")
  const visibles = buscarPersonas(personas, busqueda)
  const [modulo, setModulo] = useState(MODULO_TODOS)
  const secciones = seccionesDeModulo(modulo)
  const columnas = secciones.reduce((suma, seccion) => suma + seccion.categorias.length, 0)

  if (cargando && personas.length === 0) return <BloqueEsqueleto alto={320} />

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Selector valor={modulo} onChange={setModulo} opciones={opcionesDeModulo()} />
      <TextField
        size="small"
        placeholder="Buscar persona"
        value={busqueda}
        onChange={(evento) => setBusqueda(evento.target.value)}
        sx={{ width: 260, bgcolor: COLOR.BLANCO }}
        slotProps={{
          input: {
            sx: INPUT_SX,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
      />
      </Stack>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ border: BORDE, borderRadius: 2, maxHeight: "calc(100vh - 260px)" }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell
                rowSpan={2}
                sx={{
                  position: "sticky",
                  left: 0,
                  zIndex: 4,
                  bgcolor: COLOR.BLANCO,
                  minWidth: ANCHO_PERSONA,
                  borderBottom: BORDE,
                  verticalAlign: "bottom",
                }}
              >
                <Typography variant="caption" sx={ETIQUETA_SX}>
                  Persona
                </Typography>
              </TableCell>
              {secciones.map((seccion) => (
                <TableCell
                  key={seccion.id}
                  align="center"
                  colSpan={seccion.categorias.length}
                  sx={{ borderLeft: BORDE, borderBottom: "none", bgcolor: COLOR.LIENZO, py: 0.75 }}
                >
                  <Typography variant="caption" sx={ETIQUETA_SX}>
                    {seccion.nombre}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
            <TableRow>
              {secciones.map((seccion) =>
                seccion.categorias.map((categoria, indice) => (
                  <Encabezado key={categoria.id} categoria={categoria} primera={indice === 0} />
                )),
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {visibles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnas + 1}
                  align="center"
                  sx={{ py: 5, color: COLOR.APAGADO }}
                >
                  Nadie coincide con la búsqueda.
                </TableCell>
              </TableRow>
            ) : null}

            {visibles.map((persona) => (
              <TableRow key={persona.id} hover>
                <TableCell
                  sx={{ position: "sticky", left: 0, zIndex: 1, bgcolor: COLOR.BLANCO, minWidth: ANCHO_PERSONA }}
                >
                  <Typography variant="body2" fontWeight={700} color={COLOR.TINTA} noWrap>
                    {nombreDe(persona)}
                  </Typography>
                  {persona.user && persona.user !== nombreDe(persona) ? (
                    <Typography variant="caption" color={COLOR.APAGADO} noWrap sx={{ display: "block" }}>
                      {persona.user}
                    </Typography>
                  ) : null}
                </TableCell>
                {secciones.map((seccion) =>
                  seccion.categorias.map((categoria, indice) => (
                    <Celda key={categoria.id} categoria={categoria} persona={persona} primera={indice === 0} />
                  )),
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  )
}
