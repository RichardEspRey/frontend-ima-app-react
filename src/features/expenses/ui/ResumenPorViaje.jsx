import { useMemo, useState } from "react"
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material"
import { useNavigate } from "react-router-dom"

import {
  PAIS_REGISTRO,
  filtrarResumen,
  identificadorViaje,
  useResumen,
} from "../../../entities/expense"
import { decimales, moneda } from "../../../shared/lib/formato"
import { PageHeader } from "../../../shared/ui"
import { COLOR } from "../../../shared/ui/tokens"

const PAISES = [
  { valor: PAIS_REGISTRO.TODOS, etiqueta: "Todos" },
  { valor: PAIS_REGISTRO.USA, etiqueta: "USA" },
  { valor: PAIS_REGISTRO.MEXICO, etiqueta: "México" },
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
      <Typography fontWeight={700} component="span">
        {moneda(valor)}
      </Typography>
    )
  }

  if (columna.tipo === "galones") return <>{decimales(valor)} gal</>

  if (columna.tipo === "pendiente") {
    const cuantos = Number(valor ?? 0)
    if (cuantos === 0) {
      return (
        <Typography variant="body2" color="text.disabled" component="span">
          —
        </Typography>
      )
    }
    return (
      <Tooltip title={`${cuantos} ${columna.aviso}`}>
        <Chip
          label={cuantos}
          size="small"
          sx={{
            fontWeight: "bold",
            minWidth: 30,
            bgcolor: columna.color,
            color: COLOR.BLANCO,
            border: `1px solid ${columna.color}`,
          }}
        />
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
  const [busqueda, setBusqueda] = useState("")
  const [pestana, setPestana] = useState(0)
  const [pagina, setPagina] = useState(0)
  const [porPagina, setPorPagina] = useState(50)

  const { data: filas = [], isLoading, isFetching, refetch } = useResumen(descriptor.clave)

  const visibles = useMemo(() => {
    const porPestana = descriptor.pestanas
      ? filas.filter(descriptor.pestanas[pestana].filtro)
      : filas
    return filtrarResumen(porPestana, { pais, busqueda })
  }, [filas, descriptor.pestanas, pestana, pais, busqueda])

  const ultimaPagina = Math.max(0, Math.ceil(visibles.length / porPagina) - 1)
  const paginaActual = Math.min(pagina, ultimaPagina)

  const enPantalla = descriptor.conPaginacion
    ? visibles.slice(paginaActual * porPagina, paginaActual * porPagina + porPagina)
    : visibles

  const columnas = descriptor.columnasResumen.length + 3

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh", p: 3 }}>
        <CircularProgress />
        <Typography ml={2}>Cargando registros de {descriptor.etiquetas.plural.toLowerCase()}...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        seccion="Gastos"
        titulo={descriptor.etiquetas.titulo}
        descripcion={descriptor.etiquetas.descripcion}
        acciones={
          <ToggleButtonGroup
            value={pais}
            exclusive
            onChange={(evento, valor) => valor && setPais(valor)}
            size="small"
            color="primary"
          >
            {PAISES.map((opcion) => (
              <ToggleButton key={opcion.valor} value={opcion.valor} sx={{ fontWeight: "bold", px: 3 }}>
                {opcion.etiqueta}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        }
      />

      {descriptor.pestanas && (
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={pestana}
            onChange={(evento, valor) => {
              setPestana(valor)
              setPagina(0)
            }}
          >
            {descriptor.pestanas.map((tab) => (
              <Tab
                key={tab.etiqueta}
                label={tab.etiqueta}
                sx={{ fontWeight: 600, textTransform: "none", fontSize: "1rem" }}
              />
            ))}
          </Tabs>
        </Box>
      )}

      <Stack direction="row" spacing={2} sx={{ mb: 3 }} alignItems="center">
        <TextField
          label="Buscar por Trip# o Driver"
          variant="outlined"
          size="small"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value)
            setPagina(0)
          }}
          sx={{ width: 300 }}
        />
        <Button variant="contained" onClick={() => refetch()} size="small" disabled={isFetching}>
          Refrescar
        </Button>
      </Stack>

      <Paper sx={{ width: "100%", mb: 2 }}>
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>Trip #</TableCell>
                <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>Last Update</TableCell>
                {descriptor.columnasResumen.map((columna) => (
                  <TableCell
                    key={columna.clave}
                    sx={{ fontWeight: 600, whiteSpace: "nowrap", textAlign: columna.alineacion }}
                  >
                    {columna.etiqueta}
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 600, whiteSpace: "nowrap", textAlign: "center", width: 120 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {enPantalla.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columnas} align="center">
                    <Typography color="text.secondary" sx={{ py: 2 }}>
                      {descriptor.etiquetas.vacioResumen}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                enPantalla.map((fila) => (
                  <TableRow key={fila.trip_id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{identificadorViaje(fila)}</TableCell>
                    <TableCell>{fila.fecha}</TableCell>
                    {descriptor.columnasResumen.map((columna) => (
                      <TableCell key={columna.clave} align={columna.alineacion}>
                        <Celda columna={columna} fila={fila} />
                      </TableCell>
                    ))}
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => navigate(descriptor.rutas.detalle(fila.trip_id))}
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
          <TablePagination
            component="div"
            count={visibles.length}
            page={paginaActual}
            onPageChange={(evento, nueva) => setPagina(nueva)}
            rowsPerPage={porPagina}
            onRowsPerPageChange={(evento) => {
              setPorPagina(Number.parseInt(evento.target.value, 10))
              setPagina(0)
            }}
            rowsPerPageOptions={[25, 50, 100]}
          />
        )}
      </Paper>
    </Box>
  )
}
