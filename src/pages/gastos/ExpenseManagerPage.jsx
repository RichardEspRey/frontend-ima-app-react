import { useEffect, useMemo, useState } from "react"
import {
  Box,
  Button,
  Collapse,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material"
import AddIcon from "@mui/icons-material/Add"
import ExpandLessIcon from "@mui/icons-material/ExpandLess"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined"

import { ExpenseTypeChart } from "../../components/Gastos/ExpenseTypeChart"
import {
  CATALOGO_GASTOS,
  TODOS,
  categoriasDeTipo,
  etiquetasDe,
  filaPorEtiqueta,
  filtrarGastos,
  ordenarGastos,
  paisesDe,
  siguienteOrden,
  subcategoriasDeCategoria,
  totalMXN,
  totalesDe,
  useCatalogoGastos,
  useGastos,
} from "../../entities/expense"
import { FiltrosGastos, TablaGastos } from "../../features/expense-manager"
import { ModalNuevoGasto } from "../../features/expense-manager"
import { DARK_BTN_SX, SECTION_LABEL_SX } from "../../features/expense-manager/estilos"
import useFetchExchangeRate from "../../hooks/useFetchExchangeRate"
import { useSesion } from "../../shared/auth"
import { useGastosFiltrosStore } from "../../store/useGastosFiltrosStore"
import { COLOR } from "../../shared/ui/tokens"

/**
 * Los filtros que cuentan para el contador y para el renglón de totales.
 *
 * @param {object} filtros Lo que hay puesto.
 * @returns {number} Cuántos están activos.
 */
function contarFiltros(filtros) {
  return [
    filtros.search,
    filtros.filterCountry !== TODOS,
    filtros.filterType !== TODOS,
    filtros.filterCategory !== TODOS,
    filtros.filterSubcategory !== TODOS,
    filtros.filterDescription.trim(),
    filtros.startDate,
    filtros.endDate,
  ].filter(Boolean).length
}

/**
 * Expense Manager: la administración general de gastos.
 *
 * Trae los 1 638 gastos de una vez y filtra, ordena y pagina en el navegador.
 * Los filtros viven en un store para que sigan puestos al volver de editar un
 * gasto, que es lo que se hace todo el día desde aquí.
 *
 * @returns {object} La pantalla renderizada.
 */
export default function ExpenseManagerPage() {
  const { esTotal: esAdmin } = useSesion()
  const [graficaAbierta, setGraficaAbierta] = useState(false)
  const [paisGrafica, setPaisGrafica] = useState("US")
  const [modalAbierto, setModalAbierto] = useState(false)

  const {
    page: pagina,
    rowsPerPage: porPagina,
    orden,
    showFilters: filtrosAbiertos,
    set: setEstado,
    setFiltro,
    limpiarFiltros,
    ...resto
  } = useGastosFiltrosStore()

  const filtros = useMemo(
    () => ({
      search: resto.search,
      filterCountry: resto.filterCountry,
      filterType: resto.filterType,
      filterCategory: resto.filterCategory,
      filterSubcategory: resto.filterSubcategory,
      filterDescription: resto.filterDescription,
      startDate: resto.startDate,
      endDate: resto.endDate,
    }),
    [
      resto.search,
      resto.filterCountry,
      resto.filterType,
      resto.filterCategory,
      resto.filterSubcategory,
      resto.filterDescription,
      resto.startDate,
      resto.endDate,
    ],
  )

  const { data: gastos = [], isLoading, refetch } = useGastos()
  const { data: tipos = [] } = useCatalogoGastos(CATALOGO_GASTOS.TIPOS)
  const { data: categorias = [] } = useCatalogoGastos(CATALOGO_GASTOS.CATEGORIAS)
  const { data: subcategorias = [] } = useCatalogoGastos(CATALOGO_GASTOS.SUBCATEGORIAS)

  const { exchangeRate: mxnRate, fetchExchangeRate } = useFetchExchangeRate()
  useEffect(() => {
    fetchExchangeRate()
  }, [fetchExchangeRate])

  const tipoElegido = useMemo(
    () => filaPorEtiqueta(tipos, filtros.filterType),
    [tipos, filtros.filterType],
  )
  const categoriaElegida = useMemo(
    () => filaPorEtiqueta(categorias, filtros.filterCategory),
    [categorias, filtros.filterCategory],
  )

  const opciones = useMemo(
    () => ({
      paises: paisesDe(gastos),
      tipos: etiquetasDe(tipos),
      categorias: categoriasDeTipo(categorias, tipoElegido),
      subcategorias: subcategoriasDeCategoria(subcategorias, categoriaElegida),
    }),
    [gastos, tipos, categorias, subcategorias, tipoElegido, categoriaElegida],
  )

  const filtrados = useMemo(() => filtrarGastos(gastos, filtros), [gastos, filtros])
  const ordenados = useMemo(
    () => ordenarGastos(filtrados, orden, mxnRate),
    [filtrados, orden, mxnRate],
  )

  const activos = contarFiltros(filtros)

  const totales = useMemo(() => {
    if (activos === 0) return null
    const { usd, mxn, sinConversion } = totalesDe(filtrados, (g) => totalMXN(g, mxnRate))
    return { usd, mxn, sinConversion, cuantos: filtrados.length }
  }, [activos, filtrados, mxnRate])

  const enPantalla =
    porPagina === -1 ? ordenados : ordenados.slice(pagina * porPagina, pagina * porPagina + porPagina)

  useEffect(() => {
    if (isLoading || porPagina === -1) return
    const ultima = Math.max(0, Math.ceil(ordenados.length / porPagina) - 1)
    if (pagina > ultima) setEstado({ page: ultima })
  }, [isLoading, ordenados.length, porPagina, pagina, setEstado])

  // Si a un filtro se le quita el suelo —porque el catálogo ya no trae esa
  // opción, o porque cambió el tipo y su categoría dejó de aplicar—, se limpia
  // solo. Sin esto la tabla se queda vacía por un filtro que ya no se ve.
  useEffect(() => {
    if (tipos.length === 0) return

    if (filtros.filterType !== TODOS && !opciones.tipos.includes(filtros.filterType)) {
      setEstado({ filterType: TODOS, filterCategory: TODOS, filterSubcategory: TODOS, page: 0 })
    } else if (
      filtros.filterCategory !== TODOS &&
      !opciones.categorias.includes(filtros.filterCategory)
    ) {
      setEstado({ filterCategory: TODOS, filterSubcategory: TODOS, page: 0 })
    } else if (
      filtros.filterSubcategory !== TODOS &&
      !opciones.subcategorias.includes(filtros.filterSubcategory)
    ) {
      setEstado({ filterSubcategory: TODOS, page: 0 })
    }
  }, [tipos.length, opciones, filtros, setEstado])

  const cambiarFiltro = (campo, valor) => {
    if (campo === "filterType") {
      setFiltro({ filterType: valor, filterCategory: TODOS, filterSubcategory: TODOS })
    } else if (campo === "filterCategory") {
      setFiltro({ filterCategory: valor, filterSubcategory: TODOS })
    } else {
      setFiltro({ [campo]: valor })
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, minHeight: "100vh", bgcolor: COLOR.LIENZO }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-end"
        mb={4}
        flexWrap="wrap"
        gap={2}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ ...SECTION_LABEL_SX, letterSpacing: "0.12em", fontSize: "0.7rem", lineHeight: 1 }}
          >
            Gastos · Administración
          </Typography>
          <Typography
            variant="h4"
            fontWeight={800}
            color={COLOR.TINTA}
            letterSpacing="-0.02em"
            sx={{ mt: 0.25 }}
          >
            Expense Manager
          </Typography>
          <Typography variant="body2" color={COLOR.APAGADO} sx={{ mt: 0.5 }}>
            Control y administración general de gastos por país, tipo y categoría.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<InsertChartOutlinedIcon />}
            endIcon={graficaAbierta ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setGraficaAbierta((abierta) => !abierta)}
            sx={{
              bgcolor: "white",
              borderColor: COLOR.BORDE_FUERTE,
              color: COLOR.TEXTO,
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              px: 2.5,
              py: 1.1,
            }}
          >
            Gráfica de Gastos
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setModalAbierto(true)}
            sx={DARK_BTN_SX}
          >
            Nuevo Gasto
          </Button>
        </Stack>
      </Stack>

      <Collapse in={graficaAbierta}>
        <Paper sx={{ p: 3, borderRadius: 2, border: `1px solid ${COLOR.BORDE}`, mb: 3 }} elevation={0}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
            sx={{ mb: 1 }}
          >
            <Box>
              <Typography variant="overline" sx={SECTION_LABEL_SX}>
                Analítica
              </Typography>
              <Typography variant="h6" fontWeight={700} color={COLOR.TINTA} sx={{ lineHeight: 1.3 }}>
                Gastos por Tipo (Acumulativo Mensual)
              </Typography>
              <Typography variant="body2" color={COLOR.APAGADO}>
                Últimos 12 meses · Total por mes dividido por Expense Type, en{" "}
                {paisGrafica === "MX" ? "pesos mexicanos" : "dólares"}
              </Typography>
            </Box>
            <ToggleButtonGroup
              value={paisGrafica}
              exclusive
              size="small"
              onChange={(evento, valor) => valor && setPaisGrafica(valor)}
              sx={{
                bgcolor: COLOR.RELLENO,
                borderRadius: 2.5,
                p: 0.5,
                gap: 0.5,
                "& .MuiToggleButton-root": {
                  border: "none",
                  borderRadius: "8px !important",
                  px: 3,
                  py: 0.75,
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  textTransform: "none",
                  color: COLOR.APAGADO,
                },
                "& .Mui-selected": { bgcolor: `${COLOR.TINTA} !important`, color: `${COLOR.BLANCO} !important` },
              }}
            >
              <ToggleButton value="US">USA</ToggleButton>
              <ToggleButton value="MX">México</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <ExpenseTypeChart gastos={gastos} country={paisGrafica} loading={isLoading} />
        </Paper>
      </Collapse>

      <FiltrosGastos
        filtros={filtros}
        onFiltroChange={cambiarFiltro}
        onLimpiar={limpiarFiltros}
        abiertos={filtrosAbiertos}
        onAlternar={() => setEstado({ showFilters: !filtrosAbiertos })}
        activos={activos}
        opciones={opciones}
      />

      <TablaGastos
        gastos={enPantalla}
        total={ordenados.length}
        cargando={isLoading}
        orden={orden}
        onOrdenar={(campo) => setEstado({ orden: siguienteOrden(orden, campo), page: 0 })}
        paginacion={{
          pagina,
          porPagina,
          onPaginaChange: (nueva) => setEstado({ page: nueva }),
          onPorPaginaChange: (nuevo) => setEstado({ rowsPerPage: nuevo, page: 0 }),
        }}
        totales={totales}
        mxnRate={mxnRate}
        puedeEliminar={esAdmin}
        onEliminado={refetch}
      />

      <ModalNuevoGasto
        open={modalAbierto}
        onClose={() => setModalAbierto(false)}
        onSuccess={() => {
          setModalAbierto(false)
          refetch()
        }}
      />
    </Box>
  )
}
